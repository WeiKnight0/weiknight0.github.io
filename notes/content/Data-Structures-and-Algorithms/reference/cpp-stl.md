---
title: C++ STL C++ 标准库
date: 2026-07-10
lang: zh-cn
---

# C++ STL C++ 标准库

这篇只记录常用数据结构在 C++ STL 中的写法，重点是函数名、默认行为和容易混淆的地方。

# 常用容器速查表

假设元素类型为 `T`，键类型为 `K`，值类型为 `V`。

| 数据结构 | 初始化 | 插入 | 删除 | 查看 | 判空 / 大小 | 注意 |
| --- | --- | --- | --- | --- | --- | --- |
| 栈 | `std::stack<T> st;` | `st.push(x);` | `st.pop();` | `st.top();` | `st.empty();` / `st.size();` | `pop()` 不返回值 |
| 队列 | `std::queue<T> q;` | `q.push(x);` | `q.pop();` | `q.front();` / `q.back();` | `q.empty();` / `q.size();` | `pop()` 不返回值 |
| 双端队列 | `std::deque<T> dq;` | `dq.push_front(x);` / `dq.push_back(x);` | `dq.pop_front();` / `dq.pop_back();` | `dq.front();` / `dq.back();` / `dq[i];` | `dq.empty();` / `dq.size();` | 支持下标访问 |
| 优先队列 | `std::priority_queue<T> pq;` | `pq.push(x);` | `pq.pop();` | `pq.top();` | `pq.empty();` / `pq.size();` | 默认大根堆 |
| 哈希表 | `std::unordered_map<K, V> mp;` | `mp[key] = value;` | `mp.erase(key);` | `mp[key];` / `mp.at(key);` | `mp.empty();` / `mp.size();` | `mp[key]` 会插入默认值 |
| 哈希集合 | `std::unordered_set<T> st;` | `st.insert(x);` | `st.erase(x);` | `st.count(x);` / `st.find(x);` | `st.empty();` / `st.size();` | 平均 $O(1)$ |
| 有序映射 | `std::map<K, V> mp;` | `mp[key] = value;` | `mp.erase(key);` | `mp[key];` / `mp.lower_bound(key);` | `mp.empty();` / `mp.size();` | 按 key 有序，$O(\log n)$ |
| 有序集合 | `std::set<T> st;` | `st.insert(x);` | `st.erase(x);` | `st.count(x);` / `st.lower_bound(x);` | `st.empty();` / `st.size();` | 按元素有序，$O(\log n)$ |

`std::priority_queue<T, std::vector<T>, std::greater<T>> pq;` 是小根堆写法。

# Stack 栈

头文件：`#include <stack>`

```cpp
std::stack<int> s;

s.push(x);        // 入栈
int x = s.top();  // 访问栈顶，不删除
s.pop();          // 删除栈顶，不返回值
s.empty();        // 是否为空
s.size();         // 元素个数
```

注意：`std::stack` 默认不能遍历。如果需要遍历或随机访问，可以用 `std::vector` 模拟栈。

```cpp
std::vector<int> st;
st.push_back(x);
int x = st.back();
st.pop_back();
```

# Queue 队列

头文件：`#include <queue>`

```cpp
std::queue<int> q;

q.push(x);          // 入队到队尾
int x = q.front();  // 访问队首，不删除
int y = q.back();   // 访问队尾，不删除
q.pop();            // 删除队首，不返回值
q.empty();
q.size();
```

注意：`pop()` 不返回被删除的元素，要先用 `front()` 取值。

# Deque 双端队列

头文件：`#include <deque>`

```cpp
std::deque<int> dq;

dq.push_back(x);    // 队尾插入
dq.push_front(x);   // 队首插入
int a = dq.front(); // 访问队首
int b = dq.back();  // 访问队尾
dq.pop_front();     // 删除队首
dq.pop_back();      // 删除队尾
dq.empty();
dq.size();
```

`std::deque` 支持下标访问：`dq[i]`。

# Priority Queue 优先队列

头文件：`#include <queue>`

`std::priority_queue` 默认是大根堆，也就是 `top()` 是最大值。

```cpp
std::priority_queue<int> pq;

pq.push(x);
int x = pq.top();
pq.pop();
pq.empty();
pq.size();
```

小根堆写法：

```cpp
std::priority_queue<int, std::vector<int>, std::greater<int>> pq;
```

结构体或 pair 常用于带优先级的任务。`pair` 默认先比较 `first`，再比较 `second`。

```cpp
std::priority_queue<std::pair<int, int>> pq;
pq.push({dist, node});
```

# Linked List 链表

C++ 算法题里的链表通常手写节点，不建议记 `std::list`。`std::list` 的迭代器操作和题目中的节点指针模型不一致，复习收益不高。

手写链表见：[Linked List 链表](../data-structures/linear-list/linked-list.md)。

# Hash Table / Hash Set 哈希表与哈希集合

头文件：`#include <unordered_map>`、`#include <unordered_set>`

```cpp
std::unordered_map<K, V> mp;

mp[key] = value;             // 插入或修改
V value = mp[key];           // 读取；key 不存在会插入默认值
V value = mp.at(key);        // 读取；key 不存在会抛异常
mp.count(key);               // 是否存在，返回 0 或 1
mp.find(key) != mp.end();    // 是否存在
mp.erase(key);               // 删除 key
mp.empty();
mp.size();
```

```cpp
std::unordered_set<T> st;

st.insert(x);
st.count(x);
st.find(x) != st.end();
st.erase(x);
st.empty();
st.size();
```

注意：`unordered_map` / `unordered_set` 平均复杂度是 $O(1)$，但最坏情况下可能退化。只判断 key 是否存在时，不要用 `mp[key]`，用 `count` 或 `find`。

# Ordered Map / Ordered Set 有序映射与有序集合

头文件：`#include <map>`、`#include <set>`

`std::map` 和 `std::set` 按 key 或元素从小到大排序，常用在需要找前驱、后继、下界、上界的题目中。它们通常基于平衡树，基本操作复杂度是 $O(\log n)$。

```cpp
std::map<K, V> mp;

mp[key] = value;
mp.count(key);
mp.find(key) != mp.end();
mp.erase(key);

auto it1 = mp.lower_bound(key); // 第一个 >= key 的位置
auto it2 = mp.upper_bound(key); // 第一个 > key 的位置
```

```cpp
std::set<T> st;

st.insert(x);
st.count(x);
st.find(x) != st.end();
st.erase(x);

auto it1 = st.lower_bound(x); // 第一个 >= x 的位置
auto it2 = st.upper_bound(x); // 第一个 > x 的位置
```

注意：`std::map` 是有序映射，不是哈希表；`std::unordered_map` 才是哈希表。
