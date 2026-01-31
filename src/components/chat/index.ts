/**
 * 聊天组件统一导出
 */

export { default as ChatContainer } from './ChatContainer';
export type { ChatContainerProps } from './ChatContainer';

export { default as MessageList } from './MessageList';
export type { MessageListProps } from './MessageList';

export { default as MessageItem } from './MessageItem';
export type { MessageItemProps } from './MessageItem';

export { default as MessageActions } from './MessageActions';
export type { MessageActionsProps } from './MessageActions';

export { default as FileUploader } from './FileUploader';
export type { FileUploaderProps } from './FileUploader';

export { default as InputArea } from './InputArea';
export type { InputAreaProps } from './InputArea';

export { default as MediaDownload } from './MediaDownload';
export type { MediaDownloadProps, MediaItem } from './MediaDownload';
export { extractMediaFromContent, generateDownloadFilename } from './MediaDownload';

export { default as ConversationSettings } from './ConversationSettings';
export type { ConversationSettingsProps } from './ConversationSettings';
