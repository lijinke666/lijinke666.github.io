---
title: 小李取钱之 Node.js 实现一个命令行的进度条
date: 2019-12-26 16:11:10
tags: Node.js
---

### 前言

之前配置 `webpack` 的时候，使用了一个插件 `progress-bar-webpack-plugin`, 功能很简单，就是在打包的时候显示一个骚气的进度条，使用如下

```js
// webpack.config.js
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
  plugins: [new ProgressBarPlugin()],
};
```

![2019-12-26-16-13-12-20191226161312](https://cdn.lijinke.cn/2019-12-26-16-13-12-20191226161312.png)

作为 `前后左右端配置工程师 2.0`, 今天就尝试用 `Node.js` 实现一个类似的进度条的功能，我们这里稍微丰富一下，模拟这样一个场景：小李取钱，然后出现正在取钱中的 进度条，最后提示取钱成功

### 标准输入与输出流

在 Node.js 中，标准的输入输出流分别为：

- 输入流
- 输出流
- 错误流

而流又分为：

- 可读流 (Readable)
- 可写流 (Writable)
- 双工流 (Duplex)
- 转换流 (Transform)

其中双工流和转换流都是可读可写的。

输入流 (Readable)

```js
process.stdin;
```

输出流 (Writable)

```js
process.stdout;
```

错误流 (Writable)

```js
process.stderr;
```

想实现进度条在命令行中显示，我们需要用到输出流和输入流，前端的老朋友 `console.log` 其实就是对标准输出的封装

```js
const { format } = require('util');

class Console {
  log(...args) {
    process.stdin.write(`${format.apply(null, args)}\n`);
  }
}

const _console = new Console();
_console.log('skr~'); // skr~
```

![2019-12-26-21-34-05-2019122621345](https://cdn.lijinke.cn/2019-12-26-21-34-05-2019122621345.png)

### 小李取钱

小李来到银行的自动取款机取钱，取款机询问他要取多少：

![2019-12-26-21-38-06-2019122621386](https://cdn.lijinke.cn/2019-12-26-21-38-06-2019122621386.png)

要实现 `询问` 这个功能，我们需要借助一个原生的 `Node.js` 模块 `readline` , 它帮助我们从 `可读流` 中 一行一行的读取数据

```js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('[成都银行欢迎您] 请输入要提取的金额 : \r', (money) => {
  console.log('money', money);
});
```

![2019-12-26-21-41-55-20191226214155](https://cdn.lijinke.cn/2019-12-26-21-41-55-20191226214155.png)

接下来就是取钱的过程，我们需要显示一个取钱中的进度条，首先实现一个 `printProgress` 函数，向 `process.stdout` 标准中打印进度条

```js
const printProgress = (index) => {
  const loadedBar = '='.repeat(index);
  const unloadBar = '-'.repeat(0);
  process.stdout.write(`提取中 : ${loadedBar}${unloadBar}`);
};
```

同时增加 `getMoney` 函数用来接收小李输入的金额，`printProgress` 会在他按下回车的时候执行

```js
const getMoney = (money) => {
  printProgress(10);
};

rl.question('[成都银行欢迎您] 请输入要提取的金额 : \r', getMoney);
```

![2019-12-26-21-50-13-20191226215013](https://cdn.lijinke.cn/2019-12-26-21-50-13-20191226215013.png)

提示信息有了，由于银行资金比较紧张，还没有实现加载中的动画，没那味，别着急，我们来实现动画

### 加载动画

前端对于动画肯定不陌生，方式多种多样，有

- css3 animation
- setInterval
- requestAnimationFrame
- canvas

由于是 `Node.js` 环境，这里我们只能使用 `setInterval` 来实现，略微调整一下 `getMoney` 函数，加入定时器，通过一个自增的 `index` 的来表示提取的进度

```js
const getMoney = (answer) => {
  let index = 0;
  setInterval(() => {
    ++index;
    printProgress(index);
  }, 200);
};
```

![2019-12-26-21-56-41-20191226215641](https://cdn.lijinke.cn/2019-12-26-21-56-41-20191226215641.png)

"取他个香蕉棒棒槌", 小李在取款机旁骂道，原来是因为虽然一直在输出，但是没有清空之前的内容，显示效果不理想。

### 清空标准输出

在 `canvas` 图形绘制时，我们可以通过 `clearRect()` 方法不断的清除画布实现动画的绘制，而在命令行中，我们可以使用 `readline.clearScreenDown()` 来帮助我们清空标准输出

```js
// 将光标移动到 标准输出 （坐标 0,0 ) 的位置
readline.cursorTo(process.stdout, 0, 0);

// 清空
readline.clearScreenDown(process.stdout);
```

修改 `printProgress` 函数，每次打印前清空即可

```js
const limit = 20; // 模拟提取时长

const printProgress = (index) => {
  const loadedBar = '='.repeat(index);
  const unloadBar = '-'.repeat(limit - index);
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
  process.stdout.write(`提取中 : ${loadedBar}${unloadBar}`);
};
```

![2019-12-26-22-12-36-20191226221236](https://cdn.lijinke.cn/2019-12-26%2022.14.12.gif)

一个小时过去了，取款机还在提示 `提取中`, 原来是忘了写停止动画了，赶紧加上

```js
const print = (money, index) => {
  printProgress(index);
  if (index === limit) {
    process.stdout.write(`\n √ 本次提款：${money} 元、n`);
    process.exit(0);
  }
};

const getMoney = (answer) => {
  let index = 0;
  setInterval(() => {
    ++index;
    print(answer, index);
  }, 200);
};
```

![2019-12-26-22-12-36-20191226221236](https://cdn.lijinke.cn/2019-12-26%2022.21.35.gif)

最后，我们为了更加逼真，在进度条的前面加上一个百分比

```js
const printProgress = (index) => {
  const offset = limit / 100;
  const progress = `${index / offset}%`;
  const loadedBar = '='.repeat(index);
  const unloadBar = '-'.repeat(limit - index);
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
  process.stdout.write(`提取中 : ${progress} ${loadedBar}${unloadBar}`);
};
```

![2019-12-26-22-12-36-20191226221236](https://cdn.lijinke.cn/2019-12-26%2022.30.46.gif)

完整代码如下：

```js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const limit = 20; // 模拟提取时长

const printProgress = (index) => {
  const loadedBar = '='.repeat(index);
  const unloadBar = '-'.repeat(limit - index);
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
  process.stdout.write(`提取中 : ${loadedBar}${unloadBar}`);
};

const print = (money, index) => {
  printProgress(index);
  if (index === limit) {
    process.stdout.write(`\n √ 本次提款：${money} 元、n`);
    process.exit(0);
  }
};

const getMoney = (answer) => {
  let index = 0;
  setInterval(() => {
    ++index;
    print(answer, index);
  }, 200);
};

rl.question('[成都银行欢迎您] 请输入要提取的金额 : \r', getMoney);
```

终于，小李取到了他这个月的工资，他回到工地继续那美滋滋的搬砖生活。

完。

### 参考资料

- [nodejs.org](https://nodejs.org/api/readline.html)
- [node-interview](https://elemefe.github.io/node-interview/#/sections/zh-cn/io?id=%e5%8f%af%e8%af%bb%e6%b5%81)
