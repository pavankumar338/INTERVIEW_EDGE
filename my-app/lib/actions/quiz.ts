"use server";

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function generateQuizQuestions(role: string, industry: string, company: string, count: number = 5) {
    const prompt = `You are a Senior Technical Recruiter at ${company}. Generate ${count} multiple-choice technical questions tailored for a ${role} position in the ${industry} industry. 
The difficulty should match actual interview standards at ${company}.

Output strictly a JSON array of objects with the following structure:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": 0, // index of the correct option (0-3)
    "explanation": "string explaining why"
  }
]

Do not include markdown tags like \`\`\`json, just output the raw JSON array. Make sure the output is valid JSON.`;

    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            system: "You are an expert technical interviewer.",
            prompt,
        });

        // Strip backticks if any
        let cleanText = text.trim();
        if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
        if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
        if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);

        const questions = JSON.parse(cleanText.trim());
        return questions;
    } catch (e) {
        console.error("Failed to generate quiz:", e);
        return [
            {
                question: "What is an important soft skill for an interview?",
                options: ["Sleeping", "Communication", "Yelling", "Ignoring"],
                correctAnswer: 1,
                explanation: "Communication is key in any professional environment."
            }
        ];
    }
}
