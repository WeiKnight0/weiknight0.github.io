---
title: 236. 二叉树的最近公共祖先
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root` 和树中的两个不同节点 `p`、`q`，返回它们的最近公共祖先。一个节点也可以是它自己的祖先。

[题目链接](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)

## 示例

以下示例使用二叉树 `root = [3,5,1,6,2,0,8,null,null,7,4]`。

### 示例 1

- 输入：`p = 5, q = 1`
- 输出：`3`
- 解释：节点 `5` 和 `1` 分别位于根节点 `3` 的左右子树。

### 示例 2

- 输入：`p = 5, q = 4`
- 输出：`5`
- 解释：节点可以是自己的祖先，`5` 是 `4` 的祖先。

### 示例 3

- 输入：`root = [1,2], p = 1, q = 2`
- 输出：`1`

## 数据范围

- 二叉树节点数为 $[2,10^5]$
- $-10^9 \leq Node.val \leq 10^9$
- 所有节点值互不相同
- `p`、`q` 是树中不同节点

## 方法一：自底向上 DFS

递归函数返回当前子树中找到的目标节点或最近公共祖先：

- 当前节点为空时返回 `nullptr`；
- 当前节点就是 `p` 或 `q` 时返回当前节点；
- 左右子树都返回非空时，两个目标分处两侧，当前节点就是最近公共祖先；
- 只有一侧非空时，把该侧结果向上传递。

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) {
            return root;
        }
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) {
            return root;
        }
        return left ? left : right;
    }
};
```

若当前节点本身是目标节点，直接返回它仍然正确：另一个目标若在其子树中，当前节点就是最近公共祖先；题目保证两个目标都存在。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

## 方法二：记录父节点

先遍历树并记录每个节点的父节点，直到 `p` 和 `q` 都已找到。随后把 `p` 到根的祖先加入集合，再从 `q` 向根移动，第一个出现在集合中的节点就是最近公共祖先。

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        unordered_map<TreeNode*, TreeNode*> parent{{root, nullptr}};
        stack<TreeNode*> st;
        st.push(root);
        while (!parent.count(p) || !parent.count(q)) {
            TreeNode* node = st.top();
            st.pop();
            if (node->left) {
                parent[node->left] = node;
                st.push(node->left);
            }
            if (node->right) {
                parent[node->right] = node;
                st.push(node->right);
            }
        }

        unordered_set<TreeNode*> ancestors;
        for (; p; p = parent[p]) {
            ancestors.insert(p);
        }
        for (; !ancestors.count(q); q = parent[q]) {}
        return q;
    }
};
```

从 `q` 向上遇到的第一个 `p` 的祖先，是距离 `q` 最近且同时包含两者的祖先，因此就是 LCA。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

本题只有一次查询，直接 DFS 最简洁。若同一棵树上有大量 LCA 查询，再考虑倍增或 Tarjan 离线算法。

## 易错点

- 最近公共祖先允许等于 `p` 或 `q`。
- 比较的是节点指针，不应只比较节点值。
- DFS 中左右都找到目标时才能确定当前节点；只有一侧找到时需要继续向上传递。
- 父节点方法必须把根节点的父节点设为 `nullptr`，祖先回溯才能终止。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [OI Wiki：最近公共祖先](https://oi-wiki.org/graph/lca/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/solutions/)
