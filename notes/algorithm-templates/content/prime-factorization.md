---
title: "质因数分解：最小质因子 LPF"
category: "数学"
order: 80
problems:
  - "2584. 分割数组使乘积互质"
  - "2709. 最大公约数遍历"
keywords:
  - "质因数分解"
  - "最小质因子"
  - "LPF"
  - "数论"
tags:
  - "数论"
  - "质因子"
  - "预处理"
---

```cpp
vector<int> buildLpf(int n) {
    vector<int> lpf(n + 1);
    for (int i = 2; i <= n; i++) {
        if (lpf[i]) continue;
        for (long long j = i; j <= n; j += i) {
            if (!lpf[j]) lpf[j] = i;
        }
    }
    return lpf;
}

vector<pair<int, int>> factorize(int x, vector<int>& lpf) {
    vector<pair<int, int>> ans;
    while (x > 1) {
        int p = lpf[x], e = 0;
        while (x % p == 0) {
            x /= p;
            e++;
        }
        ans.push_back({p, e});
    }
    return ans;
}
```
