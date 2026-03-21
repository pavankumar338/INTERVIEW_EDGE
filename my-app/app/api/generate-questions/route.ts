import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { company, role, experience } = await request.json();

    if (!company || !role || !experience) {
      return NextResponse.json(
        { error: "Company, role, and experience are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Generative AI API key is not configured." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert technical interviewer and career coach. Please generate a customized multi-round technical interview assessment for a ${role} position at ${company} for a candidate with ${experience} of experience.

CRITICAL INSTRUCTIONS:
1. The rounds MUST be specifically themed around topics that ${company} heavily focuses on for a ${role} (e.g., Data Structures (DSA), Database Management (DBMS), Object Oriented Programming (OOPS), System Design, or Core CS subjects).
2. Generate 2 or 3 "multiple_choice" rounds. Each round should have exactly 3 highly relevant questions.
3. Generate exactly 1 "coding" round at the end, containing a single problem statement typically asked by ${company}.

Output strictly as JSON in the following format, without any markdown formatting wrappers:
{
  "rounds": [
    {
      "roundName": "Data Structures & Algorithms",
      "roundType": "multiple_choice",
      "questions": [
        {
          "question": "What is the time complexity of...",
          "options": ["O(1)", "O(N)", "O(N log N)", "O(N^2)"],
          "correctAnswer": "O(N log N)",
          "explanation": "Because..."
        }
      ]
    },
    {
      "roundName": "Coding Challenge",
      "roundType": "coding",
      "problemStatement": "Write a function to...",
      "starterCode": "function solve() {\\n  // write your code here\\n}",
      "language": "javascript"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try parsing the text as JSON, usually it's plain JSON but might have markdown
    let parsedData;
    try {
      // Strip markdown code blocks if the model includes them despite instructions
      let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

      // Extract just the JSON object part ignoring leading/trailing text
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }

      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", responseText);
      return NextResponse.json(
        { error: "Failed to parse the AI output: " + responseText.substring(0, 100) + "..." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: `API Error: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
