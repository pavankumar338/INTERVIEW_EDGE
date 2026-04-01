import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { company, role, experience, resumeContent } = await request.json();

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

    // Fetch context using SerpApi
    const serpApiKey = process.env.SERP_API_KEY;
    let searchContext = "";
    if (serpApiKey) {
      try {
        const query = encodeURIComponent(`${company} ${role} interview questions`);
        const serpResponse = await fetch(`https://serpapi.com/search.json?q=${query}&api_key=${serpApiKey}`);
        const serpData = await serpResponse.json();

        const snippets = [];
        if (serpData.organic_results && Array.isArray(serpData.organic_results)) {
          snippets.push(...serpData.organic_results.slice(0, 5).map((r: any) => `Title: ${r.title}\nSnippet: ${r.snippet}`));
        }
        if (serpData.related_questions && Array.isArray(serpData.related_questions)) {
          snippets.push(...serpData.related_questions.slice(0, 5).map((q: any) => `Question: ${q.question}\nAnswer Snippet: ${q.snippet}`));
        }

        if (snippets.length > 0) {
          searchContext = "\n\n=== RECENT REAL-WORLD INTERVIEW CONTEXT ===\nHere is recent data gathered from web searches regarding " + company + " " + role + " interview questions:\n\n" + snippets.join("\n---\n") + "\n\nPlease HEAVILY use this gathered context to inspire, ground, and generate the specific questions and coding problems for this assessment instead of just using generic questions. Make sure it stays appropriate for a candidate with " + experience + " of experience.\n===========================================\n";
        }
      } catch (e) {
        console.error("Failed to fetch from SERP API", e);
        // We gracefully continue without context if the search fails.
      }
    }

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        rounds: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              roundName: { type: SchemaType.STRING },
              roundType: { type: SchemaType.STRING },
              questions: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    question: { type: SchemaType.STRING },
                    options: {
                      type: SchemaType.ARRAY,
                      items: { type: SchemaType.STRING }
                    },
                    correctAnswer: { type: SchemaType.STRING },
                    explanation: { type: SchemaType.STRING }
                  },
                  required: ["question", "options", "correctAnswer", "explanation"]
                }
              },
              problems: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    problemStatement: { type: SchemaType.STRING },
                    starterCode: { type: SchemaType.STRING },
                    language: { type: SchemaType.STRING }
                  },
                  required: ["problemStatement", "starterCode", "language"]
                }
              }
            },
            required: ["roundName", "roundType"]
          }
        }
      },
      required: ["rounds"]
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        maxOutputTokens: 20000,
      }
    });

    const resumeContext = resumeContent ? `\n\n=== CANDIDATE RESUME CONTEXT ===\n${resumeContent}\n================================\n` : "";

    const prompt = `You are an expert technical interviewer and career coach. Please generate a customized multi-round technical interview assessment for a ${role} position at ${company} for a candidate with ${experience} of experience.
${searchContext}
${resumeContext}

CRITICAL INSTRUCTIONS - GENERATE EXACTLY 3 ROUNDS WITH THE FOLLOWING STRUCTURE:
1. Round 1: "CS Fundamentals & Core Topics" (roundType: "multiple_choice") containing exactly 10 questions relevant to ${role}.
2. Round 2: "Resume-Based Technical Assessment" (roundType: "multiple_choice") containing exactly 10 questions.
   - If Resume Context is provided: Base these questions on the candidate's specific projects, skills, and work history mentioned in the resume. Focus on "how" and "why" behind their choices.
   - If No Resume Context: Base these on common technical scenarios and industry standards for someone with ${experience} of experience.
3. Round 3: "Algorithmic Challenges (DSA)" (roundType: "coding") containing EXACTLY 3 coding problems. NOTE: Return an array of "problems"!
   - FORMAT: Each coding problem MUST be formatted exactly like a LeetCode problem (Description, Examples, Constraints).
   - DIFFICULTY: Scale the algorithmic difficulty realistically based on the company (${company}) and the candidate's ${experience} of experience.
   - TAILORING: Ensure problems represent the type of logic used at ${company} or in the ${role}.`;

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
    } catch (e: any) {
      console.error("Failed to parse JSON response from Gemini:", responseText);
      console.error("Parse Error:", e.message);
      return NextResponse.json(
        {
          error: "Failed to parse the AI output",
          details: e.message,
          rawOutput: responseText.substring(0, 500)
        },
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
