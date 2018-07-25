Hi there,

多谢阁下对这脚本的兴趣。

> 本来是自己写着玩，手动rollup，天天rebase，随意push -f，这是最好的！但是我想，我见到你们这样热情啊，这么乱糟糟的也不好。将来如果你们PR里有bug，你们要负责的。

## 源代码
请用 `git clone --recursive` 确保子模块正确初始化。源代码存放在 `./src`。

```bash
git clone --recursive https://github.com/liqi0816/bilitwin.git
```

## 构建
需要 [Node.js](https://nodejs.org) ^8.10.0

```bash
cd /path/to/install
npm install
```

## 测试
看着几千行代码头皮发麻？彼此彼此！

需要 Chrome 64+

1. 架设本地服务器，让B站能访问到本地代码

   ```bash
   npx http-server --cors -p 8081 -c-1
   ```

2. 修改脚本，使用本地代码

   ```javascript
   // ==UserScript==
   // @name        (local)bilibili merged flv+mp4+ass+enhance
   // @namespace   http://qli5.tk/
   // @homepageURL https://github.com/liqi0816/bilitwin/
   // @description bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,MKV打包,播放体验增强,原生appsecret,不借助其他网站
   // @match       *://www.bilibili.com/video/av*
   // @match       *://bangumi.bilibili.com/anime/*/play*
   // @match       *://www.bilibili.com/bangumi/play/ep*
   // @match       *://www.bilibili.com/bangumi/play/ss*
   // @match       *://www.bilibili.com/watchlater/
   // @version     1.0
   // @author      qli5
   // @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto
   // @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
   // @grant       none
   // @run-at      document-start
   // ==/UserScript==

   const port = 8081;
   const script = document.createElement('script');
   script.src = `http://127.0.0.1:${port}/src/bilitwin.entry.js`;
   script.type = 'module';
   document.body.append(script);
   ```
   
3. 到`devtools -> Sources -> 127.0.0.1:8081`里去找这些ES module吧！

4. 到`devtools -> Filesystem`添加本地权限，可以直接在浏览器里保存代码

## 工作流
`master`和`develop`两个长期分支？

  * master至少应该是测试过的
  * 懒，B站改版，拖不下去了才会测试、更新

也懒的话，请一起用develop分支

## 坑

* `./src/assconverter`是一个[git子模块](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97)
* `./src/ui/ui.entry.js`使用了一个合理的[jsx](https://github.com/facebook/jsx)子集，推荐用[liqi0816/jsx-append-child](https://github.com/liqi0816/jsx-append-child)转译
* `./src/flvass2mkv`是一个独立的子package
* 把中间文件到处乱扔，这确实不是一个好习惯
