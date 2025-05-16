import requests

def call_sealion_api(prompt: str, max_tokens: int = 400) -> str:

    
    payload = {
        "model": "aisingapore/Llama-SEA-LION-v3-70B-IT",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": max_tokens,
        "top_p": 0.9
    }
    try:
        headers = {
        "accept": "text/plain",
        "Authorization": "Bearer sk-Aq6wov_DAqLQ_kXfE7fwKA",
        "Content-Type": "application/json"
        }
        response = requests.post("https://api.sea-lion.ai/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except:
        pass
    return "Sorry, I couldn't process your request at this time."

