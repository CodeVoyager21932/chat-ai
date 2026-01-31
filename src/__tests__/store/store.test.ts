// Unit tests for Zustand store
// Requirements: 5.1, 5.4, 5.5, 5.6, 13.1, 14.1, 15.1

import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '@/store';
import type { Message } from '@/types';

describe('Chat Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      conversations: [],
      currentConversationId: null,
      settings: {
        globalSystemPrompt: '你是一个有帮助的 AI 助手',
        theme: {
          mode: 'light',
          primaryColor: '#667eea',
          fontSize: 'medium',
        },
        presetPrompts: [],
      },
    });
  });

  describe('Conversation Management', () => {
    it('should create a new conversation', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      expect(id).toBeDefined();
      expect(id).toMatch(/^conv_/);
      
      const state = useChatStore.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.currentConversationId).toBe(id);
    });

    it('should set new conversation as current', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      const state = useChatStore.getState();
      expect(state.currentConversationId).toBe(id);
    });

    it('should delete a conversation', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      useChatStore.getState().deleteConversation(id);
      
      const state = useChatStore.getState();
      expect(state.conversations).toHaveLength(0);
    });

    it('should update current conversation when deleting current', () => {
      const store = useChatStore.getState();
      const id1 = store.createConversation();
      const id2 = useChatStore.getState().createConversation();
      
      // Current should be id2 (most recent)
      expect(useChatStore.getState().currentConversationId).toBe(id2);
      
      // Delete current conversation
      useChatStore.getState().deleteConversation(id2);
      
      // Should switch to remaining conversation
      const state = useChatStore.getState();
      expect(state.currentConversationId).toBe(id1);
    });

    it('should update conversation properties', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      useChatStore.getState().updateConversation(id, { title: 'Updated Title' });
      
      const conversation = useChatStore.getState().getConversationById(id);
      expect(conversation?.title).toBe('Updated Title');
    });

    it('should pin a conversation', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      useChatStore.getState().pinConversation(id);
      
      const conversation = useChatStore.getState().getConversationById(id);
      expect(conversation?.isPinned).toBe(true);
    });

    it('should unpin a pinned conversation', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      // Pin then unpin
      useChatStore.getState().pinConversation(id);
      useChatStore.getState().pinConversation(id);
      
      const conversation = useChatStore.getState().getConversationById(id);
      expect(conversation?.isPinned).toBe(false);
    });

    it('should archive a conversation', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      useChatStore.getState().archiveConversation(id);
      
      const conversation = useChatStore.getState().getConversationById(id);
      expect(conversation?.isArchived).toBe(true);
    });
  });

  describe('Message Management', () => {
    it('should add a message to a conversation', () => {
      const store = useChatStore.getState();
      const convId = store.createConversation();
      
      const message: Message = {
        id: 'msg_1',
        role: 'user',
        content: 'Hello!',
        createdAt: new Date(),
      };
      
      useChatStore.getState().addMessage(convId, message);
      
      const conversation = useChatStore.getState().getConversationById(convId);
      expect(conversation?.messages).toHaveLength(1);
      expect(conversation?.messages[0].content).toBe('Hello!');
    });

    it('should update a message content', () => {
      const store = useChatStore.getState();
      const convId = store.createConversation();
      
      const message: Message = {
        id: 'msg_1',
        role: 'user',
        content: 'Original content',
        createdAt: new Date(),
      };
      
      useChatStore.getState().addMessage(convId, message);
      useChatStore.getState().updateMessage(convId, 'msg_1', 'Updated content');
      
      const conversation = useChatStore.getState().getConversationById(convId);
      expect(conversation?.messages[0].content).toBe('Updated content');
    });
  });

  describe('Settings Management', () => {
    it('should update global system prompt', () => {
      useChatStore.getState().updateSettings({
        globalSystemPrompt: 'New system prompt',
      });
      
      const state = useChatStore.getState();
      expect(state.settings.globalSystemPrompt).toBe('New system prompt');
    });

    it('should update theme mode', () => {
      useChatStore.getState().updateTheme({ mode: 'dark' });
      
      const state = useChatStore.getState();
      expect(state.settings.theme.mode).toBe('dark');
    });

    it('should update primary color', () => {
      useChatStore.getState().updateTheme({ primaryColor: '#ff0000' });
      
      const state = useChatStore.getState();
      expect(state.settings.theme.primaryColor).toBe('#ff0000');
    });

    it('should update font size', () => {
      useChatStore.getState().updateTheme({ fontSize: 'large' });
      
      const state = useChatStore.getState();
      expect(state.settings.theme.fontSize).toBe('large');
    });
  });

  describe('Helper Methods', () => {
    it('should get current conversation', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      const current = useChatStore.getState().getCurrentConversation();
      expect(current).not.toBeNull();
      expect(current?.id).toBe(id);
    });

    it('should return null when no current conversation', () => {
      const current = useChatStore.getState().getCurrentConversation();
      expect(current).toBeNull();
    });

    it('should get conversation by ID', () => {
      const store = useChatStore.getState();
      const id = store.createConversation();
      
      const conversation = useChatStore.getState().getConversationById(id);
      expect(conversation).not.toBeUndefined();
      expect(conversation?.id).toBe(id);
    });

    it('should load conversations from external source', () => {
      const conversations = [
        {
          id: 'conv_1',
          title: 'Test 1',
          messages: [],
          model: 'gpt-4o',
          isPinned: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'conv_2',
          title: 'Test 2',
          messages: [],
          model: 'gpt-4o',
          isPinned: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      useChatStore.getState().loadConversations(conversations);
      
      const state = useChatStore.getState();
      expect(state.conversations).toHaveLength(2);
    });
  });
});
