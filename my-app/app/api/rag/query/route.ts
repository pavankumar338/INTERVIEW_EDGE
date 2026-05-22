import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEmbedding } from '@/lib/huggingface';

export async function POST(request: Request) {
  try {
    // 1. Retrieve & Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse query parameters from request body
    const body = await request.json();
    const { query, limit = 5, matchThreshold = 0.3 } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 });
    }

    // 3. Generate query vector embedding using Hugging Face (all-MiniLM-L6-v2, 384 dim)
    let queryEmbedding: number[];
    try {
      queryEmbedding = await getEmbedding(query);
    } catch (embeddingError: any) {
      console.error('[RAG Query] Embedding generation failed:', embeddingError);
      return NextResponse.json({ 
        error: `Failed to generate embedding for search query: ${embeddingError.message || 'Hugging Face API error'}` 
      }, { status: 502 });
    }

    // 4. Query the database using match_documents RPC
    const { data: matchedChunks, error: rpcError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: limit,
    });

    if (rpcError) {
      console.error('[RAG Query] match_documents RPC failed:', rpcError);
      return NextResponse.json({ error: 'Failed to execute semantic search in database.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      query,
      results: matchedChunks || [],
    });
  } catch (error: any) {
    console.error('[RAG Query Error]:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
