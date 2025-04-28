import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import pandas as pd
import numpy as np
import re

from itertools import combinations
from transformers import AutoTokenizer
from optimum.onnxruntime import ORTModelForFeatureExtraction
import hdbscan
from sklearn.metrics.pairwise import cosine_distances

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

def onnx_encode_texts(texts, model_name="optimum/all-MiniLM-L6-v2"):
    """Use ONNX runtime to completely avoid PyTorch meta tensor issues"""
    # Load ONNX model (doesn't use PyTorch meta tensors)
    model_file = "model.onnx"
    model = ORTModelForFeatureExtraction.from_pretrained(model_name, file_name = model_file)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    embeddings = []
    for text in texts:
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
        
        # ONNX model doesn't need .to(device) or gradient tracking
        outputs = model(**inputs)
        
        # Mean pooling
        attention_mask = inputs['attention_mask']
        last_hidden = outputs.last_hidden_state
        pooled = (last_hidden * attention_mask.unsqueeze(-1)).sum(1) / attention_mask.sum(-1).unsqueeze(-1)
        pooled = pooled / np.linalg.norm(pooled, axis=1, keepdims=True)
        embeddings.append(pooled.numpy())
    
    return np.concatenate(embeddings, axis=0).astype(np.float64)


def group_identical_issues(parquet_path, similarity_threshold=0.9):
    # 1. Load data
    df = load_data(parquet_path)
    
    # 2. Generate embeddings using ONNX
    texts = df["cleaned_text"].tolist()
    embeddings = onnx_encode_texts(texts)
    
    # 3. Cluster using cosine distance
    distance_matrix = cosine_distances(embeddings)
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=2,
        metric="precomputed",
        cluster_selection_method="eom"
    )
    cluster_labels = clusterer.fit_predict(distance_matrix)
    
    # 4. Verify pairs within clusters
    output_groups = []
    for cluster_id in set(cluster_labels) - {-1}:
        cluster_df = df[cluster_labels == cluster_id]
        if len(cluster_df) < 2:
            continue
            
        report_ids = cluster_df["id"].values
        cluster_embeddings = embeddings[cluster_labels == cluster_id]
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