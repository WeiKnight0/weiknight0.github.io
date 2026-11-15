# WeiKnight Personal Site

个人主页与作品档案，使用 Astro 构建并发布为 GitHub Pages 静态站点。本站包含个人介绍、项目和世界观理论；学习笔记由独立的 Notes 仓库发布，本站只提供入口。

## 本地开发

需要 Node.js 22.12 或更高版本。在本仓库根目录运行：

```bash
npm ci
npm run check
npm run build
npm run verify
npm run preview
```

默认预览地址为 `http://127.0.0.1:4321/`。`npm run dev` 会先构建再启动静态预览；只修改 Astro 页面时可用 `npm run dev:site` 启动开发服务器。`npm run check` 运行 Astro/TypeScript 检查和脚本测试，`npm run verify` 校验构建产物中的站内链接与资源。

## 内容与结构

- `frontend/src/pages/`：主站页面。
- `frontend/src/utils/Profile.ts`：个人资料。
- `frontend/src/utils/ProjectExperience.ts`：首页项目经历。
- `frontend/src/content/projects/`：项目详情。
- `frontend/src/content/world/`：中英文世界观理论内容。
- `scripts/`：构建、预览和校验脚本。

笔记与算法模板在独立 Notes 仓库维护，不属于本仓库的构建产物。

## GitHub Pages

`.github/workflows/pages.yml` 仅在推送到 `main` 或 `dev` 时运行检查和构建；只有 `main` 上传产物并部署。其他分支和 Pull Request 不触发该工作流。`main` 受分支保护，先将功能分支合并到 `main` 再发布。在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。

构建从 Pages 设置读取 `SITE_URL`（域名）和 `SITE_BASE_PATH`（站点路径）。用户主页仓库通常使用 `/`，项目仓库使用 `/<仓库名>/`。`NOTES_SITE_URL` 指向独立 Notes 站点，当前工作流设置为 `https://weiknight0.github.io/notes/`；若 Notes 的域名或路径改变，需同步更新该值。主站上线前应先确认 Notes 站点可访问，否则 Notes 入口会暂时失效。

本地验证项目站点路径（Git Bash）：

```bash
MSYS_NO_PATHCONV=1 SITE_URL=https://weiknight0.github.io SITE_BASE_PATH=/wkn-personal-site/ npm run build
npm run verify
npm run preview
```

主站无需后端、数据库或登录服务。
