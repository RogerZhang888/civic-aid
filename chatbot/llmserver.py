from flask import Flask, request, jsonify
from chatbotmodels.MainChatbotWithSSL import call_model

# Initialize Flask app
app = Flask(__name__)

@app.route('/api/callmodel', methods=['POST'])
def callmodel():
    temp_params = request.get_json()
    query = temp_params['params']['query']
    prompt = temp_params['params']['prompt']
    
    if query is None:
        return jsonify({"status": "error", "output": "Missing question_id in request"}), 400
    
    return call_model(query, prompt)

# Health check endpoint 
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7346 , debug=True)