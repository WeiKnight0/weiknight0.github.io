---
title: "二叉树 BFS：层序遍历"
category: "二叉树"
order: 22
problems:
  - "102. 二叉树的层序遍历"
keywords:
  - "二叉树"
  - "BFS"
  - "层序遍历"
  - "Hot100"
tags:
  - "Hot100 102"
  - "BFS"
  - "层序遍历"
---

```cpp
vector<vector<int>> levelOrder(TreeNode* root) {
    if (root == nullptr) return {};

    vector<vector<int>> ans;
    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        int size = q.size();
        vector<int> level;
        for (int i = 0; i < size; i++) {
            TreeNode* node = q.front();
            q.pop();
            level.push_back(node->val);

            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        ans.push_back(level);
    }

    return ans;
}
```
