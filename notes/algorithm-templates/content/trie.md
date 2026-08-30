---
title: "Trie 字典树：小写字母版"
category: "字符串"
order: 38
problems:
  - "208. 实现 Trie"
keywords:
  - "Trie"
  - "字典树"
  - "前缀"
  - "灵神风格"
tags:
  - "灵神风格"
  - "前缀"
  - "计数"
---

```cpp
struct Node {
    Node* son[26]{};
    int cnt = 0;
};

class Trie {
    Node* root = new Node();

    Node* find(string word) {
        Node* cur = root;
        for (char c : word) {
            c -= 'a';
            if (cur->son[c] == nullptr) {
                return nullptr;
            }
            cur = cur->son[c];
        }
        return cur;
    }

public:
    void insert(string word) {
        Node* cur = root;
        for (char c : word) {
            c -= 'a';
            if (cur->son[c] == nullptr) {
                cur->son[c] = new Node();
            }
            cur = cur->son[c];
        }
        cur->cnt++;
    }

    bool search(string word) {
        Node* node = find(word);
        return node && node->cnt > 0;
    }

    bool startsWith(string prefix) {
        return find(prefix) != nullptr;
    }
};
```
