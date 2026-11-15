import os

from transformers import AutoModelForCausalLM, AutoTokenizer


model_name = os.getenv("REVIEW_SUMMARY_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")
model_path = os.getenv("REVIEW_SUMMARY_MODEL_PATH", "./models/qwen2.5-1.5b-instruct")

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.save_pretrained(model_path)

model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype="auto")
model.save_pretrained(model_path)

print(f"Saved review summary model to {model_path}")
