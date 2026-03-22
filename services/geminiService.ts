
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialProfile, HealthScore, Recommendation, RoadmapItem } from "../types";

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
  async analyzeProfile(profile: FinancialProfile, score: HealthScore): Promise<{ recommendations: Recommendation[], roadmap: RoadmapItem[], summary: string }> {
    const ai = getGeminiAdvisor();
    const prompt = `
      Analyze this user profile and health score:
      Profile: ${JSON.stringify(profile)}
      Calculated Health Score: ${JSON.stringify(score)}
      
      Tasks:
      1. Generate exactly 4 actionable recommendations.
      2. Generate a 4-quarter Strategic Roadmap (Q1 to Q4).
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
              },
              roadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    quarter: { type: Type.STRING },
                    objective: { type: Type.STRING },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    expectedImpact: { type: Type.STRING }
                  },
                  required: ["quarter", "objective", "actions", "expectedImpact"]
                }
              }
            },
            required: ["summary", "recommendations", "roadmap"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return {
        summary: result.summary,
        roadmap: result.roadmap || [],
        recommendations: result.recommendations.map((r: any, idx: number) => ({
          ...r,
          id: `rec-${Date.now()}-${idx}`,
          status: 'pending'
        }))
      };
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return { recommendations: [], roadmap: [], summary: "Unable to generate analysis at this time." };
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
  },

  async processOnboardingMessage(message: string, currentProfile: Partial<FinancialProfile>, history: any[]): Promise<{ updatedProfile: Partial<FinancialProfile>, nextMessage: string, isComplete: boolean }> {
    const ai = getGeminiAdvisor();
    
    const prompt = `
      You are an AI Financial Advisor conducting an onboarding interview.
      User Answer: "${message}"
      Current Profile Data: ${JSON.stringify(currentProfile)}
      
      Your goal is to fill the following fields: 
      age, country, dependents, monthlyIncome, employmentType, jobStability, 
      fixedExpenses, variableExpenses, currentSavings, totalDebt, avgInterestRate, 
      riskAppetite, investmentKnowledge, primaryGoal, timeHorizon.
      
      Rules:
      1. Parse the user's answer and update the Profile Data.
      2. If a field is missing, ask for it in the nextMessage.
      3. Be conversational and professional.
      4. If all fields are filled, set isComplete to true and provide a concluding message.
      5. valid values for enums:
         employmentType: 'Student', 'Salaried', 'Self-employed', 'Freelancer'
         jobStability: 'Low', 'Medium', 'High'
         riskAppetite: 'Conservative', 'Moderate', 'Aggressive'
         investmentKnowledge: 'Beginner', 'Intermediate', 'Expert'
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              updatedProfile: { 
                type: Type.OBJECT,
                properties: {
                  age: { type: Type.NUMBER },
                  country: { type: Type.STRING },
                  dependents: { type: Type.NUMBER },
                  monthlyIncome: { type: Type.NUMBER },
                  employmentType: { type: Type.STRING },
                  jobStability: { type: Type.STRING },
                  fixedExpenses: { type: Type.NUMBER },
                  variableExpenses: { type: Type.NUMBER },
                  currentSavings: { type: Type.NUMBER },
                  totalDebt: { type: Type.NUMBER },
                  avgInterestRate: { type: Type.NUMBER },
                  riskAppetite: { type: Type.STRING },
                  investmentKnowledge: { type: Type.STRING },
                  primaryGoal: { type: Type.STRING },
                  timeHorizon: { type: Type.NUMBER }
                }
              },
              nextMessage: { type: Type.STRING },
              isComplete: { type: Type.BOOLEAN }
            },
            required: ["updatedProfile", "nextMessage", "isComplete"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Onboarding Parse Error:", error);
      return { 
        updatedProfile: currentProfile, 
        nextMessage: "I'm sorry, I had trouble processing that. Could you tell me more about your financial situation?", 
        isComplete: false 
      };
    }
  }
};
