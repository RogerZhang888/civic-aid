#MAKE SURE GOT THE MODEL.SAFETENSORS FILE IN THE clip_lora_merged folder
import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import torch
from transformers import CLIPProcessor, CLIPModel
from typing import List, Dict
import json
import numpy as np
import hnswlib
from PIL import Image
import requests
import time
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import save_npz, load_npz
import pickle
import nltk
from nltk.corpus import wordnet

def setup_nltk_once():
    nltk_data_path = os.path.join(os.path.expanduser("~"), "nltk_data", "corpora", "wordnet")
    if not os.path.exists(nltk_data_path):
        nltk.download('wordnet')
        nltk.download('omw-1.4')

setup_nltk_once()

# index_file_directory = os.path.join(os.path.expanduser("~"), "naisc", "civic-aid", "chatbot","chatbotmodels")
INDEX_FILES = {
    'hnsw_index': 'government_chunks_hnsw.index',
    'database_metadata': 'database_metadata.json',
    'embeddings': 'embeddings.npy',
    'tfidf_vectorizer': 'tfidf_vectorizer.pkl',
    'tfidf_matrix': 'tfidf_matrix.npz'
}

torch.cuda.empty_cache()
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# Initialize device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# 1. Load CLIP model with GPU support
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, ".", "clip_lora_merged")
MODEL_PATH = os.path.normpath(MODEL_PATH)
clip_processor = CLIPProcessor.from_pretrained(MODEL_PATH, local_files_only=True)
clip_model = CLIPModel.from_pretrained(MODEL_PATH, local_files_only=True).to(device)

# DeepSeek API configuration
DEEPSEEK_API_URL = "https://openrouter.ai/api/v1/chat/completions"
with open("dskey.txt", 'r') as file:
    DEEPSEEK_API_KEY = file.read().strip()
with open("dskey2.txt", 'r') as file:
    DEEPSEEK_API_KEY2 = file.read().strip()
with open("dskey3.txt", 'r') as file:
    DEEPSEEK_API_KEY3 = file.read().strip()

class HybridRetriever:
    def __init__(self, database):
        self.database = database
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = None

        
    def build_tfidf(self):
        """Build TF-IDF matrix from database chunks"""
        self.tfidf_matrix = self.vectorizer.fit_transform(self.database["chunks"])
        
    def search(self, query_embedding, query_text, index, top_k=5):
        """Hybrid search combining vector and keyword results"""
        # Vector similarity search
        vector_indices, vector_distances = index.knn_query(query_embedding, k=top_k*2)
        
        # Keyword search
        expanded_query = expand_query(query_text)
        query_vec = self.vectorizer.transform([expanded_query])
        keyword_scores = (self.tfidf_matrix @ query_vec.T).toarray().flatten()
        keyword_top = np.argsort(keyword_scores)[-top_k*2:][::-1]
        
        # Combine and re-rank
        all_indices = set(vector_indices[0]).union(set(keyword_top))
        combined_scores = []
        
        for idx in all_indices:
            vector_score = 1 - vector_distances[0][np.where(vector_indices[0] == idx)[0][0]] if idx in vector_indices[0] else 0
            keyword_score = keyword_scores[idx]
            combined_score = 0.5 * vector_score + 0.5 * keyword_score
            combined_scores.append((idx, combined_score))
        
        combined_scores.sort(key=lambda x: x[1], reverse=True)
        top_indices = [idx for idx, _ in combined_scores[:top_k]]
        top_scores = [score for _, score in combined_scores[:top_k]]
        
        return top_indices, top_scores

def expand_query(query: str) -> str:
    expanded_terms = []
    for word in query.split():
        synonyms = wordnet.synsets(word)
        lemmas = set([word])  # include original word
        for syn in synonyms:
            for lemma in syn.lemmas():
                name = lemma.name().replace('_', ' ')
                if name.lower() != word.lower():
                    lemmas.add(name)
        expanded_terms.extend(lemmas)
    return ' '.join(expanded_terms)

def check_existing_index():
    """Check if all index files exist and are valid"""
    for file in INDEX_FILES.values():
        SCRIPT_DIR1 = os.path.dirname(os.path.abspath(__file__))
        MODEL_PATH1 = os.path.join(SCRIPT_DIR1, file)
        if not os.path.exists(MODEL_PATH1):
            return False
    try:
        index = hnswlib.Index(space='cosine', dim=512)
        index.load_index(INDEX_FILES['hnsw_index'])
        with open(INDEX_FILES['database_metadata'], 'r') as f:
            json.load(f)
        return True
    except:
        return False

def save_index_files(index, database, embeddings, retriever=None):
    """Save all index components to files"""
    print("Saving index files...")
    index.save_index(INDEX_FILES['hnsw_index'])
    with open(INDEX_FILES['database_metadata'], 'w') as f:
        json.dump(database, f)
    
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized_embeds = embeddings / norms
    np.save(INDEX_FILES['embeddings'], normalized_embeds)
    
    if retriever and hasattr(retriever, 'tfidf_matrix'):
        with open(INDEX_FILES['tfidf_vectorizer'], 'wb') as f:
            pickle.dump(retriever.vectorizer, f)
        save_npz(INDEX_FILES['tfidf_matrix'], retriever.tfidf_matrix)
    
    print("Index files saved successfully.")

def load_index_files():
    """Load all index components from files"""
    print("Loading existing index files...")
    index = hnswlib.Index(space='cosine', dim=512)
    index.load_index(INDEX_FILES['hnsw_index'])
    
    with open(INDEX_FILES['database_metadata'], 'r') as f:
        database = json.load(f)
    
    embeddings = np.load(INDEX_FILES['embeddings'])
    
    retriever = None
    if os.path.exists(INDEX_FILES['tfidf_vectorizer']):
        retriever = HybridRetriever(database)
        with open(INDEX_FILES['tfidf_vectorizer'], 'rb') as f:
            retriever.vectorizer = pickle.load(f)
        retriever.tfidf_matrix = load_npz(INDEX_FILES['tfidf_matrix'])
    
    return index, database, embeddings, retriever

# 2. Chunking and Embedding Functions (unchanged)
def chunk_text(text: str, chunk_size: int = 75, overlap: int = 25) -> List[str]:
    tokenized = clip_processor.tokenizer.encode(text, add_special_tokens=False)
    chunks = []
    
    for i in range(0, len(tokenized), chunk_size - overlap):
        chunk = tokenized[i:i + chunk_size]
        if len(chunk) + 2 > 77:
            chunk = chunk[:77-2]
        chunks.append(clip_processor.tokenizer.decode(chunk, skip_special_tokens=True))
    
    return chunks

def create_chunked_database(file_path: str) -> Dict:
    database = {"chunks": [], "metadata": []}
    with open(file_path, encoding="utf-8") as f:
        for line in f:
            entry = json.loads(line)
            chunks = chunk_text(entry['content'])
            database["chunks"].extend(chunks)
            database["metadata"].extend([{
                "url": entry['url'],
                "source_text": entry['content'][:200] + "..."
            }] * len(chunks))
    return database

# 3. HNSWLib Indexing Setup - Updated for cosine similarity
def build_hnsw_index(database: Dict):
    """Build HNSW index and hybrid retriever"""
    embeddings = []
    for chunk in database["chunks"]:
        inputs = clip_processor(text=chunk, return_tensors="pt", padding=True, truncation=True, max_length=77).to(device)
        with torch.no_grad():
            outputs = clip_model.get_text_features(**inputs)
        embeddings.append(outputs.cpu().numpy().astype('float32'))
    
    embeddings = np.vstack(embeddings)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized_embeddings = embeddings / norms
    
    index = hnswlib.Index(space='cosine', dim=embeddings.shape[1])
    index.init_index(max_elements=len(embeddings), ef_construction=200, M=16)
    index.add_items(normalized_embeddings)
    index.set_ef(50)
    
    # Initialize hybrid retriever
    retriever = HybridRetriever(database)
    retriever.build_tfidf()
    
    return index, retriever, embeddings

def get_query_embedding(query: str = None, image=None):
    if image and query:
        # Case: Multimodal (text + image)
        # Step 1: Get separate text and image embeddings
        if isinstance(image, str):
            try:
                image = Image.open(image)
            except Exception as e:
                print(f"Error loading image: {e}")
                # Fall back to text-only if image loading fails
                image = None
        text_inputs = clip_processor(text=query, return_tensors="pt", truncation=True).to(device)
        image_inputs = clip_processor(images=image, return_tensors="pt").to(device)
        
        with torch.no_grad():
            text_embed = clip_model.get_text_features(**text_inputs).cpu().numpy()
            image_embed = clip_model.get_image_features(**image_inputs).cpu().numpy()
        
        # Step 2: Fuse by averaging (simple but effective)
        query_embedding = (text_embed + image_embed) / 2
    
    elif image:
        # Case: Image-only → Use image embedding directly
        inputs = clip_processor(images=image, return_tensors="pt").to(device)
        with torch.no_grad():
            query_embedding = clip_model.get_image_features(**inputs).cpu().numpy()
    
    else:
        # Case: Text-only
        inputs = clip_processor(text=query, return_tensors="pt", truncation=True).to(device)
        with torch.no_grad():
            query_embedding = clip_model.get_text_features(**inputs).cpu().numpy()
    
    # Normalize for cosine similarity
    query_embedding = query_embedding / np.linalg.norm(query_embedding)
    return query_embedding.astype('float32')

# 5. RAG Search with DeepSeek API - Updated for cosine similarity
def call_deepseek_api(prompt: str, max_tokens: int = 400) -> str:
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": [
            {"role": "system", "content": "You are a government information assistant. Answer the question using ONLY the provided context. For factual answers, ALWAYS reference the specific context block(s) used"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": max_tokens,
        "top_p": 0.9
    }
    
    try:
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        # print(response.text)
        # print(response.text[2:7])
        return response.json()["choices"][0]["message"]["content"]
    except:
        try:
            print("test")
            headers = {
                "Authorization": f"Bearer {DEEPSEEK_API_KEY2}",
                "Content-Type": "application/json"
            }
            response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except:
            headers = {
                "Authorization": f"Bearer {DEEPSEEK_API_KEY3}",
                "Content-Type": "application/json"
            }
            response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

    # except requests.exceptions.RequestException as e:
    #     print(f"API request failed: {e}")
    #     return "Sorry, I couldn't process your request at this time."

def rag_search(query: str, database: Dict, index, retriever, top_k: int = 3, image=None, prompter: str = "") -> Dict:
    """Hybrid RAG search with confidence scoring"""
    query_embedding = get_query_embedding(query, image)
    indices, scores = retriever.search(query_embedding, query, index, top_k=top_k)
    
    context_blocks = []
    sources = []
    source_threshold = 0.85
    
    for i, (idx, score) in enumerate(zip(indices, scores)):
        context_blocks.append(
            f"[[CONTEXT BLOCK {i+1} (Score: {score:.2f})]]\n"
            f"{database['chunks'][idx]}\n"
            f"Source URL: {database['metadata'][idx]['url']}\n"
        )
        if score > source_threshold:
            sources.append(database['metadata'][idx])
    
    context = "\n\n".join(context_blocks)
    avg_score = float(np.mean(scores))
    max_score = float(np.max(scores))
    
    use_rag = avg_score > 0.8 and max_score > 0.9
    
    if use_rag:
        prompt = f"""### Context:
{context}

### Question:
{query}

### Instructions:
{prompter}
"""        
        answer = call_deepseek_api(prompt)
        #confidence = min(5, int(avg_score * 5)) THIS WAS REGARDING THE SIMILARITY OF THE RETRIEVED STUFF NOT THE CONFIDENCE OF THE OVERALL ANS
    else:
        prompt = f"""### Question:
{query}

### Instructions:
{prompter}"""
        
        answer = call_deepseek_api(prompt)
        #confidence = 0
    
    return {
        "answer": answer,
        "used_rag": use_rag,
        "sources": sources if use_rag else None
        }


# 6. Helper Functions - Updated for cosine similarity
def process_and_index_data(file_path: str):
    """Process data and build index, or load existing if available"""
    if check_existing_index():
        print("Found existing index files - loading...")
        return load_index_files()
    
    print("Creating new database...")
    database = create_chunked_database(file_path)
    
    print("Building HNSW index and hybrid retriever...")
    index, retriever, embeddings = build_hnsw_index(database)
    
    save_index_files(index, database, embeddings, retriever)
    return index, database, embeddings, retriever

def call_model(text_query, prompt, image_path=None):
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(SCRIPT_DIR, "..", "govsg_crawler_2", "gov_text_output_cleaned.jl")
    data_path = os.path.normpath(data_path)
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at: {data_path}")
    
    index, database, _, retriever = process_and_index_data(data_path)
    
    query = text_query
    image_path = image_path
    
    if image_path is not None:
        result = rag_search(query, database, index, retriever, image=image_path, prompter=prompt)
    else:
        result = rag_search(query, database, index, retriever, prompter=prompt)
    
    # print(f"\nQuery: {query}")
    print("\nAnswer:")
    print(result["answer"])
    # print(result["used_rag"])
    # if result["sources"]:
    #     print("\nSources:")
    #     for src in result["sources"]:
    #         print(f"- {src['source_text']}\n  {src['url']}")
    
    #return result

prompt = "INSTRUCTIONS \
You are a Singapore Government chatbot, built to answer citizen queries. Your task is to analyse the user's question and answer within the context of Singapore government services. With the help of the context provided, answer the question, giving actionable answers as much as possible. Output how confident you are that you have a complete understanding of the user's question on a scale of 0 to 1, with a higher score representing greater understanding. Also indicate which sources you used, both from the context provided and otherwise. \
--- \
OUTPUT \
Format your response as a JSON object with the fields 'answer', 'confidence', and 'sources'. Confidence should be a decimal between 0 and 1 exclusive. Sources should be an array of URL links. \
For example: \
{ \
    'answer': <your answer>, \
    'confidence': 0.6, \
    'sources':[ \
        <url 1>, \
        <url 2>, \
        ... \
    ] \
}"


call_model("today i am free. no under saf.", prompt)