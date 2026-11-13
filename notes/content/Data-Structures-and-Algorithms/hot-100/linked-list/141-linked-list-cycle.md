---
title: 141. 环形链表
date: 2026-09-07
lang: zh-cn
---

给定单链表头节点 `head`，判断链表中是否存在环。若沿 `next` 指针不断前进能够再次到达已经访问过的节点，则链表有环。评测参数 `pos` 表示尾节点连接到的下标，不会传入函数。

[题目链接](https://leetcode.cn/problems/linked-list-cycle/)

## 示例

### 示例 1

- 输入：`head = [3,2,0,-4], pos = 1`
- 输出：`true`
- 解释：尾节点连接到下标 `1` 的节点。

### 示例 2

- 输入：`head = [1,2], pos = 0`
- 输出：`true`

### 示例 3

- 输入：`head = [1], pos = -1`
- 输出：`false`

## 数据范围

- 链表节点数为 $[0,10^4]$
- $-10^5 \leq Node.val \leq 10^5$
- `pos` 为 `-1` 或链表中的合法下标

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：记录访问过的节点

遍历链表并保存节点地址。若再次遇到相同地址，说明存在环；若到达 `nullptr`，说明无环。

```cpp
class Solution {
public:
    bool hasCycle(ListNode* head) {
        unordered_set<ListNode*> visited;
        while (head) {
            if (visited.count(head)) {
                return true;
            }
            visited.insert(head);
            head = head->next;
        }
        return false;
    }
};
```

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$

## 方法二：Floyd 快慢指针

`slow` 每轮走一步，`fast` 每轮走两步：

- 无环时，`fast` 会先到达链表末尾；
- 有环时，两个指针进入环后，`fast` 每轮相对 `slow` 前进一步，最终一定相遇。

```cpp
class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                return true;
            }
        }
        return false;
    }
};
```

环长有限。两个指针都进入环后，它们的环内距离每轮减少一，因此至多再经过一个环长就会相遇。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 易错点

- 判断的是节点地址是否重复，不是节点值是否重复。
- `fast` 每次访问 `fast->next->next`，循环条件必须先保证 `fast` 和 `fast->next` 存在。
- `pos` 仅用于描述测试数据，不是函数参数。
- 不应通过修改节点或断链来留下访问标记。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/linked-list-cycle/solutions/)
