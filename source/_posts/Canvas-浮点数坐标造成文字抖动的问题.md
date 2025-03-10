---
title: Canvas 浮点数坐标造成文字抖动的问题
date: 2022-04-15 18:32:08
tags: Canvas
---

<a name="ODwKA"></a>

### 上下文

起因是修复 [一个 bug](https://github.com/antvis/S2/issues/20) , 简单来说就是 滚动的时候文本会出现轻微的抖动，现象很奇怪

<a name="lGKRe"></a>

### 现象

仔细看 province city 区域 的文字，在滚动后 会出现轻微的抖动

![图 0](/images/2023-12-22-4227e11e1c7b2b7309f81065b9311ea53519f951e3e3ef285918cd7807da0d21.png)

### 问题代码

虚拟滚动条，在每次滚动后，需要同步滚动条和可视区域 的位置<br />

![图 1](/images/2023-12-22-9e0c5401aa0c1d38d55e14ec68b6db82af59f52b0bb94e9c08c2c61caed1ac65.png)

看起来没啥问题，计算出偏移量是一个很精确的**浮点数**

![图 2](/images/2023-12-22-b3c4e0b1ba90945b210a73c0ee3e5927c0653996d5c0cbd4989127cc3526afa7.png)

最后，在 mdn 看到这样 [一篇文章](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas), 有这样的说明<br />

![图 3](/images/2023-12-22-22849d77e147f1a51b00f18c8f17d6cfbff4d90f07c7c55f67c0c04636983d29.png)

<br />子像素，我在有些文章看到又称为亚像素

<a name="OXm7T"></a>

### Css Sub Pixel

在 css 中，浏览器是支持小数点的像素的，但是处理方式不同，我这里测试了下

width, padding , border 都是小数，以宽度为例，按照盒模型渲染预期结果：

132.34555 + 4.212377711 + 1.2 = **137.75792771099998**

浏览器 (Chorme) 中，宽度实际渲染为 **138**<br />

![图 4](/images/2023-12-22-075e519aee4682f45f5869eab48e5a7ef57d9dfdb854619b36e7e0573d8c3fac.png)

<br />调试工具 Computed 结果

![图 5](/images/2023-12-22-a5a3d4e5e58963ed25171b2c35255193eebf55ddf79e2ff956fca33c66a144ad.png)

<a name="3CO1f"></a>

### 文字抖动原因

根据 MDN 的说明，当坐标是非整数的时候，浏览器默认会开启抗锯齿功能，尽可能的让元素平滑

由于 Canvas 中也是支持子像素的，所以我猜测实际浏览器也会像 CSS 一样，有一套自己的算法，类似于 将坐标小数点四舍五入<br />

![图 6](/images/2023-12-22-a07839067d739b4b596970df86981ed3ffeacd17929882f09fe0c7a47c9a6561.png)

<br />所以在我这个例子中，滚动偏移比如

第一次滚动偏移 **342.9225376674107**, 实际渲染 **343**<br />

![图 10](/images/2023-12-22-9a82a99ddfa73f202852dd94fa86b31a46ab07c8a9e4c5420e7bf14baead463a.png)

```diff
- 342.9225376674107
+ 343
```

第二次滚动偏移 **670.256822374132**, 实际渲染 **670**

![图 9](/images/2023-12-22-b3e6c22a8baebfbc2630902de86442e882dc2ed2b4710542a08e87b8fd57fe16.png)

```diff
- 670.256822374132
+ 670
```

所以在实际的情况，偏移量有可能大，有可能小，就会产生所谓抖动的现象

现在将算出来的偏移量进行取整，抖动的问题解决

![图 8](/images/2023-12-22-4b346a9e092ecad4d59d209bdbca4edc7c579b76b889516e251842ffa430ca9a.png)

[![2j5j8USWRjXr1fgYd7K_302270051889___hd.mp4 (321.04KB)](https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*NNs6TKOR3isAAAAAAAAAAABkARQnAQ)]()

<a name="OL21i"></a>

### 参考资料

[canvas 的优化](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)<br />[html5-canvas-sprite-optimisation](https://seblee.me/2011/02/html5-canvas-sprite-optimisation/)<br />[sub-pixel-problems-in-css](https://johnresig.com/blog/sub-pixel-problems-in-css/)<br />[为何 Canvas 内元素动画总是在颤抖？](https://zhuanlan.zhihu.com/p/35966107)<br />[Improving HTML5 Canvas Performance](https://www.html5rocks.com/en/tutorials/canvas/performance/)
