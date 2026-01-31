'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Attachment, AIModel } from '@/types';
import FileUploader from './FileUploader';

/**
 * AI 模型列表
 */
const AI_MODELS: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', supportsVision: true, supportsFiles: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', supportsVision: true, supportsFiles: true },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', supportsVision: true, supportsFiles: true },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', supportsVision: true, supportsFiles: false },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', supportsVision: true, supportsFiles: true },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', supportsVision: true, supportsFiles: true },
];

/**
 * 输入区域组件 Props
 */
export interface InputAreaProps {
  /** 发送消息回调 */
  onSend: (content: string, attachments: Attachment[]) => void;
  /** 当前选中的模型 */
  model: string;
  /** 模型变化回调 */
  onModelChange: (model: string) => void;
  /** 是否正在发送 */
  isLoading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * 输入区域组件
 * 
 * 功能：
 * - 文本输入框（自动扩展高度，最大 120px）
 * - Enter 发送、Shift+Enter 换行
 * - 发送按钮（带加载状态）
 * - 模型选择器
 * - 集成文件上传组件
 * 
 * @requirements 19.1, 19.2, 19.3, 19.4, 19.5, 1.1, 1.2
 */
const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  model,
  onModelChange,
  isLoading = false,
  disabled = false,
  placeholder = '输入消息... (Enter 发送, Shift+Enter 换行)',
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 自动调整文本框高度
   * @requirements 19.3
   */
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  /**
   * 内容变化时调整高度
   */
  useEffect(() => {
    adjustHeight();
  }, [content, adjustHeight]);

  /**
   * 页面加载时自动聚焦
   * @requirements 19.5
   */
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  /**
   * 处理发送
   */
  const handleSend = useCallback(() => {
    const trimmedContent = content.trim();
    if (!trimmedContent && attachments.length === 0) return;
    if (isLoading || disabled) return;

    onSend(trimmedContent, attachments);
    setContent('');
    setAttachments([]);
    
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [content, attachments, isLoading, disabled, onSend]);

  /**
   * 处理键盘事件
   * @requirements 19.1, 19.2
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送（不按 Shift）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter 换行（默认行为）
  }, [handleSend]);

  /**
   * 处理内容变化
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  /**
   * 处理模型变化
   * @requirements 1.1, 1.2
   */
  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  }, [onModelChange]);

  /**
   * 处理文件上传错误
   */
  const handleFileError = useCallback((error: string) => {
    console.error('File upload error:', error);
    // TODO: 显示 Toast 提示
  }, []);

  const canSend = (content.trim() || attachments.length > 0) && !isLoading && !disabled;

  return (
    <div className="p-4 bg-[var(--card)] border-t border-[var(--border)] safe-area-bottom">
      <div className="max-w-3xl mx-auto">
        {/* 模型选择器 */}
        <div className="flex items-center justify-end mb-2">
          <select
            value={model}
            onChange={handleModelChange}
            disabled={disabled}
            className="
              px-3 py-1.5 rounded-lg
              bg-[var(--input)]
              border border-[var(--border)]
              text-sm text-[var(--foreground)]
              focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]
              cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {AI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* 输入区域 */}
        <div className="relative flex items-end gap-2">
          {/* 文件上传按钮 */}
          <FileUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            onError={handleFileError}
            disabled={disabled || isLoading}
          />

          {/* 文本输入框 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className="
                w-full px-4 py-3
                rounded-xl
                bg-[var(--input)]
                border border-[var(--border)]
                focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20
                text-[var(--foreground)]
                placeholder-[var(--muted-foreground)]
                resize-none
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              style={{ 
                minHeight: '48px',
                maxHeight: '120px',
              }}
              aria-label="消息输入框"
            />
          </div>

          {/* 发送按钮 */}
          {/* @requirements 19.4 */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="
              p-3 rounded-xl
              gradient-bg
              text-white
              transition-all duration-200
              shadow-md hover:shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2
            "
            aria-label={isLoading ? '发送中...' : '发送消息'}
          >
            {isLoading ? (
              // 加载动画
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              // 发送图标
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* 提示文字 */}
        <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
          AI 可能会产生错误信息，请核实重要内容
        </p>
      </div>
    </div>
  );
};

export default InputArea;
