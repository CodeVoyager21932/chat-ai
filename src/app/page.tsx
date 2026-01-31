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
 * Integrates all components: Sidebar, ChatContainer, SettingsPanel, ConversationSettings
 * Implements responsive layout with collapsible sidebar on mobile
 * Ensures proper component communication and state synchronization
 * 
 * @requirements All - Integration of all components
 */
export default function Home() {
  // Sidebar collapsed state (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Settings panel state
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Conversation settings modal state
  const [conversationSettingsOpen, setConversationSettingsOpen] = useState(false);
  
  // Export dropdown state
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Get current conversation from store
  const getCurrentConversation = useChatStore((state) => state.getCurrentConversation);
  const currentConversation = getCurrentConversation();
  
  // Initialize theme on app startup
  // This ensures theme is applied correctly when the app loads
  // @requirements 13.1, 13.2, 13.3, 13.4
  const { applyTheme } = useTheme();
  
  // Apply theme on initial mount
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

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

  /**
   * Close sidebar handler
   */
  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  /**
   * Open settings panel handler
   * @requirements 11.1
   */
  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  /**
   * Close settings panel handler
   */
  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  /**
   * Open conversation settings handler
   * @requirements 11.2
   */
  const handleOpenConversationSettings = useCallback(() => {
    if (currentConversation) {
      setConversationSettingsOpen(true);
    }
  }, [currentConversation]);

  /**
   * Close conversation settings handler
   */
  const handleCloseConversationSettings = useCallback(() => {
    setConversationSettingsOpen(false);
  }, []);

  /**
   * Handle export conversation
   * @requirements 16.1, 16.2, 16.3, 16.4
   */
  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!currentConversation) return;
    
    try {
      await exportConversation(currentConversation, format);
      setExportMenuOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [currentConversation]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar component */}
      {/* @requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--background)]">
        {/* Top navigation bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)]">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            aria-label="打开侧边栏"
          >
            <svg className="w-6 h-6 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Current conversation title */}
          <h2 className="text-lg font-semibold text-[var(--foreground)] truncate flex-1 lg:ml-0 ml-2">
            {currentConversation?.title || '新对话'}
          </h2>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Conversation settings button */}
            {/* @requirements 11.2 */}
            {currentConversation && (
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

            {/* Export dropdown */}
            {/* @requirements 16.1, 16.2, 16.3, 16.4 */}
            {currentConversation && currentConversation.messages.length > 0 && (
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                  aria-label="导出对话"
                  title="导出对话"
                  aria-expanded={exportMenuOpen}
                  aria-haspopup="true"
                >
                  <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                
                {/* Export dropdown menu */}
                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--popover)] border border-[var(--border)] rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('markdown')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--popover-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        导出为 Markdown
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--popover-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        导出为 JSON
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--popover-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        导出为 PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings button */}
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

        {/* Chat container - integrates MessageList and InputArea */}
        {/* @requirements 3.1, 3.2, 3.3, 3.4 */}
        <ChatContainer
          conversationId={currentConversation?.id}
          className="flex-1"
        />
      </main>

      {/* Settings panel modal */}
      {/* @requirements 11.1, 13.1, 13.2, 14.1, 14.2, 15.1, 15.2 */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={handleCloseSettings}
      />

      {/* Conversation settings modal */}
      {/* @requirements 11.2, 11.4 */}
      {currentConversation && (
        <ConversationSettings
          conversation={currentConversation}
          isOpen={conversationSettingsOpen}
          onClose={handleCloseConversationSettings}
        />
      )}
    </div>
  );
}
