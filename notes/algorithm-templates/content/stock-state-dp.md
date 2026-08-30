---
title: "状态机 DP：股票买卖"
category: "动态规划"
order: 63
problems:
  - "122. 买卖股票的最佳时机 II"
  - "714. 买卖股票的最佳时机含手续费"
keywords:
  - "状态机DP"
  - "股票"
  - "持有"
  - "未持有"
tags:
  - "状态机"
  - "持有/未持有"
  - "股票"
---

```cpp
int maxProfit(vector<int>& prices) {
    int hold = -prices[0];
    int cash = 0;
    for (int i = 1; i < (int) prices.size(); i++) {
        int newCash = max(cash, hold + prices[i]);
        int newHold = max(hold, cash - prices[i]);
        cash = newCash;
        hold = newHold;
    }
    return cash;
}
```
