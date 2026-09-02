---
title: Sliding Window 滑动窗口
date: 2026-02-04
lang: zh-cn
---

滑动窗口用于处理数组或字符串中的连续子数组、连续子串问题。核心思想是维护一个区间 `[left, right]`，让右端点扩展窗口，让左端点在需要时收缩窗口，从而避免重复计算。

# 滑动窗口适用场景

常见信号：
- 题目要求连续子数组或连续子串。
- 需要求最长、最短、最大、最小。
- 需要统计满足条件的连续区间个数。
- 暴力枚举所有区间是 $O(n^2)$，但窗口状态可以增量维护。

常见类型：
- 定长滑动窗口：窗口长度固定为 `k`。
- 不定长滑动窗口：窗口长度变化，通过条件决定何时移动 `left`。
- 计数型滑动窗口：统计满足条件的子数组或子字符串个数。
- 恰好型滑动窗口：把“恰好 k”转换成“至多 k”或“至少 k”的差。

# 定长滑动窗口

定长滑动窗口用于计算长度恰好为 `k` 的子数组或子串中的某个属性，例如和、最大值、字符个数等。

三步法：
1. **入**：下标为 `right` 的元素进入窗口，更新统计量。
2. **更新**：窗口长度达到 `k` 后，更新答案。
3. **出**：下标为 `right - k + 1` 的元素离开窗口，更新统计量。

## 1456. 定长子串中元音的最大数目

题目来源：[1456. 定长子串中元音的最大数目](https://leetcode.cn/problems/maximum-number-of-vowels-in-a-substring-of-given-length/description/)

题目描述：给你字符串 `s` 和整数 `k`，请返回字符串 `s` 中长度为 `k` 的单个子字符串中可能包含的最大元音字母数。英文中的元音字母为 `a`、`e`、`i`、`o`、`u`。

示例：

**示例 1：**

- 输入：`s = "abciiidef", k = 3`

- 输出：`3`

- 解释：子字符串 `"iii"` 包含 3 个元音字母。

**示例 2：**

- 输入：`s = "aeiou", k = 2`

- 输出：`2`

思路：
- `right` 从左到右扫描，每次把 `s[right]` 加入窗口。
- 当窗口长度达到 `k` 时，用当前元音个数更新答案。
- 更新后移出窗口最左侧字符。

```cpp
#include <bits/stdc++.h>
using namespace std;

bool isVowel(char c) {
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}

int main() {
    string s;
    int k;
    cin >> s >> k;

    int ans = 0;
    int cur = 0;
    int n = s.size();

    for (int right = 0; right < n; right++) {
        if (isVowel(s[right])) {
            cur++; // 入
        }

        int left = right - k + 1;
        if (left < 0) {
            continue; // 没有形成窗口
        }

        ans = max(ans, cur); // 更新

        if (isVowel(s[left])) {
            cur--; // 出
        }
    }

    cout << ans << '\n';
    return 0;
}
```

# 不定长滑动窗口

不定长滑动窗口用两个指针维护 `[left, right]`。右端点负责扩大窗口，左端点负责在窗口不满足或已经满足某个条件时收缩窗口。

关键是判断窗口的合法性如何随长度变化：
- 窗口越短越容易合法：通常用于求最长。
- 窗口越长越容易合法：通常用于求最短。

## 3. 无重复字符的最长子串

题目来源：[3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/)

题目描述：给定一个字符串 `s`，请你找出其中不含有重复字符的最长子串的长度。

示例：

**示例 1：**

- 输入：`s = "abcabcbb"`

- 输出：`3`

- 解释：答案是 "abc"，长度为 3。

**示例 2：**

- 输入：`s = "bbbbb"`

- 输出：`1`

- 解释：答案是 "b"，长度为 1。

**示例 3：**

- 输入：`s = "pwwkew"`

- 输出：`3`

- 解释：答案是 "wke"，长度为 3。

思路：
- 右端点扩展窗口，并记录字符出现次数。
- 如果 `s[right]` 出现次数超过 `1`，说明窗口不合法，移动 `left` 直到合法。
- 每次窗口合法后更新最大长度。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;

    unordered_map<char, int> cnt;
    int ans = 0;
    int left = 0;

    for (int right = 0; right < (int)s.size(); right++) {
        cnt[s[right]]++;

        while (cnt[s[right]] > 1) {
            cnt[s[left]]--;
            left++;
        }

        ans = max(ans, right - left + 1);
    }

    cout << ans << '\n';
    return 0;
}
```

## 2904. 最短且字典序最小的美丽子字符串

题目来源：[2904. 最短且字典序最小的美丽子字符串](https://leetcode.cn/problems/shortest-and-lexicographically-smallest-beautiful-string/description/)

题目描述：给你一个二进制字符串 `s` 和一个正整数 `k`。如果 `s` 的某个子字符串中 `1` 的个数恰好等于 `k`，则称这个子字符串是美丽子字符串。返回长度最短且字典序最小的美丽子字符串；如果不存在，返回空字符串。

示例：

**示例 1：**

- 输入：`s = "100011001", k = 3`

- 输出：`"11001"`

- 解释：包含 3 个 1 的最短子字符串有 "10001" 和 "11001"，字典序更小的是 "11001"。

**示例 2：**

- 输入：`s = "1011", k = 2`

- 输出：`"11"`

**示例 3：**

- 输入：`s = "000", k = 1`

- 输出：`""`

思路：
- 右端点扩展窗口，维护窗口内 `1` 的数量。
- 当 `1` 的数量超过 `k`，或者左端点是多余的 `0`，就移动 `left`。
- 当窗口内 `1` 的数量等于 `k` 时，用当前子串更新答案。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    int k;
    cin >> s >> k;

    if (count(s.begin(), s.end(), '1') < k) {
        cout << "" << '\n';
        return 0;
    }

    string ans = s;
    int left = 0;
    int cnt = 0;

    for (int right = 0; right < (int)s.size(); right++) {
        if (s[right] == '1') {
            cnt++;
        }

        while (cnt > k || s[left] == '0') {
            if (s[left] == '1') {
                cnt--;
            }
            left++;
        }

        if (cnt == k) {
            string cur = s.substr(left, right - left + 1);
            if (cur.size() < ans.size() ||
                (cur.size() == ans.size() && cur < ans)) {
                ans = cur;
            }
        }
    }

    cout << ans << '\n';
    return 0;
}
```

# 求子数组个数

计数型滑动窗口通常不是只更新最大/最小值，而是一次性统计以 `right` 为右端点的多个合法区间。

## 越短越合法：713. 乘积小于 K 的子数组

题目来源：[713. 乘积小于 K 的子数组](https://leetcode.cn/problems/subarray-product-less-than-k/description/)

题目描述：给你一个整数数组 `nums` 和一个整数 `k`，请返回子数组内所有元素的乘积严格小于 `k` 的连续子数组数目。

示例：

**示例 1：**

- 输入：`nums = [10,5,2,6], k = 100`

- 输出：`8`

- 解释：满足条件的子数组为 [10], [5], [2], [6], [10,5], [5,2], [2,6], [5,2,6]。

**示例 2：**

- 输入：`nums = [1,2,3], k = 0`

- 输出：`0`

思路：
- 窗口乘积小于 `k` 时合法。
- 如果乘积大于等于 `k`，移动 `left` 缩小窗口。
- 内层循环结束后，`[left, right]` 合法；由于越短越容易合法，所以 `[left, right]`、`[left + 1, right]`、...、`[right, right]` 都合法。
- 因此每次贡献 `right - left + 1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    if (k <= 1) {
        cout << 0 << '\n';
        return 0;
    }

    long long product = 1;
    int ans = 0;
    int left = 0;

    for (int right = 0; right < n; right++) {
        product *= nums[right];

        while (product >= k) {
            product /= nums[left];
            left++;
        }

        ans += right - left + 1;
    }

    cout << ans << '\n';
    return 0;
}
```

## 越长越合法：1358. 包含所有三种字符的子字符串数目

题目来源：[1358. 包含所有三种字符的子字符串数目](https://leetcode.cn/problems/number-of-substrings-containing-all-three-characters/description/)

题目描述：给你一个字符串 `s`，它只包含 `a`、`b`、`c` 三种字符。请返回 `a`、`b`、`c` 都至少出现过一次的子字符串数目。

示例：

**示例 1：**

- 输入：`s = "abcabc"`

- 输出：`10`

**示例 2：**

- 输入：`s = "aaacb"`

- 输出：`3`

**示例 3：**

- 输入：`s = "abc"`

- 输出：`1`

思路：
- 窗口越长，越容易同时包含 `a`、`b`、`c`。
- 当窗口已经包含三种字符时，持续移动 `left`，直到窗口不再合法。
- 内层循环结束后，最后一个被移出的左端点 `left - 1` 对应的窗口是合法的。
- 因此以 `right` 为右端点时，左端点在 `[0, left - 1]` 的子字符串都合法，贡献 `left`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;

    int ans = 0;
    int left = 0;
    int cnt[3]{};

    for (int right = 0; right < (int)s.size(); right++) {
        cnt[s[right] - 'a']++;

        while (cnt[0] && cnt[1] && cnt[2]) {
            cnt[s[left] - 'a']--;
            left++;
        }

        ans += left;
    }

    cout << ans << '\n';
    return 0;
}
```

# 恰好型滑动窗口

“恰好”等于某个值的滑动窗口题，常常可以转化为两个“至多”或两个“至少”的问题相减。

例如，计算元素和恰好等于 `k` 的子数组个数，可以转化为：
- 元素和至少为 `k` 的子数组个数。
- 元素和至少为 `k + 1` 的子数组个数。
- 答案是 `atLeast(k) - atLeast(k + 1)`。

也可以转化为：
- 元素和至多为 `k` 的子数组个数。
- 元素和至多为 `k - 1` 的子数组个数。
- 答案是 `atMost(k) - atMost(k - 1)`。

选择“至少”还是“至多”，取决于题目中哪个方向更容易维护窗口合法性。

# 常见坑

- 先判断题目是否要求连续子数组或连续子串。
- 定长窗口通常是“入、更新、出”。
- 不定长窗口要明确什么时候移动 `left`。
- 计数型题目要判断贡献是 `right - left + 1` 还是 `left`。
- 恰好型题目通常不要硬写复杂窗口，可以转成两个至多或两个至少。
