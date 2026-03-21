const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

function getApiKey() {
  const env = fs.readFileSync(".env.local", "utf8");
  const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
  return match ? match[1].trim().replace(/['"]/g, '') : null;
}

async function test() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API key missing in .env.local");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      console.log(`SUCCESS with ${modelName}: ${result.response.text().substring(0, 20)}...`);
    } catch (err) {
      console.error(`FAILED with ${modelName}: ${err.message}`);
    }
  }
}

test();
