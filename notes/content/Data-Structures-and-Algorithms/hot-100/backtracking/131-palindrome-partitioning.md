---
title: 131. 分割回文串
date: 2026-09-07
lang: zh-cn
---

给定字符串 `s`，把它分割成若干非空子串，使每个子串都是回文串。返回所有可能的分割方案。

[题目链接](https://leetcode.cn/problems/palindrome-partitioning/)

## 示例

### 示例 1

- 输入：`s = "aab"`
- 输出：`[["a","a","b"],["aa","b"]]`

### 示例 2

- 输入：`s = "a"`
- 输出：`[["a"]]`

## 数据范围

- $1 \leq s.length \leq 16$
- `s` 只包含小写英文字母

<details class="note-solution">
<summary>查看解析</summary>

## 回溯状态

`start` 表示下一段从哪个下标开始。枚举结束下标 `end`，若 `s[start..end]` 是回文串，就把它加入路径，并从 `end + 1` 继续分割。

- **路径**：已经确定的回文子串；
- **选择列表**：所有以 `start` 开头的回文前缀；
- **结束条件**：`start == s.length()`，说明整个字符串已经分割完毕。

## 预处理回文区间

若 `s[left] == s[right]`，并且内部区间 `s[left + 1..right - 1]` 是回文串，则 `s[left..right]` 也是回文串：

$$
palindrome[left][right]=
(s[left]=s[right])\land palindrome[left+1][right-1]
$$

长度不超过 `2` 的区间没有需要检查的内部字符，只需比较两端。按 `left` 从右到左计算，能保证内部区间已经得到结果。

```cpp
class Solution {
    vector<vector<string>> answer;
    vector<string> path;
    vector<vector<bool>> palindrome;

    void dfs(const string& s, int start) {
        if (start == s.size()) {
            answer.push_back(path);
            return;
        }
        for (int end = start; end < s.size(); end++) {
            if (!palindrome[start][end]) {
                continue;
            }
            path.push_back(s.substr(start, end - start + 1));
            dfs(s, end + 1);
            path.pop_back();
        }
    }

public:
    vector<vector<string>> partition(string s) {
        int n = s.size();
        palindrome.assign(n, vector<bool>(n));
        for (int left = n - 1; left >= 0; left--) {
            for (int right = left; right < n; right++) {
                palindrome[left][right] = s[left] == s[right] &&
                    (right - left <= 2 || palindrome[left + 1][right - 1]);
            }
        }

        answer.clear();
        path.clear();
        dfs(s, 0);
        return answer;
    }
};
```

## 过程示例

对 `"aab"`：

1. 第一段选 `"a"`，剩余 `"ab"` 只能分成 `"a"、"b"`；
2. 回溯后第一段改选 `"aa"`，它本身是回文，剩余为 `"b"`；
3. `"aab"` 不是回文，不能作为单独一段。

因此得到两种分割方案。

## 正确性

预处理表准确记录每个区间是否回文。DFS 每次只选择从当前位置开始的回文子串，所以所有完成路径都合法。任意合法分割都有确定的第一段终点，循环会枚举该终点，之后递归以同样方式枚举剩余各段，因此不会漏解。每组终点序列唯一，也不会重复生成同一分割。

## 复杂度

- 回文预处理：时间和空间复杂度均为 $O(n^2)$；
- 回溯最坏会产生 $2^{n-1}$ 种分割，包含复制结果时总时间复杂度为 $O(n2^n)$；
- 不计算返回结果时，额外空间复杂度为 $O(n^2)$。

## 易错点

- 分割必须覆盖整个字符串，只有 `start == n` 时才能记录答案。
- 下一段从 `end + 1` 开始，不能重用当前字符。
- 回文预处理应按左端点从右向左计算。
- `substr` 的第二个参数是长度，应写成 `end - start + 1`。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/palindrome-partitioning/solutions/)
