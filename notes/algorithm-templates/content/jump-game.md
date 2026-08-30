---
title: "跳跃游戏：维护最远可达"
category: "贪心"
order: 33
problems:
  - "55. 跳跃游戏"
keywords:
  - "贪心"
  - "最远可达"
  - "Hot100"
tags:
  - "Hot100 55"
  - "最远可达"
  - "贪心"
---

```cpp
bool canJump(vector<int>& nums) {
    int farthest = 0;

    for (int i = 0; i < (int)nums.size(); i++) {
        if (i > farthest) return false;
        farthest = max(farthest, i + nums[i]);
    }

    return true;
}
```
