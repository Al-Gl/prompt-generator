const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/generate endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { seedWord } = req.body;

    if (!seedWord) {
      return res.status(400).json({ error: 'Seed word is required' });
    }

    console.log(`Processing seed word: "${seedWord}"`);

    // Initialize model with Google Search tool (Grounding)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-002',
      tools: [{
        googleSearch: {}  // Enable Google Search Grounding
      }]
    });

    // Two-step prompt process
    const prompt = `You are an LLM behavior analyst. Your task is to analyze search patterns for the seed word: "${seedWord}"

Step 1 - Research Phase:
Using Google Search, find:
1. "People Also Asked" (PAA) questions related to "${seedWord}"
2. Related search queries
3. Common question patterns
4. Search result density and prominence

Step 2 - Synthesis Phase:
Convert the search queries you found into realistic LLM-style prompts that users would ask an AI assistant. For each prompt, provide:
1. The realistic prompt (how a user would naturally ask)
2. User intent category (Informational, Transactional, or Comparative)
3. Visibility Score (1-100) based on:
   - Search result prominence
   - PAA frequency
   - Related query density
   - Estimated search volume indicators

Return your response as a JSON array with this exact structure:
[
  {
    "prompt": "The realistic user prompt",
    "intent": "Informational",
    "visibilityScore": 85
  }
]

Focus on finding 10-15 high-quality prompts that represent realistic user behavior. Return ONLY the JSON array, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    console.log('Grounding metadata:', groundingMetadata ? 'Available' : 'Not available');

    // Parse JSON response from AI
    let prompts = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                       text.match(/\[([\s\S]*?)\]/);
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        prompts = JSON.parse(jsonText);
      } else {
        // Try parsing the entire text
        prompts = JSON.parse(text);
      }

      console.log(`Successfully parsed ${prompts.length} prompts`);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError.message);
      // Return raw text if parsing fails
      return res.json({
        rawResponse: text,
        groundingData: {
          searchQueries: groundingMetadata?.webSearchQueries || [],
          sources: groundingMetadata?.groundingChunks?.map(chunk => ({
            uri: chunk.web?.uri,
            title: chunk.web?.title
          })) || []
        }
      });
    }

    res.json({
      prompts,
      groundingData: {
        searchQueries: groundingMetadata?.webSearchQueries || [],
        sources: groundingMetadata?.groundingChunks?.map(chunk => ({
          uri: chunk.web?.uri,
          title: chunk.web?.title
        })) || []
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to generate prompts',
      details: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Gemini API configured: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
