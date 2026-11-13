---
title: 105. 从前序与中序遍历序列构造二叉树
date: 2026-09-07
lang: zh-cn
---

给定同一棵二叉树的前序遍历 `preorder` 和中序遍历 `inorder`，构造并返回这棵树。树中没有重复值。

[题目链接](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

## 示例

### 示例 1

- 输入：`preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]`
- 输出：`[3,9,20,null,null,15,7]`

### 示例 2

- 输入：`preorder = [-1], inorder = [-1]`
- 输出：`[-1]`

## 数据范围

- $1 \leq preorder.length=inorder.length \leq 3000$
- $-3000 \leq preorder[i],inorder[i] \leq 3000$
- 两个数组包含相同且互不重复的值
- `inorder` 与 `preorder` 一定来自同一棵二叉树

<details class="note-solution">
<summary>查看解析</summary>

## 两种遍历提供的信息

- 前序遍历顺序是“根、左、右”，所以当前尚未使用的第一个前序元素就是子树根；
- 中序遍历顺序是“左、根、右”，根在中序数组中的位置把左右子树区间分开。

例如：

```text
preorder = [3, 9, 20, 15, 7]
inorder  = [9, 3, 15, 20, 7]
                 ↑
              根节点 3
```

中序中 `3` 左侧的 `[9]` 属于左子树，右侧的 `[15,20,7]` 属于右子树。

## 递归构造

哈希表 `position` 保存每个值在中序数组中的下标，避免每次递归线性寻找根。`preorderIndex` 始终指向下一棵待构造子树的根。

必须先构造左子树再构造右子树，因为前序数组中根之后紧跟的是左子树节点。

```cpp
class Solution {
    unordered_map<int, int> position;
    int preorderIndex = 0;

    TreeNode* build(const vector<int>& preorder, int left, int right) {
        if (left > right) {
            return nullptr;
        }
        int value = preorder[preorderIndex++];
        TreeNode* root = new TreeNode(value);
        int middle = position[value];
        root->left = build(preorder, left, middle - 1);
        root->right = build(preorder, middle + 1, right);
        return root;
    }

public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        position.clear();
        preorderIndex = 0;
        for (int i = 0; i < inorder.size(); i++) {
            position[inorder[i]] = i;
        }
        return build(preorder, 0, inorder.size() - 1);
    }
};
```

## 正确性

每次递归取当前前序首元素作为根，它在中序区间中唯一地分出左右子树节点集合。前序接下来的元素依次属于左子树和右子树，因此按左后右递归能构造出正确连接。区间为空时返回空节点，所有元素最终恰好使用一次。

## 复杂度

- 时间复杂度：$O(n)$，建立下标表和创建节点各遍历一次
- 空间复杂度：$O(n)$，哈希表与最坏情况下的递归栈

## 易错点

- 先序只能确定根，中序负责划分左右子树，两者缺一不可。
- 题目保证节点值唯一，因此可以用值作为中序下标表的键。
- 必须先递归构造左子树，再构造右子树。
- 若成员变量可能被重复调用，需要在入口清空下标表并重置前序游标。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/solutions/)
