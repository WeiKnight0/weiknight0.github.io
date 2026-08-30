---
title: "Manacher：回文半径"
category: "字符串"
order: 69
problems:
  - "5. 最长回文子串"
  - "647. 回文子串"
keywords:
  - "Manacher"
  - "回文串"
  - "回文半径"
  - "O(n)"
tags:
  - "回文串"
  - "O(n)"
  - "中心扩展"
---

```cpp
vector<int> manacher(string s) {
    string t = "^";
    for (char c : s) {
        t += '#';
        t += c;
    }
    t += "#$";

    int n = t.size();
    vector<int> p(n);
    int center = 0, right = 0;
    for (int i = 1; i < n - 1; i++) {
        int mirror = 2 * center - i;
        if (i < right) p[i] = min(right - i, p[mirror]);
        while (t[i + p[i] + 1] == t[i - p[i] - 1]) p[i]++;
        if (i + p[i] > right) {
            center = i;
            right = i + p[i];
        }
    }
    return p;
}
```
