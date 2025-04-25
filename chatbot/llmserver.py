from flask import Flask, request, jsonify
from chatbotmodels.MainChatbotWithSSL import call_model as callMainModel
from chatbotmodels.BasicDSKoller import call_deepseek_api as callBasicModel

# Initialize Flask app
app = Flask(__name__)

@app.route('/api/callmodel', methods=['POST'])
def callmodel():
    params = request.get_json()
    query = params['query']
    prompt = params['prompt']
    model = params['model'] # Main, Basic, Captioner(WIP)
    
    if query is None:
        return jsonify({"status": "error", "output": "Missing query in request"}), 400
    if prompt is None:
        return jsonify({"status": "error", "output": "Missing prompt in request"}), 400
    if prompt is None:
        return jsonify({"status": "error", "output": "Missing model in request"}), 400
   
    try:
        if model == 'main':
            modelanswer = callMainModel(query, prompt)
        elif model == 'basic':
            modelanswer = callBasicModel(f"{prompt}\n---\nUSER QUERY:\n{query}")
        print(f"Received response as {modelanswer}")
        return jsonify(modelanswer), 200
    except:
        return jsonify({"status": "error", "output": "Failed to call model"}), 500

# Health check endpoint 
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7346 , debug=True)
