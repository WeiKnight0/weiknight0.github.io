---
title: "二分答案：求最大可行值"
category: "二分查找"
order: 41
problems:
  - "2226. 每个小孩最多能分到多少糖果"
  - "1552. 两球之间的磁力"
keywords:
  - "二分答案"
  - "check"
  - "求最大"
  - "最大化最小值"
tags:
  - "灵神风格"
  - "check"
  - "开区间"
---

```cpp
// 开区间写法：left 一定满足要求，right 一定不满足要求
// 循环结束时 left 是最大的满足要求的答案
long long binarySearchMax(long long left, long long right) {
    auto check = [&](long long x) -> bool {
        // TODO: 判断 x 是否满足要求
        return true;
    };

    while (left + 1 < right) {
        long long mid = left + (right - left) / 2;
        if (check(mid)) {
            left = mid;
        } else {
            right = mid;
        }
    }
    return left;
}
```
