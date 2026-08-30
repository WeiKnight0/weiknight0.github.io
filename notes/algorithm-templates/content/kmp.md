---
title: "KMP：前缀函数匹配"
category: "字符串"
order: 37
problems:
  - "28. 找出字符串中第一个匹配项的下标"
keywords:
  - "字符串"
  - "KMP"
  - "前缀函数"
tags:
  - "KMP"
  - "前缀函数"
  - "字符串匹配"
---

```cpp
vector<int> buildPi(const string& p) {
    vector<int> pi(p.size(), 0);
    for (int i = 1; i < (int)p.size(); i++) {
        int j = pi[i - 1];
        while (j > 0 && p[i] != p[j]) j = pi[j - 1];
        if (p[i] == p[j]) j++;
        pi[i] = j;
    }
    return pi;
}

int strStr(string s, string p) {
    if (p.empty()) return 0;
    vector<int> pi = buildPi(p);
    int j = 0;

    for (int i = 0; i < (int)s.size(); i++) {
        while (j > 0 && s[i] != p[j]) j = pi[j - 1];
        if (s[i] == p[j]) j++;
        if (j == (int)p.size()) return i - j + 1;
    }

    return -1;
}
```
