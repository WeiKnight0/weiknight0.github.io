---
title: 763. 划分字母区间
date: 2026-09-07
lang: zh-cn
---

给定一个只含小写英文字母的字符串 `s`，将它划分为尽可能多的连续片段，使同一个字母最多出现在一个片段中。所有片段按顺序连接后仍为原字符串，返回每个片段的长度。

[题目链接](https://leetcode.cn/problems/partition-labels/)

## 示例

### 示例 1

- 输入：`s = "ababcbacadefegdehijhklij"`
- 输出：`[9,7,8]`
- 解释：可以划分为 `"ababcbaca"`、`"defegde"`、`"hijhklij"`，每个字母只属于其中一个片段

### 示例 2

- 输入：`s = "eccbbbbdec"`
- 输出：`[10]`

## 数据范围

- $1 \leq s.length \leq 500$
- `s` 仅由小写英文字母组成

<details class="note-solution">
<summary>查看解析</summary>

## 由最后出现位置确定边界

先记录每个字母最后一次出现的下标。扫描一个片段时，只要片段中出现了字母 `c`，片段右端点就至少要覆盖 `last[c]`，否则该字母会跨越两个片段。

令 `end` 为当前片段内所有已扫描字母的最远末次出现位置：

$$
end=\max(end,last[s[i]])
$$

当 `i == end` 时，当前片段中的所有字母都不会在右侧再次出现，可以立即在这里切分。选择这个最早合法边界，才能留下最多的后续片段。

```cpp
class Solution {
public:
    vector<int> partitionLabels(string s) {
        array<int, 26> last{};
        for (int i = 0; i < s.size(); i++) {
            last[s[i] - 'a'] = i;
        }

        vector<int> answer;
        int start = 0, end = 0;
        for (int i = 0; i < s.size(); i++) {
            end = max(end, last[s[i] - 'a']);
            if (i == end) {
                answer.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return answer;
    }
};
```

扫描到 `end` 前不能切分，因为已出现的某个字母还会在片段右侧出现。扫描到 `end` 时，片段内每个字母的最后位置都不超过 `end`，所以这里是当前片段最早的合法结束位置。每次都采用最早合法切点，得到的片段数量最多。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$，字母表大小固定为 26

## 示例过程

字符串 `"ababcbaca..."` 从下标 `0` 开始：

1. 字母 `a` 最后出现在下标 `8`，当前边界扩展到 `8`；
2. 扫描边界以内的 `b`、`c`，它们最后出现的位置也都不超过 `8`；
3. 到达下标 `8` 时可以切分，第一个片段长度为 `9`。

若某个新字母的最后位置超过当前 `end`，必须继续扩大当前片段，不能提前切开。

## 易错点

- 需要先完成一遍末次位置统计，再开始划分。
- 当前片段边界取遇到过的所有字母末次位置的最大值，不能只看片段首字母。
- 题目要求尽可能多的片段，因此每次到达最早合法边界就应立即切分。
- 片段长度包含左右端点，计算式为 `end - start + 1`。

</details>

## 参考

- [项目现有贪心笔记](../../algorithms/techniques/greedy.md)
- [灵茶山艾府：贪心题单](https://leetcode.cn/discuss/post/3091107/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/partition-labels/solutions/)
