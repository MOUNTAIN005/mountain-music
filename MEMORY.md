# MOUNTAIN MUSIC — 建站记录

> 最后更新：2026-07-13（Codex 部署修复）
> 当前对话：Codex

## 项目概况

山影知道 | MOUNTAIN Music — 个人音乐网站。使用 Next.js 15 构建。

- **在线地址**: https://mountain-music.up.railway.app
- **后台地址**: https://mountain-music.up.railway.app/admin/login
- **源码仓库**: https://github.com/MOUNTAIN005/mountain-music
- **部署方式**: Railway（当前旧部署运行中，新构建无法启动）

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 15.5.20 |
| React | 19.x |
| Prisma | 5.22 |
| Tailwind CSS | 3.4 |
| Framer Motion | 12.42.2 |
| Zustand | 5.x |
| 数据库 | Railway PostgreSQL |

## Railway 部署架构（当前）

当前使用 Dockerfile + start.sh 部署。由于 Railway 构建系统存在问题，新部署尝试始终卡在 "scheduling build on Metal builder" 阶段，无法真正启动构建。

**当前运行中的版本**: 2026-07-13 02:09 的旧部署（`a3fe6e8d`）

## 本轮改动（2026-07-13 Codex 部署修复）

### 代码改动

| 改动 | 文件 | 原因 |
|------|------|------|
| `onlyBuiltDependencies` 加入 `@prisma/client`、`prisma` | `pnpm-workspace.yaml` | pnpm 堵死了 prisma 的构建脚本 |
| PostgreSQL 生产 schema | `prisma/schema.prisma` | 默认 schema 同步为 PostgreSQL |
| 删除 `Dockerfile` → 重建 | `Dockerfile` | 提供稳定的 Dockerfile 部署方案 |
| 智能路径检测 | `start.sh` | 支持 Dockerfile 和 Railpack 两种部署路径 |
| `outputFileTracingIncludes` | `next.config.ts` | 确保 prisma 目录包含在 standalone 输出中 |
| 移除无用依赖 | `package.json` | `@vercel/blob`、`vercel`（Vercel 实验残留） |
| `ignore-scripts=true` | `.npmrc` | 阻止 npm postinstall 时 Prisma ESM 报错 |
| 多次尝试 `railway.json` | — | 尝试 Dockerfile/Nixpacks builder 切换 |
| 多次断连重连 | — | 刷新服务 manifest 缓存 |

### 结论

所有代码层面的问题已修复，本地 `pnpm run build` 也通过了。
但 Railway 的构建系统存在基础设施级问题——新部署的日志始终只有 `scheduling build on Metal builder`，构建从未实际启动。

网站当前仍由旧部署（02:09）正常提供服务。

### 建议

1. 联系 Railway 支持，检查 Metal builder 状态
2. 或者通过 Railway Dashboard 手动触发部署
3. 也可以尝试 `railway up` 从本地上传部署

### 数据库模型

User, Song, Album, RecommendedSong, Story, Contact, Setting, SocialLink
