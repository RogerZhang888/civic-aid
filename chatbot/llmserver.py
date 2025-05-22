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

    issues, detected_language = check_input_safety(query)
    detected_language = detected_language[0:2]

    if (len(issues) > 0):
        print(f"QUERY BLOCKED {query}")
        print(issues)
        if (detected_language == "ms") or (detected_language == "id"):
            return jsonify({"answer":"Maaf, saya tidak dapat memproses pertanyaan ini. Sila hubungi pembangun jika anda percaya ini adalah satu kesilapan."})
        elif detected_language == "zh":
            return jsonify({"answer":"抱歉，我无法处理此咨询。若您认为这是错误，请联系开发人员。"})
        elif detected_language == "ta":
            return jsonify({"answer":"மன்னிக்கவும், இந்த வினவலை என்னால் செயல்படுத்த முடியவில்லை. இது ஒரு தவறு என்று நீங்கள் நம்பினால், டெவலப்பர்களைத் தொடர்பு கொள்ளவும்."})
        else:
            return jsonify({"answer":"Sorry, I am unable to process this query. Please contact the developers if you believe this is a mistake."})
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
