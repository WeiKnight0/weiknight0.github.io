---
title: "凸包：Andrew 算法"
category: "数学"
order: 81
problems:
  - "587. 安装栅栏"
  - "812. 最大三角形面积"
keywords:
  - "凸包"
  - "Andrew"
  - "计算几何"
  - "通用模板"
tags:
  - "计算几何"
  - "凸包"
  - "叉积"
---

```cpp
long long cross(vector<int>& o, vector<int>& a, vector<int>& b) {
    return 1LL * (a[0] - o[0]) * (b[1] - o[1]) - 1LL * (a[1] - o[1]) * (b[0] - o[0]);
}

vector<vector<int>> convexHull(vector<vector<int>>& points) {
    sort(points.begin(), points.end());
    points.erase(unique(points.begin(), points.end()), points.end());
    if (points.size() <= 1) return points;

    vector<vector<int>> hull;
    for (auto& p : points) {
        while (hull.size() >= 2 && cross(hull[hull.size() - 2], hull.back(), p) < 0) hull.pop_back();
        hull.push_back(p);
    }
    int lower = hull.size();
    for (int i = (int) points.size() - 2; i >= 0; i--) {
        auto& p = points[i];
        while ((int) hull.size() > lower && cross(hull[hull.size() - 2], hull.back(), p) < 0) hull.pop_back();
        hull.push_back(p);
    }
    hull.pop_back();
    return hull;
}
```
