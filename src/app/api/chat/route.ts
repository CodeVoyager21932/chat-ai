// app/api/chat/route.ts
// AI 聊天 API 路由 - 支持多提供商（OpenAI、Anthropic、Google）
// Requirements: 1.4, 3.1, 3.2, 4.1, 11.4, 11.5

import { streamText, CoreMessage, ImagePart, TextPart } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Message, Attachment, ChatRequest } from '@/types';

/**
 * 根据模型 ID 和 API 密钥获取对应的 AI 提供商
 * Property 3: Model Routing to Correct Provider
 * - gpt-* 模型路由到 OpenAI
 * - claude-* 模型路由到 Anthropic
 * - gemini-* 模型路由到 Google
 */
function getProviderForModel(model: string, apiKey: string) {
  if (model.startsWith('gpt')) {
    return createOpenAI({ apiKey });
  }
  if (model.startsWith('claude')) {
    return createAnthropic({ apiKey });
  }
  if (model.startsWith('gemini')) {
    return createGoogleGenerativeAI({ apiKey });
  }
  throw new Error(`Unknown model: ${model}`);
}

/**
 * 从请求头或环境变量获取 API 密钥
 * 优先级：请求头 > 环境变量
 */
function getApiKey(model: string, headers: Headers): string | undefined {
  if (model.startsWith('gpt')) {
    return headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
  }
  if (model.startsWith('claude')) {
    return headers.get('x-anthropic-api-key') || process.env.ANTHROPIC_API_KEY;
  }
  if (model.startsWith('gemini')) {
    return headers.get('x-google-api-key') || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }
  return undefined;
}

/**
 * 验证 API 密钥是否存在
 * Requirement 4.1: API 密钥从服务端环境变量读取
 */
function validateApiKey(model: string, headers: Headers): void {
  const apiKey = getApiKey(model, headers);
  if (!apiKey) {
    if (model.startsWith('gpt')) {
      throw new Error('OPENAI_API_KEY is not configured');
    } else if (model.startsWith('claude')) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    } else if (model.startsWith('gemini')) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
    }
  }
}

/**
 * 将附件转换为 AI SDK 支持的格式
 * Property 7: File to Base64 Conversion
 */
function convertAttachmentToContent(attachment: Attachment): ImagePart | TextPart {
  if (attachment.type === 'image') {
    // 图片附件转换为 ImagePart
    return {
      type: 'image',
      image: attachment.data, // base64 数据
      mimeType: attachment.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
    };
  } else {
    // 文档附件转换为文本内容
    // 对于 base64 编码的文档，尝试解码为文本
    try {
      const decodedContent = Buffer.from(attachment.data, 'base64').toString('utf-8');
      return {
        type: 'text',
        text: `[Document: ${attachment.name}]\n${decodedContent}`,
      };
    } catch {
      // 如果解码失败，返回文件名信息
      return {
        type: 'text',
        text: `[Attached document: ${attachment.name}]`,
      };
    }
  }
}

/**
 * 格式化消息，包含附件
 * Requirement 2.5: 将文件转换为 base64 并包含在 AI 请求中
 */
function formatMessagesWithAttachments(messages: Message[]): CoreMessage[] {
  return messages.map((message): CoreMessage => {
    const role = message.role as 'user' | 'assistant';
    
    // 如果没有附件，直接返回文本消息
    if (!message.attachments || message.attachments.length === 0) {
      if (role === 'user') {
        return {
          role: 'user',
          content: message.content,
        };
      } else {
        return {
          role: 'assistant',
          content: message.content,
        };
      }
    }

    // 有附件时，构建多部分内容（只有用户消息支持附件）
    const contentParts: (TextPart | ImagePart)[] = [];

    // 添加文本内容
    if (message.content) {
      contentParts.push({
        type: 'text',
        text: message.content,
      });
    }

    // 添加附件内容
    for (const attachment of message.attachments) {
      contentParts.push(convertAttachmentToContent(attachment));
    }

    // 只有用户消息支持多部分内容（包含图片）
    if (role === 'user') {
      return {
        role: 'user',
        content: contentParts,
      };
    } else {
      // 助手消息不支持附件，只返回文本
      return {
        role: 'assistant',
        content: message.content,
      };
    }
  });
}

/**
 * POST /api/chat
 * 处理聊天请求，支持流式响应
 * 
 * Requirements:
 * - 1.4: 根据模型选择提供商
 * - 3.1, 3.2: 流式响应
 * - 4.1: API 密钥安全
 * - 11.4, 11.5: 系统提示词处理
 */
export async function POST(request: Request) {
  try {
    // 解析请求体
    const body: ChatRequest = await request.json();
    const { messages, model, systemPrompt } = body;

    // 验证必要参数
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ message: 'Messages array is required', status: 400 }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!model) {
      return new Response(
        JSON.stringify({ message: 'Model is required', status: 400 }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取 API 密钥用于请求
    const apiKey = getApiKey(model, request.headers);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          message: 'API key not configured', 
          status: 401 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取 AI 提供商
    // Requirement 1.4: 根据模型选择提供商
    let provider;
    try {
      provider = getProviderForModel(model, apiKey);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          message: `Unknown model: ${model}`, 
          status: 400 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 格式化消息（包含附件）
    const formattedMessages = formatMessagesWithAttachments(messages);

    // 流式响应
    // Requirements 3.1, 3.2: 流式传输 AI 响应
    // Requirements 11.4, 11.5: 使用系统提示词
    const result = streamText({
      model: provider(model),
      system: systemPrompt || undefined,
      messages: formattedMessages,
    });

    // 返回流式响应
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Chat API error:', error);
    
    // 处理特定错误类型
    if (error instanceof Error) {
      // 速率限制错误
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return new Response(
          JSON.stringify({ 
            message: 'Too many requests. Please try again later.', 
            status: 429 
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // 认证错误
      if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return new Response(
          JSON.stringify({ 
            message: 'API authentication failed', 
            status: 401 
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 通用错误
    return new Response(
      JSON.stringify({ 
        message: 'An error occurred while processing your request', 
        status: 500 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
