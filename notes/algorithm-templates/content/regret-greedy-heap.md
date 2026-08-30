---
title: "反悔贪心：堆维护可替换选择"
category: "贪心"
order: 78
problems:
  - "630. 课程表 III"
  - "871. 最低加油次数"
keywords:
  - "反悔贪心"
  - "堆"
  - "优先队列"
  - "贪心"
tags:
  - "反悔贪心"
  - "堆"
  - "课程表III"
---

```cpp
int scheduleCourse(vector<vector<int>>& courses) {
    sort(courses.begin(), courses.end(), [](auto& a, auto& b) {
        return a[1] < b[1];
    });
    priority_queue<int> chosen;
    int total = 0;
    for (auto& c : courses) {
        int duration = c[0], deadline = c[1];
        total += duration;
        chosen.push(duration);
        if (total > deadline) {
            total -= chosen.top();
            chosen.pop();
        }
    }
    return chosen.size();
}
```
