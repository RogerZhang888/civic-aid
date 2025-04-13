import json
import os
from typing import List
import torch
import numpy as np
from datasets import Dataset, load_from_disk
from transformers import CLIPProcessor, CLIPModel
from peft import LoraConfig, get_peft_model
from sentence_transformers import InputExample, losses
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
        "text_model.encoder.layers.11.self_attn.q_proj",  # Query projection
        "text_model.encoder.layers.11.self_attn.v_proj",  # Value projection
        "text_model.encoder.layers.11.mlp.fc1",           # MLP layer 1
        "text_model.encoder.layers.11.mlp.fc2",           # MLP layer 2
    ]

    # Training
    BATCH_SIZE = 32
    EPOCHS = 3
    LEARNING_RATE = 2e-5

# --- Initialize CLIP ---
device = "cuda" if torch.cuda.is_available() else "cpu"
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
base_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)

# --- Chunking Functions ---
def chunk_text(text: str, processor: CLIPProcessor) -> List[str]:
    """Split text into CLIP-friendly chunks with overlap."""
    tokenized = processor.tokenizer.encode(text, add_special_tokens=False)
    chunks = []
    for i in range(0, len(tokenized), Config.CHUNK_SIZE - Config.OVERLAP):
        chunk = tokenized[i:i + Config.CHUNK_SIZE]
        if len(chunk) + 2 > 77:  # CLIP's max length
            chunk = chunk[:77-2]
        chunks.append(processor.tokenizer.decode(chunk, skip_special_tokens=True))
    return chunks

def process_jl_file(input_path: str, output_dir: str) -> Dataset:
    """Process .jl file into chunked dataset."""
    os.makedirs(output_dir, exist_ok=True)
    chunks, metadata = [], []
    
    with open(input_path, 'r', encoding='utf-8') as f:
        for line in tqdm(f, desc="Chunking data"):
            entry = json.loads(line)
            content = entry.get("content", "")
            if not content:
                continue
                
            entry_chunks = chunk_text(content, processor)
            chunks.extend(entry_chunks)
            metadata.extend([{
                "source_url": entry.get("url", ""),
                "source_text": content[:200] + ("..." if len(content) > 200 else "")
            }] * len(entry_chunks))
    
    return Dataset.from_dict({
        "chunk_text": chunks,
        "metadata": metadata
    })

# --- LoRA Adaptation ---
def setup_lora(model: CLIPModel) -> CLIPModel:
    """Attach LoRA adapters to CLIP."""
    config = LoraConfig(
        r=Config.LORA_RANK,
        lora_alpha=Config.LORA_ALPHA,
        target_modules=Config.TARGET_MODULES,
        lora_dropout=Config.LORA_DROPOUT,
        bias="none"
    )
    return get_peft_model(model, config)

def create_ssl_pairs(dataset: Dataset) -> Dataset:
    """Generate self-supervised pairs as a HuggingFace Dataset"""
    examples = []
    for i in range(len(dataset)):
        # Positive pair
        examples.append({
            "text1": dataset[i]["chunk_text"],
            "text2": dataset[i]["chunk_text"],
            "label": 1.0
        })
        # Negative pair
        if i > 0:
            j = np.random.randint(0, i)
            examples.append({
                "text1": dataset[i]["chunk_text"],
                "text2": dataset[j]["chunk_text"],
                "label": 0.0
            })
    return Dataset.from_list(examples)

def train_ssl(model: CLIPModel, dataset: Dataset):
    """Train with contrastive loss using proper batching"""
    model.train()
    optimizer = torch.optim.AdamW(model.parameters(), lr=Config.LEARNING_RATE)
    
    # Convert to PyTorch format
    dataset = dataset.with_format("torch")
    
    # Custom collate function
    def collate_fn(batch):
        return {
            "text1": [item["text1"] for item in batch],
            "text2": [item["text2"] for item in batch],
            "labels": torch.stack([item["label"] for item in batch])
        }
    
    dataloader = DataLoader(
        dataset,
        batch_size=Config.BATCH_SIZE,
        shuffle=True,
        collate_fn=collate_fn
    )
    
    for epoch in range(Config.EPOCHS):
        epoch_loss = 0
        for batch in tqdm(dataloader, desc=f"Epoch {epoch+1}"):
            optimizer.zero_grad()
            
            # Get embeddings for both texts - REMOVE torch.no_grad()!
            inputs1 = processor(text=batch["text1"], return_tensors="pt", padding=True, truncation=True).to(device)
            inputs2 = processor(text=batch["text2"], return_tensors="pt", padding=True, truncation=True).to(device)
            
            # Forward pass - keep computation graph
            emb1 = model.get_text_features(**inputs1)
            emb2 = model.get_text_features(**inputs2)
            
            # Compute contrastive loss
            sim = torch.nn.functional.cosine_similarity(emb1, emb2)
            loss = torch.nn.functional.mse_loss(sim, batch["labels"].to(device))
            
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        
        print(f"Epoch {epoch+1} Loss: {epoch_loss/len(dataloader):.4f}")

# --- Main Pipeline ---
def main():
    # 1. Chunk the raw data
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(SCRIPT_DIR, "..", "govsg_crawler_2", "gov_text_output_cleaned.jl")
    data_path = os.path.normpath(data_path)
    output_dir = "chunked_data"
    if not os.path.exists(os.path.join(output_dir, "dataset_info.json")):
        print("Chunking data...")
        dataset = process_jl_file(data_path, output_dir)
        dataset.save_to_disk(output_dir)
    else:
        dataset = load_from_disk(output_dir)
    
    # 2. Setup LoRA
    model = setup_lora(base_model)
    model.print_trainable_parameters()  # Should show ~0.2% trainable
    
    # 3. Generate self-supervised pairs
    ssl_dataset = create_ssl_pairs(dataset)
    
    # 4. Train
    train_ssl(model, ssl_dataset)

    model = model.merge_and_unload()  # Combine LoRA with base model

    # Save ALL required files
    model.save_pretrained("clip_lora_merged", safe_serialization=True)
    processor.save_pretrained("clip_lora_merged")

    # Verify all files exist
    required_files = [
    "config.json",
    "preprocessor_config.json",
    "pytorch_model.bin",  # or model.safetensors if using safe_serialization
    "special_tokens_map.json",
    "tokenizer_config.json",
    "vocab.json"
    ]
    for file in required_files:
        assert os.path.exists(f"clip_lora_merged/{file}"), f"Missing {file}"

    
    # 5. Save


if __name__ == "__main__":
    main()
    