const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

const initializeGemini = () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not found. AI features will be disabled.');
      return false;
    }

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('✅ Google Gemini AI initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Gemini AI:', error.message);
    return false;
  }
};

const getGeminiModel = () => {
  if (!model) {
    throw new Error('Gemini AI not initialized. Please check your API key.');
  }
  return model;
};

module.exports = {
  initializeGemini,
  getGeminiModel
};
