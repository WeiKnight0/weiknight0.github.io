---
title: "Dinic：最大流"
category: "图论"
order: 86
problems:
  - "LCP 04. 覆盖"
  - "1820. 最多邀请的个数"
keywords:
  - "Dinic"
  - "网络流"
  - "最大流"
  - "通用模板"
tags:
  - "网络流"
  - "最大流"
  - "分层图"
---

```cpp
class Dinic {
    struct Edge { int to, rev; long long cap; };
    int n;
    vector<vector<Edge>> g;
    vector<int> level, it;

    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        queue<int> q;
        level[s] = 0;
        q.push(s);
        while (!q.empty()) {
            int x = q.front(); q.pop();
            for (auto& e : g[x]) if (e.cap > 0 && level[e.to] < 0) {
                level[e.to] = level[x] + 1;
                q.push(e.to);
            }
        }
        return level[t] >= 0;
    }

    long long dfs(int x, int t, long long f) {
        if (x == t) return f;
        for (int& i = it[x]; i < (int) g[x].size(); i++) {
            Edge& e = g[x][i];
            if (e.cap > 0 && level[e.to] == level[x] + 1) {
                long long ret = dfs(e.to, t, min(f, e.cap));
                if (ret) {
                    e.cap -= ret;
                    g[e.to][e.rev].cap += ret;
                    return ret;
                }
            }
        }
        return 0;
    }

public:
    Dinic(int n) : n(n), g(n), level(n), it(n) {}
    void addEdge(int from, int to, long long cap) {
        Edge a{to, (int) g[to].size(), cap};
        Edge b{from, (int) g[from].size(), 0};
        g[from].push_back(a);
        g[to].push_back(b);
    }
    long long maxFlow(int s, int t) {
        long long flow = 0, f;
        while (bfs(s, t)) {
            fill(it.begin(), it.end(), 0);
            while ((f = dfs(s, t, LLONG_MAX))) flow += f;
        }
        return flow;
    }
};
```
