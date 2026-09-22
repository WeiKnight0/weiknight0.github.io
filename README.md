# WKN Personal Site

前后端分离的个人网站：Astro 提供静态页面，Spring Boot 与 PostgreSQL 提供动态内容 API。生产环境由 Nginx 提供静态文件并将 `/api/` 反向代理到后端。

导航栏提供浅色/深色主题切换并在浏览器中保存偏好。Real 保留代码字体风格，Fiction 使用文学衬线字体；Notes 是不经过 Astro 的独立阅读器。

## 目录

- `frontend/`：Astro 前端源码、静态资源、Node.js 配置与前端 Dockerfile。
- `notes/docs/`：指向独立 `wkn-notes` 仓库的 Git Submodule，是 Notes 唯一的 Markdown 与图片数据源。
- `notes/reader/`：独立 Vite 阅读器，复用旧站 Notes 样式与 Markdown 扩展。
- `notes/algorithm-templates/`：独立的算法模板静态工具。
- `backend/`：Spring Boot API 服务。
- `data/postgres/`：PostgreSQL 持久化数据（已忽略，不提交 Git）。
- `data/user-avatars/`：用户头像持久化目录（已忽略，不提交 Git）。
- `data/fiction-assets/`：Fiction 稿件图片持久化目录（已忽略，不提交 Git）。
- `nginx/wkn-personal-site.conf`：生产 Nginx 示例配置。

## 克隆仓库

首次克隆时同时初始化笔记 Submodule：

```bash
git clone --recurse-submodules <网站仓库地址>
```

已有工作目录可执行：

```bash
git submodule update --init --recursive
```

更新网站时按外层仓库记录的版本同步笔记：

```bash
git pull --ff-only
git submodule sync --recursive
git submodule update --init --recursive
```

## Docker 启动

服务器仅需 Docker 与 Docker Compose 插件，无需安装 Node.js、Java、Maven 或 Nginx。

```bash
mkdir -p data/postgres data/user-avatars data/fiction-assets
sudo chown -R 1000:1000 data/postgres data/user-avatars data/fiction-assets
docker compose up -d --build
```

默认通过 `https://localhost` 访问网站。首次启动前生成仅供本地测试的自签证书（证书目录已被 Git 忽略）：

```bash
mkdir -p nginx/certs
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout nginx/certs/localhost.key \
  -out nginx/certs/localhost.crt \
  -subj '/CN=localhost' \
  -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1'
chmod 600 nginx/certs/localhost.key
```

浏览器会显示不受信任警告；请手动继续访问，或将该证书导入本机信任库。`http://localhost` 会永久重定向至 HTTPS。`https://localhost/api/health` 可验证 Nginx 到 Spring Boot 的路由。可通过 `HTTP_PORT=8088 HTTPS_PORT=8443 docker compose up -d --build` 同时变更对外端口。

Nginx、Spring Boot 和 PostgreSQL 的运行进程均固定使用 UID/GID `1000:1000`。持久化目录必须属于该用户；已有数据升级时也需要先停止服务并执行上面的 `chown`。Nginx 在容器内监听非特权端口 8080，对外端口仍默认为 80。

运行时仅包含 Nginx（上限 128MB）、Spring Boot 后端（上限 512MB）和 PostgreSQL（上限 256MB）。Node 和 Maven 仅用于镜像构建，不会驻留在服务器内存中，适合 2GB 服务器。

首次启动会自动创建动态内容所需的 PostgreSQL 数据表并导入现有项目列表。笔记不进入数据库，也没有网页编辑器；Spring Boot 只读地返回 `notes/docs/` 中的 Markdown，独立阅读器在浏览器中渲染。该目录同时以只读方式挂载到 Nginx 和后端，因此修改 Markdown 或图片后无需重新构建或重启。Nginx 会对所有 `/real/notes/**` 请求执行登录鉴权，并在读取页面前确认对应文件真实存在。About 与 Privacy 是 `/about/`、`/privacy/` 独立静态页面，不属于笔记数据。生产部署前必须设置强密码：`POSTGRES_PASSWORD='your-strong-password' docker compose up -d --build`。

编辑笔记前进入 Submodule 并切换到 `main`。先提交并推送笔记仓库，再回到网站仓库提交新的 Submodule 指针：

```bash
git -C notes/docs switch main
git -C notes/docs pull --ff-only

# 编辑笔记后
git -C notes/docs add .
git -C notes/docs commit -m "docs: update notes"
git -C notes/docs push

git add notes/docs
git commit -m "chore: update notes submodule"
git push
```

将 `.env.example` 复制为 `.env` 后设置 `POSTGRES_PASSWORD`、`ADMIN_USERNAME` 和 `ADMIN_PASSWORD`。后两个变量只在数据库中尚无该用户名时初始化管理员；管理员随后在个人中心修改的资料、头像和密码都会持久化，不会在重启时被环境变量覆盖。登录后可从管理后台维护 Fiction 内容和用户。所有用户都可在 `/profile/` 修改显示名称、个人简介、头像和密码；公开注册入口不存在。

停止服务：

```bash
docker compose down
```

## 生产部署

从仍含博客功能的版本升级前，先在仓库外备份旧博客表；V16 数据库迁移会永久删除该表：

```bash
docker compose exec -T postgres pg_dump -U wkn -d wkn_site --no-owner --no-privileges --table=posts --table=posts_id_seq > ../wkn-posts-before-v16.sql
```

```bash
SITE_URL=https://your-domain.example docker compose up -d --build
```

在 `.env` 中填写 `ICP_RECORD_NUMBER=京ICP备xxxxxxxx号` 并重新构建前端镜像后，主站与 Notes 页脚会显示指向工信部备案系统的备案号；该值留空时不显示。

容器内的 [Nginx 配置](nginx/wkn-personal-site.conf) 已提供静态资源、长期缓存、`/api/` 到后端容器的反向代理，以及本地测试 HTTPS。生产环境不得使用镜像内的自签证书：应挂载受信任证书与私钥替换 `/etc/nginx/certs/localhost.crt`、`/etc/nginx/certs/localhost.key`，或在此 Compose 服务前放置证书终止代理。

## 不使用 Docker 的前端开发

安装 Node.js 后运行 `cd frontend && npm install && npm run dev` 可开发主站。Notes 阅读器可在 `notes/reader/` 中单独安装依赖并运行 `npm run dev`；完整的登录、文件映射与 404 行为请通过 Docker 中的 Nginx 验证。
