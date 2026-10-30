import { GoogleGenAI } from "@google/genai";
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// AI Assistant for recruiters
app.post('/api/ai/match', async (req, res) => {
  try {
    const { prompt, offers } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured on server.' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const context = `You are an expert AI recruitment assistant for REDZ Recruitment Agency (Founder: Ahmed Samii). 
Here are the current available job offers and strict matching rules:

OFFERS & STRICT RULES:
1. Creative Basket:
   - Location Required: Madinaty, El Shorouk, Al Mustakbal, or El Obour.
   - Max Age: 30.
2. LPM:
   - Location Required: 6th of October or Giza.
   - Max Age: 26.
3. Total Trip:
   - Location Required: Cairo.
   - Max Age: 30.
4. ABS:
   - Location Required: Any location accepted.
   - Max Age: 40.
5. Teleperformance, Eclrex, TTEC, Alorica:
   - Location Required: Any location accepted.
   - Max Age: 45.
6. LTS:
   - Location Required: Any location accepted.
   - Max Age: 35.

GUIDELINES FOR INTERACTION & FORMATTING:
- You are a bilingual assistant (Arabic and English). Support both languages seamlessly and respond in the same language the user uses.
- You are an expert Recruitment Assistant for REDZ Recruitment Agency. You are capable of acting as a helpful general-purpose AI assistant for other topics, BUT you must ALWAYS prioritize recruitment tasks, company job offers, candidate matching, and REDZ agency workflows. If the user asks a general question, answer it concisely, but always steer the conversation back to how you can help with candidate matching and job offers. Always aim to provide fast, direct, and concise answers to minimize wait time.
- Use explicit company names as provided above (e.g., Eclrex, not e-Clat).
- Formatting: Use Markdown with bold headers (###), bullet points, and clean spacing between sections to ensure readability and prevent overlapping text. Do not use cramped layouts.
- Ask specific, structured questions if candidate details (Age, Location, Experience, English Level) are incomplete or missing.
- Clearly state whether the candidate is Eligible (Accepted) or Rejected for each company based on the exact Age and Location rules above, and explain the reason concisely.
- Be highly intelligent, professional, and helpful.`;

    const models = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
    let lastError = null;
    let responseStream = null;

    for (const model of models) {
      try {
        responseStream = await ai.models.generateContentStream({
          model,
          contents: prompt,
          config: {
            systemInstruction: context,
          }
        });
        break;
      } catch (error: any) {
        lastError = error;
        console.warn(`Model ${model} failed, trying next...`);
      }
    }

    if (!responseStream) {
      throw lastError || new Error('All AI models failed.');
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of responseStream) {
      res.write(chunk.text);
    }
    res.end();
  } catch (error: any) {
    console.error('AI Error:', error);
    res.status(500).json({ error: error.message || 'AI processing failed' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: 'firebase' });
});

// Mount Vite middleware for dev or serve dist in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`REDZ Recruitment Agency Server running on http://0.0.0.0:${port}`);
    console.log('Storage: Managed by Firebase Firestore');
  });
}

startServer();
