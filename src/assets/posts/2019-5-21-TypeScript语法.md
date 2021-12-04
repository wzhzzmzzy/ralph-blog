---
layout: post
title: TypeScript 语法深入
author: wzhzzmzzy
date: 2019-5-16
categories: Tech
tags: 
    - 前端
    - TypeScript
description: TypeScript的一些其他语法部分详述。
---

##   迭代器和生成器 ##

当一个对象实现了`Symbol.iterator`，我们认为它是可迭代的。对象上的 `Symbol.iterator`函数负责返回供迭代的值。

#### `for...of`语句 与 `for...in`语句 ####

下面的例子展示了两者之间的区别：

```ts
let list = [4, 5, 6];

for (let i in list) {
    console.log(i); // "0", "1", "2",
}

for (let i of list) {
    console.log(i); // "4", "5", "6"
}
```

另一个区别是`for..in`可以操作任何对象；它提供了查看对象属性的一种方法。 但是 `for..of`关注于迭代对象的值。内置对象`Map`和`Set`已经实现了`Symbol.iterator`方法，让我们可以访问它们保存的值。

```ts
let pets = new Set(["Cat", "Dog", "Hamster"]);
pets["species"] = "mammals";

for (let pet in pets) {
    console.log(pet); // "species"
}

for (let pet of pets) {
    console.log(pet); // "Cat", "Dog", "Hamster"
}
```

## 模块 ##

TypeScript 中有着多种`export`形式和多种`import`形式，其他大多与 JavaScript 中的主流模块实现相仿：模块自声明、模块使用模块加载器去导入其他模块。

### 导出 ###

#### 导出声明 ####

任何声明都可以通过`export`来导出：

```ts
export interface StringValidator {
    isAcceptable(s: string): boolean;
}

export const numberRegexp = /^[0-9]+$/;

export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}
```

#### 导出语句 ####

``` ts 
export { ZipCodeValidator as mainValidator };
```

#### 重新导出 ####

我们经常会去扩展其它模块，并且只导出那个模块的部分内容。 重新导出功能并不会在当前模块导入那个模块或定义一个新的局部变量。

```ts
export {ZipCodeValidator as RegExpBasedZipCodeValidator} from "./ZipCodeValidator";
```

一个模块可以包裹多个模块，并且把他们导出的内容联合在一起：

```ts
export * from "./ZipCodeValidator";
```

### 导入 ###

```ts
import { ZipCodeValidator } from "./ZipCodeValidator";
import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
import * as validator from "./ZipCodeValidator";
import "./my-module.js"; // 副作用导入：尽管不推荐这么做，一些模块会设置一些全局状态供其它模块使用。 这些模块可能没有任何的导出或用户根本就不关注它的导出。 使用下面的方法来导入这类模块：
```

### 默认导出 ###

每个模块都可以有一个`default`导出。 默认导出使用 `default`关键字标记；并且一个模块只能够有一个`default`导出。 需要使用一种特殊的导入形式来导入 `default`导出。

##### JQuery.d.ts #####

```ts
declare let $: JQuery;
export default $;
```

类和函数声明可以直接被标记为默认导出。 标记为默认导出的类和函数的名字是可以省略的。

### `export =`和`import = require()` ###

`export =`语法定义一个模块的导出`对象`。 这里的`对象`一词指的是类，接口，命名空间，函数或枚举。

若使用`export =`导出一个模块，则必须使用TypeScript的特定语法`import module = require("module")`来导入此模块。

##### ZipCodeValidator.ts #####

```ts
let numberRegexp = /^[0-9]+$/;
class ZipCodeValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}
export = ZipCodeValidator;
```

##### Test.ts #####

```ts
import zip = require("./ZipCodeValidator");

// Some samples to try
let strings = ["Hello", "98052", "101"];

// Validators to use
let validator = new zip();

// Show whether each string passed each validator
strings.forEach(s => {
  console.log(`"${ s }" - ${ validator.isAcceptable(s) ? "matches" : "does not match" }`);
});
```

### 可选的模块加载和其他高级加载场景 ###

编译器会检测是否每个模块都会在生成的JavaScript中用到。 如果一个模块标识符只在类型注解部分使用，并且完全没有在表达式中使用时，就不会生成 `require`这个模块的代码。 省略掉没有用到的引用对性能提升是很有益的，并同时提供了选择性加载模块的能力。

## 命名空间 ##

使用`namespaces`可以让你更好地组织代码，避免重名、让代码结构更清晰。

```ts
namespace Student {
    export interface Boy {
        name: String;
    }
    export class Gay extends Boy {
        name: String;
    }
}
```

你也可以把名空间拆到多个文件当中：

##### `Student.ts` #####

```ts
namespace Student {
    export interface Boy {
        name: String;
    }
}
```

##### `Gay.ts` #####

```ts
/// <reference path="Student.ts">
namespace Student {
    export class Gay extends Boy {
        name: String;
    }
}
```

尽管是不同的文件，它们仍是同一个命名空间，并且在使用的时候就如同它们在一个文件中定义的一样。 因为不同文件之间存在依赖关系，所以我们加入了引用标签来告诉编译器文件之间的关联。 我们的测试代码保持不变。

### 别名 ###

另一种简化命名空间操作的方法是使用`import q = x.y.z`给常用的对象起一个短的名字。 不要与用来加载模块的 `import x = require('name')`语法弄混了，这里的语法是为指定的符号创建一个别名。 你可以用这种方法为任意标识符创建别名，也包括导入的模块中的对象。**对于值来讲， `import`会生成与原始符号不同的引用，所以改变别名的`var`值并不会影响原始变量的值。**

```ts
namespace Shapes {
    export namespace Polygons {
        export class Triangle { }
        export class Square { }
    }
}

import polygons = Shapes.Polygons;
let sq = new polygons.Square(); // Same as "new Shapes.Polygons.Square()"
```

### 使用其他的 JavaScript 库 ###

为了描述不是用TypeScript编写的类库的类型，我们需要声明类库导出的API。 由于大部分程序库只提供少数的顶级对象，命名空间是用来表示它们的一个好办法。

我们称其为声明是因为它不是外部程序的具体实现。 我们通常在 `.d.ts`里写这些声明。 如果你熟悉C/C++，你可以把它们当做 `.h`文件。

## 命名空间与模块 ##

### 使用命名空间 ###

命名空间是位于全局命名空间下的一个普通的带有名字的JavaScript对象。 这令命名空间十分容易使用。 它们可以在多文件中同时使用，并通过 `--outFile`结合在一起。 命名空间是帮你组织Web应用不错的方式，你可以把所有依赖都放在HTML页面的 `<script>`标签里。

但就像其它的全局命名空间污染一样，它很难去识别组件之间的依赖关系，尤其是在大型的应用中。

### 使用模块 ###

像命名空间一样，模块可以包含代码和声明。 不同的是模块可以 *声明*它的依赖。

模块会把依赖添加到模块加载器上（例如CommonJs / Require.js）。 对于小型的JS应用来说可能没必要，但是对于大型应用，这一点点的花费会带来长久的模块化和可维护性上的便利。 模块也提供了更好的代码重用，更强的封闭性以及更好的使用工具进行优化。

对于Node.js应用来说，模块是默认并推荐的组织代码的方式。

从ECMAScript 2015开始，模块成为了语言内置的部分，应该会被所有正常的解释引擎所支持。 因此，对于新项目来说推荐使用模块做为组织代码的方式。

