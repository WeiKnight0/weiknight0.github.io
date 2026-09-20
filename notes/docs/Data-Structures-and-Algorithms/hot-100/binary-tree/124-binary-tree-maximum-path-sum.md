---
title: 124. 二叉树中的最大路径和
date: 2026-09-07
lang: zh-cn
---

二叉树中的路径由若干节点组成，相邻节点之间有边，且同一节点不能重复出现。路径至少包含一个节点，不要求经过根节点。给定根节点 `root`，返回所有路径中的最大节点值之和。

[题目链接](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

## 示例

### 示例 1

- 输入：`root = [1,2,3]`
- 输出：`6`
- 解释：最大路径为 `2 → 1 → 3`。

### 示例 2

- 输入：`root = [-10,9,20,null,null,15,7]`
- 输出：`42`
- 解释：最大路径为 `15 → 20 → 7`。

## 数据范围

- 二叉树节点数为 $[1,3\times10^4]$
- $-1000 \leq Node.val \leq 1000$

## 完整路径与向上贡献

对一个节点，需要区分两个量：

1. **以当前节点为最高点的完整路径**：可以同时连接左右子树，用于更新最终答案；
2. **返回给父节点的向下路径贡献**：只能选择左、右一侧，否则接到父节点后路径会在当前节点分叉。

若某侧贡献为负数，加入它只会减小路径和，应当舍弃并按 `0` 处理。

设左右子树返回的非负贡献为 `left`、`right`：

$$
candidate=root\!\rightarrow\!val+left+right
$$

$$
gain(root)=root\!\rightarrow\!val+\max(left,right)
$$

```cpp
class Solution {
    int answer = INT_MIN;

    int gain(TreeNode* root) {
        if (!root) {
            return 0;
        }
        int left = max(gain(root->left), 0);
        int right = max(gain(root->right), 0);
        answer = max(answer, root->val + left + right);
        return root->val + max(left, right);
    }

public:
    int maxPathSum(TreeNode* root) {
        answer = INT_MIN;
        gain(root);
        return answer;
    }
};
```

## 过程示例

对于 `[-10,9,20,null,null,15,7]`：

1. 叶子 `15` 和 `7` 分别向上返回 `15`、`7`；
2. 节点 `20` 处的完整路径为 $15+20+7=42$，更新答案；
3. 节点 `20` 向父节点只能返回一侧，贡献为 $20+\max(15,7)=35$；
4. 根节点 `-10` 连接 `9` 与 `35` 得到 `34`，小于已有答案 `42`。

## 正确性

任意合法路径都有唯一的最高节点。在这个最高节点处，路径至多由“左侧向下路径 + 当前节点 + 右侧向下路径”组成。`gain` 分别给出两侧能提供的最大非负贡献，所以算法在该节点计算了以它为最高点的最优路径。遍历所有节点并取最大值，必然包含全局最优路径。

返回父节点时只选一侧，保证向上的结果始终是一条不分叉路径。

## 复杂度

- 时间复杂度：$O(n)$，每个节点访问一次
- 空间复杂度：$O(h)$，来自递归调用栈

## 易错点

- 路径至少包含一个节点，答案必须初始化为 `INT_MIN`，不能初始化为 `0`。
- 负贡献应舍弃，但当前节点本身不能被舍弃。
- 更新全局答案时可以同时使用左右子树；返回父节点时只能选择一侧。
- 最大路径不一定经过整棵树的根节点。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/binary-tree-maximum-path-sum/solutions/)
