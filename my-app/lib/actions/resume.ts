"use server";

import { createClient } from "@/lib/supabase/server";
const pdf = require("pdf-parse/lib/pdf-parse.js");
import { generateText, embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeResume(extractedText: string) {
    const { text: analysisJson } = await generateText({
        model: openai("openai/gpt-4o-mini"),
        system: `You are a warm, professional Career Mentor with 20 years of experience in specialized recruiting. 
        Your goal is to provide a thoughtful, human-like review of a candidate's resume.
        
        CRITERIA FOR MENTORSHIP RATING (0-100):
        - Impact: Does the candidate show the 'value' they brought, not just tasks?
        - Clarity: Is the story of their career easy to follow?
        - Action: Do they use engaging, professional language?
        - Relevance: Do they have the right keywords for their target industry?
        
        YOUR REVIEW SECTIONS:
        1. SCORE: An honest, encouraging rating out of 100.
        2. RECOMMENDATIONS: Actionable, friendly advice on what to change.
        3. STRENGTHS: Highlights of what they've done exceptionally well.
        4. MISSING: Gentle notes on what's currently missing.
        5. ATS TIPS: Practical "insider" tips for modern application systems.
        
        Return the response as a valid JSON object with: 
        { "score": number, 
          "breakdown": { "impact": number, "clarity": number, "verbs": number, "keywords": number },
          "recommendations": string[], "strengths": string[], 
          "missing_info": string[], "ats_tips": string[] }`,
        prompt: `Resume Text:\n${extractedText}`,
    });

    try {
        const jsonMatch = analysisJson.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(analysisJson);
    } catch (e) {
        console.error("Failed to parse analysis JSON:", e);
        return {
            score: 0,
            breakdown: { impact: 0, clarity: 0, verbs: 0, keywords: 0 },
            recommendations: ["Failed to analyze resume. Please try again."],
            strengths: [],
            missing_info: [],
            ats_tips: []
        };
    }
}

export async function uploadResume(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const file = formData.get("resume") as File;
    if (!file) throw new Error("No file uploaded");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Extract text from PDF using pdf-parse v1.1.1
    const data = await pdf(buffer);
    const extractedText = data.text;

    // 2. Generate structured data using Gemini
    const { text: structuredJson } = await generateText({
        model: openai("openai/gpt-4o-mini"),
        system: "You are a professional resume parser. Extract the following information into a clean JSON structure: name, contact (email, phone, linkedin), summary, experience (array of objects with company, role, duration, description), skills (array), and education (array). Only return the JSON block.",
        prompt: `Resume Text:\n${extractedText}`,
    });

    let structuredData = {};
    try {
        const jsonMatch = structuredJson.match(/\{[\s\S]*\}/);
        structuredData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(structuredJson);
    } catch (e) {
        console.error("Failed to parse structured JSON:", e);
    }

    // 3. New: Generate detailed analysis
    const analysis = await analyzeResume(extractedText);

    // 4. Store resume record
    const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .insert({
            user_id: user.id,
            filename: file.name,
            extracted_text: extractedText,
            structured_data: structuredData,
            analysis: analysis // Make sure to add this column to your DB
        })
        .select()
        .single();

    if (resumeError) throw resumeError;

    // 4. Chunk text for RAG
    const chunks = chunkText(extractedText, 1000); // 1000 chars roughly

    // 5. Generate embeddings for chunks using OpenAI (via OpenRouter)
    // We use gpt-4o-mini embeddings or text-embedding-3-small and slice to 384 to fit the DB
    const { embeddings } = await embedMany({
        model: openai.embedding("openai/text-embedding-3-small"),
        values: chunks,
    });

    const finalEmbeddings = embeddings.map(e => e.slice(0, 768));

    // 6. Store chunks in DB
    const chunkInserts = chunks.map((content, i) => ({
        resume_id: resume.id,
        user_id: user.id,
        content: content,
        embedding: finalEmbeddings[i],
        metadata: { index: i, chunk_size: content.length }
    }));

    const { error: chunkError } = await supabase
        .from("document_chunks")
        .insert(chunkInserts);

    if (chunkError) throw chunkError;

    return { success: true, resumeId: resume.id };
}

function chunkText(text: string, size: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]\s+/);
    let currentChunk = "";

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > size && currentChunk !== "") {
            chunks.push(currentChunk.trim());
            currentChunk = "";
        }
        currentChunk += sentence + ". ";
    }

    if (currentChunk !== "") {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

export async function searchResumeContext(query: string, limit = 3) {
    const supabase = await createClient();

    // Generate embedding for query and slice to 384
    const { embedding } = await embed({
        model: openai.embedding("openai/text-embedding-3-small"),
        value: query,
    });

    const finalEmbedding = embedding.slice(0, 768);

    // RPC call to match_documents
    const { data: documents, error } = await supabase.rpc("match_documents", {
        query_embedding: finalEmbedding,
        match_threshold: 0.5,
        match_count: limit
    });

    if (error) {
        console.error("Search error:", error);
        return [];
    }

    return documents;
}

export async function getLatestResume() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) return null;
    return data;
}

/**
 * RAG Chain Implementation (Equivalent to LangChain's RetrievalQA)
 * This function retrieves relevant resume chunks and uses an LLM (Gemini)
 * to answer questions specifically about the candidate's profile.
 */
export async function queryResume(question: string) {
    // 1. "Retrieve" - Get relevant chunks from vector store (Supabase)
    const contextDocs = await searchResumeContext(question, 5);

    if (!contextDocs || contextDocs.length === 0) {
        return "I couldn't find any relevant information in your resume to answer that.";
    }

    const contextText = contextDocs.map((doc: any) => doc.content).join("\n\n");

    // 2. "Augment & Generate" - Send to LLM with the context
    const { text } = await generateText({
        model: openai("openai/gpt-4o-mini"),
        system: `You are an AI assistant helping an interviewer or candidate. 
        Use the following extracted resume fragments to answer the user's question accurately.
        If the information is not in the fragments, say you don't know based on the resume.
        
        RESUME CONTEXT:
        ${contextText}`,
        prompt: question,
    });

    return text;
}

/**
 * Provides a high-level summary of the resume using RAG.
 */
export async function summarizeResume() {
    return queryResume("Provide a professional executive summary of this candidate's career, key skills, and strongest experience areas.");
}
