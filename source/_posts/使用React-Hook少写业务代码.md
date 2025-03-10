---
title: 使用 React-Hook 少写业务代码
date: 2020-03-09 20:54:28
tags: react
---

### 相似的业务代码

俗话说，人活得久，什么都能遇到，前端搬砖久了，各种代码也就遇到了，在这几年的搬砖生活中，尤其是 `To B` 的项目，不难发现，有很多需求都是重复类似的

比如：

- 一个输入框，`BA（业务分析师）` 告诉你 不能输入空格，第二天突然说需求改成 `中间不能有空格`

- 一个展示数据的表格，有一些过滤项和分页，需要将过滤条件和分页页码保存起来，以支持刷新之后保持上一次搜索条件

- 一个表单项，点击新增按钮， 点击一次，出现一个 `input` 框，还可以删除

...

是不是非常的熟悉且怀念，似乎还有一点马上打开编辑器写上几行代码的冲动

### 怎么办？

程序员有三宝，复制粘贴头发少，遇到类似的需求，也许会打开以前的项目，复制粘贴代码过来，修修补补搞定，亦或是封装一些 `高阶组件` 来搞定需求，还有没有其他的解决方案呢？众所周知，`react hook` 解决了逻辑复用的问题，似乎不错的样子，那么就来尝试一下

### 去除空格

以 `去除空格` 这个常见的需求来说，我们自定义一个 `useTrimInput` 的 hook`

```js
import { useState, useCallback } from 'react';

const useTrimInput = (fullTrim: boolean = false): UseTrimInputReturn => {
  const [value, setValue] = useState < string > '';
  const setTrimValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue],
  );
};

export default useTrimInput;
```

首先定义一个 `value` state, 用来保存当前 `input` 的 值，使其是一个受控组件，再定义 `setTrimValue` 接受当前 `event` 的 `value` 值，逻辑非常简单

接下来就需要对当前 state 的 `value` 进行 `trim`, `fullTrim` 参数表示是否去除 首尾和中间所有的空格

> 定义 `trim` 方法

```js
// utils/string.ts
export const trim = (target: string, fullTrim: boolean = false) => {
  if (!fullTrim) {
    return target.trim();
  }
  return target.replace(/\s/gm, '');
};
```

最后我们使用一个函数版本的 `getter` 对 `value` 进行转换

```js
import { useState, useCallback, useMemo } from 'react';
import { trim } from '../../utils/string';

export type UseTrimInputReturn = [
  string,
  (event: React.ChangeEvent<HTMLInputElement>) => void,
];

const useTrimInput = (fullTrim: boolean = false): UseTrimInputReturn => {
  const [value, setValue] = useState < string > '';
  const setTrimValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue],
  );

  const trimValue: string = useMemo(() => {
    return trim(value, fullTrim);
  }, [value, fullTrim]);

  return [trimValue, setTrimValue];
};

export default useTrimInput;
```

经过简单的封装，这样一个常见的业务场景的自定义 `hook` 就写好了

效果如下：

```js
import React from 'react';
import { Form, Input } from 'antd';

const Example = () => {
  const [trimValue, setTrimValue] = useTrimInput();
  const [fullTrimValue, setFullTrimValue] = useTrimInput(true);
  return (
    <>
      <input
        value={trimValue}
        onChange={setTrimValue}
        placeholder="请输入姓名"
      />
      <input
        value={fullTrimValue}
        onChange={setFullTrimValue}
        placeholder="请输入姓名"
      />
    </>
  );
};

export default Example;
```

![https://cdn.lijinke.cn/2020-03-09%2021.19.26.gif](https://cdn.lijinke.cn/2020-03-09%2021.19.26.gif)

### 另一个例子：分页和过滤项同步到 url

梳理一下这个需求常见的步骤

1. 默认第一页 (page = 1)
2. 单击页码 （第二页）, 发起 ajax 请求 (page = 2)
3. 将当前页码 (2) 同步到 url 上，这时候地址栏为 `http://xxx.com/list?page=2`
4. 如果用户刷新，需要拿到当前地址栏的 `{ page: 2 }` 赋值给 `Table` 组件，并且请求 ( page = 2 ) 的数据
5. 特殊情况，由于地址栏拿到的都是 `String` 类型的值，过滤项往往除了 `page=2` 这种数字之外，还有常见的各种类型
6. 可能会有默认值，比如一进页面就显示 `http://xxx.com/list?filter=xxx`

```js
{
  name: 'test',
  like: false,
  success: true,
  age: 18,
  friends: ['a', 'b'],
}
```

更恐怖的是从地址栏拿到后，还需要转换成设置之前的数据类型，也就是

- `?name=test` => `{ name: 'test' }`
- `?age=18` => `{ name: 18 }`
- `?success=true` => `{ success: true }`

细思极恐，仔细梳理之后，分析出几个关键点

1. 数据类型之间的互相转换，提供一个类似 `mongoose` 的 `Schema` 机制，预先声明好每一个字段的类型和默认值
2. 增加删除指定的字段

第 1 点的灵感其实来自项目中一个很厉害同事的灵感，这里借鉴（抄袭）了一下 :)

首先看实现效果

> 页码同步 ![https://cdn.lijinke.cn/2020-03-09%2021.35.06.gif](https://cdn.lijinke.cn/2020-03-09%2021.35.06.gif)

> 不同类型的参数自动转换 ![https://cdn.lijinke.cn/2020-03-09%2021.35.53.gif](https://cdn.lijinke.cn/2020-03-09%2021.35.53.gif)

### 代码实现

首先定义支持的数据类型

```ts
export enum UseSearchParamsSchemaType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN',
}
```

然后是返回类型

```ts
export interface UseSearchParamsReturn<T> {
  searchParams: T; // 当前搜索参数
  remove: (keys?: Array<keyof T>) => void; // 移除，如果没有指定 keys 就移除全部
  reset: () => void; // 重置搜索参数 （保留默认值）
  set: (values: Partial<T>) => void; // 新增一个值，如果已存在就更新
}
```

```js
import { useCallback, useMemo, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

const useSearchParams = <T extends {}>({
  schema,
  pathname: _pathname,
}: UseSearchParamsParams): UseSearchParamsReturn<T> => {
  const history = useHistory()
  const location = useLocation()
  const [paramKeys, setParamKeys] = useState<(keyof T)[]>([])
  const urlSearchParams = useMemo(
    () => new URLSearchParams(location.search),
    [],
  )
  const pathname = _pathname || location.pathname
}
```

- 我们使用浏览器提供的 [URLSearchParams](https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams) API 来处理 URLSearchParams
- 使用 `react-router-dom` 提供的 `useHistory` 和 `useLocation` 方便的获取到当前应用的 `history` 和 `location`, 用于跳转

接下来是 处理 `默认值`, 我们规定一个 `schema` 长这样

```js
const schema = {
  name: UseSearchParamsSchemaType.STRING,
  like: UseSearchParamsSchemaType.BOOLEAN,
  success: UseSearchParamsSchemaType.BOOLEAN,
  age: {
    type: UseSearchParamsSchemaType.NUMBER,
    default: 10,
  },
  test: {
    type: UseSearchParamsSchemaType.STRING,
    default: 'defaultValue',
  },
  friends: UseSearchParamsSchemaType.ARRAY,
};
```

```js
 // 将两种定义方式 统一成一种数据结构
 const getFieldByKey = useCallback((key: string) => {
    const { type, default: defaultValue } = Object.is(
      typeof schema[key],
      'object',
    )
      ? (schema[key] as UseSearchParamsSchemaDetail)
      : { type: schema[key], default: null }
    return {
      type,
      defaultValue,
    }
  }, [])

  // 得到有默认值的一组 map, 用于还原
  const getDefaultValues = useCallback(() => {
    return Object.keys(schema).reduce((obj, key) => {
      const { defaultValue } = getFieldByKey(key)
      if (defaultValue) {
        obj[key] = defaultValue
      }
      return obj
    }, {} as UseSearchParamsSchema)
  }, [schema])

  // 使用 useMemo 得到默认值的 getter
  const defaultValues = useMemo<UseSearchParamsSchema>(getDefaultValues, [])
```

通过 `schema` 解析了默认值后，我们需要将 `defaultValues` 同步设置到 `urlSearchParams`, `urlSearchParams` 不支持 `set` 一个数组，所以只能遍历

```js
 const setDefaultValues = useCallback(() => {
  Object.keys(defaultValues).forEach(key => {
    urlSearchParams.set(key, defaultValues[key] as string)
  })
}, [defaultValues])
```

接下来实现 `set` 方法：用于增加或更新一个字段

```js
  // 调用 history.push 更新路由的 search
 const updateLocation = useCallback(() => {
    urlSearchParams.sort()
    history.push({
      pathname,
      search: urlSearchParams.toString(),
    })
  }, [history, pathname, urlSearchParams])

  const set = useCallback(
    (values: Partial<T>) => {
      Object.keys(values).forEach(key => {
        const value = ((values as unknown) as UseSearchParamsSchema)[key]
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => {
              urlSearchParams.append(key, v)
            })
          } else {
            urlSearchParams.set(key, value as string)
          }
        }
      })
      updateLocation()
    },
    [updateLocation],
  )
```

将 `set(values)` 的 `values` 同步到 `urlSearchParams` 后，我们调用 `history.push` 即可更新 url 的 `search` 参数，

值得注意的是，数组的展开方式是 通过 `repeat` 的方式，也就是说：

```js
const a = [1, 2];

// 等于

('a=1&a=2');
```

所以这里要区别对待

```js
  if (Array.isArray(value)) {
    value.forEach(v => {
      urlSearchParams.append(key, v)
    })
  } else {
    urlSearchParams.set(key, value as string)
  }
```

完成了设置，还差关键的一部，就是数据类型之间的互相转换，有了之前定义好的 `Schema`, 这非常容易实现

### 数据类型解析并转换

```js
const parseValue = useCallback(
  (key: string, value: string) => {
    const { type } = getFieldByKey(key);
    let newValue: any;

    switch (type) {
      case UseSearchParamsSchemaType.STRING:
        newValue = value !== 'undefined' ? String(value) : '';
        break;
      case UseSearchParamsSchemaType.NUMBER:
        newValue = Number(value);
        break;
      case UseSearchParamsSchemaType.BOOLEAN:
        newValue = value === 'true';
        break;
      case UseSearchParamsSchemaType.ARRAY:
        newValue = urlSearchParams.getAll(key);
        break;
      default:
        break;
    }
    return newValue;
  },
  [getFieldByKey],
);
```

- 对于 `String` 类型，我们进行强制类型转换即可 `String(value)`, 值得注意，由于 url 是字符串，所以会出现字符串的 `"undefined"`, 转成空字符串即可
- 对于 `NUMBER` 类型，同样强制类型转换即可 `Number(value)`
- 对于 `BOOLEAN` 类型，得到是字符串的 boolean 值，也就是 `true` | `false`, 所以这里用 `value === 'true'` （三个等号） 进行不做隐私类型转换的比较，得到真正的 `boolean` 值
- 对于 `ARRAY` 类型，很方便，使用 urlSearchParams 提供的 `getAll` api 即可

这样疯狂操作一波，一个常见的业务需求就搞定了，是不是可以早点下班了呢？其余 `remove` 和 `reset` 方法等参不多类似，就不一一列举了，

为了方便使用，我发布了一个 npm 包 [react-7h-hooks](https://github.com/lijinke666/react-7h-hooks), 感兴趣的可以查看源码

### 结语

相对于 `高阶组件`, hooks 的方式更便于我们封装逻辑，同时代码层级是扁平化的，便于维护，如果不是使用了 `hooks`, 节省了我 1 个小时的时间，也不会有空写这篇文章了

完。
