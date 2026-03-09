
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialProfile, HealthScore, Recommendation } from "../types";

// Fix: Updated initialization to strictly use process.env.API_KEY directly as per SDK requirements
export const getGeminiAdvisor = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const ADVISOR_SYSTEM_INSTRUCTION = `
You are a Senior AI Financial Advisor. Your goal is to provide safe, educational, and personalized financial advice.
Rules:
1. Always prioritize an Emergency Fund (3-6 months expenses) over investing.
2. If total debt is high (>30% of income), prioritize debt payoff strategies.
3. Align advice with the user's risk appetite (Conservative, Moderate, Aggressive).
4. Do not provide specific stock picks or guarantee returns. Use educational language.
5. Be transparent and explain the 'why' behind every recommendation.
6. Maintain a supportive, professional, and slightly empathetic tone.
`;

export const geminiService = {
  async analyzeProfile(profile: FinancialProfile, score: HealthScore): Promise<{ recommendations: Recommendation[], summary: string }> {
    const ai = getGeminiAdvisor();
    const prompt = `
      Analyze this user profile and health score:
      Profile: ${JSON.stringify(profile)}
      Calculated Health Score: ${JSON.stringify(score)}
      
      Generate exactly 4 actionable recommendations.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: ADVISOR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    advice: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    impact: { type: Type.STRING }
                  },
                  required: ["title", "advice", "reason", "priority", "impact"]
                }
              }
            },
            required: ["summary", "recommendations"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return {
        summary: result.summary,
        recommendations: result.recommendations.map((r: any, idx: number) => ({
          ...r,
          id: `rec-${Date.now()}-${idx}`,
          status: 'pending'
        }))
      };
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return { recommendations: [], summary: "Unable to generate analysis at this time." };
    }
  },

  async chat(message: string, profile: FinancialProfile, history: any[]): Promise<string> {
    const ai = getGeminiAdvisor();
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `${ADVISOR_SYSTEM_INSTRUCTION}\nUser Context: ${JSON.stringify(profile)}`
      }
    });

    try {
      const response = await chat.sendMessage({ message });
      return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "There was an error communicating with the AI advisor.";
    }
  }
};
