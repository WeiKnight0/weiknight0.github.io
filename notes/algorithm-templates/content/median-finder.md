---
title: "MedianFinder：双堆维护中位数"
category: "堆与优先队列"
order: 18
problems:
  - "295. 数据流的中位数"
keywords:
  - "双堆"
  - "中位数"
  - "MedianFinder"
  - "Hot100"
tags:
  - "Hot100 295"
  - "双堆"
  - "class"
---

```cpp
class MedianFinder {
public:
    priority_queue<int> left; // 最大堆
    priority_queue<int, vector<int>, greater<>> right; // 最小堆

    MedianFinder() {
    }

    void addNum(int num) {
        if (left.size() == right.size()) {
            right.push(num);
            left.push(right.top());
            right.pop();
        } else {
            left.push(num);
            right.push(left.top());
            left.pop();
        }
    }

    double findMedian() {
        if (left.size() > right.size()) {
            return left.top();
        }
        return (left.top() + right.top()) / 2.0;
    }
};
```
