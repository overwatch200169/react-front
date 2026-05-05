# 个人博客网站

一个基于 Vite + React 的现代化个人博客系统，支持 Markdown 渲染、标签分类等常用功能。

## 功能特性

- 📝 **文章列表** - 展示所有博客文章
- 📖 **文章详情** - 支持 Markdown 渲染的完整文章阅读体验
- 🏷️ **标签分类** - 按标签筛选和浏览文章
- 👤 **关于页面** - 个人介绍和技能展示
- 🌐 **跨域配置** - Vite 代理解决前后端分离跨域问题

## 技术栈

- **构建工具**: Vite 5.x
- **前端框架**: React 18.x
- **路由**: React Router 6.x
- **Markdown**: react-markdown + remark-gfm
- **HTTP 客户端**: Axios

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看博客

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 项目结构

```
├── index.html          # HTML 入口
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置（含跨域代理）
├── public/              # 静态资源
└── src/
    ├── main.jsx         # React 入口
    ├── App.jsx          # 根组件
    ├── index.css        # 全局样式
    ├── components/      # 通用组件
    │   ├── Header.jsx
    │   └── Footer.jsx
    ├── pages/           # 页面组件
    │   ├── ArticleList.jsx
    │   ├── ArticleDetail.jsx
    │   ├── TagsPage.jsx
    │   └── AboutPage.jsx
    └── services/         # API 服务
        └── api.js
```

## API 对接

项目已配置好与后端 FastAPI 的对接，跨域代理配置在 `vite.config.js` 中：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    secure: false
  }
}
```

请确保后端服务运行在 http://localhost:8000

## 核心 API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/v1/article/` | GET | 获取文章列表 |
| `/api/v1/article/{id}` | GET | 获取文章详情 |
| `/api/v1/users/{id}/profile` | GET | 获取用户资料 |
| `/api/v1/search/search/article` | GET | 搜索文章（支持标签筛选） |

## 许可证

MIT
