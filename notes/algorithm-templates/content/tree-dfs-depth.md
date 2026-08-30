---
title: "二叉树 DFS：最大深度"
category: "二叉树"
order: 21
problems:
  - "104. 二叉树的最大深度"
keywords:
  - "二叉树"
  - "DFS"
  - "递归"
  - "Hot100"
tags:
  - "Hot100 104"
  - "DFS"
  - "递归"
---

```cpp
int maxDepth(TreeNode* root) {
    if (root == nullptr) return 0;
    return max(maxDepth(root->left), maxDepth(root->right)) + 1;
}
```
