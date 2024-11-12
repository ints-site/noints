# TypeNote - A Modern Note-Taking Application
# TypeNote - 现代笔记应用

## Getting Started | 开始使用

### Prerequisites | 前置要求
- Node.js (v18.x)
- npm (latest version | 最新版本)

### Installation | 安装

1. Clone the repository | 克隆仓库:

## Project Structure | 项目结构

```
typenote/
├── client/                 # Frontend | 前端
│   └── src/
│       ├── components/     # React components | React组件
│       ├── styles/        # CSS/SCSS files | 样式文件
│       ├── hooks/         # Custom React hooks | 自定义React钩子
│       ├── store/         # State management | 状态管理
│       └── utils/         # Utility functions | 工具函数
├── server/                # Backend | 后端
│   └── src/
│       ├── controllers/   # Route controllers | 路由控制器
│       ├── models/        # Data models | 数据模型
│       ├── routes/        # API routes | API路由
│       └── utils/         # Utility functions | 工具函数
└── shared/                # Shared types/interfaces | 共享类型/接口
```

## Features | 功能特性
1. Notebook Organization | 笔记本组织
   - Create and manage multiple notebooks | 创建和管理多个笔记本
   - Hierarchical sections within notebooks | 笔记本内的层级章节
   - Drag and drop section reordering | 拖拽重排章节
   - Rename notebooks and sections with double-click | 双击重命名笔记本和章节

2. Note Management | 笔记管理
   - Create and edit notes within sections | 在章节内创建和编辑笔记
   - Real-time note title editing | 实时笔记标题编辑
   - Note deletion with confirmation | 删除笔记时需确认
   - Intuitive note organization | 直观的笔记组织方式

3. Rich Text Editor | 富文本编辑器
   - Basic text formatting (bold, italic, underline) | 基础文本格式化（粗体、斜体、下划线）
   - Bulleted and numbered lists | 项目符号和编号列表
   - Clean and minimalist interface | 简洁的极简界面
   - Dark mode support | 深色模式支持

4. Auto-saving | 自动保存
   - Automatic content saving | 自动内容保存
   - Debounced save to prevent frequent updates | 防抖保存避免频繁更新
   - Redux state management | Redux状态管理
   - Persistent storage | 持久化存储

5. Modern UI/UX | 现代界面/用户体验
   - Responsive layout with resizable panels | 响应式布局与可调整面板
   - Smooth dark mode transitions | 平滑的深色模式切换
   - Material design icons | Material设计图标
   - Tailwind CSS styling | Tailwind CSS样式

> Development Note | 开发说明：
> 每次代码提交push到beta分支，完善版本后再从beta分支提交到main分支。
> Push code to beta branch first, then merge to main branch after version refinement.
