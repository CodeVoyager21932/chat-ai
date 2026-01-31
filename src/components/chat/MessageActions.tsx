'use client';

import React, { useState, useCallback } from 'react';
import type { Message } from '@/types';

/**
 * 消息操作组件 Props
 */
export interface MessageActionsProps {
  /** 消息对象 */
  message: Message;
  /** 复制消息回调 */
  onCopy?: (content: string) => void;
  /** 重新生成回调 */
  onRegenerate?: (messageId: string) => void;
}

/**
 * 消息操作组件
 * 
 * 功能：
 * - 复制按钮（带"已复制"反馈）
 * - 重新生成按钮
 * 
 * @requirements 12.1, 12.2, 12.4
 */
const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onCopy,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);

  /**
   * 处理复制
   * @requirements 12.1
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.(message.content);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [message.content, onCopy]);

  /**
   * 处理重新生成
   * @requirements 12.2
   */
  const handleRegenerate = useCallback(() => {
    onRegenerate?.(message.id);
  }, [message.id, onRegenerate]);

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* 复制按钮 */}
      {/* @requirements 12.1 */}
      <button
        onClick={handleCopy}
        className="
          flex items-center gap-1
          px-2 py-1 rounded
          text-xs text-[var(--muted-foreground)]
          hover:bg-[var(--muted)] hover:text-[var(--foreground)]
          transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
        "
        aria-label={copied ? '已复制' : '复制消息'}
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-500">已复制</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>复制</span>
          </>
        )}
      </button>

      {/* 重新生成按钮 */}
      {/* @requirements 12.2 */}
      {onRegenerate && (
        <button
          onClick={handleRegenerate}
          className="
            flex items-center gap-1
            px-2 py-1 rounded
            text-xs text-[var(--muted-foreground)]
            hover:bg-[var(--muted)] hover:text-[var(--foreground)]
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
          "
          aria-label="重新生成"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>重新生成</span>
        </button>
      )}
    </div>
  );
};

export default MessageActions;
