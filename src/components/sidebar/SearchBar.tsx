'use client';

import React, { useCallback } from 'react';

/**
 * 搜索栏组件 Props
 */
export interface SearchBarProps {
  /** 搜索关键词 */
  value: string;
  /** 搜索关键词变化回调 */
  onChange: (value: string) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 搜索栏组件
 * 
 * 功能：
 * - 搜索输入框
 * - 搜索图标
 * - 清除按钮
 * 
 * @requirements 5.7
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = '搜索对话...',
  className = '',
}) => {
  /**
   * 处理输入变化
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  /**
   * 清除搜索
   */
  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full px-4 py-2 pl-10
          rounded-lg
          bg-[var(--input)]
          border border-transparent
          focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20
          text-[var(--foreground)]
          placeholder-[var(--muted-foreground)]
          transition-all duration-200
        "
        aria-label={placeholder}
      />
      {/* 搜索图标 */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
      {/* 清除按钮 */}
      {value && (
        <button
          onClick={handleClear}
          className="
            absolute right-3 top-1/2 -translate-y-1/2 
            p-1 rounded 
            hover:bg-[var(--muted)] 
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
          "
          aria-label="清除搜索"
        >
          <svg 
            className="w-3 h-3 text-[var(--muted-foreground)]" 
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
      )}
    </div>
  );
};

export default SearchBar;
