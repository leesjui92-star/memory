require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = await genAI.getGenerativeModel({ model: 'gemini-pro' }); // Dummy model to get client
  // The SDK doesn't have a direct listModels, but we can try common names.
  console.log("Checking model names...");
}
listModels();
