---
title: C Control Flow 选择、循环与流程控制
date: 2026-08-27
lang: zh-cn
tags:
  - C
  - Control Flow
---

# C Control Flow 选择、循环与流程控制

## 1. `if` 与悬空 `else`

`else` 总是匹配最近的、尚未匹配的 `if`。嵌套分支必须使用花括号表达真实意图。

```c
if (score >= 60) {
    if (score >= 90) {
        printf("excellent\n");
    }
} else {
    printf("failed\n");
}
```

## 2. `switch` 的规则

`switch` 的控制表达式必须是整型或枚举类型；`case` 后是整型常量表达式，不能使用普通变量。`break` 退出最近一层 `switch` 或循环；省略 `break` 会继续贯穿到下一 `case`。

```c
switch (grade) {
case 'A':
case 'B':
    printf("pass\n");
    break;
case 'C':
    printf("review\n");
    break;
default:
    printf("invalid grade\n");
    break;
}
```

`default` 不是必须的，但输入分类题通常应保留它处理异常值。

## 3. 三种循环

| 循环 | 特点 | 适用场景 |
| --- | --- | --- |
| `while (condition)` | 先判断再执行 | 次数未知、条件驱动 |
| `do { ... } while (condition);` | 至少执行一次 | 菜单、读入后验证 |
| `for (init; condition; step)` | 初始化一次，条件在每轮前判断 | 计数、遍历数组 |

```c
#include <stdio.h>

int main(void)
{
    int i;
    int sum;

    sum = 0;
    for (i = 1; i <= 100; i = i + 1) {
        sum = sum + i;
    }
    printf("%d\n", sum);
    return 0;
}
```

循环变量若为无符号类型，不能用 `i >= 0` 判断倒序结束，因为它永远为真；应使用更安全的边界设计。

## 4. `break`、`continue`、`return`、`goto`

- `break`：结束最近一层循环或 `switch`，不会跳出所有嵌套循环。
- `continue`：跳过本轮剩余语句。`for` 仍会执行步进表达式；`while`/`do-while` 回到条件判断。
- `return`：立即结束当前函数；`main` 返回 `0` 通常表示成功。
- `goto`：可用于集中清理资源，但一般题目不需要；滥用会破坏控制流可读性。

## 5. 常用题型：计数、累加与标志位

```c
#include <stdio.h>

int main(void)
{
    int n;
    int i;
    int found;

    n = 37;
    found = 0;
    for (i = 2; i * i <= n; i = i + 1) {
        if (n % i == 0) {
            found = 1;
            break;
        }
    }
    printf("%s\n", found ? "composite" : "prime");
    return 0;
}
```

读程序时写出每轮循环前后的 `i`、累加器和标志位；不要只在脑中模拟。

## 考试检查表

- `switch` 的每个分支是否有意省略或保留 `break`？
- 循环边界是 `< n` 还是 `<= n`？数组下标是否越界？
- `continue` 在 `for` 与 `while` 中跳过的语句是否相同？
- 条件表达式中赋值是否误写成比较？
