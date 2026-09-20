---
title: 102. 二叉树的层序遍历
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root`，按照从上到下、每层从左到右的顺序返回节点值。答案中每一项对应一层。

[题目链接](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

## 示例

### 示例 1

- 输入：`root = [3,9,20,null,null,15,7]`
- 输出：`[[3],[9,20],[15,7]]`

### 示例 2

- 输入：`root = [1]`
- 输出：`[[1]]`

### 示例 3

- 输入：`root = []`
- 输出：`[]`

## 数据范围

- 二叉树节点数为 $[0,2000]$
- $-1000 \leq Node.val \leq 1000$

## 方法一：按层控制队列长度

队列中保存尚未访问的节点。每轮开始时，队列恰好包含当前层全部节点，先记录此时的 `size`，本轮只弹出这些节点；新加入的孩子留到下一轮。

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        if (!root) {
            return {};
        }
        vector<vector<int>> ans;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int size = q.size();
            ans.emplace_back();
            while (size--) {
                TreeNode* node = q.front();
                q.pop();
                ans.back().push_back(node->val);
                if (node->left) {
                    q.push(node->left);
                }
                if (node->right) {
                    q.push(node->right);
                }
            }
        }
        return ans;
    }
};
```

本轮处理的节点全部来自同一层，并按左孩子、右孩子的顺序加入下一层，因此每层输出顺序正确。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$，其中 $w$ 是树的最大宽度

## 方法二：队列同时保存层号

队列保存 `{节点, 深度}`。第一次访问某一深度时创建答案行，随后把节点值加入对应行。

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        queue<pair<TreeNode*, int>> q;
        q.push({root, 0});
        while (!q.empty()) {
            auto [node, depth] = q.front();
            q.pop();
            if (!node) {
                continue;
            }
            if (depth == ans.size()) {
                ans.emplace_back();
            }
            ans[depth].push_back(node->val);
            q.push({node->left, depth + 1});
            q.push({node->right, depth + 1});
        }
        return ans;
    }
};
```

广度优先遍历保证较浅层先出队，同层节点按从左到右的入队顺序出队，所以 `depth` 不会跳过尚未创建的答案行。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$；队列也会暂存空孩子，数量仍为 $O(w)$

## 易错点

- 第一种写法必须在处理本层之前保存队列长度，否则会把下一层也放入当前结果。
- 每一层需要新建一个数组，不能把全部值放在同一行。
- 空树返回空数组，而不是包含一个空数组的 `[[]]`。
- 左孩子应先于右孩子入队，才能保证每层从左到右。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/binary-tree-level-order-traversal/solutions/)
