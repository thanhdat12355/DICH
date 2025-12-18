
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult, TranslationDirection } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-pro-preview';

export const translateAndSearch = async (text: string, direction: TranslationDirection): Promise<TranslationResult> => {
  try {
    const isViToDe = direction === 'vi-de';
    const sourceLang = isViToDe ? "Vietnamese" : "German";
    const targetLang = isViToDe ? "German" : "Vietnamese";

    const prompt = `
      You are a Vietnamese-German language and culture expert.
      
      TASK 1: Translate this text from ${sourceLang} to ${targetLang}: "${text}"
      
      TASK 2: Provide a brief "Linguistic & Cultural Note" in Vietnamese. 
      This should cover grammar, interesting idioms, cultural context, or usage nuances related to the translated text.
      
      TASK 3: Provide EXACTLY 10 related German words/phrases.
      - RULE: All German nouns MUST include their article (der/die/das). 
      - Provide the Vietnamese meaning for each.
      - Format as a list of 10 items.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Linguistic and cultural notes" },
            relatedTerms: {
              type: Type.ARRAY,
              minItems: 10,
              maxItems: 10,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "German word WITH article" },
                  meaning: { type: Type.STRING, description: "Vietnamese meaning" }
                },
                required: ["term", "meaning"]
              }
            }
          },
          required: ["translatedText", "relatedTerms", "explanation"],
        },
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      translatedText: data.translatedText,
      explanation: data.explanation,
      relatedTerms: data.relatedTerms
    };
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};
