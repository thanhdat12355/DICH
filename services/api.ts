import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult, TranslationDirection } from "../types";

// Initialize Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Gemini 3 Pro Preview as requested for higher quality (despite slower speed)
const MODEL_NAME = 'gemini-3-pro-preview';

// Helper function: Retry logic
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed. Retrying...`, error);
      
      // Don't wait on the last attempt
      if (attempt < retries - 1) {
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Helper function: Handle Translation
const fetchTranslation = async (text: string, direction: TranslationDirection): Promise<TranslationResult> => {
  // Wrap the API call in the retry logic
  return withRetry(async () => {
    try {
      const isViToDe = direction === 'vi-de';
      const sourceLang = isViToDe ? "Vietnamese" : "German";
      const targetLang = isViToDe ? "German" : "Vietnamese";

      // Define the prompt with specific instructions for cultural nuances and related terms
      const prompt = `
        You are an expert Vietnamese-German translator with deep knowledge of German culture, regional dialects, and visual context.

        Task 1: Translate the following ${sourceLang} text into natural, accurate ${targetLang}.
        
        Task 2: Provide a "explanation" (Cultural/Linguistic Note) IN VIETNAMESE.
        - Explain regional differences, synonyms, or specific nuances of the GERMAN words used (e.g., Brötchen vs Semmel, Krabben vs Garnelen).
        - **CRITICAL**: The explanation must be written in **Vietnamese**. Only keep the specific German terms in their original language.
        - Keep it concise, helpful, and culturally relevant for a Vietnamese learner.
        
        Task 3: Extract "relatedTerms".
        - **STRICT REQUIREMENT**: You MUST extract **EVERY SINGLE** German noun, phrase, or keyword mentioned in your "explanation" above into this list.
        - **COUNT CHECK**: If you discuss 5 German terms in the explanation, there MUST be exactly 5 items in this list. Do not omit any terms.
        - **NOUNS MUST HAVE ARTICLES**: For every German noun in this list, you MUST include its definite article (der, die, das). E.g., write "das Haus" not "Haus", "die Kinder" not "Kinder".
        - For each term, provide the German word (key 'term') and a very short meaning in **Vietnamese** (key 'meaning').
        
        Input Text: "${text}"
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              explanation: { 
                type: Type.STRING, 
                description: "Cultural or linguistic note in Vietnamese." 
              },
              relatedTerms: {
                type: Type.ARRAY,
                description: "EXHAUSTIVE list of ALL German terms mentioned in the explanation.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING, description: "The German word (MUST include 'der', 'die', or 'das' if it is a noun)" },
                    meaning: { type: Type.STRING, description: "Short meaning/context in Vietnamese" }
                  }
                }
              }
            },
            required: ["translatedText"],
          },
        }
      });

      const jsonText = response.text?.trim();
      if (!jsonText) throw new Error("Empty response from AI");
      
      const data = JSON.parse(jsonText);
      
      return {
        translatedText: data.translatedText,
        explanation: data.explanation || undefined,
        relatedTerms: data.relatedTerms || []
      };

    } catch (error) {
      console.error("Gemini API Request Error:", error);
      throw error; // Re-throw to trigger retry
    }
  });
};

export const translateAndSearch = async (text: string, direction: TranslationDirection): Promise<TranslationResult> => {
  return await fetchTranslation(text, direction);
};