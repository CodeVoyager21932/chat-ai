// store/index.ts
// Zustand State Management for AI Chat Application

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Conversation,
  Message,
  AppSettings,
  ThemeConfig,
  PresetPrompt,
} from '@/types';

/**
 * Generate a unique ID for conversations and messages
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Default preset prompts for the application
 */
const defaultPresetPrompts: PresetPrompt[] = [
  {
    id: 'translator',
    name: '翻译助手',
    prompt: '你是一个专业的翻译助手，擅长中英文互译',
    icon: '🌐',
  },
  {
    id: 'coder',
    name: '代码专家',
    prompt: '你是一个资深的软件工程师，擅长代码审查和优化',
    icon: '💻',
  },
  {
    id: 'writer',
    name: '写作助手',
    prompt: '你是一个专业的写作助手，擅长文章润色和创作',
    icon: '✍️',
  },
];

/**
 * Default theme configuration
 */
const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: '#667eea',
  fontSize: 'medium',
};

/**
 * Default application settings
 */
const defaultSettings: AppSettings = {
  globalSystemPrompt: '你是一个有帮助的 AI 助手',
  theme: defaultTheme,
  presetPrompts: defaultPresetPrompts,
};

/**
 * Chat Store Interface
 * Defines all state and actions for the chat application
 */
interface ChatStore {
  // ============ 对话状态 (Conversation State) ============
  /** Array of all conversations */
  conversations: Conversation[];
  /** Currently selected conversation ID */
  currentConversationId: string | null;

  // ============ 设置状态 (Settings State) ============
  /** Application settings including theme and prompts */
  settings: AppSettings;

  // ============ 对话操作 (Conversation Actions) ============
  /**
   * Create a new conversation
   * @returns The ID of the newly created conversation
   */
  createConversation: () => string;

  /**
   * Delete a conversation by ID
   * @param id - The conversation ID to delete
   */
  deleteConversation: (id: string) => void;

  /**
   * Update a conversation with partial data
   * @param id - The conversation ID to update
   * @param updates - Partial conversation data to merge
   */
  updateConversation: (id: string, updates: Partial<Conversation>) => void;

  /**
   * Set the current active conversation
   * @param id - The conversation ID to set as current
   */
  setCurrentConversation: (id: string | null) => void;

  /**
   * Toggle pin status of a conversation
   * @param id - The conversation ID to pin/unpin
   */
  pinConversation: (id: string) => void;

  /**
   * Toggle archive status of a conversation
   * @param id - The conversation ID to archive/unarchive
   */
  archiveConversation: (id: string) => void;

  // ============ 消息操作 (Message Actions) ============
  /**
   * Add a message to a conversation
   * @param conversationId - The conversation ID to add the message to
   * @param message - The message to add
   */
  addMessage: (conversationId: string, message: Message) => void;

  /**
   * Update a message's content
   * @param conversationId - The conversation ID containing the message
   * @param messageId - The message ID to update
   * @param content - The new content for the message
   */
  updateMessage: (conversationId: string, messageId: string, content: string) => void;

  // ============ 设置操作 (Settings Actions) ============
  /**
   * Update application settings
   * @param settings - Partial settings to merge
   */
  updateSettings: (settings: Partial<AppSettings>) => void;

  /**
   * Update theme configuration
   * @param theme - Partial theme config to merge
   */
  updateTheme: (theme: Partial<ThemeConfig>) => void;

  // ============ 辅助方法 (Helper Methods) ============
  /**
   * Get the current conversation object
   * @returns The current conversation or null
   */
  getCurrentConversation: () => Conversation | null;

  /**
   * Get a conversation by ID
   * @param id - The conversation ID
   * @returns The conversation or undefined
   */
  getConversationById: (id: string) => Conversation | undefined;

  /**
   * Load conversations from external source (e.g., API)
   * @param conversations - Array of conversations to load
   */
  loadConversations: (conversations: Conversation[]) => void;
}

/**
 * Create the Zustand store with persistence
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // ============ Initial State ============
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,

      // ============ Conversation Actions ============
      createConversation: () => {
        const id = generateId('conv');
        const now = new Date();
        const newConversation: Conversation = {
          id,
          title: '新对话',
          messages: [],
          model: 'gpt-4o', // Default model
          systemPrompt: undefined,
          isPinned: false,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));

        return id;
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const newConversations = state.conversations.filter((c) => c.id !== id);
          // If deleting the current conversation, clear the selection or select another
          let newCurrentId = state.currentConversationId;
          if (state.currentConversationId === id) {
            newCurrentId = newConversations.length > 0 ? newConversations[0].id : null;
          }
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          };
        });
      },

      updateConversation: (id: string, updates: Partial<Conversation>) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date() }
              : c
          ),
        }));
      },

      setCurrentConversation: (id: string | null) => {
        set({ currentConversationId: id });
      },

      pinConversation: (id: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id
              ? { ...c, isPinned: !c.isPinned, updatedAt: new Date() }
              : c
          ),
        }));
      },

      archiveConversation: (id: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id
              ? { ...c, isArchived: !c.isArchived, updatedAt: new Date() }
              : c
          ),
        }));
      },

      // ============ Message Actions ============
      addMessage: (conversationId: string, message: Message) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      updateMessage: (conversationId: string, messageId: string, content: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      // ============ Settings Actions ============
      updateSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      updateTheme: (theme: Partial<ThemeConfig>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, ...theme },
          },
        }));
      },

      // ============ Helper Methods ============
      getCurrentConversation: () => {
        const state = get();
        if (!state.currentConversationId) return null;
        return state.conversations.find((c) => c.id === state.currentConversationId) || null;
      },

      getConversationById: (id: string) => {
        return get().conversations.find((c) => c.id === id);
      },

      loadConversations: (conversations: Conversation[]) => {
        set({ conversations });
      },
    }),
    {
      name: 'chat-store', // localStorage key
      partialize: (state) => ({
        // Only persist settings to localStorage
        // Conversations will be persisted to files via the storage service
        settings: state.settings,
      }),
    }
  )
);

// ============ Selector Hooks for Performance Optimization ============

/**
 * Select only conversations (for sidebar)
 */
export const useConversations = () => useChatStore((state) => state.conversations);

/**
 * Select current conversation ID
 */
export const useCurrentConversationId = () => useChatStore((state) => state.currentConversationId);

/**
 * Select settings
 */
export const useSettings = () => useChatStore((state) => state.settings);

/**
 * Select theme configuration
 */
export const useTheme = () => useChatStore((state) => state.settings.theme);

/**
 * Get sorted conversations (pinned first, then by updatedAt)
 */
export const useSortedConversations = () =>
  useChatStore((state) => {
    const conversations = [...state.conversations];
    return conversations.sort((a, b) => {
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then sort by updatedAt (newest first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  });

/**
 * Get a specific conversation by ID
 * Returns null if not found or id is null
 */
export const useConversationById = (id: string | null): Conversation | null => {
  return useChatStore((state) => {
    if (!id) return null;
    return state.conversations.find((c) => c.id === id) || null;
  });
};

/**
 * Get non-archived conversations
 */
export const useActiveConversations = () =>
  useChatStore((state) => state.conversations.filter((c) => !c.isArchived));

/**
 * Get archived conversations
 */
export const useArchivedConversations = () =>
  useChatStore((state) => state.conversations.filter((c) => c.isArchived));

export default useChatStore;
