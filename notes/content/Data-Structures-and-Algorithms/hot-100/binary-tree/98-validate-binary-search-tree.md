---
title: 98. 验证二叉搜索树
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root`，判断它是否为有效二叉搜索树（BST）。对每个节点：左子树所有节点值必须严格小于当前值，右子树所有节点值必须严格大于当前值，左右子树也必须分别是 BST。

[题目链接](https://leetcode.cn/problems/validate-binary-search-tree/)

## 示例

### 示例 1

- 输入：`root = [2,1,3]`
- 输出：`true`

### 示例 2

- 输入：`root = [5,1,4,null,null,3,6]`
- 输出：`false`
- 解释：节点 `3` 位于根节点 `5` 的右子树中，却小于 `5`。

## 数据范围

- 二叉树节点数为 $[1,10^4]$
- $-2^{31} \leq Node.val \leq 2^{31}-1$

<details class="note-solution">
<summary>查看解析</summary>

## 为什么只比较直接孩子不够

在示例 2 中，节点 `4` 小于根节点 `5`，仅看直接孩子似乎满足要求；但 `4` 的左孩子 `3` 也属于根的右子树，必须大于 `5`。每个节点受到整条祖先路径共同给出的取值范围约束。

## 方法一：递归传递合法区间

根节点初始位于开区间 $(-\infty,+\infty)$：

- 进入左子树时，把上界收紧为当前节点值；
- 进入右子树时，把下界收紧为当前节点值。

使用 `long long` 表示边界，避免节点值恰好为 `INT_MIN` 或 `INT_MAX` 时无法再构造严格开区间。

```cpp
class Solution {
    bool valid(TreeNode* root, long long lower, long long upper) {
        if (!root) {
            return true;
        }
        if (root->val <= lower || root->val >= upper) {
            return false;
        }
        return valid(root->left, lower, root->val) &&
               valid(root->right, root->val, upper);
    }

public:
    bool isValidBST(TreeNode* root) {
        return valid(root, LLONG_MIN, LLONG_MAX);
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

## 方法二：检查中序遍历严格递增

BST 的中序遍历结果必须严格递增。遍历过程中只需保存上一个访问值；若当前值不大于它，立即返回 `false`。

```cpp
class Solution {
    bool inorder(TreeNode* root, long long& previous) {
        if (!root) {
            return true;
        }
        if (!inorder(root->left, previous)) {
            return false;
        }
        if (root->val <= previous) {
            return false;
        }
        previous = root->val;
        return inorder(root->right, previous);
    }

public:
    bool isValidBST(TreeNode* root) {
        long long previous = LLONG_MIN;
        return inorder(root, previous);
    }
};
```

“严格递增”同时排除了重复值。题目中的 BST 不允许等于根值的节点放在任一侧。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

## 正确性

区间法在每个节点检查所有祖先约束，并分别为左右子树增加当前节点约束，因此所有节点满足 BST 定义。

中序法利用 BST 的左、根、右关系得到严格递增序列；反过来，若整棵树的中序序列严格递增，则任意节点左子树值均在它之前且更小，右子树值均在它之后且更大，树满足 BST 性质。

## 易错点

- 左右子树中的所有节点都受根值约束，不只是直接孩子。
- 比较必须严格，重复值会使 BST 无效。
- 初始边界不能直接使用 `INT_MIN` 和 `INT_MAX`，因为节点值允许等于它们。
- 中序遍历的 `previous` 必须在整次递归中共享，不能按值复制。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/validate-binary-search-tree/solutions/)
