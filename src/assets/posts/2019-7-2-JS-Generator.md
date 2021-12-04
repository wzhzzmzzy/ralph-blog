---
layout: post
title: JavaScript Generator
author: wzhzzmzzy
date: 2019-7-2
categories: Tech
tags: 
    - 前端
    - JavaScript
description: JavaScript ES6 添加了 Generator 函数，与 Python Generator 非常类似，但是又有些不太一样。并且由于 JS 对 FP 思维方式依赖更强，就能够从 FP 的角度理解 Generator 是如何起作用的。
---

## 从 Iterator 讲起

与 Python 的 Iterable 类似，ES6 添加的 Iterator 支持也是通过获取 Iterable 对象的迭代器，然后通过`next`进行类似于惰性求值的工作。

下面是 Python Iterable 的示例：

```python
rangeIter = iter(range(3))
next(rangeIter)  # 0
next(rangeIter)  # 1
next(rangeIter)  # 2
next(rangeIter)

# throw StopIteration
```

然后是 JavaScript Iterable 示例：

```js
rangeIter = [1, 2, 3][Symbol.Iterator]
rangeIter.next() // { value: 1, done: false }
rangeIter.next() // { value: 2, done: false }
rangeIter.next() // { value: 3, done: false }
rangeIter.next() // { value: undefined, done: true }
```

## Generator

### 语法说明

Generator 函数是 ES6 标准中提供的异步编程解决方案，语法与 Python 类似：

```js
function* gen() {
    yield 1;
    yield 2;
    return 'end';
}
```

Generator 函数的调用方法与普通函数一样，也是在函数名后面加上一对圆括号。不同的是，调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，即 Iterator 对象。

下一步，必须调用遍历器对象的`next`方法，使得指针移向下一个状态。

`yield`表达式本身没有返回值，或者说总是返回`undefined`。`next`方法可以带一个参数，该参数就会被当作上一个yield表达式的返回值。

Generator 函数返回的遍历器对象，都有一个`throw`方法，可以在函数体外抛出错误，然后在 Generator 函数体内捕获。

```js
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log('内部捕获', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('外部捕获', e);
}
```
