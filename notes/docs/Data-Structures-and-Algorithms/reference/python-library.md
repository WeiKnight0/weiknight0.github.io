---
title: Python Library Python 常用库
date: 2026-07-10
lang: zh-cn
---

# Python Library Python 常用库

这篇只记录常用数据结构在 Python 中的写法，重点是函数名、默认行为和容易混淆的地方。

# 常用数据结构速查表

假设元素变量为 `x`。

| 数据结构 | 初始化 | 插入 | 删除 | 查看 | 判空 / 大小 | 注意 |
| --- | --- | --- | --- | --- | --- | --- |
| 栈 | `st = []` | `st.append(x)` | `st.pop()` | `st[-1]` | `not st` / `len(st)` | `pop()` 返回被删元素 |
| 队列 | `q = deque()` | `q.append(x)` | `q.popleft()` | `q[0]` | `not q` / `len(q)` | 需要 `from collections import deque` |
| 双端队列 | `dq = deque()` | `dq.appendleft(x)` / `dq.append(x)` | `dq.popleft()` / `dq.pop()` | `dq[0]` / `dq[-1]` | `not dq` / `len(dq)` | 两端操作是 $O(1)$ |
| 堆 | `heap = []` | `heapq.heappush(heap, x)` | `heapq.heappop(heap)` | `heap[0]` | `not heap` / `len(heap)` | 默认小根堆 |
| 链表 | 手写 `ListNode` | 改 `next` | 改 `next` | `node.val` | `node is None` | Python 无常用内置链表 |
| 哈希表 | `d = {}` | `d[key] = value` | `del d[key]` | `d[key]` / `d.get(key, default)` | `not d` / `len(d)` | `key in d` 判断存在 |
| 哈希集合 | `s = set()` | `s.add(x)` | `s.remove(x)` / `s.discard(x)` | `x in s` | `not s` / `len(s)` | `discard` 不存在不报错 |

最大堆通常用负数模拟：`heapq.heappush(heap, -x)`。

# Stack 栈

Python 常用 `list` 当栈。

```python
st = []

st.append(x)     # 入栈
x = st[-1]       # 访问栈顶，不删除
x = st.pop()     # 删除并返回栈顶
len(st)          # 元素个数
not st           # 是否为空
```

`list.pop()` 默认删除最后一个元素，时间复杂度是 $O(1)$。

# Queue 队列

队列使用 `collections.deque`，不要用 `list.pop(0)`，因为它是 $O(n)$。

```python
from collections import deque

q = deque()

q.append(x)      # 入队到队尾
x = q[0]         # 访问队首，不删除
x = q.popleft()  # 删除并返回队首
len(q)
not q
```

# Deque 双端队列

```python
from collections import deque

dq = deque()

dq.append(x)       # 队尾插入
dq.appendleft(x)   # 队首插入
x = dq[0]          # 访问队首
y = dq[-1]         # 访问队尾
x = dq.popleft()   # 删除并返回队首
y = dq.pop()       # 删除并返回队尾
len(dq)
not dq
```

`deque` 适合两端插入删除，不适合频繁随机访问。

# Heap 堆 / Priority Queue 优先队列

Python 标准库 `heapq` 是小根堆。

```python
import heapq

heap = []
heapq.heappush(heap, x)  # 插入
x = heap[0]              # 访问堆顶，不删除
x = heapq.heappop(heap)  # 删除并返回堆顶
len(heap)
```

把已有数组原地变成堆：

```python
heapq.heapify(nums)
```

最大堆常用取负数模拟：

```python
heap = []
heapq.heappush(heap, -x)
x = -heapq.heappop(heap)
```

带优先级的元素常用元组：

```python
heapq.heappush(heap, (priority, value))
priority, value = heapq.heappop(heap)
```

注意：元组会先比较第一个元素，再比较第二个元素。如果第二个元素不可比较，需要额外加编号。

# Linked List 链表

Python 没有专门用于算法题的内置链表。LeetCode 一般会给出 `ListNode`。

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

工程代码如果需要双端队列，通常用 `collections.deque`，而不是手写链表。

# Dict / Set 哈希表与哈希集合

Python 的 `dict` 是哈希表，`set` 是哈希集合。

```python
d = {}

d[key] = value              # 插入或修改
value = d[key]              # 读取；key 不存在会报错
value = d.get(key, default) # 读取；key 不存在返回默认值
key in d                    # 判断 key 是否存在
del d[key]                  # 删除；key 不存在会报错
len(d)
not d
```

```python
s = set()

s.add(x)
x in s
s.remove(x)   # x 不存在会报错
s.discard(x)  # x 不存在不会报错
len(s)
not s
```

常用补充：

```python
from collections import defaultdict, Counter

cnt = Counter(nums)
groups = defaultdict(list)
```

注意：Python 3.7+ 的 `dict` 保留插入顺序，但算法复杂度上仍按哈希表理解。
