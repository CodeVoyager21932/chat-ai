// lib/export.ts
// 导出功能工具函数
// Requirements: 16.1, 16.2, 16.4

import type { Conversation, ExportFormat } from '@/types';

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象或日期字符串
 * @returns 格式化的日期字符串
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化时间为 HH:MM:SS 格式
 * @param date 日期对象或日期字符串
 * @returns 格式化的时间字符串
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 清理文件名，移除不安全字符
 * @param title 原始标题
 * @returns 安全的文件名
 */
export function sanitizeFilename(title: string): string {
  // 移除或替换不安全的文件名字符
  return title
    .replace(/[<>:"/\\|?*]/g, '_')  // 替换 Windows 不允许的字符
    .replace(/\s+/g, '_')           // 替换空格为下划线
    .replace(/_+/g, '_')            // 合并多个下划线
    .replace(/^_|_$/g, '')          // 移除首尾下划线
    .substring(0, 50);              // 限制长度
}

/**
 * 生成导出文件名
 * Requirement 16.4: THE exported file SHALL be named with the conversation title and export date
 * 
 * @param title 对话标题
 * @param format 导出格式
 * @returns 文件名
 */
export function generateFilename(title: string, format: ExportFormat): string {
  const sanitizedTitle = sanitizeFilename(title) || 'conversation';
  const date = formatDate(new Date());
  const extension = format === 'markdown' ? 'md' : format;
  return `${sanitizedTitle}_${date}.${extension}`;
}

/**
 * 将对话导出为 Markdown 格式
 * Requirement 16.1: WHEN a user exports as Markdown, THE Chat_Application SHALL generate 
 * a .md file with formatted conversation content
 * 
 * @param conversation 对话对象
 * @returns Markdown 格式的字符串
 */
export function exportToMarkdown(conversation: Conversation): string {
  const lines: string[] = [];
  
  // 标题
  lines.push(`# ${conversation.title}`);
  lines.push('');
  
  // 元数据
  lines.push('## 对话信息');
  lines.push('');
  lines.push(`- **模型**: ${conversation.model}`);
  lines.push(`- **创建时间**: ${formatDate(conversation.createdAt)} ${formatTime(conversation.createdAt)}`);
  lines.push(`- **更新时间**: ${formatDate(conversation.updatedAt)} ${formatTime(conversation.updatedAt)}`);
  
  if (conversation.systemPrompt) {
    lines.push(`- **系统提示词**: ${conversation.systemPrompt}`);
  }
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // 对话内容
  lines.push('## 对话内容');
  lines.push('');
  
  for (const message of conversation.messages) {
    // 跳过系统消息
    if (message.role === 'system') {
      continue;
    }
    
    const roleLabel = message.role === 'user' ? '👤 **用户**' : '🤖 **助手**';
    const timestamp = formatTime(message.createdAt);
    
    lines.push(`### ${roleLabel} (${timestamp})`);
    lines.push('');
    lines.push(message.content);
    lines.push('');
    
    // 如果有附件，列出附件信息
    if (message.attachments && message.attachments.length > 0) {
      lines.push('**附件:**');
      for (const attachment of message.attachments) {
        const typeLabel = attachment.type === 'image' ? '🖼️' : '📄';
        lines.push(`- ${typeLabel} ${attachment.name}`);
      }
      lines.push('');
    }
  }
  
  // 页脚
  lines.push('---');
  lines.push('');
  lines.push(`*导出时间: ${formatDate(new Date())} ${formatTime(new Date())}*`);
  
  return lines.join('\n');
}

/**
 * 将对话导出为 JSON 格式
 * Requirement 16.2: WHEN a user exports as JSON, THE Chat_Application SHALL generate 
 * a .json file with complete conversation data
 * 
 * @param conversation 对话对象
 * @returns JSON 格式的字符串
 */
export function exportToJson(conversation: Conversation): string {
  // 创建导出数据，包含完整的对话信息
  const exportData = {
    ...conversation,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  
  return JSON.stringify(exportData, null, 2);
}
