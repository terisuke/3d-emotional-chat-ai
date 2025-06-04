import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse, GenerateContentParameters, Tool } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

export const handler = async (event: any, context: any) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { prompt, systemInstruction } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        text: response.text || '',
        candidates: response.candidates || []
      }),
    };

  } catch (error) {
    console.error('Gemini API call failed:', error);
    const message = (error instanceof Error && error.message) ? error.message : "An unknown error occurred";
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `AI service error: ${message}` }),
    };
  }
};