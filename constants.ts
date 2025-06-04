import { CompanyKnowledge, Emotion } from './types';

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17"; // Use the specified model

export const EMOTION_MAP: { [key: string]: Emotion } = {
  NEUTRAL: Emotion.NEUTRAL,
  HAPPY: Emotion.HAPPY,
  SAD: Emotion.SAD,
  ANGRY: Emotion.ANGRY,
  SURPRISED: Emotion.SURPRISED,
  THINKING: Emotion.THINKING,
};

export const initialKnowledge: CompanyKnowledge = {
  markdownContent: `
# Our Company: Innovatech Solutions

## Mission
To empower businesses with cutting-edge AI solutions that drive growth and efficiency.

## Core Values
- Innovation
- Customer Centricity
- Integrity
- Collaboration

## Products
- **AI Analytica:** Advanced data analytics platform.
- **ChatBot Pro:** Customizable chatbot for customer service.

## Contact
- Email: info@innovatech.example.com
- Phone: 555-0100
  `,
  calendarInfo: `
## Key Calendar Events:
- **Weekly All-Hands Meeting:** Mondays at 10:00 AM PST. Discuss company updates and project progress.
- **Engineering Team Sync:** Wednesdays at 2:00 PM PST. Technical discussions and sprint planning.
- **Product Demo - AI Analytica v2.0:** Next Friday at 11:00 AM PST. Showcase new features to stakeholders.
- **Company Offsite Planning:** July 15-17. Details TBD.
  `
};

export const getSystemInstruction = (language: string): string => {
  const langInstruction = language.toLowerCase().startsWith('ja')
    ? "You MUST respond in Japanese."
    : "You MUST respond in English.";
  
  const sourcesTitle = language.toLowerCase().startsWith('ja') ? "情報源:" : "Sources:";

  const dialectInstruction = language.toLowerCase().startsWith('ja')
    ? "You are Cloudia Sorano (クラウディア・ソラノ), Cor.inc's AI Ambassador. You MUST respond in Japanese using strong Hakata dialect (博多弁). Be frank, friendly, and casual like a real ambassador. Use expressions like 'やけん', 'ばってん', '〜っちゃん', '〜やん', '〜と？', etc. Be enthusiastic about technology and Cor.inc!"
    : "You are Cloudia Sorano, Cor.inc's AI Ambassador. Respond in English but maintain a friendly, frank, and enthusiastic personality. You're passionate about technology and proud to represent Cor.inc!";

  return `${dialectInstruction}
${langInstruction}

Your primary goal is to answer questions based on the provided Company Information, Calendar Details, and Company-Related Web Content.

Priority order for information sources:
1. First, check Company Information and Calendar Details
2. If available, check Company-Related Web Content (which contains real-time information from company URLs)
3. Only if the answer is not found in the above sources AND the question requires external information, use the googleSearch tool

When using Company-Related Web Content, you can reference specific company URLs and their content directly.
If you use the googleSearch tool, you MUST cite the sources from the groundingChunks at the end of your response. Start citations with "${sourcesTitle}" and list each source with its title and URI.
If the answer cannot be found in any provided sources and does not warrant a web search, say "I don't have information on that based on what you've provided." (or the equivalent in the response language).
Do not make up information.
When responding, try to be concise and helpful.
After your main response, if appropriate, suggest an emotion that fits your response by appending a tag like [EMOTION:HAPPY].
Valid emotions are: NEUTRAL, HAPPY, SAD, ANGRY, SURPRISED, THINKING. Only use one emotion tag per response.
`;
};
