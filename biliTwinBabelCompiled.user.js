// ==UserScript==
// @name        (Babel)bilibili merged flv+mp4+ass+enhance
// @namespace   http://qli5.tk/
// @homepageURL https://github.com/Xmader/bilitwin/
// @supportURL  https://github.com/Xmader/bilitwin/issues
// @description (国产浏览器和旧版Edge浏览器专用)bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,CC字幕转码ASS下载,AAC音频下载,MKV打包,播放体验增强,原生appsecret,不借助其他网站
// @match       *://www.bilibili.com/video/av*
// @match       *://www.bilibili.com/video/bv*
// @match       *://www.bilibili.com/video/BV*
// @match       *://bangumi.bilibili.com/anime/*/play*
// @match       *://www.bilibili.com/bangumi/play/ep*
// @match       *://www.bilibili.com/bangumi/play/ss*
// @match       *://www.bilibili.com/bangumi/media/md*
// @match       *://www.biligame.com/detail/*
// @match       *://vc.bilibili.com/video/*
// @match       *://www.bilibili.com/watchlater/
// @version     1.24.1
// @author      qli5
// @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto, xmader
// @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
// @grant       unsafeWindow
// @grant       GM.registerMenuCommand
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
 * https://github.com/Xmader/bilitwin/
 * for source code.
 */

var window = typeof unsafeWindow !== "undefined" && unsafeWindow || self
var top = window.top  // workaround


if (document.readyState == 'loading') {
    var h = function () {
        load();
        document.removeEventListener('DOMContentLoaded', h);
    };
    document.addEventListener('DOMContentLoaded', h);
}
else {
    load();
}

function load() {
    if (typeof TextEncoder === 'undefined') {
        top.TextEncoder = function () {
            this.encoding = 'utf-8';
            this.encode = function (str) {
                var binstr = unescape(encodeURIComponent(str)),
                    arr = new Uint8Array(binstr.length);
                binstr.split('').forEach(function (char, i) {
                    arr[i] = char.charCodeAt(0);
                });
                return arr;
            };
        }
    }

    if (typeof TextDecoder === 'undefined') {
        top.TextDecoder = function () {
            this.encoding = 'utf-8';
            this.decode = function (input) {
                if (input instanceof ArrayBuffer) {
                    input = new Uint8Array(input);
                } else {
                    input = new Uint8Array(input.buffer);
                }

                var l = Array.prototype.map.call(input, function (x) { return String.fromCharCode(x) }).join("");
                return decodeURIComponent(escape(l));
            };
        }
    }

    if (typeof _babelPolyfill === 'undefined') {
        new Promise(function (resolve) {
            var req = new XMLHttpRequest();
            req.onload = function () { resolve(req.responseText); };
            req.open('get', 'https://cdn.staticfile.org/babel-polyfill/7.7.0/polyfill.min.js');
            req.send();
        }).then(function (script) {
            top.eval(script);
            _babelPolyfill = false;
        }).then(function () {
            script();
        });
    }
    else {
        script();
    }
}

function script() {
    'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        var instance = Reflect.construct(cls, Array.from(arguments));
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
        return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ==UserScript==
// @name        bilibili merged flv+mp4+ass+enhance
// @namespace   http://qli5.tk/
// @homepageURL https://github.com/Xmader/bilitwin/
// @supportURL  https://github.com/Xmader/bilitwin/issues
// @description bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,CC字幕转码ASS下载,AAC音频下载,MKV打包,播放体验增强,原生appsecret,不借助其他网站
// @match       *://www.bilibili.com/video/av*
// @match       *://www.bilibili.com/video/bv*
// @match       *://www.bilibili.com/video/BV*
// @match       *://bangumi.bilibili.com/anime/*/play*
// @match       *://www.bilibili.com/bangumi/play/ep*
// @match       *://www.bilibili.com/bangumi/play/ss*
// @match       *://www.bilibili.com/bangumi/media/md*
// @match       *://www.biligame.com/detail/*
// @match       *://vc.bilibili.com/video/*
// @match       *://www.bilibili.com/watchlater/
// @version     1.24.1
// @author      qli5
// @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto, xmader
// @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
// @grant       unsafeWindow
// @grant       GM.registerMenuCommand
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
 * https://github.com/Xmader/bilitwin/
 * for source code.
 */

var window = typeof unsafeWindow !== "undefined" && unsafeWindow || self;
var top = window.top; // workaround

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * Basically a Promise that exposes its resolve and reject callbacks
 */

var AsyncContainer = function () {
    /***
     * The thing is, if we cannot cancel a promise, we should at least be able to 
     * explicitly mark a promise as garbage collectible.
     * 
     * Yes, this is something like cancelable Promise. But I insist they are different.
     */
    function AsyncContainer(callback) {
        var _this = this;

        _classCallCheck(this, AsyncContainer);

        // 1. primary promise
        this.primaryPromise = new Promise(function (s, j) {
            _this.resolve = function (arg) {
                s(arg);return arg;
            };
            _this.reject = function (arg) {
                j(arg);return arg;
            };
        });

        // 2. hang promise
        this.hangReturn = Symbol();
        this.hangPromise = new Promise(function (s) {
            return _this.hang = function () {
                return s(_this.hangReturn);
            };
        });
        this.destroiedThen = this.hangPromise.then.bind(this.hangPromise);
        this.primaryPromise.then(function () {
            return _this.state = 'fulfilled';
        });
        this.primaryPromise.catch(function () {
            return _this.state = 'rejected';
        });
        this.hangPromise.then(function () {
            return _this.state = 'hanged';
        });

        // 4. race
        this.promise = Promise.race([this.primaryPromise, this.hangPromise]).then(function (s) {
            return s == _this.hangReturn ? new Promise(function () {}) : s;
        });

        // 5. inherit
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
        this.finally = this.promise.finally.bind(this.promise);

        // 6. optional callback
        if (typeof callback == 'function') callback(this.resolve, this.reject);
    }

    /***
     * Memory leak notice:
     * 
     * The V8 implementation of Promise requires
     * 1. the resolve handler of a Promise
     * 2. the reject handler of a Promise
     * 3. !! the Promise object itself !!
     * to be garbage collectible to correctly free Promise runtime contextes
     * 
     * This piece of code will work
     * void (async () => {
     *     const buf = new Uint8Array(1024 * 1024 * 1024);
     *     for (let i = 0; i < buf.length; i++) buf[i] = i;
     *     await new Promise(() => { });
     *     return buf;
     * })();
     * if (typeof gc == 'function') gc();
     * 
     * This piece of code will cause a Promise context mem leak
     * const deadPromise = new Promise(() => { });
     * void (async () => {
     *     const buf = new Uint8Array(1024 * 1024 * 1024);
     *     for (let i = 0; i < buf.length; i++) buf[i] = i;
     *     await deadPromise;
     *     return buf;
     * })();
     * if (typeof gc == 'function') gc();
     * 
     * In other words, do NOT directly inherit from promise. You will need to
     * dereference it on destroying.
     */


    _createClass(AsyncContainer, [{
        key: 'destroy',
        value: function destroy() {
            this.hang();
            this.resolve = function () {};
            this.reject = this.resolve;
            this.hang = this.resolve;
            this.primaryPromise = null;
            this.hangPromise = null;
            this.promise = null;
            this.then = this.resolve;
            this.catch = this.resolve;
            this.finally = this.resolve;
            this.destroiedThen = function (f) {
                return f();
            };
            /***
             * For ease of debug, do not dereference hangReturn
             * 
             * If run from console, mysteriously this tiny symbol will help correct gc
             * before a console.clear
             */
            //this.hangReturn = null;
        }
    }], [{
        key: '_UNIT_TEST',
        value: function _UNIT_TEST() {
            var foo = function () {
                var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                    var buf, i, ac;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    buf = new Uint8Array(600 * 1024 * 1024);

                                    for (i = 0; i < buf.length; i++) {
                                        buf[i] = i;
                                    }ac = new AsyncContainer();

                                    ac.destroiedThen(function () {
                                        return console.log('asyncContainer destroied');
                                    });
                                    containers.push(ac);
                                    _context.next = 7;
                                    return ac;

                                case 7:
                                    return _context.abrupt('return', buf);

                                case 8:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, this);
                }));

                return function foo() {
                    return _ref.apply(this, arguments);
                };
            }();

            var containers = [];

            var foos = [foo(), foo(), foo()];
            containers.forEach(function (e) {
                return e.destroy();
            });
            console.warn('Check your RAM usage. I allocated 1.8GB in three dead-end promises.');
            return [foos, containers];
        }
    }]);

    return AsyncContainer;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * Provides common util for all bilibili user scripts
 */


var BiliUserJS = function () {
    function BiliUserJS() {
        _classCallCheck(this, BiliUserJS);
    }

    _createClass(BiliUserJS, null, [{
        key: 'getPlayerWin',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!location.href.includes('/watchlater/#/list')) {
                                    _context2.next = 3;
                                    break;
                                }

                                _context2.next = 3;
                                return new Promise(function (resolve) {
                                    window.addEventListener('hashchange', function () {
                                        return resolve(location.href);
                                    }, { once: true });
                                });

                            case 3:
                                if (document.getElementById('bilibili-player')) {
                                    _context2.next = 10;
                                    break;
                                }

                                if (!document.querySelector("video")) {
                                    _context2.next = 8;
                                    break;
                                }

                                top.location.reload(); // 刷新
                                _context2.next = 10;
                                break;

                            case 8:
                                _context2.next = 10;
                                return new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (document.getElementById('bilibili-player')) {
                                            resolve(document.getElementById('bilibili-player'));
                                            observer.disconnect();
                                        }
                                    });
                                    observer.observe(document, { childList: true, subtree: true });
                                });

                            case 10:
                                if (!document.getElementById('bilibiliPlayer')) {
                                    _context2.next = 14;
                                    break;
                                }

                                return _context2.abrupt('return', window);

                            case 14:
                                return _context2.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (document.getElementById('bilibiliPlayer')) {
                                            observer.disconnect();
                                            resolve(window);
                                        }
                                    });
                                    observer.observe(document.getElementById('bilibili-player'), { childList: true });
                                }));

                            case 15:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function getPlayerWin() {
                return _ref2.apply(this, arguments);
            }

            return getPlayerWin;
        }()
    }, {
        key: 'tryGetPlayerWinSync',
        value: function tryGetPlayerWinSync() {
            if (document.getElementById('bilibiliPlayer')) {
                return window;
            } else if (document.querySelector('#bofqi > object')) {
                throw 'Need H5 Player';
            }
        }
    }, {
        key: 'getCidRefreshPromise',
        value: function getCidRefreshPromise(playerWin) {
            /***********
             * !!!Race condition!!!
             * We must finish everything within one microtask queue!
             *  
             * bilibili script:
             * videoElement.remove() -> setTimeout(0) -> [[microtask]] -> load playurl
             *       \- synchronous macrotask -/               ||           \-   synchronous
             *                                                 ||
             *                       the only position to inject monkey.sniffDefaultFormat
            */
            var cidRefresh = new AsyncContainer();

            // 1. no active video element in document => cid refresh
            var observer = new MutationObserver(function () {
                if (!playerWin.document.getElementsByTagName('video')[0]) {
                    observer.disconnect();
                    cidRefresh.resolve();
                }
            });
            observer.observe(playerWin.document.getElementById('bilibiliPlayer'), { childList: true });

            // 2. playerWin unload => cid refresh
            playerWin.addEventListener('unload', function () {
                return Promise.resolve().then(function () {
                    return cidRefresh.resolve();
                });
            });

            return cidRefresh;
        }
    }, {
        key: 'domContentLoadedThen',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(func) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!(document.readyState == 'loading')) {
                                    _context3.next = 4;
                                    break;
                                }

                                return _context3.abrupt('return', new Promise(function (resolve) {
                                    document.addEventListener('DOMContentLoaded', function () {
                                        return resolve(func());
                                    }, { once: true });
                                }));

                            case 4:
                                return _context3.abrupt('return', func());

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function domContentLoadedThen(_x) {
                return _ref3.apply(this, arguments);
            }

            return domContentLoadedThen;
        }()
    }]);

    return BiliUserJS;
}();

/**
 * Copyright (C) 2018 Xmader.
 * @author Xmader
 */

/**
 * @template T
 * @param {Promise<T>} promise 
 * @param {number} ms 
 * @returns {Promise< T | null >}
 */


var setTimeoutDo = function setTimeoutDo(promise, ms) {
    /** @type {Promise<null>} */
    var t = new Promise(function (resolve) {
        setTimeout(function () {
            return resolve(null);
        }, ms);
    });
    return Promise.race([promise, t]);
};

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * A promisified indexedDB with large file(>100MB) support
 */

var CacheDB = function () {
    function CacheDB() {
        var dbName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'biliMonkey';
        var osName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'flv';
        var keyPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'name';
        var maxItemSize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100 * 1024 * 1024;

        _classCallCheck(this, CacheDB);

        // Neither Chrome or Firefox can handle item size > 100M
        this.dbName = dbName;
        this.osName = osName;
        this.keyPath = keyPath;
        this.maxItemSize = maxItemSize;
        this.db = null;
    }

    _createClass(CacheDB, [{
        key: 'getDB',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var _this2 = this;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (!this.db) {
                                    _context4.next = 2;
                                    break;
                                }

                                return _context4.abrupt('return', this.db);

                            case 2:
                                _context4.next = 4;
                                return new Promise(function (resolve, reject) {
                                    var openRequest = indexedDB.open(_this2.dbName);
                                    openRequest.onupgradeneeded = function (e) {
                                        var db = e.target.result;
                                        if (!db.objectStoreNames.contains(_this2.osName)) {
                                            db.createObjectStore(_this2.osName, { keyPath: _this2.keyPath });
                                        }
                                    };
                                    openRequest.onsuccess = function (e) {
                                        return resolve(e.target.result);
                                    };
                                    openRequest.onerror = reject;
                                });

                            case 4:
                                this.db = _context4.sent;
                                return _context4.abrupt('return', this.db);

                            case 6:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function getDB() {
                return _ref4.apply(this, arguments);
            }

            return getDB;
        }()
    }, {
        key: 'addData',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(item) {
                var _this3 = this;

                var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : item.name;
                var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : item.data || item;
                var itemChunks, numChunks, i, reqCascade;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (!(!data instanceof Blob)) {
                                    _context6.next = 2;
                                    break;
                                }

                                throw 'CacheDB: data must be a Blob';

                            case 2:
                                itemChunks = [];
                                numChunks = Math.ceil(data.size / this.maxItemSize);

                                for (i = 0; i < numChunks; i++) {
                                    itemChunks.push({
                                        name: name + '/part_' + i,
                                        numChunks: numChunks,
                                        data: data.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
                                    });
                                }

                                reqCascade = new Promise(function () {
                                    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve, reject) {
                                        var db, objectStore, onsuccess;
                                        return regeneratorRuntime.wrap(function _callee5$(_context5) {
                                            while (1) {
                                                switch (_context5.prev = _context5.next) {
                                                    case 0:
                                                        _context5.next = 2;
                                                        return _this3.getDB();

                                                    case 2:
                                                        db = _context5.sent;
                                                        objectStore = db.transaction([_this3.osName], 'readwrite').objectStore(_this3.osName);

                                                        onsuccess = function onsuccess(e) {
                                                            var chunk = itemChunks.pop();
                                                            if (!chunk) return resolve(e);
                                                            var req = objectStore.add(chunk);
                                                            req.onerror = reject;
                                                            req.onsuccess = onsuccess;
                                                        };

                                                        onsuccess();

                                                    case 6:
                                                    case 'end':
                                                        return _context5.stop();
                                                }
                                            }
                                        }, _callee5, _this3);
                                    }));

                                    return function (_x9, _x10) {
                                        return _ref6.apply(this, arguments);
                                    };
                                }());
                                return _context6.abrupt('return', reqCascade);

                            case 7:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function addData(_x8) {
                return _ref5.apply(this, arguments);
            }

            return addData;
        }()
    }, {
        key: 'putData',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(item) {
                var _this4 = this;

                var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : item.name;
                var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : item.data || item;
                var itemChunks, numChunks, i, reqCascade;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                if (!(!data instanceof Blob)) {
                                    _context8.next = 2;
                                    break;
                                }

                                throw 'CacheDB: data must be a Blob';

                            case 2:
                                itemChunks = [];
                                numChunks = Math.ceil(data.size / this.maxItemSize);

                                for (i = 0; i < numChunks; i++) {
                                    itemChunks.push({
                                        name: name + '/part_' + i,
                                        numChunks: numChunks,
                                        data: data.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
                                    });
                                }

                                reqCascade = new Promise(function () {
                                    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve, reject) {
                                        var db, objectStore, onsuccess;
                                        return regeneratorRuntime.wrap(function _callee7$(_context7) {
                                            while (1) {
                                                switch (_context7.prev = _context7.next) {
                                                    case 0:
                                                        _context7.next = 2;
                                                        return _this4.getDB();

                                                    case 2:
                                                        db = _context7.sent;
                                                        objectStore = db.transaction([_this4.osName], 'readwrite').objectStore(_this4.osName);

                                                        onsuccess = function onsuccess(e) {
                                                            var chunk = itemChunks.pop();
                                                            if (!chunk) return resolve(e);
                                                            var req = objectStore.put(chunk);
                                                            req.onerror = reject;
                                                            req.onsuccess = onsuccess;
                                                        };

                                                        onsuccess();

                                                    case 6:
                                                    case 'end':
                                                        return _context7.stop();
                                                }
                                            }
                                        }, _callee7, _this4);
                                    }));

                                    return function (_x14, _x15) {
                                        return _ref8.apply(this, arguments);
                                    };
                                }());
                                return _context8.abrupt('return', reqCascade);

                            case 7:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function putData(_x13) {
                return _ref7.apply(this, arguments);
            }

            return putData;
        }()
    }, {
        key: 'getData',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(name) {
                var _this5 = this;

                var reqCascade, dataChunks;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                reqCascade = new Promise(function () {
                                    var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(resolve, reject) {
                                        var dataChunks, db, objectStore, probe;
                                        return regeneratorRuntime.wrap(function _callee9$(_context9) {
                                            while (1) {
                                                switch (_context9.prev = _context9.next) {
                                                    case 0:
                                                        dataChunks = [];
                                                        _context9.next = 3;
                                                        return _this5.getDB();

                                                    case 3:
                                                        db = _context9.sent;
                                                        // 浏览器默认在隐私浏览模式中禁用 IndexedDB ，这一步会超时
                                                        objectStore = db.transaction([_this5.osName], 'readwrite').objectStore(_this5.osName);
                                                        probe = objectStore.get(name + '/part_0');

                                                        probe.onerror = reject;
                                                        probe.onsuccess = function (e) {
                                                            // 1. Probe fails => key does not exist
                                                            if (!probe.result) return resolve(null);

                                                            // 2. How many chunks to retrieve?
                                                            var numChunks = probe.result.numChunks;

                                                            // 3. Cascade on the remaining chunks

                                                            var onsuccess = function onsuccess(e) {
                                                                dataChunks.push(e.target.result.data);
                                                                if (dataChunks.length == numChunks) return resolve(dataChunks);
                                                                var req = objectStore.get(name + '/part_' + dataChunks.length);
                                                                req.onerror = reject;
                                                                req.onsuccess = onsuccess;
                                                            };
                                                            onsuccess(e);
                                                        };

                                                    case 8:
                                                    case 'end':
                                                        return _context9.stop();
                                                }
                                            }
                                        }, _callee9, _this5);
                                    }));

                                    return function (_x17, _x18) {
                                        return _ref10.apply(this, arguments);
                                    };
                                }());

                                // 浏览器默认在隐私浏览模式中禁用 IndexedDB ，添加超时

                                _context10.next = 3;
                                return setTimeoutDo(reqCascade, 5 * 1000);

                            case 3:
                                dataChunks = _context10.sent;
                                return _context10.abrupt('return', dataChunks ? { name: name, data: new Blob(dataChunks) } : null);

                            case 5:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function getData(_x16) {
                return _ref9.apply(this, arguments);
            }

            return getData;
        }()
    }, {
        key: 'deleteData',
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(name) {
                var _this6 = this;

                var reqCascade;
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                reqCascade = new Promise(function () {
                                    var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(resolve, reject) {
                                        var currentChunkNum, db, objectStore, probe;
                                        return regeneratorRuntime.wrap(function _callee11$(_context11) {
                                            while (1) {
                                                switch (_context11.prev = _context11.next) {
                                                    case 0:
                                                        currentChunkNum = 0;
                                                        _context11.next = 3;
                                                        return _this6.getDB();

                                                    case 3:
                                                        db = _context11.sent;
                                                        objectStore = db.transaction([_this6.osName], 'readwrite').objectStore(_this6.osName);
                                                        probe = objectStore.get(name + '/part_0');

                                                        probe.onerror = reject;
                                                        probe.onsuccess = function (e) {
                                                            // 1. Probe fails => key does not exist
                                                            if (!probe.result) return resolve(null);

                                                            // 2. How many chunks to delete?
                                                            var numChunks = probe.result.numChunks;

                                                            // 3. Cascade on the remaining chunks

                                                            var onsuccess = function onsuccess(e) {
                                                                var req = objectStore.delete(name + '/part_' + currentChunkNum);
                                                                req.onerror = reject;
                                                                req.onsuccess = onsuccess;
                                                                currentChunkNum++;
                                                                if (currentChunkNum == numChunks) return resolve(e);
                                                            };
                                                            onsuccess();
                                                        };

                                                    case 8:
                                                    case 'end':
                                                        return _context11.stop();
                                                }
                                            }
                                        }, _callee11, _this6);
                                    }));

                                    return function (_x20, _x21) {
                                        return _ref12.apply(this, arguments);
                                    };
                                }());
                                return _context12.abrupt('return', reqCascade);

                            case 2:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function deleteData(_x19) {
                return _ref11.apply(this, arguments);
            }

            return deleteData;
        }()
    }, {
        key: 'deleteEntireDB',
        value: function () {
            var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
                var _this7 = this;

                var req;
                return regeneratorRuntime.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                req = indexedDB.deleteDatabase(this.dbName);
                                return _context13.abrupt('return', new Promise(function (resolve, reject) {
                                    req.onsuccess = function () {
                                        return resolve(_this7.db = null);
                                    };
                                    req.onerror = reject;
                                }));

                            case 2:
                            case 'end':
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function deleteEntireDB() {
                return _ref13.apply(this, arguments);
            }

            return deleteEntireDB;
        }()
    }], [{
        key: '_UNIT_TEST',
        value: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
                var db;
                return regeneratorRuntime.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                db = new CacheDB();

                                console.warn('Storing 201MB...');
                                _context14.t0 = console;
                                _context14.next = 5;
                                return db.putData(new Blob([new ArrayBuffer(201 * 1024 * 1024)]), 'test');

                            case 5:
                                _context14.t1 = _context14.sent;

                                _context14.t0.log.call(_context14.t0, _context14.t1);

                                console.warn('Deleting 201MB...');
                                _context14.t2 = console;
                                _context14.next = 11;
                                return db.deleteData('test');

                            case 11:
                                _context14.t3 = _context14.sent;

                                _context14.t2.log.call(_context14.t2, _context14.t3);

                            case 13:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function _UNIT_TEST() {
                return _ref14.apply(this, arguments);
            }

            return _UNIT_TEST;
        }()
    }]);

    return CacheDB;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * A more powerful fetch with
 *   1. onprogress handler
 *   2. partial response getter
 */


var DetailedFetchBlob = function () {
    function DetailedFetchBlob(input) {
        var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var onprogress = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : init.onprogress;
        var onabort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : init.onabort;

        var _this8 = this;

        var onerror = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : init.onerror;
        var fetch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : init.fetch || top.fetch;

        _classCallCheck(this, DetailedFetchBlob);

        // Fire in the Fox fix
        if (this.firefoxConstructor(input, init, onprogress, onabort, onerror)) return;
        // Now I know why standardizing cancelable Promise is that difficult
        // PLEASE refactor me!
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;
        this.abort = null;
        this.loaded = init.cacheLoaded || 0;
        this.total = init.cacheLoaded || 0;
        this.lengthComputable = false;
        this.buffer = [];
        this.blob = null;
        this.reader = null;
        this.blobPromise = fetch(input, init).then( /** @param {Response} res */function (res) {
            if (_this8.reader == 'abort') return res.body.getReader().cancel().then(function () {
                return null;
            });
            if (!res.ok) throw 'HTTP Error ' + res.status + ': ' + res.statusText;
            _this8.lengthComputable = res.headers.has('Content-Length');
            _this8.total += parseInt(res.headers.get('Content-Length')) || Infinity;
            if (_this8.lengthComputable) {
                _this8.reader = res.body.getReader();
                return _this8.blob = _this8.consume();
            } else {
                if (_this8.onprogress) _this8.onprogress(_this8.loaded, _this8.total, _this8.lengthComputable);
                return _this8.blob = res.blob();
            }
        });
        this.blobPromise.then(function () {
            return _this8.abort = function () {};
        });
        this.blobPromise.catch(function (e) {
            return _this8.onerror({ target: _this8, type: e });
        });
        this.promise = Promise.race([this.blobPromise, new Promise(function (resolve) {
            return _this8.abort = function () {
                _this8.onabort({ target: _this8, type: 'abort' });
                resolve('abort');
                _this8.buffer = [];
                _this8.blob = null;
                if (_this8.reader) _this8.reader.cancel();else _this8.reader = 'abort';
            };
        })]).then(function (s) {
            return s == 'abort' ? new Promise(function () {}) : s;
        });
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
    }

    _createClass(DetailedFetchBlob, [{
        key: 'getPartialBlob',
        value: function getPartialBlob() {
            return new Blob(this.buffer);
        }
    }, {
        key: 'getBlob',
        value: function () {
            var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                return regeneratorRuntime.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                return _context15.abrupt('return', this.promise);

                            case 1:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function getBlob() {
                return _ref15.apply(this, arguments);
            }

            return getBlob;
        }()
    }, {
        key: 'pump',
        value: function () {
            var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
                var _ref17, done, value;

                return regeneratorRuntime.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                if (!true) {
                                    _context16.next = 13;
                                    break;
                                }

                                _context16.next = 3;
                                return this.reader.read();

                            case 3:
                                _ref17 = _context16.sent;
                                done = _ref17.done;
                                value = _ref17.value;

                                if (!done) {
                                    _context16.next = 8;
                                    break;
                                }

                                return _context16.abrupt('return', this.loaded);

                            case 8:
                                this.loaded += value.byteLength;
                                this.buffer.push(new Blob([value]));
                                if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
                                _context16.next = 0;
                                break;

                            case 13:
                            case 'end':
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));

            function pump() {
                return _ref16.apply(this, arguments);
            }

            return pump;
        }()
    }, {
        key: 'consume',
        value: function () {
            var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
                return regeneratorRuntime.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                _context17.next = 2;
                                return this.pump();

                            case 2:
                                this.blob = new Blob(this.buffer);
                                this.buffer = null;
                                return _context17.abrupt('return', this.blob);

                            case 5:
                            case 'end':
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));

            function consume() {
                return _ref18.apply(this, arguments);
            }

            return consume;
        }()
    }, {
        key: 'firefoxConstructor',
        value: function firefoxConstructor(input) {
            var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var onprogress = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : init.onprogress;

            var _this9 = this;

            var onabort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : init.onabort;
            var onerror = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : init.onerror;

            if (!top.navigator.userAgent.includes('Firefox')) return false;

            var firefoxVersionM = top.navigator.userAgent.match(/Firefox\/(\d+)/);
            var firefoxVersion = firefoxVersionM && +firefoxVersionM[1];
            if (firefoxVersion >= 65) {
                // xhr.responseType "moz-chunked-arraybuffer" is deprecated since Firefox 68
                // but res.body is implemented since Firefox 65
                return false;
            }

            this.onprogress = onprogress;
            this.onabort = onabort;
            this.onerror = onerror;
            this.abort = null;
            this.loaded = init.cacheLoaded || 0;
            this.total = init.cacheLoaded || 0;
            this.lengthComputable = false;
            this.buffer = [];
            this.blob = null;
            this.reader = undefined;
            this.blobPromise = new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'moz-chunked-arraybuffer';
                xhr.onload = function () {
                    resolve(_this9.blob = new Blob(_this9.buffer));_this9.buffer = null;
                };
                var cacheLoaded = _this9.loaded;
                xhr.onprogress = function (e) {
                    _this9.loaded = e.loaded + cacheLoaded;
                    _this9.total = e.total + cacheLoaded;
                    _this9.lengthComputable = e.lengthComputable;
                    _this9.buffer.push(new Blob([xhr.response]));
                    if (_this9.onprogress) _this9.onprogress(_this9.loaded, _this9.total, _this9.lengthComputable);
                };
                xhr.onabort = function (e) {
                    return _this9.onabort({ target: _this9, type: 'abort' });
                };
                xhr.onerror = function (e) {
                    _this9.onerror({ target: _this9, type: e.type });reject(e);
                };
                _this9.abort = xhr.abort.bind(xhr);
                xhr.open(init.method || 'get', input);
                if (init.headers) {
                    Object.entries(init.headers).forEach(function (_ref19) {
                        var _ref20 = _slicedToArray(_ref19, 2),
                            header = _ref20[0],
                            value = _ref20[1];

                        xhr.setRequestHeader(header, value);
                    });
                }
                xhr.send();
            });
            this.promise = this.blobPromise;
            this.then = this.promise.then.bind(this.promise);
            this.catch = this.promise.catch.bind(this.promise);
            return true;
        }
    }]);

    return DetailedFetchBlob;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * A simple emulation of pthread_mutex
 */


var Mutex = function () {
    function Mutex() {
        _classCallCheck(this, Mutex);

        this.queueTail = Promise.resolve();
        this.resolveHead = null;
    }

    /** 
     * await mutex.lock = pthread_mutex_lock
     * @returns a promise to be resolved when the mutex is available
    */


    _createClass(Mutex, [{
        key: 'lock',
        value: function () {
            var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
                var myResolve, _queueTail;

                return regeneratorRuntime.wrap(function _callee18$(_context18) {
                    while (1) {
                        switch (_context18.prev = _context18.next) {
                            case 0:
                                myResolve = void 0;
                                _queueTail = this.queueTail;

                                this.queueTail = new Promise(function (resolve) {
                                    return myResolve = resolve;
                                });
                                _context18.next = 5;
                                return _queueTail;

                            case 5:
                                this.resolveHead = myResolve;
                                return _context18.abrupt('return');

                            case 7:
                            case 'end':
                                return _context18.stop();
                        }
                    }
                }, _callee18, this);
            }));

            function lock() {
                return _ref21.apply(this, arguments);
            }

            return lock;
        }()

        /**
         * mutex.unlock = pthread_mutex_unlock
         */

    }, {
        key: 'unlock',
        value: function unlock() {
            this.resolveHead();
            return;
        }

        /**
         * lock, ret = await async, unlock, return ret
         * @param {(Function|Promise)} promise async thing to wait for
         */

    }, {
        key: 'lockAndAwait',
        value: function () {
            var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(promise) {
                var ret;
                return regeneratorRuntime.wrap(function _callee19$(_context19) {
                    while (1) {
                        switch (_context19.prev = _context19.next) {
                            case 0:
                                _context19.next = 2;
                                return this.lock();

                            case 2:
                                ret = void 0;
                                _context19.prev = 3;

                                if (typeof promise == 'function') promise = promise();
                                _context19.next = 7;
                                return promise;

                            case 7:
                                ret = _context19.sent;

                            case 8:
                                _context19.prev = 8;

                                this.unlock();
                                return _context19.finish(8);

                            case 11:
                                return _context19.abrupt('return', ret);

                            case 12:
                            case 'end':
                                return _context19.stop();
                        }
                    }
                }, _callee19, this, [[3,, 8, 11]]);
            }));

            function lockAndAwait(_x31) {
                return _ref22.apply(this, arguments);
            }

            return lockAndAwait;
        }()
    }], [{
        key: '_UNIT_TEST',
        value: function _UNIT_TEST() {
            var _this10 = this;

            var m = new Mutex();
            function sleep(time) {
                return new Promise(function (r) {
                    return setTimeout(r, time);
                });
            }
            m.lockAndAwait(function () {
                console.warn('Check message timestamps.');
                console.warn('Bad:');
                console.warn('1 1 1 1 1:5s');
                console.warn(' 1 1 1 1 1:10s');
                console.warn('Good:');
                console.warn('1 1 1 1 1:5s');
                console.warn('         1 1 1 1 1:10s');
            });
            m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
                return regeneratorRuntime.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                _context20.next = 2;
                                return sleep(1000);

                            case 2:
                                _context20.next = 4;
                                return sleep(1000);

                            case 4:
                                _context20.next = 6;
                                return sleep(1000);

                            case 6:
                                _context20.next = 8;
                                return sleep(1000);

                            case 8:
                                _context20.next = 10;
                                return sleep(1000);

                            case 10:
                            case 'end':
                                return _context20.stop();
                        }
                    }
                }, _callee20, _this10);
            })));
            m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
                return regeneratorRuntime.wrap(function _callee21$(_context21) {
                    while (1) {
                        switch (_context21.prev = _context21.next) {
                            case 0:
                                return _context21.abrupt('return', console.log('5s!'));

                            case 1:
                            case 'end':
                                return _context21.stop();
                        }
                    }
                }, _callee21, _this10);
            })));
            m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
                return regeneratorRuntime.wrap(function _callee22$(_context22) {
                    while (1) {
                        switch (_context22.prev = _context22.next) {
                            case 0:
                                _context22.next = 2;
                                return sleep(1000);

                            case 2:
                                _context22.next = 4;
                                return sleep(1000);

                            case 4:
                                _context22.next = 6;
                                return sleep(1000);

                            case 6:
                                _context22.next = 8;
                                return sleep(1000);

                            case 8:
                                _context22.next = 10;
                                return sleep(1000);

                            case 10:
                            case 'end':
                                return _context22.stop();
                        }
                    }
                }, _callee22, _this10);
            })));
            m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
                return regeneratorRuntime.wrap(function _callee23$(_context23) {
                    while (1) {
                        switch (_context23.prev = _context23.next) {
                            case 0:
                                return _context23.abrupt('return', console.log('10s!'));

                            case 1:
                            case 'end':
                                return _context23.stop();
                        }
                    }
                }, _callee23, _this10);
            })));
        }
    }]);

    return Mutex;
}();

/**
     * @typedef DanmakuColor
     * @property {number} r
     * @property {number} g
     * @property {number} b
     */
/**
 * @typedef Danmaku
 * @property {string} text
 * @property {number} time
 * @property {string} mode
 * @property {number} size
 * @property {DanmakuColor} color
 * @property {boolean} bottom
 * @property {string=} sender
 */

var parser = {};

/**
 * @param {Danmaku} danmaku
 * @returns {boolean}
 */
var danmakuFilter = function danmakuFilter(danmaku) {
    if (!danmaku) return false;
    if (!danmaku.text) return false;
    if (!danmaku.mode) return false;
    if (!danmaku.size) return false;
    if (danmaku.time < 0 || danmaku.time >= 360000) return false;
    return true;
};

var parseRgb256IntegerColor = function parseRgb256IntegerColor(color) {
    var rgb = parseInt(color, 10);
    var r = rgb >>> 4 & 0xff;
    var g = rgb >>> 2 & 0xff;
    var b = rgb >>> 0 & 0xff;
    return { r: r, g: g, b: b };
};

var parseNiconicoColor = function parseNiconicoColor(mail) {
    var colorTable = {
        red: { r: 255, g: 0, b: 0 },
        pink: { r: 255, g: 128, b: 128 },
        orange: { r: 255, g: 184, b: 0 },
        yellow: { r: 255, g: 255, b: 0 },
        green: { r: 0, g: 255, b: 0 },
        cyan: { r: 0, g: 255, b: 255 },
        blue: { r: 0, g: 0, b: 255 },
        purple: { r: 184, g: 0, b: 255 },
        black: { r: 0, g: 0, b: 0 }
    };
    var defaultColor = { r: 255, g: 255, b: 255 };
    var line = mail.toLowerCase().split(/\s+/);
    var color = Object.keys(colorTable).find(function (color) {
        return line.includes(color);
    });
    return color ? colorTable[color] : defaultColor;
};

var parseNiconicoMode = function parseNiconicoMode(mail) {
    var line = mail.toLowerCase().split(/\s+/);
    if (line.includes('ue')) return 'TOP';
    if (line.includes('shita')) return 'BOTTOM';
    return 'RTL';
};

var parseNiconicoSize = function parseNiconicoSize(mail) {
    var line = mail.toLowerCase().split(/\s+/);
    if (line.includes('big')) return 36;
    if (line.includes('small')) return 16;
    return 25;
};

/**
 * @param {string|ArrayBuffer} content
 * @return {{ cid: number, danmaku: Array<Danmaku> }}
 */
parser.bilibili = function (content) {
    var text = typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content);
    var clean = text.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, '').replace(/.*?\?>/, "");
    var data = new DOMParser().parseFromString(clean, 'text/xml');
    var cid = +data.querySelector('chatid,oid').textContent;
    /** @type {Array<Danmaku>} */
    var danmaku = Array.from(data.querySelectorAll('d')).map(function (d) {
        var p = d.getAttribute('p');

        var _p$split = p.split(','),
            _p$split2 = _slicedToArray(_p$split, 8),
            time = _p$split2[0],
            mode = _p$split2[1],
            size = _p$split2[2],
            color = _p$split2[3],
            create = _p$split2[4],
            bottom = _p$split2[5],
            sender = _p$split2[6],
            id = _p$split2[7];

        return {
            text: d.textContent,
            time: +time,
            // We do not support ltr mode
            mode: [null, 'RTL', 'RTL', 'RTL', 'BOTTOM', 'TOP'][+mode],
            size: +size,
            color: parseRgb256IntegerColor(color),
            bottom: bottom > 0,
            sender: sender
        };
    }).filter(danmakuFilter);
    return { cid: cid, danmaku: danmaku };
};

/**
 * @param {string|ArrayBuffer} content
 * @return {{ cid: number, danmaku: Array<Danmaku> }}
 */
parser.acfun = function (content) {
    var text = typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content);
    var data = JSON.parse(text);
    var list = data.reduce(function (x, y) {
        return x.concat(y);
    }, []);
    var danmaku = list.map(function (line) {
        var _line$c$split = line.c.split(','),
            _line$c$split2 = _slicedToArray(_line$c$split, 7),
            time = _line$c$split2[0],
            color = _line$c$split2[1],
            mode = _line$c$split2[2],
            size = _line$c$split2[3],
            sender = _line$c$split2[4],
            create = _line$c$split2[5],
            uuid = _line$c$split2[6],
            text = line.m;

        return {
            text: text,
            time: +time,
            color: parseRgb256IntegerColor(+color),
            mode: [null, 'RTL', null, null, 'BOTTOM', 'TOP'][mode],
            size: +size,
            bottom: false,
            uuid: uuid
        };
    }).filter(danmakuFilter);
    return { danmaku: danmaku };
};

/**
 * @param {string|ArrayBuffer} content
 * @return {{ cid: number, danmaku: Array<Danmaku> }}
 */
parser.niconico = function (content) {
    var text = typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content);
    var data = JSON.parse(text);
    var list = data.map(function (item) {
        return item.chat;
    }).filter(function (x) {
        return x;
    });

    var _list$find = list.find(function (comment) {
        return comment.thread;
    }),
        thread = _list$find.thread;

    var danmaku = list.map(function (comment) {
        if (!comment.content || !(comment.vpos >= 0) || !comment.no) return null;
        var vpos = comment.vpos,
            _comment$mail = comment.mail,
            mail = _comment$mail === undefined ? '' : _comment$mail,
            content = comment.content,
            no = comment.no;

        return {
            text: content,
            time: vpos / 100,
            color: parseNiconicoColor(mail),
            mode: parseNiconicoMode(mail),
            size: parseNiconicoSize(mail),
            bottom: false,
            id: no
        };
    }).filter(danmakuFilter);
    return { thread: thread, danmaku: danmaku };
};

var font = {};

// Meansure using canvas
font.textByCanvas = function () {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    return function (fontname, text, fontsize) {
        context.font = 'bold ' + fontsize + 'px ' + fontname;
        return Math.ceil(context.measureText(text).width);
    };
};

// Meansure using <div>
font.textByDom = function () {
    var container = document.createElement('div');
    container.setAttribute('style', 'all: initial !important');
    var content = document.createElement('div');
    content.setAttribute('style', ['top: -10000px', 'left: -10000px', 'width: auto', 'height: auto', 'position: absolute'].map(function (item) {
        return item + ' !important;';
    }).join(' '));
    var active = function active() {
        document.body.parentNode.appendChild(content);
    };
    if (!document.body) document.addEventListener('DOMContentLoaded', active);else active();
    return function (fontname, text, fontsize) {
        content.textContent = text;
        content.style.font = 'bold ' + fontsize + 'px ' + fontname;
        return content.clientWidth;
    };
};

font.text = function () {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=561361
    if (/linux/i.test(navigator.platform)) {
        return font.textByDom();
    } else {
        return font.textByCanvas();
    }
}();

font.valid = function () {
    var cache = new Map();
    var textWidth = font.text;
    // Use following texts for checking
    var sampleText = ['The quick brown fox jumps over the lazy dog', '7531902468', ',.!-', '，。：！', '天地玄黄', '則近道矣', 'あいうえお', 'アイウエオガパ', 'ｱｲｳｴｵｶﾞﾊﾟ'].join('');
    // Some given font family is avaliable iff we can meansure different width compared to other fonts
    var sampleFont = ['monospace', 'sans-serif', 'sans', 'Symbol', 'Arial', 'Comic Sans MS', 'Fixed', 'Terminal', 'Times', 'Times New Roman', 'SimSum', 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', 'WenQuanYi Micro Hei', 'Pmingliu', 'Microsoft JhengHei', 'PingFang TC', 'Heiti TC', 'MS Gothic', 'Meiryo', 'Hiragino Kaku Gothic Pro', 'Hiragino Mincho Pro'];
    var diffFont = function diffFont(base, test) {
        var baseSize = textWidth(base, sampleText, 72);
        var testSize = textWidth(test + ',' + base, sampleText, 72);
        return baseSize !== testSize;
    };
    var validFont = function validFont(test) {
        if (cache.has(test)) return cache.get(test);
        var result = sampleFont.some(function (base) {
            return diffFont(base, test);
        });
        cache.set(test, result);
        return result;
    };
    return validFont;
}();

var rtlCanvas = function rtlCanvas(options) {
    var wc = options.resolutionX,
        hc = options.resolutionY,
        b = options.bottomReserved,
        u = options.rtlDuration,
        maxr = options.maxDelay;

    // Initial canvas border

    var used = [
    // p: top
    // m: bottom
    // tf: time completely enter screen
    // td: time completely leave screen
    // b: allow conflict with subtitle
    // add a fake danmaku for describe top of screen
    { p: -Infinity, m: 0, tf: Infinity, td: Infinity, b: false },
    // add a fake danmaku for describe bottom of screen
    { p: hc, m: Infinity, tf: Infinity, td: Infinity, b: false },
    // add a fake danmaku for placeholder of subtitle
    { p: hc - b, m: hc, tf: Infinity, td: Infinity, b: true }];
    // Find out some position is available
    var available = function available(hv, t0s, t0l, b) {
        var suggestion = [];
        // Upper edge of candidate position should always be bottom of other danmaku (or top of screen)
        used.forEach(function (i) {
            if (i.m + hv >= hc) return;
            var p = i.m;
            var m = p + hv;
            var tas = t0s;
            var tal = t0l;
            // and left border should be right edge of others
            used.forEach(function (j) {
                if (j.p >= m) return;
                if (j.m <= p) return;
                if (j.b && b) return;
                tas = Math.max(tas, j.tf);
                tal = Math.max(tal, j.td);
            });
            var r = Math.max(tas - t0s, tal - t0l);
            if (r > maxr) return;
            // save a candidate position
            suggestion.push({ p: p, r: r });
        });
        // sorted by its vertical position
        suggestion.sort(function (x, y) {
            return x.p - y.p;
        });
        var mr = maxr;
        // the bottom and later choice should be ignored
        var filtered = suggestion.filter(function (i) {
            if (i.r >= mr) return false;
            mr = i.r;
            return true;
        });
        return filtered;
    };
    // mark some area as used
    var use = function use(p, m, tf, td) {
        used.push({ p: p, m: m, tf: tf, td: td, b: false });
    };
    // remove danmaku not needed anymore by its time
    var syn = function syn(t0s, t0l) {
        used = used.filter(function (i) {
            return i.tf > t0s || i.td > t0l;
        });
    };
    // give a score in range [0, 1) for some position
    var score = function score(i) {
        if (i.r > maxr) return -Infinity;
        return 1 - Math.hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;
    };
    // add some danmaku
    return function (line) {
        var t0s = line.time,
            wv = line.width,
            hv = line.height,
            b = line.bottom;

        var t0l = wc / (wv + wc) * u + t0s; // time start to leave
        syn(t0s, t0l);
        var al = available(hv, t0s, t0l, b);
        if (!al.length) return null;
        var scored = al.map(function (i) {
            return [score(i), i];
        });
        var best = scored.reduce(function (x, y) {
            return x[0] > y[0] ? x : y;
        })[1];
        var ts = t0s + best.r; // time start to enter
        var tf = wv / (wv + wc) * u + ts; // time complete enter
        var td = u + ts; // time complete leave
        use(best.p, best.p + hv, tf, td);
        return {
            top: best.p,
            time: ts
        };
    };
};

var fixedCanvas = function fixedCanvas(options) {
    var hc = options.resolutionY,
        b = options.bottomReserved,
        u = options.fixDuration,
        maxr = options.maxDelay;

    var used = [{ p: -Infinity, m: 0, td: Infinity, b: false }, { p: hc, m: Infinity, td: Infinity, b: false }, { p: hc - b, m: hc, td: Infinity, b: true }];
    // Find out some available position
    var fr = function fr(p, m, t0s, b) {
        var tas = t0s;
        used.forEach(function (j) {
            if (j.p >= m) return;
            if (j.m <= p) return;
            if (j.b && b) return;
            tas = Math.max(tas, j.td);
        });
        var r = tas - t0s;
        if (r > maxr) return null;
        return { r: r, p: p, m: m };
    };
    // layout for danmaku at top
    var top = function top(hv, t0s, b) {
        var suggestion = [];
        used.forEach(function (i) {
            if (i.m + hv >= hc) return;
            suggestion.push(fr(i.m, i.m + hv, t0s, b));
        });
        return suggestion.filter(function (x) {
            return x;
        });
    };
    // layout for danmaku at bottom
    var bottom = function bottom(hv, t0s, b) {
        var suggestion = [];
        used.forEach(function (i) {
            if (i.p - hv <= 0) return;
            suggestion.push(fr(i.p - hv, i.p, t0s, b));
        });
        return suggestion.filter(function (x) {
            return x;
        });
    };
    var use = function use(p, m, td) {
        used.push({ p: p, m: m, td: td, b: false });
    };
    var syn = function syn(t0s) {
        used = used.filter(function (i) {
            return i.td > t0s;
        });
    };
    // Score every position
    var score = function score(i, is_top) {
        if (i.r > maxr) return -Infinity;
        var f = function f(p) {
            return is_top ? p : hc - p;
        };
        return 1 - (i.r / maxr * (31 / 32) + f(i.p) / hc * (1 / 32));
    };
    return function (line) {
        var t0s = line.time,
            hv = line.height,
            b = line.bottom;

        var is_top = line.mode === 'TOP';
        syn(t0s);
        var al = (is_top ? top : bottom)(hv, t0s, b);
        if (!al.length) return null;
        var scored = al.map(function (i) {
            return [score(i, is_top), i];
        });
        var best = scored.reduce(function (x, y) {
            return x[0] > y[0] ? x : y;
        }, [-Infinity, null])[1];
        if (!best) return null;
        use(best.p, best.m, best.r + t0s + u);
        return { top: best.p, time: best.r + t0s };
    };
};

var placeDanmaku = function placeDanmaku(options) {
    var layers = options.maxOverlap;
    var normal = Array(layers).fill(null).map(function (x) {
        return rtlCanvas(options);
    });
    var fixed = Array(layers).fill(null).map(function (x) {
        return fixedCanvas(options);
    });
    return function (line) {
        line.fontSize = Math.round(line.size * options.fontSize);
        line.height = line.fontSize;
        line.width = line.width || font.text(options.fontFamily, line.text, line.fontSize) || 1;

        if (line.mode === 'RTL') {
            var pos = normal.reduce(function (pos, layer) {
                return pos || layer(line);
            }, null);
            if (!pos) return null;
            var _top = pos.top,
                time = pos.time;

            line.layout = {
                type: 'Rtl',
                start: {
                    x: options.resolutionX + line.width / 2,
                    y: _top + line.height,
                    time: time
                },
                end: {
                    x: -line.width / 2,
                    y: _top + line.height,
                    time: options.rtlDuration + time
                }
            };
        } else if (['TOP', 'BOTTOM'].includes(line.mode)) {
            var _pos = fixed.reduce(function (pos, layer) {
                return pos || layer(line);
            }, null);
            if (!_pos) return null;
            var _top2 = _pos.top,
                _time = _pos.time;

            line.layout = {
                type: 'Fix',
                start: {
                    x: Math.round(options.resolutionX / 2),
                    y: _top2 + line.height,
                    time: _time
                },
                end: {
                    time: options.fixDuration + _time
                }
            };
        }
        return line;
    };
};

// main layout algorithm
var layout = function () {
    var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(danmaku, optionGetter) {
        var options, sorted, place, result, length, i, l, placed;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
                switch (_context24.prev = _context24.next) {
                    case 0:
                        options = JSON.parse(JSON.stringify(optionGetter));
                        sorted = danmaku.slice(0).sort(function (_ref28, _ref29) {
                            var x = _ref28.time;
                            var y = _ref29.time;
                            return x - y;
                        });
                        place = placeDanmaku(options);
                        result = Array(sorted.length);
                        length = 0;
                        i = 0, l = sorted.length;

                    case 6:
                        if (!(i < l)) {
                            _context24.next = 15;
                            break;
                        }

                        placed = place(sorted[i]);

                        if (placed) result[length++] = placed;

                        if (!((i + 1) % 1000 === 0)) {
                            _context24.next = 12;
                            break;
                        }

                        _context24.next = 12;
                        return new Promise(function (resolve) {
                            return setTimeout(resolve, 0);
                        });

                    case 12:
                        i++;
                        _context24.next = 6;
                        break;

                    case 15:
                        result.length = length;
                        result.sort(function (x, y) {
                            return x.layout.start.time - y.layout.start.time;
                        });
                        return _context24.abrupt('return', result);

                    case 18:
                    case 'end':
                        return _context24.stop();
                }
            }
        }, _callee24, this);
    }));

    return function layout(_x32, _x33) {
        return _ref27.apply(this, arguments);
    };
}();

// escape string for ass
var textEscape = function textEscape(s) {
    return (
        // VSFilter do not support escaped "{" or "}"; we use full-width version instead
        s.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\s/g, ' ')
    );
};

var formatColorChannel = function formatColorChannel(v) {
    return (v & 255).toString(16).toUpperCase().padStart(2, '0');
};

// format color
var formatColor = function formatColor(color) {
    return '&H' + [color.b, color.g, color.r].map(formatColorChannel).join('');
};

// format timestamp
var formatTimestamp = function formatTimestamp(time) {
    var value = Math.round(time * 100) * 10;
    var rem = value % 3600000;
    var hour = (value - rem) / 3600000;
    var fHour = hour.toFixed(0).padStart(2, '0');
    var fRem = new Date(rem).toISOString().slice(-11, -2);
    return fHour + fRem;
};

// test is default color
var isDefaultColor = function isDefaultColor(_ref30) {
    var r = _ref30.r,
        g = _ref30.g,
        b = _ref30.b;
    return r === 255 && g === 255 && b === 255;
};
// test is dark color
var isDarkColor = function isDarkColor(_ref31) {
    var r = _ref31.r,
        g = _ref31.g,
        b = _ref31.b;
    return r * 0.299 + g * 0.587 + b * 0.114 < 0x30;
};

// Ass header
var header = function header(info) {
    return ['[Script Info]', 'Title: ' + info.title, 'Original Script: ' + info.original, 'ScriptType: v4.00+', 'Collisions: Normal', 'PlayResX: ' + info.playResX, 'PlayResY: ' + info.playResY, 'Timer: 100.0000', '', '[V4+ Styles]', 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding', 'Style: Fix,' + info.fontFamily + ',' + info.fontSize + ',&H' + info.alpha + 'FFFFFF,&H' + info.alpha + 'FFFFFF,&H' + info.alpha + '000000,&H' + info.alpha + '000000,' + info.bold + ',0,0,0,100,100,0,0,1,2,0,2,20,20,2,0', 'Style: Rtl,' + info.fontFamily + ',' + info.fontSize + ',&H' + info.alpha + 'FFFFFF,&H' + info.alpha + 'FFFFFF,&H' + info.alpha + '000000,&H' + info.alpha + '000000,' + info.bold + ',0,0,0,100,100,0,0,1,2,0,2,20,20,2,0', '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'];
};

// Set color of text
var lineColor = function lineColor(_ref32) {
    var color = _ref32.color;

    var output = [];
    if (!isDefaultColor(color)) output.push('\\c' + formatColor(color));
    if (isDarkColor(color)) output.push('\\3c&HFFFFFF');
    return output.join('');
};

// Set fontsize
var defaultFontSize = void 0;
var lineFontSize = function lineFontSize(_ref33) {
    var size = _ref33.size;

    if (size === defaultFontSize) return '';
    return '\\fs' + size;
};
var getCommonFontSize = function getCommonFontSize(list) {
    var count = new Map();
    var commonCount = 0,
        common = 1;
    list.forEach(function (_ref34) {
        var size = _ref34.size;

        var value = 1;
        if (count.has(size)) value = count.get(size) + 1;
        count.set(size, value);
        if (value > commonCount) {
            commonCount = value;
            common = size;
        }
    });
    defaultFontSize = common;
    return common;
};

// Add animation of danmaku
var lineMove = function lineMove(_ref35) {
    var _ref35$layout = _ref35.layout,
        type = _ref35$layout.type,
        _ref35$layout$start = _ref35$layout.start,
        start = _ref35$layout$start === undefined ? null : _ref35$layout$start,
        _ref35$layout$end = _ref35$layout.end,
        end = _ref35$layout$end === undefined ? null : _ref35$layout$end;

    if (type === 'Rtl' && start && end) return '\\move(' + start.x + ',' + start.y + ',' + end.x + ',' + end.y + ')';
    if (type === 'Fix' && start) return '\\pos(' + start.x + ',' + start.y + ')';
    return '';
};

// format one line
var formatLine = function formatLine(line) {
    var start = formatTimestamp(line.layout.start.time);
    var end = formatTimestamp(line.layout.end.time);
    var type = line.layout.type;
    var color = lineColor(line);
    var fontSize = lineFontSize(line);
    var move = lineMove(line);
    var format = '' + color + fontSize + move;
    var text = textEscape(line.text);
    return 'Dialogue: 0,' + start + ',' + end + ',' + type + ',,20,20,2,,{' + format + '}' + text;
};

var ass = function ass(danmaku, options) {
    var info = {
        title: danmaku.meta.name,
        original: 'Generated by tiansh/ass-danmaku (embedded in liqi0816/bilitwin) based on ' + danmaku.meta.url,
        playResX: options.resolutionX,
        playResY: options.resolutionY,
        fontFamily: options.fontFamily.split(",")[0],
        fontSize: getCommonFontSize(danmaku.layout),
        alpha: formatColorChannel(0xFF * (100 - options.textOpacity * 100) / 100),
        bold: options.bold ? -1 : 0
    };
    return [].concat(_toConsumableArray(header(info)), _toConsumableArray(danmaku.layout.map(formatLine).filter(function (x) {
        return x;
    }))).join('\r\n');
};

/**
 * @file Common works for reading / writing optinos
 */

/**
 * @returns {string}
 */
var predefFontFamily = function predefFontFamily() {
    // const sc = ['Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC'];
    // replaced with bilibili defaults
    var sc = ["SimHei", "'Microsoft JhengHei'", "SimSun", "NSimSun", "FangSong", "'Microsoft YaHei'", "'Microsoft Yahei UI Light'", "'Noto Sans CJK SC Bold'", "'Noto Sans CJK SC DemiLight'", "'Noto Sans CJK SC Regular'"];
    var tc = ['Microsoft JhengHei', 'PingFang TC', 'Noto Sans CJK TC'];
    var ja = ['MS PGothic', 'Hiragino Kaku Gothic Pro', 'Noto Sans CJK JP'];
    var lang = navigator.language;
    var fonts = /^ja/.test(lang) ? ja : /^zh(?!.*Hans).*(?:TW|HK|MO)/.test(lang) ? tc : sc;
    var chosed = fonts.find(function (font$$1) {
        return font.valid(font$$1);
    }) || fonts[0];
    return chosed;
};

var attributes = [{ name: 'resolutionX', type: 'number', min: 480, predef: 560 }, { name: 'resolutionY', type: 'number', min: 360, predef: 420 }, { name: 'bottomReserved', type: 'number', min: 0, predef: 60 }, { name: 'fontFamily', type: 'string', predef: predefFontFamily(), valid: function valid(font$$1) {
        return font.valid(font$$1);
    } }, { name: 'fontSize', type: 'number', min: 0, predef: 1, step: 0.01 }, { name: 'textSpace', type: 'number', min: 0, predef: 0 }, { name: 'rtlDuration', type: 'number', min: 0.1, predef: 8, step: 0.1 }, { name: 'fixDuration', type: 'number', min: 0.1, predef: 4, step: 0.1 }, { name: 'maxDelay', type: 'number', min: 0, predef: 6, step: 0.1 }, { name: 'textOpacity', type: 'number', min: 0.1, max: 1, predef: 0.6 }, { name: 'maxOverlap', type: 'number', min: 1, max: 20, predef: 1 }, { name: 'bold', type: 'boolean', predef: true }];

var attrNormalize = function attrNormalize(option, _ref36) {
    var name = _ref36.name,
        type = _ref36.type,
        _ref36$min = _ref36.min,
        min = _ref36$min === undefined ? -Infinity : _ref36$min,
        _ref36$max = _ref36.max,
        max = _ref36$max === undefined ? Infinity : _ref36$max,
        _ref36$step = _ref36.step,
        step = _ref36$step === undefined ? 1 : _ref36$step,
        predef = _ref36.predef,
        valid = _ref36.valid;

    var value = option;
    if (type === 'number') value = +value;else if (type === 'string') value = '' + value;else if (type === 'boolean') value = !!value;
    if (valid && !valid(value)) value = predef;
    if (type === 'number') {
        if (Number.isNaN(value)) value = predef;
        if (value < min) value = min;
        if (value > max) value = max;
        if (name != 'textOpacity') value = Math.round((value - min) / step) * step + min;
    }
    return value;
};

/**
 * @param {ExtOption} option
 * @returns {ExtOption}
 */
var normalize = function normalize(option) {
    return Object.assign.apply(Object, [{}].concat(_toConsumableArray(attributes.map(function (attr) {
        return _defineProperty({}, attr.name, attrNormalize(option[attr.name], attr));
    }))));
};

/**
   * Convert file content to Blob which describe the file
   * @param {string} content
   * @returns {Blob}
   */
var convertToBlob = function convertToBlob(content) {
    var encoder = new TextEncoder();
    // Add a BOM to make some ass parser library happier
    var bom = '\uFEFF';
    var encoded = encoder.encode(bom + content);
    var blob = new Blob([encoded], { type: 'application/octet-stream' });
    return blob;
};

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * An API wrapper of tiansh/ass-danmaku for liqi0816/bilitwin
 */

var ASSConverter = function () {
    /**
     * @typedef {ExtOption}
     * @property {number} resolutionX canvas width for drawing danmaku (px)
     * @property {number} resolutionY canvas height for drawing danmaku (px)
     * @property {number} bottomReserved reserved height at bottom for drawing danmaku (px)
     * @property {string} fontFamily danmaku font family
     * @property {number} fontSize danmaku font size (ratio)
     * @property {number} textSpace space between danmaku (px)
     * @property {number} rtlDuration duration of right to left moving danmaku appeared on screen (s)
     * @property {number} fixDuration duration of keep bottom / top danmaku appeared on screen (s)
     * @property {number} maxDelay // maxinum amount of allowed delay (s)
     * @property {number} textOpacity // opacity of text, in range of [0, 1]
     * @property {number} maxOverlap // maxinum layers of danmaku
     */

    /**
     * @param {ExtOption} option tiansh/ass-danmaku compatible option
     */
    function ASSConverter() {
        var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, ASSConverter);

        this.option = option;
    }

    _createClass(ASSConverter, [{
        key: 'genASS',


        /**
         * @param {Danmaku[]} danmaku use ASSConverter.parseXML
         * @param {string} title 
         * @param {string} originalURL 
         */
        value: function () {
            var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(danmaku) {
                var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'danmaku';
                var originalURL = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'anonymous xml';
                var layout$$1, ass$$1;
                return regeneratorRuntime.wrap(function _callee25$(_context25) {
                    while (1) {
                        switch (_context25.prev = _context25.next) {
                            case 0:
                                _context25.next = 2;
                                return layout(danmaku, this.option);

                            case 2:
                                layout$$1 = _context25.sent;
                                ass$$1 = ass({
                                    content: danmaku,
                                    layout: layout$$1,
                                    meta: {
                                        name: title,
                                        url: originalURL
                                    }
                                }, this.option);
                                return _context25.abrupt('return', ass$$1);

                            case 5:
                            case 'end':
                                return _context25.stop();
                        }
                    }
                }, _callee25, this);
            }));

            function genASS(_x37) {
                return _ref38.apply(this, arguments);
            }

            return genASS;
        }()
    }, {
        key: 'genASSBlob',
        value: function () {
            var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(danmaku) {
                var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'danmaku';
                var originalURL = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'anonymous xml';
                return regeneratorRuntime.wrap(function _callee26$(_context26) {
                    while (1) {
                        switch (_context26.prev = _context26.next) {
                            case 0:
                                _context26.t0 = convertToBlob;
                                _context26.next = 3;
                                return this.genASS(danmaku, title, originalURL);

                            case 3:
                                _context26.t1 = _context26.sent;
                                return _context26.abrupt('return', (0, _context26.t0)(_context26.t1));

                            case 5:
                            case 'end':
                                return _context26.stop();
                        }
                    }
                }, _callee26, this);
            }));

            function genASSBlob(_x40) {
                return _ref39.apply(this, arguments);
            }

            return genASSBlob;
        }()

        /**
         * @typedef DanmakuColor
         * @property {number} r
         * @property {number} g
         * @property {number} b
         */

        /**
         * @typedef Danmaku
         * @property {string} text
         * @property {number} time
         * @property {string} mode
         * @property {number} size
         * @property {DanmakuColor} color
         * @property {boolean} bottom
         * @property {string=} sender
         */

        /**
         * @param {string} xml bilibili danmaku xml
         * @returns {Danmaku[]}
         */

    }, {
        key: 'option',
        get: function get() {
            return this.normalizedOption;
        },
        set: function set(e) {
            return this.normalizedOption = normalize(e);
        }
    }], [{
        key: 'parseXML',
        value: function parseXML(xml) {
            return parser.bilibili(xml).danmaku;
        }
    }, {
        key: '_UNIT_TEST',
        value: function _UNIT_TEST() {
            var e = new ASSConverter();
            var xml = '<?xml version="1.0" encoding="UTF-8"?><i><chatserver>chat.bilibili.com</chatserver><chatid>32873758</chatid><mission>0</mission><maxlimit>6000</maxlimit><state>0</state><realname>0</realname><source>k-v</source><d p="0.00000,1,25,16777215,1519733589,0,d286a97b,4349604072">\u771F\u7B2C\u4E00</d><d p="7.29900,1,25,16777215,1519733812,0,3548796c,4349615908">\u4E94\u5206\u949F\u524D</d><d p="587.05100,1,25,16777215,1519734291,0,f2ed792f,4349641325">\u60CA\u5446\u4E86\uFF01</d><d p="136.82200,1,25,16777215,1519734458,0,1e5784f,4349652071">\u795E\u738B\u4EE3\u8868\u865A\u7A7A</d><d p="0.00000,1,25,16777215,1519736251,0,f16cbf44,4349751461">66666666666666666</d><d p="590.60400,1,25,16777215,1519736265,0,fbb3d1b3,4349752331">\u8FD9\u8981\u5439\u591A\u957F\u65F6\u95F4</d><d p="537.15500,1,25,16777215,1519736280,0,1e5784f,4349753170">\u53CD\u800C\u4E0D\u662F\uFF0C\u75BE\u75C5\u662F\u4E2A\u6076\u9B54\uFF0C\u522B\u4EBA\u8BF4\u5979\u4F2A\u88C5\u6210\u4E86\u7CBE\u7075</d><d p="872.08200,1,25,16777215,1519736881,0,1e5784f,4349787709">\u7CBE\u7075\u90FD\u4F1A\u5403</d><d p="2648.42500,1,25,16777215,1519737840,0,e9e6b2b4,4349844463">\u5C31\u4E0D\u80FD\u5927\u90E8\u5206\u90FD\u662F\u94DC\u5E01\u4E48\uFF1F</d><d p="2115.09400,1,25,16777215,1519738271,0,3548796c,4349870808">\u5413\u6B7B\u6211\u4E86\u3002\u3002\u3002</d><d p="11.45400,1,25,16777215,1519739974,0,9937b428,4349974512">???</d><d p="1285.73900,1,25,16777215,1519748274,0,3bb4c9ee,4350512859">\u513F\u7838</d><d p="595.48600,1,25,16777215,1519757148,0,f3ed26b6,4350787048">\u6015\u662F\u8981\u5439\u5230\u7F3A\u6C27\u54E6</d><d p="1206.31500,1,25,16777215,1519767204,0,62a9186a,4350882680">233333333333333</d><d p="638.68700,1,25,16777215,1519769219,0,de0a99ae,4350893310">\u83DC\u9E21\u7684\u501F\u53E3</d><d p="655.76500,1,25,16777215,1519769236,0,de0a99ae,4350893397">\u7ADF\u7136\u5439\u8721\u70DB\u6253\u533B\u751F</d><d p="2235.89600,1,25,16777215,1519769418,0,de0a99ae,4350894325">\u8FD9\u66B4\u51FB\u7387\u592A\u9AD8\u4E86</d><d p="389.88700,1,25,16777215,1519780435,0,8879732c,4351021740">\u533B\u751F\u597D\u60F3\u8FDB10\u4E07\uFF0C\u8840\uFF0C\u4E0A\u4E07\u7532</d><d p="2322.47900,1,25,16777215,1519780901,0,e509a801,4351032321">\u524D\u4E00\u4E2A\u547D\u90FD\u6CA1\u4E86</d><d p="2408.93600,1,25,16777215,1519801350,0,1a692eb6,4351826484">23333333333333</d><d p="1290.62000,1,25,16777215,1519809649,0,af8f12dc,4352159267">\u513F\u7838~</d><d p="917.96300,1,25,16777215,1519816770,0,fef64b6a,4352474878">\u5E94\u8BE5\u59C6\u897F\u81EA\u5DF1\u63A7\u5236\u6D1B\u65AF   \u4E03\u6740\u70B9\u592A\u5FEB\u4E86\u5DEE\u8BC4</d><d p="2328.03100,1,25,16777215,1519825291,0,8549205d,4352919003">\u73B0\u5728\u524D\u4E00\u4E2A\u8FDE\u547D\u90FD\u6CA1\u4E86\u554A\u5582</d><d p="1246.16700,1,25,16777215,1519827514,0,fef64b6a,4353052309">\u4E0D\u5982\u8D70\u5230\u9762\u524D\u7528\u626B\u5C04   \u57FA\u672C\u5168\u4E2D  \u4F24\u5BB3\u7206\u8868</d><d p="592.38100,1,25,16777215,1519912489,0,edc3f0a9,4355960085">\u8FD9\u662F\u8FD9\u4E2A\u6E38\u620F\u6700\u9707\u64BC\u7684\u51E0\u5E55\u4E4B\u4E00</d></i>';
            console.log(window.ass = e.genASSBlob(ASSConverter.parseXML(xml)));
        }
    }]);

    return ASSConverter;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * A util to hook a function
 */


var HookedFunction = function (_Function) {
    _inherits(HookedFunction, _Function);

    function HookedFunction() {
        _classCallCheck(this, HookedFunction);

        // 1. init parameter
        var _HookedFunction$parse = HookedFunction.parseParameter.apply(HookedFunction, arguments),
            raw = _HookedFunction$parse.raw,
            pre = _HookedFunction$parse.pre,
            post = _HookedFunction$parse.post;

        // 2. build bundle


        var self = function self() {
            var _this12 = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var raw = self.raw,
                pre = self.pre,
                post = self.post;

            var context = { args: args, target: raw, ret: undefined, hook: self };
            pre.forEach(function (e) {
                return e.call(_this12, context);
            });
            if (context.target) context.ret = context.target.apply(this, context.args);
            post.forEach(function (e) {
                return e.call(_this12, context);
            });
            return context.ret;
        };
        Object.setPrototypeOf(self, HookedFunction.prototype);
        self.raw = raw;
        self.pre = pre;
        self.post = post;

        // 3. cheat babel - it complains about missing super(), even if it is actual valid 
        try {
            var _ret;

            return _ret = self, _possibleConstructorReturn(_this11, _ret);
        } catch (e) {
            var _ret2;

            var _this11 = _possibleConstructorReturn(this, (HookedFunction.__proto__ || Object.getPrototypeOf(HookedFunction)).call(this));

            return _ret2 = self, _possibleConstructorReturn(_this11, _ret2);
        }
        return _this11;
    }

    _createClass(HookedFunction, [{
        key: 'addPre',
        value: function addPre() {
            var _pre;

            (_pre = this.pre).push.apply(_pre, arguments);
        }
    }, {
        key: 'addPost',
        value: function addPost() {
            var _post;

            (_post = this.post).push.apply(_post, arguments);
        }
    }, {
        key: 'addCallback',
        value: function addCallback() {
            this.addPost.apply(this, arguments);
        }
    }, {
        key: 'removePre',
        value: function removePre(func) {
            this.pre = this.pre.filter(function (e) {
                return e != func;
            });
        }
    }, {
        key: 'removePost',
        value: function removePost(func) {
            this.post = this.post.filter(function (e) {
                return e != func;
            });
        }
    }, {
        key: 'removeCallback',
        value: function removeCallback(func) {
            this.removePost(func);
        }
    }], [{
        key: 'parseParameter',
        value: function parseParameter() {
            for (var _len2 = arguments.length, init = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                init[_key2] = arguments[_key2];
            }

            // 1. clone init
            init = init.slice();

            // 2. default
            var raw = null;
            var pre = [];
            var post = [];

            // 3. (raw, ...others)
            if (typeof init[0] === 'function') raw = init.shift();

            // 4. iterate through parameters
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = init[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    if (!e) {
                        continue;
                    } else if (Array.isArray(e)) {
                        pre = post;
                        post = e;
                    } else if ((typeof e === 'undefined' ? 'undefined' : _typeof(e)) == 'object') {
                        if (typeof e.raw == 'function') raw = e.raw;
                        if (typeof e.pre == 'function') pre.push(e.pre);
                        if (typeof e.post == 'function') post.push(e.post);
                        if (Array.isArray(e.pre)) pre = e.pre;
                        if (Array.isArray(e.post)) post = e.post;
                    } else if (typeof e == 'function') {
                        post.push(e);
                    } else {
                        throw new TypeError('HookedFunction: cannot recognize paramter ' + e + ' of type ' + (typeof e === 'undefined' ? 'undefined' : _typeof(e)));
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return { raw: raw, pre: pre, post: post };
        }
    }, {
        key: 'hook',
        value: function hook() {
            // 1. init parameter
            var _HookedFunction$parse2 = HookedFunction.parseParameter.apply(HookedFunction, arguments),
                raw = _HookedFunction$parse2.raw,
                pre = _HookedFunction$parse2.pre,
                post = _HookedFunction$parse2.post;

            // 2 wrap
            // 2.1 already wrapped => concat


            if (raw instanceof HookedFunction) {
                var _raw$pre, _raw$post;

                (_raw$pre = raw.pre).push.apply(_raw$pre, _toConsumableArray(pre));
                (_raw$post = raw.post).push.apply(_raw$post, _toConsumableArray(post));
                return raw;
            }

            // 2.2 otherwise => new
            else {
                    return new HookedFunction({ raw: raw, pre: pre, post: post });
                }
        }
    }, {
        key: 'hookDebugger',
        value: function hookDebugger(raw) {
            var pre = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            var post = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            // 1. init hook
            if (!HookedFunction.hookDebugger.hook) HookedFunction.hookDebugger.hook = function (ctx) {
                debugger;
            };

            // 2 wrap
            // 2.1 already wrapped => concat
            if (raw instanceof HookedFunction) {
                if (pre && !raw.pre.includes(HookedFunction.hookDebugger.hook)) {
                    raw.pre.push(HookedFunction.hookDebugger.hook);
                }
                if (post && !raw.post.includes(HookedFunction.hookDebugger.hook)) {
                    raw.post.push(HookedFunction.hookDebugger.hook);
                }
                return raw;
            }

            // 2.2 otherwise => new
            else {
                    return new HookedFunction({
                        raw: raw,
                        pre: pre && HookedFunction.hookDebugger.hook || undefined,
                        post: post && HookedFunction.hookDebugger.hook || undefined
                    });
                }
        }
    }]);

    return HookedFunction;
}(Function);

/***
 * BiliMonkey
 * A bilibili user script
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * The FLV merge utility is a Javascript translation of 
 * https://github.com/grepmusic/flvmerge
 * by grepmusic
 * 
 * The ASS convert utility is a fork of
 * https://github.com/tiansh/ass-danmaku
 * by tiansh
 * 
 * The FLV demuxer is from
 * https://github.com/Bilibili/flv.js/
 * by zheng qian
 * 
 * The EMBL builder is from
 * <https://www.npmjs.com/package/simple-ebml-builder>
 * by ryiwamoto
*/

var BiliMonkey = function () {
    function BiliMonkey(playerWin) {
        var _this13 = this;

        var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : BiliMonkey.optionDefaults;

        _classCallCheck(this, BiliMonkey);

        this.playerWin = playerWin;
        this.protocol = playerWin.location.protocol;
        this.cid = null;
        this.flvs = null;
        this.mp4 = null;
        this.ass = null;
        this.flvFormatName = null;
        this.mp4FormatName = null;
        this.fallbackFormatName = null;
        this.cidAsyncContainer = new AsyncContainer();
        this.cidAsyncContainer.then(function (cid) {
            _this13.cid = cid; /** this.ass = this.getASS(); */
        });
        if (typeof top.cid === 'string') this.cidAsyncContainer.resolve(top.cid);

        /***
         * cache + proxy = Service Worker
         * Hope bilibili will have a SW as soon as possible.
         * partial = Stream
         * Hope the fetch API will be stabilized as soon as possible.
         * If you are using your grandpa's browser, do not enable these functions.
         */
        this.cache = option.cache;
        this.partial = option.partial;
        this.proxy = option.proxy;
        this.blocker = option.blocker;
        this.font = option.font;
        this.option = option;
        if (this.cache && !(this.cache instanceof CacheDB)) this.cache = new CacheDB('biliMonkey', 'flv', 'name');

        this.flvsDetailedFetch = [];
        this.flvsBlob = [];

        this.defaultFormatPromise = null;
        this.queryInfoMutex = new Mutex();

        this.destroy = new HookedFunction();
    }

    /***
     * Guide: for ease of debug, please use format name(flv720) instead of format value(64) unless necessary
     * Guide: for ease of html concat, please use string format value('64') instead of number(parseInt('64'))
     */


    _createClass(BiliMonkey, [{
        key: 'lockFormat',
        value: function lockFormat(format) {
            // null => uninitialized
            // async pending => another one is working on it
            // async resolve => that guy just finished work
            // sync value => someone already finished work
            var toast = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
            if (toast) toast.style.visibility = 'hidden';
            if (format == this.fallbackFormatName) return null;
            switch (format) {
                // Single writer is not a must.
                // Plus, if one writer fail, others should be able to overwrite its garbage.
                case 'flv_p60':
                case 'flv720_p60':
                case 'hdflv2':
                case 'flv':
                case 'flv720':
                case 'flv480':
                case 'flv360':
                    //if (this.flvs) return this.flvs; 
                    return this.flvs = new AsyncContainer();
                case 'hdmp4':
                case 'mp4':
                    //if (this.mp4) return this.mp4;
                    return this.mp4 = new AsyncContainer();
                default:
                    throw 'lockFormat error: ' + format + ' is a unrecognizable format';
            }
        }
    }, {
        key: 'resolveFormat',
        value: function resolveFormat(res, shouldBe) {
            var _this14 = this;

            var toast = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
            if (toast) {
                toast.style.visibility = '';
                if (toast.children.length) toast.children[0].style.visibility = 'hidden';
                var video = this.playerWin.document.getElementsByTagName('video')[0];
                if (video) {
                    var h = function h() {
                        if (toast.children.length) toast.children[0].style.visibility = 'hidden';
                    };
                    video.addEventListener('emptied', h, { once: true });
                    setTimeout(function () {
                        return video.removeEventListener('emptied', h);
                    }, 500);
                }
            }
            if (res.format == this.fallbackFormatName) return null;
            switch (res.format) {
                case 'flv_p60':
                case 'flv720_p60':
                case 'hdflv2':
                case 'flv':
                case 'flv720':
                case 'flv480':
                case 'flv360':
                    if (shouldBe && shouldBe != res.format) {
                        this.flvs = null;
                        throw 'URL interface error: response is not ' + shouldBe;
                    }
                    return this.flvs = this.flvs.resolve(res.durl.map(function (e) {
                        return e.url.replace('http:', _this14.protocol);
                    }));
                case 'hdmp4':
                case 'mp4':
                    if (shouldBe && shouldBe != res.format) {
                        this.mp4 = null;
                        throw 'URL interface error: response is not ' + shouldBe;
                    }
                    return this.mp4 = this.mp4.resolve(res.durl[0].url.replace('http:', this.protocol));
                default:
                    throw 'resolveFormat error: ' + res.format + ' is a unrecognizable format';
            }
        }
    }, {
        key: 'getVIPStatus',
        value: function getVIPStatus() {
            var data = this.playerWin.sessionStorage.getItem('bili_login_status');
            try {
                return JSON.parse(data).some(function (e) {
                    return e instanceof Object && e.vipStatus;
                });
            } catch (e) {
                return false;
            }
        }
    }, {
        key: 'getASS',
        value: function () {
            var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
                var _this15 = this;

                return regeneratorRuntime.wrap(function _callee28$(_context28) {
                    while (1) {
                        switch (_context28.prev = _context28.next) {
                            case 0:
                                if (!this.ass) {
                                    _context28.next = 2;
                                    break;
                                }

                                return _context28.abrupt('return', this.ass);

                            case 2:
                                _context28.next = 4;
                                return new Promise(function () {
                                    var _ref41 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(resolve) {
                                        var bilibili_player_settings, danmaku, i, regexp, option, data;
                                        return regeneratorRuntime.wrap(function _callee27$(_context27) {
                                            while (1) {
                                                switch (_context27.prev = _context27.next) {
                                                    case 0:
                                                        // 1. cid
                                                        if (!_this15.cid) _this15.cid = _this15.playerWin.cid;

                                                        // 2. options
                                                        bilibili_player_settings = _this15.playerWin.localStorage.bilibili_player_settings && JSON.parse(_this15.playerWin.localStorage.bilibili_player_settings);

                                                        // 2.1 blocker

                                                        _context27.next = 4;
                                                        return BiliMonkey.fetchDanmaku(_this15.cid);

                                                    case 4:
                                                        danmaku = _context27.sent;

                                                        if (bilibili_player_settings && _this15.blocker) {
                                                            i = bilibili_player_settings.block.list.map(function (e) {
                                                                return e.v;
                                                            }).join('|');

                                                            if (i) {
                                                                regexp = new RegExp(i);

                                                                danmaku = danmaku.filter(function (e) {
                                                                    return !regexp.test(e.text) && !regexp.test(e.sender);
                                                                });
                                                            }
                                                        }

                                                        // 2.2 font
                                                        option = bilibili_player_settings && _this15.font && {
                                                            'fontFamily': bilibili_player_settings.setting_config['fontfamily'] != 'custom' ? bilibili_player_settings.setting_config['fontfamily'].split(/, ?/) : bilibili_player_settings.setting_config['fontfamilycustom'].split(/, ?/),
                                                            'fontSize': parseFloat(bilibili_player_settings.setting_config['fontsize']),
                                                            'textOpacity': parseFloat(bilibili_player_settings.setting_config['opacity']),
                                                            'bold': bilibili_player_settings.setting_config['bold'] ? 1 : 0
                                                        } || undefined;

                                                        // 2.3 resolution

                                                        if (_this15.option.resolution) {
                                                            Object.assign(option, {
                                                                'resolutionX': +_this15.option.resolutionX || 560,
                                                                'resolutionY': +_this15.option.resolutionY || 420
                                                            });
                                                        }

                                                        // 3. generate
                                                        _context27.next = 10;
                                                        return new ASSConverter(option).genASSBlob(danmaku, top.document.title, top.location.href);

                                                    case 10:
                                                        data = _context27.sent;

                                                        resolve(top.URL.createObjectURL(data));

                                                    case 12:
                                                    case 'end':
                                                        return _context27.stop();
                                                }
                                            }
                                        }, _callee27, _this15);
                                    }));

                                    return function (_x44) {
                                        return _ref41.apply(this, arguments);
                                    };
                                }());

                            case 4:
                                this.ass = _context28.sent;
                                return _context28.abrupt('return', this.ass);

                            case 6:
                            case 'end':
                                return _context28.stop();
                        }
                    }
                }, _callee28, this);
            }));

            function getASS() {
                return _ref40.apply(this, arguments);
            }

            return getASS;
        }()
    }, {
        key: 'queryInfo',
        value: function () {
            var _ref42 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(format) {
                var _this16 = this;

                return regeneratorRuntime.wrap(function _callee30$(_context30) {
                    while (1) {
                        switch (_context30.prev = _context30.next) {
                            case 0:
                                return _context30.abrupt('return', this.queryInfoMutex.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
                                    var isBangumi, apiPath, qn, api_url, re, apiJson, data, durls, _zc, _data_X, flvs, video_format;

                                    return regeneratorRuntime.wrap(function _callee29$(_context29) {
                                        while (1) {
                                            switch (_context29.prev = _context29.next) {
                                                case 0:
                                                    _context29.t0 = format;
                                                    _context29.next = _context29.t0 === 'video' ? 3 : _context29.t0 === 'ass' ? 23 : 28;
                                                    break;

                                                case 3:
                                                    if (!_this16.flvs) {
                                                        _context29.next = 5;
                                                        break;
                                                    }

                                                    return _context29.abrupt('return', _this16.video_format);

                                                case 5:
                                                    isBangumi = location.pathname.includes("bangumi") || location.hostname.includes("bangumi");
                                                    apiPath = isBangumi ? "/pgc/player/web/playurl" : "/x/player/playurl";
                                                    qn = _this16.option.enableVideoMaxResolution && _this16.option.videoMaxResolution || "120";
                                                    api_url = 'https://api.bilibili.com' + apiPath + '?avid=' + aid + '&cid=' + cid + '&otype=json&fourk=1&qn=' + qn;
                                                    _context29.next = 11;
                                                    return fetch(api_url, { credentials: 'include' });

                                                case 11:
                                                    re = _context29.sent;
                                                    _context29.next = 14;
                                                    return re.json();

                                                case 14:
                                                    apiJson = _context29.sent;
                                                    data = apiJson.data || apiJson.result;
                                                    // console.log(data)

                                                    durls = data && data.durl;


                                                    if (!durls) {
                                                        _zc = window.Gc || window.zc || Object.values(window).filter(function (x) {
                                                            return typeof x == "string" && x.includes("[Info]");
                                                        })[0];


                                                        data = JSON.parse(_zc.split("\n").filter(function (x) {
                                                            return x.startsWith("{");
                                                        }).pop());

                                                        _data_X = data.Y || data.X || Object.values(data).filter(function (x) {
                                                            return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) == "object" && Object.prototype.toString.call(x) == "[object Object]";
                                                        })[0];


                                                        durls = _data_X.segments || [_data_X];
                                                    }

                                                    // console.log(data)

                                                    flvs = durls.map(function (url_obj) {
                                                        return url_obj.url.replace("http://", "https://");
                                                    });


                                                    _this16.flvs = flvs;

                                                    video_format = data.format && (data.format.match(/mp4|flv/) || [])[0];


                                                    _this16.video_format = video_format;

                                                    return _context29.abrupt('return', video_format);

                                                case 23:
                                                    if (!_this16.ass) {
                                                        _context29.next = 27;
                                                        break;
                                                    }

                                                    return _context29.abrupt('return', _this16.ass);

                                                case 27:
                                                    return _context29.abrupt('return', _this16.getASS(_this16.flvFormatName));

                                                case 28:
                                                    throw 'Bilimonkey: What is format ' + format + '?';

                                                case 29:
                                                case 'end':
                                                    return _context29.stop();
                                            }
                                        }
                                    }, _callee29, _this16);
                                }))));

                            case 1:
                            case 'end':
                                return _context30.stop();
                        }
                    }
                }, _callee30, this);
            }));

            function queryInfo(_x45) {
                return _ref42.apply(this, arguments);
            }

            return queryInfo;
        }()
    }, {
        key: 'hangPlayer',
        value: function hangPlayer() {
            this.playerWin.document.getElementsByTagName('video')[0].src = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAsxtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjY0MyA1YzY1NzA0IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAADmWIhABf/qcv4FM6/0nHAAAC7G1vb3YAAABsbXZoZAAAAAAAAAAAAAAAAAAAA+gAAAAoAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIWdHJhawAAAFx0a2hkAAAAAwAAAAAAAAAAAAAAAQAAAAAAAAAoAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAQAAAAEAAAAAAAJGVkdHMAAAAcZWxzdAAAAAAAAAABAAAAKAAAAAAAAQAAAAABjm1kaWEAAAAgbWRoZAAAAAAAAAAAAAAAAAAAMgAAAAIAFccAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAATltaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAD5c3RibAAAAJVzdHNkAAAAAAAAAAEAAACFYXZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAQABAASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAC9hdmNDAWQACv/hABZnZAAKrNlehAAAAwAEAAADAMg8SJZYAQAGaOvjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAIAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsQAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU2LjQwLjEwMQ==";
        }
    }, {
        key: 'loadFLVFromCache',
        value: function () {
            var _ref44 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(index) {
                var name, item;
                return regeneratorRuntime.wrap(function _callee31$(_context31) {
                    while (1) {
                        switch (_context31.prev = _context31.next) {
                            case 0:
                                if (this.cache) {
                                    _context31.next = 2;
                                    break;
                                }

                                return _context31.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context31.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];
                                _context31.next = 7;
                                return this.cache.getData(name);

                            case 7:
                                item = _context31.sent;

                                if (item) {
                                    _context31.next = 10;
                                    break;
                                }

                                return _context31.abrupt('return');

                            case 10:
                                return _context31.abrupt('return', this.flvsBlob[index] = item.data);

                            case 11:
                            case 'end':
                                return _context31.stop();
                        }
                    }
                }, _callee31, this);
            }));

            function loadFLVFromCache(_x46) {
                return _ref44.apply(this, arguments);
            }

            return loadFLVFromCache;
        }()
    }, {
        key: 'loadPartialFLVFromCache',
        value: function () {
            var _ref45 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(index) {
                var name, item;
                return regeneratorRuntime.wrap(function _callee32$(_context32) {
                    while (1) {
                        switch (_context32.prev = _context32.next) {
                            case 0:
                                if (this.cache) {
                                    _context32.next = 2;
                                    break;
                                }

                                return _context32.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context32.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];

                                name = 'PC_' + name;
                                _context32.next = 8;
                                return this.cache.getData(name);

                            case 8:
                                item = _context32.sent;

                                if (item) {
                                    _context32.next = 11;
                                    break;
                                }

                                return _context32.abrupt('return');

                            case 11:
                                return _context32.abrupt('return', item.data);

                            case 12:
                            case 'end':
                                return _context32.stop();
                        }
                    }
                }, _callee32, this);
            }));

            function loadPartialFLVFromCache(_x47) {
                return _ref45.apply(this, arguments);
            }

            return loadPartialFLVFromCache;
        }()
    }, {
        key: 'loadAllFLVFromCache',
        value: function () {
            var _ref46 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33() {
                var promises, i;
                return regeneratorRuntime.wrap(function _callee33$(_context33) {
                    while (1) {
                        switch (_context33.prev = _context33.next) {
                            case 0:
                                if (this.cache) {
                                    _context33.next = 2;
                                    break;
                                }

                                return _context33.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context33.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                promises = [];

                                for (i = 0; i < this.flvs.length; i++) {
                                    promises.push(this.loadFLVFromCache(i));
                                }return _context33.abrupt('return', Promise.all(promises));

                            case 7:
                            case 'end':
                                return _context33.stop();
                        }
                    }
                }, _callee33, this);
            }));

            function loadAllFLVFromCache() {
                return _ref46.apply(this, arguments);
            }

            return loadAllFLVFromCache;
        }()
    }, {
        key: 'saveFLVToCache',
        value: function () {
            var _ref47 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(index, blob) {
                var name;
                return regeneratorRuntime.wrap(function _callee34$(_context34) {
                    while (1) {
                        switch (_context34.prev = _context34.next) {
                            case 0:
                                if (this.cache) {
                                    _context34.next = 2;
                                    break;
                                }

                                return _context34.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context34.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];
                                return _context34.abrupt('return', this.cache.addData({ name: name, data: blob }));

                            case 6:
                            case 'end':
                                return _context34.stop();
                        }
                    }
                }, _callee34, this);
            }));

            function saveFLVToCache(_x48, _x49) {
                return _ref47.apply(this, arguments);
            }

            return saveFLVToCache;
        }()
    }, {
        key: 'savePartialFLVToCache',
        value: function () {
            var _ref48 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(index, blob) {
                var name;
                return regeneratorRuntime.wrap(function _callee35$(_context35) {
                    while (1) {
                        switch (_context35.prev = _context35.next) {
                            case 0:
                                if (this.cache) {
                                    _context35.next = 2;
                                    break;
                                }

                                return _context35.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context35.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];

                                name = 'PC_' + name;
                                return _context35.abrupt('return', this.cache.putData({ name: name, data: blob }));

                            case 7:
                            case 'end':
                                return _context35.stop();
                        }
                    }
                }, _callee35, this);
            }));

            function savePartialFLVToCache(_x50, _x51) {
                return _ref48.apply(this, arguments);
            }

            return savePartialFLVToCache;
        }()
    }, {
        key: 'cleanPartialFLVInCache',
        value: function () {
            var _ref49 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(index) {
                var name;
                return regeneratorRuntime.wrap(function _callee36$(_context36) {
                    while (1) {
                        switch (_context36.prev = _context36.next) {
                            case 0:
                                if (this.cache) {
                                    _context36.next = 2;
                                    break;
                                }

                                return _context36.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context36.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];

                                name = 'PC_' + name;
                                return _context36.abrupt('return', this.cache.deleteData(name));

                            case 7:
                            case 'end':
                                return _context36.stop();
                        }
                    }
                }, _callee36, this);
            }));

            function cleanPartialFLVInCache(_x52) {
                return _ref49.apply(this, arguments);
            }

            return cleanPartialFLVInCache;
        }()
    }, {
        key: 'getFLV',
        value: function () {
            var _ref50 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38(index, progressHandler) {
                var _this17 = this;

                return regeneratorRuntime.wrap(function _callee38$(_context38) {
                    while (1) {
                        switch (_context38.prev = _context38.next) {
                            case 0:
                                if (!this.flvsBlob[index]) {
                                    _context38.next = 2;
                                    break;
                                }

                                return _context38.abrupt('return', this.flvsBlob[index]);

                            case 2:
                                if (this.flvs) {
                                    _context38.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                this.flvsBlob[index] = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37() {
                                    var cache, partialFLVFromCache, burl, opt, fch, fullFLV;
                                    return regeneratorRuntime.wrap(function _callee37$(_context37) {
                                        while (1) {
                                            switch (_context37.prev = _context37.next) {
                                                case 0:
                                                    _context37.next = 2;
                                                    return _this17.loadFLVFromCache(index);

                                                case 2:
                                                    cache = _context37.sent;

                                                    if (!cache) {
                                                        _context37.next = 5;
                                                        break;
                                                    }

                                                    return _context37.abrupt('return', _this17.flvsBlob[index] = cache);

                                                case 5:
                                                    _context37.next = 7;
                                                    return _this17.loadPartialFLVFromCache(index);

                                                case 7:
                                                    partialFLVFromCache = _context37.sent;
                                                    burl = _this17.flvs[index];

                                                    if (partialFLVFromCache) burl += '&bstart=' + partialFLVFromCache.size;
                                                    opt = {
                                                        fetch: _this17.playerWin.fetch,
                                                        method: 'GET',
                                                        mode: 'cors',
                                                        cache: 'default',
                                                        referrerPolicy: 'no-referrer-when-downgrade',
                                                        cacheLoaded: partialFLVFromCache ? partialFLVFromCache.size : 0,
                                                        headers: partialFLVFromCache && !burl.includes('wsTime') ? { Range: 'bytes=' + partialFLVFromCache.size + '-' } : undefined
                                                    };

                                                    opt.onprogress = progressHandler;
                                                    opt.onerror = opt.onabort = function (_ref52) {
                                                        var target = _ref52.target,
                                                            type = _ref52.type;

                                                        var partialFLV = target.getPartialBlob();
                                                        if (partialFLVFromCache) partialFLV = new Blob([partialFLVFromCache, partialFLV]);
                                                        _this17.savePartialFLVToCache(index, partialFLV);
                                                    };

                                                    fch = new DetailedFetchBlob(burl, opt);

                                                    _this17.flvsDetailedFetch[index] = fch;
                                                    _context37.next = 17;
                                                    return fch.getBlob();

                                                case 17:
                                                    fullFLV = _context37.sent;

                                                    _this17.flvsDetailedFetch[index] = undefined;
                                                    if (partialFLVFromCache) {
                                                        fullFLV = new Blob([partialFLVFromCache, fullFLV]);
                                                        _this17.cleanPartialFLVInCache(index);
                                                    }
                                                    _this17.saveFLVToCache(index, fullFLV);
                                                    return _context37.abrupt('return', _this17.flvsBlob[index] = fullFLV);

                                                case 22:
                                                case 'end':
                                                    return _context37.stop();
                                            }
                                        }
                                    }, _callee37, _this17);
                                }))();
                                return _context38.abrupt('return', this.flvsBlob[index]);

                            case 6:
                            case 'end':
                                return _context38.stop();
                        }
                    }
                }, _callee38, this);
            }));

            function getFLV(_x53, _x54) {
                return _ref50.apply(this, arguments);
            }

            return getFLV;
        }()
    }, {
        key: 'abortFLV',
        value: function () {
            var _ref53 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(index) {
                return regeneratorRuntime.wrap(function _callee39$(_context39) {
                    while (1) {
                        switch (_context39.prev = _context39.next) {
                            case 0:
                                if (!this.flvsDetailedFetch[index]) {
                                    _context39.next = 2;
                                    break;
                                }

                                return _context39.abrupt('return', this.flvsDetailedFetch[index].abort());

                            case 2:
                            case 'end':
                                return _context39.stop();
                        }
                    }
                }, _callee39, this);
            }));

            function abortFLV(_x55) {
                return _ref53.apply(this, arguments);
            }

            return abortFLV;
        }()
    }, {
        key: 'getAllFLVs',
        value: function () {
            var _ref54 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40(progressHandler) {
                var promises, i;
                return regeneratorRuntime.wrap(function _callee40$(_context40) {
                    while (1) {
                        switch (_context40.prev = _context40.next) {
                            case 0:
                                if (this.flvs) {
                                    _context40.next = 2;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 2:
                                promises = [];

                                for (i = 0; i < this.flvs.length; i++) {
                                    promises.push(this.getFLV(i, progressHandler));
                                }return _context40.abrupt('return', Promise.all(promises));

                            case 5:
                            case 'end':
                                return _context40.stop();
                        }
                    }
                }, _callee40, this);
            }));

            function getAllFLVs(_x56) {
                return _ref54.apply(this, arguments);
            }

            return getAllFLVs;
        }()
    }, {
        key: 'cleanAllFLVsInCache',
        value: function () {
            var _ref55 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41() {
                var ret, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, flv, name;

                return regeneratorRuntime.wrap(function _callee41$(_context41) {
                    while (1) {
                        switch (_context41.prev = _context41.next) {
                            case 0:
                                if (this.cache) {
                                    _context41.next = 2;
                                    break;
                                }

                                return _context41.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context41.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                ret = [];
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context41.prev = 8;
                                _iterator2 = this.flvs[Symbol.iterator]();

                            case 10:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context41.next = 26;
                                    break;
                                }

                                flv = _step2.value;
                                name = flv.match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];
                                _context41.t0 = ret;
                                _context41.next = 16;
                                return this.cache.deleteData(name);

                            case 16:
                                _context41.t1 = _context41.sent;

                                _context41.t0.push.call(_context41.t0, _context41.t1);

                                _context41.t2 = ret;
                                _context41.next = 21;
                                return this.cache.deleteData('PC_' + name);

                            case 21:
                                _context41.t3 = _context41.sent;

                                _context41.t2.push.call(_context41.t2, _context41.t3);

                            case 23:
                                _iteratorNormalCompletion2 = true;
                                _context41.next = 10;
                                break;

                            case 26:
                                _context41.next = 32;
                                break;

                            case 28:
                                _context41.prev = 28;
                                _context41.t4 = _context41['catch'](8);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context41.t4;

                            case 32:
                                _context41.prev = 32;
                                _context41.prev = 33;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 35:
                                _context41.prev = 35;

                                if (!_didIteratorError2) {
                                    _context41.next = 38;
                                    break;
                                }

                                throw _iteratorError2;

                            case 38:
                                return _context41.finish(35);

                            case 39:
                                return _context41.finish(32);

                            case 40:
                                return _context41.abrupt('return', ret);

                            case 41:
                            case 'end':
                                return _context41.stop();
                        }
                    }
                }, _callee41, this, [[8, 28, 32, 40], [33,, 35, 39]]);
            }));

            function cleanAllFLVsInCache() {
                return _ref55.apply(this, arguments);
            }

            return cleanAllFLVsInCache;
        }()
    }, {
        key: 'setupProxy',
        value: function () {
            var _ref56 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42(res, onsuccess) {
                var _this18 = this;

                var _fetch, resProxy, i;

                return regeneratorRuntime.wrap(function _callee42$(_context42) {
                    while (1) {
                        switch (_context42.prev = _context42.next) {
                            case 0:
                                if (!this.setupProxy._fetch) {
                                    _fetch = this.setupProxy._fetch = this.playerWin.fetch;

                                    this.playerWin.fetch = function (input, init) {
                                        if (!input.slice || input.slice(0, 5) != 'blob:') {
                                            return _fetch(input, init);
                                        }
                                        var bstart = input.indexOf('?bstart=');
                                        if (bstart < 0) {
                                            return _fetch(input, init);
                                        }
                                        if (!init.headers instanceof Headers) init.headers = new Headers(init.headers || {});
                                        init.headers.set('Range', 'bytes=' + input.slice(bstart + 8) + '-');
                                        return _fetch(input.slice(0, bstart), init);
                                    };
                                    this.destroy.addCallback(function () {
                                        return _this18.playerWin.fetch = _fetch;
                                    });
                                }

                                _context42.next = 3;
                                return this.loadAllFLVFromCache();

                            case 3:
                                resProxy = Object.assign({}, res);

                                for (i = 0; i < this.flvsBlob.length; i++) {
                                    if (this.flvsBlob[i]) resProxy.durl[i].url = this.playerWin.URL.createObjectURL(this.flvsBlob[i]);
                                }
                                return _context42.abrupt('return', onsuccess(resProxy));

                            case 6:
                            case 'end':
                                return _context42.stop();
                        }
                    }
                }, _callee42, this);
            }));

            function setupProxy(_x57, _x58) {
                return _ref56.apply(this, arguments);
            }

            return setupProxy;
        }()
    }], [{
        key: 'fetchDanmaku',
        value: function () {
            var _ref57 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43(cid) {
                return regeneratorRuntime.wrap(function _callee43$(_context43) {
                    while (1) {
                        switch (_context43.prev = _context43.next) {
                            case 0:
                                _context43.t0 = ASSConverter;
                                _context43.next = 3;
                                return new Promise(function (resolve, reject) {
                                    var e = new XMLHttpRequest();
                                    e.onload = function () {
                                        return resolve(e.responseText);
                                    };
                                    e.onerror = reject;
                                    // fix CORS issue
                                    e.open('get', 'https://cors.xmader.com/?url=' + encodeURIComponent('https://comment.bilibili.com/' + cid + '.xml'));
                                    e.send();
                                });

                            case 3:
                                _context43.t1 = _context43.sent;
                                return _context43.abrupt('return', _context43.t0.parseXML.call(_context43.t0, _context43.t1));

                            case 5:
                            case 'end':
                                return _context43.stop();
                        }
                    }
                }, _callee43, this);
            }));

            function fetchDanmaku(_x59) {
                return _ref57.apply(this, arguments);
            }

            return fetchDanmaku;
        }()
    }, {
        key: 'getAllPageDefaultFormats',
        value: function () {
            var _ref58 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee46() {
                var _this19 = this;

                var playerWin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : top;
                var monkey = arguments[1];

                var getPartsList, list, queryInfoMutex, _getDataList, initialDataSize, retPromises, ret;

                return regeneratorRuntime.wrap(function _callee46$(_context46) {
                    while (1) {
                        switch (_context46.prev = _context46.next) {
                            case 0:
                                /** @returns {Promise<{cid: number; page: number; part?: string; }[]>} */
                                getPartsList = function () {
                                    var _ref59 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44() {
                                        var r, json;
                                        return regeneratorRuntime.wrap(function _callee44$(_context44) {
                                            while (1) {
                                                switch (_context44.prev = _context44.next) {
                                                    case 0:
                                                        _context44.next = 2;
                                                        return fetch('https://api.bilibili.com/x/player/pagelist?aid=' + aid);

                                                    case 2:
                                                        r = _context44.sent;
                                                        _context44.next = 5;
                                                        return r.json();

                                                    case 5:
                                                        json = _context44.sent;
                                                        return _context44.abrupt('return', json.data);

                                                    case 7:
                                                    case 'end':
                                                        return _context44.stop();
                                                }
                                            }
                                        }, _callee44, _this19);
                                    }));

                                    return function getPartsList() {
                                        return _ref59.apply(this, arguments);
                                    };
                                }();

                                _context46.next = 3;
                                return getPartsList();

                            case 3:
                                list = _context46.sent;
                                queryInfoMutex = new Mutex();

                                _getDataList = function _getDataList() {
                                    var _zc = playerWin.Gc || playerWin.zc || Object.values(playerWin).filter(function (x) {
                                        return typeof x == "string" && x.includes("[Info]");
                                    })[0];
                                    return _zc.split("\n").filter(function (x) {
                                        return x.startsWith("{");
                                    });
                                };

                                // from the first page


                                playerWin.player.next(1);
                                initialDataSize = new Set(_getDataList()).size;
                                retPromises = list.map(function (x, n) {
                                    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45() {
                                        var cid, danmuku, isBangumi, apiPath, qn, api_url, r, apiJson, res, data, _data_X;

                                        return regeneratorRuntime.wrap(function _callee45$(_context45) {
                                            while (1) {
                                                switch (_context45.prev = _context45.next) {
                                                    case 0:
                                                        _context45.next = 2;
                                                        return queryInfoMutex.lock();

                                                    case 2:
                                                        cid = x.cid;
                                                        _context45.t0 = new ASSConverter();
                                                        _context45.next = 6;
                                                        return BiliMonkey.fetchDanmaku(cid);

                                                    case 6:
                                                        _context45.t1 = _context45.sent;
                                                        _context45.t2 = top.document.title;
                                                        _context45.t3 = top.location.href;
                                                        _context45.next = 11;
                                                        return _context45.t0.genASSBlob.call(_context45.t0, _context45.t1, _context45.t2, _context45.t3);

                                                    case 11:
                                                        danmuku = _context45.sent;
                                                        isBangumi = location.pathname.includes("bangumi") || location.hostname.includes("bangumi");
                                                        apiPath = isBangumi ? "/pgc/player/web/playurl" : "/x/player/playurl";
                                                        qn = monkey.option.enableVideoMaxResolution && monkey.option.videoMaxResolution || "120";
                                                        api_url = 'https://api.bilibili.com' + apiPath + '?avid=' + aid + '&cid=' + cid + '&otype=json&fourk=1&qn=' + qn;
                                                        _context45.next = 18;
                                                        return fetch(api_url, { credentials: 'include' });

                                                    case 18:
                                                        r = _context45.sent;
                                                        _context45.next = 21;
                                                        return r.json();

                                                    case 21:
                                                        apiJson = _context45.sent;
                                                        res = apiJson.data || apiJson.result;

                                                        if (res.durl) {
                                                            _context45.next = 29;
                                                            break;
                                                        }

                                                        _context45.next = 26;
                                                        return new Promise(function (resolve) {
                                                            var i = setInterval(function () {
                                                                var dataSize = new Set(_getDataList()).size;

                                                                if (list.length == 1 || dataSize == n + initialDataSize + 1) {
                                                                    clearInterval(i);
                                                                    resolve();
                                                                }
                                                            }, 100);
                                                        });

                                                    case 26:
                                                        data = JSON.parse(_getDataList().pop());
                                                        _data_X = data.Y || data.X || Object.values(data).filter(function (x) {
                                                            return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) == "object" && Object.prototype.toString.call(x) == "[object Object]";
                                                        })[0];


                                                        res.durl = _data_X.segments || [_data_X];

                                                    case 29:

                                                        queryInfoMutex.unlock();
                                                        playerWin.player.next();

                                                        return _context45.abrupt('return', {
                                                            durl: res.durl.map(function (_ref61) {
                                                                var url = _ref61.url;
                                                                return url.replace('http:', playerWin.location.protocol);
                                                            }),
                                                            danmuku: danmuku,
                                                            name: x.part || x.index || playerWin.document.title.replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", ""),
                                                            outputName: res.durl[0].url.match(/\d+-\d+(?:\d|-|hd)*(?=\.flv)/) ?
                                                            /***
                                                             * see #28
                                                             * Firefox lookbehind assertion not implemented https://bugzilla.mozilla.org/show_bug.cgi?id=1225665
                                                             * try replace /-\d+(?=(?:\d|-|hd)*\.flv)/ => /(?<=\d+)-\d+(?=(?:\d|-|hd)*\.flv)/ in the future
                                                             */
                                                            res.durl[0].url.match(/\d+-\d+(?:\d|-|hd)*(?=\.flv)/)[0].replace(/-\d+(?=(?:\d|-|hd)*\.flv)/, '') : res.durl[0].url.match(/\d(?:\d|-|hd)*(?=\.mp4)/) ? res.durl[0].url.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0] : cid,
                                                            cid: cid,
                                                            res: res
                                                        });

                                                    case 32:
                                                    case 'end':
                                                        return _context45.stop();
                                                }
                                            }
                                        }, _callee45, _this19);
                                    }))();
                                });
                                _context46.next = 11;
                                return Promise.all(retPromises);

                            case 11:
                                ret = _context46.sent;
                                return _context46.abrupt('return', ret);

                            case 13:
                            case 'end':
                                return _context46.stop();
                        }
                    }
                }, _callee46, this);
            }));

            function getAllPageDefaultFormats() {
                return _ref58.apply(this, arguments);
            }

            return getAllPageDefaultFormats;
        }()
    }, {
        key: 'getBiliShortVideoInfo',
        value: function () {
            var _ref62 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee47() {
                var video_id, api_url, req, data, _data$item, video_playurl, cover_img;

                return regeneratorRuntime.wrap(function _callee47$(_context47) {
                    while (1) {
                        switch (_context47.prev = _context47.next) {
                            case 0:
                                video_id = location.pathname.match(/\/video\/(\d+)/)[1];
                                api_url = 'https://api.vc.bilibili.com/clip/v1/video/detail?video_id=' + video_id + '&need_playurl=1';
                                _context47.next = 4;
                                return fetch(api_url, { credentials: 'include' });

                            case 4:
                                req = _context47.sent;
                                _context47.next = 7;
                                return req.json();

                            case 7:
                                data = _context47.sent.data;
                                _data$item = data.item, video_playurl = _data$item.video_playurl, cover_img = _data$item.first_pic;
                                return _context47.abrupt('return', { video_playurl: video_playurl.replace("http://", "https://"), cover_img: cover_img });

                            case 10:
                            case 'end':
                                return _context47.stop();
                        }
                    }
                }, _callee47, this);
            }));

            function getBiliShortVideoInfo() {
                return _ref62.apply(this, arguments);
            }

            return getBiliShortVideoInfo;
        }()
    }, {
        key: 'formatToValue',
        value: function formatToValue(format) {
            var _BiliMonkey$formatToV;

            if (format == 'does_not_exist') throw 'formatToValue: cannot lookup does_not_exist';
            if (typeof BiliMonkey.formatToValue.dict == 'undefined') BiliMonkey.formatToValue.dict = (_BiliMonkey$formatToV = {
                'hdflv2': '120',
                'flv_p60': '116',
                'flv720_p60': '74',
                'flv': '80',
                'flv720': '64',
                'flv480': '32',
                'flv360': '15'

            }, _defineProperty(_BiliMonkey$formatToV, 'hdflv2', '112'), _defineProperty(_BiliMonkey$formatToV, 'hdmp4', '64'), _defineProperty(_BiliMonkey$formatToV, 'mp4', '16'), _BiliMonkey$formatToV);
            return BiliMonkey.formatToValue.dict[format] || null;
        }
    }, {
        key: 'valueToFormat',
        value: function valueToFormat(value) {
            if (typeof BiliMonkey.valueToFormat.dict == 'undefined') BiliMonkey.valueToFormat.dict = {
                '120': 'hdflv2',
                '116': 'flv_p60',
                '74': 'flv720_p60',
                '80': 'flv',
                '64': 'flv720',
                '32': 'flv480',
                '15': 'flv360',

                // legacy - late 2017
                '112': 'hdflv2',
                '48': 'hdmp4',
                '16': 'mp4',

                // legacy - early 2017
                '3': 'flv',
                '2': 'hdmp4',
                '1': 'mp4'
            };
            return BiliMonkey.valueToFormat.dict[value] || null;
        }
    }, {
        key: '_UNIT_TEST',
        value: function _UNIT_TEST() {
            var _this20 = this;

            return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee48() {
                var playerWin;
                return regeneratorRuntime.wrap(function _callee48$(_context48) {
                    while (1) {
                        switch (_context48.prev = _context48.next) {
                            case 0:
                                _context48.next = 2;
                                return BiliUserJS.getPlayerWin();

                            case 2:
                                playerWin = _context48.sent;

                                window.m = new BiliMonkey(playerWin);

                                console.warn('data race test');
                                m.queryInfo('video');
                                console.log(m.queryInfo('video'));

                                //location.reload();

                            case 7:
                            case 'end':
                                return _context48.stop();
                        }
                    }
                }, _callee48, _this20);
            }))();
        }
    }, {
        key: 'optionDescriptions',
        get: function get() {
            return [
            // 1. cache
            ['cache', '关标签页不清缓存：保留完全下载好的分段到缓存，忘记另存为也没关系。'], ['partial', '断点续传：点击“取消”保留部分下载的分段到缓存，忘记点击会弹窗确认。'], ['proxy', '用缓存加速播放器：如果缓存里有完全下载好的分段，直接喂给网页播放器，不重新访问网络。小水管利器，播放只需500k流量。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。'],

            // 2. customizing
            ['blocker', '弹幕过滤：在网页播放器里设置的屏蔽词也对下载的弹幕生效。'], ['font', '自定义字体：在网页播放器里设置的字体、大小、加粗、透明度也对下载的弹幕生效。'], ['resolution', '(测)自定义弹幕画布分辨率：仅对下载的弹幕生效。(默认值: 560 x 420)']];
        }
    }, {
        key: 'resolutionPreferenceOptions',
        get: function get() {
            return [['超清 4K (大会员)', '120'], ['高清 1080P60 (大会员)', '116'], ['高清 1080P+ (大会员)', '112'], ['高清 720P60 (大会员)', '74'], ['高清 1080P', '80'], ['高清 720P', '64'], ['清晰 480P', '32'], ['流畅 360P', '16']];
        }
    }, {
        key: 'optionDefaults',
        get: function get() {
            return {
                // 1. automation
                autoDefault: true,
                autoFLV: false,
                autoMP4: false,

                // 2. cache
                cache: true,
                partial: true,
                proxy: true,

                // 3. customizing
                blocker: true,
                font: true,
                resolution: false,
                resolutionX: 560,
                resolutionY: 420,
                videoMaxResolution: "120",
                enableVideoMaxResolution: false
            };
        }
    }]);

    return BiliMonkey;
}();

/***
 * BiliPolyfill
 * A bilibili user script
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var BiliPolyfill = function () {
    /***
     * Assumption: aid, cid, pageno does not change during lifecycle
     * Create a new BiliPolyfill if assumption breaks
     */
    function BiliPolyfill(playerWin) {
        var _this21 = this;

        var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : BiliPolyfill.optionDefaults;
        var hintInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

        _classCallCheck(this, BiliPolyfill);

        this.playerWin = playerWin;
        this.option = option;
        this.hintInfo = hintInfo;

        this.video = null;

        this.series = [];
        this.userdata = { oped: {}, restore: {} };

        this.destroy = new HookedFunction();
        this.playerWin.addEventListener('beforeunload', this.destroy);
        this.destroy.addCallback(function () {
            return _this21.playerWin.removeEventListener('beforeunload', _this21.destroy);
        });

        this.BiliDanmakuSettings = function () {
            function BiliDanmakuSettings() {
                _classCallCheck(this, BiliDanmakuSettings);
            }

            _createClass(BiliDanmakuSettings, null, [{
                key: 'getPlayerSettings',
                value: function getPlayerSettings() {
                    return playerWin.localStorage.bilibili_player_settings && JSON.parse(playerWin.localStorage.bilibili_player_settings);
                }
            }, {
                key: 'get',
                value: function get(key) {
                    var player_settings = BiliDanmakuSettings.getPlayerSettings();
                    return player_settings.setting_config && player_settings.setting_config[key];
                }
            }, {
                key: 'set',
                value: function set(key, value) {
                    var player_settings = BiliDanmakuSettings.getPlayerSettings();
                    player_settings.setting_config[key] = value;
                    playerWin.localStorage.bilibili_player_settings = JSON.stringify(player_settings);
                }
            }]);

            return BiliDanmakuSettings;
        }();
    }

    _createClass(BiliPolyfill, [{
        key: 'saveUserdata',
        value: function saveUserdata() {
            this.option.setStorage('biliPolyfill', JSON.stringify(this.userdata));
        }
    }, {
        key: 'retrieveUserdata',
        value: function retrieveUserdata() {
            try {
                this.userdata = this.option.getStorage('biliPolyfill');
                if (this.userdata.length > 1073741824) top.alert('BiliPolyfill脚本数据已经快满了，在播放器上右键->BiliPolyfill->片头片尾->检视数据，删掉一些吧。');
                this.userdata = JSON.parse(this.userdata);
            } catch (e) {} finally {
                if (!this.userdata) this.userdata = {};
                if (!(this.userdata.oped instanceof Object)) this.userdata.oped = {};
                if (!(this.userdata.restore instanceof Object)) this.userdata.restore = {};
            }
        }
    }, {
        key: 'setFunctions',
        value: function () {
            var _ref64 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee49() {
                var _this22 = this;

                var _ref65 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    _ref65$videoRefresh = _ref65.videoRefresh,
                    videoRefresh = _ref65$videoRefresh === undefined ? false : _ref65$videoRefresh;

                return regeneratorRuntime.wrap(function _callee49$(_context49) {
                    while (1) {
                        switch (_context49.prev = _context49.next) {
                            case 0:
                                _context49.next = 2;
                                return this.getPlayerVideo();

                            case 2:
                                this.video = _context49.sent;


                                if (!videoRefresh) {
                                    this.retrieveUserdata();
                                }

                                // 2. if not enabled, run the process without real actions

                                if (this.option.betabeta) {
                                    _context49.next = 6;
                                    break;
                                }

                                return _context49.abrupt('return', this.getPlayerMenu());

                            case 6:
                                _context49.prev = 6;

                                if (videoRefresh) {
                                    _context49.next = 28;
                                    break;
                                }

                                if (!this.option.badgeWatchLater) {
                                    _context49.next = 12;
                                    break;
                                }

                                _context49.next = 11;
                                return this.getWatchLaterBtn();

                            case 11:
                                this.badgeWatchLater();

                            case 12:
                                if (this.option.scroll) this.scrollToPlayer();

                                if (this.option.series) this.inferNextInSeries();

                                if (this.option.recommend) this.showRecommendTab();
                                if (this.option.focus) this.focusOnPlayer();
                                if (this.option.restorePrevent) this.restorePreventShade();
                                if (this.option.restoreDanmuku) this.restoreDanmukuSwitch();
                                if (this.option.restoreSpeed) this.restoreSpeed();

                                if (!this.option.restoreWide) {
                                    _context49.next = 23;
                                    break;
                                }

                                _context49.next = 22;
                                return this.getWideScreenBtn();

                            case 22:
                                this.restoreWideScreen();

                            case 23:
                                if (this.option.autoResume) this.autoResume();
                                if (this.option.autoPlay) this.autoPlay();
                                if (this.option.autoFullScreen) this.autoFullScreen();
                                if (this.option.limitedKeydown) this.limitedKeydownFullScreenPlay();
                                this.destroy.addCallback(function () {
                                    return _this22.saveUserdata();
                                });

                            case 28:

                                // 4. set up functions that are binded to the video DOM
                                if (this.option.dblclick) this.dblclickFullScreen();
                                if (this.option.electric) this.reallocateElectricPanel();
                                if (this.option.oped) this.skipOPED();
                                this.video.addEventListener('emptied', function () {
                                    return _this22.setFunctions({ videoRefresh: true });
                                }, { once: true });
                                _context49.next = 37;
                                break;

                            case 34:
                                _context49.prev = 34;
                                _context49.t0 = _context49['catch'](6);

                                console.error(_context49.t0);

                            case 37:
                                _context49.next = 39;
                                return this.getPlayerMenu();

                            case 39:
                                if (this.option.menuFocus) this.menuFocusOnPlayer();

                                // 6. set up experimental functions
                                if (this.option.speech) top.document.body.addEventListener('click', function (e) {
                                    return e.detail > 2 && _this22.speechRecognition();
                                });

                            case 41:
                            case 'end':
                                return _context49.stop();
                        }
                    }
                }, _callee49, this, [[6, 34]]);
            }));

            function setFunctions() {
                return _ref64.apply(this, arguments);
            }

            return setFunctions;
        }()
    }, {
        key: 'inferNextInSeries',
        value: function () {
            var _ref66 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee50() {
                var title, ep, seriesTitle, epNumber, epSibling, keywords, midParent, mid, vlist;
                return regeneratorRuntime.wrap(function _callee50$(_context50) {
                    while (1) {
                        switch (_context50.prev = _context50.next) {
                            case 0:
                                // 1. find current title
                                title = top.document.getElementsByTagName('h1')[0].textContent.replace(/\(\d+\)$/, '').trim();

                                // 2. find current ep number

                                ep = title.match(/\d+(?=[^\d]*$)/);

                                if (ep) {
                                    _context50.next = 4;
                                    break;
                                }

                                return _context50.abrupt('return', this.series = []);

                            case 4:

                                // 3. current title - current ep number => series common title
                                seriesTitle = title.slice(0, title.lastIndexOf(ep)).trim();

                                // 4. find sibling ep number

                                epNumber = parseInt(ep);
                                epSibling = ep[0] == '0' ? [(epNumber - 1).toString().padStart(ep.length, '0'), (epNumber + 1).toString().padStart(ep.length, '0')] : [(epNumber - 1).toString(), (epNumber + 1).toString()];

                                // 5. build search keywords
                                //    [self, seriesTitle + epSibling, epSibling]

                                keywords = [title].concat(_toConsumableArray(epSibling.map(function (e) {
                                    return seriesTitle + e;
                                })), epSibling);

                                // 6. find mid

                                midParent = top.document.querySelector('.u-info > .name') || top.document.getElementById('r-info-rank') || top.document.querySelector('.user');

                                if (midParent) {
                                    _context50.next = 11;
                                    break;
                                }

                                return _context50.abrupt('return', this.series = []);

                            case 11:
                                mid = midParent.children[0].href.match(/\d+/)[0];

                                // 7. fetch query

                                _context50.next = 14;
                                return Promise.all(keywords.map(function (keyword) {
                                    return new Promise(function (resolve, reject) {
                                        var req = new XMLHttpRequest();
                                        req.onload = function () {
                                            return resolve(req.response.status && req.response.data.vlist || []);
                                        };
                                        req.onerror = reject;
                                        req.open('get', 'https://space.bilibili.com/ajax/member/getSubmitVideos?mid=' + mid + '&keyword=' + keyword);
                                        req.responseType = 'json';
                                        req.send();
                                    });
                                }));

                            case 14:
                                vlist = _context50.sent;


                                // 8. verify current video exists
                                vlist[0] = vlist[0].filter(function (e) {
                                    return e.title == title;
                                });

                                if (vlist[0][0]) {
                                    _context50.next = 19;
                                    break;
                                }

                                console && console.warn('BiliPolyfill: inferNextInSeries: cannot find current video in mid space');return _context50.abrupt('return', this.series = []);

                            case 19:

                                // 9. if seriesTitle + epSibling qurey has reasonable results => pick
                                this.series = [vlist[1].find(function (e) {
                                    return e.created < vlist[0][0].created;
                                }), vlist[2].reverse().find(function (e) {
                                    return e.created > vlist[0][0].created;
                                })];

                                // 10. fallback: if epSibling qurey has reasonable results => pick
                                if (!this.series[0]) this.series[0] = vlist[3].find(function (e) {
                                    return e.created < vlist[0][0].created;
                                });
                                if (!this.series[1]) this.series[1] = vlist[4].reverse().find(function (e) {
                                    return e.created > vlist[0][0].created;
                                });

                                return _context50.abrupt('return', this.series);

                            case 23:
                            case 'end':
                                return _context50.stop();
                        }
                    }
                }, _callee50, this);
            }));

            function inferNextInSeries() {
                return _ref66.apply(this, arguments);
            }

            return inferNextInSeries;
        }()
    }, {
        key: 'badgeWatchLater',
        value: function badgeWatchLater() {
            var _this23 = this;

            // 1. find watchlater button
            var li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');
            if (!li) return;

            // 2. initialize watchlater panel
            var observer = new MutationObserver(function () {

                // 3. hide watchlater panel
                observer.disconnect();
                li.children[1].style.visibility = 'hidden';

                // 4. loading => wait
                if (li.children[1].children[0].children[0].className == 'm-w-loading') {
                    var _observer = new MutationObserver(function () {

                        // 5. clean up watchlater panel
                        _observer.disconnect();
                        li.dispatchEvent(new Event('mouseleave'));
                        setTimeout(function () {
                            return li.children[1].style.visibility = '';
                        }, 700);

                        // 6.1 empty list => do nothing
                        if (li.children[1].children[0].children[0].className == 'no-data') return;

                        // 6.2 otherwise => append div
                        var div = top.document.createElement('div');
                        div.className = 'num';
                        if (li.children[1].children[0].children[0].children.length > 5) {
                            div.textContent = '5+';
                        } else {
                            div.textContent = li.children[1].children[0].children[0].children.length;
                        }
                        li.children[0].append(div);
                        _this23.destroy.addCallback(function () {
                            return div.remove();
                        });
                    });
                    _observer.observe(li.children[1].children[0], { childList: true });
                }

                // 4.2 otherwise => error
                else {
                        throw 'badgeWatchLater: cannot find m-w-loading panel';
                    }
            });
            observer.observe(li, { childList: true });
            li.dispatchEvent(new Event('mouseenter'));
        }
    }, {
        key: 'dblclickFullScreen',
        value: function dblclickFullScreen() {
            var _this24 = this;

            this.video.addEventListener('dblclick', function () {
                return _this24.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
            });
        }
    }, {
        key: 'scrollToPlayer',
        value: function scrollToPlayer() {
            if (top.scrollY < 200) top.document.getElementById('bilibili-player').scrollIntoView();
        }
    }, {
        key: 'showRecommendTab',
        value: function showRecommendTab() {
            var h = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-filter-btn-recommend');
            if (h) h.click();
        }
    }, {
        key: 'getCoverImage',
        value: function () {
            var _ref67 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee51() {
                var viewUrl, res, viewJson;
                return regeneratorRuntime.wrap(function _callee51$(_context51) {
                    while (1) {
                        switch (_context51.prev = _context51.next) {
                            case 0:
                                // 番剧用原来的方法只能获取到番剧的封面，改用API可以获取到每集的封面
                                viewUrl = "https://api.bilibili.com/x/web-interface/view?aid=" + aid;
                                _context51.prev = 1;
                                _context51.next = 4;
                                return fetch(viewUrl);

                            case 4:
                                res = _context51.sent;
                                _context51.next = 7;
                                return res.json();

                            case 7:
                                viewJson = _context51.sent;
                                return _context51.abrupt('return', viewJson.data.pic.replace("http://", "https://"));

                            case 11:
                                _context51.prev = 11;
                                _context51.t0 = _context51['catch'](1);
                                return _context51.abrupt('return', null);

                            case 14:
                            case 'end':
                                return _context51.stop();
                        }
                    }
                }, _callee51, this, [[1, 11]]);
            }));

            function getCoverImage() {
                return _ref67.apply(this, arguments);
            }

            return getCoverImage;
        }()
    }, {
        key: 'reallocateElectricPanel',
        value: function reallocateElectricPanel() {
            var _this25 = this;

            // 1. autopart == wait => ok
            if (!this.playerWin.localStorage.bilibili_player_settings) return;
            if (!this.playerWin.localStorage.bilibili_player_settings.includes('"autopart":1') && !this.option.electricSkippable) return;

            // 2. wait for electric panel
            this.video.addEventListener('ended', function () {
                setTimeout(function () {
                    // 3. click skip
                    var electricPanel = _this25.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0];
                    if (!electricPanel) return;
                    electricPanel.children[2].click();

                    // 4. but display a fake electric panel
                    electricPanel.style.display = 'block';
                    electricPanel.style.zIndex = 233;

                    // 5. and perform a fake countdown
                    var countdown = 5;
                    var h = setInterval(function () {
                        // 5.1 yield to next part hint
                        if (_this25.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) electricPanel.style.zIndex = '';

                        // 5.2 countdown > 0 => update textContent
                        if (countdown > 0) {
                            electricPanel.children[2].children[0].textContent = '0' + countdown;
                            countdown--;
                        }

                        // 5.3 countdown == 0 => clean up
                        else {
                                clearInterval(h);
                                electricPanel.remove();
                            }
                    }, 1000);
                }, 0);
            }, { once: true });
        }

        /**
         * As of March 2018:
         * opacity: 
         *   bilibili_player_settings.setting_config.opacity
         *   persist :)
         * preventshade:
         *   bilibili_player_settings.setting_config.preventshade
         *   will be overwritten
         *   bilibili has a broken setting roaming scheme where the preventshade default is always used
         * type_bottom, type_scroll, type_top:
         *   bilibili_player_settings.setting_config.type_(bottom|scroll|top)
         *   sessionStorage ONLY
         *   not sure if it is a feature or a bug
         * danmaku switch:
         *   not stored
         * videospeed:
         *   bilibili_player_settings.video_status.videospeed
         *   sessionStorage ONLY
         *   same as above
         * widescreen:
         *   same as above
         */

    }, {
        key: 'restorePreventShade',
        value: function restorePreventShade() {
            var _this26 = this;

            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.preventShade)) this.userdata.restore.preventShade = [];

            // 2. find corresponding option index
            var index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. MUST initialize setting panel before click
            var danmaku_btn = this.playerWin.document.querySelector('.bilibili-player-video-btn-danmaku, .bilibili-player-video-danmaku-setting');
            if (!danmaku_btn) return;
            danmaku_btn.dispatchEvent(new Event('mouseover'));

            // 4. restore if true
            var input = this.playerWin.document.querySelector(".bilibili-player-video-danmaku-setting-left-preventshade input");
            if (this.userdata.restore.preventShade[index] && !input.checked) {
                input.click();
            }

            // 5. clean up setting panel
            danmaku_btn.dispatchEvent(new Event('mouseout'));

            // 6. memorize option
            this.destroy.addCallback(function () {
                _this26.userdata.restore.preventShade[index] = input.checked;
            });
        }
    }, {
        key: 'restoreDanmukuSwitch',
        value: function restoreDanmukuSwitch() {
            var _this27 = this;

            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.danmukuSwitch)) this.userdata.restore.danmukuSwitch = [];
            if (!Array.isArray(this.userdata.restore.danmukuScrollSwitch)) this.userdata.restore.danmukuScrollSwitch = [];
            if (!Array.isArray(this.userdata.restore.danmukuTopSwitch)) this.userdata.restore.danmukuTopSwitch = [];
            if (!Array.isArray(this.userdata.restore.danmukuBottomSwitch)) this.userdata.restore.danmukuBottomSwitch = [];
            if (!Array.isArray(this.userdata.restore.danmukuColorSwitch)) this.userdata.restore.danmukuColorSwitch = [];
            if (!Array.isArray(this.userdata.restore.danmukuSpecialSwitch)) this.userdata.restore.danmukuSpecialSwitch = [];

            // 2. find corresponding option index
            var index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. MUST initialize setting panel before click
            var danmaku_btn = this.playerWin.document.querySelector('.bilibili-player-video-btn-danmaku, .bilibili-player-video-danmaku-setting');
            if (!danmaku_btn) return;
            danmaku_btn.dispatchEvent(new Event('mouseover'));

            // 4. restore if true
            // 4.1 danmukuSwitch
            var danmukuSwitchInput = this.playerWin.document.querySelector('.bilibili-player-video-danmaku-switch input');
            if (this.userdata.restore.danmukuSwitch[index] && danmukuSwitchInput.checked) {
                danmukuSwitchInput.click();
            }

            // 4.2 danmukuScrollSwitch danmukuTopSwitch danmukuBottomSwitch danmukuColorSwitch danmukuSpecialSwitch

            var _playerWin$document$q = _slicedToArray(this.playerWin.document.querySelector('.bilibili-player-video-danmaku-setting-left-block-content').children, 5),
                danmukuScrollSwitchDiv = _playerWin$document$q[0],
                danmukuTopSwitchDiv = _playerWin$document$q[1],
                danmukuBottomSwitchDiv = _playerWin$document$q[2],
                danmukuColorSwitchDiv = _playerWin$document$q[3],
                danmukuSpecialSwitchDiv = _playerWin$document$q[4];

            if (this.userdata.restore.danmukuScrollSwitch[index] && !danmukuScrollSwitchDiv.classList.contains('disabled')) {
                danmukuScrollSwitchDiv.click();
            }
            if (this.userdata.restore.danmukuTopSwitch[index] && !danmukuTopSwitchDiv.classList.contains('disabled')) {
                danmukuTopSwitchDiv.click();
            }
            if (this.userdata.restore.danmukuBottomSwitch[index] && !danmukuBottomSwitchDiv.classList.contains('disabled')) {
                danmukuBottomSwitchDiv.click();
            }
            if (this.userdata.restore.danmukuColorSwitch[index] && !danmukuColorSwitchDiv.classList.contains('disabled')) {
                danmukuColorSwitchDiv.click();
            }
            if (this.userdata.restore.danmukuSpecialSwitch[index] && !danmukuSpecialSwitchDiv.classList.contains('disabled')) {
                danmukuSpecialSwitchDiv.click();
            }

            // 5. clean up setting panel
            danmaku_btn.dispatchEvent(new Event('mouseout'));

            // 6. memorize final option
            this.destroy.addCallback(function () {
                _this27.userdata.restore.danmukuSwitch[index] = !danmukuSwitchInput.checked;
                _this27.userdata.restore.danmukuScrollSwitch[index] = danmukuScrollSwitchDiv.classList.contains('disabled');
                _this27.userdata.restore.danmukuTopSwitch[index] = danmukuTopSwitchDiv.classList.contains('disabled');
                _this27.userdata.restore.danmukuBottomSwitch[index] = danmukuBottomSwitchDiv.classList.contains('disabled');
                _this27.userdata.restore.danmukuColorSwitch[index] = danmukuColorSwitchDiv.classList.contains('disabled');
                _this27.userdata.restore.danmukuSpecialSwitch[index] = danmukuSpecialSwitchDiv.classList.contains('disabled');
            });
        }
    }, {
        key: 'restoreSpeed',
        value: function restoreSpeed() {
            var _this28 = this;

            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.speed)) this.userdata.restore.speed = [];

            // 2. find corresponding option index
            var index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. restore if different
            if (this.userdata.restore.speed[index] && this.userdata.restore.speed[index] != this.video.playbackRate) {
                this.video.playbackRate = this.userdata.restore.speed[index];
            }

            // 4. memorize option
            this.playerWin.player.addEventListener("video_before_destroy", function () {
                return _this28.saveSpeed();
            });

            var observer = new MutationObserver(function () {
                var changeSpeedBtn = _this28.playerWin.document.querySelectorAll(".bilibili-player-contextmenu-subwrapp")[0];
                if (changeSpeedBtn && !changeSpeedBtn._memorize_speed) {
                    changeSpeedBtn.addEventListener("click", function () {
                        return _this28.saveSpeed();
                    });
                    changeSpeedBtn._memorize_speed = true;
                }
            });
            observer.observe(this.playerWin.document.querySelector("#bilibiliPlayer"), { childList: true, subtree: true });
        }
    }, {
        key: 'saveSpeed',
        value: function saveSpeed() {
            if (this.option.restoreSpeed) {
                // 1. restore option should be an array
                if (!Array.isArray(this.userdata.restore.speed)) this.userdata.restore.speed = [];

                // 2. find corresponding option index
                var index = top.location.href.includes('bangumi') ? 0 : 1;

                // 3. memorize
                this.userdata.restore.speed[index] = this.video.playbackRate;
            }
        }
    }, {
        key: 'restoreWideScreen',
        value: function restoreWideScreen() {
            var _this29 = this;

            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.wideScreen)) this.userdata.restore.wideScreen = [];

            // 2. find corresponding option index
            var index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. restore if different
            var i = this.playerWin.document.querySelector('.bilibili-player-video-btn-widescreen');
            if (this.userdata.restore.wideScreen[index] && !i.classList.contains('closed') && !i.firstElementChild.classList.contains('icon-24wideon')) {
                i.click();
            }

            // 4. memorize option
            this.destroy.addCallback(function () {
                _this29.userdata.restore.wideScreen[index] = i.classList.contains('closed') || i.firstElementChild.classList.contains('icon-24wideon');
            });
        }
    }, {
        key: 'loadOffineSubtitles',
        value: function loadOffineSubtitles() {
            // NO. NOBODY WILL NEED THIS。
            // Hint: https://github.com/jamiees2/ass-to-vtt
            throw 'Not implemented';
        }
    }, {
        key: 'autoResume',
        value: function autoResume() {
            var _this30 = this;

            // 1. wait for canplay => wait for resume popup
            var h = function h() {
                // 2. parse resume popup
                var span = _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
                if (!span) return;

                var _span$textContent$spl = span.textContent.split(':'),
                    _span$textContent$spl2 = _slicedToArray(_span$textContent$spl, 2),
                    min = _span$textContent$spl2[0],
                    sec = _span$textContent$spl2[1];

                if (!min || !sec) return;

                // 3. parse last playback progress
                var time = parseInt(min) * 60 + parseInt(sec);

                // 3.1 still far from end => reasonable to resume => click
                if (time < _this30.video.duration - 10) {
                    // 3.1.1 already playing => no need to pause => simply jump
                    if (!_this30.video.paused || _this30.video.autoplay) {
                        _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                    }

                    // 3.1.2 paused => should remain paused after jump => hook video.play
                    else {
                            var play = _this30.video.play;
                            _this30.video.play = function () {
                                return setTimeout(function () {
                                    _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                                    _this30.video.play = play;
                                }, 0);
                            };
                            _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                        }
                }

                // 3.2 near end => silent popup
                else {
                        _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-close').click();
                        _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom').children[0].style.visibility = 'hidden';
                    }
            };
            this.video.addEventListener('canplay', h, { once: true });
            setTimeout(function () {
                return _this30.video && _this30.video.removeEventListener && _this30.video.removeEventListener('canplay', h);
            }, 3000);
        }
    }, {
        key: 'autoPlay',
        value: function autoPlay() {
            var _this31 = this;

            this.video.autoplay = true;
            setTimeout(function () {
                if (_this31.video.paused) _this31.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
            }, 0);
        }
    }, {
        key: 'autoFullScreen',
        value: function autoFullScreen() {
            if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
            }
        }
    }, {
        key: 'getCollectionId',
        value: function getCollectionId() {
            if (aid) {
                return 'av' + aid;
            }

            return (top.location.pathname.match(/av\d+/) || top.location.hash.match(/av\d+/) || top.document.querySelector('div.bangumi-info a, .media-title').href).toString();
        }
    }, {
        key: 'markOPEDPosition',
        value: function markOPEDPosition(index) {
            var collectionId = this.getCollectionId();
            if (!Array.isArray(this.userdata.oped[collectionId])) this.userdata.oped[collectionId] = [];
            this.userdata.oped[collectionId][index] = this.video.currentTime;
            this.saveUserdata();
        }
    }, {
        key: 'clearOPEDPosition',
        value: function clearOPEDPosition() {
            var collectionId = this.getCollectionId();
            this.userdata.oped[collectionId] = undefined;
        }
    }, {
        key: 'skipOPED',
        value: function skipOPED() {
            var _this32 = this;

            // 1. find corresponding userdata
            var collectionId = this.getCollectionId();
            if (!Array.isArray(this.userdata.oped[collectionId]) || !this.userdata.oped[collectionId].length) return;

            /**
             * structure:
             *   listen for time update -> || <- skip -> || <- remove event listenner
             */

            // 2. | 0 <- opening -> oped[collectionId][1] | <- play --
            if (!this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
                var h = function h() {
                    if (_this32.video.currentTime >= _this32.userdata.oped[collectionId][1] - 1) {
                        _this32.video.removeEventListener('timeupdate', h);
                    } else {
                        _this32.video.currentTime = _this32.userdata.oped[collectionId][1];
                        _this32.hintInfo('BiliPolyfill: 已跳过片头');
                    }
                };
                this.video.addEventListener('timeupdate', h);
            }

            // 3. | <- play -> | oped[collectionId][0] <- opening -> oped[collectionId][1] | <- play --
            if (this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
                var _h = function _h() {
                    if (_this32.video.currentTime >= _this32.userdata.oped[collectionId][1] - 1) {
                        _this32.video.removeEventListener('timeupdate', _h);
                    } else if (_this32.video.currentTime > _this32.userdata.oped[collectionId][0]) {
                        _this32.video.currentTime = _this32.userdata.oped[collectionId][1];
                        _this32.hintInfo('BiliPolyfill: 已跳过片头');
                    }
                };
                this.video.addEventListener('timeupdate', _h);
            }

            // 4. -- play -> | oped[collectionId][2] <- ending -> end |
            if (this.userdata.oped[collectionId][2] && !this.userdata.oped[collectionId][3]) {
                var _h2 = function _h2() {
                    if (_this32.video.currentTime >= _this32.video.duration - 1) {
                        _this32.video.removeEventListener('timeupdate', _h2);
                    } else if (_this32.video.currentTime > _this32.userdata.oped[collectionId][2]) {
                        _this32.video.currentTime = _this32.video.duration;
                        _this32.hintInfo('BiliPolyfill: 已跳过片尾');
                    }
                };
                this.video.addEventListener('timeupdate', _h2);
            }

            // 5.-- play -> | oped[collectionId][2] <- ending -> oped[collectionId][3] | <- play -> end |
            if (this.userdata.oped[collectionId][2] && this.userdata.oped[collectionId][3]) {
                var _h3 = function _h3() {
                    if (_this32.video.currentTime >= _this32.userdata.oped[collectionId][3] - 1) {
                        _this32.video.removeEventListener('timeupdate', _h3);
                    } else if (_this32.video.currentTime > _this32.userdata.oped[collectionId][2]) {
                        _this32.video.currentTime = _this32.userdata.oped[collectionId][3];
                        _this32.hintInfo('BiliPolyfill: 已跳过片尾');
                    }
                };
                this.video.addEventListener('timeupdate', _h3);
            }
        }
    }, {
        key: 'setVideoSpeed',
        value: function setVideoSpeed(speed) {
            if (speed < 0 || speed > 10) return;
            this.video.playbackRate = speed;
            this.saveSpeed();
        }
    }, {
        key: 'focusOnPlayer',
        value: function focusOnPlayer() {
            var player = this.playerWin.document.getElementsByClassName('bilibili-player-video-progress')[0];
            if (player) player.click();
        }
    }, {
        key: 'menuFocusOnPlayer',
        value: function menuFocusOnPlayer() {
            var _this33 = this;

            this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0].addEventListener('click', function () {
                return setTimeout(function () {
                    return _this33.focusOnPlayer();
                }, 0);
            });
        }
    }, {
        key: 'limitedKeydownFullScreenPlay',
        value: function limitedKeydownFullScreenPlay() {
            var _this34 = this;

            // 1. listen for any user guesture
            var h = function h(e) {
                // 2. not real user guesture => do nothing
                if (!e.isTrusted) return;

                // 3. key down is Enter => full screen play
                if (e.key == 'Enter') {
                    // 3.1 full screen
                    if (_this34.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                        _this34.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                    }

                    // 3.2 play
                    if (_this34.video.paused) {
                        if (_this34.video.readyState) {
                            _this34.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        } else {
                            _this34.video.addEventListener('canplay', function () {
                                _this34.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                            }, { once: true });
                        }
                    }
                }

                // 4. clean up listener
                top.document.removeEventListener('keydown', h);
                top.document.removeEventListener('click', h);
            };
            top.document.addEventListener('keydown', h);
            top.document.addEventListener('click', h);
        }
    }, {
        key: 'speechRecognition',
        value: function speechRecognition() {
            var _this35 = this;

            // 1. polyfill
            var SpeechRecognition = top.SpeechRecognition || top.webkitSpeechRecognition;
            var SpeechGrammarList = top.SpeechGrammarList || top.webkitSpeechGrammarList;

            // 2. give hint
            alert('Yahaha! You found me!\nBiliTwin支持的语音命令: 播放 暂停 全屏 关闭 加速 减速 下一集\nChrome may support Cantonese or Hakka as well. See BiliPolyfill::speechRecognition.');
            if (!SpeechRecognition || !SpeechGrammarList) alert('浏览器太旧啦~彩蛋没法运行~');

            // 3. setup recognition
            var player = ['播放', '暂停', '全屏', '关闭', '加速', '减速', '下一集'];
            var grammar = '#JSGF V1.0; grammar player; public <player> = ' + player.join(' | ') + ' ;';
            var recognition = new SpeechRecognition();
            var speechRecognitionList = new SpeechGrammarList();
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;
            // cmn: Mandarin(Putonghua), yue: Cantonese, hak: Hakka
            // See https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
            recognition.lang = 'cmn';
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.start();
            recognition.onresult = function (e) {
                var last = e.results.length - 1;
                var transcript = e.results[last][0].transcript;
                switch (transcript) {
                    case '播放':
                        if (_this35.video.paused) _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        _this35.hintInfo('BiliPolyfill: \u8BED\u97F3:\u64AD\u653E');
                        break;
                    case '暂停':
                        if (!_this35.video.paused) _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        _this35.hintInfo('BiliPolyfill: \u8BED\u97F3:\u6682\u505C');
                        break;
                    case '全屏':
                        _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                        _this35.hintInfo('BiliPolyfill: \u8BED\u97F3:\u5168\u5C4F');
                        break;
                    case '关闭':
                        top.close();
                        break;
                    case '加速':
                        _this35.setVideoSpeed(2);
                        _this35.hintInfo('BiliPolyfill: \u8BED\u97F3:\u52A0\u901F');
                        break;
                    case '减速':
                        _this35.setVideoSpeed(0.5);
                        _this35.hintInfo('BiliPolyfill: \u8BED\u97F3:\u51CF\u901F');
                        break;
                    case '下一集':
                        _this35.video.dispatchEvent(new Event('ended'));
                    default:
                        _this35.hintInfo('BiliPolyfill: \u8BED\u97F3:"' + transcript + '"\uFF1F');
                        break;
                }
                (typeof console === 'undefined' ? 'undefined' : _typeof(console)) == "object" && console.log(e.results);
                (typeof console === 'undefined' ? 'undefined' : _typeof(console)) == "object" && console.log('transcript:' + transcript + ' confidence:' + e.results[0][0].confidence);
            };
        }
    }, {
        key: 'substitudeFullscreenPlayer',
        value: function substitudeFullscreenPlayer(option) {
            // 1. check param
            if (!option) throw 'usage: substitudeFullscreenPlayer({cid, aid[, p][, ...otherOptions]})';
            if (!option.cid) throw 'player init: cid missing';
            if (!option.aid) throw 'player init: aid missing';

            // 2. hook exitFullscreen
            var playerDoc = this.playerWin.document;
            var hook = [playerDoc.webkitExitFullscreen, playerDoc.mozExitFullScreen, playerDoc.msExitFullscreen, playerDoc.exitFullscreen];
            playerDoc.webkitExitFullscreen = playerDoc.mozExitFullScreen = playerDoc.msExitFullscreen = playerDoc.exitFullscreen = function () {};

            // 3. substitude player
            this.playerWin.player.destroy();
            this.playerWin.player = new bilibiliPlayer(option);
            if (option.p) this.playerWin.callAppointPart(option.p);

            // 4. restore exitFullscreen
            playerDoc.webkitExitFullscreen = hook[0];
            playerDoc.mozExitFullScreen = hook[1];
            playerDoc.msExitFullscreen = hook[2];
            playerDoc.exitFullscreen = hook[3];
        }
    }, {
        key: 'getPlayerVideo',
        value: function () {
            var _ref68 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee52() {
                var _this36 = this;

                return regeneratorRuntime.wrap(function _callee52$(_context52) {
                    while (1) {
                        switch (_context52.prev = _context52.next) {
                            case 0:
                                if (!this.playerWin.document.getElementsByTagName('video').length) {
                                    _context52.next = 4;
                                    break;
                                }

                                return _context52.abrupt('return', this.video = this.playerWin.document.getElementsByTagName('video')[0]);

                            case 4:
                                return _context52.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (_this36.playerWin.document.getElementsByTagName('video').length) {
                                            observer.disconnect();
                                            resolve(_this36.video = _this36.playerWin.document.getElementsByTagName('video')[0]);
                                        }
                                    });
                                    observer.observe(_this36.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                }));

                            case 5:
                            case 'end':
                                return _context52.stop();
                        }
                    }
                }, _callee52, this);
            }));

            function getPlayerVideo() {
                return _ref68.apply(this, arguments);
            }

            return getPlayerVideo;
        }()
    }, {
        key: 'getPlayerMenu',
        value: function () {
            var _ref69 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee53() {
                var _this37 = this;

                return regeneratorRuntime.wrap(function _callee53$(_context53) {
                    while (1) {
                        switch (_context53.prev = _context53.next) {
                            case 0:
                                if (!this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                                    _context53.next = 4;
                                    break;
                                }

                                return _context53.abrupt('return', this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);

                            case 4:
                                return _context53.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (_this37.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                                            observer.disconnect();
                                            resolve(_this37.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);
                                        }
                                    });
                                    observer.observe(_this37.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                }));

                            case 5:
                            case 'end':
                                return _context53.stop();
                        }
                    }
                }, _callee53, this);
            }));

            function getPlayerMenu() {
                return _ref69.apply(this, arguments);
            }

            return getPlayerMenu;
        }()
    }, {
        key: 'getWatchLaterBtn',
        value: function () {
            var _ref70 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee54() {
                var _this38 = this;

                var li;
                return regeneratorRuntime.wrap(function _callee54$(_context54) {
                    while (1) {
                        switch (_context54.prev = _context54.next) {
                            case 0:
                                li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');

                                if (document.cookie.includes("DedeUserID")) {
                                    _context54.next = 3;
                                    break;
                                }

                                return _context54.abrupt('return');

                            case 3:
                                if (li) {
                                    _context54.next = 5;
                                    break;
                                }

                                return _context54.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');
                                        if (li) {
                                            observer.disconnect();
                                            resolve(li);
                                        }
                                    });
                                    observer.observe(_this38.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                }));

                            case 5:
                            case 'end':
                                return _context54.stop();
                        }
                    }
                }, _callee54, this);
            }));

            function getWatchLaterBtn() {
                return _ref70.apply(this, arguments);
            }

            return getWatchLaterBtn;
        }()
    }, {
        key: 'getWideScreenBtn',
        value: function () {
            var _ref71 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee55() {
                var _this39 = this;

                var li;
                return regeneratorRuntime.wrap(function _callee55$(_context55) {
                    while (1) {
                        switch (_context55.prev = _context55.next) {
                            case 0:
                                li = top.document.querySelector('.bilibili-player-video-btn-widescreen');

                                if (li) {
                                    _context55.next = 3;
                                    break;
                                }

                                return _context55.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        li = top.document.querySelector('.bilibili-player-video-btn-widescreen');
                                        if (li) {
                                            observer.disconnect();
                                            resolve(li);
                                        }
                                    });
                                    observer.observe(_this39.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                }));

                            case 3:
                            case 'end':
                                return _context55.stop();
                        }
                    }
                }, _callee55, this);
            }));

            function getWideScreenBtn() {
                return _ref71.apply(this, arguments);
            }

            return getWideScreenBtn;
        }()
    }], [{
        key: 'openMinimizedPlayer',
        value: function () {
            var _ref72 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee56() {
                var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { cid: top.cid, aid: top.aid, playerWin: top };
                var miniPlayerWin, res, playerDiv, hook;
                return regeneratorRuntime.wrap(function _callee56$(_context56) {
                    while (1) {
                        switch (_context56.prev = _context56.next) {
                            case 0:
                                if (option) {
                                    _context56.next = 2;
                                    break;
                                }

                                throw 'usage: openMinimizedPlayer({cid[, aid]})';

                            case 2:
                                if (option.cid) {
                                    _context56.next = 4;
                                    break;
                                }

                                throw 'player init: cid missing';

                            case 4:
                                if (!option.aid) option.aid = top.aid;
                                if (!option.playerWin) option.playerWin = top;

                                // 2. open a new window
                                miniPlayerWin = top.open('//www.bilibili.com/blackboard/html5player.html?cid=' + option.cid + '&aid=' + option.aid + '&crossDomain=' + (top.document.domain != 'www.bilibili.com' ? 'true' : ''), undefined, ' ');

                                // 3. bangumi => request referrer must match => hook response of current page

                                _context56.t0 = top.location.href.includes('bangumi');

                                if (!_context56.t0) {
                                    _context56.next = 12;
                                    break;
                                }

                                _context56.next = 11;
                                return new Promise(function (resolve) {
                                    var jq = option.playerWin.jQuery;
                                    var _ajax = jq.ajax;

                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a;a = c;c = undefined;
                                        }if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                            a.success = resolve;
                                            jq.ajax = _ajax;
                                        }
                                        return _ajax.call(jq, a, c);
                                    };
                                    option.playerWin.player.reloadAccess();
                                });

                            case 11:
                                _context56.t0 = _context56.sent;

                            case 12:
                                res = _context56.t0;
                                _context56.next = 15;
                                return new Promise(function (resolve) {
                                    // 4.1 check for every500ms
                                    var i = setInterval(function () {
                                        return miniPlayerWin.document.getElementById('bilibiliPlayer') && resolve();
                                    }, 500);

                                    // 4.2 explict event listener
                                    miniPlayerWin.addEventListener('load', resolve, { once: true });

                                    // 4.3 timeout after 6s
                                    setTimeout(function () {
                                        clearInterval(i);
                                        miniPlayerWin.removeEventListener('load', resolve);
                                        resolve();
                                    }, 6000);
                                });

                            case 15:
                                // 4.4 cannot find bilibiliPlayer => load timeout
                                playerDiv = miniPlayerWin.document.getElementById('bilibiliPlayer');

                                if (playerDiv) {
                                    _context56.next = 19;
                                    break;
                                }

                                console.warn('openMinimizedPlayer: document load timeout');return _context56.abrupt('return');

                            case 19:
                                if (!res) {
                                    _context56.next = 22;
                                    break;
                                }

                                _context56.next = 22;
                                return new Promise(function (resolve) {
                                    var jq = miniPlayerWin.jQuery;
                                    var _ajax = jq.ajax;

                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a;a = c;c = undefined;
                                        }if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                            a.success(res);
                                            jq.ajax = _ajax;
                                            resolve();
                                        } else {
                                            return _ajax.call(jq, a, c);
                                        }
                                    };
                                    miniPlayerWin.player = new miniPlayerWin.bilibiliPlayer({ cid: option.cid, aid: option.aid });
                                    // miniPlayerWin.eval(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
                                    // console.log(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
                                });

                            case 22:
                                _context56.next = 24;
                                return new Promise(function (resolve) {
                                    if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) resolve();else {
                                        var observer = new MutationObserver(function () {
                                            if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) {
                                                observer.disconnect();
                                                resolve();
                                            }
                                        });
                                        observer.observe(playerDiv, { childList: true });
                                    }
                                });

                            case 24:

                                // 7. adopt full screen player style withour really trigger full screen
                                // 7.1 hook requestFullscreen
                                hook = [playerDiv.webkitRequestFullscreen, playerDiv.mozRequestFullScreen, playerDiv.msRequestFullscreen, playerDiv.requestFullscreen];

                                playerDiv.webkitRequestFullscreen = playerDiv.mozRequestFullScreen = playerDiv.msRequestFullscreen = playerDiv.requestFullscreen = function () {};

                                // 7.2 adopt full screen player style
                                if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();

                                // 7.3 restore requestFullscreen
                                playerDiv.webkitRequestFullscreen = hook[0];
                                playerDiv.mozRequestFullScreen = hook[1];
                                playerDiv.msRequestFullscreen = hook[2];
                                playerDiv.requestFullscreen = hook[3];

                            case 31:
                            case 'end':
                                return _context56.stop();
                        }
                    }
                }, _callee56, this);
            }));

            function openMinimizedPlayer() {
                return _ref72.apply(this, arguments);
            }

            return openMinimizedPlayer;
        }()
    }, {
        key: 'biligameInit',
        value: function () {
            var _ref73 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee57() {
                var game_id, api_url, req, data, aid, video_url, tabs, tab;
                return regeneratorRuntime.wrap(function _callee57$(_context57) {
                    while (1) {
                        switch (_context57.prev = _context57.next) {
                            case 0:
                                game_id = location.href.match(/id=(\d+)/)[1];
                                api_url = 'https://line1-h5-pc-api.biligame.com/game/detail/gameinfo?game_base_id=' + game_id;
                                _context57.next = 4;
                                return fetch(api_url, { credentials: 'include' });

                            case 4:
                                req = _context57.sent;
                                _context57.next = 7;
                                return req.json();

                            case 7:
                                data = _context57.sent.data;
                                aid = data.video_url;
                                video_url = 'https://www.bilibili.com/video/av' + aid;
                                tabs = document.querySelector(".tab-head");
                                tab = document.createElement("a");

                                tab.href = video_url;
                                tab.textContent = "查看视频";
                                tab.target = "_blank";
                                tabs.appendChild(tab);

                            case 16:
                            case 'end':
                                return _context57.stop();
                        }
                    }
                }, _callee57, this);
            }));

            function biligameInit() {
                return _ref73.apply(this, arguments);
            }

            return biligameInit;
        }()
    }, {
        key: 'showBangumiCoverImage',
        value: function showBangumiCoverImage() {
            var imgElement = document.querySelector(".media-preview img");
            if (!imgElement) return;

            imgElement.style.cursor = "pointer";

            imgElement.onclick = function () {
                var cover_img = imgElement.src.match(/.+?\.(png|jpg)/)[0];
                top.window.open(cover_img, '_blank');
            };
        }
    }, {
        key: 'secondToReadable',
        value: function secondToReadable(s) {
            if (s > 60) return parseInt(s / 60) + '\u5206' + parseInt(s % 60) + '\u79D2';else return parseInt(s % 60) + '\u79D2';
        }
    }, {
        key: 'clearAllUserdata',
        value: function clearAllUserdata() {
            var playerWin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : top;

            if (playerWin.GM_setValue) return GM_setValue('biliPolyfill', '');
            if (playerWin.GM.setValue) return GM.setValue('biliPolyfill', '');
            playerWin.localStorage.removeItem('biliPolyfill');
        }
    }, {
        key: '_UNIT_TEST',
        value: function _UNIT_TEST() {
            console.warn('This test is impossible.');
            console.warn('You need to close the tab, reopen it, etc.');
            console.warn('Maybe you also want to test between bideo parts, etc.');
            console.warn('I am too lazy to find workarounds.');
        }
    }, {
        key: 'optionDescriptions',
        get: function get() {
            return [['betabeta', '增强组件总开关 <---------更加懒得测试了，反正以后B站也会自己提供这些功能。也许吧。'],

            // 1. user interface
            ['badgeWatchLater', '稍后再看添加数字角标'], ['recommend', '弹幕列表换成相关视频'], ['electric', '整合充电榜与换P倒计时'], ['electricSkippable', '跳过充电榜', 'disabled'],

            // 2. automation
            ['scroll', '自动滚动到播放器'], ['focus', '自动聚焦到播放器(新页面直接按空格会播放而不是向下滚动)'], ['menuFocus', '关闭菜单后聚焦到播放器'], ['restorePrevent', '记住防挡字幕'], ['restoreDanmuku', '记住弹幕开关(顶端/底端/滚动/全部)'], ['restoreSpeed', '记住播放速度'], ['restoreWide', '记住宽屏'], ['autoResume', '自动跳转上次看到'], ['autoPlay', '自动播放(需要在浏览器站点权限设置中允许自动播放)'], ['autoFullScreen', '自动全屏'], ['oped', '标记后自动跳OP/ED'], ['series', '尝试自动找上下集'],

            // 3. interaction
            ['limitedKeydown', '首次回车键可全屏自动播放(需要在脚本加载完毕后使用)'], ['dblclick', '双击全屏'],

            // 4. easter eggs
            ['speech', '(彩蛋)(需墙外)任意三击鼠标左键开启语音识别']];
        }
    }, {
        key: 'optionDefaults',
        get: function get() {
            return {
                betabeta: false,

                // 1. user interface
                badgeWatchLater: true,
                recommend: true,
                electric: true,
                electricSkippable: false,

                // 2. automation
                scroll: true,
                focus: false,
                menuFocus: true,
                restorePrevent: false,
                restoreDanmuku: false,
                restoreSpeed: true,
                restoreWide: true,
                autoResume: true,
                autoPlay: false,
                autoFullScreen: false,
                oped: true,
                series: true,

                // 3. interaction
                limitedKeydown: true,
                dblclick: true,

                // 4. easter eggs
                speech: false
            };
        }
    }]);

    return BiliPolyfill;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var Exporter = function () {
    function Exporter() {
        _classCallCheck(this, Exporter);
    }

    _createClass(Exporter, null, [{
        key: 'exportIDM',
        value: function exportIDM(urls) {
            var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : top.location.origin;

            return urls.map(function (url) {
                return '<\r\n' + url + '\r\nreferer: ' + referrer + '\r\n>\r\n';
            }).join('');
        }
    }, {
        key: 'exportM3U8',
        value: function exportM3U8(urls) {
            var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : top.location.origin;
            var userAgent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : top.navigator.userAgent;

            return '#EXTM3U\n' + urls.map(function (url) {
                return '#EXTVLCOPT:http-referrer=' + referrer + '\n#EXTVLCOPT:http-user-agent=' + userAgent + '\n#EXTINF:-1\n' + url + '\n';
            }).join('');
        }
    }, {
        key: 'exportAria2',
        value: function exportAria2(urls) {
            var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : top.location.origin;

            return urls.map(function (url) {
                return url + '\r\n  referer=' + referrer + '\r\n';
            }).join('');
        }
    }, {
        key: 'sendToAria2RPC',
        value: function () {
            var _ref74 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee58(urls) {
                var _this40 = this;

                var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : top.location.origin;
                var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'http://127.0.0.1:6800/jsonrpc';

                var h, method, _loop, _ret3;

                return regeneratorRuntime.wrap(function _callee58$(_context59) {
                    while (1) {
                        switch (_context59.prev = _context59.next) {
                            case 0:
                                h = 'referer';
                                method = 'POST';
                                _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                                    var token_array, body, res;
                                    return regeneratorRuntime.wrap(function _loop$(_context58) {
                                        while (1) {
                                            switch (_context58.prev = _context58.next) {
                                                case 0:
                                                    token_array = target.match(/\/\/((.+)@)/);
                                                    body = JSON.stringify(urls.map(function (url, id) {
                                                        var params = [[url], _defineProperty({}, h, referrer)];

                                                        if (token_array) {
                                                            params.unshift(token_array[2]);
                                                            target = target.replace(token_array[1], "");
                                                        }

                                                        return {
                                                            id: id,
                                                            jsonrpc: 2,
                                                            method: "aria2.addUri",
                                                            params: params
                                                        };
                                                    }));
                                                    _context58.prev = 2;
                                                    _context58.next = 5;
                                                    return fetch(target, { method: method, body: body });

                                                case 5:
                                                    _context58.next = 7;
                                                    return _context58.sent.json();

                                                case 7:
                                                    res = _context58.sent;

                                                    if (!(res.error || res[0].error)) {
                                                        _context58.next = 12;
                                                        break;
                                                    }

                                                    throw new Error((res.error || res[0].error).message);

                                                case 12:
                                                    return _context58.abrupt('return', {
                                                        v: res
                                                    });

                                                case 13:
                                                    _context58.next = 20;
                                                    break;

                                                case 15:
                                                    _context58.prev = 15;
                                                    _context58.t0 = _context58['catch'](2);

                                                    target = top.prompt('Aria2 connection failed' + (!_context58.t0.message.includes("fetch") ? ': ' + _context58.t0.message + '.\n' : ". ") + 'Please provide a valid server address:', target);

                                                    if (target) {
                                                        _context58.next = 20;
                                                        break;
                                                    }

                                                    return _context58.abrupt('return', {
                                                        v: null
                                                    });

                                                case 20:
                                                case 'end':
                                                    return _context58.stop();
                                            }
                                        }
                                    }, _loop, _this40, [[2, 15]]);
                                });

                            case 3:
                                if (!1) {
                                    _context59.next = 10;
                                    break;
                                }

                                return _context59.delegateYield(_loop(), 't0', 5);

                            case 5:
                                _ret3 = _context59.t0;

                                if (!((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object")) {
                                    _context59.next = 8;
                                    break;
                                }

                                return _context59.abrupt('return', _ret3.v);

                            case 8:
                                _context59.next = 3;
                                break;

                            case 10:
                            case 'end':
                                return _context59.stop();
                        }
                    }
                }, _callee58, this);
            }));

            function sendToAria2RPC(_x72) {
                return _ref74.apply(this, arguments);
            }

            return sendToAria2RPC;
        }()
    }, {
        key: 'copyToClipboard',
        value: function copyToClipboard(text) {
            var textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            textarea.value = text;
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }]);

    return Exporter;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var TwentyFourDataView = function (_extendableBuiltin2) {
    _inherits(TwentyFourDataView, _extendableBuiltin2);

    function TwentyFourDataView() {
        _classCallCheck(this, TwentyFourDataView);

        return _possibleConstructorReturn(this, (TwentyFourDataView.__proto__ || Object.getPrototypeOf(TwentyFourDataView)).apply(this, arguments));
    }

    _createClass(TwentyFourDataView, [{
        key: 'getUint24',
        value: function getUint24(byteOffset, littleEndian) {
            if (littleEndian) throw 'littleEndian int24 not implemented';
            return this.getUint32(byteOffset - 1) & 0x00FFFFFF;
        }
    }, {
        key: 'setUint24',
        value: function setUint24(byteOffset, value, littleEndian) {
            if (littleEndian) throw 'littleEndian int24 not implemented';
            if (value > 0x00FFFFFF) throw 'setUint24: number out of range';
            var msb = value >> 16;
            var lsb = value & 0xFFFF;
            this.setUint8(byteOffset, msb);
            this.setUint16(byteOffset + 1, lsb);
        }
    }, {
        key: 'indexOf',
        value: function indexOf(search) {
            var startOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var endOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.byteLength - search.length + 1;

            // I know it is NAIVE
            if (search.charCodeAt) {
                for (var i = startOffset; i < endOffset; i++) {
                    if (this.getUint8(i) != search.charCodeAt(0)) continue;
                    var found = 1;
                    for (var j = 0; j < search.length; j++) {
                        if (this.getUint8(i + j) != search.charCodeAt(j)) {
                            found = 0;
                            break;
                        }
                    }
                    if (found) return i;
                }
                return -1;
            } else {
                for (var _i = startOffset; _i < endOffset; _i++) {
                    if (this.getUint8(_i) != search[0]) continue;
                    var _found = 1;
                    for (var _j = 0; _j < search.length; _j++) {
                        if (this.getUint8(_i + _j) != search[_j]) {
                            _found = 0;
                            break;
                        }
                    }
                    if (_found) return _i;
                }
                return -1;
            }
        }
    }]);

    return TwentyFourDataView;
}(_extendableBuiltin(DataView));

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var FLVTag = function () {
    function FLVTag(dataView) {
        var currentOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        _classCallCheck(this, FLVTag);

        this.tagHeader = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset, 11);
        this.tagData = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset + 11, this.dataSize);
        this.previousSize = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset + 11 + this.dataSize, 4);
    }

    _createClass(FLVTag, [{
        key: 'stripKeyframesScriptData',
        value: function stripKeyframesScriptData() {
            var hasKeyframes = 'hasKeyframes\x01';
            if (this.tagType != 0x12) throw 'can not strip non-scriptdata\'s keyframes';

            var index = void 0;
            index = this.tagData.indexOf(hasKeyframes);
            if (index != -1) {
                //0x0101 => 0x0100
                this.tagData.setUint8(index + hasKeyframes.length, 0x00);
            }

            // Well, I think it is unnecessary
            /*index = this.tagData.indexOf(keyframes)
            if (index != -1) {
                this.dataSize = index;
                this.tagHeader.setUint24(1, index);
                this.tagData = new TwentyFourDataView(this.tagData.buffer, this.tagData.byteOffset, index);
            }*/
        }
    }, {
        key: 'getDuration',
        value: function getDuration() {
            if (this.tagType != 0x12) throw 'can not find non-scriptdata\'s duration';

            var duration = 'duration\x00';
            var index = this.tagData.indexOf(duration);
            if (index == -1) throw 'can not get flv meta duration';

            index += 9;
            return this.tagData.getFloat64(index);
        }
    }, {
        key: 'getDurationAndView',
        value: function getDurationAndView() {
            if (this.tagType != 0x12) throw 'can not find non-scriptdata\'s duration';

            var duration = 'duration\x00';
            var index = this.tagData.indexOf(duration);
            if (index == -1) throw 'can not get flv meta duration';

            index += 9;
            return {
                duration: this.tagData.getFloat64(index),
                durationDataView: new TwentyFourDataView(this.tagData.buffer, this.tagData.byteOffset + index, 8)
            };
        }
    }, {
        key: 'getCombinedTimestamp',
        value: function getCombinedTimestamp() {
            return this.timestampExtension << 24 | this.timestamp;
        }
    }, {
        key: 'setCombinedTimestamp',
        value: function setCombinedTimestamp(timestamp) {
            if (timestamp < 0) throw 'timestamp < 0';
            this.tagHeader.setUint8(7, timestamp >> 24);
            this.tagHeader.setUint24(4, timestamp & 0x00FFFFFF);
        }
    }, {
        key: 'tagType',
        get: function get() {
            return this.tagHeader.getUint8(0);
        }
    }, {
        key: 'dataSize',
        get: function get() {
            return this.tagHeader.getUint24(1);
        }
    }, {
        key: 'timestamp',
        get: function get() {
            return this.tagHeader.getUint24(4);
        }
    }, {
        key: 'timestampExtension',
        get: function get() {
            return this.tagHeader.getUint8(7);
        }
    }, {
        key: 'streamID',
        get: function get() {
            return this.tagHeader.getUint24(8);
        }
    }]);

    return FLVTag;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * The FLV merge utility is a Javascript translation of 
 * https://github.com/grepmusic/flvmerge
 * by grepmusic
*/

/** 
 * A simple flv parser
*/


var FLV = function () {
    function FLV(dataView) {
        _classCallCheck(this, FLV);

        if (dataView.indexOf('FLV', 0, 1) != 0) throw 'Invalid FLV header';
        this.header = new TwentyFourDataView(dataView.buffer, dataView.byteOffset, 9);
        this.firstPreviousTagSize = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + 9, 4);

        this.tags = [];
        var offset = this.headerLength + 4;
        while (offset < dataView.byteLength) {
            var tag = new FLVTag(dataView, offset);
            // debug for script data tag
            // if (tag.tagType != 0x08 && tag.tagType != 0x09) 
            offset += 11 + tag.dataSize + 4;
            this.tags.push(tag);
        }

        if (offset != dataView.byteLength) throw 'FLV unexpected end of file';
    }

    _createClass(FLV, [{
        key: 'type',
        get: function get() {
            return 'FLV';
        }
    }, {
        key: 'version',
        get: function get() {
            return this.header.getUint8(3);
        }
    }, {
        key: 'typeFlag',
        get: function get() {
            return this.header.getUint8(4);
        }
    }, {
        key: 'headerLength',
        get: function get() {
            return this.header.getUint32(5);
        }
    }], [{
        key: 'merge',
        value: function merge(flvs) {
            if (flvs.length < 1) throw 'Usage: FLV.merge([flvs])';
            var blobParts = [];
            var basetimestamp = [0, 0];
            var lasttimestamp = [0, 0];
            var duration = 0.0;
            var durationDataView = void 0;

            blobParts.push(flvs[0].header);
            blobParts.push(flvs[0].firstPreviousTagSize);

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = flvs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var flv = _step3.value;

                    var bts = duration * 1000;
                    basetimestamp[0] = lasttimestamp[0];
                    basetimestamp[1] = lasttimestamp[1];
                    bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
                    var foundDuration = 0;
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = flv.tags[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var tag = _step4.value;

                            if (tag.tagType == 0x12 && !foundDuration) {
                                duration += tag.getDuration();
                                foundDuration = 1;
                                if (flv == flvs[0]) {
                                    var _tag$getDurationAndVi = tag.getDurationAndView();

                                    duration = _tag$getDurationAndVi.duration;
                                    durationDataView = _tag$getDurationAndVi.durationDataView;

                                    tag.stripKeyframesScriptData();
                                    blobParts.push(tag.tagHeader);
                                    blobParts.push(tag.tagData);
                                    blobParts.push(tag.previousSize);
                                }
                            } else if (tag.tagType == 0x08 || tag.tagType == 0x09) {
                                lasttimestamp[tag.tagType - 0x08] = bts + tag.getCombinedTimestamp();
                                tag.setCombinedTimestamp(lasttimestamp[tag.tagType - 0x08]);
                                blobParts.push(tag.tagHeader);
                                blobParts.push(tag.tagData);
                                blobParts.push(tag.previousSize);
                            }
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            durationDataView.setFloat64(0, duration);

            return new Blob(blobParts);
        }
    }, {
        key: 'mergeBlobs',
        value: function () {
            var _ref76 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee59(blobs) {
                var _this42 = this;

                var ret, basetimestamp, lasttimestamp, duration, durationDataView, _loop2, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, blob;

                return regeneratorRuntime.wrap(function _callee59$(_context61) {
                    while (1) {
                        switch (_context61.prev = _context61.next) {
                            case 0:
                                if (!(blobs.length < 1)) {
                                    _context61.next = 2;
                                    break;
                                }

                                throw 'Usage: FLV.mergeBlobs([blobs])';

                            case 2:
                                ret = [];
                                basetimestamp = [0, 0];
                                lasttimestamp = [0, 0];
                                duration = 0.0;
                                durationDataView = void 0;
                                _loop2 = /*#__PURE__*/regeneratorRuntime.mark(function _loop2(blob) {
                                    var bts, foundDuration, flv, modifiedMediaTags, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, tag, _tag$getDurationAndVi2;

                                    return regeneratorRuntime.wrap(function _loop2$(_context60) {
                                        while (1) {
                                            switch (_context60.prev = _context60.next) {
                                                case 0:
                                                    bts = duration * 1000;

                                                    basetimestamp[0] = lasttimestamp[0];
                                                    basetimestamp[1] = lasttimestamp[1];
                                                    bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
                                                    foundDuration = 0;
                                                    _context60.next = 7;
                                                    return new Promise(function (resolve, reject) {
                                                        var fr = new FileReader();
                                                        fr.onload = function () {
                                                            return resolve(new FLV(new TwentyFourDataView(fr.result)));
                                                        };
                                                        fr.readAsArrayBuffer(blob);
                                                        fr.onerror = reject;
                                                    });

                                                case 7:
                                                    flv = _context60.sent;
                                                    modifiedMediaTags = [];
                                                    _iteratorNormalCompletion6 = true;
                                                    _didIteratorError6 = false;
                                                    _iteratorError6 = undefined;
                                                    _context60.prev = 12;

                                                    for (_iterator6 = flv.tags[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                                        tag = _step6.value;

                                                        if (tag.tagType == 0x12 && !foundDuration) {
                                                            duration += tag.getDuration();
                                                            foundDuration = 1;
                                                            if (blob == blobs[0]) {
                                                                ret.push(flv.header, flv.firstPreviousTagSize);
                                                                _tag$getDurationAndVi2 = tag.getDurationAndView();
                                                                duration = _tag$getDurationAndVi2.duration;
                                                                durationDataView = _tag$getDurationAndVi2.durationDataView;

                                                                tag.stripKeyframesScriptData();
                                                                ret.push(tag.tagHeader);
                                                                ret.push(tag.tagData);
                                                                ret.push(tag.previousSize);
                                                            }
                                                        } else if (tag.tagType == 0x08 || tag.tagType == 0x09) {
                                                            lasttimestamp[tag.tagType - 0x08] = bts + tag.getCombinedTimestamp();
                                                            tag.setCombinedTimestamp(lasttimestamp[tag.tagType - 0x08]);
                                                            modifiedMediaTags.push(tag.tagHeader, tag.tagData, tag.previousSize);
                                                        }
                                                    }
                                                    _context60.next = 20;
                                                    break;

                                                case 16:
                                                    _context60.prev = 16;
                                                    _context60.t0 = _context60['catch'](12);
                                                    _didIteratorError6 = true;
                                                    _iteratorError6 = _context60.t0;

                                                case 20:
                                                    _context60.prev = 20;
                                                    _context60.prev = 21;

                                                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                                        _iterator6.return();
                                                    }

                                                case 23:
                                                    _context60.prev = 23;

                                                    if (!_didIteratorError6) {
                                                        _context60.next = 26;
                                                        break;
                                                    }

                                                    throw _iteratorError6;

                                                case 26:
                                                    return _context60.finish(23);

                                                case 27:
                                                    return _context60.finish(20);

                                                case 28:
                                                    ret.push(new Blob(modifiedMediaTags));

                                                case 29:
                                                case 'end':
                                                    return _context60.stop();
                                            }
                                        }
                                    }, _loop2, _this42, [[12, 16, 20, 28], [21,, 23, 27]]);
                                });
                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context61.prev = 11;
                                _iterator5 = blobs[Symbol.iterator]();

                            case 13:
                                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                                    _context61.next = 19;
                                    break;
                                }

                                blob = _step5.value;
                                return _context61.delegateYield(_loop2(blob), 't0', 16);

                            case 16:
                                _iteratorNormalCompletion5 = true;
                                _context61.next = 13;
                                break;

                            case 19:
                                _context61.next = 25;
                                break;

                            case 21:
                                _context61.prev = 21;
                                _context61.t1 = _context61['catch'](11);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context61.t1;

                            case 25:
                                _context61.prev = 25;
                                _context61.prev = 26;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 28:
                                _context61.prev = 28;

                                if (!_didIteratorError5) {
                                    _context61.next = 31;
                                    break;
                                }

                                throw _iteratorError5;

                            case 31:
                                return _context61.finish(28);

                            case 32:
                                return _context61.finish(25);

                            case 33:
                                durationDataView.setFloat64(0, duration);

                                return _context61.abrupt('return', new Blob(ret));

                            case 35:
                            case 'end':
                                return _context61.stop();
                        }
                    }
                }, _callee59, this, [[11, 21, 25, 33], [26,, 28, 32]]);
            }));

            function mergeBlobs(_x76) {
                return _ref76.apply(this, arguments);
            }

            return mergeBlobs;
        }()
    }]);

    return FLV;
}();

var embeddedHTML = '<html>\n\n<body>\n    <p>\n        \u52A0\u8F7D\u6587\u4EF6\u2026\u2026 loading files...\n        <progress value="0" max="100" id="fileProgress"></progress>\n    </p>\n    <p>\n        \u6784\u5EFAmkv\u2026\u2026 building mkv...\n        <progress value="0" max="100" id="mkvProgress"></progress>\n    </p>\n    <p>\n        <a id="a" download="merged.mkv">merged.mkv</a>\n    </p>\n    <footer>\n        author qli5 &lt;goodlq11[at](163|gmail).com&gt;\n    </footer>\n    <script>\nvar FLVASS2MKV = (function () {\n    \'use strict\';\n\n    /***\n     * Copyright (C) 2018 Qli5. All Rights Reserved.\n     * \n     * @author qli5 <goodlq11[at](163|gmail).com>\n     * \n     * This Source Code Form is subject to the terms of the Mozilla Public\n     * License, v. 2.0. If a copy of the MPL was not distributed with this\n     * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n    */\n\n    const _navigator = typeof navigator === \'object\' && navigator || { userAgent: \'chrome\' };\n\n    /** @type {typeof Blob} */\n    const _Blob = typeof Blob === \'function\' && Blob || class {\n        constructor(array) {\n            return Buffer.concat(array.map(Buffer.from.bind(Buffer)));\n        }\n    };\n\n    const _TextEncoder = typeof TextEncoder === \'function\' && TextEncoder || class {\n        /**\n         * @param {string} chunk \n         * @returns {Uint8Array}\n         */\n        encode(chunk) {\n            return Buffer.from(chunk, \'utf-8\');\n        }\n    };\n\n    const _TextDecoder = typeof TextDecoder === \'function\' && TextDecoder || class extends require(\'string_decoder\').StringDecoder {\n        /**\n         * @param {ArrayBuffer} chunk \n         * @returns {string}\n         */\n        decode(chunk) {\n            return this.end(Buffer.from(chunk));\n        }\n    };\n\n    /***\n     * The FLV demuxer is from flv.js\n     * \n     * Copyright (C) 2016 Bilibili. All Rights Reserved.\n     *\n     * @author zheng qian <xqq@xqq.im>\n     *\n     * Licensed under the Apache License, Version 2.0 (the "License");\n     * you may not use this file except in compliance with the License.\n     * You may obtain a copy of the License at\n     *\n     *     http://www.apache.org/licenses/LICENSE-2.0\n     *\n     * Unless required by applicable law or agreed to in writing, software\n     * distributed under the License is distributed on an "AS IS" BASIS,\n     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n     * See the License for the specific language governing permissions and\n     * limitations under the License.\n     */\n\n    // import FLVDemuxer from \'flv.js/src/demux/flv-demuxer.js\';\n    // ..import Log from \'../utils/logger.js\';\n    const Log = {\n        e: console.error.bind(console),\n        w: console.warn.bind(console),\n        i: console.log.bind(console),\n        v: console.log.bind(console),\n    };\n\n    // ..import AMF from \'./amf-parser.js\';\n    // ....import Log from \'../utils/logger.js\';\n    // ....import decodeUTF8 from \'../utils/utf8-conv.js\';\n    function checkContinuation(uint8array, start, checkLength) {\n        let array = uint8array;\n        if (start + checkLength < array.length) {\n            while (checkLength--) {\n                if ((array[++start] & 0xC0) !== 0x80)\n                    return false;\n            }\n            return true;\n        } else {\n            return false;\n        }\n    }\n\n    function decodeUTF8(uint8array) {\n        let out = [];\n        let input = uint8array;\n        let i = 0;\n        let length = uint8array.length;\n\n        while (i < length) {\n            if (input[i] < 0x80) {\n                out.push(String.fromCharCode(input[i]));\n                ++i;\n                continue;\n            } else if (input[i] < 0xC0) {\n                // fallthrough\n            } else if (input[i] < 0xE0) {\n                if (checkContinuation(input, i, 1)) {\n                    let ucs4 = (input[i] & 0x1F) << 6 | (input[i + 1] & 0x3F);\n                    if (ucs4 >= 0x80) {\n                        out.push(String.fromCharCode(ucs4 & 0xFFFF));\n                        i += 2;\n                        continue;\n                    }\n                }\n            } else if (input[i] < 0xF0) {\n                if (checkContinuation(input, i, 2)) {\n                    let ucs4 = (input[i] & 0xF) << 12 | (input[i + 1] & 0x3F) << 6 | input[i + 2] & 0x3F;\n                    if (ucs4 >= 0x800 && (ucs4 & 0xF800) !== 0xD800) {\n                        out.push(String.fromCharCode(ucs4 & 0xFFFF));\n                        i += 3;\n                        continue;\n                    }\n                }\n            } else if (input[i] < 0xF8) {\n                if (checkContinuation(input, i, 3)) {\n                    let ucs4 = (input[i] & 0x7) << 18 | (input[i + 1] & 0x3F) << 12\n                        | (input[i + 2] & 0x3F) << 6 | (input[i + 3] & 0x3F);\n                    if (ucs4 > 0x10000 && ucs4 < 0x110000) {\n                        ucs4 -= 0x10000;\n                        out.push(String.fromCharCode((ucs4 >>> 10) | 0xD800));\n                        out.push(String.fromCharCode((ucs4 & 0x3FF) | 0xDC00));\n                        i += 4;\n                        continue;\n                    }\n                }\n            }\n            out.push(String.fromCharCode(0xFFFD));\n            ++i;\n        }\n\n        return out.join(\'\');\n    }\n\n    // ....import {IllegalStateException} from \'../utils/exception.js\';\n    class IllegalStateException extends Error { }\n\n    let le = (function () {\n        let buf = new ArrayBuffer(2);\n        (new DataView(buf)).setInt16(0, 256, true);  // little-endian write\n        return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE\n    })();\n\n    class AMF {\n\n        static parseScriptData(arrayBuffer, dataOffset, dataSize) {\n            let data = {};\n\n            try {\n                let name = AMF.parseValue(arrayBuffer, dataOffset, dataSize);\n                let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);\n\n                data[name.data] = value.data;\n            } catch (e) {\n                Log.e(\'AMF\', e.toString());\n            }\n\n            return data;\n        }\n\n        static parseObject(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 3) {\n                throw new IllegalStateException(\'Data not enough when parse ScriptDataObject\');\n            }\n            let name = AMF.parseString(arrayBuffer, dataOffset, dataSize);\n            let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);\n            let isObjectEnd = value.objectEnd;\n\n            return {\n                data: {\n                    name: name.data,\n                    value: value.data\n                },\n                size: name.size + value.size,\n                objectEnd: isObjectEnd\n            };\n        }\n\n        static parseVariable(arrayBuffer, dataOffset, dataSize) {\n            return AMF.parseObject(arrayBuffer, dataOffset, dataSize);\n        }\n\n        static parseString(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 2) {\n                throw new IllegalStateException(\'Data not enough when parse String\');\n            }\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n            let length = v.getUint16(0, !le);\n\n            let str;\n            if (length > 0) {\n                str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 2, length));\n            } else {\n                str = \'\';\n            }\n\n            return {\n                data: str,\n                size: 2 + length\n            };\n        }\n\n        static parseLongString(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 4) {\n                throw new IllegalStateException(\'Data not enough when parse LongString\');\n            }\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n            let length = v.getUint32(0, !le);\n\n            let str;\n            if (length > 0) {\n                str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 4, length));\n            } else {\n                str = \'\';\n            }\n\n            return {\n                data: str,\n                size: 4 + length\n            };\n        }\n\n        static parseDate(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 10) {\n                throw new IllegalStateException(\'Data size invalid when parse Date\');\n            }\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n            let timestamp = v.getFloat64(0, !le);\n            let localTimeOffset = v.getInt16(8, !le);\n            timestamp += localTimeOffset * 60 * 1000;  // get UTC time\n\n            return {\n                data: new Date(timestamp),\n                size: 8 + 2\n            };\n        }\n\n        static parseValue(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 1) {\n                throw new IllegalStateException(\'Data not enough when parse Value\');\n            }\n\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            let offset = 1;\n            let type = v.getUint8(0);\n            let value;\n            let objectEnd = false;\n\n            try {\n                switch (type) {\n                    case 0:  // Number(Double) type\n                        value = v.getFloat64(1, !le);\n                        offset += 8;\n                        break;\n                    case 1: {  // Boolean type\n                        let b = v.getUint8(1);\n                        value = b ? true : false;\n                        offset += 1;\n                        break;\n                    }\n                    case 2: {  // String type\n                        let amfstr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);\n                        value = amfstr.data;\n                        offset += amfstr.size;\n                        break;\n                    }\n                    case 3: { // Object(s) type\n                        value = {};\n                        let terminal = 0;  // workaround for malformed Objects which has missing ScriptDataObjectEnd\n                        if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {\n                            terminal = 3;\n                        }\n                        while (offset < dataSize - 4) {  // 4 === type(UI8) + ScriptDataObjectEnd(UI24)\n                            let amfobj = AMF.parseObject(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);\n                            if (amfobj.objectEnd)\n                                break;\n                            value[amfobj.data.name] = amfobj.data.value;\n                            offset += amfobj.size;\n                        }\n                        if (offset <= dataSize - 3) {\n                            let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;\n                            if (marker === 9) {\n                                offset += 3;\n                            }\n                        }\n                        break;\n                    }\n                    case 8: { // ECMA array type (Mixed array)\n                        value = {};\n                        offset += 4;  // ECMAArrayLength(UI32)\n                        let terminal = 0;  // workaround for malformed MixedArrays which has missing ScriptDataObjectEnd\n                        if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {\n                            terminal = 3;\n                        }\n                        while (offset < dataSize - 8) {  // 8 === type(UI8) + ECMAArrayLength(UI32) + ScriptDataVariableEnd(UI24)\n                            let amfvar = AMF.parseVariable(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);\n                            if (amfvar.objectEnd)\n                                break;\n                            value[amfvar.data.name] = amfvar.data.value;\n                            offset += amfvar.size;\n                        }\n                        if (offset <= dataSize - 3) {\n                            let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;\n                            if (marker === 9) {\n                                offset += 3;\n                            }\n                        }\n                        break;\n                    }\n                    case 9:  // ScriptDataObjectEnd\n                        value = undefined;\n                        offset = 1;\n                        objectEnd = true;\n                        break;\n                    case 10: {  // Strict array type\n                        // ScriptDataValue[n]. NOTE: according to video_file_format_spec_v10_1.pdf\n                        value = [];\n                        let strictArrayLength = v.getUint32(1, !le);\n                        offset += 4;\n                        for (let i = 0; i < strictArrayLength; i++) {\n                            let val = AMF.parseValue(arrayBuffer, dataOffset + offset, dataSize - offset);\n                            value.push(val.data);\n                            offset += val.size;\n                        }\n                        break;\n                    }\n                    case 11: {  // Date type\n                        let date = AMF.parseDate(arrayBuffer, dataOffset + 1, dataSize - 1);\n                        value = date.data;\n                        offset += date.size;\n                        break;\n                    }\n                    case 12: {  // Long string type\n                        let amfLongStr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);\n                        value = amfLongStr.data;\n                        offset += amfLongStr.size;\n                        break;\n                    }\n                    default:\n                        // ignore and skip\n                        offset = dataSize;\n                        Log.w(\'AMF\', \'Unsupported AMF value type \' + type);\n                }\n            } catch (e) {\n                Log.e(\'AMF\', e.toString());\n            }\n\n            return {\n                data: value,\n                size: offset,\n                objectEnd: objectEnd\n            };\n        }\n\n    }\n\n    // ..import SPSParser from \'./sps-parser.js\';\n    // ....import ExpGolomb from \'./exp-golomb.js\';\n    // ......import {IllegalStateException, InvalidArgumentException} from \'../utils/exception.js\';\n    class InvalidArgumentException extends Error { }\n\n    class ExpGolomb {\n\n        constructor(uint8array) {\n            this.TAG = \'ExpGolomb\';\n\n            this._buffer = uint8array;\n            this._buffer_index = 0;\n            this._total_bytes = uint8array.byteLength;\n            this._total_bits = uint8array.byteLength * 8;\n            this._current_word = 0;\n            this._current_word_bits_left = 0;\n        }\n\n        destroy() {\n            this._buffer = null;\n        }\n\n        _fillCurrentWord() {\n            let buffer_bytes_left = this._total_bytes - this._buffer_index;\n            if (buffer_bytes_left <= 0)\n                throw new IllegalStateException(\'ExpGolomb: _fillCurrentWord() but no bytes available\');\n\n            let bytes_read = Math.min(4, buffer_bytes_left);\n            let word = new Uint8Array(4);\n            word.set(this._buffer.subarray(this._buffer_index, this._buffer_index + bytes_read));\n            this._current_word = new DataView(word.buffer).getUint32(0, false);\n\n            this._buffer_index += bytes_read;\n            this._current_word_bits_left = bytes_read * 8;\n        }\n\n        readBits(bits) {\n            if (bits > 32)\n                throw new InvalidArgumentException(\'ExpGolomb: readBits() bits exceeded max 32bits!\');\n\n            if (bits <= this._current_word_bits_left) {\n                let result = this._current_word >>> (32 - bits);\n                this._current_word <<= bits;\n                this._current_word_bits_left -= bits;\n                return result;\n            }\n\n            let result = this._current_word_bits_left ? this._current_word : 0;\n            result = result >>> (32 - this._current_word_bits_left);\n            let bits_need_left = bits - this._current_word_bits_left;\n\n            this._fillCurrentWord();\n            let bits_read_next = Math.min(bits_need_left, this._current_word_bits_left);\n\n            let result2 = this._current_word >>> (32 - bits_read_next);\n            this._current_word <<= bits_read_next;\n            this._current_word_bits_left -= bits_read_next;\n\n            result = (result << bits_read_next) | result2;\n            return result;\n        }\n\n        readBool() {\n            return this.readBits(1) === 1;\n        }\n\n        readByte() {\n            return this.readBits(8);\n        }\n\n        _skipLeadingZero() {\n            let zero_count;\n            for (zero_count = 0; zero_count < this._current_word_bits_left; zero_count++) {\n                if (0 !== (this._current_word & (0x80000000 >>> zero_count))) {\n                    this._current_word <<= zero_count;\n                    this._current_word_bits_left -= zero_count;\n                    return zero_count;\n                }\n            }\n            this._fillCurrentWord();\n            return zero_count + this._skipLeadingZero();\n        }\n\n        readUEG() {  // unsigned exponential golomb\n            let leading_zeros = this._skipLeadingZero();\n            return this.readBits(leading_zeros + 1) - 1;\n        }\n\n        readSEG() {  // signed exponential golomb\n            let value = this.readUEG();\n            if (value & 0x01) {\n                return (value + 1) >>> 1;\n            } else {\n                return -1 * (value >>> 1);\n            }\n        }\n\n    }\n\n    class SPSParser {\n\n        static _ebsp2rbsp(uint8array) {\n            let src = uint8array;\n            let src_length = src.byteLength;\n            let dst = new Uint8Array(src_length);\n            let dst_idx = 0;\n\n            for (let i = 0; i < src_length; i++) {\n                if (i >= 2) {\n                    // Unescape: Skip 0x03 after 00 00\n                    if (src[i] === 0x03 && src[i - 1] === 0x00 && src[i - 2] === 0x00) {\n                        continue;\n                    }\n                }\n                dst[dst_idx] = src[i];\n                dst_idx++;\n            }\n\n            return new Uint8Array(dst.buffer, 0, dst_idx);\n        }\n\n        static parseSPS(uint8array) {\n            let rbsp = SPSParser._ebsp2rbsp(uint8array);\n            let gb = new ExpGolomb(rbsp);\n\n            gb.readByte();\n            let profile_idc = gb.readByte();  // profile_idc\n            gb.readByte();  // constraint_set_flags[5] + reserved_zero[3]\n            let level_idc = gb.readByte();  // level_idc\n            gb.readUEG();  // seq_parameter_set_id\n\n            let profile_string = SPSParser.getProfileString(profile_idc);\n            let level_string = SPSParser.getLevelString(level_idc);\n            let chroma_format_idc = 1;\n            let chroma_format = 420;\n            let chroma_format_table = [0, 420, 422, 444];\n            let bit_depth = 8;\n\n            if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 ||\n                profile_idc === 244 || profile_idc === 44 || profile_idc === 83 ||\n                profile_idc === 86 || profile_idc === 118 || profile_idc === 128 ||\n                profile_idc === 138 || profile_idc === 144) {\n\n                chroma_format_idc = gb.readUEG();\n                if (chroma_format_idc === 3) {\n                    gb.readBits(1);  // separate_colour_plane_flag\n                }\n                if (chroma_format_idc <= 3) {\n                    chroma_format = chroma_format_table[chroma_format_idc];\n                }\n\n                bit_depth = gb.readUEG() + 8;  // bit_depth_luma_minus8\n                gb.readUEG();  // bit_depth_chroma_minus8\n                gb.readBits(1);  // qpprime_y_zero_transform_bypass_flag\n                if (gb.readBool()) {  // seq_scaling_matrix_present_flag\n                    let scaling_list_count = (chroma_format_idc !== 3) ? 8 : 12;\n                    for (let i = 0; i < scaling_list_count; i++) {\n                        if (gb.readBool()) {  // seq_scaling_list_present_flag\n                            if (i < 6) {\n                                SPSParser._skipScalingList(gb, 16);\n                            } else {\n                                SPSParser._skipScalingList(gb, 64);\n                            }\n                        }\n                    }\n                }\n            }\n            gb.readUEG();  // log2_max_frame_num_minus4\n            let pic_order_cnt_type = gb.readUEG();\n            if (pic_order_cnt_type === 0) {\n                gb.readUEG();  // log2_max_pic_order_cnt_lsb_minus_4\n            } else if (pic_order_cnt_type === 1) {\n                gb.readBits(1);  // delta_pic_order_always_zero_flag\n                gb.readSEG();  // offset_for_non_ref_pic\n                gb.readSEG();  // offset_for_top_to_bottom_field\n                let num_ref_frames_in_pic_order_cnt_cycle = gb.readUEG();\n                for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i++) {\n                    gb.readSEG();  // offset_for_ref_frame\n                }\n            }\n            gb.readUEG();  // max_num_ref_frames\n            gb.readBits(1);  // gaps_in_frame_num_value_allowed_flag\n\n            let pic_width_in_mbs_minus1 = gb.readUEG();\n            let pic_height_in_map_units_minus1 = gb.readUEG();\n\n            let frame_mbs_only_flag = gb.readBits(1);\n            if (frame_mbs_only_flag === 0) {\n                gb.readBits(1);  // mb_adaptive_frame_field_flag\n            }\n            gb.readBits(1);  // direct_8x8_inference_flag\n\n            let frame_crop_left_offset = 0;\n            let frame_crop_right_offset = 0;\n            let frame_crop_top_offset = 0;\n            let frame_crop_bottom_offset = 0;\n\n            let frame_cropping_flag = gb.readBool();\n            if (frame_cropping_flag) {\n                frame_crop_left_offset = gb.readUEG();\n                frame_crop_right_offset = gb.readUEG();\n                frame_crop_top_offset = gb.readUEG();\n                frame_crop_bottom_offset = gb.readUEG();\n            }\n\n            let sar_width = 1, sar_height = 1;\n            let fps = 0, fps_fixed = true, fps_num = 0, fps_den = 0;\n\n            let vui_parameters_present_flag = gb.readBool();\n            if (vui_parameters_present_flag) {\n                if (gb.readBool()) {  // aspect_ratio_info_present_flag\n                    let aspect_ratio_idc = gb.readByte();\n                    let sar_w_table = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2];\n                    let sar_h_table = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33, 99, 3, 2, 1];\n\n                    if (aspect_ratio_idc > 0 && aspect_ratio_idc < 16) {\n                        sar_width = sar_w_table[aspect_ratio_idc - 1];\n                        sar_height = sar_h_table[aspect_ratio_idc - 1];\n                    } else if (aspect_ratio_idc === 255) {\n                        sar_width = gb.readByte() << 8 | gb.readByte();\n                        sar_height = gb.readByte() << 8 | gb.readByte();\n                    }\n                }\n\n                if (gb.readBool()) {  // overscan_info_present_flag\n                    gb.readBool();  // overscan_appropriate_flag\n                }\n                if (gb.readBool()) {  // video_signal_type_present_flag\n                    gb.readBits(4);  // video_format & video_full_range_flag\n                    if (gb.readBool()) {  // colour_description_present_flag\n                        gb.readBits(24);  // colour_primaries & transfer_characteristics & matrix_coefficients\n                    }\n                }\n                if (gb.readBool()) {  // chroma_loc_info_present_flag\n                    gb.readUEG();  // chroma_sample_loc_type_top_field\n                    gb.readUEG();  // chroma_sample_loc_type_bottom_field\n                }\n                if (gb.readBool()) {  // timing_info_present_flag\n                    let num_units_in_tick = gb.readBits(32);\n                    let time_scale = gb.readBits(32);\n                    fps_fixed = gb.readBool();  // fixed_frame_rate_flag\n\n                    fps_num = time_scale;\n                    fps_den = num_units_in_tick * 2;\n                    fps = fps_num / fps_den;\n                }\n            }\n\n            let sarScale = 1;\n            if (sar_width !== 1 || sar_height !== 1) {\n                sarScale = sar_width / sar_height;\n            }\n\n            let crop_unit_x = 0, crop_unit_y = 0;\n            if (chroma_format_idc === 0) {\n                crop_unit_x = 1;\n                crop_unit_y = 2 - frame_mbs_only_flag;\n            } else {\n                let sub_wc = (chroma_format_idc === 3) ? 1 : 2;\n                let sub_hc = (chroma_format_idc === 1) ? 2 : 1;\n                crop_unit_x = sub_wc;\n                crop_unit_y = sub_hc * (2 - frame_mbs_only_flag);\n            }\n\n            let codec_width = (pic_width_in_mbs_minus1 + 1) * 16;\n            let codec_height = (2 - frame_mbs_only_flag) * ((pic_height_in_map_units_minus1 + 1) * 16);\n\n            codec_width -= (frame_crop_left_offset + frame_crop_right_offset) * crop_unit_x;\n            codec_height -= (frame_crop_top_offset + frame_crop_bottom_offset) * crop_unit_y;\n\n            let present_width = Math.ceil(codec_width * sarScale);\n\n            gb.destroy();\n            gb = null;\n\n            return {\n                profile_string: profile_string,  // baseline, high, high10, ...\n                level_string: level_string,  // 3, 3.1, 4, 4.1, 5, 5.1, ...\n                bit_depth: bit_depth,  // 8bit, 10bit, ...\n                chroma_format: chroma_format,  // 4:2:0, 4:2:2, ...\n                chroma_format_string: SPSParser.getChromaFormatString(chroma_format),\n\n                frame_rate: {\n                    fixed: fps_fixed,\n                    fps: fps,\n                    fps_den: fps_den,\n                    fps_num: fps_num\n                },\n\n                sar_ratio: {\n                    width: sar_width,\n                    height: sar_height\n                },\n\n                codec_size: {\n                    width: codec_width,\n                    height: codec_height\n                },\n\n                present_size: {\n                    width: present_width,\n                    height: codec_height\n                }\n            };\n        }\n\n        static _skipScalingList(gb, count) {\n            let last_scale = 8, next_scale = 8;\n            let delta_scale = 0;\n            for (let i = 0; i < count; i++) {\n                if (next_scale !== 0) {\n                    delta_scale = gb.readSEG();\n                    next_scale = (last_scale + delta_scale + 256) % 256;\n                }\n                last_scale = (next_scale === 0) ? last_scale : next_scale;\n            }\n        }\n\n        static getProfileString(profile_idc) {\n            switch (profile_idc) {\n                case 66:\n                    return \'Baseline\';\n                case 77:\n                    return \'Main\';\n                case 88:\n                    return \'Extended\';\n                case 100:\n                    return \'High\';\n                case 110:\n                    return \'High10\';\n                case 122:\n                    return \'High422\';\n                case 244:\n                    return \'High444\';\n                default:\n                    return \'Unknown\';\n            }\n        }\n\n        static getLevelString(level_idc) {\n            return (level_idc / 10).toFixed(1);\n        }\n\n        static getChromaFormatString(chroma) {\n            switch (chroma) {\n                case 420:\n                    return \'4:2:0\';\n                case 422:\n                    return \'4:2:2\';\n                case 444:\n                    return \'4:4:4\';\n                default:\n                    return \'Unknown\';\n            }\n        }\n\n    }\n\n    // ..import DemuxErrors from \'./demux-errors.js\';\n    const DemuxErrors = {\n        OK: \'OK\',\n        FORMAT_ERROR: \'FormatError\',\n        FORMAT_UNSUPPORTED: \'FormatUnsupported\',\n        CODEC_UNSUPPORTED: \'CodecUnsupported\'\n    };\n\n    // ..import MediaInfo from \'../core/media-info.js\';\n    class MediaInfo {\n\n        constructor() {\n            this.mimeType = null;\n            this.duration = null;\n\n            this.hasAudio = null;\n            this.hasVideo = null;\n            this.audioCodec = null;\n            this.videoCodec = null;\n            this.audioDataRate = null;\n            this.videoDataRate = null;\n\n            this.audioSampleRate = null;\n            this.audioChannelCount = null;\n\n            this.width = null;\n            this.height = null;\n            this.fps = null;\n            this.profile = null;\n            this.level = null;\n            this.chromaFormat = null;\n            this.sarNum = null;\n            this.sarDen = null;\n\n            this.metadata = null;\n            this.segments = null;  // MediaInfo[]\n            this.segmentCount = null;\n            this.hasKeyframesIndex = null;\n            this.keyframesIndex = null;\n        }\n\n        isComplete() {\n            let audioInfoComplete = (this.hasAudio === false) ||\n                (this.hasAudio === true &&\n                    this.audioCodec != null &&\n                    this.audioSampleRate != null &&\n                    this.audioChannelCount != null);\n\n            let videoInfoComplete = (this.hasVideo === false) ||\n                (this.hasVideo === true &&\n                    this.videoCodec != null &&\n                    this.width != null &&\n                    this.height != null &&\n                    this.fps != null &&\n                    this.profile != null &&\n                    this.level != null &&\n                    this.chromaFormat != null &&\n                    this.sarNum != null &&\n                    this.sarDen != null);\n\n            // keyframesIndex may not be present\n            return this.mimeType != null &&\n                this.duration != null &&\n                this.metadata != null &&\n                this.hasKeyframesIndex != null &&\n                audioInfoComplete &&\n                videoInfoComplete;\n        }\n\n        isSeekable() {\n            return this.hasKeyframesIndex === true;\n        }\n\n        getNearestKeyframe(milliseconds) {\n            if (this.keyframesIndex == null) {\n                return null;\n            }\n\n            let table = this.keyframesIndex;\n            let keyframeIdx = this._search(table.times, milliseconds);\n\n            return {\n                index: keyframeIdx,\n                milliseconds: table.times[keyframeIdx],\n                fileposition: table.filepositions[keyframeIdx]\n            };\n        }\n\n        _search(list, value) {\n            let idx = 0;\n\n            let last = list.length - 1;\n            let mid = 0;\n            let lbound = 0;\n            let ubound = last;\n\n            if (value < list[0]) {\n                idx = 0;\n                lbound = ubound + 1;  // skip search\n            }\n\n            while (lbound <= ubound) {\n                mid = lbound + Math.floor((ubound - lbound) / 2);\n                if (mid === last || (value >= list[mid] && value < list[mid + 1])) {\n                    idx = mid;\n                    break;\n                } else if (list[mid] < value) {\n                    lbound = mid + 1;\n                } else {\n                    ubound = mid - 1;\n                }\n            }\n\n            return idx;\n        }\n\n    }\n\n    function ReadBig32(array, index) {\n        return ((array[index] << 24) |\n            (array[index + 1] << 16) |\n            (array[index + 2] << 8) |\n            (array[index + 3]));\n    }\n\n    class FLVDemuxer {\n\n        /**\n         * Create a new FLV demuxer\n         * @param {Object} probeData\n         * @param {boolean} probeData.match\n         * @param {number} probeData.consumed\n         * @param {number} probeData.dataOffset\n         * @param {boolean} probeData.hasAudioTrack\n         * @param {boolean} probeData.hasVideoTrack\n         */\n        constructor(probeData) {\n            this.TAG = \'FLVDemuxer\';\n\n            this._onError = null;\n            this._onMediaInfo = null;\n            this._onTrackMetadata = null;\n            this._onDataAvailable = null;\n\n            this._dataOffset = probeData.dataOffset;\n            this._firstParse = true;\n            this._dispatch = false;\n\n            this._hasAudio = probeData.hasAudioTrack;\n            this._hasVideo = probeData.hasVideoTrack;\n\n            this._hasAudioFlagOverrided = false;\n            this._hasVideoFlagOverrided = false;\n\n            this._audioInitialMetadataDispatched = false;\n            this._videoInitialMetadataDispatched = false;\n\n            this._mediaInfo = new MediaInfo();\n            this._mediaInfo.hasAudio = this._hasAudio;\n            this._mediaInfo.hasVideo = this._hasVideo;\n            this._metadata = null;\n            this._audioMetadata = null;\n            this._videoMetadata = null;\n\n            this._naluLengthSize = 4;\n            this._timestampBase = 0;  // int32, in milliseconds\n            this._timescale = 1000;\n            this._duration = 0;  // int32, in milliseconds\n            this._durationOverrided = false;\n            this._referenceFrameRate = {\n                fixed: true,\n                fps: 23.976,\n                fps_num: 23976,\n                fps_den: 1000\n            };\n\n            this._flvSoundRateTable = [5500, 11025, 22050, 44100, 48000];\n\n            this._mpegSamplingRates = [\n                96000, 88200, 64000, 48000, 44100, 32000,\n                24000, 22050, 16000, 12000, 11025, 8000, 7350\n            ];\n\n            this._mpegAudioV10SampleRateTable = [44100, 48000, 32000, 0];\n            this._mpegAudioV20SampleRateTable = [22050, 24000, 16000, 0];\n            this._mpegAudioV25SampleRateTable = [11025, 12000, 8000, 0];\n\n            this._mpegAudioL1BitRateTable = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1];\n            this._mpegAudioL2BitRateTable = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1];\n            this._mpegAudioL3BitRateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1];\n\n            this._videoTrack = { type: \'video\', id: 1, sequenceNumber: 0, samples: [], length: 0 };\n            this._audioTrack = { type: \'audio\', id: 2, sequenceNumber: 0, samples: [], length: 0 };\n\n            this._littleEndian = (function () {\n                let buf = new ArrayBuffer(2);\n                (new DataView(buf)).setInt16(0, 256, true);  // little-endian write\n                return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE\n            })();\n        }\n\n        destroy() {\n            this._mediaInfo = null;\n            this._metadata = null;\n            this._audioMetadata = null;\n            this._videoMetadata = null;\n            this._videoTrack = null;\n            this._audioTrack = null;\n\n            this._onError = null;\n            this._onMediaInfo = null;\n            this._onTrackMetadata = null;\n            this._onDataAvailable = null;\n        }\n\n        /**\n         * Probe the flv data\n         * @param {ArrayBuffer} buffer\n         * @returns {Object} - probeData to be feed into constructor\n         */\n        static probe(buffer) {\n            let data = new Uint8Array(buffer);\n            let mismatch = { match: false };\n\n            if (data[0] !== 0x46 || data[1] !== 0x4C || data[2] !== 0x56 || data[3] !== 0x01) {\n                return mismatch;\n            }\n\n            let hasAudio = ((data[4] & 4) >>> 2) !== 0;\n            let hasVideo = (data[4] & 1) !== 0;\n\n            let offset = ReadBig32(data, 5);\n\n            if (offset < 9) {\n                return mismatch;\n            }\n\n            return {\n                match: true,\n                consumed: offset,\n                dataOffset: offset,\n                hasAudioTrack: hasAudio,\n                hasVideoTrack: hasVideo\n            };\n        }\n\n        bindDataSource(loader) {\n            loader.onDataArrival = this.parseChunks.bind(this);\n            return this;\n        }\n\n        // prototype: function(type: string, metadata: any): void\n        get onTrackMetadata() {\n            return this._onTrackMetadata;\n        }\n\n        set onTrackMetadata(callback) {\n            this._onTrackMetadata = callback;\n        }\n\n        // prototype: function(mediaInfo: MediaInfo): void\n        get onMediaInfo() {\n            return this._onMediaInfo;\n        }\n\n        set onMediaInfo(callback) {\n            this._onMediaInfo = callback;\n        }\n\n        // prototype: function(type: number, info: string): void\n        get onError() {\n            return this._onError;\n        }\n\n        set onError(callback) {\n            this._onError = callback;\n        }\n\n        // prototype: function(videoTrack: any, audioTrack: any): void\n        get onDataAvailable() {\n            return this._onDataAvailable;\n        }\n\n        set onDataAvailable(callback) {\n            this._onDataAvailable = callback;\n        }\n\n        // timestamp base for output samples, must be in milliseconds\n        get timestampBase() {\n            return this._timestampBase;\n        }\n\n        set timestampBase(base) {\n            this._timestampBase = base;\n        }\n\n        get overridedDuration() {\n            return this._duration;\n        }\n\n        // Force-override media duration. Must be in milliseconds, int32\n        set overridedDuration(duration) {\n            this._durationOverrided = true;\n            this._duration = duration;\n            this._mediaInfo.duration = duration;\n        }\n\n        // Force-override audio track present flag, boolean\n        set overridedHasAudio(hasAudio) {\n            this._hasAudioFlagOverrided = true;\n            this._hasAudio = hasAudio;\n            this._mediaInfo.hasAudio = hasAudio;\n        }\n\n        // Force-override video track present flag, boolean\n        set overridedHasVideo(hasVideo) {\n            this._hasVideoFlagOverrided = true;\n            this._hasVideo = hasVideo;\n            this._mediaInfo.hasVideo = hasVideo;\n        }\n\n        resetMediaInfo() {\n            this._mediaInfo = new MediaInfo();\n        }\n\n        _isInitialMetadataDispatched() {\n            if (this._hasAudio && this._hasVideo) {  // both audio & video\n                return this._audioInitialMetadataDispatched && this._videoInitialMetadataDispatched;\n            }\n            if (this._hasAudio && !this._hasVideo) {  // audio only\n                return this._audioInitialMetadataDispatched;\n            }\n            if (!this._hasAudio && this._hasVideo) {  // video only\n                return this._videoInitialMetadataDispatched;\n            }\n            return false;\n        }\n\n        // function parseChunks(chunk: ArrayBuffer, byteStart: number): number;\n        parseChunks(chunk, byteStart) {\n            if (!this._onError || !this._onMediaInfo || !this._onTrackMetadata || !this._onDataAvailable) {\n                throw new IllegalStateException(\'Flv: onError & onMediaInfo & onTrackMetadata & onDataAvailable callback must be specified\');\n            }\n\n            // qli5: fix nonzero byteStart\n            let offset = byteStart || 0;\n            let le = this._littleEndian;\n\n            if (byteStart === 0) {  // buffer with FLV header\n                if (chunk.byteLength > 13) {\n                    let probeData = FLVDemuxer.probe(chunk);\n                    offset = probeData.dataOffset;\n                } else {\n                    return 0;\n                }\n            }\n\n            if (this._firstParse) {  // handle PreviousTagSize0 before Tag1\n                this._firstParse = false;\n                if (offset !== this._dataOffset) {\n                    Log.w(this.TAG, \'First time parsing but chunk byteStart invalid!\');\n                }\n\n                let v = new DataView(chunk, offset);\n                let prevTagSize0 = v.getUint32(0, !le);\n                if (prevTagSize0 !== 0) {\n                    Log.w(this.TAG, \'PrevTagSize0 !== 0 !!!\');\n                }\n                offset += 4;\n            }\n\n            while (offset < chunk.byteLength) {\n                this._dispatch = true;\n\n                let v = new DataView(chunk, offset);\n\n                if (offset + 11 + 4 > chunk.byteLength) {\n                    // data not enough for parsing an flv tag\n                    break;\n                }\n\n                let tagType = v.getUint8(0);\n                let dataSize = v.getUint32(0, !le) & 0x00FFFFFF;\n\n                if (offset + 11 + dataSize + 4 > chunk.byteLength) {\n                    // data not enough for parsing actual data body\n                    break;\n                }\n\n                if (tagType !== 8 && tagType !== 9 && tagType !== 18) {\n                    Log.w(this.TAG, `Unsupported tag type ${tagType}, skipped`);\n                    // consume the whole tag (skip it)\n                    offset += 11 + dataSize + 4;\n                    continue;\n                }\n\n                let ts2 = v.getUint8(4);\n                let ts1 = v.getUint8(5);\n                let ts0 = v.getUint8(6);\n                let ts3 = v.getUint8(7);\n\n                let timestamp = ts0 | (ts1 << 8) | (ts2 << 16) | (ts3 << 24);\n\n                let streamId = v.getUint32(7, !le) & 0x00FFFFFF;\n                if (streamId !== 0) {\n                    Log.w(this.TAG, \'Meet tag which has StreamID != 0!\');\n                }\n\n                let dataOffset = offset + 11;\n\n                switch (tagType) {\n                    case 8:  // Audio\n                        this._parseAudioData(chunk, dataOffset, dataSize, timestamp);\n                        break;\n                    case 9:  // Video\n                        this._parseVideoData(chunk, dataOffset, dataSize, timestamp, byteStart + offset);\n                        break;\n                    case 18:  // ScriptDataObject\n                        this._parseScriptData(chunk, dataOffset, dataSize);\n                        break;\n                }\n\n                let prevTagSize = v.getUint32(11 + dataSize, !le);\n                if (prevTagSize !== 11 + dataSize) {\n                    Log.w(this.TAG, `Invalid PrevTagSize ${prevTagSize}`);\n                }\n\n                offset += 11 + dataSize + 4;  // tagBody + dataSize + prevTagSize\n            }\n\n            // dispatch parsed frames to consumer (typically, the remuxer)\n            if (this._isInitialMetadataDispatched()) {\n                if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                    this._onDataAvailable(this._audioTrack, this._videoTrack);\n                }\n            }\n\n            return offset;  // consumed bytes, just equals latest offset index\n        }\n\n        _parseScriptData(arrayBuffer, dataOffset, dataSize) {\n            let scriptData = AMF.parseScriptData(arrayBuffer, dataOffset, dataSize);\n\n            if (scriptData.hasOwnProperty(\'onMetaData\')) {\n                if (scriptData.onMetaData == null || typeof scriptData.onMetaData !== \'object\') {\n                    Log.w(this.TAG, \'Invalid onMetaData structure!\');\n                    return;\n                }\n                if (this._metadata) {\n                    Log.w(this.TAG, \'Found another onMetaData tag!\');\n                }\n                this._metadata = scriptData;\n                let onMetaData = this._metadata.onMetaData;\n\n                if (typeof onMetaData.hasAudio === \'boolean\') {  // hasAudio\n                    if (this._hasAudioFlagOverrided === false) {\n                        this._hasAudio = onMetaData.hasAudio;\n                        this._mediaInfo.hasAudio = this._hasAudio;\n                    }\n                }\n                if (typeof onMetaData.hasVideo === \'boolean\') {  // hasVideo\n                    if (this._hasVideoFlagOverrided === false) {\n                        this._hasVideo = onMetaData.hasVideo;\n                        this._mediaInfo.hasVideo = this._hasVideo;\n                    }\n                }\n                if (typeof onMetaData.audiodatarate === \'number\') {  // audiodatarate\n                    this._mediaInfo.audioDataRate = onMetaData.audiodatarate;\n                }\n                if (typeof onMetaData.videodatarate === \'number\') {  // videodatarate\n                    this._mediaInfo.videoDataRate = onMetaData.videodatarate;\n                }\n                if (typeof onMetaData.width === \'number\') {  // width\n                    this._mediaInfo.width = onMetaData.width;\n                }\n                if (typeof onMetaData.height === \'number\') {  // height\n                    this._mediaInfo.height = onMetaData.height;\n                }\n                if (typeof onMetaData.duration === \'number\') {  // duration\n                    if (!this._durationOverrided) {\n                        let duration = Math.floor(onMetaData.duration * this._timescale);\n                        this._duration = duration;\n                        this._mediaInfo.duration = duration;\n                    }\n                } else {\n                    this._mediaInfo.duration = 0;\n                }\n                if (typeof onMetaData.framerate === \'number\') {  // framerate\n                    let fps_num = Math.floor(onMetaData.framerate * 1000);\n                    if (fps_num > 0) {\n                        let fps = fps_num / 1000;\n                        this._referenceFrameRate.fixed = true;\n                        this._referenceFrameRate.fps = fps;\n                        this._referenceFrameRate.fps_num = fps_num;\n                        this._referenceFrameRate.fps_den = 1000;\n                        this._mediaInfo.fps = fps;\n                    }\n                }\n                if (typeof onMetaData.keyframes === \'object\') {  // keyframes\n                    this._mediaInfo.hasKeyframesIndex = true;\n                    let keyframes = onMetaData.keyframes;\n                    this._mediaInfo.keyframesIndex = this._parseKeyframesIndex(keyframes);\n                    onMetaData.keyframes = null;  // keyframes has been extracted, remove it\n                } else {\n                    this._mediaInfo.hasKeyframesIndex = false;\n                }\n                this._dispatch = false;\n                this._mediaInfo.metadata = onMetaData;\n                Log.v(this.TAG, \'Parsed onMetaData\');\n                if (this._mediaInfo.isComplete()) {\n                    this._onMediaInfo(this._mediaInfo);\n                }\n            }\n        }\n\n        _parseKeyframesIndex(keyframes) {\n            let times = [];\n            let filepositions = [];\n\n            // ignore first keyframe which is actually AVC Sequence Header (AVCDecoderConfigurationRecord)\n            for (let i = 1; i < keyframes.times.length; i++) {\n                let time = this._timestampBase + Math.floor(keyframes.times[i] * 1000);\n                times.push(time);\n                filepositions.push(keyframes.filepositions[i]);\n            }\n\n            return {\n                times: times,\n                filepositions: filepositions\n            };\n        }\n\n        _parseAudioData(arrayBuffer, dataOffset, dataSize, tagTimestamp) {\n            if (dataSize <= 1) {\n                Log.w(this.TAG, \'Flv: Invalid audio packet, missing SoundData payload!\');\n                return;\n            }\n\n            if (this._hasAudioFlagOverrided === true && this._hasAudio === false) {\n                // If hasAudio: false indicated explicitly in MediaDataSource,\n                // Ignore all the audio packets\n                return;\n            }\n\n            let le = this._littleEndian;\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            let soundSpec = v.getUint8(0);\n\n            let soundFormat = soundSpec >>> 4;\n            if (soundFormat !== 2 && soundFormat !== 10) {  // MP3 or AAC\n                this._onError(DemuxErrors.CODEC_UNSUPPORTED, \'Flv: Unsupported audio codec idx: \' + soundFormat);\n                return;\n            }\n\n            let soundRate = 0;\n            let soundRateIndex = (soundSpec & 12) >>> 2;\n            if (soundRateIndex >= 0 && soundRateIndex <= 4) {\n                soundRate = this._flvSoundRateTable[soundRateIndex];\n            } else {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid audio sample rate idx: \' + soundRateIndex);\n                return;\n            }\n            let soundType = (soundSpec & 1);\n\n\n            let meta = this._audioMetadata;\n            let track = this._audioTrack;\n\n            if (!meta) {\n                if (this._hasAudio === false && this._hasAudioFlagOverrided === false) {\n                    this._hasAudio = true;\n                    this._mediaInfo.hasAudio = true;\n                }\n\n                // initial metadata\n                meta = this._audioMetadata = {};\n                meta.type = \'audio\';\n                meta.id = track.id;\n                meta.timescale = this._timescale;\n                meta.duration = this._duration;\n                meta.audioSampleRate = soundRate;\n                meta.channelCount = (soundType === 0 ? 1 : 2);\n            }\n\n            if (soundFormat === 10) {  // AAC\n                let aacData = this._parseAACAudioData(arrayBuffer, dataOffset + 1, dataSize - 1);\n\n                if (aacData == undefined) {\n                    return;\n                }\n\n                if (aacData.packetType === 0) {  // AAC sequence header (AudioSpecificConfig)\n                    if (meta.config) {\n                        Log.w(this.TAG, \'Found another AudioSpecificConfig!\');\n                    }\n                    let misc = aacData.data;\n                    meta.audioSampleRate = misc.samplingRate;\n                    meta.channelCount = misc.channelCount;\n                    meta.codec = misc.codec;\n                    meta.originalCodec = misc.originalCodec;\n                    meta.config = misc.config;\n                    // added by qli5\n                    meta.configRaw = misc.configRaw;\n                    // added by Xmader\n                    meta.audioObjectType = misc.audioObjectType;\n                    meta.samplingFrequencyIndex = misc.samplingIndex;\n                    meta.channelConfig = misc.channelCount;\n                    // The decode result of an aac sample is 1024 PCM samples\n                    meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale;\n                    Log.v(this.TAG, \'Parsed AudioSpecificConfig\');\n\n                    if (this._isInitialMetadataDispatched()) {\n                        // Non-initial metadata, force dispatch (or flush) parsed frames to remuxer\n                        if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                            this._onDataAvailable(this._audioTrack, this._videoTrack);\n                        }\n                    } else {\n                        this._audioInitialMetadataDispatched = true;\n                    }\n                    // then notify new metadata\n                    this._dispatch = false;\n                    this._onTrackMetadata(\'audio\', meta);\n\n                    let mi = this._mediaInfo;\n                    mi.audioCodec = meta.originalCodec;\n                    mi.audioSampleRate = meta.audioSampleRate;\n                    mi.audioChannelCount = meta.channelCount;\n                    if (mi.hasVideo) {\n                        if (mi.videoCodec != null) {\n                            mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                        }\n                    } else {\n                        mi.mimeType = \'video/x-flv; codecs="\' + mi.audioCodec + \'"\';\n                    }\n                    if (mi.isComplete()) {\n                        this._onMediaInfo(mi);\n                    }\n                } else if (aacData.packetType === 1) {  // AAC raw frame data\n                    let dts = this._timestampBase + tagTimestamp;\n                    let aacSample = { unit: aacData.data, length: aacData.data.byteLength, dts: dts, pts: dts };\n                    track.samples.push(aacSample);\n                    track.length += aacData.data.length;\n                } else {\n                    Log.e(this.TAG, `Flv: Unsupported AAC data type ${aacData.packetType}`);\n                }\n            } else if (soundFormat === 2) {  // MP3\n                if (!meta.codec) {\n                    // We need metadata for mp3 audio track, extract info from frame header\n                    let misc = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, true);\n                    if (misc == undefined) {\n                        return;\n                    }\n                    meta.audioSampleRate = misc.samplingRate;\n                    meta.channelCount = misc.channelCount;\n                    meta.codec = misc.codec;\n                    meta.originalCodec = misc.originalCodec;\n                    // The decode result of an mp3 sample is 1152 PCM samples\n                    meta.refSampleDuration = 1152 / meta.audioSampleRate * meta.timescale;\n                    Log.v(this.TAG, \'Parsed MPEG Audio Frame Header\');\n\n                    this._audioInitialMetadataDispatched = true;\n                    this._onTrackMetadata(\'audio\', meta);\n\n                    let mi = this._mediaInfo;\n                    mi.audioCodec = meta.codec;\n                    mi.audioSampleRate = meta.audioSampleRate;\n                    mi.audioChannelCount = meta.channelCount;\n                    mi.audioDataRate = misc.bitRate;\n                    if (mi.hasVideo) {\n                        if (mi.videoCodec != null) {\n                            mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                        }\n                    } else {\n                        mi.mimeType = \'video/x-flv; codecs="\' + mi.audioCodec + \'"\';\n                    }\n                    if (mi.isComplete()) {\n                        this._onMediaInfo(mi);\n                    }\n                }\n\n                // This packet is always a valid audio packet, extract it\n                let data = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, false);\n                if (data == undefined) {\n                    return;\n                }\n                let dts = this._timestampBase + tagTimestamp;\n                let mp3Sample = { unit: data, length: data.byteLength, dts: dts, pts: dts };\n                track.samples.push(mp3Sample);\n                track.length += data.length;\n            }\n        }\n\n        _parseAACAudioData(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize <= 1) {\n                Log.w(this.TAG, \'Flv: Invalid AAC packet, missing AACPacketType or/and Data!\');\n                return;\n            }\n\n            let result = {};\n            let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n\n            result.packetType = array[0];\n\n            if (array[0] === 0) {\n                result.data = this._parseAACAudioSpecificConfig(arrayBuffer, dataOffset + 1, dataSize - 1);\n            } else {\n                result.data = array.subarray(1);\n            }\n\n            return result;\n        }\n\n        _parseAACAudioSpecificConfig(arrayBuffer, dataOffset, dataSize) {\n            let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n            let config = null;\n\n            /* Audio Object Type:\n               0: Null\n               1: AAC Main\n               2: AAC LC\n               3: AAC SSR (Scalable Sample Rate)\n               4: AAC LTP (Long Term Prediction)\n               5: HE-AAC / SBR (Spectral Band Replication)\n               6: AAC Scalable\n            */\n\n            let audioObjectType = 0;\n            let originalAudioObjectType = 0;\n            let samplingIndex = 0;\n            let extensionSamplingIndex = null;\n\n            // 5 bits\n            audioObjectType = originalAudioObjectType = array[0] >>> 3;\n            // 4 bits\n            samplingIndex = ((array[0] & 0x07) << 1) | (array[1] >>> 7);\n            if (samplingIndex < 0 || samplingIndex >= this._mpegSamplingRates.length) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: AAC invalid sampling frequency index!\');\n                return;\n            }\n\n            let samplingFrequence = this._mpegSamplingRates[samplingIndex];\n\n            // 4 bits\n            let channelConfig = (array[1] & 0x78) >>> 3;\n            if (channelConfig < 0 || channelConfig >= 8) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: AAC invalid channel configuration\');\n                return;\n            }\n\n            if (audioObjectType === 5) {  // HE-AAC?\n                // 4 bits\n                extensionSamplingIndex = ((array[1] & 0x07) << 1) | (array[2] >>> 7);\n            }\n\n            // workarounds for various browsers\n            let userAgent = _navigator.userAgent.toLowerCase();\n\n            if (userAgent.indexOf(\'firefox\') !== -1) {\n                // firefox: use SBR (HE-AAC) if freq less than 24kHz\n                if (samplingIndex >= 6) {\n                    audioObjectType = 5;\n                    config = new Array(4);\n                    extensionSamplingIndex = samplingIndex - 3;\n                } else {  // use LC-AAC\n                    audioObjectType = 2;\n                    config = new Array(2);\n                    extensionSamplingIndex = samplingIndex;\n                }\n            } else if (userAgent.indexOf(\'android\') !== -1) {\n                // android: always use LC-AAC\n                audioObjectType = 2;\n                config = new Array(2);\n                extensionSamplingIndex = samplingIndex;\n            } else {\n                // for other browsers, e.g. chrome...\n                // Always use HE-AAC to make it easier to switch aac codec profile\n                audioObjectType = 5;\n                extensionSamplingIndex = samplingIndex;\n                config = new Array(4);\n\n                if (samplingIndex >= 6) {\n                    extensionSamplingIndex = samplingIndex - 3;\n                } else if (channelConfig === 1) {  // Mono channel\n                    audioObjectType = 2;\n                    config = new Array(2);\n                    extensionSamplingIndex = samplingIndex;\n                }\n            }\n\n            config[0] = audioObjectType << 3;\n            config[0] |= (samplingIndex & 0x0F) >>> 1;\n            config[1] = (samplingIndex & 0x0F) << 7;\n            config[1] |= (channelConfig & 0x0F) << 3;\n            if (audioObjectType === 5) {\n                config[1] |= ((extensionSamplingIndex & 0x0F) >>> 1);\n                config[2] = (extensionSamplingIndex & 0x01) << 7;\n                // extended audio object type: force to 2 (LC-AAC)\n                config[2] |= (2 << 2);\n                config[3] = 0;\n            }\n\n            return {\n                audioObjectType,  // audio_object_type,        added by Xmader\n                samplingIndex,    // sampling_frequency_index, added by Xmader\n                configRaw: array, //                           added by qli5\n                config: config,\n                samplingRate: samplingFrequence,\n                channelCount: channelConfig,  // channel_config\n                codec: \'mp4a.40.\' + audioObjectType,\n                originalCodec: \'mp4a.40.\' + originalAudioObjectType\n            };\n        }\n\n        _parseMP3AudioData(arrayBuffer, dataOffset, dataSize, requestHeader) {\n            if (dataSize < 4) {\n                Log.w(this.TAG, \'Flv: Invalid MP3 packet, header missing!\');\n                return;\n            }\n\n            let le = this._littleEndian;\n            let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n            let result = null;\n\n            if (requestHeader) {\n                if (array[0] !== 0xFF) {\n                    return;\n                }\n                let ver = (array[1] >>> 3) & 0x03;\n                let layer = (array[1] & 0x06) >> 1;\n\n                let bitrate_index = (array[2] & 0xF0) >>> 4;\n                let sampling_freq_index = (array[2] & 0x0C) >>> 2;\n\n                let channel_mode = (array[3] >>> 6) & 0x03;\n                let channel_count = channel_mode !== 3 ? 2 : 1;\n\n                let sample_rate = 0;\n                let bit_rate = 0;\n\n                let codec = \'mp3\';\n\n                switch (ver) {\n                    case 0:  // MPEG 2.5\n                        sample_rate = this._mpegAudioV25SampleRateTable[sampling_freq_index];\n                        break;\n                    case 2:  // MPEG 2\n                        sample_rate = this._mpegAudioV20SampleRateTable[sampling_freq_index];\n                        break;\n                    case 3:  // MPEG 1\n                        sample_rate = this._mpegAudioV10SampleRateTable[sampling_freq_index];\n                        break;\n                }\n\n                switch (layer) {\n                    case 1:  // Layer 3\n                        if (bitrate_index < this._mpegAudioL3BitRateTable.length) {\n                            bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];\n                        }\n                        break;\n                    case 2:  // Layer 2\n                        if (bitrate_index < this._mpegAudioL2BitRateTable.length) {\n                            bit_rate = this._mpegAudioL2BitRateTable[bitrate_index];\n                        }\n                        break;\n                    case 3:  // Layer 1\n                        if (bitrate_index < this._mpegAudioL1BitRateTable.length) {\n                            bit_rate = this._mpegAudioL1BitRateTable[bitrate_index];\n                        }\n                        break;\n                }\n\n                result = {\n                    bitRate: bit_rate,\n                    samplingRate: sample_rate,\n                    channelCount: channel_count,\n                    codec: codec,\n                    originalCodec: codec\n                };\n            } else {\n                result = array;\n            }\n\n            return result;\n        }\n\n        _parseVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition) {\n            if (dataSize <= 1) {\n                Log.w(this.TAG, \'Flv: Invalid video packet, missing VideoData payload!\');\n                return;\n            }\n\n            if (this._hasVideoFlagOverrided === true && this._hasVideo === false) {\n                // If hasVideo: false indicated explicitly in MediaDataSource,\n                // Ignore all the video packets\n                return;\n            }\n\n            let spec = (new Uint8Array(arrayBuffer, dataOffset, dataSize))[0];\n\n            let frameType = (spec & 240) >>> 4;\n            let codecId = spec & 15;\n\n            if (codecId !== 7) {\n                this._onError(DemuxErrors.CODEC_UNSUPPORTED, `Flv: Unsupported codec in video frame: ${codecId}`);\n                return;\n            }\n\n            this._parseAVCVideoPacket(arrayBuffer, dataOffset + 1, dataSize - 1, tagTimestamp, tagPosition, frameType);\n        }\n\n        _parseAVCVideoPacket(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType) {\n            if (dataSize < 4) {\n                Log.w(this.TAG, \'Flv: Invalid AVC packet, missing AVCPacketType or/and CompositionTime\');\n                return;\n            }\n\n            let le = this._littleEndian;\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            let packetType = v.getUint8(0);\n            let cts = v.getUint32(0, !le) & 0x00FFFFFF;\n\n            if (packetType === 0) {  // AVCDecoderConfigurationRecord\n                this._parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset + 4, dataSize - 4);\n            } else if (packetType === 1) {  // One or more Nalus\n                this._parseAVCVideoData(arrayBuffer, dataOffset + 4, dataSize - 4, tagTimestamp, tagPosition, frameType, cts);\n            } else if (packetType === 2) {\n                // empty, AVC end of sequence\n            } else {\n                this._onError(DemuxErrors.FORMAT_ERROR, `Flv: Invalid video packet type ${packetType}`);\n                return;\n            }\n        }\n\n        _parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 7) {\n                Log.w(this.TAG, \'Flv: Invalid AVCDecoderConfigurationRecord, lack of data!\');\n                return;\n            }\n\n            let meta = this._videoMetadata;\n            let track = this._videoTrack;\n            let le = this._littleEndian;\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            if (!meta) {\n                if (this._hasVideo === false && this._hasVideoFlagOverrided === false) {\n                    this._hasVideo = true;\n                    this._mediaInfo.hasVideo = true;\n                }\n\n                meta = this._videoMetadata = {};\n                meta.type = \'video\';\n                meta.id = track.id;\n                meta.timescale = this._timescale;\n                meta.duration = this._duration;\n            } else {\n                if (typeof meta.avcc !== \'undefined\') {\n                    Log.w(this.TAG, \'Found another AVCDecoderConfigurationRecord!\');\n                }\n            }\n\n            let version = v.getUint8(0);  // configurationVersion\n            let avcProfile = v.getUint8(1);  // avcProfileIndication\n            let profileCompatibility = v.getUint8(2);  // profile_compatibility\n            let avcLevel = v.getUint8(3);  // AVCLevelIndication\n\n            if (version !== 1 || avcProfile === 0) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord\');\n                return;\n            }\n\n            this._naluLengthSize = (v.getUint8(4) & 3) + 1;  // lengthSizeMinusOne\n            if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {  // holy shit!!!\n                this._onError(DemuxErrors.FORMAT_ERROR, `Flv: Strange NaluLengthSizeMinusOne: ${this._naluLengthSize - 1}`);\n                return;\n            }\n\n            let spsCount = v.getUint8(5) & 31;  // numOfSequenceParameterSets\n            if (spsCount === 0) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord: No SPS\');\n                return;\n            } else if (spsCount > 1) {\n                Log.w(this.TAG, `Flv: Strange AVCDecoderConfigurationRecord: SPS Count = ${spsCount}`);\n            }\n\n            let offset = 6;\n\n            for (let i = 0; i < spsCount; i++) {\n                let len = v.getUint16(offset, !le);  // sequenceParameterSetLength\n                offset += 2;\n\n                if (len === 0) {\n                    continue;\n                }\n\n                // Notice: Nalu without startcode header (00 00 00 01)\n                let sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);\n                offset += len;\n\n                let config = SPSParser.parseSPS(sps);\n                if (i !== 0) {\n                    // ignore other sps\'s config\n                    continue;\n                }\n\n                meta.codecWidth = config.codec_size.width;\n                meta.codecHeight = config.codec_size.height;\n                meta.presentWidth = config.present_size.width;\n                meta.presentHeight = config.present_size.height;\n\n                meta.profile = config.profile_string;\n                meta.level = config.level_string;\n                meta.bitDepth = config.bit_depth;\n                meta.chromaFormat = config.chroma_format;\n                meta.sarRatio = config.sar_ratio;\n                meta.frameRate = config.frame_rate;\n\n                if (config.frame_rate.fixed === false ||\n                    config.frame_rate.fps_num === 0 ||\n                    config.frame_rate.fps_den === 0) {\n                    meta.frameRate = this._referenceFrameRate;\n                }\n\n                let fps_den = meta.frameRate.fps_den;\n                let fps_num = meta.frameRate.fps_num;\n                meta.refSampleDuration = meta.timescale * (fps_den / fps_num);\n\n                let codecArray = sps.subarray(1, 4);\n                let codecString = \'avc1.\';\n                for (let j = 0; j < 3; j++) {\n                    let h = codecArray[j].toString(16);\n                    if (h.length < 2) {\n                        h = \'0\' + h;\n                    }\n                    codecString += h;\n                }\n                meta.codec = codecString;\n\n                let mi = this._mediaInfo;\n                mi.width = meta.codecWidth;\n                mi.height = meta.codecHeight;\n                mi.fps = meta.frameRate.fps;\n                mi.profile = meta.profile;\n                mi.level = meta.level;\n                mi.chromaFormat = config.chroma_format_string;\n                mi.sarNum = meta.sarRatio.width;\n                mi.sarDen = meta.sarRatio.height;\n                mi.videoCodec = codecString;\n\n                if (mi.hasAudio) {\n                    if (mi.audioCodec != null) {\n                        mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                    }\n                } else {\n                    mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \'"\';\n                }\n                if (mi.isComplete()) {\n                    this._onMediaInfo(mi);\n                }\n            }\n\n            let ppsCount = v.getUint8(offset);  // numOfPictureParameterSets\n            if (ppsCount === 0) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord: No PPS\');\n                return;\n            } else if (ppsCount > 1) {\n                Log.w(this.TAG, `Flv: Strange AVCDecoderConfigurationRecord: PPS Count = ${ppsCount}`);\n            }\n\n            offset++;\n\n            for (let i = 0; i < ppsCount; i++) {\n                let len = v.getUint16(offset, !le);  // pictureParameterSetLength\n                offset += 2;\n\n                if (len === 0) {\n                    continue;\n                }\n\n                // pps is useless for extracting video information\n                offset += len;\n            }\n\n            meta.avcc = new Uint8Array(dataSize);\n            meta.avcc.set(new Uint8Array(arrayBuffer, dataOffset, dataSize), 0);\n            Log.v(this.TAG, \'Parsed AVCDecoderConfigurationRecord\');\n\n            if (this._isInitialMetadataDispatched()) {\n                // flush parsed frames\n                if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                    this._onDataAvailable(this._audioTrack, this._videoTrack);\n                }\n            } else {\n                this._videoInitialMetadataDispatched = true;\n            }\n            // notify new metadata\n            this._dispatch = false;\n            this._onTrackMetadata(\'video\', meta);\n        }\n\n        _parseAVCVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType, cts) {\n            let le = this._littleEndian;\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            let units = [], length = 0;\n\n            let offset = 0;\n            const lengthSize = this._naluLengthSize;\n            let dts = this._timestampBase + tagTimestamp;\n            let keyframe = (frameType === 1);  // from FLV Frame Type constants\n            let refIdc = 1; // added by qli5\n\n            while (offset < dataSize) {\n                if (offset + 4 >= dataSize) {\n                    Log.w(this.TAG, `Malformed Nalu near timestamp ${dts}, offset = ${offset}, dataSize = ${dataSize}`);\n                    break;  // data not enough for next Nalu\n                }\n                // Nalu with length-header (AVC1)\n                let naluSize = v.getUint32(offset, !le);  // Big-Endian read\n                if (lengthSize === 3) {\n                    naluSize >>>= 8;\n                }\n                if (naluSize > dataSize - lengthSize) {\n                    Log.w(this.TAG, `Malformed Nalus near timestamp ${dts}, NaluSize > DataSize!`);\n                    return;\n                }\n\n                let unitType = v.getUint8(offset + lengthSize) & 0x1F;\n                // added by qli5\n                refIdc = v.getUint8(offset + lengthSize) & 0x60;\n\n                if (unitType === 5) {  // IDR\n                    keyframe = true;\n                }\n\n                let data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);\n                let unit = { type: unitType, data: data };\n                units.push(unit);\n                length += data.byteLength;\n\n                offset += lengthSize + naluSize;\n            }\n\n            if (units.length) {\n                let track = this._videoTrack;\n                let avcSample = {\n                    units: units,\n                    length: length,\n                    isKeyframe: keyframe,\n                    refIdc: refIdc,\n                    dts: dts,\n                    cts: cts,\n                    pts: (dts + cts)\n                };\n                if (keyframe) {\n                    avcSample.fileposition = tagPosition;\n                }\n                track.samples.push(avcSample);\n                track.length += length;\n            }\n        }\n\n    }\n\n    /***\n     * Copyright (C) 2018 Qli5. All Rights Reserved.\n     * \n     * @author qli5 <goodlq11[at](163|gmail).com>\n     * \n     * This Source Code Form is subject to the terms of the Mozilla Public\n     * License, v. 2.0. If a copy of the MPL was not distributed with this\n     * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n    */\n\n    class ASS {\n        /**\n         * Extract sections from ass string\n         * @param {string} str \n         * @returns {Object} - object from sections\n         */\n        static extractSections(str) {\n            const regex = /^\\ufeff?\\[(.*)\\]$/mg;\n            let match;\n            let matchArr = [];\n            while ((match = regex.exec(str)) !== null) {\n                matchArr.push({ name: match[1], index: match.index });\n            }\n            let ret = {};\n            matchArr.forEach((match, i) => ret[match.name] = str.slice(match.index, matchArr[i + 1] && matchArr[i + 1].index));\n            return ret;\n        }\n\n        /**\n         * Extract subtitle lines from section Events\n         * @param {string} str \n         * @returns {Array<Object>} - array of subtitle lines\n         */\n        static extractSubtitleLines(str) {\n            const lines = str.split(/\\r\\n+/);\n            if (lines[0] != \'[Events]\' && lines[0] != \'[events]\') throw new Error(\'ASSDemuxer: section is not [Events]\');\n            if (lines[1].indexOf(\'Format:\') != 0 && lines[1].indexOf(\'format:\') != 0) throw new Error(\'ASSDemuxer: cannot find Format definition in section [Events]\');\n\n            const format = lines[1].slice(lines[1].indexOf(\':\') + 1).split(\',\').map(e => e.trim());\n            return lines.slice(2).map(e => {\n                let j = {};\n                e.replace(/[d|D]ialogue:\\s*/, \'\')\n                    .match(new RegExp(new Array(format.length - 1).fill(\'(.*?),\').join(\'\') + \'(.*)\'))\n                    .slice(1)\n                    .forEach((k, index) => j[format[index]] = k);\n                return j;\n            });\n        }\n\n        /**\n         * Create a new ASS Demuxer\n         */\n        constructor() {\n            this.info = \'\';\n            this.styles = \'\';\n            this.events = \'\';\n            this.eventsHeader = \'\';\n            this.pictures = \'\';\n            this.fonts = \'\';\n            this.lines = [];\n        }\n\n        get header() {\n            // return this.info + this.styles + this.eventsHeader;\n            return this.info + this.styles;\n        }\n\n        /**\n         * Load a file from an arraybuffer of a string\n         * @param {(ArrayBuffer|string)} chunk \n         */\n        parseFile(chunk) {\n            const str = typeof chunk == \'string\' ? chunk : new _TextDecoder(\'utf-8\').decode(chunk);\n            for (let [i, j] of Object.entries(ASS.extractSections(str))) {\n                if (i.match(/Script Info(?:mation)?/i)) this.info = j;\n                else if (i.match(/V4\\+? Styles?/i)) this.styles = j;\n                else if (i.match(/Events?/i)) this.events = j;\n                else if (i.match(/Pictures?/i)) this.pictures = j;\n                else if (i.match(/Fonts?/i)) this.fonts = j;\n            }\n            this.eventsHeader = this.events.split(\'\\n\', 2).join(\'\\n\') + \'\\n\';\n            this.lines = ASS.extractSubtitleLines(this.events);\n            return this;\n        }\n    }\n\n    /** Detect free variable `global` from Node.js. */\n    var freeGlobal = typeof global == \'object\' && global && global.Object === Object && global;\n\n    /** Detect free variable `self`. */\n    var freeSelf = typeof self == \'object\' && self && self.Object === Object && self;\n\n    /** Used as a reference to the global object. */\n    var root = freeGlobal || freeSelf || Function(\'return this\')();\n\n    /** Built-in value references. */\n    var Symbol = root.Symbol;\n\n    /** Used for built-in method references. */\n    var objectProto = Object.prototype;\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty = objectProto.hasOwnProperty;\n\n    /**\n     * Used to resolve the\n     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n     * of values.\n     */\n    var nativeObjectToString = objectProto.toString;\n\n    /** Built-in value references. */\n    var symToStringTag = Symbol ? Symbol.toStringTag : undefined;\n\n    /**\n     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.\n     *\n     * @private\n     * @param {*} value The value to query.\n     * @returns {string} Returns the raw `toStringTag`.\n     */\n    function getRawTag(value) {\n      var isOwn = hasOwnProperty.call(value, symToStringTag),\n          tag = value[symToStringTag];\n\n      try {\n        value[symToStringTag] = undefined;\n        var unmasked = true;\n      } catch (e) {}\n\n      var result = nativeObjectToString.call(value);\n      if (unmasked) {\n        if (isOwn) {\n          value[symToStringTag] = tag;\n        } else {\n          delete value[symToStringTag];\n        }\n      }\n      return result;\n    }\n\n    /** Used for built-in method references. */\n    var objectProto$1 = Object.prototype;\n\n    /**\n     * Used to resolve the\n     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n     * of values.\n     */\n    var nativeObjectToString$1 = objectProto$1.toString;\n\n    /**\n     * Converts `value` to a string using `Object.prototype.toString`.\n     *\n     * @private\n     * @param {*} value The value to convert.\n     * @returns {string} Returns the converted string.\n     */\n    function objectToString(value) {\n      return nativeObjectToString$1.call(value);\n    }\n\n    /** `Object#toString` result references. */\n    var nullTag = \'[object Null]\',\n        undefinedTag = \'[object Undefined]\';\n\n    /** Built-in value references. */\n    var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;\n\n    /**\n     * The base implementation of `getTag` without fallbacks for buggy environments.\n     *\n     * @private\n     * @param {*} value The value to query.\n     * @returns {string} Returns the `toStringTag`.\n     */\n    function baseGetTag(value) {\n      if (value == null) {\n        return value === undefined ? undefinedTag : nullTag;\n      }\n      return (symToStringTag$1 && symToStringTag$1 in Object(value))\n        ? getRawTag(value)\n        : objectToString(value);\n    }\n\n    /**\n     * Checks if `value` is the\n     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)\n     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String(\'\')`)\n     *\n     * @static\n     * @memberOf _\n     * @since 0.1.0\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is an object, else `false`.\n     * @example\n     *\n     * _.isObject({});\n     * // => true\n     *\n     * _.isObject([1, 2, 3]);\n     * // => true\n     *\n     * _.isObject(_.noop);\n     * // => true\n     *\n     * _.isObject(null);\n     * // => false\n     */\n    function isObject(value) {\n      var type = typeof value;\n      return value != null && (type == \'object\' || type == \'function\');\n    }\n\n    /** `Object#toString` result references. */\n    var asyncTag = \'[object AsyncFunction]\',\n        funcTag = \'[object Function]\',\n        genTag = \'[object GeneratorFunction]\',\n        proxyTag = \'[object Proxy]\';\n\n    /**\n     * Checks if `value` is classified as a `Function` object.\n     *\n     * @static\n     * @memberOf _\n     * @since 0.1.0\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a function, else `false`.\n     * @example\n     *\n     * _.isFunction(_);\n     * // => true\n     *\n     * _.isFunction(/abc/);\n     * // => false\n     */\n    function isFunction(value) {\n      if (!isObject(value)) {\n        return false;\n      }\n      // The use of `Object#toString` avoids issues with the `typeof` operator\n      // in Safari 9 which returns \'object\' for typed arrays and other constructors.\n      var tag = baseGetTag(value);\n      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;\n    }\n\n    /** Used to detect overreaching core-js shims. */\n    var coreJsData = root[\'__core-js_shared__\'];\n\n    /** Used to detect methods masquerading as native. */\n    var maskSrcKey = (function() {\n      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || \'\');\n      return uid ? (\'Symbol(src)_1.\' + uid) : \'\';\n    }());\n\n    /**\n     * Checks if `func` has its source masked.\n     *\n     * @private\n     * @param {Function} func The function to check.\n     * @returns {boolean} Returns `true` if `func` is masked, else `false`.\n     */\n    function isMasked(func) {\n      return !!maskSrcKey && (maskSrcKey in func);\n    }\n\n    /** Used for built-in method references. */\n    var funcProto = Function.prototype;\n\n    /** Used to resolve the decompiled source of functions. */\n    var funcToString = funcProto.toString;\n\n    /**\n     * Converts `func` to its source code.\n     *\n     * @private\n     * @param {Function} func The function to convert.\n     * @returns {string} Returns the source code.\n     */\n    function toSource(func) {\n      if (func != null) {\n        try {\n          return funcToString.call(func);\n        } catch (e) {}\n        try {\n          return (func + \'\');\n        } catch (e) {}\n      }\n      return \'\';\n    }\n\n    /**\n     * Used to match `RegExp`\n     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).\n     */\n    var reRegExpChar = /[\\\\^$.*+?()[\\]{}|]/g;\n\n    /** Used to detect host constructors (Safari). */\n    var reIsHostCtor = /^\\[object .+?Constructor\\]$/;\n\n    /** Used for built-in method references. */\n    var funcProto$1 = Function.prototype,\n        objectProto$2 = Object.prototype;\n\n    /** Used to resolve the decompiled source of functions. */\n    var funcToString$1 = funcProto$1.toString;\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;\n\n    /** Used to detect if a method is native. */\n    var reIsNative = RegExp(\'^\' +\n      funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, \'\\\\$&\')\n      .replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, \'$1.*?\') + \'$\'\n    );\n\n    /**\n     * The base implementation of `_.isNative` without bad shim checks.\n     *\n     * @private\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a native function,\n     *  else `false`.\n     */\n    function baseIsNative(value) {\n      if (!isObject(value) || isMasked(value)) {\n        return false;\n      }\n      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;\n      return pattern.test(toSource(value));\n    }\n\n    /**\n     * Gets the value at `key` of `object`.\n     *\n     * @private\n     * @param {Object} [object] The object to query.\n     * @param {string} key The key of the property to get.\n     * @returns {*} Returns the property value.\n     */\n    function getValue(object, key) {\n      return object == null ? undefined : object[key];\n    }\n\n    /**\n     * Gets the native function at `key` of `object`.\n     *\n     * @private\n     * @param {Object} object The object to query.\n     * @param {string} key The key of the method to get.\n     * @returns {*} Returns the function if it\'s native, else `undefined`.\n     */\n    function getNative(object, key) {\n      var value = getValue(object, key);\n      return baseIsNative(value) ? value : undefined;\n    }\n\n    /* Built-in method references that are verified to be native. */\n    var nativeCreate = getNative(Object, \'create\');\n\n    /**\n     * Removes all key-value entries from the hash.\n     *\n     * @private\n     * @name clear\n     * @memberOf Hash\n     */\n    function hashClear() {\n      this.__data__ = nativeCreate ? nativeCreate(null) : {};\n      this.size = 0;\n    }\n\n    /**\n     * Removes `key` and its value from the hash.\n     *\n     * @private\n     * @name delete\n     * @memberOf Hash\n     * @param {Object} hash The hash to modify.\n     * @param {string} key The key of the value to remove.\n     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n     */\n    function hashDelete(key) {\n      var result = this.has(key) && delete this.__data__[key];\n      this.size -= result ? 1 : 0;\n      return result;\n    }\n\n    /** Used to stand-in for `undefined` hash values. */\n    var HASH_UNDEFINED = \'__lodash_hash_undefined__\';\n\n    /** Used for built-in method references. */\n    var objectProto$3 = Object.prototype;\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;\n\n    /**\n     * Gets the hash value for `key`.\n     *\n     * @private\n     * @name get\n     * @memberOf Hash\n     * @param {string} key The key of the value to get.\n     * @returns {*} Returns the entry value.\n     */\n    function hashGet(key) {\n      var data = this.__data__;\n      if (nativeCreate) {\n        var result = data[key];\n        return result === HASH_UNDEFINED ? undefined : result;\n      }\n      return hasOwnProperty$2.call(data, key) ? data[key] : undefined;\n    }\n\n    /** Used for built-in method references. */\n    var objectProto$4 = Object.prototype;\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;\n\n    /**\n     * Checks if a hash value for `key` exists.\n     *\n     * @private\n     * @name has\n     * @memberOf Hash\n     * @param {string} key The key of the entry to check.\n     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n     */\n    function hashHas(key) {\n      var data = this.__data__;\n      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);\n    }\n\n    /** Used to stand-in for `undefined` hash values. */\n    var HASH_UNDEFINED$1 = \'__lodash_hash_undefined__\';\n\n    /**\n     * Sets the hash `key` to `value`.\n     *\n     * @private\n     * @name set\n     * @memberOf Hash\n     * @param {string} key The key of the value to set.\n     * @param {*} value The value to set.\n     * @returns {Object} Returns the hash instance.\n     */\n    function hashSet(key, value) {\n      var data = this.__data__;\n      this.size += this.has(key) ? 0 : 1;\n      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;\n      return this;\n    }\n\n    /**\n     * Creates a hash object.\n     *\n     * @private\n     * @constructor\n     * @param {Array} [entries] The key-value pairs to cache.\n     */\n    function Hash(entries) {\n      var index = -1,\n          length = entries == null ? 0 : entries.length;\n\n      this.clear();\n      while (++index < length) {\n        var entry = entries[index];\n        this.set(entry[0], entry[1]);\n      }\n    }\n\n    // Add methods to `Hash`.\n    Hash.prototype.clear = hashClear;\n    Hash.prototype[\'delete\'] = hashDelete;\n    Hash.prototype.get = hashGet;\n    Hash.prototype.has = hashHas;\n    Hash.prototype.set = hashSet;\n\n    /**\n     * Removes all key-value entries from the list cache.\n     *\n     * @private\n     * @name clear\n     * @memberOf ListCache\n     */\n    function listCacheClear() {\n      this.__data__ = [];\n      this.size = 0;\n    }\n\n    /**\n     * Performs a\n     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)\n     * comparison between two values to determine if they are equivalent.\n     *\n     * @static\n     * @memberOf _\n     * @since 4.0.0\n     * @category Lang\n     * @param {*} value The value to compare.\n     * @param {*} other The other value to compare.\n     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\n     * @example\n     *\n     * var object = { \'a\': 1 };\n     * var other = { \'a\': 1 };\n     *\n     * _.eq(object, object);\n     * // => true\n     *\n     * _.eq(object, other);\n     * // => false\n     *\n     * _.eq(\'a\', \'a\');\n     * // => true\n     *\n     * _.eq(\'a\', Object(\'a\'));\n     * // => false\n     *\n     * _.eq(NaN, NaN);\n     * // => true\n     */\n    function eq(value, other) {\n      return value === other || (value !== value && other !== other);\n    }\n\n    /**\n     * Gets the index at which the `key` is found in `array` of key-value pairs.\n     *\n     * @private\n     * @param {Array} array The array to inspect.\n     * @param {*} key The key to search for.\n     * @returns {number} Returns the index of the matched value, else `-1`.\n     */\n    function assocIndexOf(array, key) {\n      var length = array.length;\n      while (length--) {\n        if (eq(array[length][0], key)) {\n          return length;\n        }\n      }\n      return -1;\n    }\n\n    /** Used for built-in method references. */\n    var arrayProto = Array.prototype;\n\n    /** Built-in value references. */\n    var splice = arrayProto.splice;\n\n    /**\n     * Removes `key` and its value from the list cache.\n     *\n     * @private\n     * @name delete\n     * @memberOf ListCache\n     * @param {string} key The key of the value to remove.\n     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n     */\n    function listCacheDelete(key) {\n      var data = this.__data__,\n          index = assocIndexOf(data, key);\n\n      if (index < 0) {\n        return false;\n      }\n      var lastIndex = data.length - 1;\n      if (index == lastIndex) {\n        data.pop();\n      } else {\n        splice.call(data, index, 1);\n      }\n      --this.size;\n      return true;\n    }\n\n    /**\n     * Gets the list cache value for `key`.\n     *\n     * @private\n     * @name get\n     * @memberOf ListCache\n     * @param {string} key The key of the value to get.\n     * @returns {*} Returns the entry value.\n     */\n    function listCacheGet(key) {\n      var data = this.__data__,\n          index = assocIndexOf(data, key);\n\n      return index < 0 ? undefined : data[index][1];\n    }\n\n    /**\n     * Checks if a list cache value for `key` exists.\n     *\n     * @private\n     * @name has\n     * @memberOf ListCache\n     * @param {string} key The key of the entry to check.\n     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n     */\n    function listCacheHas(key) {\n      return assocIndexOf(this.__data__, key) > -1;\n    }\n\n    /**\n     * Sets the list cache `key` to `value`.\n     *\n     * @private\n     * @name set\n     * @memberOf ListCache\n     * @param {string} key The key of the value to set.\n     * @param {*} value The value to set.\n     * @returns {Object} Returns the list cache instance.\n     */\n    function listCacheSet(key, value) {\n      var data = this.__data__,\n          index = assocIndexOf(data, key);\n\n      if (index < 0) {\n        ++this.size;\n        data.push([key, value]);\n      } else {\n        data[index][1] = value;\n      }\n      return this;\n    }\n\n    /**\n     * Creates an list cache object.\n     *\n     * @private\n     * @constructor\n     * @param {Array} [entries] The key-value pairs to cache.\n     */\n    function ListCache(entries) {\n      var index = -1,\n          length = entries == null ? 0 : entries.length;\n\n      this.clear();\n      while (++index < length) {\n        var entry = entries[index];\n        this.set(entry[0], entry[1]);\n      }\n    }\n\n    // Add methods to `ListCache`.\n    ListCache.prototype.clear = listCacheClear;\n    ListCache.prototype[\'delete\'] = listCacheDelete;\n    ListCache.prototype.get = listCacheGet;\n    ListCache.prototype.has = listCacheHas;\n    ListCache.prototype.set = listCacheSet;\n\n    /* Built-in method references that are verified to be native. */\n    var Map = getNative(root, \'Map\');\n\n    /**\n     * Removes all key-value entries from the map.\n     *\n     * @private\n     * @name clear\n     * @memberOf MapCache\n     */\n    function mapCacheClear() {\n      this.size = 0;\n      this.__data__ = {\n        \'hash\': new Hash,\n        \'map\': new (Map || ListCache),\n        \'string\': new Hash\n      };\n    }\n\n    /**\n     * Checks if `value` is suitable for use as unique object key.\n     *\n     * @private\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.\n     */\n    function isKeyable(value) {\n      var type = typeof value;\n      return (type == \'string\' || type == \'number\' || type == \'symbol\' || type == \'boolean\')\n        ? (value !== \'__proto__\')\n        : (value === null);\n    }\n\n    /**\n     * Gets the data for `map`.\n     *\n     * @private\n     * @param {Object} map The map to query.\n     * @param {string} key The reference key.\n     * @returns {*} Returns the map data.\n     */\n    function getMapData(map, key) {\n      var data = map.__data__;\n      return isKeyable(key)\n        ? data[typeof key == \'string\' ? \'string\' : \'hash\']\n        : data.map;\n    }\n\n    /**\n     * Removes `key` and its value from the map.\n     *\n     * @private\n     * @name delete\n     * @memberOf MapCache\n     * @param {string} key The key of the value to remove.\n     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n     */\n    function mapCacheDelete(key) {\n      var result = getMapData(this, key)[\'delete\'](key);\n      this.size -= result ? 1 : 0;\n      return result;\n    }\n\n    /**\n     * Gets the map value for `key`.\n     *\n     * @private\n     * @name get\n     * @memberOf MapCache\n     * @param {string} key The key of the value to get.\n     * @returns {*} Returns the entry value.\n     */\n    function mapCacheGet(key) {\n      return getMapData(this, key).get(key);\n    }\n\n    /**\n     * Checks if a map value for `key` exists.\n     *\n     * @private\n     * @name has\n     * @memberOf MapCache\n     * @param {string} key The key of the entry to check.\n     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n     */\n    function mapCacheHas(key) {\n      return getMapData(this, key).has(key);\n    }\n\n    /**\n     * Sets the map `key` to `value`.\n     *\n     * @private\n     * @name set\n     * @memberOf MapCache\n     * @param {string} key The key of the value to set.\n     * @param {*} value The value to set.\n     * @returns {Object} Returns the map cache instance.\n     */\n    function mapCacheSet(key, value) {\n      var data = getMapData(this, key),\n          size = data.size;\n\n      data.set(key, value);\n      this.size += data.size == size ? 0 : 1;\n      return this;\n    }\n\n    /**\n     * Creates a map cache object to store key-value pairs.\n     *\n     * @private\n     * @constructor\n     * @param {Array} [entries] The key-value pairs to cache.\n     */\n    function MapCache(entries) {\n      var index = -1,\n          length = entries == null ? 0 : entries.length;\n\n      this.clear();\n      while (++index < length) {\n        var entry = entries[index];\n        this.set(entry[0], entry[1]);\n      }\n    }\n\n    // Add methods to `MapCache`.\n    MapCache.prototype.clear = mapCacheClear;\n    MapCache.prototype[\'delete\'] = mapCacheDelete;\n    MapCache.prototype.get = mapCacheGet;\n    MapCache.prototype.has = mapCacheHas;\n    MapCache.prototype.set = mapCacheSet;\n\n    /** Error message constants. */\n    var FUNC_ERROR_TEXT = \'Expected a function\';\n\n    /**\n     * Creates a function that memoizes the result of `func`. If `resolver` is\n     * provided, it determines the cache key for storing the result based on the\n     * arguments provided to the memoized function. By default, the first argument\n     * provided to the memoized function is used as the map cache key. The `func`\n     * is invoked with the `this` binding of the memoized function.\n     *\n     * **Note:** The cache is exposed as the `cache` property on the memoized\n     * function. Its creation may be customized by replacing the `_.memoize.Cache`\n     * constructor with one whose instances implement the\n     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)\n     * method interface of `clear`, `delete`, `get`, `has`, and `set`.\n     *\n     * @static\n     * @memberOf _\n     * @since 0.1.0\n     * @category Function\n     * @param {Function} func The function to have its output memoized.\n     * @param {Function} [resolver] The function to resolve the cache key.\n     * @returns {Function} Returns the new memoized function.\n     * @example\n     *\n     * var object = { \'a\': 1, \'b\': 2 };\n     * var other = { \'c\': 3, \'d\': 4 };\n     *\n     * var values = _.memoize(_.values);\n     * values(object);\n     * // => [1, 2]\n     *\n     * values(other);\n     * // => [3, 4]\n     *\n     * object.a = 2;\n     * values(object);\n     * // => [1, 2]\n     *\n     * // Modify the result cache.\n     * values.cache.set(object, [\'a\', \'b\']);\n     * values(object);\n     * // => [\'a\', \'b\']\n     *\n     * // Replace `_.memoize.Cache`.\n     * _.memoize.Cache = WeakMap;\n     */\n    function memoize(func, resolver) {\n      if (typeof func != \'function\' || (resolver != null && typeof resolver != \'function\')) {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      var memoized = function() {\n        var args = arguments,\n            key = resolver ? resolver.apply(this, args) : args[0],\n            cache = memoized.cache;\n\n        if (cache.has(key)) {\n          return cache.get(key);\n        }\n        var result = func.apply(this, args);\n        memoized.cache = cache.set(key, result) || cache;\n        return result;\n      };\n      memoized.cache = new (memoize.Cache || MapCache);\n      return memoized;\n    }\n\n    // Expose `MapCache`.\n    memoize.Cache = MapCache;\n\n    const numberToByteArray = (num, byteLength = getNumberByteLength(num)) => {\n        var byteArray;\n        if (byteLength == 1) {\n            byteArray = new DataView(new ArrayBuffer(1));\n            byteArray.setUint8(0, num);\n        }\n        else if (byteLength == 2) {\n            byteArray = new DataView(new ArrayBuffer(2));\n            byteArray.setUint16(0, num);\n        }\n        else if (byteLength == 3) {\n            byteArray = new DataView(new ArrayBuffer(3));\n            byteArray.setUint8(0, num >> 16);\n            byteArray.setUint16(1, num & 0xffff);\n        }\n        else if (byteLength == 4) {\n            byteArray = new DataView(new ArrayBuffer(4));\n            byteArray.setUint32(0, num);\n        }\n        else if (num < 0xffffffff) {\n            byteArray = new DataView(new ArrayBuffer(5));\n            byteArray.setUint32(1, num);\n        }\n        else if (byteLength == 5) {\n            byteArray = new DataView(new ArrayBuffer(5));\n            byteArray.setUint8(0, num / 0x100000000 | 0);\n            byteArray.setUint32(1, num % 0x100000000);\n        }\n        else if (byteLength == 6) {\n            byteArray = new DataView(new ArrayBuffer(6));\n            byteArray.setUint16(0, num / 0x100000000 | 0);\n            byteArray.setUint32(2, num % 0x100000000);\n        }\n        else if (byteLength == 7) {\n            byteArray = new DataView(new ArrayBuffer(7));\n            byteArray.setUint8(0, num / 0x1000000000000 | 0);\n            byteArray.setUint16(1, num / 0x100000000 & 0xffff);\n            byteArray.setUint32(3, num % 0x100000000);\n        }\n        else if (byteLength == 8) {\n            byteArray = new DataView(new ArrayBuffer(8));\n            byteArray.setUint32(0, num / 0x100000000 | 0);\n            byteArray.setUint32(4, num % 0x100000000);\n        }\n        else {\n            throw new Error("EBML.typedArrayUtils.numberToByteArray: byte length must be less than or equal to 8");\n        }\n        return new Uint8Array(byteArray.buffer);\n    };\n    const stringToByteArray = memoize((str) => {\n        return Uint8Array.from(Array.from(str).map(_ => _.codePointAt(0)));\n    });\n    function getNumberByteLength(num) {\n        if (num < 0) {\n            throw new Error("EBML.typedArrayUtils.getNumberByteLength: negative number not implemented");\n        }\n        else if (num < 0x100) {\n            return 1;\n        }\n        else if (num < 0x10000) {\n            return 2;\n        }\n        else if (num < 0x1000000) {\n            return 3;\n        }\n        else if (num < 0x100000000) {\n            return 4;\n        }\n        else if (num < 0x10000000000) {\n            return 5;\n        }\n        else if (num < 0x1000000000000) {\n            return 6;\n        }\n        else if (num < 0x20000000000000) {\n            return 7;\n        }\n        else {\n            throw new Error("EBML.typedArrayUtils.getNumberByteLength: number exceeds Number.MAX_SAFE_INTEGER");\n        }\n    }\n    const int16Bit = memoize((num) => {\n        const ab = new ArrayBuffer(2);\n        new DataView(ab).setInt16(0, num);\n        return new Uint8Array(ab);\n    });\n    const float32bit = memoize((num) => {\n        const ab = new ArrayBuffer(4);\n        new DataView(ab).setFloat32(0, num);\n        return new Uint8Array(ab);\n    });\n    const dumpBytes = (b) => {\n        return Array.from(new Uint8Array(b)).map(_ => `0x${_.toString(16)}`).join(", ");\n    };\n\n    class Value {\n        constructor(bytes) {\n            this.bytes = bytes;\n        }\n        write(buf, pos) {\n            buf.set(this.bytes, pos);\n            return pos + this.bytes.length;\n        }\n        countSize() {\n            return this.bytes.length;\n        }\n    }\n    class Element {\n        constructor(id, children, isSizeUnknown) {\n            this.id = id;\n            this.children = children;\n            const bodySize = this.children.reduce((p, c) => p + c.countSize(), 0);\n            this.sizeMetaData = isSizeUnknown ?\n                UNKNOWN_SIZE :\n                vintEncode(numberToByteArray(bodySize, getEBMLByteLength(bodySize)));\n            this.size = this.id.length + this.sizeMetaData.length + bodySize;\n        }\n        write(buf, pos) {\n            buf.set(this.id, pos);\n            buf.set(this.sizeMetaData, pos + this.id.length);\n            return this.children.reduce((p, c) => c.write(buf, p), pos + this.id.length + this.sizeMetaData.length);\n        }\n        countSize() {\n            return this.size;\n        }\n    }\n    const bytes = memoize((data) => {\n        return new Value(data);\n    });\n    const number = memoize((num) => {\n        return bytes(numberToByteArray(num));\n    });\n    const vintEncodedNumber = memoize((num) => {\n        return bytes(vintEncode(numberToByteArray(num, getEBMLByteLength(num))));\n    });\n    const int16 = memoize((num) => {\n        return bytes(int16Bit(num));\n    });\n    const float = memoize((num) => {\n        return bytes(float32bit(num));\n    });\n    const string = memoize((str) => {\n        return bytes(stringToByteArray(str));\n    });\n    const element = (id, child) => {\n        return new Element(id, Array.isArray(child) ? child : [child], false);\n    };\n    const unknownSizeElement = (id, child) => {\n        return new Element(id, Array.isArray(child) ? child : [child], true);\n    };\n    const build = (v) => {\n        const b = new Uint8Array(v.countSize());\n        v.write(b, 0);\n        return b;\n    };\n    const getEBMLByteLength = (num) => {\n        if (num < 0x7f) {\n            return 1;\n        }\n        else if (num < 0x3fff) {\n            return 2;\n        }\n        else if (num < 0x1fffff) {\n            return 3;\n        }\n        else if (num < 0xfffffff) {\n            return 4;\n        }\n        else if (num < 0x7ffffffff) {\n            return 5;\n        }\n        else if (num < 0x3ffffffffff) {\n            return 6;\n        }\n        else if (num < 0x1ffffffffffff) {\n            return 7;\n        }\n        else if (num < 0x20000000000000) {\n            return 8;\n        }\n        else if (num < 0xffffffffffffff) {\n            throw new Error("EBMLgetEBMLByteLength: number exceeds Number.MAX_SAFE_INTEGER");\n        }\n        else {\n            throw new Error("EBMLgetEBMLByteLength: data size must be less than or equal to " + (Math.pow(2, 56) - 2));\n        }\n    };\n    const UNKNOWN_SIZE = new Uint8Array([0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);\n    const vintEncode = (byteArray) => {\n        byteArray[0] = getSizeMask(byteArray.length) | byteArray[0];\n        return byteArray;\n    };\n    const getSizeMask = (byteLength) => {\n        return 0x80 >> (byteLength - 1);\n    };\n\n    /**\n     * @see https://www.matroska.org/technical/specs/index.html\n     */\n    const ID = {\n        EBML: Uint8Array.of(0x1A, 0x45, 0xDF, 0xA3),\n        EBMLVersion: Uint8Array.of(0x42, 0x86),\n        EBMLReadVersion: Uint8Array.of(0x42, 0xF7),\n        EBMLMaxIDLength: Uint8Array.of(0x42, 0xF2),\n        EBMLMaxSizeLength: Uint8Array.of(0x42, 0xF3),\n        DocType: Uint8Array.of(0x42, 0x82),\n        DocTypeVersion: Uint8Array.of(0x42, 0x87),\n        DocTypeReadVersion: Uint8Array.of(0x42, 0x85),\n        Void: Uint8Array.of(0xEC),\n        CRC32: Uint8Array.of(0xBF),\n        Segment: Uint8Array.of(0x18, 0x53, 0x80, 0x67),\n        SeekHead: Uint8Array.of(0x11, 0x4D, 0x9B, 0x74),\n        Seek: Uint8Array.of(0x4D, 0xBB),\n        SeekID: Uint8Array.of(0x53, 0xAB),\n        SeekPosition: Uint8Array.of(0x53, 0xAC),\n        Info: Uint8Array.of(0x15, 0x49, 0xA9, 0x66),\n        SegmentUID: Uint8Array.of(0x73, 0xA4),\n        SegmentFilename: Uint8Array.of(0x73, 0x84),\n        PrevUID: Uint8Array.of(0x3C, 0xB9, 0x23),\n        PrevFilename: Uint8Array.of(0x3C, 0x83, 0xAB),\n        NextUID: Uint8Array.of(0x3E, 0xB9, 0x23),\n        NextFilename: Uint8Array.of(0x3E, 0x83, 0xBB),\n        SegmentFamily: Uint8Array.of(0x44, 0x44),\n        ChapterTranslate: Uint8Array.of(0x69, 0x24),\n        ChapterTranslateEditionUID: Uint8Array.of(0x69, 0xFC),\n        ChapterTranslateCodec: Uint8Array.of(0x69, 0xBF),\n        ChapterTranslateID: Uint8Array.of(0x69, 0xA5),\n        TimecodeScale: Uint8Array.of(0x2A, 0xD7, 0xB1),\n        Duration: Uint8Array.of(0x44, 0x89),\n        DateUTC: Uint8Array.of(0x44, 0x61),\n        Title: Uint8Array.of(0x7B, 0xA9),\n        MuxingApp: Uint8Array.of(0x4D, 0x80),\n        WritingApp: Uint8Array.of(0x57, 0x41),\n        Cluster: Uint8Array.of(0x1F, 0x43, 0xB6, 0x75),\n        Timecode: Uint8Array.of(0xE7),\n        SilentTracks: Uint8Array.of(0x58, 0x54),\n        SilentTrackNumber: Uint8Array.of(0x58, 0xD7),\n        Position: Uint8Array.of(0xA7),\n        PrevSize: Uint8Array.of(0xAB),\n        SimpleBlock: Uint8Array.of(0xA3),\n        BlockGroup: Uint8Array.of(0xA0),\n        Block: Uint8Array.of(0xA1),\n        BlockAdditions: Uint8Array.of(0x75, 0xA1),\n        BlockMore: Uint8Array.of(0xA6),\n        BlockAddID: Uint8Array.of(0xEE),\n        BlockAdditional: Uint8Array.of(0xA5),\n        BlockDuration: Uint8Array.of(0x9B),\n        ReferencePriority: Uint8Array.of(0xFA),\n        ReferenceBlock: Uint8Array.of(0xFB),\n        CodecState: Uint8Array.of(0xA4),\n        DiscardPadding: Uint8Array.of(0x75, 0xA2),\n        Slices: Uint8Array.of(0x8E),\n        TimeSlice: Uint8Array.of(0xE8),\n        LaceNumber: Uint8Array.of(0xCC),\n        Tracks: Uint8Array.of(0x16, 0x54, 0xAE, 0x6B),\n        TrackEntry: Uint8Array.of(0xAE),\n        TrackNumber: Uint8Array.of(0xD7),\n        TrackUID: Uint8Array.of(0x73, 0xC5),\n        TrackType: Uint8Array.of(0x83),\n        FlagEnabled: Uint8Array.of(0xB9),\n        FlagDefault: Uint8Array.of(0x88),\n        FlagForced: Uint8Array.of(0x55, 0xAA),\n        FlagLacing: Uint8Array.of(0x9C),\n        MinCache: Uint8Array.of(0x6D, 0xE7),\n        MaxCache: Uint8Array.of(0x6D, 0xF8),\n        DefaultDuration: Uint8Array.of(0x23, 0xE3, 0x83),\n        DefaultDecodedFieldDuration: Uint8Array.of(0x23, 0x4E, 0x7A),\n        MaxBlockAdditionID: Uint8Array.of(0x55, 0xEE),\n        Name: Uint8Array.of(0x53, 0x6E),\n        Language: Uint8Array.of(0x22, 0xB5, 0x9C),\n        CodecID: Uint8Array.of(0x86),\n        CodecPrivate: Uint8Array.of(0x63, 0xA2),\n        CodecName: Uint8Array.of(0x25, 0x86, 0x88),\n        AttachmentLink: Uint8Array.of(0x74, 0x46),\n        CodecDecodeAll: Uint8Array.of(0xAA),\n        TrackOverlay: Uint8Array.of(0x6F, 0xAB),\n        CodecDelay: Uint8Array.of(0x56, 0xAA),\n        SeekPreRoll: Uint8Array.of(0x56, 0xBB),\n        TrackTranslate: Uint8Array.of(0x66, 0x24),\n        TrackTranslateEditionUID: Uint8Array.of(0x66, 0xFC),\n        TrackTranslateCodec: Uint8Array.of(0x66, 0xBF),\n        TrackTranslateTrackID: Uint8Array.of(0x66, 0xA5),\n        Video: Uint8Array.of(0xE0),\n        FlagInterlaced: Uint8Array.of(0x9A),\n        FieldOrder: Uint8Array.of(0x9D),\n        StereoMode: Uint8Array.of(0x53, 0xB8),\n        AlphaMode: Uint8Array.of(0x53, 0xC0),\n        PixelWidth: Uint8Array.of(0xB0),\n        PixelHeight: Uint8Array.of(0xBA),\n        PixelCropBottom: Uint8Array.of(0x54, 0xAA),\n        PixelCropTop: Uint8Array.of(0x54, 0xBB),\n        PixelCropLeft: Uint8Array.of(0x54, 0xCC),\n        PixelCropRight: Uint8Array.of(0x54, 0xDD),\n        DisplayWidth: Uint8Array.of(0x54, 0xB0),\n        DisplayHeight: Uint8Array.of(0x54, 0xBA),\n        DisplayUnit: Uint8Array.of(0x54, 0xB2),\n        AspectRatioType: Uint8Array.of(0x54, 0xB3),\n        ColourSpace: Uint8Array.of(0x2E, 0xB5, 0x24),\n        Colour: Uint8Array.of(0x55, 0xB0),\n        MatrixCoefficients: Uint8Array.of(0x55, 0xB1),\n        BitsPerChannel: Uint8Array.of(0x55, 0xB2),\n        ChromaSubsamplingHorz: Uint8Array.of(0x55, 0xB3),\n        ChromaSubsamplingVert: Uint8Array.of(0x55, 0xB4),\n        CbSubsamplingHorz: Uint8Array.of(0x55, 0xB5),\n        CbSubsamplingVert: Uint8Array.of(0x55, 0xB6),\n        ChromaSitingHorz: Uint8Array.of(0x55, 0xB7),\n        ChromaSitingVert: Uint8Array.of(0x55, 0xB8),\n        Range: Uint8Array.of(0x55, 0xB9),\n        TransferCharacteristics: Uint8Array.of(0x55, 0xBA),\n        Primaries: Uint8Array.of(0x55, 0xBB),\n        MaxCLL: Uint8Array.of(0x55, 0xBC),\n        MaxFALL: Uint8Array.of(0x55, 0xBD),\n        MasteringMetadata: Uint8Array.of(0x55, 0xD0),\n        PrimaryRChromaticityX: Uint8Array.of(0x55, 0xD1),\n        PrimaryRChromaticityY: Uint8Array.of(0x55, 0xD2),\n        PrimaryGChromaticityX: Uint8Array.of(0x55, 0xD3),\n        PrimaryGChromaticityY: Uint8Array.of(0x55, 0xD4),\n        PrimaryBChromaticityX: Uint8Array.of(0x55, 0xD5),\n        PrimaryBChromaticityY: Uint8Array.of(0x55, 0xD6),\n        WhitePointChromaticityX: Uint8Array.of(0x55, 0xD7),\n        WhitePointChromaticityY: Uint8Array.of(0x55, 0xD8),\n        LuminanceMax: Uint8Array.of(0x55, 0xD9),\n        LuminanceMin: Uint8Array.of(0x55, 0xDA),\n        Audio: Uint8Array.of(0xE1),\n        SamplingFrequency: Uint8Array.of(0xB5),\n        OutputSamplingFrequency: Uint8Array.of(0x78, 0xB5),\n        Channels: Uint8Array.of(0x9F),\n        BitDepth: Uint8Array.of(0x62, 0x64),\n        TrackOperation: Uint8Array.of(0xE2),\n        TrackCombinePlanes: Uint8Array.of(0xE3),\n        TrackPlane: Uint8Array.of(0xE4),\n        TrackPlaneUID: Uint8Array.of(0xE5),\n        TrackPlaneType: Uint8Array.of(0xE6),\n        TrackJoinBlocks: Uint8Array.of(0xE9),\n        TrackJoinUID: Uint8Array.of(0xED),\n        ContentEncodings: Uint8Array.of(0x6D, 0x80),\n        ContentEncoding: Uint8Array.of(0x62, 0x40),\n        ContentEncodingOrder: Uint8Array.of(0x50, 0x31),\n        ContentEncodingScope: Uint8Array.of(0x50, 0x32),\n        ContentEncodingType: Uint8Array.of(0x50, 0x33),\n        ContentCompression: Uint8Array.of(0x50, 0x34),\n        ContentCompAlgo: Uint8Array.of(0x42, 0x54),\n        ContentCompSettings: Uint8Array.of(0x42, 0x55),\n        ContentEncryption: Uint8Array.of(0x50, 0x35),\n        ContentEncAlgo: Uint8Array.of(0x47, 0xE1),\n        ContentEncKeyID: Uint8Array.of(0x47, 0xE2),\n        ContentSignature: Uint8Array.of(0x47, 0xE3),\n        ContentSigKeyID: Uint8Array.of(0x47, 0xE4),\n        ContentSigAlgo: Uint8Array.of(0x47, 0xE5),\n        ContentSigHashAlgo: Uint8Array.of(0x47, 0xE6),\n        Cues: Uint8Array.of(0x1C, 0x53, 0xBB, 0x6B),\n        CuePoint: Uint8Array.of(0xBB),\n        CueTime: Uint8Array.of(0xB3),\n        CueTrackPositions: Uint8Array.of(0xB7),\n        CueTrack: Uint8Array.of(0xF7),\n        CueClusterPosition: Uint8Array.of(0xF1),\n        CueRelativePosition: Uint8Array.of(0xF0),\n        CueDuration: Uint8Array.of(0xB2),\n        CueBlockNumber: Uint8Array.of(0x53, 0x78),\n        CueCodecState: Uint8Array.of(0xEA),\n        CueReference: Uint8Array.of(0xDB),\n        CueRefTime: Uint8Array.of(0x96),\n        Attachments: Uint8Array.of(0x19, 0x41, 0xA4, 0x69),\n        AttachedFile: Uint8Array.of(0x61, 0xA7),\n        FileDescription: Uint8Array.of(0x46, 0x7E),\n        FileName: Uint8Array.of(0x46, 0x6E),\n        FileMimeType: Uint8Array.of(0x46, 0x60),\n        FileData: Uint8Array.of(0x46, 0x5C),\n        FileUID: Uint8Array.of(0x46, 0xAE),\n        Chapters: Uint8Array.of(0x10, 0x43, 0xA7, 0x70),\n        EditionEntry: Uint8Array.of(0x45, 0xB9),\n        EditionUID: Uint8Array.of(0x45, 0xBC),\n        EditionFlagHidden: Uint8Array.of(0x45, 0xBD),\n        EditionFlagDefault: Uint8Array.of(0x45, 0xDB),\n        EditionFlagOrdered: Uint8Array.of(0x45, 0xDD),\n        ChapterAtom: Uint8Array.of(0xB6),\n        ChapterUID: Uint8Array.of(0x73, 0xC4),\n        ChapterStringUID: Uint8Array.of(0x56, 0x54),\n        ChapterTimeStart: Uint8Array.of(0x91),\n        ChapterTimeEnd: Uint8Array.of(0x92),\n        ChapterFlagHidden: Uint8Array.of(0x98),\n        ChapterFlagEnabled: Uint8Array.of(0x45, 0x98),\n        ChapterSegmentUID: Uint8Array.of(0x6E, 0x67),\n        ChapterSegmentEditionUID: Uint8Array.of(0x6E, 0xBC),\n        ChapterPhysicalEquiv: Uint8Array.of(0x63, 0xC3),\n        ChapterTrack: Uint8Array.of(0x8F),\n        ChapterTrackNumber: Uint8Array.of(0x89),\n        ChapterDisplay: Uint8Array.of(0x80),\n        ChapString: Uint8Array.of(0x85),\n        ChapLanguage: Uint8Array.of(0x43, 0x7C),\n        ChapCountry: Uint8Array.of(0x43, 0x7E),\n        ChapProcess: Uint8Array.of(0x69, 0x44),\n        ChapProcessCodecID: Uint8Array.of(0x69, 0x55),\n        ChapProcessPrivate: Uint8Array.of(0x45, 0x0D),\n        ChapProcessCommand: Uint8Array.of(0x69, 0x11),\n        ChapProcessTime: Uint8Array.of(0x69, 0x22),\n        ChapProcessData: Uint8Array.of(0x69, 0x33),\n        Tags: Uint8Array.of(0x12, 0x54, 0xC3, 0x67),\n        Tag: Uint8Array.of(0x73, 0x73),\n        Targets: Uint8Array.of(0x63, 0xC0),\n        TargetTypeValue: Uint8Array.of(0x68, 0xCA),\n        TargetType: Uint8Array.of(0x63, 0xCA),\n        TagTrackUID: Uint8Array.of(0x63, 0xC5),\n        TagEditionUID: Uint8Array.of(0x63, 0xC9),\n        TagChapterUID: Uint8Array.of(0x63, 0xC4),\n        TagAttachmentUID: Uint8Array.of(0x63, 0xC6),\n        SimpleTag: Uint8Array.of(0x67, 0xC8),\n        TagName: Uint8Array.of(0x45, 0xA3),\n        TagLanguage: Uint8Array.of(0x44, 0x7A),\n        TagDefault: Uint8Array.of(0x44, 0x84),\n        TagString: Uint8Array.of(0x44, 0x87),\n        TagBinary: Uint8Array.of(0x44, 0x85),\n    };\n\n\n\n    var EBML = /*#__PURE__*/Object.freeze({\n        Value: Value,\n        Element: Element,\n        bytes: bytes,\n        number: number,\n        vintEncodedNumber: vintEncodedNumber,\n        int16: int16,\n        float: float,\n        string: string,\n        element: element,\n        unknownSizeElement: unknownSizeElement,\n        build: build,\n        getEBMLByteLength: getEBMLByteLength,\n        UNKNOWN_SIZE: UNKNOWN_SIZE,\n        vintEncode: vintEncode,\n        getSizeMask: getSizeMask,\n        ID: ID,\n        numberToByteArray: numberToByteArray,\n        stringToByteArray: stringToByteArray,\n        getNumberByteLength: getNumberByteLength,\n        int16Bit: int16Bit,\n        float32bit: float32bit,\n        dumpBytes: dumpBytes\n    });\n\n    /***\n     * The EMBL builder is from simple-ebml-builder\n     * \n     * Copyright 2017 ryiwamoto\n     * \n     * @author ryiwamoto, qli5\n     * \n     * Permission is hereby granted, free of charge, to any person obtaining\n     * a copy of this software and associated documentation files (the\n     * "Software"), to deal in the Software without restriction, including \n     * without limitation the rights to use, copy, modify, merge, publish, \n     * distribute, sublicense, and/or sell copies of the Software, and to \n     * permit persons to whom the Software is furnished to do so, subject \n     * to the following conditions:\n     * \n     * The above copyright notice and this permission notice shall be \n     * included in all copies or substantial portions of the Software.\n     * \n     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS \n     * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, \n     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL \n     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR \n     * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, \n     * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER \n     * DEALINGS IN THE SOFTWARE.\n     */\n\n    /***\n     * Copyright (C) 2018 Qli5. All Rights Reserved.\n     * \n     * @author qli5 <goodlq11[at](163|gmail).com>\n     * \n     * This Source Code Form is subject to the terms of the Mozilla Public\n     * License, v. 2.0. If a copy of the MPL was not distributed with this\n     * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n    */\n\n    /**\n     * @typedef {Object} AssBlock\n     * @property {number} track \n     * @property {Uint8Array} frame \n     * @property {number} timestamp \n     * @property {number} duration \n     */\n\n    class MKV {\n        constructor(config) {\n            this.min = true;\n            this.onprogress = null;\n            Object.assign(this, config);\n            this.segmentUID = MKV.randomBytes(16);\n            this.trackUIDBase = Math.trunc(Math.random() * 2 ** 16);\n            this.trackMetadata = { h264: null, aac: null, assList: [] };\n            this.duration = 0;\n            /** @type {{ h264: any[]; aac: any[]; assList: AssBlock[][]; }} */\n            this.blocks = { h264: [], aac: [], assList: [] };\n        }\n\n        static randomBytes(num) {\n            return Array.from(new Array(num), () => Math.trunc(Math.random() * 256));\n        }\n\n        static textToMS(str) {\n            const [, h, mm, ss, ms10] = str.match(/(\\d+):(\\d+):(\\d+).(\\d+)/);\n            return h * 3600000 + mm * 60000 + ss * 1000 + ms10 * 10;\n        }\n\n        static mimeToCodecID(str) {\n            if (str.startsWith(\'avc1\')) {\n                return \'V_MPEG4/ISO/AVC\';\n            }\n            else if (str.startsWith(\'mp4a\')) {\n                return \'A_AAC\';\n            }\n            else {\n                throw new Error(`MKVRemuxer: unknown codec ${str}`);\n            }\n        }\n\n        static uint8ArrayConcat(...array) {\n            // if (Array.isArray(array[0])) array = array[0];\n            if (array.length == 1) return array[0];\n            if (typeof Buffer != \'undefined\') return Buffer.concat(array);\n            const ret = new Uint8Array(array.reduce((i, j) => i + j.byteLength, 0));\n            let length = 0;\n            for (let e of array) {\n                ret.set(e, length);\n                length += e.byteLength;\n            }\n            return ret;\n        }\n\n        addH264Metadata(h264) {\n            this.trackMetadata.h264 = {\n                codecId: MKV.mimeToCodecID(h264.codec),\n                codecPrivate: h264.avcc,\n                defaultDuration: h264.refSampleDuration * 1000000,\n                pixelWidth: h264.codecWidth,\n                pixelHeight: h264.codecHeight,\n                displayWidth: h264.presentWidth,\n                displayHeight: h264.presentHeight\n            };\n            this.duration = Math.max(this.duration, h264.duration);\n        }\n\n        addAACMetadata(aac) {\n            this.trackMetadata.aac = {\n                codecId: MKV.mimeToCodecID(aac.originalCodec),\n                codecPrivate: aac.configRaw,\n                defaultDuration: aac.refSampleDuration * 1000000,\n                samplingFrequence: aac.audioSampleRate,\n                channels: aac.channelCount\n            };\n            this.duration = Math.max(this.duration, aac.duration);\n        }\n\n        /**\n         * @param {import("../demuxer/ass").ASS} ass \n         * @param {string} name \n         */\n        addASSMetadata(ass, name = "") {\n            this.trackMetadata.assList.push({\n                codecId: \'S_TEXT/ASS\',\n                codecPrivate: new _TextEncoder().encode(ass.header),\n                name,\n                _info: ass.info,\n                _styles: ass.styles,\n            });\n        }\n\n        addH264Stream(h264) {\n            this.blocks.h264 = this.blocks.h264.concat(h264.samples.map(e => ({\n                track: 1,\n                frame: MKV.uint8ArrayConcat(...e.units.map(i => i.data)),\n                isKeyframe: e.isKeyframe,\n                discardable: Boolean(e.refIdc),\n                timestamp: e.pts,\n                simple: true,\n            })));\n        }\n\n        addAACStream(aac) {\n            this.blocks.aac = this.blocks.aac.concat(aac.samples.map(e => ({\n                track: 2,\n                frame: e.unit,\n                timestamp: e.pts,\n                simple: true,\n            })));\n        }\n\n        /**\n         * @param {import("../demuxer/ass").ASS} ass \n         */\n        addASSStream(ass) {\n            const n = this.blocks.assList.length;\n            const lineBlocks = ass.lines.map((e, i) => ({\n                track: 3 + n,\n                frame: new _TextEncoder().encode(`${i},${e[\'Layer\'] || \'\'},${e[\'Style\'] || \'\'},${e[\'Name\'] || \'\'},${e[\'MarginL\'] || \'\'},${e[\'MarginR\'] || \'\'},${e[\'MarginV\'] || \'\'},${e[\'Effect\'] || \'\'},${e[\'Text\'] || \'\'}`),\n                timestamp: MKV.textToMS(e[\'Start\']),\n                duration: MKV.textToMS(e[\'End\']) - MKV.textToMS(e[\'Start\']),\n            }));\n            this.blocks.assList.push(lineBlocks);\n        }\n\n        combineSubtitles() {\n            const [firstB, ...restB] = this.blocks.assList;\n            const l = Math.min(this.blocks.assList.length, this.trackMetadata.assList.length);\n            /**\n             * @param {AssBlock} a \n             * @param {AssBlock} b \n             */\n            const sortFn = (a, b) => {\n                return a.timestamp - b.timestamp\n            };\n            restB.forEach((a, n) => {\n                this.blocks.assList.push(\n                    a.concat(firstB).sort(sortFn).map((x) => {\n                        return {\n                            track: 3 + l + n,\n                            frame: x.frame,\n                            timestamp: x.timestamp,\n                            duration: x.duration,\n                        }\n                    })\n                );\n            });\n            const [firstM, ...restM] = this.trackMetadata.assList;\n            restM.forEach((a) => {\n                const name = `${firstM.name} + ${a.name}`;\n                const info = firstM._info.replace(/^(Title:.+)$/m, `$1 ${name}`);\n                const firstStyles = firstM._styles.split(/\\r?\\n+/).filter(x => !!x);\n                const aStyles = a._styles.split(/\\r?\\n+/).slice(2);\n                const styles = firstStyles.concat(aStyles).join("\\r\\n");\n                const header = info + styles;\n                this.trackMetadata.assList.push({\n                    name: name,\n                    codecId: \'S_TEXT/ASS\',\n                    codecPrivate: new _TextEncoder().encode(header),\n                });\n            });\n        }\n\n        build() {\n            return new _Blob([\n                this.buildHeader(),\n                this.buildBody()\n            ]);\n        }\n\n        buildHeader() {\n            return new _Blob([EBML.build(EBML.element(EBML.ID.EBML, [\n                EBML.element(EBML.ID.EBMLVersion, EBML.number(1)),\n                EBML.element(EBML.ID.EBMLReadVersion, EBML.number(1)),\n                EBML.element(EBML.ID.EBMLMaxIDLength, EBML.number(4)),\n                EBML.element(EBML.ID.EBMLMaxSizeLength, EBML.number(8)),\n                EBML.element(EBML.ID.DocType, EBML.string(\'matroska\')),\n                EBML.element(EBML.ID.DocTypeVersion, EBML.number(4)),\n                EBML.element(EBML.ID.DocTypeReadVersion, EBML.number(2)),\n            ]))]);\n        }\n\n        buildBody() {\n            if (this.min) {\n                return new _Blob([EBML.build(EBML.element(EBML.ID.Segment, [\n                    this.getSegmentInfo(),\n                    this.getTracks(),\n                    ...this.getClusterArray()\n                ]))]);\n            }\n            else {\n                return new _Blob([EBML.build(EBML.element(EBML.ID.Segment, [\n                    this.getSeekHead(),\n                    this.getVoid(4100),\n                    this.getSegmentInfo(),\n                    this.getTracks(),\n                    this.getVoid(1100),\n                    ...this.getClusterArray()\n                ]))]);\n            }\n        }\n\n        getSeekHead() {\n            return EBML.element(EBML.ID.SeekHead, [\n                EBML.element(EBML.ID.Seek, [\n                    EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Info)),\n                    EBML.element(EBML.ID.SeekPosition, EBML.number(4050))\n                ]),\n                EBML.element(EBML.ID.Seek, [\n                    EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Tracks)),\n                    EBML.element(EBML.ID.SeekPosition, EBML.number(4200))\n                ]),\n            ]);\n        }\n\n        getVoid(length = 2000) {\n            return EBML.element(EBML.ID.Void, EBML.bytes(new Uint8Array(length)));\n        }\n\n        getSegmentInfo() {\n            return EBML.element(EBML.ID.Info, [\n                EBML.element(EBML.ID.TimecodeScale, EBML.number(1000000)),\n                EBML.element(EBML.ID.MuxingApp, EBML.string(\'flv.js + assparser_qli5 -> simple-ebml-builder\')),\n                EBML.element(EBML.ID.WritingApp, EBML.string(\'flvass2mkv.js by qli5\')),\n                EBML.element(EBML.ID.Duration, EBML.float(this.duration)),\n                EBML.element(EBML.ID.SegmentUID, EBML.bytes(this.segmentUID)),\n            ]);\n        }\n\n        getTracks() {\n            return EBML.element(EBML.ID.Tracks, [\n                this.getVideoTrackEntry(),\n                this.getAudioTrackEntry(),\n                ...this.getSubtitleTrackEntry(),\n            ]);\n        }\n\n        getVideoTrackEntry() {\n            return EBML.element(EBML.ID.TrackEntry, [\n                EBML.element(EBML.ID.TrackNumber, EBML.number(1)),\n                EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 1)),\n                EBML.element(EBML.ID.TrackType, EBML.number(0x01)),\n                EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.h264.codecId)),\n                EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.h264.codecPrivate)),\n                EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.h264.defaultDuration)),\n                EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n                EBML.element(EBML.ID.Video, [\n                    EBML.element(EBML.ID.PixelWidth, EBML.number(this.trackMetadata.h264.pixelWidth)),\n                    EBML.element(EBML.ID.PixelHeight, EBML.number(this.trackMetadata.h264.pixelHeight)),\n                    EBML.element(EBML.ID.DisplayWidth, EBML.number(this.trackMetadata.h264.displayWidth)),\n                    EBML.element(EBML.ID.DisplayHeight, EBML.number(this.trackMetadata.h264.displayHeight)),\n                ]),\n            ]);\n        }\n\n        getAudioTrackEntry() {\n            return EBML.element(EBML.ID.TrackEntry, [\n                EBML.element(EBML.ID.TrackNumber, EBML.number(2)),\n                EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 2)),\n                EBML.element(EBML.ID.TrackType, EBML.number(0x02)),\n                EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.aac.codecId)),\n                EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.aac.codecPrivate)),\n                EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.aac.defaultDuration)),\n                EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n                EBML.element(EBML.ID.Audio, [\n                    EBML.element(EBML.ID.SamplingFrequency, EBML.float(this.trackMetadata.aac.samplingFrequence)),\n                    EBML.element(EBML.ID.Channels, EBML.number(this.trackMetadata.aac.channels)),\n                ]),\n            ]);\n        }\n\n        getSubtitleTrackEntry() {\n            return this.trackMetadata.assList.map((ass, i) => {\n                return EBML.element(EBML.ID.TrackEntry, [\n                    EBML.element(EBML.ID.TrackNumber, EBML.number(3 + i)),\n                    EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 3 + i)),\n                    EBML.element(EBML.ID.TrackType, EBML.number(0x11)),\n                    EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                    EBML.element(EBML.ID.CodecID, EBML.string(ass.codecId)),\n                    EBML.element(EBML.ID.CodecPrivate, EBML.bytes(ass.codecPrivate)),\n                    EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n                    ass.name && EBML.element(EBML.ID.Name, EBML.bytes(new _TextEncoder().encode(ass.name))),\n                ].filter(x => !!x));\n            });\n        }\n\n        getClusterArray() {\n            // H264 codecState\n            this.blocks.h264[0].simple = false;\n            this.blocks.h264[0].codecState = this.trackMetadata.h264.codecPrivate;\n\n            let i = 0;\n            let j = 0;\n            let k = Array.from({ length: this.blocks.assList.length }).fill(0);\n            let clusterTimeCode = 0;\n            let clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];\n            let ret = [clusterContent];\n            const progressThrottler = Math.pow(2, Math.floor(Math.log(this.blocks.h264.length >> 7) / Math.log(2))) - 1;\n            for (i = 0; i < this.blocks.h264.length; i++) {\n                const e = this.blocks.h264[i];\n                for (; j < this.blocks.aac.length; j++) {\n                    if (this.blocks.aac[j].timestamp < e.timestamp) {\n                        clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));\n                    }\n                    else {\n                        break;\n                    }\n                }\n                this.blocks.assList.forEach((ass, n) => {\n                    for (; k[n] < ass.length; k[n]++) {\n                        if (ass[k[n]].timestamp < e.timestamp) {\n                            clusterContent.push(this.getBlocks(ass[k[n]], clusterTimeCode));\n                        }\n                        else {\n                            break;\n                        }\n                    }\n                });\n                if (e.isKeyframe/*  || clusterContent.length > 72 */) {\n                    // start new cluster\n                    clusterTimeCode = e.timestamp;\n                    clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];\n                    ret.push(clusterContent);\n                }\n                clusterContent.push(this.getBlocks(e, clusterTimeCode));\n                if (this.onprogress && !(i & progressThrottler)) this.onprogress({ loaded: i, total: this.blocks.h264.length });\n            }\n            for (; j < this.blocks.aac.length; j++) clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));\n            this.blocks.assList.forEach((ass, n) => {\n                for (; k[n] < ass.length; k[n]++) clusterContent.push(this.getBlocks(ass[k[n]], clusterTimeCode));\n            });\n            if (this.onprogress) this.onprogress({ loaded: i, total: this.blocks.h264.length });\n            if (ret[0].length == 1) ret.shift();\n            ret = ret.map(clusterContent => EBML.element(EBML.ID.Cluster, clusterContent));\n\n            return ret;\n        }\n\n        getBlocks(e, clusterTimeCode) {\n            if (e.simple) {\n                return EBML.element(EBML.ID.SimpleBlock, [\n                    EBML.vintEncodedNumber(e.track),\n                    EBML.int16(e.timestamp - clusterTimeCode),\n                    EBML.bytes(e.isKeyframe ? [128] : [0]),\n                    EBML.bytes(e.frame)\n                ]);\n            }\n            else {\n                let blockGroupContent = [EBML.element(EBML.ID.Block, [\n                    EBML.vintEncodedNumber(e.track),\n                    EBML.int16(e.timestamp - clusterTimeCode),\n                    EBML.bytes([0]),\n                    EBML.bytes(e.frame)\n                ])];\n                if (typeof e.duration != \'undefined\') {\n                    blockGroupContent.push(EBML.element(EBML.ID.BlockDuration, EBML.number(e.duration)));\n                }\n                if (typeof e.codecState != \'undefined\') {\n                    blockGroupContent.push(EBML.element(EBML.ID.CodecState, EBML.bytes(e.codecState)));\n                }\n                return EBML.element(EBML.ID.BlockGroup, blockGroupContent);\n            }\n        }\n    }\n\n    /***\n     * FLV + ASS => MKV transmuxer\n     * Demux FLV into H264 + AAC stream and ASS into line stream; then\n     * remux them into a MKV file.\n     * \n     * @author qli5 <goodlq11[at](163|gmail).com>\n     * \n     * This Source Code Form is subject to the terms of the Mozilla Public\n     * License, v. 2.0. If a copy of the MPL was not distributed with this\n     * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n     * \n     * The FLV demuxer is from flv.js <https://github.com/Bilibili/flv.js/>\n     * by zheng qian <xqq@xqq.im>, licensed under Apache 2.0.\n     * \n     * The EMBL builder is from simple-ebml-builder\n     * <https://www.npmjs.com/package/simple-ebml-builder> by ryiwamoto, \n     * licensed under MIT.\n     */\n\n    /**\n     * @param {Blob|string|ArrayBuffer} x \n     */\n    const getArrayBuffer = (x) => {\n        return new Promise((resolve, reject) => {\n            if (x instanceof _Blob) {\n                const e = new FileReader();\n                e.onload = () => resolve(e.result);\n                e.onerror = reject;\n                e.readAsArrayBuffer(x);\n            }\n            else if (typeof x == \'string\') {\n                const e = new XMLHttpRequest();\n                e.responseType = \'arraybuffer\';\n                e.onload = () => resolve(e.response);\n                e.onerror = reject;\n                e.open(\'get\', x);\n                e.send();\n            }\n            else if (x instanceof ArrayBuffer) {\n                resolve(x);\n            }\n            else {\n                reject(new TypeError(\'flvass2mkv: getArrayBuffer {Blob|string|ArrayBuffer}\'));\n            }\n        })\n    };\n\n    const FLVASS2MKV = class {\n        constructor(config = {}) {\n            this.onflvprogress = null;\n            this.onfileload = null;\n            this.onmkvprogress = null;\n            this.onload = null;\n            Object.assign(this, config);\n            this.mkvConfig = { onprogress: this.onmkvprogress };\n            Object.assign(this.mkvConfig, config.mkvConfig);\n        }\n\n        /**\n         * Demux FLV into H264 + AAC stream and ASS into line stream; then\n         * remux them into a MKV file.\n         * @typedef {Blob|string|ArrayBuffer} F\n         * @param {F} flv \n         * @param {F} ass \n         * @param {{ name: string; file: F; }[]} subtitleAssList\n         */\n        async build(flv = \'./samples/gen_case.flv\', ass = \'./samples/gen_case.ass\', subtitleAssList) {\n            // load flv and ass as arraybuffer\n            await Promise.all([\n                (async () => {\n                    flv = await getArrayBuffer(flv);\n                })(),\n                (async () => {\n                    ass = await getArrayBuffer(ass);\n                })(),\n                (async () => {\n                    subtitleAssList = await Promise.all(\n                        subtitleAssList.map(async ({ name, file }) => {\n                            return { name, file: await getArrayBuffer(file) }\n                        })\n                    );\n                })(),\n            ]);\n\n            if (this.onfileload) this.onfileload();\n\n            const mkv = new MKV(this.mkvConfig);\n\n            const assParser = new ASS();\n            const assData = assParser.parseFile(ass);\n            mkv.addASSMetadata(assData, "\u5F39\u5E55");\n            mkv.addASSStream(assData);\n\n            subtitleAssList.forEach(({ name, file }) => {\n                const subAssData = assParser.parseFile(file);\n                mkv.addASSMetadata(subAssData, name);\n                mkv.addASSStream(subAssData);\n            });\n\n            if (subtitleAssList.length > 0) {\n                mkv.combineSubtitles();\n            }\n\n            const flvProbeData = FLVDemuxer.probe(flv);\n            const flvDemuxer = new FLVDemuxer(flvProbeData);\n            let mediaInfo = null;\n            let h264 = null;\n            let aac = null;\n            flvDemuxer.onDataAvailable = (...array) => {\n                array.forEach(e => {\n                    if (e.type == \'video\') h264 = e;\n                    else if (e.type == \'audio\') aac = e;\n                    else throw new Error(`MKVRemuxer: unrecoginzed data type ${e.type}`);\n                });\n            };\n            flvDemuxer.onMediaInfo = i => mediaInfo = i;\n            flvDemuxer.onTrackMetadata = (i, e) => {\n                if (i == \'video\') mkv.addH264Metadata(e);\n                else if (i == \'audio\') mkv.addAACMetadata(e);\n                else throw new Error(`MKVRemuxer: unrecoginzed metadata type ${i}`);\n            };\n            flvDemuxer.onError = e => { throw new Error(e); };\n            const finalOffset = flvDemuxer.parseChunks(flv, flvProbeData.dataOffset);\n            if (finalOffset != flv.byteLength) throw new Error(\'FLVDemuxer: unexpected EOF\');\n            mkv.addH264Stream(h264);\n            mkv.addAACStream(aac);\n\n            const ret = mkv.build();\n            if (this.onload) this.onload(ret);\n            return ret;\n        }\n    };\n\n    // if nodejs then test\n    if (typeof window == \'undefined\') {\n        if (require.main == module) {\n            (async () => {\n                const fs = require(\'fs\');\n                const assFileName = process.argv.slice(1).find(e => e.includes(\'.ass\')) || \'./samples/gen_case.ass\';\n                const flvFileName = process.argv.slice(1).find(e => e.includes(\'.flv\')) || \'./samples/gen_case.flv\';\n                const assFile = fs.readFileSync(assFileName).buffer;\n                const flvFile = fs.readFileSync(flvFileName).buffer;\n                fs.writeFileSync(\'out.mkv\', await new FLVASS2MKV({ onmkvprogress: console.log.bind(console) }).build(flvFile, assFile));\n            })();\n        }\n    }\n\n    return FLVASS2MKV;\n\n}());\n//# sourceMappingURL=index.js.map\n\n</script>\n    <script>\n        const fileProgress = document.getElementById(\'fileProgress\');\n        const mkvProgress = document.getElementById(\'mkvProgress\');\n        const a = document.getElementById(\'a\');\n        window.exec = async (option, target) => {\n            const defaultOption = {\n                onflvprogress: ({ loaded, total }) => {\n                    fileProgress.value = loaded;\n                    fileProgress.max = total;\n                },\n                onfileload: () => {\n                    console.timeEnd(\'file\');\n                    console.time(\'flvass2mkv\');\n                },\n                onmkvprogress: ({ loaded, total }) => {\n                    mkvProgress.value = loaded;\n                    mkvProgress.max = total;\n                },\n                name: \'merged.mkv\',\n                subtitleAssList: [],\n            };\n            option = Object.assign(defaultOption, option);\n            target.download = a.download = a.textContent = option.name;\n            console.time(\'file\');\n            const mkv = await new FLVASS2MKV(option).build(option.flv, option.ass, option.subtitleAssList);\n            console.timeEnd(\'flvass2mkv\');\n            target.href = a.href = URL.createObjectURL(mkv);\n            target.textContent = "\u53E6\u5B58\u4E3AMKV"\n            target.onclick = () => {\n                window.close()\n            }\n            return a.href\n        };\n        \n    </script>\n</body>\n\n</html>\n';

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var MKVTransmuxer = function () {
    function MKVTransmuxer(option) {
        _classCallCheck(this, MKVTransmuxer);

        this.workerWin = null;
        this.option = option;
    }

    /**
     * FLV + ASS => MKV entry point
     * @param {Blob|string|ArrayBuffer} flv
     * @param {Blob|string|ArrayBuffer} ass 
     * @param {string=} name 
     * @param {Node} target
     * @param {{ name: string; file: (Blob|string|ArrayBuffer); }[]=} subtitleAssList
     */


    _createClass(MKVTransmuxer, [{
        key: 'exec',
        value: function exec(flv, ass, name, target) {
            var subtitleAssList = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

            if (target.textContent != "另存为MKV") {
                target.textContent = "打包中";

                // 1. Allocate for a new window
                if (!this.workerWin) this.workerWin = top.open('', undefined, ' ');

                // 2. Inject scripts
                this.workerWin.document.write(embeddedHTML);
                this.workerWin.document.close();

                // 3. Invoke exec
                if (!(this.option instanceof Object)) this.option = null;
                this.workerWin.exec(Object.assign({}, this.option, { flv: flv, ass: ass, name: name, subtitleAssList: subtitleAssList }), target);
                URL.revokeObjectURL(flv);
                URL.revokeObjectURL(ass);

                // 4. Free parent window
                // if (top.confirm('MKV打包中……要关掉这个窗口，释放内存吗？')) {
                //     top.location = 'about:blank';
                // }
            }
        }
    }]);

    return MKVTransmuxer;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var _navigator = (typeof navigator === 'undefined' ? 'undefined' : _typeof(navigator)) === 'object' && navigator || { userAgent: 'chrome' };

var _TextDecoder = typeof TextDecoder === 'function' && TextDecoder || function (_require$StringDecode) {
    _inherits(_class, _require$StringDecode);

    function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
        key: 'decode',

        /**
         * @param {ArrayBuffer} chunk 
         * @returns {string}
         */
        value: function decode(chunk) {
            return this.end(Buffer.from(chunk));
        }
    }]);

    return _class;
}(require('string_decoder').StringDecoder);

/***
 * The FLV demuxer is from flv.js
 * 
 * Copyright (C) 2016 Bilibili. All Rights Reserved.
 *
 * @author zheng qian <xqq@xqq.im>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import FLVDemuxer from 'flv.js/src/demux/flv-demuxer.js';
// ..import Log from '../utils/logger.js';
var Log = {
    e: console.error.bind(console),
    w: console.warn.bind(console),
    i: console.log.bind(console),
    v: console.log.bind(console)
};

// ..import AMF from './amf-parser.js';
// ....import Log from '../utils/logger.js';
// ....import decodeUTF8 from '../utils/utf8-conv.js';
function checkContinuation(uint8array, start, checkLength) {
    var array = uint8array;
    if (start + checkLength < array.length) {
        while (checkLength--) {
            if ((array[++start] & 0xC0) !== 0x80) return false;
        }
        return true;
    } else {
        return false;
    }
}

function decodeUTF8(uint8array) {
    var out = [];
    var input = uint8array;
    var i = 0;
    var length = uint8array.length;

    while (i < length) {
        if (input[i] < 0x80) {
            out.push(String.fromCharCode(input[i]));
            ++i;
            continue;
        } else if (input[i] < 0xC0) {
            // fallthrough
        } else if (input[i] < 0xE0) {
            if (checkContinuation(input, i, 1)) {
                var ucs4 = (input[i] & 0x1F) << 6 | input[i + 1] & 0x3F;
                if (ucs4 >= 0x80) {
                    out.push(String.fromCharCode(ucs4 & 0xFFFF));
                    i += 2;
                    continue;
                }
            }
        } else if (input[i] < 0xF0) {
            if (checkContinuation(input, i, 2)) {
                var _ucs = (input[i] & 0xF) << 12 | (input[i + 1] & 0x3F) << 6 | input[i + 2] & 0x3F;
                if (_ucs >= 0x800 && (_ucs & 0xF800) !== 0xD800) {
                    out.push(String.fromCharCode(_ucs & 0xFFFF));
                    i += 3;
                    continue;
                }
            }
        } else if (input[i] < 0xF8) {
            if (checkContinuation(input, i, 3)) {
                var _ucs2 = (input[i] & 0x7) << 18 | (input[i + 1] & 0x3F) << 12 | (input[i + 2] & 0x3F) << 6 | input[i + 3] & 0x3F;
                if (_ucs2 > 0x10000 && _ucs2 < 0x110000) {
                    _ucs2 -= 0x10000;
                    out.push(String.fromCharCode(_ucs2 >>> 10 | 0xD800));
                    out.push(String.fromCharCode(_ucs2 & 0x3FF | 0xDC00));
                    i += 4;
                    continue;
                }
            }
        }
        out.push(String.fromCharCode(0xFFFD));
        ++i;
    }

    return out.join('');
}

// ....import {IllegalStateException} from '../utils/exception.js';

var IllegalStateException = function (_Error) {
    _inherits(IllegalStateException, _Error);

    function IllegalStateException() {
        _classCallCheck(this, IllegalStateException);

        return _possibleConstructorReturn(this, (IllegalStateException.__proto__ || Object.getPrototypeOf(IllegalStateException)).apply(this, arguments));
    }

    return IllegalStateException;
}(Error);

var le = function () {
    var buf = new ArrayBuffer(2);
    new DataView(buf).setInt16(0, 256, true); // little-endian write
    return new Int16Array(buf)[0] === 256; // platform-spec read, if equal then LE
}();

var AMF = function () {
    function AMF() {
        _classCallCheck(this, AMF);
    }

    _createClass(AMF, null, [{
        key: 'parseScriptData',
        value: function parseScriptData(arrayBuffer, dataOffset, dataSize) {
            var data = {};

            try {
                var name = AMF.parseValue(arrayBuffer, dataOffset, dataSize);
                var value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);

                data[name.data] = value.data;
            } catch (e) {
                Log.e('AMF', e.toString());
            }

            return data;
        }
    }, {
        key: 'parseObject',
        value: function parseObject(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 3) {
                throw new IllegalStateException('Data not enough when parse ScriptDataObject');
            }
            var name = AMF.parseString(arrayBuffer, dataOffset, dataSize);
            var value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);
            var isObjectEnd = value.objectEnd;

            return {
                data: {
                    name: name.data,
                    value: value.data
                },
                size: name.size + value.size,
                objectEnd: isObjectEnd
            };
        }
    }, {
        key: 'parseVariable',
        value: function parseVariable(arrayBuffer, dataOffset, dataSize) {
            return AMF.parseObject(arrayBuffer, dataOffset, dataSize);
        }
    }, {
        key: 'parseString',
        value: function parseString(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 2) {
                throw new IllegalStateException('Data not enough when parse String');
            }
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var length = v.getUint16(0, !le);

            var str = void 0;
            if (length > 0) {
                str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 2, length));
            } else {
                str = '';
            }

            return {
                data: str,
                size: 2 + length
            };
        }
    }, {
        key: 'parseLongString',
        value: function parseLongString(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 4) {
                throw new IllegalStateException('Data not enough when parse LongString');
            }
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var length = v.getUint32(0, !le);

            var str = void 0;
            if (length > 0) {
                str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 4, length));
            } else {
                str = '';
            }

            return {
                data: str,
                size: 4 + length
            };
        }
    }, {
        key: 'parseDate',
        value: function parseDate(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 10) {
                throw new IllegalStateException('Data size invalid when parse Date');
            }
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var timestamp = v.getFloat64(0, !le);
            var localTimeOffset = v.getInt16(8, !le);
            timestamp += localTimeOffset * 60 * 1000; // get UTC time

            return {
                data: new Date(timestamp),
                size: 8 + 2
            };
        }
    }, {
        key: 'parseValue',
        value: function parseValue(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 1) {
                throw new IllegalStateException('Data not enough when parse Value');
            }

            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var offset = 1;
            var type = v.getUint8(0);
            var value = void 0;
            var objectEnd = false;

            try {
                switch (type) {
                    case 0:
                        // Number(Double) type
                        value = v.getFloat64(1, !le);
                        offset += 8;
                        break;
                    case 1:
                        {
                            // Boolean type
                            var b = v.getUint8(1);
                            value = b ? true : false;
                            offset += 1;
                            break;
                        }
                    case 2:
                        {
                            // String type
                            var amfstr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);
                            value = amfstr.data;
                            offset += amfstr.size;
                            break;
                        }
                    case 3:
                        {
                            // Object(s) type
                            value = {};
                            var terminal = 0; // workaround for malformed Objects which has missing ScriptDataObjectEnd
                            if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
                                terminal = 3;
                            }
                            while (offset < dataSize - 4) {
                                // 4 === type(UI8) + ScriptDataObjectEnd(UI24)
                                var amfobj = AMF.parseObject(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);
                                if (amfobj.objectEnd) break;
                                value[amfobj.data.name] = amfobj.data.value;
                                offset += amfobj.size;
                            }
                            if (offset <= dataSize - 3) {
                                var marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;
                                if (marker === 9) {
                                    offset += 3;
                                }
                            }
                            break;
                        }
                    case 8:
                        {
                            // ECMA array type (Mixed array)
                            value = {};
                            offset += 4; // ECMAArrayLength(UI32)
                            var _terminal = 0; // workaround for malformed MixedArrays which has missing ScriptDataObjectEnd
                            if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
                                _terminal = 3;
                            }
                            while (offset < dataSize - 8) {
                                // 8 === type(UI8) + ECMAArrayLength(UI32) + ScriptDataVariableEnd(UI24)
                                var amfvar = AMF.parseVariable(arrayBuffer, dataOffset + offset, dataSize - offset - _terminal);
                                if (amfvar.objectEnd) break;
                                value[amfvar.data.name] = amfvar.data.value;
                                offset += amfvar.size;
                            }
                            if (offset <= dataSize - 3) {
                                var _marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;
                                if (_marker === 9) {
                                    offset += 3;
                                }
                            }
                            break;
                        }
                    case 9:
                        // ScriptDataObjectEnd
                        value = undefined;
                        offset = 1;
                        objectEnd = true;
                        break;
                    case 10:
                        {
                            // Strict array type
                            // ScriptDataValue[n]. NOTE: according to video_file_format_spec_v10_1.pdf
                            value = [];
                            var strictArrayLength = v.getUint32(1, !le);
                            offset += 4;
                            for (var i = 0; i < strictArrayLength; i++) {
                                var val = AMF.parseValue(arrayBuffer, dataOffset + offset, dataSize - offset);
                                value.push(val.data);
                                offset += val.size;
                            }
                            break;
                        }
                    case 11:
                        {
                            // Date type
                            var date = AMF.parseDate(arrayBuffer, dataOffset + 1, dataSize - 1);
                            value = date.data;
                            offset += date.size;
                            break;
                        }
                    case 12:
                        {
                            // Long string type
                            var amfLongStr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);
                            value = amfLongStr.data;
                            offset += amfLongStr.size;
                            break;
                        }
                    default:
                        // ignore and skip
                        offset = dataSize;
                        Log.w('AMF', 'Unsupported AMF value type ' + type);
                }
            } catch (e) {
                Log.e('AMF', e.toString());
            }

            return {
                data: value,
                size: offset,
                objectEnd: objectEnd
            };
        }
    }]);

    return AMF;
}();

// ..import SPSParser from './sps-parser.js';
// ....import ExpGolomb from './exp-golomb.js';
// ......import {IllegalStateException, InvalidArgumentException} from '../utils/exception.js';


var InvalidArgumentException = function (_Error2) {
    _inherits(InvalidArgumentException, _Error2);

    function InvalidArgumentException() {
        _classCallCheck(this, InvalidArgumentException);

        return _possibleConstructorReturn(this, (InvalidArgumentException.__proto__ || Object.getPrototypeOf(InvalidArgumentException)).apply(this, arguments));
    }

    return InvalidArgumentException;
}(Error);

var ExpGolomb = function () {
    function ExpGolomb(uint8array) {
        _classCallCheck(this, ExpGolomb);

        this.TAG = 'ExpGolomb';

        this._buffer = uint8array;
        this._buffer_index = 0;
        this._total_bytes = uint8array.byteLength;
        this._total_bits = uint8array.byteLength * 8;
        this._current_word = 0;
        this._current_word_bits_left = 0;
    }

    _createClass(ExpGolomb, [{
        key: 'destroy',
        value: function destroy() {
            this._buffer = null;
        }
    }, {
        key: '_fillCurrentWord',
        value: function _fillCurrentWord() {
            var buffer_bytes_left = this._total_bytes - this._buffer_index;
            if (buffer_bytes_left <= 0) throw new IllegalStateException('ExpGolomb: _fillCurrentWord() but no bytes available');

            var bytes_read = Math.min(4, buffer_bytes_left);
            var word = new Uint8Array(4);
            word.set(this._buffer.subarray(this._buffer_index, this._buffer_index + bytes_read));
            this._current_word = new DataView(word.buffer).getUint32(0, false);

            this._buffer_index += bytes_read;
            this._current_word_bits_left = bytes_read * 8;
        }
    }, {
        key: 'readBits',
        value: function readBits(bits) {
            if (bits > 32) throw new InvalidArgumentException('ExpGolomb: readBits() bits exceeded max 32bits!');

            if (bits <= this._current_word_bits_left) {
                var _result = this._current_word >>> 32 - bits;
                this._current_word <<= bits;
                this._current_word_bits_left -= bits;
                return _result;
            }

            var result = this._current_word_bits_left ? this._current_word : 0;
            result = result >>> 32 - this._current_word_bits_left;
            var bits_need_left = bits - this._current_word_bits_left;

            this._fillCurrentWord();
            var bits_read_next = Math.min(bits_need_left, this._current_word_bits_left);

            var result2 = this._current_word >>> 32 - bits_read_next;
            this._current_word <<= bits_read_next;
            this._current_word_bits_left -= bits_read_next;

            result = result << bits_read_next | result2;
            return result;
        }
    }, {
        key: 'readBool',
        value: function readBool() {
            return this.readBits(1) === 1;
        }
    }, {
        key: 'readByte',
        value: function readByte() {
            return this.readBits(8);
        }
    }, {
        key: '_skipLeadingZero',
        value: function _skipLeadingZero() {
            var zero_count = void 0;
            for (zero_count = 0; zero_count < this._current_word_bits_left; zero_count++) {
                if (0 !== (this._current_word & 0x80000000 >>> zero_count)) {
                    this._current_word <<= zero_count;
                    this._current_word_bits_left -= zero_count;
                    return zero_count;
                }
            }
            this._fillCurrentWord();
            return zero_count + this._skipLeadingZero();
        }
    }, {
        key: 'readUEG',
        value: function readUEG() {
            // unsigned exponential golomb
            var leading_zeros = this._skipLeadingZero();
            return this.readBits(leading_zeros + 1) - 1;
        }
    }, {
        key: 'readSEG',
        value: function readSEG() {
            // signed exponential golomb
            var value = this.readUEG();
            if (value & 0x01) {
                return value + 1 >>> 1;
            } else {
                return -1 * (value >>> 1);
            }
        }
    }]);

    return ExpGolomb;
}();

var SPSParser = function () {
    function SPSParser() {
        _classCallCheck(this, SPSParser);
    }

    _createClass(SPSParser, null, [{
        key: '_ebsp2rbsp',
        value: function _ebsp2rbsp(uint8array) {
            var src = uint8array;
            var src_length = src.byteLength;
            var dst = new Uint8Array(src_length);
            var dst_idx = 0;

            for (var i = 0; i < src_length; i++) {
                if (i >= 2) {
                    // Unescape: Skip 0x03 after 00 00
                    if (src[i] === 0x03 && src[i - 1] === 0x00 && src[i - 2] === 0x00) {
                        continue;
                    }
                }
                dst[dst_idx] = src[i];
                dst_idx++;
            }

            return new Uint8Array(dst.buffer, 0, dst_idx);
        }
    }, {
        key: 'parseSPS',
        value: function parseSPS(uint8array) {
            var rbsp = SPSParser._ebsp2rbsp(uint8array);
            var gb = new ExpGolomb(rbsp);

            gb.readByte();
            var profile_idc = gb.readByte(); // profile_idc
            gb.readByte(); // constraint_set_flags[5] + reserved_zero[3]
            var level_idc = gb.readByte(); // level_idc
            gb.readUEG(); // seq_parameter_set_id

            var profile_string = SPSParser.getProfileString(profile_idc);
            var level_string = SPSParser.getLevelString(level_idc);
            var chroma_format_idc = 1;
            var chroma_format = 420;
            var chroma_format_table = [0, 420, 422, 444];
            var bit_depth = 8;

            if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 || profile_idc === 244 || profile_idc === 44 || profile_idc === 83 || profile_idc === 86 || profile_idc === 118 || profile_idc === 128 || profile_idc === 138 || profile_idc === 144) {

                chroma_format_idc = gb.readUEG();
                if (chroma_format_idc === 3) {
                    gb.readBits(1); // separate_colour_plane_flag
                }
                if (chroma_format_idc <= 3) {
                    chroma_format = chroma_format_table[chroma_format_idc];
                }

                bit_depth = gb.readUEG() + 8; // bit_depth_luma_minus8
                gb.readUEG(); // bit_depth_chroma_minus8
                gb.readBits(1); // qpprime_y_zero_transform_bypass_flag
                if (gb.readBool()) {
                    // seq_scaling_matrix_present_flag
                    var scaling_list_count = chroma_format_idc !== 3 ? 8 : 12;
                    for (var i = 0; i < scaling_list_count; i++) {
                        if (gb.readBool()) {
                            // seq_scaling_list_present_flag
                            if (i < 6) {
                                SPSParser._skipScalingList(gb, 16);
                            } else {
                                SPSParser._skipScalingList(gb, 64);
                            }
                        }
                    }
                }
            }
            gb.readUEG(); // log2_max_frame_num_minus4
            var pic_order_cnt_type = gb.readUEG();
            if (pic_order_cnt_type === 0) {
                gb.readUEG(); // log2_max_pic_order_cnt_lsb_minus_4
            } else if (pic_order_cnt_type === 1) {
                gb.readBits(1); // delta_pic_order_always_zero_flag
                gb.readSEG(); // offset_for_non_ref_pic
                gb.readSEG(); // offset_for_top_to_bottom_field
                var num_ref_frames_in_pic_order_cnt_cycle = gb.readUEG();
                for (var _i2 = 0; _i2 < num_ref_frames_in_pic_order_cnt_cycle; _i2++) {
                    gb.readSEG(); // offset_for_ref_frame
                }
            }
            gb.readUEG(); // max_num_ref_frames
            gb.readBits(1); // gaps_in_frame_num_value_allowed_flag

            var pic_width_in_mbs_minus1 = gb.readUEG();
            var pic_height_in_map_units_minus1 = gb.readUEG();

            var frame_mbs_only_flag = gb.readBits(1);
            if (frame_mbs_only_flag === 0) {
                gb.readBits(1); // mb_adaptive_frame_field_flag
            }
            gb.readBits(1); // direct_8x8_inference_flag

            var frame_crop_left_offset = 0;
            var frame_crop_right_offset = 0;
            var frame_crop_top_offset = 0;
            var frame_crop_bottom_offset = 0;

            var frame_cropping_flag = gb.readBool();
            if (frame_cropping_flag) {
                frame_crop_left_offset = gb.readUEG();
                frame_crop_right_offset = gb.readUEG();
                frame_crop_top_offset = gb.readUEG();
                frame_crop_bottom_offset = gb.readUEG();
            }

            var sar_width = 1,
                sar_height = 1;
            var fps = 0,
                fps_fixed = true,
                fps_num = 0,
                fps_den = 0;

            var vui_parameters_present_flag = gb.readBool();
            if (vui_parameters_present_flag) {
                if (gb.readBool()) {
                    // aspect_ratio_info_present_flag
                    var aspect_ratio_idc = gb.readByte();
                    var sar_w_table = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2];
                    var sar_h_table = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33, 99, 3, 2, 1];

                    if (aspect_ratio_idc > 0 && aspect_ratio_idc < 16) {
                        sar_width = sar_w_table[aspect_ratio_idc - 1];
                        sar_height = sar_h_table[aspect_ratio_idc - 1];
                    } else if (aspect_ratio_idc === 255) {
                        sar_width = gb.readByte() << 8 | gb.readByte();
                        sar_height = gb.readByte() << 8 | gb.readByte();
                    }
                }

                if (gb.readBool()) {
                    // overscan_info_present_flag
                    gb.readBool(); // overscan_appropriate_flag
                }
                if (gb.readBool()) {
                    // video_signal_type_present_flag
                    gb.readBits(4); // video_format & video_full_range_flag
                    if (gb.readBool()) {
                        // colour_description_present_flag
                        gb.readBits(24); // colour_primaries & transfer_characteristics & matrix_coefficients
                    }
                }
                if (gb.readBool()) {
                    // chroma_loc_info_present_flag
                    gb.readUEG(); // chroma_sample_loc_type_top_field
                    gb.readUEG(); // chroma_sample_loc_type_bottom_field
                }
                if (gb.readBool()) {
                    // timing_info_present_flag
                    var num_units_in_tick = gb.readBits(32);
                    var time_scale = gb.readBits(32);
                    fps_fixed = gb.readBool(); // fixed_frame_rate_flag

                    fps_num = time_scale;
                    fps_den = num_units_in_tick * 2;
                    fps = fps_num / fps_den;
                }
            }

            var sarScale = 1;
            if (sar_width !== 1 || sar_height !== 1) {
                sarScale = sar_width / sar_height;
            }

            var crop_unit_x = 0,
                crop_unit_y = 0;
            if (chroma_format_idc === 0) {
                crop_unit_x = 1;
                crop_unit_y = 2 - frame_mbs_only_flag;
            } else {
                var sub_wc = chroma_format_idc === 3 ? 1 : 2;
                var sub_hc = chroma_format_idc === 1 ? 2 : 1;
                crop_unit_x = sub_wc;
                crop_unit_y = sub_hc * (2 - frame_mbs_only_flag);
            }

            var codec_width = (pic_width_in_mbs_minus1 + 1) * 16;
            var codec_height = (2 - frame_mbs_only_flag) * ((pic_height_in_map_units_minus1 + 1) * 16);

            codec_width -= (frame_crop_left_offset + frame_crop_right_offset) * crop_unit_x;
            codec_height -= (frame_crop_top_offset + frame_crop_bottom_offset) * crop_unit_y;

            var present_width = Math.ceil(codec_width * sarScale);

            gb.destroy();
            gb = null;

            return {
                profile_string: profile_string, // baseline, high, high10, ...
                level_string: level_string, // 3, 3.1, 4, 4.1, 5, 5.1, ...
                bit_depth: bit_depth, // 8bit, 10bit, ...
                chroma_format: chroma_format, // 4:2:0, 4:2:2, ...
                chroma_format_string: SPSParser.getChromaFormatString(chroma_format),

                frame_rate: {
                    fixed: fps_fixed,
                    fps: fps,
                    fps_den: fps_den,
                    fps_num: fps_num
                },

                sar_ratio: {
                    width: sar_width,
                    height: sar_height
                },

                codec_size: {
                    width: codec_width,
                    height: codec_height
                },

                present_size: {
                    width: present_width,
                    height: codec_height
                }
            };
        }
    }, {
        key: '_skipScalingList',
        value: function _skipScalingList(gb, count) {
            var last_scale = 8,
                next_scale = 8;
            var delta_scale = 0;
            for (var i = 0; i < count; i++) {
                if (next_scale !== 0) {
                    delta_scale = gb.readSEG();
                    next_scale = (last_scale + delta_scale + 256) % 256;
                }
                last_scale = next_scale === 0 ? last_scale : next_scale;
            }
        }
    }, {
        key: 'getProfileString',
        value: function getProfileString(profile_idc) {
            switch (profile_idc) {
                case 66:
                    return 'Baseline';
                case 77:
                    return 'Main';
                case 88:
                    return 'Extended';
                case 100:
                    return 'High';
                case 110:
                    return 'High10';
                case 122:
                    return 'High422';
                case 244:
                    return 'High444';
                default:
                    return 'Unknown';
            }
        }
    }, {
        key: 'getLevelString',
        value: function getLevelString(level_idc) {
            return (level_idc / 10).toFixed(1);
        }
    }, {
        key: 'getChromaFormatString',
        value: function getChromaFormatString(chroma) {
            switch (chroma) {
                case 420:
                    return '4:2:0';
                case 422:
                    return '4:2:2';
                case 444:
                    return '4:4:4';
                default:
                    return 'Unknown';
            }
        }
    }]);

    return SPSParser;
}();

// ..import DemuxErrors from './demux-errors.js';


var DemuxErrors = {
    OK: 'OK',
    FORMAT_ERROR: 'FormatError',
    FORMAT_UNSUPPORTED: 'FormatUnsupported',
    CODEC_UNSUPPORTED: 'CodecUnsupported'
};

// ..import MediaInfo from '../core/media-info.js';

var MediaInfo = function () {
    function MediaInfo() {
        _classCallCheck(this, MediaInfo);

        this.mimeType = null;
        this.duration = null;

        this.hasAudio = null;
        this.hasVideo = null;
        this.audioCodec = null;
        this.videoCodec = null;
        this.audioDataRate = null;
        this.videoDataRate = null;

        this.audioSampleRate = null;
        this.audioChannelCount = null;

        this.width = null;
        this.height = null;
        this.fps = null;
        this.profile = null;
        this.level = null;
        this.chromaFormat = null;
        this.sarNum = null;
        this.sarDen = null;

        this.metadata = null;
        this.segments = null; // MediaInfo[]
        this.segmentCount = null;
        this.hasKeyframesIndex = null;
        this.keyframesIndex = null;
    }

    _createClass(MediaInfo, [{
        key: 'isComplete',
        value: function isComplete() {
            var audioInfoComplete = this.hasAudio === false || this.hasAudio === true && this.audioCodec != null && this.audioSampleRate != null && this.audioChannelCount != null;

            var videoInfoComplete = this.hasVideo === false || this.hasVideo === true && this.videoCodec != null && this.width != null && this.height != null && this.fps != null && this.profile != null && this.level != null && this.chromaFormat != null && this.sarNum != null && this.sarDen != null;

            // keyframesIndex may not be present
            return this.mimeType != null && this.duration != null && this.metadata != null && this.hasKeyframesIndex != null && audioInfoComplete && videoInfoComplete;
        }
    }, {
        key: 'isSeekable',
        value: function isSeekable() {
            return this.hasKeyframesIndex === true;
        }
    }, {
        key: 'getNearestKeyframe',
        value: function getNearestKeyframe(milliseconds) {
            if (this.keyframesIndex == null) {
                return null;
            }

            var table = this.keyframesIndex;
            var keyframeIdx = this._search(table.times, milliseconds);

            return {
                index: keyframeIdx,
                milliseconds: table.times[keyframeIdx],
                fileposition: table.filepositions[keyframeIdx]
            };
        }
    }, {
        key: '_search',
        value: function _search(list, value) {
            var idx = 0;

            var last = list.length - 1;
            var mid = 0;
            var lbound = 0;
            var ubound = last;

            if (value < list[0]) {
                idx = 0;
                lbound = ubound + 1; // skip search
            }

            while (lbound <= ubound) {
                mid = lbound + Math.floor((ubound - lbound) / 2);
                if (mid === last || value >= list[mid] && value < list[mid + 1]) {
                    idx = mid;
                    break;
                } else if (list[mid] < value) {
                    lbound = mid + 1;
                } else {
                    ubound = mid - 1;
                }
            }

            return idx;
        }
    }]);

    return MediaInfo;
}();

function ReadBig32(array, index) {
    return array[index] << 24 | array[index + 1] << 16 | array[index + 2] << 8 | array[index + 3];
}

var FLVDemuxer = function () {

    /**
     * Create a new FLV demuxer
     * @param {Object} probeData
     * @param {boolean} probeData.match
     * @param {number} probeData.consumed
     * @param {number} probeData.dataOffset
     * @param {boolean} probeData.hasAudioTrack
     * @param {boolean} probeData.hasVideoTrack
     */
    function FLVDemuxer(probeData) {
        _classCallCheck(this, FLVDemuxer);

        this.TAG = 'FLVDemuxer';

        this._onError = null;
        this._onMediaInfo = null;
        this._onTrackMetadata = null;
        this._onDataAvailable = null;

        this._dataOffset = probeData.dataOffset;
        this._firstParse = true;
        this._dispatch = false;

        this._hasAudio = probeData.hasAudioTrack;
        this._hasVideo = probeData.hasVideoTrack;

        this._hasAudioFlagOverrided = false;
        this._hasVideoFlagOverrided = false;

        this._audioInitialMetadataDispatched = false;
        this._videoInitialMetadataDispatched = false;

        this._mediaInfo = new MediaInfo();
        this._mediaInfo.hasAudio = this._hasAudio;
        this._mediaInfo.hasVideo = this._hasVideo;
        this._metadata = null;
        this._audioMetadata = null;
        this._videoMetadata = null;

        this._naluLengthSize = 4;
        this._timestampBase = 0; // int32, in milliseconds
        this._timescale = 1000;
        this._duration = 0; // int32, in milliseconds
        this._durationOverrided = false;
        this._referenceFrameRate = {
            fixed: true,
            fps: 23.976,
            fps_num: 23976,
            fps_den: 1000
        };

        this._flvSoundRateTable = [5500, 11025, 22050, 44100, 48000];

        this._mpegSamplingRates = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];

        this._mpegAudioV10SampleRateTable = [44100, 48000, 32000, 0];
        this._mpegAudioV20SampleRateTable = [22050, 24000, 16000, 0];
        this._mpegAudioV25SampleRateTable = [11025, 12000, 8000, 0];

        this._mpegAudioL1BitRateTable = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1];
        this._mpegAudioL2BitRateTable = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1];
        this._mpegAudioL3BitRateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1];

        this._videoTrack = { type: 'video', id: 1, sequenceNumber: 0, samples: [], length: 0 };
        this._audioTrack = { type: 'audio', id: 2, sequenceNumber: 0, samples: [], length: 0 };

        this._littleEndian = function () {
            var buf = new ArrayBuffer(2);
            new DataView(buf).setInt16(0, 256, true); // little-endian write
            return new Int16Array(buf)[0] === 256; // platform-spec read, if equal then LE
        }();
    }

    _createClass(FLVDemuxer, [{
        key: 'destroy',
        value: function destroy() {
            this._mediaInfo = null;
            this._metadata = null;
            this._audioMetadata = null;
            this._videoMetadata = null;
            this._videoTrack = null;
            this._audioTrack = null;

            this._onError = null;
            this._onMediaInfo = null;
            this._onTrackMetadata = null;
            this._onDataAvailable = null;
        }

        /**
         * Probe the flv data
         * @param {ArrayBuffer} buffer
         * @returns {Object} - probeData to be feed into constructor
         */

    }, {
        key: 'bindDataSource',
        value: function bindDataSource(loader) {
            loader.onDataArrival = this.parseChunks.bind(this);
            return this;
        }

        // prototype: function(type: string, metadata: any): void

    }, {
        key: 'resetMediaInfo',
        value: function resetMediaInfo() {
            this._mediaInfo = new MediaInfo();
        }
    }, {
        key: '_isInitialMetadataDispatched',
        value: function _isInitialMetadataDispatched() {
            if (this._hasAudio && this._hasVideo) {
                // both audio & video
                return this._audioInitialMetadataDispatched && this._videoInitialMetadataDispatched;
            }
            if (this._hasAudio && !this._hasVideo) {
                // audio only
                return this._audioInitialMetadataDispatched;
            }
            if (!this._hasAudio && this._hasVideo) {
                // video only
                return this._videoInitialMetadataDispatched;
            }
            return false;
        }

        // function parseChunks(chunk: ArrayBuffer, byteStart: number): number;

    }, {
        key: 'parseChunks',
        value: function parseChunks(chunk, byteStart) {
            if (!this._onError || !this._onMediaInfo || !this._onTrackMetadata || !this._onDataAvailable) {
                throw new IllegalStateException('Flv: onError & onMediaInfo & onTrackMetadata & onDataAvailable callback must be specified');
            }

            // qli5: fix nonzero byteStart
            var offset = byteStart || 0;
            var le = this._littleEndian;

            if (byteStart === 0) {
                // buffer with FLV header
                if (chunk.byteLength > 13) {
                    var probeData = FLVDemuxer.probe(chunk);
                    offset = probeData.dataOffset;
                } else {
                    return 0;
                }
            }

            if (this._firstParse) {
                // handle PreviousTagSize0 before Tag1
                this._firstParse = false;
                if (offset !== this._dataOffset) {
                    Log.w(this.TAG, 'First time parsing but chunk byteStart invalid!');
                }

                var v = new DataView(chunk, offset);
                var prevTagSize0 = v.getUint32(0, !le);
                if (prevTagSize0 !== 0) {
                    Log.w(this.TAG, 'PrevTagSize0 !== 0 !!!');
                }
                offset += 4;
            }

            while (offset < chunk.byteLength) {
                this._dispatch = true;

                var _v = new DataView(chunk, offset);

                if (offset + 11 + 4 > chunk.byteLength) {
                    // data not enough for parsing an flv tag
                    break;
                }

                var tagType = _v.getUint8(0);
                var dataSize = _v.getUint32(0, !le) & 0x00FFFFFF;

                if (offset + 11 + dataSize + 4 > chunk.byteLength) {
                    // data not enough for parsing actual data body
                    break;
                }

                if (tagType !== 8 && tagType !== 9 && tagType !== 18) {
                    Log.w(this.TAG, 'Unsupported tag type ' + tagType + ', skipped');
                    // consume the whole tag (skip it)
                    offset += 11 + dataSize + 4;
                    continue;
                }

                var ts2 = _v.getUint8(4);
                var ts1 = _v.getUint8(5);
                var ts0 = _v.getUint8(6);
                var ts3 = _v.getUint8(7);

                var timestamp = ts0 | ts1 << 8 | ts2 << 16 | ts3 << 24;

                var streamId = _v.getUint32(7, !le) & 0x00FFFFFF;
                if (streamId !== 0) {
                    Log.w(this.TAG, 'Meet tag which has StreamID != 0!');
                }

                var dataOffset = offset + 11;

                switch (tagType) {
                    case 8:
                        // Audio
                        this._parseAudioData(chunk, dataOffset, dataSize, timestamp);
                        break;
                    case 9:
                        // Video
                        this._parseVideoData(chunk, dataOffset, dataSize, timestamp, byteStart + offset);
                        break;
                    case 18:
                        // ScriptDataObject
                        this._parseScriptData(chunk, dataOffset, dataSize);
                        break;
                }

                var prevTagSize = _v.getUint32(11 + dataSize, !le);
                if (prevTagSize !== 11 + dataSize) {
                    Log.w(this.TAG, 'Invalid PrevTagSize ' + prevTagSize);
                }

                offset += 11 + dataSize + 4; // tagBody + dataSize + prevTagSize
            }

            // dispatch parsed frames to consumer (typically, the remuxer)
            if (this._isInitialMetadataDispatched()) {
                if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {
                    this._onDataAvailable(this._audioTrack, this._videoTrack);
                }
            }

            return offset; // consumed bytes, just equals latest offset index
        }
    }, {
        key: '_parseScriptData',
        value: function _parseScriptData(arrayBuffer, dataOffset, dataSize) {
            var scriptData = AMF.parseScriptData(arrayBuffer, dataOffset, dataSize);

            if (scriptData.hasOwnProperty('onMetaData')) {
                if (scriptData.onMetaData == null || _typeof(scriptData.onMetaData) !== 'object') {
                    Log.w(this.TAG, 'Invalid onMetaData structure!');
                    return;
                }
                if (this._metadata) {
                    Log.w(this.TAG, 'Found another onMetaData tag!');
                }
                this._metadata = scriptData;
                var onMetaData = this._metadata.onMetaData;

                if (typeof onMetaData.hasAudio === 'boolean') {
                    // hasAudio
                    if (this._hasAudioFlagOverrided === false) {
                        this._hasAudio = onMetaData.hasAudio;
                        this._mediaInfo.hasAudio = this._hasAudio;
                    }
                }
                if (typeof onMetaData.hasVideo === 'boolean') {
                    // hasVideo
                    if (this._hasVideoFlagOverrided === false) {
                        this._hasVideo = onMetaData.hasVideo;
                        this._mediaInfo.hasVideo = this._hasVideo;
                    }
                }
                if (typeof onMetaData.audiodatarate === 'number') {
                    // audiodatarate
                    this._mediaInfo.audioDataRate = onMetaData.audiodatarate;
                }
                if (typeof onMetaData.videodatarate === 'number') {
                    // videodatarate
                    this._mediaInfo.videoDataRate = onMetaData.videodatarate;
                }
                if (typeof onMetaData.width === 'number') {
                    // width
                    this._mediaInfo.width = onMetaData.width;
                }
                if (typeof onMetaData.height === 'number') {
                    // height
                    this._mediaInfo.height = onMetaData.height;
                }
                if (typeof onMetaData.duration === 'number') {
                    // duration
                    if (!this._durationOverrided) {
                        var duration = Math.floor(onMetaData.duration * this._timescale);
                        this._duration = duration;
                        this._mediaInfo.duration = duration;
                    }
                } else {
                    this._mediaInfo.duration = 0;
                }
                if (typeof onMetaData.framerate === 'number') {
                    // framerate
                    var fps_num = Math.floor(onMetaData.framerate * 1000);
                    if (fps_num > 0) {
                        var fps = fps_num / 1000;
                        this._referenceFrameRate.fixed = true;
                        this._referenceFrameRate.fps = fps;
                        this._referenceFrameRate.fps_num = fps_num;
                        this._referenceFrameRate.fps_den = 1000;
                        this._mediaInfo.fps = fps;
                    }
                }
                if (_typeof(onMetaData.keyframes) === 'object') {
                    // keyframes
                    this._mediaInfo.hasKeyframesIndex = true;
                    var keyframes = onMetaData.keyframes;
                    this._mediaInfo.keyframesIndex = this._parseKeyframesIndex(keyframes);
                    onMetaData.keyframes = null; // keyframes has been extracted, remove it
                } else {
                    this._mediaInfo.hasKeyframesIndex = false;
                }
                this._dispatch = false;
                this._mediaInfo.metadata = onMetaData;
                Log.v(this.TAG, 'Parsed onMetaData');
                if (this._mediaInfo.isComplete()) {
                    this._onMediaInfo(this._mediaInfo);
                }
            }
        }
    }, {
        key: '_parseKeyframesIndex',
        value: function _parseKeyframesIndex(keyframes) {
            var times = [];
            var filepositions = [];

            // ignore first keyframe which is actually AVC Sequence Header (AVCDecoderConfigurationRecord)
            for (var i = 1; i < keyframes.times.length; i++) {
                var time = this._timestampBase + Math.floor(keyframes.times[i] * 1000);
                times.push(time);
                filepositions.push(keyframes.filepositions[i]);
            }

            return {
                times: times,
                filepositions: filepositions
            };
        }
    }, {
        key: '_parseAudioData',
        value: function _parseAudioData(arrayBuffer, dataOffset, dataSize, tagTimestamp) {
            if (dataSize <= 1) {
                Log.w(this.TAG, 'Flv: Invalid audio packet, missing SoundData payload!');
                return;
            }

            if (this._hasAudioFlagOverrided === true && this._hasAudio === false) {
                // If hasAudio: false indicated explicitly in MediaDataSource,
                // Ignore all the audio packets
                return;
            }

            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var soundSpec = v.getUint8(0);

            var soundFormat = soundSpec >>> 4;
            if (soundFormat !== 2 && soundFormat !== 10) {
                // MP3 or AAC
                this._onError(DemuxErrors.CODEC_UNSUPPORTED, 'Flv: Unsupported audio codec idx: ' + soundFormat);
                return;
            }

            var soundRate = 0;
            var soundRateIndex = (soundSpec & 12) >>> 2;
            if (soundRateIndex >= 0 && soundRateIndex <= 4) {
                soundRate = this._flvSoundRateTable[soundRateIndex];
            } else {
                this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid audio sample rate idx: ' + soundRateIndex);
                return;
            }
            var soundType = soundSpec & 1;

            var meta = this._audioMetadata;
            var track = this._audioTrack;

            if (!meta) {
                if (this._hasAudio === false && this._hasAudioFlagOverrided === false) {
                    this._hasAudio = true;
                    this._mediaInfo.hasAudio = true;
                }

                // initial metadata
                meta = this._audioMetadata = {};
                meta.type = 'audio';
                meta.id = track.id;
                meta.timescale = this._timescale;
                meta.duration = this._duration;
                meta.audioSampleRate = soundRate;
                meta.channelCount = soundType === 0 ? 1 : 2;
            }

            if (soundFormat === 10) {
                // AAC
                var aacData = this._parseAACAudioData(arrayBuffer, dataOffset + 1, dataSize - 1);

                if (aacData == undefined) {
                    return;
                }

                if (aacData.packetType === 0) {
                    // AAC sequence header (AudioSpecificConfig)
                    if (meta.config) {
                        Log.w(this.TAG, 'Found another AudioSpecificConfig!');
                    }
                    var misc = aacData.data;
                    meta.audioSampleRate = misc.samplingRate;
                    meta.channelCount = misc.channelCount;
                    meta.codec = misc.codec;
                    meta.originalCodec = misc.originalCodec;
                    meta.config = misc.config;
                    // added by qli5
                    meta.configRaw = misc.configRaw;
                    // added by Xmader
                    meta.audioObjectType = misc.audioObjectType;
                    meta.samplingFrequencyIndex = misc.samplingIndex;
                    meta.channelConfig = misc.channelCount;
                    // The decode result of an aac sample is 1024 PCM samples
                    meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale;
                    Log.v(this.TAG, 'Parsed AudioSpecificConfig');

                    if (this._isInitialMetadataDispatched()) {
                        // Non-initial metadata, force dispatch (or flush) parsed frames to remuxer
                        if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {
                            this._onDataAvailable(this._audioTrack, this._videoTrack);
                        }
                    } else {
                        this._audioInitialMetadataDispatched = true;
                    }
                    // then notify new metadata
                    this._dispatch = false;
                    this._onTrackMetadata('audio', meta);

                    var mi = this._mediaInfo;
                    mi.audioCodec = meta.originalCodec;
                    mi.audioSampleRate = meta.audioSampleRate;
                    mi.audioChannelCount = meta.channelCount;
                    if (mi.hasVideo) {
                        if (mi.videoCodec != null) {
                            mi.mimeType = 'video/x-flv; codecs="' + mi.videoCodec + ',' + mi.audioCodec + '"';
                        }
                    } else {
                        mi.mimeType = 'video/x-flv; codecs="' + mi.audioCodec + '"';
                    }
                    if (mi.isComplete()) {
                        this._onMediaInfo(mi);
                    }
                } else if (aacData.packetType === 1) {
                    // AAC raw frame data
                    var dts = this._timestampBase + tagTimestamp;
                    var aacSample = { unit: aacData.data, length: aacData.data.byteLength, dts: dts, pts: dts };
                    track.samples.push(aacSample);
                    track.length += aacData.data.length;
                } else {
                    Log.e(this.TAG, 'Flv: Unsupported AAC data type ' + aacData.packetType);
                }
            } else if (soundFormat === 2) {
                // MP3
                if (!meta.codec) {
                    // We need metadata for mp3 audio track, extract info from frame header
                    var _misc = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, true);
                    if (_misc == undefined) {
                        return;
                    }
                    meta.audioSampleRate = _misc.samplingRate;
                    meta.channelCount = _misc.channelCount;
                    meta.codec = _misc.codec;
                    meta.originalCodec = _misc.originalCodec;
                    // The decode result of an mp3 sample is 1152 PCM samples
                    meta.refSampleDuration = 1152 / meta.audioSampleRate * meta.timescale;
                    Log.v(this.TAG, 'Parsed MPEG Audio Frame Header');

                    this._audioInitialMetadataDispatched = true;
                    this._onTrackMetadata('audio', meta);

                    var _mi = this._mediaInfo;
                    _mi.audioCodec = meta.codec;
                    _mi.audioSampleRate = meta.audioSampleRate;
                    _mi.audioChannelCount = meta.channelCount;
                    _mi.audioDataRate = _misc.bitRate;
                    if (_mi.hasVideo) {
                        if (_mi.videoCodec != null) {
                            _mi.mimeType = 'video/x-flv; codecs="' + _mi.videoCodec + ',' + _mi.audioCodec + '"';
                        }
                    } else {
                        _mi.mimeType = 'video/x-flv; codecs="' + _mi.audioCodec + '"';
                    }
                    if (_mi.isComplete()) {
                        this._onMediaInfo(_mi);
                    }
                }

                // This packet is always a valid audio packet, extract it
                var data = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, false);
                if (data == undefined) {
                    return;
                }
                var _dts = this._timestampBase + tagTimestamp;
                var mp3Sample = { unit: data, length: data.byteLength, dts: _dts, pts: _dts };
                track.samples.push(mp3Sample);
                track.length += data.length;
            }
        }
    }, {
        key: '_parseAACAudioData',
        value: function _parseAACAudioData(arrayBuffer, dataOffset, dataSize) {
            if (dataSize <= 1) {
                Log.w(this.TAG, 'Flv: Invalid AAC packet, missing AACPacketType or/and Data!');
                return;
            }

            var result = {};
            var array = new Uint8Array(arrayBuffer, dataOffset, dataSize);

            result.packetType = array[0];

            if (array[0] === 0) {
                result.data = this._parseAACAudioSpecificConfig(arrayBuffer, dataOffset + 1, dataSize - 1);
            } else {
                result.data = array.subarray(1);
            }

            return result;
        }
    }, {
        key: '_parseAACAudioSpecificConfig',
        value: function _parseAACAudioSpecificConfig(arrayBuffer, dataOffset, dataSize) {
            var array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
            var config = null;

            /* Audio Object Type:
               0: Null
               1: AAC Main
               2: AAC LC
               3: AAC SSR (Scalable Sample Rate)
               4: AAC LTP (Long Term Prediction)
               5: HE-AAC / SBR (Spectral Band Replication)
               6: AAC Scalable
            */

            var audioObjectType = 0;
            var originalAudioObjectType = 0;
            var samplingIndex = 0;
            var extensionSamplingIndex = null;

            // 5 bits
            audioObjectType = originalAudioObjectType = array[0] >>> 3;
            // 4 bits
            samplingIndex = (array[0] & 0x07) << 1 | array[1] >>> 7;
            if (samplingIndex < 0 || samplingIndex >= this._mpegSamplingRates.length) {
                this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: AAC invalid sampling frequency index!');
                return;
            }

            var samplingFrequence = this._mpegSamplingRates[samplingIndex];

            // 4 bits
            var channelConfig = (array[1] & 0x78) >>> 3;
            if (channelConfig < 0 || channelConfig >= 8) {
                this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: AAC invalid channel configuration');
                return;
            }

            if (audioObjectType === 5) {
                // HE-AAC?
                // 4 bits
                extensionSamplingIndex = (array[1] & 0x07) << 1 | array[2] >>> 7;
            }

            // workarounds for various browsers
            var userAgent = _navigator.userAgent.toLowerCase();

            if (userAgent.indexOf('firefox') !== -1) {
                // firefox: use SBR (HE-AAC) if freq less than 24kHz
                if (samplingIndex >= 6) {
                    audioObjectType = 5;
                    config = new Array(4);
                    extensionSamplingIndex = samplingIndex - 3;
                } else {
                    // use LC-AAC
                    audioObjectType = 2;
                    config = new Array(2);
                    extensionSamplingIndex = samplingIndex;
                }
            } else if (userAgent.indexOf('android') !== -1) {
                // android: always use LC-AAC
                audioObjectType = 2;
                config = new Array(2);
                extensionSamplingIndex = samplingIndex;
            } else {
                // for other browsers, e.g. chrome...
                // Always use HE-AAC to make it easier to switch aac codec profile
                audioObjectType = 5;
                extensionSamplingIndex = samplingIndex;
                config = new Array(4);

                if (samplingIndex >= 6) {
                    extensionSamplingIndex = samplingIndex - 3;
                } else if (channelConfig === 1) {
                    // Mono channel
                    audioObjectType = 2;
                    config = new Array(2);
                    extensionSamplingIndex = samplingIndex;
                }
            }

            config[0] = audioObjectType << 3;
            config[0] |= (samplingIndex & 0x0F) >>> 1;
            config[1] = (samplingIndex & 0x0F) << 7;
            config[1] |= (channelConfig & 0x0F) << 3;
            if (audioObjectType === 5) {
                config[1] |= (extensionSamplingIndex & 0x0F) >>> 1;
                config[2] = (extensionSamplingIndex & 0x01) << 7;
                // extended audio object type: force to 2 (LC-AAC)
                config[2] |= 2 << 2;
                config[3] = 0;
            }

            return {
                audioObjectType: audioObjectType, // audio_object_type,        added by Xmader
                samplingIndex: samplingIndex, // sampling_frequency_index, added by Xmader
                configRaw: array, //                           added by qli5
                config: config,
                samplingRate: samplingFrequence,
                channelCount: channelConfig, // channel_config
                codec: 'mp4a.40.' + audioObjectType,
                originalCodec: 'mp4a.40.' + originalAudioObjectType
            };
        }
    }, {
        key: '_parseMP3AudioData',
        value: function _parseMP3AudioData(arrayBuffer, dataOffset, dataSize, requestHeader) {
            if (dataSize < 4) {
                Log.w(this.TAG, 'Flv: Invalid MP3 packet, header missing!');
                return;
            }

            var le = this._littleEndian;
            var array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
            var result = null;

            if (requestHeader) {
                if (array[0] !== 0xFF) {
                    return;
                }
                var ver = array[1] >>> 3 & 0x03;
                var layer = (array[1] & 0x06) >> 1;

                var bitrate_index = (array[2] & 0xF0) >>> 4;
                var sampling_freq_index = (array[2] & 0x0C) >>> 2;

                var channel_mode = array[3] >>> 6 & 0x03;
                var channel_count = channel_mode !== 3 ? 2 : 1;

                var sample_rate = 0;
                var bit_rate = 0;

                var codec = 'mp3';

                switch (ver) {
                    case 0:
                        // MPEG 2.5
                        sample_rate = this._mpegAudioV25SampleRateTable[sampling_freq_index];
                        break;
                    case 2:
                        // MPEG 2
                        sample_rate = this._mpegAudioV20SampleRateTable[sampling_freq_index];
                        break;
                    case 3:
                        // MPEG 1
                        sample_rate = this._mpegAudioV10SampleRateTable[sampling_freq_index];
                        break;
                }

                switch (layer) {
                    case 1:
                        // Layer 3
                        if (bitrate_index < this._mpegAudioL3BitRateTable.length) {
                            bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];
                        }
                        break;
                    case 2:
                        // Layer 2
                        if (bitrate_index < this._mpegAudioL2BitRateTable.length) {
                            bit_rate = this._mpegAudioL2BitRateTable[bitrate_index];
                        }
                        break;
                    case 3:
                        // Layer 1
                        if (bitrate_index < this._mpegAudioL1BitRateTable.length) {
                            bit_rate = this._mpegAudioL1BitRateTable[bitrate_index];
                        }
                        break;
                }

                result = {
                    bitRate: bit_rate,
                    samplingRate: sample_rate,
                    channelCount: channel_count,
                    codec: codec,
                    originalCodec: codec
                };
            } else {
                result = array;
            }

            return result;
        }
    }, {
        key: '_parseVideoData',
        value: function _parseVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition) {
            if (dataSize <= 1) {
                Log.w(this.TAG, 'Flv: Invalid video packet, missing VideoData payload!');
                return;
            }

            if (this._hasVideoFlagOverrided === true && this._hasVideo === false) {
                // If hasVideo: false indicated explicitly in MediaDataSource,
                // Ignore all the video packets
                return;
            }

            var spec = new Uint8Array(arrayBuffer, dataOffset, dataSize)[0];

            var frameType = (spec & 240) >>> 4;
            var codecId = spec & 15;

            if (codecId !== 7) {
                this._onError(DemuxErrors.CODEC_UNSUPPORTED, 'Flv: Unsupported codec in video frame: ' + codecId);
                return;
            }

            this._parseAVCVideoPacket(arrayBuffer, dataOffset + 1, dataSize - 1, tagTimestamp, tagPosition, frameType);
        }
    }, {
        key: '_parseAVCVideoPacket',
        value: function _parseAVCVideoPacket(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType) {
            if (dataSize < 4) {
                Log.w(this.TAG, 'Flv: Invalid AVC packet, missing AVCPacketType or/and CompositionTime');
                return;
            }

            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var packetType = v.getUint8(0);
            var cts = v.getUint32(0, !le) & 0x00FFFFFF;

            if (packetType === 0) {
                // AVCDecoderConfigurationRecord
                this._parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset + 4, dataSize - 4);
            } else if (packetType === 1) {
                // One or more Nalus
                this._parseAVCVideoData(arrayBuffer, dataOffset + 4, dataSize - 4, tagTimestamp, tagPosition, frameType, cts);
            } else if (packetType === 2) {
                // empty, AVC end of sequence
            } else {
                this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid video packet type ' + packetType);
                return;
            }
        }
    }, {
        key: '_parseAVCDecoderConfigurationRecord',
        value: function _parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 7) {
                Log.w(this.TAG, 'Flv: Invalid AVCDecoderConfigurationRecord, lack of data!');
                return;
            }

            var meta = this._videoMetadata;
            var track = this._videoTrack;
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            if (!meta) {
                if (this._hasVideo === false && this._hasVideoFlagOverrided === false) {
                    this._hasVideo = true;
                    this._mediaInfo.hasVideo = true;
                }

                meta = this._videoMetadata = {};
                meta.type = 'video';
                meta.id = track.id;
                meta.timescale = this._timescale;
                meta.duration = this._duration;
            } else {
                if (typeof meta.avcc !== 'undefined') {
                    Log.w(this.TAG, 'Found another AVCDecoderConfigurationRecord!');
                }
            }

            var version = v.getUint8(0); // configurationVersion
            var avcProfile = v.getUint8(1); // avcProfileIndication
            var profileCompatibility = v.getUint8(2); // profile_compatibility
            var avcLevel = v.getUint8(3); // AVCLevelIndication

            if (version !== 1 || avcProfile === 0) {
                this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord');
                return;
            }

            this._naluLengthSize = (v.getUint8(4) & 3) + 1; // lengthSizeMinusOne
            if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {
                // holy shit!!!
                this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Strange NaluLengthSizeMinusOne: ' + (this._naluLengthSize - 1));
                return;
            }

            var spsCount = v.getUint8(5) & 31; // numOfSequenceParameterSets
            if (spsCount === 0) {
                this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord: No SPS');
                return;
            } else if (spsCount > 1) {
                Log.w(this.TAG, 'Flv: Strange AVCDecoderConfigurationRecord: SPS Count = ' + spsCount);
            }

            var offset = 6;

            for (var i = 0; i < spsCount; i++) {
                var len = v.getUint16(offset, !le); // sequenceParameterSetLength
                offset += 2;

                if (len === 0) {
                    continue;
                }

                // Notice: Nalu without startcode header (00 00 00 01)
                var sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);
                offset += len;

                var config = SPSParser.parseSPS(sps);
                if (i !== 0) {
                    // ignore other sps's config
                    continue;
                }

                meta.codecWidth = config.codec_size.width;
                meta.codecHeight = config.codec_size.height;
                meta.presentWidth = config.present_size.width;
                meta.presentHeight = config.present_size.height;

                meta.profile = config.profile_string;
                meta.level = config.level_string;
                meta.bitDepth = config.bit_depth;
                meta.chromaFormat = config.chroma_format;
                meta.sarRatio = config.sar_ratio;
                meta.frameRate = config.frame_rate;

                if (config.frame_rate.fixed === false || config.frame_rate.fps_num === 0 || config.frame_rate.fps_den === 0) {
                    meta.frameRate = this._referenceFrameRate;
                }

                var fps_den = meta.frameRate.fps_den;
                var fps_num = meta.frameRate.fps_num;
                meta.refSampleDuration = meta.timescale * (fps_den / fps_num);

                var codecArray = sps.subarray(1, 4);
                var codecString = 'avc1.';
                for (var j = 0; j < 3; j++) {
                    var h = codecArray[j].toString(16);
                    if (h.length < 2) {
                        h = '0' + h;
                    }
                    codecString += h;
                }
                meta.codec = codecString;

                var mi = this._mediaInfo;
                mi.width = meta.codecWidth;
                mi.height = meta.codecHeight;
                mi.fps = meta.frameRate.fps;
                mi.profile = meta.profile;
                mi.level = meta.level;
                mi.chromaFormat = config.chroma_format_string;
                mi.sarNum = meta.sarRatio.width;
                mi.sarDen = meta.sarRatio.height;
                mi.videoCodec = codecString;

                if (mi.hasAudio) {
                    if (mi.audioCodec != null) {
                        mi.mimeType = 'video/x-flv; codecs="' + mi.videoCodec + ',' + mi.audioCodec + '"';
                    }
                } else {
                    mi.mimeType = 'video/x-flv; codecs="' + mi.videoCodec + '"';
                }
                if (mi.isComplete()) {
                    this._onMediaInfo(mi);
                }
            }

            var ppsCount = v.getUint8(offset); // numOfPictureParameterSets
            if (ppsCount === 0) {
                this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord: No PPS');
                return;
            } else if (ppsCount > 1) {
                Log.w(this.TAG, 'Flv: Strange AVCDecoderConfigurationRecord: PPS Count = ' + ppsCount);
            }

            offset++;

            for (var _i3 = 0; _i3 < ppsCount; _i3++) {
                var _len3 = v.getUint16(offset, !le); // pictureParameterSetLength
                offset += 2;

                if (_len3 === 0) {
                    continue;
                }

                // pps is useless for extracting video information
                offset += _len3;
            }

            meta.avcc = new Uint8Array(dataSize);
            meta.avcc.set(new Uint8Array(arrayBuffer, dataOffset, dataSize), 0);
            Log.v(this.TAG, 'Parsed AVCDecoderConfigurationRecord');

            if (this._isInitialMetadataDispatched()) {
                // flush parsed frames
                if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {
                    this._onDataAvailable(this._audioTrack, this._videoTrack);
                }
            } else {
                this._videoInitialMetadataDispatched = true;
            }
            // notify new metadata
            this._dispatch = false;
            this._onTrackMetadata('video', meta);
        }
    }, {
        key: '_parseAVCVideoData',
        value: function _parseAVCVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType, cts) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var units = [],
                length = 0;

            var offset = 0;
            var lengthSize = this._naluLengthSize;
            var dts = this._timestampBase + tagTimestamp;
            var keyframe = frameType === 1; // from FLV Frame Type constants
            var refIdc = 1; // added by qli5

            while (offset < dataSize) {
                if (offset + 4 >= dataSize) {
                    Log.w(this.TAG, 'Malformed Nalu near timestamp ' + dts + ', offset = ' + offset + ', dataSize = ' + dataSize);
                    break; // data not enough for next Nalu
                }
                // Nalu with length-header (AVC1)
                var naluSize = v.getUint32(offset, !le); // Big-Endian read
                if (lengthSize === 3) {
                    naluSize >>>= 8;
                }
                if (naluSize > dataSize - lengthSize) {
                    Log.w(this.TAG, 'Malformed Nalus near timestamp ' + dts + ', NaluSize > DataSize!');
                    return;
                }

                var unitType = v.getUint8(offset + lengthSize) & 0x1F;
                // added by qli5
                refIdc = v.getUint8(offset + lengthSize) & 0x60;

                if (unitType === 5) {
                    // IDR
                    keyframe = true;
                }

                var data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);
                var unit = { type: unitType, data: data };
                units.push(unit);
                length += data.byteLength;

                offset += lengthSize + naluSize;
            }

            if (units.length) {
                var track = this._videoTrack;
                var avcSample = {
                    units: units,
                    length: length,
                    isKeyframe: keyframe,
                    refIdc: refIdc,
                    dts: dts,
                    cts: cts,
                    pts: dts + cts
                };
                if (keyframe) {
                    avcSample.fileposition = tagPosition;
                }
                track.samples.push(avcSample);
                track.length += length;
            }
        }
    }, {
        key: 'onTrackMetadata',
        get: function get() {
            return this._onTrackMetadata;
        },
        set: function set(callback) {
            this._onTrackMetadata = callback;
        }

        // prototype: function(mediaInfo: MediaInfo): void

    }, {
        key: 'onMediaInfo',
        get: function get() {
            return this._onMediaInfo;
        },
        set: function set(callback) {
            this._onMediaInfo = callback;
        }

        // prototype: function(type: number, info: string): void

    }, {
        key: 'onError',
        get: function get() {
            return this._onError;
        },
        set: function set(callback) {
            this._onError = callback;
        }

        // prototype: function(videoTrack: any, audioTrack: any): void

    }, {
        key: 'onDataAvailable',
        get: function get() {
            return this._onDataAvailable;
        },
        set: function set(callback) {
            this._onDataAvailable = callback;
        }

        // timestamp base for output samples, must be in milliseconds

    }, {
        key: 'timestampBase',
        get: function get() {
            return this._timestampBase;
        },
        set: function set(base) {
            this._timestampBase = base;
        }
    }, {
        key: 'overridedDuration',
        get: function get() {
            return this._duration;
        }

        // Force-override media duration. Must be in milliseconds, int32
        ,
        set: function set(duration) {
            this._durationOverrided = true;
            this._duration = duration;
            this._mediaInfo.duration = duration;
        }

        // Force-override audio track present flag, boolean

    }, {
        key: 'overridedHasAudio',
        set: function set(hasAudio) {
            this._hasAudioFlagOverrided = true;
            this._hasAudio = hasAudio;
            this._mediaInfo.hasAudio = hasAudio;
        }

        // Force-override video track present flag, boolean

    }, {
        key: 'overridedHasVideo',
        set: function set(hasVideo) {
            this._hasVideoFlagOverrided = true;
            this._hasVideo = hasVideo;
            this._mediaInfo.hasVideo = hasVideo;
        }
    }], [{
        key: 'probe',
        value: function probe(buffer) {
            var data = new Uint8Array(buffer);
            var mismatch = { match: false };

            if (data[0] !== 0x46 || data[1] !== 0x4C || data[2] !== 0x56 || data[3] !== 0x01) {
                return mismatch;
            }

            var hasAudio = (data[4] & 4) >>> 2 !== 0;
            var hasVideo = (data[4] & 1) !== 0;

            var offset = ReadBig32(data, 5);

            if (offset < 9) {
                return mismatch;
            }

            return {
                match: true,
                consumed: offset,
                dataOffset: offset,
                hasAudioTrack: hasAudio,
                hasVideoTrack: hasVideo
            };
        }
    }]);

    return FLVDemuxer;
}();

/**
 * Copyright (C) 2018 Xmader.
 * @author Xmader
 */

/**
 * 计算adts头部
 * @see https://blog.jianchihu.net/flv-aac-add-adtsheader.html
 * @typedef {Object} AdtsHeadersInit
 * @property {number} audioObjectType
 * @property {number} samplingFrequencyIndex
 * @property {number} channelConfig
 * @property {number} adtsLen
 * @param {AdtsHeadersInit} init 
 */


var getAdtsHeaders = function getAdtsHeaders(init) {
    var audioObjectType = init.audioObjectType,
        samplingFrequencyIndex = init.samplingFrequencyIndex,
        channelConfig = init.channelConfig,
        adtsLen = init.adtsLen;

    var headers = new Uint8Array(7);

    headers[0] = 0xff; // syncword:0xfff                           高8bits
    headers[1] = 0xf0; // syncword:0xfff                           低4bits
    headers[1] |= 0 << 3; // MPEG Version:0 for MPEG-4,1 for MPEG-2   1bit
    headers[1] |= 0 << 1; // Layer:0                                  2bits 
    headers[1] |= 1; // protection absent:1                      1bit

    headers[2] = audioObjectType - 1 << 6; // profile:audio_object_type - 1                      2bits
    headers[2] |= (samplingFrequencyIndex & 0x0f) << 2; // sampling frequency index:sampling_frequency_index  4bits 
    headers[2] |= 0 << 1; // private bit:0                                      1bit
    headers[2] |= (channelConfig & 0x04) >> 2; // channel configuration:channel_config               高1bit

    headers[3] = (channelConfig & 0x03) << 6; // channel configuration：channel_config     低2bits
    headers[3] |= 0 << 5; // original：0                               1bit
    headers[3] |= 0 << 4; // home：0                                   1bit
    headers[3] |= 0 << 3; // copyright id bit：0                       1bit  
    headers[3] |= 0 << 2; // copyright id start：0                     1bit

    headers[3] |= (adtsLen & 0x1800) >> 11; // frame length：value    高2bits
    headers[4] = (adtsLen & 0x7f8) >> 3; // frame length：value    中间8bits 
    headers[5] = (adtsLen & 0x7) << 5; // frame length：value    低3bits
    headers[5] |= 0x1f; // buffer fullness：0x7ff 高5bits 
    headers[6] = 0xfc;

    return headers;
};

/**
 * Copyright (C) 2018 Xmader.
 * @author Xmader
 */

/**
 * Demux FLV into H264 + AAC stream into line stream then
 * remux it into a AAC file.
 * @param {Blob|Buffer|ArrayBuffer|string} flv 
 */
var FLV2AAC = function () {
    var _ref77 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee60(flv) {
        var flvArrayBuffer, flvProbeData, flvDemuxer, aac, metadata, finalOffset, _metadata, audioObjectType, samplingFrequencyIndex, channelConfig, output;

        return regeneratorRuntime.wrap(function _callee60$(_context62) {
            while (1) {
                switch (_context62.prev = _context62.next) {
                    case 0:
                        _context62.next = 2;
                        return new Promise(function (r, j) {
                            if (typeof Blob != "undefined" && flv instanceof Blob) {
                                var reader = new FileReader();
                                reader.onload = function () {
                                    /** @type {ArrayBuffer} */
                                    // @ts-ignore
                                    var result = reader.result;
                                    r(result);
                                };
                                reader.onerror = j;
                                reader.readAsArrayBuffer(flv);
                            } else if (typeof Buffer != "undefined" && flv instanceof Buffer) {
                                r(new Uint8Array(flv).buffer);
                            } else if (flv instanceof ArrayBuffer) {
                                r(flv);
                            } else if (typeof flv == 'string') {
                                var req = new XMLHttpRequest();
                                req.responseType = "arraybuffer";
                                req.onload = function () {
                                    return r(req.response);
                                };
                                req.onerror = j;
                                req.open('get', flv);
                                req.send();
                            } else {
                                j(new TypeError("@type {Blob|Buffer|ArrayBuffer} flv"));
                            }
                        });

                    case 2:
                        flvArrayBuffer = _context62.sent;
                        flvProbeData = FLVDemuxer.probe(flvArrayBuffer);
                        flvDemuxer = new FLVDemuxer(flvProbeData);

                        // 只解析音频

                        flvDemuxer.overridedHasVideo = false;

                        /**
                         * @typedef {Object} Sample
                         * @property {Uint8Array} unit
                         * @property {number} length
                         * @property {number} dts
                         * @property {number} pts
                         */

                        /** @type {{ type: "audio"; id: number; sequenceNumber: number; length: number; samples: Sample[]; }} */
                        aac = null;
                        metadata = null;


                        flvDemuxer.onTrackMetadata = function (type, _metaData) {
                            if (type == "audio") {
                                metadata = _metaData;
                            }
                        };

                        flvDemuxer.onMediaInfo = function () {};

                        flvDemuxer.onError = function (e) {
                            throw new Error(e);
                        };

                        flvDemuxer.onDataAvailable = function () {
                            for (var _len4 = arguments.length, args = Array(_len4), _key3 = 0; _key3 < _len4; _key3++) {
                                args[_key3] = arguments[_key3];
                            }

                            args.forEach(function (data) {
                                if (data.type == "audio") {
                                    aac = data;
                                }
                            });
                        };

                        finalOffset = flvDemuxer.parseChunks(flvArrayBuffer, flvProbeData.dataOffset);

                        if (!(finalOffset != flvArrayBuffer.byteLength)) {
                            _context62.next = 15;
                            break;
                        }

                        throw new Error("FLVDemuxer: unexpected EOF");

                    case 15:
                        _metadata = metadata, audioObjectType = _metadata.audioObjectType, samplingFrequencyIndex = _metadata.samplingFrequencyIndex, channelConfig = _metadata.channelCount;

                        /** @type {number[]} */

                        output = [];


                        aac.samples.forEach(function (sample) {
                            var headers = getAdtsHeaders({
                                audioObjectType: audioObjectType,
                                samplingFrequencyIndex: samplingFrequencyIndex,
                                channelConfig: channelConfig,
                                adtsLen: sample.length + 7
                            });
                            output.push.apply(output, _toConsumableArray(headers).concat(_toConsumableArray(sample.unit)));
                        });

                        return _context62.abrupt('return', new Uint8Array(output));

                    case 19:
                    case 'end':
                        return _context62.stop();
                }
            }
        }, _callee60, undefined);
    }));

    return function FLV2AAC(_x78) {
        return _ref77.apply(this, arguments);
    };
}();

/***
 * Copyright (C) 2018 Xmader. All Rights Reserved.
 * 
 * @author Xmader
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var WebWorker = function (_Worker) {
    _inherits(WebWorker, _Worker);

    function WebWorker(stringUrl) {
        _classCallCheck(this, WebWorker);

        var _this46 = _possibleConstructorReturn(this, (WebWorker.__proto__ || Object.getPrototypeOf(WebWorker)).call(this, stringUrl));

        _this46.importFnAsAScript(TwentyFourDataView);
        _this46.importFnAsAScript(FLVTag);
        _this46.importFnAsAScript(FLV);
        return _this46;
    }

    /**
     * @param {string} method 
     * @param {*} data 
     */


    _createClass(WebWorker, [{
        key: 'getReturnValue',
        value: function () {
            var _ref78 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee61(method, data) {
                var _this47 = this;

                var callbackNum;
                return regeneratorRuntime.wrap(function _callee61$(_context63) {
                    while (1) {
                        switch (_context63.prev = _context63.next) {
                            case 0:
                                callbackNum = window.crypto.getRandomValues(new Uint32Array(1))[0];


                                this.postMessage([method, data, callbackNum]);

                                _context63.next = 4;
                                return new Promise(function (resolve, reject) {
                                    _this47.addEventListener("message", function (e) {
                                        var _e$data = _slicedToArray(e.data, 3),
                                            _method = _e$data[0],
                                            incomingData = _e$data[1],
                                            _callbackNum = _e$data[2];

                                        if (_callbackNum == callbackNum) {
                                            if (_method == method) {
                                                resolve(incomingData);
                                            } else if (_method == "error") {
                                                console.error(incomingData);
                                                reject(new Error("Web Worker 内部错误"));
                                            }
                                        }
                                    });
                                });

                            case 4:
                                return _context63.abrupt('return', _context63.sent);

                            case 5:
                            case 'end':
                                return _context63.stop();
                        }
                    }
                }, _callee61, this);
            }));

            function getReturnValue(_x79, _x80) {
                return _ref78.apply(this, arguments);
            }

            return getReturnValue;
        }()
    }, {
        key: 'registerAllMethods',
        value: function () {
            var _ref79 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee62() {
                var _this48 = this;

                var methods;
                return regeneratorRuntime.wrap(function _callee62$(_context64) {
                    while (1) {
                        switch (_context64.prev = _context64.next) {
                            case 0:
                                _context64.next = 2;
                                return this.getReturnValue("getAllMethods");

                            case 2:
                                methods = _context64.sent;


                                methods.forEach(function (method) {
                                    Object.defineProperty(_this48, method, {
                                        value: function value(arg) {
                                            return _this48.getReturnValue(method, arg);
                                        }
                                    });
                                });

                            case 4:
                            case 'end':
                                return _context64.stop();
                        }
                    }
                }, _callee62, this);
            }));

            function registerAllMethods() {
                return _ref79.apply(this, arguments);
            }

            return registerAllMethods;
        }()

        /**
         * @param {Function | ClassDecorator} c 
         */

    }, {
        key: 'importFnAsAScript',
        value: function importFnAsAScript(c) {
            var blob = new Blob([c.toString()], { type: 'application/javascript' });
            return this.getReturnValue("importScripts", URL.createObjectURL(blob));
        }

        /**
         * @param {() => void} fn 
         */

    }], [{
        key: 'fromAFunction',
        value: function fromAFunction(fn) {
            var blob = new Blob(['(' + fn.toString() + ')()'], { type: 'application/javascript' });
            return new WebWorker(URL.createObjectURL(blob));
        }
    }]);

    return WebWorker;
}(Worker);

// 用于批量下载的 Web Worker , 请将函数中的内容想象成一个独立的js文件


var BatchDownloadWorkerFn = function BatchDownloadWorkerFn() {
    var BatchDownloadWorker = function () {
        function BatchDownloadWorker() {
            _classCallCheck(this, BatchDownloadWorker);
        }

        _createClass(BatchDownloadWorker, [{
            key: 'mergeFLVFiles',
            value: function () {
                var _ref80 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee63(files) {
                    return regeneratorRuntime.wrap(function _callee63$(_context65) {
                        while (1) {
                            switch (_context65.prev = _context65.next) {
                                case 0:
                                    _context65.next = 2;
                                    return FLV.mergeBlobs(files);

                                case 2:
                                    return _context65.abrupt('return', _context65.sent);

                                case 3:
                                case 'end':
                                    return _context65.stop();
                            }
                        }
                    }, _callee63, this);
                }));

                function mergeFLVFiles(_x81) {
                    return _ref80.apply(this, arguments);
                }

                return mergeFLVFiles;
            }()

            /**
             * 引入脚本与库
             * @param  {string[]} scripts 
             */

        }, {
            key: 'importScripts',
            value: function (_importScripts) {
                function importScripts() {
                    return _importScripts.apply(this, arguments);
                }

                importScripts.toString = function () {
                    return _importScripts.toString();
                };

                return importScripts;
            }(function () {
                importScripts.apply(undefined, arguments);
            })
        }, {
            key: 'getAllMethods',
            value: function getAllMethods() {
                return Object.getOwnPropertyNames(BatchDownloadWorker.prototype).slice(1, -1);
            }
        }]);

        return BatchDownloadWorker;
    }();

    var worker = new BatchDownloadWorker();

    onmessage = function () {
        var _ref81 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee64(e) {
            var _e$data2, method, incomingData, callbackNum, returnValue;

            return regeneratorRuntime.wrap(function _callee64$(_context66) {
                while (1) {
                    switch (_context66.prev = _context66.next) {
                        case 0:
                            _e$data2 = _slicedToArray(e.data, 3), method = _e$data2[0], incomingData = _e$data2[1], callbackNum = _e$data2[2];
                            _context66.prev = 1;
                            _context66.next = 4;
                            return worker[method](incomingData);

                        case 4:
                            returnValue = _context66.sent;

                            if (returnValue) {
                                postMessage([method, returnValue, callbackNum]);
                            }
                            _context66.next = 12;
                            break;

                        case 8:
                            _context66.prev = 8;
                            _context66.t0 = _context66['catch'](1);

                            postMessage(["error", _context66.t0.message, callbackNum]);
                            throw _context66.t0;

                        case 12:
                        case 'end':
                            return _context66.stop();
                    }
                }
            }, _callee64, undefined, [[1, 8]]);
        }));

        return function onmessage(_x82) {
            return _ref81.apply(this, arguments);
        };
    }();
};

// @ts-check

/**
 * @param {number} alpha 0~255
 */
var formatColorChannel$1 = function formatColorChannel$1(alpha) {
    return (alpha & 255).toString(16).toUpperCase().padStart(2, '0');
};

/**
 * @param {number} opacity 0 ~ 1 -> alpha 0 ~ 255
 */
var formatOpacity = function formatOpacity(opacity) {
    var alpha = 0xFF * (100 - +opacity * 100) / 100;
    return formatColorChannel$1(alpha);
};

/**
 * "#xxxxxx" -> "xxxxxx"
 * @param {string} colorStr 
 */
var formatColor$1 = function formatColor$1(colorStr) {
    colorStr = colorStr.toUpperCase();
    var m = colorStr.match(/^#?(\w{6})$/);
    return m[1];
};

var buildHeader = function buildHeader(_ref82) {
    var _ref82$title = _ref82.title,
        title = _ref82$title === undefined ? "" : _ref82$title,
        _ref82$original = _ref82.original,
        original = _ref82$original === undefined ? "" : _ref82$original,
        _ref82$fontFamily = _ref82.fontFamily,
        fontFamily = _ref82$fontFamily === undefined ? "Arial" : _ref82$fontFamily,
        _ref82$bold = _ref82.bold,
        bold = _ref82$bold === undefined ? false : _ref82$bold,
        _ref82$textColor = _ref82.textColor,
        textColor = _ref82$textColor === undefined ? "#FFFFFF" : _ref82$textColor,
        _ref82$bgColor = _ref82.bgColor,
        bgColor = _ref82$bgColor === undefined ? "#000000" : _ref82$bgColor,
        _ref82$textOpacity = _ref82.textOpacity,
        textOpacity = _ref82$textOpacity === undefined ? 1.0 : _ref82$textOpacity,
        _ref82$bgOpacity = _ref82.bgOpacity,
        bgOpacity = _ref82$bgOpacity === undefined ? 0.5 : _ref82$bgOpacity,
        _ref82$fontsizeRatio = _ref82.fontsizeRatio,
        fontsizeRatio = _ref82$fontsizeRatio === undefined ? 0.4 : _ref82$fontsizeRatio,
        _ref82$baseFontsize = _ref82.baseFontsize,
        baseFontsize = _ref82$baseFontsize === undefined ? 50 : _ref82$baseFontsize,
        _ref82$playResX = _ref82.playResX,
        playResX = _ref82$playResX === undefined ? 560 : _ref82$playResX,
        _ref82$playResY = _ref82.playResY,
        playResY = _ref82$playResY === undefined ? 420 : _ref82$playResY;

    textColor = formatColor$1(textColor);
    bgColor = formatColor$1(bgColor);

    var boldFlag = bold ? -1 : 0;
    var fontSize = Math.round(fontsizeRatio * baseFontsize);
    var textAlpha = formatOpacity(textOpacity);
    var bgAlpha = formatOpacity(bgOpacity);

    return ["[Script Info]", 'Title: ' + title, 'Original Script: ' + original, "ScriptType: v4.00+", "Collisions: Normal", 'PlayResX: ' + playResX, 'PlayResY: ' + playResY, "Timer: 100.0000", "", "[V4+ Styles]", "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding", 'Style: CC,' + fontFamily + ',' + fontSize + ',&H' + textAlpha + textColor + ',&H' + textAlpha + textColor + ',&H' + textAlpha + '000000,&H' + bgAlpha + bgColor + ',' + boldFlag + ',0,0,0,100,100,0,0,1,2,0,2,20,20,2,0', "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"];
};

/**
 * @param {number} time 
 */
var formatTimestamp$1 = function formatTimestamp$1(time) {
    var value = Math.round(time * 100) * 10;
    var rem = value % 3600000;
    var hour = (value - rem) / 3600000;
    var fHour = hour.toFixed(0).padStart(2, '0');
    var fRem = new Date(rem).toISOString().slice(-11, -2);
    return fHour + fRem;
};

/**
 * @param {string} str 
 */
var textEscape$1 = function textEscape$1(str) {
    // VSFilter do not support escaped "{" or "}"; we use full-width version instead
    return str.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\s/g, ' ');
};

/**
 * @param {import("./index").Dialogue} dialogue 
 */
var buildLine = function buildLine(dialogue) {
    var start = formatTimestamp$1(dialogue.from);
    var end = formatTimestamp$1(dialogue.to);
    var text = textEscape$1(dialogue.content);
    return 'Dialogue: 0,' + start + ',' + end + ',CC,,20,20,2,,' + text;
};

/**
 * @param {import("./index").SubtitleData} subtitleData 
 * @param {string} languageDoc 字幕语言描述，例如 "英语（美国）"
 */
var buildAss = function buildAss(subtitleData) {
    var languageDoc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

    var pageTitle = top.document.title.replace(/_哔哩哔哩 \(゜-゜\)つロ 干杯~-bilibili$/, "");
    var title = pageTitle + ' ' + (languageDoc || "") + '\u5B57\u5E55';
    var url = top.location.href;
    var original = 'Generated by Xmader/bilitwin based on ' + url;

    var header = buildHeader({
        title: title,
        original: original,
        fontsizeRatio: subtitleData.font_size,
        textColor: subtitleData.font_color,
        bgOpacity: subtitleData.background_alpha,
        bgColor: subtitleData.background_color
    });

    var lines = subtitleData.body.map(buildLine);

    return [].concat(_toConsumableArray(header), _toConsumableArray(lines)).join('\r\n');
};

// @ts-check

/**
 * 获取视频信息
 * @param {number} aid 
 * @param {number} cid 
 */
var getVideoInfo = function () {
    var _ref83 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee65(aid, cid) {
        var url, res, json;
        return regeneratorRuntime.wrap(function _callee65$(_context67) {
            while (1) {
                switch (_context67.prev = _context67.next) {
                    case 0:
                        url = 'https://api.bilibili.com/x/web-interface/view?aid=' + aid + '&cid=' + cid;
                        _context67.next = 3;
                        return fetch(url);

                    case 3:
                        res = _context67.sent;

                        if (res.ok) {
                            _context67.next = 6;
                            break;
                        }

                        throw new Error(res.status + ' ' + res.statusText);

                    case 6:
                        _context67.next = 8;
                        return res.json();

                    case 8:
                        json = _context67.sent;
                        return _context67.abrupt('return', json.data);

                    case 10:
                    case 'end':
                        return _context67.stop();
                }
            }
        }, _callee65, undefined);
    }));

    return function getVideoInfo(_x84, _x85) {
        return _ref83.apply(this, arguments);
    };
}();

/**
 * @typedef {Object} SubtitleInfo 字幕信息
 * @property {number} id
 * @property {string} lan 字幕语言，例如 "en-US"
 * @property {string} lan_doc 字幕语言描述，例如 "英语（美国）"
 * @property {boolean} is_lock 是否字幕可以在视频上拖动
 * @property {string} subtitle_url 指向字幕数据 json 的 url
 * @property {object} author 作者信息
 */

/**
 * 获取字幕信息列表
 * @param {number} aid 
 * @param {number} cid 
 * @returns {Promise<SubtitleInfo[]>}
 */
var getSubtitleInfoList = function () {
    var _ref84 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee66(aid, cid) {
        var videoinfo;
        return regeneratorRuntime.wrap(function _callee66$(_context68) {
            while (1) {
                switch (_context68.prev = _context68.next) {
                    case 0:
                        _context68.prev = 0;
                        _context68.next = 3;
                        return getVideoInfo(aid, cid);

                    case 3:
                        videoinfo = _context68.sent;
                        return _context68.abrupt('return', videoinfo.subtitle.list);

                    case 7:
                        _context68.prev = 7;
                        _context68.t0 = _context68['catch'](0);
                        return _context68.abrupt('return', []);

                    case 10:
                    case 'end':
                        return _context68.stop();
                }
            }
        }, _callee66, undefined, [[0, 7]]);
    }));

    return function getSubtitleInfoList(_x86, _x87) {
        return _ref84.apply(this, arguments);
    };
}();

/**
 * @typedef {Object} Dialogue
 * @property {number} from 开始时间
 * @property {number} to 结束时间
 * @property {number} location 默认 2
 * @property {string} content 字幕内容
 */

/**
 * @typedef {Object} SubtitleData 字幕数据
 * @property {number} font_size 默认 0.4
 * @property {string} font_color 默认 "#FFFFFF"
 * @property {number} background_alpha 默认 0.5
 * @property {string} background_color 默认 "#9C27B0"
 * @property {string} Stroke 默认 "none"
 * @property {Dialogue[]} body
 */

/**
 * @param {string} subtitle_url 指向字幕数据 json 的 url
 * @returns {Promise<SubtitleData>}
 */
var getSubtitleData = function () {
    var _ref85 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee67(subtitle_url) {
        var res, data;
        return regeneratorRuntime.wrap(function _callee67$(_context69) {
            while (1) {
                switch (_context69.prev = _context69.next) {
                    case 0:
                        subtitle_url = subtitle_url.replace(/^http:/, "https:");

                        _context69.next = 3;
                        return fetch(subtitle_url);

                    case 3:
                        res = _context69.sent;

                        if (res.ok) {
                            _context69.next = 6;
                            break;
                        }

                        throw new Error(res.status + ' ' + res.statusText);

                    case 6:
                        _context69.next = 8;
                        return res.json();

                    case 8:
                        data = _context69.sent;
                        return _context69.abrupt('return', data);

                    case 10:
                    case 'end':
                        return _context69.stop();
                }
            }
        }, _callee67, undefined);
    }));

    return function getSubtitleData(_x88) {
        return _ref85.apply(this, arguments);
    };
}();

/**
 * @param {number} aid 
 * @param {number} cid 
 */
var getSubtitles = function () {
    var _ref86 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee69(aid, cid) {
        var list;
        return regeneratorRuntime.wrap(function _callee69$(_context71) {
            while (1) {
                switch (_context71.prev = _context71.next) {
                    case 0:
                        _context71.next = 2;
                        return getSubtitleInfoList(aid, cid);

                    case 2:
                        list = _context71.sent;
                        _context71.next = 5;
                        return Promise.all(list.map(function () {
                            var _ref87 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee68(info) {
                                var subtitleData;
                                return regeneratorRuntime.wrap(function _callee68$(_context70) {
                                    while (1) {
                                        switch (_context70.prev = _context70.next) {
                                            case 0:
                                                _context70.next = 2;
                                                return getSubtitleData(info.subtitle_url);

                                            case 2:
                                                subtitleData = _context70.sent;
                                                return _context70.abrupt('return', {
                                                    language: info.lan,
                                                    language_doc: info.lan_doc,
                                                    url: info.subtitle_url,
                                                    data: subtitleData,
                                                    ass: buildAss(subtitleData, info.lan_doc)
                                                });

                                            case 4:
                                            case 'end':
                                                return _context70.stop();
                                        }
                                    }
                                }, _callee68, undefined);
                            }));

                            return function (_x91) {
                                return _ref87.apply(this, arguments);
                            };
                        }()));

                    case 5:
                        return _context71.abrupt('return', _context71.sent);

                    case 6:
                    case 'end':
                        return _context71.stop();
                }
            }
        }, _callee69, undefined);
    }));

    return function getSubtitles(_x89, _x90) {
        return _ref86.apply(this, arguments);
    };
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var UI = function () {
    function UI(twin) {
        var _this49 = this;

        var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : UI.optionDefaults;

        _classCallCheck(this, UI);

        this.twin = twin;
        this.option = option;

        this.destroy = new HookedFunction();
        this.dom = {};
        this.cidSessionDestroy = new HookedFunction();
        this.cidSessionDom = {};

        this.destroy.addCallback(this.cidSessionDestroy.bind(this));

        this.destroy.addCallback(function () {
            Object.values(_this49.dom).forEach(function (e) {
                return typeof e.remove == "function" && e.remove();
            });
            _this49.dom = {};
        });
        this.cidSessionDestroy.addCallback(function () {
            Object.values(_this49.cidSessionDom).forEach(function (e) {
                return typeof e.remove == "function" && e.remove();
            });
            _this49.cidSessionDom = {};
        });

        this.styleClearance();
    }

    _createClass(UI, [{
        key: 'styleClearance',
        value: function styleClearance() {
            var ret = '\n        .bilibili-player-context-menu-container.black ul.bilitwin li.context-menu-function > a:hover {\n            background: rgba(255,255,255,.12);\n            transition: all .3s ease-in-out;\n            cursor: pointer;\n        }\n\n        .bilitwin a {\n            cursor: pointer;\n            color: #00a1d6;\n        }\n\n        .bilitwin a:hover {\n            color: #f25d8e;\n        }\n\n        .bilitwin button {\n            color: #fff;\n            cursor: pointer;\n            text-align: center;\n            border-radius: 4px;\n            background-color: #00a1d6;\n            vertical-align: middle;\n            border: 1px solid #00a1d6;\n            transition: .1s;\n            transition-property: background-color,border,color;\n            user-select: none;\n        }\n\n        .bilitwin button:hover {\n            background-color: #00b5e5;\n            border-color: #00b5e5;\n        }\n\n        .bilitwin progress {\n            -webkit-appearance: progress-bar;\n            -moz-appearance: progress-bar;\n            appearance: progress-bar;\n        }\n\n        .bilitwin input[type="checkbox" i] {\n            -webkit-appearance: checkbox;\n            -moz-appearance: checkbox;\n            appearance: checkbox;\n        }\n\n        .bilitwin.context-menu-menu:hover {\n            background: hsla(0,0%,100%,.12);\n        }\n\n        .bilitwin.context-menu-menu:hover > a {\n            background: hsla(0,0%,100%,0) !important;\n        }\n        ';

            var style = document.createElement('style');
            style.type = 'text/css';
            style.textContent = ret;
            document.head.append(style);

            return this.dom.style = style;
        }
    }, {
        key: 'cidSessionRender',
        value: function cidSessionRender() {
            this.buildTitle();

            if (this.option.title) this.appendTitle(); // 在视频标题旁添加链接
            this.appendMenu(); // 在视频菜单栏添加链接
        }

        // Title Append

    }, {
        key: 'buildTitle',
        value: function buildTitle() {
            var _this50 = this;

            var monkey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin.monkey;

            // 1. build videoA, assA
            var fontSize = '15px';
            /** @type {HTMLAnchorElement} */
            var videoA = document.createElement('a');
            /** @type {HTMLAnchorElement} */
            videoA.style.fontSize = fontSize;
            videoA.textContent = '\u89C6\u9891FLV';
            var assA = document.createElement('a');

            // 1.1 build videoA
            assA.style.fontSize = fontSize;
            assA.textContent = '\u5F39\u5E55ASS';
            videoA.onmouseover = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee70() {
                var video_format;
                return regeneratorRuntime.wrap(function _callee70$(_context72) {
                    while (1) {
                        switch (_context72.prev = _context72.next) {
                            case 0:
                                // 1.1.1 give processing hint
                                videoA.textContent = '正在FLV';
                                videoA.onmouseover = null;

                                // 1.1.2 query video
                                _context72.next = 4;
                                return monkey.queryInfo('video');

                            case 4:
                                video_format = _context72.sent;


                                // 1.1.3 display video
                                videoA.textContent = '\u89C6\u9891' + (video_format ? video_format.toUpperCase() : 'FLV');
                                videoA.onclick = function () {
                                    return _this50.displayFLVDiv();
                                };

                            case 7:
                            case 'end':
                                return _context72.stop();
                        }
                    }
                }, _callee70, _this50);
            }));

            // 1.2 build assA
            assA.onmouseover = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee71() {
                var clicked;
                return regeneratorRuntime.wrap(function _callee71$(_context73) {
                    while (1) {
                        switch (_context73.prev = _context73.next) {
                            case 0:
                                // 1.2.1 give processing hint
                                assA.textContent = '正在ASS';
                                assA.onmouseover = null;

                                clicked = false;

                                assA.addEventListener("click", function () {
                                    clicked = true;
                                }, { once: true });

                                // 1.2.2 query flv
                                _context73.next = 6;
                                return monkey.queryInfo('ass');

                            case 6:
                                assA.href = _context73.sent;


                                // 1.2.3 response mp4
                                assA.textContent = '弹幕ASS';
                                if (monkey.mp4 && monkey.mp4.match) {
                                    assA.download = monkey.mp4.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0] + '.ass';
                                } else {
                                    assA.download = monkey.cid + '.ass';
                                }

                                if (clicked) {
                                    assA.click();
                                }

                            case 10:
                            case 'end':
                                return _context73.stop();
                        }
                    }
                }, _callee71, _this50);
            }));

            // 2. save to cache
            Object.assign(this.cidSessionDom, { videoA: videoA, assA: assA });
            return this.cidSessionDom;
        }
    }, {
        key: 'appendTitle',
        value: function appendTitle() {
            var _ref90 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cidSessionDom,
                videoA = _ref90.videoA,
                assA = _ref90.assA;

            // 1. build div
            var div = document.createElement('div');

            // 2. append to title
            div.addEventListener('click', function (e) {
                return e.stopPropagation();
            });
            div.className = 'bilitwin';
            div.append.apply(div, [videoA, ' ', assA]);
            var tminfo = document.querySelector('div.tminfo') || document.querySelector('div.info-second') || document.querySelector('div.video-data') || document.querySelector("#h1_module") || document.querySelector(".media-title");
            tminfo.style.float = 'none';
            tminfo.after(div);

            var h1_module = document.querySelector("#h1_module") || document.querySelector(".media-title");
            if (h1_module) {
                h1_module.style.marginBottom = "0px";
            }

            // 3. save to cache
            this.cidSessionDom.titleDiv = div;

            this.appendSubtitleAs(div);

            return div;
        }
    }, {
        key: 'buildSubtitleAs',
        value: function () {
            var _ref91 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee72() {
                var subtitleList, fontSize, monkey, subtitleAs;
                return regeneratorRuntime.wrap(function _callee72$(_context74) {
                    while (1) {
                        switch (_context74.prev = _context74.next) {
                            case 0:
                                if (!(this.cidSessionDom && this.cidSessionDom.subtitleAs)) {
                                    _context74.next = 2;
                                    break;
                                }

                                return _context74.abrupt('return', this.cidSessionDom.subtitleAs);

                            case 2:
                                _context74.next = 4;
                                return getSubtitles(aid, cid);

                            case 4:
                                subtitleList = _context74.sent;
                                fontSize = '15px';
                                monkey = this.twin.monkey;
                                subtitleAs = subtitleList.map(function (subtitle) {
                                    var lanDoc = subtitle.language_doc.replace(/（/g, "(").replace(/）/g, ")");

                                    /** @type {HTMLAnchorElement} */
                                    var a = document.createElement('a');
                                    a.style.fontSize = fontSize;
                                    a.textContent = lanDoc + '\u5B57\u5E55ASS';
                                    a.lan = subtitle.language;

                                    a.onclick = function () {
                                        var blob = new Blob([subtitle.ass]);
                                        a.href = URL.createObjectURL(blob);

                                        var name = "";
                                        if (monkey.mp4 && monkey.mp4.match) {
                                            name = monkey.mp4.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0];
                                        } else {
                                            name = monkey.cid || cid;
                                        }

                                        a.download = name + '.' + subtitle.language + '.ass';

                                        a.onclick = null;
                                    };

                                    return a;
                                });


                                this.cidSessionDom.subtitleAs = subtitleAs;
                                return _context74.abrupt('return', subtitleAs);

                            case 10:
                            case 'end':
                                return _context74.stop();
                        }
                    }
                }, _callee72, this);
            }));

            function buildSubtitleAs() {
                return _ref91.apply(this, arguments);
            }

            return buildSubtitleAs;
        }()
    }, {
        key: 'appendSubtitleAs',
        value: function () {
            var _ref92 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee73(div) {
                var subtitleAs, items;
                return regeneratorRuntime.wrap(function _callee73$(_context75) {
                    while (1) {
                        switch (_context75.prev = _context75.next) {
                            case 0:
                                _context75.next = 2;
                                return this.buildSubtitleAs();

                            case 2:
                                subtitleAs = _context75.sent;
                                items = subtitleAs.reduce(function (p, c) {
                                    // 在每一项前添加空格
                                    return p.concat(' ', c);
                                }, []);


                                div.append.apply(div, _toConsumableArray(items));

                            case 5:
                            case 'end':
                                return _context75.stop();
                        }
                    }
                }, _callee73, this);
            }));

            function appendSubtitleAs(_x95) {
                return _ref92.apply(this, arguments);
            }

            return appendSubtitleAs;
        }()
    }, {
        key: 'appendShortVideoTitle',
        value: function appendShortVideoTitle(_ref93) {
            var video_playurl = _ref93.video_playurl,
                cover_img = _ref93.cover_img;

            var fontSize = '15px';
            var marginRight = '15px';
            var videoA = document.createElement('a');
            videoA.style.fontSize = fontSize;
            videoA.style.marginRight = marginRight;
            videoA.href = video_playurl;
            videoA.target = '_blank';
            videoA.textContent = '\u4E0B\u8F7D\u89C6\u9891';
            var coverA = document.createElement('a');

            coverA.style.fontSize = fontSize;
            coverA.href = cover_img;
            coverA.target = '_blank';
            coverA.textContent = '\u83B7\u53D6\u5C01\u9762';
            videoA.onclick = function (e) {
                e.preventDefault();alert("请使用右键另存为下载视频");
            };

            var span = document.createElement('span');

            span.addEventListener('click', function (e) {
                return e.stopPropagation();
            });
            span.className = 'bilitwin';
            span.append.apply(span, [videoA, ' ', coverA]);
            var infoDiv = document.querySelector('div.base-info div.info');
            infoDiv.appendChild(span);
        }
    }, {
        key: 'buildFLVDiv',
        value: function buildFLVDiv() {
            var monkey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin.monkey;
            var flvs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : monkey.flvs;

            var _this51 = this;

            var cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : monkey.cache;
            var format = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : monkey.video_format;

            // 1. build video splits
            var flvTrs = flvs.map(function (href, index) {
                var tr = document.createElement('tr');
                {
                    var td1 = document.createElement('td');
                    var a1 = document.createElement('a');
                    a1.href = href;
                    a1.download = cid + '-' + (index + 1) + '.' + (format || "flv");
                    a1.textContent = '\u89C6\u9891\u5206\u6BB5 ' + (index + 1);
                    td1.append(a1);
                    tr.append(td1);
                    var td2 = document.createElement('td');
                    var a2 = document.createElement('a');

                    a2.onclick = function (e) {
                        return _this51.downloadFLV({
                            monkey: monkey,
                            index: index,
                            a: e.target,
                            progress: tr.children[2].children[0]
                        });
                    };

                    a2.textContent = '\u7F13\u5B58\u672C\u6BB5';
                    td2.append(a2);
                    tr.append(td2);
                    var td3 = document.createElement('td');
                    var progress1 = document.createElement('progress');
                    progress1.setAttribute('value', '0');
                    progress1.setAttribute('max', '100');
                    progress1.textContent = '\u8FDB\u5EA6\u6761';
                    td3.append(progress1);
                    tr.append(td3);
                }
                return tr;
            });

            // 2. build exporter a
            var exporterA = document.createElement('a');
            if (this.option.aria2) {
                exporterA.textContent = '导出Aria2';
                exporterA.download = 'bilitwin.session';
                exporterA.href = URL.createObjectURL(new Blob([Exporter.exportAria2(flvs, top.location.origin)]));
            } else if (this.option.aria2RPC) {
                exporterA.textContent = '发送Aria2 RPC';
                exporterA.onclick = function () {
                    return Exporter.sendToAria2RPC(flvs, top.location.origin);
                };
            } else if (this.option.m3u8) {
                exporterA.textContent = '导出m3u8';
                exporterA.download = 'bilitwin.m3u8';
                exporterA.href = URL.createObjectURL(new Blob([Exporter.exportM3U8(flvs, top.location.origin, top.navigator.userAgent)]));
            } else if (this.option.clipboard) {
                exporterA.textContent = '全部复制到剪贴板';
                exporterA.onclick = function () {
                    return Exporter.copyToClipboard(flvs.join('\n'));
                };
            } else {
                exporterA.textContent = '导出IDM';
                exporterA.download = 'bilitwin.ef2';
                exporterA.href = URL.createObjectURL(new Blob([Exporter.exportIDM(flvs, top.location.origin)]));
            }

            // 3. build body table
            var table = document.createElement('table');
            table.style.width = '100%';
            table.style.lineHeight = '2em';
            table.append.apply(table, _toConsumableArray(flvTrs).concat([function () {
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.append.apply(td1, [exporterA]);
                tr1.append(td1);
                var td2 = document.createElement('td');
                var a1 = document.createElement('a');

                a1.onclick = function (e) {
                    return format != "mp4" ? _this51.downloadAllFLVs({
                        a: e.target,
                        monkey: monkey,
                        table: table
                    }) : top.alert("不支持合并MP4视频");
                };

                a1.textContent = '\u7F13\u5B58\u5168\u90E8+\u81EA\u52A8\u5408\u5E76';
                td2.append(a1);
                tr1.append(td2);
                var td3 = document.createElement('td');
                var progress1 = document.createElement('progress');
                progress1.setAttribute('value', '0');
                progress1.setAttribute('max', flvs.length + 1);
                progress1.textContent = '\u8FDB\u5EA6\u6761';
                td3.append(progress1);
                tr1.append(td3);
                return tr1;
            }(), function () {
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.colSpan = '3';
                td1.textContent = '\u5408\u5E76\u529F\u80FD\u63A8\u8350\u914D\u7F6E\uFF1A\u81F3\u5C118G RAM\u3002\u628A\u81EA\u5DF1\u4E0B\u8F7D\u7684\u5206\u6BB5FLV\u62D6\u52A8\u5230\u8FD9\u91CC\uFF0C\u4E5F\u53EF\u4EE5\u5408\u5E76\u54E6~';
                tr1.append(td1);
                return tr1;
            }(), cache ? function () {
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.colSpan = '3';
                td1.textContent = '\u4E0B\u8F7D\u7684\u7F13\u5B58\u5206\u6BB5\u4F1A\u6682\u65F6\u505C\u7559\u5728\u7535\u8111\u91CC\uFF0C\u8FC7\u4E00\u6BB5\u65F6\u95F4\u4F1A\u81EA\u52A8\u6D88\u5931\u3002\u5EFA\u8BAE\u53EA\u5F00\u4E00\u4E2A\u6807\u7B7E\u9875\u3002';
                tr1.append(td1);
                return tr1;
            }() : function () {
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.colSpan = '3';
                td1.textContent = '\u5EFA\u8BAE\u53EA\u5F00\u4E00\u4E2A\u6807\u7B7E\u9875\u3002\u5173\u6389\u6807\u7B7E\u9875\u540E\uFF0C\u7F13\u5B58\u5C31\u4F1A\u88AB\u6E05\u7406\u3002\u522B\u5FD8\u4E86\u53E6\u5B58\u4E3A\uFF01';
                tr1.append(td1);
                return tr1;
            }(), function () {
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.colSpan = '3';
                _this51.displayQuota.bind(_this51)(td1);
                tr1.append(td1);
                return tr1;
            }()]));
            this.cidSessionDom.flvTable = table;

            // 4. build container dlv
            var div = UI.genDiv();
            div.ondragenter = div.ondragover = function (e) {
                return UI.allowDrag(e);
            };
            div.ondrop = function () {
                var _ref94 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee74(e) {
                    var files, outputName, href;
                    return regeneratorRuntime.wrap(function _callee74$(_context76) {
                        while (1) {
                            switch (_context76.prev = _context76.next) {
                                case 0:
                                    // 4.1 allow drag
                                    UI.allowDrag(e);

                                    // 4.2 sort files if possible
                                    files = Array.from(e.dataTransfer.files);

                                    if (files.every(function (e) {
                                        return e.name.search(/\d+-\d+(?:\d|-|hd)*\.flv/) != -1;
                                    })) {
                                        files.sort(function (a, b) {
                                            return a.name.match(/\d+-(\d+)(?:\d|-|hd)*\.flv/)[1] - b.name.match(/\d+-(\d+)(?:\d|-|hd)*\.flv/)[1];
                                        });
                                    }

                                    // 4.3 give loaded files hint
                                    table.append.apply(table, _toConsumableArray(files.map(function (e) {
                                        var tr1 = document.createElement('tr');
                                        var td1 = document.createElement('td');
                                        td1.colSpan = '3';
                                        td1.textContent = e.name;
                                        tr1.append(td1);
                                        return tr1;
                                    })));

                                    // 4.4 determine output name
                                    outputName = files[0].name.match(/\d+-\d+(?:\d|-|hd)*\.flv/);

                                    if (outputName) outputName = outputName[0].replace(/-\d/, "");else outputName = 'merge_' + files[0].name;

                                    // 4.5 build output ui
                                    _context76.next = 8;
                                    return _this51.twin.mergeFLVFiles(files);

                                case 8:
                                    href = _context76.sent;

                                    table.append(function () {
                                        var tr1 = document.createElement('tr');
                                        var td1 = document.createElement('td');
                                        td1.colSpan = '3';
                                        var a1 = document.createElement('a');
                                        a1.href = href;
                                        a1.download = outputName;
                                        a1.textContent = outputName;
                                        td1.append(a1);
                                        tr1.append(td1);
                                        return tr1;
                                    }());

                                case 10:
                                case 'end':
                                    return _context76.stop();
                            }
                        }
                    }, _callee74, _this51);
                }));

                return function (_x100) {
                    return _ref94.apply(this, arguments);
                };
            }();

            // 5. build util buttons
            div.append(table, function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function () {
                    return div.style.display = 'none';
                };

                button.textContent = '\u5173\u95ED';
                return button;
            }(), function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function () {
                    return monkey.cleanAllFLVsInCache();
                };

                button.textContent = '\u6E05\u7A7A\u8FD9\u4E2A\u89C6\u9891\u7684\u7F13\u5B58';
                return button;
            }(), function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function () {
                    return _this51.twin.clearCacheDB(cache);
                };

                button.textContent = '\u6E05\u7A7A\u6240\u6709\u89C6\u9891\u7684\u7F13\u5B58';
                return button;
            }());

            // 6. cancel on destroy
            this.cidSessionDestroy.addCallback(function () {
                flvTrs.map(function (tr) {
                    var a = tr.children[1].children[0];
                    if (a.textContent == '取消') a.click();
                });
            });

            return this.cidSessionDom.flvDiv = div;
        }
    }, {
        key: 'displayFLVDiv',
        value: function displayFLVDiv() {
            var flvDiv = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cidSessionDom.flvDiv;

            if (!flvDiv) {
                flvDiv = this.buildFLVDiv();
                document.body.append(flvDiv);
            }
            flvDiv.style.display = '';
            return flvDiv;
        }
    }, {
        key: 'downloadAllFLVs',
        value: function () {
            var _ref96 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee75(_ref95) {
                var _this52 = this;

                var a = _ref95.a,
                    _ref95$monkey = _ref95.monkey,
                    monkey = _ref95$monkey === undefined ? this.twin.monkey : _ref95$monkey,
                    _ref95$table = _ref95.table,
                    table = _ref95$table === undefined ? this.cidSessionDom.flvTable : _ref95$table;

                var i, progress, _i4, files, flv, href, ass, subtitleAs, subtitleAssList, outputName, pageNameElement, pageName;

                return regeneratorRuntime.wrap(function _callee75$(_context77) {
                    while (1) {
                        switch (_context77.prev = _context77.next) {
                            case 0:
                                if (!this.cidSessionDom.downloadAllTr) {
                                    _context77.next = 2;
                                    break;
                                }

                                return _context77.abrupt('return');

                            case 2:

                                // 1. hang player
                                monkey.hangPlayer();

                                // 2. give hang player hint
                                this.cidSessionDom.downloadAllTr = function () {
                                    var tr1 = document.createElement('tr');
                                    var td1 = document.createElement('td');
                                    td1.colSpan = '3';
                                    td1.textContent = '\u5DF2\u5C4F\u853D\u7F51\u9875\u64AD\u653E\u5668\u7684\u7F51\u7EDC\u94FE\u63A5\u3002\u5237\u65B0\u9875\u9762\u53EF\u91CD\u65B0\u6FC0\u6D3B\u64AD\u653E\u5668\u3002';
                                    tr1.append(td1);
                                    return tr1;
                                }();
                                table.append(this.cidSessionDom.downloadAllTr);

                                // 3. click download all split
                                for (i = 0; i < monkey.flvs.length; i++) {
                                    if (table.rows[i].cells[1].children[0].textContent == '缓存本段') table.rows[i].cells[1].children[0].click();
                                }

                                // 4. set progress
                                progress = a.parentElement.nextElementSibling.children[0];

                                progress.max = monkey.flvs.length + 1;
                                progress.value = 0;
                                for (_i4 = 0; _i4 < monkey.flvs.length; _i4++) {
                                    monkey.getFLV(_i4).then(function (e) {
                                        return progress.value++;
                                    });
                                } // 5. merge splits
                                _context77.next = 12;
                                return monkey.getAllFLVs();

                            case 12:
                                files = _context77.sent;
                                _context77.next = 15;
                                return FLV.mergeBlobs(files);

                            case 15:
                                flv = _context77.sent;
                                href = URL.createObjectURL(flv);
                                _context77.next = 19;
                                return monkey.getASS();

                            case 19:
                                ass = _context77.sent;
                                _context77.next = 22;
                                return this.buildSubtitleAs();

                            case 22:
                                subtitleAs = _context77.sent;
                                subtitleAssList = subtitleAs.map(function (a) {
                                    if (a.onclick && typeof a.onclick === "function") {
                                        a.onclick();
                                    }
                                    return {
                                        name: a.text.replace(/ASS$/, ""),
                                        file: a.href
                                    };
                                });
                                outputName = top.document.getElementsByTagName('h1')[0].textContent.trim();
                                pageNameElement = document.querySelector(".bilibili-player-video-top-title, .multi-page .on");

                                if (pageNameElement) {
                                    pageName = pageNameElement.textContent;

                                    if (pageName && pageName != outputName) outputName += ' - ' + pageName;
                                }

                                // 6. build download all ui
                                progress.value++;
                                table.prepend(function () {
                                    var tr1 = document.createElement('tr');
                                    var td1 = document.createElement('td');
                                    td1.colSpan = '3';
                                    td1.style = 'border: 1px solid black; word-break: keep-all;';
                                    var a1 = document.createElement('a');
                                    a1.href = href;
                                    a1.download = outputName + '.flv';

                                    (function (a) {
                                        if (_this52.option.autoDanmaku) a.onclick = function () {
                                            return a.nextElementSibling.click();
                                        };
                                    })(a1);

                                    a1.textContent = '\u4FDD\u5B58\u5408\u5E76\u540EFLV';
                                    td1.append(a1);
                                    td1.append(' ');
                                    var a2 = document.createElement('a');
                                    a2.href = ass;
                                    a2.download = outputName + '.danmaku.ass';
                                    a2.textContent = '\u5F39\u5E55ASS';
                                    td1.append(a2);
                                    td1.append(' ');
                                    var a3 = document.createElement('a');
                                    a3.download = outputName + '.aac';

                                    a3.onclick = function (e) {
                                        var aacA = e.target;
                                        FLV2AAC(flv).then(function (aacData) {
                                            var blob = new Blob([aacData]);
                                            aacA.href = URL.createObjectURL(blob);
                                            aacA.onclick = null;
                                            aacA.click();
                                        });
                                    };

                                    a3.textContent = '\u97F3\u9891AAC';
                                    td1.append(a3);
                                    td1.append.apply(td1, _toConsumableArray(subtitleAs.reduce(function (p, c) {
                                        // 在每一项前添加空格
                                        return p.concat(' ', function () {
                                            var a4 = document.createElement('a');
                                            a4.href = c.href;
                                            a4.download = outputName + '.' + c.lan + '.ass';
                                            a4.textContent = c.textContent;
                                            return a4;
                                        }());
                                    }, [])));
                                    td1.append(' ');
                                    var a4 = document.createElement('a');

                                    a4.onclick = function (e) {
                                        return new MKVTransmuxer().exec(href, ass, outputName + '.mkv', e.target, subtitleAssList);
                                    };

                                    a4.textContent = '\u6253\u5305MKV(\u8F6F\u5B57\u5E55\u5C01\u88C5)';
                                    td1.append(a4);
                                    td1.append(' ');
                                    td1.append('\u8BB0\u5F97\u6E05\u7406\u5206\u6BB5\u7F13\u5B58\u54E6~');
                                    tr1.append(td1);
                                    return tr1;
                                }());

                                return _context77.abrupt('return', href);

                            case 30:
                            case 'end':
                                return _context77.stop();
                        }
                    }
                }, _callee75, this);
            }));

            function downloadAllFLVs(_x102) {
                return _ref96.apply(this, arguments);
            }

            return downloadAllFLVs;
        }()
    }, {
        key: 'downloadFLV',
        value: function () {
            var _ref98 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee76(_ref97) {
                var a = _ref97.a,
                    _ref97$monkey = _ref97.monkey,
                    monkey = _ref97$monkey === undefined ? this.twin.monkey : _ref97$monkey,
                    index = _ref97.index,
                    _ref97$progress = _ref97.progress,
                    progress = _ref97$progress === undefined ? {} : _ref97$progress;
                var handler, url;
                return regeneratorRuntime.wrap(function _callee76$(_context78) {
                    while (1) {
                        switch (_context78.prev = _context78.next) {
                            case 0:
                                // 1. add beforeUnloadHandler
                                handler = function handler(e) {
                                    return UI.beforeUnloadHandler(e);
                                };

                                window.addEventListener('beforeunload', handler);

                                // 2. switch to cancel ui
                                a.textContent = '取消';
                                a.onclick = function () {
                                    a.onclick = null;
                                    window.removeEventListener('beforeunload', handler);
                                    a.textContent = '已取消';
                                    monkey.abortFLV(index);
                                };

                                // 3. try download
                                url = void 0;
                                _context78.prev = 5;
                                _context78.next = 8;
                                return monkey.getFLV(index, function (loaded, total) {
                                    progress.value = loaded;
                                    progress.max = total;
                                });

                            case 8:
                                url = _context78.sent;

                                url = URL.createObjectURL(url);
                                if (progress.value == 0) progress.value = progress.max = 1;
                                _context78.next = 19;
                                break;

                            case 13:
                                _context78.prev = 13;
                                _context78.t0 = _context78['catch'](5);

                                a.onclick = null;
                                window.removeEventListener('beforeunload', handler);
                                a.textContent = '错误';
                                throw _context78.t0;

                            case 19:

                                // 4. switch to complete ui
                                a.onclick = null;
                                window.removeEventListener('beforeunload', handler);
                                a.textContent = '另存为';
                                a.download = monkey.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];
                                a.href = url;
                                return _context78.abrupt('return', url);

                            case 25:
                            case 'end':
                                return _context78.stop();
                        }
                    }
                }, _callee76, this, [[5, 13]]);
            }));

            function downloadFLV(_x103) {
                return _ref98.apply(this, arguments);
            }

            return downloadFLV;
        }()
    }, {
        key: 'displayQuota',
        value: function () {
            var _ref99 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee77(td) {
                return regeneratorRuntime.wrap(function _callee77$(_context79) {
                    while (1) {
                        switch (_context79.prev = _context79.next) {
                            case 0:
                                return _context79.abrupt('return', new Promise(function (resolve) {
                                    var temporaryStorage = window.navigator.temporaryStorage || window.navigator.webkitTemporaryStorage || window.navigator.mozTemporaryStorage || window.navigator.msTemporaryStorage;
                                    if (!temporaryStorage) return resolve(td.textContent = '这个浏览器不支持缓存呢~关掉标签页后，缓存马上就会消失哦');
                                    temporaryStorage.queryUsageAndQuota(function (usage, quota) {
                                        return resolve(td.textContent = '\u7F13\u5B58\u5DF2\u7528\u7A7A\u95F4\uFF1A' + Math.round(usage / 1048576) + ' MB / ' + Math.round(quota / 1048576) + ' MB \u4E5F\u5305\u62EC\u4E86B\u7AD9\u672C\u6765\u7684\u7F13\u5B58');
                                    });
                                }));

                            case 1:
                            case 'end':
                                return _context79.stop();
                        }
                    }
                }, _callee77, this);
            }));

            function displayQuota(_x104) {
                return _ref99.apply(this, arguments);
            }

            return displayQuota;
        }()

        // Menu Append

    }, {
        key: 'appendMenu',
        value: function () {
            var _ref100 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee78() {
                var playerWin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin.playerWin;
                var monkeyMenu, polyfillMenu, ul, menus0, div;
                return regeneratorRuntime.wrap(function _callee78$(_context80) {
                    while (1) {
                        switch (_context80.prev = _context80.next) {
                            case 0:
                                // 1. build monkey menu and polyfill menu
                                monkeyMenu = this.buildMonkeyMenu();
                                polyfillMenu = this.buildPolyfillMenu();

                                // 2. build ul

                                ul = document.createElement('ul');

                                // 3. append to menu

                                ul.className = 'bilitwin';
                                ul.style.borderBottom = '1px solid rgba(255,255,255,.12)';
                                ul.append.apply(ul, [monkeyMenu, polyfillMenu]);
                                menus0 = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black bilibili-player-context-menu-origin');

                                if (!(menus0.length == 0)) {
                                    _context80.next = 10;
                                    break;
                                }

                                _context80.next = 10;
                                return new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        var menus1 = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black bilibili-player-context-menu-origin');
                                        var menus2 = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black');
                                        if (menus1.length > 0 || menus2.length >= 2) {
                                            observer.disconnect();
                                            resolve();
                                        }
                                    });
                                    observer.observe(playerWin.document.querySelector("#bilibiliPlayer"), {
                                        childList: true,
                                        attributeFilter: ["class"]
                                    });
                                });

                            case 10:
                                div = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black bilibili-player-context-menu-origin')[0] || [].concat(_toConsumableArray(playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black'))).pop();

                                div.prepend(ul);

                                // 4. save to cache
                                this.cidSessionDom.menuUl = ul;

                                return _context80.abrupt('return', ul);

                            case 14:
                            case 'end':
                                return _context80.stop();
                        }
                    }
                }, _callee78, this);
            }));

            function appendMenu() {
                return _ref100.apply(this, arguments);
            }

            return appendMenu;
        }()
    }, {
        key: 'buildMonkeyMenu',
        value: function buildMonkeyMenu() {
            var _this53 = this;

            var _ref101 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref101$playerWin = _ref101.playerWin,
                playerWin = _ref101$playerWin === undefined ? this.twin.playerWin : _ref101$playerWin,
                _ref101$BiliMonkey = _ref101.BiliMonkey,
                BiliMonkey = _ref101$BiliMonkey === undefined ? this.twin.BiliMonkey : _ref101$BiliMonkey,
                _ref101$monkey = _ref101.monkey,
                monkey = _ref101$monkey === undefined ? this.twin.monkey : _ref101$monkey,
                _ref101$videoA = _ref101.videoA,
                videoA = _ref101$videoA === undefined ? this.cidSessionDom.videoA : _ref101$videoA,
                _ref101$assA = _ref101.assA,
                assA = _ref101$assA === undefined ? this.cidSessionDom.assA : _ref101$assA;

            var context_menu_videoA = document.createElement('li');

            {
                context_menu_videoA.className = 'context-menu-function';

                context_menu_videoA.onmouseover = function () {
                    var _ref103 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee79(_ref102) {
                        var target = _ref102.target;
                        var textNode;
                        return regeneratorRuntime.wrap(function _callee79$(_context81) {
                            while (1) {
                                switch (_context81.prev = _context81.next) {
                                    case 0:
                                        if (!videoA.onmouseover) {
                                            _context81.next = 3;
                                            break;
                                        }

                                        _context81.next = 3;
                                        return videoA.onmouseover();

                                    case 3:
                                        textNode = target.querySelector('#download-btn-vformat');

                                        if (textNode && textNode.textContent) {
                                            textNode.textContent = monkey.video_format ? monkey.video_format.toUpperCase() : 'FLV';
                                        }

                                    case 5:
                                    case 'end':
                                        return _context81.stop();
                                }
                            }
                        }, _callee79, _this53);
                    }));

                    return function (_x107) {
                        return _ref103.apply(this, arguments);
                    };
                }();

                context_menu_videoA.onclick = function () {
                    return videoA.click();
                };

                var _a = document.createElement('a');
                _a.className = 'context-menu-a';
                var _span = document.createElement('span');
                _span.className = 'video-contextmenu-icon';
                _a.append(_span);
                _a.append(' \u4E0B\u8F7D\u89C6\u9891');
                var downloadBtnVformat = document.createElement('span');
                downloadBtnVformat.id = 'download-btn-vformat';
                downloadBtnVformat.textContent = 'FLV';
                _a.append(downloadBtnVformat);
                context_menu_videoA.append(_a);
            }

            Object.assign(this.cidSessionDom, { context_menu_videoA: context_menu_videoA });

            /** @type {HTMLLIElement} */
            var downloadSubtitlesContextMenu = document.createElement('li');

            {
                downloadSubtitlesContextMenu.className = 'context-menu-menu';

                downloadSubtitlesContextMenu.onmouseover = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee80() {
                    var subtitleAs;
                    return regeneratorRuntime.wrap(function _callee80$(_context82) {
                        while (1) {
                            switch (_context82.prev = _context82.next) {
                                case 0:
                                    _context82.next = 2;
                                    return _this53.buildSubtitleAs();

                                case 2:
                                    subtitleAs = _context82.sent;


                                    if (subtitleAs && subtitleAs.length > 0) {

                                        downloadSubtitlesContextMenu.appendChild(function () {
                                            var ul1 = document.createElement('ul');
                                            ul1.append.apply(ul1, _toConsumableArray(subtitleAs.map(function (a) {
                                                var li = document.createElement('li');
                                                li.className = 'context-menu-function';
                                                var a1 = document.createElement('a');
                                                a1.className = 'context-menu-a';

                                                a1.onclick = function () {
                                                    return a.click();
                                                };

                                                var span1 = document.createElement('span');
                                                span1.className = 'video-contextmenu-icon';
                                                a1.append(span1);
                                                a1.append(a.text.replace(/字幕ASS$/, ""));
                                                li.append(a1);

                                                return li;
                                            })));
                                            return ul1;
                                        }());
                                    } else {

                                        downloadSubtitlesContextMenu.appendChild(function () {
                                            var ul1 = document.createElement('ul');
                                            var li = document.createElement('li');
                                            li.className = 'context-menu-function';
                                            var a1 = document.createElement('a');
                                            a1.className = 'context-menu-a';
                                            var span1 = document.createElement('span');
                                            span1.className = 'video-contextmenu-icon';
                                            a1.append(span1);
                                            a1.append(' \u65E0\u5B57\u5E55');
                                            li.append(a1);
                                            ul1.append(li);
                                            return ul1;
                                        }());
                                    }

                                    downloadSubtitlesContextMenu.onmouseover = null;

                                case 5:
                                case 'end':
                                    return _context82.stop();
                            }
                        }
                    }, _callee80, _this53);
                }));

                var _a2 = document.createElement('a');
                _a2.className = 'context-menu-a';
                var _span2 = document.createElement('span');
                _span2.className = 'video-contextmenu-icon';
                _a2.append(_span2);
                _a2.append(' \u4E0B\u8F7D\u5B57\u5E55ASS');
                var _span3 = document.createElement('span');
                _span3.className = 'bpui-icon bpui-icon-arrow-down';
                _span3.style = 'transform:rotate(-90deg);margin-top:3px;';
                _a2.append(_span3);
                downloadSubtitlesContextMenu.append(_a2);
            }var li = document.createElement('li');
            li.className = 'context-menu-menu bilitwin';

            li.onclick = function () {
                return playerWin.document.getElementById('bilibiliPlayer').click();
            };

            var a1 = document.createElement('a');
            a1.className = 'context-menu-a';
            a1.append('BiliMonkey');
            var span1 = document.createElement('span');
            span1.className = 'bpui-icon bpui-icon-arrow-down';
            span1.style = 'transform:rotate(-90deg);margin-top:3px;';
            a1.append(span1);
            li.append(a1);
            var ul1 = document.createElement('ul');
            ul1.append(context_menu_videoA);
            var li1 = document.createElement('li');
            li1.className = 'context-menu-function';

            li1.onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee81() {
                return regeneratorRuntime.wrap(function _callee81$(_context83) {
                    while (1) {
                        switch (_context83.prev = _context83.next) {
                            case 0:
                                if (!assA.onmouseover) {
                                    _context83.next = 3;
                                    break;
                                }

                                _context83.next = 3;
                                return assA.onmouseover();

                            case 3:
                                assA.click();

                            case 4:
                            case 'end':
                                return _context83.stop();
                        }
                    }
                }, _callee81, _this53);
            }));

            var a2 = document.createElement('a');
            a2.className = 'context-menu-a';
            var span2 = document.createElement('span');
            span2.className = 'video-contextmenu-icon';
            a2.append(span2);
            a2.append(' \u4E0B\u8F7D\u5F39\u5E55ASS');
            li1.append(a2);
            ul1.append(li1);
            ul1.append(downloadSubtitlesContextMenu);
            var li2 = document.createElement('li');
            li2.className = 'context-menu-function';

            li2.onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee82() {
                return regeneratorRuntime.wrap(function _callee82$(_context84) {
                    while (1) {
                        switch (_context84.prev = _context84.next) {
                            case 0:
                                _context84.t0 = UI;
                                _context84.next = 3;
                                return BiliMonkey.getAllPageDefaultFormats(playerWin, monkey);

                            case 3:
                                _context84.t1 = _context84.sent;
                                return _context84.abrupt('return', _context84.t0.displayDownloadAllPageDefaultFormatsBody.call(_context84.t0, _context84.t1));

                            case 5:
                            case 'end':
                                return _context84.stop();
                        }
                    }
                }, _callee82, _this53);
            }));

            var a3 = document.createElement('a');
            a3.className = 'context-menu-a';
            var span3 = document.createElement('span');
            span3.className = 'video-contextmenu-icon';
            a3.append(span3);
            a3.append(' \u6279\u91CF\u4E0B\u8F7D');
            li2.append(a3);
            ul1.append(li2);
            var li3 = document.createElement('li');
            li3.className = 'context-menu-function';

            li3.onclick = function () {
                return _this53.displayOptionDiv();
            };

            var a4 = document.createElement('a');
            a4.className = 'context-menu-a';
            var span4 = document.createElement('span');
            span4.className = 'video-contextmenu-icon';
            a4.append(span4);
            a4.append(' \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E');
            li3.append(a4);
            ul1.append(li3);
            var li4 = document.createElement('li');
            li4.className = 'context-menu-function';

            li4.onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee83() {
                return regeneratorRuntime.wrap(function _callee83$(_context85) {
                    while (1) {
                        switch (_context85.prev = _context85.next) {
                            case 0:
                                monkey.proxy = true;
                                monkey.flvs = null;
                                UI.hintInfo('请稍候，可能需要10秒时间……', playerWin);
                                // Yes, I AM lazy.
                                playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="80"]').click();
                                _context85.next = 6;
                                return new Promise(function (r) {
                                    return playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', r);
                                });

                            case 6:
                                return _context85.abrupt('return', monkey.queryInfo('video'));

                            case 7:
                            case 'end':
                                return _context85.stop();
                        }
                    }
                }, _callee83, _this53);
            }));

            var a5 = document.createElement('a');
            a5.className = 'context-menu-a';
            var span5 = document.createElement('span');
            span5.className = 'video-contextmenu-icon';
            a5.append(span5);
            a5.append(' (\u6D4B)\u8F7D\u5165\u7F13\u5B58FLV');
            li4.append(a5);
            ul1.append(li4);
            var li5 = document.createElement('li');
            li5.className = 'context-menu-function';

            li5.onclick = function () {
                return top.location.reload(true);
            };

            var a6 = document.createElement('a');
            a6.className = 'context-menu-a';
            var span6 = document.createElement('span');
            span6.className = 'video-contextmenu-icon';
            a6.append(span6);
            a6.append(' (\u6D4B)\u5F3A\u5236\u5237\u65B0');
            li5.append(a6);
            ul1.append(li5);
            var li6 = document.createElement('li');
            li6.className = 'context-menu-function';

            li6.onclick = function () {
                return _this53.cidSessionDestroy() && _this53.cidSessionRender();
            };

            var a7 = document.createElement('a');
            a7.className = 'context-menu-a';
            var span7 = document.createElement('span');
            span7.className = 'video-contextmenu-icon';
            a7.append(span7);
            a7.append(' (\u6D4B)\u91CD\u542F\u811A\u672C');
            li6.append(a7);
            ul1.append(li6);
            var li7 = document.createElement('li');
            li7.className = 'context-menu-function';

            li7.onclick = function () {
                return playerWin.player && playerWin.player.destroy();
            };

            var a8 = document.createElement('a');
            a8.className = 'context-menu-a';
            var span8 = document.createElement('span');
            span8.className = 'video-contextmenu-icon';
            a8.append(span8);
            a8.append(' (\u6D4B)\u9500\u6BC1\u64AD\u653E\u5668');
            li7.append(a8);
            ul1.append(li7);
            li.append(ul1);

            return li;
        }
    }, {
        key: 'buildPolyfillMenu',
        value: function buildPolyfillMenu() {
            var _this54 = this;

            var _ref108 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref108$playerWin = _ref108.playerWin,
                playerWin = _ref108$playerWin === undefined ? this.twin.playerWin : _ref108$playerWin,
                _ref108$BiliPolyfill = _ref108.BiliPolyfill,
                BiliPolyfill = _ref108$BiliPolyfill === undefined ? this.twin.BiliPolyfill : _ref108$BiliPolyfill,
                _ref108$polyfill = _ref108.polyfill,
                polyfill = _ref108$polyfill === undefined ? this.twin.polyfill : _ref108$polyfill;

            var oped = [];
            var BiliDanmakuSettings = polyfill.BiliDanmakuSettings;
            var refreshSession = new HookedFunction(function () {
                return oped = polyfill.userdata.oped[polyfill.getCollectionId()] || [];
            }); // as a convenient callback register
            var li1 = document.createElement('li');
            li1.className = 'context-menu-menu bilitwin';

            li1.onclick = function () {
                return playerWin.document.getElementById('bilibiliPlayer').click();
            };

            var a2 = document.createElement('a');
            a2.className = 'context-menu-a';

            a2.onmouseover = function () {
                return refreshSession();
            };

            a2.append('BiliPolyfill');
            var span2 = document.createElement('span');
            span2.className = 'bpui-icon bpui-icon-arrow-down';
            span2.style = 'transform:rotate(-90deg);margin-top:3px;';
            a2.append(span2);
            li1.append(a2);
            var ul2 = document.createElement('ul');
            var li2 = document.createElement('li');
            li2.className = 'context-menu-function';

            li2.onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee84() {
                var w;
                return regeneratorRuntime.wrap(function _callee84$(_context86) {
                    while (1) {
                        switch (_context86.prev = _context86.next) {
                            case 0:
                                w = top.window.open("", '_blank');
                                _context86.next = 3;
                                return polyfill.getCoverImage();

                            case 3:
                                w.location = _context86.sent;

                            case 4:
                            case 'end':
                                return _context86.stop();
                        }
                    }
                }, _callee84, _this54);
            }));

            var a3 = document.createElement('a');
            a3.className = 'context-menu-a';
            var span3 = document.createElement('span');
            span3.className = 'video-contextmenu-icon';
            a3.append(span3);
            a3.append(' \u83B7\u53D6\u5C01\u9762');
            li2.append(a3);
            ul2.append(li2);
            var li3 = document.createElement('li');
            li3.className = 'context-menu-menu';
            var a4 = document.createElement('a');
            a4.className = 'context-menu-a';
            var span4 = document.createElement('span');
            span4.className = 'video-contextmenu-icon';
            a4.append(span4);
            a4.append(' \u66F4\u591A\u64AD\u653E\u901F\u5EA6');
            var span5 = document.createElement('span');
            span5.className = 'bpui-icon bpui-icon-arrow-down';
            span5.style = 'transform:rotate(-90deg);margin-top:3px;';
            a4.append(span5);
            li3.append(a4);
            var ul3 = document.createElement('ul');
            var li4 = document.createElement('li');
            li4.className = 'context-menu-function';

            li4.onclick = function () {
                polyfill.setVideoSpeed(0.1);
            };

            var a5 = document.createElement('a');
            a5.className = 'context-menu-a';
            var span6 = document.createElement('span');
            span6.className = 'video-contextmenu-icon';
            a5.append(span6);
            a5.append(' 0.1');
            li4.append(a5);
            ul3.append(li4);
            var li5 = document.createElement('li');
            li5.className = 'context-menu-function';

            li5.onclick = function () {
                polyfill.setVideoSpeed(3);
            };

            var a6 = document.createElement('a');
            a6.className = 'context-menu-a';
            var span7 = document.createElement('span');
            span7.className = 'video-contextmenu-icon';
            a6.append(span7);
            a6.append(' 3');
            li5.append(a6);
            ul3.append(li5);
            var li6 = document.createElement('li');
            li6.className = 'context-menu-function';

            li6.onclick = function (e) {
                return polyfill.setVideoSpeed(e.target.children[1].value);
            };

            var a7 = document.createElement('a');
            a7.className = 'context-menu-a';
            var span8 = document.createElement('span');
            span8.className = 'video-contextmenu-icon';
            a7.append(span8);
            a7.append(' \u70B9\u51FB\u786E\u8BA4');
            var input = document.createElement('input');
            input.type = 'text';
            input.style = 'width: 35px; height: 70%; color:black;';

            input.onclick = function (e) {
                return e.stopPropagation();
            };

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.value = polyfill.video.playbackRate;
                });
            })(input);

            a7.append(input);
            li6.append(a7);
            ul3.append(li6);
            li3.append(ul3);
            ul2.append(li3);
            var li7 = document.createElement('li');
            li7.className = 'context-menu-menu';
            var a8 = document.createElement('a');
            a8.className = 'context-menu-a';
            var span9 = document.createElement('span');
            span9.className = 'video-contextmenu-icon';
            a8.append(span9);
            a8.append(' \u81EA\u5B9A\u4E49\u5F39\u5E55\u5B57\u4F53');
            var span10 = document.createElement('span');
            span10.className = 'bpui-icon bpui-icon-arrow-down';
            span10.style = 'transform:rotate(-90deg);margin-top:3px;';
            a8.append(span10);
            li7.append(a8);
            var ul4 = document.createElement('ul');
            var li8 = document.createElement('li');
            li8.className = 'context-menu-function';

            li8.onclick = function (e) {
                BiliDanmakuSettings.set('fontfamily', e.target.lastChild.value);
                playerWin.location.reload();
            };

            var a9 = document.createElement('a');
            a9.className = 'context-menu-a';
            var input1 = document.createElement('input');
            input1.type = 'text';
            input1.style = 'width: 108px; height: 70%; color:black;';

            input1.onclick = function (e) {
                return e.stopPropagation();
            };

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.value = BiliDanmakuSettings.get('fontfamily');
                });
            })(input1);

            a9.append(input1);
            li8.append(a9);
            ul4.append(li8);
            var li9 = document.createElement('li');
            li9.className = 'context-menu-function';

            li9.onclick = function (e) {
                BiliDanmakuSettings.set('fontfamily', e.target.parentElement.previousElementSibling.querySelector("input").value);
                playerWin.location.reload();
            };

            var a10 = document.createElement('a');
            a10.className = 'context-menu-a';
            a10.textContent = '\n                                \u70B9\u51FB\u786E\u8BA4\u5E76\u5237\u65B0\n                            ';
            li9.append(a10);
            ul4.append(li9);
            li7.append(ul4);
            ul2.append(li7);
            var li10 = document.createElement('li');
            li10.className = 'context-menu-menu';
            var a11 = document.createElement('a');
            a11.className = 'context-menu-a';
            var span11 = document.createElement('span');
            span11.className = 'video-contextmenu-icon';
            a11.append(span11);
            a11.append(' \u7247\u5934\u7247\u5C3E');
            var span12 = document.createElement('span');
            span12.className = 'bpui-icon bpui-icon-arrow-down';
            span12.style = 'transform:rotate(-90deg);margin-top:3px;';
            a11.append(span12);
            li10.append(a11);
            var ul5 = document.createElement('ul');
            var li11 = document.createElement('li');
            li11.className = 'context-menu-function';

            li11.onclick = function () {
                return polyfill.markOPEDPosition(0);
            };

            var a12 = document.createElement('a');
            a12.className = 'context-menu-a';
            var span13 = document.createElement('span');
            span13.className = 'video-contextmenu-icon';
            a12.append(span13);
            a12.append(' \u7247\u5934\u5F00\u59CB:');
            var span14 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = oped[0] ? BiliPolyfill.secondToReadable(oped[0]) : '无';
                });
            })(span14);

            a12.append(span14);
            li11.append(a12);
            ul5.append(li11);
            var li12 = document.createElement('li');
            li12.className = 'context-menu-function';

            li12.onclick = function () {
                return polyfill.markOPEDPosition(1);
            };

            var a13 = document.createElement('a');
            a13.className = 'context-menu-a';
            var span15 = document.createElement('span');
            span15.className = 'video-contextmenu-icon';
            a13.append(span15);
            a13.append(' \u7247\u5934\u7ED3\u675F:');
            var span16 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = oped[1] ? BiliPolyfill.secondToReadable(oped[1]) : '无';
                });
            })(span16);

            a13.append(span16);
            li12.append(a13);
            ul5.append(li12);
            var li13 = document.createElement('li');
            li13.className = 'context-menu-function';

            li13.onclick = function () {
                return polyfill.markOPEDPosition(2);
            };

            var a14 = document.createElement('a');
            a14.className = 'context-menu-a';
            var span17 = document.createElement('span');
            span17.className = 'video-contextmenu-icon';
            a14.append(span17);
            a14.append(' \u7247\u5C3E\u5F00\u59CB:');
            var span18 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = oped[2] ? BiliPolyfill.secondToReadable(oped[2]) : '无';
                });
            })(span18);

            a14.append(span18);
            li13.append(a14);
            ul5.append(li13);
            var li14 = document.createElement('li');
            li14.className = 'context-menu-function';

            li14.onclick = function () {
                return polyfill.markOPEDPosition(3);
            };

            var a15 = document.createElement('a');
            a15.className = 'context-menu-a';
            var span19 = document.createElement('span');
            span19.className = 'video-contextmenu-icon';
            a15.append(span19);
            a15.append(' \u7247\u5C3E\u7ED3\u675F:');
            var span20 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = oped[3] ? BiliPolyfill.secondToReadable(oped[3]) : '无';
                });
            })(span20);

            a15.append(span20);
            li14.append(a15);
            ul5.append(li14);
            var li15 = document.createElement('li');
            li15.className = 'context-menu-function';

            li15.onclick = function () {
                return polyfill.clearOPEDPosition();
            };

            var a16 = document.createElement('a');
            a16.className = 'context-menu-a';
            var span21 = document.createElement('span');
            span21.className = 'video-contextmenu-icon';
            a16.append(span21);
            a16.append(' \u53D6\u6D88\u6807\u8BB0');
            li15.append(a16);
            ul5.append(li15);
            var li16 = document.createElement('li');
            li16.className = 'context-menu-function';

            li16.onclick = function () {
                return _this54.displayPolyfillDataDiv();
            };

            var a17 = document.createElement('a');
            a17.className = 'context-menu-a';
            var span22 = document.createElement('span');
            span22.className = 'video-contextmenu-icon';
            a17.append(span22);
            a17.append(' \u68C0\u89C6\u6570\u636E/\u8BF4\u660E');
            li16.append(a17);
            ul5.append(li16);
            li10.append(ul5);
            ul2.append(li10);
            var li17 = document.createElement('li');
            li17.className = 'context-menu-menu';
            var a18 = document.createElement('a');
            a18.className = 'context-menu-a';
            var span23 = document.createElement('span');
            span23.className = 'video-contextmenu-icon';
            a18.append(span23);
            a18.append(' \u627E\u4E0A\u4E0B\u96C6');
            var span24 = document.createElement('span');
            span24.className = 'bpui-icon bpui-icon-arrow-down';
            span24.style = 'transform:rotate(-90deg);margin-top:3px;';
            a18.append(span24);
            li17.append(a18);
            var ul6 = document.createElement('ul');
            var li18 = document.createElement('li');
            li18.className = 'context-menu-function';

            li18.onclick = function () {
                if (polyfill.series[0]) {
                    top.window.open('https://www.bilibili.com/video/av' + polyfill.series[0].aid, '_blank');
                }
            };

            var a19 = document.createElement('a');
            a19.className = 'context-menu-a';
            a19.style.width = 'initial';
            var span25 = document.createElement('span');
            span25.className = 'video-contextmenu-icon';
            a19.append(span25);
            var span26 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = polyfill.series[0] ? polyfill.series[0].title : '找不到';
                });
            })(span26);

            a19.append(span26);
            li18.append(a19);
            ul6.append(li18);
            var li19 = document.createElement('li');
            li19.className = 'context-menu-function';

            li19.onclick = function () {
                if (polyfill.series[1]) {
                    top.window.open('https://www.bilibili.com/video/av' + polyfill.series[1].aid, '_blank');
                }
            };

            var a20 = document.createElement('a');
            a20.className = 'context-menu-a';
            a20.style.width = 'initial';
            var span27 = document.createElement('span');
            span27.className = 'video-contextmenu-icon';
            a20.append(span27);
            var span28 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = polyfill.series[1] ? polyfill.series[1].title : '找不到';
                });
            })(span28);

            a20.append(span28);
            li19.append(a20);
            ul6.append(li19);
            li17.append(ul6);
            ul2.append(li17);
            var li20 = document.createElement('li');
            li20.className = 'context-menu-function';

            li20.onclick = function () {
                return BiliPolyfill.openMinimizedPlayer();
            };

            var a21 = document.createElement('a');
            a21.className = 'context-menu-a';
            var span29 = document.createElement('span');
            span29.className = 'video-contextmenu-icon';
            a21.append(span29);
            a21.append(' \u5C0F\u7A97\u64AD\u653E');
            li20.append(a21);
            ul2.append(li20);
            var li21 = document.createElement('li');
            li21.className = 'context-menu-function';

            li21.onclick = function () {
                return _this54.displayOptionDiv();
            };

            var a22 = document.createElement('a');
            a22.className = 'context-menu-a';
            var span30 = document.createElement('span');
            span30.className = 'video-contextmenu-icon';
            a22.append(span30);
            a22.append(' \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E');
            li21.append(a22);
            ul2.append(li21);
            var li22 = document.createElement('li');
            li22.className = 'context-menu-function';

            li22.onclick = function () {
                return polyfill.saveUserdata();
            };

            var a23 = document.createElement('a');
            a23.className = 'context-menu-a';
            var span31 = document.createElement('span');
            span31.className = 'video-contextmenu-icon';
            a23.append(span31);
            a23.append(' (\u6D4B)\u7ACB\u5373\u4FDD\u5B58\u6570\u636E');
            li22.append(a23);
            ul2.append(li22);
            var li23 = document.createElement('li');
            li23.className = 'context-menu-function';

            li23.onclick = function () {
                BiliPolyfill.clearAllUserdata(playerWin);
                polyfill.retrieveUserdata();
            };

            var a24 = document.createElement('a');
            a24.className = 'context-menu-a';
            var span32 = document.createElement('span');
            span32.className = 'video-contextmenu-icon';
            a24.append(span32);
            a24.append(' (\u6D4B)\u5F3A\u5236\u6E05\u7A7A\u6570\u636E');
            li23.append(a24);
            ul2.append(li23);
            li1.append(ul2);
            return li1;
        }
    }, {
        key: 'buildOptionDiv',
        value: function buildOptionDiv() {
            var twin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin;

            var div = UI.genDiv();

            div.append(this.buildMonkeyOptionTable(), this.buildPolyfillOptionTable(), this.buildUIOptionTable(), function () {
                var table1 = document.createElement('table');
                table1.style.width = '100%';
                table1.style.lineHeight = '2em';
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.textContent = '\u8BBE\u7F6E\u81EA\u52A8\u4FDD\u5B58\uFF0C\u5237\u65B0\u540E\u751F\u6548\u3002';
                tr1.append(td1);
                table1.append(tr1);
                var tr2 = document.createElement('tr');
                var td2 = document.createElement('td');
                td2.textContent = '\u89C6\u9891\u4E0B\u8F7D\u7EC4\u4EF6\u7684\u7F13\u5B58\u529F\u80FD\u53EA\u5728Windows+Chrome\u6D4B\u8BD5\u8FC7\uFF0C\u5982\u679C\u51FA\u73B0\u95EE\u9898\uFF0C\u8BF7\u5173\u95ED\u7F13\u5B58\u3002';
                tr2.append(td2);
                table1.append(tr2);
                var tr3 = document.createElement('tr');
                var td3 = document.createElement('td');
                td3.textContent = '\u529F\u80FD\u589E\u5F3A\u7EC4\u4EF6\u5C3D\u91CF\u4FDD\u8BC1\u4E86\u517C\u5BB9\u6027\u3002\u4F46\u5982\u679C\u6709\u540C\u529F\u80FD\u811A\u672C/\u63D2\u4EF6\uFF0C\u8BF7\u5173\u95ED\u672C\u63D2\u4EF6\u7684\u5BF9\u5E94\u529F\u80FD\u3002';
                tr3.append(td3);
                table1.append(tr3);
                var tr4 = document.createElement('tr');
                var td4 = document.createElement('td');
                td4.textContent = '\u8FD9\u4E2A\u811A\u672C\u4E43\u201C\u6309\u539F\u6837\u201D\u63D0\u4F9B\uFF0C\u4E0D\u9644\u5E26\u4EFB\u4F55\u660E\u793A\uFF0C\u6697\u793A\u6216\u6CD5\u5B9A\u7684\u4FDD\u8BC1\uFF0C\u5305\u62EC\u4F46\u4E0D\u9650\u4E8E\u5176\u6CA1\u6709\u7F3A\u9677\uFF0C\u9002\u5408\u7279\u5B9A\u76EE\u7684\u6216\u975E\u4FB5\u6743\u3002';
                tr4.append(td4);
                table1.append(tr4);
                var tr5 = document.createElement('tr');
                var td5 = document.createElement('td');
                var a2 = document.createElement('a');
                a2.href = 'https://greasyfork.org/zh-CN/scripts/372516';
                a2.target = '_blank';
                a2.textContent = '\u66F4\u65B0';
                td5.append(a2);
                td5.append(' ');
                var a3 = document.createElement('a');
                a3.href = 'https://github.com/Xmader/bilitwin/issues';
                a3.target = '_blank';
                a3.textContent = '\u8BA8\u8BBA';
                td5.append(a3);
                td5.append(' ');
                var a4 = document.createElement('a');
                a4.href = 'https://github.com/Xmader/bilitwin/';
                a4.target = '_blank';
                a4.textContent = 'GitHub';
                td5.append(a4);
                td5.append(' ');
                td5.append('Author: qli5. Copyright: qli5, 2014+, \u7530\u751F, grepmusic, xmader');
                tr5.append(td5);
                table1.append(tr5);
                return table1;
            }(), function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function () {
                    return div.style.display = 'none';
                };

                button.textContent = '\u5173\u95ED';
                return button;
            }(), function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function () {
                    return top.location.reload();
                };

                button.textContent = '\u4FDD\u5B58\u5E76\u5237\u65B0';
                return button;
            }(), function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function () {
                    return twin.resetOption() && top.location.reload();
                };

                button.textContent = '\u91CD\u7F6E\u5E76\u5237\u65B0';
                return button;
            }());

            return this.dom.optionDiv = div;
        }
    }, {
        key: 'buildMonkeyOptionTable',
        value: function buildMonkeyOptionTable() {
            var twin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin;
            var BiliMonkey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.twin.BiliMonkey;

            var table = document.createElement('table');
            {
                table.style.width = '100%';
                table.style.lineHeight = '2em';
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.style = 'text-align:center';
                td1.textContent = 'BiliMonkey\uFF08\u89C6\u9891\u6293\u53D6\u7EC4\u4EF6\uFF09';
                tr1.append(td1);
                table.append(tr1);
            }

            table.append.apply(table, _toConsumableArray(BiliMonkey.optionDescriptions.map(function (_ref110) {
                var _ref111 = _slicedToArray(_ref110, 2),
                    name = _ref111[0],
                    description = _ref111[1];

                var tr1 = document.createElement('tr');
                var label = document.createElement('label');
                var input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = twin.option[name];

                input.onchange = function (e) {
                    twin.option[name] = e.target.checked;
                    twin.saveOption(twin.option);
                };

                label.append(input);
                label.append(description);
                tr1.append(label);
                return tr1;
            })));

            table.append(function () {
                var tr1 = document.createElement('tr');
                var label = document.createElement('label');
                var input = document.createElement('input');
                input.type = 'number';
                input.value = +twin.option["resolutionX"] || 560;
                input.min = 480;

                input.onchange = function (e) {
                    twin.option["resolutionX"] = +e.target.value;
                    twin.saveOption(twin.option);
                };

                label.append(input);
                label.append(" x ");
                var input1 = document.createElement('input');
                input1.type = 'number';
                input1.value = +twin.option["resolutionY"] || 420;
                input1.min = 360;

                input1.onchange = function (e) {
                    twin.option["resolutionY"] = +e.target.value;
                    twin.saveOption(twin.option);
                };

                label.append(input1);
                tr1.append(label);
                return tr1;
            }());

            table.append(function () {
                var tr1 = document.createElement('tr');
                var label = document.createElement('label');
                var input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = twin.option["enableVideoMaxResolution"];

                input.onchange = function (e) {
                    twin.option["enableVideoMaxResolution"] = e.target.checked;
                    twin.saveOption(twin.option);
                };

                label.append(input);
                label.append('\u81EA\u5B9A\u4E49\u4E0B\u8F7D\u7684\u89C6\u9891\u7684');
                var b1 = document.createElement('b');
                b1.textContent = '\u6700\u9AD8';
                label.append(b1);
                label.append('\u5206\u8FA8\u7387\uFF1A');
                var select = document.createElement('select');

                select.onchange = function (e) {
                    twin.option["videoMaxResolution"] = e.target.value;
                    twin.saveOption(twin.option);
                };

                select.append.apply(select, _toConsumableArray(BiliMonkey.resolutionPreferenceOptions.map(function (_ref112) {
                    var _ref113 = _slicedToArray(_ref112, 2),
                        name = _ref113[0],
                        value = _ref113[1];

                    var option1 = document.createElement('option');
                    option1.value = value;
                    option1.selected = (twin.option["videoMaxResolution"] || "116") == value;
                    option1.textContent = name;
                    return option1;
                })));
                label.append(select);
                tr1.append(label);
                return tr1;
            }());

            return table;
        }
    }, {
        key: 'buildPolyfillOptionTable',
        value: function buildPolyfillOptionTable() {
            var twin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin;
            var BiliPolyfill = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.twin.BiliPolyfill;

            var table = document.createElement('table');
            {
                table.style.width = '100%';
                table.style.lineHeight = '2em';
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.style = 'text-align:center';
                td1.textContent = 'BiliPolyfill\uFF08\u529F\u80FD\u589E\u5F3A\u7EC4\u4EF6\uFF09';
                tr1.append(td1);
                table.append(tr1);
                var tr2 = document.createElement('tr');
                var td2 = document.createElement('td');
                td2.style = 'text-align:center';
                td2.textContent = '\u61D2\u9B3C\u4F5C\u8005\u8FD8\u5728\u6D4B\u8BD5\u7684\u65F6\u5019\uFF0CB\u7AD9\u5DF2\u7ECF\u4E0A\u7EBF\u4E86\u539F\u751F\u7684\u7A0D\u540E\u518D\u770B(\u0E51\u2022\u0300\u3142\u2022\u0301)\u0648\u2727';
                tr2.append(td2);
                table.append(tr2);
            }

            table.append.apply(table, _toConsumableArray(BiliPolyfill.optionDescriptions.map(function (_ref114) {
                var _ref115 = _slicedToArray(_ref114, 3),
                    name = _ref115[0],
                    description = _ref115[1],
                    disabled = _ref115[2];

                var tr1 = document.createElement('tr');
                var label = document.createElement('label');
                label.style.textDecoration = disabled == 'disabled' ? 'line-through' : undefined;
                var input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = twin.option[name];

                input.onchange = function (e) {
                    twin.option[name] = e.target.checked;
                    twin.saveOption(twin.option);
                };

                input.disabled = disabled == 'disabled';
                label.append(input);
                label.append(description);
                tr1.append(label);
                return tr1;
            })));

            return table;
        }
    }, {
        key: 'buildUIOptionTable',
        value: function buildUIOptionTable() {
            var twin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin;

            var table = document.createElement('table');
            {
                table.style.width = '100%';
                table.style.lineHeight = '2em';
                var tr1 = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.style = 'text-align:center';
                td1.textContent = 'UI\uFF08\u7528\u6237\u754C\u9762\uFF09';
                tr1.append(td1);
                table.append(tr1);
            }

            table.append.apply(table, _toConsumableArray(UI.optionDescriptions.map(function (_ref116) {
                var _ref117 = _slicedToArray(_ref116, 2),
                    name = _ref117[0],
                    description = _ref117[1];

                var tr1 = document.createElement('tr');
                var label = document.createElement('label');
                var input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = twin.option[name];
                input.disabled = name == "menu" /** 在视频菜单栏不添加后无法更改设置，所以禁用此选项 */;

                input.onchange = function (e) {
                    twin.option[name] = e.target.checked;
                    twin.saveOption(twin.option);
                };

                label.append(input);
                label.append(description);
                tr1.append(label);
                return tr1;
            })));

            return table;
        }
    }, {
        key: 'displayOptionDiv',
        value: function displayOptionDiv() {
            var optionDiv = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.dom.optionDiv;

            if (!optionDiv) {
                optionDiv = this.buildOptionDiv();
                document.body.append(optionDiv);
            }
            optionDiv.style.display = '';
            return optionDiv;
        }
    }, {
        key: 'buildPolyfillDataDiv',
        value: function buildPolyfillDataDiv() {
            var polyfill = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin.polyfill;

            var textarea = document.createElement('textarea');

            textarea.style.resize = 'vertical';
            textarea.style.width = '100%';
            textarea.style.height = '200px';
            textarea.textContent = '\n            ' + JSON.stringify(polyfill.userdata.oped).replace(/{/, '{\n').replace(/}/, '\n}').replace(/],/g, '],\n') + '\n        ';
            var div = UI.genDiv();

            div.append(function () {
                var p1 = document.createElement('p');
                p1.style.margin = '0.3em';
                p1.textContent = '\u8FD9\u91CC\u662F\u811A\u672C\u50A8\u5B58\u7684\u6570\u636E\u3002\u6240\u6709\u6570\u636E\u90FD\u53EA\u5B58\u5728\u6D4F\u89C8\u5668\u91CC\uFF0C\u522B\u4EBA\u4E0D\u77E5\u9053\uFF0CB\u7AD9\u4E5F\u4E0D\u77E5\u9053\uFF0C\u811A\u672C\u4F5C\u8005\u66F4\u4E0D\u77E5\u9053(\u8FD9\u4E2A\u5BB6\u4F19\u8FDE\u670D\u52A1\u5668\u90FD\u79DF\u4E0D\u8D77 \u6454';
                return p1;
            }(), function () {
                var p1 = document.createElement('p');
                p1.style.margin = '0.3em';
                p1.textContent = 'B\u7AD9\u5DF2\u4E0A\u7EBF\u539F\u751F\u7684\u7A0D\u540E\u89C2\u770B\u529F\u80FD\u3002';
                return p1;
            }(), function () {
                var p1 = document.createElement('p');
                p1.style.margin = '0.3em';
                p1.textContent = '\u8FD9\u91CC\u662F\u7247\u5934\u7247\u5C3E\u3002\u683C\u5F0F\u662F\uFF0Cav\u53F7\u6216\u756A\u5267\u53F7:[\u7247\u5934\u5F00\u59CB(\u9ED8\u8BA4=0),\u7247\u5934\u7ED3\u675F(\u9ED8\u8BA4=\u4E0D\u8DF3),\u7247\u5C3E\u5F00\u59CB(\u9ED8\u8BA4=\u4E0D\u8DF3),\u7247\u5C3E\u7ED3\u675F(\u9ED8\u8BA4=\u65E0\u7A77\u5927)]\u3002\u53EF\u4EE5\u4EFB\u610F\u586B\u5199null\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u91C7\u7528\u9ED8\u8BA4\u503C\u3002';
                return p1;
            }(), textarea, function () {
                var p1 = document.createElement('p');
                p1.style.margin = '0.3em';
                p1.textContent = '\u5F53\u7136\u53EF\u4EE5\u76F4\u63A5\u6E05\u7A7A\u5566\u3002\u53EA\u5220\u9664\u5176\u4E2D\u7684\u4E00\u4E9B\u884C\u7684\u8BDD\uFF0C\u4E00\u5B9A\u8981\u8BB0\u5F97\u5220\u6389\u591A\u4F59\u7684\u9017\u53F7\u3002';
                return p1;
            }(), function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function () {
                    return div.remove();
                };

                button.textContent = '\u5173\u95ED';
                return button;
            }(), function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function (e) {
                    if (!textarea.value) textarea.value = '{\n\n}';
                    textarea.value = textarea.value.replace(/,(\s|\n)*}/, '\n}').replace(/,(\s|\n),/g, ',\n').replace(/,(\s|\n)*]/g, ']');
                    var userdata = {};
                    try {
                        userdata.oped = JSON.parse(textarea.value);
                    } catch (e) {
                        alert('片头片尾: ' + e);throw e;
                    }
                    e.target.textContent = '格式没有问题！';
                    return userdata;
                };

                button.textContent = '\u9A8C\u8BC1\u683C\u5F0F';
                return button;
            }(), function () {
                var button = document.createElement('button');
                button.style.padding = '0.5em';
                button.style.margin = '0.2em';

                button.onclick = function (e) {
                    polyfill.userdata = e.target.previousElementSibling.onclick({ target: e.target.previousElementSibling });
                    polyfill.saveUserdata();
                    e.target.textContent = '保存成功';
                };

                button.textContent = '\u5C1D\u8BD5\u4FDD\u5B58';
                return button;
            }());

            return div;
        }
    }, {
        key: 'displayPolyfillDataDiv',
        value: function displayPolyfillDataDiv(polyfill) {
            var div = this.buildPolyfillDataDiv();
            document.body.append(div);
            div.style.display = 'block';

            return div;
        }

        // Common

    }], [{
        key: 'buildDownloadAllPageDefaultFormatsBody',
        value: function buildDownloadAllPageDefaultFormatsBody(ret, videoTitle) {
            var _this55 = this;

            var table = document.createElement('table');

            table.onclick = function (e) {
                return e.stopPropagation();
            };

            var flvsBlob = [];
            var loadFLVFromCache = function () {
                var _ref118 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee85(name) {
                    var partial = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                    var cache, item;
                    return regeneratorRuntime.wrap(function _callee85$(_context87) {
                        while (1) {
                            switch (_context87.prev = _context87.next) {
                                case 0:
                                    if (partial) name = 'PC_' + name;
                                    cache = new CacheDB();
                                    _context87.next = 4;
                                    return cache.getData(name);

                                case 4:
                                    item = _context87.sent;
                                    return _context87.abrupt('return', item && item.data);

                                case 6:
                                case 'end':
                                    return _context87.stop();
                            }
                        }
                    }, _callee85, _this55);
                }));

                return function loadFLVFromCache(_x118) {
                    return _ref118.apply(this, arguments);
                };
            }();
            var saveFLVToCache = function () {
                var _ref119 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee86(name, blob) {
                    var cache;
                    return regeneratorRuntime.wrap(function _callee86$(_context88) {
                        while (1) {
                            switch (_context88.prev = _context88.next) {
                                case 0:
                                    cache = new CacheDB();
                                    return _context88.abrupt('return', cache.addData({ name: name, data: blob }));

                                case 2:
                                case 'end':
                                    return _context88.stop();
                            }
                        }
                    }, _callee86, _this55);
                }));

                return function saveFLVToCache(_x119, _x120) {
                    return _ref119.apply(this, arguments);
                };
            }();
            var cleanPartialFLVInCache = function () {
                var _ref120 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee87(name) {
                    var cache;
                    return regeneratorRuntime.wrap(function _callee87$(_context89) {
                        while (1) {
                            switch (_context89.prev = _context89.next) {
                                case 0:
                                    cache = new CacheDB();

                                    name = 'PC_' + name;
                                    return _context89.abrupt('return', cache.deleteData(name));

                                case 3:
                                case 'end':
                                    return _context89.stop();
                            }
                        }
                    }, _callee87, _this55);
                }));

                return function cleanPartialFLVInCache(_x121) {
                    return _ref120.apply(this, arguments);
                };
            }();
            var getFLVs = function () {
                var _ref121 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee89(videoIndex) {
                    var durl;
                    return regeneratorRuntime.wrap(function _callee89$(_context91) {
                        while (1) {
                            switch (_context91.prev = _context91.next) {
                                case 0:
                                    if (!flvsBlob[videoIndex]) flvsBlob[videoIndex] = [];

                                    durl = ret[videoIndex].durl;
                                    _context91.next = 4;
                                    return Promise.all(durl.map(function () {
                                        var _ref122 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee88(_, durlIndex) {
                                            var burl, outputName, burlA, progress, flvCache, partialFLVFromCache, opt, fch, fullFLV;
                                            return regeneratorRuntime.wrap(function _callee88$(_context90) {
                                                while (1) {
                                                    switch (_context90.prev = _context90.next) {
                                                        case 0:
                                                            if (!flvsBlob[videoIndex][durlIndex]) {
                                                                _context90.next = 4;
                                                                break;
                                                            }

                                                            return _context90.abrupt('return', flvsBlob[videoIndex][durlIndex]);

                                                        case 4:
                                                            burl = durl[durlIndex];
                                                            outputName = burl.match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];
                                                            burlA = top.document.querySelector('a[download][href="' + burl + '"]');

                                                            burlA.after(function () {
                                                                var progress1 = document.createElement('progress');
                                                                progress1.setAttribute('value', '0');
                                                                progress1.setAttribute('max', '100');
                                                                progress1.textContent = '\u8FDB\u5EA6\u6761';
                                                                return progress1;
                                                            }());
                                                            progress = burlA.parentElement.querySelector("progress");
                                                            _context90.next = 11;
                                                            return loadFLVFromCache(outputName);

                                                        case 11:
                                                            flvCache = _context90.sent;

                                                            if (!flvCache) {
                                                                _context90.next = 16;
                                                                break;
                                                            }

                                                            progress.value = progress.max;
                                                            progress.after(function () {
                                                                var a2 = document.createElement('a');
                                                                a2.href = top.URL.createObjectURL(flvCache);
                                                                a2.download = outputName;
                                                                a2.textContent = '\u53E6\u5B58\u4E3A';
                                                                return a2;
                                                            }());
                                                            return _context90.abrupt('return', flvsBlob[videoIndex][durlIndex] = flvCache);

                                                        case 16:
                                                            _context90.next = 18;
                                                            return loadFLVFromCache(outputName, true);

                                                        case 18:
                                                            partialFLVFromCache = _context90.sent;

                                                            if (partialFLVFromCache) burl += '&bstart=' + partialFLVFromCache.size;

                                                            opt = {
                                                                method: 'GET',
                                                                mode: 'cors',
                                                                cache: 'default',
                                                                referrerPolicy: 'no-referrer-when-downgrade',
                                                                cacheLoaded: partialFLVFromCache ? partialFLVFromCache.size : 0,
                                                                headers: partialFLVFromCache && !burl.includes('wsTime') ? { Range: 'bytes=' + partialFLVFromCache.size + '-' } : undefined
                                                            };


                                                            opt.onprogress = function (loaded, total) {
                                                                progress.value = loaded;
                                                                progress.max = total;
                                                            };

                                                            fch = new DetailedFetchBlob(burl, opt);
                                                            _context90.next = 25;
                                                            return fch.getBlob();

                                                        case 25:
                                                            fullFLV = _context90.sent;

                                                            if (partialFLVFromCache) {
                                                                fullFLV = new Blob([partialFLVFromCache, fullFLV]);
                                                                cleanPartialFLVInCache(outputName);
                                                            }
                                                            saveFLVToCache(outputName, fullFLV);

                                                            progress.after(function () {
                                                                var a2 = document.createElement('a');
                                                                a2.href = top.URL.createObjectURL(fullFLV);
                                                                a2.download = outputName;
                                                                a2.textContent = '\u53E6\u5B58\u4E3A';
                                                                return a2;
                                                            }());

                                                            return _context90.abrupt('return', flvsBlob[videoIndex][durlIndex] = fullFLV);

                                                        case 30:
                                                        case 'end':
                                                            return _context90.stop();
                                                    }
                                                }
                                            }, _callee88, _this55);
                                        }));

                                        return function (_x123, _x124) {
                                            return _ref122.apply(this, arguments);
                                        };
                                    }()));

                                case 4:
                                    return _context91.abrupt('return', _context91.sent);

                                case 5:
                                case 'end':
                                    return _context91.stop();
                            }
                        }
                    }, _callee89, _this55);
                }));

                return function getFLVs(_x122) {
                    return _ref121.apply(this, arguments);
                };
            }();
            var getSize = function () {
                var _ref123 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee91(videoIndex) {
                    var durlObjects, totalSize, durl, sizes;
                    return regeneratorRuntime.wrap(function _callee91$(_context93) {
                        while (1) {
                            switch (_context93.prev = _context93.next) {
                                case 0:
                                    durlObjects = ret[videoIndex].res.durl;

                                    if (!(durlObjects && durlObjects[0] && durlObjects[0].size)) {
                                        _context93.next = 5;
                                        break;
                                    }

                                    totalSize = durlObjects.reduce(function (total, burlObj) {
                                        return total + parseInt(burlObj.size);
                                    }, 0);

                                    if (!totalSize) {
                                        _context93.next = 5;
                                        break;
                                    }

                                    return _context93.abrupt('return', totalSize);

                                case 5:
                                    durl = ret[videoIndex].durl;

                                    /** @type {number[]} */

                                    _context93.next = 8;
                                    return Promise.all(durl.map(function () {
                                        var _ref124 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee90(burl) {
                                            var r;
                                            return regeneratorRuntime.wrap(function _callee90$(_context92) {
                                                while (1) {
                                                    switch (_context92.prev = _context92.next) {
                                                        case 0:
                                                            _context92.next = 2;
                                                            return fetch(burl, { method: "HEAD" });

                                                        case 2:
                                                            r = _context92.sent;
                                                            return _context92.abrupt('return', +r.headers.get("content-length"));

                                                        case 4:
                                                        case 'end':
                                                            return _context92.stop();
                                                    }
                                                }
                                            }, _callee90, _this55);
                                        }));

                                        return function (_x126) {
                                            return _ref124.apply(this, arguments);
                                        };
                                    }()));

                                case 8:
                                    sizes = _context93.sent;
                                    return _context93.abrupt('return', sizes.reduce(function (total, _size) {
                                        return total + _size;
                                    }));

                                case 10:
                                case 'end':
                                    return _context93.stop();
                            }
                        }
                    }, _callee91, _this55);
                }));

                return function getSize(_x125) {
                    return _ref123.apply(this, arguments);
                };
            }();

            ret.forEach(function (i, index) {
                var sizeSpan = document.createElement('span');
                getSize(index).then(function (size) {
                    var sizeMB = size / 1024 / 1024;
                    sizeSpan.textContent = '  (' + sizeMB.toFixed(1) + ' MiB)';
                });

                var iName = i.name;
                var pName = 'P' + (index + 1);
                if (typeof iName == "string" && iName.toUpperCase() !== pName) {
                    pName += ' - ' + iName;
                }

                var outputName = videoTitle.match(/：第\d+话 .+?$/) ? videoTitle.replace(/：第\d+话 .+?$/, '\uFF1A\u7B2C' + iName + '\u8BDD') : videoTitle + ' - ' + pName;

                table.append.apply(table, [function () {
                    var tr1 = document.createElement('tr');
                    var td1 = document.createElement('td');
                    td1.append(iName);
                    var br = document.createElement('br');
                    td1.append(br);
                    var a2 = document.createElement('a');

                    a2.onclick = function () {
                        var _ref125 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee92(e) {
                            var handler, targetA, format, flvs, worker, href, ass;
                            return regeneratorRuntime.wrap(function _callee92$(_context94) {
                                while (1) {
                                    switch (_context94.prev = _context94.next) {
                                        case 0:
                                            // add beforeUnloadHandler
                                            handler = function handler(e) {
                                                return UI.beforeUnloadHandler(e);
                                            };

                                            window.addEventListener('beforeunload', handler);

                                            targetA = e.target.parentElement;

                                            targetA.title = "";
                                            targetA.onclick = null;
                                            targetA.textContent = "缓存中……";

                                            format = i.durl[0].match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[1];
                                            _context94.next = 9;
                                            return getFLVs(index);

                                        case 9:
                                            flvs = _context94.sent;


                                            targetA.textContent = "合并中……";
                                            worker = WebWorker.fromAFunction(BatchDownloadWorkerFn);
                                            _context94.next = 14;
                                            return worker.registerAllMethods();

                                        case 14:
                                            _context94.t0 = URL;

                                            if (!(format == "flv")) {
                                                _context94.next = 21;
                                                break;
                                            }

                                            _context94.next = 18;
                                            return worker.mergeFLVFiles(flvs);

                                        case 18:
                                            _context94.t1 = _context94.sent;
                                            _context94.next = 22;
                                            break;

                                        case 21:
                                            _context94.t1 = flvs[0];

                                        case 22:
                                            _context94.t2 = _context94.t1;
                                            href = _context94.t0.createObjectURL.call(_context94.t0, _context94.t2);

                                            worker.terminate();

                                            targetA.href = href;
                                            targetA.download = outputName + '.flv';
                                            targetA.textContent = "保存合并后FLV";
                                            targetA.style["margin-right"] = "20px";

                                            ass = top.URL.createObjectURL(i.danmuku);

                                            targetA.after(function () {
                                                var a3 = document.createElement('a');

                                                a3.onclick = function (e) {
                                                    new MKVTransmuxer().exec(href, ass, outputName + '.mkv', e.target);
                                                };

                                                a3.textContent = '\u6253\u5305MKV(\u8F6F\u5B57\u5E55\u5C01\u88C5)';
                                                return a3;
                                            }());

                                            window.removeEventListener('beforeunload', handler);

                                            targetA.click();

                                        case 33:
                                        case 'end':
                                            return _context94.stop();
                                    }
                                }
                            }, _callee92, _this55);
                        }));

                        return function (_x127) {
                            return _ref125.apply(this, arguments);
                        };
                    }();

                    a2.title = '\u7F13\u5B58\u6240\u6709\u5206\u6BB5+\u81EA\u52A8\u5408\u5E76';
                    var span2 = document.createElement('span');
                    span2.textContent = '\u7F13\u5B58\u6240\u6709\u5206\u6BB5+\u81EA\u52A8\u5408\u5E76';
                    a2.append(span2);
                    a2.append(sizeSpan);
                    td1.append(a2);
                    tr1.append(td1);
                    var td2 = document.createElement('td');
                    var a3 = document.createElement('a');
                    a3.href = i.durl[0];
                    a3.download = '';
                    a3.setAttribute('referrerpolicy', 'origin');
                    a3.textContent = i.durl[0].match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];
                    td2.append(a3);
                    tr1.append(td2);
                    var td3 = document.createElement('td');
                    var a4 = document.createElement('a');
                    a4.href = top.URL.createObjectURL(i.danmuku);
                    a4.download = i.outputName + '.ass';
                    a4.setAttribute('referrerpolicy', 'origin');
                    a4.textContent = i.outputName + '.ass';
                    td3.append(a4);
                    tr1.append(td3);
                    return tr1;
                }()].concat(_toConsumableArray(i.durl.slice(1).map(function (href) {
                    var tr1 = document.createElement('tr');
                    var td1 = document.createElement('td');
                    td1.textContent = '\n                    ';
                    tr1.append(td1);
                    var td2 = document.createElement('td');
                    var a2 = document.createElement('a');
                    a2.href = href;
                    a2.download = '';
                    a2.setAttribute('referrerpolicy', 'origin');
                    a2.textContent = href.match(/\d+-\d+(?:\d|-|hd)*\.(flv|mp4)/)[0];
                    td2.append(a2);
                    tr1.append(td2);
                    var td3 = document.createElement('td');
                    td3.textContent = '\n                    ';
                    tr1.append(td3);
                    return tr1;
                })), [function () {
                    var tr1 = document.createElement('tr');
                    var td1 = document.createElement('td');
                    td1.textContent = '\xA0';
                    tr1.append(td1);
                    return tr1;
                }()]));
            });

            var fragment = document.createDocumentFragment();
            var style1 = document.createElement('style');
            style1.textContent = '\n                table {\n                    width: 100%;\n                    table-layout: fixed;\n                }\n            \n                td {\n                    overflow: hidden;\n                    white-space: nowrap;\n                    text-overflow: ellipsis;\n                    text-align: center;\n                    vertical-align: bottom;\n                }\n\n                progress {\n                    margin-left: 15px;\n                }\n\n                a {\n                    cursor: pointer;\n                    color: #00a1d6;\n                }\n        \n                a:hover {\n                    color: #f25d8e;\n                }\n            ';
            fragment.append(style1);
            var h1 = document.createElement('h1');
            h1.textContent = '\u6279\u91CF\u4E0B\u8F7D';
            fragment.append(h1);
            var ul2 = document.createElement('ul');
            var li1 = document.createElement('li');
            var p1 = document.createElement('p');
            p1.textContent = '\u6293\u53D6\u7684\u89C6\u9891\u7684\u6700\u9AD8\u5206\u8FA8\u7387\u53EF\u5728\u8BBE\u7F6E\u4E2D\u81EA\u5B9A\u4E49\uFF0C\u756A\u5267\u53EA\u80FD\u6293\u53D6\u5230\u5F53\u524D\u6E05\u6670\u5EA6';
            li1.append(p1);
            ul2.append(li1);
            var li2 = document.createElement('li');
            var p2 = document.createElement('p');
            p2.textContent = '\u590D\u5236\u94FE\u63A5\u5730\u5740\u65E0\u6548\uFF0C\u8BF7\u5DE6\u952E\u5355\u51FB/\u53F3\u952E\u53E6\u5B58\u4E3A/\u53F3\u952E\u8C03\u7528\u4E0B\u8F7D\u5DE5\u5177';
            li2.append(p2);
            var p3 = document.createElement('p');
            var em = document.createElement('em');
            em.textContent = '\u5F00\u53D1\u8005\uFF1A\u9700\u8981\u6821\u9A8Creferrer\u548Cuser agent';
            p3.append(em);
            li2.append(p3);
            ul2.append(li2);
            var li3 = document.createElement('li');
            var p4 = document.createElement('p');
            p4.append('(\u6D4B)');
            var a2 = document.createElement('a');

            a2.onclick = function (e) {
                return document.querySelectorAll('a[title="缓存所有分段+自动合并"] span:first-child').forEach(function (a) {
                    return a.click();
                });
            };

            a2.textContent = '\n                            \u4E00\u952E\u5F00\u59CB\u7F13\u5B58+\u6279\u91CF\u5408\u5E76\n                        ';
            p4.append(a2);
            li3.append(p4);
            ul2.append(li3);
            fragment.append(ul2);
            fragment.append(table);
            return fragment;
        }
    }, {
        key: 'displayDownloadAllPageDefaultFormatsBody',
        value: function displayDownloadAllPageDefaultFormatsBody(ret) {
            var videoTitle = top.document.getElementsByTagName('h1')[0].textContent.trim();

            if (top.player) top.player.destroy(); // 销毁播放器

            top.document.head.remove();
            top.document.body.replaceWith(document.createElement("body"));

            top.document.body.append(UI.buildDownloadAllPageDefaultFormatsBody(ret, videoTitle));

            return ret;
        }
    }, {
        key: 'genDiv',
        value: function genDiv() {
            var div1 = document.createElement('div');
            div1.style.position = 'fixed';
            div1.style.zIndex = '10036';
            div1.style.top = '50%';
            div1.style.marginTop = '-200px';
            div1.style.left = '50%';
            div1.style.marginLeft = '-320px';
            div1.style.width = '540px';
            div1.style.maxHeight = '400px';
            div1.style.overflowY = 'auto';
            div1.style.padding = '30px 50px';
            div1.style.backgroundColor = 'white';
            div1.style.borderRadius = '6px';
            div1.style.boxShadow = 'rgba(0, 0, 0, 0.6) 1px 1px 40px 0px';
            div1.style.display = 'none';
            div1.addEventListener('click', function (e) {
                return e.stopPropagation();
            });
            div1.className = 'bilitwin';

            return div1;
        }
    }, {
        key: 'requestH5Player',
        value: function requestH5Player() {
            var h = document.querySelector('div.tminfo');
            h.prepend('[[脚本需要HTML5播放器(弹幕列表右上角三个点的按钮切换)]] ');
        }
    }, {
        key: 'allowDrag',
        value: function allowDrag(e) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, {
        key: 'beforeUnloadHandler',
        value: function beforeUnloadHandler(e) {
            return e.returnValue = '脚本还没做完工作，真的要退出吗？';
        }
    }, {
        key: 'hintInfo',
        value: function hintInfo(text, playerWin) {
            var div = document.createElement('div');
            {
                div.className = 'bilibili-player-video-toast-bottom';
                var div1 = document.createElement('div');
                div1.className = 'bilibili-player-video-toast-item';
                var div2 = document.createElement('div');
                div2.className = 'bilibili-player-video-toast-item-text';
                var span2 = document.createElement('span');
                span2.textContent = text;
                div2.append(span2);
                div1.append(div2);
                div.append(div1);
            }
            playerWin.document.getElementsByClassName('bilibili-player-video-toast-wrp')[0].append(div);
            setTimeout(function () {
                return div.remove();
            }, 3000);
        }
    }, {
        key: 'optionDescriptions',
        get: function get() {
            return [
            // 1. automation
            ['autoDanmaku', '下载视频也触发下载弹幕'],

            // 2. user interface
            ['title', '在视频标题旁添加链接'], ['menu', '在视频菜单栏添加链接'], ['autoDisplayDownloadBtn', '(测)无需右键播放器就能显示下载按钮'],

            // 3. download
            ['aria2', '导出aria2'], ['aria2RPC', '(请自行解决阻止混合活动内容的问题)发送到aria2 RPC'], ['m3u8', '(限VLC兼容播放器)导出m3u8'], ['clipboard', '(测)(请自行解决referrer)强制导出剪贴板']];
        }
    }, {
        key: 'optionDefaults',
        get: function get() {
            return {
                // 1. automation
                autoDanmaku: false,

                // 2. user interface
                title: true,
                menu: true,
                autoDisplayDownloadBtn: true,

                // 3. download
                aria2: false,
                aria2RPC: false,
                m3u8: false,
                clipboard: false
            };
        }
    }]);

    return UI;
}();

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var debugOption = { debug: 1 };

var BiliTwin = function (_BiliUserJS) {
    _inherits(BiliTwin, _BiliUserJS);

    _createClass(BiliTwin, null, [{
        key: 'debugOption',
        get: function get() {
            return debugOption;
        },
        set: function set(option) {
            debugOption = option;
        }
    }]);

    function BiliTwin() {
        var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var ui = arguments[1];

        _classCallCheck(this, BiliTwin);

        var _this56 = _possibleConstructorReturn(this, (BiliTwin.__proto__ || Object.getPrototypeOf(BiliTwin)).call(this));

        _this56.BiliMonkey = BiliMonkey;
        _this56.BiliPolyfill = BiliPolyfill;
        _this56.playerWin = null;
        _this56.monkey = null;
        _this56.polifill = null;
        _this56.ui = ui || new UI(_this56);
        _this56.option = option;
        return _this56;
    }

    _createClass(BiliTwin, [{
        key: 'runCidSession',
        value: function () {
            var _ref126 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee93() {
                var _this57 = this;

                var href, cidRefresh, videoRightClick, video, videoA, _ref127;

                return regeneratorRuntime.wrap(function _callee93$(_context95) {
                    while (1) {
                        switch (_context95.prev = _context95.next) {
                            case 0:
                                _context95.prev = 0;
                                _context95.t0 = BiliUserJS.tryGetPlayerWinSync();

                                if (_context95.t0) {
                                    _context95.next = 6;
                                    break;
                                }

                                _context95.next = 5;
                                return BiliTwin.getPlayerWin();

                            case 5:
                                _context95.t0 = _context95.sent;

                            case 6:
                                this.playerWin = _context95.t0;
                                _context95.next = 13;
                                break;

                            case 9:
                                _context95.prev = 9;
                                _context95.t1 = _context95['catch'](0);

                                if (_context95.t1 == 'Need H5 Player') UI.requestH5Player();
                                throw _context95.t1;

                            case 13:
                                href = location.href;

                                this.option = this.getOption();
                                if (this.option.debug) {
                                    if (top.console) top.console.clear();
                                }

                                // 2. monkey and polyfill
                                this.monkey = new BiliMonkey(this.playerWin, this.option);
                                this.polyfill = new BiliPolyfill(this.playerWin, this.option, function (t) {
                                    return UI.hintInfo(t, _this57.playerWin);
                                });

                                cidRefresh = BiliTwin.getCidRefreshPromise(this.playerWin);

                                /**
                                 * @param {HTMLVideoElement} video 
                                 */

                                videoRightClick = function videoRightClick(video) {
                                    var event = new MouseEvent('contextmenu', {
                                        'bubbles': true
                                    });

                                    video.dispatchEvent(event);
                                    video.dispatchEvent(event);
                                };

                                if (!this.option.autoDisplayDownloadBtn) {
                                    _context95.next = 25;
                                    break;
                                }

                                _context95.next = 23;
                                return new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        var el = _this57.playerWin.document.querySelector('.bilibili-player-dm-tip-wrap');
                                        if (el) {
                                            var video = _this57.playerWin.document.querySelector("video");
                                            videoRightClick(video);

                                            observer.disconnect();
                                            resolve();
                                        }
                                    });
                                    observer.observe(document, { childList: true, subtree: true });
                                });

                            case 23:
                                _context95.next = 27;
                                break;

                            case 25:
                                video = document.querySelector("video");

                                if (video) {
                                    video.addEventListener('play', function () {
                                        return videoRightClick(video);
                                    }, { once: true });
                                }

                            case 27:
                                _context95.next = 29;
                                return this.polyfill.setFunctions();

                            case 29:

                                // 3. async consistent => render UI
                                if (href == location.href) {
                                    this.ui.option = this.option;
                                    this.ui.cidSessionRender();

                                    videoA = this.ui.cidSessionDom.context_menu_videoA || this.ui.cidSessionDom.videoA;

                                    if (videoA && videoA.onmouseover) videoA.onmouseover({ target: videoA.lastChild });
                                } else {
                                    cidRefresh.resolve();
                                }

                                // 4. debug
                                if (this.option.debug) {
                                    _ref127 = [this.monkey, this.polyfill];
                                    (top.unsafeWindow || top).monkey = _ref127[0];
                                    (top.unsafeWindow || top).polyfill = _ref127[1];
                                }

                                // 5. refresh => session expire
                                _context95.next = 33;
                                return cidRefresh;

                            case 33:
                                this.monkey.destroy();
                                this.polyfill.destroy();
                                this.ui.cidSessionDestroy();

                            case 36:
                            case 'end':
                                return _context95.stop();
                        }
                    }
                }, _callee93, this, [[0, 9]]);
            }));

            function runCidSession() {
                return _ref126.apply(this, arguments);
            }

            return runCidSession;
        }()
    }, {
        key: 'mergeFLVFiles',
        value: function () {
            var _ref128 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee94(files) {
                return regeneratorRuntime.wrap(function _callee94$(_context96) {
                    while (1) {
                        switch (_context96.prev = _context96.next) {
                            case 0:
                                _context96.t0 = URL;
                                _context96.next = 3;
                                return FLV.mergeBlobs(files);

                            case 3:
                                _context96.t1 = _context96.sent;
                                return _context96.abrupt('return', _context96.t0.createObjectURL.call(_context96.t0, _context96.t1));

                            case 5:
                            case 'end':
                                return _context96.stop();
                        }
                    }
                }, _callee94, this);
            }));

            function mergeFLVFiles(_x129) {
                return _ref128.apply(this, arguments);
            }

            return mergeFLVFiles;
        }()
    }, {
        key: 'clearCacheDB',
        value: function () {
            var _ref129 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee95(cache) {
                return regeneratorRuntime.wrap(function _callee95$(_context97) {
                    while (1) {
                        switch (_context97.prev = _context97.next) {
                            case 0:
                                if (!cache) {
                                    _context97.next = 2;
                                    break;
                                }

                                return _context97.abrupt('return', cache.deleteEntireDB());

                            case 2:
                            case 'end':
                                return _context97.stop();
                        }
                    }
                }, _callee95, this);
            }));

            function clearCacheDB(_x130) {
                return _ref129.apply(this, arguments);
            }

            return clearCacheDB;
        }()
    }, {
        key: 'resetOption',
        value: function resetOption() {
            var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.option;

            option.setStorage('BiliTwin', JSON.stringify({}));
            return this.option = {};
        }
    }, {
        key: 'getOption',
        value: function getOption() {
            var playerWin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.playerWin;

            var rawOption = null;
            try {
                rawOption = JSON.parse(playerWin.localStorage.getItem('BiliTwin'));
            } catch (e) {} finally {
                if (!rawOption) rawOption = {};
                rawOption.setStorage = function (n, i) {
                    return playerWin.localStorage.setItem(n, i);
                };
                rawOption.getStorage = function (n) {
                    return playerWin.localStorage.getItem(n);
                };
                return Object.assign({}, BiliMonkey.optionDefaults, BiliPolyfill.optionDefaults, UI.optionDefaults, rawOption, BiliTwin.debugOption);
            }
        }
    }, {
        key: 'saveOption',
        value: function saveOption() {
            var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.option;

            return option.setStorage('BiliTwin', JSON.stringify(option));
        }
    }, {
        key: 'addUserScriptMenu',
        value: function () {
            var _ref130 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee96() {
                var _this58 = this;

                return regeneratorRuntime.wrap(function _callee96$(_context98) {
                    while (1) {
                        switch (_context98.prev = _context98.next) {
                            case 0:
                                if (!((typeof GM === 'undefined' ? 'undefined' : _typeof(GM)) !== 'object')) {
                                    _context98.next = 2;
                                    break;
                                }

                                return _context98.abrupt('return');

                            case 2:
                                if (!(typeof GM.registerMenuCommand !== 'function')) {
                                    _context98.next = 4;
                                    break;
                                }

                                return _context98.abrupt('return');

                            case 4:
                                _context98.next = 6;
                                return GM.registerMenuCommand('恢复默认设置并刷新', function () {
                                    // 开启增强组件以后如不显示脚本，可以通过 Tampermonkey/Greasemonkey 的菜单重置设置
                                    _this58.resetOption() && top.location.reload();
                                });

                            case 6:
                            case 'end':
                                return _context98.stop();
                        }
                    }
                }, _callee96, this);
            }));

            function addUserScriptMenu() {
                return _ref130.apply(this, arguments);
            }

            return addUserScriptMenu;
        }()
    }], [{
        key: 'init',
        value: function () {
            var _ref131 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee97() {
                var twin, vc_info;
                return regeneratorRuntime.wrap(function _callee97$(_context99) {
                    while (1) {
                        switch (_context99.prev = _context99.next) {
                            case 0:
                                if (document.body) {
                                    _context99.next = 2;
                                    break;
                                }

                                return _context99.abrupt('return');

                            case 2:
                                if (!(location.hostname == "www.biligame.com")) {
                                    _context99.next = 6;
                                    break;
                                }

                                return _context99.abrupt('return', BiliPolyfill.biligameInit());

                            case 6:
                                if (!location.pathname.startsWith("/bangumi/media/md")) {
                                    _context99.next = 8;
                                    break;
                                }

                                return _context99.abrupt('return', BiliPolyfill.showBangumiCoverImage());

                            case 8:

                                BiliTwin.outdatedEngineClearance();
                                BiliTwin.firefoxClearance();

                                twin = new BiliTwin();

                                twin.addUserScriptMenu();

                                if (!(location.hostname == "vc.bilibili.com")) {
                                    _context99.next = 17;
                                    break;
                                }

                                _context99.next = 15;
                                return BiliMonkey.getBiliShortVideoInfo();

                            case 15:
                                vc_info = _context99.sent;
                                return _context99.abrupt('return', twin.ui.appendShortVideoTitle(vc_info));

                            case 17:
                                if (!1) {
                                    _context99.next = 22;
                                    break;
                                }

                                _context99.next = 20;
                                return twin.runCidSession();

                            case 20:
                                _context99.next = 17;
                                break;

                            case 22:
                            case 'end':
                                return _context99.stop();
                        }
                    }
                }, _callee97, this);
            }));

            function init() {
                return _ref131.apply(this, arguments);
            }

            return init;
        }()
    }, {
        key: 'outdatedEngineClearance',
        value: function outdatedEngineClearance() {
            if (typeof Promise != 'function' || typeof MutationObserver != 'function') {
                alert('这个浏览器实在太老了，脚本决定罢工。');
                throw 'BiliTwin: browser outdated: Promise or MutationObserver unsupported';
            }
        }
    }, {
        key: 'firefoxClearance',
        value: function firefoxClearance() {
            if (navigator.userAgent.includes('Firefox')) {
                BiliTwin.debugOption.proxy = false;
                if (!window.navigator.temporaryStorage && !window.navigator.mozTemporaryStorage) window.navigator.temporaryStorage = { queryUsageAndQuota: function queryUsageAndQuota(func) {
                        return func(-1048576, 10484711424);
                    } };
            }
        }
    }, {
        key: 'xpcWrapperClearance',
        value: function xpcWrapperClearance() {
            if (top.unsafeWindow) {
                Object.defineProperty(window, 'cid', {
                    configurable: true,
                    get: function get() {
                        return String(unsafeWindow.cid);
                    }
                });
                Object.defineProperty(window, 'player', {
                    configurable: true,
                    get: function get() {
                        return { destroy: unsafeWindow.player.destroy, reloadAccess: unsafeWindow.player.reloadAccess };
                    }
                });
                Object.defineProperty(window, 'jQuery', {
                    configurable: true,
                    get: function get() {
                        return unsafeWindow.jQuery;
                    }
                });
                Object.defineProperty(window, 'fetch', {
                    configurable: true,
                    get: function get() {
                        return unsafeWindow.fetch.bind(unsafeWindow);
                    },
                    set: function set(_fetch) {
                        return unsafeWindow.fetch = _fetch.bind(unsafeWindow);
                    }
                });
            }
        }
    }]);

    return BiliTwin;
}(BiliUserJS);

BiliTwin.domContentLoadedThen(BiliTwin.init);
}


