---
title: 108. 将有序数组转换为二叉搜索树
date: 2026-09-07
lang: zh-cn
---

给定严格递增整数数组 `nums`，构造一棵高度平衡的二叉搜索树。高度平衡是指每个节点左右子树的高度差不超过 `1`。答案不唯一，返回任意合法根节点。

[题目链接](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

## 示例

### 示例 1

- 输入：`nums = [-10,-3,0,5,9]`
- 一种输出：`[0,-3,9,-10,null,5]`
- 解释：以 `0` 为根，左右两侧数组分别构成左右子树，结果是高度平衡 BST。

### 示例 2

- 输入：`nums = [1,3]`
- 一种输出：`[1,null,3]`
- 解释：`[3,1]` 也是合法答案。

## 数据范围

- $1 \leq nums.length \leq 10^4$
- $-10^4 \leq nums[i] \leq 10^4$
- `nums` 严格递增

<details class="note-solution">
<summary>查看解析</summary>

## 取中点作为根

二叉搜索树要求左子树所有值小于根，右子树所有值大于根。有序数组的中点天然把数组分成这两部分。

每次选择中点还能让左右区间长度最多相差 `1`。对子区间递归执行相同操作，得到的每棵子树都高度平衡。

```cpp
class Solution {
    TreeNode* build(const vector<int>& nums, int left, int right) {
        if (left > right) {
            return nullptr;
        }
        int middle = left + (right - left) / 2;
        TreeNode* root = new TreeNode(nums[middle]);
        root->left = build(nums, left, middle - 1);
        root->right = build(nums, middle + 1, right);
        return root;
    }

public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return build(nums, 0, nums.size() - 1);
    }
};
```

## 正确性

对任意递归区间 `[left, right]`，中点左侧元素均小于根值，中点右侧元素均大于根值；递归构造后满足 BST 性质。左右区间长度最多相差 `1`，且它们自身也递归保持平衡，所以当前节点左右子树高度差不超过 `1`。

## 复杂度

- 时间复杂度：$O(n)$，每个数组元素创建一个节点
- 空间复杂度：$O(\log n)$，平衡递归树的调用栈深度

## 易错点

- 递归区间为空的条件是 `left > right`。
- 左右子树区间不能再次包含中点。
- 题目答案不唯一；偶数长度区间选左中点或右中点都可以。
- 构造过程中不需要在每层复制子数组，传递下标即可。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/solutions/)
