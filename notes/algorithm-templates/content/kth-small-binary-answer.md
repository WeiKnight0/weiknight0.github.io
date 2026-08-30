---
title: "第 K 小：二分值域"
category: "二分查找"
order: 42
problems:
  - "378. 有序矩阵中第 K 小的元素"
  - "668. 乘法表中第 K 小的数"
keywords:
  - "第K小"
  - "值域二分"
  - "计数"
  - "二分答案"
tags:
  - "第K小"
  - "计数"
  - "值域二分"
---

```cpp
long long kthSmallest(long long low, long long high, long long k) {
    auto countLE = [&](long long x) -> long long {
        // TODO: 返回 <= x 的元素个数
        return 0;
    };

    long long left = low - 1;
    long long right = high;
    while (left + 1 < right) {
        long long mid = left + (right - left) / 2;
        if (countLE(mid) >= k) right = mid;
        else left = mid;
    }
    return right;
}
```
