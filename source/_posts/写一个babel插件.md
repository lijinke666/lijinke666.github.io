---
title: 写一个 babel 插件
date: 2019-04-15 16:44:59
tags: babel
---

### 1. 前言

---

babel 如今已成为每一个现代前端项目的标配，有了它，我们可以肆无忌惮的使用 `stage-xxxx` 的语法，增强我们的生产力

我们通过写一个 支持 `arr[-1]` 的 babel 插件 来加深理解

![https://cdn.lijinke.cn/carbon.png](https://cdn.lijinke.cn/carbon.png)

### 2. 需要实现的功能

现在我们有如下的一个数组 `arr`, 我们想获取数组的最后一个下标，由于 `js` 不支持 `[-1]` 的操作，所以我们需要转换成 `arr[arr.length - 1]`

```
const arr = [1,2,3]
const value = arr[-1]

// ↓ 想要转换成

const value = arr[arr.length - 1]
```

换作以前的我，反手就是粗暴的 正则解析 去替换，当然正规一点还是老老实实用 [AST(Abstract Syntax Tree)](https://baike.baidu.com/item/%E6%8A%BD%E8%B1%A1%E8%AF%AD%E6%B3%95%E6%A0%91/6129952?fr=aladdin)

### 3. 查看抽象语法树

站在巨人的肩膀上 我们可以 使用 在线的 AST 生成工具 [https://astexplorer.net/](https://astexplorer.net/) 可以看到我们刚才写的两行代码对应的 语法树

![https://cdn.lijinke.cn/WX20190415-155255@2x.png](https://cdn.lijinke.cn/WX20190415-155255@2x.png)

当然你也可以使用 `@babel/core` 来生成 语法树 得到的结果是一致的

```js
import babel from '@babel/core';

const code = `
    const arr = [1,2,3]
    const value = arr[-1]
`;
babel.transform(code, {}, (result) => {
  console.log(result.ast);
});
```

### 4. 编写插件

关于 babel 插件的详细介绍，可以参考 这篇文章 [Babel 插件有啥用？](https://zhuanlan.zhihu.com/p/61780633)

```js
const babel = require('@babel/core');
const t = require('@babel/types');

const visitor = {
  MemberExpression(path) {
    const node = path.node;
  },
};

module.exports = (babel) => {
  return {
    visitor,
  };
};
```

`@babel/types` 主要帮助我们判断 当前节点是什么类型，十分强大，根据观察生成 的 `AST`, `arr[-1]` 是一个 `MemberExpression` 节点，所以我们只需要 将对应的节点 替换掉即可

想要将 `arr[-1]` 转换成 `arr[arr.length - 1]`, 我们需要知道 2 点

1. `数组的名字 => arr`
2. `数组的下标并且是一个数字 => -1`

获取 数组的名字

```
  if (node.object && t.isIdentifier(node.object)) {
      const arrName = node.object.name
    }
```

获取 数组的下标，应该满足 是一个表达式，并且参数是一个数字

```js
let arrIndex;
let operator;
if (node.property && t.isUnaryExpression(node.property)) {
  if (
    node.property.prefix &&
    node.property.operator &&
    node.property.argument &&
    t.isNumericLiteral(node.property.argument)
  ) {
    arrIndex = node.property.argument.value;
    operator = node.property.operator;
  }
}
```

最后拿到了我们想要的参数，组装一下，替换当前节点即可

```js
const result = `${arrName}[${arrName}.length ${operator} ${arrIndex}]`;
path.replaceWithSourceString(result);
```

### 5. 测试

```
import { transform } from '@babel/core'
import babelArrayLastValuePlugin from '../src/index'

describe('test array last value babel plugin', () => {
  beforeEach(() => {
    String.prototype.trimAll = function () {
      return this.replace(/\s/g, "")
    }
  })
  it('test expression', () => {
    const _code = `
      const arr = [1,2,3];
      const v = arr[-1];
    `
    const { code } = transform(_code, {
      plugins: [babelArrayLastValuePlugin]
    })

    expect(code.trimAll()).toEqual(`const arr = [1,2,3];const v = arr[arr.length - 1];`.trimAll())
  })
```

### 6. 特殊的场景

在实际场景中 可能还要直接赋值的情况

```
arr[-1] = 4
```

或者使用 `lodash` 的 `get` 的情况

```
get(arr,"[0]")
```

这样对应的 `AST` 会有变化，还需要处理对应的节点

### 7. 使用

```
yarn add babel-plugin-array-last-index
```

```
// .babelrc
{
  "plugins": [
    "array-last-index"
  ],
}

```

### 8. 结语

[GITHUB 地址](https://github.com/lijinke666/babel-plugin-array-last-index)

这是我第一次尝试写一个玩具插件，虽然实际作用不大，不过还是学到不少，也由衷的佩服那些 写 正儿八经 `babel` 的插件的作者，是真的强！
