---
title: 104. 二叉树的最大深度
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root`，返回树的最大深度。最大深度是从根节点到最远叶子节点的最长路径所包含的节点数。

[题目链接](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

## 示例

### 示例 1

- 输入：`root = [3,9,20,null,null,15,7]`
- 输出：`3`

### 示例 2

- 输入：`root = [1,null,2]`
- 输出：`2`

## 数据范围

- 二叉树节点数为 $[0,10^4]$
- $-100 \leq Node.val \leq 100$

## 方法一：自底向上递归

空树深度为 `0`。非空树的最远叶子必在左子树或右子树中，因此：

$$
depth(root)=\max(depth(root\!\rightarrow\!left),depth(root\!\rightarrow\!right))+1
$$

```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) {
            return 0;
        }
        return max(maxDepth(root->left), maxDepth(root->right)) + 1;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

## 方法二：层序遍历

队列保存当前尚未访问的节点。每轮先记录队列大小，只处理这一层的全部节点；处理完一层后深度加一。

```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) {
            return 0;
        }
        queue<TreeNode*> q;
        q.push(root);
        int depth = 0;
        while (!q.empty()) {
            int size = q.size();
            while (size--) {
                TreeNode* node = q.front();
                q.pop();
                if (node->left) {
                    q.push(node->left);
                }
                if (node->right) {
                    q.push(node->right);
                }
            }
            depth++;
        }
        return depth;
    }
};
```

每轮开始时队列恰好包含当前层的全部节点。处理它们时加入的子节点属于下一层，不会被本轮计数包含，所以循环次数就是树的层数。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$，其中 $w$ 是树的最大宽度

## 易错点

- 深度按节点数计算，只有根节点的树深度为 `1`。
- 空树深度为 `0`。
- 层序遍历必须在处理本层前保存队列大小，不能直接处理到队列为空。
- 递归空间取决于树高；链状树最坏为 $O(n)$。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/maximum-depth-of-binary-tree/solutions/)
