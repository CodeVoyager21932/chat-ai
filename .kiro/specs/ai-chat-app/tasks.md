# Implementation Plan: AI Chat Application

## Overview

本实现计划将 AI 聊天应用的设计分解为可执行的编码任务。采用增量开发方式，从项目初始化开始，逐步实现核心功能、UI 组件、高级特性，最后进行集成测试。

## Tasks

- [x] 1. 项目初始化和基础配置
  - [x] 1.1 创建 Next.js 14+ 项目并配置 TypeScript
    - 使用 `create-next-app` 创建项目，启用 App Router
    - 配置 TypeScript 严格模式
    - 安装核心依赖：ai, @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google
    - _Requirements: 18.1_
  
  - [x] 1.2 配置 Tailwind CSS 和全局样式
    - 配置 Tailwind CSS
    - 创建 globals.css，定义渐变色变量和基础样式
    - 配置深色/浅色模式 CSS 变量
    - _Requirements: 18.2_
  
  - [x] 1.3 创建类型定义文件
    - 创建 `types/index.ts`
    - 定义 Message、Conversation、Attachment、AIModel、ThemeConfig 等类型
    - _Requirements: 1.1, 2.1, 5.1_

- [ ] 2. 状态管理和存储服务
  - [x] 2.1 实现 Zustand 状态管理
    - 创建 `store/index.ts`
    - 实现对话状态管理（conversations, currentConversationId）
    - 实现设置状态管理（settings, theme）
    - 实现所有状态操作方法
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 13.1, 14.1, 15.1_
  
  - [-] 2.2 实现存储服务
    - 创建 `lib/storage.ts`
    - 实现 readConversations、writeConversation、deleteConversation 函数
    - 实现目录自动创建
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 2.3 编写存储服务属性测试
    - **Property 8: Conversation Storage Round-Trip**
    - 测试写入后读取返回等价对象
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 3. API 路由实现
  - [ ] 3.1 实现 AI 聊天 API 路由
    - 创建 `app/api/chat/route.ts`
    - 实现多提供商路由逻辑（OpenAI、Anthropic、Google）
    - 实现流式响应
    - 实现系统提示词处理
    - _Requirements: 1.4, 3.1, 3.2, 4.1, 11.4, 11.5_
  
  - [ ]* 3.2 编写模型路由属性测试
    - **Property 3: Model Routing to Correct Provider**
    - 测试所有模型 ID 路由到正确提供商
    - **Validates: Requirements 1.4**
  
  - [ ] 3.3 实现对话管理 API 路由
    - 创建 `app/api/conversations/route.ts`
    - 实现 GET（获取所有对话）、POST（创建/更新）、DELETE（删除）
    - _Requirements: 5.1, 5.4, 6.1, 6.4_
  
  - [ ] 3.4 实现导出 API 路由
    - 创建 `app/api/export/route.ts`
    - 实现 Markdown 导出
    - 实现 JSON 导出
    - _Requirements: 16.1, 16.2_

- [ ] 4. Checkpoint - 确保后端 API 正常工作
  - 确保所有 API 路由可以正常调用
  - 确保存储服务可以正常读写文件
  - 如有问题请询问用户

- [ ] 5. 基础 UI 组件
  - [ ] 5.1 创建通用 UI 组件
    - 创建 `components/ui/Button.tsx`
    - 创建 `components/ui/Select.tsx`
    - 创建 `components/ui/Modal.tsx`
    - 创建 `components/ui/Toast.tsx`
    - _Requirements: 18.1_
  
  - [ ] 5.2 创建主布局组件
    - 创建 `app/layout.tsx` 根布局
    - 创建 `app/page.tsx` 主页面
    - 实现侧边栏 + 主内容区布局
    - _Requirements: 18.4_

- [ ] 6. 侧边栏组件
  - [ ] 6.1 实现侧边栏主组件
    - 创建 `components/sidebar/Sidebar.tsx`
    - 实现新建对话按钮
    - 实现对话列表容器
    - _Requirements: 5.1, 5.2_
  
  - [ ] 6.2 实现对话列表组件
    - 创建 `components/sidebar/ConversationList.tsx`
    - 实现对话项渲染（标题、时间、置顶/归档标记）
    - 实现点击切换对话
    - 实现右键菜单（删除、归档、置顶）
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_
  
  - [ ] 6.3 实现搜索栏组件
    - 创建 `components/sidebar/SearchBar.tsx`
    - 实现搜索输入和过滤逻辑
    - _Requirements: 5.7_
  
  - [ ]* 6.4 编写侧边栏属性测试
    - **Property 17: Sidebar Conversation Display and Filtering**
    - 测试对话显示、置顶排序、搜索过滤
    - **Validates: Requirements 5.1, 5.6, 5.7**

- [ ] 7. Markdown 和代码渲染
  - [ ] 7.1 实现 Markdown 渲染组件
    - 安装 react-markdown, remark-gfm, rehype-katex, katex
    - 创建 `components/markdown/MarkdownRenderer.tsx`
    - 配置 GFM 支持（表格、删除线、任务列表）
    - 配置 KaTeX 支持（数学公式）
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 10.1, 10.2_
  
  - [ ]* 7.2 编写 Markdown 渲染属性测试
    - **Property 10: Markdown Rendering Correctness**
    - 测试各种 Markdown 语法渲染为正确 HTML
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
  
  - [ ] 7.3 实现代码块组件
    - 安装 prism-react-renderer 或 highlight.js
    - 创建 `components/markdown/CodeBlock.tsx`
    - 实现语法高亮
    - 实现行号显示
    - 实现语言标签
    - 实现复制按钮
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 7.4 编写代码块属性测试
    - **Property 11: Code Block Rendering**
    - 测试代码块包含高亮、行号、语言标签
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 8. 聊天核心组件
  - [ ] 8.1 实现消息列表组件
    - 创建 `components/chat/MessageList.tsx`
    - 实现消息滚动容器
    - 实现自动滚动到底部
    - 实现自定义滚动条样式
    - _Requirements: 18.5_
  
  - [ ] 8.2 实现消息项组件
    - 创建 `components/chat/MessageItem.tsx`
    - 实现用户消息样式（右侧、渐变背景）
    - 实现 AI 消息样式（左侧、白色背景）
    - 实现头像显示
    - 实现淡入动画
    - 集成 MarkdownRenderer
    - _Requirements: 18.3_
  
  - [ ] 8.3 实现消息操作组件
    - 创建 `components/chat/MessageActions.tsx`
    - 实现复制按钮（带"已复制"反馈）
    - 实现重新生成按钮
    - 实现编辑按钮（用户消息）
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ]* 8.4 编写消息操作属性测试
    - **Property 20: Message Action Buttons**
    - 测试 AI 消息底部显示操作按钮
    - **Validates: Requirements 12.4**

- [ ] 9. Checkpoint - 确保消息渲染正常
  - 确保 Markdown 渲染正确
  - 确保代码高亮正常
  - 确保消息操作按钮可用
  - 如有问题请询问用户

- [ ] 10. 文件上传功能
  - [ ] 10.1 实现文件上传组件
    - 创建 `components/chat/FileUploader.tsx`
    - 实现点击上传
    - 实现拖拽上传
    - 实现粘贴图片
    - 实现文件类型验证
    - 实现文件大小验证
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8_
  
  - [ ]* 10.2 编写文件验证属性测试
    - **Property 4: File Type Validation**
    - **Property 5: File Size Validation**
    - 测试有效/无效文件类型和大小限制
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [ ] 10.3 实现文件预览组件
    - 实现图片缩略图预览
    - 实现文档文件名显示
    - 实现移除按钮
    - _Requirements: 2.4, 2.6_
  
  - [ ]* 10.4 编写文件预览属性测试
    - **Property 6: File Preview Display**
    - 测试图片显示缩略图，文档显示文件名
    - **Validates: Requirements 2.4**

- [ ] 11. 输入区域组件
  - [ ] 11.1 实现输入区域组件
    - 创建 `components/chat/InputArea.tsx`
    - 实现文本输入框（自动扩展高度，最大 120px）
    - 实现 Enter 发送、Shift+Enter 换行
    - 实现发送按钮（带加载状态）
    - 实现模型选择器
    - 集成文件上传组件
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 1.1, 1.2_
  
  - [ ]* 11.2 编写输入区域属性测试
    - **Property 19: Input Field Height Constraint**
    - 测试输入框高度不超过 120px
    - **Validates: Requirements 19.3**

- [ ] 12. 聊天容器和流式响应
  - [ ] 12.1 实现聊天容器组件
    - 创建 `components/chat/ChatContainer.tsx`
    - 集成 MessageList、InputArea
    - 实现 useChat hook 集成
    - 实现流式响应显示
    - 实现打字指示器
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 12.2 实现对话标题自动生成
    - 在首条消息后调用 AI 生成标题
    - 限制标题长度 <= 50 字符
    - 保存标题到对话
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 12.3 编写标题生成属性测试
    - **Property 9: Title Generation Constraints**
    - 测试标题长度 <= 50 且非空
    - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ] 13. Checkpoint - 确保核心聊天功能正常
  - 确保可以发送消息并收到流式响应
  - 确保文件上传和预览正常
  - 确保对话可以保存和加载
  - 如有问题请询问用户

- [ ] 14. 设置面板
  - [ ] 14.1 实现设置面板组件
    - 创建 `components/settings/SettingsPanel.tsx`
    - 实现设置面板模态框
    - 实现标签页切换（主题、提示词）
    - _Requirements: 11.1_
  
  - [ ] 14.2 实现主题设置组件
    - 创建 `components/settings/ThemeSettings.tsx`
    - 实现深色/浅色模式切换
    - 实现主题色选择
    - 实现字体大小调整
    - _Requirements: 13.1, 13.2, 14.1, 14.2, 15.1, 15.2_
  
  - [ ] 14.3 实现提示词设置组件
    - 创建 `components/settings/PromptSettings.tsx`
    - 实现全局系统提示词编辑
    - 实现预设角色模板选择
    - _Requirements: 11.1, 11.3_
  
  - [ ]* 14.4 编写设置持久化属性测试
    - **Property 14: Settings Persistence**
    - 测试主题、颜色、字体大小设置持久化
    - **Validates: Requirements 13.3, 14.3, 15.3**

- [ ] 15. 主题管理
  - [ ] 15.1 实现主题管理 Hook
    - 创建 `hooks/useTheme.ts`
    - 实现主题切换逻辑
    - 实现系统主题检测
    - 实现 CSS 变量更新
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ] 15.2 更新全局样式支持主题
    - 更新 globals.css 支持深色模式
    - 定义主题色 CSS 变量
    - 定义字体大小 CSS 变量
    - _Requirements: 13.1, 14.2, 15.2_

- [ ] 16. 导出功能
  - [ ] 16.1 实现导出功能
    - 实现 Markdown 导出（格式化对话内容）
    - 实现 JSON 导出（完整数据结构）
    - 实现 PDF 导出（使用 jsPDF + html2canvas）
    - 实现文件命名（标题 + 日期）
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  
  - [ ]* 16.2 编写导出格式属性测试
    - **Property 15: Export Format Correctness**
    - 测试 Markdown 和 JSON 导出格式正确
    - **Validates: Requirements 16.1, 16.2, 16.4**

- [ ] 17. 媒体下载功能
  - [ ] 17.1 实现媒体下载组件
    - 在消息中检测图片/视频
    - 显示下载按钮
    - 实现下载功能（自动命名：chat_media_YYYYMMDD_NNN.ext）
    - _Requirements: 17.1, 17.2, 17.3_
  
  - [ ]* 17.2 编写媒体下载属性测试
    - **Property 16: Media Download Button Presence**
    - 测试包含媒体的消息显示下载按钮
    - **Validates: Requirements 17.1, 17.2**

- [ ] 18. 系统提示词功能
  - [ ] 18.1 实现对话级系统提示词
    - 在对话创建/编辑时支持设置系统提示词
    - 在 API 请求中使用对话级或全局系统提示词
    - _Requirements: 11.2, 11.4, 11.5_
  
  - [ ]* 18.2 编写系统提示词属性测试
    - **Property 13: System Prompt Usage in API**
    - 测试对话级提示词优先于全局提示词
    - **Validates: Requirements 11.4, 11.5**

- [ ] 19. Checkpoint - 确保所有功能正常
  - 确保设置面板可以正常使用
  - 确保主题切换正常
  - 确保导出功能正常
  - 如有问题请询问用户

- [ ] 20. 集成和优化
  - [ ] 20.1 集成所有组件
    - 在主页面集成所有组件
    - 确保组件间通信正常
    - 确保状态同步正常
    - _Requirements: All_
  
  - [ ] 20.2 响应式设计优化
    - 优化移动端布局
    - 实现侧边栏折叠
    - 优化触摸交互
    - _Requirements: 18.4_
  
  - [ ] 20.3 性能优化
    - 实现消息列表虚拟滚动（如消息过多）
    - 优化大文件预览
    - 优化 Markdown 渲染性能
    - _Requirements: 18.4_

- [ ] 21. Final Checkpoint - 确保所有测试通过
  - 运行所有单元测试
  - 运行所有属性测试
  - 确保所有功能正常工作
  - 如有问题请询问用户

## Notes

- 任务标记 `*` 的为可选测试任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求编号以便追溯
- Checkpoint 任务用于阶段性验证，确保增量开发的稳定性
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
