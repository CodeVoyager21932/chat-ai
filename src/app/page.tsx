'use client';

import { useState, useCallback, useEffect } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatContainer from '@/components/chat/ChatContainer';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { useChatStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';

/**
 * Main page component
 * Integrates all components: Sidebar, ChatContainer, SettingsPanel
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
        {/* Top navigation bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="打开侧边栏"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Current conversation title */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 lg:ml-0 ml-2">
            {currentConversation?.title || '新对话'}
          </h2>

          {/* Settings button */}
          <button
            onClick={handleOpenSettings}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="打开设置"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
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
    </div>
  );
}
