# Algorithm templates

Each file in `content/` is one template. Its filename becomes the stable URL slug.

Required front matter fields are `title`, `category`, `order`, `problems`, `keywords`, and `tags`. The first fenced code block is the copyable template. Optional Markdown after that block is rendered as usage documentation.

## Add a template

Create `content/my-template.md`:

````markdown
---
title: "模板标题"
category: "图论"
order: 98
problems:
  - "题目名称"
keywords:
  - "检索关键词"
tags:
  - "页面标签"
---

```cpp
void solve() {
}
```

Optional usage notes can be written here.
````

From the repository root, run `npm run build --workspace notes/algorithm-templates` after the root workspace install to validate the content and generate `dist/`. The build fails on malformed metadata, duplicate order values, invalid slugs, or missing code. Both LF and CRLF content files are supported.

The parent assembler copies `dist/` to `${SITE_BASE_PATH}notes/algorithm-templates/`. `SITE_BASE_PATH` defaults to `/`; pass `/repo/` for a GitHub Pages repository site. The build substitutes `{{SITE_BASE_PATH}}` in both layouts for the favicon and navigation to the main notes site. Links and assets within the algorithm templates remain relative, including downloadable pages. No separate install or lockfile update is needed in this directory.
