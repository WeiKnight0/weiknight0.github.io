---
title: "树形 DP：选或不选"
category: "动态规划"
order: 92
problems:
  - "337. 打家劫舍 III"
  - "968. 监控二叉树"
keywords:
  - "树形DP"
  - "二叉树"
  - "选或不选"
  - "灵神风格"
tags:
  - "灵神风格"
  - "后序"
  - "打家劫舍 III"
---

```cpp
// 返回 {不选当前节点的最大值, 选当前节点的最大值}
pair<int, int> dfs(TreeNode* node) {
    if (node == nullptr) {
        return {0, 0};
    }
    auto [l_not, l_rob] = dfs(node->left);
    auto [r_not, r_rob] = dfs(node->right);
    int rob = node->val + l_not + r_not;
    int not_rob = max(l_not, l_rob) + max(r_not, r_rob);
    return {not_rob, rob};
}

int rob(TreeNode* root) {
    auto [not_rob, rob] = dfs(root);
    return max(not_rob, rob);
}
```
