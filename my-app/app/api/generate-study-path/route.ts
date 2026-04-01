import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { role, topics, days, experience } = await request.json();

    if (!role || !topics || !days) {
      return NextResponse.json(
        { error: "Role, topics, and days are required" },
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

    // Fetch resources using SerpApi
    const serpApiKey = process.env.SERP_API_KEY;
    let searchContext = "";
    if (serpApiKey) {
      try {
        const query = encodeURIComponent(`best resources to learn ${topics} for ${role} role`);
        const serpResponse = await fetch(`https://serpapi.com/search.json?q=${query}&api_key=${serpApiKey}`);
        const serpData = await serpResponse.json();

        const snippets = [];
        if (serpData.organic_results && Array.isArray(serpData.organic_results)) {
          snippets.push(...serpData.organic_results.slice(0, 8).map((r: any) => `Source: ${r.title}\nURL: ${r.link}\nSummary: ${r.snippet}`));
        }

        if (snippets.length > 0) {
          searchContext = "\n\n=== VERIFIED LEARNING RESOURCES ===\n" + snippets.join("\n---\n") + "\n==================================\n";
        }
      } catch (e) {
        console.error("Failed to fetch from SERP API", e);
      }
    }

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        totalDays: { type: SchemaType.NUMBER },
        modules: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              day: { type: SchemaType.NUMBER },
              title: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              tasks: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              },
              resources: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    url: { type: SchemaType.STRING },
                    type: { type: SchemaType.STRING }
                  },
                  required: ["name", "url"]
                }
              }
            },
            required: ["day", "title", "description", "tasks", "resources"]
          }
        }
      },
      required: ["title", "description", "totalDays", "modules"]
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const prompt = `You are an expert career mentor and learning architect. 
Create a comprehensive, intensive ${days}-day study path for a candidate aiming for a ${role} role, focusing on these topics: ${topics}.

CRITICAL INSTRUCTION: The candidate is starting from the ABSOLUTE BASICS (Level 0). 
The plan MUST progress from Beginner fundamentals to Advanced technical mastery. 

${searchContext}

INSTRUCTIONS:
1. Divide the plan into exactly ${days} daily modules.
2. The early days SHOULD focus on fundamental concepts, set-up, and core vocabulary.
3. Middle days should transition into practical implementation and projects.
4. Final days should cover advanced optimization, system design, and complex interview-style problems.
5. For each day, provide a clear theme, deep-dive tasks, and high-quality resources.
6. Incorporate the URLs provided in the "VERIFIED LEARNING RESOURCES" section where relevant.
7. Add specific "Interview Tips" within the daily tasks.
8. The tone should be motivating, supportive, and professional.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json(JSON.parse(responseText));

  } catch (error: any) {
    console.error("Error generating study path:", error);
    return NextResponse.json(
      { error: `API Error: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
