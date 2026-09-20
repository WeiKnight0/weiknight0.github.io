---
title: 24. 两两交换链表中的节点
date: 2026-09-07
lang: zh-cn
---

给定单链表，每两个相邻节点交换一次，返回交换后的头节点。不能只交换节点中的值，必须改变节点连接关系。

[题目链接](https://leetcode.cn/problems/swap-nodes-in-pairs/)

## 示例

### 示例 1

- 输入：`head = [1,2,3,4]`
- 输出：`[2,1,4,3]`

### 示例 2

- 输入：`head = []`
- 输出：`[]`

### 示例 3

- 输入：`head = [1]`
- 输出：`[1]`

### 示例 4

- 输入：`head = [1,2,3]`
- 输出：`[2,1,3]`

## 数据范围

- 链表节点数为 $[0,100]$
- $0 \leq Node.val \leq 100$

## 方法一：迭代交换

`prev` 指向当前一对节点的前驱，`first` 和 `second` 是待交换节点。原连接：

```text
prev → first → second → next
```

改为：

```text
prev → second → first → next
```

随后 `first` 成为这一对的尾节点，也是下一对的前驱。

```cpp
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* prev = &dummy;

        while (prev->next && prev->next->next) {
            ListNode* first = prev->next;
            ListNode* second = first->next;
            first->next = second->next;
            second->next = first;
            prev->next = second;
            prev = first;
        }
        return dummy.next;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 方法二：递归交换

若当前不足两个节点，保持原样。否则先保存第二个节点，递归处理第三个节点开始的剩余链表，再把前两个节点交换。

```cpp
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        if (!head || !head->next) {
            return head;
        }
        ListNode* second = head->next;
        head->next = swapPairs(second->next);
        second->next = head;
        return second;
    }
};
```

递归返回的链表已经完成后续所有交换。把当前两个节点交换并接在它前面后，整个当前链表也完成交换。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$，来自递归调用栈

## 易错点

- 题目禁止只交换 `val`，必须交换节点。
- 改写连接前要保存这一对之后的链表，避免断链。
- 节点数为奇数时，最后一个节点保持不变。
- 每轮后 `prev` 应移动到交换后的第二个位置，即原来的 `first`。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/swap-nodes-in-pairs/solutions/)
