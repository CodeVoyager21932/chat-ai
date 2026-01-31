'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore, useSortedConversations } from '@/store';
import type { Conversation } from '@/types';

/**
 * 右键菜单位置
 */
interface ContextMenuPosition {
  x: number;
  y: number;
}

/**
 * 右键菜单状态
 */
interface ContextMenuState {
  isOpen: boolean;
  position: ContextMenuPosition;
  conversationId: string | null;
}

/**
 * 对话列表组件 Props
 */
export interface ConversationListProps {
  /** 搜索关键词，用于过滤对话 */
  searchQuery?: string;
  /** 是否显示归档的对话 */
  showArchived?: boolean;
  /** 对话点击回调 */
  onConversationClick?: (conversationId: string) => void;
  /** 删除确认回调 */
  onDeleteConfirm?: (conversationId: string) => Promise<boolean>;
}

/**
 * 对话列表组件
 * 
 * 功能：
 * - 显示对话列表（标题、时间、置顶/归档标记）
 * - 点击切换对话
 * - 右键菜单（删除、归档、置顶）
 * - 支持搜索过滤
 * 
 * @requirements 5.1, 5.3, 5.4, 5.5, 5.6
 */
const ConversationList: React.FC<ConversationListProps> = ({
  searchQuery = '',
  showArchived = false,
  onConversationClick,
  onDeleteConfirm,
}) => {
  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    conversationId: null,
  });

  // 删除确认对话框状态
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    conversationId: string | null;
    conversationTitle: string;
  }>({
    isOpen: false,
    conversationId: null,
    conversationTitle: '',
  });

  // 右键菜单引用
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // 从 store 获取状态和方法
  const conversations = useSortedConversations();
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const pinConversation = useChatStore((state) => state.pinConversation);
  const archiveConversation = useChatStore((state) => state.archiveConversation);

  /**
   * 过滤对话列表
   * @requirements 5.1, 5.7
   */
  const filteredConversations = conversations.filter((conv) => {
    // 根据 showArchived 过滤
    if (!showArchived && conv.isArchived) return false;
    if (showArchived && !conv.isArchived) return false;
    
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
    onConversationClick?.(conversationId);
  }, [setCurrentConversation, onConversationClick]);

  /**
   * 处理右键菜单打开
   */
  const handleContextMenu = useCallback((e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      conversationId,
    });
  }, []);

  /**
   * 关闭右键菜单
   */
  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      conversationId: null,
    });
  }, []);

  /**
   * 处理置顶/取消置顶
   * @requirements 5.6
   */
  const handlePin = useCallback(() => {
    if (contextMenu.conversationId) {
      pinConversation(contextMenu.conversationId);
    }
    closeContextMenu();
  }, [contextMenu.conversationId, pinConversation, closeContextMenu]);

  /**
   * 处理归档/取消归档
   * @requirements 5.5
   */
  const handleArchive = useCallback(() => {
    if (contextMenu.conversationId) {
      archiveConversation(contextMenu.conversationId);
    }
    closeContextMenu();
  }, [contextMenu.conversationId, archiveConversation, closeContextMenu]);

  /**
   * 处理删除（显示确认对话框）
   * @requirements 5.4
   */
  const handleDeleteClick = useCallback(() => {
    if (contextMenu.conversationId) {
      const conversation = conversations.find(c => c.id === contextMenu.conversationId);
      setDeleteConfirmation({
        isOpen: true,
        conversationId: contextMenu.conversationId,
        conversationTitle: conversation?.title || '此对话',
      });
    }
    closeContextMenu();
  }, [contextMenu.conversationId, conversations, closeContextMenu]);

  /**
   * 确认删除
   * @requirements 5.4
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteConfirmation.conversationId) {
      // 如果有外部确认回调，先调用
      if (onDeleteConfirm) {
        const confirmed = await onDeleteConfirm(deleteConfirmation.conversationId);
        if (!confirmed) {
          setDeleteConfirmation({ isOpen: false, conversationId: null, conversationTitle: '' });
          return;
        }
      }
      deleteConversation(deleteConfirmation.conversationId);
    }
    setDeleteConfirmation({ isOpen: false, conversationId: null, conversationTitle: '' });
  }, [deleteConfirmation.conversationId, deleteConversation, onDeleteConfirm]);

  /**
   * 取消删除
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmation({ isOpen: false, conversationId: null, conversationTitle: '' });
  }, []);

  /**
   * 点击外部关闭右键菜单
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

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

  /**
   * 获取当前右键菜单对应的对话
   */
  const getContextConversation = (): Conversation | undefined => {
    return conversations.find(c => c.id === contextMenu.conversationId);
  };

  return (
    <>
      {/* ============ 对话列表 ============ */}
      <div className="flex-1 overflow-y-auto px-2" role="list" aria-label="对话列表">
        <div className="space-y-1">
          {filteredConversations.length === 0 ? (
            // 空状态
            <EmptyState searchQuery={searchQuery} showArchived={showArchived} />
          ) : (
            // 对话列表
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => handleConversationClick(conversation.id)}
                onContextMenu={(e) => handleContextMenu(e, conversation.id)}
                formatTime={formatTime}
              />
            ))
          )}
        </div>
      </div>

      {/* ============ 右键菜单 ============ */}
      {contextMenu.isOpen && (
        <ContextMenu
          ref={contextMenuRef}
          position={contextMenu.position}
          conversation={getContextConversation()}
          onPin={handlePin}
          onArchive={handleArchive}
          onDelete={handleDeleteClick}
          onClose={closeContextMenu}
        />
      )}

      {/* ============ 删除确认对话框 ============ */}
      {deleteConfirmation.isOpen && (
        <DeleteConfirmDialog
          conversationTitle={deleteConfirmation.conversationTitle}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
};

/**
 * 空状态组件 Props
 */
interface EmptyStateProps {
  searchQuery: string;
  showArchived: boolean;
}

/**
 * 空状态组件
 */
const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, showArchived }) => {
  return (
    <div className="p-4 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--muted)] flex items-center justify-center">
        <svg 
          className="w-6 h-6 text-[var(--muted-foreground)]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {showArchived ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          )}
        </svg>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">
        {searchQuery 
          ? '没有找到匹配的对话' 
          : showArchived 
            ? '暂无归档对话' 
            : '暂无对话'
        }
      </p>
      <p className="text-xs text-[var(--muted-foreground)] mt-1">
        {searchQuery 
          ? '尝试其他关键词' 
          : showArchived 
            ? '归档的对话会显示在这里' 
            : '点击上方按钮开始新对话'
        }
      </p>
    </div>
  );
};

/**
 * 对话项组件 Props
 */
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  formatTime: (date: Date) => string;
}

/**
 * 对话项组件
 * 显示单个对话的标题、时间和状态标记
 * @requirements 5.1, 5.3
 */
const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  onContextMenu,
  formatTime,
}) => {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
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
      title="右键点击查看更多选项"
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
            {/* 归档标记 */}
            {conversation.isArchived && (
              <svg 
                className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-white/80' : 'text-[var(--muted-foreground)]'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-label="已归档"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
                />
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

/**
 * 右键菜单组件 Props
 */
interface ContextMenuProps {
  position: ContextMenuPosition;
  conversation: Conversation | undefined;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * 右键菜单组件
 * @requirements 5.4, 5.5, 5.6
 */
const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ position, conversation, onPin, onArchive, onDelete, onClose }, ref) => {
    if (!conversation) return null;

    // 计算菜单位置，确保不超出视口
    const menuStyle: React.CSSProperties = {
      position: 'fixed',
      top: position.y,
      left: position.x,
      zIndex: 50,
    };

    return (
      <div
        ref={ref}
        style={menuStyle}
        className="
          min-w-[160px] py-1
          bg-[var(--popover)] 
          border border-[var(--border)]
          rounded-lg shadow-lg
          animate-in fade-in-0 zoom-in-95
        "
        role="menu"
        aria-label="对话操作菜单"
      >
        {/* 置顶/取消置顶 */}
        <button
          onClick={onPin}
          className="
            w-full flex items-center gap-3 px-3 py-2
            text-sm text-[var(--popover-foreground)]
            hover:bg-[var(--muted)]
            transition-colors
          "
          role="menuitem"
        >
          <svg 
            className="w-4 h-4" 
            fill={conversation.isPinned ? 'currentColor' : 'none'}
            stroke="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
          </svg>
          {conversation.isPinned ? '取消置顶' : '置顶'}
        </button>

        {/* 归档/取消归档 */}
        <button
          onClick={onArchive}
          className="
            w-full flex items-center gap-3 px-3 py-2
            text-sm text-[var(--popover-foreground)]
            hover:bg-[var(--muted)]
            transition-colors
          "
          role="menuitem"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
            />
          </svg>
          {conversation.isArchived ? '取消归档' : '归档'}
        </button>

        {/* 分隔线 */}
        <div className="my-1 border-t border-[var(--border)]" />

        {/* 删除 */}
        <button
          onClick={onDelete}
          className="
            w-full flex items-center gap-3 px-3 py-2
            text-sm text-red-500
            hover:bg-red-50 dark:hover:bg-red-950/20
            transition-colors
          "
          role="menuitem"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
          删除
        </button>
      </div>
    );
  }
);

ContextMenu.displayName = 'ContextMenu';

/**
 * 删除确认对话框 Props
 */
interface DeleteConfirmDialogProps {
  conversationTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 删除确认对话框
 * @requirements 5.4
 */
const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  conversationTitle,
  onConfirm,
  onCancel,
}) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* 对话框内容 */}
      <div className="
        relative z-10
        w-full max-w-md mx-4
        bg-[var(--popover)]
        border border-[var(--border)]
        rounded-xl shadow-xl
        p-6
        animate-in fade-in-0 zoom-in-95
      ">
        {/* 警告图标 */}
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
          <svg 
            className="w-6 h-6 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* 标题 */}
        <h3 
          id="delete-dialog-title"
          className="text-lg font-semibold text-center text-[var(--popover-foreground)] mb-2"
        >
          确认删除对话
        </h3>

        {/* 描述 */}
        <p className="text-sm text-center text-[var(--muted-foreground)] mb-6">
          确定要删除 &ldquo;{conversationTitle}&rdquo; 吗？此操作无法撤销。
        </p>

        {/* 按钮组 */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="
              flex-1 px-4 py-2
              rounded-lg
              bg-[var(--muted)]
              text-[var(--muted-foreground)]
              font-medium
              hover:bg-[var(--muted)]/80
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
            "
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="
              flex-1 px-4 py-2
              rounded-lg
              bg-red-500
              text-white
              font-medium
              hover:bg-red-600
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
            "
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
