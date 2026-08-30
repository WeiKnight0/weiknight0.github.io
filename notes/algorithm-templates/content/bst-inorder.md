---
title: "BST 中序：有序遍历"
category: "二叉树"
order: 97
problems:
  - "230. 二叉搜索树中第 K 小的元素"
  - "98. 验证二叉搜索树"
keywords:
  - "BST"
  - "中序遍历"
  - "第K小"
  - "二叉搜索树"
tags:
  - "BST"
  - "中序"
  - "第K小"
---

```cpp
int kthSmallest(TreeNode* root, int k) {
    stack<TreeNode*> st;
    TreeNode* cur = root;
    while (cur || !st.empty()) {
        while (cur) {
            st.push(cur);
            cur = cur->left;
        }
        cur = st.top();
        st.pop();
        if (--k == 0) return cur->val;
        cur = cur->right;
    }
    return -1;
}
```
