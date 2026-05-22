import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEmbedding } from '@/lib/huggingface';
import { chunkText } from '@/lib/rag-utils';

// pdf-parse dynamic resolution workaround for Next.js Server Components / Route Handlers
const pdf = require('pdf-parse/lib/pdf-parse.js');

export async function POST(request: Request) {
  try {
    // 1. Retrieve & Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Extract text from PDF
    let pdfText = '';
    try {
      const pdfData = await pdf(buffer);
      pdfText = pdfData.text;
    } catch (parseError: any) {
      console.error('[RAG Upload] PDF parsing failed:', parseError);
      return NextResponse.json({ error: 'Failed to parse PDF document.' }, { status: 400 });
    }

    if (!pdfText.trim()) {
      return NextResponse.json({ error: 'The PDF document contains no readable text.' }, { status: 400 });
    }

    // 4. Generate Semantic Chunks
    const chunks = chunkText(pdfText);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Failed to split text into chunks.' }, { status: 400 });
    }

    // 5. Generate embeddings using Hugging Face in batches to handle rate limits gracefully
    const BATCH_SIZE = 5;
    const embeddings: number[][] = [];
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      try {
        const batchEmbeddings = await Promise.all(
          batch.map(chunk => getEmbedding(chunk))
        );
        embeddings.push(...batchEmbeddings);
      } catch (embError: any) {
        console.error(`[RAG Upload] Failed to generate embeddings for batch starting at index ${i}:`, embError);
        return NextResponse.json({ 
          error: `Failed to generate embeddings: ${embError.message || 'Hugging Face API error'}` 
        }, { status: 502 });
      }
    }

    // 6. Insert parent document into resumes table
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        filename: file.name,
        extracted_text: pdfText,
      })
      .select('id')
      .single();

    if (resumeError || !resume) {
      console.error('[RAG Upload] Failed to insert parent resume record:', resumeError);
      return NextResponse.json({ error: 'Failed to store resume record.' }, { status: 500 });
    }

    // 7. Insert all chunks and their vectors into document_chunks table
    const chunksToInsert = chunks.map((chunk, index) => ({
      resume_id: resume.id,
      user_id: user.id,
      content: chunk,
      embedding: embeddings[index],
      metadata: {
        index,
        filename: file.name,
        chunkSize: chunk.length,
      },
    }));

    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunksToInsert);

    if (chunksError) {
      console.error('[RAG Upload] Failed to insert document chunks:', chunksError);
      // Clean up the parent resume row to maintain DB integrity
      await supabase.from('resumes').delete().eq('id', resume.id);
      return NextResponse.json({ error: 'Failed to index document chunks.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      chunksCount: chunks.length,
      filename: file.name,
    });
  } catch (error: any) {
    console.error('[RAG Upload Error]:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
