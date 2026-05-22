/**
 * Hugging Face Serverless Inference API helper for generating vector embeddings.
 * Uses the 'sentence-transformers/all-MiniLM-L6-v2' model which outputs 384 dimensions.
 */

const MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;

/**
 * Generates a 384-dimensional vector embedding for the given input text.
 * Handles serverless model cold-starts by parsing the estimated load time and retrying.
 * 
 * @param text The input text string to embed
 * @param retries Maximum number of retries for loading states
 * @param delay Default delay in milliseconds between retries
 */
export async function getEmbedding(
  text: string,
  retries = 5,
  delay = 2000
): Promise<number[]> {
  const apiKey = process.env.HUGGING_FACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGING_FACE_API_KEY environment variable is not defined.');
  }

  // Sanitize input text: remove multiple newlines and carriage returns
  const sanitizedText = text.replace(/\s+/g, ' ').trim();
  if (!sanitizedText) {
    throw new Error('Input text is empty.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: sanitizedText }),
      });

      const data = await response.json();

      if (response.ok) {
        let embedding = data;

        // Flatten the response if it is returned inside nested arrays
        while (Array.isArray(embedding) && Array.isArray(embedding[0])) {
          embedding = embedding[0];
        }

        // Validate the vector embedding dimensions (all-MiniLM-L6-v2 is 384)
        if (
          Array.isArray(embedding) &&
          embedding.length === 384 &&
          typeof embedding[0] === 'number'
        ) {
          return embedding as number[];
        }

        throw new Error(
          `Unexpected response structure or vector dimension. Expected 384 numbers, got: ${
            Array.isArray(embedding) ? `${embedding.length} items` : typeof embedding
          }`
        );
      }

      // Check if Hugging Face model is currently loading/initializing
      if (data.error && data.error.includes('is currently loading')) {
        const waitTime = data.estimated_time
          ? Math.ceil(data.estimated_time) * 1000
          : delay;
        
        console.warn(
          `[Hugging Face RAG] Model is currently loading. Attempt ${attempt}/${retries}. Retrying in ${waitTime}ms...`
        );
        
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw new Error(data.error || `API returned status code ${response.status}`);
    } catch (error: any) {
      if (attempt === retries) {
        throw new Error(`Failed to generate embedding after ${retries} attempts. Error: ${error.message}`);
      }
      // For general fetch errors, wait for a short duration and retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Hugging Face model loading timed out.');
}
