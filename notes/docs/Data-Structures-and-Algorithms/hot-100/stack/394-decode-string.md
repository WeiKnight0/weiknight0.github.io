---
title: 394. 字符串解码
date: 2026-09-07
lang: zh-cn
---

给定一个编码字符串 `s`，编码规则为 `k[encoded_string]`，表示方括号内的字符串重复 `k` 次。编码可以嵌套，返回完整的解码结果。

[题目链接](https://leetcode.cn/problems/decode-string/)

## 示例

### 示例 1

- 输入：`s = "3[a]2[bc]"`
- 输出：`"aaabcbc"`

### 示例 2

- 输入：`s = "3[a2[c]]"`
- 输出：`"accaccacc"`

### 示例 3

- 输入：`s = "2[abc]3[cd]ef"`
- 输出：`"abcabccdcdcdef"`

## 数据范围

- $1 \leq s.length \leq 30$
- `s` 由小写英文字母、数字和方括号组成
- 输入保证格式合法且没有多余空格
- 重复次数是 $[1,300]$ 内的正整数，可能包含多位数字
- 解码后字符串长度不超过 $10^5$

## 方法一：显式栈

遍历字符串时，`current` 保存当前层已经解码的内容，`repeat` 保存正在读取的重复次数。

遇到 `[` 时，外层内容和重复次数暂时不能完成计算，把二者一起压栈，然后从空字符串开始解析括号内层。遇到 `]` 时，当前层已经结束：弹出外层状态，将当前层重复指定次数后接到外层末尾。

以 `3[a2[c]]` 为例：

1. 读取 `3[`，保存外层 `("",3)`；
2. 读取 `a2[`，保存当前层 `("a",2)`；
3. 读取 `c]`，得到 `"a" + "cc" = "acc"`；
4. 再读取 `]`，得到 `"acc"` 重复三次。

```cpp
class Solution {
public:
    string decodeString(string s) {
        stack<pair<string, int>> states;
        string current;
        int repeat = 0;

        for (char c : s) {
            if (isdigit(c)) {
                repeat = repeat * 10 + c - '0';
            } else if (c == '[') {
                states.push({current, repeat});
                current.clear();
                repeat = 0;
            } else if (c == ']') {
                auto [prefix, count] = states.top();
                states.pop();
                string decoded;
                while (count--) {
                    decoded += current;
                }
                current = prefix + decoded;
            } else {
                current += c;
            }
        }
        return current;
    }
};
```

- 时间复杂度：$O(T)$，$T$ 为各层展开和拼接产生的字符总数；若最终长度为 $L$、嵌套深度为 $d$，最坏可达 $O(Ld)$
- 空间复杂度：$O(L+d)$，$d$ 为最大嵌套深度

## 方法二：递归解析

方括号天然形成递归结构。函数从当前位置开始解析，遇到 `]` 时返回当前层结果；调用者负责读取这一层之前的重复次数，并把返回结果重复拼接。

下标 `index` 按引用传递，所有递归层共同推进同一次扫描，不会重复解析原字符串。

```cpp
class Solution {
    string parse(const string& s, int& index) {
        string result;
        int n = s.size();
        while (index < n && s[index] != ']') {
            if (isalpha(s[index])) {
                result += s[index++];
                continue;
            }

            int repeat = 0;
            while (isdigit(s[index])) {
                repeat = repeat * 10 + s[index++] - '0';
            }
            index++;
            string inner = parse(s, index);
            index++;
            while (repeat--) {
                result += inner;
            }
        }
        return result;
    }

public:
    string decodeString(string s) {
        int index = 0;
        return parse(s, index);
    }
};
```

- 时间复杂度：$O(T)$，含义与显式栈方法相同
- 空间复杂度：$O(L+d)$，包括结果和递归栈

## 正确性

无论显式栈还是递归，每遇到一对最内层括号，都会先得到其中完整的解码字符串，再按照括号前的次数重复，并接回它所属的外层。最内层处理正确后，逐层向外合并，最终得到整个编码串的解码结果。

## 易错点

- 重复次数可能有多位，必须用 `repeat = repeat * 10 + digit` 连续读取。
- 进入新的一层后要清空当前字符串和重复次数。
- 字母可以出现在括号外，例如第三个示例末尾的 `ef`。
- 递归版本中，调用前越过 `[`，返回后越过对应的 `]`，两个位置不能混淆。

## 参考

- [项目现有栈、队列与双端队列笔记](../../data-structures/stack-queue-array/stack-queue-deque.md)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/decode-string/solutions/)
