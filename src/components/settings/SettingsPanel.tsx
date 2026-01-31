'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import ThemeSettings from '@/components/settings/ThemeSettings';

/**
 * Tab type for settings panel navigation
 */
type SettingsTab = 'theme' | 'prompts';

/**
 * Tab configuration interface
 */
interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
}

/**
 * Props for SettingsPanel component
 */
export interface SettingsPanelProps {
  /** Whether the settings panel is open */
  isOpen: boolean;
  /** Callback when the panel is closed */
  onClose: () => void;
}

/**
 * Tab configuration for the settings panel
 */
const TABS: TabConfig[] = [
  {
    id: 'theme',
    label: '主题设置',
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    id: 'prompts',
    label: '提示词设置',
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

/**
 * SettingsPanel Component
 * 
 * A modal-based settings panel with tab navigation for theme and prompt settings.
 * Uses the existing Modal component as a container.
 * 
 * @param props - Component props
 * @returns The settings panel component
 * 
 * Requirements: 11.1 - THE Chat_Application SHALL provide a settings panel to configure a global system prompt
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  // Current active tab state
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');

  /**
   * Handle tab change
   * @param tabId - The tab ID to switch to
   */
  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
  };

  /**
   * Render the content for the active tab
   * Placeholder slots for child components (ThemeSettings, PromptSettings)
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'theme':
        return <ThemeSettings />;
      case 'prompts':
        return (
          <div className="space-y-4">
            {/* Placeholder for PromptSettings component */}
            <div className="p-4 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] text-center">
              <p className="text-sm">提示词设置组件将在此处渲染</p>
              <p className="text-xs mt-1 opacity-70">PromptSettings component placeholder</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="设置"
      size="lg"
      showCloseButton={true}
      closeOnOverlayClick={true}
      closeOnEsc={true}
    >
      <div className="flex flex-col sm:flex-row gap-4 min-h-[300px]">
        {/* Tab Navigation - Sidebar style */}
        <nav
          className="flex sm:flex-col gap-1 sm:w-40 sm:border-r sm:border-[var(--border)] sm:pr-4"
          role="tablist"
          aria-label="设置选项卡"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                }
              `.replace(/\s+/g, ' ').trim()}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Content Panel */}
        <div
          className="flex-1 min-w-0"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {/* Tab Title */}
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h3>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsPanel;
