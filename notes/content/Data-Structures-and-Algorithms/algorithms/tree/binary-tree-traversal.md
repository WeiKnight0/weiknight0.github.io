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

本文中二叉树节点使用如下结构：

```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int val_=0, TreeNode* left_=nullptr, TreeNode* right_=nullptr)
        :val(val_), left(left_), right(right){}
};
```

# 遍历模板

## 递归遍历

前序在递归左右子树前处理当前节点；中序在两者之间处理；后序在两者之后处理。

```cpp
void preorder(TreeNode* root, vector<int>& ans) {
    if (!root) return;
    ans.push_back(root->val);
    preorder(root->left, ans);
    preorder(root->right, ans);
}

void inorder(TreeNode* root, vector<int>& ans) {
    if (!root) return;
    inorder(root->left, ans);
    ans.push_back(root->val);
    inorder(root->right, ans);
}

void postorder(TreeNode* root, vector<int>& ans) {
    if (!root) return;
    postorder(root->left, ans);
    postorder(root->right, ans);
    ans.push_back(root->val);
}
```

## 颜色遍历法

栈中保存 `pair<TreeNode*, bool>`。`false` 表示节点尚未展开，`true` 表示可以处理该节点。由于栈后进先出，节点必须按遍历顺序的逆序入栈。

前序遍历的顺序是根、左、右，因此依次将右、左、根压栈。

```cpp
vector<int> preorder(TreeNode* root) {
    vector<int> ans;
    stack<pair<TreeNode*, bool>> st;
    st.push({root, false});
    while (!st.empty()) {
        auto [node, visited] = st.top();
        st.pop();
        if (!node) continue;
        if (visited) {
            ans.push_back(node->val);
            continue;
        }
        st.push({node->right, false});
        st.push({node->left, false});
        st.push({node, true});
    }
    return ans;
}
```

中序遍历的顺序是左、根、右，因此依次将右、根、左压栈。

```cpp
vector<int> inorder(TreeNode* root) {
    vector<int> ans;
    stack<pair<TreeNode*, bool>> st;
    st.push({root, false});
    while (!st.empty()) {
        auto [node, visited] = st.top();
        st.pop();
        if (!node) continue;
        if (visited) {
            ans.push_back(node->val);
            continue;
        }
        st.push({node->right, false});
        st.push({node, true});
        st.push({node->left, false});
    }
    return ans;
}
```

后序遍历的顺序是左、右、根，因此依次将根、右、左压栈。

```cpp
vector<int> postorder(TreeNode* root) {
    vector<int> ans;
    stack<pair<TreeNode*, bool>> st;
    st.push({root, false});
    while (!st.empty()) {
        auto [node, visited] = st.top();
        st.pop();
        if (!node) continue;
        if (visited) {
            ans.push_back(node->val);
            continue;
        }
        st.push({node, true});
        st.push({node->right, false});
        st.push({node->left, false});
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

## 104. 二叉树的最大深度

题目来源：[104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

题目描述：给定二叉树根节点 `root`，返回树的最大深度；根到最远叶子节点路径上的节点数就是深度。

**示例 1：**

- 输入：`root = [3,9,20,null,null,15,7]`

- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

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

</details>

## 105. 从前序与中序遍历序列构造二叉树

题目来源：[105. 从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

题目描述：给定没有重复值的前序数组 `preorder` 和中序数组 `inorder`，构造并返回原二叉树。

**示例 1：**

- 输入：`preorder = [3,9,20,15,7]`，`inorder = [9,3,15,20,7]`

- 输出：`[3,9,20,null,null,15,7]`

<details class="note-solution">
<summary>查看解析</summary>

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

</details>

## 199. 二叉树的右视图

题目来源：[199. 二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/)

题目描述：给定二叉树的根节点 `root`，想象自己站在二叉树右侧，按照从上到下的顺序返回能够看到的节点值。

**示例 1：**

- 输入：`root = [1,2,3,null,5,null,4]`

- 输出：`[1,3,4]`

<details class="note-solution">
<summary>查看解析</summary>

思路：队列同时保存节点和层号。按照左子节点、右子节点的顺序入队，每访问到同一层的新节点就覆盖这一层原有的答案，因此遍历结束后保留的是每层最右侧的节点。

```cpp
class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        queue<pair<TreeNode*, int>> q;
        q.push({root, 0});
        vector<int> ans;
        while (!q.empty()) {
            auto [node, depth] = q.front();
            q.pop();
            if (!node) continue;
            if (depth == ans.size()) {
                ans.push_back(node->val);
            } else {
                ans[depth] = node->val;
            }
            q.push({node->left, depth + 1});
            q.push({node->right, depth + 1});
        }
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

# 扩展练习

- [144. 二叉树的前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/)
- [145. 二叉树的后序遍历](https://leetcode.cn/problems/binary-tree-postorder-traversal/)
- [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)
