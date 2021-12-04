---
layout: post
title: TypeScript 类型系统
author: wzhzzmzzy
date: 2019-5-16
categories: Tech
tags: 
    - 前端
    - TypeScript
description: 这一篇是TS类型系统的笔记，包含类型推论、类型兼容和高级类型。
---

##  类型推论 ##

TypeScript中的类型是在哪里、如何被推断的呢？理解这个有助于我们在编写代码时更好地预测编译器的行为，避免一些难以被发现的Bug的出现。

### 简单例子 ###

没有明确指出类型的地方，类型推论会帮助提供类型：

```typescript
let x = 3; // x: Int
```

这种推断发生在初始化变量和成员，设置默认参数值和决定函数返回值时。大多数情况下，类型推论是直截了当地。后面我们来看一些细微的差别。

### 最佳通用类型 ###

我们很多时候会写出类型有些难以推断的混合表达式，最简单的例子就是同时包含的不同类型的元素的列表：

```typescript
let x = [0, 1, null];
```

由于需要推断`x`的类型，编译器会检查列表中所有元素的类型，然后选择能覆盖所有类型的选项。没有找到最佳通用类型的情况下，类型推断的结果是联合数组类型。

### 上下文类型 ###

TypeScript类型推论也可能按照相反的方向进行。 这被叫做“按上下文归类”。按上下文归类会发生在表达式的类型与所处的位置相关时。比如：

```typescript
window.onmousedown = function(mouseEvent) {
    console.log(mouseEvent.button);  //<- Error
};
```

这里，编译器会抛出一个类型错误。TypeScript 通过`window.onmousedown`来判断了`mouseEvent`的类型。你可以手动指定`mouseEvent: Any`，这样就不会报错了。

```typescript
window.onmousedown = function(mouseEvent: any) {
    console.log(mouseEvent.button);  //<- Now, no error is given
};
```

这个函数表达式有明确的参数类型注解，上下文类型被忽略。 这样的话就不报错了，因为这里不会使用到上下文类型。

## 类型兼容性 ##

TypeScript 的类型兼容是基于结构中的子类型的，而不是基于类型名义的。也就是说，只要结构子类型相同或包含，就可以使用。TypeScript的结构性子类型是根据JavaScript代码的典型写法来设计的。 因为JavaScript里广泛地使用匿名对象，例如函数表达式和对象字面量，所以使用结构类型系统来描述这些类型比使用名义类型系统更好。

```typescript
interface Named {
    name: string;
}

class Person {
    name: string;
}

let p: Named;
// OK, because of structural typing
p = new Person();
```

>  #### 关于可靠性的注意事项
>
> TypeScript的类型系统允许某些在编译阶段无法确认其安全性的操作。下面会解释何时会发生这种情况，以及它有利的一面。

### 开始 ###

TypeScript 结构化类型系统的基本规则是，如果`x`要兼容`y`，那么`y`至少具有与`x`相同的属性。

```typescript
interface Named {
    name: string;
}

let x: Named;
// y's inferred type is { name: string; location: string; }
let y = { name: 'Alice', location: 'Seattle' };
x = y;
```

这里要检查`y`是否能赋值给`x`，编译器检查`x`中的每个属性，看是否能在`y`中也找到对应属性。 在这个例子中，`y`必须包含名字是`name`的`string`类型成员。`y`满足条件，因此赋值正确。检查函数参数时也会使用相同的规则。

这个比较过程是递归进行的，检查每个成员及子成员。

### 比较两个函数 ###

相对来讲，在比较原始类型和对象类型的时候是比较容易理解的，问题是如何判断两个函数是兼容的。 下面我们从两个简单的函数入手，它们仅是参数列表略有不同：

```ts
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x; // OK
x = y; // Error
```

要查看`x`是否能赋值给`y`，首先看它们的参数列表。 `x`的每个参数必须能在`y`里找到对应类型的参数。 注意的是参数的名字相同与否无所谓，只看它们的类型。 这里，`x`的每个参数在`y`中都能找到对应的参数，所以允许赋值。

第二个赋值错误，因为`y`有个必需的第二个参数，但是`x`并没有，所以不允许赋值。

你可能会疑惑为什么允许`忽略`参数，像例子`y = x`中那样。 原因是忽略额外的参数在JavaScript里是很常见的。 例如，`Array#forEach`给回调函数传3个参数：数组元素，索引和整个数组。 尽管如此，传入一个只使用第一个参数的回调函数也是很有用的：

```ts
let items = [1, 2, 3];

// Don't force these extra arguments
items.forEach((item, index, array) => console.log(item));

// Should be OK!
items.forEach((item) => console.log(item));
```

下面来看看如何处理返回值类型，创建两个仅是返回值类型不同的函数：

```ts
let x = () => ({name: 'Alice'});
let y = () => ({name: 'Alice', location: 'Seattle'});

x = y; // OK
y = x; // Error, because x() lacks a location property
```

类型系统强制源函数的返回值类型必须是目标函数返回值类型的子类型。

#### 函数参数双向协变 ####

当比较函数参数类型时，只有当源函数参数能够赋值给目标函数或者反过来时才能赋值成功。 这是不稳定的，因为调用者可能传入了一个具有更精确类型信息的函数，但是调用这个传入的函数的时候却使用了不是那么精确的类型信息。 实际上，这极少会发生错误，并且能够实现很多JavaScript里的常见模式。

#### 可选参数及剩余参数 ####

比较函数兼容性的时候，可选参数与必须参数是可互换的。 源类型上有额外的可选参数不是错误，目标类型的可选参数在源类型里没有对应的参数也不是错误。

当一个函数有剩余参数时，它被当做无限个可选参数。

这对于类型系统来说是不稳定的，但从运行时的角度来看，可选参数一般来说是不强制的，因为对于大多数函数来说相当于传递了一些`undefinded`。

有一个好的例子，常见的函数接收一个回调函数并用对于程序员来说是可预知的参数但对类型系统来说是不确定的参数来调用：

```ts
function invokeLater(args: any[], callback: (...args: any[]) => void) {
    /* ... Invoke callback with 'args' ... */
}

// Unsound - invokeLater "might" provide any number of arguments
invokeLater([1, 2], (x, y) => console.log(x + ', ' + y));

// Confusing (x and y are actually required) and undiscoverable
invokeLater([1, 2], (x?, y?) => console.log(x + ', ' + y));
```

#### 函数重载 ####

对于有重载的函数，源函数的每个重载都要在目标函数上找到对应的函数签名。 这确保了目标函数可以在所有源函数可调用的地方调用。

### 枚举 ###

不同类型的枚举不兼容。枚举类型与数字类型兼容。

### 类 ###

类与对象字面量和接口差不多，但有一点不同：类有静态部分和实例部分的类型。比较两个类类型的对象时，只有实例的成员会被比较。 静态成员和构造函数不在比较的范围内。

#### 类的私有成员和受保护成员 ####

类的私有成员和受保护成员会影响兼容性。 当检查类实例的兼容时，如果目标类型包含一个私有成员，那么源类型必须包含来自同一个类的这个私有成员。 同样地，这条规则也适用于包含受保护成员实例的类型检查。 这允许子类赋值给父类，但是不能赋值给其它有同样类型的类。

### 泛型 ###

因为TypeScript是结构性的类型系统，类型参数只影响使用其做为类型一部分的结果类型。比如，

```ts
interface Empty<T> {
}
let x: Empty<number>;
let y: Empty<string>;

x = y;  // OK, because y matches structure of x
```

上面代码里，`x`和`y`是兼容的，因为它们的结构使用类型参数时并没有什么不同。 把这个例子改变一下，增加一个成员，就能看出是如何工作的了：

```ts
interface NotEmpty<T> {
    data: T;
}
let x: NotEmpty<number>;
let y: NotEmpty<string>;

x = y;  // Error, because x and y are not compatible
```

在这里，泛型类型在使用时就好比不是一个泛型类型。

对于没指定泛型类型的泛型参数时，会把所有泛型参数当成`any`比较。 然后用结果类型进行比较，就像上面第一个例子。

## 高级类型 ##

### 交叉类型（Intersection Types） ###

交叉类型是将多个类型合并为一个类型。 例如， `Person & Serializable & Loggable`同时是 `Person` *和*`Serializable` *和* `Loggable`。 就是说这个类型的对象同时拥有了这三种类型的成员。我们大多是在混入（mixins）或其它不适合典型面向对象模型的地方看到交叉类型的使用。

### 联合类型（Union Types） ###

联合类型与交叉类型很有关联，但是使用上却完全不同。联合类型表示一个值可以是几种类型之一。 我们用竖线（ `|`）分隔每个类型，所以 `number | string | boolean`表示一个值可以是 `number`， `string`，或 `boolean`。

如果一个值是联合类型，我们只能访问此联合类型的所有类型里共有的成员。

```ts
interface Bird {
    fly();
    layEggs();
}

interface Fish {
    swim();
    layEggs();
}

function getSmallPet(): Fish | Bird {
    // ...
}

let pet = getSmallPet();
pet.layEggs(); // okay
pet.swim();    // errors
```

这里的联合类型可能有点复杂，但是你很容易就习惯了。 如果一个值的类型是 `A | B`，我们能够 *确定*的是它包含了 `A` *和* `B`中共有的成员。 这个例子里， `Bird`具有一个 `fly`成员。 我们不能确定一个`Bird | Fish`类型的变量是否有 `fly`方法。 如果变量在运行时是 `Fish`类型，那么调用`pet.fly()`就出错了。

### 类型保护与区分类型（Type Guards and Differentiating Types） ###

联合类型适合于那些值可以为不同类型的情况。但当我们想确切地了解是否为 `Fish`时怎么办？ 使用类型断言：

```ts
let pet = getSmallPet();

if ((<Fish>pet).swim) {
    (<Fish>pet).swim();
}
else {
    (<Bird>pet).fly();
}
```

#### 用户自定义的类型保护 ####

我们不得不多次使用类型断言去判断类型。如果我们只需要检查一次，在两个分支中都能知道类型就好了。这里可以使用类型保护机制：

```ts
function isFish(pet: Fish | Bird): pet is Fish {
    return (<Fish>pet).swim !== undefined;
}

if (isFish(pet)) {
    pet.swim();
}
else {
    pet.fly();
}
```

每当使用一些变量调用 `isFish`时，TypeScript会将变量缩减为那个具体的类型，只要这个类型与变量的原始类型是兼容的。注意TypeScript不仅知道在 `if`分支里 `pet`是 `Fish`类型； 它还清楚在 `else`分支里，一定 *不是*`Fish`类型，一定是 `Bird`类型。

#### `typeof`与`instanceof`类型保护 ####

这两个关键字 JavaScript 中常用的判断类型的关键字，在使用联合类型与类型保护时也有用途。

```ts
// typeof
function padLeft(value: string, padding: string | number) {
    if (typeof padding === "number") {
        return Array(padding + 1).join(" ") + value;
    }
    if (typeof padding === "string") {
        return padding + value;
    }
    throw new Error(`Expected string or number, got '${padding}'.`);
}

// instanceof
// 类型为 XObject | YObject
let padder: Padder = getRandomObject();

if (padder instanceof XObject) {
    padder; // 类型细化为'XObject'
}
if (padder instanceof YObject) {
    padder; // 类型细化为'YObject'
}
```

### 可以为`null`的类型 ###

TypeScript具有两种特殊的类型， `null`和 `undefined`。默认情况下，类型检查器认为 `null`与 `undefined`可以赋值给任何类型。这也意味着，你阻止不了将它们赋值给其它类型，就算是你想要阻止这种情况也不行。 `null`的发明者，Tony Hoare，称它为 [价值亿万美金的错误](https://en.wikipedia.org/wiki/Null_pointer#History)。

`--strictNullChecks`标记可以解决此错误：当你声明一个变量时，它不会自动地包含 `null`或 `undefined`。 你可以使用联合类型明确的包含它们：

```ts
let s = "foo";
s = null; // 错误, 'null'不能赋值给'string'
let sn: string | null = "bar";
sn = null; // 可以

sn = undefined; // error, 'undefined'不能赋值给'string | null'
```

注意，按照JavaScript的语义，TypeScript会把 `null`和 `undefined`区别对待。 `string | null`， `string | undefined`和 `string | undefined | null`是不同的类型。

#### 可选参数和可选属性 ####

使用了 `--strictNullChecks`，可选参数会被自动地加上 `| undefined`:

```ts
function f(x: number, y?: number) {
    return x + (y || 0);
}
f(1, 2);
f(1);
f(1, undefined);
f(1, null); // error, 'null' is not assignable to 'number | undefined'
```

可选属性也会有同样的处理：

```ts
class C {
    a: number;
    b?: number;
}
let c = new C();
c.a = 12;
c.a = undefined; // error, 'undefined' is not assignable to 'number'
c.b = 13;
c.b = undefined; // ok
c.b = null; // error, 'null' is not assignable to 'number | undefined'
```

#### 类型保护和类型断言 ####

由于可以为null的类型是通过联合类型实现，那么你需要使用类型保护来去除 `null`。 幸运地是这与在JavaScript里写的代码一致：

```ts
function f(sn: string | null): string {
    if (sn == null) {
        return "default";
    }
    else {
        return sn;
    }
}
```

这里很明显地去除了 `null`，你也可以使用短路运算符：

```ts
function f(sn: string | null): string {
    return sn || "default";
}
```

如果编译器不能够去除 `null`或 `undefined`，你可以使用类型断言手动去除。 语法是添加 `!`后缀：`identifier!`从 `identifier`的类型里去除了 `null`和 `undefined`：

```ts
function broken(name: string | null): string {
  function postfix(epithet: string) {
    return name.charAt(0) + '.  the ' + epithet; // error, 'name' is possibly null
  }
  name = name || "Bob";
  return postfix("great");
}

function fixed(name: string | null): string {
  function postfix(epithet: string) {
    return name!.charAt(0) + '.  the ' + epithet; // ok
  }
  name = name || "Bob";
  return postfix("great");
}
```

本例使用了嵌套函数，因为编译器无法去除嵌套函数的null（除非是立即调用的函数表达式）。 因为它无法跟踪所有对嵌套函数的调用，尤其是你将内层函数做为外层函数的返回值。 如果无法知道函数在哪里被调用，就无法知道调用时 `name`的类型。

### 类型别名 ###

类型别名会给一个类型起个新名字。 类型别名有时和接口很像，但是可以作用于原始值，联合类型，元组以及其它任何你需要手写的类型。起别名不会新建一个类型 - 它创建了一个新 *名字*来引用那个类型。 给原始类型起别名通常没什么用，尽管可以做为文档的一种形式使用。

同接口一样，类型别名也可以是泛型 - 我们可以添加类型参数并且在别名声明的右侧传入：

```ts
type Container<T> = { value: T };
```

我们也可以使用类型别名来在属性里引用自己：

```ts
type Tree<T> = {
    value: T;
    left: Tree<T>;
    right: Tree<T>;
}
```

与交叉类型一起使用，我们可以创建出一些十分稀奇古怪的类型。

```ts
type LinkedList<T> = T & { next: LinkedList<T> };

interface Person {
    name: string;
}

var people: LinkedList<Person>;
var s = people.name;
var s = people.next.name;
var s = people.next.next.name;
var s = people.next.next.next.name;
```

然而，类型别名不能出现在声明右侧的任何地方。

```ts
type Yikes = Array<Yikes>; // error
```

#### 接口 vs. 类型别名 ####

类型别名可以像接口一样；然而，仍有一些细微差别。

其一，接口创建了一个新的名字，可以在其它任何地方使用。其二，类型别名不能被 `extends`和 `implements`（自己也不能 `extends`和`implements`其它类型）。 

另一方面，如果你无法通过接口来描述一个类型并且需要使用联合类型或元组类型，这时通常会使用类型别名。

### 字符串字面量类型 ###

字符串字面量类型允许你指定字符串必须的固定值。 

```ts
type Easing = "ease-in" | "ease-out" | "ease-in-out";
```

你只能从三种允许的字符中选择其一来做为参数传递，传入其它值则会产生错误。

```text
Argument of type '"uneasy"' is not assignable to parameter of type '"ease-in" | "ease-out" | "ease-in-out"'
```

字符串字面量类型还可以用于区分函数重载：

```ts
function createElement(tagName: "img"): HTMLImageElement;
function createElement(tagName: "input"): HTMLInputElement;
// ... more overloads ...
function createElement(tagName: string): Element {
    // ... code goes here ...
}
```

### 数字字面量类型 ###

TypeScript还具有数字字面量类型。

```ts
function rollDie(): 1 | 2 | 3 | 4 | 5 | 6 {
    // ...
}
```

我们很少直接这样使用，但它们可以用在缩小范围调试bug的时候：

```ts
function foo(x: number) {
    if (x !== 1 || x !== 2) {
        //         ~~~~~~~
        // Operator '!==' cannot be applied to types '1' and '2'.
    }
}
```

换句话说，当 `x`与 `2`进行比较的时候，它的值必须为 `1`，这就意味着上面的比较检查是非法的。

### 可辨识联合（Discriminated Unions） ###

你可以合并单例类型，联合类型，类型保护和类型别名来创建一个叫做 *可辨识联合*的高级模式，它也称做 *标签联合*或 *代数数据类型*。 可辨识联合在函数式编程很有用处。 一些语言会自动地为你辨识联合；而TypeScript则基于已有的JavaScript模式。 它具有3个要素：

1. 具有普通的单例类型属性— *可辨识的特征*。
2. 一个类型别名包含了那些类型的联合— *联合*。
3. 此属性上的类型保护。

```ts
interface Square {
    kind: "square";
    size: number;
}
interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}
interface Circle {
    kind: "circle";
    radius: number;
}
```

首先我们声明了将要联合的接口。 每个接口都有 `kind`属性但有不同的字符串字面量类型。 `kind`属性称做 *可辨识的特征*或 *标签*。 其它的属性则特定于各个接口。 注意，目前各个接口间是没有联系的。 下面我们把它们联合到一起：

```ts
type Shape = Square | Rectangle | Circle;
```

现在我们使用可辨识联合:

```ts
function area(s: Shape) {
    switch (s.kind) {
        case "square": return s.size * s.size;
        case "rectangle": return s.height * s.width;
        case "circle": return Math.PI * s.radius ** 2;
    }
}
```

