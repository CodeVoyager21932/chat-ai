# Requirements Document

## Introduction

本文档定义了将现有纯 HTML/CSS/JS 聊天应用重构为基于 Vercel AI SDK + Next.js 的现代化 AI 聊天应用的需求。新应用将支持多模型切换、多对话管理、文件上传、流式响应、Markdown 渲染、主题切换等功能，并保持原有的美观界面风格。

## Glossary

- **Chat_Application**: 基于 Next.js 14+ 和 Vercel AI SDK 5.x 构建的 AI 聊天应用系统
- **AI_Provider**: 提供 AI 模型服务的第三方平台，包括 OpenAI、Anthropic、Google
- **Model_Selector**: 允许用户在界面上切换不同 AI 模型的组件
- **File_Uploader**: 处理用户上传图片和文档的组件
- **Stream_Handler**: 处理 AI 响应流式传输的模块
- **Message_Container**: 显示聊天消息历史的容器组件
- **API_Route**: Next.js 后端 API 路由，负责与 AI 提供商通信
- **Conversation_Manager**: 管理多个对话的模块，包括创建、切换、删除、归档等
- **Sidebar**: 显示对话列表的侧边栏组件
- **Markdown_Renderer**: 将 Markdown 文本渲染为格式化 HTML 的组件
- **Code_Highlighter**: 对代码块进行语法高亮的组件
- **Theme_Manager**: 管理应用主题（深色/浅色模式、主题色）的模块
- **Storage_Service**: 负责将对话数据持久化到本地文件夹的服务
- **System_Prompt**: 发送给 AI 的系统级指令，用于设定 AI 的角色和行为

## Requirements

### Requirement 1: 多模型切换支持

**User Story:** As a user, I want to switch between different AI models, so that I can choose the most suitable model for my needs.

#### Acceptance Criteria

1. WHEN the Chat_Application loads, THE Model_Selector SHALL display a dropdown with available AI models from OpenAI (GPT-4o), Anthropic (Claude), and Google (Gemini)
2. WHEN a user selects a different model from the Model_Selector, THE Chat_Application SHALL use the selected model for subsequent messages in the current conversation
3. WHEN a user switches models mid-conversation, THE Chat_Application SHALL maintain the existing conversation history
4. THE API_Route SHALL support routing requests to the appropriate AI_Provider based on the selected model
5. WHEN a model is selected, THE Chat_Application SHALL persist the selection for the current conversation

### Requirement 2: 文件上传支持

**User Story:** As a user, I want to upload images and documents through multiple methods, so that I can have multimodal conversations with the AI.

#### Acceptance Criteria

1. WHEN a user clicks the upload button, THE File_Uploader SHALL accept image files (JPG, PNG, GIF, WebP) and document files (PDF, TXT, DOC)
2. WHEN a user uploads a file, THE File_Uploader SHALL validate the file type and reject unsupported formats with an error message
3. WHEN a user uploads a file exceeding 15MB, THE File_Uploader SHALL reject the file and display a size limit error
4. WHEN files are attached, THE Chat_Application SHALL display file previews (thumbnails for images, file names for documents)
5. WHEN a user sends a message with attached files, THE API_Route SHALL convert files to base64 and include them in the AI request
6. WHEN a user removes an attached file before sending, THE File_Uploader SHALL remove the file from the pending attachments
7. WHEN a user drags files onto the chat area, THE File_Uploader SHALL accept the dropped files
8. WHEN a user pastes an image from clipboard, THE File_Uploader SHALL capture and attach the pasted image

### Requirement 3: 流式响应

**User Story:** As a user, I want to see AI responses appear in real-time, so that I have a better interactive experience.

#### Acceptance Criteria

1. WHEN the AI starts generating a response, THE Stream_Handler SHALL display a typing indicator
2. WHEN the AI generates response tokens, THE Message_Container SHALL display each token as it arrives
3. WHEN the streaming response completes, THE Chat_Application SHALL finalize the message and enable user input
4. IF the streaming connection is interrupted, THEN THE Chat_Application SHALL display an error message and allow retry

### Requirement 4: API 密钥安全

**User Story:** As a developer, I want API keys stored securely on the backend, so that they are not exposed to end users.

#### Acceptance Criteria

1. THE API_Route SHALL read API keys from server-side environment variables only
2. THE Chat_Application SHALL NOT include API keys in client-side code or network requests visible to users
3. WHEN an API key is missing or invalid, THE API_Route SHALL return a 401 error without exposing the key

### Requirement 5: 多对话管理

**User Story:** As a user, I want to manage multiple conversations, so that I can organize different topics separately.

#### Acceptance Criteria

1. THE Sidebar SHALL display a list of all conversations with their titles
2. WHEN a user clicks "New Chat", THE Conversation_Manager SHALL create a new conversation and switch to it
3. WHEN a user clicks on a conversation in the Sidebar, THE Chat_Application SHALL load and display that conversation
4. WHEN a user deletes a conversation, THE Conversation_Manager SHALL remove it from the list and storage after confirmation
5. WHEN a user archives a conversation, THE Conversation_Manager SHALL move it to an archived section
6. WHEN a user pins a conversation, THE Sidebar SHALL display it at the top of the list
7. WHEN a user searches in the Sidebar, THE Conversation_Manager SHALL filter conversations by title

### Requirement 6: 对话持久化

**User Story:** As a user, I want my conversations saved automatically, so that I can continue them later.

#### Acceptance Criteria

1. WHEN a message is sent or received, THE Storage_Service SHALL save the conversation to a JSON file in the configured local folder
2. WHEN the Chat_Application loads, THE Storage_Service SHALL read all conversations from the local folder
3. THE Storage_Service SHALL store each conversation as a separate JSON file with a unique identifier
4. WHEN a conversation is deleted, THE Storage_Service SHALL remove the corresponding JSON file

### Requirement 7: 对话标题自动生成

**User Story:** As a user, I want conversation titles generated automatically, so that I can easily identify conversations.

#### Acceptance Criteria

1. WHEN a new conversation receives its first user message, THE Chat_Application SHALL generate a title based on the message content
2. THE generated title SHALL be concise (maximum 50 characters) and descriptive
3. WHEN a title is generated, THE Storage_Service SHALL persist it with the conversation

### Requirement 8: Markdown 渲染

**User Story:** As a user, I want AI responses rendered with proper formatting, so that I can read structured content easily.

#### Acceptance Criteria

1. WHEN the AI response contains Markdown syntax, THE Markdown_Renderer SHALL render headings, bold, italic, and strikethrough text
2. WHEN the AI response contains lists, THE Markdown_Renderer SHALL render ordered and unordered lists with proper indentation
3. WHEN the AI response contains links, THE Markdown_Renderer SHALL render clickable links that open in a new tab
4. WHEN the AI response contains tables, THE Markdown_Renderer SHALL render formatted tables with headers and rows
5. WHEN the AI response contains blockquotes, THE Markdown_Renderer SHALL render them with visual distinction

### Requirement 9: 代码高亮

**User Story:** As a user, I want code blocks displayed with syntax highlighting, so that I can read code easily.

#### Acceptance Criteria

1. WHEN the AI response contains code blocks, THE Code_Highlighter SHALL apply syntax highlighting based on the specified language
2. WHEN a code block is rendered, THE Code_Highlighter SHALL display line numbers
3. WHEN a code block is rendered, THE Code_Highlighter SHALL display a language label
4. WHEN a user clicks the copy button on a code block, THE Chat_Application SHALL copy the code to clipboard and show confirmation

### Requirement 10: 数学公式渲染

**User Story:** As a user, I want mathematical formulas displayed properly, so that I can read technical content.

#### Acceptance Criteria

1. WHEN the AI response contains inline LaTeX ($ ... $), THE Markdown_Renderer SHALL render it as inline math
2. WHEN the AI response contains block LaTeX ($$ ... $$), THE Markdown_Renderer SHALL render it as a centered math block

### Requirement 11: 系统提示词

**User Story:** As a user, I want to customize the AI behavior with system prompts, so that I can tailor responses to my needs.

#### Acceptance Criteria

1. THE Chat_Application SHALL provide a settings panel to configure a global system prompt
2. WHEN creating or editing a conversation, THE user SHALL be able to set a conversation-specific system prompt
3. THE Chat_Application SHALL provide preset role templates (translator, code expert, writing assistant)
4. WHEN a conversation has a specific system prompt, THE API_Route SHALL use it instead of the global prompt
5. WHEN sending a request to the AI, THE API_Route SHALL include the applicable system prompt

### Requirement 12: 消息操作

**User Story:** As a user, I want to interact with messages, so that I can copy, regenerate, or edit them.

#### Acceptance Criteria

1. WHEN a user clicks the copy button on an AI message, THE Chat_Application SHALL copy the message content to clipboard and show "Copied" feedback
2. WHEN a user clicks the regenerate button on an AI message, THE Chat_Application SHALL request a new response for the same context
3. WHEN a user clicks the edit button on a user message, THE Chat_Application SHALL allow editing and resubmit the message
4. THE Message_Container SHALL display action buttons (copy, regenerate) at the bottom of each AI message

### Requirement 13: 主题切换

**User Story:** As a user, I want to customize the application appearance, so that I can use it comfortably in different environments.

#### Acceptance Criteria

1. THE Theme_Manager SHALL support light and dark color modes
2. WHEN a user toggles the theme, THE Chat_Application SHALL immediately apply the new theme
3. THE Theme_Manager SHALL persist the user's theme preference
4. THE Chat_Application SHALL respect the system's preferred color scheme by default

### Requirement 14: 自定义主题色

**User Story:** As a user, I want to customize the accent color, so that I can personalize the interface.

#### Acceptance Criteria

1. THE Theme_Manager SHALL provide options to change the primary gradient colors
2. WHEN a user selects a new theme color, THE Chat_Application SHALL apply it to headers, buttons, and accents
3. THE Theme_Manager SHALL persist the user's color preference

### Requirement 15: 字体大小调整

**User Story:** As a user, I want to adjust the font size, so that I can read content comfortably.

#### Acceptance Criteria

1. THE Chat_Application SHALL provide options to adjust message font size (small, medium, large)
2. WHEN a user changes the font size, THE Message_Container SHALL immediately apply the new size
3. THE Theme_Manager SHALL persist the user's font size preference

### Requirement 16: 导出对话

**User Story:** As a user, I want to export conversations, so that I can save or share them externally.

#### Acceptance Criteria

1. WHEN a user exports as Markdown, THE Chat_Application SHALL generate a .md file with formatted conversation content
2. WHEN a user exports as JSON, THE Chat_Application SHALL generate a .json file with complete conversation data
3. WHEN a user exports as PDF, THE Chat_Application SHALL generate a .pdf file with styled conversation content
4. THE exported file SHALL be named with the conversation title and export date

### Requirement 17: 媒体下载

**User Story:** As a user, I want to download AI-generated images and videos, so that I can save them locally.

#### Acceptance Criteria

1. WHEN an AI response contains a generated image, THE Message_Container SHALL display a download button
2. WHEN an AI response contains a generated video, THE Message_Container SHALL display a download button
3. WHEN a user clicks the download button, THE Chat_Application SHALL download the file with an auto-generated name (format: chat_media_YYYYMMDD_NNN.ext)

### Requirement 18: 现代化 UI

**User Story:** As a user, I want a modern and beautiful interface, so that I have a pleasant chat experience.

#### Acceptance Criteria

1. THE Chat_Application SHALL use React components with Tailwind CSS for styling
2. THE Chat_Application SHALL preserve the gradient color scheme (purple/blue) from the original design as the default theme
3. WHEN a new message is added, THE Message_Container SHALL animate the message with a fade-in effect
4. THE Chat_Application SHALL be responsive and work on both desktop and mobile devices
5. WHEN the user scrolls through messages, THE Message_Container SHALL display a custom scrollbar matching the design theme

### Requirement 19: 输入交互

**User Story:** As a user, I want intuitive input controls, so that I can easily compose and send messages.

#### Acceptance Criteria

1. WHEN a user presses Enter without Shift, THE Chat_Application SHALL send the message
2. WHEN a user presses Shift+Enter, THE Chat_Application SHALL insert a new line in the input
3. WHEN the input text grows, THE input field SHALL expand vertically up to a maximum height of 120px
4. WHILE a message is being sent, THE send button SHALL be disabled and show a loading indicator
5. WHEN the page loads, THE input field SHALL receive focus automatically
