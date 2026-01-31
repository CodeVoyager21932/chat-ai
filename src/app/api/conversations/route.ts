// app/api/conversations/route.ts
// 对话管理 API 路由
// Requirements: 5.1, 5.4, 6.1, 6.4

import { NextResponse } from 'next/server';
import { 
  readConversations, 
  writeConversation, 
  deleteConversation 
} from '@/lib/storage';
import type { Conversation } from '@/types';

/**
 * GET - 获取所有对话
 * 从存储服务读取所有对话并返回
 * 
 * @returns 对话列表，按更新时间降序排列
 * 
 * Requirements: 5.1 - THE Sidebar SHALL display a list of all conversations with their titles
 */
export async function GET() {
  try {
    const conversations = await readConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Failed to read conversations:', error);
    return NextResponse.json(
      { error: 'Failed to read conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST - 创建/更新对话
 * 将对话保存到存储服务
 * 
 * @param request 包含 Conversation 对象的请求
 * @returns 成功状态
 * 
 * Requirements: 6.1 - WHEN a message is sent or received, THE Storage_Service SHALL save the conversation
 */
export async function POST(request: Request) {
  try {
    const conversation: Conversation = await request.json();
    
    // 验证必要字段
    if (!conversation.id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    await writeConversation(conversation);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 删除对话
 * 从存储服务删除指定 ID 的对话
 * 
 * @param request 包含对话 ID 的请求
 * @returns 成功状态
 * 
 * Requirements: 5.4 - WHEN a user deletes a conversation, THE Conversation_Manager SHALL remove it
 * Requirements: 6.4 - WHEN a conversation is deleted, THE Storage_Service SHALL remove the corresponding JSON file
 */
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    // 验证 ID 参数
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    await deleteConversation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    // 检查是否是文件不存在的错误
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    console.error('Failed to delete conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
