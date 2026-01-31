'use client';

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { Message } from '@/types';
import MessageItem from './MessageItem';

/**
 * 消息列表组件 Props
 */
export interface MessageListProps {
  /** 消息数组 */
  messages: Message[];
  /** 是否正在加载（显示打字指示器） */
  isLoading?: boolean;
  /** 复制消息回调 */
  onCopy?: (content: string) => void;
  /** 重新生成回调 */
  onRegenerate?: (messageId: string) => void;
  /** 编辑消息回调 */
  onEdit?: (messageId: string, content: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * Virtual scrolling threshold - use virtual scrolling when messages exceed this count
 * @requirements 18.4 - Performance optimization
 */
const VIRTUAL_SCROLL_THRESHOLD = 100;

/**
 * Estimated message height for virtual scrolling calculations
 */
const ESTIMATED_MESSAGE_HEIGHT = 120;

/**
 * 消息列表组件
 * 
 * 功能：
 * - 显示消息列表
 * - 自动滚动到底部
 * - 自定义滚动条样式
 * - 打字指示器
 * - 虚拟滚动（消息过多时）
 * 
 * @requirements 18.5, 18.4
 */
const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  onCopy,
  onRegenerate,
  onEdit,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /**
   * Memoize messages to prevent unnecessary re-renders
   * @requirements 18.4 - Performance optimization
   */
  const memoizedMessages = useMemo(() => messages, [messages]);

  /**
   * Check if virtual scrolling should be enabled
   */
  const useVirtualScroll = memoizedMessages.length > VIRTUAL_SCROLL_THRESHOLD;

  /**
   * 自动滚动到底部
   */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memoizedMessages.length, isLoading]);

  /**
   * Render message item with memoization
   */
  const renderMessage = useCallback((message: Message, index: number) => (
    <MessageItem
      key={message.id}
      message={message}
      onCopy={onCopy}
      onRegenerate={onRegenerate}
      onEdit={onEdit}
      isLast={index === memoizedMessages.length - 1}
    />
  ), [onCopy, onRegenerate, onEdit, memoizedMessages.length]);

  /**
   * For virtual scrolling, only render visible messages plus buffer
   * This is a simplified implementation - for production, consider using
   * react-window or react-virtualized for more robust virtual scrolling
   */
  const visibleMessages = useMemo(() => {
    if (!useVirtualScroll) {
      return memoizedMessages;
    }
    
    // For large message lists, show last N messages to maintain performance
    // while keeping the most recent context visible
    const visibleCount = Math.min(memoizedMessages.length, 50);
    return memoizedMessages.slice(-visibleCount);
  }, [memoizedMessages, useVirtualScroll]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 touch-scroll ${className}`}
      role="log"
      aria-label="聊天消息"
      aria-live="polite"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Virtual scroll indicator */}
        {useVirtualScroll && memoizedMessages.length > visibleMessages.length && (
          <div className="text-center py-2">
            <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-3 py-1 rounded-full">
              显示最近 {visibleMessages.length} 条消息（共 {memoizedMessages.length} 条）
            </span>
          </div>
        )}

        {/* 消息列表 */}
        {visibleMessages.map((message, index) => renderMessage(message, index))}

        {/* 打字指示器 */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-fade-in">
            {/* AI 头像 */}
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {/* 打字动画 */}
            <div className="message-assistant px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="typing-dot w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />
                <span className="typing-dot w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />
                <span className="typing-dot w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />
              </div>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {memoizedMessages.length === 0 && !isLoading && (
          <EmptyState />
        )}

        {/* 滚动锚点 */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

/**
 * 空状态组件
 */
const EmptyState: React.FC = React.memo(() => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-12">
      <div className="w-16 h-16 mb-6 rounded-full gradient-bg flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        开始新对话
      </h3>
      <p className="text-[var(--muted-foreground)] max-w-md">
        选择一个 AI 模型，然后在下方输入您的问题开始对话。支持多模型切换、文件上传、Markdown 渲染等功能。
      </p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default MessageList;
