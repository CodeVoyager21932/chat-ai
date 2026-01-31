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

async function generateConversationTitle(message: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

const ChatContainer: React.FC<ChatContainerProps> = (props) => {
  const { conversationId, className = '' } = props;
  const { getCurrentConversation, updateConversation, addMessage, settings } = useChatStore();
  const currentConversation = getCurrentConversation();
  const model = currentConversation?.model || 'gpt-4o';
  const systemPrompt = currentConversation?.systemPrompt || settings.globalSystemPrompt;
  const savedMessageIds = useRef<Set<string>>(new Set());
  const prevConversationId = useRef<string | null>(null);
  const titleGeneratedRef = useRef<Set<string>>(new Set());
  const firstUserMessageRef = useRef<string | null>(null);

  const chatHook = useChat({
    api: '/api/chat',
    id: conversationId || undefined,
    body: { model, systemPrompt },
    onFinish: async (message) => {
      if (currentConversation && !savedMessageIds.current.has(message.id)) {
        savedMessageIds.current.add(message.id);
        const assistantMessage: Message = {
          id: message.id,
          role: 'assistant',
          content: message.content,
          createdAt: new Date(),
        };
        addMessage(currentConversation.id, assistantMessage);
        const convId = currentConversation.id;
        const isNewConversation = currentConversation.title === '新对话';
        const hasNotGeneratedTitle = !titleGeneratedRef.current.has(convId);
        const hasFirstMessage = firstUserMessageRef.current;
        if (isNewConversation && hasNotGeneratedTitle && hasFirstMessage) {
          titleGeneratedRef.current.add(convId);
          const messageForTitle = firstUserMessageRef.current!;
          generateConversationTitle(messageForTitle).then((title) => {
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
    if (prevConversationId.current === currentConversation?.id) return;
    prevConversationId.current = currentConversation?.id || null;
    savedMessageIds.current.clear();
    firstUserMessageRef.current = null;
    if (currentConversation?.messages?.length) {
      const formatted = currentConversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
      setMessages(formatted as Parameters<typeof setMessages>[0]);
      currentConversation.messages.forEach((msg) => {
        if (msg.role === 'assistant') savedMessageIds.current.add(msg.id);
      });
    } else {
      setMessages([]);
    }
  }, [currentConversation?.id, currentConversation?.messages, setMessages]);

  const handleSend = useCallback(async (content: string, attachments: Attachment[]) => {
    if (!content.trim() && attachments.length === 0) return;
    if (!currentConversation) return;
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: new Date(),
    };
    addMessage(currentConversation.id, userMessage);
    if (currentConversation.title === '新对话' && !firstUserMessageRef.current) {
      firstUserMessageRef.current = content;
    }
    await append({ role: 'user', content }, {
      body: { model, systemPrompt, attachments: attachments.length > 0 ? attachments : undefined },
    });
  }, [currentConversation, model, systemPrompt, addMessage, append]);

  const handleModelChange = useCallback((newModel: string) => {
    if (currentConversation) updateConversation(currentConversation.id, { model: newModel });
  }, [currentConversation, updateConversation]);

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
        disabled={!currentConversation}
        placeholder={
          currentConversation
            ? '输入消息... (Enter 发送, Shift+Enter 换行)'
            : '请先创建或选择一个对话'
        }
      />
    </div>
  );
};

export default ChatContainer;
