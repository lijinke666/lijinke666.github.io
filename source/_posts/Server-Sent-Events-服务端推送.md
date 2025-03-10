---
title: Server-Sent Events 服务端推送
date: 2023-12-21 15:34:05
tags: Node.js
---

<a name="oBKDo"></a>

### 背景

我们在使用 GPT 或者 套壳 GPT 时，会发现对话的文字是一段一段展示出来的，而不是一次性，观察接口的 `Content-Type`可以看到，使用的是 `text/event-stream;charset=UTF-8`, 也就是 `Server-Sent Events` 服务端推送 （下文简称 `SSE`), 它和 `WebSocket` 不同，是单向的服务器推送，类似 `HTTP 2` 的 `Server Push`, 这篇文章就让我们来简单了解下 `SSE`.

![图 4](/images/2023-12-21-3664398732bcd10fe646b6cc5978ba5808ed6518e7e9d170660340d8a9230c21.png)

<a name="uSXhx"></a>

### 什么是 Server-Sent Events

Server-Sent Events (SSE) 本质上就是一个 `HTTP` 接口，区别于常见的 `json` 消息体，`Content-Type: application/json; charset=utf-8`, 它的类型为 `Content-Type: text/event-stream;charset=UTF-8`, 在调试窗口的 `EventStream`中可以看到：

[标准报文体](https://html.spec.whatwg.org/multipage/server-sent-events.html#:~:text=in%20event%20dispatch.-,9.2.6%20Interpreting%20an%20event%20stream,-Streams%20must%20be) 如下：

```typescript
id: xxx
event: xxx
retry: xxx
data: xxx
```

![图 5](/images/2023-12-21-33d68a85785fe45b4b088d5988e50946ab4aefaf7039e304fbada409984e8455.png)

<a name="ZVbLd"></a>

### 客户端如何发起 SSE 请求

既然也是 `HTTP`接口，那么如何发起请求呢？不同于 `XMLHttpRequest` 或者 `fetch`, 浏览器提供 `[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)` API 进行 `SSE` 的请求

> MDN 示例

```typescript
const sse = new EventSource("/api/v1/sse");

/*
 * This will listen only for events
 * similar to the following:
 *
 * event: notice
 * data: useful data
 * id: someid
 */
sse.addEventListener("notice", (e) => {
  console.log(e.data);
});

/*
 * Similarly, this will listen for events
 * with the field `event: update`
 */
sse.addEventListener("update", (e) => {
  console.log(e.data);
});

/*
 * The event "message" is a special case, as it
 * will capture events without an event field
 * as well as events that have the specific type
 * `event: message` It will not trigger on any
 * other event type.
 */
sse.addEventListener("message", (e) => {
  console.log(e.data);
});
```

<a name="wkpk8"></a>

### 服务器如何接受 SSE 请求

客户端发起 `SSE`请求后，各种套壳 GPT 应用肯定要 ~~调用 GPT 3.5 API~~ （访问自研大模型进行取数） , 这里以 `Node.js`为例<br />

![图 6](/images/2023-12-21-2831439879eeb41ce54d9e12b477942721579140c5619179a438d3eff3294656.png)

首先使用 `express`搭一个服务

```typescript
const express = require('express');

const app = express();

app.use(express.static(__dirname));
app.listen(3000, () => {
  console.log('server open in 3000');
});
```

然后声明一个 `/sse` GET 请求

```typescript
const { Transform } = require('node:stream');

app.get('/sse', (req, res) => {
  // SseStream 继承 Transform, 下文会提到
  const sse = new SseStream();

  sse.pipe(res);

  const message = {
    data: `hello\nworld${Date.now()}`,
    event: 'push',
    id: Date.now(),
    retry: '',
    comment: '测试',
  };

  sse.write(message);

});
```

<a name="AJbq0"></a>

#### 数据流

当接收到请求后，使用 `Node.js` 的 `[Transform](https://nodejs.org/api/stream.html#class-streamwritable:~:text=event%20is%20emitted.-,Class%3A%20stream.Transform,-%23)` 流，对数据进行转换

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

```javascript
process.stdin
```

输出流 (Writable)

```javascript
process.stdout
```

错误流 (Writable)

```javascript
process.stderr
```

<a name="o5T5Q"></a>

#### 写入请求头

首先写入 `text/event-stream`的 `Content-Type`

```typescript
 res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Transfer-Encoding': 'identity',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
```

<a name="HFDWM"></a>

#### 使用转换流将内容转成 SSE  的消息体格式

```typescript
const { Transform } = require('node:stream');

class SseStream extends Transform {
 _transform(message, encoding, callback) {
    if (message.comment) {
      this.push(`: ${message.comment}\n`);
    }

    if (message.event) {
      this.push(`event: ${message.event}\n`);
    }

    if (message.id) {
      this.push(`id: ${message.id}\n`);
    }

    if (message.retry) {
      this.push(`retry: ${message.retry}\n`);
    }

    if (message.data) {
      this.push(message.data);
    }

    this.push('\n');
    callback();
  }
}
```

完整代码如下：

```typescript
const { Transform } = require('node:stream');

class SseStream extends Transform {
  constructor(req) {
    super({ objectMode: true });

    if (req) {
      req.socket.setKeepAlive(true);
      req.socket.setNoDelay(true);
      req.socket.setTimeout(0);
    }
  }

  pipe(res, options) {
    if (res.writeHead) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Transfer-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.flushHeaders();
    }

    res.write(':ok\n\n');

    return super.pipe(res, options);
  }

  _transform(message, encoding, callback) {
    if (message.comment) {
      this.push(`: ${message.comment}\n`);
    }

    if (message.event) {
      this.push(`event: ${message.event}\n`);
    }

    if (message.id) {
      this.push(`id: ${message.id}\n`);
    }

    if (message.retry) {
      this.push(`retry: ${message.retry}\n`);
    }

    if (message.data) {
      this.push(message.data);
    }

    this.push('\n');
    callback();
  }
}
```

上诉的步骤相对来说比较繁琐，可以也可以使用 `ssestream` 这个库

```typescript
const SseStream = require('ssestream').default;

app.get('/sse-stream', (req, res) => {
  const sse = new SseStream(req);

  sse.pipe(res);

  const message = {
    data: `hello\nworld${Date.now()}`,
    event: 'push',
    id: Date.now(),
    retry: '',
    comment: '测试',
  };

  // 模拟服务器推送
  setInterval(() => {
    sse.write(message);
  }, 1000);
});

```

效果如图，可以看到每秒钟会收到服务器推送的消息，[查看 Demo 完整代码](https://github.com/lijinke666/nodeJs-demos/tree/master/sse)

![Kapture 2023-12-21 at 15.03.47.gif](/images/1703143274544-8e066f70-e52a-4111-a793-1c26fabdcb66.gif)

### 参考链接

[Node.js Stream](https://nodejs.org/api/stream.html#class-streamwritable)<br />[Server-Sent Events 服务器信息推送](https://juejin.cn/post/7074962899260669988)<br />[Web/API/EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
