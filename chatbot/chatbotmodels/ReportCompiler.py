import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["DISABLE_METATENSOR"] = "1"  
import pandas as pd
import numpy as np
import re
from itertools import combinations
from sentence_transformers import SentenceTransformer, CrossEncoder
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
    return df[df["cleaned_text"].str.len() > 0]

def group_identical_issues(parquet_path, similarity_threshold=0.9):
    # 1. Load data
    df = load_data(parquet_path)
    
    # 2. Initialize models safely
    embedder = SentenceTransformer("all-MiniLM-L6-v2", device="cpu", device_map="cpu")
    cross_encoder = CrossEncoder("cross-encoder/stsb-roberta-base", device="cpu", device_map="cpu")

    
    # 3. Generate embeddings safely
    texts = df["cleaned_text"].tolist()
    embeddings = embedder.encode(
        texts,
        convert_to_tensor=True,
        show_progress_bar=False,
        normalize_embeddings=True
    ).cpu().numpy()
    
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
        text_pairs = list(combinations(cluster_df["cleaned_text"].tolist(), 2))
        id_pairs = list(combinations(range(len(report_ids)), 2))
        
        sim_matrix = np.eye(len(report_ids))
        scores = cross_encoder.predict(text_pairs)
        for (i,j), score in zip(id_pairs, scores):
            sim_matrix[i,j] = sim_matrix[j,i] = score
        
        visited = set()
        for i in range(len(report_ids)):
            if i not in visited:
                group = [j for j in range(len(report_ids)) 
                        if sim_matrix[i,j] >= similarity_threshold]
                visited.update(group)
                if len(group) > 1:
                    output_groups.append(report_ids[group].tolist())
    
    return output_groups