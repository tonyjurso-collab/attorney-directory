import OpenAI from 'openai';
import type { AIMetadataResponse } from '@/lib/types/articles';

// Initialize OpenAI client (only if API key exists)
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.');
    }
    openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openai;
}

/**
 * Generates an excerpt and meta description for an article using AI
 * @param content - The article content (HTML text, stripped of tags)
 * @param title - The article title
 * @returns Excerpt and meta description
 */
export async function generateArticleMetadata(
  content: string,
  title: string
): Promise<AIMetadataResponse> {
  try {
    console.log('generateArticleMetadata called with:', { title, contentLength: content.length });
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    console.log('OpenAI API key found, initializing OpenAI client...');
    
    // Get the OpenAI client
    const aiClient = getOpenAIClient();

    // Strip HTML tags for AI processing (basic strip)
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('Plain text length:', plainText.length);
    
    // Truncate content if too long (to save tokens and avoid context limits)
    const maxContentLength = 2000;
    const truncatedContent = plainText.length > maxContentLength 
      ? plainText.substring(0, maxContentLength) + '...'
      : plainText;

    const prompt = `You are an expert SEO writer specializing in legal content. Generate two outputs for an attorney's article:

Article Title: "${title}"

Article Content:
${truncatedContent}

Please generate:
1. EXCERPT: A 2-3 sentence summary (150-200 characters) that grabs attention and gives readers the key points. Write it naturally, as if it appears on the article listing page.
2. META DESCRIPTION: An SEO-optimized meta description (150-160 characters) that incorporates important keywords while being compelling to search engine users. Write it to encourage clicks in search results.

Return ONLY valid JSON in this exact format:
{
  "excerpt": "The excerpt text here...",
  "meta_description": "The meta description text here..."
}

Important guidelines:
- Make the excerpt engaging and informative, not generic
- Make the meta description keyword-rich but readable
- Stay within character limits
- Focus on legal value and expertise`;

    console.log('Calling OpenAI API...');
    const response = await aiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO writer who creates compelling excerpts and meta descriptions for legal articles. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const metadata = JSON.parse(responseContent) as AIMetadataResponse;

    // Validate the response
    if (!metadata.excerpt || !metadata.meta_description) {
      throw new Error('Invalid response from OpenAI');
    }

    // Ensure character limits are respected
    metadata.excerpt = truncateString(metadata.excerpt, 200);
    metadata.meta_description = truncateString(metadata.meta_description, 160);

    return metadata;

  } catch (error: any) {
    console.error('Error generating article metadata:', error);
    throw new Error(`Failed to generate metadata: ${error.message}`);
  }
}

/**
 * Helper function to truncate strings at word boundaries
 */
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }

  // Truncate at the last space before maxLength to avoid cutting words
  const truncated = str.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}
