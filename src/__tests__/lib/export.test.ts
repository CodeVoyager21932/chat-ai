// Unit tests for export utilities
// Requirements: 16.1, 16.2, 16.4

import { describe, it, expect } from 'vitest';
import {
  formatDateForFilename,
  formatDate,
  formatTime,
  sanitizeFilename,
  generateFilename,
  exportToMarkdown,
  exportToJson,
} from '@/lib/export';
import type { Conversation, Message } from '@/types';

// Helper to create a test conversation
function createTestConversation(overrides: Partial<Conversation> = {}): Conversation {
  const now = new Date('2024-01-15T10:30:00Z');
  return {
    id: 'test-conv-1',
    title: 'Test Conversation',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello, how are you?',
        createdAt: now,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'I am doing well, thank you!',
        createdAt: new Date('2024-01-15T10:30:05Z'),
      },
    ] as Message[],
    model: 'gpt-4o',
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('Export Utilities', () => {
  describe('formatDateForFilename', () => {
    it('should format date as YYYYMMDD', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDateForFilename(date)).toBe('20240115');
    });

    it('should handle string dates', () => {
      // Use a date with explicit time to avoid timezone issues
      const result = formatDateForFilename('2024-12-25T12:00:00Z');
      expect(result).toBe('20241225');
    });
  });

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });
  });

  describe('formatTime', () => {
    it('should format time as HH:MM:SS', () => {
      const date = new Date('2024-01-15T10:30:45Z');
      // Note: This will be in local timezone
      const result = formatTime(date);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove unsafe characters', () => {
      expect(sanitizeFilename('test<>:"/\\|?*file')).toBe('test_file');
    });

    it('should replace spaces with underscores', () => {
      expect(sanitizeFilename('hello world test')).toBe('hello_world_test');
    });

    it('should limit length to 50 characters', () => {
      const longTitle = 'a'.repeat(100);
      expect(sanitizeFilename(longTitle).length).toBeLessThanOrEqual(50);
    });

    it('should merge multiple underscores', () => {
      expect(sanitizeFilename('test   multiple   spaces')).toBe('test_multiple_spaces');
    });
  });

  describe('generateFilename', () => {
    it('should generate markdown filename with .md extension', () => {
      const filename = generateFilename('Test Title', 'markdown');
      expect(filename).toMatch(/^Test_Title_\d{8}\.md$/);
    });

    it('should generate json filename with .json extension', () => {
      const filename = generateFilename('Test Title', 'json');
      expect(filename).toMatch(/^Test_Title_\d{8}\.json$/);
    });

    it('should generate pdf filename with .pdf extension', () => {
      const filename = generateFilename('Test Title', 'pdf');
      expect(filename).toMatch(/^Test_Title_\d{8}\.pdf$/);
    });

    it('should use default name for empty title', () => {
      const filename = generateFilename('', 'markdown');
      expect(filename).toMatch(/^conversation_\d{8}\.md$/);
    });
  });

  describe('exportToMarkdown', () => {
    it('should include conversation title as heading', () => {
      const conversation = createTestConversation({ title: 'My Chat' });
      const markdown = exportToMarkdown(conversation);
      expect(markdown).toContain('# My Chat');
    });

    it('should include model information', () => {
      const conversation = createTestConversation({ model: 'gpt-4o' });
      const markdown = exportToMarkdown(conversation);
      expect(markdown).toContain('**Model**: gpt-4o');
    });

    it('should include user messages with correct label', () => {
      const conversation = createTestConversation();
      const markdown = exportToMarkdown(conversation);
      expect(markdown).toContain('👤 **User**');
    });

    it('should include assistant messages with correct label', () => {
      const conversation = createTestConversation();
      const markdown = exportToMarkdown(conversation);
      expect(markdown).toContain('🤖 **Assistant**');
    });

    it('should include message content', () => {
      const conversation = createTestConversation();
      const markdown = exportToMarkdown(conversation);
      expect(markdown).toContain('Hello, how are you?');
      expect(markdown).toContain('I am doing well, thank you!');
    });

    it('should include system prompt if present', () => {
      const conversation = createTestConversation({ systemPrompt: 'You are a helpful assistant' });
      const markdown = exportToMarkdown(conversation);
      expect(markdown).toContain('**System Prompt**: You are a helpful assistant');
    });
  });

  describe('exportToJson', () => {
    it('should produce valid JSON', () => {
      const conversation = createTestConversation();
      const json = exportToJson(conversation);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include all conversation fields', () => {
      const conversation = createTestConversation();
      const json = exportToJson(conversation);
      const parsed = JSON.parse(json);
      
      expect(parsed.id).toBe(conversation.id);
      expect(parsed.title).toBe(conversation.title);
      expect(parsed.model).toBe(conversation.model);
      expect(parsed.messages).toHaveLength(2);
    });

    it('should include export metadata', () => {
      const conversation = createTestConversation();
      const json = exportToJson(conversation);
      const parsed = JSON.parse(json);
      
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.version).toBe('1.0');
    });

    it('should preserve message content', () => {
      const conversation = createTestConversation();
      const json = exportToJson(conversation);
      const parsed = JSON.parse(json);
      
      expect(parsed.messages[0].content).toBe('Hello, how are you?');
      expect(parsed.messages[1].content).toBe('I am doing well, thank you!');
    });
  });
});
