---
title: "链表删除：哨兵节点"
category: "链表"
order: 95
problems:
  - "203. 移除链表元素"
  - "82. 删除排序链表中的重复元素 II"
keywords:
  - "链表"
  - "dummy"
  - "哨兵节点"
  - "删除节点"
tags:
  - "dummy"
  - "删除节点"
  - "链表"
---

```cpp
ListNode* removeElements(ListNode* head, int val) {
    ListNode dummy(0, head);
    ListNode* cur = &dummy;
    while (cur->next) {
        if (cur->next->val == val) {
            cur->next = cur->next->next;
        } else {
            cur = cur->next;
        }
    }
    return dummy.next;
}
```
