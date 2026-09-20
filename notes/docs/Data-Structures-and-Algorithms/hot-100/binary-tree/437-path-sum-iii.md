---
title: 437. 路径总和 III
date: 2026-09-07
lang: zh-cn
---

给定二叉树根节点 `root` 和整数 `targetSum`，统计节点值之和等于 `targetSum` 的路径数量。路径必须沿父节点到子节点连续向下，但可以从任意节点开始，也可以在任意节点结束。

[题目链接](https://leetcode.cn/problems/path-sum-iii/)

## 示例

### 示例 1

- 输入：`root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8`
- 输出：`3`
- 解释：满足条件的路径是 `5 → 3`、`5 → 2 → 1` 和 `-3 → 11`。

### 示例 2

- 输入：`root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22`
- 输出：`3`

## 数据范围

- 二叉树节点数为 $[0,1000]$
- $-10^9 \leq Node.val \leq 10^9$
- $-1000 \leq targetSum \leq 1000$

## 方法一：枚举路径起点

`countFrom(root, sum)` 统计必须从当前节点开始、和为 `sum` 的向下路径。再对每个节点调用一次该函数，使所有可能起点都被枚举。

```cpp
class Solution {
    int countFrom(TreeNode* root, long long sum) {
        if (!root) {
            return 0;
        }
        int answer = root->val == sum;
        answer += countFrom(root->left, sum - root->val);
        answer += countFrom(root->right, sum - root->val);
        return answer;
    }

public:
    int pathSum(TreeNode* root, int targetSum) {
        if (!root) {
            return 0;
        }
        return countFrom(root, targetSum) +
               pathSum(root->left, targetSum) +
               pathSum(root->right, targetSum);
    }
};
```

- 时间复杂度：最坏 $O(n^2)$，链状树中每个起点都会继续扫描后续节点
- 空间复杂度：$O(h)$

## 方法二：树上前缀和

在当前根到节点的路径上，设当前前缀和为 `sum`。若祖先位置的前缀和为 `sum - targetSum`，则该祖先之后到当前节点的路径和为目标值。

哈希表 `count[x]` 只记录当前递归路径上前缀和 `x` 的出现次数：

1. 进入节点时计算新前缀和，累加 `count[sum - targetSum]`；
2. 把当前前缀和加入哈希表；
3. 递归左右子树；
4. 离开节点时撤销当前前缀和，避免影响兄弟子树。

```cpp
class Solution {
    unordered_map<long long, int> count;
    long long target;

    int dfs(TreeNode* root, long long sum) {
        if (!root) {
            return 0;
        }
        sum += root->val;
        int answer = count[sum - target];
        count[sum]++;
        answer += dfs(root->left, sum);
        answer += dfs(root->right, sum);
        count[sum]--;
        return answer;
    }

public:
    int pathSum(TreeNode* root, int targetSum) {
        count.clear();
        count[0] = 1;
        target = targetSum;
        return dfs(root, 0);
    }
};
```

`count[0] = 1` 表示根节点之前存在一个前缀和为零的位置，使从根开始且和为目标值的路径也能被统计。

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(h)$；哈希表只保留当前根到节点路径上的计数

## 正确性

任意合法路径都可以唯一表示为“当前节点前缀和减去某个祖先之前的前缀和”。DFS 到达路径终点时，哈希表包含该祖先前缀且只包含当前祖先链，所以该路径恰好被统计一次。回溯撤销保证不同分支之间不会组合出并不存在的路径。

## 易错点

- 路径必须连续向下，但不要求从根开始或到叶子结束。
- 节点值可能为负数，不能用路径和超过目标就停止的剪枝。
- 前缀和可能超过 32 位整数，应使用 `long long`。
- 离开节点时必须执行 `count[sum]--`。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/path-sum-iii/solutions/)
