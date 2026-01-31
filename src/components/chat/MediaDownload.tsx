'use client';

import React, { useState, useCallback, useMemo } from 'react';

/**
 * Media item detected in message content
 */
export interface MediaItem {
  /** Media URL */
  url: string;
  /** Media type (image or video) */
  type: 'image' | 'video';
  /** File extension */
  extension: string;
}

/**
 * MediaDownload component Props
 */
export interface MediaDownloadProps {
  /** Message content to scan for media */
  content: string;
  /** Optional class name for styling */
  className?: string;
}

/**
 * Supported image extensions
 */
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];

/**
 * Supported video extensions
 */
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

/**
 * Regex pattern to detect media URLs in content
 * Matches URLs ending with image/video extensions
 */
const MEDIA_URL_PATTERN = new RegExp(
  `https?://[^\\s<>"'\\)\\]]+\\.(${[...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS].join('|')})(?:[?#][^\\s<>"'\\)\\]]*)?`,
  'gi'
);

/**
 * Regex pattern to detect markdown image syntax
 * Matches ![alt](url) pattern
 */
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\(([^)]+)\)/gi;

/**
 * Regex pattern to detect HTML img tags
 * Matches <img src="url"> pattern
 */
const HTML_IMG_PATTERN = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

/**
 * Regex pattern to detect HTML video tags
 * Matches <video src="url"> or <source src="url"> pattern
 */
const HTML_VIDEO_PATTERN = /<(?:video|source)[^>]+src=["']([^"']+)["'][^>]*>/gi;

/**
 * Extract media items from message content
 * @param content - Message content to scan
 * @returns Array of detected media items
 */
export function extractMediaFromContent(content: string): MediaItem[] {
  const mediaItems: MediaItem[] = [];
  const seenUrls = new Set<string>();

  /**
   * Add media item if not already seen
   */
  const addMediaItem = (url: string) => {
    // Normalize URL by removing query params for deduplication
    const normalizedUrl = url.split('?')[0].split('#')[0];
    if (seenUrls.has(normalizedUrl)) return;
    seenUrls.add(normalizedUrl);

    const extension = getExtensionFromUrl(url);
    if (!extension) return;

    const type = getMediaType(extension);
    if (!type) return;

    mediaItems.push({ url, type, extension });
  };

  // Extract from direct URLs
  let match;
  while ((match = MEDIA_URL_PATTERN.exec(content)) !== null) {
    addMediaItem(match[0]);
  }

  // Extract from markdown images
  MARKDOWN_IMAGE_PATTERN.lastIndex = 0;
  while ((match = MARKDOWN_IMAGE_PATTERN.exec(content)) !== null) {
    addMediaItem(match[1]);
  }

  // Extract from HTML img tags
  HTML_IMG_PATTERN.lastIndex = 0;
  while ((match = HTML_IMG_PATTERN.exec(content)) !== null) {
    addMediaItem(match[1]);
  }

  // Extract from HTML video tags
  HTML_VIDEO_PATTERN.lastIndex = 0;
  while ((match = HTML_VIDEO_PATTERN.exec(content)) !== null) {
    addMediaItem(match[1]);
  }

  return mediaItems;
}

/**
 * Get file extension from URL
 * @param url - URL to extract extension from
 * @returns File extension or null
 */
function getExtensionFromUrl(url: string): string | null {
  try {
    // Remove query params and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    const parts = cleanUrl.split('.');
    if (parts.length < 2) return null;
    const ext = parts[parts.length - 1].toLowerCase();
    if ([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS].includes(ext)) {
      return ext;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get media type from extension
 * @param extension - File extension
 * @returns Media type or null
 */
function getMediaType(extension: string): 'image' | 'video' | null {
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image';
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
  return null;
}

/**
 * Generate download filename
 * Format: chat_media_YYYYMMDD_NNN.ext
 * @param extension - File extension
 * @param index - Media index (for NNN part)
 * @returns Generated filename
 */
export function generateDownloadFilename(extension: string, index: number = 1): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const indexStr = String(index).padStart(3, '0');
  return `chat_media_${dateStr}_${indexStr}.${extension}`;
}

/**
 * Download media file from URL
 * @param url - Media URL to download
 * @param filename - Filename for the downloaded file
 */
async function downloadMedia(url: string, filename: string): Promise<void> {
  try {
    // Fetch the media file
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Create download link
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    // Fallback: open in new tab if CORS fails
    console.warn('Direct download failed, opening in new tab:', error);
    window.open(url, '_blank');
  }
}

/**
 * MediaDownload Component
 * 
 * Detects images and videos in message content and provides download buttons.
 * 
 * Features:
 * - Detects media URLs in message content
 * - Displays download button for each media item
 * - Auto-generates filename: chat_media_YYYYMMDD_NNN.ext
 * 
 * @requirements 17.1, 17.2, 17.3
 */
const MediaDownload: React.FC<MediaDownloadProps> = ({ content, className = '' }) => {
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  // Extract media items from content
  const mediaItems = useMemo(() => extractMediaFromContent(content), [content]);

  /**
   * Handle download button click
   * @requirements 17.3
   */
  const handleDownload = useCallback(async (item: MediaItem, index: number) => {
    setDownloadingIndex(index);
    try {
      const filename = generateDownloadFilename(item.extension, index + 1);
      await downloadMedia(item.url, filename);
    } finally {
      setDownloadingIndex(null);
    }
  }, []);

  // Don't render if no media found
  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 mt-2 ${className}`}>
      {mediaItems.map((item, index) => (
        <button
          key={`${item.url}-${index}`}
          onClick={() => handleDownload(item, index)}
          disabled={downloadingIndex === index}
          className="
            inline-flex items-center gap-1.5
            px-2.5 py-1.5 rounded-lg
            text-xs font-medium
            bg-[var(--muted)] text-[var(--muted-foreground)]
            hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
          "
          aria-label={`下载${item.type === 'image' ? '图片' : '视频'}`}
          data-testid="media-download-button"
        >
          {downloadingIndex === index ? (
            // Loading spinner
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            // Download icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {/* Media type icon */}
          {item.type === 'image' ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          <span>{item.type === 'image' ? '图片' : '视频'}</span>
          <span className="text-[10px] opacity-70 uppercase">.{item.extension}</span>
        </button>
      ))}
    </div>
  );
};

export default MediaDownload;
