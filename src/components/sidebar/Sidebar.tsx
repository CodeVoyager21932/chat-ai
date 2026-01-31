'use client';

import React, { useState, useCallback } from 'react';
import { useChatStore, useSortedConversations } from '@/store';
import type { Conversation } from '@/types';

/**
 * 侧边栏组件 Props
 */
export interface SidebarProps {
  /** 侧边栏是否打开（移动端） */
  isOpen?: boolean;
  /** 关闭侧边栏回调（移动端） */
  onClose?: () => void;
  /** 打开设置面板回调 */
  onOpenSettings?: () => void;
}

/**
 * 侧边栏主组件
 * 
 * 功能：
 * - 显示应用 Logo/标题
 * - 新建对话按钮
 * - 搜索栏
 * - 对话列表容器
 * - 设置按钮
 * 
 * 支持响应式设计，移动端可折叠
 * 
 * @requirements 5.1, 5.2
 */
const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  onOpenSettings,
}) => {
  // 搜索关键词状态
  const [searchQuery, setSearchQuery] = useState('');
  
  // 从 store 获取状态和方法
  const conversations = useSortedConversations();
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const createConversation = useChatStore((state) => state.createConversation);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);

  /**
   * 处理新建对话
   * @requirements 5.2
   */
  const handleNewChat = useCallback(() => {
    const newId = createConversation();
    setCurrentConversation(newId);
    // 移动端关闭侧边栏
    onClose?.();
  }, [createConversation, setCurrentConversation, onClose]);

  /**
   * 处理搜索输入变化
   * @requirements 5.7
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  /**
   * 过滤对话列表
   * 根据搜索关键词过滤，只显示非归档的对话
   * @requirements 5.1, 5.7
   */
  const filteredConversations = conversations.filter((conv) => {
    // 过滤归档的对话
    if (conv.isArchived) return false;
    // 如果有搜索关键词，按标题过滤
    if (searchQuery.trim()) {
      return conv.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  /**
   * 处理对话点击
   * @requirements 5.3
   */
  const handleConversationClick = useCallback((conversationId: string) => {
    setCurrentConversation(conversationId);
    // 移动端关闭侧边栏
    onClose?.();
  }, [setCurrentConversation, onClose]);

  /**
   * 格式化时间显示
   */
  const formatTime = (date: Date): string => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return messageDate.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30
        w-72 
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-[var(--sidebar)] 
        border-r border-[var(--border)]
        flex flex-col
      `}
      role="complementary"
      aria-label="侧边栏"
    >
      {/* ============ 侧边栏头部 - Logo/标题 ============ */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-bold gradient-text">
          AI Chat
        </h1>
        {/* 移动端关闭按钮 */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          aria-label="关闭侧边栏"
        >
          <svg 
            className="w-5 h-5 text-[var(--muted-foreground)]" 
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
      </div>

      {/* ============ 新建对话按钮 ============ */}
      {/* @requirements 5.2 */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            gradient-bg
            text-white font-medium
            hover:opacity-90
            transition-all duration-200
            shadow-md hover:shadow-lg
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2
          "
          aria-label="新建对话"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          新建对话
        </button>
      </div>

      {/* ============ 搜索栏 ============ */}
      {/* @requirements 5.7 */}
      <div className="px-4 pb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="搜索对话..."
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
            aria-label="搜索对话"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          {/* 清除搜索按钮 */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--muted)] transition-colors"
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
      </div>

      {/* ============ 对话列表容器 ============ */}
      {/* @requirements 5.1 */}
      <div className="flex-1 overflow-y-auto px-2" role="list" aria-label="对话列表">
        <div className="space-y-1">
          {filteredConversations.length === 0 ? (
            // 空状态
            <div className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-[var(--muted-foreground)]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {searchQuery ? '没有找到匹配的对话' : '暂无对话'}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {searchQuery ? '尝试其他关键词' : '点击上方按钮开始新对话'}
              </p>
            </div>
          ) : (
            // 对话列表
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => handleConversationClick(conversation.id)}
                formatTime={formatTime}
              />
            ))
          )}
        </div>
      </div>

      {/* ============ 侧边栏底部 - 设置按钮 ============ */}
      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={onOpenSettings}
          className="
            w-full flex items-center gap-3
            px-4 py-2 rounded-lg
            text-[var(--sidebar-foreground)]
            hover:bg-[var(--muted)]
            transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
          "
          aria-label="打开设置"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          设置
        </button>
      </div>
    </aside>
  );
};

/**
 * 对话项组件 Props
 */
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  formatTime: (date: Date) => string;
}

/**
 * 对话项组件
 * 显示单个对话的标题、时间和状态标记
 */
const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  formatTime,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg text-left
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
        ${isActive 
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
          : 'hover:bg-[var(--muted)] text-[var(--sidebar-foreground)]'
        }
      `}
      role="listitem"
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {/* 置顶标记 */}
            {conversation.isPinned && (
              <svg 
                className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-white/80' : 'text-[var(--primary)]'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-label="已置顶"
              >
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
            )}
            {/* 对话标题 */}
            <p className="text-sm font-medium truncate">
              {conversation.title}
            </p>
          </div>
          {/* 最后更新时间 */}
          <p className={`text-xs mt-1 ${isActive ? 'text-white/70' : 'text-[var(--muted-foreground)]'}`}>
            {formatTime(conversation.updatedAt)}
          </p>
        </div>
        {/* 消息数量指示 */}
        {conversation.messages.length > 0 && (
          <span 
            className={`
              text-xs px-1.5 py-0.5 rounded-full flex-shrink-0
              ${isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
              }
            `}
          >
            {conversation.messages.length}
          </span>
        )}
      </div>
    </button>
  );
};

export default Sidebar;
