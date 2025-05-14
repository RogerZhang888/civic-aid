import json
import os
import random
from typing import List
import torch
import numpy as np
from datasets import Dataset, load_from_disk
from transformers import CLIPProcessor, CLIPModel
from peft import LoraConfig, get_peft_model
from torch.utils.data import DataLoader
from tqdm import tqdm

# --- Configuration ---
class Config:
    # Chunking
    CHUNK_SIZE = 75
    OVERLAP = 25
    
    # LoRA
    LORA_RANK = 8
    LORA_ALPHA = 32
    LORA_DROPOUT = 0.1
    TARGET_MODULES = [
        "text_projection",
        "text_model.encoder.layers.11.self_attn.q_proj",
        "text_model.encoder.layers.11.self_attn.v_proj",
        "text_model.encoder.layers.11.mlp.fc1",
        "text_model.encoder.layers.11.mlp.fc2",
    ]

    # Training
    BATCH_SIZE = 128  # Larger for better negative sampling
    EPOCHS = 3
    LEARNING_RATE = 2e-5
    PROJ_DIM = 256    # Projection head dimension

# --- Text Augmentations ---
def augment_text(text: str, p_drop=0.1, p_swap=0.2) -> str:
    """Simple text augmentation for contrastive learning"""
    words = text.split()
    
    # Word dropout
    if len(words) > 2 and random.random() < p_drop:
        mask = np.random.rand(len(words)) > p_drop
        words = list(np.array(words)[mask])
    
    # Word swap
    if len(words) > 3 and random.random() < p_swap:
        i, j = sorted(random.sample(range(len(words)), 2))
        words[i], words[j] = words[j], words[i]
    
    return " ".join(words).strip()

# --- Projection Head ---
class ProjectionHead(torch.nn.Module):
    def __init__(self, input_dim=512, output_dim=Config.PROJ_DIM):
        super().__init__()
        self.dense = torch.nn.Linear(input_dim, output_dim)
        self.gelu = torch.nn.GELU()
        self.layer_norm = torch.nn.LayerNorm(output_dim)
        
    def forward(self, x):
        return self.layer_norm(self.gelu(self.dense(x)))

# --- Modified CLIP Model ---
class CustomCLIP(torch.nn.Module):
    def __init__(self, base_model):
        super().__init__()
        self.clip = base_model
        self.projection = ProjectionHead()
        
    def forward(self, **inputs):
        features = self.clip.get_text_features(**inputs)
        return self.projection(features)

# --- Chunking & Data Processing ---
def chunk_text(text: str, processor) -> List[str]:
    tokenized = processor.tokenizer.encode(text, add_special_tokens=False)
    chunks = []
    for i in range(0, len(tokenized), Config.CHUNK_SIZE - Config.OVERLAP):
        chunk = tokenized[i:i + Config.CHUNK_SIZE]
        if len(chunk) + 2 > 77:
            chunk = chunk[:77-2]
        chunks.append(processor.tokenizer.decode(chunk, skip_special_tokens=True))
    return chunks

def process_jl_file(input_path: str, output_dir: str) -> Dataset:
    os.makedirs(output_dir, exist_ok=True)
    chunks = []
    
    with open(input_path, 'r', encoding='utf-8') as f:
        for line in tqdm(f, desc="Chunking data"):
            entry = json.loads(line)
            content = entry.get("content", "")
            chunks.extend(chunk_text(content, processor))
    
    return Dataset.from_dict({"text": chunks})

# --- Training Components ---
def create_ssl_dataset(dataset: Dataset) -> Dataset:
    """Create dataset with augmented pairs"""
    texts = dataset["text"]
    return Dataset.from_dict({
        "text": texts,
        "augmented_text": [augment_text(t) for t in texts]
    })

def contrastive_loss(logits, temperature):
    """InfoNCE loss with in-batch negatives"""
    n = logits.size(0)
    labels = torch.arange(n, device=logits.device)
    return torch.nn.functional.cross_entropy(logits / temperature, labels)

def train_ssl(model: CustomCLIP, dataset: Dataset):
    model.train()
    optimizer = torch.optim.AdamW([
        {'params': model.clip.parameters(), 'lr': Config.LEARNING_RATE},
        {'params': model.projection.parameters(), 'lr': Config.LEARNING_RATE},
    ])
    temperature = torch.nn.Parameter(torch.tensor([0.07]).to(device))
    
    dataloader = DataLoader(
        dataset.with_format("torch"),
        batch_size=Config.BATCH_SIZE,
        shuffle=True,
        collate_fn=lambda batch: {
            "text": [item["text"] for item in batch],
            "augmented_text": [item["augmented_text"] for item in batch]
        }
    )
    
    for epoch in range(Config.EPOCHS):
        epoch_loss = 0
        for batch in tqdm(dataloader, desc=f"Epoch {epoch+1}"):
            optimizer.zero_grad()
            
            # Process both views
            inputs1 = processor(
                text=batch["text"], 
                return_tensors="pt", 
                padding=True, 
                truncation=True
            ).to(device)
            
            inputs2 = processor(
                text=batch["augmented_text"], 
                return_tensors="pt", 
                padding=True, 
                truncation=True
            ).to(device)
            
            # Get projections
            proj1 = model(**inputs1)
            proj2 = model(**inputs2)
            
            # Compute similarity matrix
            logits = proj1 @ proj2.t()
            
            # Compute loss
            loss = contrastive_loss(logits, temperature)
            
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        
        print(f"Epoch {epoch+1} Loss: {epoch_loss/len(dataloader):.4f}")
        print(f"Current temperature: {temperature.item():.4f}")

# --- Main Pipeline ---
def main():
    # Initialize base model
    device = "cuda" if torch.cuda.is_available() else "cpu"
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    base_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
    
    # Freeze vision components
    for param in base_model.vision_model.parameters():
        param.requires_grad = False
    for param in base_model.visual_projection.parameters():
        param.requires_grad = False
    
    # Wrap with LoRA
    lora_config = LoraConfig(
        r=Config.LORA_RANK,
        lora_alpha=Config.LORA_ALPHA,
        target_modules=Config.TARGET_MODULES,
        lora_dropout=Config.LORA_DROPOUT,
        bias="none"
    )
    lora_model = get_peft_model(base_model, lora_config)
    
    # Create custom model
    model = CustomCLIP(lora_model).to(device)
    model.print_trainable_parameters()
    
    # Prepare data
    data_path = "path_to_your_data.jl"
    output_dir = "chunked_data"
    if not os.path.exists(os.path.join(output_dir, "dataset_info.json")):
        dataset = process_jl_file(data_path, output_dir)
        dataset.save_to_disk(output_dir)
    else:
        dataset = load_from_disk(output_dir)
    
    # Create SSL dataset
    ssl_dataset = create_ssl_dataset(dataset)
    
    # Train
    train_ssl(model, ssl_dataset)
    
    # Save model
    merged_model = model.clip.merge_and_unload()
    merged_model.save_pretrained("clip_lora_finetuned")
    processor.save_pretrained("clip_lora_finetuned")

if __name__ == "__main__":
    main()