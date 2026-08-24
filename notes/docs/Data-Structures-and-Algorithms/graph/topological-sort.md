---
title: 拓扑排序
date: 2025-02-04
description: 有向无环图的拓扑序，包含入度 BFS 模板、判环和课程表题型。
categories:
  - Notes
  - Data Structures and Algorithms
  - Graph
tags:
  - DSA
  - Graph
  - Topological Sort
---

# 拓扑排序

拓扑排序用于有向图，要求如果存在边 `u -> v`，那么 `u` 必须排在 `v` 前面。

只有有向无环图才存在拓扑序。如果有向图存在环，环内节点互相依赖，就无法排出合法顺序。

## Kahn 入度 BFS

核心步骤：

1. 建图，同时统计每个点的入度。
2. 把所有入度为 `0` 的点加入队列。
3. 每次取出一个点 `u`，把它加入答案。
4. 删除 `u` 的所有出边，也就是让相邻点入度减一。
5. 如果某个相邻点入度变成 `0`，加入队列。
6. 最后如果答案长度等于点数，说明无环；否则有环。

```cpp
vector<int> topologicalSort(int n, vector<vector<int>>& graph, vector<int>& indegree) {
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (indegree[i] == 0) {
            q.push(i);
        }
    }

    vector<int> order;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : graph[u]) {
            indegree[v]--;
            if (indegree[v] == 0) {
                q.push(v);
            }
        }
    }

    return order;
}
```

## 例题：[207. 课程表](https://leetcode.cn/problems/course-schedule/)

### 题目描述

有 `numCourses` 门课程，课程编号为 `0` 到 `numCourses - 1`。给定先修关系 `prerequisites`，其中 `[a, b]` 表示学习课程 `a` 前必须先学习课程 `b`。判断是否可以完成所有课程。

### 输入格式

第一行输入 `numCourses m`。接下来 `m` 行，每行输入 `a b`，表示学习 `a` 前必须先学习 `b`。

### 输出格式

可以完成所有课程输出 `true`，否则输出 `false`。

### 示例

```text
输入：
2 1
1 0

输出：
true
```

### 思路

把先修关系 `[a, b]` 建成边 `b -> a`。如果拓扑排序能取出所有课程，说明没有循环依赖，可以完成所有课程。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int numCourses, m;
    cin >> numCourses >> m;

    vector<vector<int>> graph(numCourses);
    vector<int> indegree(numCourses, 0);

    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        graph[b].push_back(a);
        indegree[a]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; i++) {
        if (indegree[i] == 0) {
            q.push(i);
        }
    }

    int learned = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        learned++;

        for (int v : graph[u]) {
            indegree[v]--;
            if (indegree[v] == 0) {
                q.push(v);
            }
        }
    }

    cout << (learned == numCourses ? "true" : "false") << '\n';
    return 0;
}
```

## 例题：[210. 课程表 II](https://leetcode.cn/problems/course-schedule-ii/)

### 题目描述

给定课程数量和先修关系，返回一种可行的学习顺序。如果无法完成所有课程，输出空序列。

### 输入格式

第一行输入 `numCourses m`。接下来 `m` 行，每行输入 `a b`，表示学习 `a` 前必须先学习 `b`。

### 输出格式

如果存在学习顺序，输出课程编号序列；否则输出空行。

### 示例

```text
输入：
4 4
1 0
2 0
3 1
3 2

输出：
0 1 2 3
```

输出 `0 2 1 3` 也合法。

### 思路

仍然使用 Kahn 拓扑排序。与上一题不同的是，需要保存取出的课程顺序。最后如果顺序长度不足 `numCourses`，说明有环，输出空行。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int numCourses, m;
    cin >> numCourses >> m;

    vector<vector<int>> graph(numCourses);
    vector<int> indegree(numCourses, 0);

    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        graph[b].push_back(a);
        indegree[a]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; i++) {
        if (indegree[i] == 0) {
            q.push(i);
        }
    }

    vector<int> order;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : graph[u]) {
            indegree[v]--;
            if (indegree[v] == 0) {
                q.push(v);
            }
        }
    }

    if ((int)order.size() != numCourses) {
        cout << '\n';
        return 0;
    }

    for (int i = 0; i < numCourses; i++) {
        if (i > 0) cout << ' ';
        cout << order[i];
    }
    cout << '\n';

    return 0;
}
```

## 小结

| 问题 | 判断方式 |
| --- | --- |
| 是否存在拓扑序 | 拓扑排序结果长度是否等于点数 |
| 是否有环 | 拓扑排序结果长度小于点数 |
| 输出一条合法顺序 | 保存 Kahn BFS 的出队顺序 |
| 依赖关系 `[a, b]` | 通常建边 `b -> a` |
