import requests
DEEPSEEK_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEEPSEEK_API_KEYS = []
for i in range(6):
    filename = str(i + 1)
    filename = "dskey" + filename + ".txt" 
    with open(filename, 'r') as file:
        DEEPSEEK_API_KEYS.append(file.read().strip())

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
    
    for z in range(len(DEEPSEEK_API_KEYS)):
        try:
            headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEYS[z]}",
            "Content-Type": "application/json"
            }
            response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except:
            pass
    return "Sorry, I couldn't process your request at this time."
    

# x = call_deepseek_api("Are these two describing the same event? Output YES or NO, and how confident you are from a scale of 0 to 1." \
#     "1. The lamppost is broken" \
#     "2. There is no lighting at the street.")

# print(x)

