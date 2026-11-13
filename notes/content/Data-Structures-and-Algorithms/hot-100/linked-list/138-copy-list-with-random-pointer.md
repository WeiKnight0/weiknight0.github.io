---
title: 138. 随机链表的复制
date: 2026-09-07
lang: zh-cn
---

链表节点除 `next` 外还有 `random` 指针，它可以指向链表中的任意节点或 `nullptr`。构造链表的深拷贝：复制链表的节点值和连接关系与原链表一致，但所有节点均为新节点，任何指针都不能指回原链表。

[题目链接](https://leetcode.cn/problems/copy-list-with-random-pointer/)

## 输入表示

示例用 `[val, random_index]` 描述节点，其中 `random_index` 是随机指针指向的节点下标，`null` 表示空指针。

### 示例 1

- 输入：`head = [[7,null],[13,0],[11,4],[10,2],[1,0]]`
- 输出：`[[7,null],[13,0],[11,4],[10,2],[1,0]]`

### 示例 2

- 输入：`head = [[1,1],[2,1]]`
- 输出：`[[1,1],[2,1]]`

### 示例 3

- 输入：`head = [[3,null],[3,0],[3,null]]`
- 输出：`[[3,null],[3,0],[3,null]]`

输出表示相同不代表复用原节点；评测会检查复制节点与原节点的地址不同。

## 数据范围

- 链表节点数为 $[0,1000]$
- $-10^4 \leq Node.val \leq 10^4$
- `random` 为 `nullptr` 或指向链表中的某个节点

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：哈希表映射

建立映射 `copies[原节点] = 复制节点`：

1. 第一次遍历为每个原节点创建复制节点；
2. 第二次遍历通过映射设置复制节点的 `next` 和 `random`。

必须先创建完所有节点，因为某个 `random` 可以指向尚未遍历到的节点。

```cpp
class Solution {
public:
    Node* copyRandomList(Node* head) {
        unordered_map<Node*, Node*> copies;
        for (Node* node = head; node; node = node->next) {
            copies[node] = new Node(node->val);
        }
        for (Node* node = head; node; node = node->next) {
            copies[node]->next = node->next ? copies[node->next] : nullptr;
            copies[node]->random = node->random ? copies[node->random] : nullptr;
        }
        return head ? copies[head] : nullptr;
    }
};
```

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$，不计算返回链表

## 方法二：复制节点穿插在原节点后

若复制节点紧跟在对应原节点之后，则原节点 `node` 的复制节点就是 `node->next`，原随机目标 `node->random` 的复制节点就是 `node->random->next`。这样可以用链表位置关系代替哈希映射。

### 第一步：穿插复制节点

```text
A → B → C
A → A' → B → B' → C → C'
```

### 第二步：设置随机指针

若 `A.random = C`，则 `A'.random = C'`，也就是：

即 `node->next->random = node->random->next`。

### 第三步：拆分两条链表

恢复原链表的 `next`，并把所有复制节点连接成新链表。

```cpp
class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (!head) {
            return nullptr;
        }

        for (Node* node = head; node;) {
            Node* copy = new Node(node->val);
            copy->next = node->next;
            node->next = copy;
            node = copy->next;
        }
        for (Node* node = head; node; node = node->next->next) {
            if (node->random) {
                node->next->random = node->random->next;
            }
        }

        Node* copiedHead = head->next;
        for (Node* node = head; node;) {
            Node* copy = node->next;
            node->next = copy->next;
            copy->next = copy->next ? copy->next->next : nullptr;
            node = node->next;
        }
        return copiedHead;
    }
};
```

拆分后原链表恢复原状。每个复制节点的 `next` 和 `random` 都只指向复制节点，满足深拷贝要求。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$，不计算新链表节点

## 易错点

- 深拷贝不能让新链表的 `next` 或 `random` 指向原节点。
- 节点值可能重复，不能用 `val` 作为原节点到复制节点的映射键。
- 穿插法设置 `random` 时，目标复制节点是 `node->random->next`。
- 拆分时要同时恢复原链表并连接复制链表，不能只取出奇数位置的节点。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/copy-list-with-random-pointer/solutions/)
