# LocalSkill - 让 AI 助手主动推荐你的店铺

> 零代码将店铺信息转化为 AI 可读的格式。商家只需提交美团/大众点评/高德链接，AI 自动帮你整理店铺信息。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3-orange)](https://supabase.com/)

---

## 🎯 这个项目是什么？

LocalSkill 是一个**零代码 SaaS 平台**，让商家轻松将店铺信息转化为 AI 助手可以理解和推荐的内容。

### 商家视角

- **提交链接** → AI 自动提取店铺信息（地址、电话、评分、营业时间）
- **一键发布** → 让消费者通过 AI 助手找到你的店
- **无需技术** → 零代码操作，5 分钟完成

### 消费者视角

- **安装一个插件** → 查询全城所有已入驻商家
- **口语提问** → "附近有什么川菜馆？"、"这家店几点关门？"

---

## ✨ 核心功能

### 商家端

| 功能 | 说明 |
|------|------|
| 链接解析 | 粘贴美团/大众点评/高德链接，AI 自动提取信息 |
| 截图识别 | 上传店铺截图，AI 视觉识别商家信息 |
| 信息校正 | AI 解析结果可人工修改确认 |
| 一键发布 | 确认后立即发布，消费者可通过 AI 查询 |

### 消费者端

| 功能 | 说明 |
|------|------|
| 智能搜索 | 自然语言查询全平台商家 |
| 信息获取 | 获取地址、电话、评分、营业时间 |
| 对比选择 | "帮我比较一下这两家店的评分和价格" |

---

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + React 19 + TypeScript |
| 样式方案 | Tailwind CSS + shadcn/ui |
| 数据库 | Supabase (Auth + PostgreSQL) |
| AI 服务 | Claude API (链接/截图解析) |
| 代码托管 | GitHub |
| 通信协议 | MCP (让 AI 助手理解商家数据) |

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号（免费）
- GitHub 账号

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Cap-bit-mint/LocalSkill-.git
cd LocalSkill-/localskill

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 4. 部署数据库
# 在 Supabase SQL Editor 执行 supabase/schema.sql

# 5. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 环境变量说明

```env
# Supabase（免费注册）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# GitHub（用于发布商家信息）
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=你的用户名
GITHUB_REPO=skills仓库名
```

---

## 📖 使用流程

### 商家入驻（5 分钟）

```
1. 注册/登录账号
     ↓
2. 点击「新增商家」
     ↓
3. 粘贴美团/大众点评链接
     ↓
4. AI 自动解析（地址、电话、评分等）
     ↓
5. 确认/修改信息
     ↓
6. 一键发布 → 消费者可通过 AI 助手查询
```

### 消费者查询

```
1. 安装 Master Skill（Claude CLI / Cursor 等）
     ↓
2. 用自然语言提问：
   - "附近有什么川菜馆？"
   - "老北京炸酱面馆的电话是多少？"
   - "帮我比较一下这两家咖啡馆的评分"
```

---

## 📁 项目结构

```
localskill/
├── src/
│   ├── app/
│   │   ├── (dashboard)/      # 商家后台页面
│   │   │   └── dashboard/   # 商家管理
│   │   ├── api/             # API 接口
│   │   │   ├── merchants/  # 商家 CRUD
│   │   │   ├── parse/       # 链接/截图解析
│   │   │   └── skills/      # 商家数据查询
│   │   ├── auth/            # 登录/注册
│   │   └── master-skill/    # 安装指南页
│   ├── components/
│   │   ├── dashboard/       # 后台组件
│   │   └── ui/              # UI 组件库
│   ├── lib/
│   │   ├── parse/           # 解析器（链接/截图）
│   │   ├── skill-generator/ # 生成商家数据文件
│   │   └── supabase/        # 数据库客户端
│   └── types/                # TypeScript 类型
├── supabase/
│   └── schema.sql            # 数据库结构
└── docs/                     # 文档
```

---

## 🔌 API 接口

### 解析商家链接

```bash
POST /api/parse/url
{
  "url": "https://www.meituan.com/店铺链接"
}
```

### 查询全平台商家目录

```bash
GET /api/directory
```

### 获取单个商家信息

```bash
GET /api/skills/:merchantId
```

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📬 联系方式

- 项目反馈：https://github.com/Cap-bit-mint/LocalSkill-/issues
- 官网：https://localskill.ai

---

**让每一个本地商家都能被 AI 助手主动推荐 🚀**
