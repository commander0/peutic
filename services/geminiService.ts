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

export const generateWellnessImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a soothing, therapeutic, artistic image based on this thought: ${prompt}. Keep the style soft, dreamy, and calming.` }
        ]
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};