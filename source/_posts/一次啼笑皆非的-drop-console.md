---
title: 一次啼笑皆非的 drop console
date: 2019-06-11 16:37:04
tags: javascript, 感悟
---

### 1. 前言

做完星巴克项目已经有一段时间了，看到了之前让人哭笑不得 😂 的一段代码

```js
export const isSupportLocaleCompare = () => {
  if (!String.prototype.localeCompare) {
    return false;
  }
  try {
    'foo'.localeCompare('bar', 'i');
  } catch (e) {
    return e.name === 'RangeError';
  }
  return false;
};
```

### 2. 不用看了，它没有问题

这是一段 从`MDN` 上面 copy 的代码，用来判断浏览器支持 `localeCompare`, 由于安卓不支持此方法所有需要这个函数来做一些特殊处理，搬了一会砖后，需求搞定！

```
git push
```

美滋滋 等待 pipeline 跑完，发现报错。由于公司有代码安全检查。这行导致了构建失败

```js
'foo'.localeCompare('bar', 'i');
```

由于 `localeCompare` 方法有返回值，但是又没有使用，所以报错

### 3. 问题不大，修改一下

```js
export const isSupportLocaleCompare = () => {
  if (!String.prototype.localeCompare) {
    return false;
  }
  try {
    console.log('foo'.localeCompare('bar', 'i'));
  } catch (e) {
    return e.name === 'RangeError';
  }
  return false;
};
```

改成 `console.log` 打印之后，重新部署，构建成功，下班走人，

过了几天，测试发现在`qa` 环境 不管什么 机型，`isSupportLocaleCompare` 返回的都是 `false`.

但是我本地调试 `dev` 环境 一切正常

有点打脑壳。怎么 `debug` 都没有找到原因。正在我准备写离职报告，收拾东西走人的时候。突然看到了我之前写的 `webpack` 配置

> webpack.dev.config.js

```js
plugins: [... 其他插件];
```

> webpack.prod.config.js

```js
plugins: [
  ... 其他插件，
  new UglifyJsPlugin({
    cache: true,
    parallel: true,
    uglifyOptions: {
      compress: {
        warnings: false,
        drop_debugger: true,
        drop_console: true,
      },
    },
  }),
];
```

`drop_console: true` !!!

### 4. 好吧，真相只有一个

由于远端部署的时候 `CI` `CD` 都是执行的 `webpack.prod.config.js` 所有压缩`js`的时候把所有 `console` 都移除掉了，最终代码其实变成了这样子

```js
export const isSupportLocaleCompare = () => {
  if (!String.prototype.localeCompare) {
    return false;
  }
  try {
  } catch (e) {
    return e.name === 'RangeError';
  }
  return false;
};

isSupportLocaleCompare(); // false
```

try 语句块里面变成了空。所以。..

而 本地开发执行的 `webpack.dev.config.js`, 岁月静好。安然无恙 . 所以。..

有时候看似八钢子打不着的事情，说不定存在一些联系 !
