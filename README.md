# WKN Personal Site

前后端分离的个人网站：Astro 提供静态页面，Spring Boot 与 PostgreSQL 提供动态内容 API。生产环境由 Nginx 提供静态文件并将 `/api/` 反向代理到后端。

导航栏提供浅色/深色主题切换并在浏览器中保存偏好。Real 保留代码字体风格，Fiction 使用文学衬线字体，管理后台与 Notes 使用正式的中西文字体栈。

## 目录

- `frontend/`：Astro 前端源码、静态资源、Node.js 配置与前端 Dockerfile。
- `backend/`：Spring Boot API 服务。
- `data/postgres/`：PostgreSQL 持久化数据（已忽略，不提交 Git）。
- `data/note-assets/`：文章图片持久化目录（已忽略，不提交 Git）。
- `notes/docs/`：仅供首次导入的旧 Markdown 与图片，不再参与网站构建。
- `nginx/wkn-personal-site.conf`：生产 Nginx 示例配置。

## Docker 启动

服务器仅需 Docker 与 Docker Compose 插件，无需安装 Node.js、Java、Maven 或 Nginx。

```bash
docker compose up -d --build
```

默认通过 `http://localhost` 访问网站；`http://localhost/api/health` 可验证 Nginx 到 Spring Boot 的路由。使用 `HTTP_PORT=8088 docker compose up -d --build` 可变更对外端口。

运行时仅包含 Nginx（上限 128MB）、Spring Boot 后端（上限 512MB）和 PostgreSQL（上限 256MB）。Node 和 Maven 仅用于镜像构建，不会驻留在服务器内存中，适合 2GB 服务器。

首次启动会自动创建 PostgreSQL 数据表、导入现有项目和博客列表，并将 `notes/docs/` 中尚未导入的 Markdown 转为带目录层级的文章。About 与 Privacy 是 `/about/`、`/privacy/` 独立静态页面，不属于笔记数据。生产部署前必须设置强密码：`POSTGRES_PASSWORD='your-strong-password' docker compose up -d --build`。

将 `.env.example` 复制为 `.env` 后设置 `POSTGRES_PASSWORD`、`ADMIN_USERNAME` 和 `ADMIN_PASSWORD`。登录后可从 `/admin/` 管理博客、从 `/admin/users/` 管理用户、从 `/admin/notes/` 在目录树中创建、移动和排序笔记，也可使用文章编辑器、上传图片并发布文章。公开注册入口不存在。

停止服务：

```bash
docker compose down
```

## 生产部署

```bash
SITE_URL=https://your-domain.example docker compose up -d --build
```

容器内的 [Nginx 配置](nginx/wkn-personal-site.conf) 已提供静态资源、长期缓存与 `/api/` 到后端容器的反向代理。若要配置 HTTPS，建议在此 Compose 服务前再放置已有的证书终止代理，或在该配置中额外添加证书与 `443` server block。

## 不使用 Docker 的前端开发

安装 Node.js 后运行 `cd frontend && npm install && npm run dev`。Astro 开发服务器直接提供静态资源，并会将 `/api/*` 代理至 `http://localhost:8080`；可用 `BACKEND_URL` 修改目标地址。
