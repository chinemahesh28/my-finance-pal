import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getAIInsights = async (transactions: any[], totalIncome: number, totalExpenses: number) => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a professional financial advisor. Analyze the following transaction data for this month:
      Total Income: $${totalIncome}
      Total Expenses: $${totalExpenses}
      Savings: $${totalIncome - totalExpenses}
      
      Transactions: ${JSON.stringify(transactions.slice(0, 15))}
      
      Provide 3-4 concise, actionable financial insights or recommendations for the user. 
      Keep each insight under 100 characters. 
      Format as a JSON array of objects with 'title' and 'message' fields. 
      Example: [{"title": "Save More", "message": "You spent 40% on dining. Try to cook more."}, ...]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the markdown response
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error("AI Insights Error:", error);
    return [];
  }
};
