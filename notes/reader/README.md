# 静态笔记阅读器

阅读器用于 GitHub Pages 等静态托管。Markdown 渲染、公式、代码高亮与复制、目录、折叠解析、图片缩放、主题和打印均在浏览器中完成；页面只下载自己的 Markdown 源文件，不依赖账户服务或路由索引。

## 与父级组装脚本的契约

父级从仓库根执行 workspace 安装、构建和组装，笔记源码目前位于 `notes/content/`。阅读器不复制或修改源码，也不生成每篇笔记的页面。

- `SITE_BASE_PATH` 默认 `/`，仓库站点可传 `/repo/`。Vite 配置规范化尾部 `/`，并通过 `define` 暴露 `import.meta.env.SITE_BASE_PATH`。导航使用该值；资源使用 Vite 的 `import.meta.env.BASE_URL`。
- `notes/reader/dist/` 的内容部署到 `${base}notes-reader/`，其中 JS/CSS、图标和 KaTeX 字体保持构建产物的目录结构。
- 父级将构建后的 `index.html` 复制到每条 `${base}notes/<route>/index.html`。源码 `index.md` 对应 `${base}notes/`，`AI/index.md` 对应 `${base}notes/AI/`，`AI/intro.md` 对应 `${base}notes/AI/intro/`。
- 每页的 `<head>` 注入下面两个 meta。`note-source` 是已进行 URL 路径编码、包含站点 base 的 Markdown URL；`note-path` 是未经 URL 编码的真实源码相对路径。注入 HTML 属性时仍需转义 `&`、`"` 等字符。
- Markdown 原样发布到 `${base}notes/_sources/<relative source path>`；图片、PDF 等其他文件发布到 `${base}notes/<relative original path>`。

例如 `SITE_BASE_PATH=/repo/`、源文件 `AI/入门 笔记.md`：

```html
<meta name="note-source" content="/repo/notes/_sources/AI/%E5%85%A5%E9%97%A8%20%E7%AC%94%E8%AE%B0.md">
<meta name="note-path" content="AI/入门 笔记.md">
```

阅读器直接 `fetch(note-source)` 并读取 `response.text()`，以 `note-path` 为相对链接解析的基准。缺少 meta、HTTP 错误、20 秒下载超时以及 Markdown 渲染失败会显示错误内容、重试按钮和笔记首页链接。

## 构建与验证

在根 workspace 已安装依赖后，从仓库根运行：

```sh
npm run test --workspace notes/reader
SITE_BASE_PATH=/repo/ npm run build --workspace notes/reader
```

不应单独安装本目录依赖或更新本目录 lockfile。构建只生成阅读器；父级负责将 Markdown、图片、算法模板和每篇 HTML 一起组装。直接打开 `dist/index.html` 没有笔记 meta，会显示错误页。预览完整组装产物时使用静态 HTTP 服务。

`src/render-markdown.mjs` 导出 `renderMarkdown(sourcePath, markdownBody, siteBasePath = '/')`，供阅读器和父级静态校验共用；`markdownBody` 应已移除 YAML front matter。渲染顺序包括 `remark-note-links`、`rehype-raw`、`rehype-note-links`，然后渲染公式。两个链接插件均接受 `{ sourcePath, siteBasePath }`，无需请求路由清单。

链接测试使用 Node 内置 `node:test`，不需要额外依赖，覆盖 `/` 与 `/repo/`、相对 Markdown 与 index、图片与附件、引用式链接、查询串/hash、站内根绝对链接、protocol-relative URL 和 raw HTML `href/src/poster`。父级建议再校验全部 Markdown 渲染后的本地目标，并在两种 base 下抽查笔记首页、深层内容、图片、公式、代码复制、折叠目录跳转、打印和错误页。

## 折叠解析

例题的题目、数据范围和输入输出留在正文中；解析、代码和复杂度放在同一个折叠区内：

````md
<details class="note-solution">
<summary>查看解析</summary>

思路：……

```cpp
// 示例代码
```

时间复杂度：$O(n)$。

</details>
````

保留标签与 Markdown 正文之间的空行。折叠区默认关闭，支持鼠标和键盘操作；目录跳转会展开目标所在的折叠区。打印时展开全部解析，打印结束后恢复原来的状态。
