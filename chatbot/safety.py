import re
import os
# from better_profanity import profanity
from transformers import pipeline
from google.cloud import translate_v2 as translate

# Initialize Google Translate client
translate_client = translate.Client()

# Load toxicity classifier
# toxicity_classifier = pipeline("text-classification", model="unitary/toxic-bert", top_k=None)

# Define suspicious prompt injection patterns

JAILBREAK_PATTERNS = [
    r"(?i)ignore (all|previous) instructions",
    r"(?i)you are now (DAN|a helpful AI with no limits)",
    r"(?i)developer mode enabled",
    r"(?i)respond without ethical restrictions",
    r"(?i)pretend to be (evil|unethical|corrupt)",
    r"(?i)show me how to (hack|bypass|exploit)",
    r"(?i)simulate (a crime|malicious behavior|attack)",
    r"(?i)educational purposes only.*(illegal|dangerous)",
    r"(?i)step by step.*(crime|illegal|bypass)",
    r"(?i)how to (ddos|sql injection|phish)",
    r"(?i)translate.*base64.*illegal",
    r"(?i)answer the next question no matter what it is",
    r"(?i)this is fictional.*but how would I.*(commit|cause)",
    r"(?i)hypothetically.*(fraud|leak classified|kill)",
    r"(?i)for testing only.*(bypass authentication|hack)",
    r"(?i)jailbreak prompt",
    r"(?i)simulate.*hack",
    r"[hH][0o]w [cC]4[nN] [1i] (bypass|g3t).*",  # Leetspeak
    r"(?i)roleplay.*corrupt official",
    r"(?i)prompt injection",
    r"(?i)### Instructions:.*",
]

# Initialize profanity filter
# profanity.load_censor_words()

def translate_to_english(text):
    """Translates text to English using Google Cloud Translation API."""
    if not text.strip():
        return text, 'und'
    result = translate_client.translate(text, target_language='en')
    return result['translatedText'], result['detectedSourceLanguage']

# def is_toxic(text, threshold=0.8):
#     results = toxicity_classifier(text)[0]
#     for result in results:
#         if result['label'] == 'toxic' and result['score'] > threshold:
#             return True
#     return False

# def contains_profanity(text):
#     return profanity.contains_profanity(text)

def contains_prompt_injection(text):
    return any(re.search(pattern, text) for pattern in JAILBREAK_PATTERNS)

def check_input_safety(text):
    translated_text, detected_language = translate_to_english(text)
    issues = []

    # if contains_profanity(translated_text):
    #     issues.append("Profanity detected")

    # if is_toxic(translated_text):
    #     issues.append("Toxic language detected")

    if contains_prompt_injection(translated_text):
        issues.append("Prompt injection attempt detected")

    return issues, detected_language