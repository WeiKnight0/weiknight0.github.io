---
title: Java Library Java 常用库
date: 2026-07-10
lang: zh-cn
---

# Java Library Java 常用库

这篇只记录常用数据结构在 Java 标准库中的写法，重点是类名、函数名、默认行为和容易混淆的地方。

# 常用数据结构速查表

假设元素类型为 `T`，变量名分别为 `st`、`q`、`dq`、`pq`、`list`。

| 数据结构 | 初始化 | 插入 | 删除 | 查看 | 判空 / 大小 | 注意 |
| --- | --- | --- | --- | --- | --- | --- |
| 栈 | `Deque<T> st = new ArrayDeque<>();` | `st.push(x);` | `st.pop();` | `st.peek();` | `st.isEmpty();` / `st.size();` | 推荐 `Deque`，不用旧 `Stack` |
| 队列 | `Queue<T> q = new LinkedList<>();` | `q.offer(x);` | `q.poll();` | `q.peek();` | `q.isEmpty();` / `q.size();` | 也可用 `new ArrayDeque<>()` |
| 双端队列 | `Deque<T> dq = new LinkedList<>();` | `dq.offerFirst(x);` / `dq.offerLast(x);` | `dq.pollFirst();` / `dq.pollLast();` | `dq.peekFirst();` / `dq.peekLast();` | `dq.isEmpty();` / `dq.size();` | 也可用 `new ArrayDeque<>()` |
| 优先队列 | `PriorityQueue<T> pq = new PriorityQueue<>();` | `pq.offer(x);` | `pq.poll();` | `pq.peek();` | `pq.isEmpty();` / `pq.size();` | 默认小根堆 |
| 链表 | `LinkedList<T> list = new LinkedList<>();` | `list.addFirst(x);` / `list.addLast(x);` / `list.add(i, x);` | `list.removeFirst();` / `list.removeLast();` / `list.remove(i);` | `list.getFirst();` / `list.getLast();` / `list.get(i);` | `list.isEmpty();` / `list.size();` | Java 标准库常用双向链表 |
| 哈希表 | `HashMap<K, V> map = new HashMap<>();` | `map.put(key, value);` | `map.remove(key);` | `map.get(key);` / `map.getOrDefault(key, defaultValue);` | `map.isEmpty();` / `map.size();` | 不保证顺序 |
| 哈希集合 | `HashSet<T> set = new HashSet<>();` | `set.add(x);` | `set.remove(x);` | `set.contains(x);` | `set.isEmpty();` / `set.size();` | 不保证顺序 |

最大堆常用写法：`PriorityQueue<T> pq = new PriorityQueue<>(Collections.reverseOrder());`。

# Stack 栈

Java 推荐用 `Deque` 当栈，不推荐旧的 `Stack` 类。

```java
Deque<Integer> st = new ArrayDeque<>();

st.push(x);       // 入栈，等价于 addFirst
int x = st.peek(); // 访问栈顶，不删除
int y = st.pop();  // 删除并返回栈顶
st.isEmpty();
st.size();
```

# Queue 队列

```java
Queue<Integer> q = new ArrayDeque<>();

q.offer(x);      // 入队到队尾
int x = q.peek(); // 访问队首，不删除；空队列返回 null
int y = q.poll(); // 删除并返回队首；空队列返回 null
q.isEmpty();
q.size();
```

`offer` / `poll` / `peek` 比 `add` / `remove` / `element` 更适合算法题，因为空队列时不会直接抛异常。

# Deque 双端队列

```java
Deque<Integer> dq = new ArrayDeque<>();

dq.offerFirst(x);   // 队首插入
dq.offerLast(x);    // 队尾插入
int a = dq.peekFirst();
int b = dq.peekLast();
int c = dq.pollFirst();
int d = dq.pollLast();
dq.isEmpty();
dq.size();
```

`ArrayDeque` 不能存 `null`。

# PriorityQueue 优先队列

Java 的 `PriorityQueue` 默认是小根堆。

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();

pq.offer(x);
int x = pq.peek(); // 访问堆顶，不删除
int y = pq.poll(); // 删除并返回堆顶
pq.isEmpty();
pq.size();
```

最大堆写法：

```java
PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
```

或者使用比较器：

```java
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
```

注意：`a[0] - b[0]` 可能整数溢出，更稳妥的写法是：

```java
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
```

# LinkedList 链表

`LinkedList` 同时实现了 `List`、`Deque`、`Queue`。Java 中需要链表时直接记标准库 `LinkedList<T>` 的用法。

```java
LinkedList<Integer> list = new LinkedList<>();

list.addFirst(x);
list.addLast(x);
int a = list.getFirst();
int b = list.getLast();
list.removeFirst();
list.removeLast();
list.isEmpty();
list.size();
```

# HashMap / HashSet 哈希表与哈希集合

```java
HashMap<K, V> map = new HashMap<>();

map.put(key, value);                    // 插入或修改
V value = map.get(key);                 // key 不存在返回 null
V value = map.getOrDefault(key, defaultValue);
map.containsKey(key);                   // 判断 key 是否存在
map.remove(key);                        // 删除 key
map.isEmpty();
map.size();
```

```java
HashSet<T> set = new HashSet<>();

set.add(x);
set.contains(x);
set.remove(x);
set.isEmpty();
set.size();
```

注意：`HashMap` / `HashSet` 不保证遍历顺序。如果需要按 key 有序，可以使用 `TreeMap` / `TreeSet`。
