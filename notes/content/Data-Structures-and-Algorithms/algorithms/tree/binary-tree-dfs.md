---
title: Binary Tree DFS 二叉树 DFS
date: 2026-09-01
description: 用自顶向下与自底向上 DFS 处理路径、直径和最大路径和。
lang: zh-cn
tags:
  - DSA
  - Tree
  - DFS
  - Hot 100
---

# 两类 DFS

## 自顶向下

递归参数保存从根到当前节点的状态，例如路径和、最大值或当前层数。进入子树前更新状态，到叶子节点时结算答案。

## 自底向上

递归函数返回当前子树需要交给父节点的信息，例如高度、路径贡献或是否包含目标节点。左右子树返回后，再在当前节点合并。

# 例题

## 543. 二叉树的直径

题目来源：[543. 二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/)

题目描述：二叉树中任意两个节点之间的路径长度是经过边的数量。返回树的最长路径长度；这条路径不一定经过根节点。

**示例 1：**

- 输入：`root = [1,2,3,4,5]`

- 输出：`3`

- 解释：最长路径可以是 `4 → 2 → 1 → 3`。

<details class="note-solution">
<summary>查看解析</summary>

思路：对任意节点，穿过它的最长路径长度是左子树高度加右子树高度。DFS 返回“从当前节点向下的最大高度”，同时用全局答案记录每个节点处的路径长度。

```cpp
class Solution {
    int ans = 0;

    int height(TreeNode* root) {
        if (!root) return 0;
        int left = height(root->left);
        int right = height(root->right);
        ans = max(ans, left + right);
        return max(left, right) + 1;
    }

public:
    int diameterOfBinaryTree(TreeNode* root) {
        height(root);
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

## 437. 路径总和 III

题目来源：[437. 路径总和 III](https://leetcode.cn/problems/path-sum-iii/)

题目描述：给定二叉树根节点 `root` 和整数 `targetSum`，统计路径和恰好为 `targetSum` 的路径数。路径必须从父节点到子节点连续向下，但不必从根开始或在叶子结束。

**示例 1：**

- 输入：`root = [10,5,-3,3,2,null,11,3,-2,null,1]`，`targetSum = 8`

- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

思路：当前根到节点的前缀和为 `sum`。若以前出现过前缀和 `sum - targetSum`，二者之间的向下路径和就是目标值。DFS 入栈时加入当前前缀和，离开节点时撤销，保证哈希表只描述当前根到节点路径。

```cpp
class Solution {
    unordered_map<long long, int> count{{0, 1}};
    int target;

    int dfs(TreeNode* root, long long sum) {
        if (!root) return 0;
        sum += root->val;
        int ans = count[sum - target];
        count[sum]++;
        ans += dfs(root->left, sum) + dfs(root->right, sum);
        count[sum]--;
        return ans;
    }

public:
    int pathSum(TreeNode* root, int targetSum) {
        target = targetSum;
        return dfs(root, 0);
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

## 124. 二叉树中的最大路径和

题目来源：[124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

题目描述：路径至少包含一个节点，节点不能重复，路径不要求经过根节点。返回所有路径中的最大节点值之和。

**示例 1：**

- 输入：`root = [-10,9,20,null,null,15,7]`

- 输出：`42`

- 解释：路径 `15 → 20 → 7` 的和为 `42`。

<details class="note-solution">
<summary>查看解析</summary>

思路：对子节点的负贡献直接舍弃。当前节点可作为一条完整路径的最高点，值为 `root->val + left + right`；返回给父节点时只能选择一侧，因为路径不能分叉后再向上。

```cpp
class Solution {
    int ans = INT_MIN;

    int gain(TreeNode* root) {
        if (!root) return 0;
        int left = max(gain(root->left), 0);
        int right = max(gain(root->right), 0);
        ans = max(ans, root->val + left + right);
        return root->val + max(left, right);
    }

public:
    int maxPathSum(TreeNode* root) {
        gain(root);
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

# 扩展练习

- [101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/)
- [113. 路径总和 II](https://leetcode.cn/problems/path-sum-ii/)
- [114. 二叉树展开为链表](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)
- [337. 打家劫舍 III](https://leetcode.cn/problems/house-robber-iii/)，详见[树形 DP](../dynamic-programming/tree.md)
