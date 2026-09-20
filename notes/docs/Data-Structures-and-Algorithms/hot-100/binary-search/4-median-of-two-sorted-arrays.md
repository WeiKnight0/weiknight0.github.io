---
title: 4. 寻找两个正序数组的中位数
date: 2026-09-07
lang: zh-cn
---

给定两个非递减数组 `nums1` 和 `nums2`，返回它们合并后的中位数。要求算法的时间复杂度为 $O(\log(m+n))$。

[题目链接](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

## 示例

### 示例 1

- 输入：`nums1 = [1,3], nums2 = [2]`
- 输出：`2.00000`
- 解释：合并后为 `[1,2,3]`，中位数是 `2`

### 示例 2

- 输入：`nums1 = [1,2], nums2 = [3,4]`
- 输出：`2.50000`
- 解释：合并后为 `[1,2,3,4]`，中位数是 $(2+3)/2=2.5$

## 数据范围

- $0 \leq m,n \leq 1000$
- $1 \leq m+n \leq 2000$
- $-10^6 \leq nums1[i], nums2[i] \leq 10^6$
- 两个数组都按非递减顺序排列

## 在较短数组中寻找划分线

分别在两个数组中放置划分线。`nums1` 左侧取 `i` 个元素，`nums2` 左侧取 `j` 个元素，并令左侧元素总数为

$$
i+j=\left\lfloor\frac{m+n+1}{2}\right\rfloor
$$

这样奇数长度时左侧比右侧多一个元素，偶数长度时两侧数量相同。一个合法划分需要满足：

$$
nums1[i-1]\leq nums2[j],\qquad nums2[j-1]\leq nums1[i]
$$

也就是左侧所有元素都不大于右侧所有元素。固定 `i` 后，`j` 随之确定，因此只需在较短数组中二分 `i`：

- `nums1` 左边界过大，即 `left1 > right2`，需要减小 `i`；
- `nums2` 左边界过大，即 `left2 > right1`，需要增大 `i`；
- 两个条件都不成立，当前划分合法。

划分线落在数组边界时，用负无穷或正无穷补足缺失的边界值。

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) {
            return findMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.size(), n = nums2.size();
        int left = 0, right = m;
        int leftSize = (m + n + 1) / 2;

        while (true) {
            int i = left + (right - left) / 2;
            int j = leftSize - i;
            int left1 = i == 0 ? INT_MIN : nums1[i - 1];
            int right1 = i == m ? INT_MAX : nums1[i];
            int left2 = j == 0 ? INT_MIN : nums2[j - 1];
            int right2 = j == n ? INT_MAX : nums2[j];

            if (left1 > right2) {
                right = i - 1;
                continue;
            }
            if (left2 > right1) {
                left = i + 1;
                continue;
            }
            if ((m + n) % 2 == 1) {
                return max(left1, left2);
            }
            return (max(left1, left2) + min(right1, right2)) / 2.0;
        }
    }
};
```

合法划分使左侧数量符合中位数定义，并保证左侧最大值不大于右侧最小值。总长度为奇数时，中位数是左侧最大值；总长度为偶数时，中位数是左侧最大值与右侧最小值的平均数。二分调整始终朝唯一的合法划分移动。

- 时间复杂度：$O(\log\min(m,n))$
- 空间复杂度：$O(1)$

## 易错点

- 必须在较短数组上二分，否则由 `j = leftSize - i` 得到的下标可能越界。
- 奇数长度时左侧要多放一个元素，所以使用 `(m + n + 1) / 2`。
- 空数组和划分线位于端点的情况由 `INT_MIN`、`INT_MAX` 统一处理。
- 偶数长度必须除以 `2.0`，避免整数除法。

## 参考

- [项目现有二分查找笔记](../../algorithms/techniques/binary-search.md)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/median-of-two-sorted-arrays/solutions/)
