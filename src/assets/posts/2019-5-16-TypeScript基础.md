---
layout: post
title: TypeScript 基础语法
author: wzhzzmzzy
date: 2019-5-16
categories: Tech
tags: 
    - 前端
    - TypeScript
description: TypeScript 是微软这几年最火的编程语言了，一直想找机会学一下，但是似乎没有很多时间。找时间仔细看一下他的语法详情，找关键的东西记录下来。
---

##  基础类型

TS 支持与 JS 几乎完全相同的基本数据类型，还添加了枚举类型。

- 布尔值（`boolean`）

- 数字（`number`）

- 字符串（`string`）

- 数组（`number[]`、`Array<number>`）

- 元组（`[string, number]`）

- 枚举：默认情况下，从`0`开始为元素编号。 你也可以手动的指定成员的数值。

  ```typescript
  enum Color {Red, Green, Blue}
  enum Color {Red = 1, Green = 2, Blue = 4}
  ```

- Any（`any`）

- Void（`void`)

- Null 和 Undefined（`null / undefined`）

- Never（`never`）：表示永不存在值的类型

- Object（`object`）：非原始类型

### 类型断言 ###

可以在编码时给代码动态添加类型，可以看做是类型转换。类型断言语法有两种，但是在 JSX 中只有 `as` 是被允许的。

```typescript
let s: any = "test string";
let s_len: number = (<string>s).length;
let s_len2: number = (s as string).length;
```

## 变量声明 ##

### `var` ###

过去 JavaScript 中最常见的变量声明符号。他的特点在于作用域：`var`声明可以在包含它的函数，模块，命名空间或全局作用域内部任何位置被访问。

还有一点会导致一些难以被发现的错误：变量被重复声明不会报错。

### `let` ###

为了解决`var`所存在的问题，ES6 提出了`let`关键字。`let`的不同之处在于，它的作用域是块作用域，也称为此法作用域。并且，`let`变量重定义是不允许的，

`let`还有一个特性是屏蔽，即在内部块作用域内可以声明同名变量，不会影响到外部变量。

### `const` ###

`const`关键字用于声明常量，不能被修改。

### 解构 ###

ES6中添加的解构赋值在 TypeScript 中也可以使用：

```typescript
// 数组解构
let input = [1, 2];
let [first, second] = input;
[second, first] = [first, second];

function foo([first, second]: [number, number]) { }
foo(input);

let [a] = [1, 2] // a === 1
let [, b, , c] = [1, 2, 3, 4] // b === 2 && c == 4

// 对象解构
let o = {a: "foo", b: "bar"};
let { c, d } = o;
({ d, e } = {a: "foo", b: "bar"});
let {f, ...g} = o;
```

#### 属性重命名 ####

这是一个混乱的语法，不太建议去使用。

```typescript
let { a: newName1, b: newName2 }= o;
let {a, b}: {a: string, b: number} = o;
```

#### 默认值 ####

当属性为`undefine`时给予默认值。函数参数默认值使用也是如此。

```typescript
function foo(o: { a: string, b?: number }) {
    let { a, b = 1001 } = o;
}
```

#### 函数声明 ####

解构当然也可以用于函数声明。当存在深层嵌套解构的时候，就算这时没有堆叠在一起的重命名，默认值和类型注解，也是令人难以理解的。

```typescript
type C = { a: string, b?: number }
function f1({ a, b }: C): void { }
function f2({ a="", b=0 } = {}): void { }
f();
```

### 展开 ###

展开操作符正与解构相反。 它允许你将一个数组展开为另一个数组，或将一个对象展开为另一个对象。 

```typescript
let first = [1, 2];
let second = [3, 4];
let bothPlus = [0, ...first, ...second, 5];

let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { ...defaults, food: "rich" };
```

注意，展开时后面的属性会覆盖前面的属性。另外，展开时对象本身的方法会丢失。

## 接口 ##

TypeScript 的核心原则之一是`Duck Typing`。也就是，编译器检查类型时，并不会严格地给变量打上一个“实现了这个接口”的标记，而是判断他的是否具备了接口的所有要求，如果具备了，那就可以算是该接口的类型。

```typescript
interface LabelledValue {
  label: string;
}

function printLabel(labelledObj: LabelledValue) {
  console.log(labelledObj.label);
}

let myObj = {size: 10, label: "Size 10 Object"};
printLabel(myObj);
```

### 可选属性 ###

声明接口时可以声明可选属性，只需要带一个`?`即可。

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}
```

### 只读属性 ###

可以给对象创建只读属性。

```typescript
interface Point {
    readonly x: number;
    readonly y: number;
}
```

TypeScript 添加了 `ReadonlyArray<T>`，与`Array<T>`相似，只是把所有的可变方法都去掉了，因此可以确保数组创建后再也不能被修改。`ReadonlyArray`不可以被整个赋值为一个普通数组，但是可以用类型断言重写。

### 额外的属性检查 ###

在使用接口时，有时会出现一些问题，比如将可选属性与接收接口指定类型的函数结合，你可能认为传入一个包含其他属性的对象也没问题，但是事实上，这是无法成功的。

```typescript
interface SquareConfig {
    color?: string;
    width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
    // ...
}

// error: 'colour' not expected in type 'SquareConfig'
let mySquare = createSquare({ colour: "red", width: 100 });

// 这样可以绕开检查
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);

// 最好的方法是给接口添加一个字符串索引签名
interface SquareConfig {
    color?: string;
    width?: number;
    [propName: string]: any;
}
```

### 函数类型 ###

函数当然也具有类型，也可以在接口声明，以下是一个函数接口的声明：

```typescript
interface SearchFunc {
  (source: string, subString: string): boolean;
}
// 对于函数，不会检查其中形参的名称是否符合声明，只要求对应位置上的参数类型是兼容的
let mySearch: SearchFunc = function(src: string, subStr: string) {
  let result = source.search(subString);
  return result > -1;
}
```

### 可索引的类型 ###

与使用接口描述函数类型差不多，我们也可以描述那些能够“通过索引得到”的类型，比如`a[10]`或`ageMap["daniel"]`。 可索引类型具有一个索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。 

```typescript
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0];
```

这里有个需要注意的地方：TypeScript 支持字符串和数字索引。可以同时使用两种类型，但是数字索引必须是字符串索引返回值的子类型。这是因为当使用 `number`来索引时，JavaScript会将它转换成`string`然后再去索引对象。 也就是说用 `100`（一个`number`）去索引等同于使用`"100"`（一个`string`）去索引，因此两者需要保持一致。

### 类类型 ###

#### 实现接口 ####

与C#或Java里接口的基本作用一样。

```typescript
interface ClockInterface {
    currentTime: Date;
    setTime(d: Date);
}

class Clock implements ClockInterface {
    currentTime: Date;
    setTime(d: Date) {
        this.currentTime = d;
    }
    constructor(h: number, m: number) { }
}
```

接口描述了类的公共部分，而不是公共和私有两部分。 它不会帮你检查类是否具有某些私有成员。

当我们想要用接口去描述一个类的构造函数的时候，我们可以将类描述为一个只包含构造函数的接口：

```typescript
interface ClockConstructor {
    new (hour: number, minute: number): ClockInterface;
}
interface ClockInterface {
    tick();
}

function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
    return new ctor(hour, minute);
}
class DigitalClock implements ClockInterface {
    constructor(h: number, m: number) { }
    tick() {
        console.log("beep beep");
    }
}
```

### 继承接口 ###

和类一样，接口也可以相互继承。一个接口可以继承多个接口，创建出多个接口的合成接口。

### 混合类型 ###

当需要描述混合类型的时候，接口也是可以胜任的。

```typescript
interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
}
```

### 接口继承类 ###

当接口继承了一个类类型时，它会继承类的成员但不包括其实现。

## 类 ##

### 类 ###

下面看一个使用类的例子。

```typescript
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}

let greeter = new Greeter("world");
```

### 继承 ###

在构造函数里访问 `this`的属性之前，我们 *一定*要调用 `super()`。 这个是TypeScript强制执行的一条重要规则。

```typescript
class Animal {
    name: string;
    constructor(theName: string) { this.name = theName; }
    move(distanceInMeters: number = 0) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
    }
}

class Snake extends Animal {
    constructor(name: string) { super(name); }
    move(distanceInMeters = 5) {
        console.log("Slithering...");
        super.move(distanceInMeters);
    }
}

class Horse extends Animal {
    constructor(name: string) { super(name); }
    move(distanceInMeters = 45) {
        console.log("Galloping...");
        super.move(distanceInMeters);
    }
}
```

### 公共、私有、受保护、只读 ###

默认为`public`，当然也可以明确标记；标记为`private`时，不可以在类外部访问；`protected`可以在派生类内访问。

属性还可以多一个`readonly`修饰符，必须有默认值或者在构造函数里赋值。

### 存取器 ###

TypeScript 中当然有`getter/setters`。

```typescript
let passcode = "secret passcode";

class Employee {
    private _fullName: string;

    get fullName(): string {
        return this._fullName;
    }

    set fullName(newName: string) {
        if (passcode && passcode == "secret passcode") {
            this._fullName = newName;
        }
        else {
            console.log("Error: Unauthorized update of employee!");
        }
    }
}
```

### 静态属性 ###

访问静态属性前面要加类名。

```typescript
class Grid {
    static origin = {x: 0, y: 0};
    calculateDistanceFromOrigin(point: {x: number; y: number;}) {
        let xDist = (point.x - Grid.origin.x);
        let yDist = (point.y - Grid.origin.y);
        return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale;
    }
    constructor (public scale: number) { }
}
```

### 抽象类 ###

抽象类不可以被实例化。

```typescript
abstract class Animal {
    abstract makeSound(): void;
    move(): void {
        console.log('roaming the earch...');
    }
}
```

### 构造函数的本质 ###

在声明一个类的时候，事实上是声明了一个构造函数：

```typescript
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}

let greeter: Greeter;
greeter = new Greeter("world");
console.log(greeter.greet());

// 编译后的 JavaScript
let Greeter = (function () {
    function Greeter(message) {
        this.greeting = message;
    }
    Greeter.prototype.greet = function () {
        return "Hello, " + this.greeting;
    };
    return Greeter;
})();

let greeter;
greeter = new Greeter("world");
console.log(greeter.greet());
```

### 把类当做接口使用 ###

你可以在任何使用接口的地方使用类。

## 函数 ##

在 TypeScript 中可以使用命名函数和匿名函数。函数可以使用函数外定义的变量。

### 函数类型 ###

函数类型包含两部分：参数类型和返回值类型。 当写出完整函数类型的时候，这两部分都是需要的。只要参数类型是匹配的，那么就认为它是有效的函数类型，而不在乎参数名是否正确。

```typescript
let myAdd: (x: number, y: number) => number =
    function(x: number, y: number): number { return x + y; };
```

### 可选参数和默认参数 ###

TypeScript里的每个函数参数都是必须的。，但是你可以传入`null`或者`undefined`。可选参数是指可以在参数名旁边添加`?`。默认值可以在无默认值的参数之前，如果要这样的话，就需要使用传入`undefined`来获取参数的默认值。

### 剩余参数 ###

在TypeScript里，你可以把所有参数收集到一个变量里：

```typescript
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}

let employeeName = buildName("Joseph", "Samuel", "Lucas", "MacKinzie");
```

### `this` ###

 如果你想了解JavaScript里的 `this`是如何工作的，那么首先阅读Yehuda Katz写的[Understanding JavaScript Function Invocation and "this"](http://yehudakatz.com/2011/08/11/understanding-javascript-function-invocation-and-this/)。TypeScript能通知你错误地使用了`this`的地方。

JavaScript里，`this`的值在函数被调用的时候才会指定。为了解决这个问题，我们可以在函数被返回时就绑好正确的`this`。箭头函数能保存函数创建时的 `this`值，而不是调用时的值。

```javascript
let deck = {
    suits: ["hearts", "spades", "clubs", "diamonds"],
    cards: Array(52),
    createCardPicker: function() {
        // NOTE: the line below is now an arrow function, allowing us to capture 'this' right here
        return () => {
            let pickedCard = Math.floor(Math.random() * 52);
            let pickedSuit = Math.floor(pickedCard / 13);

            return {suit: this.suits[pickedSuit], card: pickedCard % 13};
        }
    }
}

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

更好事情是，TypeScript会警告你犯了一个错误，如果你给编译器设置了`--noImplicitThis`标记。 它会指出`this.suits[pickedSuit]`里的`this`的类型为`any`。这是因为 `this`来自对象字面量里的函数表达式。 修改的方法是，提供一个显式的 `this`参数。 `this`参数是个假的参数，它出现在参数列表的最前面：

> `this: void` means that `addClickListener` expects `f` to be a function that does not require a `this` type.

```typescript
function f(this: void) {
    // make sure `this` is unusable in this standalone function
}
```

我们往例子里加一些接口，代码就会变得更加清晰：

```typescript
interface Card {
    suit: string;
    card: number;
}
interface Deck {
    suits: string[];
    cards: number[];
    createCardPicker(this: Deck): () => Card;
}
let deck: Deck = {
    suits: ["hearts", "spades", "clubs", "diamonds"],
    cards: Array(52),
    // NOTE: The function now explicitly specifies that its callee must be of type Deck
    createCardPicker: function(this: Deck) {
        return () => {
            let pickedCard = Math.floor(Math.random() * 52);
            let pickedSuit = Math.floor(pickedCard / 13);

            return {suit: this.suits[pickedSuit], card: pickedCard % 13};
        }
    }
}

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

现在TypeScript知道`createCardPicker`期望在某个`Deck`对象上调用。 也就是说 `this`是`Deck`类型的，而非`any`，因此`--noImplicitThis`不会报错了。

如果你想要把一个函数作为参数传入一个库函数，而库函数所定义的函数类型中有`this: void`，那么意味着你需要修复你函数中`this`的类型，否则会报错。或者你可以直接传入一个箭头函数。

### 函数重载 ###

TypeScript使用严格函数定义的另一个好处是可以使用函数重载。为了让编译器能够选择正确的检查类型，它与JavaScript里的处理流程相似。 它查找重载列表，尝试使用第一个重载定义。 如果匹配的话就使用这个。 因此，在定义重载的时候，一定要把最精确的定义放在最前面。

## 泛型 ##

TypeScript的泛型和其他语言的泛型非常相似。使用泛型的好处是不会像使用`any`一样丢失类型信息。

```typescript
function identity<T>(arg: T): T {
    return arg;
}
```

### 泛型函数的类型 ###

```typescript
interface GenericIdentityFn {
    <T>(arg: T): T;
}
```

### 泛型类 ###

我们在[类](https://www.tslang.cn/docs/handbook/classes.html)那节说过，类有两部分：静态部分和实例部分。 泛型类指的是实例部分的类型，所以类的静态属性不能使用这个泛型类型。

```typescript
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

```

### 泛型约束 ###

由于泛型本身没有任何类型，所以这就弱化了编译器的功能。编译器会十分严格地要求泛型，所以我们无法调用泛型上的方法。我们可以给泛型添加约束来让泛型可以被更好地使用。

```typescript
function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);  // Now we know it has a .length property, so no more error
    return arg;
}
```

### 在泛型约束中使用类型参数 ###

你可以声明一个类型参数，且它被另一个类型参数所约束。 比如，现在我们想要用属性名从对象里获取这个属性。 并且我们想要确保这个属性存在于对象 `obj`上，因此我们需要在这两个类型之间使用约束。

```typescript
function getProperty(obj: T, key: K) {
    return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a"); // okay
getProperty(x, "m"); // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.
```

### 在泛型里使用类类型 ###

在TypeScript使用泛型创建工厂函数时，需要引用构造函数的类类型。比如，

```ts
function create<T>(c: {new(): T; }): T {
    return new c();
}
```

一个更高级的例子，使用原型属性推断并约束构造函数与类实例的关系。

```ts
class BeeKeeper {
    hasMask: boolean;
}

class ZooKeeper {
    nametag: string;
}

class Animal {
    numLegs: number;
}

class Bee extends Animal {
    keeper: BeeKeeper;
}

class Lion extends Animal {
    keeper: ZooKeeper;
}

function createInstance<A extends Animal>(c: new () => A): A {
    return new c();
}

createInstance(Lion).keeper.nametag;  // typechecks!
createInstance(Bee).keeper.hasMask;   // typechecks!
```

## Symbol ##

自ECMAScript 2015起，`symbol`成为了一种新的原生类型，就像`number`和`string`一样。

`symbol`类型的值是通过`Symbol`构造函数创建的。

```ts
let sym1 = Symbol();

let sym2 = Symbol("key"); // 可选的字符串key
```

Symbols是不可改变且唯一的。

```ts
let sym2 = Symbol("key");
let sym3 = Symbol("key");

sym2 === sym3; // false, symbols是唯一的
```

像字符串一样，symbols也可以被用做对象属性的键。

```ts
let sym = Symbol();

let obj = {
    [sym]: "value"
};

console.log(obj[sym]); // "value"
```

Symbols也可以与计算出的属性名声明相结合来声明对象的属性和类成员。

```ts
const getClassNameSymbol = Symbol();

class C {
    [getClassNameSymbol](){
       return "C";
    }
}

let c = new C();
let className = c[getClassNameSymbol](); // "C"
```

