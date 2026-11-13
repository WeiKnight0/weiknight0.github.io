---
title: 226. 翻转二叉树
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root`，交换每个节点的左右子树，返回翻转后的根节点。

[题目链接](https://leetcode.cn/problems/invert-binary-tree/)

## 示例

### 示例 1

- 输入：`root = [4,2,7,1,3,6,9]`
- 输出：`[4,7,2,9,6,3,1]`

### 示例 2

- 输入：`root = [2,1,3]`
- 输出：`[2,3,1]`

### 示例 3

- 输入：`root = []`
- 输出：`[]`

## 数据范围

- 二叉树节点数为 $[0,100]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：递归

一棵树完成翻转，当且仅当根节点的左右孩子交换，并且原来的左右子树也分别完成翻转。

```cpp
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) {
            return nullptr;
        }
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};
```

交换发生在递归之前，因此后续递归访问的是交换后的左右指针；但两棵子树都会被访问，先交换还是先递归都能得到相同结果。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

## 方法二：层序遍历

队列保存尚未处理的节点。每取出一个节点就交换其左右孩子，再把非空孩子加入队列。

```cpp
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) {
            return nullptr;
        }
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* node = q.front();
            q.pop();
            swap(node->left, node->right);
            if (node->left) {
                q.push(node->left);
            }
            if (node->right) {
                q.push(node->right);
            }
        }
        return root;
    }
};
```

每个节点恰好出队一次并交换一次左右孩子，所以整棵树被完整镜像。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$

## 易错点

- 翻转的是节点连接关系，不是交换左右孩子的值。
- 每个节点都必须交换，不能只交换根节点。
- 方法会原地修改输入树。
- 空树应返回 `nullptr`。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/invert-binary-tree/solutions/)
