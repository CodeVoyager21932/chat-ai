'use client';

import React, { useState, useCallback } from 'react';
import { useChatStore } from '@/store';

/**
 * ApiSettings Component
 * 
 * Provides controls for configuring API keys and endpoints:
 * - OpenAI API key
 * - Anthropic API key
 * - Google AI API key
 * - Custom endpoint configuration
 */
const ApiSettings: React.FC = () => {
  const apiConfig = useChatStore((state) => state.settings.apiConfig);
  const updateApiConfig = useChatStore((state) => state.updateApiConfig);
  
  // Local state for showing/hiding API keys
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);

  const handleOpenaiChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateApiConfig({ openaiApiKey: e.target.value });
  }, [updateApiConfig]);

  const handleAnthropicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateApiConfig({ anthropicApiKey: e.target.value });
  }, [updateApiConfig]);

  const handleGoogleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateApiConfig({ googleApiKey: e.target.value });
  }, [updateApiConfig]);

  const handleCustomEndpointChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateApiConfig({ customEndpoint: e.target.value });
  }, [updateApiConfig]);

  const handleUseCustomEndpointChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateApiConfig({ useCustomEndpoint: e.target.checked });
  }, [updateApiConfig]);

  return (
    <div className="space-y-6">
      {/* OpenAI API Key */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          OpenAI API Key
        </label>
        <div className="relative">
          <input
            type={showOpenai ? 'text' : 'password'}
            value={apiConfig?.openaiApiKey || ''}
            onChange={handleOpenaiChange}
            placeholder="sk-..."
            className="w-full px-4 py-2 pr-12 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowOpenai(!showOpenai)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {showOpenai ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          用于 GPT-4o、GPT-4o Mini 等模型
        </p>
      </div>

      {/* Anthropic API Key */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Anthropic API Key
        </label>
        <div className="relative">
          <input
            type={showAnthropic ? 'text' : 'password'}
            value={apiConfig?.anthropicApiKey || ''}
            onChange={handleAnthropicChange}
            placeholder="sk-ant-..."
            className="w-full px-4 py-2 pr-12 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowAnthropic(!showAnthropic)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {showAnthropic ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          用于 Claude 3.5 Sonnet、Claude 3 Haiku 等模型
        </p>
      </div>

      {/* Google AI API Key */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Google AI API Key
        </label>
        <div className="relative">
          <input
            type={showGoogle ? 'text' : 'password'}
            value={apiConfig?.googleApiKey || ''}
            onChange={handleGoogleChange}
            placeholder="AIza..."
            className="w-full px-4 py-2 pr-12 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowGoogle(!showGoogle)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {showGoogle ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          用于 Gemini Pro、Gemini Flash 等模型
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border)] pt-4">
        <h4 className="text-sm font-medium text-[var(--foreground)] mb-4">高级设置</h4>
        
        {/* Custom Endpoint Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              使用自定义 API 端点
            </label>
            <p className="text-xs text-[var(--muted-foreground)]">
              用于代理服务器或自托管模型
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={apiConfig?.useCustomEndpoint || false}
              onChange={handleUseCustomEndpointChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ring)] rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
          </label>
        </div>

        {/* Custom Endpoint Input */}
        {apiConfig?.useCustomEndpoint && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              自定义 API 端点
            </label>
            <input
              type="text"
              value={apiConfig?.customEndpoint || ''}
              onChange={handleCustomEndpointChange}
              placeholder="https://api.example.com/v1"
              className="w-full px-4 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20 transition-all"
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              输入兼容 OpenAI API 格式的端点地址
            </p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              安全提示
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              API 密钥存储在浏览器本地，不会上传到服务器。请勿在公共设备上保存密钥。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
