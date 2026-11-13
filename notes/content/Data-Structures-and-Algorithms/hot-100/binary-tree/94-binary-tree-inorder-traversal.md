---
title: 94. 二叉树的中序遍历
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root`，返回它的中序遍历结果。中序遍历的访问顺序是“左子树 → 当前节点 → 右子树”。

[题目链接](https://leetcode.cn/problems/binary-tree-inorder-traversal/)

## 示例

### 示例 1

- 输入：`root = [1,null,2,3]`
- 输出：`[1,3,2]`

树的结构为：

```text
1
 \
  2
 /
3
```

### 示例 2

- 输入：`root = []`
- 输出：`[]`

### 示例 3

- 输入：`root = [1]`
- 输出：`[1]`

## 数据范围

- 二叉树节点数为 $[0,100]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：递归遍历

递归函数负责遍历以 `root` 为根的子树。空树无需处理；非空树先递归左子树，再记录根节点，最后递归右子树。

```cpp
class Solution {
    void inorder(TreeNode* root, vector<int>& ans) {
        if (!root) {
            return;
        }
        inorder(root->left, ans);
        ans.push_back(root->val);
        inorder(root->right, ans);
    }

public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> ans;
        inorder(root, ans);
        return ans;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$，其中 $h$ 为树高，来自递归调用栈

## 方法二：颜色遍历法

栈中保存 `pair<TreeNode*, bool>`：

- `false` 表示节点尚未展开；
- `true` 表示左右子树的相对顺序已经安排好，现在可以记录该节点。

栈是后进先出。中序要求“左、根、右”，所以展开节点时按相反顺序压入“右、根、左”。

```cpp
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> ans;
        stack<pair<TreeNode*, bool>> st;
        st.push({root, false});
        while (!st.empty()) {
            auto [node, visited] = st.top();
            st.pop();
            if (!node) {
                continue;
            }
            if (visited) {
                ans.push_back(node->val);
                continue;
            }
            st.push({node->right, false});
            st.push({node, true});
            st.push({node->left, false});
        }
        return ans;
    }
};
```

每个非空节点先以未处理状态入栈，展开后再以已处理状态入栈一次，因此节点值只会记录一次，顺序正好是左、根、右。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$；最坏情况下栈中保存 $O(n)$ 个元素

## 易错点

- 中序遍历不是按节点值排序；只有二叉搜索树的中序序列具有单调性。
- 颜色遍历法的压栈顺序必须与目标访问顺序相反。
- 空节点只用于表示结构，不应加入答案。
- 递归辅助函数应通过引用写入同一个答案数组。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/binary-tree-inorder-traversal/solutions/)
