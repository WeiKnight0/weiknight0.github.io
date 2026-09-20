---
title: 142. 环形链表 II
date: 2026-09-07
lang: zh-cn
---

给定单链表头节点 `head`。若链表有环，返回开始入环的第一个节点；否则返回 `nullptr`。不能修改链表。

[题目链接](https://leetcode.cn/problems/linked-list-cycle-ii/)

## 示例

### 示例 1

- 输入：`head = [3,2,0,-4], pos = 1`
- 输出：下标 `1` 的节点
- 解释：尾节点连接到第二个节点，环入口的值为 `2`。

### 示例 2

- 输入：`head = [1,2], pos = 0`
- 输出：下标 `0` 的节点

### 示例 3

- 输入：`head = [1], pos = -1`
- 输出：`nullptr`

## 数据范围

- 链表节点数为 $[0,10^4]$
- $-10^5 \leq Node.val \leq 10^5$
- `pos` 为 `-1` 或链表中的合法下标

## 方法一：哈希集合

第一个被再次访问的节点就是环入口。

```cpp
class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        unordered_set<ListNode*> visited;
        while (head) {
            if (visited.count(head)) {
                return head;
            }
            visited.insert(head);
            head = head->next;
        }
        return nullptr;
    }
};
```

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$

## 方法二：Floyd 判环并定位入口

第一阶段用快慢指针找到环内相遇点。相遇后，把一个指针放回链表头；两个指针改为每次各走一步，再次相遇的位置就是环入口。

```cpp
class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow != fast) {
                continue;
            }

            ListNode* fromHead = head;
            while (fromHead != slow) {
                fromHead = fromHead->next;
                slow = slow->next;
            }
            return fromHead;
        }
        return nullptr;
    }
};
```

## 为什么第二次相遇是入口

设头节点到环入口的距离为 $a$，入口到第一次相遇点的距离为 $b$，环长为 $c$。第一次相遇时：

- 慢指针走过 $a+b$；
- 快指针走过慢指针的两倍，并比慢指针多走若干整圈。

因此存在正整数 $k$，满足：

$$
2(a+b)=a+b+kc
$$

整理得：

$$
a=(k-1)c+(c-b)
$$

从相遇点继续走到入口需要 $c-b$ 步；再多走整圈仍回到入口。因此，从头节点走 $a$ 步与从相遇点走 $a$ 步会同时到达环入口。

## 复杂度

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 易错点

- 第一次相遇点通常不是环入口。
- 第二阶段两个指针都必须每次走一步。
- 无环时快指针会到达 `nullptr`，应直接返回 `nullptr`。
- `pos` 不会传入函数，不能依赖它寻找入口。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/linked-list-cycle-ii/solutions/)
