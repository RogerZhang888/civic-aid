
# Load and quantize
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.float16
)

model = AutoModelForCausalLM.from_pretrained(
    "aisingapore/Llama-SEA-LION-v3-70B",
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True
)
tokenizer = AutoTokenizer.from_pretrained("aisingapore/Llama-SEA-LION-v3-70B")

# Save
model.save_pretrained("./Llama-SEA-LION-v3-70B-4bit")
tokenizer.save_pretrained("./Llama-SEA-LION-v3-70B-4bit")

