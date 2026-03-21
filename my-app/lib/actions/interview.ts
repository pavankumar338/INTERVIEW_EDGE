"use server";

import { generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function startInterviewSession(role: string, industry: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("interview_sessions")
        .insert({
            user_id: user.id,
            role,
            industry,
            status: "ongoing",
            chat_history: [
                {
                    role: "assistant",
                    content: `Hello! I'm your AI interviewer for the ${role} position in the ${industry} industry. Are you ready to begin? We'll go through a few questions, and then I'll provide you with detailed feedback.`
                }
            ]
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getNextInterviewQuestion(sessionId: string, userMessage: string) {
    const supabase = await createClient();
    const { data: session, error: fetchError } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

    if (fetchError || !session) throw new Error("Session not found");

    const updatedHistory = [
        ...session.chat_history,
        { role: "user", content: userMessage }
    ];

    // Check if we should end the interview (e.g., after 5 user messages)
    const userMessageCount = updatedHistory.filter((m: any) => m.role === "user").length;

    if (userMessageCount >= 5) {
        return endInterviewSession(sessionId, updatedHistory);
    }

    const { text } = await generateText({
        model: openai("openai/gpt-4o-mini"),
        system: `You are an expert interviewer for a ${session.role} role in the ${session.industry} industry. 
        Your goal is to conduct a professional interview. 
        Ask one question at a time. 
        Focus on technical skills, behavioral questions (STAR method), and industry knowledge.
        Be encouraging but professional.
        Current message count: ${userMessageCount}/5`,
        messages: updatedHistory,
    });

    const newHistory = [...updatedHistory, { role: "assistant", content: text }];

    const { error: updateError } = await supabase
        .from("interview_sessions")
        .update({ chat_history: newHistory })
        .eq("id", sessionId);

    if (updateError) throw updateError;

    return { type: "question", content: text, sessionId };
}

export async function endInterviewSession(sessionId: string, finalHistory: any[]) {
    const supabase = await createClient();

    // Fetch session details for context
    const { data: session } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

    const result = await generateText({
        model: openai("openai/gpt-4o-mini"),
        system: `You are an interview coach. Analyze the following interview transcript for the role of ${session?.role || 'Candidate'}.
        
        Provide a constructive evaluation in strict JSON format. 
        
        Required JSON structure:
        {
          "score": number (0-100),
          "feedback": {
            "clarity": "string",
            "structure": "string",
            "relevance": "string",
            "correctness": "string"
          },
          "qa_analysis": [
            {
              "question": "string",
              "answer": "string",
              "feedback": "string",
              "improvement": "string"
            }
          ],
          "weak_areas": ["string"],
          "recommendations": ["string"],
          "summary": "string"
        }
        
        Output only the JSON block.`,
        prompt: `Here is the interview transcript to analyze:\n\n${finalHistory.map(m => `${m.role || "unknown"}: ${m.content || ""}`).join('\n')}`,
    });

    let evaluation;
    try {
        console.log("Analyzing transcript history length:", finalHistory.length);

        // Find the JSON block in the AI response
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result.text);

        // Ensure core fields exist with defaults
        evaluation = {
            score: typeof parsed.score === 'number' ? parsed.score : 70,
            feedback: parsed.feedback || {
                clarity: "Not evaluated",
                structure: "Not evaluated",
                relevance: "Not evaluated",
                correctness: "Not evaluated"
            },
            qa_analysis: parsed.qa_analysis || [],
            weak_areas: parsed.weak_areas || [],
            recommendations: parsed.recommendations || [],
            summary: parsed.summary || "Evaluation completed."
        };
    } catch (e) {
        console.error("Critical: Failed to parse AI evaluation. Using fallback.", e);
        console.log("Raw AI Response:", result.text);
        evaluation = {
            score: 65,
            feedback: { clarity: "Analysis error", structure: "Analysis error", relevance: "Analysis error", correctness: "Analysis error" },
            qa_analysis: [],
            weak_areas: ["Communication"],
            recommendations: ["Review transcript manually"],
            summary: "The AI was unable to generate a structured report. Your session was saved."
        };
    }

    const { error: updateError } = await supabase
        .from("interview_sessions")
        .update({
            status: "completed",
            chat_history: [...finalHistory, { role: "assistant", content: "I've analyzed your performance. You can now view your detailed report in the history section." }],
            score: evaluation.score,
            feedback: evaluation
        })
        .eq("id", sessionId);

    if (updateError) {
        console.error("Database Update Error:", updateError);
        throw updateError;
    }

    return { type: "feedback", content: evaluation, sessionId };
}

export async function getSessionHistory() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

export async function saveQuizScore(role: string, industry: string, score: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const summary = score >= 80 ? "Excellent performance on the AI-generated quiz." : "Review required areas based on the AI-generated quiz.";

    const { error } = await supabase
        .from("interview_sessions")
        .insert({
            user_id: user.id,
            role: role + " (Quiz)",
            industry: industry,
            status: "completed",
            score: score,
            chat_history: [{ role: "assistant", content: `You completed a multiple choice quiz scoring ${score}%.` }],
            feedback: {
                clarity: "N/A",
                structure: "N/A",
                relevance: "N/A",
                correctness: `${score}% accuracy`,
                weak_areas: [],
                recommendations: [],
                summary: summary
            }
        });

    if (error) throw error;
    return true;
}
