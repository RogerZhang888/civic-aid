from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np



# Example list of questions (replace with your own)
questions = [
    "What is the capital of France?",
    "Which city is the capital of France?",
    "How tall is Mount Everest?",
    "What's the height of Mount Everest?",
    "Who is the president of the USA?",
    "Who is the current US president?",
    "What is the population of Tokyo?",
    "How many people live in Tokyo?"
]

# Assign IDs to questions (0, 1, 2, ...)
question_ids = list(range(len(questions)))

# Load a pre-trained sentence embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings for all questions
embeddings = model.encode(questions)

# Compute cosine similarity matrix
cosine_sim = cosine_similarity(embeddings)

# Convert similarity to distance (ensure non-negative)
distance_matrix = 1 - np.clip(cosine_sim, 0, 1)  # Clip to avoid negative values

# Cluster similar questions using DBSCAN (adjust `eps` and `min_samples` as needed)
#lower eps is stricter
clustering = DBSCAN(eps=0.5, min_samples=2, metric='precomputed').fit(distance_matrix)
labels = clustering.labels_

# Group question IDs by cluster
clusters = {}
for idx, label in enumerate(labels):
    if label not in clusters:
        clusters[label] = []
    clusters[label].append(question_ids[idx])

# Filter out noise (label=-1) and small clusters (optional)
min_cluster_size = 2  # Only keep clusters with at least this many questions
filtered_clusters = {
    label: members for label, members in clusters.items() 
    if label != -1 and len(members) >= min_cluster_size
}

# Output the clusters
print("Clusters of similar questions (ID groups):")
for cluster_id, members in filtered_clusters.items():
    print(f"Cluster {cluster_id}: {members}")