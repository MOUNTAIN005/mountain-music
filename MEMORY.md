
# MOUNTAIN MUSIC — 建站记录

> 最后更新：2026-07-12
> 当前对话：MOUNTAINMUSIC建站聊天3

## 项目概况

山影知道 | MOUNTAIN Music — 个人音乐网站。使用 Next.js 15 构建，支持歌曲管理、专辑、故事投稿、排行榜、后台管理等功能。部署在 Railway。

- **在线地址**: https://mountain-music.up.railway.app
- **后台地址**: https://mountain-music.up.railway.app/admin/login
- **源码仓库**: https://github.com/MOUNTAIN005/mountain-music
- **部署方式**: Railway (Nixpacks builder)

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
| 数据库 | Railway PostgreSQL / 本地 SQLite |

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

## 数据库模型

User, Song, Album, RecommendedSong, Story, Contact, Setting, PlayRecord

## 音频策略

音频统一通过 /api/uploads/ 提供。Railway 需设置 UPLOAD_DIR=/tmp/uploads。
启动脚本自动复制 music/ 到上传目录并迁移旧 URL。

## 本阶段改动 (2026-07-12)

### 已完成

1. 歌曲管理页 — mock 数据重写为 API CRUD
2. 网站设置页 — 连接 Settings API 持久化
3. 导航栏 — 增加「单曲管理」入口
4. 投稿管理 — 使用 ?all=true
5. Stories API — 新增 ?all=true
6. 上传路由 — URL 始终用 /api/uploads/
7. 种子脚本 — 音频 URL 从 /music/ 改为 /api/uploads/
8. Railway 启动脚本 — 复制音乐文件 + 迁移旧 URL
9. framer-motion — 11.x → 12.x 修复 React 19 兼容
10. 专辑页 — 修复 TypeScript 类型错误

### 待处理

- Railway 自动部署未触发，需检查 Dashboard
- 仪表盘数据仍是硬编码
- PlayRecord 模型未使用
- RecommendedSong 与 Song 独立，可考虑合并

## 部署

Railway: GitHub 推 main 触发自动部署，或从 Dashboard 手动部署。
本地: cp .env.example .env.local, npm install, npx prisma db push, npx next dev

## 当前对话

对话名: MOUNTAINMUSIC建站聊天3
下一个建议: MOUNTAINMUSIC建站聊天4
