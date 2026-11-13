---
title: 76. 最小覆盖子串
date: 2026-09-07
lang: zh-cn
---

给定字符串 `s` 和 `t`，返回 `s` 中涵盖 `t` 所有字符的最短连续子串。若 `t` 中某个字符出现多次，窗口中也必须至少包含相同次数。若不存在这样的子串，返回空字符串。题目保证非空答案唯一。

[题目链接](https://leetcode.cn/problems/minimum-window-substring/)

## 示例

### 示例 1

- 输入：`s = "ADOBECODEBANC", t = "ABC"`
- 输出：`"BANC"`
- 解释：`"BANC"` 同时包含 `A`、`B`、`C`，并且不存在更短的覆盖子串。

### 示例 2

- 输入：`s = "a", t = "a"`
- 输出：`"a"`

### 示例 3

- 输入：`s = "a", t = "aa"`
- 输出：`""`
- 解释：`t` 需要两个 `a`，而 `s` 只有一个。

## 数据范围

- $1 \leq s.length,t.length \leq 10^5$
- `s` 和 `t` 由大写及小写英文字母组成

<details class="note-solution">
<summary>查看解析</summary>

## 窗口状态

`need[c]` 表示当前窗口还缺少多少个字符 `c`：

- `need[c] > 0`：仍缺少该字符；
- `need[c] == 0`：数量恰好足够；
- `need[c] < 0`：窗口中有多余的该字符。

`missing` 记录总共还缺少多少个字符，初始为 `t.length()`。右端加入一个仍然缺少的字符时，`missing` 减一；`missing == 0` 表示当前窗口已经覆盖 `t`。

## 算法流程

1. 右移 `right`，把新字符加入窗口；
2. 当 `missing == 0` 时，当前窗口合法，记录更短的答案；
3. 继续右移 `left` 缩小窗口；
4. 若移除某字符后 `need[c] > 0`，窗口重新缺少该字符，停止收缩并继续扩张右端。

```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        array<int, 128> need{};
        for (char c : t) {
            need[c]++;
        }

        int missing = t.size();
        int left = 0, answerLeft = 0, answerLength = INT_MAX;
        for (int right = 0; right < s.size(); right++) {
            if (need[s[right]] > 0) {
                missing--;
            }
            need[s[right]]--;

            while (missing == 0) {
                if (right - left + 1 < answerLength) {
                    answerLeft = left;
                    answerLength = right - left + 1;
                }
                need[s[left]]++;
                if (need[s[left]] > 0) {
                    missing++;
                }
                left++;
            }
        }
        return answerLength == INT_MAX ? "" : s.substr(answerLeft, answerLength);
    }
};
```

## 过程示例

对于 `s = "ADOBECODEBANC"`、`t = "ABC"`：

- 右端到达第一个 `C` 时，窗口 `"ADOBEC"` 首次覆盖 `t`；
- 收缩左端后移除 `A`，窗口失效，继续扩张；
- 后续得到合法窗口 `"CODEBA"`，收缩为 `"BANC"`；
- `"BANC"` 长度为 `4`，已经等于 `t` 的长度，不可能存在更短的覆盖窗口。

## 正确性

`missing == 0` 与“窗口覆盖 `t`”等价，因为它精确统计尚未满足的字符总数。对每个右端点，内层循环持续移动左端，直到窗口刚好失效，所以期间检查了该右端点对应的所有可能最短合法窗口。枚举全部右端点并取最短值，即得到全局最短覆盖子串。

## 复杂度

左右指针都只向右移动，每个字符最多进入和离开窗口各一次。

- 时间复杂度：$O(|s|+|t|)$
- 空间复杂度：$O(|\Sigma|)=O(1)$

## 易错点

- 字符有大小写之分，`A` 与 `a` 不同。
- 只统计字符种类不够，还要满足每个字符的出现次数。
- `need[c] < 0` 表示字符多余，移除它不会让窗口立即失效。
- 更新最短答案必须放在窗口仍合法时，不能在收缩结束后才更新。

</details>

## 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题解：最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/solutions/257359/zui-xiao-fu-gai-zi-chuan-by-leetcode-solution/)
