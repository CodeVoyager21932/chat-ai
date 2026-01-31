// lib/export.ts
// Export utility functions for conversation export
// Requirements: 16.1, 16.2, 16.3, 16.4

import type { Conversation, ExportFormat } from '@/types';

/**
 * Format date as YYYYMMDD for filename
 * @param date Date object or date string
 * @returns Formatted date string (YYYYMMDD)
 */
export function formatDateForFilename(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Format date as YYYY-MM-DD for display
 * @param date Date object or date string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time as HH:MM:SS for display
 * @param date Date object or date string
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Sanitize filename by removing unsafe characters
 * @param title Original title
 * @returns Safe filename
 */
export function sanitizeFilename(title: string): string {
  // Remove or replace unsafe filename characters
  return title
    .replace(/[<>:"/\\|?*]/g, '_')  // Replace Windows disallowed characters
    .replace(/\s+/g, '_')           // Replace spaces with underscores
    .replace(/_+/g, '_')            // Merge multiple underscores
    .replace(/^_|_$/g, '')          // Remove leading/trailing underscores
    .substring(0, 50);              // Limit length
}

/**
 * Generate export filename
 * Requirement 16.4: THE exported file SHALL be named with the conversation title and export date
 * Format: {title}_{YYYYMMDD}.{ext}
 * 
 * @param title Conversation title
 * @param format Export format
 * @returns Filename
 */
export function generateFilename(title: string, format: ExportFormat): string {
  const sanitizedTitle = sanitizeFilename(title) || 'conversation';
  const date = formatDateForFilename(new Date());
  const extension = format === 'markdown' ? 'md' : format;
  return `${sanitizedTitle}_${date}.${extension}`;
}

/**
 * Export conversation to Markdown format
 * Requirement 16.1: WHEN a user exports as Markdown, THE Chat_Application SHALL generate 
 * a .md file with formatted conversation content
 * 
 * @param conversation Conversation object
 * @returns Markdown formatted string
 */
export function exportToMarkdown(conversation: Conversation): string {
  const lines: string[] = [];
  
  // Title
  lines.push(`# ${conversation.title}`);
  lines.push('');
  
  // Metadata
  lines.push('## Conversation Info');
  lines.push('');
  lines.push(`- **Model**: ${conversation.model}`);
  lines.push(`- **Created**: ${formatDate(conversation.createdAt)} ${formatTime(conversation.createdAt)}`);
  lines.push(`- **Updated**: ${formatDate(conversation.updatedAt)} ${formatTime(conversation.updatedAt)}`);
  
  if (conversation.systemPrompt) {
    lines.push(`- **System Prompt**: ${conversation.systemPrompt}`);
  }
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Conversation content
  lines.push('## Messages');
  lines.push('');
  
  for (const message of conversation.messages) {
    // Skip system messages
    if (message.role === 'system') {
      continue;
    }
    
    const roleLabel = message.role === 'user' ? '👤 **User**' : '🤖 **Assistant**';
    const timestamp = formatTime(message.createdAt);
    
    lines.push(`### ${roleLabel} (${timestamp})`);
    lines.push('');
    lines.push(message.content);
    lines.push('');
    
    // List attachments if any
    if (message.attachments && message.attachments.length > 0) {
      lines.push('**Attachments:**');
      for (const attachment of message.attachments) {
        const typeLabel = attachment.type === 'image' ? '🖼️' : '📄';
        lines.push(`- ${typeLabel} ${attachment.name}`);
      }
      lines.push('');
    }
  }
  
  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Exported at: ${formatDate(new Date())} ${formatTime(new Date())}*`);
  
  return lines.join('\n');
}

/**
 * Export conversation to JSON format
 * Requirement 16.2: WHEN a user exports as JSON, THE Chat_Application SHALL generate 
 * a .json file with complete conversation data
 * 
 * @param conversation Conversation object
 * @returns JSON formatted string
 */
export function exportToJson(conversation: Conversation): string {
  // Create export data with complete conversation info
  const exportData = {
    ...conversation,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate HTML content for PDF export
 * Creates a styled HTML representation of the conversation
 * 
 * @param conversation Conversation object
 * @returns HTML string
 */
export function generatePdfHtml(conversation: Conversation): string {
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      }
      h1 { 
        font-size: 24px; 
        margin-bottom: 20px;
        color: #1a1a1a;
        border-bottom: 2px solid #667eea;
        padding-bottom: 10px;
      }
      .meta { 
        background: #f5f5f5;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 30px;
        font-size: 14px;
      }
      .meta p { margin: 5px 0; }
      .meta strong { color: #555; }
      .messages { margin-top: 20px; }
      .message { 
        margin-bottom: 20px;
        padding: 15px;
        border-radius: 8px;
      }
      .message.user { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-left: 50px;
      }
      .message.assistant { 
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        margin-right: 50px;
      }
      .message-header { 
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 14px;
        opacity: 0.9;
      }
      .message-content { 
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .attachments {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(0,0,0,0.1);
        font-size: 13px;
      }
      .footer { 
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        font-size: 12px;
        color: #666;
        text-align: center;
      }
      pre {
        background: #2d2d2d;
        color: #f8f8f2;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 13px;
        margin: 10px 0;
      }
      code {
        background: rgba(0,0,0,0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 13px;
      }
    </style>
  `;

  let messagesHtml = '';
  for (const message of conversation.messages) {
    if (message.role === 'system') continue;
    
    const roleLabel = message.role === 'user' ? '👤 User' : '🤖 Assistant';
    const timestamp = formatTime(message.createdAt);
    
    let attachmentsHtml = '';
    if (message.attachments && message.attachments.length > 0) {
      const attachmentsList = message.attachments
        .map(a => `${a.type === 'image' ? '🖼️' : '📄'} ${a.name}`)
        .join('<br>');
      attachmentsHtml = `<div class="attachments"><strong>Attachments:</strong><br>${attachmentsList}</div>`;
    }
    
    // Escape HTML in content but preserve line breaks
    const escapedContent = escapeHtml(message.content);
    
    messagesHtml += `
      <div class="message ${message.role}">
        <div class="message-header">${roleLabel} · ${timestamp}</div>
        <div class="message-content">${escapedContent}</div>
        ${attachmentsHtml}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(conversation.title)}</title>
      ${styles}
    </head>
    <body>
      <h1>${escapeHtml(conversation.title)}</h1>
      <div class="meta">
        <p><strong>Model:</strong> ${escapeHtml(conversation.model)}</p>
        <p><strong>Created:</strong> ${formatDate(conversation.createdAt)} ${formatTime(conversation.createdAt)}</p>
        <p><strong>Updated:</strong> ${formatDate(conversation.updatedAt)} ${formatTime(conversation.updatedAt)}</p>
        ${conversation.systemPrompt ? `<p><strong>System Prompt:</strong> ${escapeHtml(conversation.systemPrompt)}</p>` : ''}
      </div>
      <div class="messages">
        ${messagesHtml}
      </div>
      <div class="footer">
        Exported at: ${formatDate(new Date())} ${formatTime(new Date())}
      </div>
    </body>
    </html>
  `;
}

/**
 * Escape HTML special characters
 * @param text Text to escape
 * @returns Escaped text
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}

/**
 * Export conversation to PDF format (client-side only)
 * Requirement 16.3: WHEN a user exports as PDF, THE Chat_Application SHALL generate 
 * a .pdf file with styled conversation content
 * 
 * This function must be called from the client side as it uses browser APIs
 * 
 * @param conversation Conversation object
 * @returns Promise that resolves when PDF is downloaded
 */
export async function exportToPdf(conversation: Conversation): Promise<void> {
  // Dynamic import to avoid SSR issues
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // Create a temporary container for rendering
  const container = document.createElement('div');
  container.innerHTML = generatePdfHtml(conversation);
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = 'white';
  document.body.appendChild(container);

  try {
    // Render HTML to canvas
    const canvas = await html2canvas(container, {
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    } as Parameters<typeof html2canvas>[1]);

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    // Generate filename and save
    const filename = generateFilename(conversation.title, 'pdf');
    pdf.save(filename);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Trigger file download in browser
 * @param content File content
 * @param filename Filename
 * @param mimeType MIME type
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Unified export interface for all formats
 * Handles Markdown, JSON, and PDF exports
 * 
 * @param conversation Conversation to export
 * @param format Export format
 */
export async function exportConversation(
  conversation: Conversation,
  format: ExportFormat
): Promise<void> {
  const filename = generateFilename(conversation.title, format);

  switch (format) {
    case 'markdown': {
      const content = exportToMarkdown(conversation);
      downloadFile(content, filename, 'text/markdown; charset=utf-8');
      break;
    }
    case 'json': {
      const content = exportToJson(conversation);
      downloadFile(content, filename, 'application/json; charset=utf-8');
      break;
    }
    case 'pdf': {
      await exportToPdf(conversation);
      break;
    }
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
