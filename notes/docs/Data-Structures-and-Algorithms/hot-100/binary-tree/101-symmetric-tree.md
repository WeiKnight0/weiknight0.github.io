---
title: 101. 对称二叉树
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root`，判断这棵树是否关于根节点所在的竖直轴镜像对称。

[题目链接](https://leetcode.cn/problems/symmetric-tree/)

## 示例

### 示例 1

- 输入：`root = [1,2,2,3,4,4,3]`
- 输出：`true`

### 示例 2

- 输入：`root = [1,2,2,null,3,null,3]`
- 输出：`false`
- 解释：左子树的 `3` 是右孩子，右子树的 `3` 也是右孩子，位置并不镜像。

## 数据范围

- 二叉树节点数为 $[1,1000]$
- $-100 \leq Node.val \leq 100$

## 镜像条件

两棵树 `left` 和 `right` 互为镜像需要同时满足：

1. 两个根节点的值相等；
2. `left` 的左子树与 `right` 的右子树互为镜像；
3. `left` 的右子树与 `right` 的左子树互为镜像。

节点值相同但结构不同，仍然不是镜像。

## 方法一：递归比较

```cpp
class Solution {
    bool mirror(TreeNode* left, TreeNode* right) {
        if (!left || !right) {
            return left == right;
        }
        return left->val == right->val &&
               mirror(left->left, right->right) &&
               mirror(left->right, right->left);
    }

public:
    bool isSymmetric(TreeNode* root) {
        return mirror(root->left, root->right);
    }
};
```

空位置也属于树的结构：两个位置都空时对称，只有一个为空时不对称。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

## 方法二：队列成对比较

队列中的元素始终是一对本应互为镜像的节点。比较后，按外侧一对、内侧一对的方式加入孩子。

```cpp
class Solution {
public:
    bool isSymmetric(TreeNode* root) {
        queue<pair<TreeNode*, TreeNode*>> q;
        q.push({root->left, root->right});
        while (!q.empty()) {
            auto [left, right] = q.front();
            q.pop();
            if (!left || !right) {
                if (left != right) {
                    return false;
                }
                continue;
            }
            if (left->val != right->val) {
                return false;
            }
            q.push({left->left, right->right});
            q.push({left->right, right->left});
        }
        return true;
    }
};
```

每次只把镜像位置配成一对。所有配对的值与空缺状态都一致时，整棵树对称。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$

## 易错点

- 对称比较的是左子树的左侧与右子树的右侧，而不是同方向孩子。
- 必须比较空节点的位置，不能只比较层序遍历中的非空值。
- 本题保证根节点存在，但递归的子树节点可以为空。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/symmetric-tree/solutions/)
