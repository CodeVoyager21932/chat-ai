'use client';

import React, { useState, useCallback } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

/**
 * 代码块组件 Props
 */
export interface CodeBlockProps {
  /** 代码内容 */
  children: string;
  /** 编程语言 */
  language?: string;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 代码块组件
 * 
 * 功能：
 * - 语法高亮
 * - 行号显示
 * - 语言标签
 * - 复制按钮
 * 
 * @requirements 9.1, 9.2, 9.3, 9.4
 */
const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = '',
  showLineNumbers = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  /**
   * 复制代码到剪贴板
   * @requirements 9.4
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [children]);

  /**
   * 获取语言显示名称
   */
  const getLanguageLabel = (lang: string): string => {
    const languageMap: Record<string, string> = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      tsx: 'TSX',
      jsx: 'JSX',
      py: 'Python',
      python: 'Python',
      rb: 'Ruby',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      cs: 'C#',
      csharp: 'C#',
      php: 'PHP',
      swift: 'Swift',
      kotlin: 'Kotlin',
      sql: 'SQL',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      sass: 'Sass',
      less: 'Less',
      json: 'JSON',
      yaml: 'YAML',
      yml: 'YAML',
      xml: 'XML',
      md: 'Markdown',
      markdown: 'Markdown',
      bash: 'Bash',
      sh: 'Shell',
      shell: 'Shell',
      powershell: 'PowerShell',
      ps1: 'PowerShell',
      dockerfile: 'Dockerfile',
      docker: 'Docker',
      graphql: 'GraphQL',
      prisma: 'Prisma',
    };
    return languageMap[lang.toLowerCase()] || lang.toUpperCase() || 'Code';
  };

  return (
    <div className={`relative group my-4 rounded-lg overflow-hidden ${className}`}>
      {/* 头部：语言标签和复制按钮 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--muted)] border-b border-[var(--border)]">
        {/* 语言标签 */}
        {/* @requirements 9.3 */}
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          {getLanguageLabel(language)}
        </span>
        
        {/* 复制按钮 */}
        {/* @requirements 9.4 */}
        <button
          onClick={handleCopy}
          className="
            flex items-center gap-1.5
            px-2 py-1 rounded
            text-xs text-[var(--muted-foreground)]
            hover:bg-[var(--border)] hover:text-[var(--foreground)]
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
          "
          aria-label={copied ? '已复制' : '复制代码'}
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
      </div>

      {/* 代码内容 */}
      <Highlight
        theme={themes.vsDark}
        code={children}
        language={language || 'text'}
      >
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${highlightClassName} overflow-x-auto p-4 text-sm`}
            style={{ ...style, margin: 0, background: 'var(--muted)' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                {/* 行号 */}
                {/* @requirements 9.2 */}
                {showLineNumbers && (
                  <span className="table-cell pr-4 text-right select-none text-[var(--muted-foreground)] opacity-50 w-8">
                    {i + 1}
                  </span>
                )}
                {/* 代码内容 */}
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
