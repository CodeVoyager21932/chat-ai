'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatContainer from '@/components/chat/ChatContainer';
import ConversationSettings from '@/components/chat/ConversationSettings';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { useChatStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { exportConversation } from '@/lib/export';
import type { ExportFormat } from '@/types';

/**
 * Main page component
 */
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationSettingsOpen, setConversationSettingsOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Get conversation data - only the fields we need
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const conversationTitle = useChatStore((state) => {
    if (!state.currentConversationId) return '新对话';
    const conv = state.conversations.find(c => c.id === state.currentConversationId);
    return conv?.title || '新对话';
  });
  const hasMessages = useChatStore((state) => {
    if (!state.currentConversationId) return false;
    const conv = state.conversations.find(c => c.id === state.currentConversationId);
    return (conv?.messages?.length || 0) > 0;
  });
  
  // Get full conversation only for export and settings modal
  const getFullConversation = useChatStore((state) => state.getCurrentConversation);
  
  // Initialize theme
  useTheme();

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    if (exportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportMenuOpen]);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const handleOpenConversationSettings = useCallback(() => {
    if (currentConversationId) {
      setConversationSettingsOpen(true);
    }
  }, [currentConversationId]);

  const handleCloseConversationSettings = useCallback(() => {
    setConversationSettingsOpen(false);
  }, []);

  const handleExport = useCallback(async (format: ExportFormat) => {
    const conversation = getFullConversation();
    if (!conversation) return;
    try {
      await exportConversation(conversation, format);
      setExportMenuOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [getFullConversation]);

  // Get conversation for modal (only when needed)
  const conversationForModal = conversationSettingsOpen ? getFullConversation() : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        onOpenSettings={handleOpenSettings}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[var(--background)]">
        <header className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            aria-label="打开侧边栏"
          >
            <svg className="w-6 h-6 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-[var(--foreground)] truncate flex-1 lg:ml-0 ml-2">
            {conversationTitle}
          </h2>

          <div className="flex items-center gap-1">
            {currentConversationId && (
              <button
                onClick={handleOpenConversationSettings}
                className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                aria-label="对话设置"
                title="对话设置"
              >
                <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            )}

            {currentConversationId && hasMessages && (
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                  aria-label="导出对话"
                  title="导出对话"
                >
                  <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                
                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--popover)] border border-[var(--border)] rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('markdown')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--popover-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        导出为 Markdown
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--popover-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        导出为 JSON
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--popover-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        导出为 PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleOpenSettings}
              className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
              aria-label="打开设置"
              title="全局设置"
            >
              <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        <ChatContainer
          conversationId={currentConversationId}
          className="flex-1"
        />
      </main>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={handleCloseSettings}
      />

      {conversationForModal && (
        <ConversationSettings
          conversation={conversationForModal}
          isOpen={conversationSettingsOpen}
          onClose={handleCloseConversationSettings}
        />
      )}
    </div>
  );
}
