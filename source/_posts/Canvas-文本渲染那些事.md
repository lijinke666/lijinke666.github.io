---
title: Canvas 文本渲染那些事
date: 2024-12-31 10:04:48
tags: Canvas
---

### 背景

在表格细分领域中，主要的技术实现分为 DOM 和 Canvas, 满足不同的使用场景，各有优劣，DOM 更灵活更方便，很多事情浏览器渲染引擎已经帮你处理好了，缺点是性能较差，交互实现不灵活，Canvas 解决了 DOM 的缺点，但是也带来更高的上手成本和开发难度，本文就着重讲解使用 Canvas 实现 S2 表格在文本渲染上遇到的那些事。

<h3 id="GgCc9">让文本渲染更清晰</h3>

`DPR`是 "Device Pixel Ratio"（设备像素比）的缩写，指的是物理像素和设备独立像素的比率，不同的屏幕 `DPR`也不同，像我们平时用的 **2k 外接屏 DPR** 是 `1`, **Mac 视网膜屏幕** DPR 是 `2`.

| ![图 0](/images/2024-12-31-e0289d921ef67c663564ffe0d9094560667c799c1a86a3c408e973d0369ee454.png)  | ![图 1](/images/2024-12-31-34d9147a43aea40955c2db4743c0c835bc1f5ce19662ba2fc8d96d553d2833c7.png) |
| --- | --- |

在 Canvas 中需要额外适配，不然文本，图形等场景会模糊，也就是将 `canvas` 的宽高放大 n 倍 (n = DPR)

```typescript
const canvas = document.getElementById('your-canvas-id');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);
```

```typescript
ctx.fillText('哈哈', 0, 0);
```

:::warning
需要特别注意的是 `canvas.style.width` 和 `canvas.width` 是不同的，一个是 Canvas DOM 节点的 `width` 属性，一个是 CSS 样式，有本质上的区别。高清适配改变的是 `canvas.width`, 所以 DOM 的尺寸是不变的，**不会影响页面布局。**

:::

```typescript
canvas.style.width = xxx
canvas.width = xxx
```

![图 2](/images/2024-12-31-fd656246784f5ff2f918c4b0a3e073c32b0fdc13c2d3f3ee5a48988ce02ca9b6.png)

除此之外，还有 **DPR 切换的场景，**比如用户将浏览器从 2K 显示器移动到的另外一个 4K 的显示器 🖥, 由于 Canvas 是按照移动前的屏幕 DPR 进行的适配，所以也会有模糊的问题，解决的方法是通过 `matchMedia` 对 DPR 进行监听，重新更新 `canvas.width/height` 即可。

```typescript
// devicePixelRatio: 1
const media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

media.addEventListener('change', () => {
  const dpr = window.devicePixelRatio || 1; // devicePixelRatio: 2

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
});
```

<h3 id="Xw9wh">文本排版与换行</h3>

<h4 id="BafmC">排版</h4>

在 Canvas 中要进行文字的排版和换行并不是一件容易的事，如果是 DOM, 我们通过编写简单的 `CSS` 就可以实现布局，浏览器已经帮我们计算好了一切，但在 Canvas 画板中，所有元素都是需要自己计算的，文本 (Text), 边框 (Line), 单元格 (Rect) 所有的一切。可以理解所有元素都是**绝对定位**, 要手动控制所有元素的 `top/right/bottom/left`

![图 3](/images/2024-12-31-9b2849373160cedc205fa4b621cc411de776bf997fbf31b52630a13a86c27d64.png)

如图所示，我们想绘制一个 `数量` 单元格，文本的右边，需要绘制一个 `▽` 排序 icon, 简化的步骤如下：

+ 计算出单元格的盒模型 (BBox), 类似与浏览器那样
+ 计算出单元格的宽高和坐标 (x: 200, y: 100, width: 100, height: 30)
+ 计算出 `数量` 文本的宽度，考虑文字的对齐方式 （靠左/居中/靠右） 后，计算文本坐标
+ 计算出 `▽` icon 的宽高，考虑文本的 margin 和 padding 后，计算 icon 坐标

![图 6](/images/2024-12-31-451a23757b3f315f55eab8f0181fb0a5536fc7f9e91ebabda4e3077aa158801c.png)

由于还有滚动的场景，所以还需要额外考虑坐标的同步

![图 7](/images/2024-12-31-e29223c2b4c6fa85e821091c7da86bb8b12643724cd8fde11968fb36e7edfbb4.png)

[S2/packages/s2-core/src/cell/header-cell.ts at a09d1fe0507a566f154a407c92f13ff48beafc99 · antvis/S2](https://github.com/antvis/S2/blob/a09d1fe0507a566f154a407c92f13ff48beafc99/packages/s2-core/src/cell/header-cell.ts#L48)

对于 S2 这种单元格布局的场景，如果能像 CSS 那样使用 `flex` 或者 `grid`布局就非常的高效了，事实上，<font style="color:rgba(0, 0, 0, 0.85);">Facebook (Meta) 提供了跨平台布局引擎一个 </font>[<font style="color:rgba(0, 0, 0, 0.85);">Yoga</font>](https://yogalayout.com/)<font style="color:rgba(0, 0, 0, 0.85);">, 可以实现类似的效果，如果写过 </font>`<font style="color:rgba(0, 0, 0, 0.85);">React Native</font>`<font style="color:rgba(0, 0, 0, 0.85);">的同学肯定会很熟悉 </font>

![图 8](/images/2024-12-31-4f1181e23cc323234bf2418a747aa49b496c333a0d0df5bdb05a036482ef6a2f.png)

`AntV/G 5.0` 也封装了相应的插件 `[g-plugin-yoga](https://g.antv.antgroup.com/plugins/yoga)` 不过由于历史原因和升级成本的问题，S2 没有迁移到该方案。

![图 9](/images/2024-12-31-738bd90dfeb0bfc6ee9bc77d5b2556de8187a2bfd892b977cc849f0c8cd9e327.png)

<h4 id="iolbI">文本省略</h4>

解决了排版的问题，我们还需要考虑文本省略的场景，在 CSS 中，如果我们设置了 `text-overflow: ellipsis` 和 `overflow: hidden` 那么浏览器就会自动省略文本，并已 `...` 展示

![图 10](/images/2024-12-31-cef85a51127f058bb144ed03f33f66b0ca722c06cc1ec58260cd4283fee5e672.png)

对于 S2 的表格场景，单元格的宽度是固定的，并默认就是溢出异常，所以需要计算是否需要展示省略号

![图 11](/images/2024-12-31-68da122f90460a708024a14564b405de12fd67aa099156933d5ef5f16a2d64bc.png)

具体的实现感兴趣可以查看：

[S2/packages/s2-core/src/utils/text.ts at ab0d0e768cf627249b38205b8c77d95a20b3a901 · antvis/S2](https://github.com/antvis/S2/blob/ab0d0e768cf627249b38205b8c77d95a20b3a901/packages/s2-core/src/utils/text.ts#L193-L289)

:::info
一个有趣的点是：按照浏览器的规范，当给定的宽度连省略号都不足以展示的话，会直接对文字进行截断，而不是显示 `...`

:::

![图 12](/images/2024-12-31-1609f09856339f058ab06c7391a0430e122facaa1fde3d78cdf37732e41a48e2.png)

<h4 id="d90Ay">多行文本</h4>

![图 13](/images/2024-12-31-770fad79165199f549a4350c3a923a9dae186d551a680a03618589795c0ffda7.png)

在 CSS 中，我们可以通过 `line-clamp` 实现多行文本

```css
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
```

对于 S2 的表格场景，单元格的宽度是固定的，以换两行为例：

1. 首先计算当前文本是否存在省略号
2. 如果存在省略号，说明一行文字显示不下，那么进行分词
3. 分词后，对第二行的文字进行相同的操作，第 n 行依次类推

```typescript
protected drawTextShape() {
    const { x } = this.getContentArea();
    const { y, height } = this.getCellArea();

    const textStyle = this.getTextStyle();
    const cornerText = this.getCornerText();

    // 当为树状结构下需要计算文本前收起展开的 icon 占的位置

    const maxWidth = this.getMaxTextWidth();
    const emptyPlaceholder = getEmptyPlaceholder(
      this.meta,
      this.spreadsheet.options.placeholder,
    );
    const { measureTextWidth } = this.spreadsheet;
    const text = getEllipsisText({
      measureTextWidth,
      text: cornerText,
      maxWidth,
      fontParam: textStyle,
      placeholder: emptyPlaceholder,
    });
    this.actualText = text;
    const ellipseIndex = text.indexOf(ELLIPSIS_SYMBOL);

    let firstLine = text;
    let secondLine = '';

    // 存在文字的省略号 & 展示为 tree 结构
    if (ellipseIndex !== -1 && this.spreadsheet.isHierarchyTreeType()) {
      // 剪裁到 ... 最有点的后 1 个像素位置
      const lastIndex = ellipseIndex + (isIPhoneX() ? 1 : 0);
      firstLine = cornerText.substr(0, lastIndex);
      secondLine = cornerText.slice(lastIndex);
      // 第二行重新计算。.. 逻辑
      secondLine = getEllipsisText({
        measureTextWidth,
        text: secondLine,
        maxWidth,
        fontParam: textStyle,
      });
    }

    const { x: textX } = getTextPosition(
      {
        x: x + this.getTreeIconWidth(),
        y,
        width: maxWidth,
        height,
      },
      textStyle,
    );

    const textY = y + (isEmpty(secondLine) ? height / 2 : height / 4);
    // first line
    this.addTextShape(
      renderText(
        this,
        [this.textShapes[0]],
        textX,
        textY,
        firstLine,
        textStyle,
      ),
    );

    // second line
    if (!isEmpty(secondLine)) {
      this.addTextShape(
        renderText(
          this,
          [this.textShapes[1]],
          textX,
          y + height * 0.75,
          secondLine,
          textStyle,
        ),
      );
    }

    this.actualTextWidth = max([
      measureTextWidth(firstLine, textStyle),
      measureTextWidth(secondLine, textStyle),
    ]);
  }
```

[S2/packages/s2-core/src/cell/corner-cell.ts at ab0d0e768cf627249b38205b8c77d95a20b3a901 · antvis/S2](https://github.com/antvis/S2/blob/ab0d0e768cf627249b38205b8c77d95a20b3a901/packages/s2-core/src/cell/corner-cell.ts#L76-L160)

在 S2 2.0 中，得益与 G 5.0 渲染引擎的升级，内置了多行文本的能力，具体实现如下：

[G/packages/g-lite/src/services/TextService.ts at ee938ca12ac343d0506b7fa41bbd27d92fdd4d28 · antvis/G](https://github.com/antvis/G/blob/ee938ca12ac343d0506b7fa41bbd27d92fdd4d28/packages/g-lite/src/services/TextService.ts#L345)

<h3 id="BBofT">文本抗锯齿</h3>

在游戏中，我们经常看到 [垂直同步、动态模糊、抗锯齿](https://zhuanlan.zhihu.com/p/442816681) 这些关键词

![图 14](/images/2024-12-31-b653367d2b809d9c2d4fee33c0d343889aa61c49ca72409fa73cfb17e8a9e176.png)

其中抗锯齿中的 "锯齿" 就像下图一样

![图 15](/images/2024-12-31-575a9ccd7b03d7fbfb1e42678eecf43d1885a2fb77fd2716849a6e7dc2b1f51a.png)

如果用过 Windows "不知名软件" - "画图" 的话，画一条线就会看到下面这样

![图 16](/images/2024-12-31-4bc3e9bcc6b05291c3d58d22d0acf149e0dab2806fb1511d68a2bbefe61a3557.png)

![图 17](/images/2024-12-31-811f8f1487604791fe13e5c727e0391f9c7debfab2423dc335fde8273212746f.png)

在浏览器中，也会出现锯齿效果，专业名词叫`<font style="color:rgb(27, 27, 27);">anti-aliasing effect</font>`<font style="color:rgb(27, 27, 27);"> , 不同的浏览器渲染引擎有不同的表现。</font>

![图 18](/images/2024-12-31-7a9fbcbc3dc4111e7eb57aa2a89ca0c36e364b100011964703244ff6823b0335.png)

浏览器允许我们写子像素，也就是 `width: 12px` `width: 12.3px` 都能正常渲染，每一个像素点可以看做一个正方形的格子，一旦文本边缘不再处于像素格网的整数位置，就会出现锯齿。要解决这个问题也很简单。对**像素进行取整**即可。

对于 CSS 可以开启 `-webkit-font-smoothing` 来优化

```css
.smoothed {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

在 Canvas 中可以开启 `webkitImageSmoothingEnabled`来优化

```typescript
const ctx = canvas.getContext('2d');
ctx.webkitImageSmoothingEnabled = true;
```

如果不开启抗锯齿的话，在 Canvas 中还会出现抖动的问题，可以点击下文了解更多

[Canvas 浮点数坐标造成文字抖动的问题](https://www.yuque.com/lijinke/blog/wes11u?singleDoc#)

<h3 id="S5rba">文本宽高测量与字体的影响</h3>

在表格渲染中，需要渲染大量的文本，需要计算文本的宽高用于布局坐标的计算，从而实现排版，宽度受浏览器的字体和符号影响

常见的文本有汉字，数字，英文，甚至 `Emoji 😸`, Emoji 通常是由多个 Unicode 字符组成的复合字符，宽度各不相同，那对于这种场景，如果我们想保证测量的宽度一致，那么可以使用 `[等宽字体](https://zh.wikipedia.org/zh-hans/%E7%AD%89%E5%AE%BD%E5%AD%97%E4%BD%93)`

![图 19](/images/2024-12-31-b2cea509899a11666b3e2d3476c07fd306bfcf232b1b2863c6474c084f863f69.png)
![图 20](/images/2024-12-31-cba70c4047295bce8a83a8b7f83bf4321e8c6e558a0d938884b365ec001c9d4e.png)

```typescript
JetBrains Mono, Fira Code, Source Code Pro,Menlo,FiraCode-Medium,FiraCode-Light,FiraCode-Light,'Courier New', monospace
```

```typescript
const canvas = document.getElementById('your-canvas-id');
const ctx = canvas.getContext('2d');
ctx.font = '16px JetBrains Mono';

const text = 'Hello World!';
const textWidth = ctx.measureText(text).width;
```

使用 Canvas Context 的 `measureText`, 获取到 [TextMetrics](https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics) 后，我们可以拿到相应的宽高，对于相同的文本，我们可以缓存起来，提高计算性能

```typescript
 public measureText = memoize(
    (text: number | string = '', font: unknown): TextMetrics | null => {
      if (!font) {
        return null;
      }

      const ctx = this.getCanvasElement()?.getContext('2d')!;
      const { fontSize, fontFamily, fontWeight, fontStyle, fontVariant } =
        font as CSSStyleDeclaration;

      ctx.font = [
        fontStyle,
        fontVariant,
        fontWeight,
        `${fontSize}px`,
        fontFamily,
      ]
        .join(' ')
        .trim();

      return ctx.measureText(String(text));
    },
    (text, font) => [text, ...values(font)].join(''),
  );

  public measureTextWidth = (
    text: number | string = '',
    font: unknown,
  ): number => {
    const textMetrics = this.measureText(text, font);

    return textMetrics?.width || 0;
  };

  public measureTextHeight = (
    text: number | string = '',
    font: unknown,
  ): number => {
    const textMetrics = this.measureText(text, font);

    if (!textMetrics) {
      return 0;
    }

    return (
      textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
    );
  };
```

<h3 id="EWruh">离屏 Canvas 与字体的影响</h3>

通常我们说的 `离屏 Canvas` 是指没有 append 到 body 上 （用户不可见） 的 `Canvas`, 它存在于内存中，用于做一些复杂计算和绘制，在处理完成后，再绘制回原本的 Canvas, 以提升性能

```typescript
const offscreenCanvas = document.createElement('canvas');
const ctx = offscreenCanvas.getContext('2d');

// 在离屏 Canvas 上进行绘制操作
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 50, 50);

// 把离屏 Canvas 绘制到页面可见的 Canvas 上
const visibleCanvas = document.getElementById('visibleCanvas');
const visibleCtx = visibleCanvas.getContext('2d');
visibleCtx.drawImage(offscreenCanvas, 0, 0);
```

> 现代浏览器也提供一个实现性的标准实现 [OffscreenCanvas](https://developer.mozilla.org/zh-CN/docs/Web/API/OffscreenCanvas), 由于不是本文重点，这里略过
>

```plain
myEntity.offscreenCanvas = document.createElement("canvas");
myEntity.offscreenCanvas.width = myEntity.width;
myEntity.offscreenCanvas.height = myEntity.height;
myEntity.offscreenContext = myEntity.offscreenCanvas.getContext("2d");

myEntity.render(myEntity.offscreenContext);
```

由于离屏 Canvas 不存在文档流中，那么也会出现文本宽度测量不一致的问题，解决方法也很简单，将其添加到 body 中 （默认隐藏）, 即可得到一致的字体表现。

![图 21](/images/2024-12-31-1f885c962cc996040e0d217e39d4b12dfa575ac4fa6d1c388ab6f09bf6e8bae9.png)

<h3 id="M9QRd">文本无障碍体验</h3>
> 无障碍（Accessibility）是指为人们提供平等访问信息、服务和环境的设计理念和实践。在 Web 开发中，无障碍性是确保所有人，包括身体残障、认知障碍和感知障碍的人，都能够获得和使用网站和应用程序的能力。
>

无障碍体验目前苹果做的最好，对于前端来说，很多组件库也做了一些无障碍的适配，比如 Ant Design

![图 22](/images/2024-12-31-0461b29167511db4969277a8cc1a8fb56523c2046ccb2909f5a9bb3daa4340c0.png)

对于表格这类大量文字的场景，对于使用 Canvas 的表格的 S2 来说是一大痛点，比如文字无法被选中，无法被键盘访问，无法添加 `aria` 标签，无法被搜索等问题。同时对 SEO 也不友好。

![图 23](/images/2024-12-31-8ea497cf4f533368f93a2aa9eb1342e30992e62bef43a93d13f827248ec8a857.png)

要解决这个问题，我们可以在 Canvas 的上方添加 DOM 蒙层，并解析 Canvas 内的文本元素，绝对定位一个相同的 DOM 版本的节点，提升可访问性，G 5.0 提供了 [g-plugin-a11y](https://g.antv.antgroup.com/plugins/a11y) 插件，可以很方便的实现该能力。

![图 24](/images/2024-12-31-e9cb749fdb99f7707ced0eb7ce6611d0e411e26cc7fab6eeb7bea4fa1ace52fc.png)

![图 25](/images/2024-12-31-19cb6061b382c41b4a383c2fcde61f4fe35b45a9c0462d919a91f425612a8561.png)

<h3 id="wARxj">参考文章</h3>

[异步分片计算在腾讯文档的实践](https://zhuanlan.zhihu.com/p/570318956)

[浅谈 Canvas 渲染引擎](https://zhuanlan.zhihu.com/p/608415829)

[用 Canvas 实现虚拟列表的难点在哪里？](https://www.zhihu.com/question/517190133/answer/2354923121)

[html5-canvas-sprite-optimisation](https://seblee.me/2011/02/html5-canvas-sprite-optimisation/)

[Sub-Pixel Problems in CSS](https://johnresig.com/blog/sub-pixel-problems-in-css/)

[为何 Canvas 内元素动画总是在颤抖？](https://zhuanlan.zhihu.com/p/35966107)

[Improving HTML5 Canvas Performance](https://www.html5rocks.com/en/tutorials/canvas/performance/)

[Canvas 的优化](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

[Text Wrapping](https://www.w3.org/TR/css-text-4/#text-wrap)

[AntV/G 多行布局](https://g.antv.antgroup.com/api/basic/text#%E5%A4%9A%E8%A1%8C%E5%B8%83%E5%B1%80)

[单机游戏画面设置中的抗锯齿是什么意思？画面中有锯齿又是什么效果？](https://www.zhihu.com/question/28855427)

[无障碍设计中的用户体验](https://www.woshipm.com/pd/4878303.html)

[Canvas 局部渲染优化总结](https://www.yuque.com/antv/blog/ydsuqn)
