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

Run `npm run build` to validate the content and generate `dist/`. The build fails on malformed metadata, duplicate order values, invalid slugs, or missing code.
