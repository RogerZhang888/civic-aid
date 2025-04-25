import requests
DEEPSEEK_API_URL = "https://openrouter.ai/api/v1/chat/completions"
with open("dskey.txt", 'r') as file:
    DEEPSEEK_API_KEY = file.read().strip()

def call_deepseek_api(prompt: str, max_tokens: int = 400) -> str:
    print("BASIC KOLLER", prompt)

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": [
            {"role": "system", "content": "You are evaluating a government database Follow the instructions provided."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": max_tokens,
        "top_p": 0.9
    }
    
    try:
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        print(response.json()["choices"][0]["message"]["content"])
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return "Sorry, I couldn't process your request at this time."
    
# call_deepseek_api("Are these two describing the same event? Output YES or NO, and how confident you are from a scale of 0 to 1." \
#     "1. The lamppost is broken" \
#     "2. There is no lighting at the street.")
