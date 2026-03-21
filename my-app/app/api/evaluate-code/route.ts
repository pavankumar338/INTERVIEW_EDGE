import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { problemStatement, code, language } = await request.json();

    if (!problemStatement || !code) {
      return NextResponse.json({ error: "Missing problem statement or code" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        score: { type: SchemaType.NUMBER },
        feedback: { type: SchemaType.STRING },
        timeComplexity: { type: SchemaType.STRING },
        spaceComplexity: { type: SchemaType.STRING }
      },
      required: ["score", "feedback", "timeComplexity", "spaceComplexity"]
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const prompt = `You are an expert technical interviewer evaluating a candidate's code submission for an interview challenge.
    
**Problem Statement:**
${problemStatement}

**Language:** ${language || "javascript"}
**Candidate's Code:**
\`\`\`
${code}
\`\`\`

Evaluate the code based on logic correctness, time/space complexity, and code quality. Do not be overly harsh if there are minor syntax issues, treat it like a whiteboard interview.
Give a score from 0 to 10 (10 being perfect).
Output strictly as JSON in the following format, without any markdown formatting wrappers:
{
  "score": 8,
  "feedback": "Your logic is solid, but you missed an edge case...",
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)"
}`;

    const result = await model.generateContent(prompt);
    let cleanJson = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();

    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }

    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    return NextResponse.json({ error: `API Error: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
