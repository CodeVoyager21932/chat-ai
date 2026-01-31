'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import { useChatStore } from '@/store';

/**
 * 主页面组件
 * 实现侧边栏 + 主内容区布局
 * 支持响应式设计，移动端可折叠侧边栏
 */
export default function Home() {
  // 侧边栏折叠状态（移动端）
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 从 store 获取当前对话
  const getCurrentConversation = useChatStore((state) => state.getCurrentConversation);
  const currentConversation = getCurrentConversation();

  /**
   * 关闭侧边栏
   */
  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  /**
   * 打开设置面板（暂时只是 console.log，后续会实现）
   */
  const handleOpenSettings = useCallback(() => {
    console.log('打开设置面板');
    // TODO: 实现设置面板
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* 侧边栏组件 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        onOpenSettings={handleOpenSettings}
      />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
        {/* 顶部导航栏 */}
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="打开侧边栏"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* 当前对话标题 */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 lg:ml-0 ml-2">
            {currentConversation?.title || '新对话'}
          </h2>

          {/* 模型选择器占位 */}
          <div className="flex items-center gap-2">
            <select
              className="
                px-3 py-2 rounded-lg
                bg-gray-100 dark:bg-gray-700
                border border-gray-200 dark:border-gray-600
                text-sm text-gray-700 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                cursor-pointer
              "
              defaultValue="gpt-4o"
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>
        </header>

        {/* 聊天内容区占位 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              开始新对话
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              选择一个 AI 模型，然后在下方输入您的问题开始对话。支持多模型切换、文件上传、Markdown 渲染等功能。
            </p>
          </div>
        </div>

        {/* 输入区域占位 */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2">
              {/* 文件上传按钮 */}
              <button
                className="
                  p-3 rounded-lg
                  text-gray-500 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                "
                aria-label="上传文件"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* 输入框 */}
              <div className="flex-1 relative">
                <textarea
                  placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
                  rows={1}
                  className="
                    w-full px-4 py-3
                    rounded-xl
                    bg-gray-100 dark:bg-gray-700
                    border border-gray-200 dark:border-gray-600
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-500 dark:placeholder-gray-400
                    resize-none
                    max-h-[120px]
                    transition-all duration-200
                  "
                  style={{ minHeight: '48px' }}
                />
              </div>

              {/* 发送按钮 */}
              <button
                className="
                  p-3 rounded-xl
                  bg-gradient-to-r from-purple-600 to-blue-500
                  text-white
                  hover:from-purple-700 hover:to-blue-600
                  transition-all duration-200
                  shadow-md hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                aria-label="发送消息"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* 提示文字 */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              AI 可能会产生错误信息，请核实重要内容
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
