'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { Attachment } from '@/types';

/**
 * 允许的图片类型
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * 允许的文档类型
 */
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * 所有允许的文件类型
 */
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

/**
 * 最大文件大小 (15MB)
 */
const MAX_FILE_SIZE = 15 * 1024 * 1024;

/**
 * 文件上传组件 Props
 */
export interface FileUploaderProps {
  /** 已上传的附件列表 */
  attachments: Attachment[];
  /** 附件变化回调 */
  onAttachmentsChange: (attachments: Attachment[]) => void;
  /** 错误回调 */
  onError?: (error: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最大文件数量 */
  maxFiles?: number;
}

/**
 * 文件上传组件
 * 
 * 功能：
 * - 点击上传
 * - 拖拽上传
 * - 粘贴图片
 * - 文件类型验证
 * - 文件大小验证
 * 
 * @requirements 2.1, 2.2, 2.3, 2.7, 2.8
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  attachments,
  onAttachmentsChange,
  onError,
  disabled = false,
  maxFiles = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * 生成附件 ID
   */
  const generateId = (): string => {
    return `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  /**
   * 验证文件类型
   * @requirements 2.1, 2.2
   */
  const validateFileType = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError?.(`不支持的文件类型：${file.type || '未知'}`);
      return false;
    }
    return true;
  };

  /**
   * 验证文件大小
   * @requirements 2.3
   */
  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      onError?.(`文件大小超过 15MB 限制：${file.name}`);
      return false;
    }
    return true;
  };

  /**
   * 将文件转换为 Attachment 对象
   */
  const fileToAttachment = async (file: File): Promise<Attachment | null> => {
    // 验证文件
    if (!validateFileType(file) || !validateFileSize(file)) {
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        
        const attachment: Attachment = {
          id: generateId(),
          type: isImage ? 'image' : 'document',
          name: file.name,
          mimeType: file.type,
          data: base64,
          preview: isImage ? URL.createObjectURL(file) : undefined,
        };
        
        resolve(attachment);
      };
      reader.onerror = () => {
        onError?.(`文件读取失败：${file.name}`);
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * 处理文件选择
   */
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - attachments.length;
    
    if (fileArray.length > remainingSlots) {
      onError?.(`最多只能上传 ${maxFiles} 个文件`);
    }

    const filesToProcess = fileArray.slice(0, remainingSlots);
    const newAttachments: Attachment[] = [];

    for (const file of filesToProcess) {
      const attachment = await fileToAttachment(file);
      if (attachment) {
        newAttachments.push(attachment);
      }
    }

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
  }, [attachments, disabled, maxFiles, onAttachmentsChange, onError]);

  /**
   * 处理点击上传
   * @requirements 2.1
   */
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  /**
   * 处理文件输入变化
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      // 重置 input 以允许重复选择同一文件
      e.target.value = '';
    }
  }, [handleFiles]);

  /**
   * 处理拖拽进入
   * @requirements 2.7
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * 处理拖拽放下
   * @requirements 2.7
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  /**
   * 处理粘贴图片
   * @requirements 2.8
   */
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        handleFiles(imageFiles);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled, handleFiles]);

  /**
   * 移除附件
   * @requirements 2.6
   */
  const handleRemove = useCallback((attachmentId: string) => {
    const attachment = attachments.find(a => a.id === attachmentId);
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    onAttachmentsChange(attachments.filter(a => a.id !== attachmentId));
  }, [attachments, onAttachmentsChange]);

  return (
    <div className="relative">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* 上传按钮 */}
      <button
        type="button"
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        disabled={disabled || attachments.length >= maxFiles}
        className={`
          p-3 rounded-lg
          transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
          ${isDragging 
            ? 'bg-[var(--primary)]/10 border-2 border-dashed border-[var(--primary)]' 
            : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
          }
          ${disabled || attachments.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="上传文件"
        title={attachments.length >= maxFiles ? `最多上传 ${maxFiles} 个文件` : '上传文件（支持拖拽和粘贴）'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      {/* 附件预览列表 */}
      {attachments.length > 0 && (
        <FilePreviewList
          attachments={attachments}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};

/**
 * 文件预览列表组件 Props
 */
interface FilePreviewListProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

/**
 * 文件预览列表组件
 * @requirements 2.4
 */
const FilePreviewList: React.FC<FilePreviewListProps> = ({
  attachments,
  onRemove,
}) => {
  return (
    <div className="absolute bottom-full left-0 mb-2 flex flex-wrap gap-2 max-w-md">
      {attachments.map((attachment) => (
        <FilePreviewItem
          key={attachment.id}
          attachment={attachment}
          onRemove={() => onRemove(attachment.id)}
        />
      ))}
    </div>
  );
};

/**
 * 文件预览项组件 Props
 */
interface FilePreviewItemProps {
  attachment: Attachment;
  onRemove: () => void;
}

/**
 * 文件预览项组件
 * @requirements 2.4, 2.6
 */
const FilePreviewItem: React.FC<FilePreviewItemProps> = ({
  attachment,
  onRemove,
}) => {
  return (
    <div className="relative group">
      <div className="
        flex items-center gap-2 
        px-3 py-2 rounded-lg
        bg-[var(--muted)] border border-[var(--border)]
        max-w-[200px]
      ">
        {/* 图片缩略图或文档图标 */}
        {attachment.type === 'image' && attachment.preview ? (
          <img
            src={attachment.preview}
            alt={attachment.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-[var(--primary)]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        
        {/* 文件名 */}
        <span className="text-sm truncate flex-1" title={attachment.name}>
          {attachment.name}
        </span>
      </div>

      {/* 移除按钮 */}
      <button
        onClick={onRemove}
        className="
          absolute -top-2 -right-2
          w-5 h-5 rounded-full
          bg-red-500 text-white
          flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-opacity
          focus:outline-none focus:opacity-100
        "
        aria-label={`移除 ${attachment.name}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default FileUploader;
