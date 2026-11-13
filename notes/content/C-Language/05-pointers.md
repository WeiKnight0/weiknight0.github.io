---
title: C Pointers 指针
date: 2026-08-27
lang: zh-cn
tags:
  - C
  - Pointer
  - Exam
---

# C Pointers 指针

指针是 C 语言最高频、最容易混合考察的主题：它会和数组、字符串、函数参数、结构体、动态内存和文件一起出现。做题时始终先回答三个问题：**指针变量里是什么地址、该地址指向什么类型、该对象现在是否仍有效。**

## 1. 声明、取地址与解引用

`int *p;` 中的 `*` 属于声明符，表示 `p` 是“指向 `int` 的指针”；它不表示已经有可用的 `int` 对象。`&x` 取得 `x` 的地址，`*p` 访问 `p` 指向的对象。

```c
#include <stdio.h>

int main(void)
{
    int value;
    int *pointer;

    value = 10;
    pointer = &value;
    *pointer = *pointer + 5;
    printf("%d\n", value);
    return 0;
}
```

输出为 `15`。`pointer` 自身保存地址，`*pointer` 才是 `value` 这个 `int` 对象。

`int *a, b;` 中只有 `a` 是指针，`b` 是 `int`。为避免这类题，实际编程中每行只声明一个指针变量。

## 2. 空指针、野指针与有效期

`NULL` 表示不指向任何对象。它可以与指针比较，但不能解引用。声明后的未初始化指针是野指针；`free` 后仍保存旧地址的指针也是悬空指针。

```c
int *pointer;

pointer = NULL;
if (pointer != NULL) {
    *pointer = 1;
}
```

安全检查必须在解引用**之前**。局部自动变量所在函数返回后生命周期结束，不能返回它的地址；动态分配的对象在 `free` 后也不能访问。

## 3. 指针算术与数组退化

若 `p` 的类型为 `T *`，则 `p + 1` 指向下一个 `T` 对象，地址增加 **`sizeof(T)`，也就是 `sizeof(*p)`** 个字节。它不关心变量名叫不叫 `p`，也不按 `p` 变量自身或 `&p` 的大小移动。

因此先把任意表达式看成“某种 `T *`”，再看 `T` 是什么；`T` 可以是 `int`、结构体、指针，甚至整个数组类型。只有同一个数组及其尾后一位置之间的指针算术、比较和相减有定义。对单个对象 `&x + 1` 可以形成“尾后一位置”，但绝对不能解引用它。

### 数组退化：从数组类型到首元素指针

数组对象本身的类型不会改变。除了作为 `sizeof`、一元 `&` 的操作数外，数组类型的表达式都会发生**数组到指针转换**：转换为指向第一个元素的指针。C11 还有 `_Alignof` 这个不发生转换的例外；字符串字面量用于初始化字符数组时也不按这个规则处理。

判断类型只做两步：先写出数组的**完整原始类型**，再删掉最外层的 `[...]`；删掉后剩下的类型就是“元素类型”，数组名退化后的类型便是“元素类型 `*`”。

例如原始类型是 `int [2][3]`：删掉最外层 `[2]` 后，元素类型是 `int [3]`；因此 `matrix` 退化为“指向 `int [3]` 的指针”，即 `int (*)[3]`。不是 `int **`。

```c
int one[4];
int matrix[2][3];
int cube[4][2][3];
```

| 原始数组类型 | 数组名表达式 | 退化后的类型 | 第一个元素的类型 |
| --- | --- | --- | --- |
| `int [4]` | `one` | `int *` | `int`，即 `one[0]` |
| `int [2][3]` | `matrix` | `int (*)[3]` | `int [3]`，即第一行 `matrix[0]` |
| `int [4][2][3]` | `cube` | `int (*)[2][3]` | `int [2][3]`，即第一个二维块 `cube[0]` |

对数组名，先去掉最外层维度，再加 `*`：`a[4]` 的 `a` 是 `int *`，`matrix[2][3]` 的 `matrix` 是 `int (*)[3]`，`cube[4][2][3]` 的 `cube` 是 `int (*)[2][3]`。`&数组名` 不退化，指向整个数组。

| 表达式 | 类型 | `+1` 跨过 |
| --- | --- | --- |
| `a`，其中 `int a[4]` | `int *` | 一个 `int` |
| `&a` | `int (*)[4]` | 整个 `int[4]` |
| `matrix`，其中 `int matrix[2][3]` | `int (*)[3]` | 一行 `int[3]` |
| `&matrix` | `int (*)[2][3]` | 整个 `int[2][3]` |
| `p`，其中 `int *p` | `int *` | 一个 `int` |
| `&p` | `int **` | 一个指针变量 |

`a[i]` 等价于 `*(a + i)`；`a + 4` 与 `&a + 1` 都是尾后一位置，但类型不同，不能混用。标准 C 不允许对 `void *` 做指针算术。

## 4. `*p++`、`(*p)++` 与 `*++p`

后缀 `++` 的优先级高于一元 `*`：

| 写法 | 等价写法 | 效果 |
| --- | --- | --- |
| `*p++` | `*(p++)` | 取原 `p` 指向的值，再移动指针 |
| `(*p)++` | 无需改写 | 指针不动，指向的值加 1 |
| `*++p` | `*(++p)` | 先移动指针，再取新位置的值 |

程序阅读题不要在同一复杂表达式里混合这些写法。拆成多行后先写出 `p` 指向哪个下标，再写出元素值变化。

## 5. 字符串与 `char *`

```c
char text[] = "cat";
char *read_only = "cat";
```

`text` 是可修改的字符数组；`read_only` 指向字符串字面量，不能写 `read_only[0] = 'C';`。函数参数 `char *text` 表示函数可能修改字符串，`const char *text` 表示只读。

遍历字符串的典型条件是 `*pointer != '\0'`，而不是指针本身是否为 `NULL`：前者判断字符串结束，后者判断是否拥有有效字符串地址。

## 6. 指针作为函数参数

C 的参数传递始终是值传递。传递地址后，函数得到的是地址副本，但可借此修改该地址指向的调用者对象。

```c
#include <stdio.h>

void swap(int *left, int *right)
{
    int temp;

    temp = *left;
    *left = *right;
    *right = temp;
}

int main(void)
{
    int a;
    int b;

    a = 3;
    b = 5;
    swap(&a, &b);
    printf("%d %d\n", a, b);
    return 0;
}
```

数组形参的退化与长度传递见[第四章：函数参数传递](./04-arrays-and-strings.md#3-函数参数传递)。

## 7. 真正二维数组与 `int **`

两者都能写 `matrix[i][j]`，但存储模型不同，不能互相赋值。

| 声明 | 内存模型 | 表达式中的类型 | `matrix + 1` |
| --- | --- | --- | --- |
| `int matrix[2][3];` | 两行连续存放 | `int (*)[3]` | 跳过一行 3 个 `int` |
| `int (*matrix)[3];` | 指向连续行 | `int (*)[3]` | 跳过一行 3 个 `int` |
| `int *matrix[2];` | 两个行指针 | `int **` | 跳过一个 `int *` |
| `int **matrix;` | 指向行指针 | `int **` | 跳过一个 `int *` |

`int matrix[2][3]` 的首元素是一整行 `int[3]`，所以它退化为 `int (*)[3]`；`int **` 的首元素却必须是 `int *`。因此下面的赋值错误：

```c
int table[2][3];
int **wrong;

wrong = table;  /* table 是 int (*)[3]，不是 int **。 */
```

行指针模型的每行可以独立分配、长度也可以不同；真正二维数组的所有元素连续。二维数组形参和 `sizeof` 的规则见[第四章：函数参数传递](./04-arrays-and-strings.md#3-函数参数传递)。

## 8. 二级指针与修改指针本身

若函数需要让调用者的指针改为指向新对象，就传入该指针的地址，即使用二级指针。

```c
#include <stdio.h>
#include <stdlib.h>

int allocate_one(int **out)
{
    *out = malloc(sizeof **out);
    if (*out == NULL) {
        return 0;
    }
    **out = 42;
    return 1;
}

int main(void)
{
    int *value;

    value = NULL;
    if (!allocate_one(&value)) {
        return 1;
    }
    printf("%d\n", *value);
    free(value);
    return 0;
}
```

`int *p` 用于修改 `*p`；`int **p` 用于修改调用者的 `int *` 变量本身。`malloc` 的大小写成 `sizeof **out` 能随目标类型变化，且不必重复写类型名。

## 9. `const` 与结构体指针

| 声明 | 可修改什么 |
| --- | --- |
| `const int *p` | 不能通过 `p` 修改 `*p`，可改 `p` 指向 |
| `int *const p` | 可改 `*p`，不能改 `p` 指向 |
| `const int *const p` | 两者都不能改 |
| `const struct Student *p` | 可读结构体成员，不能经 `p` 修改成员 |

结构体指针成员访问 `p->id` 等价于 `(*p).id`。

## 10. 函数指针与复杂声明

读复杂声明时，从变量名开始，按**右、左、右、左**的顺序向外读；括号决定结合关系。最容易混淆的是：变量名后直接跟 `(...)`，它是“函数”；变量名先被 `(*...)` 包住，它才是“指向函数的指针”。

| 声明 | 从名字向外读 | 类型含义 |
| --- | --- | --- |
| `int add(int, int);` | `add` 是函数，接收两个 `int`，返回 `int` | 普通函数 |
| `int (*operation)(int, int);` | `operation` 是指针，指向接收两个 `int`、返回 `int` 的函数 | 函数指针 |
| `int *find(int *, int);` | `find` 是函数，接收 `int *` 和 `int`，返回 `int *` | 返回指针的函数，不是函数指针 |
| `int *(*chooser)(int *, int *, int);` | `chooser` 是指针，指向接收三个参数、返回 `int *` 的函数 | 返回指针的函数的指针 |
| `int (*operations[2])(int, int);` | `operations` 是含 2 个元素的数组；元素是指针，指向接收两个 `int`、返回 `int` 的函数 | 函数指针数组 |
| `int (*factory(void))(int, int);` | `factory` 是函数；返回一个指针；该指针指向接收两个 `int`、返回 `int` 的函数 | 返回函数指针的函数 |

`int *find(...)` 中 `find(...)` 先结合，所以它是一个函数，返回类型为 `int *`。而 `int (*operation)(...)` 中括号迫使 `*operation` 先结合，才表示 `operation` 是指针。C 函数不能返回函数或数组，但能返回“指向函数的指针”。

下面一个程序同时覆盖常考的四种形式：

```c
#include <stdio.h>

int add(int left, int right)
{
    return left + right;
}

int subtract(int left, int right)
{
    return left - right;
}

int *choose_value(int *left, int *right, int choose_right)
{
    return choose_right ? right : left;
}

int main(void)
{
    int first;
    int second;
    int (*operation)(int, int);
    int *(*chooser)(int *, int *, int);
    int (*operations[2])(int, int);

    first = 10;
    second = 4;
    operation = add;
    chooser = choose_value;
    operations[0] = add;
    operations[1] = subtract;
    printf("%d %d %d\n", operation(first, second),
           *chooser(&first, &second, 1), operations[1](first, second));
    return 0;
}
```

输出为 `14 4 6`。函数名 `add` 在赋值或传参时会转换为函数指针 `&add`；调用时 `operation(first, second)` 与 `(*operation)(first, second)` 等价。`operations[1]` 先从数组取出一个函数指针，再完成调用。

当同一种函数指针反复出现时，用 `typedef` 降低复杂度：

```c
typedef int (*BinaryOperation)(int, int);

BinaryOperation operation;
BinaryOperation operations[2];
BinaryOperation factory(int use_add);
```

这里 `BinaryOperation` 仍然是“指向函数的指针类型”，不是函数类型；最后一行的 `factory` 是“返回函数指针的函数”。回调形参同样遵循这个写法，例如 `qsort` 的比较函数类型为 `int (*compare)(const void *, const void *)`。

## 11. 指针题检查表

- 每一次 `*p` 前，`p` 是否已初始化、非空且仍指向有效对象？
- 看清 `p + 1` 的单位：它按指向类型移动，不是固定加 1 字节。
- 先分辨 `a`、`&a[0]`、`&a`，再计算地址和 `sizeof`；二维数组还要分清 `int (*)[列数]` 和 `int **`。
- 函数要修改对象传 `T *`；函数要修改调用者的指针传 `T **`。
- 函数指针声明先从名字向外读：`name(...)` 是函数，`(*name)(...)` 才是函数指针；函数指针数组的 `[]` 紧跟变量名。
- 字符串字面量不可写，字符数组容量要包含 `\0`。
- 用括号消除 `*p++`、`(*p)++`、`*++p` 的歧义；遇到释放后使用、越界和无效比较，应答“未定义行为”。
