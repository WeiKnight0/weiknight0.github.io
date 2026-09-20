---
title: 199. 二叉树的右视图
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root`，想象从树的右侧观察，按照从上到下的顺序返回每一层能够看到的节点值。

[题目链接](https://leetcode.cn/problems/binary-tree-right-side-view/)

## 示例

### 示例 1

- 输入：`root = [1,2,3,null,5,null,4]`
- 输出：`[1,3,4]`

### 示例 2

- 输入：`root = [1,2,3,4,null,null,null,5]`
- 输出：`[1,3,4,5]`
- 解释：第 3 层虽然节点 `4` 位于左子树，但该层右侧没有其他节点，因此仍能看到 `4`。

### 示例 3

- 输入：`root = [1,null,3]`
- 输出：`[1,3]`

### 示例 4

- 输入：`root = []`
- 输出：`[]`

## 数据范围

- 二叉树节点数为 $[0,100]$
- $-100 \leq Node.val \leq 100$

## 方法一：层序遍历并覆盖本层答案

队列保存 `{节点, 层号}`，按左孩子、右孩子的顺序加入队列。同层节点从左到右出队，每次都覆盖该层答案，最后留下的就是最右节点。

```cpp
class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        queue<pair<TreeNode*, int>> q;
        q.push({root, 0});
        vector<int> ans;
        while (!q.empty()) {
            auto [node, depth] = q.front();
            q.pop();
            if (!node) {
                continue;
            }
            if (depth == ans.size()) {
                ans.push_back(node->val);
            } else {
                ans[depth] = node->val;
            }
            q.push({node->left, depth + 1});
            q.push({node->right, depth + 1});
        }
        return ans;
    }
};
```

该写法与项目现有树遍历模板一致。右视图不是简单地沿 `right` 指针向下走；某层没有右子树节点时，左子树中的节点也可能成为该层最右节点。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$

## 方法二：优先访问右子树的 DFS

按照“根 → 右 → 左”的顺序深度优先遍历。第一次到达某个深度时，当前节点就是该层最右侧节点，将它加入答案；同层后续节点不再覆盖。

```cpp
class Solution {
    void dfs(TreeNode* root, int depth, vector<int>& ans) {
        if (!root) {
            return;
        }
        if (depth == ans.size()) {
            ans.push_back(root->val);
        }
        dfs(root->right, depth + 1, ans);
        dfs(root->left, depth + 1, ans);
    }

public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> ans;
        dfs(root, 0, ans);
        return ans;
    }
};
```

右子树并不一定包含该层节点，但优先访问右侧保证在所有存在的同层节点中，最靠右者最先被访问。若右侧缺失，遍历自然会进入左子树补上该层答案。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

## 易错点

- 右视图取每层最右节点，不是只取所有右孩子。
- BFS 覆盖法必须按左后右的顺序入队；若先右后左，最终会留下最左节点。
- DFS 必须先访问右子树，并且只在第一次到达该深度时记录。
- 空树返回空数组。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/binary-tree-right-side-view/solutions/)
