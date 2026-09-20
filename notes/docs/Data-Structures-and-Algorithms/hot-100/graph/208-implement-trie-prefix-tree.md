---
title: 208. 实现 Trie（前缀树）
date: 2026-09-07
lang: zh-cn
---

实现前缀树 `Trie`：

- `insert(word)`：插入字符串；
- `search(word)`：字符串此前完整插入过时返回 `true`；
- `startsWith(prefix)`：此前插入的字符串中存在给定前缀时返回 `true`。

[题目链接](https://leetcode.cn/problems/implement-trie-prefix-tree/)

## 示例

- 输入：`["Trie","insert","search","search","startsWith","insert","search"]`
- 参数：`[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]`
- 输出：`[null,null,true,false,true,null,true]`

执行过程：

1. 插入 `"apple"`；
2. `search("apple")` 为 `true`；
3. `search("app")` 为 `false`，因为此时 `app` 只是前缀，没有作为完整单词插入；
4. `startsWith("app")` 为 `true`；
5. 插入 `"app"` 后，`search("app")` 为 `true`。

## 数据范围

- $1 \leq word.length,prefix.length \leq 2000$
- `word` 和 `prefix` 只包含小写英文字母
- `insert`、`search`、`startsWith` 的调用总数不超过 $3\times10^4$

## Trie 的节点含义

Trie 的边表示字符，从根节点沿边走到某个节点，路径上的字符构成一个前缀。每个节点包含：

- `son[26]`：下一字符对应的子树入口；
- `end`：是否有单词恰好在当前节点结束。

`end` 不等于“这是叶子节点”。例如同时插入 `app` 和 `apple` 后，表示 `app` 的节点既有后继，又需要标记为单词结尾。

## 实现

`findPrefix` 只负责沿字符路径查找并返回终点。`search` 在此基础上额外检查 `end`，而 `startsWith` 只要求路径存在。

```cpp
class Trie {
    struct TrieNode {
        TrieNode* son[26]{};
        bool end = false;
    };

    TrieNode* root;

    TrieNode* findPrefix(const string& text) {
        TrieNode* node = root;
        for (char c : text) {
            int index = c - 'a';
            if (!node->son[index]) {
                return nullptr;
            }
            node = node->son[index];
        }
        return node;
    }

public:
    Trie() : root(new TrieNode) {}

    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int index = c - 'a';
            if (!node->son[index]) {
                node->son[index] = new TrieNode;
            }
            node = node->son[index];
        }
        node->end = true;
    }

    bool search(string word) {
        TrieNode* node = findPrefix(word);
        return node && node->end;
    }

    bool startsWith(string prefix) {
        return findPrefix(prefix);
    }
};
```

## 正确性

插入时，第 `i` 次循环结束后，`node` 表示单词前 `i + 1` 个字符构成的前缀；缺少的边会被创建，因此最终路径完整存在，并在终点设置 `end`。

查找前缀时，任意一条边不存在都说明没有已插入单词具有该前缀；全部边存在则说明前缀存在。完整单词查询还要求终点 `end = true`，所以不会把仅为其他单词前缀的字符串误判为已插入单词。

## 复杂度

设本次操作的字符串长度为 $L$：

- `insert`：时间复杂度 $O(L)$；
- `search`：时间复杂度 $O(L)$；
- `startsWith`：时间复杂度 $O(L)$；
- 总空间复杂度：$O(S|\Sigma|)$，其中 $S$ 是已创建节点数，$|\Sigma|=26$。

## 易错点

- `search("app")` 与 `startsWith("app")` 含义不同，前者必须检查 `end`。
- 多个单词会共享前缀节点，插入时只在子节点不存在时创建。
- `end` 标记属于单词终点，不能简单用“没有孩子”代替。
- 题目限定小写英文字母，因此才能直接使用 `c - 'a'` 作为下标。

## 参考

- [项目现有 Trie 笔记](../../algorithms/string/trie.md)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/implement-trie-prefix-tree/solutions/)
