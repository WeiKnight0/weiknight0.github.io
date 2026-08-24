---
title: Two Pointers 双指针
date: 2026-07-10
lang: zh-cn
---

# Two Pointers 双指针

双指针不是一种固定算法，而是一类用两个位置变量协同移动来减少枚举量的技巧。常见目标是把 $O(n^2)$ 的枚举降到 $O(n)$ 或 $O(n \log n)$。

# 类型总结

| 类型 | 适用场景 | 代表题 |
| --- | --- | --- |
| 同向双指针 | 原地整理、按条件分区 | 移动零 |
| 倒序双指针 | 正向写会覆盖未处理数据 | 复写零 |
| 快慢指针 | 判环、中点、循环过程 | 快乐数 |
| 对撞指针 | 左右夹逼、舍弃不可能答案 | 盛最多水的容器 |
| 排序 + 对撞指针 | 两数/三数求和、去重 | 三数之和 |

# Move Zeroes 移动零

题目描述：给定一个整数数组 `nums`，将所有 `0` 移动到数组末尾，同时保持非零元素的相对顺序。

要求：必须在原数组上操作，不能复制一个额外数组。

示例：

```text
输入：nums = [0,1,0,3,12]
输出：[1,3,12,0,0]
```

```text
输入：nums = [0]
输出：[0]
```

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

# Duplicate Zeros 复写零

题目描述：给定一个固定长度的整数数组 `arr`，把数组中出现的每个 `0` 都复写一遍，并把后面的元素向右平移。

要求：数组长度不变，超出数组长度的位置直接丢弃；必须原地修改数组，不返回新数组。

示例：

```text
输入：arr = [1,0,2,3,0,4,5,0]
输出：[1,0,0,2,3,0,0,4]
解释：最后一个 0 复写后会超过数组长度，因此被丢弃。
```

```text
输入：arr = [1,2,3]
输出：[1,2,3]
```

思路：
- 如果从左往右写，可能覆盖还没有处理的元素。
- 先用 `cur` 和 `dest` 找到最后一个会被写入的位置。
- 再从右往左写，这样不会覆盖未处理元素。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    int cur = 0;
    int dest = -1;

    while (cur < n) {
        if (arr[cur] == 0) {
            dest += 2;
        } else {
            dest += 1;
        }
        if (dest >= n - 1) {
            break;
        }
        cur++;
    }

    if (dest == n) {
        arr[n - 1] = 0;
        cur--;
        dest -= 2;
    }

    while (cur >= 0) {
        if (arr[cur] == 0) {
            arr[dest--] = 0;
            arr[dest--] = 0;
        } else {
            arr[dest--] = arr[cur];
        }
        cur--;
    }

    for (int i = 0; i < n; i++) {
        if (i > 0) {
            cout << ' ';
        }
        cout << arr[i];
    }
    cout << '\n';

    return 0;
}
```

# Happy Number 快乐数

题目描述：编写一个算法判断正整数 `n` 是否是快乐数。

快乐数定义：每次把 `n` 替换为它每一位数字的平方和，重复这个过程。如果最终变成 `1`，那么它是快乐数；如果进入无限循环且始终无法变成 `1`，那么它不是快乐数。

示例：

```text
输入：n = 19
输出：true
解释：
1^2 + 9^2 = 82
8^2 + 2^2 = 68
6^2 + 8^2 = 100
1^2 + 0^2 + 0^2 = 1
```

```text
输入：n = 2
输出：false
```

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

# Container With Most Water 盛最多水的容器

题目描述：给定一个长度为 `n` 的整数数组 `height`。第 `i` 条垂线的两个端点是 `(i, 0)` 和 `(i, height[i])`。选择其中两条线，使它们和 x 轴共同构成一个容器，返回容器可以容纳的最大水量。

注意：容器不能倾斜。

示例：

```text
输入：height = [1,8,6,2,5,4,8,3,7]
输出：49
解释：选择高度为 8 和 7 的两条线，宽度为 7，面积为 min(8, 7) * 7 = 49。
```

```text
输入：height = [1,1]
输出：1
```

思路：
- 左右指针分别指向两端。
- 当前面积是 `min(height[left], height[right]) * (right - left)`。
- 每次移动较短的一边。

为什么移动较短边：如果固定较短边并向内移动另一边，宽度变小，高度上限仍然不超过较短边，所以面积不可能变大。

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

# Three Sum 三数之和

题目描述：给定一个整数数组 `nums`，判断是否存在三元组 `[nums[i], nums[j], nums[k]]`，满足 `i != j`、`i != k`、`j != k`，并且 `nums[i] + nums[j] + nums[k] == 0`。

返回所有和为 `0` 且不重复的三元组。答案中不能包含重复三元组，输出顺序不限。

示例：

```text
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：
nums[0] + nums[1] + nums[2] = -1 + 0 + 1 = 0
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0
nums[0] + nums[3] + nums[4] = -1 + 2 + (-1) = 0
去重后答案为 [-1,-1,2] 和 [-1,0,1]。
```

```text
输入：nums = [0,1,1]
输出：[]
```

```text
输入：nums = [0,0,0]
输出：[[0,0,0]]
```

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

四数之和是三数之和的扩展：排序后枚举前两个数，再对剩余区间使用对撞指针。注意使用 `long long` 防止溢出。

# 常见坑

- 是否需要排序：三数之和这类题通常需要先排序，移动零不需要。
- 是否需要去重：返回方案列表时通常需要去重；只返回数量或最大值时不一定需要。
- 指针移动条件必须来自单调性，否则不能随便移动。
- 原地写数组时，先判断正向写会不会覆盖未处理数据；如果会，考虑倒序写。
- 快慢指针不只用于链表，也可以用于任何会进入循环的状态转移过程。

# 参考

- [【算法】双指针算法（全）](https://blog.csdn.net/2301_76710832/article/details/136879702)
