---
title: Heap 堆
date: 2026-07-10
lang: zh-cn
---

# Heap 堆

堆是一棵满足堆序性质的完全二叉树，通常用数组实现。

常见堆：
- 大根堆：每个节点都大于等于它的子节点，堆顶是最大值。
- 小根堆：每个节点都小于等于它的子节点，堆顶是最小值。

堆常用于实现优先队列（Priority Queue）。优先队列关注“每次取出优先级最高的元素”，堆是实现它的一种常见数据结构。

# 数组下标关系

下面使用 0-indexed 数组：

| 节点 | 下标 |
| --- | --- |
| 父节点 | `(i - 1) / 2` |
| 左子节点 | `2 * i + 1` |
| 右子节点 | `2 * i + 2` |

完全二叉树保证数组中没有空洞，因此可以直接用下标表示父子关系。

# 基本操作复杂度

| 操作 | 复杂度 |
| --- | --- |
| 查看堆顶 | $O(1)$ |
| 插入元素 | $O(\log n)$ |
| 删除堆顶 | $O(\log n)$ |
| 建堆 | $O(n)$ |

# 小根堆手写实现

下面用 `vector<int>` 实现一个小根堆。小根堆的堆顶是当前最小值。

## 插入元素

插入元素时，先把新元素放到数组末尾。此时只有这个新元素可能破坏堆的性质，所以让它不断和父节点比较：如果它比父节点小，就和父节点交换，直到到达根节点，或者父节点已经不大于它。

```cpp
void push(vector<int>& heap, int x) {
    heap.push_back(x);
    int i = heap.size() - 1;

    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent] <= heap[i]) {
            break;
        }
        swap(heap[parent], heap[i]);
        i = parent;
    }
}
```

## 删除堆顶

删除堆顶时，先用最后一个元素覆盖堆顶，再删除最后一个元素。此时只有根节点可能破坏堆的性质，所以从根节点开始向下调整：每次找到左右子节点中更小的那个，如果它比当前节点小，就交换。

```cpp
void pop(vector<int>& heap) {
    if (heap.empty()) {
        return;
    }

    heap[0] = heap.back();
    heap.pop_back();

    int i = 0;
    int n = heap.size();
    while (true) {
        int left = i * 2 + 1;
        int right = i * 2 + 2;
        int smallest = i;

        if (left < n && heap[left] < heap[smallest]) {
            smallest = left;
        }
        if (right < n && heap[right] < heap[smallest]) {
            smallest = right;
        }
        if (smallest == i) {
            break;
        }
        swap(heap[i], heap[smallest]);
        i = smallest;
    }
}
```

## 查看堆顶

```cpp
int top(const vector<int>& heap) {
    return heap[0];
}
```

## 完整实现

```cpp
class MinHeap {
private:
    vector<int> heap;

public:
    void push(int x) {
        heap.push_back(x);
        int i = heap.size() - 1;

        while (i > 0) {
            int parent = (i - 1) / 2;
            if (heap[parent] <= heap[i]) {
                break;
            }
            swap(heap[parent], heap[i]);
            i = parent;
        }
    }

    void pop() {
        if (heap.empty()) {
            return;
        }

        heap[0] = heap.back();
        heap.pop_back();

        int i = 0;
        int n = heap.size();
        while (true) {
            int left = i * 2 + 1;
            int right = i * 2 + 2;
            int smallest = i;

            if (left < n && heap[left] < heap[smallest]) {
                smallest = left;
            }
            if (right < n && heap[right] < heap[smallest]) {
                smallest = right;
            }
            if (smallest == i) {
                break;
            }
            swap(heap[i], heap[smallest]);
            i = smallest;
        }
    }

    int top() const {
        return heap[0];
    }

    bool empty() const {
        return heap.empty();
    }

    int size() const {
        return heap.size();
    }
};
```

# 建堆

如果从空堆开始逐个插入，复杂度是 $O(n \log n)$。更好的方法是从最后一个非叶子节点开始向前下沉，整体复杂度是 $O(n)$。

```cpp
void heapify(vector<int>& heap) {
    auto down = [&](int i) {
        int n = heap.size();
        while (true) {
            int left = i * 2 + 1;
            int right = i * 2 + 2;
            int smallest = i;

            if (left < n && heap[left] < heap[smallest]) {
                smallest = left;
            }
            if (right < n && heap[right] < heap[smallest]) {
                smallest = right;
            }
            if (smallest == i) {
                break;
            }
            swap(heap[i], heap[smallest]);
            i = smallest;
        }
    };

    for (int i = heap.size() / 2 - 1; i >= 0; i--) {
        down(i);
    }
}
```

最后一个非叶子节点是 `n / 2 - 1`。

# 优先队列和堆的关系

堆是一种具体的数据结构，优先队列是一种抽象数据类型。优先队列要求能够快速取出优先级最高的元素，而堆正好可以在 $O(1)$ 时间查看堆顶，并在 $O(\log n)$ 时间插入或删除堆顶。

C++ 的 `priority_queue` 默认是大根堆；Python 的 `heapq` 和 Java 的 `PriorityQueue` 默认是小根堆。具体库函数见语言库速查。

# 常见坑

- C++ `priority_queue` 默认是大根堆。
- Python `heapq` 默认是小根堆。
- Java `PriorityQueue` 默认是小根堆。
- 删除堆顶时，先用最后一个元素覆盖堆顶，再删除最后一个元素，最后下沉。
- `pop` 通常不返回值的语言或库里，要先取 `top` / `peek`。
- 堆只能快速拿到最值，不能快速查找任意元素。

# 常见题型

- Top K 问题
- 合并 K 个有序链表
- 数据流中的中位数
- 任务调度
- Dijkstra 最短路
- 带优先级的 BFS

# 语言库速查

- [C++ STL](../basics/cpp-stl)
- [Python Library](../basics/python-library)
- [Java Library](../basics/java-library)
