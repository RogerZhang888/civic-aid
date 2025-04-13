import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import torch
from transformers import CLIPProcessor, CLIPModel, AutoTokenizer
from typing import List, Dict
import json
import numpy as np
import hnswlib
from PIL import Image
import requests
import time
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine_similarity
from scipy.sparse import save_npz, load_npz
import pickle

INDEX_FILES = {
    'hnsw_index': 'government_chunks_hnsw.index',
    'database_metadata': 'database_metadata.json',
    'embeddings': 'embeddings.npy',
    'tfidf_vectorizer': 'tfidf_vectorizer.pkl',
    'tfidf_matrix': 'tfidf_matrix.npz'  # Changed to .npz for sparse matrix
}

torch.cuda.empty_cache()
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# Initialize device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load CLIP model
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)

# DeepSeek API configuration
DEEPSEEK_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEEPSEEK_API_KEY = "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"

class HybridRetriever:
    def __init__(self, database):
        self.database = database
        self.vectorizer = TfidfVectorizer(stop_words='english')
        # Initialize as None, will be set properly during build/load
        self.tfidf_matrix = None
        
    def search(self, query_embedding, query_text, top_k=5):
        # Vector similarity search
        vector_indices, vector_distances = index.knn_query(query_embedding, k=top_k*2)
        vector_scores = 1 - np.array(vector_distances[0])
        
        # Keyword search
        query_vec = self.vectorizer.transform([query_text])
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

def check_existing_index():
    """Check if all index files exist and are valid"""
    for file in INDEX_FILES.values():
        if not os.path.exists(file):
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
    
    # Save normalized embeddings
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized_embeds = embeddings / norms
    np.save(INDEX_FILES['embeddings'], normalized_embeds)
    
    # Save TF-IDF components if retriever exists
    if retriever:
        with open(INDEX_FILES['tfidf_vectorizer'], 'wb') as f:
            pickle.dump(retriever.vectorizer, f)
        save_npz(INDEX_FILES['tfidf_matrix'], retriever.tfidf_matrix)  # Save as sparse matrix
    
    print("Index files saved successfully.")

def load_index_files():
    """Load all index components from files"""
    print("Loading existing index files...")
    index = hnswlib.Index(space='cosine', dim=512)
    index.load_index(INDEX_FILES['hnsw_index'])
    with open(INDEX_FILES['database_metadata'], 'r') as f:
        database = json.load(f)
    embeddings = np.load(INDEX_FILES['embeddings'])
    
    # Load TF-IDF components if they exist
    if os.path.exists(INDEX_FILES['tfidf_vectorizer']):
        with open(INDEX_FILES['tfidf_vectorizer'], 'rb') as f:
            vectorizer = pickle.load(f)
        tfidf_matrix = load_npz(INDEX_FILES['tfidf_matrix'])  # Load as sparse matrix
        retriever = HybridRetriever(database)
        retriever.vectorizer = vectorizer
        retriever.tfidf_matrix = tfidf_matrix
        return index, database, embeddings, retriever
    
    return index, database, embeddings, None

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

def build_hnsw_index(database: Dict):
    # Create embeddings
    embeddings = []
    for chunk in database["chunks"]:
        inputs = clip_processor(text=chunk, return_tensors="pt", padding=True, truncation=True, max_length=77).to(device)
        with torch.no_grad():
            outputs = clip_model.get_text_features(**inputs)
        embeddings.append(outputs.cpu().numpy().astype('float32'))
    
    embeddings = np.vstack(embeddings)
    
    # Normalize embeddings for cosine similarity
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized_embeddings = embeddings / norms
    
    # Create HNSW index with cosine space
    dim = embeddings.shape[1]
    index = hnswlib.Index(space='cosine', dim=dim)
    
    # Configure index
    index.init_index(max_elements=len(embeddings), ef_construction=200, M=16)
    index.add_items(normalized_embeddings)
    index.set_ef(50)
    
    # Initialize hybrid retriever
    retriever = HybridRetriever(database)
    retriever.tfidf_matrix = retriever.vectorizer.fit_transform(database["chunks"])
    
    return index, retriever, embeddings

def get_query_embedding(query: str = None, image=None):
    if image and query:
        if isinstance(image, str):
            try:
                image = Image.open(image)
            except Exception as e:
                print(f"Error loading image: {e}")
                image = None
    
    if image and query:
        text_inputs = clip_processor(text=query, return_tensors="pt", truncation=True).to(device)
        image_inputs = clip_processor(images=image, return_tensors="pt").to(device)
        
        with torch.no_grad():
            text_embed = clip_model.get_text_features(**text_inputs).cpu().numpy()
            image_embed = clip_model.get_image_features(**image_inputs).cpu().numpy()
        
        query_embedding = (text_embed + image_embed) / 2
    elif image:
        inputs = clip_processor(images=image, return_tensors="pt").to(device)
        with torch.no_grad():
            query_embedding = clip_model.get_image_features(**inputs).cpu().numpy()
    else:
        inputs = clip_processor(text=query, return_tensors="pt", truncation=True).to(device)
        with torch.no_grad():
            query_embedding = clip_model.get_text_features(**inputs).cpu().numpy()
    
    query_embedding = query_embedding / np.linalg.norm(query_embedding)
    return query_embedding.astype('float32')

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
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return "Sorry, I couldn't process your request at this time."

def rag_search(query: str, database: Dict, index, retriever, top_k: int = 3, image=None, type_query: str = "query") -> Dict:
    """Hybrid RAG search with cosine similarity confidence scoring"""
    query_embedding = get_query_embedding(query, image)
    indices, scores = retriever.search(query_embedding, query, top_k=top_k)
    
    context_blocks = []
    sources = []
    source_threshold = 0.3
    
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
    print(f"Retrieval scores - Avg: {avg_score:.2f}, Max: {max_score:.2f}")
    
    use_rag = avg_score > 0.3 and max_score > 0.3
    
    if use_rag:
        if type_query == "query":
            prompt = f"""### Context:
{context}

### Question:
{query}

### Instructions:
Answer the question using ONLY the provided context."""
        else:
            prompt = f"""### Context:
{context}

### Question:
{query}

### Instructions:
This is a report regarding municipal issues in Singapore. Identify the responsible agency and recommend next steps using ONLY the provided context."""
        
        answer = call_deepseek_api(prompt)
        confidence = min(5, int(avg_score * 5))
    else:
        if type_query == "query":
            prompt = f"""### Question:
{query}

### Instructions:
Provide information about Singapore government services."""
        else:
            prompt = f"""### Question:
{query}

### Instructions:
This is a report regarding municipal issues in Singapore. Identify the responsible agency and recommend next steps."""
        
        answer = call_deepseek_api(prompt)
        confidence = 0
    
    return {
        "answer": answer,
        "confidence": {
            "score": confidence,
            "retrieval_metrics": {
                "average": avg_score,
                "max": max_score,
                "source_threshold": source_threshold
            },
            "used_rag": use_rag,
            "rationale": "High quality context found" if use_rag 
                        else f"Low retrieval scores (avg={avg_score:.2f}, max={max_score:.2f})"
        },
        "sources": sources if use_rag else None
    }

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

if __name__ == "__main__":
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(SCRIPT_DIR, "..", "govsg_crawler_2", "gov_text_output_cleaned.jl")
    data_path = os.path.normpath(data_path)
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at: {data_path}")
    
    index, database, _, retriever = process_and_index_data(data_path)
    
    query = "The fire hydrant has burst."
    image_path = None
    
    if image_path is not None:
        result = rag_search(query, database, index, retriever, image=image_path, type_query="report")
    else:
        result = rag_search(query, database, index, retriever, type_query="report")
    
    print(f"\nQuery: {query}")
    print("\nAnswer:")
    print(result["answer"])
    
    if result["sources"]:
        print("\nSources:")
        for src in result["sources"]:
            print(f"- {src['source_text']}\n  {src['url']}")
    
    print("\nConfidence:", result["confidence"]["score"], "/5")
    print("Rationale:", result["confidence"]["rationale"])

def use_model(query,  query_type, image_path=None):
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(SCRIPT_DIR, "..", "govsg_crawler_2", "gov_text_output_cleaned.jl")
    data_path = os.path.normpath(data_path)
    
    # Check if raw data file exists
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at: {data_path}")
    
    # Process data (or load existing)
    index, database, _ = process_and_index_data(data_path)
    
    query = query
    image_path = image_path
    if image_path is not None:
        result = rag_search(query, database, index, image = image_path, type_query=query_type)
    else:
        result = rag_search(query, database, index, type_query=query_type)
    print(f"\nProcessing query: {query}")
   
    
    print("\nGenerated Answer:")
    print(result["answer"])
    print("\nConfidence Score:", result["confidence"]["score"], "/5")
    print("Confidence Rationale:", result["confidence"]["rationale"])
    
    if result["sources"] is not None:
        print("\nSources:")
        for src in result["sources"]:
            print(f"- {src['source_text']}\n  {src['url']}")