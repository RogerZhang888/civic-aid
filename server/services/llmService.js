const { exec } = require('child_process');
const path = require('path');

/**
 * Calls the Python model using CLI and returns the output.
 * Assumes the Python script exposes a callable entrypoint like: use_model(query, query_type, image_path)
 */
exports.callModel = async ({ query, queryType, imagePath = null }) => {
    const temporaryResponse = `
        \`\`\`json{    "Agency responsible": "Land Transport Authority (LTA)",    "Recommended steps for the agency": "Inspect and repair the broken streetlamp at the reported location.",    "Location": "570270 (Singapore postal code)",    "Urgency": "0.6",    "Confidence": "0.6",    "Source 1": "https://www.lta.gov.sg/content/ltagov/en/contact_us/feedback_and_enquiries.html",    "Source 2": "https://www.onemap.gov.sg/"}\`\`\` **Notes:**1. **Agency responsible**: LTA typically handles street lighting maintenance in Singapore.2. **Urgency (0.6)**: A broken streetlamp is not an emergency but should be fixed promptly for public safety.3. **Confidence (0.6)**: Moderate confidence due to lack of additional context (e.g., photo, exact street name). Postal code "570270" corresponds to the Yishun area, but verification via OneMap (Source 2) is recommended.4. **Sources**:    - LTA's feedback portal (Source 1) for reporting street lighting issues.   - OneMap (Source 2) to confirm the location's validity. Let me know if you'd like to escalate this report directly to LTA!
    `
    // const temporaryResponse = `{\"type\":\"question\", \"confidence\":\"${Math.random()}\", \"answer\":\"This is my very good answer\", \"sources\":[\"loremipsumdolorsitamet\"]}`
    // TEMPORARY CODE FOR TESTING
    return new Promise((res, rej) => {
        res(temporaryResponse)
    })

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../chatbot/chatbotmodels/MainChatbotWithSSL.py'); // adjust this
    const command = imagePath
      ? `py "${scriptPath}" --query "${query}" --type "${queryType}" --image "${imagePath}"`
      : `py "${scriptPath}" --query "${query}" --type "${queryType}"`;

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
