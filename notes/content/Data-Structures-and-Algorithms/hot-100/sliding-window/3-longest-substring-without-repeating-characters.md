---
title: 3. 无重复字符的最长子串
date: 2026-09-07
lang: zh-cn
---

给定字符串 `s`，求其中不含重复字符的最长连续子串的长度。

[题目链接](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

## 示例

### 示例 1

- 输入：`s = "abcabcbb"`
- 输出：`3`
- 解释：最长无重复子串可以是 `"abc"`，长度为 `3`。

### 示例 2

- 输入：`s = "bbbbb"`
- 输出：`1`
- 解释：最长无重复子串是 `"b"`。

### 示例 3

- 输入：`s = "pwwkew"`
- 输出：`3`
- 解释：最长无重复子串可以是 `"wke"`。`"pwke"` 是子序列而不是连续子串，不能作为答案。

## 数据范围

- $0 \leq s.length \leq 5\times 10^4$
- `s` 由英文字母、数字、符号和空格组成

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：集合维护窗口

窗口 `[left, right]` 始终不含重复字符。加入 `s[right]` 前，如果它已经在窗口中，就不断移除左端字符并右移 `left`，直到可以安全加入。

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> window;
        int left = 0, ans = 0;

        for (int right = 0; right < s.size(); right++) {
            while (window.count(s[right])) {
                window.erase(s[left++]);
            }
            window.insert(s[right]);
            ans = max(ans, right - left + 1);
        }
        return ans;
    }
};
```

每个字符最多进入和离开集合各一次。

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(|\Sigma|)$，其中 $\Sigma$ 是字符集

## 方法二：记录字符最后出现位置

发生重复时，无须逐个移除左端字符。记录每个字符上一次出现的下标 `last[c]`，直接令窗口左端跳到重复位置之后。

`left` 只能向右移动。若字符上一次出现在当前窗口左侧，不能把 `left` 向左拉回，因此更新式为：

$$
left=\max(left,last[s[right]]+1)
$$

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        array<int, 128> last;
        last.fill(-1);
        int left = 0, ans = 0;

        for (int right = 0; right < s.size(); right++) {
            left = max(left, last[s[right]] + 1);
            last[s[right]] = right;
            ans = max(ans, right - left + 1);
        }
        return ans;
    }
};
```

例如 `s = "abba"`。处理最后一个 `a` 时，它上次出现在下标 `0`，但此时 `left = 2`，所以左端仍为 `2`，不能回退到 `1`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(|\Sigma|)$

## 正确性

每次加入右端字符后，算法都会排除该字符在当前窗口内的上一次出现位置，因此窗口中没有重复字符。左端只越过为消除重复所必需的位置，所以以当前 `right` 结尾的无重复子串不可能比当前窗口更长。枚举所有右端点并取最大值即可得到答案。

## 易错点

- 题目求子串而不是子序列，字符必须连续。
- 使用最后位置时必须取 `max(left, last[c] + 1)`，否则窗口左端可能倒退。
- 字符串可能为空，答案初值应为 `0`。
- 若使用数组记录位置，要保证数组覆盖题目允许的字符集，不能只按 26 个小写字母处理。

</details>

## 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题目](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)
