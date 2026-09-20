---
title: 283. 移动零
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `nums`，将所有 `0` 移到数组末尾，同时保持非零元素的相对顺序。必须在原数组上操作，不能复制整个数组。

[题目链接](https://leetcode.cn/problems/move-zeroes/)

## 示例

### 示例 1

- 输入：`nums = [0,1,0,3,12]`
- 输出：`[1,3,12,0,0]`

### 示例 2

- 输入：`nums = [0]`
- 输出：`[0]`

## 数据范围

- $1 \leq nums.length \leq 10^4$
- $-2^{31} \leq nums[i] \leq 2^{31}-1$

## 方法一：写入非零元素后补零

用 `write` 表示下一个非零元素的写入位置。第一次遍历依次写入所有非零元素，第二次把剩余位置填成 `0`。

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int write = 0;
        for (int x : nums) {
            if (x != 0) {
                nums[write++] = x;
            }
        }
        while (write < nums.size()) {
            nums[write++] = 0;
        }
    }
};
```

非零元素按原来的遍历顺序写入，所以相对顺序不变；写入结束后，数组前半部分恰好包含所有非零元素，其余位置都应为零。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 方法二：同向双指针

`slow` 指向下一个非零元素应放置的位置，`fast` 负责寻找非零元素。发现非零元素时，交换 `nums[slow]` 和 `nums[fast]`，再令 `slow` 后移。

遍历到 `fast` 之前时，数组满足：

- `[0, slow)` 是已处理的非零元素，顺序与原数组一致；
- `[slow, fast)` 全部为零。

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int slow = 0;
        for (int fast = 0; fast < nums.size(); fast++) {
            if (nums[fast] == 0) {
                continue;
            }
            swap(nums[slow], nums[fast]);
            slow++;
        }
    }
};
```

交换后，当前非零元素进入 `[0, slow]` 的末尾；被换到 `fast` 位置的元素只能是零或自身，因此上述区间性质继续成立。遍历结束后，所有非零元素都已稳定地移到前面，零位于末尾。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 易错点

- 不能直接删除零再追加，这会改变数组长度，通常还会引入额外空间或 $O(n^2)$ 的移动开销。
- 题目要求保持非零元素的相对顺序，不能使用普通的左右交换把任意零换到末尾。
- `slow` 表示写入位置，不是当前找到的零的数量。

## 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题目](https://leetcode.cn/problems/move-zeroes/)
