'use client';

import React, { memo } from 'react';
import type { Message } from '@/types';
import { MarkdownRenderer } from '@/components/markdown';
import MessageActions from './MessageActions';
import MediaDownload from './MediaDownload';

/**
 * 消息项组件 Props
 */
export interface MessageItemProps {
  /** 消息对象 */
  message: Message;
  /** 是否是最后一条消息 */
  isLast?: boolean;
  /** 复制消息回调 */
  onCopy?: (content: string) => void;
  /** 重新生成回调 */
  onRegenerate?: (messageId: string) => void;
  /** 编辑消息回调 */
  onEdit?: (messageId: string, content: string) => void;
}

/**
 * 消息项组件
 * 
 * 功能：
 * - 用户消息样式（右侧、渐变背景）
 * - AI 消息样式（左侧、白色背景）
 * - 头像显示
 * - 淡入动画
 * - 集成 MarkdownRenderer
 * 
 * Performance optimized with React.memo
 * 
 * @requirements 18.3, 18.4
 */
const MessageItem: React.FC<MessageItemProps> = memo(({
  message,
  isLast = false,
  onCopy,
  onRegenerate,
  onEdit,
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // 系统消息不显示
  if (message.role === 'system') {
    return null;
  }

  return (
    <div
      className={`
        flex items-start gap-3 animate-fade-in group
        ${isUser ? 'flex-row-reverse' : ''}
      `}
      role="article"
      aria-label={isUser ? '用户消息' : 'AI 消息'}
    >
      {/* 头像 */}
      <Avatar isUser={isUser} />

      {/* 消息内容 */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* 消息气泡 */}
        <div
          className={`
            px-4 py-3 rounded-2xl
            ${isUser 
              ? 'message-user' 
              : 'message-assistant'
            }
          `}
        >
          {isUser ? (
            // 用户消息：纯文本
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            // AI 消息：Markdown 渲染
            <MarkdownRenderer content={message.content} />
          )}

          {/* 附件预览 */}
          {message.attachments && message.attachments.length > 0 && (
            <AttachmentList attachments={message.attachments} />
          )}
        </div>

        {/* 消息操作按钮（仅 AI 消息） */}
        {/* @requirements 12.4 */}
        {isAssistant && (
          <>
            {/* 媒体下载按钮 */}
            {/* @requirements 17.1, 17.2, 17.3 */}
            <MediaDownload content={message.content} />
            
            <MessageActions
              message={message}
              onCopy={onCopy}
              onRegenerate={onRegenerate}
            />
          </>
        )}

        {/* 用户消息操作按钮 */}
        {isUser && onEdit && (
          <button
            onClick={() => onEdit(message.id, message.content)}
            className="
              mt-1 px-2 py-1 rounded text-xs
              text-[var(--muted-foreground)]
              hover:bg-[var(--muted)]
              transition-colors
              opacity-0 group-hover:opacity-100
            "
            aria-label="编辑消息"
          >
            编辑
          </button>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if these props change
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isLast === nextProps.isLast
  );
});

MessageItem.displayName = 'MessageItem';

/**
 * 头像组件 Props
 */
interface AvatarProps {
  isUser: boolean;
}

/**
 * 头像组件 - Memoized for performance
 */
const Avatar: React.FC<AvatarProps> = memo(({ isUser }) => {
  if (isUser) {
    return (
      <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
  );
});

Avatar.displayName = 'Avatar';

/**
 * 附件列表组件 Props
 */
interface AttachmentListProps {
  attachments: Message['attachments'];
}

/**
 * 附件列表组件 - Memoized for performance
 */
const AttachmentList: React.FC<AttachmentListProps> = memo(({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 px-2 py-1 rounded bg-black/10 dark:bg-white/10"
        >
          {attachment.type === 'image' ? (
            <>
              {attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt={attachment.name}
                  className="w-8 h-8 rounded object-cover"
                  loading="lazy"
                />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span className="text-xs truncate max-w-[100px]">{attachment.name}</span>
        </div>
      ))}
    </div>
  );
});

AttachmentList.displayName = 'AttachmentList';

export default MessageItem;
