---
title: 234. 回文链表
date: 2026-09-07
lang: zh-cn
---

给定单链表头节点 `head`，判断从头到尾的节点值序列是否为回文。

[题目链接](https://leetcode.cn/problems/palindrome-linked-list/)

## 示例

### 示例 1

- 输入：`head = [1,2,2,1]`
- 输出：`true`

### 示例 2

- 输入：`head = [1,2]`
- 输出：`false`

## 数据范围

- 链表节点数为 $[1,10^5]$
- $0 \leq Node.val \leq 9$

## 方法一：复制到数组

链表不能向前访问。把节点值复制到数组后，使用首尾双指针比较。

```cpp
class Solution {
public:
    bool isPalindrome(ListNode* head) {
        vector<int> values;
        for (ListNode* node = head; node; node = node->next) {
            values.push_back(node->val);
        }
        for (int left = 0, right = values.size() - 1; left < right; left++, right--) {
            if (values[left] != values[right]) {
                return false;
            }
        }
        return true;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

## 方法二：反转后半段

使用快慢指针寻找前半段末尾：`slow` 每次走一步，`fast` 每次走两步。当 `fast` 无法再走两步时，`slow` 位于前半段最后一个节点。

反转 `slow->next` 开始的后半段，再从链表头和反转后的头部同时向后比较。奇数长度链表的中间节点无需参与比较。

```cpp
class Solution {
    ListNode* reverse(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* next = head->next;
            head->next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }

public:
    bool isPalindrome(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }

        ListNode* second = reverse(slow->next);
        ListNode* right = second;
        ListNode* left = head;
        bool answer = true;
        while (right) {
            if (left->val != right->val) {
                answer = false;
                break;
            }
            left = left->next;
            right = right->next;
        }
        slow->next = reverse(second);
        return answer;
    }
};
```

比较完成后再次反转后半段，将链表恢复为输入时的结构。题目没有强制恢复，但调用者通常不会预期一个判定函数永久修改输入链表。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 正确性

快慢指针把链表分成长度相同的左右两部分；奇数长度时忽略正中间节点。后半段反转后，其访问顺序正好对应原链表从尾到中间的顺序。逐项比较前半段与反转后的后半段，全部相等当且仅当原值序列回文。

## 易错点

- 奇数长度链表的中间节点不影响回文性。
- 寻找前半段末尾时循环条件需要同时检查 `fast->next` 和 `fast->next->next`。
- 反转后半段会修改链表；若需要保持输入结构，应在返回前恢复。
- 比较次数由后半段长度决定，不能要求两个遍历指针同时为空。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/palindrome-linked-list/solutions/)
