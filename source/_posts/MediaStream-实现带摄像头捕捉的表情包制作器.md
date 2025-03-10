---
title: MediaStream 实现带摄像头捕捉的表情包制作器
date: 2018-06-27 22:57:07
tags: HTML5
---

### 1. 前言

之前恶搞了一张朋友的表情包，直接在百度上找了一个在线表情包制作器，突然灵光一闪，要是支持摄像头该多好，方便又快捷 （重点是省手机内存，不用拍照 :) ), 二话不说，开始搬砖

<br/>
<img src="https://lijinke666.github.io/lijinkeWeb-static/images/example.gif" style="max-width:100%"/>
<br/>

[体验地址](https://lijinke666.github.io/react-meme-generator/)

### 2. 预想的功能点

- `图片支持直接粘贴 和 拖拽`
- `图片和文字缩放，支持鼠标滚轮`
- `支持图片翻转`
- `支持捕捉摄像头画面当素材`

### 3. 撸页面

使用的第三方库

- `antd` 宇宙最强 ui 库
- `react-color` 取色器
- `react-draggle` 拖拽
- `dom-to-image` dom 节点转成图片

页面 使用 `React`+ `Antd` 方便快捷，三下五除二就搞定了

```js
//每一行基本就是这样子
const operationRow = ({ icon = 'edit', label, component }) => (
  <Row className={`${prefix}-item`}>
    <Col span={labelSpan} className={`${prefix}-item-label`}>
      <Button type="dashed" icon={icon}>
        {label}
      </Button>
    </Col>
    <Col
      span={valueSpan}
      offset={offsetSpan}
      className={`${prefix}-item-input`}
    >
      {component}
    </Col>
  </Row>
);
```

支持图片拖拽

```js
dragArea.addEventListener(
  'dragleave',
  (e) => {
    this.stopAll(e);
    this.removeDragAreaStyle();
  },
  false,
);
//移动
dragArea.addEventListener(
  'dragover',
  (e) => {
    this.stopAll(e);
    this.addDragAreaStyle();
  },
  false,
);
dragArea.addEventListener(
  'drop',
  (e) => {
    this.stopAll(e);
    this.removeDragAreaStyle();
    const files = e.dataTransfer.files;
    this.renderImage(Array.from(files)[0]);
  },
  false,
);
```

支持 图片 粘贴，这个也很简单 绑定粘贴事件 拿到 event 里面的 data 渲染出来就行了

```js
pasteHandler = (e) => {
  const { items, types } = e.clipboardData;
  if (!items) return;

  const item = items[0]; //只要一张图片
  const { kind, type } = item; //kind 种类 ,type 类型
  if (kind.toLocaleLowerCase() != 'file') {
    return message.error('错误的文件类型！');
  }
  const file = item.getAsFile();
  this.renderImage(file);
};
//粘贴图片
bindPasteListener = (area) => {
  area.addEventListener('paste', this.pasteHandler);
};
```

渲染图片

```
 renderImage = file => {
    if (file && Object.is(typeof file, "object")) {
      let { type, name, size } = file;
      if (!isImage(type)) {
        return message.error("无效的图片格式");
      }
      this.setState({ loading: true });
      const url = window.URL.createObjectURL(file);
      this.setState({
        currentImg: {
          src: url,
          size: `${~~(size / 1024)}KB`,
          type
        },
        scale: defaultScale,
        loading: false,
        loadingImgReady: true
      });
    }
  };
```

其他就没啥好说的了，常规的页面布局

### 4. 生成图片

生成图片 本质上就是 利用 canvas 的 `ctx.drawImage()`,

绘制文字

```js
const canvas = document.createElement('cavans');
const ctx = canvas.getContext('2d');

canvas.width = '预览区域的宽';
canvas.height = '预览区域的高';
//图片
ctx.drawImage('URL', ...attr);
//文字
ctx.fillText(TEXT, ...attr);
//旋转图片
ctx.rotate((Math.PI / 180) * 好多度）;
//缩放 也是 调用 drawImage, 改变 sy,sx 绘制的其实就实现缩放了
ctx.drawImage(URL, 0, 0, sx / scale, sy / scale, 0, 0, x, y);

//转成图片
canvas.toDataURL('image/png', 如果要压缩这里就填第二个参数）;
```

懂原理了 其实没必要一行一行这样写了 找到个 现成的 `dom-to-image` 的库，肥肠的不错，也是开源和组件化得魅力啊，利人利己

调用 api `domToimage.toPng()` 轻松搞定

```js
drawMeme = () => {
  const { width, height, loadingImgReady, isCompress } = this.state;
  if (!loadingImgReady) return message.error('请选择图片！');

  this.setState({ drawLoading: true });

  const imageArea = document.querySelector('.preview-content');
  const options = {
    width,
    height,
  };
  if (isCompress) {
    options.quality = defaultQuality;
  }
  domToImage
    .toPng(imageArea, options)
    .then((dataUrl) => {
      this.setState({ drawLoading: false });
      Modal.confirm({
        title: '生成成功',
        content: <img src={dataUrl} style={{ maxWidth: '100%' }} />,
        onOk: () => {
          message.success('下载成功！');
          const filename = Date.now();
          const ext = isCompress ? 'jpeg' : 'png';
          var link = document.createElement('a');
          link.download = `${filename}.${ext}`;
          link.href = dataUrl;
          link.click();
        },
        okText: '立即下载',
        cancelText: '再改一改',
      });
    })
    .catch((err) => {
      message.error(err);
      this.setState({ drawLoading: false });
    });
};
```

5. MediaStream 实现 摄像头捕捉

要想拿到 `MediaStream`, 调用 `navigatar.mediaDevices()` 即可，如果想研究 `webRTC`, 这些 API 也是基础，个人不是很感兴趣，就没研究，暂时只用到这个借口

```js
     navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true
        })
        .then(stream => {
          const cameraUrl = window.URL.createObjectURL(stream);
          const hide = message.loading('盛世美颜即将出现。..')
          //其他代码
          this.setState(
            {
              cameraUrl,
              cameraVisible: true
            },
            () => {
              setTimeout(()=>{
                try {
                  this.video.play();
                } catch (err) {
                  console.log(err);
                  Modal.error({
                    title: "摄像头失败",
                    content: err.message
                  });
                } finally{
                  hide()
                }
              },1000)

            }
          );
        })
        .catch((err)=>{

          console.log(err)
          Modal.error({
            title: "调用摄像头失败",
            content: err.toString()
          });
          this.setState({ cameraVisible: false });
        });
        })
```

这时页面左上角 会弹出一个提示 问你是不是允许 使用摄像头，同意后 拿到 `stream`, 否则进入 cath

<br/>
<img src="https://lijinke666.github.io/lijinkeWeb-static/images/WX20180627-162555%402x.png" style="max-width:100%"/>
<br/>

使用 `URL.createObjectURL()` 拿到一个临时的 url 链接

然后将 链接 设置成 `<video src={临时 URL}/>` 调用 `video.play()`

```
//jsx
          <video
            style={{
              display:"block",
              margin:"0 auto"
            }}
            ref={video => (this.video = video)}
            src={cameraUrl}
            width={previewContentStyle.width}
            height={previewContentStyle.height}
          />
```

这时就会看见一个 帅气的脸庞 出现在了屏幕上 !

这时来到了最后一步，截取画面，也很简单 把 video 节点画在 canvas 上，然后 `toDataURL()` 蹬蹬，搞定

```js
screenShotCamera = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const { width, height } = previewContentStyle;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(this.video, 0, 0, width, height);
  const data = canvas.toDataURL('image/png');
  message.success('截取摄像头画面成功！');
  this.setState({
    currentImg: {
      src: data,
    },
    cameraVisible: false,
    scale: defaultScale,
    loading: false,
    loadingImgReady: true,
  });
};
```

### 5. 下载图片

下载图片 基于 `HTML5`的 `download` 属性很好实现

```js
const filename = Date.now();
const ext = isCompress ? 'jpeg' : 'png';
const link = document.createElement('a');
link.download = `${filename}.${ext}`;
link.href = dataUrl;
link.click();
```

然后默认触发一次点击事件 搞定

### 6. 结语

这样一个支持 `摄像头` 的 表情包制作器就完成了，这时真的体会到了 `npm` 强大生态 和 组件化的 好处，也学习到了 各种新 api 的使用！老铁没毛病

[代码 GIHUB 地址](https://github.com/lijinke666/react-meme-generator)
