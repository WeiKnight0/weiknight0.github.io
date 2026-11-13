---
title: Hash Table 哈希表
date: 2026-02-02
lang: zh-cn
---

# Hash Table 哈希表

哈希表用于把一个键 `key` 映射到一个值 `value`，核心能力是快速判断一个元素是否出现过，或者快速找到某个键对应的信息。

刷题中常见用途：
- 去重：判断某个数、字符串、状态是否已经出现。
- 计数：统计元素出现次数。
- 映射：记录某个值对应的位置、分组、答案。
- 快速查询：把原本需要线性查找的信息变成平均 $O(1)$ 查询。

# C++ 常用容器

| 容器 | 作用 | 常用操作 |
| --- | --- | --- |
| `unordered_set<T>` | 只关心元素是否存在 | `insert`、`count`、`erase` |
| `unordered_map<K, V>` | 记录 key 到 value 的映射 | `mp[key]`、`count`、`find`、`erase` |

常用写法：

```cpp
unordered_set<int> seen;
seen.insert(x);
if (seen.count(x)) {
    // x 出现过
}
```

```cpp
unordered_map<string, int> cnt;
cnt[s]++;
if (cnt.count(s)) {
    // s 是 map 中已有的 key
}
```

注意：`mp[key]` 如果 key 不存在，会自动插入一个默认值。只想判断是否存在时，优先用 `count` 或 `find`。

# 复杂度

理想情况下，哈希表的查找、插入、删除平均时间复杂度都是 $O(1)$。

如果大量 key 被映射到同一个桶，哈希冲突严重，复杂度可能退化。算法题一般按照平均 $O(1)$ 分析。

# 哈希表的基本参数

1. $T$：哈希表键的集合。
2. $b$：哈希表桶的个数。
3. $s$：一个桶中槽的个数。
4. $n$：哈希表中键值对的个数。
5. $\alpha = \dfrac{n}{b \times s}$：负载因子，表示每个槽平均存储的键值对数量，用于衡量哈希表的拥挤程度。

# 哈希函数

哈希函数把键 $x$ 映射到桶索引：

$$
x \rightarrow h(x) \in [0, b-1]
$$

好的哈希函数应该让 key 尽量均匀分布，减少冲突。

常见构造方法：

- **直接定址法**：$H(key)=a\times key+b$，适合关键字分布基本连续的场景。
- **除留余数法**：$H(key)=key\bmod p$，$p$ 通常取不大于表长的质数。
- **数字分析法**：选取关键字中分布较均匀的若干位组成地址。
- **平方取中法**：取关键字平方值的中间若干位，使原关键字多个位参与地址计算。

选择哈希函数时需要同时考虑关键字分布、哈希表长度和计算成本。

# 哈希冲突处理

当多个键映射到同一个桶时，称为哈希冲突。常见处理方法有两类。

1. 开地址法：冲突后继续在表中寻找下一个空位置。

- 线性探测：依次检查下一个槽。
- 二次探测：按照二次方间隔检查槽，例如 $h(x) + i^2$。
- 双重哈希：使用第二个哈希函数计算探测步长。

2. 链地址法：每个桶后面挂一个链表或其他结构，冲突的元素放到同一个桶里。

开放定址法不能在删除元素时直接将存储单元改为“从未使用”，否则会中断其他关键字的探测链。应使用专门的“已删除”标记，查找时继续探测，插入时可以复用该位置。

装填因子 $\alpha$ 越大，冲突概率越高，平均查找长度通常越大。哈希表的查找性能主要取决于哈希函数、冲突处理方法和装填因子，而不是元素数量本身。

例题：已知哈希表大小为 11，哈希函数 $h(x) = x \mod 11$，插入键：`23, 34, 15, 38, 47, 12, 56`。

线性探测插入结果：

- 插入 23：$h(23) = 1$，存储在索引 1。
- 插入 34：$h(34) = 1$，冲突，存储在索引 2。
- 插入 15：$h(15) = 4$，存储在索引 4。
- 插入 38：$h(38) = 5$，存储在索引 5。
- 插入 47：$h(47) = 3$，存储在索引 3。
- 插入 12：$h(12) = 1$，冲突，依次检查索引 2、3、4、5，最终存储在索引 6。
- 插入 56：$h(56) = 1$，冲突，依次检查索引 2、3、4、5、6，最终存储在索引 7。

```text
Index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
Value: - |23 |34 |47 |15 |38 |12 |56 | - | - | -
```

二次探测插入结果：

- 插入 23：$h(23) = 1$，存储在索引 1。
- 插入 34：$h(34) = 1$，冲突，存储在索引 $1 + 1^2 = 2$。
- 插入 15：$h(15) = 4$，存储在索引 4。
- 插入 38：$h(38) = 5$，存储在索引 5。
- 插入 47：$h(47) = 3$，存储在索引 3。
- 插入 12：$h(12) = 1$，冲突，依次检查索引 $1 + 1^2 = 2$、$1 - 1^2 = 0$，最终存储在索引 0。
- 插入 56：$h(56) = 1$，冲突，依次检查索引 $1 + 1^2 = 2$、$1 - 1^2 = 0$、$1 + 2^2 = 5$、$1 - 2^2 = -3 \equiv 8 \pmod{11}$，最终存储在索引 8。

```text
Index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
Value: 12|23 |34 |47 |15 |38 | - | - |56 | - | -
```

双重哈希插入结果：

已知第二个哈希函数 $h_2(x) = 7 - (x \mod 7)$。

- 插入 23：$h(23) = 1$，存储在索引 1。
- 插入 34：$h(34) = 1$，冲突，步长 $h_2(34) = 1$，存储在索引 2。
- 插入 15：$h(15) = 4$，存储在索引 4。
- 插入 38：$h(38) = 5$，存储在索引 5。
- 插入 47：$h(47) = 3$，存储在索引 3。
- 插入 12：$h(12) = 1$，冲突，步长 $h_2(12) = 2$，依次检查 3、5、7，最终存储在索引 7。
- 插入 56：$h(56) = 1$，冲突，步长 $h_2(56) = 7$，存储在索引 8。

```text
Index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
Value: - |23 |34 |47 |15 |38 | - |12 |56 | - | -
```

# 128. 最长连续序列

题目来源：[128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/?envType=study-plan-v2&envId=top-100-liked)

题目描述：给定一个未排序的整数数组 `nums`，请找出数字连续的最长序列的长度。要求算法的时间复杂度为 $O(n)$。

示例：

```text
输入：nums = [100,4,200,1,3,2]
输出：4
解释：最长连续序列是 [1,2,3,4]。
```

```text
输入：nums = [0,3,7,2,5,8,4,6,0,1]
输出：9
```

思路：
- 把所有数放入 `unordered_set<int>`，用于 $O(1)$ 判断某个数是否存在。
- 对于一个数 `x`，如果 `x - 1` 存在，说明 `x` 不是连续序列的起点，跳过。
- 只有当 `x - 1` 不存在时，才从 `x` 开始向右枚举 `x + 1`、`x + 2`。
- 每个连续序列只会从起点扩展一次，整体平均复杂度为 $O(n)$。

OI 输入格式：

```text
n
nums[0] nums[1] ... nums[n-1]
```

OI 输出格式：

```text
最长连续序列长度
```

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    unordered_set<int> nums;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        nums.insert(x);
    }

    int ans = 0;
    for (int x : nums) {
        if (nums.count(x - 1)) {
            continue;
        }

        int cur = x;
        int len = 1;
        while (nums.count(cur + 1)) {
            cur++;
            len++;
        }

        ans = max(ans, len);
    }

    cout << ans << '\n';
    return 0;
}
```

# 49. 字母异位词分组

题目来源：[49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/solutions/2718519/ha-xi-biao-fen-zu-jian-ji-xie-fa-pythonj-1ukv/?envType=study-plan-v2&envId=top-100-liked)

题目描述：给定一个字符串数组 `strs`，请将字母异位词组合在一起。字母异位词指由相同字母重新排列形成的字符串。

示例：

```text
输入：strs = ["eat","tea","tan","ate","nat","bat"]
输出：[["bat"],["nat","tan"],["ate","eat","tea"]]
```

```text
输入：strs = [""]
输出：[[""]]
```

```text
输入：strs = ["a"]
输出：[["a"]]
```

思路：
- 字母异位词排序后会得到相同字符串，例如 `eat`、`tea`、`ate` 排序后都是 `aet`。
- 用排序后的字符串作为哈希表的 key。
- `unordered_map<string, vector<string>> groups` 存储每个 key 对应的一组原字符串。
- `unordered_map` 遍历顺序不固定；为了让 OI 输出稳定，输出前把每组内部排序，再把所有分组按首个字符串排序。

OI 输入格式：

```text
n
strs[0] strs[1] ... strs[n-1]
```

OI 输出格式：

```text
每一组输出一行，组内字符串用空格分隔
```

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    unordered_map<string, vector<string>> groups;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;

        string key = s;
        sort(key.begin(), key.end());
        groups[key].push_back(s);
    }

    vector<vector<string>> ans;
    for (auto &[key, group] : groups) {
        sort(group.begin(), group.end());
        ans.push_back(group);
    }

    sort(ans.begin(), ans.end(), [](const vector<string> &a, const vector<string> &b) {
        return a[0] < b[0];
    });

    for (auto &group : ans) {
        for (int i = 0; i < (int)group.size(); i++) {
            if (i > 0) {
                cout << ' ';
            }
            cout << group[i];
        }
        cout << '\n';
    }

    return 0;
}
```

# 常见坑

- 只判断 key 是否存在时，不要随手写 `mp[key]`，它会插入默认值。
- 需要稳定输出时，不要依赖 `unordered_map` 的遍历顺序。
- 连续序列题必须只从序列起点开始扩展，否则会退化成 $O(n^2)$。
- 分组题要明确 key 的设计：排序字符串适合字母异位词，字符计数数组也可以作为 key。
