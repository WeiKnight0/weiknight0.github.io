---
title: 543. 二叉树的直径
date: 2026-09-07
lang: zh-cn
---

二叉树的直径是任意两个节点之间最长路径的长度，长度按经过的边数计算。路径不一定经过根节点。给定根节点 `root`，返回树的直径。

[题目链接](https://leetcode.cn/problems/diameter-of-binary-tree/)

## 示例

### 示例 1

- 输入：`root = [1,2,3,4,5]`
- 输出：`3`
- 解释：最长路径可以是 `4 → 2 → 1 → 3` 或 `5 → 2 → 1 → 3`，都经过三条边。

### 示例 2

- 输入：`root = [1,2]`
- 输出：`1`

## 数据范围

- 二叉树节点数为 $[1,10^4]$
- $-100 \leq Node.val \leq 100$

## 子树高度与直径

令 `height(root)` 返回从当前节点向下到最远叶子的路径所包含的节点数，空树高度为 `0`。

若左、右子树高度分别为 `left`、`right`，经过当前节点并连接左右子树的路径包含的边数正好为：

$$
left+right
$$

而当前节点向上能提供给父节点的高度只能选择较深的一侧：

$$
height(root)=\max(left,right)+1
$$

```cpp
class Solution {
    int diameter = 0;

    int height(TreeNode* root) {
        if (!root) {
            return 0;
        }
        int left = height(root->left);
        int right = height(root->right);
        diameter = max(diameter, left + right);
        return max(left, right) + 1;
    }

public:
    int diameterOfBinaryTree(TreeNode* root) {
        diameter = 0;
        height(root);
        return diameter;
    }
};
```

## 正确性

任意一条路径都有唯一的最高节点。以该节点为最高点的最长路径，由其左子树中最长的向下路径与右子树中最长的向下路径组成。DFS 在每个节点都计算一次 `left + right`，因此一定检查了全局最长路径的最高节点。取所有候选的最大值就是直径。

## 复杂度

- 时间复杂度：$O(n)$，每个节点访问一次
- 空间复杂度：$O(h)$，来自递归调用栈

## 易错点

- 直径按边数计算，不是节点数；左右子树高度之和已经是边数。
- 最长路径不一定经过整棵树的根节点，必须在每个节点更新答案。
- 返回给父节点的路径不能同时选择左右两侧，否则路径会分叉。
- 若同一个 `Solution` 对象可能重复调用，应在入口把成员答案重置为 `0`。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/diameter-of-binary-tree/solutions/)
