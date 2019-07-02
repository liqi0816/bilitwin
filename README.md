
[原作者的脚本](https://greasyfork.org/scripts/27819)失效了，
于是我在他的基础上继续开发脚本以兼容B站新版播放器

Greasy Fork地址: [https://greasyfork.org/scripts/372516](https://greasyfork.org/scripts/372516)

如果有bug，请直接使用[Github Issues](https://github.com/Xmader/bilitwin/issues)向我反馈

## ~~由于B站限制，右键一下播放器 或 开始播放 才能显示下载按钮~~ (从`v1.19.4 `版本开始不需要了)

**使用`发送到aria2 RPC`功能，请自行解决浏览器默认阻止加载[混合活动内容](https://developer.mozilla.org/zh-CN/docs/Security/MixedContent#Mixed_active_content)的问题 (推荐解决方法: 为aria2开启https支持)**

---

# 国产浏览器 和 Edge浏览器 请点[这里](https://www.xmader.com/bilitwin/biliTwinBabelCompiled.user.js)

# 脚本功能
* BiliMonkey
    * 网络
        * 抓取FLV / MP4
        * 抓取弹幕
        * 抓取CC字幕
    * 缓存
        * 缓存FLV / MP4到本地
        * 断点续传
        * 用缓存加速播放器 **(在新版播放器中不可用)**
    * 转码
        * 合并FLV
        * 弹幕转码ASS
        * CC字幕转码ASS
        * AAC音频下载
        * 软字幕打包FLV+ASS为MKV
    * 集成
        * 下载合并一条龙 <sub>一键下载所有超清FLV分段并自动合并</sub>
        * 关标签页已下载的分段不消失 <sub>保留已经下载好的分段到缓存</sub>
        * 断点续传 <sub>也保留部分下载的分段到缓存</sub>
        * 用B站原生播放器播放下载好的缓存 <sub>如果发现缓存里有完整的分段，直接喂给网页播放器，不重新访问网络。小水管利器。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。</sub> **(在新版播放器中不可用)**
        * 批量下载
* BiliPolyfill
    * 界面
        * 稍后再看添加数字角标
        * 弹幕列表换成相关视频
        * 整合充电榜与换P倒计时
        * 为B站游戏详情页面(如[这里](https://www.biligame.com/detail/?id=101690))添加查看视频按钮
    * 自动化 **(大部分在新版播放器中不可用)**
        * 自动滚动到播放器
        * 自动聚焦到播放器 <sub>新页面直接按空格会播放而不是向下滚动</sub>
        * 关闭菜单后聚焦到播放器
        * 记住防挡字幕
        * 记住弹幕开关(顶端/底端/滚动/全部)
        * 记住播放速度
        * 记住宽屏
        * 自动跳转上次看到
        * 自动播放
        * 自动全屏
        * 标记后自动跳OP/ED
        * 尝试自动找上下集
    * 交互
        * 双击全屏
        * 首次回车键可全屏自动播放 **(在新版播放器中不可用)**
    * 功能
        * 获取视频封面
        * 获取番剧封面 <sub>在番剧详情页面(如[这里](https://www.bilibili.com/bangumi/media/md134912))点击左侧的封面图片就能获取大图</sub>
        * 小窗播放
        * 自定义播放速度
        * 让新版播放器支持自定义弹幕字体 (功能在右键菜单→`BiliPolyfill`中)
    * 彩蛋
* 不能
    * 破解地区限制
    * 破解10492
    * 其他需要服务器辅助的功能 <sub>鄙人木有服务器 (๑•́ ₃ •̀๑)</sub>

# 需求
<ul>
    <li>
        B站 <strong>HTML5播放器</strong>
    </li>
    <li>
        浏览器
        <br>
        <table>
            <tbody>
            <tr>
                <td>国产浏览器</td>
                <td><strong>请用<a href="https://www.xmader.com/bilitwin/biliTwinBabelCompiled.user.js">兼容版本</a></strong></td>
            </tr>
            <tr>
                <td>Chrome</td>
                <td>原作者在用</td>
            </tr>
            <tr>
                <td>Firefox</td>
                <td>鄙人在用</td>
            </tr>
            <tr>
                <td>Edge</td>
                <td><strong>请使用<a href="https://www.xmader.com/bilitwin/biliTwinBabelCompiled.user.js">兼容版本</a></strong></td>
            </tr>
            <tr>
                <td>IE</td>
                <td>NO</td>
            </tr>
            </tbody>
        </table>
    </li>
</ul>

# 更新/讨论

* [Greasy Fork](https://greasyfork.org/scripts/372516)
* [Github](https://github.com/Xmader/bilitwin)

# 特征
* 轻量  
  新建一个书签，书签地址粘贴下面的代码，想用的时候点一下也可以使用。  
  ```javascript
  javascript:(function(){f=document.createElement("script");f.setAttribute("src","https://www.xmader.com/bilitwin/biliTwinBabelCompiled.user.js");document.body.appendChild(f)})()
  ```
* 充分保障隐私  
  作者根本就没有服务器可以用来偷偷记下各位的奇怪癖好
* 充分利用最快的B站视频源  
  数据皆由浏览器实时抓取

*有用部分结束*

----------

原作者用的是Chrome，8G内存。

支持HTTPS，不借助第三方服务器，用原生的appsecret，不需要额外权限，用书签就可以运行。

模拟用户用原生鉴权方式加载视频，再也不怕B站改appkey或appsecret，该走哪个CDN就走哪个。

脚本用到了大量ES6功能和一些ES7、ES8功能。用着最新浏览器的同学，请把脚本从babel中解放出来！

懒得加的功能：
* 边看边下载  
  一旦进度条鬼畜，下载就会拉肚子。
* 超清FLV转MP4  
  qianqian立过的flag，我就不立了。
