// app/api/generate-title/route.ts
// API route for generating conversation titles
// Requirements: 7.1, 7.2, 7.3

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Maximum length for generated titles
 * Property 9: Title Generation Constraints - title length <= 50 characters
 */
const MAX_TITLE_LENGTH = 50;

/**
 * 从请求头或环境变量获取 OpenAI API 密钥
 */
function getOpenAIApiKey(headers: Headers): string | undefined {
  return headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
}

/**
 * 创建 OpenAI 客户端
 */
function createOpenAIClient(apiKey: string) {
  return createOpenAI({ apiKey });
}

/**
 * POST /api/generate-title
 * Generate a concise title based on the first message content
 * 
 * Requirements:
 * - 7.1: Generate title based on first user message
 * - 7.2: Title should be concise (max 50 characters) and descriptive
 * - 7.3: Title will be persisted with the conversation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ message: 'Message content is required', status: 400 }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if OpenAI API key is configured
    const apiKey = getOpenAIApiKey(request.headers);
    if (!apiKey) {
      // Fallback: generate title from message content directly
      const fallbackTitle = generateFallbackTitle(message);
      return new Response(
        JSON.stringify({ title: fallbackTitle }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate title using AI
    const openai = createOpenAIClient(apiKey);
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are a title generator. Generate a concise, descriptive title for a conversation based on the user's first message. 
Rules:
- The title MUST be in the same language as the user's message
- The title MUST be ${MAX_TITLE_LENGTH} characters or less
- The title should capture the main topic or intent
- Do NOT include quotes or special formatting
- Return ONLY the title text, nothing else`,
      prompt: `Generate a title for this message: "${message.substring(0, 500)}"`,
      maxTokens: 50,
    });

    // Extract and truncate title
    let title = result.text.trim();
    
    // Remove quotes if present
    title = title.replace(/^["']|["']$/g, '');
    
    // Ensure title is not empty
    if (!title) {
      title = generateFallbackTitle(message);
    }
    
    // Truncate to max length
    if (title.length > MAX_TITLE_LENGTH) {
      title = title.substring(0, MAX_TITLE_LENGTH - 3) + '...';
    }

    return new Response(
      JSON.stringify({ title }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Title generation error:', error);
    
    // Fallback to simple title generation on error
    try {
      const body = await request.clone().json();
      const fallbackTitle = generateFallbackTitle(body.message || '');
      return new Response(
        JSON.stringify({ title: fallbackTitle }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch {
      return new Response(
        JSON.stringify({ title: '新对话' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}

/**
 * Generate a fallback title from message content
 * Used when AI generation fails or API key is not configured
 */
function generateFallbackTitle(message: string): string {
  if (!message || message.trim().length === 0) {
    return '新对话';
  }

  // Clean up the message
  let title = message.trim();
  
  // Remove newlines and extra spaces
  title = title.replace(/\s+/g, ' ');
  
  // Take first sentence or first part
  const sentenceEnd = title.search(/[。！？.!?]/);
  if (sentenceEnd > 0 && sentenceEnd < MAX_TITLE_LENGTH) {
    title = title.substring(0, sentenceEnd + 1);
  }
  
  // Truncate if still too long
  if (title.length > MAX_TITLE_LENGTH) {
    title = title.substring(0, MAX_TITLE_LENGTH - 3) + '...';
  }
  
  return title;
}
