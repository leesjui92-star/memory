require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAllModels() {
  console.log("Testing all models...");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Fetch available models
  let models = [];
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    models = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).map(m => m.name.replace('models/', ''));
    console.log("Found models:", models.join(', '));
  } catch (e) {
    console.error("Error fetching models:", e);
    return;
  }

  for (const modelName of models) {
    if (modelName.includes('vision') || modelName.includes('audio') || modelName.includes('embedding') || modelName.includes('tts') || modelName.includes('veo') || modelName.includes('imagen')) continue;
    
    console.log(`\nTesting model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    try {
      const result = await model.generateContent("Hello, say 'test'");
      console.log(`✅ SUCCESS with ${modelName}:`, result.response.text());
      return; // Stop on first success
    } catch (e) {
      console.log(`❌ Failed with ${modelName}:`, e.message);
    }
  }
}
testAllModels();
