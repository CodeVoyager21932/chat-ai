'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore, useSettings } from '@/store';
import type { PresetPrompt } from '@/types';

/**
 * Default preset role templates for the application
 * These provide quick access to common AI assistant configurations
 */
const DEFAULT_PRESET_TEMPLATES: PresetPrompt[] = [
  {
    id: 'general',
    name: '通用助手',
    prompt: '你是一个有帮助的 AI 助手，能够回答各种问题并提供有用的建议。',
    icon: '🤖',
  },
  {
    id: 'coder',
    name: '代码专家',
    prompt: '你是一个资深的软件工程师，擅长代码审查、优化和调试。请用清晰的代码示例和详细的解释来回答编程相关的问题。',
    icon: '💻',
  },
  {
    id: 'translator',
    name: '翻译助手',
    prompt: '你是一个专业的翻译助手，擅长中英文互译。请提供准确、自然的翻译，并在必要时解释文化差异或语言细微之处。',
    icon: '🌐',
  },
  {
    id: 'writer',
    name: '写作助手',
    prompt: '你是一个专业的写作助手，擅长文章润色、创作和编辑。请帮助用户改进文章结构、语言表达和整体质量。',
    icon: '✍️',
  },
  {
    id: 'teacher',
    name: '学习导师',
    prompt: '你是一个耐心的学习导师，擅长用简单易懂的方式解释复杂概念。请根据用户的水平调整解释的深度，并提供相关的例子。',
    icon: '📚',
  },
  {
    id: 'analyst',
    name: '数据分析师',
    prompt: '你是一个专业的数据分析师，擅长数据分析、统计和可视化。请帮助用户理解数据、发现洞察并提供分析建议。',
    icon: '📊',
  },
];

/**
 * PromptSettings Component
 * 
 * Provides controls for customizing system prompts:
 * - Global system prompt editing
 * - Preset role template selection
 * 
 * Requirements: 11.1, 11.3
 * - 11.1: THE Chat_Application SHALL provide a settings panel to configure a global system prompt
 * - 11.3: THE Chat_Application SHALL provide preset role templates (translator, code expert, writing assistant)
 */
const PromptSettings: React.FC = () => {
  const settings = useSettings();
  const updateSettings = useChatStore((state) => state.updateSettings);
  
  // Local state for the prompt text area (for editing before save)
  const [promptText, setPromptText] = useState(settings.globalSystemPrompt);
  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  // Currently selected preset (null if custom)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  // Save feedback state
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Sync local state with store when settings change externally
  useEffect(() => {
    setPromptText(settings.globalSystemPrompt);
    // Check if current prompt matches any preset
    const matchingPreset = DEFAULT_PRESET_TEMPLATES.find(
      (preset) => preset.prompt === settings.globalSystemPrompt
    );
    setSelectedPreset(matchingPreset?.id || null);
  }, [settings.globalSystemPrompt]);

  /**
   * Handle prompt text change
   */
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPromptText(newText);
    setHasChanges(newText !== settings.globalSystemPrompt);
    
    // Check if the new text matches any preset
    const matchingPreset = DEFAULT_PRESET_TEMPLATES.find(
      (preset) => preset.prompt === newText
    );
    setSelectedPreset(matchingPreset?.id || null);
  };

  /**
   * Handle preset template selection
   * Fills the text area with the selected preset's prompt
   */
  const handlePresetSelect = (preset: PresetPrompt) => {
    setPromptText(preset.prompt);
    setSelectedPreset(preset.id);
    setHasChanges(preset.prompt !== settings.globalSystemPrompt);
  };

  /**
   * Save the current prompt to the store
   */
  const handleSave = () => {
    updateSettings({ globalSystemPrompt: promptText });
    setHasChanges(false);
    setShowSaveSuccess(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
  };

  /**
   * Reset to the saved prompt
   */
  const handleReset = () => {
    setPromptText(settings.globalSystemPrompt);
    setHasChanges(false);
    
    // Check if reset text matches any preset
    const matchingPreset = DEFAULT_PRESET_TEMPLATES.find(
      (preset) => preset.prompt === settings.globalSystemPrompt
    );
    setSelectedPreset(matchingPreset?.id || null);
  };

  /**
   * Clear the prompt text
   */
  const handleClear = () => {
    setPromptText('');
    setSelectedPreset(null);
    setHasChanges('' !== settings.globalSystemPrompt);
  };

  return (
    <div className="space-y-6">
      {/* Preset Role Templates */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          预设角色模板
        </label>
        <p className="text-xs text-[var(--muted-foreground)]">
          选择一个预设模板快速配置 AI 助手的角色
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEFAULT_PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={`
                flex items-center gap-2 p-3 rounded-lg
                border-2 transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                ${
                  selectedPreset === preset.id
                    ? 'border-[var(--primary)] bg-[var(--muted)]'
                    : 'border-transparent bg-[var(--muted)] hover:border-[var(--border)]'
                }
              `}
              aria-pressed={selectedPreset === preset.id}
              aria-label={`选择${preset.name}模板`}
            >
              <span className="text-xl" role="img" aria-hidden="true">
                {preset.icon}
              </span>
              <span className="text-sm text-[var(--foreground)] truncate">
                {preset.name}
              </span>
              
              {/* Selected Indicator */}
              {selectedPreset === preset.id && (
                <svg
                  className="w-4 h-4 text-[var(--primary)] ml-auto flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Global System Prompt Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="system-prompt"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            全局系统提示词
          </label>
          {selectedPreset && (
            <span className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded-full">
              {DEFAULT_PRESET_TEMPLATES.find((p) => p.id === selectedPreset)?.name}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          设置 AI 助手的默认行为和角色。此提示词将应用于所有没有单独设置提示词的对话。
        </p>
        <div className="relative">
          <textarea
            id="system-prompt"
            value={promptText}
            onChange={handlePromptChange}
            placeholder="输入系统提示词，例如：你是一个有帮助的 AI 助手..."
            rows={6}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-[var(--muted)] border-2 border-[var(--border)]
              text-[var(--foreground)] placeholder-[var(--muted-foreground)]
              resize-none transition-all duration-200
              focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/20
              ${hasChanges ? 'border-amber-500/50' : ''}
            `}
            aria-describedby="prompt-help"
          />
          {/* Character count */}
          <div className="absolute bottom-2 right-2 text-xs text-[var(--muted-foreground)]">
            {promptText.length} 字符
          </div>
        </div>
        <p id="prompt-help" className="text-xs text-[var(--muted-foreground)]">
          提示：好的系统提示词应该清晰地描述 AI 的角色、能力和回答风格。
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={promptText.length === 0}
            className={`
              px-3 py-2 text-sm rounded-lg
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
              ${
                promptText.length === 0
                  ? 'text-[var(--muted-foreground)] cursor-not-allowed'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
              }
            `}
            aria-label="清空提示词"
          >
            清空
          </button>
          
          {/* Reset Button (only show when there are changes) */}
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="
                px-3 py-2 text-sm rounded-lg
                text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
              "
              aria-label="重置为已保存的提示词"
            >
              重置
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Save Success Feedback */}
          {showSaveSuccess && (
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              已保存
            </span>
          )}
          
          {/* Unsaved Changes Indicator */}
          {hasChanges && !showSaveSuccess && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              有未保存的更改
            </span>
          )}
          
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
              ${
                hasChanges
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md hover:shadow-lg'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
              }
            `}
            aria-label="保存提示词设置"
          >
            保存设置
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          当前生效的提示词
        </label>
        <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
          {settings.globalSystemPrompt ? (
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
              {settings.globalSystemPrompt}
            </p>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)] italic">
              未设置全局系统提示词
            </p>
          )}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          此提示词将在每次对话开始时发送给 AI，用于设定 AI 的角色和行为。
        </p>
      </div>
    </div>
  );
};

export default PromptSettings;
