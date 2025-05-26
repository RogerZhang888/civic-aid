import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import pandas as pd
import numpy as np
import re
import torch
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
    # print(df[df["cleaned_text"].str.len() > 0].head(5))
    return df[df["cleaned_text"].str.len() > 0]

def onnx_encode_texts(texts, model_name="optimum/all-MiniLM-L6-v2"):
    """Returns embeddings AND indices of successfully processed texts."""
    try:
        model = ORTModelForFeatureExtraction.from_pretrained(model_name)
        tokenizer = AutoTokenizer.from_pretrained(model_name)
    except Exception as e:
        raise RuntimeError(f"Failed to load model/tokenizer: {str(e)}")

    embeddings = []
    valid_indices = []  # Track indices of successfully processed texts

    for idx, text in enumerate(texts):  # Iterate with index
        if not text or not isinstance(text, str):
            continue  # Skip invalid texts but keep track of their absence

        try:
            inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
            outputs = model(**{k: v.numpy() for k, v in inputs.items()})
            
            last_hidden = torch.from_numpy(outputs.last_hidden_state) if isinstance(outputs.last_hidden_state, np.ndarray) else outputs.last_hidden_state
            attention_mask = inputs['attention_mask']
            
            pooled = (last_hidden * attention_mask.unsqueeze(-1)).sum(1) / attention_mask.sum(-1).unsqueeze(-1)
            pooled = pooled / torch.norm(pooled, p=2, dim=1, keepdim=True)
            
            embeddings.append(pooled.detach().numpy())
            valid_indices.append(idx)  # Record the original index of this text
        except Exception as e:
            print(f"Error processing text '{text[:50]}...': {str(e)}")
            continue

    if not embeddings:
        raise ValueError("No valid embeddings generated - check input texts and model")

    return np.concatenate(embeddings, axis=0).astype(np.float64), valid_indices


def group_identical_issues(parquet_path, similarity_threshold=0.65):
    # 1. Load data
    df = load_data(parquet_path)
    
    # 2. Early return if not enough data
    if len(df) < 2:
        print(f"Not enough data points ({len(df)}), returning empty list")
        return []
    
    # 3. Generate embeddings
    texts = df["cleaned_text"].tolist()
    embeddings, valid_indices = onnx_encode_texts(texts)

    df = df.iloc[valid_indices].reset_index(drop=True)
    
    # 4. Early return if embeddings failed
    if len(embeddings) < 2:
        print(f"Not enough valid embeddings ({len(embeddings)}), returning empty list")
        return []
    
    # 5. Cluster with validation
    distance_matrix = cosine_distances(embeddings).astype(np.float64)
    #print("Distance matrix sample:\n", np.round(distance_matrix[:5, :5], 3))
    print(f"Distance matrix shape: {distance_matrix.shape}")
    
    # Skip clustering if not enough points
    if len(distance_matrix) < 2:
        return []
    
    try:
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=2,                   # Minimum cluster size
            min_samples=1,                        # More sensitive to small clusters
            cluster_selection_epsilon=0.3,        # Lower = tighter clusters
            metric="precomputed",
        cluster_selection_method="leaf"       # Better for small datasets
        )
        cluster_labels = clusterer.fit_predict(distance_matrix)
    except Exception as e:
        print(f"Clustering failed: {str(e)}")
        return []
    
    # 6. Group results
    output_groups = []
    unique_labels = set(cluster_labels) - {-1}
    print(f"Found {len(unique_labels)} clusters")
    
    for cluster_id in unique_labels:
        cluster_df = df[cluster_labels == cluster_id]
        if len(cluster_df) < 2:
            continue
            
        report_ids = cluster_df["id"].values
        cluster_embeddings = embeddings[cluster_labels == cluster_id]
        
        try:
            sim_matrix = 1 - cosine_distances(cluster_embeddings)
            visited = set()
            for i in range(len(report_ids)):
                if i not in visited:
                    group = [j for j in range(len(report_ids)) 
                            if sim_matrix[i,j] >= similarity_threshold]
                    visited.update(group)
                    if len(group) > 1:
                        output_groups.append(report_ids[group].tolist())
        except Exception as e:
            print(f"Error processing cluster {cluster_id}: {str(e)}")
            continue
    
    print(output_groups)
    for item in output_groups:
        print("new")
        for item2 in item:
            print(cluster_df[cluster_df["id"] == item2])
    return output_groups
