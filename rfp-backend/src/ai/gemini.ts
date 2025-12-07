import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY missing in .env");
}

export const genAI = new GoogleGenerativeAI(apiKey!);

export const getModel = () => {
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  return genAI.getGenerativeModel({ model: modelName });
};
