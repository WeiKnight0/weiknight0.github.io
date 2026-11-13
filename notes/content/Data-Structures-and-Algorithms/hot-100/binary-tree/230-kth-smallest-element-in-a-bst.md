---
title: 230. 二叉搜索树中第 K 小的元素
date: 2026-09-07
lang: zh-cn
---

给定二叉搜索树根节点 `root` 和整数 `k`，返回树中第 `k` 小的节点值。`k` 从 `1` 开始计数。

[题目链接](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

## 示例

### 示例 1

- 输入：`root = [3,1,4,null,2], k = 1`
- 输出：`1`

### 示例 2

- 输入：`root = [5,3,6,2,4,null,null,1], k = 3`
- 输出：`3`

## 数据范围

- 二叉树节点数为 $n$
- $1 \leq k \leq n \leq 10^4$
- $0 \leq Node.val \leq 10^4$
- 所有节点值互不相同，输入是有效 BST

<details class="note-solution">
<summary>查看解析</summary>

## 中序遍历与第 K 小

BST 的中序遍历按照严格递增顺序访问节点。第 `k` 个被访问的节点就是第 `k` 小，无需遍历并保存完整序列。

## 方法一：迭代中序遍历

栈保存尚未访问的祖先。先沿左孩子不断入栈；无法继续向左时弹出栈顶，这就是当前最小的未访问节点。每弹出一个节点令 `k--`，减到 `0` 时返回。

```cpp
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        while (true) {
            while (root) {
                st.push(root);
                root = root->left;
            }
            root = st.top();
            st.pop();
            if (--k == 0) {
                return root->val;
            }
            root = root->right;
        }
    }
};
```

遍历在找到答案时立即停止。若树较平衡且 `k` 较小，不需要访问全部节点。

- 时间复杂度：$O(h+k)$
- 空间复杂度：$O(h)$

## 方法二：递归中序遍历

递归访问左子树后处理当前节点。用引用参数 `answer` 保存结果，返回值表示是否已经找到，找到后立即终止其余递归。

```cpp
class Solution {
    bool inorder(TreeNode* root, int& k, int& answer) {
        if (!root) {
            return false;
        }
        if (inorder(root->left, k, answer)) {
            return true;
        }
        if (--k == 0) {
            answer = root->val;
            return true;
        }
        return inorder(root->right, k, answer);
    }

public:
    int kthSmallest(TreeNode* root, int k) {
        int answer = 0;
        inorder(root, k, answer);
        return answer;
    }
};
```

- 时间复杂度：$O(h+k)$
- 空间复杂度：$O(h)$

## 正确性

两种方法都严格按中序访问节点。有效 BST 的中序序列严格递增，因此计数减到零时已经访问了恰好 `k - 1` 个更小节点，当前值就是第 `k` 小。

## 易错点

- `k` 从 `1` 开始，访问节点时先减一再判断是否为零。
- 迭代中序是“不断向左 → 弹栈访问 → 转向右子树”。
- 不能使用层序遍历顺序判断大小。
- 若树经常插入和删除并频繁查询，可在节点中维护子树大小；本题只查询一次，无需改变节点结构。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/solutions/)
