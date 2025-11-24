import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    if (API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: API_KEY });
    } else {
      console.warn("Gemini API Key is missing. Support chat will not function fully.");
    }
  }

  async generateSupportResponse(history: { role: string, text: string }[], userMessage: string): Promise<string> {
    if (!this.ai) return "I'm currently offline, but I'm here with you. Please check your connection or API key.";

    try {
      const systemInstruction = `You are Haven, a trauma-informed, non-judgmental peer support companion. 
      Your goal is to provide a safe, calming, and validating space for someone who might be using substances, recovering, or struggling with mental health.
      
      Guidelines:
      1. Be warm, concise, and gentle.
      2. Do not lecture, judge, or offer unsolicited medical advice.
      3. Focus on harm reduction: safety first, hydration, and emotional grounding.
      4. If the user seems in immediate danger, gently encourage them to use the SOS button or call emergency services, but remain calm.
      5. Keep responses short (under 50 words) to avoid overwhelming the user.
      6. Use soft language.
      `;

      // Construct the conversation history for the context
      // Note: We are using generateContent for a stateless feel or could use chat. 
      // For simplicity in this service, we'll use chat structure if we were persisting, 
      // but here we just pass the prompt with context.
      
      const chat = this.ai.chats.create({
        model: this.modelId,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      
      // Feed history (simplified for MVP)
      // In a real app, we'd map the full history properly
      
      const result: GenerateContentResponse = await chat.sendMessage({
        message: userMessage
      });

      return result.text || "I hear you. I'm here.";

    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm having a little trouble connecting, but you are not alone. Take a deep breath.";
    }
  }
}

export const geminiService = new GeminiService();