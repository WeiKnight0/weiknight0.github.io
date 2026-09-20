---
title: 114. 二叉树展开为链表
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root`，原地把它展开成单链表。展开后每个节点的 `left` 都为 `nullptr`，`right` 指向下一个节点，节点顺序与原树的前序遍历一致。

[题目链接](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)

## 示例

### 示例 1

- 输入：`root = [1,2,5,3,4,null,6]`
- 输出：`[1,null,2,null,3,null,4,null,5,null,6]`

原树的前序序列是 `[1,2,3,4,5,6]`，展开后这些节点依次由 `right` 连接。

### 示例 2

- 输入：`root = []`
- 输出：`[]`

### 示例 3

- 输入：`root = [0]`
- 输出：`[0]`

## 数据范围

- 二叉树节点数为 $[0,2000]$
- $-100 \leq Node.val \leq 100$

## 方法一：保存前序遍历结果

先把节点指针按前序遍历放入数组，再依次改写相邻节点的左右指针。数组保存的是原节点地址，没有创建新节点。

```cpp
class Solution {
    void preorder(TreeNode* root, vector<TreeNode*>& nodes) {
        if (!root) {
            return;
        }
        nodes.push_back(root);
        preorder(root->left, nodes);
        preorder(root->right, nodes);
    }

public:
    void flatten(TreeNode* root) {
        vector<TreeNode*> nodes;
        preorder(root, nodes);
        for (int i = 1; i < nodes.size(); i++) {
            nodes[i - 1]->left = nullptr;
            nodes[i - 1]->right = nodes[i];
        }
        if (!nodes.empty()) {
            nodes.back()->left = nullptr;
            nodes.back()->right = nullptr;
        }
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

## 方法二：逆前序递归

正常前序顺序为“根、左、右”。若按照“右、左、根”的逆序处理，就可以维护已经展开部分的头节点 `next`，把当前节点直接接到它前面：

1. 先展开右子树；
2. 再展开左子树；
3. 令当前节点的 `right = next`、`left = nullptr`；
4. 当前节点成为新的 `next`。

```cpp
class Solution {
    TreeNode* next = nullptr;

    void build(TreeNode* root) {
        if (!root) {
            return;
        }
        build(root->right);
        build(root->left);
        root->right = next;
        root->left = nullptr;
        next = root;
    }

public:
    void flatten(TreeNode* root) {
        next = nullptr;
        build(root);
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$，来自递归调用栈

## 方法三：寻找左子树的前序末尾

若当前节点有左子树，前序遍历会先完整访问左子树，再访问原右子树。左子树中前序最后访问的节点，就是沿右指针能到达的最右节点 `predecessor`。

把原右子树接到 `predecessor->right`，再把整棵左子树移到当前节点的右侧，最后继续处理新的 `root->right`。

```cpp
class Solution {
public:
    void flatten(TreeNode* root) {
        while (root) {
            if (root->left) {
                TreeNode* predecessor = root->left;
                while (predecessor->right) {
                    predecessor = predecessor->right;
                }
                predecessor->right = root->right;
                root->right = root->left;
                root->left = nullptr;
            }
            root = root->right;
        }
    }
};
```

每次移动后，当前节点及其右侧开头已经符合前序顺序。继续沿右指针处理，最终所有左指针为空且右链顺序等于原树前序遍历。

- 时间复杂度：$O(n)$。寻找前驱经过的右链不会被其他节点重复作为左子树右链扫描
- 空间复杂度：$O(1)$

## 易错点

- 展开顺序是前序遍历，不是中序遍历。
- 改写 `root->right` 前必须保留或重新连接原右子树。
- 逆前序递归必须先右后左，否则会覆盖尚未处理的右子树。
- 展开后所有 `left` 都必须为 `nullptr`。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/solutions/)
