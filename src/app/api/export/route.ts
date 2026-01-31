// app/api/export/route.ts
// 导出 API 路由 - 支持 Markdown 和 JSON 格式导出
// Requirements: 16.1, 16.2, 16.4

import { NextResponse } from 'next/server';
import type { Conversation, ExportFormat } from '@/types';
import { 
  generateFilename, 
  exportToMarkdown, 
  exportToJson 
} from '@/lib/export';

/**
 * 导出请求参数
 */
interface ExportRequest {
  /** 要导出的对话 */
  conversation: Conversation;
  /** 导出格式 */
  format: ExportFormat;
}

/**
 * POST /api/export
 * 处理对话导出请求
 * 
 * Requirements:
 * - 16.1: Markdown 导出
 * - 16.2: JSON 导出
 * - 16.4: 文件命名包含标题和日期
 */
export async function POST(request: Request) {
  try {
    // 解析请求体
    const body: ExportRequest = await request.json();
    const { conversation, format } = body;
    
    // 验证必要参数
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation is required' },
        { status: 400 }
      );
    }
    
    if (!format || !['markdown', 'json', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid export format. Supported formats: markdown, json, pdf' },
        { status: 400 }
      );
    }
    
    // PDF 导出暂不支持（需要在客户端使用 jsPDF + html2canvas）
    if (format === 'pdf') {
      return NextResponse.json(
        { error: 'PDF export should be handled on the client side' },
        { status: 400 }
      );
    }
    
    // 生成文件名
    const filename = generateFilename(conversation.title, format);
    
    // 根据格式生成内容
    let content: string;
    let contentType: string;
    
    if (format === 'markdown') {
      content = exportToMarkdown(conversation);
      contentType = 'text/markdown; charset=utf-8';
    } else {
      // JSON 格式
      content = exportToJson(conversation);
      contentType = 'application/json; charset=utf-8';
    }
    
    // 返回响应，包含适当的 Content-Type 和 Content-Disposition 头
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'X-Filename': filename,
      },
    });
    
  } catch (error) {
    console.error('Export API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    );
  }
}
