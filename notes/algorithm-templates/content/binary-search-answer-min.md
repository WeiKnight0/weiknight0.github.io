---
title: "二分答案：求最小可行值"
category: "二分查找"
order: 40
problems:
  - "1283. 使结果不超过阈值的最小除数"
  - "875. 爱吃香蕉的珂珂"
keywords:
  - "二分答案"
  - "check"
  - "求最小"
  - "最小化最大值"
tags:
  - "灵神风格"
  - "check"
  - "开区间"
---

```cpp
// 开区间写法：left 一定不满足要求，right 一定满足要求
// 循环结束时 right 是最小的满足要求的答案
long long binarySearchMin(long long left, long long right) {
    auto check = [&](long long x) -> bool {
        // TODO: 判断 x 是否满足要求
        return true;
    };

    while (left + 1 < right) {
        long long mid = left + (right - left) / 2;
        if (check(mid)) {
            right = mid;
        } else {
            left = mid;
        }
    }
    return right;
}
```
