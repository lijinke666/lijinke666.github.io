---
title: node 中的 net 模块 与 Buffer 处理
date: 2017-12-11 23:01:28
tags: Node.js
---

> 作为前端的我，平时接触到的都是 HTTP 服务，最近公司的业务所致，需要 写一个 接口 与 游戏服务器 进行 socket TCP 通信，我是一脸蒙蔽，不过在同事的帮助下，我还是 略懂了一点，所以记录一下

### 什么是 TCP

---

TCP（Transmission Control Protocol 传输控制协议）是一种面向连接的、可靠的、基于字节流的传输层通信协议

### socket

---

`Node.js` 原生提供了一个 `net` 包 ，可以用它来建立一个 `socket` 的 `TCP` 通信，刚开始同事说 `socket` 我还以为是 `web socket` :( 真的惭愧，太菜了呀！

<p>由于业务只需要搭建 客户端，所以代码如下</p>

```js
const host = '192.168.xx.xx';
const port = 6666;
const net = require('net');
const client = new net.Socket();
client.connect(port, host, () => {
  client.write(Buffer);
  debug('连接成功！');
});

client.on('data', (data) => {
  res(data);
  client.destroy();
});
client.on('error', (err) => {
  rej(err);
  debug('socket 连接失败', err);
});

client.on('close', () => {
  debug('连接关闭');
});
```

这样就轻松的与 游戏服务器进行了通信，怎么发送数据给游戏服务器呢使用 `write` 轻松搞定，因为不像 普通的 `HTTP` 一样 可以传个 `JSON` 之类的东东，这里必须写入一个 流 `Buffer` 过去

```
client.write(  Buffer  )
```

之前接触到 `Buffer` 很片面，做 头像图片上传的时候 接触到 了 一点点，但是这里更麻烦，需要自己拼一个 `Buffer`

### Buffer

---

`nodejs` 创建 buffer 之前的方式是

```
const buffer = new Buffer(len)
```

新版已经改成

```
Buffer.alloc(len)
```

效果是一样的，由于 游戏服务器要求 拼一个 头部 + 消息内容，所以我这样来写，每个字节又有 `32`, `16` 位 的

```
const createBuffer = (size) => (fnName) => (content, offset = 0) => {
    const BYTE = "BE"
    const _Buffer = Buffer.allocUnsafe(size).fill(0)
    _Buffer[fnName](content, offset)
    return _Buffer
}

const buf1= createBuffer(1)("writeInt8")(1)
const buf2 = createBuffer(4)("writeInt32BE")(0)

const HEADERS = Buffer.concat([buf1,buf2], buf1.length + buf2.length)
```

这样大概就拼出来了，使用 了 `Buffer.concat` 把多个 buffer 组合起来，这里遇到了点阻碍，和知识盲点，就是 `BE` 和 `LE`, 和 `64 位` 的字节

 <p>
   后面查了下才知道 `LE` 是 `Little endian` 小端序 `Be` 是 `Big Endian` 大端序 , 这两者的区别就是排列顺序是相反的，自己还真是无知。..
</p>

<p>
64 位 字节 的问题 ，`nodejs` 只提供了 `writeInt32BE` 和 `writeInt16BE` 的方法，分别对应写 `32` 和 `16` 字节，但是 不支持 `64` 位 的 当时我就蒙蔽了，最后找了一个 `node-int64` 的库 才得以解决 , 开源大法好 :)
</p>

```js
const Int64 = require('node-int64');
const create64Buffer =
  (size = 8) =>
  (value) => {
    const nullBuffer = Buffer.alloc(8);
    const int64 = new Int64(value);
    const buffer_64 = int64.toBuffer();
    buffer_64.copy(nullBuffer, 0);
    return nullBuffer;
  };
```

过程虽然曲折，做的时候 感觉 很麻烦，不过在同事的帮助下，也是顺利的完成了这个任务，也让我对 `Buffer` 和 `socket` 有了更深的认识，还是不错的！
