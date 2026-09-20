---
title: 146. LRU 缓存
date: 2026-09-07
lang: zh-cn
---

设计最近最少使用缓存 `LRUCache`：

- `LRUCache(capacity)`：使用正整数容量初始化缓存；
- `get(key)`：键存在时返回对应值，并把它标记为最近使用；否则返回 `-1`；
- `put(key, value)`：更新或插入键值，并把它标记为最近使用；插入后超过容量时，删除最久未使用的键。

`get` 和 `put` 都必须达到平均 $O(1)$ 时间复杂度。

[题目链接](https://leetcode.cn/problems/lru-cache/)

## 示例

- 输入：`["LRUCache","put","put","get","put","get","put","get","get","get"]`
- 参数：`[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]`
- 输出：`[null,null,null,1,null,-1,null,-1,3,4]`

执行过程：

| 操作 | 从最近到最久的缓存顺序 | 返回值 |
| --- | --- | --- |
| `put(1,1)` | `1` | — |
| `put(2,2)` | `2, 1` | — |
| `get(1)` | `1, 2` | `1` |
| `put(3,3)` | `3, 1`，淘汰 `2` | — |
| `get(2)` | `3, 1` | `-1` |
| `put(4,4)` | `4, 3`，淘汰 `1` | — |
| `get(1)` | `4, 3` | `-1` |
| `get(3)` | `3, 4` | `3` |
| `get(4)` | `4, 3` | `4` |

## 数据范围

- $1 \leq capacity \leq 3000$
- $0 \leq key \leq 10^4$
- $0 \leq value \leq 10^5$
- `get` 与 `put` 最多调用 $2\times10^5$ 次

## 为什么需要两种数据结构

哈希表可以在平均 $O(1)$ 时间内按键找到元素，但不能维护最近使用顺序。双向链表可以在已知节点位置时以 $O(1)$ 完成移动和删除，但不能按键快速定位。

组合二者：

- 双向链表从头到尾按“最近使用 → 最久未使用”排列；
- 哈希表保存 `key → 链表迭代器`；
- 访问元素时，用 `list::splice` 把已有节点移动到链表头；
- 超出容量时，链表尾就是要淘汰的元素。

```cpp
class LRUCache {
    int capacity;
    list<pair<int, int>> items;
    unordered_map<int, list<pair<int, int>>::iterator> positions;

    void touch(list<pair<int, int>>::iterator node) {
        items.splice(items.begin(), items, node);
    }

public:
    LRUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        auto found = positions.find(key);
        if (found == positions.end()) {
            return -1;
        }
        touch(found->second);
        return found->second->second;
    }

    void put(int key, int value) {
        auto found = positions.find(key);
        if (found != positions.end()) {
            found->second->second = value;
            touch(found->second);
            return;
        }

        items.emplace_front(key, value);
        positions[key] = items.begin();
        if (items.size() <= capacity) {
            return;
        }
        positions.erase(items.back().first);
        items.pop_back();
    }
};
```

`list::splice` 只重新连接链表节点，不复制元素，而且不会使该节点的迭代器失效，所以哈希表中的迭代器仍然有效。

## 正确性

链表头始终是最近一次被 `get` 或 `put` 成功访问的键，因为每次成功访问都会把对应节点移动到头部。未被访问的节点相对顺序不变，因此链表尾始终是最久未使用的键。插入导致超出容量时删除尾节点，恰好符合 LRU 淘汰规则。哈希表与链表在每次插入和删除时同步更新，所以按键查找结果始终与缓存内容一致。

## 复杂度

- `get`：平均时间复杂度 $O(1)$
- `put`：平均时间复杂度 $O(1)$
- 空间复杂度：$O(capacity)$

## 易错点

- `get` 成功也算一次使用，必须更新顺序。
- 更新已有键的值后也要把它移到最近使用位置。
- 淘汰节点时要同时从链表和哈希表中删除。
- 仅使用 `deque` 无法在已知键时以 $O(1)$ 删除中间元素；应使用 `list`。

## 参考

- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/lru-cache/solutions/)
