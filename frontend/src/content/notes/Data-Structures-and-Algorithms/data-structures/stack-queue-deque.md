---
title: Stack, Queue, Deque 栈、队列、双端队列
date: 2026-07-10
lang: zh-cn
---

# Stack 栈

栈是后进先出（LIFO, Last In First Out）的线性数据结构。

常用操作：
- `push`：把元素加入栈顶
- `pop`：删除栈顶元素
- `top` / `peek`：查看栈顶元素
- `empty`：判断是否为空

所有基本操作通常都是 $O(1)$。

## 顺序栈

顺序栈用数组保存元素，用 `topIndex` 表示栈顶位置。

```cpp
class ArrayStack {
private:
    vector<int> data;

public:
    void push(int x) {
        data.push_back(x);
    }

    void pop() {
        if (!data.empty()) {
            data.pop_back();
        }
    }

    int top() const {
        return data.back();
    }

    bool empty() const {
        return data.empty();
    }

    int size() const {
        return data.size();
    }
};
```

## 链式栈

链式栈用链表头部作为栈顶，入栈和出栈都只改头指针。

```cpp
struct Node {
    int val;
    Node* next;

    Node(int val, Node* next = nullptr) : val(val), next(next) {}
};

class LinkedStack {
private:
    Node* head = nullptr;
    int count = 0;

public:
    void push(int x) {
        head = new Node(x, head);
        count++;
    }

    void pop() {
        if (head == nullptr) {
            return;
        }
        Node* oldHead = head;
        head = head->next;
        delete oldHead;
        count--;
    }

    int top() const {
        return head->val;
    }

    bool empty() const {
        return head == nullptr;
    }

    int size() const {
        return count;
    }
};
```

## 常见题型

- 括号匹配
- 表达式求值
- 单调栈
- DFS 的非递归写法
- 撤销操作、路径回退

# Queue 队列

队列是先进先出（FIFO, First In First Out）的线性数据结构。

常用操作：
- `push` / `enqueue`：把元素加入队尾
- `pop` / `dequeue`：删除队首元素
- `front`：查看队首元素
- `back`：查看队尾元素
- `empty`：判断是否为空

所有基本操作通常都是 $O(1)$。

## 循环队列

普通数组队列如果只让尾指针右移，会浪费已经出队的位置。循环队列用取模复用空间。

下面的实现使用一个额外空位区分队空和队满：
- 队空：`head == tail`
- 队满：`(tail + 1) % capacity == head`

```cpp
class CircularQueue {
private:
    vector<int> data;
    int head = 0;
    int tail = 0;
    int capacity;

public:
    CircularQueue(int k) : data(k + 1), capacity(k + 1) {}

    bool push(int x) {
        if ((tail + 1) % capacity == head) {
            return false;
        }
        data[tail] = x;
        tail = (tail + 1) % capacity;
        return true;
    }

    bool pop() {
        if (empty()) {
            return false;
        }
        head = (head + 1) % capacity;
        return true;
    }

    int front() const {
        return data[head];
    }

    bool empty() const {
        return head == tail;
    }
};
```

## 链式队列

链式队列同时维护头指针和尾指针。入队改尾部，出队改头部。

```cpp
struct QueueNode {
    int val;
    QueueNode* next;

    QueueNode(int val) : val(val), next(nullptr) {}
};

class LinkedQueue {
private:
    QueueNode* head = nullptr;
    QueueNode* tail = nullptr;
    int count = 0;

public:
    void push(int x) {
        QueueNode* node = new QueueNode(x);
        if (tail == nullptr) {
            head = tail = node;
        } else {
            tail->next = node;
            tail = node;
        }
        count++;
    }

    void pop() {
        if (head == nullptr) {
            return;
        }
        QueueNode* oldHead = head;
        head = head->next;
        if (head == nullptr) {
            tail = nullptr;
        }
        delete oldHead;
        count--;
    }

    int front() const {
        return head->val;
    }

    int back() const {
        return tail->val;
    }

    bool empty() const {
        return head == nullptr;
    }

    int size() const {
        return count;
    }
};
```

## 常见题型

- BFS
- 层序遍历
- 拓扑排序
- 滑动窗口中的候选元素维护
- 生产者消费者模型

# Deque 双端队列

双端队列（Deque, Double-ended Queue）支持在两端插入和删除。

常用操作：
- `push_front`：队首插入
- `push_back`：队尾插入
- `pop_front`：队首删除
- `pop_back`：队尾删除
- `front` / `back`：查看两端元素

所有基本操作通常都是 $O(1)$。

## 双链表实现

双端队列可以用双链表实现。头尾都能直接访问，所以两端操作都是常数时间。

```cpp
struct DequeNode {
    int val;
    DequeNode* prev;
    DequeNode* next;

    DequeNode(int val) : val(val), prev(nullptr), next(nullptr) {}
};

class LinkedDeque {
private:
    DequeNode* head = nullptr;
    DequeNode* tail = nullptr;
    int count = 0;

public:
    void push_front(int x) {
        DequeNode* node = new DequeNode(x);
        node->next = head;
        if (head != nullptr) {
            head->prev = node;
        } else {
            tail = node;
        }
        head = node;
        count++;
    }

    void push_back(int x) {
        DequeNode* node = new DequeNode(x);
        node->prev = tail;
        if (tail != nullptr) {
            tail->next = node;
        } else {
            head = node;
        }
        tail = node;
        count++;
    }

    void pop_front() {
        if (head == nullptr) {
            return;
        }
        DequeNode* oldHead = head;
        head = head->next;
        if (head != nullptr) {
            head->prev = nullptr;
        } else {
            tail = nullptr;
        }
        delete oldHead;
        count--;
    }

    void pop_back() {
        if (tail == nullptr) {
            return;
        }
        DequeNode* oldTail = tail;
        tail = tail->prev;
        if (tail != nullptr) {
            tail->next = nullptr;
        } else {
            head = nullptr;
        }
        delete oldTail;
        count--;
    }

    int front() const {
        return head->val;
    }

    int back() const {
        return tail->val;
    }

    bool empty() const {
        return head == nullptr;
    }

    int size() const {
        return count;
    }
};
```

## 常见题型

- 单调队列
- 滑动窗口最大值 / 最小值
- 0-1 BFS
- 需要两端进出的模拟题

# 语言库速查

- [C++ STL](../basics/cpp-stl)
- [Python Library](../basics/python-library)
- [Java Library](../basics/java-library)
