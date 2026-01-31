'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useChatStore } from '@/store';
import type { Conversation, PresetPrompt } from '@/types';

/**
 * ConversationSettings Props
 */
export interface ConversationSettingsProps {
  /** The conversation to edit */
  conversation: Conversation;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
}

/**
 * ConversationSettings Component
 * 
 * Modal for editing conversation-specific settings:
 * - System prompt (conversation-level)
 * - Preset prompt selection
 * 
 * @requirements 11.2 - Support setting system prompt when creating/editing conversation
 * @requirements 11.4 - Conversation-specific prompt takes priority over global prompt
 */
const ConversationSettings: React.FC<ConversationSettingsProps> = ({
  conversation,
  isOpen,
  onClose,
}) => {
  const { updateConversation, settings } = useChatStore();
  
  // Local state for the system prompt
  const [systemPrompt, setSystemPrompt] = useState(conversation.systemPrompt || '');
  const [useGlobalPrompt, setUseGlobalPrompt] = useState(!conversation.systemPrompt);

  // Sync state when conversation changes
  useEffect(() => {
    setSystemPrompt(conversation.systemPrompt || '');
    setUseGlobalPrompt(!conversation.systemPrompt);
  }, [conversation.systemPrompt, conversation.id]);

  /**
   * Handle save button click
   */
  const handleSave = useCallback(() => {
    // If using global prompt, clear the conversation-specific prompt
    const newPrompt = useGlobalPrompt ? undefined : systemPrompt.trim() || undefined;
    updateConversation(conversation.id, { systemPrompt: newPrompt });
    onClose();
  }, [conversation.id, systemPrompt, useGlobalPrompt, updateConversation, onClose]);

  /**
   * Handle preset prompt selection
   */
  const handlePresetSelect = useCallback((preset: PresetPrompt) => {
    setSystemPrompt(preset.prompt);
    setUseGlobalPrompt(false);
  }, []);

  /**
   * Handle toggle between global and custom prompt
   */
  const handleToggleGlobal = useCallback((useGlobal: boolean) => {
    setUseGlobalPrompt(useGlobal);
    if (useGlobal) {
      setSystemPrompt('');
    }
  }, []);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conversation-settings-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="
        relative z-10
        w-full max-w-lg mx-4
        bg-[var(--popover)]
        border border-[var(--border)]
        rounded-xl shadow-xl
        animate-in fade-in-0 zoom-in-95
        max-h-[90vh] overflow-hidden flex flex-col
      ">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2
            id="conversation-settings-title"
            className="text-lg font-semibold text-[var(--popover-foreground)]"
          >
            对话设置
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            aria-label="关闭"
          >
            <svg
              className="w-5 h-5 text-[var(--muted-foreground)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Conversation title display */}
          <div>
            <label className="block text-sm font-medium text-[var(--popover-foreground)] mb-1">
              对话标题
            </label>
            <p className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)] px-3 py-2 rounded-lg">
              {conversation.title}
            </p>
          </div>

          {/* System prompt toggle */}
          <div>
            <label className="block text-sm font-medium text-[var(--popover-foreground)] mb-2">
              系统提示词
            </label>
            
            {/* Toggle buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleToggleGlobal(true)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${useGlobalPrompt
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80'
                  }
                `}
              >
                使用全局提示词
              </button>
              <button
                onClick={() => handleToggleGlobal(false)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${!useGlobalPrompt
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80'
                  }
                `}
              >
                自定义提示词
              </button>
            </div>

            {/* Global prompt display */}
            {useGlobalPrompt && (
              <div className="bg-[var(--muted)] rounded-lg p-3">
                <p className="text-xs text-[var(--muted-foreground)] mb-1">当前全局提示词：</p>
                <p className="text-sm text-[var(--popover-foreground)]">
                  {settings.globalSystemPrompt || '（未设置）'}
                </p>
              </div>
            )}

            {/* Custom prompt textarea */}
            {!useGlobalPrompt && (
              <>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="输入此对话的系统提示词..."
                  className="
                    w-full h-32 px-3 py-2
                    bg-[var(--input)]
                    border border-[var(--border)]
                    rounded-lg
                    text-sm text-[var(--popover-foreground)]
                    placeholder:text-[var(--muted-foreground)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
                    resize-none
                  "
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  此提示词仅对当前对话生效，优先于全局提示词
                </p>
              </>
            )}
          </div>

          {/* Preset prompts */}
          {!useGlobalPrompt && settings.presetPrompts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--popover-foreground)] mb-2">
                快速选择预设
              </label>
              <div className="grid grid-cols-3 gap-2">
                {settings.presetPrompts.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className="
                      flex flex-col items-center gap-1
                      p-3 rounded-lg
                      bg-[var(--muted)]
                      hover:bg-[var(--muted)]/80
                      transition-colors
                      text-center
                    "
                    title={preset.prompt}
                  >
                    <span className="text-xl">{preset.icon}</span>
                    <span className="text-xs text-[var(--popover-foreground)]">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="
              flex-1 px-4 py-2
              rounded-lg
              bg-[var(--muted)]
              text-[var(--muted-foreground)]
              font-medium
              hover:bg-[var(--muted)]/80
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
            "
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="
              flex-1 px-4 py-2
              rounded-lg
              gradient-bg
              text-white
              font-medium
              hover:opacity-90
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
            "
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationSettings;
