---
title: 初始 React Hooks
date: 2019-06-05 14:17:13
tags: react
---

### 前言

`React Hooks` 已经出现在人们的视野里很久了，不得不承认的是，这是 `React` 开发团队未来的发展方向，如果你是一个 `函数式编程` 的爱好者，你可能为之兴奋，如果你是一个 `面向对象编程`的爱好者，那么。..

### 要解救什么问题

很明显，这不是 一帮为了 KPI 的程序员搞出来的东东，也不是 这不是邓紫棋要帮你唱的 Hook.

`React Hooks` 要实现 `状态逻辑复用`, 在这之前还有三种熟悉的方案

- `render props`

  ```js
  <CountDown>{(s) => `还有 ${s} 秒`}</CountDown>
  ```

- `HOC 高阶组件`

  ```
      @B
      class A extends React.Component{}
  ```

- 远古时期的 `mixins` 方案 （废弃）

从最早的的 `React.createClass` api . 再到 拥抱 ES6 的 `class` 再到 现在 抛弃 `class` 更加函数式编程的 `React Hooks`

`React` 团队一直提倡的是 视图与逻辑分离，很遗憾这样去做的人很少

> 有状态的组件没有渲染，有渲染的组件没有状态

这是 [对 React Hooks 的一些思考](https://zhuanlan.zhihu.com/p/48264713) 这篇文章中提到的观点，也是 React 团队引入 `React Hooks` 的想要达到的

### 好处是啥？

1. immutable
2. 更纯粹的函数式编程
3. 代码量更少
4. 减少逻辑复用的嵌套层级
5. 同步

这是一个计数的 demo, 显示点击了按钮多少次

> class 版本

```js
class Counter extends React.Component {
  state = {
    count: 0,
  };
  onSetCount = () => {
    this.setState(({ count }) => ({
      count: count + 1,
    }));
  };
  render() {
    return (
      <>
        你点击了 {this.state.count} 次
        <button onClick={this.onSetCount}>点击</button>
      </>
    );
  }
}
```

> Hooks 的版本

```js
function Counter() {
  const [count, setCount] = useState(0);

  return (
     <>
        你点击了 {count} 次
        <button onClick={()=> setCount(count + 1)}>点击</button>
    </>
  );

```

是的在 `Class` 版本中 `this.state.count` 每一次改变，会触发视图更新，`this` 是可变的

而在 `Hooks` 版本中 , `count` 仅仅是一个数字，

函数第一次执行

```
function Counter() {
  const count = 0

  return (
     <>
        你点击了 {0} 次
        <button onClick={()=> setCount(0 + 1)}>点击</button>
    </>
  );
```

点击按钮后函数第二次执行

```
function Counter() {
  const count = 1

  return (
     <>
        你点击了 {1} 次
        <button onClick={()=> setCount(1 + 1)}>点击</button>
    </>
  );
```

每一次值都独立于其他渲染，不会随着时间改变

[具体请看 Dan 的这篇文章，这里只是汉化了一下](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)

在这里你可能会问？那么每次都是独立渲染，那么如果疯狂点击 1000 次 那么会执行 1000 次函数 ?

是的，你可以用 `PureComponent` 的函数式版本 `React.memo` 来优化重复渲染

```
function Counter() {
  const count = 1

  return (
     <>
        你点击了 {1} 次
        <button onClick={()=> setCount(1 + 1)}>点击</button>
    </>
  );

 export default React.memo(Counter)
```

### 生命周期咋整？

- `componentDidMount`
- `componentWillReceiveProps`
- `componentWillUnmount`

这些都被吃了吗？是的 都被吃了 , 吐出了一个 `useEffect` Hooks 给你

在上面的计数例子中

```js
 componentDidUpdate() {
    setTimeout(() => {
      console.log(`你点击了 ${this.state.count} 次`);
    }, 3000);
  }
```

在之前讲到了 由于 this 是可变的，在点击 比如`5` 次 之后，一共打印了 5 次

```
 你点击了 5 次  （打印了 5 次）
```

而在 `Hooks` 的版本中，由于当前渲染的 `count` 独立于其他渲染 （可以理解成闭包）

```js
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(`你点击了 ${this.state.count} 次`);
    }, 3000);
  });

  return (
    <>
      你点击了 {count} 次
      <button onClick={() => setCount(count + 1)}>点击</button>
    </>
  );
}
```

那么得到的结果是

```
 你点击了 1 次
 你点击了 2 次
 你点击了 3 次
 你点击了 4 次
 你点击了 5 次
```

`useEffect(fn,[...args])` 有两个参数 , 第二个参数是一个数组，数组里面的值发生改变才会重新执行

如果不传的话，每次函数执行都会执行`fn`

如果是个空数组，则表示只执行一次，可以用来实现 `componentDidMount`

```js
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('componentDidMount');
  }, []);

  return (
    <>
      你点击了 {count} 次
      <button onClick={() => setCount(count + 1)}>点击</button>
    </>
  );
}
```

想实现 `componentDidMount` 绑定一个事件，`componentWillMount` 取消绑定

```
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    window.addEvnetListener('resize', someHandler)
    return () => {
      window.removeEvnetListener('resize', someHandler)
    }
  },[]);

  return (
     <>
        你点击了 {count} 次
        <button onClick={()=> setCount(count + 1)}>点击</button>
    </>
  );
}
```

可以看到 `useEffect` 里面有一个 经典的 `柯里化` 组件卸载时 这会执行 `它`

对于另外一个经典的场景，组件`props` 或 `state` 更新后 执行某一个函数 或者重新初始化一个东西，相比看到这 你也懂了

```
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    someFn(...)
  },[count]);

  return (
     <>
        你点击了 {count} 次
        <button onClick={()=> setCount(count + 1)}>点击</button>
    </>
  );
}
```

在这里 每次 `count` 更新后 就会重新执行 `someFn()`

当然 `React` 还提供了很多美味的 `Hook` 供我们品尝 更多的花样等着我们把玩

[官方内置 Hooks](https://reactjs.org/docs/hooks-reference.html)

[社区精选 Hooks](https://github.com/rehooks/awesome-react-hooks)

在这里可以抛出一些问题

- 为什么 Hook 都是以 `use` 开头，有什么特殊含义吗？
- 哪些生命周期还没有 `hooks` 的实现
- `class` 组件 可以用在 hooks 里面吗？
- 怎么才能写出合理的 `hooks` 呢？有哪些我们需要遵守的约定呢？
- 怎么实现 一些常用的 自定义 `Hook`?
- 项目上的实践分享？

### 参考文章

[精读《React Hooks](https://github.com/dt-fe/weekly/blob/v2/079.%E7%B2%BE%E8%AF%BB%E3%80%8AReact%20Hooks%E3%80%8B.md)

[useEffect 完整指南](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)

[对 React Hooks 的一些思考](https://zhuanlan.zhihu.com/p/48264713)
