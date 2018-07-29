echo see ./docs/CONTRIBUTING.md for usage

call .\node_modules\.bin\tsc || exit /b

call .\node_modules\.bin\rollup tsout/test-portal.js --file test-bundle.js --format iife || exit /b

rem. > test-bundle.js.1
echo // ==UserScript== >> test-bundle.js.1
echo // @name        (develop)bilibili merged flv+mp4+ass+enhance >> test-bundle.js.1
echo // @namespace   http://qli5.tk/ >> test-bundle.js.1
echo // @homepageURL https://github.com/liqi0816/bilitwin/ >> test-bundle.js.1
echo // @description bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,MKV打包,播放体验增强,原生appsecret,不借助其他网站 >> test-bundle.js.1
echo // @match       *://www.bilibili.com/video/av* >> test-bundle.js.1
echo // @match       *://bangumi.bilibili.com/anime/*/play* >> test-bundle.js.1
echo // @match       *://www.bilibili.com/bangumi/play/ep* >> test-bundle.js.1
echo // @match       *://www.bilibili.com/bangumi/play/ss* >> test-bundle.js.1
echo // @match       *://www.bilibili.com/watchlater/ >> test-bundle.js.1
echo // @version     1.0 >> test-bundle.js.1
echo // @author      qli5 >> test-bundle.js.1
echo // @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto >> test-bundle.js.1
echo // @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/ >> test-bundle.js.1
echo // @grant       none >> test-bundle.js.1
echo // @run-at      document-start >> test-bundle.js.1
echo // ==/UserScript== >> test-bundle.js.1
type test-bundle.js >> test-bundle.js.1
move /y test-bundle.js.1 test-bundle.js

if "%~1" == "" call .\node_modules\.bin\http-server --cors -p 8081 -c-1
