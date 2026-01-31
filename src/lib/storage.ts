// lib/storage.ts
// 存储服务 - 负责将对话数据持久化到本地文件夹
// Requirements: 6.1, 6.2, 6.3, 6.4

import fs from 'fs/promises';
import path from 'path';
import type { Conversation } from '@/types';

/**
 * 存储目录路径
 * 可通过环境变量 CHAT_STORAGE_DIR 配置，默认为 ./data/conversations
 */
const STORAGE_DIR = process.env.CHAT_STORAGE_DIR || './data/conversations';

/**
 * 确保存储目录存在
 * 如果目录不存在，则递归创建
 * @internal
 */
async function ensureStorageDir(): Promise<void> {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

/**
 * 读取所有对话
 * 从存储目录读取所有 JSON 文件并解析为 Conversation 对象
 * 返回按更新时间降序排列的对话列表
 * 
 * @returns Promise<Conversation[]> 对话列表，按 updatedAt 降序排列
 * @throws 如果读取文件或解析 JSON 失败
 * 
 * Requirements: 6.2 - WHEN the Chat_Application loads, THE Storage_Service SHALL read all conversations from the local folder
 */
export async function readConversations(): Promise<Conversation[]> {
  await ensureStorageDir();
  
  const files = await fs.readdir(STORAGE_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  const conversations = await Promise.all(
    jsonFiles.map(async (filename) => {
      const filePath = path.join(STORAGE_DIR, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // 确保日期字段被正确解析为 Date 对象
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        messages: data.messages.map((msg: { createdAt: string | Date; [key: string]: unknown }) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        })),
      } as Conversation;
    })
  );
  
  // 按更新时间降序排列（最新的在前）
  return conversations.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * 写入/更新对话
 * 将对话保存为 JSON 文件，文件名为 {conversation.id}.json
 * 
 * @param conversation 要保存的对话对象
 * @throws 如果写入文件失败
 * 
 * Requirements: 6.1 - WHEN a message is sent or received, THE Storage_Service SHALL save the conversation to a JSON file
 * Requirements: 6.3 - THE Storage_Service SHALL store each conversation as a separate JSON file with a unique identifier
 */
export async function writeConversation(conversation: Conversation): Promise<void> {
  await ensureStorageDir();
  
  const filePath = path.join(STORAGE_DIR, `${conversation.id}.json`);
  const content = JSON.stringify(conversation, null, 2);
  
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 删除对话
 * 从存储目录删除指定 ID 的对话文件
 * 
 * @param id 要删除的对话 ID
 * @throws 如果文件不存在或删除失败
 * 
 * Requirements: 6.4 - WHEN a conversation is deleted, THE Storage_Service SHALL remove the corresponding JSON file
 */
export async function deleteConversation(id: string): Promise<void> {
  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  await fs.unlink(filePath);
}

/**
 * 检查对话是否存在
 * 
 * @param id 对话 ID
 * @returns Promise<boolean> 对话是否存在
 */
export async function conversationExists(id: string): Promise<boolean> {
  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取单个对话
 * 
 * @param id 对话 ID
 * @returns Promise<Conversation | null> 对话对象，如果不存在则返回 null
 */
export async function readConversation(id: string): Promise<Conversation | null> {
  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // 确保日期字段被正确解析为 Date 对象
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      messages: data.messages.map((msg: { createdAt: string | Date; [key: string]: unknown }) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })),
    } as Conversation;
  } catch {
    return null;
  }
}

/**
 * 获取存储目录路径
 * 用于测试和调试
 * 
 * @returns 存储目录路径
 */
export function getStorageDir(): string {
  return STORAGE_DIR;
}
