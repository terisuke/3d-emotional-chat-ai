
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  emotion?: Emotion;
  sources?: Source[];
}

export enum Emotion {
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  SURPRISED = 'SURPRISED',
  THINKING = 'THINKING',
}

export interface CompanyKnowledge {
  markdownContent: string;
  calendarInfo: string;
  companyUrls?: CompanyURL[];
}

export interface CompanyURL {
  url: string;
  title: string;
  category: 'social' | 'profile' | 'website' | 'contact' | 'product' | 'other';
  keywords: string[];
}

export interface Source {
  uri: string;
  title: string;
  [key: string]: any; // Allow other properties from API
}

export interface GroundingChunk {
  web?: Source;
  [key: string]: any; // Allow other grounding types
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  [key: string]: any; // Allow other metadata properties
}
