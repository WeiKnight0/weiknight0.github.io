---
title: "二叉树三序遍历：前中后序"
category: "二叉树"
order: 23
problems:
  - "基础模板"
keywords:
  - "二叉树"
  - "前序遍历"
  - "中序遍历"
  - "后序遍历"
  - "DFS"
tags:
  - "基础模板"
  - "前序"
  - "中序"
  - "后序"
---

```cpp
void preorder(TreeNode* root, vector<int>& ans) {
    if (root == nullptr) return;
    ans.push_back(root->val);
    preorder(root->left, ans);
    preorder(root->right, ans);
}

void inorder(TreeNode* root, vector<int>& ans) {
    if (root == nullptr) return;
    inorder(root->left, ans);
    ans.push_back(root->val);
    inorder(root->right, ans);
}

void postorder(TreeNode* root, vector<int>& ans) {
    if (root == nullptr) return;
    postorder(root->left, ans);
    postorder(root->right, ans);
    ans.push_back(root->val);
}
```
