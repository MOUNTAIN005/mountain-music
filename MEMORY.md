
# MOUNTAIN MUSIC — 建站记录（2026-07-12 大重构）

> 最后更新：2026-07-12
> 当前对话：MOUNTAINMUSIC建站聊天4

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
| Prisma | 5.20 |
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

User, Song, Album, RecommendedSong, Story, Contact, Setting
(已移除未使用的 PlayRecord)

## 音频/文件上传策略

音频统一通过 /api/uploads/ 提供。Railway 需设置 UPLOAD_DIR=/tmp/uploads。
Volume 挂载到 /app/uploads（生产环境），本地开发用 public/uploads/。
start.sh 在启动时自动将 music/ 中的歌曲文件复制到上传目录（仅首次）。

## Railway 部署架构（最终）

```
Railpack build → npm install → npm run build (standalone output)
         ↓
Pre-deploy: npx prisma db push && npx prisma db seed
         ↓
node .next/standalone/server.js
```

**关键变更：**
- 删掉 `railway.json` → 换用 Railpack 自动检测
- 删掉 `railway-start.sh` → 功能全部由 Pre-deploy Command 替代
- `next.config.ts` 加 `output: 'standalone'` → 构建输出适配 Railway
- `package.json` start 改为 `node .next/standalone/server.js`
- 移除 `@railway/cli` 依赖（不是必须的）
- PlayRecord 模型已移除（从未使用）
- 种子脚本精简：只创建管理员 + 网站设置，歌曲和故事通过后台管理界面添加

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
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

## 当前对话

对话名: MOUNTAINMUSIC建站聊天4
下一个建议: Railway Dashboard 设置 + 首次部署
