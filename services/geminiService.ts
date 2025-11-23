import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || 'test_key'; 
const ai = new GoogleGenAI({ apiKey });

export const generateDailyInsight = async (userName: string): Promise<string> => {
  try {
    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, warm, human-like daily greeting and mental wellness tip for a user named ${userName}. Do not sound like a robot. Keep it under 30 words.`,
    });
    return response.text || "Welcome back. Remember to take a deep breath today.";
  } catch (error) {
    console.error("GenAI Error:", error);
    return `Welcome back, ${userName}. We're here for you.`;
  }
};

export const analyzeSessionMood = async (notes: string): Promise<string> => {
  try {
    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the sentiment of these session notes and return a one-word mood description (e.g., Calm, Anxious, Hopeful): "${notes}"`,
    });
    return response.text?.trim() || "Neutral";
  } catch (error) {
    return "Stable";
  }
};