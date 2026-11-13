---
title: 49. Group Anagrams 字母异位词分组
date: 2026-09-07
lang: zh-cn
tags:
  - Hot 100
  - Hash Table
  - String
  - Sorting
---

题目来源：[49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

题解参考：[力扣官方题解](https://leetcode.cn/problems/group-anagrams/solutions/520131/zi-mu-yi-wei-ci-fen-zu-by-leetcode-solution/)。未找到可公开访问的灵神独立题解，本题按约定使用官方题解补充。

# 题目

给定字符串数组 `strs`，把互为字母异位词的字符串放进同一组，并返回所有分组。分组之间以及同组字符串之间的顺序都不作要求。

字母异位词使用完全相同的字符，并且每种字符的出现次数也相同，只是排列顺序可能不同。例如 `"eat"`、`"tea"` 和 `"ate"` 互为字母异位词，`"tan"` 不属于这一组。

数据范围：

- `1 <= strs.length <= 10^4`
- `0 <= strs[i].length <= 100`
- 字符串只包含小写英文字母

**示例 1：**

- 输入：`strs = ["eat","tea","tan","ate","nat","bat"]`
- 输出：`[["bat"],["nat","tan"],["ate","eat","tea"]]`
- 解释：`eat、tea、ate` 的字符组成相同，`tan、nat` 的字符组成相同，`bat` 单独成组。输出中各组的顺序可以不同。

**示例 2：**

- 输入：`strs = [""]`
- 输出：`[[""]]`

**示例 3：**

- 输入：`strs = ["a"]`
- 输出：`[["a"]]`

<details class="note-solution">
<summary>查看解析</summary>

# 解法一：排序后的字符串作为键

## 思路

两个字符串互为字母异位词，当且仅当把它们的字符排序后得到相同字符串。因此可以把排序结果作为哈希表的键，把原字符串加入对应的数组。

例如：

| 原字符串 | 排序后的键 |
| --- | --- |
| `eat` | `aet` |
| `tea` | `aet` |
| `tan` | `ant` |
| `ate` | `aet` |

前三个键为 `aet` 的字符串会自然进入同一组，不需要逐组比较。

## 算法步骤

1. 遍历每个字符串 `s`。
2. 复制 `s` 得到 `key`，对 `key` 的字符排序。
3. 执行 `groups[key].push_back(s)`。
4. 遍历哈希表，把每个键对应的字符串数组放入答案。

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            groups[key].push_back(s);
        }

        vector<vector<string>> ans;
        ans.reserve(groups.size());
        for (auto& [key, group] : groups) {
            ans.push_back(move(group));
        }
        return ans;
    }
};
```

## 正确性

同一组字母异位词包含的字符及其次数相同，排序后必然得到相同的键，所以它们会进入同一个哈希表项。不是字母异位词的两个字符串至少有一种字符或出现次数不同，排序结果也不同，因此不会被错误地分到同一组。

## 复杂度

设所有字符串的字符总数为 $S$，最长字符串长度为 $L$。对每个字符串排序，时间复杂度为 $O(S\log L)$；哈希表、键和返回结果共占用 $O(S)$ 空间。

# 解法二：字符计数作为键

## 思路

题目限定字符串只包含 26 个小写字母。可以统计每个字母的出现次数，用长度为 26 的计数向量表示字符串，而不必对字符排序。

`"eat"` 和 `"tea"` 的计数都满足 `a、e、t` 各出现一次，其余字母出现零次，因此得到相同的键。

C++ 的 `unordered_map` 不能直接使用 `array<int, 26>` 作为键。这里把 26 个计数依次编码为字符串，并在每个数字前加入 `#` 分隔符。分隔符不能省略，否则计数 `[1, 11]` 与 `[11, 1]` 都可能拼成 `"111"`，产生错误分组。

## 算法步骤

1. 对当前字符串统计 26 个字母的出现次数。
2. 按字母顺序把计数编码成唯一字符串键。
3. 使用该键把原字符串加入对应分组。
4. 最后收集哈希表中的所有分组。

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& s : strs) {
            array<int, 26> count{};
            for (char c : s) count[c - 'a']++;

            string key;
            for (int frequency : count) {
                key += '#';
                key += to_string(frequency);
            }
            groups[key].push_back(s);
        }

        vector<vector<string>> ans;
        ans.reserve(groups.size());
        for (auto& [key, group] : groups) {
            ans.push_back(move(group));
        }
        return ans;
    }
};
```

## 正确性

计数键完整记录了每个小写字母的出现次数。两个字符串的键相同，当且仅当 26 个字母的出现次数逐项相同，这正是互为字母异位词的充要条件。因此算法得到的每一组恰好是一组字母异位词。

## 复杂度

设所有字符串的字符总数为 $S$，字符串数量为 $n$。统计字符需要 $O(S)$ 时间，为每个字符串编码 26 个计数需要 $O(26n)$ 时间，因此总时间复杂度为 $O(S+26n)$，通常写作 $O(S)$。空间复杂度为 $O(S+26n)$，通常写作 $O(S)$。

# 方法选择与易错点

- 排序键写法最短，也适用于字符集不固定的情况；计数键利用了只有 26 个小写字母的限制，理论时间复杂度更优。
- 空字符串的排序键为空串，计数键为 26 个零，两种方法都能正常分组。
- 返回顺序不固定，不能用分组顺序判断答案错误。
- 计数编码必须保留每个位置的边界，不能直接连接十进制数字。
- 哈希表中保存的应当是原字符串，而不是排序后的键。

</details>
