---
title: "最小表示法：循环同构最小串"
category: "字符串"
order: 85
problems:
  - "899. 有序队列"
  - "1625. 执行操作后字典序最小的字符串"
keywords:
  - "最小表示法"
  - "循环同构"
  - "字典序"
  - "字符串"
tags:
  - "最小表示法"
  - "循环串"
  - "字典序"
---

```cpp
int minimumRepresentation(string s) {
    int n = s.size();
    s += s;
    int i = 0, j = 1;
    while (j < n) {
        int k = 0;
        while (k < n && s[i + k] == s[j + k]) k++;
        if (k == n) break;
        if (s[i + k] < s[j + k]) {
            j += k + 1;
        } else {
            i = max(i + k + 1, j);
            j = i + 1;
        }
    }
    return i;
}
```
