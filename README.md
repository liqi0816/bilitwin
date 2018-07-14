正在施工。大约需要一个星期更新脚本。届时将放出可用版本。

# 围观群众看得懂的东西

* Chrome更新了一个超好用的东西，现在我们可以**几乎0内存合并FLV了**。

* 之前我得了“**不重构就会死**”的病，不过终于找到药了！

* 为了获得真·项目的经验，打算上**Vue全家桶**了。

* 再拖更也不好意思了。

* \#help-wanted\#

# 目前的状态

util已经差不多了，codec直接用以前的，但是service的工作量还很大。

# 目录结构

* util：工具 可复用的函数

* codec：媒体文件(flv/ass/mkv)生成

* service：与B站页面交互 从B站抓数据 在页面上模拟用户操作 监控页面状态

* store：Vuex 转发service的数据到视图层

* components：视图层

# 开发指南

* util：旧文件有JSDoc，新文件是TypeScript，易懂

* codec：纯函数，易懂

* service：重头戏来了
  
  作为插件，页面本身的状态管理是不会管我们的，但是插件又依赖于页面，状态同步成了一团乱麻。

  仔细思考了现有的技术后，我总结出，一个能**独立存在**的模块与外界交互的方式主要有以下几种

  * 向模块输入信息：设置对象属性，调用方法传参数，在输入上设置事件监听器/回调
  * 模块向外输出信息：获取对象属性，调用方法返回同步值，调用方法返回Promise，发射事件/调用回调

  搜索了一番之后，我发现我想要的其实是一个`Promise.all`的事件版，或者`Observable.merge`的所有事件版。[问了一圈](https://segmentfault.com/q/1010000015424221)，没找到。

  所以只能自己造轮子。

  `util/event-duplex.js`就是成果。解释一下：
  
  ```typescript
  OnEventDuplexFactory<InputEventMap, OutputEventMap, OutOnEventMap>(init?)
  ```

  `InputEventMap`定义这个模块接受哪些事件作为输入，`OutputEventMap`定义这个模块发射哪些事件作为输出。这前两个类型虽然有默认值，但是还是强烈建议写上，至少可以作为文档。
  
  与此同时，我想要给模块加上`onevent`这种比较方便的监听器添加方法。因为TypeScript的类型映射不能改属性名，所以只能用`OutOnEventMap`再次指明事件类型，内容和`OutputEventMap`一样，只不过属性名前面要加上`on`。因为JavaScript不能读取TypeScript类型，所以要额外再传递一次哪些事件要加上`onevent`属性，参数`init`接受`Iterable<事件名>`。这两个倒是可选的，只不过加上以后方便一些。
  
  示例：

  ```typescript
  OnEventDuplexFactory<
    { click: MouseEvent },
    { load: ProgressEvent },
    { onload: ProgressEvent }
    >(['load'])
  ```

  会生成一个类，实现了（一个合理简化了的）`addEL`/`removeEL`/`dispatchE`，而且有`onload`属性，`addEL('load')`的时候也可以正确提示事件类型。那事件输入呢？

  `OnEventDuplex`实现了`[inputSocketSymbol]: EventSocket`接口，这个`inputSocketSymbol`也从`util/event-duplex.js`里导出了。`EventSocket`的目的就是提供`Promise.all`的事件版。因此，所有事件输入都应该通过`this[inputSocketSymbol].addEL/removeEL`实现。

  但这不是转了一圈，更麻烦了呀？

  接下来就是神奇之处了：`util/event-duplex.js`还导出了一个工具函数`pipeEventsThrough`。望文生义，它接受两个参数，第一个是事件源，第二个是实现了`[inputSocketSymbol]: EventSocket`接口的 ~~接盘侠~~ 事件目的地。

  ```javascript
  pipeEventsThrough(button, eventDuplex);
  ```

  这个函数会从`eventDuplex[inputSocketSymbol]`获取所有`eventDuplex`订阅过的事件，然后在`button`发射这些事件的时候，转发一份给`eventDuplex`。

  注意，“获取所有`eventDuplex`订阅过的事件”这个行为是一次性的，所以我推荐把所有事件输入都提前到`constructor`里绑定好，或者至少调用`eventDuplex[inputSocketSymbol].addEventType`显式注册。**如果pipe之后再扩充事件列表，新事件并不会被转发**。这个时候需要重新`pipeEventsThrough`——别担心，[重复地注册监听器也只会触发一次](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)。

  所以现在我们可以有各种舒服的用法了：

  ```javascript
  pipeEventsThrough(button1, eventDuplex1);
  pipeEventsThrough(button2, eventDuplex1);
  pipeEventsThrough(button1, eventDuplex2);
  pipeEventsThrough(button2, eventDuplex2);
  ```

  想要取消？

  ```javascript
  eventDuplex1[inputSocketSymbol].disconnect(button1);
  ```

  如果上游是`EventDuplex`，还可以链式调用

  ```javascript
  pipeEventsThrough(button1, eventDuplex1)
    .pipeEventsThrough(eventDuplex2)
    .pipeEventsThrough(eventDuplex3)
    .addEventListener('load', console.log)
  ```

  很像RxJS，是吧？我承认，可能最主要的差别仅仅是我实现了一个`fromAllEvents`。

  可能还有一个差别，RxJS与函数式结合得最好，如果管道有状态就很坑爹，更不要说管道上的方法了——当然，我喜欢函数式，学Haskell几乎应该是我大学最快乐的一门课了。但是函数式处理IO真的会变得很奇怪，以至于出了`do`这个语法糖。`EventDuplex`并不会偏向哪一种，设置属性或者调用方法也不会很奇怪，毕竟一开始就是`new`出来的，明示了这个模块是有状态的。所以

  ```javascript
  eventDuplex2.pause()
  console.log(eventDuplex2.currentState)
  console.log(await eventDuplex2.setState('buffer-empty'))  
  eventDuplex2.resume()
  ```

  这样的代码也OK。

  至于垃圾收集，很遗憾，我没有找到完美的解决方案，所以理论上和原生监听器一样，事件源保留监听器的引用，如果是事件源先被垃圾收集，监听器也会被收集，但如果事件源还在，想要先删掉监听器，需要显式`.removeEL`。不过我还是找到了一个妥协方案：

  ```javascript
  eventDuplex[inputSocketSymbol].close()
  ```

  这会把`EventSocket`标记为已关闭（其实就是`delete`了所有属性）。事件源**下一次**发射事件的时候，将会移除监听器。在此之前，将会泄露一个空对象（`EventSocket`）+一些很短小的函数（监听器）。

  如果在`EventSocket`保留上游的引用，确实可以在`close`的时候自动清理，**但是上游可以被收集了的时候并不会通知下游，下游保留上游的引用会导致上游泄露**。考虑再三，还是决定与原生行为看齐。如果有更好的解决方案，请告诉我。

  现在有了用着顺手的模块，我们可以开始解耦了。

  * BiliUserjs：监控页面状态（aid/cid/video/播放控制条/右键菜单ul），输入无，输出页面状态改变事件
  * BiliMonkey：抓取网络请求，输入cid/播放控制条，输出视频地址/下载进度/模块是否需要重建
  * BiliPolyfill：简化用户操作，输入aid/cid/video，输出待定/模块是否需要重建
  * bilitwin-keeper：监控模块状态，输入Monkey/Polyfill，适时重建模块，不输出
  * bilitwin-options：负责持久化用户设置，CRUD，可能返回Promise，不使用事件
  * bilitwin-store：vuex中介，输入Monkey/Polyfill，筛选需要的事件，然后写入vuex
  * bilitwin-ui：监控UI，如果UI被源页面一句`$.html()`清掉了负责补上，输入BiliUserjs，输出待定
  * bilitwin：负责启动上面一大堆，并且安装合适的pipe，同时充当IoC容器

* store：实验性地学习一下Vuex怎么用，结构随便

* components：解耦UI与服务，这样以后UI可以单独放出去自定义，方便人民群众fork
