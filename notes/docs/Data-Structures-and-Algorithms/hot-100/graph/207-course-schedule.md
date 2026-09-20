---
title: 207. 课程表
date: 2026-09-07
lang: zh-cn
---

共有 `numCourses` 门课程，编号为 `0` 到 `numCourses - 1`。先修关系 `prerequisites[i] = [course, prerequisite]` 表示学习 `course` 前必须先学习 `prerequisite`。判断能否完成全部课程。

[题目链接](https://leetcode.cn/problems/course-schedule/)

## 示例

### 示例 1

- 输入：`numCourses = 2, prerequisites = [[1,0]]`
- 输出：`true`
- 解释：先学习课程 `0`，再学习课程 `1`。

### 示例 2

- 输入：`numCourses = 2, prerequisites = [[1,0],[0,1]]`
- 输出：`false`
- 解释：课程 `0` 和 `1` 互相依赖，形成环。

## 数据范围

- $1 \leq numCourses \leq 2000$
- $0 \leq prerequisites.length \leq 5000$
- `prerequisites[i].length == 2`
- 每组先修关系中的两个课程编号不同
- 输入中没有重复的先修关系

## 图论建模

对先修关系 `[course, prerequisite]` 建立有向边：

$$
prerequisite\rightarrow course
$$

能完成全部课程，当且仅当依赖图中没有有向环。若存在环，环中每门课程都在等待另一门课程完成；若无环，则至少能找到一种拓扑顺序完成课程。

## 方法一：Kahn 入度 BFS

`indegree[i]` 表示课程 `i` 还有多少门先修课未完成：

1. 把所有入度为 `0` 的课程加入队列；
2. 每完成一门课程，就删除它的所有出边，即让后续课程入度减一；
3. 后续课程入度变为 `0` 时加入队列；
4. 最后比较已完成课程数与总课程数。

```cpp
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        vector<int> indegree(numCourses);
        for (const auto& edge : prerequisites) {
            graph[edge[1]].push_back(edge[0]);
            indegree[edge[0]]++;
        }

        queue<int> q;
        for (int course = 0; course < numCourses; course++) {
            if (indegree[course] == 0) {
                q.push(course);
            }
        }

        int completed = 0;
        while (!q.empty()) {
            int course = q.front();
            q.pop();
            completed++;
            for (int next : graph[course]) {
                if (--indegree[next] == 0) {
                    q.push(next);
                }
            }
        }
        return completed == numCourses;
    }
};
```

若存在环，环内节点的入度永远无法降为 `0`，最终完成数小于课程总数；若无环，拓扑排序会依次取出所有节点。

- 时间复杂度：$O(V+E)$
- 空间复杂度：$O(V+E)$

## 方法二：DFS 三色标记判环

每门课程有三种状态：

- `0`：尚未访问；
- `1`：正在当前递归路径中访问；
- `2`：该课程出发的所有路径已经确认无环。

DFS 遇到状态为 `1` 的节点，说明当前路径回到了自己的祖先，存在有向环。

```cpp
class Solution {
    vector<vector<int>> graph;
    vector<int> color;

    bool acyclic(int course) {
        if (color[course] == 1) {
            return false;
        }
        if (color[course] == 2) {
            return true;
        }
        color[course] = 1;
        for (int next : graph[course]) {
            if (!acyclic(next)) {
                return false;
            }
        }
        color[course] = 2;
        return true;
    }

public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        graph.assign(numCourses, {});
        color.assign(numCourses, 0);
        for (const auto& edge : prerequisites) {
            graph[edge[1]].push_back(edge[0]);
        }
        for (int course = 0; course < numCourses; course++) {
            if (!acyclic(course)) {
                return false;
            }
        }
        return true;
    }
};
```

状态 `2` 表示该节点的后续路径已经检查完毕，再次到达它时可以直接返回，避免重复搜索。

- 时间复杂度：$O(V+E)$
- 空间复杂度：$O(V+E)$，包含邻接表、状态数组和递归栈

## 易错点

- `[course, prerequisite]` 应建边 `prerequisite → course`。
- 拓扑排序不是判断课程编号能否升序排列，而是判断能否处理全部节点。
- DFS 只有遇到当前递归路径中的灰色节点才表示环；遇到已完成的黑色节点不表示环。
- 图可能不连通，DFS 需要从每个尚未完成检查的课程出发。

## 参考

- [灵茶山艾府：图论算法题单](https://leetcode.cn/discuss/post/01LUak/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/course-schedule/solutions/)
