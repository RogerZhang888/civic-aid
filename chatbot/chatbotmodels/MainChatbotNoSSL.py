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

INDEX_FILES = {
    'hnsw_index': 'government_chunks_hnsw.index',
    'database_metadata': 'database_metadata.json',
    'embeddings': 'embeddings.npy'
}

torch.cuda.empty_cache()
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# Initialize device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# 1. Load CLIP model with GPU support

#SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
#MODEL_PATH = os.path.join(SCRIPT_DIR, ".", "clip_lora_merged")
#MODEL_PATH = os.path.normpath(MODEL_PATH)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)

# DeepSeek API configuration
DEEPSEEK_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEEPSEEK_API_KEY = ""  # Replace with your actual API key

def check_existing_index():
    """Check if all index files exist and are valid"""
    for file in INDEX_FILES.values():
        if not os.path.exists(file):
            return False
    try:
        # Quick validation of the index
        index = hnswlib.Index(space='cosine', dim=512)  # Changed to cosine
        index.load_index(INDEX_FILES['hnsw_index'])
        with open(INDEX_FILES['database_metadata'], 'r') as f:
            json.load(f)
        return True
    except:
        return False

def save_index_files(index, database, embeddings):
    """Save all index components to files"""
    print("Saving index files...")
    index.save_index(INDEX_FILES['hnsw_index'])
    with open(INDEX_FILES['database_metadata'], 'w') as f:
        json.dump(database, f)
    
    # Save normalized embeddings
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized_embeds = embeddings / norms
    np.save(INDEX_FILES['embeddings'], normalized_embeds)
    
    print("Index files saved successfully.")

def load_index_files():
    """Load all index components from files"""
    print("Loading existing index files...")
    index = hnswlib.Index(space='cosine', dim=512)  # Changed to cosine
    index.load_index(INDEX_FILES['hnsw_index'])
    with open(INDEX_FILES['database_metadata'], 'r') as f:
        database = json.load(f)
    embeddings = np.load(INDEX_FILES['embeddings'])
    return index, database, embeddings

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
    index = hnswlib.Index(space='cosine', dim=dim)  # Changed to cosine
    
    # Configure index
    index.init_index(
        max_elements=len(embeddings), 
        ef_construction=200,
        M=16
    )
    
    # Add normalized data
    index.add_items(normalized_embeddings)
    
    # Set query-time parameters
    index.set_ef(50)
    
    return index

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
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return "Sorry, I couldn't process your request at this time."

def rag_search(query: str, database: Dict, index, top_k: int = 3, image=None, type_query = str) -> Dict:
    """RAG search with cosine similarity confidence scoring"""
    # Retrieve context
    query_embedding = get_query_embedding(query, image)
    indices, distances = index.knn_query(query_embedding, k=top_k)
    
    # Convert cosine distances to similarities (0-1)
    cosine_similarities = 1 - np.array(distances[0])
    cosine_similarities = np.clip(cosine_similarities, 0, 1)  # Ensure no negatives
    
    # Calculate confidence metrics
    avg_similarity = float(np.mean(cosine_similarities))
    max_similarity = float(np.max(cosine_similarities))
    print("avg sim: ", avg_similarity)
    print("max sim: ", max_similarity)
    
    # Prepare context with similarity scores
    context_blocks = []
    sources = []
    source_threshold = 0.85  # Only include sources with similarity > 0.75
    
    for i, (idx, sim) in enumerate(zip(indices[0], cosine_similarities)):
        context_blocks.append(
            f"[[CONTEXT BLOCK {i+1} (Similarity: {sim:.2f})]]\n"
            f"{database['chunks'][idx]}\n"
            f"Source URL: {database['metadata'][idx]['url']}\n"
        )
        # Only include sources above threshold
        if sim > source_threshold:
            sources.append(database['metadata'][idx])
    
    context = "\n\n".join(context_blocks)
    
    # Determine RAG vs direct query (using original thresholds)
    use_rag = avg_similarity > 0.55 and max_similarity > 0.85
    
    if use_rag:
        # Generate answer using RAG context
        if type_query == "query":
            prompt = f"""### Context:
{context}

### Question:
{query}

### Instructions:
This is a query related to Singapore government services. With the help of the context given, answer the question."""
            answer = call_deepseek_api(prompt)
            confidence = min(5, int(avg_similarity * 5))  # Scale to 1-5
        else:
            prompt = f"""### Context:
{context}

### Question:
{query}

### Instructions:
This is a report regarding municipal issues in Singapore. You are advising the government to resolve the issue.
Based on the provided context, identity the agency responsible of the issue, and recommend next steps for the agency."""
            answer = call_deepseek_api(prompt)
            confidence = min(5, int(avg_similarity * 5))  # Scale to 1-5
    else:
        # Query directly without context
        if type_query == "query":
            prompt = f"""### Context:
This question is regarding Singapore government services.

### Question:
{query}

### Instructions:
As far as possible, provide sources for your answers."""
            answer = call_deepseek_api(prompt)
            confidence = 0  # No confidence score for direct answers
        else:
            prompt = f"""### Context:
This is a report regarding municipal issues in Singapore. You are advising the government to resolve the issue.

### Question:
{query}

### Instructions:
Identify the government agency responsible for fixing the issue, and recommend next steps for the agency. DO NOT include instructions as to what the public should do. As far as possible, provide sources for your answers."""
            answer = call_deepseek_api(prompt)
            confidence = 0  # No confidence score for direct answers
    
    return {
        "answer": answer,
        "confidence": {
            "score": confidence,
            "similarity_metrics": {
                "average": avg_similarity,
                "max": max_similarity,
                "threshold": 0.9 if use_rag else None,
                "source_threshold": source_threshold
            },
            "used_rag": use_rag,
            "rationale": "High similarity context found" if use_rag 
                        else f"Low similarity (avg={avg_similarity:.2f}, max={max_similarity:.2f})"
        },
        "sources": sources if use_rag else None  # Only sources above threshold
    }

# 6. Helper Functions - Updated for cosine similarity
def process_and_index_data(file_path: str):
    """Process data and build index, or load existing if available"""
    if check_existing_index():
        print("Found existing index files - loading...")
        return load_index_files()
    
    print("Creating new database...")
    database = create_chunked_database(file_path)
    
    print("Building HNSW index...")
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
    
    index = hnswlib.Index(space='cosine', dim=embeddings.shape[1])
    index.init_index(max_elements=len(embeddings), ef_construction=200, M=16)
    index.add_items(normalized_embeddings)
    index.set_ef(50)
    
    save_index_files(index, database, embeddings)
    return index, database, embeddings

# Main execution
if __name__ == "__main__":
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(SCRIPT_DIR, "..", "govsg_crawler_2", "gov_text_output_cleaned.jl")
    data_path = os.path.normpath(data_path)
    
    # Check if raw data file exists
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at: {data_path}")
    
    # Process data (or load existing)
    index, database, _ = process_and_index_data(data_path)
    
    query = "The glass panel in the community centre is broken."
    #image_path = ""
    image_path = None
    if image_path is not None:
        result = rag_search(query, database, index, image = image_path, type_query="report")
    else:
        result = rag_search(query, database, index, type_query="query")
    print(f"\nProcessing query: {query}")
   
    
    print("\nGenerated Answer:")
    print(result["answer"])
    print("\nConfidence Score:", result["confidence"]["score"], "/5")
    print("Confidence Rationale:", result["confidence"]["rationale"])
    
    if result["sources"] is not None:
        print("\nSources:")
        for src in result["sources"]:
            print(f"- {src['source_text']}\n  {src['url']}")