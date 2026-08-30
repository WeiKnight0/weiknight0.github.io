---
title: "子序列自动机：next 位置预处理"
category: "字符串"
order: 84
problems:
  - "792. 匹配子序列的单词数"
  - "1055. 形成字符串的最短路径"
keywords:
  - "子序列自动机"
  - "next数组"
  - "子序列"
  - "多次查询"
tags:
  - "子序列自动机"
  - "next"
  - "多次查询"
---

```cpp
class SubsequenceAutomaton {
    vector<array<int, 26>> nxt;

public:
    SubsequenceAutomaton(string s) {
        int n = s.size();
        nxt.assign(n + 2, {});
        nxt[n].fill(n);
        for (int i = n - 1; i >= 0; i--) {
            nxt[i] = nxt[i + 1];
            nxt[i][s[i] - 'a'] = i;
        }
    }

    bool contains(string t) {
        int pos = 0, n = nxt.size() - 2;
        for (char c : t) {
            pos = nxt[pos][c - 'a'];
            if (pos == n) return false;
            pos++;
        }
        return true;
    }
};
```
