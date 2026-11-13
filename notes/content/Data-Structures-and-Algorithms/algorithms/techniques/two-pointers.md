---
title: Two Pointers 双指针
date: 2026-07-10
lang: zh-cn
---

双指针是一类用两个位置变量协同移动来减少枚举量的技巧。

# 双指针

| 类型 | 适用场景 | 代表题 |
| --- | --- | --- |
| 同向双指针 | 原地整理、按条件分区 | 移动零 |
| 倒序双指针 | 正向写会覆盖未处理数据 | 复写零 |
| 快慢指针 | 判环、中点、循环过程 | 快乐数 |
| 对撞指针 | 左右夹逼、舍弃不可能答案 | 盛最多水的容器 |
| 排序 + 对撞指针 | 两数/三数求和、去重 | 三数之和 |
| 三指针 | 同时维护三个单调位置或边界 | 等差三元组、区间子数组个数 |

## Move Zeroes 移动零

题目描述：给定一个整数数组 `nums`，将所有 `0` 移动到数组末尾，同时保持非零元素的相对顺序。

要求：必须在原数组上操作，不能复制一个额外数组。

示例：

**示例 1：**

- 输入：`nums = [0,1,0,3,12]`

- 输出：`[1,3,12,0,0]`

**示例 2：**

- 输入：`nums = [0]`

- 输出：`[0]`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- `cur` 从左到右扫描数组。
- `dest` 表示下一个非零元素应该放的位置。
- 遇到非零元素，就和 `dest` 位置交换，然后 `dest++`。

区间含义：
- `[0, dest)`：已经放好的非零元素。
- `[dest, cur)`：已经处理过的零元素。
- `[cur, n)`：还没处理的元素。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    int dest = 0;
    for (int cur = 0; cur < n; cur++) {
        if (nums[cur] != 0) {
            swap(nums[dest], nums[cur]);
            dest++;
        }
    }

    for (int i = 0; i < n; i++) {
        if (i > 0) {
            cout << ' ';
        }
        cout << nums[i];
    }
    cout << '\n';

    return 0;
}
```

</details>

## Duplicate Zeros 复写零

题目描述：给定一个固定长度的整数数组 `arr`，把数组中出现的每个 `0` 都复写一遍，并把后面的元素向右平移。

要求：数组长度不变，超出数组长度的位置直接丢弃；必须原地修改数组，不返回新数组。

示例：

**示例 1：**

- 输入：`arr = [1,0,2,3,0,4,5,0]`

- 输出：`[1,0,0,2,3,0,0,4]`

- 解释：最后一个 0 复写后会超过数组长度，因此被丢弃。

**示例 2：**

- 输入：`arr = [1,2,3]`

- 输出：`[1,2,3]`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- `i` 从右到左扫描数组。**从右到左是因为如果从左到右，会覆盖后面的元素。如果是新开一个数组则可以使用，但题目要求原地修改**。
- `j` 表示在复写0后的新数组中，`i` 位置的元素应该对应的位置。
- 如果 `j` 越界了，则不复制；否则复制 `arr[i]` 到 `arr[j]` 处。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> a(n);
    for (int &x : a) cin >> x;

    int cnt = 0;
    for (int x : a)
        if (x == 0) cnt++; // 0 的个数

    int i = n - 1;
    int j = n + cnt - 1; // 新数组长为 n+cnt，最后一个位置为 n+cnt-1

    while (i >= 0) {
        if (a[i] == 0) {
            if (j < n) a[j] = 0;
            j--;

            if (j < n) a[j] = 0;
            j--;

            i--;
        } else {
            if (j < n) a[j] = a[i];
            i--;
            j--;
        }
    }

    for (int i = 0; i < n; i++) {
        cout << a[i] << (i == n - 1 ? '\n' : ' ');
    }

    return 0;
}
```

</details>

## Happy Number 快乐数

题目描述：编写一个算法判断正整数 `n` 是否是快乐数。

快乐数定义：每次把 `n` 替换为它每一位数字的平方和，重复这个过程。如果最终变成 `1`，那么它是快乐数；如果进入无限循环且始终无法变成 `1`，那么它不是快乐数。

示例：

**示例 1：**

- 输入：`n = 19`

- 输出：`true`

- 解释：`1^2 + 9^2 = 82 → 8^2 + 2^2 = 68 → 6^2 + 8^2 = 100 → 1^2 + 0^2 + 0^2 = 1`

**示例 2：**

- 输入：`n = 2`

- 输出：`false`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 把每次变化看成链表中的“下一个节点”。
- 如果不是快乐数，变化过程会进入环。
- 用快慢指针判环：`slow` 每次走一步，`fast` 每次走两步。
- 相遇后判断相遇点是否为 `1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int nextNumber(int n) {
    int sum = 0;
    while (n > 0) {
        int digit = n % 10;
        sum += digit * digit;
        n /= 10;
    }
    return sum;
}

int main() {
    int n;
    cin >> n;

    int slow = n;
    int fast = nextNumber(n);

    while (slow != fast) {
        slow = nextNumber(slow);
        fast = nextNumber(nextNumber(fast));
    }

    cout << (slow == 1 ? "true" : "false") << '\n';
    return 0;
}
```

</details>

## Container With Most Water 盛最多水的容器

题目描述：给定一个长度为 `n` 的整数数组 `height`。第 `i` 条垂线的两个端点是 `(i, 0)` 和 `(i, height[i])`。选择其中两条线，使它们和 x 轴共同构成一个容器，返回容器可以容纳的最大水量。

注意：容器不能倾斜。

示例：

**示例 1：**

- 输入：`height = [1,8,6,2,5,4,8,3,7]`

- 输出：`49`

- 解释：选择高度为 8 和 7 的两条线，宽度为 7，面积为 min(8, 7) * 7 = 49。

**示例 2：**

- 输入：`height = [1,1]`

- 输出：`1`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 左右指针分别指向两端。
- 当前面积是 `min(height[left], height[right]) * (right - left)`。
- 每次移动较短的一边。如果固定较短边并向内移动另一边，宽度变小，高度上限仍然不超过较短边，所以面积不可能变大。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> height(n);
    for (int i = 0; i < n; i++) {
        cin >> height[i];
    }

    int left = 0;
    int right = n - 1;
    int ans = 0;

    while (left < right) {
        int h = min(height[left], height[right]);
        int w = right - left;
        ans = max(ans, h * w);

        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

## Three Sum 三数之和

题目描述：给定一个整数数组 `nums`，判断是否存在三元组 `[nums[i], nums[j], nums[k]]`，满足 `i != j`、`i != k`、`j != k`，并且 `nums[i] + nums[j] + nums[k] == 0`。

返回所有和为 `0` 且不重复的三元组。答案中不能包含重复三元组，输出顺序不限。

示例：

**示例 1：**

- 输入：`nums = [-1,0,1,2,-1,-4]`

- 输出：`[[-1,-1,2],[-1,0,1]]`

- 解释：`-1 + 0 + 1 = 0`、`0 + 1 + (-1) = 0`、`-1 + 2 + (-1) = 0`；去重后答案为 `[-1,-1,2]` 和 `[-1,0,1]`。

**示例 2：**

- 输入：`nums = [0,1,1]`

- 输出：`[]`

**示例 3：**

- 输入：`nums = [0,0,0]`

- 输出：`[[0,0,0]]`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 先排序。
- 枚举第一个数 `nums[i]`。
- 在右侧区间用左右指针找两数之和 `-nums[i]`。
- 对 `i`、`left`、`right` 都要去重。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    sort(nums.begin(), nums.end());
    vector<vector<int>> ans;

    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) {
            continue;
        }
        if (nums[i] > 0) {
            break;
        }

        int left = i + 1;
        int right = n - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum < 0) {
                left++;
            } else if (sum > 0) {
                right--;
            } else {
                ans.push_back({nums[i], nums[left], nums[right]});
                left++;
                right--;

                while (left < right && nums[left] == nums[left - 1]) {
                    left++;
                }
                while (left < right && nums[right] == nums[right + 1]) {
                    right--;
                }
            }
        }
    }

    for (auto &triple : ans) {
        cout << triple[0] << ' ' << triple[1] << ' ' << triple[2] << '\n';
    }

    return 0;
}
```

</details>

# Three Pointers 三指针

三指针在一次扫描中同时维护三个位置，并利用有序性或边界的单调变化，避免指针回退。只要每个指针从头到尾最多移动 $n$ 次，总时间复杂度仍然是 $O(n)$。

常见形式：

| 形式 | 三个位置的含义 | 计数方式 |
| --- | --- | --- |
| 三个有序值 | 分别寻找三元组的第一、第二、第三项 | 三个值同时满足关系时计数 |
| 一个右端点 + 两个边界 | 枚举子数组右端点，维护合法起点范围 | 合法起点区间长度 |
| 三个有序序列 | 每个指针指向一个序列的当前元素 | 移动当前值最小的指针 |

“三数之和”虽然也使用 `i`、`left`、`right` 三个位置，但 `left` 和 `right` 会随每个 `i` 重新扫描，因此复杂度为 $O(n^2)$。下面的等差三元组中，三个指针在整个算法中都不回退，所以复杂度为 $O(n)$。

## Arithmetic Triplets 等差三元组的数目

题目描述：给定一个严格递增数组 `nums` 和正整数 `diff`，统计满足下列条件的三元组 `(i, j, k)` 数量：

$$
i<j<k,\quad nums[j]-nums[i]=diff,\quad nums[k]-nums[j]=diff
$$

示例：

**示例 1：**

- 输入：`nums = [0,1,4,6,7,10], diff = 3`

- 输出：`2`

- 解释：满足条件的是 (1,4,7) 和 (4,7,10)。

<details class="note-solution">
<summary>查看解析</summary>

枚举第三项 `nums[k]` 时，前两项只能是 `nums[k] - 2 * diff` 和 `nums[k] - diff`：

- `j` 指向第一个不小于 `nums[k] - diff` 的元素。
- 只有 `nums[j] == nums[k] - diff` 时，才继续寻找第一项。
- `i` 指向第一个不小于 `nums[j] - diff` 的元素。
- 数组严格递增，因此每个目标值至多出现一次；随着 `k` 增大，两个目标值也增大，`i` 和 `j` 都不需要回退。

```cpp
int arithmeticTriplets(const vector<int>& nums, int diff) {
    int ans = 0;
    int i = 0;
    int j = 0;

    for (int k = 0; k < nums.size(); k++) {
        while (nums[j] < nums[k] - diff) {
            j++;
        }
        if (nums[j] != nums[k] - diff) {
            continue;
        }

        while (nums[i] < nums[j] - diff) {
            i++;
        }
        if (nums[i] == nums[j] - diff) {
            ans++;
        }
    }

    return ans;
}
```

三个指针都只向右移动，时间复杂度为 $O(n)$，额外空间复杂度为 $O(1)$。

</details>

## Number of Subarrays with Bounded Maximum 区间子数组个数

题目描述：给定数组 `nums` 和两个整数 `lower`、`upper`，统计最大元素位于闭区间 `[lower, upper]` 的非空连续子数组数量。

示例：

**示例 1：**

- 输入：`nums = [2,1,4,3], lower = 2, upper = 3`

- 输出：`3`

- 解释：满足条件的子数组是 [2]、[2,1] 和 [3]。

<details class="note-solution">
<summary>查看解析</summary>

枚举子数组右端点 `right`，另外维护两个位置：

- `lastInvalid`：最近一个大于 `upper` 的元素位置。子数组左端点必须在它右侧，否则最大值会超过 `upper`。
- `lastInRange`：最近一个位于 `[lower, upper]` 的元素位置。子数组左端点不能在它右侧，否则子数组中的所有值都可能小于 `lower`。

因此，对于固定的 `right`，合法左端点满足：

$$
lastInvalid<left\le lastInRange
$$

本轮新增的合法子数组数量为：

$$
\max(0,lastInRange-lastInvalid)
$$

以示例为例：

| `right` | `nums[right]` | `lastInvalid` | `lastInRange` | 新增数量 |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 2 | -1 | 0 | 1 |
| 1 | 1 | -1 | 0 | 1 |
| 2 | 4 | 2 | 0 | 0 |
| 3 | 3 | 2 | 3 | 1 |

```cpp
int numSubarrayBoundedMax(const vector<int>& nums, int lower, int upper) {
    int ans = 0;
    int lastInvalid = -1;
    int lastInRange = -1;

    for (int right = 0; right < nums.size(); right++) {
        if (nums[right] > upper) {
            lastInvalid = right;
        }
        if (nums[right] >= lower && nums[right] <= upper) {
            lastInRange = right;
        }
        ans += max(0, lastInRange - lastInvalid);
    }

    return ans;
}
```

`right`、`lastInvalid` 和 `lastInRange` 都单调向右，时间复杂度为 $O(n)$，额外空间复杂度为 $O(1)$。

同类题：

- [2563. 统计公平数对的数目](https://leetcode.cn/problems/count-the-number-of-fair-pairs/)：排序后同时维护满足和的下界与上界。
- [2444. 统计定界子数组的数目](https://leetcode.cn/problems/count-subarrays-with-fixed-bounds/)：维护最近的非法位置、`minK` 位置和 `maxK` 位置。
- [1213. 三个有序数组的交集](https://leetcode.cn/problems/intersection-of-three-sorted-arrays/)：每个数组各使用一个指针。

</details>

# 常见坑

- 是否需要排序：三数之和这类题通常需要先排序，移动零不需要。
- 是否需要去重：返回方案列表时通常需要去重；只返回数量或最大值时不一定需要。
- 指针移动条件必须来自单调性，否则不能随便移动。
- 原地写数组时，先判断正向写会不会覆盖未处理数据；如果会，考虑倒序写。
- 快慢指针不只用于链表，也可以用于任何会进入循环的状态转移过程。

# 参考

- [LeetCode 2367. 等差三元组的数目](https://leetcode.cn/problems/number-of-arithmetic-triplets/)
- [LeetCode 795. 区间子数组个数](https://leetcode.cn/problems/number-of-subarrays-with-bounded-maximum/)
- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/0viNMK/)
