// types/index.ts
// AI Chat Application Type Definitions

/**
 * AI 提供商类型
 * Supported AI providers for the chat application
 */
export type AIProvider = 'openai' | 'anthropic' | 'google';

/**
 * AI 模型配置
 * Configuration for each AI model
 */
export interface AIModel {
  /** Unique model identifier (e.g., 'gpt-4o', 'claude-3-5-sonnet-20241022') */
  id: string;
  /** Display name for the model */
  name: string;
  /** AI provider for this model */
  provider: AIProvider;
  /** Whether the model supports vision/image inputs */
  supportsVision: boolean;
  /** Whether the model supports file attachments */
  supportsFiles: boolean;
}

/**
 * 消息角色类型
 * Role of the message sender
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 消息类型
 * Represents a single message in a conversation
 */
export interface Message {
  /** Unique message identifier */
  id: string;
  /** Role of the message sender */
  role: MessageRole;
  /** Message content (may contain Markdown) */
  content: string;
  /** Optional file attachments */
  attachments?: Attachment[];
  /** Timestamp when the message was created */
  createdAt: Date;
}

/**
 * 附件类型分类
 * Type of file attachment
 */
export type AttachmentType = 'image' | 'document';

/**
 * 附件类型
 * Represents a file attachment in a message
 */
export interface Attachment {
  /** Unique attachment identifier */
  id: string;
  /** Type of attachment (image or document) */
  type: AttachmentType;
  /** Original file name */
  name: string;
  /** MIME type of the file (e.g., 'image/png', 'application/pdf') */
  mimeType: string;
  /** Base64 encoded file data */
  data: string;
  /** Optional preview URL for images */
  preview?: string;
}

/**
 * 对话类型
 * Represents a conversation with messages and metadata
 */
export interface Conversation {
  /** Unique conversation identifier */
  id: string;
  /** Conversation title (auto-generated or user-defined) */
  title: string;
  /** Array of messages in the conversation */
  messages: Message[];
  /** Selected AI model ID for this conversation */
  model: string;
  /** Optional conversation-specific system prompt */
  systemPrompt?: string;
  /** Whether the conversation is pinned to the top */
  isPinned: boolean;
  /** Whether the conversation is archived */
  isArchived: boolean;
  /** Timestamp when the conversation was created */
  createdAt: Date;
  /** Timestamp when the conversation was last updated */
  updatedAt: Date;
}

/**
 * 主题模式类型
 * Theme mode (light or dark)
 */
export type ThemeMode = 'light' | 'dark';

/**
 * 字体大小类型
 * Font size options
 */
export type FontSize = 'small' | 'medium' | 'large';

/**
 * 主题配置
 * Theme configuration for the application
 */
export interface ThemeConfig {
  /** Color mode (light or dark) */
  mode: ThemeMode;
  /** Primary accent color (hex value) */
  primaryColor: string;
  /** Font size preference */
  fontSize: FontSize;
}

/**
 * 预设提示词
 * Preset system prompt template
 */
export interface PresetPrompt {
  /** Unique preset identifier */
  id: string;
  /** Display name for the preset */
  name: string;
  /** System prompt content */
  prompt: string;
  /** Icon emoji for the preset */
  icon: string;
}

/**
 * 应用设置
 * Application-wide settings
 */
export interface AppSettings {
  /** Global system prompt used when no conversation-specific prompt is set */
  globalSystemPrompt: string;
  /** Theme configuration */
  theme: ThemeConfig;
  /** Array of preset prompt templates */
  presetPrompts: PresetPrompt[];
}

/**
 * 导出格式类型
 * Supported export formats
 */
export type ExportFormat = 'markdown' | 'json' | 'pdf';

/**
 * 文件验证结果
 * Result of file validation
 */
export interface FileValidationResult {
  /** Whether the file is valid */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * API 错误响应
 * Error response from API routes
 */
export interface APIError {
  /** Error message */
  message: string;
  /** HTTP status code */
  status: number;
}

/**
 * 聊天请求参数
 * Parameters for chat API request
 */
export interface ChatRequest {
  /** Array of messages to send */
  messages: Message[];
  /** Selected model ID */
  model: string;
  /** Optional system prompt */
  systemPrompt?: string;
  /** Optional file attachments */
  attachments?: Attachment[];
}

/**
 * 对话操作类型
 * Types of conversation operations
 */
export type ConversationAction = 'pin' | 'unpin' | 'archive' | 'unarchive' | 'delete';
