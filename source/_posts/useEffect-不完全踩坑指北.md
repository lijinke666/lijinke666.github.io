---
title: useEffect 不完全踩坑指北
date: 2019-09-11 22:08:37
tags: react
---

### 前言

`React Hooks` 已经在项目用使用了很久了，写起来相当的 `丝滑`, `useEffect` 让我们印象深刻 , 始终围绕着两个字那就是 `引`用

### 没有 this 的世界非常美好

这句话似乎在 `javascript` 的世界里，没啥毛病，严格意义上来说，`js` 没有指针的概念，`this` 也可以看做一个引用我们熟悉的 `useXX` 的第二个 `[dependency]` 就是在对值的变化做比较

要实现一个 class 的 `getter`

```js
const { name } = props;
const transformedName = useMemo(() => {
  return `我的名字是${name}`;
}, [name]);
```

这里的 `memo` 是 `memory` 的简写

宿主在不停的调用 当前函数 , 当 `name` 更新 时 transformedName 会被重新执行

在 `props 改变 更新 state` 的场景也是异常的方便，没有 `this`, 一切都是同步的

```js
const { name: propsName } = props;
const [name, setName] = useState < string > '';

useEffect(() => {
  setName(propsName);
}, [propsName]);
```

这时 `useEffect` 要执行另外一个函数

```diff
const { name: propsName } = props
const [name, setName] = useState<string>('')

+ const sayHello = () => {
+   console.log(`你是：${name} 吗？`)
+ }

useEffect(() => {
  setName(propsName)
+ sayHello()
}, [propsName])

```

由于 `sayHello` 要间接的访问 `name` 所以我们应该 使用 `useCallback` 将

`sayHello` 包装一层 再添加为 `useEffect` 的依赖项

```diff
const { name: propsName } = props
const [name, setName] = useState<string>('')

+ const sayHello = useCallback(() => {
   console.log(`你是：${name} 吗？`)
+ },[name])

useEffect(() => {
  setName(propsName)
+ sayHello()
+ }, [propsName, sayHello])

```

这样可以保证其是一个 正常的数据流

### 不易察觉的引用

还是刚才的场景，只不过我们的 `setName` 变成了 `fetchApi` 一个网络请求，让你看起来成本更高一点

很简单的代码，当 `props` 的 `ids` 更新时 我们就重新请求 `api`, 一切都是那么的完美，结果你刷新页面打开 `Network` 面板，头皮发麻

> 怎么死循环了 一直在请求数据 ?

```js
const App = () => {
  const { ids = [] } = props;

  useEffect(() => {
    fetchApiByIds(ids);
  }, [ids]);
};
```

原因就是 `const { ids = [] } = props` 这里的 `ids` 默认值是 `[]` 当 `ids` 是 `undefined` 他变成了 `[]`

由于 `[]` 是一个新数组，是一个新引用，每次函数执行时 都是一个 `[]` 新引用，`useEffect` 内部使用 `Object.is` 作比较，两者不相等 就一直执行了

```js
const a = [];
const b = [];
const c = a;

Object.is(a, b); // true
Object.is(a, c); // false
```

比较简单的解决办法就是

```js
const defaultIds = [];
const App = () => {
  const { ids = defaultIds } = props;

  useEffect(() => {
    fetchApiByIds(ids);
  }, [ids]);
};
```

或者

```js
const App = () => {
  const { ids } = props;

  useEffect(() => {
    fetchApiByIds(ids);
  }, [ids]);
};

App.defaultProps = {
  ids: [],
};
```
