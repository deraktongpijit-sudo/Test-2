import { GoogleGenAI } from "@google/genai";
import { ProcessedStats } from "../types";

export const generateBillingStory = async (stats: ProcessedStats): Promise<string> => {
  try {
    // Accessing the key via process.env.API_KEY as configured in vite.config.ts
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please set VITE_API_KEY in your .env file.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a senior Data Analyst presenting a billing report to executives.
      Analyze the following billing statistics and tell a compelling narrative story about the business performance.
      
      **Data Summary:**
      - Total Revenue: ${stats.totalAmount.toLocaleString()} THB
      - Total Transactions: ${stats.recordCount}
      - Average Transaction Value: ${stats.averageAmount.toFixed(2)} THB
      
      **Trends:**
      ${JSON.stringify(stats.periodTrends)}
      
      **Payment Methods:**
      ${JSON.stringify(stats.paymentTypeDist)}
      
      **Top Customers:**
      ${JSON.stringify(stats.topCustomers)}

      **Instructions:**
      1. Start with an "Executive Summary" highlighting the most important number (Total Revenue) and the overall sentiment.
      2. Analyze the "Monthly Trends". Are we growing? Was there a specific month with a spike or drop? Explain why (hypothetically based on data patterns).
      3. Discuss "Customer Behavior". Who are the top contributors? What is the preferred payment method?
      4. Provide "Strategic Recommendations" based on these findings.
      5. Use Markdown formatting (## Headers, **Bold**, bullet points) to make it readable.
      6. Use professional but engaging business language.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate story.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate insights.");
  }
};