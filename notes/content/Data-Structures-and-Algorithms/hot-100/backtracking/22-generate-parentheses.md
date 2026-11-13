---
title: 22. 括号生成
date: 2026-09-07
lang: zh-cn
---

给定括号对数 `n`，生成所有由 `n` 对括号组成且格式有效的字符串。答案顺序不限。

[题目链接](https://leetcode.cn/problems/generate-parentheses/)

## 示例

### 示例 1

- 输入：`n = 3`
- 输出：`["((()))","(()())","(())()","()(())","()()()"]`

### 示例 2

- 输入：`n = 1`
- 输出：`["()"]`

## 数据范围

- $1 \leq n \leq 8$

<details class="note-solution">
<summary>查看解析</summary>

## 合法前缀

从左到右构造字符串。设已经放入 `open` 个左括号和 `close` 个右括号：

- 左括号总数不足 `n` 时，可以继续放 `(`；
- 只有 `close < open` 时才能放 `)`，否则当前前缀会出现无法匹配的右括号；
- 当字符串长度达到 `2n` 时，左右括号都恰好使用 `n` 个，得到合法答案。

## 回溯三要素

- **路径**：当前括号字符串 `path`；
- **选择列表**：满足条件时选择 `(` 或 `)`；
- **结束条件**：路径长度达到 `2n`。

```cpp
class Solution {
    vector<string> answer;
    string path;

    void dfs(int n, int open, int close) {
        if (path.size() == n * 2) {
            answer.push_back(path);
            return;
        }
        if (open < n) {
            path.push_back('(');
            dfs(n, open + 1, close);
            path.pop_back();
        }
        if (close < open) {
            path.push_back(')');
            dfs(n, open, close + 1);
            path.pop_back();
        }
    }

public:
    vector<string> generateParenthesis(int n) {
        answer.clear();
        path.clear();
        dfs(n, 0, 0);
        return answer;
    }
};
```

## 为什么不需要生成后再检查

任意有效括号串的每个前缀都满足右括号数量不超过左括号数量。条件 `close < open` 在添加右括号前保证这一性质，因此搜索过程不会进入无效前缀，也不需要生成全部 $2^{2n}$ 个括号串后再筛选。

## 正确性

算法只在左括号有剩余时加入左括号，只在存在未匹配左括号时加入右括号，所以所有完成路径都有效。反过来，任意有效括号串从左到右的每一步都满足这两个选择条件，算法会沿其字符顺序走到对应叶子，因此不会漏掉合法字符串。

## 复杂度

合法结果数量是第 $n$ 个卡特兰数 $C_n$：

$$
C_n=\frac{1}{n+1}\binom{2n}{n}
$$

- 时间复杂度：$O(nC_n)$，复制每个长度为 `2n` 的答案需要 $O(n)$
- 空间复杂度：$O(n)$，不计算返回结果

## 易错点

- 能否放右括号取决于 `close < open`，不是只检查 `close < n`。
- 到达结束条件时路径长度是 `2n`。
- 每次递归返回后要删除刚加入的括号。
- 不需要额外验证完成字符串，剪枝已经保证合法。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/generate-parentheses/solutions/)
