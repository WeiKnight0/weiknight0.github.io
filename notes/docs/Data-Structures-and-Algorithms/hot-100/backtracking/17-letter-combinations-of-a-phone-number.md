---
title: 17. 电话号码的字母组合
date: 2026-09-07
lang: zh-cn
---

给定仅包含数字 `2` 到 `9` 的字符串 `digits`，按照电话按键上的数字与字母映射，返回所有可能的字母组合。答案顺序不限。

```text
2: abc    3: def
4: ghi    5: jkl    6: mno
7: pqrs   8: tuv    9: wxyz
```

[题目链接](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/)

## 示例

### 示例 1

- 输入：`digits = "23"`
- 输出：`["ad","ae","af","bd","be","bf","cd","ce","cf"]`

### 示例 2

- 输入：`digits = ""`
- 输出：`[]`

### 示例 3

- 输入：`digits = "2"`
- 输出：`["a","b","c"]`

## 数据范围

- $0 \leq digits.length \leq 4$
- `digits[i]` 为 `'2'` 到 `'9'` 中的一个数字

## 回溯三要素

- **路径**：已经为前若干个数字选择的字母；
- **选择列表**：当前位置数字所对应的全部字母；
- **结束条件**：已经处理完 `digits` 中所有位置。

第 `index` 层只能选择 `digits[index]` 对应的字母。与全排列不同，选择过的字母无需标记，因为每层代表不同的数字位置。

```cpp
class Solution {
    const array<string, 10> letters = {
        "", "", "abc", "def", "ghi",
        "jkl", "mno", "pqrs", "tuv", "wxyz"
    };
    vector<string> answer;
    string path;

    void dfs(const string& digits, int index) {
        if (index == digits.size()) {
            answer.push_back(path);
            return;
        }
        for (char letter : letters[digits[index] - '0']) {
            path.push_back(letter);
            dfs(digits, index + 1);
            path.pop_back();
        }
    }

public:
    vector<string> letterCombinations(string digits) {
        answer.clear();
        path.clear();
        if (digits.empty()) {
            return answer;
        }
        dfs(digits, 0);
        return answer;
    }
};
```

以 `"23"` 为例，第一层依次选择 `a、b、c`，每个选择进入第二层后再依次选择 `d、e、f`，形成 $3\times3=9$ 个组合。

## 正确性

每层恰好处理一个数字并从它对应的字母集合中选择一个字符。到达结束条件时，路径长度等于数字数量，且每个位置都符合按键映射，所以路径是合法组合。所有位置的所有字母都被循环枚举，因此不会漏解；每条不同的选择序列对应唯一字符串，因此不会重复。

## 复杂度

设输入中有 $a$ 个数字对应 `3` 个字母，$b$ 个数字对应 `4` 个字母：

- 组合数量为 $3^a4^b$；
- 时间复杂度：$O((a+b)3^a4^b)$，包含复制每个字符串的开销；
- 空间复杂度：$O(a+b)$，不计算返回结果。

## 易错点

- 空字符串的答案是 `[]`，不是包含空字符串的 `[""]`。
- 数字字符转下标应使用 `digits[index] - '0'`。
- `7` 和 `9` 各对应四个字母，不能假设每个数字都只有三个选择。
- 每次递归返回后要删除刚加入的字符。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/solutions/)
