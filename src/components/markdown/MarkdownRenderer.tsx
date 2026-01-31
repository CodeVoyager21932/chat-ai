'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import type { Components } from 'react-markdown';
import CodeBlock from './CodeBlock';
import 'katex/dist/katex.min.css';

/**
 * Markdown 渲染组件 Props
 */
export interface MarkdownRendererProps {
  /** Markdown 内容 */
  content: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * Markdown 渲染组件
 * 
 * 功能：
 * - 渲染标准 Markdown 语法（标题、粗体、斜体、删除线）
 * - 渲染列表（有序、无序）
 * - 渲染链接（新标签页打开）
 * - 渲染表格
 * - 渲染引用块
 * - 渲染代码块（带语法高亮）
 * - 渲染数学公式（KaTeX）
 * 
 * @requirements 8.1, 8.2, 8.3, 8.4, 8.5, 10.1, 10.2
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  /**
   * 自定义组件映射
   */
  const components: Components = useMemo(() => ({
    // 代码块
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = !match && !String(children).includes('\n');
      
      if (isInline) {
        // 行内代码
        return (
          <code
            className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--accent)] font-mono text-sm"
            {...props}
          >
            {children}
          </code>
        );
      }
      
      // 代码块
      return (
        <CodeBlock language={language}>
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      );
    },
    
    // 链接 - 新标签页打开
    // @requirements 8.3
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--primary)] hover:underline"
        {...props}
      >
        {children}
      </a>
    ),
    
    // 表格
    // @requirements 8.4
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table
          className="min-w-full border-collapse border border-[var(--border)]"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-[var(--muted)]" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th
        className="px-4 py-2 text-left font-semibold border border-[var(--border)]"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className="px-4 py-2 border border-[var(--border)]"
        {...props}
      >
        {children}
      </td>
    ),
    
    // 引用块
    // @requirements 8.5
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-[var(--primary)] pl-4 my-4 italic text-[var(--muted-foreground)]"
        {...props}
      >
        {children}
      </blockquote>
    ),
    
    // 标题
    // @requirements 8.1
    h1: ({ children, ...props }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-xl font-bold mt-5 mb-3" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-lg font-bold mt-4 mb-2" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-base font-bold mt-3 mb-2" {...props}>
        {children}
      </h4>
    ),
    
    // 段落
    p: ({ children, ...props }) => (
      <p className="my-2 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    
    // 列表
    // @requirements 8.2
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside my-2 space-y-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="ml-2" {...props}>
        {children}
      </li>
    ),
    
    // 水平线
    hr: ({ ...props }) => (
      <hr className="my-4 border-[var(--border)]" {...props} />
    ),
    
    // 图片
    img: ({ src, alt, ...props }) => (
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full h-auto rounded-lg my-2"
        loading="lazy"
        {...props}
      />
    ),
    
    // 强调
    // @requirements 8.1
    strong: ({ children, ...props }) => (
      <strong className="font-bold" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    del: ({ children, ...props }) => (
      <del className="line-through" {...props}>
        {children}
      </del>
    ),
  }), []);

  return (
    <div className={`markdown-content prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
