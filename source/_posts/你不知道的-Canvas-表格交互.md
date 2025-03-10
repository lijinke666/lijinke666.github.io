---
title: 你不知道的 Canvas 表格交互
date: 2022-03-30 10:32:39
tags: JavaScript, Canvas
---

<a name="oBKDo"></a>

### 背景

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648003254495-5a7af464-4bb3-4513-bfb5-67fb801b58ca.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=392&id=u10e69226&originHeight=784&originWidth=1161&originalType=binary&ratio=1&rotation=0&showTitle=false&size=522421&status=error&style=none&taskId=u188f2831-4ab8-49c4-9139-8567d0367be&title=&width=580.5)<br />S2 是 AntV 在多维交叉分析表格领域的解决方案，主要用于看数分析，S2 采用 `Canvas` 来进行表格绘制 （基于 易用、高效、强大的 2D 可视化渲染引擎 [G](https://g-next.antv.vision/) ) , 同时内置大量的 [交互能力](https://s2.antv.vision/zh/examples/gallery#category-%E5%9F%BA%E7%A1%80%E4%BA%A4%E4%BA%92) 来辅助用户看数，如 `行列联动高亮` `单选/多选高亮` `刷选高亮` `行高列宽动态调整` `列头隐藏` 等，同时还支持 `自定义交互`, 本文主要介绍 S2 是如何实现这些交互的。

<a name="KbdqE"></a>

### DOM 交互和 Canvas 交互的区别

以单元格点击为例，得益于强大的 `CSS3`选择器，我们可以准确的监听任意 dom 元素的点击事件

```html
<ul class="cell">
  <li id="cell1">我是第一个单元格</li>
  <li id="cell2">我是第二个单元格</li>
</ul>
```

```typescript
const cell = document.querySelector('.cell > li:first-child');

cell.addEventListener('click', () => {
  console.log('第一个单元格：别点我！');
})
```

但是 canvas  就只有一个 `<canvas/>` dom 元素

```
<canvas />
```

如何准确的知道点击的是哪个单元格呢？答案是 `事件委托`+ `鼠标坐标`

```typescript
const canvas = document.querySelector('canvas');

canvas.addEventListener('click', () => {
  console.log('我点的是哪个单元格？');
})
```

在 dom 中，有一个很经典的事件冒泡应用场景，那就是 `事件委托`, 还是以上面的例子，我们可以只监听父级的 `ul`元素，根据当前的 `event.target` 来判断当前点击的是哪一个单元格

```typescript
const cell = document.querySelector('.cell');

cell.addEventListener('click', (event) => {
  const CELL_ID = 'cell1'
  if (event.target?.id === CELL_ID) {
    console.log('我是第一个单元格');
  }
});
```

所以在 `canvas`中，我们也可以依葫芦画瓢，不同点是，单元格不再是一个个的 dom 节点，而是一个个 canvas 图形 对应的数据结构，类似于虚拟 dom<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648006350810-0f7dfc4e-f2f6-42d3-af36-8a20663bbecf.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=204&id=u9d24b597&originHeight=407&originWidth=1422&originalType=binary&ratio=1&rotation=0&showTitle=false&size=373684&status=error&style=none&taskId=ucab14bc3-6546-49e4-a11d-52fb53d9695&title=&width=711)

```typescript
const cell = new Shape({ type: 'rect' })
```

```typescript

public getCell<T extends S2CellType = S2CellType>(event): T {
  let parent = event.target;
  // 判断当前 target 属于哪一个实例
  while (parent && !(parent instanceof Canvas)) {
    if (parent instanceof BaseCell) {
      // 在单元格中，返回 true
      return parent as T;
    }
    parent = parent.get?.('parent');
  }
  return null;
}

// antv/g 提供的 Canvas 构造器
const canvas = new Canvas()

canvas.on('click', (event) => {
  const cell = this.getCell(event)
})
```

<a name="O66WD"></a>

### 事件分类

通过事件委托，能够获取到具体触发事件的单元格 ( [具体实现](https://github.com/antvis/S2/blob/master/packages/s2-core/src/interaction/event-controller.ts) )

- 角头单元格点击：`S2Event.CORNER_CELL_CLICK`
- 列头单元格点击：`S2Event.COL_CELL_CLICK`
- 行头单元格点击：`S2Event.ROW_CELL_CLICK`
- 数据单元格点击：`S2Event.DATA_CELL_CLICK`
- 单元格双击
- 单元格右键
- ...

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648007103660-45b417ea-0a36-4929-b331-915c3c6f3ba6.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=192&id=udc517556&originHeight=206&originWidth=625&originalType=binary&ratio=1&rotation=0&showTitle=false&size=57161&status=error&style=none&taskId=u61955011-c62b-45f1-983f-eb33df7b309&title=&width=583.5)<br />在监听到对应事件后，通过内部的 `event emitter` 分发出去，从而触发对应的单元格事件

```typescript
 private onCanvasMousedown = (event: CanvasEvent) => {
    const cellType = this.spreadsheet.getCellType(event.target);
    switch (cellType) {
      case CellTypes.DATA_CELL:
        this.spreadsheet.emit(S2Event.DATA_CELL_MOUSE_DOWN, event);
        break;
      case CellTypes.ROW_CELL:
        this.spreadsheet.emit(S2Event.ROW_CELL_MOUSE_DOWN, event);
        break;
      case CellTypes.COL_CELL:
        this.spreadsheet.emit(S2Event.COL_CELL_MOUSE_DOWN, event);
        break;
      case CellTypes.CORNER_CELL:
        this.spreadsheet.emit(S2Event.CORNER_CELL_MOUSE_DOWN, event);
        break;
      case CellTypes.MERGED_CELL:
        this.spreadsheet.emit(S2Event.MERGED_CELLS_MOUSE_DOWN, event);
        break;
      default:
        break;
    }
  };
```

```typescript
this.spreadsheet.on(S2event.DATA_CELL_MOUSE_DOWN, (event) => {
  console.log('数值单元格点击')
})
```

<a name="Py8rV"></a>

### 交互分类

有了分好类的单元格事件，我们就可以将其排列组合。 比如刷选高亮，就对应 数值单元格的 `mousedown`+ `mousemove`+ `mouseup` 事件，再将获取到的单元格 meta 信息存储在状态机，最后根据交互状态进行 canvas 重绘

| 交互类型 | 名称 | 适用场景 |
| --- | --- | --- |
| 全选 | ALL_SELECTED | 复制 |
| 选中 | SELECTED | 单选/多选/行列批量选中 |
| 未选中 | UNSELECTED | 点击空白处，ESC 键重置，偶数次点击单元格 |
| 悬停 | HOVER | 行列联动高亮 |
| 长时间悬停 | HOVER_FOCUS | 显示 tooltip |
| 预选中 | PREPARE_SELECT | 刷选 |

<a name="wOgnN"></a>

### 单选高亮

[在线体验](https://s2.antv.vision/zh/examples/interaction/basic#click-highlight)<br />![Kapture 2022-03-23 at 11.35.49.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1648006716776-17aa7f7b-1622-404b-bee4-68eca9b10b81.gif#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=drop&id=ufb162afe&originHeight=331&originWidth=603&originalType=binary&ratio=1&rotation=0&showTitle=false&size=284648&status=error&style=none&taskId=u5e08bc1e-72b5-4959-bf13-1c3355757ff&title=)<br />鼠标左键单击单元格后，会高亮当前单元格，聚焦当前的数据。

在实现上，其实并没有对当前选中单元格做**高亮**操作，而是**置灰**其他所有**非选中状态的**数值单元格，就像一种 `聚光灯`效果。

通过 `cell.getMeta()` 拿到渲染时闭包保存的当前单元格信息，然后调用 `interaction.changeState` 改变当前交互状态，将状态改为 `InteractionStateName.SELECTED`

```typescript
  this.spreadsheet.on(S2Event.DATA_CELL_CLICK, (event: CanvasEvent) => {
    const cell: DataCell = this.spreadsheet.getCell(event.target);
    const meta = cell.getMeta();

    interaction.changeState({
      cells: [getCellMeta(cell)],
      stateName: InteractionStateName.SELECTED,
    });
  });
```

最后的 state 为：

```typescript
const cell = {
  id: 'cell-id'  // 单元格唯一标识
  colIndex: 0,   // 列索引
  rowIndex: 0    // 行索引
  type: 'cell-type' // 单元格类型
}

const state = {
  name: InteractionStateName.SELECTED,
  cells: [cell]
}
```

接下来就是获取到当前可视范围内所有的数值单元格，对它们进行更新

```typescript

  public updatePanelGroupAllDataCells() {
    this.updateCells(this.getPanelGroupAllDataCells());
  }

  public updateCells(cells: S2CellType[] = []) {
    cells.forEach((cell) => {
      cell.update();
    });
  }
```

每一个单元格实例会有一个 `update`方法，最终会根据当前的状态 改变单元格背景色透明度 `fillOpacity`

```typescript
// 简化代码
function update() {
  const stateName = this.spreadsheet.interaction.getCurrentStateName();
  const fillOpacity = stateName === InteractionStateName.SELECTED ? 1 : 0.2

  cell.attrs = {
    fillOpacity
  }

  canvas.draw()
}
```

<a name="z4yzf"></a>

### 行列联动高亮

[在线体验](https://s2.antv.vision/zh/examples/interaction/basic#hover)<br />![Kapture 2022-03-23 at 11.37.06.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1648006684560-f2c28481-cddd-495e-abbd-b1b01fc4c89b.gif#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=drop&id=u241a8b1f&originHeight=331&originWidth=603&originalType=binary&ratio=1&rotation=0&showTitle=false&size=365758&status=error&style=none&taskId=ue7e0d22d-8638-46ec-aade-3834860dae7&title=)

当鼠标 hover 在数值单元格上时，会同时高亮对应的行头和列头，也就是 `十字高亮效果`, 便于用户清晰的知道对应关系，实现上首先和单选一样，先改变状态为 `InteractionStateName.HOVER` 然后绘制当前单元格的黑色边框

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648017469354-51216659-b6ae-4d3d-a0de-b3d3d5f1646f.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=94&id=uc9912611&originHeight=188&originWidth=392&originalType=binary&ratio=1&rotation=0&showTitle=false&size=75281&status=error&style=none&taskId=u903d8e27-9b97-4b64-bbd5-0929769dcc1&title=&width=196)

```typescript
this.spreadsheet.on(S2Event.DATA_CELL_HOVER, (event: CanvasEvent) => {
  const cell = this.spreadsheet.getCell(event.target) as S2CellType;
  const { interaction, options } = this.spreadsheet;
  const meta = cell?.getMeta() as ViewMeta;

  interaction.changeState({
    cells: [getCellMeta(cell)],
    stateName: InteractionStateName.HOVER,
  });

   this.updateRowColCells(meta);
 }
```

先绘制数值单元格区域的十字高亮，比较当前单元格和 state 存储的 `rowIndex` / `colIndex`  是否一致，如果有一个相同就表示处于同一列/行，对其进行高亮

```typescript

  const currentColIndex = this.meta.colIndex;
  const currentRowIndex = this.meta.rowIndex;
  // 当视图内的 cell 行列 index 与 hover 的 cell 一致，绘制 hover 的十字样式
  if (
    currentColIndex === currentHoverCell?.colIndex ||
    currentRowIndex === currentHoverCell?.rowIndex
  ) {
    this.updateByState(InteractionStateName.HOVER);
  } else {
    // 当视图内的 cell 行列 index 与 hover 的 cell 不一致，隐藏其他样式
    this.hideInteractionShape();
  }
```

```typescript
  cell.attrs = {
    backgroundOpacity: '#color'
  }
```

接下来是行头和列头，处理有些许不同，由于透视表行头和列头是多维嵌套的，有父子级关系，不能单纯的比较行/列索引，需要额外比较 单元格 id<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648017869972-a5f0c3dc-393b-4568-ab22-f4778359349a.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=357&id=ud8a37caf&originHeight=714&originWidth=1254&originalType=binary&ratio=1&rotation=0&showTitle=false&size=642112&status=error&style=none&taskId=u45df43f9-88f3-420b-9647-b8a99ea2bf0&title=&width=627)<br />如图，行头我们需要高亮 `浙江省/舟山市` 列头需要高亮 `家具/沙发/数量`, 内部对应存储的 id 为

- `浙江省/舟山市`  => `root[&] 浙江省 [&] 舟山市`
- `家具/沙发/数量` => `root[&] 家具 [&] 沙发 [&]number`

 <br />所以 `浙江省/舟山市` 和 `家具/沙发/数量` 对应的`834` 数值单元格的 id 为 => `root[&] 浙江省 [&] 舟山市-root[&] 家具 [&] 沙发 [&]number`, 最后去看行/列头单元格 id 是否为包含关系，高亮即可

```typescript
const allRowHeaderCells = getActiveHoverRowColCells(
  rowId,
  interaction.getAllRowHeaderCells(),
  this.spreadsheet.isHierarchyTreeType(),
);

forEach(allRowHeaderCells, (cell: RowCell) => {
  cell.updateByState(InteractionStateName.HOVER);
});
```

<a name="hjLqa"></a>

### 刷选高亮

[在线体验](https://s2.antv.vision/zh/examples/interaction/basic#select-highlight)<br />![Kapture 2022-03-23 at 11.40.02.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1648006820796-cb00afde-0344-4b09-885d-622b1df015ad.gif#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=drop&id=ubbf3a2f7&originHeight=331&originWidth=603&originalType=binary&ratio=1&rotation=0&showTitle=false&size=218818&status=error&style=none&taskId=uf25ac203-0feb-41eb-ad10-a564893b5b4&title=)

刷选用于对批量单元格数据汇总，本质是一种拖拽的动作，拖拽结束后，需要选中拖拽起始坐标点对角线矩形区域的所有单元格。

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648019083231-21712949-24eb-4afc-9e4f-44ea16ccd8c4.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=373&id=u3e66620a&originHeight=380&originWidth=506&originalType=binary&ratio=1&rotation=0&showTitle=false&size=133195&status=error&style=none&taskId=u5a25d5ef-621d-477c-a3d5-7bf5a543967&title=&width=497)

刷选过程中，还需要考虑鼠标已经超过表格区域，此时默认认为用户还想继续刷选可视范围外的单元格 （如有）, 也就是滚动刷选，这个在 [使用 AntV S2 打造大数据表格组件](https://zhuanlan.zhihu.com/p/478129151) 已有相关介绍。这里就不再赘述。

刷选和其他交互不同，会有一个 `预选中`状态，如图，会有一个蓝色的预选中蓝色蒙层，并且该区域单元格显示黑色边框，表示松开鼠标后，这些单元格会被选中，用于给用户一个提示<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648019706436-27dbd1ac-321d-4e96-8b48-0f33697ace96.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=197&id=u3244b51a&originHeight=394&originWidth=618&originalType=binary&ratio=1&rotation=0&showTitle=false&size=222673&status=error&style=none&taskId=u1126320c-7483-457f-886d-8acd700f917&title=&width=309)<br />首先在点击单元格时记录一个刷选起始点，包含 `x/y`坐标，`rowIndex/colIndex` 行/列索引等信息

```typescript
private getBrushPoint(event: CanvasEvent): BrushPoint {
  const { scrollY, scrollX } = this.spreadsheet.facet.getScrollOffset();
  const originalEvent = event.originalEvent as unknown as OriginalEvent;
  const point: Point = {
    x: originalEvent?.layerX,
    y: originalEvent?.layerY,
  };
  const cell = this.spreadsheet.getCell(event.target);
  const { colIndex, rowIndex } = cell.getMeta();

  return {
    ...point,
    rowIndex,
    colIndex,
    scrollY,
    scrollX,
  };
}
```

然后在刷选结束，鼠标松开后，得到一个完整的刷选信息，最后比较当前单元格是否在这个范围即可

```typescript
  return {
    start: {
      rowIndex: 0,
      colIndex: 0,
      x: 0,
      y: 0,
    },
    end: {
      rowIndex: 2,
      colIndex: 2,
      x: 200,
      y: 200,
    },
    width: 200,
    height: 200,
  };
```

```typescript
private isInBrushRange(meta: ViewMeta) {
  const { start, end } = this.getBrushRange();
  const { rowIndex, colIndex } = meta;
  return (
    rowIndex >= start.rowIndex &&
    rowIndex <= end.rowIndex &&
    colIndex >= start.colIndex &&
    colIndex <= end.colIndex
  );
}
```

将获取到单元格信息，存储在 state, 然后重绘

```typescript
this.spreadsheet.on(S2Event.GLOBAL_MOUSE_UP, (event) => {
  const range = this.getBrushRange();

  this.spreadsheet.interaction.changeState({
    cells: this.getSelectedCellMetas(range),
    stateName: InteractionStateName.SELECTED,
  });
}
```

<a name="OUHnq"></a>

### 行高列高动态调整

[在线体验](https://s2.antv.vision/zh/examples/interaction/basic#resize)<br />![Kapture 2022-03-23 at 11.41.05.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1648006898879-0817442f-a793-40aa-8f73-5f53024552fe.gif#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=drop&id=u3cda807b&originHeight=331&originWidth=603&originalType=binary&ratio=1&rotation=0&showTitle=false&size=418693&status=error&style=none&taskId=uea4001a2-37d4-44ff-805c-fad51d5e4c5&title=)

S2 默认提供 `列等宽布局` `行列等宽布局`和 `紧凑布局` 三种布局方式 ([预览](https://s2.antv.vision/zh/examples/layout/basic#compact)), 也可以拖拽行/列头进行动态调整，要实现这种效果，首先需要绘制调整的热区，也就是如下图这个蓝色的小条，默认情况下是隐藏的，只有在鼠标放在单元格边缘才会显示出来 （还可以 [自定义热区范围](https://s2.antv.vision/zh/examples/interaction/advanced#resize-active) )<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648021526223-33258f01-e9fc-42c3-96c5-af4d014b5853.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=201&id=uf8c22aaf&originHeight=151&originWidth=302&originalType=binary&ratio=1&rotation=0&showTitle=false&size=27378&status=error&style=none&taskId=ue188c80e-f021-4499-be54-c9518a08ade&title=&width=402)

细心的同学可能发现了，鼠标放在热区上面，会变成这样一个图标，这个比较有趣，在 `CSS`中 我们可以给任意元素添加 `cursor: col-resize` 来实现，在 `Canvas`中 由于只有 `canvas`一个 dom 标签，我们则需要判断 `hover`热区时，给 `canvas`加上 `cursor: col-resize` 行内样式，实现同样的效果<br /> <br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648088567767-4b7d6dc9-9ed4-42fd-9f56-e7ddeb07c080.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=109&id=udb14f59c&originHeight=218&originWidth=702&originalType=binary&ratio=1&rotation=0&showTitle=false&size=139501&status=error&style=none&taskId=u8b3584bb-f3b4-4f82-bd19-750288e47ef&title=&width=351)

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648088786965-c0770f95-d83c-4d18-88ce-f5105e2fb264.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=128&id=u0127d44b&originHeight=255&originWidth=1046&originalType=binary&ratio=1&rotation=0&showTitle=false&size=210324&status=error&style=none&taskId=u607951d8-0240-48be-8fbb-82b1860f688&title=&width=523)

如果把热区全部显示出来，展示的效果如下：

平铺模式：<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648021619522-70a35b87-16f7-474a-a4ff-f64957f4280a.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=296&id=uc4609b1b&originHeight=352&originWidth=618&originalType=binary&ratio=1&rotation=0&showTitle=false&size=117010&status=error&style=none&taskId=u4e41cb94-d704-4b23-b07b-7b2b5e206cc&title=&width=520) <br />树状模式：<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648021658204-176f8d1a-8e93-4380-b87f-ab6c9f2a12ec.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=341&id=u9d0cca0e&originHeight=398&originWidth=607&originalType=binary&ratio=1&rotation=0&showTitle=false&size=138871&status=error&style=none&taskId=ub6b2b68c-d02f-4a8e-9bdb-e2c1d71aa42&title=&width=520)<br />明细表：<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648021702746-a736d75a-b1d3-4d05-888f-c028c3611ea6.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=412&id=u67ce8dd8&originHeight=477&originWidth=602&originalType=binary&ratio=1&rotation=0&showTitle=false&size=145444&status=error&style=none&taskId=u008b3e58-ad3c-4029-aaa8-3c178e27d8d&title=&width=520)

接下来需要绘制辅助线，和刷选类似，刷选需要显示预选中的遮罩，动态调整需要显示两条辅助线来让用户预览调整之后的单元格宽度

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648021837307-211cf02c-426d-49c5-9bbc-7de6a63d32f2.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=387&id=u141e268f&originHeight=322&originWidth=344&originalType=binary&ratio=1&rotation=0&showTitle=false&size=59508&status=error&style=none&taskId=u10f858c3-c113-487b-9588-6aeaa575b98&title=&width=413)<br />两条线，对应两条 `path`, 虚线使用 `lineDash`实现

```typescript
const attrs: ShapeAttrs = {
  path: '',
  lineDash: guideLineDash,
  stroke: guideLineColor,
  strokeWidth: size,
};
// 起始参考线
this.resizeReferenceGroup.addShape('path', {
  id: RESIZE_START_GUIDE_LINE_ID,
  attrs,
});
// 结束参考线
this.resizeReferenceGroup.addShape('path', {
  id: RESIZE_END_GUIDE_LINE_ID,
  attrs,
});
```

在拖动过程中，需要实时更新参考线的位置，需要考虑水平和垂直两种情况，起始点为单元格的底部，结束点为表格区域的底部

```typescript

    if (type === ResizeDirectionType.Horizontal) {
      startResizeGuideLineShape.attr('path', [
        ['M', offsetX, offsetY],
        ['L', offsetX, guideLineMaxHeight],
      ]);
      endResizeGuideLineShape.attr('path', [
        ['M', offsetX + width, offsetY],
        ['L', offsetX + width, guideLineMaxHeight],
      ]);
      return;
    }

    startResizeGuideLineShape.attr('path', [
      ['M', offsetX, offsetY],
      ['L', guideLineMaxWidth, offsetY],
    ]);
    endResizeGuideLineShape.attr('path', [
      ['M', offsetX, offsetY + height],
      ['L', guideLineMaxWidth, offsetY + height],
    ]);
```

这里大写的 `M`和 `L` 熟悉 `SVG`的同学应该清楚，大写表示绝对定位，小写表示相对定位，对应的含义如下：

```typescript
M = moveto 移动到
L = lineto 连接一根线到
H = horizontal lineto  水平连线
V = vertical lineto    垂直连线
C = curveto
S = smooth curveto
Q = quadratic Belzier curve
T = smooth quadratic Belzier curveto
A = elliptical Arc     椭圆的线 贝塞尔曲线
Z = closepath          结束当前路径
```

在拖拽完成后，将最新的单元格高度/宽度保存到 s2Options.style 中，重绘更新后，单元格按照最新的大小渲染即可

```typescript
  private getResizeWidthDetail(): ResizeDetail {
    const { start, end } = this.getResizeGuideLinePosition();
    const width = Math.floor(end.x - start.x);
    const resizeInfo = this.getResizeInfo();

    switch (resizeInfo.effect) {
      case ResizeAreaEffect.Cell:
        return {
          eventType: S2Event.LAYOUT_RESIZE_COL_WIDTH,
          style: {
            colCfg: {
              widthByFieldValue: {
                [resizeInfo.id]: width,
              },
            },
          },
        };
      default:
        return null;
    }
  }
```

<a name="rbH4h"></a>

### 链接跳转

[在线体验](https://s2.antv.vision/zh/examples/interaction/advanced#pivot-link-jump)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648087977197-5f7ee6ec-9f15-4382-a01b-940126e65caf.png#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=paste&height=333&id=u9bae7ec8&originHeight=333&originWidth=603&originalType=binary&ratio=1&rotation=0&showTitle=false&size=102301&status=error&style=none&taskId=ud4d192fd-9d81-4087-8f0f-f394f1fc013&title=&width=603)<br />可以给指定单元格的文字加上下划线，表示可以点击跳转<br />如果使用 `DOM` 实现，只需要给对应元素加上 `a` 超链接标签即可，使用 `Canvas`实现，则需要自己绘制 `下划线`, 监听点击事件。来模拟 `a` 标签的效果，核心实现如下

```typescript
// 获取当前文字的包围盒
const { minX, maxX, maxY }: BBox = this.textShape.getBBox();

// 在当前文字下面绘制一根下划线
this.linkFieldShape = renderLine(
  this,
  {
    x1: minX,
    y1: maxY + 1,
    x2: maxX,
    y2: maxY + 1,
  },
  { stroke: linkFillColor, lineWidth: 1 },
);
```

<a name="SYz9E"></a>

### 列头隐藏

[在线体验](https://s2.antv.vision/zh/examples/interaction/advanced#pivot-hide-columns)
<a name="Gw5U7"></a>

### ![Kapture 2022-03-23 at 11.42.38.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1648006980531-901fbd68-257e-41e5-b0e9-d0296ba3a1f5.gif#clientId=u1d6d9e09-387d-4&errorMessage=unknown%20error&from=drop&id=ub45b4d8f&originHeight=331&originWidth=603&originalType=binary&ratio=1&rotation=0&showTitle=false&size=642388&status=error&style=none&taskId=u7d737d68-6d55-4f7e-9b42-f57887f1522&title=)

透视表和明细表都支持隐藏列头，首先点击列头，显示 tooltip, 然后点击 tooltip 的 `隐藏` 按钮，同时支持批量/分组隐藏

首先需要知道当前隐藏的列是否需要分组，如果给定的隐藏列不是连续的，比如原始列是 `[1,2,3,4,5,6,7]`, 隐藏列是 `[2,3,6]`, 那么其实在表格上需要显示两个展开按钮 `[[2,3],[6]]`, 核心代码如下

```typescript
export const getHiddenColumnsThunkGroup = (
  columns: string[],
  hiddenColumnFields: string[],
): string[][] => {
  if (isEmpty(hiddenColumnFields)) {
    return [];
  }
  // 上一个需要隐藏项的序号
  let prevHiddenIndex = Number.NEGATIVE_INFINITY;
  return columns.reduce((result, field, index) => {
    if (!hiddenColumnFields.includes(field)) {
      return result;
    }
    if (index === prevHiddenIndex + 1) {
      const lastGroup = last(result);
      lastGroup.push(field);
    } else {
      const group = [field];
      result.push(group);
    }
    prevHiddenIndex = index;
    return result;
  }, []);
};
```

接下来是生成分组信息

```typescript
const detail = {
   displaySiblingNode: {
     next: Node, // 隐藏列的后一个兄弟节点
     prev: Node, // 隐藏列的前一个兄弟节点
   }
   hideColumnNodes: [Node, ...]
}
```

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648022976416-042d0703-1f63-48dd-bf22-0a11a48de99b.png#clientId=u1d6d9e09-387d-4&from=paste&height=394&id=uef4bc869&originHeight=788&originWidth=797&originalType=binary&ratio=1&rotation=0&showTitle=false&size=464323&status=done&style=none&taskId=u0e84cad8-1766-4ca0-9805-30205756fde&title=&width=398.5)<br />有了这些数据，就能知道展开按钮绘制在哪一个单元格上，展开按钮默认显示在后一个兄弟节点，**首尾**单元格被隐藏的情况例外，需要反过来<br />![Kapture 2022-03-23 at 16.17.17.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1648023452175-a895a931-617f-44fb-a2da-670e1e527de7.gif#clientId=u1d6d9e09-387d-4&from=drop&id=ud7ade6e5&originHeight=330&originWidth=603&originalType=binary&ratio=1&rotation=0&showTitle=false&size=299897&status=done&style=none&taskId=u433488b6-f152-4e2d-8e97-cc95295aa99&title=)

除了手动点击进行隐藏，S2 还支持通过声明配置默认隐藏，用于去掉一些不重要数据的干扰，提升看数效率

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648023991074-33e773a3-b70a-4e0a-8483-bd854ebda9ee.png#clientId=u1d6d9e09-387d-4&from=paste&height=256&id=u4732a7ad&originHeight=264&originWidth=623&originalType=binary&ratio=1&rotation=0&showTitle=false&size=45153&status=done&style=none&taskId=uaddc0348-ab23-47da-9f52-39fe8ef87cc&title=&width=603)

```typescript
const s2DataConfig = {
  fields: {
    columns: ['type', 'province', 'city', 'price', 'cost'],
  },
}

const s2Options = {
  interaction: {
    hiddenColumnFields: ['province', 'price'],
  },
};
```

对于明细表，一个 `field` 就只对应一个列头，对于透视表，一个 `field` 对应一个或多个列头，只指定 `field` 的话并不知道需要隐藏哪个列头，需要指定对应列头的 `id`<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1648024072359-92683a35-22f8-4c1f-8601-665042bbcc8c.png#clientId=u1d6d9e09-387d-4&from=paste&height=347&id=u5cce7c7c&originHeight=341&originWidth=605&originalType=binary&ratio=1&rotation=0&showTitle=false&size=90057&status=done&style=none&taskId=u45e89364-a296-4609-a539-2bec033717d&title=&width=615.5)

```typescript
const s2Options = {
  interaction: {
    // 透视表默认隐藏需要指定唯一列头 id
    // 可通过 `s2.getColumnNodes()` 获取列头节点查看 id
    hiddenColumnFields: ['root[&] 家具 [&] 沙发 [&]number'],
  },
};
```

列头隐藏后，对应的就是展开，展开相对来说就比较简单了，将当前隐藏列配置和展开的列头做一次 `diff`, 移除相应配置即可

```typescript
  private handleExpandIconClick(node: Node) {
    const lastHiddenColumnsDetail = this.spreadsheet.store.get(
      'hiddenColumnsDetail',
      [],
    );
    const { hideColumnNodes = [] } =
      lastHiddenColumnsDetail.find(({ displaySiblingNode }) =>
        isEqualDisplaySiblingNodeId(displaySiblingNode, node.id),
      ) || {};

    const { hiddenColumnFields: lastHideColumnFields } =
      this.spreadsheet.options.interaction;

    const willDisplayColumnFields = hideColumnNodes.map(
      this.getHideColumnField,
    );
    const hiddenColumnFields = difference(
      lastHideColumnFields,
      willDisplayColumnFields,
    );

    const hiddenColumnsDetail = lastHiddenColumnsDetail.filter(
      ({ displaySiblingNode }) =>
        !isEqualDisplaySiblingNodeId(displaySiblingNode, node.id),
    );

    this.spreadsheet.setOptions({
      interaction: {
        hiddenColumnFields,
      },
    });
    this.spreadsheet.store.set('hiddenColumnsDetail', hiddenColumnsDetail);
  }
}
```

最后我们根据这些配置信息，重新构建布局，渲染隐藏/展开列头后的表格即可

<a name="iw3JM"></a>

### 自定义交互

[在线体验](https://s2.antv.vision/zh/examples/interaction/custom#row-col-hover-tooltip)<br />![Kapture 2022-03-23 at 16.33.45.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1648024444450-cdeea280-9727-4d07-af41-3b4ec6cefa02.gif#clientId=u1d6d9e09-387d-4&from=drop&id=u8aee4031&originHeight=330&originWidth=603&originalType=binary&ratio=1&rotation=0&showTitle=false&size=180275&status=done&style=none&taskId=ucc24f774-d157-499c-9731-f8586a2821a&title=)<br />除了上面提到的丰富的内置交互以外，开发者还可以根据 S2 提供的 事件`S2Event`, 自由排列组合，自定义表格交互，可通过 `interaction.customInteractions` 注册，比如自定义一个 `行列头 hover 显示 tooltip` 的交互

```typescript
import { PivotSheet, BaseEvent, S2Event } from '@antv/s2';

class RowColumnHoverTooltipInteraction extends BaseEvent {
  bindEvents() {
    // 行头 hover
    this.spreadsheet.on(S2Event.ROW_CELL_HOVER, (event) => {
      this.showTooltip(event);
    });
    // 列头 hover
    this.spreadsheet.on(S2Event.COL_CELL_HOVER, (event) => {
      this.showTooltip(event);
    });
  }

  showTooltip(event) {
    const cell = this.spreadsheet.getCell(event.target);
    const meta = cell.getMeta();
    const content = meta.value;

    this.spreadsheet.tooltip.show({
      position: {
        x: event.clientX,
        y: event.clientY,
      },
      content,
    });
  }
}

const s2Options = {
  interaction: {
    customInteractions: [
      {
        key: 'RowColumnHoverTooltipInteraction',
        interaction: RowColumnHoverTooltipInteraction,
      },
    ],
  },
};

const s2 = new PivotSheet(container, dataCfg, s2Options);

s2.render()

```

<a name="zSOqp"></a>

### 结语

以上就是对于 S2 部分交互实现的一些介绍，除此之外，S2 还支持 [合并单元格](https://s2.antv.vision/zh/examples/interaction/advanced#merge-cell), [自定义滚动速度](https://s2.antv.vision/zh/examples/interaction/advanced#scroll-speed-ratio) 等丰富的交互，篇幅有限，就不一一列举了。

也欢迎社区的同学和我们一起共建 [AntV/S2](https://github.com/antvis/s2)，打造最强的开源大数据表格引擎。如果看完这篇文章你有所收获，欢迎给我们的 [仓库](https://github.com/antvis/s2) [Star⭐️](https://github.com/antvis/s2) 鼓励。

S2 的相关链接：

- [GitHub](https://github.com/antvis/s2)
- [官网](https://s2.antv.vision/)
- 核心层：[@antv/s2](https://www.npmjs.com/package/@antv/s2)
- 组件层：[@antv/s2-react](https://www.npmjs.com/package/@antv/s2-react)

<a name="Rs5mZ"></a>

### 参考链接

- [用 SVG 画一个字](https://www.lijinke.cn/2019/03/04/%E7%94%A8SVG-%E7%94%BB%E4%B8%80%E4%B8%AA%E5%AD%97/)
- [使用 AntV S2 打造大数据表格组件](https://zhuanlan.zhihu.com/p/478129151)
- [AntV/G](https://g-next.antv.vision/zh/docs/guide/introduce)
- [MDN SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
