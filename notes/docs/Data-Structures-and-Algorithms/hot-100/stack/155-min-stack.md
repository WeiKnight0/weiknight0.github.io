---
title: 155. 最小栈
date: 2026-09-07
lang: zh-cn
---

设计一个栈，支持 `push`、`pop`、`top`，并能通过 `getMin` 在常数时间内得到当前栈中的最小元素。所有操作都必须为 $O(1)$。

[题目链接](https://leetcode.cn/problems/min-stack/)

## 示例

- 输入：

  ```text
  ["MinStack","push","push","push","getMin","pop","top","getMin"]
  [[],[-2],[0],[-3],[],[],[],[]]
  ```

- 输出：

  ```text
  [null,null,null,null,-3,null,0,-2]
  ```

- 解释：依次压入 `-2、0、-3` 后最小值为 `-3`；弹出 `-3` 后，栈顶为 `0`，最小值恢复为 `-2`

## 数据范围

- $-2^{31} \leq val \leq 2^{31}-1$
- `pop`、`top` 和 `getMin` 只会在非空栈上调用
- 所有方法最多调用 $3\times 10^4$ 次

## 为每一层保存最小值

只用一个变量保存最小值时，最小元素被弹出后无法知道此前的次小值。解决方法是让每个栈元素同时保存：

- 当前压入的值；
- 从栈底到当前层的最小值。

压入 `value` 时，新最小值是 `min(value, stack.top().second)`。弹栈后，新的栈顶自然带有上一层的最小值。

```cpp
class MinStack {
    stack<pair<int, int>> values;

public:
    MinStack() = default;

    void push(int value) {
        int currentMin = values.empty() ? value : min(value, values.top().second);
        values.push({value, currentMin});
    }

    void pop() {
        values.pop();
    }

    int top() {
        return values.top().first;
    }

    int getMin() {
        return values.top().second;
    }
};
```

每一层保存的第二个值等于该层及其下方所有元素的最小值。`push` 保持这个性质，`pop` 只是删除最上层，不会改变下面已有的记录。因此 `getMin` 直接读取栈顶记录，始终得到当前栈的最小元素。

- `push`、`pop`、`top`、`getMin` 的时间复杂度：$O(1)$
- 空间复杂度：$O(n)$

## 易错点

- 新值等于当前最小值时也要把相同最小值记录到新层，否则弹出重复最小值时会丢失状态。
- 不能在 `getMin` 中临时遍历栈，这会使操作退化为 $O(n)$。
- 题目保证查询和弹出时栈非空，类内部无需再返回一个伪造的默认值。

## 参考

- [项目现有栈、队列与双端队列笔记](../../data-structures/stack-queue-array/stack-queue-deque.md)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/min-stack/solutions/)
