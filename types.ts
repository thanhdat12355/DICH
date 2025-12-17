export interface GroundingWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingWeb;
}

export interface RelatedTerm {
  term: string;     // The German word (e.g., "Krabben")
  meaning: string;  // Brief meaning (e.g., "North Sea shrimp")
}

export interface TranslationResult {
  translatedText: string;
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