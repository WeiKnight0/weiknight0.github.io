---
title: Segment Tree 线段树
date: 2025-10-07
lang: zh-cn
---

模板直接背（求和版）：
```cpp
struct SegmentTree {
    int n;
    vector<int> tree;
    SegmentTree(int size) : n(size), tree(4 * size) {}
    void build(const vector<int>& arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
        } else {
            int mid = (start + end) / 2;
            build(arr, 2 * node + 1, start, mid);
            build(arr, 2 * node + 2, mid + 1, end);
            tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
        }
    }
    void update(int node, int start, int end, int idx, int val) {
      // 更新索引 idx 的值为 val
        if (start == end) {
            tree[node] = val;
        } else {
            int mid = (start + end) / 2;
            if (idx <= mid) {
                update(2 * node + 1, start, mid, idx, val);
            } else {
                update(2 * node + 2, mid + 1, end, idx, val);
            }
            tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
        }
    }
    int query(int node, int start, int end, int l, int r) {
      // 查询区间 [l, r] 的和
        if (r < start || end < l) {
            return 0; // 返回中性元素
        }
        if (l <= start && end <= r) {
            return tree[node];
        }
        int mid = (start + end) / 2;
        int left_sum = query(2 * node + 1, start, mid, l, r);
        int right_sum = query(2 * node + 2, mid + 1, end, l, r);
        return left_sum + right_sum;
    }
};
```
使用的时候：
```cpp
int main() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    SegmentTree segTree(arr.size());
    segTree.build(arr, 0, 0, arr.size() - 1);
    cout << segTree.query(0, 0, arr.size() - 1, 1, 3) << endl; // 输出 15 (3 + 5 + 7)
    segTree.update(0, 0, arr.size() - 1, 1, 10); // 将索引1的值更新为10
    cout << segTree.query(0, 0, arr.size() - 1, 1, 3) << endl; // 输出 22 (10 + 5 + 7)
    return 0;
}
```

变体超级多，有max、min、gcd、lcm、xor等，甚至可以用来做区间加法、区间乘法等操作。使用的时候灵活变。