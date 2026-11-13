# WKN Personal Site

个人展示、项目、世界观、原创角色和学习笔记组成的纯静态网站，部署到 GitHub Pages。内容直接维护在 Markdown 中，不需要后端、数据库、登录、Docker 或服务器。

## 目录

- `frontend/`：Astro 主站，包含页面、主题、语言切换和内容集合。
- `notes/content/`：笔记 Markdown 和配图，直接随网站一起维护。
- `notes/reader/`：独立笔记阅读器，保留公式、代码高亮与复制、目录、折叠解答和打印。
- `notes/algorithm-templates/`：可检索、复制和下载的算法模板工具。
- `scripts/`：统一构建、静态预览和链接验证。
- `.github/workflows/pages.yml`：GitHub Pages 自动部署。

## 本地使用

需要 Node.js 22.12 或更高版本。所有依赖使用根目录的一个 lockfile 管理。

```bash
git clone <网站仓库地址>
cd <网站目录>
npm ci
npm run build
npm run preview
```

预览地址：`http://127.0.0.1:4321/`。`npm run dev` 会先构建整站再启动预览；修改内容后重新构建即可。只开发主站且需要热更新时使用 `npm run dev:site`，这个开发服务不包含独立笔记和算法模板的构建产物。

笔记已从原子模块并入 `notes/content/`。普通克隆即可获得全部内容，部署不再需要访问 GitLab 或配置额外凭据。

常用检查：

```bash
npm run check       # Astro/TypeScript 检查和路径/笔记链接测试
npm run build       # 生成可部署的 dist/
npm run verify      # 检查所有 HTML、318 篇现有笔记的渲染结果和本地链接/资源
```

笔记缺失、元数据无效或笔记路由冲突会使构建失败，避免发布不完整站点。笔记数量会随内容更新变化。

## GitHub Pages 部署

1. 将包含 `.github/workflows/pages.yml` 的改动合并并推送到 GitHub 仓库的 `main` 分支。只保存在本地或推送到其他分支时，不会自动发布。
2. 在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 在 **Actions** 中运行 `Deploy GitHub Pages`，或向 `main` 推送新提交。
4. 等待 build 和 deploy 成功，Pages 地址会显示在部署结果中。

工作流自动读取 Pages 的域名和路径：

- 用户主页仓库 `WeiKnight0.github.io`：`https://weiknight0.github.io/`。
- 项目仓库 `wkn-personal-site`：`https://weiknight0.github.io/wkn-personal-site/`。
- 配置自定义域名后，工作流同样读取 Pages 设置，无需在源码中写死地址。

工作流通过 `npm ci` 安装，运行检查和构建，再验证链接，将 `dist/` 上传为 Pages artifact。向 `main` 提交的 Pull Request 也会运行构建和验证，但不会发布；向 `main` 推送或在 `main` 手动运行工作流才会部署。只有 deploy job 具有 Pages 写权限。

若 GitHub Actions 中没有出现工作流，先检查 GitHub 的 `main` 分支是否已包含 `.github/workflows/pages.yml`；仅在本地分支创建该文件不会同步到 GitHub。

本地默认构建目标为 `https://weiknight0.github.io/`。测试项目路径时，可在 Git Bash 中设置环境变量：

```bash
MSYS_NO_PATHCONV=1 SITE_URL=https://weiknight0.github.io SITE_BASE_PATH=/wkn-personal-site/ npm run build
npm run verify
npm run preview
```

此时预览地址为 `http://127.0.0.1:4321/wkn-personal-site/`。`SITE_URL` 只填写协议和域名，仓库路径单独放在 `SITE_BASE_PATH`。`.env.example` 仅说明这两个构建变量；根构建通过命令行/CI 环境变量读取配置。

## 编辑内容

### 主站

- 个人资料：`frontend/src/utils/Profile.ts`。
- 项目列表和详情：`frontend/src/content/projects/*.md`。
- 世界观：`frontend/src/content/world/en/` 和 `zh-cn/`。
- 原创角色：`frontend/src/content/ocs/*.md`，填写 `title`、`description`、`order`；`draft: true` 的内容不发布。

页面在构建时从内容集合生成，修改 Markdown 后重新构建部署。项目列表与详情使用同一份静态内容。

### 笔记

直接编辑 `notes/content/`。`index.md` 对应目录首页，其他 `.md` 文件对应同名目录路由，例如：

| 笔记源文件 | 公开路径（省略站点前缀） |
| --- | --- |
| `index.md` | `/notes/` |
| `CSAPP/index.md` | `/notes/CSAPP/` |
| `CSAPP/01-computer-systems-tour.md` | `/notes/CSAPP/01-computer-systems-tour/` |

Markdown 相对链接、图片、公式、代码和现有阅读工具继续可用。每个笔记地址都有实际的 `index.html`，可以直接打开或刷新。`/notes/algorithm-templates/` 与 `/notes/_sources/` 是保留路径。

笔记和主站一起提交、构建、部署，无需单独更新仓库指针。

**发布的笔记、Markdown 原文和图片均公开可访问。** 静态站点没有账户或访问控制，请在发布前确认内容适合公开。

### 算法模板

在 `notes/algorithm-templates/content/` 中维护模板；元数据格式与工具说明见该目录的 README。统一构建会将工具发布到 `/notes/algorithm-templates/`。

## 迁移说明

原 Java 后端、数据库、账户、头像上传、管理界面、旧版前端和 Docker 部署代码已移除。当前项目只发布仓库中的静态内容。运行中数据库里另外保存的内容不会自动转换为 Markdown；旧服务器数据和备份需要单独保留。
