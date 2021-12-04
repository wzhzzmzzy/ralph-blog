---
layout: post
title: JavaScript 笔记（三）：一些细枝末节
author: wzhzzmzzy
date: 2019-6-1
categories: Tech
tags: 
    - 前端
    - JavaScript
description: 读 JavaScript 权威指南时做一些笔记。毕竟已经差不多用了一年 JS 了，系统地再复习一遍好了，这几天 看博客发现欠缺的似乎都是一些细节、DOM编程，以及 NodeJS 等。
---

## 语法细节 ##

### 变量作用域 ###

全局变量自然拥有全局作用域，不过在 JavaScript 任何一个运行环境：NodeJS、浏览器，似乎其实都不存在一个全局环境。浏览器下最大的作用域是`<script>`，NodeJS的作用域也顶多是在一个文件模块内部。

函数体内部，局部`var`变量的优先级高于同名的全局`var`变量。

```js
var scope = "global";
function checkscope() {
    var scope = "local";
    return scope;
}
checkscope();
```

### 函数作用域与声明提前 ###

下面这个函数中，在不同的位置定义了变量`i`，`j`，`k`，但是这三个变量都可以在整个函数范围内访问到。

```js
function test(o) {
    var i = 0;
    if (typeof o == "object") {
        var j = 0;
        for (var k = 0; k < 10; ++k) {
            console.log(k);
        }
        console.log(k);
    }
    console.log(j);
}
```

这个函数其实与下面的写法是等价的：

```js
function test(o) {
    var i = 0, j, k;
    if (typeof o == "object") {
        j = 0;
        for (k = 0; k < 10; ++k) {
            console.log(k);
        }
        console.log(k);
    }
    console.log(j);
}
```

下面这段代码也可能有一些歧义，我们可以联合上面提到的声明提前与变量作用域这两点来理解他：

```js
var scope = "global";
function f() {
	console.log(scope);
    var scope = "local";
    console.log(scope);
}
```

可能你会觉得函数第一行的输出是`global`，但是其实是`undefined`。所以，多用`let`。

### 作用域链 ###

JS 是基于作用域链的，每一段 JS 代码都有一个与之相关的作用域链。

什么是作用域链呢？我们可以这样理解，作用域链就是一个链表，链表的每一个节点上记录了一个作用域，这个作用域有自己的变量。比如对于全局环境而言，链表只有一个节点，就是全局环境；对于非嵌套的函数而言，全局环境之上还有一个函数作用域，其中记录了形参和局部变量；嵌套函数自然还有自己的函数作用域。

当使用变量时，会自上而下查找作用域链，一旦找到了，就会直接返回，这就解释了为什么全局变量会被局部变量覆盖，也导致了后面要讲到的闭包现象。

### 继承 ###

大家都知道 JS 有个神秘的 `prototype`，有时候觉得无法理解。下面是一个示例`inherit`函数：

```js
function inherit(p) {
    if (p === null) throw TypeError();
    if (Object.create)
        return Object.create(p);
    var t = typeof p;
    if (t !== "object" && t !== "function") throw TypeError();
    function f() {};
    f.prototype = p;
    return new f();
}
```

取值和赋值都会对原型链进行查找，以此来判断如何对对象的属性进行修改。对于对象来说，原型是只读的，也就是大家无法对对象的原型进行修改，除非通过`defineProperty`。

### 命名空间 ###

在过去的 ES5 时代，大家可以通过函数来实现命名空间。也就是，通过立即执行函数来执行一些命名空间的初始化操作，生成一些封装好的工具。

```js
var myModule = (function {
    var test = "test";
    return function() {console.log(test)};
}());
```

### 闭包 ###

所谓闭包，就是当我们使用嵌套函数时，可以用它来保存函数内的局部变量。这是因为作用域链的原因。对于函数中声明的嵌套函数，其作用域链肯定是外部函数高于全局变量的，所以外部函数的变量环境在嵌套函数中会获得保留。

只用文字描述一定有些抽象，有一个简单的例子：

```js
var scope = "global scope";
function checkscope() {
    var scope = "local scope";
    function f() { return scope; }
    return f;
}
checkscope()(); // local scope
```

有什么用呢？可以使用闭包来灵活地生成一些有着完全封闭的私有变量的函数，避免恶意改动。

### 异步、同步加载 ###

`<script>`标签可以有`defer`和`async`属性，一般来说，这些属性只在和`src`属性联合使用时才有效，但是有些浏览器还支持延迟的内联脚本。

`async`和`defer`都是告诉浏览器，可以在下载脚本的同时继续解析和渲染文档，`defer`属性让浏览器延迟脚本的执行直到文档载入和解析完成，`async`让浏览器可以尽快执行脚本，而不用在下载脚本的同事阻塞文档解析。

顺便，如果同时具有这两个属性，那么浏览器会使用`async`，而不是`defer`。

当然，在不支持`async`的浏览器里，可以动态创建`<script>`元素并插入到文档当中：

```js
function loadsync(url) {
    var head = document.getElementsByTagName("head")[0];
    var s = document.createElement("script");
    s.src = url;
    head.appendChild(s);
}
```

## 浏览器相关 ##

### 事件驱动 ###

JavaScript 是事件驱动的。一般而言，我们更多时候是在监听事件、绑定处理函数，而不是做一些时刻处在运行状态的脚本，那样低效且难以维护。

通常，我们推荐使用`addEventListener`而不是直接对DOM元素的`onxxx`属性赋值来进行事件的监听，因为这样可以添加多个监听函数，而不是只能绑定一个。

这里有一个小小的使用`setTimeout`的点子，也就是使用`setTimeout`来人为添加异步队列。因为`setTimeout`不会立即执行函数，而是在定时结束之后将函数放入任务队列，所以我们可以：

```js
function onLoad(f) {
    if (onLoad.loaded)
        window.setTimeout(f, 0); // 通过 setTimeout 将 f 放入之后的队列
    else if (window.addEventListener)
        window.addEventListener("load", f, false);
    else if (window.attachEvent)
        window.attachEvent("onload", f);
}
onLoad.loaded = false;
onLoad(function() { onLoad.loaded = true; });
```

### 浏览器时间线 ###

1. 创建 Document 对象，并且开始解析 Web 页面，解析 HTML 元素和文本内容后添加 Element 对象和 Text 节点到文档中。这个阶段`document.readyState === "loadging"`。
2. 当遇到没有`async`和`defer`的`<script>`元素时，会将这些元素添加到文档中，然后执行脚本。并且在脚本执行的同时，脚本会同步执行，并且在脚本下载和执行的同时，解析器会暂停。
3. 当解析器遇到了设置了`async`属性的`<script>`元素，会开始下载脚本，然后尽快运行，并继续解析文档。脚本会在它下载完成之后尽快执行，但是解析器没有停下来等他下载。异步脚本禁止使用`document.write()`方法。
4. 当文档完成解析之后，`document.readyState === "interactive"`。
5. 所有有`defer`属性的脚本，会按照他们在文档里出现的顺序执行，异步脚本可能也会在这个时间执行。延迟脚本能访问完整的文档树，但是禁止使用`document.write()`。
6. Document 对象触发`DOMContentLoaded`事件，标志着程序执行从同步转换到了异步事件驱动阶段。
7. 这时，文档已经完全解析，但是浏览器可能还在等待其他内容载入。所有内容完成载入，所有异步脚本也执行完成，`document.readyState`属性改变为`"complete"`，浏览器触发`window`对象上的`load`事件。
8. 到这时，才会进入下一个异步任务队列。

这是理想的时间线，但是在不同浏览器中有差异。所有浏览器都支持`load`事件，它才是决定文档载入并且可以操作的最通用的技术。

### 跨站脚本（Cross-site scripting） ###

所谓 XSS 攻击也就是直接将用户输入添加到 HTML 文档中。可以使用脚本注入直接在站点内执行其他脚本，来获取用户。这是非常危险的攻击。例如：

```html
<script>
var name = decodeURIComponent(window.location.search.substring(1)) || "";
document.write("Hello " + name);
</script>
```

这样就可以在站点上执行远端脚本，从而进行一些入侵。

### window 对象 ###

`window`对象有着很多浏览器的 API。

#### 浏览器和屏幕信息 ####

通过`window`的`navigator`和`screen`两个对象可以获取到相关的信息。

#### 打开和关闭窗口 ####

`window.open`载入指定的 URL 到新的或已经存在的窗口中，并且返回代表那个窗口的`window`对象。

`open`的第一个参数是 URL，第二个参数时新打开的窗口的名字。如果是一个已经存在的窗口的名字，那么就会直接使用已经存在的窗口。否则，会打开新的窗口。需要注意的是，脚本无法通过猜测窗口的名字来操控窗口中的 Web 应用。一般来说，只有文档是来自同源的，或者确实是由同一个脚本打开的才会生效。

`windows.open`是广告商用来弹窗的手段，所以一般来说如果不是用户点击导致的弹窗，会被浏览器所屏蔽。

`window.close`可以关闭一个窗口。

### IndexedDB ###

可以认为 `IndexedDB`是一个浏览器环境下内置的 NoSQL。`IndexedDB`限制只有同源的网站可以相互访问内容，不同源的就不可以。每个源可以有任意数目的数据库，但是名字在当前源内需要是唯一的。

`IndexedDB`提供原子性保证，也就是对数据库的 CURD 操作是包含在一个事务内部的。这个数据库内，所有操作都是异步的，当成功或者失败的时候，会触发`success`和`error`事件。