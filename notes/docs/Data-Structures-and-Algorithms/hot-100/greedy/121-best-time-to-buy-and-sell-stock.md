---
title: 121. 买卖股票的最佳时机
date: 2026-09-07
lang: zh-cn
---

给定数组 `prices`，其中 `prices[i]` 是第 `i` 天的股票价格。只能选择某一天买入，并在之后的某一天卖出，求一次交易可以获得的最大利润；若无法获利，返回 `0`。

[题目链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

## 示例

### 示例 1

- 输入：`prices = [7,1,5,3,6,4]`
- 输出：`5`
- 解释：价格为 `1` 时买入，之后在价格为 `6` 时卖出，利润为 `6-1=5`

### 示例 2

- 输入：`prices = [7,6,4,3,1]`
- 输出：`0`
- 解释：价格持续下降，不进行交易的利润最高

## 数据范围

- $1 \leq prices.length \leq 10^5$
- $0 \leq prices[i] \leq 10^4$

## 维护此前最低价格

若决定在第 `i` 天卖出，为了使利润最大，应当选择第 `i` 天之前的最低价格买入。因此从左到右扫描，只需维护：

- `minPrice`：截至当前日期见过的最低价格；
- `answer`：此前所有合法买卖日期组合中的最大利润。

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = prices[0];
        int answer = 0;

        for (int price : prices) {
            answer = max(answer, price - minPrice);
            minPrice = min(minPrice, price);
        }
        return answer;
    }
};
```

处理当天价格时，`minPrice` 是当天及此前的最低价格，所以 `price - minPrice` 是以当天为卖出日的最大利润。`answer` 取所有卖出日对应利润的最大值，因此覆盖全部合法交易。利润初值为 `0`，也覆盖不交易的情况。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 与动态规划的关系

也可以令 `dp[i]` 表示前 `i+1` 天能取得的最大利润：

$$
dp[i]=\max(dp[i-1],\ prices[i]-\min_{0\leq j<i}prices[j])
$$

状态只依赖前一天最大利润和前缀最低价格，压缩后就是上面的一次扫描，无需保存整个 `dp` 数组。

## 易错点

- 卖出必须发生在买入之后，不能直接用全局最大值减全局最小值。
- 本题只能完成一次交易，不能把所有相邻上涨的利润累加。
- 持续下跌时答案是 `0`，不能返回负利润。

## 参考

- [项目现有贪心笔记](../../algorithms/techniques/greedy.md)
- [灵茶山艾府：动态规划题单中的股票问题](https://leetcode.cn/discuss/post/tXLS3i/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/solutions/)
