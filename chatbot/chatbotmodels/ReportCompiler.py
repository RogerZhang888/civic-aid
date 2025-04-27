import pandas as pd
import numpy as np
import re
from itertools import combinations
from sentence_transformers import SentenceTransformer, CrossEncoder
import hdbscan
import os
import torch
from sklearn.metrics.pairwise import cosine_distances
from transformers import AutoTokenizer

# Load the correct tokenizer
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

def safe_encode(texts):
    # Truncate and handle long sequences
    return tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=512,  # Standard BERT limit
        return_tensors="pt"
    )

os.environ["TOKENIZERS_PARALLELISM"] = "false"
torch.set_default_device("cpu")

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
    return df[df["cleaned_text"].str.len() > 0]

def group_identical_issues(parquet_path, similarity_threshold=0.9):
    # 1. Load data
    df = load_data(parquet_path)
    
    # 2. Generate embeddings
    # device = "cuda" if torch.cuda.is_available() else "cpu"
    embedder = SentenceTransformer("all-MiniLM-L6-v2", device="meta")  # Meta device first
    embedder.to_empty(device='cpu')  # Explicitly allocate on CPU
    embedder.load_state_dict(SentenceTransformer("all-MiniLM-L6-v2").state_dict())
    texts = df["cleaned_text"].tolist()
    encoded = safe_encode(texts)
    with torch.no_grad():
        embeddings = embedder(encoded)["sentence_embedding"].numpy()
    distance_matrix = cosine_distances(embeddings)
    
    # 3. Cluster
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=2,
        metric="precomputed",
        cluster_selection_method="eom"
    )
    cluster_labels = clusterer.fit_predict(distance_matrix)
    
    # 4. Verify pairs within clusters
    cross_encoder = CrossEncoder("cross-encoder/stsb-roberta-base", device="cpu")
    cross_encoder.to_empty(device='cpu')  # Explicitly allocate on CPU
    cross_encoder.load_state_dict(CrossEncoder("cross-encoder/stsb-roberta-base").state_dict())
    output_groups = []
    
    for cluster_id in set(cluster_labels) - {-1}:
        cluster_df = df[cluster_labels == cluster_id]
        if len(cluster_df) < 2:
            continue
            
        # Get all report pairs in cluster
        report_ids = cluster_df["id"].values
        text_pairs = list(combinations(cluster_df["cleaned_text"].tolist(), 2))
        id_pairs = list(combinations(range(len(report_ids)), 2))
        
        # Build similarity matrix
        sim_matrix = np.eye(len(report_ids))
        scores = cross_encoder.predict(text_pairs)
        for (i,j), score in zip(id_pairs, scores):
            sim_matrix[i,j] = sim_matrix[j,i] = score
        
        # Group IDs with similarity >= threshold
        visited = set()
        for i in range(len(report_ids)):
            if i not in visited:
                group = [j for j in range(len(report_ids)) 
                        if sim_matrix[i,j] >= similarity_threshold]
                visited.update(group)
                if len(group) > 1:  # Only keep groups with 2+ reports
                    output_groups.append(report_ids[group].tolist())
    
    return output_groups

# Usage:
# result = group_identical_issues("reports.parquet")
# print(f"Found {len(result)} issue groups with 2+ reports")
# print("Sample groups:", result[:3])