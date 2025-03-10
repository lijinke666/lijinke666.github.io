---
title: 怎样实现一个简单的 react hook 请求库
date: 2019-12-15 11:54:36
tags: React
---

### 前言

越来越多的项目 使用 react hooks 的方式来开发应用，需要调用 api 请求数据，一个网络请求的自定义 hook 显得尤为的重要

### 很久没用到的 redux

我接触的项目中，大多数引入了 react-redux, redux 之类的状态管理库，用来做 数据 与 UI 分离，自己感觉是为了用而用，太重又没必要，当然，也可能自己做的都是小项目，体会不到好处，既然体会不到，为啥我要用，以前请求个数据，数据流要绕一大圈

首先是 view

```tsx
@connect(
  ({data})=> ({data})
  ({xx}) => ({ getData: xx.getData() })
)
class Component extends React.Component {

  render() {
    {this.props.data}
  }

  componentDidMount() {
    this.props.getData()
  }
}
```

Action

```ts
function getData() {
  dispatch({
    type: 'fuck_type',
    payload: 'xx',
  });
}
```

Reducer

```tsx
function reducer(state) {
  switch (key) {
    case fuck_type:
      return {
        ...state,
        data: action.payload,
      };
    default:
      return state;
  }
}
```

这是一个最基本的 redux 代码，还没有算上 `redux-saga`, 和 `isLoading`, `isError` 之类的 action, 有时候我们写代码都忘记初心了。.., 那就是 `我只是想请求一个数据`, 现实是不管用不用 store, 我都和他 redux 的世界里走一走

### 单纯的发一个请求吧，求求你了

```tsx
import MyFetcher from './index.ts';

function App() {
  const [data, setData] = useState<Array<any>>([]);
  useEffect(() => {
    (async () => {
      const data = await MyFetcher.get('/');
      setData(data);
    })();
  }, []);

  return <div>{data}</div>;
}
```

### 一个网络请求基本场景

- 需要一个是否在请求的标识，用来 loading 状态
- 需要一个请求完成后的数据，用来渲染
- 需要一个是否错误的标识，或错误信息，用来做错误的逻辑
- 最好有一个支持重新请求的功能
- 最好在组件卸载的时候，能够自动取消当前的请求

### 基本实现

我们这里基于 `axios` 来实现，取名 `useData`

首先定义三个状态机 `loading` , `data` , `error`

```tsx
function useData<T extends any[] = [], E = null>() {
  const [data, setData] = useState<T>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<E>(null);
}
```

然后声明一个 请求函数，

- 在请求开始 设置 `loading` 为 `true`
- 请求成功，成功 setData
- 请求失败，设置 setError
- 完成，设置 `loading` 为 `false`

```ts
import axios from 'axios';

const instance = axios.create({
  baseURL: '/',
  timeout: 1000,
});

function useData<T extends any[] = [], E = null>(url: string) {
  const [data, setData] = useState<T>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<E>(null);

  const fetchData = useCallback(
    (apiUrl: string) => {
      async function getData() {
        setData(await instance.get(apiUrl));
      }
      setLoading(true);
      getData()
        .catch(setError)
        .finally(() => {
          setLoading(false);
        });
    },
    [apiUrl],
  );

  useEffect(() => {
    fetchData(url);
  }, [url]);

  return {
    loading,
    data,
    error,
    refresh: fetchData,
  };
}
```

将 `url` 作为 `useEffect` 的依赖项，这样就可以在 `url` 改变的时候，自动重新拉取数据，非常方便，最后对 `fetchData` 引用，实现 `refresh` 重新加载的功能

### 使用

```tsx
function App() {
  const { loading, data, refresh } = useData('/api');

  return (
    <>
      {loading ? '加载中。..' : data}
      <div onClick={refresh}>重新拉取数据</div>
    </>
  );
}
```

可以很明显的看出，`React Hooks` 很好的解决了 逻辑复用的问题，我们通过这样一个 自定义 `hook`, 实现了一个可以重新拉取数据，加载状态，错误状态，显示数据的公用 hook, 然后还要一个问题，`useData` 内部写死了 `axios` 的 `get` 请求，显然是不合理，为了支持自定义的网络请求库，我们可以添加第二个参数，来实现自己的 `fetcher`

### 自定义 fetcher

```diff
+ function useData<T extends any[] = [], E = null>(url: string, fetcher: (url: string) => Promise<T>) {
  const [data, setData] = useState<T>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<E>(null)

  const fetchData = useCallback((apiUrl: string) => {
    async function getData() {
+      setData(await fetcher(apiUrl))
    }
    setLoading(true);
    getData()
    .catch(setError)
    .finally(() => {
      setLoading(false);
    });
  }, [apiUrl]);

  useEffect(() => {
    fetchData(url);
  }, [url]);

  return {
    loading,
    data,
    error,
    refresh: fetchData,
  };
}
```

这样，就可以传入自己的网络请求实现，比如 `fetch`

```tsx
function App() {
  const { loading, data, refresh } = useData('/api', (url) => fetch(url));

  return (
    <>
      {loading ? '加载中。..' : data}
      <div onClick={refresh}>重新拉取数据</div>
    </>
  );
}
```

当然这只是一个简单的封装，事实上，社区已经有一个很火的 hooks 请求库 [swr](https://github.com/zeit/swr), 非常实用，推荐给大家哟 :)
