import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse, GenerateContentParameters, Tool } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { prompt, systemInstruction } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const tools: Tool[] = [{ googleSearch: {} }];

    const request: GenerateContentParameters = {
      model: "gemini-2.5-flash-preview-05-20",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
      }
    };

    const response: GenerateContentResponse = await ai.models.generateContent(request);
    
    res.status(200).json({
      text: response.text || '',
      candidates: response.candidates || []
    });

  } catch (error) {
    console.error('Gemini API call failed:', error);
    const message = (error instanceof Error && error.message) ? error.message : "An unknown error occurred";
    res.status(500).json({ error: `AI service error: ${message}` });
  }
}