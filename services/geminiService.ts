
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || 'test_key'; 
const ai = new GoogleGenAI({ apiKey });

// --- LOCAL FALLBACK DATA ---
const LOCAL_AFFIRMATIONS = {
    anxiety: [
        "This feeling is temporary. I am safe right now.",
        "I breathe in peace, I breathe out tension.",
        "I am stronger than my anxious thoughts.",
        "I control my breathing, I control my calm."
    ],
    stress: [
        "I can do anything, but not everything.",
        "Rest is productive. I give myself permission to pause.",
        "One step at a time. One breath at a time.",
        "I release the need to control the outcome."
    ],
    sadness: [
        "It is okay to feel this way. Feelings are visitors.",
        "I treat myself with the kindness I give to others.",
        "This darkness is not my home, just a tunnel.",
        "I am worthy of love and happiness."
    ],
    general: [
        "I am exactly where I need to be.",
        "My potential is limitless.",
        "I choose serenity over chaos.",
        "Today is a fresh start."
    ]
};

export const generateDailyInsight = async (userName: string): Promise<string> => {
  try {
    if (apiKey === 'test_key') throw new Error("Simulation Mode");

    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, warm, human-like daily greeting and mental wellness tip for a user named ${userName}. Do not sound like a robot. Keep it under 30 words.`,
    });
    return response.text || "Welcome back. Remember to take a deep breath today.";
  } catch (error) {
    const backups = [
       `Welcome back, ${userName}. Peace begins with a single breath.`,
       `Hello, ${userName}. You are capable of amazing things today.`,
       `Hi ${userName}. Remember to be kind to yourself today.`,
       `Welcome back, ${userName}. Your calm presence is your power.`
    ];
    return backups[Math.floor(Math.random() * backups.length)];
  }
};

export const analyzeSessionMood = async (notes: string): Promise<string> => {
    // Simple local fallback for mood analysis
    if (apiKey === 'test_key') return "Reflective";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the sentiment: "${notes}". Return one word.`
        });
        return response.text?.trim() || "Neutral";
    } catch {
        return "Stable";
    }
};

// NEW: Text-Based Wisdom Generator (Replaces Image Gen)
export const generateAffirmation = async (struggle: string): Promise<string> => {
    try {
        if (!apiKey || apiKey === 'test_key') throw new Error("Use Local");

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The user is feeling: "${struggle}". Write a short, powerful, soothing affirmation (max 12 words) to help them reframe this thought. Do not use quotes.`
        });
        return response.text?.trim() || "Peace comes from within.";

    } catch (e) {
        console.log("Using Local Affirmation Logic");
        // Simple keyword matching for local fallback
        const lower = struggle.toLowerCase();
        let category = 'general';
        if (lower.includes('anxi') || lower.includes('fear') || lower.includes('scared') || lower.includes('panic')) category = 'anxiety';
        else if (lower.includes('work') || lower.includes('stress') || lower.includes('busy') || lower.includes('overwhelm')) category = 'stress';
        else if (lower.includes('sad') || lower.includes('lonely') || lower.includes('depress') || lower.includes('hurt')) category = 'sadness';

        const list = LOCAL_AFFIRMATIONS[category as keyof typeof LOCAL_AFFIRMATIONS];
        return list[Math.floor(Math.random() * list.length)];
    }
};

// Deprecated but kept for compatibility signature
export const generateWellnessImage = async (prompt: string): Promise<string | null> => {
    return null; 
};
