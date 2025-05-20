from flask import Flask, request, jsonify
from chatbotmodels.MainChatbotSealion import call_model as callMainModel
from chatbotmodels.BasicSealionKoller import call_sealion_api as callBasicModel
from chatbotmodels.AuxModelCaptioner import generate_caption as callCaptionerModel
from chatbotmodels.ReportCompiler import group_identical_issues as callReportCompiler
from safety import check_input_safety

# Initialize Flask app
app = Flask(__name__)

@app.route('/api/callmodel', methods=['POST'])
def callmodel():
    params = request.get_json()
    query = params['query']
    prompt = params['prompt']
    model = params['model'] # Main, Basic, Captioner(WIP)
    filepath = params['filepath']
    
    print(f"Calling model {model}")
    
    if filepath is not None:
        filepath = '../server/uploads/' + filepath
    print(f"IMAGE FILEPATH {filepath}") 

    modelanswer = {"answer":"Default model answer - this response likely indicates an invalid model name supplied. "} 

    issues = check_input_safety(query)
    if (len(issues) > 0):
        return jsonify({"answer":"Unable to process input"})

    try:
        if model == 'main' or (model == 'basic' and filepath is not None):
            modelanswer = callMainModel(query, prompt, filepath)
        elif model == 'basic':
            modelanswer = {
                "answer": callBasicModel(f"{prompt}\n---\nUSER QUERY:\n{query}")
            }
        elif model == 'captioner':
            modelanswer = {
                "answer": callCaptionerModel(filepath)
            }
        print(f"Received response as {modelanswer}")
        return jsonify(modelanswer), 200
    except Exception as e:
        print("Failed to call model", e)
        return jsonify({"status": "error", "output": "Failed to call model"}), 500

@app.route('/api/callsummariser', methods=['POST'])
def callsummariser():
    params = request.get_json()
    parquet_path = '../server/parquets/' + params['parquet_path']

    res = callReportCompiler(parquet_path)
    print(f"Summariser parquets {parquet_path} processed", res)
    return jsonify(res)

# Health check endpoint 
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=7346 , debug=True)
