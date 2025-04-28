import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"
# Disable all meta tensor functionality
os.environ["HF_DISABLE_META_TENSOR"] = "1"
os.environ["PYTORCH_DISABLE_META_TENSOR"] = "1"

import pandas as pd
import numpy as np
import re
from itertools import combinations
from transformers import AutoTokenizer, AutoModel
import hdbscan
import torch
from sklearn.metrics.pairwise import cosine_distances

# Configuration
def preprocess_text(text):
    text = str(text).lower().strip()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return re.sub(r"\s+", " ", text)

def load_data(path):
    if ".parquet" in path:     
        df = pd.read_parquet(path)
    else:
        df = pd.read_csv(path)
    df["cleaned_text"] = df["description"].apply(preprocess_text)
    print(df[df["cleaned_text"].str.len() > 0])
    return df[df["cleaned_text"].str.len() > 0]

def encode_texts(texts, tokenizer, model, batch_size=32):
    """Custom encoding function with mean pooling"""
    model = model.to('cpu')  # Ensure model is on CPU
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        inputs = tokenizer(batch, padding=True, truncation=True, 
                         return_tensors="pt", max_length=128).to('cpu')  # Explicit CPU
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Mean pooling with attention mask
        attention_mask = inputs['attention_mask']
        last_hidden = outputs.last_hidden_state
        embeddings = (last_hidden * attention_mask.unsqueeze(-1)).sum(1) / attention_mask.sum(-1).unsqueeze(-1)
        
        # Normalize embeddings
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
        all_embeddings.append(embeddings.cpu().numpy())
    
    return np.concatenate(all_embeddings, axis=0)

def group_identical_issues(parquet_path, similarity_threshold=0.9):
    # 1. Load data
    df = load_data(parquet_path)
    
    # 2. Initialize Hugging Face model with explicit CPU placement
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name)
    model = model.to('cpu')  # Force CPU placement
    model.eval()
    
    # 3. Generate embeddings
    texts = df["cleaned_text"].tolist()
    embeddings = encode_texts(texts, tokenizer, model).astype(np.float64)
    
    # 4. Cluster using cosine distance
    distance_matrix = cosine_distances(embeddings)
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=2,
        metric="precomputed",
        cluster_selection_method="eom"
    )
    cluster_labels = clusterer.fit_predict(distance_matrix)
    
    # 5. Verify pairs within clusters
    output_groups = []
    for cluster_id in set(cluster_labels) - {-1}:
        cluster_df = df[cluster_labels == cluster_id]
        if len(cluster_df) < 2:
            continue
            
        report_ids = cluster_df["id"].values
        cluster_embeddings = embeddings[cluster_labels == cluster_id]
        
        # Compute pairwise cosine similarity
        sim_matrix = 1 - cosine_distances(cluster_embeddings)
        
        visited = set()
        for i in range(len(report_ids)):
            if i not in visited:
                group = [j for j in range(len(report_ids)) 
                        if sim_matrix[i,j] >= similarity_threshold]
                visited.update(group)
                if len(group) > 1:
                    output_groups.append(report_ids[group].tolist())
    
    return output_groups