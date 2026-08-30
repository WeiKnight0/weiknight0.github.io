---
title: "0-1 Trie：最大异或与删除"
category: "位运算"
order: 82
problems:
  - "421. 数组中两个数的最大异或值"
  - "2935. 找出强数对的最大异或值 II"
keywords:
  - "0-1 Trie"
  - "异或字典树"
  - "最大异或"
  - "灵神风格"
tags:
  - "灵神风格"
  - "XOR"
  - "cnt"
---

```cpp
class XorTrie {
    static const int HIGH_BIT = 30;

    struct Node {
        Node* son[2]{};
        int cnt = 0;
    };

    Node* root = new Node();

public:
    void insert(int val) {
        Node* cur = root;
        cur->cnt++;
        for (int i = HIGH_BIT; i >= 0; i--) {
            int bit = val >> i & 1;
            if (cur->son[bit] == nullptr) {
                cur->son[bit] = new Node();
            }
            cur = cur->son[bit];
            cur->cnt++;
        }
    }

    void remove(int val) {
        Node* cur = root;
        cur->cnt--;
        for (int i = HIGH_BIT; i >= 0; i--) {
            int bit = val >> i & 1;
            cur = cur->son[bit];
            cur->cnt--;
        }
    }

    int maxXor(int val) {
        Node* cur = root;
        int ans = 0;
        for (int i = HIGH_BIT; i >= 0; i--) {
            int bit = val >> i & 1;
            if (cur->son[bit ^ 1] && cur->son[bit ^ 1]->cnt > 0) {
                ans |= 1 << i;
                bit ^= 1;
            }
            cur = cur->son[bit];
        }
        return ans;
    }
};
```
