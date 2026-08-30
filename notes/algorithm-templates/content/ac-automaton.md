---
title: "AC 自动机：多模式串匹配"
category: "字符串"
order: 83
problems:
  - "1032. 字符流"
  - "面试题 17.17. 多次搜索"
keywords:
  - "AC自动机"
  - "Trie"
  - "KMP"
  - "通用模板"
tags:
  - "AC自动机"
  - "Trie"
  - "KMP"
---

```cpp
class AhoCorasick {
    struct Node {
        int next[26];
        int fail = 0;
        int out = 0;
        Node() { fill(begin(next), end(next), -1); }
    };
    vector<Node> trie{Node()};

public:
    void insert(string word) {
        int node = 0;
        for (char c : word) {
            int x = c - 'a';
            if (trie[node].next[x] == -1) {
                trie[node].next[x] = trie.size();
                trie.push_back(Node());
            }
            node = trie[node].next[x];
        }
        trie[node].out++;
    }

    void build() {
        queue<int> q;
        for (int c = 0; c < 26; c++) {
            int y = trie[0].next[c];
            if (y == -1) trie[0].next[c] = 0;
            else q.push(y);
        }
        while (!q.empty()) {
            int x = q.front(); q.pop();
            trie[x].out += trie[trie[x].fail].out;
            for (int c = 0; c < 26; c++) {
                int y = trie[x].next[c];
                if (y == -1) trie[x].next[c] = trie[trie[x].fail].next[c];
                else {
                    trie[y].fail = trie[trie[x].fail].next[c];
                    q.push(y);
                }
            }
        }
    }

    int countMatches(string text) {
        int node = 0, ans = 0;
        for (char c : text) {
            node = trie[node].next[c - 'a'];
            ans += trie[node].out;
        }
        return ans;
    }
};
```
