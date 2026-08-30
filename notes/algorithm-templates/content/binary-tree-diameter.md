---
title: "二叉树直径：后序返回高度"
category: "二叉树"
order: 94
problems:
  - "543. 二叉树的直径"
  - "124. 二叉树中的最大路径和"
keywords:
  - "二叉树"
  - "直径"
  - "后序"
  - "高度"
tags:
  - "直径"
  - "后序"
  - "高度"
---

```cpp
int diameterOfBinaryTree(TreeNode* root) {
    int ans = 0;
    function<int(TreeNode*)> height = [&](TreeNode* node) {
        if (!node) return 0;
        int left = height(node->left);
        int right = height(node->right);
        ans = max(ans, left + right);
        return max(left, right) + 1;
    };
    height(root);
    return ans;
}
```
