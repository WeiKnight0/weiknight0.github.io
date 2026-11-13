---
title: 189. 轮转数组
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `nums` 和非负整数 `k`，将数组中的元素向右轮转 `k` 个位置。要求直接修改 `nums`。

[题目链接](https://leetcode.cn/problems/rotate-array/)

## 示例

### 示例 1

- 输入：`nums = [1,2,3,4,5,6,7], k = 3`
- 输出：`[5,6,7,1,2,3,4]`
- 解释：向右轮转三次后，末尾的 `[5,6,7]` 移到数组开头。

### 示例 2

- 输入：`nums = [-1,-100,3,99], k = 2`
- 输出：`[3,99,-1,-100]`

## 数据范围

- $1 \leq nums.length \leq 10^5$
- $-2^{31} \leq nums[i] \leq 2^{31}-1$
- $0 \leq k \leq 10^5$

轮转 `n` 次会回到原数组，因此首先令 `k %= n`。原下标 $i$ 的元素在轮转后位于：

$$
(i+k)\bmod n
$$

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：辅助数组

按照目标下标公式把每个元素写入新数组，最后整体赋回 `nums`。

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        vector<int> rotated(n);
        for (int i = 0; i < n; i++) {
            rotated[(i + k) % n] = nums[i];
        }
        nums = move(rotated);
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

## 方法二：三次反转

数组可分为两段：

```text
[1,2,3,4] [5,6,7]
```

目标是交换两段的位置，同时保持各段内部顺序。依次执行：

1. 反转整个数组：`[7,6,5,4,3,2,1]`；
2. 反转前 `k` 个元素：`[5,6,7,4,3,2,1]`；
3. 反转剩余元素：`[5,6,7,1,2,3,4]`。

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 方法三：环状替换

直接把下标 `current` 的元素放到 `(current + k) % n`。目标位置原来的元素不能丢失，用 `previous` 暂存并继续放置。

下标变换可能形成多个互不相交的环。例如 `n = 6, k = 2` 时，下标形成 `0 → 2 → 4 → 0` 和 `1 → 3 → 5 → 1` 两个环，所以完成一个环后还要寻找下一个起点。用 `moved` 统计已放置的元素，达到 `n` 时结束。

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        int moved = 0;

        for (int start = 0; moved < n; start++) {
            int current = start;
            int previous = nums[current];
            do {
                int next = (current + k) % n;
                swap(previous, nums[next]);
                current = next;
                moved++;
            } while (current != start);
        }
    }
};
```

每一步都把一个元素送到唯一的目标位置，并保存被覆盖的元素。一个环闭合后，该环中的所有元素都已就位；所有环互不相交且覆盖全部下标，因此移动 `n` 个元素后数组完成轮转。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 易错点

- `k` 可能大于数组长度，必须先取模。
- 逐次把末尾元素插入开头需要反复移动数组，时间复杂度为 $O(nk)$。
- 三次反转的范围分别是整个数组、前 `k` 个元素和后 `n-k` 个元素。
- 环状替换不能只处理从下标 `0` 出发的一个环。

</details>

## 参考

- [LeetCode 官方题解：三种轮转方法](https://leetcode.cn/problems/rotate-array/solutions/792968/rotate-array-by-yi-fan-dn-052r/)
