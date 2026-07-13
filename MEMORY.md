# MOUNTAIN MUSIC — 建站记录

> 最后更新：2026-07-13（建站聊天7 + 部署修复）
> 当前对话：Codex

## 项目概况

山影知道 | MOUNTAIN Music — 个人音乐网站。使用 Next.js 15 构建，支持歌曲管理、专辑、故事投稿、排行榜、后台管理等功能。部署在 Railway。

- **在线地址**: https://mountain-music.up.railway.app
- **后台地址**: https://mountain-music.up.railway.app/admin/login
- **源码仓库**: https://github.com/MOUNTAIN005/mountain-music
- **部署方式**: Railway (Railpack — 新版零配置构建)

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 15.5.20 |
| React | 19.x |
| TypeScript | 5.6 |
| Prisma | 5.22 |
| Tailwind CSS | 3.4 |
| Framer Motion | 12.42.2 |
| Zustand | 5.x |
| 数据库 | Railway PostgreSQL |

## 管理后台页面

| 路由 | 名称 | 状态 |
|------|------|------|
| /admin/dashboard | 仪表盘 | 静态统计卡片 |
| /admin/songs | 单曲管理 | 完整 CRUD（2026-07-12 重构） |
| /admin/albums | 专辑管理 | 完整 CRUD |
| /admin/hero | HERO编辑 | 对接 API |
| /admin/recommend | 推荐歌曲编辑 | 对接 API |
| /admin/submissions | 审核投稿 | 对接 API |
| /admin/settings | 网站设置 | 对接 API（2026-07-12 重构） |
| /admin/login | 登录 | JWT 鉴权 |

## 数据库模型（精简后）

User, Song, Album, RecommendedSong, Story, Contact, Setting, SocialLink
(已移除未使用的 PlayRecord)

## 音频/文件上传策略

音频统一通过 /api/uploads/ 提供。Railway 需设置 UPLOAD_DIR=/tmp/uploads。
Volume 挂载到 /app/uploads（生产环境），本地开发用 public/uploads/。
start.sh 在启动时自动将 music/ 中的歌曲文件复制到上传目录（仅首次）。

## Railway 部署架构（当前）

```
GitHub push → Railway 自动检测 → Railpack 构建
         ↓
node prisma/prepare-db.js → prisma generate --schema=prisma/schema.pg.prisma → next build
         ↓
start.sh: npx prisma db push --accept-data-loss → node .next/standalone/server.js
```

**关键变更：**
- Dockerfile 已删除，回归 Railpack 自动检测
- `pnpm-workspace.yaml` 允许 `@prisma/client` 和 `prisma` 构建脚本
- `schema.prisma` 动态切换（`prepare-db.js` 根据环境自动选择 pg 或 sqlite）
- 移除 `@vercel/blob`、`vercel` 等无用依赖
- `next.config.ts` 加 `output: 'standalone'` → 构建输出适配 Railway
- `package.json` start 改为 `node .next/standalone/server.js`

## 首次部署：Railway Dashboard 设置步骤

1. 清空 PostgreSQL 数据库（Reset 数据）
2. 创建 Volume，挂载到 `/app/uploads`
3. 添加环境变量 `UPLOAD_DIR=/app/uploads`
4. 设置 Pre-deploy Command: `npx prisma db push && npx prisma db seed`
5. 检查 GitHub 自动部署是否启用（Service Settings → Source）
6. 部署后访问后台 → 添加歌曲和上传音频文件
7. 如需导入现有 .wav 文件，通过 Railway CLI 上传到 Volume

## 部署

**生产（Railway）**
- 推 main → GitHub → Railway 自动部署
- 首次部署后通过后台界面上传音频文件

**本地开发**
```
cp .env.example .env.local
pnpm install
pnpm run setup:local
pnpm dev
```

## 本轮改动（2026-07-13 建站聊天7 + 部署修复）

### 建站聊天7 工作内容（从 git log 还原）

| 改动 | 详情 |
|------|------|
| 尝试 Vercel Blob 存储 | 改用 Vercel Blob → 客户端直传 → 最终回退服务器上传 |
| HERO 样式微调 | 作者/专辑名同行对齐、Artist 字体缩小 |
| Railway 部署修复 | 多次修复 pnpm 构建 + Prisma + onlyBuiltDependencies |

### 本轮部署修复（2026-07-13）

| 改动 | 原因 |
|------|------|
| 删除 Dockerfile | 回归 Railpack 零配置构建，避免 Railpack/Docker 冲突 |
| `pnpm-workspace.yaml` | 允许 `@prisma/client` 和 `prisma` 运行构建脚本 |
| `schema.prisma` → PostgreSQL | 默认 schema 同步为 PostgreSQL，匹配生产环境 |
| 移除 `@vercel/blob`、`vercel` | Vercel 实验残留，已无代码引用 |
| 本地构建验证 | 修正了 12 次连续 Railway 构建失败的问题 |

### 待办
- 后台管理页面上传功能测试
- WAV → MP3 转换
- 联系我们页功能完善
- 故事管理侧边栏链接

### 下一个建议
- 确认 Railway 部署成功后，测试音频上传和播放功能
- 完善 `prisma/schema.sqlite.prisma` 确保与 pg 版本模型同步
