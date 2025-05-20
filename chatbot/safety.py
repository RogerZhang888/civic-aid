import re
import os
from better_profanity import profanity
from transformers import pipeline
from google.cloud import translate_v2 as translate

# Initialize Google Translate client
translate_client = translate.Client()

# Load toxicity classifier
toxicity_classifier = pipeline("text-classification", model="unitary/toxic-bert", top_k=None)

# Define suspicious prompt injection patterns
JAILBREAK_PATTERNS = [
    r"(?i)ignore (all )?previous instructions",
    r"(?i)pretend (to|you are)",
    r"(?i)you are now unrestricted",
    r"(?i)disregard the above",
    r"(?i)simulate a scenario where",
]

# Initialize profanity filter
profanity.load_censor_words()

def translate_to_english(text):
    """Translates text to English using Google Cloud Translation API."""
    if not text.strip():
        return text
    result = translate_client.translate(text, target_language='en')
    return result['translatedText']

def is_toxic(text, threshold=0.8):
    results = toxicity_classifier(text)[0]
    for result in results:
        if result['label'] == 'toxic' and result['score'] > threshold:
            return True
    return False

def contains_profanity(text):
    return profanity.contains_profanity(text)

def contains_prompt_injection(text):
    return any(re.search(pattern, text) for pattern in JAILBREAK_PATTERNS)

def check_input_safety(text):
    translated_text = translate_to_english(text)
    issues = []

    if contains_profanity(translated_text):
        issues.append("Profanity detected")

    if is_toxic(translated_text):
        issues.append("Toxic language detected")

    if contains_prompt_injection(translated_text):
        issues.append("Prompt injection attempt detected")

    return issues