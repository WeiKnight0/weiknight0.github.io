---
title: "盛最多水：移动较短边"
category: "双指针"
order: 5
problems:
  - "11. 盛最多水的容器"
keywords:
  - "双指针"
  - "贪心"
  - "短板"
  - "Hot100"
tags:
  - "Hot100 11"
  - "贪心"
  - "短板"
---

```cpp
int maxArea(vector<int>& height) {
    int left = 0;
    int right = height.size() - 1;
    int ans = 0;

    while (left < right) {
        int h = min(height[left], height[right]);
        ans = max(ans, h * (right - left));

        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }

    return ans;
}
```
