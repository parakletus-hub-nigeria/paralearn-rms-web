
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedQuestion {
  questionText: string;
  questionType: "MCQ" | "TRUE_FALSE" | "ESSAY" | "MULTI_SELECT";
  options?: { text: string; isCorrect: boolean }[];
  correctAnswer?: string; // For True/False
  marks: number;
  explanation?: string;
}

export const generateQuestions = async (
  apiKey: string,
  prompt: string,
  count: number = 5,
  difficulty: string = "medium"
): Promise<GeneratedQuestion[]> => {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `
    You are an expert teacher's assistant. Generate ${count} ${difficulty} level questions based on the following topic/prompt: "${prompt}".
    
    Return the response ONLY as a valid JSON array of objects. Do not include markdown formatting or backticks.
    
    The JSON structure for each question should be:
    {
      "questionText": "string",
      "questionType": "MCQ" | "TRUE_FALSE" | "ESSAY" | "MULTI_SELECT",
      "marks": number (default 1),
      "options": [ { "text": "string", "isCorrect": boolean } ] (Required for MCQ/MULTI_SELECT),
      "correctAnswer": "string" (Required for TRUE_FALSE, e.g. "True" or "False"),
      "explanation": "string" (Optional explanation)
    }

    For MCQ, ensure exactly one option isCorrect: true.
    For MULTI_SELECT, at least one option must be true.
    For TRUE_FALSE, provide options as [{text: "True", ...}, {text: "False", ...}] AND set correctAnswer field.
  `;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up if markdown code blocks are present
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanedText) as GeneratedQuestion[];
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate questions. Please check your API key and try again.");
  }
};
