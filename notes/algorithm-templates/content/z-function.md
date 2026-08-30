---
title: "Z 函数：扩展 KMP"
category: "字符串"
order: 68
problems:
  - "2223. 构造字符串的总得分和"
  - "3031. 将单词恢复初始状态所需的最短时间 II"
keywords:
  - "Z函数"
  - "扩展KMP"
  - "LCP"
  - "灵神风格"
tags:
  - "灵神风格"
  - "LCP"
  - "字符串匹配"
---

```cpp
vector<int> calcZ(string s) {
    int n = s.length();
    vector<int> z(n);
    int box_l = 0, box_r = 0; // z-box 左右边界
    for (int i = 1; i < n; i++) {
        if (i <= box_r) {
            z[i] = min(z[i - box_l], box_r - i + 1);
        }
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
            z[i]++;
        }
        if (i + z[i] - 1 > box_r) {
            box_l = i;
            box_r = i + z[i] - 1;
        }
    }
    return z;
}
```
