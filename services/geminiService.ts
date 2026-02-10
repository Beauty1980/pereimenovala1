
import { GoogleGenAI, Type } from "@google/genai";
import { ParsingResult, UserSettings, Transaction } from "../types";
import { getLocalDate, BASE_CATEGORIES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const geminiService = {
  parseInput: async (text: string, currentCategories: string[]): Promise<ParsingResult[]> => {
    const today = getLocalDate();
    const prompt = `
      You are a financial parser. Extract transaction information from the user's text.
      Current Date: ${today}.
      Categories: ${currentCategories.join(", ")}.

      Rules for Classification (CRITICAL):
      - DEFAULT TO 'expense' for any items, products, services, or mentions of buying something (e.g., "игрушка", "сыр", "такси", "бензин").
      - Set type to 'income' ONLY if the text explicitly describes receiving money (e.g., "зарплата", "перевод мне", "бонус", "доход").
      - If user says 'yesterday', calculate the correct date relative to ${today}.
      - Extract amount, category, and a brief description strictly in Russian.
      - For multi-item inputs like 'такси 2500 и молоко 900', return an array of objects.
      - 'needs_clarification' should be true if critical info (amount/category) is ambiguous.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: {
          systemInstruction: prompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                type: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                needs_clarification: { type: Type.BOOLEAN },
                clarification_reason: { type: Type.STRING }
              },
              required: ["date", "type", "amount", "category", "description", "confidence", "needs_clarification"]
            }
          }
        }
      });

      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("AI Parsing failed", e);
      return [];
    }
  },

  generateFeedback: async (
    stats: { 
      spentToday: number, 
      dailyLimit: number, 
      remainingBudget: number, 
      daysLeft: number,
      categoryOverLimit: boolean,
      isRedZone: boolean 
    }, 
    settings: UserSettings
  ): Promise<string> => {
    const prompt = `
      You are a financial controller named 'Agent'. 
      Your response must be entirely in Russian.
      Tone: ${stats.isRedZone ? 'Strict/Direct' : 'Soft/Neutral'}.
      Currency: ${settings.currency}.
      
      Status:
      - Today spent: ${stats.spentToday}
      - Safe daily limit: ${stats.dailyLimit}
      - Remaining monthly budget: ${stats.remainingBudget}
      - Days left: ${stats.daysLeft}
      - Category exceeded: ${stats.categoryOverLimit}
      - Red Zone: ${stats.isRedZone}

      Task: Write 1-2 short sentences of feedback in Russian.
      - Focus on facts and projections (will budget last?).
      - Provide 1 actionable recommendation.
      - NO shaming, NO insults.
      - Praise ONLY if spending is well below safe limit.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Сгенерируй финансовый отзыв на основе текущего статуса на русском языке.",
        config: {
          systemInstruction: prompt,
        }
      });
      return response.text || "Данные успешно записаны.";
    } catch (e) {
      return "Операция записана. Следите за лимитами.";
    }
  }
};
