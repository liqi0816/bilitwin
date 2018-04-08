// ==UserScript==
// @name        (Babel)bilibili merged flv+mp4+ass+enhance
// @namespace   http://qli5.tk/
// @homepageURL https://github.com/liqi0816/bilitwin/
// @description (国产浏览器专用)bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,MKV打包,播放体验增强,原生appsecret,不借助其他网站
// @match       *://www.bilibili.com/video/av*
// @match       *://bangumi.bilibili.com/anime/*/play*
// @match       *://www.bilibili.com/bangumi/play/ep*
// @match       *://www.bilibili.com/bangumi/play/ss*
// @match       *://www.bilibili.com/watchlater/
// @version     1.14
// @author      qli5
// @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto
// @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
// @grant       none
// @run-at      document-start
// ==/UserScript==

/***
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * BiliTwin consists of two parts - BiliMonkey and BiliPolyfill. 
 * They are bundled because I am too lazy to write two user interfaces.
 * 
 * So what is the difference between BiliMonkey and BiliPolyfill?
 * 
 * BiliMonkey deals with network. It is a (naIve) Service Worker. 
 * This is also why it uses IndexedDB instead of localStorage.
 * BiliPolyfill deals with experience. It is more a "user script". 
 * Everything it can do can be done by hand.
 * 
 * BiliPolyfill will be pointless in the long run - I believe bilibili 
 * will finally provide these functions themselves.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Covered Software is provided under this License on an “as is” basis, 
 * without warranty of any kind, either expressed, implied, or statutory, 
 * including, without limitation, warranties that the Covered Software 
 * is free of defects, merchantable, fit for a particular purpose or 
 * non-infringing. The entire risk as to the quality and performance of 
 * the Covered Software is with You. Should any Covered Software prove 
 * defective in any respect, You (not any Contributor) assume the cost 
 * of any necessary servicing, repair, or correction. This disclaimer 
 * of warranty constitutes an essential part of this License. No use of 
 * any Covered Software is authorized under this License except under 
 * this disclaimer.
 * 
 * Under no circumstances and under no legal theory, whether tort 
 * (including negligence), contract, or otherwise, shall any Contributor, 
 * or anyone who distributes Covered Software as permitted above, be 
 * liable to You for any direct, indirect, special, incidental, or 
 * consequential damages of any character including, without limitation, 
 * damages for lost profits, loss of goodwill, work stoppage, computer 
 * failure or malfunction, or any and all other commercial damages or 
 * losses, even if such party shall have been informed of the possibility 
 * of such damages. This limitation of liability shall not apply to 
 * liability for death or personal injury resulting from such party’s 
 * negligence to the extent applicable law prohibits such limitation. 
 * Some jurisdictions do not allow the exclusion or limitation of 
 * incidental or consequential damages, so this exclusion and limitation 
 * may not apply to You.
 */

/***
 * This is a bundled code. While it is not uglified, it may still be too
 * complex for reviewing. Please refer to
 * https://github.com/liqi0816/bilitwin/
 * for source code.
 */


if (document.readyState == 'loading') {
    var h = () => {
        load();
        document.removeEventListener('DOMContentLoaded', h);
    };
    document.addEventListener('DOMContentLoaded', h);
}
else {
    load();
}

function load() {
    if (typeof _babelPolyfill === 'undefined') {
        new Promise(function (resolve) {
            var req = new XMLHttpRequest();
            req.onload = function () { resolve(req.responseText); };
            req.open('get', 'https://cdn.bootcss.com/babel-polyfill/7.0.0-beta.42/polyfill.min.js');
            req.send();
        }).then(function (script) {
            top.eval(script);
        }).then(function () {
            script();
        });
    }
    else {
        script();
    }
}

function script() {
    ,
}


