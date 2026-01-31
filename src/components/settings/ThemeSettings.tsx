'use client';

import React from 'react';
import { useTheme, PRESET_COLORS } from '@/hooks/useTheme';
import type { FontSize } from '@/types';

/**
 * Extended preset colors with gradient for display
 */
const DISPLAY_COLORS = PRESET_COLORS.map(color => ({
  ...color,
  gradient: `linear-gradient(135deg, ${color.value}, ${color.gradientEnd})`,
}));

/**
 * Font size options
 */
const FONT_SIZES: { id: FontSize; name: string; description: string }[] = [
  { id: 'small', name: '小', description: '14px' },
  { id: 'medium', name: '中', description: '16px' },
  { id: 'large', name: '大', description: '18px' },
];

/**
 * ThemeSettings Component
 * 
 * Provides controls for customizing the application theme:
 * - Dark/Light mode toggle
 * - Primary color selection
 * - Font size adjustment
 * 
 * Requirements: 13.1, 13.2, 14.1, 14.2, 15.1, 15.2
 */
const ThemeSettings: React.FC = () => {
  // Use the useTheme hook for all theme management
  const {
    theme,
    toggleTheme,
    setPrimaryColor,
    setFontSize,
  } = useTheme();

  /**
   * Handle theme mode toggle
   */
  const handleModeToggle = () => {
    toggleTheme();
  };

  /**
   * Handle primary color selection
   */
  const handleColorSelect = (color: string) => {
    setPrimaryColor(color);
  };

  /**
   * Handle font size change
   */
  const handleFontSizeChange = (fontSize: FontSize) => {
    setFontSize(fontSize);
  };

  return (
    <div className="space-y-6">
      {/* Dark/Light Mode Toggle */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          外观模式
        </label>
        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
          <div className="flex items-center gap-3">
            {/* Sun icon for light mode */}
            <svg
              className={`w-5 h-5 transition-colors ${
                theme.mode === 'light' ? 'text-yellow-500' : 'text-[var(--muted-foreground)]'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <span className="text-sm text-[var(--foreground)]">
              {theme.mode === 'light' ? '浅色模式' : '深色模式'}
            </span>
          </div>
          
          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={theme.mode === 'dark'}
            onClick={handleModeToggle}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors duration-200 ease-in-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2
              ${theme.mode === 'dark' ? 'bg-[var(--primary)]' : 'bg-gray-300'}
            `}
          >
            <span className="sr-only">切换深色模式</span>
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white shadow-md
                transition-transform duration-200 ease-in-out
                ${theme.mode === 'dark' ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          选择浅色或深色外观模式
        </p>
      </div>

      {/* Primary Color Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          主题色
        </label>
        <div className="grid grid-cols-3 gap-3">
          {DISPLAY_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => handleColorSelect(color.value)}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-lg
                border-2 transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                ${
                  theme.primaryColor === color.value
                    ? 'border-[var(--primary)] bg-[var(--muted)]'
                    : 'border-transparent bg-[var(--muted)] hover:border-[var(--border)]'
                }
              `}
              aria-pressed={theme.primaryColor === color.value}
              aria-label={`选择${color.name}主题色`}
            >
              {/* Color Preview Circle */}
              <div
                className="w-8 h-8 rounded-full shadow-md"
                style={{ background: color.gradient }}
              />
              <span className="text-xs text-[var(--foreground)]">{color.name}</span>
              
              {/* Selected Indicator */}
              {theme.primaryColor === color.value && (
                <div className="absolute top-1 right-1">
                  <svg
                    className="w-4 h-4 text-[var(--primary)]"
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
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          选择应用的主题色，将应用于按钮、链接和强调元素
        </p>
      </div>

      {/* Font Size Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          字体大小
        </label>
        <div className="flex gap-2">
          {FONT_SIZES.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => handleFontSizeChange(size.id)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-3 px-4 rounded-lg
                border-2 transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                ${
                  theme.fontSize === size.id
                    ? 'border-[var(--primary)] bg-[var(--muted)]'
                    : 'border-transparent bg-[var(--muted)] hover:border-[var(--border)]'
                }
              `}
              aria-pressed={theme.fontSize === size.id}
              aria-label={`选择${size.name}字体`}
            >
              <span
                className="font-medium text-[var(--foreground)]"
                style={{
                  fontSize: size.id === 'small' ? '14px' : size.id === 'medium' ? '16px' : '18px',
                }}
              >
                Aa
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {size.name} ({size.description})
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          调整聊天消息的字体大小
        </p>
      </div>

      {/* Preview Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          预览
        </label>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)]">
          <div className="space-y-3">
            {/* User message preview */}
            <div className="flex justify-end">
              <div
                className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-sm text-white"
                style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${DISPLAY_COLORS.find(c => c.value === theme.primaryColor)?.gradientEnd || theme.primaryColor})` }}
              >
                <p
                  style={{
                    fontSize: theme.fontSize === 'small' ? '14px' : theme.fontSize === 'medium' ? '16px' : '18px',
                  }}
                >
                  这是用户消息的预览效果
                </p>
              </div>
            </div>
            
            {/* Assistant message preview */}
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-bl-sm bg-[var(--card)] border border-[var(--border)]">
                <p
                  className="text-[var(--foreground)]"
                  style={{
                    fontSize: theme.fontSize === 'small' ? '14px' : theme.fontSize === 'medium' ? '16px' : '18px',
                  }}
                >
                  这是 AI 回复消息的预览效果
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
