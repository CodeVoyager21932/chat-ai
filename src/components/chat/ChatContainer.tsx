'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import type { Message, Attachment } from '@/types';
import { useChatStore } from '@/store';
import MessageList from './MessageList';
import InputArea from './InputArea';

export interface ChatContainerProps {
  conversationId?: string | null;
  className?: string;
}

function generateMessageId(): string {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Build API headers with API keys from config
 */
function buildApiHeaders(apiConfig: { openaiApiKey?: string; anthropicApiKey?: string; googleApiKey?: string } | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiConfig?.openaiApiKey) {
    headers['x-openai-api-key'] = apiConfig.openaiApiKey;
  }
  if (apiConfig?.anthropicApiKey) {
    headers['x-anthropic-api-key'] = apiConfig.anthropicApiKey;
  }
  if (apiConfig?.googleApiKey) {
    headers['x-google-api-key'] = apiConfig.googleApiKey;
  }
  return headers;
}

async function generateConversationTitle(message: string, apiConfig?: { openaiApiKey?: string }): Promise<string> {
  try {
    const headers = buildApiHeaders(apiConfig);
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to generate title');
    const data = await response.json();
    return data.title || '新对话';
  } catch (error) {
    console.error('Title generation error:', error);
    const fallback = message.trim().substring(0, 47);
    return fallback.length < message.trim().length ? fallback + '...' : fallback;
  }
}

// Empty array constant to avoid creating new references
const EMPTY_MESSAGES: Message[] = [];

const ChatContainer: React.FC<ChatContainerProps> = (props) => {
  const { conversationId, className = '' } = props;
  
  // Use proper selectors - get primitive values separately to avoid new object creation
  const updateConversation = useChatStore((state) => state.updateConversation);
  const addMessage = useChatStore((state) => state.addMessage);
  const globalSystemPrompt = useChatStore((state) => state.settings.globalSystemPrompt);
  const apiConfig = useChatStore((state) => state.settings.apiConfig);
  
  // Get individual primitive values instead of creating new objects
  const convId = useChatStore((state) => {
    if (!conversationId) return null;
    const conv = state.conversations.find(c => c.id === conversationId);
    return conv?.id || null;
  });
  const convTitle = useChatStore((state) => {
    if (!conversationId) return null;
    const conv = state.conversations.find(c => c.id === conversationId);
    return conv?.title || null;
  });
  const convModel = useChatStore((state) => {
    if (!conversationId) return 'gpt-4o';
    const conv = state.conversations.find(c => c.id === conversationId);
    return conv?.model || 'gpt-4o';
  });
  const convSystemPrompt = useChatStore((state) => {
    if (!conversationId) return null;
    const conv = state.conversations.find(c => c.id === conversationId);
    return conv?.systemPrompt || null;
  });
  
  // Get messages - return stable empty array reference when no messages
  const conversationMessages = useChatStore((state) => {
    if (!conversationId) return EMPTY_MESSAGES;
    const conv = state.conversations.find(c => c.id === conversationId);
    return conv?.messages || EMPTY_MESSAGES;
  });
  
  const model = convModel;
  const systemPrompt = convSystemPrompt || globalSystemPrompt;
  const savedMessageIds = useRef<Set<string>>(new Set());
  const prevConversationId = useRef<string | null>(null);
  const titleGeneratedRef = useRef<Set<string>>(new Set());
  const firstUserMessageRef = useRef<string | null>(null);

  // Memoize the body object to prevent useChat from re-initializing
  const chatBody = useMemo(() => ({ model, systemPrompt }), [model, systemPrompt]);

  // Memoize headers with API keys
  const chatHeaders = useMemo(() => buildApiHeaders(apiConfig), [apiConfig]);

  const chatHook = useChat({
    api: '/api/chat',
    id: conversationId || undefined,
    body: chatBody,
    headers: chatHeaders,
    onFinish: async (message) => {
      if (convId && !savedMessageIds.current.has(message.id)) {
        savedMessageIds.current.add(message.id);
        const assistantMessage: Message = {
          id: message.id,
          role: 'assistant',
          content: message.content,
          createdAt: new Date(),
        };
        addMessage(convId, assistantMessage);
        const isNewConversation = convTitle === '新对话';
        const hasNotGeneratedTitle = !titleGeneratedRef.current.has(convId);
        const hasFirstMessage = firstUserMessageRef.current;
        if (isNewConversation && hasNotGeneratedTitle && hasFirstMessage) {
          titleGeneratedRef.current.add(convId);
          const messageForTitle = firstUserMessageRef.current!;
          generateConversationTitle(messageForTitle, apiConfig).then((title) => {
            updateConversation(convId, { title });
          }).catch((err) => {
            console.error('Failed to update title:', err);
          });
        }
      }
    },
    onError: (err) => { console.error('Chat error:', err); },
  });

  const chatMessages = chatHook.messages;
  const status = chatHook.status;
  const error = chatHook.error;
  const append = chatHook.append;
  const reload = chatHook.reload;
  const setMessages = chatHook.setMessages;

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (prevConversationId.current === convId) return;
    prevConversationId.current = convId;
    savedMessageIds.current.clear();
    firstUserMessageRef.current = null;
    if (conversationMessages.length > 0) {
      const formatted = conversationMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
      setMessages(formatted as Parameters<typeof setMessages>[0]);
      conversationMessages.forEach((msg) => {
        if (msg.role === 'assistant') savedMessageIds.current.add(msg.id);
      });
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId, setMessages]);

  const handleSend = useCallback(async (content: string, attachments: Attachment[]) => {
    if (!content.trim() && attachments.length === 0) return;
    if (!convId) return;
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: new Date(),
    };
    addMessage(convId, userMessage);
    if (convTitle === '新对话' && !firstUserMessageRef.current) {
      firstUserMessageRef.current = content;
    }
    await append({ role: 'user', content }, {
      body: { model, systemPrompt, attachments: attachments.length > 0 ? attachments : undefined },
    });
  }, [convId, convTitle, model, systemPrompt, addMessage, append]);

  const handleModelChange = useCallback((newModel: string) => {
    if (convId) updateConversation(convId, { model: newModel });
  }, [convId, updateConversation]);

  const handleCopy = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleRegenerate = useCallback(async (messageId: string) => {
    const idx = chatMessages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;
    savedMessageIds.current.delete(messageId);
    const newMessages = chatMessages.slice(0, idx);
    setMessages(newMessages);
    await reload();
  }, [chatMessages, setMessages, reload]);

  const handleEdit = useCallback(async (messageId: string, newContent: string) => {
    const idx = chatMessages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;
    const original = chatMessages[idx];
    if (!original) return;
    chatMessages.slice(idx).forEach((msg) => {
      savedMessageIds.current.delete(msg.id);
    });
    const newMessages = [...chatMessages.slice(0, idx), { ...original, content: newContent }];
    setMessages(newMessages);
    await reload();
  }, [chatMessages, setMessages, reload]);

  const displayMessages: Message[] = useMemo(() => {
    return chatMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      createdAt: msg.createdAt || new Date(),
    }));
  }, [chatMessages]);

  const containerClassName = 'flex flex-col h-full ' + className;

  return (
    <div className={containerClassName}>
      {error && (
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error.message || '连接中断，请重试'}
            </p>
            <button
              onClick={() => reload()}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              重试
            </button>
          </div>
        </div>
      )}
      <MessageList
        messages={displayMessages}
        isLoading={isLoading}
        onCopy={handleCopy}
        onRegenerate={handleRegenerate}
        onEdit={handleEdit}
        className="flex-1"
      />
      <InputArea
        onSend={handleSend}
        model={model}
        onModelChange={handleModelChange}
        isLoading={isLoading}
        disabled={!convId}
        placeholder={
          convId
            ? '输入消息... (Enter 发送, Shift+Enter 换行)'
            : '请先创建或选择一个对话'
        }
      />
    </div>
  );
};

export default ChatContainer;
