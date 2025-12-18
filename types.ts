
export interface GroundingWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingWeb;
}

export interface RelatedTerm {
  term: string;          // The German word (e.g., "Krabben")
  meaning: string;       // Brief meaning (e.g., "North Sea shrimp")
  partOfSpeech: string;  // Part of speech (e.g., "Danh từ", "Động từ")
}

export interface TranslationResult {
  translatedText: string;
  mainPartOfSpeech?: string; // Part of speech of the main translation
  explanation?: string; 
  relatedTerms?: RelatedTerm[]; // List of related terms found in explanation
  groundingChunks?: GroundingChunk[];
}

export type TranslationDirection = 'vi-de' | 'de-vi';

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
