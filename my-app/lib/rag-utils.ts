/**
 * RAG Utilities for text chunking and preprocessing.
 */

/**
 * Splits document text into manageable, overlapping semantic chunks.
 * Attempts to split by sentences first to preserve contextual boundaries.
 * 
 * @param text The raw extracted text from a document
 * @param chunkSize Target size of each chunk in characters (default 800)
 * @param chunkOverlap Overlap between consecutive chunks in characters (default 100)
 * @returns Array of text chunks
 */
export function chunkText(text: string, chunkSize = 800, chunkOverlap = 100): string[] {
  if (!text || text.trim() === '') return [];

  // Replace duplicate whitespace and carriage returns to normalize text
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
  
  // Split text into sentences using regex
  const sentences = normalizedText.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [normalizedText];
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    // If a single sentence is larger than chunkSize, we split it by words
    if (trimmedSentence.length > chunkSize) {
      // Flush current chunk first
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      let remaining = trimmedSentence;
      while (remaining.length > 0) {
        if (remaining.length <= chunkSize) {
          currentChunk = remaining;
          break;
        }
        
        // Find a word boundary to split
        let splitIndex = remaining.lastIndexOf(' ', chunkSize);
        if (splitIndex === -1 || splitIndex < chunkSize * 0.5) {
          // If no good boundary, force split at chunkSize
          splitIndex = chunkSize;
        }
        
        chunks.push(remaining.substring(0, splitIndex).trim());
        remaining = remaining.substring(splitIndex).trim();
      }
      continue;
    }
    
    // If adding this sentence exceeds the chunk size, flush the current chunk and start a new one
    if ((currentChunk + ' ' + trimmedSentence).length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      
      // Compute overlapping text from the end of the previous chunk
      if (chunkOverlap > 0 && currentChunk.length > chunkOverlap) {
        const words = currentChunk.split(/\s+/);
        let overlapText = '';
        
        // Pull words backwards from the end of the last chunk until overlap limit is reached
        for (let i = words.length - 1; i >= 0; i--) {
          const word = words[i];
          if ((word + ' ' + overlapText).length <= chunkOverlap) {
            overlapText = word + ' ' + overlapText;
          } else {
            break;
          }
        }
        
        currentChunk = overlapText.trim() ? overlapText.trim() + ' ' + trimmedSentence : trimmedSentence;
      } else {
        currentChunk = trimmedSentence;
      }
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + trimmedSentence : trimmedSentence;
    }
  }
  
  // Flush final chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(c => c.length > 0);
}
