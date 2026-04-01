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

    // Check if there are any user messages at all
    const userMessages = finalHistory.filter(m => m.role === "user");
    const totalUserChars = userMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0);

    // If no user messages or extremely short (e.g., just "hi"), don't even ask the AI
    if (userMessages.length === 0 || totalUserChars < 10) {
        const evaluation = {
            score: 0,
            feedback: { 
                clarity: "No response recorded", 
                structure: "No response recorded", 
                relevance: "No response recorded", 
                correctness: "No response recorded" 
            },
            qa_analysis: [],
            weak_areas: ["Communication", "Engagement"],
            recommendations: ["Please participate in the interview by answering the questions provided.", "Ensure your microphone is working correctly."],
            summary: "The candidate did not provide any meaningful responses during the session."
        };
        
        await supabase
            .from("interview_sessions")
            .update({
                status: "completed",
                chat_history: [...finalHistory, { role: "assistant", content: "The session has ended. Since no responses were recorded, a score of 0 has been assigned." }],
                score: 0,
                feedback: evaluation
            })
            .eq("id", sessionId);
            
        return { type: "feedback", content: evaluation, sessionId };
    }

    const result = await generateText({
        model: openai("openai/gpt-4o-mini"),
        system: `You are a strict and honest interview coach. Analyze the transcript for a ${session?.role || 'Candidate'}.
        
        CRITICAL SCORING RULES:
        1. If the candidate remains silent, gives one-word non-answers, or fails to address the technical questions, you MUST give a score of 0.
        2. Be honest. Do not give 'participation points'. 
        3. If the candidate provides no technical value, the score should not exceed 10.
        
        Provide a constructive evaluation in strict JSON format. 
        
        Required JSON structure:
        {
          "score": number (0-100),
          "feedback": { "clarity": "string", "structure": "string", "relevance": "string", "correctness": "string" },
          "qa_analysis": [{ "question": "string", "answer": "string", "feedback": "string", "improvement": "string" }],
          "weak_areas": ["string"],
          "recommendations": ["string"],
          "summary": "string"
        }
        
        Output only the JSON block.`,
        prompt: `Here is the interview transcript to analyze:\n\n${finalHistory.map(m => `${m.role || "unknown"}: ${m.content || ""}`).join('\n')}`,
    });

    let evaluation;
    try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result.text);

        evaluation = {
            score: typeof parsed.score === 'number' ? parsed.score : 0,
            feedback: parsed.feedback || {
                clarity: "Manual review required",
                structure: "Manual review required",
                relevance: "Manual review required",
                correctness: "Manual review required"
            },
            qa_analysis: parsed.qa_analysis || [],
            weak_areas: parsed.weak_areas || [],
            recommendations: parsed.recommendations || [],
            summary: parsed.summary || "Evaluation completed."
        };
    } catch (e) {
        console.error("Critical: Failed to parse AI evaluation. Using fallback.", e);
        evaluation = {
            score: 0,
            feedback: { clarity: "Analysis error", structure: "Analysis error", relevance: "Analysis error", correctness: "Analysis error" },
            qa_analysis: [],
            weak_areas: ["System Error"],
            recommendations: ["Contact support or retry the session"],
            summary: "The AI was unable to generate a structured report. A safety score of 0 was assigned."
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

export async function saveQuizScore(role: string, company: string, score: number, weakAreas: string[] = [], recommendations: string[] = []) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const summary = score >= 80 ? `Excellent performance on the technical assessment for ${company}.` : `Performance on the technical assessment for ${company} indicates areas for improvement.`;

    const { error } = await supabase
        .from("interview_sessions")
        .insert({
            user_id: user.id,
            role: role,
            industry: company,
            status: "completed",
            score: score,
            chat_history: [{ role: "assistant", content: `You completed a technical assessment scoring ${score}%.` }],
            feedback: {
                feedback: {
                    clarity: "N/A (Quiz)",
                    structure: "N/A (Quiz)",
                    relevance: "N/A (Quiz)",
                    correctness: `${score}% accuracy`
                },
                weak_areas: weakAreas.length > 0 ? weakAreas : ["General Performance"],
                recommendations: recommendations.length > 0 ? recommendations : ["Review incorrect answers in the assessment room."],
                summary: summary
            }
        });

    if (error) {
        console.error("Database Save Error:", error);
        throw error;
    }
    return true;
}
