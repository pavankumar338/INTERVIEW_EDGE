"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCodingChallenge(role: string, industry: string, company: string) {
    const prompt = `You are a Technical Lead at ${company}. Generate one coding problem appropriate for a ${role} interview.
Output strictly a JSON object with the following structure:
{
  "title": "string",
  "difficulty": "Easy|Medium|Hard",
  "description": "markdown string explaining the problem",
  "examples": [
    { "input": "string", "output": "string", "explanation": "string" }
  ],
  "startingCode": "string (JavaScript boilerplate)",
  "testCases": [
    { "input": "any valid JS array of args format as string, e.g., '[1,2,3], 2'", "expected": "any valid JSON string" }
  ]
}

No markdown tags like \`\`\`json, just output the raw JSON object. Make sure the output is valid JSON.`;

    try {
        const { text } = await generateText({
            model: openai("openai/gpt-4o-mini"),
            system: "You are an expert technical interviewer.",
            prompt,
        });

        let cleanText = text.trim();
        if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
        if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
        if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);

        const challenge = JSON.parse(cleanText.trim());
        return challenge;
    } catch (e) {
        console.error("Failed to generate challenge:", e);
        return {
            title: "FizzBuzz",
            difficulty: "Easy",
            description: "Write a function that returns an array from 1 to n. For multiples of 3, return 'Fizz'. For 5 return 'Buzz'. For both return 'FizzBuzz'.",
            examples: [{ input: "n = 5", output: "[1, 2, 'Fizz', 4, 'Buzz']", explanation: "Basic example." }],
            startingCode: "function fizzBuzz(n) {\n  \n}",
            testCases: []
        };
    }
}
