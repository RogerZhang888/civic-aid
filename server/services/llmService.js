const { exec } = require('child_process');
const path = require('path');

/**
 * Calls the Python model using CLI and returns the output.
 * Assumes the Python script exposes a callable entrypoint like: use_model(query, query_type, image_path)
 */
exports.callModel = async ({ query, queryType, imagePath = null }) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '.../chatbot/chatbotmodels/MainChatbotNoSSL.py'); // adjust this
    const command = imagePath
      ? `python3 "${scriptPath}" --query "${query}" --type "${queryType}" --image "${imagePath}"`
      : `python3 "${scriptPath}" --query "${query}" --type "${queryType}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Model execution error:", stderr);
        return reject(error);
      }

      try {
        const startIndex = stdout.indexOf('{');
        const jsonStr = stdout.slice(startIndex); // assumes the result is JSON-printed at the end
        const result = JSON.parse(jsonStr);
        resolve(result);
      } catch (parseErr) {
        console.error("Failed to parse model output:", stdout);
        reject(parseErr);
      }
    });
  });
};
