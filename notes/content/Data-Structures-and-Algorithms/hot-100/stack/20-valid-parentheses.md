---
title: 20. 有效的括号
date: 2026-09-07
lang: zh-cn
---

给定一个只含 `()`、`[]`、`{}` 六种括号字符的字符串 `s`，判断它是否有效。有效字符串要求每个右括号都与同类型的左括号配对，并且括号按正确的嵌套顺序闭合。

[题目链接](https://leetcode.cn/problems/valid-parentheses/)

## 示例

### 示例 1

- 输入：`s = "()"`
- 输出：`true`

### 示例 2

- 输入：`s = "()[]{}"`
- 输出：`true`

### 示例 3

- 输入：`s = "(]"`
- 输出：`false`

### 示例 4

- 输入：`s = "([])"`
- 输出：`true`

### 示例 5

- 输入：`s = "([)]"`
- 输出：`false`

## 数据范围

- $1 \leq s.length \leq 10^4$
- `s` 仅由 `()[]{}` 组成

<details class="note-solution">
<summary>查看解析</summary>

## 保存尚未匹配的右括号

括号必须按照“后打开的先关闭”的顺序配对，正好符合栈的后进先出性质。

遇到左括号时，不必保存左括号本身，可以把它期待的右括号压栈。遇到右括号时，它必须等于栈顶：

- 栈为空，说明没有对应的左括号；
- 当前字符不等于栈顶，说明括号类型或嵌套顺序错误；
- 相等时弹出栈顶，表示这一对已经闭合。

扫描结束后，栈还必须为空，否则仍有左括号没有闭合。

```cpp
class Solution {
public:
    bool isValid(string s) {
        stack<char> expected;
        for (char c : s) {
            if (c == '(') {
                expected.push(')');
            } else if (c == '[') {
                expected.push(']');
            } else if (c == '{') {
                expected.push('}');
            } else {
                if (expected.empty() || expected.top() != c) {
                    return false;
                }
                expected.pop();
            }
        }
        return expected.empty();
    }
};
```

栈从底到顶保存所有尚未闭合的左括号所期待的右括号。每次读取右括号时，只允许它闭合最近打开的左括号，因此通过检查的每一对括号类型和顺序都正确。最后栈为空，说明没有未闭合括号，所以字符串有效。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

## 易错点

- 读取栈顶前必须先判断栈是否为空，字符串可能以右括号开头。
- 不能只统计三类括号数量；`"([)]"` 的数量相等，但嵌套顺序错误。
- 扫描结束后仍需检查栈是否为空，`"(("` 在扫描过程中不会发生匹配失败。

</details>

## 参考

- [项目现有栈、队列与双端队列笔记](../../data-structures/stack-queue-array/stack-queue-deque.md)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/valid-parentheses/solutions/)
