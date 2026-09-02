---
title: Binary Tree Traversal 二叉树遍历与构造
date: 2026-09-01
description: 掌握二叉树的递归、迭代、层序遍历与由遍历序列构造二叉树。
lang: zh-cn
tags:
  - DSA
  - Tree
  - Hot 100
---

LeetCode 中二叉树节点通常为：

```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
};
```

# 遍历模板

## 递归 DFS

前序在递归左右子树前处理当前节点；中序在两者之间处理；后序在两者之后处理。

```cpp
void preorder(TreeNode* root, vector<int>& ans) {
    if (!root) return;
    ans.push_back(root->val);
    preorder(root->left, ans);
    preorder(root->right, ans);
}
```

## 迭代中序遍历

栈保存尚未访问自身和右子树的祖先。不断向左压栈，无法再向左时弹出并转向其右子树。

```cpp
vector<int> inorder(TreeNode* root) {
    vector<int> ans;
    stack<TreeNode*> st;
    while (root || !st.empty()) {
        while (root) {
            st.push(root);
            root = root->left;
        }
        root = st.top();
        st.pop();
        ans.push_back(root->val);
        root = root->right;
    }
    return ans;
}
```

## 层序遍历

队列中始终保存下一层之前的全部节点。每轮先记录队列大小，就能限定本层范围。

```cpp
vector<vector<int>> levelOrder(TreeNode* root) {
    if (!root) return {};
    vector<vector<int>> ans;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int size = q.size();
        ans.emplace_back();
        while (size--) {
            TreeNode* node = q.front();
            q.pop();
            ans.back().push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
    }
    return ans;
}
```

# 例题

## 94. 二叉树的中序遍历

题目来源：[94. 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/)

题目描述：给定二叉树根节点 `root`，返回其中序遍历结果。

**示例 1：**

- 输入：`root = [1,null,2,3]`

- 输出：`[1,3,2]`

思路：中序顺序为左、根、右。使用“迭代中序遍历”模板，栈顶节点的左链处理完毕后才访问它。

```cpp
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> ans;
        stack<TreeNode*> st;
        while (root || !st.empty()) {
            while (root) {
                st.push(root);
                root = root->left;
            }
            root = st.top();
            st.pop();
            ans.push_back(root->val);
            root = root->right;
        }
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$，$h$ 为树高。

## 102. 二叉树的层序遍历

题目来源：[102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

题目描述：按从左到右、从上到下的顺序返回二叉树每一层的节点值。

**示例 1：**

- 输入：`root = [3,9,20,null,null,15,7]`

- 输出：`[[3],[9,20],[15,7]]`

思路：队列天然按进入顺序处理节点。每轮固定取出当前队列长度个节点，正好得到一层。

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        if (!root) return {};
        vector<vector<int>> ans;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int size = q.size();
            ans.emplace_back();
            while (size--) {
                TreeNode* node = q.front();
                q.pop();
                ans.back().push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
        }
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

## 104. 二叉树的最大深度

题目来源：[104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

题目描述：给定二叉树根节点 `root`，返回树的最大深度；根到最远叶子节点路径上的节点数就是深度。

**示例 1：**

- 输入：`root = [3,9,20,null,null,15,7]`

- 输出：`3`

思路：空树深度为 `0`；非空树深度是左右子树深度的较大值加一。这是典型的自底向上 DFS：子问题先返回信息，父节点再组合。

```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return max(maxDepth(root->left), maxDepth(root->right)) + 1;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

## 105. 从前序与中序遍历序列构造二叉树

题目来源：[105. 从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

题目描述：给定没有重复值的前序数组 `preorder` 和中序数组 `inorder`，构造并返回原二叉树。

**示例 1：**

- 输入：`preorder = [3,9,20,15,7]`，`inorder = [9,3,15,20,7]`

- 输出：`[3,9,20,null,null,15,7]`

思路：前序的第一个元素必是当前子树根；它在中序数组的位置将左右子树分开。哈希表记录中序下标，递归时用区间确定子树范围。

```cpp
class Solution {
    unordered_map<int, int> pos;
    int preIndex = 0;

    TreeNode* build(const vector<int>& preorder, int left, int right) {
        if (left > right) return nullptr;
        int value = preorder[preIndex++];
        TreeNode* root = new TreeNode(value);
        int mid = pos[value];
        root->left = build(preorder, left, mid - 1);
        root->right = build(preorder, mid + 1, right);
        return root;
    }

public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        for (int i = 0; i < inorder.size(); i++) pos[inorder[i]] = i;
        return build(preorder, 0, inorder.size() - 1);
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

# 扩展练习

- [144. 二叉树的前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/)
- [145. 二叉树的后序遍历](https://leetcode.cn/problems/binary-tree-postorder-traversal/)
- [199. 二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/)
- [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)
