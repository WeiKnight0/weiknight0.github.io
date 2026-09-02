---
title: Binary Search Tree 二叉搜索树
date: 2026-09-01
description: 利用 BST 的有序性完成验证、查询和构造。
lang: zh-cn
tags:
  - DSA
  - Tree
  - BST
  - Hot 100
---

二叉搜索树（BST）满足：任一节点左子树全部值小于该节点，右子树全部值大于该节点。中序遍历 BST 会得到严格递增序列。

# 核心模板

## 区间验证

每个节点不仅要与父节点比较，还必须落在所有祖先给定的开区间内。

```cpp
bool valid(TreeNode* root, long long low, long long high) {
    if (!root) return true;
    if (root->val <= low || root->val >= high) return false;
    return valid(root->left, low, root->val) &&
           valid(root->right, root->val, high);
}
```

## 有序数组构造平衡 BST

取中点为根，左右区间递归构造。每层区间近似对半，树高为 $O(\log n)$。

# 例题

## 98. 验证二叉搜索树

题目来源：[98. 验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/)

题目描述：给定二叉树根节点 `root`，判断它是否为有效 BST。

**示例 1：**

- 输入：`root = [2,1,3]`

- 输出：`true`

**示例 2：**

- 输入：`root = [5,1,4,null,null,3,6]`

- 输出：`false`

- 解释：节点 `3` 位于根 `5` 的右子树中，却小于 `5`。

思路：只比较当前节点和直接孩子会漏掉示例 2。DFS 传入当前节点允许的开区间，根的初始区间为无穷小到无穷大。

```cpp
class Solution {
    bool check(TreeNode* root, long long low, long long high) {
        if (!root) return true;
        if (root->val <= low || root->val >= high) return false;
        return check(root->left, low, root->val) &&
               check(root->right, root->val, high);
    }

public:
    bool isValidBST(TreeNode* root) {
        return check(root, LLONG_MIN, LLONG_MAX);
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

## 230. 二叉搜索树中第 K 小的元素

题目来源：[230. 二叉搜索树中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

题目描述：给定 BST 根节点 `root` 和整数 `k`，返回其中第 `k` 小的节点值。

**示例 1：**

- 输入：`root = [3,1,4,null,2]`，`k = 1`

- 输出：`1`

思路：BST 的中序序列递增。使用迭代中序遍历，每弹出一个节点就让 `k` 减一，减到零时即为答案。

```cpp
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        while (true) {
            while (root) {
                st.push(root);
                root = root->left;
            }
            root = st.top();
            st.pop();
            if (--k == 0) return root->val;
            root = root->right;
        }
    }
};
```

时间复杂度 $O(h+k)$，空间复杂度 $O(h)$。

## 108. 将有序数组转换为二叉搜索树

题目来源：[108. 将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

题目描述：给定升序整数数组 `nums`，构造一棵高度平衡的 BST 并返回根节点。

**示例 1：**

- 输入：`nums = [-10,-3,0,5,9]`

- 输出：`[0,-3,9,-10,null,5]`

- 解释：答案不唯一，只要是高度平衡 BST 即可。

思路：有序数组中点左侧都小于中点、右侧都大于中点；将中点作为根后，左右区间递归构建。每次取中点自然避免单侧过深。

```cpp
class Solution {
    TreeNode* build(const vector<int>& nums, int left, int right) {
        if (left > right) return nullptr;
        int mid = left + (right - left) / 2;
        TreeNode* root = new TreeNode(nums[mid]);
        root->left = build(nums, left, mid - 1);
        root->right = build(nums, mid + 1, right);
        return root;
    }

public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return build(nums, 0, nums.size() - 1);
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(\log n)$。

# 扩展练习

- [235. 二叉搜索树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/)
- [450. 删除二叉搜索树中的节点](https://leetcode.cn/problems/delete-node-in-a-bst/)
- [538. 把二叉搜索树转换为累加树](https://leetcode.cn/problems/convert-bst-to-greater-tree/)
