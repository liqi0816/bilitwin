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
// @version     1.15
// @author      qli5
// @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto, xmader
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
// @homepageURL https://github.com/liqi0816/bilitwin/
// @description bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,MKV打包,播放体验增强,原生appsecret,不借助其他网站
// @match       *://www.bilibili.com/video/av*
// @match       *://bangumi.bilibili.com/anime/*/play*
// @match       *://www.bilibili.com/bangumi/play/ep*
// @match       *://www.bilibili.com/bangumi/play/ss*
// @match       *://www.bilibili.com/watchlater/
// @version     1.15
// @author      qli5
// @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto, xmader
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
        key: 'getIframeWin',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!document.querySelector('#bofqi > iframe').contentDocument.getElementById('bilibiliPlayer')) {
                                    _context2.next = 4;
                                    break;
                                }

                                return _context2.abrupt('return', document.querySelector('#bofqi > iframe').contentWindow);

                            case 4:
                                return _context2.abrupt('return', new Promise(function (resolve) {
                                    document.querySelector('#bofqi > iframe').addEventListener('load', function () {
                                        resolve(document.querySelector('#bofqi > iframe').contentWindow);
                                    }, { once: true });
                                }));

                            case 5:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function getIframeWin() {
                return _ref2.apply(this, arguments);
            }

            return getIframeWin;
        }()
    }, {
        key: 'getPlayerWin',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!location.href.includes('/watchlater/#/list')) {
                                    _context3.next = 3;
                                    break;
                                }

                                _context3.next = 3;
                                return new Promise(function (resolve) {
                                    window.addEventListener('hashchange', function () {
                                        return resolve(location.href);
                                    }, { once: true });
                                });

                            case 3:
                                if (!location.href.includes('/watchlater/#/')) {
                                    _context3.next = 7;
                                    break;
                                }

                                if (document.getElementById('bofqi')) {
                                    _context3.next = 7;
                                    break;
                                }

                                _context3.next = 7;
                                return new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (document.getElementById('bofqi')) {
                                            resolve(document.getElementById('bofqi'));
                                            observer.disconnect();
                                        }
                                    });
                                    observer.observe(document, { childList: true, subtree: true });
                                });

                            case 7:
                                if (!document.getElementById('bilibiliPlayer')) {
                                    _context3.next = 11;
                                    break;
                                }

                                return _context3.abrupt('return', window);

                            case 11:
                                if (!document.querySelector('#bofqi > iframe')) {
                                    _context3.next = 15;
                                    break;
                                }

                                return _context3.abrupt('return', BiliUserJS.getIframeWin());

                            case 15:
                                if (!document.querySelector('#bofqi > object')) {
                                    _context3.next = 19;
                                    break;
                                }

                                throw 'Need H5 Player';

                            case 19:
                                return _context3.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (document.getElementById('bilibiliPlayer')) {
                                            observer.disconnect();
                                            resolve(window);
                                        } else if (document.querySelector('#bofqi > iframe')) {
                                            observer.disconnect();
                                            resolve(BiliUserJS.getIframeWin());
                                        } else if (document.querySelector('#bofqi > object')) {
                                            observer.disconnect();
                                            throw 'Need H5 Player';
                                        }
                                    });
                                    observer.observe(document.getElementById('bofqi'), { childList: true });
                                }));

                            case 20:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function getPlayerWin() {
                return _ref3.apply(this, arguments);
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
            observer.observe(playerWin.document.getElementsByClassName('bilibili-player-video')[0], { childList: true });

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
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(func) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (!(document.readyState == 'loading')) {
                                    _context4.next = 4;
                                    break;
                                }

                                return _context4.abrupt('return', new Promise(function (resolve) {
                                    document.addEventListener('DOMContentLoaded', function () {
                                        return resolve(func());
                                    }, { once: true });
                                }));

                            case 4:
                                return _context4.abrupt('return', func());

                            case 5:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function domContentLoadedThen(_x) {
                return _ref4.apply(this, arguments);
            }

            return domContentLoadedThen;
        }()
    }]);

    return BiliUserJS;
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
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                var _this2 = this;

                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                if (!this.db) {
                                    _context5.next = 2;
                                    break;
                                }

                                return _context5.abrupt('return', this.db);

                            case 2:
                                this.db = new Promise(function (resolve, reject) {
                                    var openRequest = indexedDB.open(_this2.dbName);
                                    openRequest.onupgradeneeded = function (e) {
                                        var db = e.target.result;
                                        if (!db.objectStoreNames.contains(_this2.osName)) {
                                            db.createObjectStore(_this2.osName, { keyPath: _this2.keyPath });
                                        }
                                    };
                                    openRequest.onsuccess = function (e) {
                                        return resolve(_this2.db = e.target.result);
                                    };
                                    openRequest.onerror = reject;
                                });
                                return _context5.abrupt('return', this.db);

                            case 4:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getDB() {
                return _ref5.apply(this, arguments);
            }

            return getDB;
        }()
    }, {
        key: 'addData',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(item) {
                var _this3 = this;

                var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : item.name;
                var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : item.data || item;
                var itemChunks, numChunks, i, reqCascade;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                if (!(!data instanceof Blob)) {
                                    _context7.next = 2;
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
                                    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(resolve, reject) {
                                        var db, objectStore, onsuccess;
                                        return regeneratorRuntime.wrap(function _callee6$(_context6) {
                                            while (1) {
                                                switch (_context6.prev = _context6.next) {
                                                    case 0:
                                                        _context6.next = 2;
                                                        return _this3.getDB();

                                                    case 2:
                                                        db = _context6.sent;
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
                                                        return _context6.stop();
                                                }
                                            }
                                        }, _callee6, _this3);
                                    }));

                                    return function (_x9, _x10) {
                                        return _ref7.apply(this, arguments);
                                    };
                                }());
                                return _context7.abrupt('return', reqCascade);

                            case 7:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function addData(_x8) {
                return _ref6.apply(this, arguments);
            }

            return addData;
        }()
    }, {
        key: 'putData',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(item) {
                var _this4 = this;

                var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : item.name;
                var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : item.data || item;
                var itemChunks, numChunks, i, reqCascade;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                if (!(!data instanceof Blob)) {
                                    _context9.next = 2;
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
                                    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(resolve, reject) {
                                        var db, objectStore, onsuccess;
                                        return regeneratorRuntime.wrap(function _callee8$(_context8) {
                                            while (1) {
                                                switch (_context8.prev = _context8.next) {
                                                    case 0:
                                                        _context8.next = 2;
                                                        return _this4.getDB();

                                                    case 2:
                                                        db = _context8.sent;
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
                                                        return _context8.stop();
                                                }
                                            }
                                        }, _callee8, _this4);
                                    }));

                                    return function (_x14, _x15) {
                                        return _ref9.apply(this, arguments);
                                    };
                                }());
                                return _context9.abrupt('return', reqCascade);

                            case 7:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function putData(_x13) {
                return _ref8.apply(this, arguments);
            }

            return putData;
        }()
    }, {
        key: 'getData',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(name) {
                var _this5 = this;

                var reqCascade, dataChunks;
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                reqCascade = new Promise(function () {
                                    var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(resolve, reject) {
                                        var dataChunks, db, objectStore, probe;
                                        return regeneratorRuntime.wrap(function _callee10$(_context10) {
                                            while (1) {
                                                switch (_context10.prev = _context10.next) {
                                                    case 0:
                                                        dataChunks = [];
                                                        _context10.next = 3;
                                                        return _this5.getDB();

                                                    case 3:
                                                        db = _context10.sent;
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
                                                        return _context10.stop();
                                                }
                                            }
                                        }, _callee10, _this5);
                                    }));

                                    return function (_x17, _x18) {
                                        return _ref11.apply(this, arguments);
                                    };
                                }());
                                _context11.next = 3;
                                return reqCascade;

                            case 3:
                                dataChunks = _context11.sent;
                                return _context11.abrupt('return', dataChunks ? { name: name, data: new Blob(dataChunks) } : null);

                            case 5:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function getData(_x16) {
                return _ref10.apply(this, arguments);
            }

            return getData;
        }()
    }, {
        key: 'deleteData',
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(name) {
                var _this6 = this;

                var reqCascade;
                return regeneratorRuntime.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                reqCascade = new Promise(function () {
                                    var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(resolve, reject) {
                                        var currentChunkNum, db, objectStore, probe;
                                        return regeneratorRuntime.wrap(function _callee12$(_context12) {
                                            while (1) {
                                                switch (_context12.prev = _context12.next) {
                                                    case 0:
                                                        currentChunkNum = 0;
                                                        _context12.next = 3;
                                                        return _this6.getDB();

                                                    case 3:
                                                        db = _context12.sent;
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
                                                        return _context12.stop();
                                                }
                                            }
                                        }, _callee12, _this6);
                                    }));

                                    return function (_x20, _x21) {
                                        return _ref13.apply(this, arguments);
                                    };
                                }());
                                return _context13.abrupt('return', reqCascade);

                            case 2:
                            case 'end':
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function deleteData(_x19) {
                return _ref12.apply(this, arguments);
            }

            return deleteData;
        }()
    }, {
        key: 'deleteEntireDB',
        value: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
                var _this7 = this;

                var req;
                return regeneratorRuntime.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                req = indexedDB.deleteDatabase(this.dbName);
                                return _context14.abrupt('return', new Promise(function (resolve, reject) {
                                    req.onsuccess = function () {
                                        return resolve(_this7.db = null);
                                    };
                                    req.onerror = reject;
                                }));

                            case 2:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function deleteEntireDB() {
                return _ref14.apply(this, arguments);
            }

            return deleteEntireDB;
        }()
    }], [{
        key: '_UNIT_TEST',
        value: function () {
            var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                var db;
                return regeneratorRuntime.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                db = new CacheDB();

                                console.warn('Storing 201MB...');
                                _context15.t0 = console;
                                _context15.next = 5;
                                return db.putData(new Blob([new ArrayBuffer(201 * 1024 * 1024)]), 'test');

                            case 5:
                                _context15.t1 = _context15.sent;

                                _context15.t0.log.call(_context15.t0, _context15.t1);

                                console.warn('Deleting 201MB...');
                                _context15.t2 = console;
                                _context15.next = 11;
                                return db.deleteData('test');

                            case 11:
                                _context15.t3 = _context15.sent;

                                _context15.t2.log.call(_context15.t2, _context15.t3);

                            case 13:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function _UNIT_TEST() {
                return _ref15.apply(this, arguments);
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
        this.blobPromise = fetch(input, init).then(function (res) {
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
            var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
                return regeneratorRuntime.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                return _context16.abrupt('return', this.promise);

                            case 1:
                            case 'end':
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));

            function getBlob() {
                return _ref16.apply(this, arguments);
            }

            return getBlob;
        }()
    }, {
        key: 'pump',
        value: function () {
            var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
                var _ref18, done, value;

                return regeneratorRuntime.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                if (!true) {
                                    _context17.next = 13;
                                    break;
                                }

                                _context17.next = 3;
                                return this.reader.read();

                            case 3:
                                _ref18 = _context17.sent;
                                done = _ref18.done;
                                value = _ref18.value;

                                if (!done) {
                                    _context17.next = 8;
                                    break;
                                }

                                return _context17.abrupt('return', this.loaded);

                            case 8:
                                this.loaded += value.byteLength;
                                this.buffer.push(new Blob([value]));
                                if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
                                _context17.next = 0;
                                break;

                            case 13:
                            case 'end':
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));

            function pump() {
                return _ref17.apply(this, arguments);
            }

            return pump;
        }()
    }, {
        key: 'consume',
        value: function () {
            var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
                return regeneratorRuntime.wrap(function _callee18$(_context18) {
                    while (1) {
                        switch (_context18.prev = _context18.next) {
                            case 0:
                                _context18.next = 2;
                                return this.pump();

                            case 2:
                                this.blob = new Blob(this.buffer);
                                this.buffer = null;
                                return _context18.abrupt('return', this.blob);

                            case 5:
                            case 'end':
                                return _context18.stop();
                        }
                    }
                }, _callee18, this);
            }));

            function consume() {
                return _ref19.apply(this, arguments);
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
                xhr.open('get', input);
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
            var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
                var myResolve, _queueTail;

                return regeneratorRuntime.wrap(function _callee19$(_context19) {
                    while (1) {
                        switch (_context19.prev = _context19.next) {
                            case 0:
                                myResolve = void 0;
                                _queueTail = this.queueTail;

                                this.queueTail = new Promise(function (resolve) {
                                    return myResolve = resolve;
                                });
                                _context19.next = 5;
                                return _queueTail;

                            case 5:
                                this.resolveHead = myResolve;
                                return _context19.abrupt('return');

                            case 7:
                            case 'end':
                                return _context19.stop();
                        }
                    }
                }, _callee19, this);
            }));

            function lock() {
                return _ref20.apply(this, arguments);
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
            var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(promise) {
                var ret;
                return regeneratorRuntime.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                _context20.next = 2;
                                return this.lock();

                            case 2:
                                ret = void 0;
                                _context20.prev = 3;

                                if (typeof promise == 'function') promise = promise();
                                _context20.next = 7;
                                return promise;

                            case 7:
                                ret = _context20.sent;

                            case 8:
                                _context20.prev = 8;

                                this.unlock();
                                return _context20.finish(8);

                            case 11:
                                return _context20.abrupt('return', ret);

                            case 12:
                            case 'end':
                                return _context20.stop();
                        }
                    }
                }, _callee20, this, [[3,, 8, 11]]);
            }));

            function lockAndAwait(_x31) {
                return _ref21.apply(this, arguments);
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
            m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
                return regeneratorRuntime.wrap(function _callee21$(_context21) {
                    while (1) {
                        switch (_context21.prev = _context21.next) {
                            case 0:
                                _context21.next = 2;
                                return sleep(1000);

                            case 2:
                                _context21.next = 4;
                                return sleep(1000);

                            case 4:
                                _context21.next = 6;
                                return sleep(1000);

                            case 6:
                                _context21.next = 8;
                                return sleep(1000);

                            case 8:
                                _context21.next = 10;
                                return sleep(1000);

                            case 10:
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
                                return _context22.abrupt('return', console.log('5s!'));

                            case 1:
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
                                _context23.next = 2;
                                return sleep(1000);

                            case 2:
                                _context23.next = 4;
                                return sleep(1000);

                            case 4:
                                _context23.next = 6;
                                return sleep(1000);

                            case 6:
                                _context23.next = 8;
                                return sleep(1000);

                            case 8:
                                _context23.next = 10;
                                return sleep(1000);

                            case 10:
                            case 'end':
                                return _context23.stop();
                        }
                    }
                }, _callee23, _this10);
            })));
            m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
                return regeneratorRuntime.wrap(function _callee24$(_context24) {
                    while (1) {
                        switch (_context24.prev = _context24.next) {
                            case 0:
                                return _context24.abrupt('return', console.log('10s!'));

                            case 1:
                            case 'end':
                                return _context24.stop();
                        }
                    }
                }, _callee24, _this10);
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
    var clean = text.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, '');
    var data = new DOMParser().parseFromString(clean, 'text/xml');
    var cid = +data.querySelector('chatid').textContent;
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
            bottom: bottom > 0
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
    var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(danmaku, optionGetter) {
        var options, sorted, place, result, length, i, l, placed;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
                switch (_context25.prev = _context25.next) {
                    case 0:
                        options = JSON.parse(JSON.stringify(optionGetter));
                        sorted = danmaku.slice(0).sort(function (_ref27, _ref28) {
                            var x = _ref27.time;
                            var y = _ref28.time;
                            return x - y;
                        });
                        place = placeDanmaku(options);
                        result = Array(sorted.length);
                        length = 0;
                        i = 0, l = sorted.length;

                    case 6:
                        if (!(i < l)) {
                            _context25.next = 15;
                            break;
                        }

                        placed = place(sorted[i]);

                        if (placed) result[length++] = placed;

                        if (!((i + 1) % 1000 === 0)) {
                            _context25.next = 12;
                            break;
                        }

                        _context25.next = 12;
                        return new Promise(function (resolve) {
                            return setTimeout(resolve, 0);
                        });

                    case 12:
                        i++;
                        _context25.next = 6;
                        break;

                    case 15:
                        result.length = length;
                        result.sort(function (x, y) {
                            return x.layout.start.time - y.layout.start.time;
                        });
                        return _context25.abrupt('return', result);

                    case 18:
                    case 'end':
                        return _context25.stop();
                }
            }
        }, _callee25, this);
    }));

    return function layout(_x32, _x33) {
        return _ref26.apply(this, arguments);
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
var isDefaultColor = function isDefaultColor(_ref29) {
    var r = _ref29.r,
        g = _ref29.g,
        b = _ref29.b;
    return r === 255 && g === 255 && b === 255;
};
// test is dark color
var isDarkColor = function isDarkColor(_ref30) {
    var r = _ref30.r,
        g = _ref30.g,
        b = _ref30.b;
    return r * 0.299 + g * 0.587 + b * 0.114 < 0x30;
};

// Ass header
var header = function header(info) {
    return ['[Script Info]', 'Title: ' + info.title, 'Original Script: ' + info.original, 'ScriptType: v4.00+', 'Collisions: Normal', 'PlayResX: ' + info.playResX, 'PlayResY: ' + info.playResY, 'Timer: 100.0000', '', '[V4+ Styles]', 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding', 'Style: Fix,' + info.fontFamily + ',' + info.fontSize + ',&H' + info.alpha + 'FFFFFF,&H' + info.alpha + 'FFFFFF,&H' + info.alpha + '000000,&H' + info.alpha + '000000,' + info.bold + ',0,0,0,100,100,0,0,1,2,0,2,20,20,2,0', 'Style: Rtl,' + info.fontFamily + ',' + info.fontSize + ',&H' + info.alpha + 'FFFFFF,&H' + info.alpha + 'FFFFFF,&H' + info.alpha + '000000,&H' + info.alpha + '000000,' + info.bold + ',0,0,0,100,100,0,0,1,2,0,2,20,20,2,0', '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'];
};

// Set color of text
var lineColor = function lineColor(_ref31) {
    var color = _ref31.color;

    var output = [];
    if (!isDefaultColor(color)) output.push('\\c' + formatColor(color));
    if (isDarkColor(color)) output.push('\\3c&HFFFFFF');
    return output.join('');
};

// Set fontsize
var defaultFontSize = void 0;
var lineFontSize = function lineFontSize(_ref32) {
    var size = _ref32.size;

    if (size === defaultFontSize) return '';
    return '\\fs' + size;
};
var getCommonFontSize = function getCommonFontSize(list) {
    var count = new Map();
    var commonCount = 0,
        common = 1;
    list.forEach(function (_ref33) {
        var size = _ref33.size;

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
var lineMove = function lineMove(_ref34) {
    var _ref34$layout = _ref34.layout,
        type = _ref34$layout.type,
        _ref34$layout$start = _ref34$layout.start,
        start = _ref34$layout$start === undefined ? null : _ref34$layout$start,
        _ref34$layout$end = _ref34$layout.end,
        end = _ref34$layout$end === undefined ? null : _ref34$layout$end;

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
        fontFamily: options.fontFamily,
        fontSize: getCommonFontSize(danmaku.layout),
        alpha: formatColorChannel(0xFF * (100 - options.textOpacity) / 100),
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
    } }, { name: 'fontSize', type: 'number', min: 0, predef: 1, step: 0.01 }, { name: 'textSpace', type: 'number', min: 0, predef: 0 }, { name: 'rtlDuration', type: 'number', min: 0.1, predef: 8, step: 0.1 }, { name: 'fixDuration', type: 'number', min: 0.1, predef: 4, step: 0.1 }, { name: 'maxDelay', type: 'number', min: 0, predef: 6, step: 0.1 }, { name: 'textOpacity', type: 'number', min: 10, max: 100, predef: 60 }, { name: 'maxOverlap', type: 'number', min: 1, max: 20, predef: 1 }, { name: 'bold', type: 'boolean', predef: true }];

var attrNormalize = function attrNormalize(option, _ref35) {
    var name = _ref35.name,
        type = _ref35.type,
        _ref35$min = _ref35.min,
        min = _ref35$min === undefined ? -Infinity : _ref35$min,
        _ref35$max = _ref35.max,
        max = _ref35$max === undefined ? Infinity : _ref35$max,
        _ref35$step = _ref35.step,
        step = _ref35$step === undefined ? 1 : _ref35$step,
        predef = _ref35.predef,
        valid = _ref35.valid;

    var value = option;
    if (type === 'number') value = +value;else if (type === 'string') value = '' + value;else if (type === 'boolean') value = !!value;
    if (valid && !valid(value)) value = predef;
    if (type === 'number') {
        if (Number.isNaN(value)) value = predef;
        if (value < min) value = min;
        if (value > max) value = max;
        value = Math.round((value - min) / step) * step + min;
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

/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var parseXML = function parseXML(xml) {
    return parser.bilibili(xml).danmaku;
};

var genASS = function () {
    var _ref37 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(danmaku) {
        var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var layout$$1, ass$$1;
        return regeneratorRuntime.wrap(function _callee26$(_context26) {
            while (1) {
                switch (_context26.prev = _context26.next) {
                    case 0:
                        option = normalize(option);
                        _context26.next = 3;
                        return layout(danmaku, option);

                    case 3:
                        layout$$1 = _context26.sent;
                        ass$$1 = ass({
                            content: danmaku,
                            layout: layout$$1,
                            meta: {
                                name: option && option.title || 'danmaku',
                                url: option && option.originalURL || 'anonymous xml'
                            }
                        }, option);
                        return _context26.abrupt('return', ass$$1);

                    case 6:
                    case 'end':
                        return _context26.stop();
                }
            }
        }, _callee26, undefined);
    }));

    return function genASS(_x35) {
        return _ref37.apply(this, arguments);
    };
}();

var genASSBlob = function () {
    var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(danmaku) {
        var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
            while (1) {
                switch (_context27.prev = _context27.next) {
                    case 0:
                        _context27.t0 = convertToBlob;
                        _context27.next = 3;
                        return genASS(danmaku, option);

                    case 3:
                        _context27.t1 = _context27.sent;
                        return _context27.abrupt('return', (0, _context27.t0)(_context27.t1));

                    case 5:
                    case 'end':
                        return _context27.stop();
                }
            }
        }, _callee27, undefined);
    }));

    return function genASSBlob(_x37) {
        return _ref38.apply(this, arguments);
    };
}();
var ASSConverter = { parseXML: parseXML, genASS: genASS, genASSBlob: genASSBlob };

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
            _this13.cid = cid;_this13.ass = _this13.getASS();
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
        this.queryInfoMutex.lockAndAwait(function () {
            return _this13.getPlayerButtons();
        });
        this.queryInfoMutex.lockAndAwait(function () {
            return _this13.getAvailableFormatName();
        });

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
        key: 'getAvailableFormatName',
        value: function getAvailableFormatName(accept_quality) {
            if (!Array.isArray(accept_quality)) accept_quality = Array.from(this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul').getElementsByTagName('li')).map(function (e) {
                return e.getAttribute('data-value');
            });

            var accept_format = accept_quality.map(function (e) {
                return BiliMonkey.valueToFormat(e);
            });

            var vipExclusiveFormatSet = new Set(['flv_p60', 'hdflv2', 'flv720_p60']);
            var candidateFormatSet = new Set(this.getVIPStatus() ? accept_format : accept_format.filter(function (e) {
                return !vipExclusiveFormatSet.has(e);
            }));

            this.flvFormatName = ['flv_p60', 'hdflv2', 'flv', 'flv720_p60', 'flv720', 'flv480', 'flv360'].find(function (e) {
                return candidateFormatSet.has(e);
            }) || 'does_not_exist';

            this.mp4FormatName = ['hdmp4', 'mp4'].find(function (e) {
                return candidateFormatSet.has(e);
            }) || 'does_not_exist';

            if (this.flvFormatName == 'does_not_exist' || this.mp4FormatName == 'does_not_exist') {
                this.fallbackFormatName = ['mp4', 'flv360'].find(function (e) {
                    return candidateFormatSet.has(e);
                });
                if (!this.fallbackFormatName) throw 'BiliMonkey: cannot get available format names (this video has only one available quality?)';
            }
        }
    }, {
        key: 'execOptions',
        value: function () {
            var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
                return regeneratorRuntime.wrap(function _callee28$(_context28) {
                    while (1) {
                        switch (_context28.prev = _context28.next) {
                            case 0:
                                if (!this.option.autoDefault) {
                                    _context28.next = 3;
                                    break;
                                }

                                _context28.next = 3;
                                return this.sniffDefaultFormat();

                            case 3:
                                if (this.option.autoFLV) this.queryInfo('flv');
                                if (this.option.autoMP4) this.queryInfo('mp4');

                            case 5:
                            case 'end':
                                return _context28.stop();
                        }
                    }
                }, _callee28, this);
            }));

            function execOptions() {
                return _ref39.apply(this, arguments);
            }

            return execOptions;
        }()
    }, {
        key: 'sniffDefaultFormat',
        value: function () {
            var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
                var _this15 = this;

                var jq, _ajax;

                return regeneratorRuntime.wrap(function _callee29$(_context29) {
                    while (1) {
                        switch (_context29.prev = _context29.next) {
                            case 0:
                                if (!this.defaultFormatPromise) {
                                    _context29.next = 2;
                                    break;
                                }

                                return _context29.abrupt('return', this.defaultFormatPromise);

                            case 2:
                                if (!this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
                                    _context29.next = 4;
                                    break;
                                }

                                return _context29.abrupt('return', this.defaultFormatPromise = Promise.resolve());

                            case 4:
                                jq = this.playerWin.jQuery;
                                _ajax = jq.ajax;


                                this.defaultFormatPromise = new Promise(function (resolve) {
                                    var timeout = setTimeout(function () {
                                        jq.ajax = _ajax;resolve();
                                    }, 3000);
                                    var self = _this15;
                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a;a = c;c = undefined;
                                        }if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                            clearTimeout(timeout);
                                            self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                                            var _success = a.success;
                                            a.success = function (res) {
                                                // 1. determine available format names
                                                self.getAvailableFormatName(res.accept_quality);

                                                // 2. determine if we should take this response
                                                var format = res.format;
                                                if (format == self.mp4FormatName || format == self.flvFormatName) {
                                                    self.lockFormat(format);
                                                    self.resolveFormat(res, format);
                                                }

                                                // 3. callback
                                                if (self.proxy && self.flvs) {
                                                    self.setupProxy(res, _success);
                                                } else {
                                                    _success(res);
                                                }

                                                // 4. return to await
                                                resolve(res);
                                            };
                                            jq.ajax = _ajax;
                                        }
                                        return _ajax.call(jq, a, c);
                                    };
                                });
                                return _context29.abrupt('return', this.defaultFormatPromise);

                            case 8:
                            case 'end':
                                return _context29.stop();
                        }
                    }
                }, _callee29, this);
            }));

            function sniffDefaultFormat() {
                return _ref40.apply(this, arguments);
            }

            return sniffDefaultFormat;
        }()
    }, {
        key: 'getBackgroundFormat',
        value: function () {
            var _ref41 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(format) {
                var src, _pendingFormat, jq, _ajax, pendingFormat, self;

                return regeneratorRuntime.wrap(function _callee30$(_context30) {
                    while (1) {
                        switch (_context30.prev = _context30.next) {
                            case 0:
                                if (!(format == 'hdmp4' || format == 'mp4')) {
                                    _context30.next = 6;
                                    break;
                                }

                                src = this.playerWin.document.getElementsByTagName('video')[0].src;

                                if (!((src.includes('hd') || format == 'mp4') && src.includes('.mp4'))) {
                                    _context30.next = 6;
                                    break;
                                }

                                _pendingFormat = this.lockFormat(format);

                                this.resolveFormat({ durl: [{ url: src }] }, format);
                                return _context30.abrupt('return', _pendingFormat);

                            case 6:
                                jq = this.playerWin.jQuery;
                                _ajax = jq.ajax;
                                pendingFormat = this.lockFormat(format);
                                self = this;

                                jq.ajax = function (a, c) {
                                    if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                        if (typeof a === 'string') c.url = a;a = c;c = undefined;
                                    }if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                        self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                                        var _success = a.success;
                                        a.success = function (res) {
                                            if (format == 'hdmp4') res.durl = [res.durl[0].backup_url.find(function (e) {
                                                return e.includes('hd') && e.includes('.mp4');
                                            })];
                                            if (format == 'mp4') res.durl = [res.durl[0].backup_url.find(function (e) {
                                                return !e.includes('hd') && e.includes('.mp4');
                                            })];
                                            self.resolveFormat(res, format);
                                        };
                                        jq.ajax = _ajax;
                                    }
                                    return _ajax.call(jq, a, c);
                                };
                                this.playerWin.player.reloadAccess();

                                return _context30.abrupt('return', pendingFormat);

                            case 13:
                            case 'end':
                                return _context30.stop();
                        }
                    }
                }, _callee30, this);
            }));

            function getBackgroundFormat(_x41) {
                return _ref41.apply(this, arguments);
            }

            return getBackgroundFormat;
        }()
    }, {
        key: 'getNonCurrentFormat',
        value: function () {
            var _ref42 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(format) {
                var _this16 = this;

                var jq, _ajax, _setItem, pendingFormat, self;

                return regeneratorRuntime.wrap(function _callee31$(_context31) {
                    while (1) {
                        switch (_context31.prev = _context31.next) {
                            case 0:
                                jq = this.playerWin.jQuery;
                                _ajax = jq.ajax;
                                _setItem = this.playerWin.localStorage.setItem;
                                pendingFormat = this.lockFormat(format);
                                self = this;

                                jq.ajax = function (a, c) {
                                    if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                        if (typeof a === 'string') c.url = a;a = c;c = undefined;
                                    }if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                        self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                                        var _success = a.success;
                                        _success({});
                                        a.success = function (res) {
                                            return self.resolveFormat(res, format);
                                        };
                                        jq.ajax = _ajax;
                                    }
                                    return _ajax.call(jq, a, c);
                                };
                                this.playerWin.localStorage.setItem = function () {
                                    return _this16.playerWin.localStorage.setItem = _setItem;
                                };
                                this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="' + BiliMonkey.formatToValue(format) + '"]').click();
                                return _context31.abrupt('return', pendingFormat);

                            case 9:
                            case 'end':
                                return _context31.stop();
                        }
                    }
                }, _callee31, this);
            }));

            function getNonCurrentFormat(_x42) {
                return _ref42.apply(this, arguments);
            }

            return getNonCurrentFormat;
        }()
    }, {
        key: 'getASS',
        value: function () {
            var _ref43 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(clickableFormat) {
                var _this17 = this;

                return regeneratorRuntime.wrap(function _callee33$(_context33) {
                    while (1) {
                        switch (_context33.prev = _context33.next) {
                            case 0:
                                if (!this.ass) {
                                    _context33.next = 2;
                                    break;
                                }

                                return _context33.abrupt('return', this.ass);

                            case 2:
                                this.ass = new Promise(function () {
                                    var _ref44 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(resolve) {
                                        var bilibili_player_settings, danmaku, i, regexp, option;
                                        return regeneratorRuntime.wrap(function _callee32$(_context32) {
                                            while (1) {
                                                switch (_context32.prev = _context32.next) {
                                                    case 0:
                                                        if (_this17.cid) {
                                                            _context32.next = 4;
                                                            break;
                                                        }

                                                        _context32.next = 3;
                                                        return new Promise(function (resolve, reject) {
                                                            clickableFormat = _this17.fallbackFormatName || clickableFormat;
                                                            if (!clickableFormat) reject('get ASS Error: cid unavailable, nor clickable format given.');
                                                            var jq = _this17.playerWin.jQuery;
                                                            var _ajax = jq.ajax;
                                                            var _setItem = _this17.playerWin.localStorage.setItem;

                                                            if (!_this17.fallbackFormatName) _this17.lockFormat(clickableFormat);
                                                            var self = _this17;
                                                            jq.ajax = function (a, c) {
                                                                var _this18 = this;

                                                                if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                                    if (typeof a === 'string') c.url = a;a = c;c = undefined;
                                                                }if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                                                    resolve(self.cid = a.url.match(/cid=\d+/)[0].slice(4));
                                                                    var _success = a.success;
                                                                    _success({});
                                                                    a.success = function (res) {
                                                                        if (!_this18.fallbackFormatName) self.resolveFormat(res, clickableFormat);
                                                                    };
                                                                    jq.ajax = _ajax;
                                                                }
                                                                return _ajax.call(jq, a, c);
                                                            };
                                                            _this17.playerWin.localStorage.setItem = function () {
                                                                return _this17.playerWin.localStorage.setItem = _setItem;
                                                            };
                                                            _this17.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="' + BiliMonkey.formatToValue(clickableFormat) + '"]').click();
                                                        });

                                                    case 3:
                                                        _this17.cid = _context32.sent;

                                                    case 4:

                                                        // 2. options
                                                        bilibili_player_settings = _this17.playerWin.localStorage.bilibili_player_settings && JSON.parse(_this17.playerWin.localStorage.bilibili_player_settings);

                                                        // 2.1 blocker

                                                        _context32.next = 7;
                                                        return BiliMonkey.fetchDanmaku(_this17.cid);

                                                    case 7:
                                                        danmaku = _context32.sent;

                                                        if (bilibili_player_settings && _this17.blocker) {
                                                            i = bilibili_player_settings.block.list.map(function (e) {
                                                                return e.v;
                                                            }).join('|');

                                                            if (i) {
                                                                regexp = new RegExp(i);

                                                                danmaku = danmaku.filter(function (e) {
                                                                    return !regexp.test(e.text);
                                                                });
                                                            }
                                                        }

                                                        // 2.2 font
                                                        option = bilibili_player_settings && _this17.font && {
                                                            'fontFamily': bilibili_player_settings.setting_config['fontfamily'] != 'custom' ? bilibili_player_settings.setting_config['fontfamily'].split(/, ?/) : bilibili_player_settings.setting_config['fontfamilycustom'].split(/, ?/),
                                                            'fontSize': parseFloat(bilibili_player_settings.setting_config['fontsize']),
                                                            'textOpacity': parseFloat(bilibili_player_settings.setting_config['opacity']),
                                                            'bold': bilibili_player_settings.setting_config['bold'] ? 1 : 0
                                                        } || undefined;

                                                        // 3. generate

                                                        _context32.t0 = resolve;
                                                        _context32.t1 = top.URL;
                                                        _context32.next = 14;
                                                        return ASSConverter.genASSBlob(danmaku, top.document.title, top.location.href, option);

                                                    case 14:
                                                        _context32.t2 = _context32.sent;
                                                        _context32.t3 = _this17.ass = _context32.t1.createObjectURL.call(_context32.t1, _context32.t2);
                                                        (0, _context32.t0)(_context32.t3);

                                                    case 17:
                                                    case 'end':
                                                        return _context32.stop();
                                                }
                                            }
                                        }, _callee32, _this17);
                                    }));

                                    return function (_x44) {
                                        return _ref44.apply(this, arguments);
                                    };
                                }());
                                return _context33.abrupt('return', this.ass);

                            case 4:
                            case 'end':
                                return _context33.stop();
                        }
                    }
                }, _callee33, this);
            }));

            function getASS(_x43) {
                return _ref43.apply(this, arguments);
            }

            return getASS;
        }()
    }, {
        key: 'queryInfo',
        value: function () {
            var _ref45 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(format) {
                var _this19 = this;

                return regeneratorRuntime.wrap(function _callee35$(_context35) {
                    while (1) {
                        switch (_context35.prev = _context35.next) {
                            case 0:
                                return _context35.abrupt('return', this.queryInfoMutex.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34() {
                                    var _jq, api_url, re, data, durls, blobs, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, url_obj, r, blob;

                                    return regeneratorRuntime.wrap(function _callee34$(_context34) {
                                        while (1) {
                                            switch (_context34.prev = _context34.next) {
                                                case 0:
                                                    _context34.t0 = format;
                                                    _context34.next = _context34.t0 === 'video' ? 3 : _context34.t0 === 'ass' ? 49 : 58;
                                                    break;

                                                case 3:
                                                    if (!_this19.flvs) {
                                                        _context34.next = 7;
                                                        break;
                                                    }

                                                    return _context34.abrupt('return', _this19.flvs);

                                                case 7:
                                                    if (!(_this19.flvFormatName == 'does_not_exist')) {
                                                        _context34.next = 9;
                                                        break;
                                                    }

                                                    return _context34.abrupt('return', _this19.flvFormatName);

                                                case 9:
                                                    _jq = _this19.playerWin.jQuery;
                                                    api_url = 'https://api.bilibili.com/x/player/playurl?avid=' + aid + '&cid=' + cid + '&otype=json&qn=80';
                                                    re = _jq.ajax({
                                                        url: api_url,
                                                        async: false
                                                    });
                                                    data = JSON.parse(re.responseText).data;

                                                    console.log(data);
                                                    durls = data.durl;
                                                    blobs = [data.format.slice(0, 3)];
                                                    _iteratorNormalCompletion2 = true;
                                                    _didIteratorError2 = false;
                                                    _iteratorError2 = undefined;
                                                    _context34.prev = 19;
                                                    _iterator2 = durls[Symbol.iterator]();

                                                case 21:
                                                    if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                                        _context34.next = 33;
                                                        break;
                                                    }

                                                    url_obj = _step2.value;
                                                    _context34.next = 25;
                                                    return fetch(url_obj.url.replace("http://", "https://"));

                                                case 25:
                                                    r = _context34.sent;
                                                    _context34.next = 28;
                                                    return r.blob();

                                                case 28:
                                                    blob = _context34.sent;

                                                    blobs.push(blob);

                                                case 30:
                                                    _iteratorNormalCompletion2 = true;
                                                    _context34.next = 21;
                                                    break;

                                                case 33:
                                                    _context34.next = 39;
                                                    break;

                                                case 35:
                                                    _context34.prev = 35;
                                                    _context34.t1 = _context34['catch'](19);
                                                    _didIteratorError2 = true;
                                                    _iteratorError2 = _context34.t1;

                                                case 39:
                                                    _context34.prev = 39;
                                                    _context34.prev = 40;

                                                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                                        _iterator2.return();
                                                    }

                                                case 42:
                                                    _context34.prev = 42;

                                                    if (!_didIteratorError2) {
                                                        _context34.next = 45;
                                                        break;
                                                    }

                                                    throw _iteratorError2;

                                                case 45:
                                                    return _context34.finish(42);

                                                case 46:
                                                    return _context34.finish(39);

                                                case 47:

                                                    _this19.blobs = blobs;

                                                    return _context34.abrupt('return', durls);

                                                case 49:
                                                    if (!_this19.ass) {
                                                        _context34.next = 53;
                                                        break;
                                                    }

                                                    return _context34.abrupt('return', _this19.ass);

                                                case 53:
                                                    if (!(quality == BiliMonkey.formatToValue(_this19.flvFormatName))) {
                                                        _context34.next = 57;
                                                        break;
                                                    }

                                                    return _context34.abrupt('return', _this19.getASS(_this19.mp4FormatName));

                                                case 57:
                                                    return _context34.abrupt('return', _this19.getASS(_this19.flvFormatName));

                                                case 58:
                                                    throw 'Bilimonkey: What is format ' + format + '?';

                                                case 59:
                                                case 'end':
                                                    return _context34.stop();
                                            }
                                        }
                                    }, _callee34, _this19, [[19, 35, 39, 47], [40,, 42, 46]]);
                                }))));

                            case 1:
                            case 'end':
                                return _context35.stop();
                        }
                    }
                }, _callee35, this);
            }));

            function queryInfo(_x45) {
                return _ref45.apply(this, arguments);
            }

            return queryInfo;
        }()
    }, {
        key: 'getPlayerButtons',
        value: function () {
            var _ref47 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36() {
                var _this20 = this;

                return regeneratorRuntime.wrap(function _callee36$(_context36) {
                    while (1) {
                        switch (_context36.prev = _context36.next) {
                            case 0:
                                if (!this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
                                    _context36.next = 4;
                                    break;
                                }

                                return _context36.abrupt('return', this.playerWin);

                            case 4:
                                return _context36.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (_this20.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
                                            observer.disconnect();
                                            resolve(_this20.playerWin);
                                        }
                                    });
                                    observer.observe(_this20.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                }));

                            case 5:
                            case 'end':
                                return _context36.stop();
                        }
                    }
                }, _callee36, this);
            }));

            function getPlayerButtons() {
                return _ref47.apply(this, arguments);
            }

            return getPlayerButtons;
        }()
    }, {
        key: 'hangPlayer',
        value: function () {
            var _ref48 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38() {
                var _this21 = this;

                var fakedRes, jq, _ajax, _setItem;

                return regeneratorRuntime.wrap(function _callee38$(_context38) {
                    while (1) {
                        switch (_context38.prev = _context38.next) {
                            case 0:
                                fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': '' }] };
                                jq = this.playerWin.jQuery;
                                _ajax = jq.ajax;
                                _setItem = this.playerWin.localStorage.setItem;
                                return _context38.abrupt('return', this.queryInfoMutex.lockAndAwait(function () {
                                    return new Promise(function () {
                                        var _ref49 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(resolve) {
                                            var blockerTimeout, button;
                                            return regeneratorRuntime.wrap(function _callee37$(_context37) {
                                                while (1) {
                                                    switch (_context37.prev = _context37.next) {
                                                        case 0:
                                                            blockerTimeout = void 0;

                                                            jq.ajax = function (a, c) {
                                                                if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                                    if (typeof a === 'string') c.url = a;a = c;c = undefined;
                                                                }if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                                                    clearTimeout(blockerTimeout);
                                                                    a.success(fakedRes);
                                                                    blockerTimeout = setTimeout(function () {
                                                                        jq.ajax = _ajax;
                                                                        resolve();
                                                                    }, 2500);
                                                                } else {
                                                                    return _ajax.call(jq, a, c);
                                                                }
                                                            };
                                                            _this21.playerWin.localStorage.setItem = function () {
                                                                return _this21.playerWin.localStorage.setItem = _setItem;
                                                            };
                                                            button = Array.from(_this21.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul').getElementsByTagName('li')).find(function (e) {
                                                                return !e.getAttribute('data-selected') && e.children.length == 2;
                                                            });

                                                            button.click();

                                                        case 5:
                                                        case 'end':
                                                            return _context37.stop();
                                                    }
                                                }
                                            }, _callee37, _this21);
                                        }));

                                        return function (_x46) {
                                            return _ref49.apply(this, arguments);
                                        };
                                    }());
                                }));

                            case 5:
                            case 'end':
                                return _context38.stop();
                        }
                    }
                }, _callee38, this);
            }));

            function hangPlayer() {
                return _ref48.apply(this, arguments);
            }

            return hangPlayer;
        }()
    }, {
        key: 'loadFLVFromCache',
        value: function () {
            var _ref50 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(index) {
                var name, item;
                return regeneratorRuntime.wrap(function _callee39$(_context39) {
                    while (1) {
                        switch (_context39.prev = _context39.next) {
                            case 0:
                                if (this.cache) {
                                    _context39.next = 2;
                                    break;
                                }

                                return _context39.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context39.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].split("/").pop();
                                _context39.next = 7;
                                return this.cache.getData(name);

                            case 7:
                                item = _context39.sent;

                                if (item) {
                                    _context39.next = 10;
                                    break;
                                }

                                return _context39.abrupt('return');

                            case 10:
                                return _context39.abrupt('return', this.flvsBlob[index] = item.data);

                            case 11:
                            case 'end':
                                return _context39.stop();
                        }
                    }
                }, _callee39, this);
            }));

            function loadFLVFromCache(_x47) {
                return _ref50.apply(this, arguments);
            }

            return loadFLVFromCache;
        }()
    }, {
        key: 'loadPartialFLVFromCache',
        value: function () {
            var _ref51 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40(index) {
                var name, item;
                return regeneratorRuntime.wrap(function _callee40$(_context40) {
                    while (1) {
                        switch (_context40.prev = _context40.next) {
                            case 0:
                                if (this.cache) {
                                    _context40.next = 2;
                                    break;
                                }

                                return _context40.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context40.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].split("/").pop();

                                name = 'PC_' + name;
                                _context40.next = 8;
                                return this.cache.getData(name);

                            case 8:
                                item = _context40.sent;

                                if (item) {
                                    _context40.next = 11;
                                    break;
                                }

                                return _context40.abrupt('return');

                            case 11:
                                return _context40.abrupt('return', item.data);

                            case 12:
                            case 'end':
                                return _context40.stop();
                        }
                    }
                }, _callee40, this);
            }));

            function loadPartialFLVFromCache(_x48) {
                return _ref51.apply(this, arguments);
            }

            return loadPartialFLVFromCache;
        }()
    }, {
        key: 'loadAllFLVFromCache',
        value: function () {
            var _ref52 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41() {
                var promises, i;
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
                                promises = [];

                                for (i = 0; i < this.flvs.length; i++) {
                                    promises.push(this.loadFLVFromCache(i));
                                }return _context41.abrupt('return', Promise.all(promises));

                            case 7:
                            case 'end':
                                return _context41.stop();
                        }
                    }
                }, _callee41, this);
            }));

            function loadAllFLVFromCache() {
                return _ref52.apply(this, arguments);
            }

            return loadAllFLVFromCache;
        }()
    }, {
        key: 'saveFLVToCache',
        value: function () {
            var _ref53 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42(index, blob) {
                var name;
                return regeneratorRuntime.wrap(function _callee42$(_context42) {
                    while (1) {
                        switch (_context42.prev = _context42.next) {
                            case 0:
                                if (this.cache) {
                                    _context42.next = 2;
                                    break;
                                }

                                return _context42.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context42.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].split("/").pop();
                                return _context42.abrupt('return', this.cache.addData({ name: name, data: blob }));

                            case 6:
                            case 'end':
                                return _context42.stop();
                        }
                    }
                }, _callee42, this);
            }));

            function saveFLVToCache(_x49, _x50) {
                return _ref53.apply(this, arguments);
            }

            return saveFLVToCache;
        }()
    }, {
        key: 'savePartialFLVToCache',
        value: function () {
            var _ref54 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43(index, blob) {
                var name;
                return regeneratorRuntime.wrap(function _callee43$(_context43) {
                    while (1) {
                        switch (_context43.prev = _context43.next) {
                            case 0:
                                if (this.cache) {
                                    _context43.next = 2;
                                    break;
                                }

                                return _context43.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context43.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].split("/").pop();

                                name = 'PC_' + name;
                                return _context43.abrupt('return', this.cache.putData({ name: name, data: blob }));

                            case 7:
                            case 'end':
                                return _context43.stop();
                        }
                    }
                }, _callee43, this);
            }));

            function savePartialFLVToCache(_x51, _x52) {
                return _ref54.apply(this, arguments);
            }

            return savePartialFLVToCache;
        }()
    }, {
        key: 'cleanPartialFLVInCache',
        value: function () {
            var _ref55 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44(index) {
                var name;
                return regeneratorRuntime.wrap(function _callee44$(_context44) {
                    while (1) {
                        switch (_context44.prev = _context44.next) {
                            case 0:
                                if (this.cache) {
                                    _context44.next = 2;
                                    break;
                                }

                                return _context44.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context44.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                name = this.flvs[index].split("/").pop();

                                name = 'PC_' + name;
                                return _context44.abrupt('return', this.cache.deleteData(name));

                            case 7:
                            case 'end':
                                return _context44.stop();
                        }
                    }
                }, _callee44, this);
            }));

            function cleanPartialFLVInCache(_x53) {
                return _ref55.apply(this, arguments);
            }

            return cleanPartialFLVInCache;
        }()
    }, {
        key: 'getFLV',
        value: function () {
            var _ref56 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee46(index, progressHandler) {
                var _this22 = this;

                return regeneratorRuntime.wrap(function _callee46$(_context46) {
                    while (1) {
                        switch (_context46.prev = _context46.next) {
                            case 0:
                                if (!this.flvsBlob[index]) {
                                    _context46.next = 2;
                                    break;
                                }

                                return _context46.abrupt('return', this.flvsBlob[index]);

                            case 2:
                                if (this.flvs) {
                                    _context46.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                this.flvsBlob[index] = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45() {
                                    var cache, partialFLVFromCache, burl, opt, fch, fullFLV;
                                    return regeneratorRuntime.wrap(function _callee45$(_context45) {
                                        while (1) {
                                            switch (_context45.prev = _context45.next) {
                                                case 0:
                                                    _context45.next = 2;
                                                    return _this22.loadFLVFromCache(index);

                                                case 2:
                                                    cache = _context45.sent;

                                                    if (!cache) {
                                                        _context45.next = 5;
                                                        break;
                                                    }

                                                    return _context45.abrupt('return', _this22.flvsBlob[index] = cache);

                                                case 5:
                                                    _context45.next = 7;
                                                    return _this22.loadPartialFLVFromCache(index);

                                                case 7:
                                                    partialFLVFromCache = _context45.sent;
                                                    burl = _this22.flvs[index];

                                                    if (partialFLVFromCache) burl += '&bstart=' + partialFLVFromCache.size;
                                                    opt = {
                                                        fetch: _this22.playerWin.fetch,
                                                        method: 'GET',
                                                        mode: 'cors',
                                                        cache: 'default',
                                                        referrerPolicy: 'no-referrer-when-downgrade',
                                                        cacheLoaded: partialFLVFromCache ? partialFLVFromCache.size : 0,
                                                        headers: partialFLVFromCache && !burl.includes('wsTime') ? { Range: 'bytes=' + partialFLVFromCache.size + '-' } : undefined
                                                    };

                                                    opt.onprogress = progressHandler;
                                                    opt.onerror = opt.onabort = function (_ref58) {
                                                        var target = _ref58.target,
                                                            type = _ref58.type;

                                                        var partialFLV = target.getPartialBlob();
                                                        if (partialFLVFromCache) partialFLV = new Blob([partialFLVFromCache, partialFLV]);
                                                        _this22.savePartialFLVToCache(index, partialFLV);
                                                    };

                                                    fch = new DetailedFetchBlob(burl, opt);

                                                    _this22.flvsDetailedFetch[index] = fch;
                                                    _context45.next = 17;
                                                    return fch.getBlob();

                                                case 17:
                                                    fullFLV = _context45.sent;

                                                    _this22.flvsDetailedFetch[index] = undefined;
                                                    if (partialFLVFromCache) {
                                                        fullFLV = new Blob([partialFLVFromCache, fullFLV]);
                                                        _this22.cleanPartialFLVInCache(index);
                                                    }
                                                    _this22.saveFLVToCache(index, fullFLV);
                                                    return _context45.abrupt('return', _this22.flvsBlob[index] = fullFLV);

                                                case 22:
                                                case 'end':
                                                    return _context45.stop();
                                            }
                                        }
                                    }, _callee45, _this22);
                                }))();
                                return _context46.abrupt('return', this.flvsBlob[index]);

                            case 6:
                            case 'end':
                                return _context46.stop();
                        }
                    }
                }, _callee46, this);
            }));

            function getFLV(_x54, _x55) {
                return _ref56.apply(this, arguments);
            }

            return getFLV;
        }()
    }, {
        key: 'abortFLV',
        value: function () {
            var _ref59 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee47(index) {
                return regeneratorRuntime.wrap(function _callee47$(_context47) {
                    while (1) {
                        switch (_context47.prev = _context47.next) {
                            case 0:
                                if (!this.flvsDetailedFetch[index]) {
                                    _context47.next = 2;
                                    break;
                                }

                                return _context47.abrupt('return', this.flvsDetailedFetch[index].abort());

                            case 2:
                            case 'end':
                                return _context47.stop();
                        }
                    }
                }, _callee47, this);
            }));

            function abortFLV(_x56) {
                return _ref59.apply(this, arguments);
            }

            return abortFLV;
        }()
    }, {
        key: 'getAllFLVs',
        value: function () {
            var _ref60 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee48(progressHandler) {
                var promises, i;
                return regeneratorRuntime.wrap(function _callee48$(_context48) {
                    while (1) {
                        switch (_context48.prev = _context48.next) {
                            case 0:
                                if (this.flvs) {
                                    _context48.next = 2;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 2:
                                promises = [];

                                for (i = 0; i < this.flvs.length; i++) {
                                    promises.push(this.getFLV(i, progressHandler));
                                }return _context48.abrupt('return', Promise.all(promises));

                            case 5:
                            case 'end':
                                return _context48.stop();
                        }
                    }
                }, _callee48, this);
            }));

            function getAllFLVs(_x57) {
                return _ref60.apply(this, arguments);
            }

            return getAllFLVs;
        }()
    }, {
        key: 'cleanAllFLVsInCache',
        value: function () {
            var _ref61 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee49() {
                var ret, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, flv, name;

                return regeneratorRuntime.wrap(function _callee49$(_context49) {
                    while (1) {
                        switch (_context49.prev = _context49.next) {
                            case 0:
                                if (this.cache) {
                                    _context49.next = 2;
                                    break;
                                }

                                return _context49.abrupt('return');

                            case 2:
                                if (this.flvs) {
                                    _context49.next = 4;
                                    break;
                                }

                                throw 'BiliMonkey: info uninitialized';

                            case 4:
                                ret = [];
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context49.prev = 8;
                                _iterator3 = this.flvs[Symbol.iterator]();

                            case 10:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context49.next = 26;
                                    break;
                                }

                                flv = _step3.value;
                                name = flv.split("/").pop();
                                _context49.t0 = ret;
                                _context49.next = 16;
                                return this.cache.deleteData(name);

                            case 16:
                                _context49.t1 = _context49.sent;

                                _context49.t0.push.call(_context49.t0, _context49.t1);

                                _context49.t2 = ret;
                                _context49.next = 21;
                                return this.cache.deleteData('PC_' + name);

                            case 21:
                                _context49.t3 = _context49.sent;

                                _context49.t2.push.call(_context49.t2, _context49.t3);

                            case 23:
                                _iteratorNormalCompletion3 = true;
                                _context49.next = 10;
                                break;

                            case 26:
                                _context49.next = 32;
                                break;

                            case 28:
                                _context49.prev = 28;
                                _context49.t4 = _context49['catch'](8);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context49.t4;

                            case 32:
                                _context49.prev = 32;
                                _context49.prev = 33;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 35:
                                _context49.prev = 35;

                                if (!_didIteratorError3) {
                                    _context49.next = 38;
                                    break;
                                }

                                throw _iteratorError3;

                            case 38:
                                return _context49.finish(35);

                            case 39:
                                return _context49.finish(32);

                            case 40:
                                return _context49.abrupt('return', ret);

                            case 41:
                            case 'end':
                                return _context49.stop();
                        }
                    }
                }, _callee49, this, [[8, 28, 32, 40], [33,, 35, 39]]);
            }));

            function cleanAllFLVsInCache() {
                return _ref61.apply(this, arguments);
            }

            return cleanAllFLVsInCache;
        }()
    }, {
        key: 'setupProxy',
        value: function () {
            var _ref62 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee50(res, onsuccess) {
                var _this23 = this;

                var _fetch, resProxy, i;

                return regeneratorRuntime.wrap(function _callee50$(_context50) {
                    while (1) {
                        switch (_context50.prev = _context50.next) {
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
                                        return _this23.playerWin.fetch = _fetch;
                                    });
                                }

                                _context50.next = 3;
                                return this.loadAllFLVFromCache();

                            case 3:
                                resProxy = Object.assign({}, res);

                                for (i = 0; i < this.flvsBlob.length; i++) {
                                    if (this.flvsBlob[i]) resProxy.durl[i].url = this.playerWin.URL.createObjectURL(this.flvsBlob[i]);
                                }
                                return _context50.abrupt('return', onsuccess(resProxy));

                            case 6:
                            case 'end':
                                return _context50.stop();
                        }
                    }
                }, _callee50, this);
            }));

            function setupProxy(_x58, _x59) {
                return _ref62.apply(this, arguments);
            }

            return setupProxy;
        }()
    }], [{
        key: 'fetchDanmaku',
        value: function () {
            var _ref63 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee51(cid) {
                return regeneratorRuntime.wrap(function _callee51$(_context51) {
                    while (1) {
                        switch (_context51.prev = _context51.next) {
                            case 0:
                                _context51.t0 = ASSConverter;
                                _context51.next = 3;
                                return new Promise(function (resolve, reject) {
                                    var e = new XMLHttpRequest();
                                    e.onload = function () {
                                        return resolve(e.responseText);
                                    };
                                    e.onerror = reject;
                                    e.open('get', 'https://comment.bilibili.com/' + cid + '.xml');
                                    e.send();
                                });

                            case 3:
                                _context51.t1 = _context51.sent;
                                return _context51.abrupt('return', _context51.t0.parseXML.call(_context51.t0, _context51.t1));

                            case 5:
                            case 'end':
                                return _context51.stop();
                        }
                    }
                }, _callee51, this);
            }));

            function fetchDanmaku(_x60) {
                return _ref63.apply(this, arguments);
            }

            return fetchDanmaku;
        }()
    }, {
        key: 'getAllPageDefaultFormats',
        value: function () {
            var _ref64 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee54() {
                var playerWin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : top;

                var jq, _ajax, queryInfoMutex, list, index, end, ret;

                return regeneratorRuntime.wrap(function _callee54$(_context54) {
                    while (1) {
                        switch (_context54.prev = _context54.next) {
                            case 0:
                                jq = playerWin.jQuery;
                                _ajax = jq.ajax;

                                // 1. mutex => you must send requests one by one

                                queryInfoMutex = new Mutex();

                                // 2. bilibili has a misconfigured lazy loading => keep trying

                                _context54.next = 5;
                                return new Promise(function (resolve) {
                                    var i = setInterval(function () {
                                        var ret = playerWin.player.getPlaylist();
                                        if (ret) {
                                            clearInterval(i);
                                            resolve(ret);
                                        }
                                    }, 500);
                                });

                            case 5:
                                list = _context54.sent;


                                // 3. build {cid: information} dict
                                index = list.reduce(function (acc, cur) {
                                    acc[cur.cid] = cur;return acc;
                                }, {});

                                // 4. find where to stop

                                end = list[list.length - 1].cid.toString();

                                // 5. collect information

                                ret = [];

                                jq.ajax = function (a, c) {
                                    var _this24 = this;

                                    if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                        if (typeof a === 'string') c.url = a;a = c;c = undefined;
                                    }if (a.url.includes('comment.bilibili.com') || a.url.includes('interface.bilibili.com/player?') || a.url.includes('api.bilibili.com/x/player/playurl/token')) return _ajax.call(jq, a, c);
                                    if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee53() {
                                            var cid, _ref66, _ref67, danmuku, res;

                                            return regeneratorRuntime.wrap(function _callee53$(_context53) {
                                                while (1) {
                                                    switch (_context53.prev = _context53.next) {
                                                        case 0:
                                                            // 5.1 suppress success handler
                                                            a.success = undefined;

                                                            // 5.2 find cid
                                                            cid = a.url.match(/cid=\d+/)[0].slice(4);

                                                            // 5.3 grab information

                                                            _context53.next = 4;
                                                            return Promise.all([
                                                            // 5.3.1 grab danmuku
                                                            _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee52() {
                                                                return regeneratorRuntime.wrap(function _callee52$(_context52) {
                                                                    while (1) {
                                                                        switch (_context52.prev = _context52.next) {
                                                                            case 0:
                                                                                _context52.t0 = top.URL;
                                                                                _context52.t1 = new ASSConverter();
                                                                                _context52.next = 4;
                                                                                return BiliMonkey.fetchDanmaku(cid);

                                                                            case 4:
                                                                                _context52.t2 = _context52.sent;
                                                                                _context52.t3 = top.document.title;
                                                                                _context52.t4 = top.location.href;
                                                                                _context52.next = 9;
                                                                                return _context52.t1.genASSBlob.call(_context52.t1, _context52.t2, _context52.t3, _context52.t4);

                                                                            case 9:
                                                                                _context52.t5 = _context52.sent;
                                                                                return _context52.abrupt('return', _context52.t0.createObjectURL.call(_context52.t0, _context52.t5));

                                                                            case 11:
                                                                            case 'end':
                                                                                return _context52.stop();
                                                                        }
                                                                    }
                                                                }, _callee52, _this24);
                                                            }))(),

                                                            // 5.3.2 grab download res
                                                            _ajax.call(jq, a, c)]);

                                                        case 4:
                                                            _ref66 = _context53.sent;
                                                            _ref67 = _slicedToArray(_ref66, 2);
                                                            danmuku = _ref67[0];
                                                            res = _ref67[1];


                                                            // 5.4 save information
                                                            ret.push({
                                                                durl: res.durl.map(function (_ref69) {
                                                                    var url = _ref69.url;
                                                                    return url.replace('http:', playerWin.location.protocol);
                                                                }),
                                                                danmuku: danmuku,
                                                                name: index[cid].part || index[cid].index,
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

                                                            // 5.5 finish job
                                                            queryInfoMutex.unlock();

                                                        case 10:
                                                        case 'end':
                                                            return _context53.stop();
                                                    }
                                                }
                                            }, _callee53, _this24);
                                        }))();
                                    }
                                    return _ajax.call(jq, { url: '//0.0.0.0' });
                                };

                                // 6.1 from the first page
                                _context54.next = 12;
                                return queryInfoMutex.lock();

                            case 12:
                                playerWin.player.next(1);

                            case 13:
                                if (!1) {
                                    _context54.next = 21;
                                    break;
                                }

                                _context54.next = 16;
                                return queryInfoMutex.lock();

                            case 16:
                                if (!(ret[ret.length - 1].cid == end)) {
                                    _context54.next = 18;
                                    break;
                                }

                                return _context54.abrupt('break', 21);

                            case 18:
                                playerWin.player.next();
                                _context54.next = 13;
                                break;

                            case 21:
                                return _context54.abrupt('return', ret);

                            case 22:
                            case 'end':
                                return _context54.stop();
                        }
                    }
                }, _callee54, this);
            }));

            function getAllPageDefaultFormats() {
                return _ref64.apply(this, arguments);
            }

            return getAllPageDefaultFormats;
        }()
    }, {
        key: 'formatToValue',
        value: function formatToValue(format) {
            if (format == 'does_not_exist') throw 'formatToValue: cannot lookup does_not_exist';
            if (typeof BiliMonkey.formatToValue.dict == 'undefined') BiliMonkey.formatToValue.dict = {
                'flv_p60': '116',
                'flv720_p60': '74',
                'flv': '80',
                'flv720': '64',
                'flv480': '32',
                'flv360': '15',

                // legacy - late 2017
                'hdflv2': '112',
                'hdmp4': '64', // data-value is still '64' instead of '48'.  '48',
                'mp4': '16'
            };
            return BiliMonkey.formatToValue.dict[format] || null;
        }
    }, {
        key: 'valueToFormat',
        value: function valueToFormat(value) {
            if (typeof BiliMonkey.valueToFormat.dict == 'undefined') BiliMonkey.valueToFormat.dict = {
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
            var _this25 = this;

            return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee55() {
                var playerWin;
                return regeneratorRuntime.wrap(function _callee55$(_context55) {
                    while (1) {
                        switch (_context55.prev = _context55.next) {
                            case 0:
                                _context55.next = 2;
                                return BiliUserJS.getPlayerWin();

                            case 2:
                                playerWin = _context55.sent;

                                window.m = new BiliMonkey(playerWin);

                                console.warn('sniffDefaultFormat test');
                                _context55.next = 7;
                                return m.sniffDefaultFormat();

                            case 7:
                                console.log(m);

                                console.warn('data race test');
                                m.queryInfo('mp4');
                                console.log(m.queryInfo('mp4'));

                                console.warn('getNonCurrentFormat test');
                                _context55.t0 = console;
                                _context55.next = 15;
                                return m.queryInfo('mp4');

                            case 15:
                                _context55.t1 = _context55.sent;

                                _context55.t0.log.call(_context55.t0, _context55.t1);

                                console.warn('getCurrentFormat test');
                                _context55.t2 = console;
                                _context55.next = 21;
                                return m.queryInfo('flv');

                            case 21:
                                _context55.t3 = _context55.sent;

                                _context55.t2.log.call(_context55.t2, _context55.t3);

                            case 23:
                            case 'end':
                                return _context55.stop();
                        }
                    }
                }, _callee55, _this25);
            }))();
        }
    }, {
        key: 'optionDescriptions',
        get: function get() {
            return [
            // 1. automation
            ['autoDefault', '尝试自动抓取：不会拖慢页面，抓取默认清晰度，但可能抓不到。'], ['autoFLV', '强制自动抓取FLV：会拖慢页面，如果默认清晰度也是超清会更慢，但保证抓到。'], ['autoMP4', '强制自动抓取MP4：会拖慢页面，如果默认清晰度也是高清会更慢，但保证抓到。'],

            // 2. cache
            ['cache', '关标签页不清缓存：保留完全下载好的分段到缓存，忘记另存为也没关系。'], ['partial', '断点续传：点击“取消”保留部分下载的分段到缓存，忘记点击会弹窗确认。'], ['proxy', '用缓存加速播放器：如果缓存里有完全下载好的分段，直接喂给网页播放器，不重新访问网络。小水管利器，播放只需500k流量。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。'],

            // 3. customizing
            ['blocker', '弹幕过滤：在网页播放器里设置的屏蔽词也对下载的弹幕生效。'], ['font', '自定义字体：在网页播放器里设置的字体、大小、加粗、透明度也对下载的弹幕生效。']];
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
                font: true
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
        var _this26 = this;

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
            return _this26.playerWin.removeEventListener('beforeunload', _this26.destroy);
        });
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
            var _ref71 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee56() {
                var _this27 = this;

                var _ref72 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    _ref72$videoRefresh = _ref72.videoRefresh,
                    videoRefresh = _ref72$videoRefresh === undefined ? false : _ref72$videoRefresh;

                return regeneratorRuntime.wrap(function _callee56$(_context56) {
                    while (1) {
                        switch (_context56.prev = _context56.next) {
                            case 0:
                                _context56.next = 2;
                                return this.getPlayerVideo();

                            case 2:
                                this.video = _context56.sent;

                                if (this.option.betabeta) {
                                    _context56.next = 5;
                                    break;
                                }

                                return _context56.abrupt('return', this.getPlayerMenu());

                            case 5:

                                // 3. set up functions that are cid static
                                if (!videoRefresh) {
                                    this.retrieveUserdata();
                                    if (this.option.badgeWatchLater) this.badgeWatchLater();
                                    if (this.option.scroll) this.scrollToPlayer();

                                    if (this.option.series) this.inferNextInSeries();

                                    if (this.option.recommend) this.showRecommendTab();
                                    if (this.option.focus) this.focusOnPlayer();
                                    if (this.option.restorePrevent) this.restorePreventShade();
                                    if (this.option.restoreDanmuku) this.restoreDanmukuSwitch();
                                    if (this.option.restoreSpeed) this.restoreSpeed();
                                    if (this.option.restoreWide) this.restoreWideScreen();
                                    if (this.option.autoResume) this.autoResume();
                                    if (this.option.autoPlay) this.autoPlay();
                                    if (this.option.autoFullScreen) this.autoFullScreen();
                                    if (this.option.limitedKeydown) this.limitedKeydownFullScreenPlay();
                                    this.destroy.addCallback(function () {
                                        return _this27.saveUserdata();
                                    });
                                }

                                // 4. set up functions that are binded to the video DOM
                                if (this.option.dblclick) this.dblclickFullScreen();
                                if (this.option.electric) this.reallocateElectricPanel();
                                if (this.option.oped) this.skipOPED();
                                this.video.addEventListener('emptied', function () {
                                    return _this27.setFunctions({ videoRefresh: true });
                                }, { once: true });

                                // 5. set up functions that require everything to be ready
                                _context56.next = 12;
                                return this.getPlayerMenu();

                            case 12:
                                if (this.option.menuFocus) this.menuFocusOnPlayer();

                                // 6. set up experimental functions
                                if (this.option.speech) top.document.body.addEventListener('click', function (e) {
                                    return e.detail > 2 && _this27.speechRecognition();
                                });

                            case 14:
                            case 'end':
                                return _context56.stop();
                        }
                    }
                }, _callee56, this);
            }));

            function setFunctions() {
                return _ref71.apply(this, arguments);
            }

            return setFunctions;
        }()
    }, {
        key: 'inferNextInSeries',
        value: function () {
            var _ref73 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee57() {
                var title, ep, seriesTitle, epNumber, epSibling, keywords, midParent, mid, vlist;
                return regeneratorRuntime.wrap(function _callee57$(_context57) {
                    while (1) {
                        switch (_context57.prev = _context57.next) {
                            case 0:
                                // 1. find current title
                                title = top.document.getElementsByTagName('h1')[0].textContent.replace(/\(\d+\)$/, '').trim();

                                // 2. find current ep number

                                ep = title.match(/\d+(?=[^\d]*$)/);

                                if (ep) {
                                    _context57.next = 4;
                                    break;
                                }

                                return _context57.abrupt('return', this.series = []);

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

                                midParent = top.document.getElementById('r-info-rank') || top.document.querySelector('.user');

                                if (midParent) {
                                    _context57.next = 11;
                                    break;
                                }

                                return _context57.abrupt('return', this.series = []);

                            case 11:
                                mid = midParent.children[0].href.match(/\d+/)[0];

                                // 7. fetch query

                                _context57.next = 14;
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
                                vlist = _context57.sent;


                                // 8. verify current video exists
                                vlist[0] = vlist[0].filter(function (e) {
                                    return e.title == title;
                                });

                                if (vlist[0][0]) {
                                    _context57.next = 19;
                                    break;
                                }

                                console && console.warn('BiliPolyfill: inferNextInSeries: cannot find current video in mid space');return _context57.abrupt('return', this.series = []);

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

                                return _context57.abrupt('return', this.series);

                            case 23:
                            case 'end':
                                return _context57.stop();
                        }
                    }
                }, _callee57, this);
            }));

            function inferNextInSeries() {
                return _ref73.apply(this, arguments);
            }

            return inferNextInSeries;
        }()
    }, {
        key: 'badgeWatchLater',
        value: function badgeWatchLater() {
            var _this28 = this;

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
                        _this28.destroy.addCallback(function () {
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
            var _this29 = this;

            this.video.addEventListener('dblclick', function () {
                return _this29.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
            });
        }
    }, {
        key: 'scrollToPlayer',
        value: function scrollToPlayer() {
            if (top.scrollY < 200) top.document.getElementById('bofqi').scrollIntoView();
        }
    }, {
        key: 'showRecommendTab',
        value: function showRecommendTab() {
            var h = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-filter-btn-recommend');
            if (h) h.click();
        }
    }, {
        key: 'getCoverImage',
        value: function getCoverImage() {
            // 番剧用原来的方法只能获取到番剧的封面，改用API可以获取到每集的封面
            var _jq = top.window.jQuery;
            var view_url = "https://api.bilibili.com/x/web-interface/view?aid=" + aid;

            try {
                var view_res = _jq.ajax({ url: view_url, async: false });
                var view_json = JSON.parse(view_res.responseText);
                return view_json.data.pic.replace("http://", "https://");
            } catch (e) {
                return null;
            }
        }
    }, {
        key: 'reallocateElectricPanel',
        value: function reallocateElectricPanel() {
            var _this30 = this;

            // 1. autopart == wait => ok
            if (!this.playerWin.localStorage.bilibili_player_settings) return;
            if (!this.playerWin.localStorage.bilibili_player_settings.includes('"autopart":1') && !this.option.electricSkippable) return;

            // 2. wait for electric panel
            this.video.addEventListener('ended', function () {
                setTimeout(function () {
                    // 3. click skip
                    var electricPanel = _this30.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0];
                    if (!electricPanel) return;
                    electricPanel.children[2].click();

                    // 4. but display a fake electric panel
                    electricPanel.style.display = 'block';
                    electricPanel.style.zIndex = 233;

                    // 5. and perform a fake countdown
                    var countdown = 5;
                    var h = setInterval(function () {
                        // 5.1 yield to next part hint
                        if (_this30.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) electricPanel.style.zIndex = '';

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
            var _this31 = this;

            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.preventShade)) this.userdata.restore.preventShade = [];

            // 2. find corresponding option index
            var index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. MUST initialize setting panel before click
            this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseover'));

            // 4. restore if true
            var input = this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0];
            if (this.userdata.restore.preventShade[index] && !input.nextElementSibling.classList.contains('bpui-state-active')) {
                input.click();
            }

            // 5. clean up setting panel
            this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseout'));

            // 6. memorize option
            this.destroy.addCallback(function () {
                _this31.userdata.restore.preventShade[index] = input.nextElementSibling.classList.contains('bpui-state-active');
            });
        }
    }, {
        key: 'restoreDanmukuSwitch',
        value: function restoreDanmukuSwitch() {
            var _this32 = this;

            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.danmukuSwitch)) this.userdata.restore.danmukuSwitch = [];
            if (!Array.isArray(this.userdata.restore.danmukuTopSwitch)) this.userdata.restore.danmukuTopSwitch = [];
            if (!Array.isArray(this.userdata.restore.danmukuBottomSwitch)) this.userdata.restore.danmukuBottomSwitch = [];
            if (!Array.isArray(this.userdata.restore.danmukuScrollSwitch)) this.userdata.restore.danmukuScrollSwitch = [];

            // 2. find corresponding option index
            var index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. MUST initialize setting panel before click
            this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseover'));

            // 4. restore if true
            // 4.1 danmukuSwitch
            var danmukuSwitchDiv = this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0];
            if (this.userdata.restore.danmukuSwitch[index] && !danmukuSwitchDiv.classList.contains('video-state-danmaku-off')) {
                danmukuSwitchDiv.click();
            }

            // 4.2 danmukuTopSwitch danmukuBottomSwitch danmukuScrollSwitch

            var _playerWin$document$g = _slicedToArray(this.playerWin.document.getElementsByClassName('bilibili-player-danmaku-setting-lite-type-list')[0].children, 3),
                danmukuTopSwitchDiv = _playerWin$document$g[0],
                danmukuBottomSwitchDiv = _playerWin$document$g[1],
                danmukuScrollSwitchDiv = _playerWin$document$g[2];

            if (this.userdata.restore.danmukuTopSwitch[index] && !danmukuTopSwitchDiv.classList.contains('disabled')) {
                danmukuTopSwitchDiv.click();
            }
            if (this.userdata.restore.danmukuBottomSwitch[index] && !danmukuBottomSwitchDiv.classList.contains('disabled')) {
                danmukuBottomSwitchDiv.click();
            }
            if (this.userdata.restore.danmukuScrollSwitch[index] && !danmukuScrollSwitchDiv.classList.contains('disabled')) {
                danmukuScrollSwitchDiv.click();
            }

            // 5. clean up setting panel
            this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseout'));

            // 6. memorize final option
            this.destroy.addCallback(function () {
                _this32.userdata.restore.danmukuSwitch[index] = danmukuSwitchDiv.classList.contains('video-state-danmaku-off');
                _this32.userdata.restore.danmukuTopSwitch[index] = danmukuTopSwitchDiv.classList.contains('disabled');
                _this32.userdata.restore.danmukuBottomSwitch[index] = danmukuBottomSwitchDiv.classList.contains('disabled');
                _this32.userdata.restore.danmukuScrollSwitch[index] = danmukuScrollSwitchDiv.classList.contains('disabled');
            });
        }
    }, {
        key: 'restoreSpeed',
        value: function restoreSpeed() {
            var _this33 = this;

            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.speed)) this.userdata.restore.speed = [];

            // 2. find corresponding option index
            var index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. restore if different
            if (this.userdata.restore.speed[index] && this.userdata.restore.speed[index] != this.video.playbackRate) {
                this.video.playbackRate = this.userdata.restore.speed[index];
            }

            // 4. memorize option
            this.destroy.addCallback(function () {
                _this33.userdata.restore.speed[index] = _this33.video.playbackRate;
            });
        }
    }, {
        key: 'restoreWideScreen',
        value: function restoreWideScreen() {
            var _this34 = this;

            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.wideScreen)) this.userdata.restore.wideScreen = [];

            // 2. find corresponding option index
            var index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. restore if different
            var i = this.playerWin.document.getElementsByClassName('bilibili-player-iconfont-widescreen')[0];
            if (this.userdata.restore.wideScreen[index] && !i.classList.contains('icon-24wideon')) {
                i.click();
            }

            // 4. memorize option
            this.destroy.addCallback(function () {
                _this34.userdata.restore.wideScreen[index] = i.classList.contains('icon-24wideon');
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
            var _this35 = this;

            // 1. wait for canplay => wait for resume popup
            var h = function h() {
                // 2. parse resume popup
                var span = _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
                if (!span) return;

                var _span$textContent$spl = span.textContent.split(':'),
                    _span$textContent$spl2 = _slicedToArray(_span$textContent$spl, 2),
                    min = _span$textContent$spl2[0],
                    sec = _span$textContent$spl2[1];

                if (!min || !sec) return;

                // 3. parse last playback progress
                var time = parseInt(min) * 60 + parseInt(sec);

                // 3.1 still far from end => reasonable to resume => click
                if (time < _this35.video.duration - 10) {
                    // 3.1.1 already playing => no need to pause => simply jump
                    if (!_this35.video.paused || _this35.video.autoplay) {
                        _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                    }

                    // 3.1.2 paused => should remain paused after jump => hook video.play
                    else {
                            var play = _this35.video.play;
                            _this35.video.play = function () {
                                return setTimeout(function () {
                                    _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                                    _this35.video.play = play;
                                }, 0);
                            };
                            _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                        }
                }

                // 3.2 near end => silent popup
                else {
                        _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-close').click();
                        _this35.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom').children[0].style.visibility = 'hidden';
                    }
            };
            this.video.addEventListener('canplay', h, { once: true });
            setTimeout(function () {
                return _this35.video && _this35.video.removeEventListener && _this35.video.removeEventListener('canplay', h);
            }, 3000);
        }
    }, {
        key: 'autoPlay',
        value: function autoPlay() {
            var _this36 = this;

            this.video.autoplay = true;
            setTimeout(function () {
                if (_this36.video.paused) _this36.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
            }, 0);
        }
    }, {
        key: 'autoFullScreen',
        value: function autoFullScreen() {
            if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
        }
    }, {
        key: 'getCollectionId',
        value: function getCollectionId() {
            return (top.location.pathname.match(/av\d+/) || top.location.hash.match(/av\d+/) || top.document.querySelector('div.bangumi-info a').href).toString();
        }
    }, {
        key: 'markOPEDPosition',
        value: function markOPEDPosition(index) {
            var collectionId = this.getCollectionId();
            if (!Array.isArray(this.userdata.oped[collectionId])) this.userdata.oped[collectionId] = [];
            this.userdata.oped[collectionId][index] = this.video.currentTime;
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
            var _this37 = this;

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
                    if (_this37.video.currentTime >= _this37.userdata.oped[collectionId][1] - 1) {
                        _this37.video.removeEventListener('timeupdate', h);
                    } else {
                        _this37.video.currentTime = _this37.userdata.oped[collectionId][1];
                        _this37.hintInfo('BiliPolyfill: 已跳过片头');
                    }
                };
                this.video.addEventListener('timeupdate', h);
            }

            // 3. | <- play -> | oped[collectionId][0] <- opening -> oped[collectionId][1] | <- play --
            if (this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
                var _h = function _h() {
                    if (_this37.video.currentTime >= _this37.userdata.oped[collectionId][1] - 1) {
                        _this37.video.removeEventListener('timeupdate', _h);
                    } else if (_this37.video.currentTime > _this37.userdata.oped[collectionId][0]) {
                        _this37.video.currentTime = _this37.userdata.oped[collectionId][1];
                        _this37.hintInfo('BiliPolyfill: 已跳过片头');
                    }
                };
                this.video.addEventListener('timeupdate', _h);
            }

            // 4. -- play -> | oped[collectionId][2] <- ending -> end |
            if (this.userdata.oped[collectionId][2] && !this.userdata.oped[collectionId][3]) {
                var _h2 = function _h2() {
                    if (_this37.video.currentTime >= _this37.video.duration - 1) {
                        _this37.video.removeEventListener('timeupdate', _h2);
                    } else if (_this37.video.currentTime > _this37.userdata.oped[collectionId][2]) {
                        _this37.video.currentTime = _this37.video.duration;
                        _this37.hintInfo('BiliPolyfill: 已跳过片尾');
                    }
                };
                this.video.addEventListener('timeupdate', _h2);
            }

            // 5.-- play -> | oped[collectionId][2] <- ending -> oped[collectionId][3] | <- play -> end |
            if (this.userdata.oped[collectionId][2] && this.userdata.oped[collectionId][3]) {
                var _h3 = function _h3() {
                    if (_this37.video.currentTime >= _this37.userdata.oped[collectionId][3] - 1) {
                        _this37.video.removeEventListener('timeupdate', _h3);
                    } else if (_this37.video.currentTime > _this37.userdata.oped[collectionId][2]) {
                        _this37.video.currentTime = _this37.userdata.oped[collectionId][3];
                        _this37.hintInfo('BiliPolyfill: 已跳过片尾');
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
        }
    }, {
        key: 'focusOnPlayer',
        value: function focusOnPlayer() {
            this.playerWin.document.getElementsByClassName('bilibili-player-video-progress')[0].click();
        }
    }, {
        key: 'menuFocusOnPlayer',
        value: function menuFocusOnPlayer() {
            var _this38 = this;

            this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0].addEventListener('click', function () {
                return setTimeout(function () {
                    return _this38.focusOnPlayer();
                }, 0);
            });
        }
    }, {
        key: 'limitedKeydownFullScreenPlay',
        value: function limitedKeydownFullScreenPlay() {
            var _this39 = this;

            // 1. listen for any user guesture
            var h = function h(e) {
                // 2. not real user guesture => do nothing
                if (!e.isTrusted) return;

                // 3. key down is Enter => full screen play
                if (e.key == 'Enter') {
                    // 3.1 full screen
                    if (_this39.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                        _this39.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                    }

                    // 3.2 play
                    if (_this39.video.paused) {
                        if (_this39.video.readyState) {
                            _this39.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        } else {
                            _this39.video.addEventListener('canplay', function () {
                                _this39.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
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
            var _this40 = this;

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
                        if (_this40.video.paused) _this40.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        _this40.hintInfo('BiliPolyfill: \u8BED\u97F3:\u64AD\u653E');
                        break;
                    case '暂停':
                        if (!_this40.video.paused) _this40.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        _this40.hintInfo('BiliPolyfill: \u8BED\u97F3:\u6682\u505C');
                        break;
                    case '全屏':
                        _this40.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                        _this40.hintInfo('BiliPolyfill: \u8BED\u97F3:\u5168\u5C4F');
                        break;
                    case '关闭':
                        top.close();
                        break;
                    case '加速':
                        _this40.setVideoSpeed(2);
                        _this40.hintInfo('BiliPolyfill: \u8BED\u97F3:\u52A0\u901F');
                        break;
                    case '减速':
                        _this40.setVideoSpeed(0.5);
                        _this40.hintInfo('BiliPolyfill: \u8BED\u97F3:\u51CF\u901F');
                        break;
                    case '下一集':
                        _this40.video.dispatchEvent(new Event('ended'));
                    default:
                        _this40.hintInfo('BiliPolyfill: \u8BED\u97F3:"' + transcript + '"\uFF1F');
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
            var _ref74 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee58() {
                var _this41 = this;

                return regeneratorRuntime.wrap(function _callee58$(_context58) {
                    while (1) {
                        switch (_context58.prev = _context58.next) {
                            case 0:
                                if (!this.playerWin.document.getElementsByTagName('video').length) {
                                    _context58.next = 4;
                                    break;
                                }

                                return _context58.abrupt('return', this.video = this.playerWin.document.getElementsByTagName('video')[0]);

                            case 4:
                                return _context58.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (_this41.playerWin.document.getElementsByTagName('video').length) {
                                            observer.disconnect();
                                            resolve(_this41.video = _this41.playerWin.document.getElementsByTagName('video')[0]);
                                        }
                                    });
                                    observer.observe(_this41.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                }));

                            case 5:
                            case 'end':
                                return _context58.stop();
                        }
                    }
                }, _callee58, this);
            }));

            function getPlayerVideo() {
                return _ref74.apply(this, arguments);
            }

            return getPlayerVideo;
        }()
    }, {
        key: 'getPlayerMenu',
        value: function () {
            var _ref75 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee59() {
                var _this42 = this;

                return regeneratorRuntime.wrap(function _callee59$(_context59) {
                    while (1) {
                        switch (_context59.prev = _context59.next) {
                            case 0:
                                if (!this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                                    _context59.next = 4;
                                    break;
                                }

                                return _context59.abrupt('return', this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);

                            case 4:
                                return _context59.abrupt('return', new Promise(function (resolve) {
                                    var observer = new MutationObserver(function () {
                                        if (_this42.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                                            observer.disconnect();
                                            resolve(_this42.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);
                                        }
                                    });
                                    observer.observe(_this42.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                }));

                            case 5:
                            case 'end':
                                return _context59.stop();
                        }
                    }
                }, _callee59, this);
            }));

            function getPlayerMenu() {
                return _ref75.apply(this, arguments);
            }

            return getPlayerMenu;
        }()
    }], [{
        key: 'openMinimizedPlayer',
        value: function () {
            var _ref76 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee60() {
                var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { cid: top.cid, aid: top.aid, playerWin: top };
                var miniPlayerWin, res, playerDiv, hook;
                return regeneratorRuntime.wrap(function _callee60$(_context60) {
                    while (1) {
                        switch (_context60.prev = _context60.next) {
                            case 0:
                                if (option) {
                                    _context60.next = 2;
                                    break;
                                }

                                throw 'usage: openMinimizedPlayer({cid[, aid]})';

                            case 2:
                                if (option.cid) {
                                    _context60.next = 4;
                                    break;
                                }

                                throw 'player init: cid missing';

                            case 4:
                                if (!option.aid) option.aid = top.aid;
                                if (!option.playerWin) option.playerWin = top;

                                // 2. open a new window
                                miniPlayerWin = top.open('//www.bilibili.com/blackboard/html5player.html?cid=' + option.cid + '&aid=' + option.aid + '&crossDomain=' + (top.document.domain != 'www.bilibili.com' ? 'true' : ''), undefined, ' ');

                                // 3. bangumi => request referrer must match => hook response of current page

                                _context60.t0 = top.location.href.includes('bangumi');

                                if (!_context60.t0) {
                                    _context60.next = 12;
                                    break;
                                }

                                _context60.next = 11;
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
                                _context60.t0 = _context60.sent;

                            case 12:
                                res = _context60.t0;
                                _context60.next = 15;
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
                                    _context60.next = 19;
                                    break;
                                }

                                console.warn('openMinimizedPlayer: document load timeout');return _context60.abrupt('return');

                            case 19:
                                if (!res) {
                                    _context60.next = 22;
                                    break;
                                }

                                _context60.next = 22;
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
                                _context60.next = 24;
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
                                return _context60.stop();
                        }
                    }
                }, _callee60, this);
            }));

            function openMinimizedPlayer() {
                return _ref76.apply(this, arguments);
            }

            return openMinimizedPlayer;
        }()
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
            ['scroll', '自动滚动到播放器'], ['focus', '自动聚焦到播放器(新页面直接按空格会播放而不是向下滚动)'], ['menuFocus', '关闭菜单后聚焦到播放器'], ['restorePrevent', '记住防挡字幕'], ['restoreDanmuku', '记住弹幕开关(顶端/底端/滚动/全部)'], ['restoreSpeed', '记住播放速度'], ['restoreWide', '记住宽屏'], ['autoResume', '自动跳转上次看到'], ['autoPlay', '自动播放'], ['autoFullScreen', '自动全屏'], ['oped', '标记后自动跳OP/ED'], ['series', '尝试自动找上下集'],

            // 3. interaction
            ['limitedKeydown', '首次回车键可全屏自动播放'], ['dblclick', '双击全屏'],

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
                focus: true,
                menuFocus: true,
                restorePrevent: true,
                restoreDanmuku: true,
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
            var _ref77 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee61(urls) {
                var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : top.location.origin;
                var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'http://127.0.0.1:6800/jsonrpc';
                var h, body, method;
                return regeneratorRuntime.wrap(function _callee61$(_context61) {
                    while (1) {
                        switch (_context61.prev = _context61.next) {
                            case 0:
                                // 1. prepare body
                                h = 'referer';
                                body = JSON.stringify(urls.map(function (url, id) {
                                    return {
                                        id: id,
                                        jsonrpc: 2,
                                        method: "aria2.addUri",
                                        params: [[url], _defineProperty({}, h, referrer)]
                                    };
                                }));

                                // 2. send to jsonrpc target

                                method = 'POST';

                            case 3:
                                if (!1) {
                                    _context61.next = 19;
                                    break;
                                }

                                _context61.prev = 4;
                                _context61.next = 7;
                                return fetch(target, { method: method, body: body });

                            case 7:
                                _context61.next = 9;
                                return _context61.sent.json();

                            case 9:
                                return _context61.abrupt('return', _context61.sent);

                            case 12:
                                _context61.prev = 12;
                                _context61.t0 = _context61['catch'](4);

                                target = top.prompt('Aria2 connection failed. Please provide a valid server address:', target);

                                if (target) {
                                    _context61.next = 17;
                                    break;
                                }

                                return _context61.abrupt('return', null);

                            case 17:
                                _context61.next = 3;
                                break;

                            case 19:
                            case 'end':
                                return _context61.stop();
                        }
                    }
                }, _callee61, this, [[4, 12]]);
            }));

            function sendToAria2RPC(_x73) {
                return _ref77.apply(this, arguments);
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
            // debug for scrpit data tag
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

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = flvs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var flv = _step4.value;

                    var bts = duration * 1000;
                    basetimestamp[0] = lasttimestamp[0];
                    basetimestamp[1] = lasttimestamp[1];
                    bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
                    var foundDuration = 0;
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = flv.tags[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var tag = _step5.value;

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
                        _didIteratorError5 = true;
                        _iteratorError5 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                _iterator5.return();
                            }
                        } finally {
                            if (_didIteratorError5) {
                                throw _iteratorError5;
                            }
                        }
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

            durationDataView.setFloat64(0, duration);

            return new Blob(blobParts);
        }
    }, {
        key: 'mergeBlobs',
        value: function () {
            var _ref79 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee62(blobs) {
                var _this44 = this;

                var ret, basetimestamp, lasttimestamp, duration, durationDataView, _loop, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, blob;

                return regeneratorRuntime.wrap(function _callee62$(_context63) {
                    while (1) {
                        switch (_context63.prev = _context63.next) {
                            case 0:
                                if (!(blobs.length < 1)) {
                                    _context63.next = 2;
                                    break;
                                }

                                throw 'Usage: FLV.mergeBlobs([blobs])';

                            case 2:
                                ret = [];
                                basetimestamp = [0, 0];
                                lasttimestamp = [0, 0];
                                duration = 0.0;
                                durationDataView = void 0;
                                _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop(blob) {
                                    var bts, foundDuration, flv, modifiedMediaTags, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, tag, _tag$getDurationAndVi2;

                                    return regeneratorRuntime.wrap(function _loop$(_context62) {
                                        while (1) {
                                            switch (_context62.prev = _context62.next) {
                                                case 0:
                                                    bts = duration * 1000;

                                                    basetimestamp[0] = lasttimestamp[0];
                                                    basetimestamp[1] = lasttimestamp[1];
                                                    bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
                                                    foundDuration = 0;
                                                    _context62.next = 7;
                                                    return new Promise(function (resolve, reject) {
                                                        var fr = new FileReader();
                                                        fr.onload = function () {
                                                            return resolve(new FLV(new TwentyFourDataView(fr.result)));
                                                        };
                                                        fr.readAsArrayBuffer(blob);
                                                        fr.onerror = reject;
                                                    });

                                                case 7:
                                                    flv = _context62.sent;
                                                    modifiedMediaTags = [];
                                                    _iteratorNormalCompletion7 = true;
                                                    _didIteratorError7 = false;
                                                    _iteratorError7 = undefined;
                                                    _context62.prev = 12;

                                                    for (_iterator7 = flv.tags[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                                        tag = _step7.value;

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
                                                    _context62.next = 20;
                                                    break;

                                                case 16:
                                                    _context62.prev = 16;
                                                    _context62.t0 = _context62['catch'](12);
                                                    _didIteratorError7 = true;
                                                    _iteratorError7 = _context62.t0;

                                                case 20:
                                                    _context62.prev = 20;
                                                    _context62.prev = 21;

                                                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                                        _iterator7.return();
                                                    }

                                                case 23:
                                                    _context62.prev = 23;

                                                    if (!_didIteratorError7) {
                                                        _context62.next = 26;
                                                        break;
                                                    }

                                                    throw _iteratorError7;

                                                case 26:
                                                    return _context62.finish(23);

                                                case 27:
                                                    return _context62.finish(20);

                                                case 28:
                                                    ret.push(new Blob(modifiedMediaTags));

                                                case 29:
                                                case 'end':
                                                    return _context62.stop();
                                            }
                                        }
                                    }, _loop, _this44, [[12, 16, 20, 28], [21,, 23, 27]]);
                                });
                                _iteratorNormalCompletion6 = true;
                                _didIteratorError6 = false;
                                _iteratorError6 = undefined;
                                _context63.prev = 11;
                                _iterator6 = blobs[Symbol.iterator]();

                            case 13:
                                if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                                    _context63.next = 19;
                                    break;
                                }

                                blob = _step6.value;
                                return _context63.delegateYield(_loop(blob), 't0', 16);

                            case 16:
                                _iteratorNormalCompletion6 = true;
                                _context63.next = 13;
                                break;

                            case 19:
                                _context63.next = 25;
                                break;

                            case 21:
                                _context63.prev = 21;
                                _context63.t1 = _context63['catch'](11);
                                _didIteratorError6 = true;
                                _iteratorError6 = _context63.t1;

                            case 25:
                                _context63.prev = 25;
                                _context63.prev = 26;

                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }

                            case 28:
                                _context63.prev = 28;

                                if (!_didIteratorError6) {
                                    _context63.next = 31;
                                    break;
                                }

                                throw _iteratorError6;

                            case 31:
                                return _context63.finish(28);

                            case 32:
                                return _context63.finish(25);

                            case 33:
                                durationDataView.setFloat64(0, duration);

                                return _context63.abrupt('return', new Blob(ret));

                            case 35:
                            case 'end':
                                return _context63.stop();
                        }
                    }
                }, _callee62, this, [[11, 21, 25, 33], [26,, 28, 32]]);
            }));

            function mergeBlobs(_x77) {
                return _ref79.apply(this, arguments);
            }

            return mergeBlobs;
        }()
    }]);

    return FLV;
}();

var embeddedHTML = '<html>\n\n<body>\n    <p>\n        \u52A0\u8F7D\u6587\u4EF6\u2026\u2026 loading files...\n        <progress value="0" max="100" id="fileProgress"></progress>\n    </p>\n    <p>\n        \u6784\u5EFAmkv\u2026\u2026 building mkv...\n        <progress value="0" max="100" id="mkvProgress"></progress>\n    </p>\n    <p>\n        <a id="a" download="merged.mkv">merged.mkv</a>\n    </p>\n    <footer>\n        author qli5 &lt;goodlq11[at](163|gmail).com&gt;\n    </footer>\n    <script>\nvar FLVASS2MKV = (function () {\n    \'use strict\';\n\n    /***\n     * Copyright (C) 2018 Qli5. All Rights Reserved.\n     * \n     * @author qli5 <goodlq11[at](163|gmail).com>\n     * \n     * This Source Code Form is subject to the terms of the Mozilla Public\n     * License, v. 2.0. If a copy of the MPL was not distributed with this\n     * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n    */\n\n    const _navigator = typeof navigator === \'object\' && navigator || { userAgent: \'chrome\' };\n\n    const _Blob = typeof Blob === \'function\' && Blob || class {\n        constructor(array) {\n            return Buffer.concat(array.map(Buffer.from.bind(Buffer)));\n        }\n    };\n\n    const _TextEncoder = typeof TextEncoder === \'function\' && TextEncoder || class {\n        /**\n         * @param {string} chunk \n         * @returns {Uint8Array}\n         */\n        encode(chunk) {\n            return Buffer.from(chunk, \'utf-8\');\n        }\n    };\n\n    const _TextDecoder = typeof TextDecoder === \'function\' && TextDecoder || class extends require(\'string_decoder\').StringDecoder {\n        /**\n         * @param {ArrayBuffer} chunk \n         * @returns {string}\n         */\n        decode(chunk) {\n            return this.end(Buffer.from(chunk));\n        }\n    };\n\n    /***\n     * The FLV demuxer is from flv.js\n     * \n     * Copyright (C) 2016 Bilibili. All Rights Reserved.\n     *\n     * @author zheng qian <xqq@xqq.im>\n     *\n     * Licensed under the Apache License, Version 2.0 (the "License");\n     * you may not use this file except in compliance with the License.\n     * You may obtain a copy of the License at\n     *\n     *     http://www.apache.org/licenses/LICENSE-2.0\n     *\n     * Unless required by applicable law or agreed to in writing, software\n     * distributed under the License is distributed on an "AS IS" BASIS,\n     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n     * See the License for the specific language governing permissions and\n     * limitations under the License.\n     */\n\n    // import FLVDemuxer from \'flv.js/src/demux/flv-demuxer.js\';\n    // ..import Log from \'../utils/logger.js\';\n    const Log = {\n        e: console.error.bind(console),\n        w: console.warn.bind(console),\n        i: console.log.bind(console),\n        v: console.log.bind(console),\n    };\n\n    // ..import AMF from \'./amf-parser.js\';\n    // ....import Log from \'../utils/logger.js\';\n    // ....import decodeUTF8 from \'../utils/utf8-conv.js\';\n    function checkContinuation(uint8array, start, checkLength) {\n        let array = uint8array;\n        if (start + checkLength < array.length) {\n            while (checkLength--) {\n                if ((array[++start] & 0xC0) !== 0x80)\n                    return false;\n            }\n            return true;\n        } else {\n            return false;\n        }\n    }\n\n    function decodeUTF8(uint8array) {\n        let out = [];\n        let input = uint8array;\n        let i = 0;\n        let length = uint8array.length;\n\n        while (i < length) {\n            if (input[i] < 0x80) {\n                out.push(String.fromCharCode(input[i]));\n                ++i;\n                continue;\n            } else if (input[i] < 0xC0) {\n                // fallthrough\n            } else if (input[i] < 0xE0) {\n                if (checkContinuation(input, i, 1)) {\n                    let ucs4 = (input[i] & 0x1F) << 6 | (input[i + 1] & 0x3F);\n                    if (ucs4 >= 0x80) {\n                        out.push(String.fromCharCode(ucs4 & 0xFFFF));\n                        i += 2;\n                        continue;\n                    }\n                }\n            } else if (input[i] < 0xF0) {\n                if (checkContinuation(input, i, 2)) {\n                    let ucs4 = (input[i] & 0xF) << 12 | (input[i + 1] & 0x3F) << 6 | input[i + 2] & 0x3F;\n                    if (ucs4 >= 0x800 && (ucs4 & 0xF800) !== 0xD800) {\n                        out.push(String.fromCharCode(ucs4 & 0xFFFF));\n                        i += 3;\n                        continue;\n                    }\n                }\n            } else if (input[i] < 0xF8) {\n                if (checkContinuation(input, i, 3)) {\n                    let ucs4 = (input[i] & 0x7) << 18 | (input[i + 1] & 0x3F) << 12\n                        | (input[i + 2] & 0x3F) << 6 | (input[i + 3] & 0x3F);\n                    if (ucs4 > 0x10000 && ucs4 < 0x110000) {\n                        ucs4 -= 0x10000;\n                        out.push(String.fromCharCode((ucs4 >>> 10) | 0xD800));\n                        out.push(String.fromCharCode((ucs4 & 0x3FF) | 0xDC00));\n                        i += 4;\n                        continue;\n                    }\n                }\n            }\n            out.push(String.fromCharCode(0xFFFD));\n            ++i;\n        }\n\n        return out.join(\'\');\n    }\n\n    // ....import {IllegalStateException} from \'../utils/exception.js\';\n    class IllegalStateException extends Error { }\n\n    let le = (function () {\n        let buf = new ArrayBuffer(2);\n        (new DataView(buf)).setInt16(0, 256, true);  // little-endian write\n        return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE\n    })();\n\n    class AMF {\n\n        static parseScriptData(arrayBuffer, dataOffset, dataSize) {\n            let data = {};\n\n            try {\n                let name = AMF.parseValue(arrayBuffer, dataOffset, dataSize);\n                let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);\n\n                data[name.data] = value.data;\n            } catch (e) {\n                Log.e(\'AMF\', e.toString());\n            }\n\n            return data;\n        }\n\n        static parseObject(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 3) {\n                throw new IllegalStateException(\'Data not enough when parse ScriptDataObject\');\n            }\n            let name = AMF.parseString(arrayBuffer, dataOffset, dataSize);\n            let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);\n            let isObjectEnd = value.objectEnd;\n\n            return {\n                data: {\n                    name: name.data,\n                    value: value.data\n                },\n                size: name.size + value.size,\n                objectEnd: isObjectEnd\n            };\n        }\n\n        static parseVariable(arrayBuffer, dataOffset, dataSize) {\n            return AMF.parseObject(arrayBuffer, dataOffset, dataSize);\n        }\n\n        static parseString(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 2) {\n                throw new IllegalStateException(\'Data not enough when parse String\');\n            }\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n            let length = v.getUint16(0, !le);\n\n            let str;\n            if (length > 0) {\n                str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 2, length));\n            } else {\n                str = \'\';\n            }\n\n            return {\n                data: str,\n                size: 2 + length\n            };\n        }\n\n        static parseLongString(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 4) {\n                throw new IllegalStateException(\'Data not enough when parse LongString\');\n            }\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n            let length = v.getUint32(0, !le);\n\n            let str;\n            if (length > 0) {\n                str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 4, length));\n            } else {\n                str = \'\';\n            }\n\n            return {\n                data: str,\n                size: 4 + length\n            };\n        }\n\n        static parseDate(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 10) {\n                throw new IllegalStateException(\'Data size invalid when parse Date\');\n            }\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n            let timestamp = v.getFloat64(0, !le);\n            let localTimeOffset = v.getInt16(8, !le);\n            timestamp += localTimeOffset * 60 * 1000;  // get UTC time\n\n            return {\n                data: new Date(timestamp),\n                size: 8 + 2\n            };\n        }\n\n        static parseValue(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 1) {\n                throw new IllegalStateException(\'Data not enough when parse Value\');\n            }\n\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            let offset = 1;\n            let type = v.getUint8(0);\n            let value;\n            let objectEnd = false;\n\n            try {\n                switch (type) {\n                    case 0:  // Number(Double) type\n                        value = v.getFloat64(1, !le);\n                        offset += 8;\n                        break;\n                    case 1: {  // Boolean type\n                        let b = v.getUint8(1);\n                        value = b ? true : false;\n                        offset += 1;\n                        break;\n                    }\n                    case 2: {  // String type\n                        let amfstr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);\n                        value = amfstr.data;\n                        offset += amfstr.size;\n                        break;\n                    }\n                    case 3: { // Object(s) type\n                        value = {};\n                        let terminal = 0;  // workaround for malformed Objects which has missing ScriptDataObjectEnd\n                        if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {\n                            terminal = 3;\n                        }\n                        while (offset < dataSize - 4) {  // 4 === type(UI8) + ScriptDataObjectEnd(UI24)\n                            let amfobj = AMF.parseObject(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);\n                            if (amfobj.objectEnd)\n                                break;\n                            value[amfobj.data.name] = amfobj.data.value;\n                            offset += amfobj.size;\n                        }\n                        if (offset <= dataSize - 3) {\n                            let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;\n                            if (marker === 9) {\n                                offset += 3;\n                            }\n                        }\n                        break;\n                    }\n                    case 8: { // ECMA array type (Mixed array)\n                        value = {};\n                        offset += 4;  // ECMAArrayLength(UI32)\n                        let terminal = 0;  // workaround for malformed MixedArrays which has missing ScriptDataObjectEnd\n                        if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {\n                            terminal = 3;\n                        }\n                        while (offset < dataSize - 8) {  // 8 === type(UI8) + ECMAArrayLength(UI32) + ScriptDataVariableEnd(UI24)\n                            let amfvar = AMF.parseVariable(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);\n                            if (amfvar.objectEnd)\n                                break;\n                            value[amfvar.data.name] = amfvar.data.value;\n                            offset += amfvar.size;\n                        }\n                        if (offset <= dataSize - 3) {\n                            let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;\n                            if (marker === 9) {\n                                offset += 3;\n                            }\n                        }\n                        break;\n                    }\n                    case 9:  // ScriptDataObjectEnd\n                        value = undefined;\n                        offset = 1;\n                        objectEnd = true;\n                        break;\n                    case 10: {  // Strict array type\n                        // ScriptDataValue[n]. NOTE: according to video_file_format_spec_v10_1.pdf\n                        value = [];\n                        let strictArrayLength = v.getUint32(1, !le);\n                        offset += 4;\n                        for (let i = 0; i < strictArrayLength; i++) {\n                            let val = AMF.parseValue(arrayBuffer, dataOffset + offset, dataSize - offset);\n                            value.push(val.data);\n                            offset += val.size;\n                        }\n                        break;\n                    }\n                    case 11: {  // Date type\n                        let date = AMF.parseDate(arrayBuffer, dataOffset + 1, dataSize - 1);\n                        value = date.data;\n                        offset += date.size;\n                        break;\n                    }\n                    case 12: {  // Long string type\n                        let amfLongStr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);\n                        value = amfLongStr.data;\n                        offset += amfLongStr.size;\n                        break;\n                    }\n                    default:\n                        // ignore and skip\n                        offset = dataSize;\n                        Log.w(\'AMF\', \'Unsupported AMF value type \' + type);\n                }\n            } catch (e) {\n                Log.e(\'AMF\', e.toString());\n            }\n\n            return {\n                data: value,\n                size: offset,\n                objectEnd: objectEnd\n            };\n        }\n\n    }\n\n    // ..import SPSParser from \'./sps-parser.js\';\n    // ....import ExpGolomb from \'./exp-golomb.js\';\n    // ......import {IllegalStateException, InvalidArgumentException} from \'../utils/exception.js\';\n    class InvalidArgumentException extends Error { }\n\n    class ExpGolomb {\n\n        constructor(uint8array) {\n            this.TAG = \'ExpGolomb\';\n\n            this._buffer = uint8array;\n            this._buffer_index = 0;\n            this._total_bytes = uint8array.byteLength;\n            this._total_bits = uint8array.byteLength * 8;\n            this._current_word = 0;\n            this._current_word_bits_left = 0;\n        }\n\n        destroy() {\n            this._buffer = null;\n        }\n\n        _fillCurrentWord() {\n            let buffer_bytes_left = this._total_bytes - this._buffer_index;\n            if (buffer_bytes_left <= 0)\n                throw new IllegalStateException(\'ExpGolomb: _fillCurrentWord() but no bytes available\');\n\n            let bytes_read = Math.min(4, buffer_bytes_left);\n            let word = new Uint8Array(4);\n            word.set(this._buffer.subarray(this._buffer_index, this._buffer_index + bytes_read));\n            this._current_word = new DataView(word.buffer).getUint32(0, false);\n\n            this._buffer_index += bytes_read;\n            this._current_word_bits_left = bytes_read * 8;\n        }\n\n        readBits(bits) {\n            if (bits > 32)\n                throw new InvalidArgumentException(\'ExpGolomb: readBits() bits exceeded max 32bits!\');\n\n            if (bits <= this._current_word_bits_left) {\n                let result = this._current_word >>> (32 - bits);\n                this._current_word <<= bits;\n                this._current_word_bits_left -= bits;\n                return result;\n            }\n\n            let result = this._current_word_bits_left ? this._current_word : 0;\n            result = result >>> (32 - this._current_word_bits_left);\n            let bits_need_left = bits - this._current_word_bits_left;\n\n            this._fillCurrentWord();\n            let bits_read_next = Math.min(bits_need_left, this._current_word_bits_left);\n\n            let result2 = this._current_word >>> (32 - bits_read_next);\n            this._current_word <<= bits_read_next;\n            this._current_word_bits_left -= bits_read_next;\n\n            result = (result << bits_read_next) | result2;\n            return result;\n        }\n\n        readBool() {\n            return this.readBits(1) === 1;\n        }\n\n        readByte() {\n            return this.readBits(8);\n        }\n\n        _skipLeadingZero() {\n            let zero_count;\n            for (zero_count = 0; zero_count < this._current_word_bits_left; zero_count++) {\n                if (0 !== (this._current_word & (0x80000000 >>> zero_count))) {\n                    this._current_word <<= zero_count;\n                    this._current_word_bits_left -= zero_count;\n                    return zero_count;\n                }\n            }\n            this._fillCurrentWord();\n            return zero_count + this._skipLeadingZero();\n        }\n\n        readUEG() {  // unsigned exponential golomb\n            let leading_zeros = this._skipLeadingZero();\n            return this.readBits(leading_zeros + 1) - 1;\n        }\n\n        readSEG() {  // signed exponential golomb\n            let value = this.readUEG();\n            if (value & 0x01) {\n                return (value + 1) >>> 1;\n            } else {\n                return -1 * (value >>> 1);\n            }\n        }\n\n    }\n\n    class SPSParser {\n\n        static _ebsp2rbsp(uint8array) {\n            let src = uint8array;\n            let src_length = src.byteLength;\n            let dst = new Uint8Array(src_length);\n            let dst_idx = 0;\n\n            for (let i = 0; i < src_length; i++) {\n                if (i >= 2) {\n                    // Unescape: Skip 0x03 after 00 00\n                    if (src[i] === 0x03 && src[i - 1] === 0x00 && src[i - 2] === 0x00) {\n                        continue;\n                    }\n                }\n                dst[dst_idx] = src[i];\n                dst_idx++;\n            }\n\n            return new Uint8Array(dst.buffer, 0, dst_idx);\n        }\n\n        static parseSPS(uint8array) {\n            let rbsp = SPSParser._ebsp2rbsp(uint8array);\n            let gb = new ExpGolomb(rbsp);\n\n            gb.readByte();\n            let profile_idc = gb.readByte();  // profile_idc\n            gb.readByte();  // constraint_set_flags[5] + reserved_zero[3]\n            let level_idc = gb.readByte();  // level_idc\n            gb.readUEG();  // seq_parameter_set_id\n\n            let profile_string = SPSParser.getProfileString(profile_idc);\n            let level_string = SPSParser.getLevelString(level_idc);\n            let chroma_format_idc = 1;\n            let chroma_format = 420;\n            let chroma_format_table = [0, 420, 422, 444];\n            let bit_depth = 8;\n\n            if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 ||\n                profile_idc === 244 || profile_idc === 44 || profile_idc === 83 ||\n                profile_idc === 86 || profile_idc === 118 || profile_idc === 128 ||\n                profile_idc === 138 || profile_idc === 144) {\n\n                chroma_format_idc = gb.readUEG();\n                if (chroma_format_idc === 3) {\n                    gb.readBits(1);  // separate_colour_plane_flag\n                }\n                if (chroma_format_idc <= 3) {\n                    chroma_format = chroma_format_table[chroma_format_idc];\n                }\n\n                bit_depth = gb.readUEG() + 8;  // bit_depth_luma_minus8\n                gb.readUEG();  // bit_depth_chroma_minus8\n                gb.readBits(1);  // qpprime_y_zero_transform_bypass_flag\n                if (gb.readBool()) {  // seq_scaling_matrix_present_flag\n                    let scaling_list_count = (chroma_format_idc !== 3) ? 8 : 12;\n                    for (let i = 0; i < scaling_list_count; i++) {\n                        if (gb.readBool()) {  // seq_scaling_list_present_flag\n                            if (i < 6) {\n                                SPSParser._skipScalingList(gb, 16);\n                            } else {\n                                SPSParser._skipScalingList(gb, 64);\n                            }\n                        }\n                    }\n                }\n            }\n            gb.readUEG();  // log2_max_frame_num_minus4\n            let pic_order_cnt_type = gb.readUEG();\n            if (pic_order_cnt_type === 0) {\n                gb.readUEG();  // log2_max_pic_order_cnt_lsb_minus_4\n            } else if (pic_order_cnt_type === 1) {\n                gb.readBits(1);  // delta_pic_order_always_zero_flag\n                gb.readSEG();  // offset_for_non_ref_pic\n                gb.readSEG();  // offset_for_top_to_bottom_field\n                let num_ref_frames_in_pic_order_cnt_cycle = gb.readUEG();\n                for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i++) {\n                    gb.readSEG();  // offset_for_ref_frame\n                }\n            }\n            gb.readUEG();  // max_num_ref_frames\n            gb.readBits(1);  // gaps_in_frame_num_value_allowed_flag\n\n            let pic_width_in_mbs_minus1 = gb.readUEG();\n            let pic_height_in_map_units_minus1 = gb.readUEG();\n\n            let frame_mbs_only_flag = gb.readBits(1);\n            if (frame_mbs_only_flag === 0) {\n                gb.readBits(1);  // mb_adaptive_frame_field_flag\n            }\n            gb.readBits(1);  // direct_8x8_inference_flag\n\n            let frame_crop_left_offset = 0;\n            let frame_crop_right_offset = 0;\n            let frame_crop_top_offset = 0;\n            let frame_crop_bottom_offset = 0;\n\n            let frame_cropping_flag = gb.readBool();\n            if (frame_cropping_flag) {\n                frame_crop_left_offset = gb.readUEG();\n                frame_crop_right_offset = gb.readUEG();\n                frame_crop_top_offset = gb.readUEG();\n                frame_crop_bottom_offset = gb.readUEG();\n            }\n\n            let sar_width = 1, sar_height = 1;\n            let fps = 0, fps_fixed = true, fps_num = 0, fps_den = 0;\n\n            let vui_parameters_present_flag = gb.readBool();\n            if (vui_parameters_present_flag) {\n                if (gb.readBool()) {  // aspect_ratio_info_present_flag\n                    let aspect_ratio_idc = gb.readByte();\n                    let sar_w_table = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2];\n                    let sar_h_table = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33, 99, 3, 2, 1];\n\n                    if (aspect_ratio_idc > 0 && aspect_ratio_idc < 16) {\n                        sar_width = sar_w_table[aspect_ratio_idc - 1];\n                        sar_height = sar_h_table[aspect_ratio_idc - 1];\n                    } else if (aspect_ratio_idc === 255) {\n                        sar_width = gb.readByte() << 8 | gb.readByte();\n                        sar_height = gb.readByte() << 8 | gb.readByte();\n                    }\n                }\n\n                if (gb.readBool()) {  // overscan_info_present_flag\n                    gb.readBool();  // overscan_appropriate_flag\n                }\n                if (gb.readBool()) {  // video_signal_type_present_flag\n                    gb.readBits(4);  // video_format & video_full_range_flag\n                    if (gb.readBool()) {  // colour_description_present_flag\n                        gb.readBits(24);  // colour_primaries & transfer_characteristics & matrix_coefficients\n                    }\n                }\n                if (gb.readBool()) {  // chroma_loc_info_present_flag\n                    gb.readUEG();  // chroma_sample_loc_type_top_field\n                    gb.readUEG();  // chroma_sample_loc_type_bottom_field\n                }\n                if (gb.readBool()) {  // timing_info_present_flag\n                    let num_units_in_tick = gb.readBits(32);\n                    let time_scale = gb.readBits(32);\n                    fps_fixed = gb.readBool();  // fixed_frame_rate_flag\n\n                    fps_num = time_scale;\n                    fps_den = num_units_in_tick * 2;\n                    fps = fps_num / fps_den;\n                }\n            }\n\n            let sarScale = 1;\n            if (sar_width !== 1 || sar_height !== 1) {\n                sarScale = sar_width / sar_height;\n            }\n\n            let crop_unit_x = 0, crop_unit_y = 0;\n            if (chroma_format_idc === 0) {\n                crop_unit_x = 1;\n                crop_unit_y = 2 - frame_mbs_only_flag;\n            } else {\n                let sub_wc = (chroma_format_idc === 3) ? 1 : 2;\n                let sub_hc = (chroma_format_idc === 1) ? 2 : 1;\n                crop_unit_x = sub_wc;\n                crop_unit_y = sub_hc * (2 - frame_mbs_only_flag);\n            }\n\n            let codec_width = (pic_width_in_mbs_minus1 + 1) * 16;\n            let codec_height = (2 - frame_mbs_only_flag) * ((pic_height_in_map_units_minus1 + 1) * 16);\n\n            codec_width -= (frame_crop_left_offset + frame_crop_right_offset) * crop_unit_x;\n            codec_height -= (frame_crop_top_offset + frame_crop_bottom_offset) * crop_unit_y;\n\n            let present_width = Math.ceil(codec_width * sarScale);\n\n            gb.destroy();\n            gb = null;\n\n            return {\n                profile_string: profile_string,  // baseline, high, high10, ...\n                level_string: level_string,  // 3, 3.1, 4, 4.1, 5, 5.1, ...\n                bit_depth: bit_depth,  // 8bit, 10bit, ...\n                chroma_format: chroma_format,  // 4:2:0, 4:2:2, ...\n                chroma_format_string: SPSParser.getChromaFormatString(chroma_format),\n\n                frame_rate: {\n                    fixed: fps_fixed,\n                    fps: fps,\n                    fps_den: fps_den,\n                    fps_num: fps_num\n                },\n\n                sar_ratio: {\n                    width: sar_width,\n                    height: sar_height\n                },\n\n                codec_size: {\n                    width: codec_width,\n                    height: codec_height\n                },\n\n                present_size: {\n                    width: present_width,\n                    height: codec_height\n                }\n            };\n        }\n\n        static _skipScalingList(gb, count) {\n            let last_scale = 8, next_scale = 8;\n            let delta_scale = 0;\n            for (let i = 0; i < count; i++) {\n                if (next_scale !== 0) {\n                    delta_scale = gb.readSEG();\n                    next_scale = (last_scale + delta_scale + 256) % 256;\n                }\n                last_scale = (next_scale === 0) ? last_scale : next_scale;\n            }\n        }\n\n        static getProfileString(profile_idc) {\n            switch (profile_idc) {\n                case 66:\n                    return \'Baseline\';\n                case 77:\n                    return \'Main\';\n                case 88:\n                    return \'Extended\';\n                case 100:\n                    return \'High\';\n                case 110:\n                    return \'High10\';\n                case 122:\n                    return \'High422\';\n                case 244:\n                    return \'High444\';\n                default:\n                    return \'Unknown\';\n            }\n        }\n\n        static getLevelString(level_idc) {\n            return (level_idc / 10).toFixed(1);\n        }\n\n        static getChromaFormatString(chroma) {\n            switch (chroma) {\n                case 420:\n                    return \'4:2:0\';\n                case 422:\n                    return \'4:2:2\';\n                case 444:\n                    return \'4:4:4\';\n                default:\n                    return \'Unknown\';\n            }\n        }\n\n    }\n\n    // ..import DemuxErrors from \'./demux-errors.js\';\n    const DemuxErrors = {\n        OK: \'OK\',\n        FORMAT_ERROR: \'FormatError\',\n        FORMAT_UNSUPPORTED: \'FormatUnsupported\',\n        CODEC_UNSUPPORTED: \'CodecUnsupported\'\n    };\n\n    // ..import MediaInfo from \'../core/media-info.js\';\n    class MediaInfo {\n\n        constructor() {\n            this.mimeType = null;\n            this.duration = null;\n\n            this.hasAudio = null;\n            this.hasVideo = null;\n            this.audioCodec = null;\n            this.videoCodec = null;\n            this.audioDataRate = null;\n            this.videoDataRate = null;\n\n            this.audioSampleRate = null;\n            this.audioChannelCount = null;\n\n            this.width = null;\n            this.height = null;\n            this.fps = null;\n            this.profile = null;\n            this.level = null;\n            this.chromaFormat = null;\n            this.sarNum = null;\n            this.sarDen = null;\n\n            this.metadata = null;\n            this.segments = null;  // MediaInfo[]\n            this.segmentCount = null;\n            this.hasKeyframesIndex = null;\n            this.keyframesIndex = null;\n        }\n\n        isComplete() {\n            let audioInfoComplete = (this.hasAudio === false) ||\n                (this.hasAudio === true &&\n                    this.audioCodec != null &&\n                    this.audioSampleRate != null &&\n                    this.audioChannelCount != null);\n\n            let videoInfoComplete = (this.hasVideo === false) ||\n                (this.hasVideo === true &&\n                    this.videoCodec != null &&\n                    this.width != null &&\n                    this.height != null &&\n                    this.fps != null &&\n                    this.profile != null &&\n                    this.level != null &&\n                    this.chromaFormat != null &&\n                    this.sarNum != null &&\n                    this.sarDen != null);\n\n            // keyframesIndex may not be present\n            return this.mimeType != null &&\n                this.duration != null &&\n                this.metadata != null &&\n                this.hasKeyframesIndex != null &&\n                audioInfoComplete &&\n                videoInfoComplete;\n        }\n\n        isSeekable() {\n            return this.hasKeyframesIndex === true;\n        }\n\n        getNearestKeyframe(milliseconds) {\n            if (this.keyframesIndex == null) {\n                return null;\n            }\n\n            let table = this.keyframesIndex;\n            let keyframeIdx = this._search(table.times, milliseconds);\n\n            return {\n                index: keyframeIdx,\n                milliseconds: table.times[keyframeIdx],\n                fileposition: table.filepositions[keyframeIdx]\n            };\n        }\n\n        _search(list, value) {\n            let idx = 0;\n\n            let last = list.length - 1;\n            let mid = 0;\n            let lbound = 0;\n            let ubound = last;\n\n            if (value < list[0]) {\n                idx = 0;\n                lbound = ubound + 1;  // skip search\n            }\n\n            while (lbound <= ubound) {\n                mid = lbound + Math.floor((ubound - lbound) / 2);\n                if (mid === last || (value >= list[mid] && value < list[mid + 1])) {\n                    idx = mid;\n                    break;\n                } else if (list[mid] < value) {\n                    lbound = mid + 1;\n                } else {\n                    ubound = mid - 1;\n                }\n            }\n\n            return idx;\n        }\n\n    }\n\n    function ReadBig32(array, index) {\n        return ((array[index] << 24) |\n            (array[index + 1] << 16) |\n            (array[index + 2] << 8) |\n            (array[index + 3]));\n    }\n\n    class FLVDemuxer {\n\n        /**\n         * Create a new FLV demuxer\n         * @param {Object} probeData\n         * @param {boolean} probeData.match\n         * @param {number} probeData.consumed\n         * @param {number} probeData.dataOffset\n         * @param {booleam} probeData.hasAudioTrack\n         * @param {boolean} probeData.hasVideoTrack\n         * @param {*} config \n         */\n        constructor(probeData, config) {\n            this.TAG = \'FLVDemuxer\';\n\n            this._config = config;\n\n            this._onError = null;\n            this._onMediaInfo = null;\n            this._onTrackMetadata = null;\n            this._onDataAvailable = null;\n\n            this._dataOffset = probeData.dataOffset;\n            this._firstParse = true;\n            this._dispatch = false;\n\n            this._hasAudio = probeData.hasAudioTrack;\n            this._hasVideo = probeData.hasVideoTrack;\n\n            this._hasAudioFlagOverrided = false;\n            this._hasVideoFlagOverrided = false;\n\n            this._audioInitialMetadataDispatched = false;\n            this._videoInitialMetadataDispatched = false;\n\n            this._mediaInfo = new MediaInfo();\n            this._mediaInfo.hasAudio = this._hasAudio;\n            this._mediaInfo.hasVideo = this._hasVideo;\n            this._metadata = null;\n            this._audioMetadata = null;\n            this._videoMetadata = null;\n\n            this._naluLengthSize = 4;\n            this._timestampBase = 0;  // int32, in milliseconds\n            this._timescale = 1000;\n            this._duration = 0;  // int32, in milliseconds\n            this._durationOverrided = false;\n            this._referenceFrameRate = {\n                fixed: true,\n                fps: 23.976,\n                fps_num: 23976,\n                fps_den: 1000\n            };\n\n            this._flvSoundRateTable = [5500, 11025, 22050, 44100, 48000];\n\n            this._mpegSamplingRates = [\n                96000, 88200, 64000, 48000, 44100, 32000,\n                24000, 22050, 16000, 12000, 11025, 8000, 7350\n            ];\n\n            this._mpegAudioV10SampleRateTable = [44100, 48000, 32000, 0];\n            this._mpegAudioV20SampleRateTable = [22050, 24000, 16000, 0];\n            this._mpegAudioV25SampleRateTable = [11025, 12000, 8000, 0];\n\n            this._mpegAudioL1BitRateTable = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1];\n            this._mpegAudioL2BitRateTable = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1];\n            this._mpegAudioL3BitRateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1];\n\n            this._videoTrack = { type: \'video\', id: 1, sequenceNumber: 0, samples: [], length: 0 };\n            this._audioTrack = { type: \'audio\', id: 2, sequenceNumber: 0, samples: [], length: 0 };\n\n            this._littleEndian = (function () {\n                let buf = new ArrayBuffer(2);\n                (new DataView(buf)).setInt16(0, 256, true);  // little-endian write\n                return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE\n            })();\n        }\n\n        destroy() {\n            this._mediaInfo = null;\n            this._metadata = null;\n            this._audioMetadata = null;\n            this._videoMetadata = null;\n            this._videoTrack = null;\n            this._audioTrack = null;\n\n            this._onError = null;\n            this._onMediaInfo = null;\n            this._onTrackMetadata = null;\n            this._onDataAvailable = null;\n        }\n\n        /**\n         * Probe the flv data\n         * @param {ArrayBuffer} buffer\n         * @returns {Object} - probeData to be feed into constructor\n         */\n        static probe(buffer) {\n            let data = new Uint8Array(buffer);\n            let mismatch = { match: false };\n\n            if (data[0] !== 0x46 || data[1] !== 0x4C || data[2] !== 0x56 || data[3] !== 0x01) {\n                return mismatch;\n            }\n\n            let hasAudio = ((data[4] & 4) >>> 2) !== 0;\n            let hasVideo = (data[4] & 1) !== 0;\n\n            let offset = ReadBig32(data, 5);\n\n            if (offset < 9) {\n                return mismatch;\n            }\n\n            return {\n                match: true,\n                consumed: offset,\n                dataOffset: offset,\n                hasAudioTrack: hasAudio,\n                hasVideoTrack: hasVideo\n            };\n        }\n\n        bindDataSource(loader) {\n            loader.onDataArrival = this.parseChunks.bind(this);\n            return this;\n        }\n\n        // prototype: function(type: string, metadata: any): void\n        get onTrackMetadata() {\n            return this._onTrackMetadata;\n        }\n\n        set onTrackMetadata(callback) {\n            this._onTrackMetadata = callback;\n        }\n\n        // prototype: function(mediaInfo: MediaInfo): void\n        get onMediaInfo() {\n            return this._onMediaInfo;\n        }\n\n        set onMediaInfo(callback) {\n            this._onMediaInfo = callback;\n        }\n\n        // prototype: function(type: number, info: string): void\n        get onError() {\n            return this._onError;\n        }\n\n        set onError(callback) {\n            this._onError = callback;\n        }\n\n        // prototype: function(videoTrack: any, audioTrack: any): void\n        get onDataAvailable() {\n            return this._onDataAvailable;\n        }\n\n        set onDataAvailable(callback) {\n            this._onDataAvailable = callback;\n        }\n\n        // timestamp base for output samples, must be in milliseconds\n        get timestampBase() {\n            return this._timestampBase;\n        }\n\n        set timestampBase(base) {\n            this._timestampBase = base;\n        }\n\n        get overridedDuration() {\n            return this._duration;\n        }\n\n        // Force-override media duration. Must be in milliseconds, int32\n        set overridedDuration(duration) {\n            this._durationOverrided = true;\n            this._duration = duration;\n            this._mediaInfo.duration = duration;\n        }\n\n        // Force-override audio track present flag, boolean\n        set overridedHasAudio(hasAudio) {\n            this._hasAudioFlagOverrided = true;\n            this._hasAudio = hasAudio;\n            this._mediaInfo.hasAudio = hasAudio;\n        }\n\n        // Force-override video track present flag, boolean\n        set overridedHasVideo(hasVideo) {\n            this._hasVideoFlagOverrided = true;\n            this._hasVideo = hasVideo;\n            this._mediaInfo.hasVideo = hasVideo;\n        }\n\n        resetMediaInfo() {\n            this._mediaInfo = new MediaInfo();\n        }\n\n        _isInitialMetadataDispatched() {\n            if (this._hasAudio && this._hasVideo) {  // both audio & video\n                return this._audioInitialMetadataDispatched && this._videoInitialMetadataDispatched;\n            }\n            if (this._hasAudio && !this._hasVideo) {  // audio only\n                return this._audioInitialMetadataDispatched;\n            }\n            if (!this._hasAudio && this._hasVideo) {  // video only\n                return this._videoInitialMetadataDispatched;\n            }\n            return false;\n        }\n\n        // function parseChunks(chunk: ArrayBuffer, byteStart: number): number;\n        parseChunks(chunk, byteStart) {\n            if (!this._onError || !this._onMediaInfo || !this._onTrackMetadata || !this._onDataAvailable) {\n                throw new IllegalStateException(\'Flv: onError & onMediaInfo & onTrackMetadata & onDataAvailable callback must be specified\');\n            }\n\n            // qli5: fix nonzero byteStart\n            let offset = byteStart || 0;\n            let le = this._littleEndian;\n\n            if (byteStart === 0) {  // buffer with FLV header\n                if (chunk.byteLength > 13) {\n                    let probeData = FLVDemuxer.probe(chunk);\n                    offset = probeData.dataOffset;\n                } else {\n                    return 0;\n                }\n            }\n\n            if (this._firstParse) {  // handle PreviousTagSize0 before Tag1\n                this._firstParse = false;\n                if (offset !== this._dataOffset) {\n                    Log.w(this.TAG, \'First time parsing but chunk byteStart invalid!\');\n                }\n\n                let v = new DataView(chunk, offset);\n                let prevTagSize0 = v.getUint32(0, !le);\n                if (prevTagSize0 !== 0) {\n                    Log.w(this.TAG, \'PrevTagSize0 !== 0 !!!\');\n                }\n                offset += 4;\n            }\n\n            while (offset < chunk.byteLength) {\n                this._dispatch = true;\n\n                let v = new DataView(chunk, offset);\n\n                if (offset + 11 + 4 > chunk.byteLength) {\n                    // data not enough for parsing an flv tag\n                    break;\n                }\n\n                let tagType = v.getUint8(0);\n                let dataSize = v.getUint32(0, !le) & 0x00FFFFFF;\n\n                if (offset + 11 + dataSize + 4 > chunk.byteLength) {\n                    // data not enough for parsing actual data body\n                    break;\n                }\n\n                if (tagType !== 8 && tagType !== 9 && tagType !== 18) {\n                    Log.w(this.TAG, `Unsupported tag type ${tagType}, skipped`);\n                    // consume the whole tag (skip it)\n                    offset += 11 + dataSize + 4;\n                    continue;\n                }\n\n                let ts2 = v.getUint8(4);\n                let ts1 = v.getUint8(5);\n                let ts0 = v.getUint8(6);\n                let ts3 = v.getUint8(7);\n\n                let timestamp = ts0 | (ts1 << 8) | (ts2 << 16) | (ts3 << 24);\n\n                let streamId = v.getUint32(7, !le) & 0x00FFFFFF;\n                if (streamId !== 0) {\n                    Log.w(this.TAG, \'Meet tag which has StreamID != 0!\');\n                }\n\n                let dataOffset = offset + 11;\n\n                switch (tagType) {\n                    case 8:  // Audio\n                        this._parseAudioData(chunk, dataOffset, dataSize, timestamp);\n                        break;\n                    case 9:  // Video\n                        this._parseVideoData(chunk, dataOffset, dataSize, timestamp, byteStart + offset);\n                        break;\n                    case 18:  // ScriptDataObject\n                        this._parseScriptData(chunk, dataOffset, dataSize);\n                        break;\n                }\n\n                let prevTagSize = v.getUint32(11 + dataSize, !le);\n                if (prevTagSize !== 11 + dataSize) {\n                    Log.w(this.TAG, `Invalid PrevTagSize ${prevTagSize}`);\n                }\n\n                offset += 11 + dataSize + 4;  // tagBody + dataSize + prevTagSize\n            }\n\n            // dispatch parsed frames to consumer (typically, the remuxer)\n            if (this._isInitialMetadataDispatched()) {\n                if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                    this._onDataAvailable(this._audioTrack, this._videoTrack);\n                }\n            }\n\n            return offset;  // consumed bytes, just equals latest offset index\n        }\n\n        _parseScriptData(arrayBuffer, dataOffset, dataSize) {\n            let scriptData = AMF.parseScriptData(arrayBuffer, dataOffset, dataSize);\n\n            if (scriptData.hasOwnProperty(\'onMetaData\')) {\n                if (scriptData.onMetaData == null || typeof scriptData.onMetaData !== \'object\') {\n                    Log.w(this.TAG, \'Invalid onMetaData structure!\');\n                    return;\n                }\n                if (this._metadata) {\n                    Log.w(this.TAG, \'Found another onMetaData tag!\');\n                }\n                this._metadata = scriptData;\n                let onMetaData = this._metadata.onMetaData;\n\n                if (typeof onMetaData.hasAudio === \'boolean\') {  // hasAudio\n                    if (this._hasAudioFlagOverrided === false) {\n                        this._hasAudio = onMetaData.hasAudio;\n                        this._mediaInfo.hasAudio = this._hasAudio;\n                    }\n                }\n                if (typeof onMetaData.hasVideo === \'boolean\') {  // hasVideo\n                    if (this._hasVideoFlagOverrided === false) {\n                        this._hasVideo = onMetaData.hasVideo;\n                        this._mediaInfo.hasVideo = this._hasVideo;\n                    }\n                }\n                if (typeof onMetaData.audiodatarate === \'number\') {  // audiodatarate\n                    this._mediaInfo.audioDataRate = onMetaData.audiodatarate;\n                }\n                if (typeof onMetaData.videodatarate === \'number\') {  // videodatarate\n                    this._mediaInfo.videoDataRate = onMetaData.videodatarate;\n                }\n                if (typeof onMetaData.width === \'number\') {  // width\n                    this._mediaInfo.width = onMetaData.width;\n                }\n                if (typeof onMetaData.height === \'number\') {  // height\n                    this._mediaInfo.height = onMetaData.height;\n                }\n                if (typeof onMetaData.duration === \'number\') {  // duration\n                    if (!this._durationOverrided) {\n                        let duration = Math.floor(onMetaData.duration * this._timescale);\n                        this._duration = duration;\n                        this._mediaInfo.duration = duration;\n                    }\n                } else {\n                    this._mediaInfo.duration = 0;\n                }\n                if (typeof onMetaData.framerate === \'number\') {  // framerate\n                    let fps_num = Math.floor(onMetaData.framerate * 1000);\n                    if (fps_num > 0) {\n                        let fps = fps_num / 1000;\n                        this._referenceFrameRate.fixed = true;\n                        this._referenceFrameRate.fps = fps;\n                        this._referenceFrameRate.fps_num = fps_num;\n                        this._referenceFrameRate.fps_den = 1000;\n                        this._mediaInfo.fps = fps;\n                    }\n                }\n                if (typeof onMetaData.keyframes === \'object\') {  // keyframes\n                    this._mediaInfo.hasKeyframesIndex = true;\n                    let keyframes = onMetaData.keyframes;\n                    this._mediaInfo.keyframesIndex = this._parseKeyframesIndex(keyframes);\n                    onMetaData.keyframes = null;  // keyframes has been extracted, remove it\n                } else {\n                    this._mediaInfo.hasKeyframesIndex = false;\n                }\n                this._dispatch = false;\n                this._mediaInfo.metadata = onMetaData;\n                Log.v(this.TAG, \'Parsed onMetaData\');\n                if (this._mediaInfo.isComplete()) {\n                    this._onMediaInfo(this._mediaInfo);\n                }\n            }\n        }\n\n        _parseKeyframesIndex(keyframes) {\n            let times = [];\n            let filepositions = [];\n\n            // ignore first keyframe which is actually AVC Sequence Header (AVCDecoderConfigurationRecord)\n            for (let i = 1; i < keyframes.times.length; i++) {\n                let time = this._timestampBase + Math.floor(keyframes.times[i] * 1000);\n                times.push(time);\n                filepositions.push(keyframes.filepositions[i]);\n            }\n\n            return {\n                times: times,\n                filepositions: filepositions\n            };\n        }\n\n        _parseAudioData(arrayBuffer, dataOffset, dataSize, tagTimestamp) {\n            if (dataSize <= 1) {\n                Log.w(this.TAG, \'Flv: Invalid audio packet, missing SoundData payload!\');\n                return;\n            }\n\n            if (this._hasAudioFlagOverrided === true && this._hasAudio === false) {\n                // If hasAudio: false indicated explicitly in MediaDataSource,\n                // Ignore all the audio packets\n                return;\n            }\n\n            let le = this._littleEndian;\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            let soundSpec = v.getUint8(0);\n\n            let soundFormat = soundSpec >>> 4;\n            if (soundFormat !== 2 && soundFormat !== 10) {  // MP3 or AAC\n                this._onError(DemuxErrors.CODEC_UNSUPPORTED, \'Flv: Unsupported audio codec idx: \' + soundFormat);\n                return;\n            }\n\n            let soundRate = 0;\n            let soundRateIndex = (soundSpec & 12) >>> 2;\n            if (soundRateIndex >= 0 && soundRateIndex <= 4) {\n                soundRate = this._flvSoundRateTable[soundRateIndex];\n            } else {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid audio sample rate idx: \' + soundRateIndex);\n                return;\n            }\n            let soundType = (soundSpec & 1);\n\n\n            let meta = this._audioMetadata;\n            let track = this._audioTrack;\n\n            if (!meta) {\n                if (this._hasAudio === false && this._hasAudioFlagOverrided === false) {\n                    this._hasAudio = true;\n                    this._mediaInfo.hasAudio = true;\n                }\n\n                // initial metadata\n                meta = this._audioMetadata = {};\n                meta.type = \'audio\';\n                meta.id = track.id;\n                meta.timescale = this._timescale;\n                meta.duration = this._duration;\n                meta.audioSampleRate = soundRate;\n                meta.channelCount = (soundType === 0 ? 1 : 2);\n            }\n\n            if (soundFormat === 10) {  // AAC\n                let aacData = this._parseAACAudioData(arrayBuffer, dataOffset + 1, dataSize - 1);\n                if (aacData == undefined) {\n                    return;\n                }\n\n                if (aacData.packetType === 0) {  // AAC sequence header (AudioSpecificConfig)\n                    if (meta.config) {\n                        Log.w(this.TAG, \'Found another AudioSpecificConfig!\');\n                    }\n                    let misc = aacData.data;\n                    meta.audioSampleRate = misc.samplingRate;\n                    meta.channelCount = misc.channelCount;\n                    meta.codec = misc.codec;\n                    meta.originalCodec = misc.originalCodec;\n                    meta.config = misc.config;\n                    // added by qli5\n                    meta.configRaw = misc.configRaw;\n                    // The decode result of an aac sample is 1024 PCM samples\n                    meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale;\n                    Log.v(this.TAG, \'Parsed AudioSpecificConfig\');\n\n                    if (this._isInitialMetadataDispatched()) {\n                        // Non-initial metadata, force dispatch (or flush) parsed frames to remuxer\n                        if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                            this._onDataAvailable(this._audioTrack, this._videoTrack);\n                        }\n                    } else {\n                        this._audioInitialMetadataDispatched = true;\n                    }\n                    // then notify new metadata\n                    this._dispatch = false;\n                    this._onTrackMetadata(\'audio\', meta);\n\n                    let mi = this._mediaInfo;\n                    mi.audioCodec = meta.originalCodec;\n                    mi.audioSampleRate = meta.audioSampleRate;\n                    mi.audioChannelCount = meta.channelCount;\n                    if (mi.hasVideo) {\n                        if (mi.videoCodec != null) {\n                            mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                        }\n                    } else {\n                        mi.mimeType = \'video/x-flv; codecs="\' + mi.audioCodec + \'"\';\n                    }\n                    if (mi.isComplete()) {\n                        this._onMediaInfo(mi);\n                    }\n                } else if (aacData.packetType === 1) {  // AAC raw frame data\n                    let dts = this._timestampBase + tagTimestamp;\n                    let aacSample = { unit: aacData.data, length: aacData.data.byteLength, dts: dts, pts: dts };\n                    track.samples.push(aacSample);\n                    track.length += aacData.data.length;\n                } else {\n                    Log.e(this.TAG, `Flv: Unsupported AAC data type ${aacData.packetType}`);\n                }\n            } else if (soundFormat === 2) {  // MP3\n                if (!meta.codec) {\n                    // We need metadata for mp3 audio track, extract info from frame header\n                    let misc = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, true);\n                    if (misc == undefined) {\n                        return;\n                    }\n                    meta.audioSampleRate = misc.samplingRate;\n                    meta.channelCount = misc.channelCount;\n                    meta.codec = misc.codec;\n                    meta.originalCodec = misc.originalCodec;\n                    // The decode result of an mp3 sample is 1152 PCM samples\n                    meta.refSampleDuration = 1152 / meta.audioSampleRate * meta.timescale;\n                    Log.v(this.TAG, \'Parsed MPEG Audio Frame Header\');\n\n                    this._audioInitialMetadataDispatched = true;\n                    this._onTrackMetadata(\'audio\', meta);\n\n                    let mi = this._mediaInfo;\n                    mi.audioCodec = meta.codec;\n                    mi.audioSampleRate = meta.audioSampleRate;\n                    mi.audioChannelCount = meta.channelCount;\n                    mi.audioDataRate = misc.bitRate;\n                    if (mi.hasVideo) {\n                        if (mi.videoCodec != null) {\n                            mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                        }\n                    } else {\n                        mi.mimeType = \'video/x-flv; codecs="\' + mi.audioCodec + \'"\';\n                    }\n                    if (mi.isComplete()) {\n                        this._onMediaInfo(mi);\n                    }\n                }\n\n                // This packet is always a valid audio packet, extract it\n                let data = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, false);\n                if (data == undefined) {\n                    return;\n                }\n                let dts = this._timestampBase + tagTimestamp;\n                let mp3Sample = { unit: data, length: data.byteLength, dts: dts, pts: dts };\n                track.samples.push(mp3Sample);\n                track.length += data.length;\n            }\n        }\n\n        _parseAACAudioData(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize <= 1) {\n                Log.w(this.TAG, \'Flv: Invalid AAC packet, missing AACPacketType or/and Data!\');\n                return;\n            }\n\n            let result = {};\n            let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n\n            result.packetType = array[0];\n\n            if (array[0] === 0) {\n                result.data = this._parseAACAudioSpecificConfig(arrayBuffer, dataOffset + 1, dataSize - 1);\n            } else {\n                result.data = array.subarray(1);\n            }\n\n            return result;\n        }\n\n        _parseAACAudioSpecificConfig(arrayBuffer, dataOffset, dataSize) {\n            let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n            let config = null;\n\n            /* Audio Object Type:\n               0: Null\n               1: AAC Main\n               2: AAC LC\n               3: AAC SSR (Scalable Sample Rate)\n               4: AAC LTP (Long Term Prediction)\n               5: HE-AAC / SBR (Spectral Band Replication)\n               6: AAC Scalable\n            */\n\n            let audioObjectType = 0;\n            let originalAudioObjectType = 0;\n            let samplingIndex = 0;\n            let extensionSamplingIndex = null;\n\n            // 5 bits\n            audioObjectType = originalAudioObjectType = array[0] >>> 3;\n            // 4 bits\n            samplingIndex = ((array[0] & 0x07) << 1) | (array[1] >>> 7);\n            if (samplingIndex < 0 || samplingIndex >= this._mpegSamplingRates.length) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: AAC invalid sampling frequency index!\');\n                return;\n            }\n\n            let samplingFrequence = this._mpegSamplingRates[samplingIndex];\n\n            // 4 bits\n            let channelConfig = (array[1] & 0x78) >>> 3;\n            if (channelConfig < 0 || channelConfig >= 8) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: AAC invalid channel configuration\');\n                return;\n            }\n\n            if (audioObjectType === 5) {  // HE-AAC?\n                // 4 bits\n                extensionSamplingIndex = ((array[1] & 0x07) << 1) | (array[2] >>> 7);\n            }\n\n            // workarounds for various browsers\n            let userAgent = _navigator.userAgent.toLowerCase();\n\n            if (userAgent.indexOf(\'firefox\') !== -1) {\n                // firefox: use SBR (HE-AAC) if freq less than 24kHz\n                if (samplingIndex >= 6) {\n                    audioObjectType = 5;\n                    config = new Array(4);\n                    extensionSamplingIndex = samplingIndex - 3;\n                } else {  // use LC-AAC\n                    audioObjectType = 2;\n                    config = new Array(2);\n                    extensionSamplingIndex = samplingIndex;\n                }\n            } else if (userAgent.indexOf(\'android\') !== -1) {\n                // android: always use LC-AAC\n                audioObjectType = 2;\n                config = new Array(2);\n                extensionSamplingIndex = samplingIndex;\n            } else {\n                // for other browsers, e.g. chrome...\n                // Always use HE-AAC to make it easier to switch aac codec profile\n                audioObjectType = 5;\n                extensionSamplingIndex = samplingIndex;\n                config = new Array(4);\n\n                if (samplingIndex >= 6) {\n                    extensionSamplingIndex = samplingIndex - 3;\n                } else if (channelConfig === 1) {  // Mono channel\n                    audioObjectType = 2;\n                    config = new Array(2);\n                    extensionSamplingIndex = samplingIndex;\n                }\n            }\n\n            config[0] = audioObjectType << 3;\n            config[0] |= (samplingIndex & 0x0F) >>> 1;\n            config[1] = (samplingIndex & 0x0F) << 7;\n            config[1] |= (channelConfig & 0x0F) << 3;\n            if (audioObjectType === 5) {\n                config[1] |= ((extensionSamplingIndex & 0x0F) >>> 1);\n                config[2] = (extensionSamplingIndex & 0x01) << 7;\n                // extended audio object type: force to 2 (LC-AAC)\n                config[2] |= (2 << 2);\n                config[3] = 0;\n            }\n\n            return {\n                // configRaw: added by qli5\n                configRaw: array,\n                config: config,\n                samplingRate: samplingFrequence,\n                channelCount: channelConfig,\n                codec: \'mp4a.40.\' + audioObjectType,\n                originalCodec: \'mp4a.40.\' + originalAudioObjectType\n            };\n        }\n\n        _parseMP3AudioData(arrayBuffer, dataOffset, dataSize, requestHeader) {\n            if (dataSize < 4) {\n                Log.w(this.TAG, \'Flv: Invalid MP3 packet, header missing!\');\n                return;\n            }\n\n            let le = this._littleEndian;\n            let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n            let result = null;\n\n            if (requestHeader) {\n                if (array[0] !== 0xFF) {\n                    return;\n                }\n                let ver = (array[1] >>> 3) & 0x03;\n                let layer = (array[1] & 0x06) >> 1;\n\n                let bitrate_index = (array[2] & 0xF0) >>> 4;\n                let sampling_freq_index = (array[2] & 0x0C) >>> 2;\n\n                let channel_mode = (array[3] >>> 6) & 0x03;\n                let channel_count = channel_mode !== 3 ? 2 : 1;\n\n                let sample_rate = 0;\n                let bit_rate = 0;\n\n                let codec = \'mp3\';\n\n                switch (ver) {\n                    case 0:  // MPEG 2.5\n                        sample_rate = this._mpegAudioV25SampleRateTable[sampling_freq_index];\n                        break;\n                    case 2:  // MPEG 2\n                        sample_rate = this._mpegAudioV20SampleRateTable[sampling_freq_index];\n                        break;\n                    case 3:  // MPEG 1\n                        sample_rate = this._mpegAudioV10SampleRateTable[sampling_freq_index];\n                        break;\n                }\n\n                switch (layer) {\n                    case 1:  // Layer 3\n                        if (bitrate_index < this._mpegAudioL3BitRateTable.length) {\n                            bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];\n                        }\n                        break;\n                    case 2:  // Layer 2\n                        if (bitrate_index < this._mpegAudioL2BitRateTable.length) {\n                            bit_rate = this._mpegAudioL2BitRateTable[bitrate_index];\n                        }\n                        break;\n                    case 3:  // Layer 1\n                        if (bitrate_index < this._mpegAudioL1BitRateTable.length) {\n                            bit_rate = this._mpegAudioL1BitRateTable[bitrate_index];\n                        }\n                        break;\n                }\n\n                result = {\n                    bitRate: bit_rate,\n                    samplingRate: sample_rate,\n                    channelCount: channel_count,\n                    codec: codec,\n                    originalCodec: codec\n                };\n            } else {\n                result = array;\n            }\n\n            return result;\n        }\n\n        _parseVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition) {\n            if (dataSize <= 1) {\n                Log.w(this.TAG, \'Flv: Invalid video packet, missing VideoData payload!\');\n                return;\n            }\n\n            if (this._hasVideoFlagOverrided === true && this._hasVideo === false) {\n                // If hasVideo: false indicated explicitly in MediaDataSource,\n                // Ignore all the video packets\n                return;\n            }\n\n            let spec = (new Uint8Array(arrayBuffer, dataOffset, dataSize))[0];\n\n            let frameType = (spec & 240) >>> 4;\n            let codecId = spec & 15;\n\n            if (codecId !== 7) {\n                this._onError(DemuxErrors.CODEC_UNSUPPORTED, `Flv: Unsupported codec in video frame: ${codecId}`);\n                return;\n            }\n\n            this._parseAVCVideoPacket(arrayBuffer, dataOffset + 1, dataSize - 1, tagTimestamp, tagPosition, frameType);\n        }\n\n        _parseAVCVideoPacket(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType) {\n            if (dataSize < 4) {\n                Log.w(this.TAG, \'Flv: Invalid AVC packet, missing AVCPacketType or/and CompositionTime\');\n                return;\n            }\n\n            let le = this._littleEndian;\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            let packetType = v.getUint8(0);\n            let cts = v.getUint32(0, !le) & 0x00FFFFFF;\n\n            if (packetType === 0) {  // AVCDecoderConfigurationRecord\n                this._parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset + 4, dataSize - 4);\n            } else if (packetType === 1) {  // One or more Nalus\n                this._parseAVCVideoData(arrayBuffer, dataOffset + 4, dataSize - 4, tagTimestamp, tagPosition, frameType, cts);\n            } else if (packetType === 2) {\n                // empty, AVC end of sequence\n            } else {\n                this._onError(DemuxErrors.FORMAT_ERROR, `Flv: Invalid video packet type ${packetType}`);\n                return;\n            }\n        }\n\n        _parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset, dataSize) {\n            if (dataSize < 7) {\n                Log.w(this.TAG, \'Flv: Invalid AVCDecoderConfigurationRecord, lack of data!\');\n                return;\n            }\n\n            let meta = this._videoMetadata;\n            let track = this._videoTrack;\n            let le = this._littleEndian;\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            if (!meta) {\n                if (this._hasVideo === false && this._hasVideoFlagOverrided === false) {\n                    this._hasVideo = true;\n                    this._mediaInfo.hasVideo = true;\n                }\n\n                meta = this._videoMetadata = {};\n                meta.type = \'video\';\n                meta.id = track.id;\n                meta.timescale = this._timescale;\n                meta.duration = this._duration;\n            } else {\n                if (typeof meta.avcc !== \'undefined\') {\n                    Log.w(this.TAG, \'Found another AVCDecoderConfigurationRecord!\');\n                }\n            }\n\n            let version = v.getUint8(0);  // configurationVersion\n            let avcProfile = v.getUint8(1);  // avcProfileIndication\n            let profileCompatibility = v.getUint8(2);  // profile_compatibility\n            let avcLevel = v.getUint8(3);  // AVCLevelIndication\n\n            if (version !== 1 || avcProfile === 0) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord\');\n                return;\n            }\n\n            this._naluLengthSize = (v.getUint8(4) & 3) + 1;  // lengthSizeMinusOne\n            if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {  // holy shit!!!\n                this._onError(DemuxErrors.FORMAT_ERROR, `Flv: Strange NaluLengthSizeMinusOne: ${this._naluLengthSize - 1}`);\n                return;\n            }\n\n            let spsCount = v.getUint8(5) & 31;  // numOfSequenceParameterSets\n            if (spsCount === 0) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord: No SPS\');\n                return;\n            } else if (spsCount > 1) {\n                Log.w(this.TAG, `Flv: Strange AVCDecoderConfigurationRecord: SPS Count = ${spsCount}`);\n            }\n\n            let offset = 6;\n\n            for (let i = 0; i < spsCount; i++) {\n                let len = v.getUint16(offset, !le);  // sequenceParameterSetLength\n                offset += 2;\n\n                if (len === 0) {\n                    continue;\n                }\n\n                // Notice: Nalu without startcode header (00 00 00 01)\n                let sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);\n                offset += len;\n\n                let config = SPSParser.parseSPS(sps);\n                if (i !== 0) {\n                    // ignore other sps\'s config\n                    continue;\n                }\n\n                meta.codecWidth = config.codec_size.width;\n                meta.codecHeight = config.codec_size.height;\n                meta.presentWidth = config.present_size.width;\n                meta.presentHeight = config.present_size.height;\n\n                meta.profile = config.profile_string;\n                meta.level = config.level_string;\n                meta.bitDepth = config.bit_depth;\n                meta.chromaFormat = config.chroma_format;\n                meta.sarRatio = config.sar_ratio;\n                meta.frameRate = config.frame_rate;\n\n                if (config.frame_rate.fixed === false ||\n                    config.frame_rate.fps_num === 0 ||\n                    config.frame_rate.fps_den === 0) {\n                    meta.frameRate = this._referenceFrameRate;\n                }\n\n                let fps_den = meta.frameRate.fps_den;\n                let fps_num = meta.frameRate.fps_num;\n                meta.refSampleDuration = meta.timescale * (fps_den / fps_num);\n\n                let codecArray = sps.subarray(1, 4);\n                let codecString = \'avc1.\';\n                for (let j = 0; j < 3; j++) {\n                    let h = codecArray[j].toString(16);\n                    if (h.length < 2) {\n                        h = \'0\' + h;\n                    }\n                    codecString += h;\n                }\n                meta.codec = codecString;\n\n                let mi = this._mediaInfo;\n                mi.width = meta.codecWidth;\n                mi.height = meta.codecHeight;\n                mi.fps = meta.frameRate.fps;\n                mi.profile = meta.profile;\n                mi.level = meta.level;\n                mi.chromaFormat = config.chroma_format_string;\n                mi.sarNum = meta.sarRatio.width;\n                mi.sarDen = meta.sarRatio.height;\n                mi.videoCodec = codecString;\n\n                if (mi.hasAudio) {\n                    if (mi.audioCodec != null) {\n                        mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                    }\n                } else {\n                    mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \'"\';\n                }\n                if (mi.isComplete()) {\n                    this._onMediaInfo(mi);\n                }\n            }\n\n            let ppsCount = v.getUint8(offset);  // numOfPictureParameterSets\n            if (ppsCount === 0) {\n                this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord: No PPS\');\n                return;\n            } else if (ppsCount > 1) {\n                Log.w(this.TAG, `Flv: Strange AVCDecoderConfigurationRecord: PPS Count = ${ppsCount}`);\n            }\n\n            offset++;\n\n            for (let i = 0; i < ppsCount; i++) {\n                let len = v.getUint16(offset, !le);  // pictureParameterSetLength\n                offset += 2;\n\n                if (len === 0) {\n                    continue;\n                }\n\n                // pps is useless for extracting video information\n                offset += len;\n            }\n\n            meta.avcc = new Uint8Array(dataSize);\n            meta.avcc.set(new Uint8Array(arrayBuffer, dataOffset, dataSize), 0);\n            Log.v(this.TAG, \'Parsed AVCDecoderConfigurationRecord\');\n\n            if (this._isInitialMetadataDispatched()) {\n                // flush parsed frames\n                if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                    this._onDataAvailable(this._audioTrack, this._videoTrack);\n                }\n            } else {\n                this._videoInitialMetadataDispatched = true;\n            }\n            // notify new metadata\n            this._dispatch = false;\n            this._onTrackMetadata(\'video\', meta);\n        }\n\n        _parseAVCVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType, cts) {\n            let le = this._littleEndian;\n            let v = new DataView(arrayBuffer, dataOffset, dataSize);\n\n            let units = [], length = 0;\n\n            let offset = 0;\n            const lengthSize = this._naluLengthSize;\n            let dts = this._timestampBase + tagTimestamp;\n            let keyframe = (frameType === 1);  // from FLV Frame Type constants\n            let refIdc = 1; // added by qli5\n\n            while (offset < dataSize) {\n                if (offset + 4 >= dataSize) {\n                    Log.w(this.TAG, `Malformed Nalu near timestamp ${dts}, offset = ${offset}, dataSize = ${dataSize}`);\n                    break;  // data not enough for next Nalu\n                }\n                // Nalu with length-header (AVC1)\n                let naluSize = v.getUint32(offset, !le);  // Big-Endian read\n                if (lengthSize === 3) {\n                    naluSize >>>= 8;\n                }\n                if (naluSize > dataSize - lengthSize) {\n                    Log.w(this.TAG, `Malformed Nalus near timestamp ${dts}, NaluSize > DataSize!`);\n                    return;\n                }\n\n                let unitType = v.getUint8(offset + lengthSize) & 0x1F;\n                // added by qli5\n                refIdc = v.getUint8(offset + lengthSize) & 0x60;\n\n                if (unitType === 5) {  // IDR\n                    keyframe = true;\n                }\n\n                let data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);\n                let unit = { type: unitType, data: data };\n                units.push(unit);\n                length += data.byteLength;\n\n                offset += lengthSize + naluSize;\n            }\n\n            if (units.length) {\n                let track = this._videoTrack;\n                let avcSample = {\n                    units: units,\n                    length: length,\n                    isKeyframe: keyframe,\n                    refIdc: refIdc,\n                    dts: dts,\n                    cts: cts,\n                    pts: (dts + cts)\n                };\n                if (keyframe) {\n                    avcSample.fileposition = tagPosition;\n                }\n                track.samples.push(avcSample);\n                track.length += length;\n            }\n        }\n\n    }\n\n    /***\n     * Copyright (C) 2018 Qli5. All Rights Reserved.\n     * \n     * @author qli5 <goodlq11[at](163|gmail).com>\n     * \n     * This Source Code Form is subject to the terms of the Mozilla Public\n     * License, v. 2.0. If a copy of the MPL was not distributed with this\n     * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n    */\n\n    class ASS {\n        /**\n         * Extract sections from ass string\n         * @param {string} str \n         * @returns {Object} - object from sections\n         */\n        static extractSections(str) {\n            const regex = /^\\ufeff?\\[(.*)\\]$/mg;\n            let match;\n            let matchArr = [];\n            while ((match = regex.exec(str)) !== null) {\n                matchArr.push({ name: match[1], index: match.index });\n            }\n            let ret = {};\n            matchArr.forEach((match, i) => ret[match.name] = str.slice(match.index, matchArr[i + 1] && matchArr[i + 1].index));\n            return ret;\n        }\n\n        /**\n         * Extract subtitle lines from section Events\n         * @param {string} str \n         * @returns {Array<Object>} - array of subtitle lines\n         */\n        static extractSubtitleLines(str) {\n            const lines = str.split(/\\r\\n+/);\n            if (lines[0] != \'[Events]\' && lines[0] != \'[events]\') throw new Error(\'ASSDemuxer: section is not [Events]\');\n            if (lines[1].indexOf(\'Format:\') != 0 && lines[1].indexOf(\'format:\') != 0) throw new Error(\'ASSDemuxer: cannot find Format definition in section [Events]\');\n\n            const format = lines[1].slice(lines[1].indexOf(\':\') + 1).split(\',\').map(e => e.trim());\n            return lines.slice(2).map(e => {\n                let j = {};\n                e.replace(/[d|D]ialogue:\\s*/, \'\')\n                    .match(new RegExp(new Array(format.length - 1).fill(\'(.*?),\').join(\'\') + \'(.*)\'))\n                    .slice(1)\n                    .forEach((k, index) => j[format[index]] = k);\n                return j;\n            });\n        }\n\n        /**\n         * Create a new ASS Demuxer\n         */\n        constructor() {\n            this.info = \'\';\n            this.styles = \'\';\n            this.events = \'\';\n            this.eventsHeader = \'\';\n            this.pictures = \'\';\n            this.fonts = \'\';\n            this.lines = \'\';\n        }\n\n        get header() {\n            // return this.info + this.styles + this.eventsHeader;\n            return this.info + this.styles;\n        }\n\n        /**\n         * Load a file from an arraybuffer of a string\n         * @param {(ArrayBuffer|string)} chunk \n         */\n        parseFile(chunk) {\n            const str = typeof chunk == \'string\' ? chunk : new _TextDecoder(\'utf-8\').decode(chunk);\n            for (let [i, j] of Object.entries(ASS.extractSections(str))) {\n                if (i.match(/Script Info(?:mation)?/i)) this.info = j;\n                else if (i.match(/V4\\+? Styles?/i)) this.styles = j;\n                else if (i.match(/Events?/i)) this.events = j;\n                else if (i.match(/Pictures?/i)) this.pictures = j;\n                else if (i.match(/Fonts?/i)) this.fonts = j;\n            }\n            this.eventsHeader = this.events.split(\'\\n\', 2).join(\'\\n\') + \'\\n\';\n            this.lines = ASS.extractSubtitleLines(this.events);\n            return this;\n        }\n    }\n\n    /** Detect free variable `global` from Node.js. */\n    var freeGlobal = typeof global == \'object\' && global && global.Object === Object && global;\n\n    /** Detect free variable `self`. */\n    var freeSelf = typeof self == \'object\' && self && self.Object === Object && self;\n\n    /** Used as a reference to the global object. */\n    var root = freeGlobal || freeSelf || Function(\'return this\')();\n\n    /** Built-in value references. */\n    var Symbol = root.Symbol;\n\n    /** Used for built-in method references. */\n    var objectProto = Object.prototype;\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty = objectProto.hasOwnProperty;\n\n    /**\n     * Used to resolve the\n     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n     * of values.\n     */\n    var nativeObjectToString = objectProto.toString;\n\n    /** Built-in value references. */\n    var symToStringTag = Symbol ? Symbol.toStringTag : undefined;\n\n    /**\n     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.\n     *\n     * @private\n     * @param {*} value The value to query.\n     * @returns {string} Returns the raw `toStringTag`.\n     */\n    function getRawTag(value) {\n      var isOwn = hasOwnProperty.call(value, symToStringTag),\n          tag = value[symToStringTag];\n\n      try {\n        value[symToStringTag] = undefined;\n        var unmasked = true;\n      } catch (e) {}\n\n      var result = nativeObjectToString.call(value);\n      if (unmasked) {\n        if (isOwn) {\n          value[symToStringTag] = tag;\n        } else {\n          delete value[symToStringTag];\n        }\n      }\n      return result;\n    }\n\n    /** Used for built-in method references. */\n    var objectProto$1 = Object.prototype;\n\n    /**\n     * Used to resolve the\n     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n     * of values.\n     */\n    var nativeObjectToString$1 = objectProto$1.toString;\n\n    /**\n     * Converts `value` to a string using `Object.prototype.toString`.\n     *\n     * @private\n     * @param {*} value The value to convert.\n     * @returns {string} Returns the converted string.\n     */\n    function objectToString(value) {\n      return nativeObjectToString$1.call(value);\n    }\n\n    /** `Object#toString` result references. */\n    var nullTag = \'[object Null]\',\n        undefinedTag = \'[object Undefined]\';\n\n    /** Built-in value references. */\n    var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;\n\n    /**\n     * The base implementation of `getTag` without fallbacks for buggy environments.\n     *\n     * @private\n     * @param {*} value The value to query.\n     * @returns {string} Returns the `toStringTag`.\n     */\n    function baseGetTag(value) {\n      if (value == null) {\n        return value === undefined ? undefinedTag : nullTag;\n      }\n      return (symToStringTag$1 && symToStringTag$1 in Object(value))\n        ? getRawTag(value)\n        : objectToString(value);\n    }\n\n    /**\n     * Checks if `value` is the\n     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)\n     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String(\'\')`)\n     *\n     * @static\n     * @memberOf _\n     * @since 0.1.0\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is an object, else `false`.\n     * @example\n     *\n     * _.isObject({});\n     * // => true\n     *\n     * _.isObject([1, 2, 3]);\n     * // => true\n     *\n     * _.isObject(_.noop);\n     * // => true\n     *\n     * _.isObject(null);\n     * // => false\n     */\n    function isObject(value) {\n      var type = typeof value;\n      return value != null && (type == \'object\' || type == \'function\');\n    }\n\n    /** `Object#toString` result references. */\n    var asyncTag = \'[object AsyncFunction]\',\n        funcTag = \'[object Function]\',\n        genTag = \'[object GeneratorFunction]\',\n        proxyTag = \'[object Proxy]\';\n\n    /**\n     * Checks if `value` is classified as a `Function` object.\n     *\n     * @static\n     * @memberOf _\n     * @since 0.1.0\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a function, else `false`.\n     * @example\n     *\n     * _.isFunction(_);\n     * // => true\n     *\n     * _.isFunction(/abc/);\n     * // => false\n     */\n    function isFunction(value) {\n      if (!isObject(value)) {\n        return false;\n      }\n      // The use of `Object#toString` avoids issues with the `typeof` operator\n      // in Safari 9 which returns \'object\' for typed arrays and other constructors.\n      var tag = baseGetTag(value);\n      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;\n    }\n\n    /** Used to detect overreaching core-js shims. */\n    var coreJsData = root[\'__core-js_shared__\'];\n\n    /** Used to detect methods masquerading as native. */\n    var maskSrcKey = (function() {\n      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || \'\');\n      return uid ? (\'Symbol(src)_1.\' + uid) : \'\';\n    }());\n\n    /**\n     * Checks if `func` has its source masked.\n     *\n     * @private\n     * @param {Function} func The function to check.\n     * @returns {boolean} Returns `true` if `func` is masked, else `false`.\n     */\n    function isMasked(func) {\n      return !!maskSrcKey && (maskSrcKey in func);\n    }\n\n    /** Used for built-in method references. */\n    var funcProto = Function.prototype;\n\n    /** Used to resolve the decompiled source of functions. */\n    var funcToString = funcProto.toString;\n\n    /**\n     * Converts `func` to its source code.\n     *\n     * @private\n     * @param {Function} func The function to convert.\n     * @returns {string} Returns the source code.\n     */\n    function toSource(func) {\n      if (func != null) {\n        try {\n          return funcToString.call(func);\n        } catch (e) {}\n        try {\n          return (func + \'\');\n        } catch (e) {}\n      }\n      return \'\';\n    }\n\n    /**\n     * Used to match `RegExp`\n     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).\n     */\n    var reRegExpChar = /[\\\\^$.*+?()[\\]{}|]/g;\n\n    /** Used to detect host constructors (Safari). */\n    var reIsHostCtor = /^\\[object .+?Constructor\\]$/;\n\n    /** Used for built-in method references. */\n    var funcProto$1 = Function.prototype,\n        objectProto$2 = Object.prototype;\n\n    /** Used to resolve the decompiled source of functions. */\n    var funcToString$1 = funcProto$1.toString;\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;\n\n    /** Used to detect if a method is native. */\n    var reIsNative = RegExp(\'^\' +\n      funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, \'\\\\$&\')\n      .replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, \'$1.*?\') + \'$\'\n    );\n\n    /**\n     * The base implementation of `_.isNative` without bad shim checks.\n     *\n     * @private\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a native function,\n     *  else `false`.\n     */\n    function baseIsNative(value) {\n      if (!isObject(value) || isMasked(value)) {\n        return false;\n      }\n      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;\n      return pattern.test(toSource(value));\n    }\n\n    /**\n     * Gets the value at `key` of `object`.\n     *\n     * @private\n     * @param {Object} [object] The object to query.\n     * @param {string} key The key of the property to get.\n     * @returns {*} Returns the property value.\n     */\n    function getValue(object, key) {\n      return object == null ? undefined : object[key];\n    }\n\n    /**\n     * Gets the native function at `key` of `object`.\n     *\n     * @private\n     * @param {Object} object The object to query.\n     * @param {string} key The key of the method to get.\n     * @returns {*} Returns the function if it\'s native, else `undefined`.\n     */\n    function getNative(object, key) {\n      var value = getValue(object, key);\n      return baseIsNative(value) ? value : undefined;\n    }\n\n    /* Built-in method references that are verified to be native. */\n    var nativeCreate = getNative(Object, \'create\');\n\n    /**\n     * Removes all key-value entries from the hash.\n     *\n     * @private\n     * @name clear\n     * @memberOf Hash\n     */\n    function hashClear() {\n      this.__data__ = nativeCreate ? nativeCreate(null) : {};\n      this.size = 0;\n    }\n\n    /**\n     * Removes `key` and its value from the hash.\n     *\n     * @private\n     * @name delete\n     * @memberOf Hash\n     * @param {Object} hash The hash to modify.\n     * @param {string} key The key of the value to remove.\n     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n     */\n    function hashDelete(key) {\n      var result = this.has(key) && delete this.__data__[key];\n      this.size -= result ? 1 : 0;\n      return result;\n    }\n\n    /** Used to stand-in for `undefined` hash values. */\n    var HASH_UNDEFINED = \'__lodash_hash_undefined__\';\n\n    /** Used for built-in method references. */\n    var objectProto$3 = Object.prototype;\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;\n\n    /**\n     * Gets the hash value for `key`.\n     *\n     * @private\n     * @name get\n     * @memberOf Hash\n     * @param {string} key The key of the value to get.\n     * @returns {*} Returns the entry value.\n     */\n    function hashGet(key) {\n      var data = this.__data__;\n      if (nativeCreate) {\n        var result = data[key];\n        return result === HASH_UNDEFINED ? undefined : result;\n      }\n      return hasOwnProperty$2.call(data, key) ? data[key] : undefined;\n    }\n\n    /** Used for built-in method references. */\n    var objectProto$4 = Object.prototype;\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;\n\n    /**\n     * Checks if a hash value for `key` exists.\n     *\n     * @private\n     * @name has\n     * @memberOf Hash\n     * @param {string} key The key of the entry to check.\n     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n     */\n    function hashHas(key) {\n      var data = this.__data__;\n      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);\n    }\n\n    /** Used to stand-in for `undefined` hash values. */\n    var HASH_UNDEFINED$1 = \'__lodash_hash_undefined__\';\n\n    /**\n     * Sets the hash `key` to `value`.\n     *\n     * @private\n     * @name set\n     * @memberOf Hash\n     * @param {string} key The key of the value to set.\n     * @param {*} value The value to set.\n     * @returns {Object} Returns the hash instance.\n     */\n    function hashSet(key, value) {\n      var data = this.__data__;\n      this.size += this.has(key) ? 0 : 1;\n      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;\n      return this;\n    }\n\n    /**\n     * Creates a hash object.\n     *\n     * @private\n     * @constructor\n     * @param {Array} [entries] The key-value pairs to cache.\n     */\n    function Hash(entries) {\n      var index = -1,\n          length = entries == null ? 0 : entries.length;\n\n      this.clear();\n      while (++index < length) {\n        var entry = entries[index];\n        this.set(entry[0], entry[1]);\n      }\n    }\n\n    // Add methods to `Hash`.\n    Hash.prototype.clear = hashClear;\n    Hash.prototype[\'delete\'] = hashDelete;\n    Hash.prototype.get = hashGet;\n    Hash.prototype.has = hashHas;\n    Hash.prototype.set = hashSet;\n\n    /**\n     * Removes all key-value entries from the list cache.\n     *\n     * @private\n     * @name clear\n     * @memberOf ListCache\n     */\n    function listCacheClear() {\n      this.__data__ = [];\n      this.size = 0;\n    }\n\n    /**\n     * Performs a\n     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)\n     * comparison between two values to determine if they are equivalent.\n     *\n     * @static\n     * @memberOf _\n     * @since 4.0.0\n     * @category Lang\n     * @param {*} value The value to compare.\n     * @param {*} other The other value to compare.\n     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\n     * @example\n     *\n     * var object = { \'a\': 1 };\n     * var other = { \'a\': 1 };\n     *\n     * _.eq(object, object);\n     * // => true\n     *\n     * _.eq(object, other);\n     * // => false\n     *\n     * _.eq(\'a\', \'a\');\n     * // => true\n     *\n     * _.eq(\'a\', Object(\'a\'));\n     * // => false\n     *\n     * _.eq(NaN, NaN);\n     * // => true\n     */\n    function eq(value, other) {\n      return value === other || (value !== value && other !== other);\n    }\n\n    /**\n     * Gets the index at which the `key` is found in `array` of key-value pairs.\n     *\n     * @private\n     * @param {Array} array The array to inspect.\n     * @param {*} key The key to search for.\n     * @returns {number} Returns the index of the matched value, else `-1`.\n     */\n    function assocIndexOf(array, key) {\n      var length = array.length;\n      while (length--) {\n        if (eq(array[length][0], key)) {\n          return length;\n        }\n      }\n      return -1;\n    }\n\n    /** Used for built-in method references. */\n    var arrayProto = Array.prototype;\n\n    /** Built-in value references. */\n    var splice = arrayProto.splice;\n\n    /**\n     * Removes `key` and its value from the list cache.\n     *\n     * @private\n     * @name delete\n     * @memberOf ListCache\n     * @param {string} key The key of the value to remove.\n     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n     */\n    function listCacheDelete(key) {\n      var data = this.__data__,\n          index = assocIndexOf(data, key);\n\n      if (index < 0) {\n        return false;\n      }\n      var lastIndex = data.length - 1;\n      if (index == lastIndex) {\n        data.pop();\n      } else {\n        splice.call(data, index, 1);\n      }\n      --this.size;\n      return true;\n    }\n\n    /**\n     * Gets the list cache value for `key`.\n     *\n     * @private\n     * @name get\n     * @memberOf ListCache\n     * @param {string} key The key of the value to get.\n     * @returns {*} Returns the entry value.\n     */\n    function listCacheGet(key) {\n      var data = this.__data__,\n          index = assocIndexOf(data, key);\n\n      return index < 0 ? undefined : data[index][1];\n    }\n\n    /**\n     * Checks if a list cache value for `key` exists.\n     *\n     * @private\n     * @name has\n     * @memberOf ListCache\n     * @param {string} key The key of the entry to check.\n     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n     */\n    function listCacheHas(key) {\n      return assocIndexOf(this.__data__, key) > -1;\n    }\n\n    /**\n     * Sets the list cache `key` to `value`.\n     *\n     * @private\n     * @name set\n     * @memberOf ListCache\n     * @param {string} key The key of the value to set.\n     * @param {*} value The value to set.\n     * @returns {Object} Returns the list cache instance.\n     */\n    function listCacheSet(key, value) {\n      var data = this.__data__,\n          index = assocIndexOf(data, key);\n\n      if (index < 0) {\n        ++this.size;\n        data.push([key, value]);\n      } else {\n        data[index][1] = value;\n      }\n      return this;\n    }\n\n    /**\n     * Creates an list cache object.\n     *\n     * @private\n     * @constructor\n     * @param {Array} [entries] The key-value pairs to cache.\n     */\n    function ListCache(entries) {\n      var index = -1,\n          length = entries == null ? 0 : entries.length;\n\n      this.clear();\n      while (++index < length) {\n        var entry = entries[index];\n        this.set(entry[0], entry[1]);\n      }\n    }\n\n    // Add methods to `ListCache`.\n    ListCache.prototype.clear = listCacheClear;\n    ListCache.prototype[\'delete\'] = listCacheDelete;\n    ListCache.prototype.get = listCacheGet;\n    ListCache.prototype.has = listCacheHas;\n    ListCache.prototype.set = listCacheSet;\n\n    /* Built-in method references that are verified to be native. */\n    var Map = getNative(root, \'Map\');\n\n    /**\n     * Removes all key-value entries from the map.\n     *\n     * @private\n     * @name clear\n     * @memberOf MapCache\n     */\n    function mapCacheClear() {\n      this.size = 0;\n      this.__data__ = {\n        \'hash\': new Hash,\n        \'map\': new (Map || ListCache),\n        \'string\': new Hash\n      };\n    }\n\n    /**\n     * Checks if `value` is suitable for use as unique object key.\n     *\n     * @private\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.\n     */\n    function isKeyable(value) {\n      var type = typeof value;\n      return (type == \'string\' || type == \'number\' || type == \'symbol\' || type == \'boolean\')\n        ? (value !== \'__proto__\')\n        : (value === null);\n    }\n\n    /**\n     * Gets the data for `map`.\n     *\n     * @private\n     * @param {Object} map The map to query.\n     * @param {string} key The reference key.\n     * @returns {*} Returns the map data.\n     */\n    function getMapData(map, key) {\n      var data = map.__data__;\n      return isKeyable(key)\n        ? data[typeof key == \'string\' ? \'string\' : \'hash\']\n        : data.map;\n    }\n\n    /**\n     * Removes `key` and its value from the map.\n     *\n     * @private\n     * @name delete\n     * @memberOf MapCache\n     * @param {string} key The key of the value to remove.\n     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n     */\n    function mapCacheDelete(key) {\n      var result = getMapData(this, key)[\'delete\'](key);\n      this.size -= result ? 1 : 0;\n      return result;\n    }\n\n    /**\n     * Gets the map value for `key`.\n     *\n     * @private\n     * @name get\n     * @memberOf MapCache\n     * @param {string} key The key of the value to get.\n     * @returns {*} Returns the entry value.\n     */\n    function mapCacheGet(key) {\n      return getMapData(this, key).get(key);\n    }\n\n    /**\n     * Checks if a map value for `key` exists.\n     *\n     * @private\n     * @name has\n     * @memberOf MapCache\n     * @param {string} key The key of the entry to check.\n     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n     */\n    function mapCacheHas(key) {\n      return getMapData(this, key).has(key);\n    }\n\n    /**\n     * Sets the map `key` to `value`.\n     *\n     * @private\n     * @name set\n     * @memberOf MapCache\n     * @param {string} key The key of the value to set.\n     * @param {*} value The value to set.\n     * @returns {Object} Returns the map cache instance.\n     */\n    function mapCacheSet(key, value) {\n      var data = getMapData(this, key),\n          size = data.size;\n\n      data.set(key, value);\n      this.size += data.size == size ? 0 : 1;\n      return this;\n    }\n\n    /**\n     * Creates a map cache object to store key-value pairs.\n     *\n     * @private\n     * @constructor\n     * @param {Array} [entries] The key-value pairs to cache.\n     */\n    function MapCache(entries) {\n      var index = -1,\n          length = entries == null ? 0 : entries.length;\n\n      this.clear();\n      while (++index < length) {\n        var entry = entries[index];\n        this.set(entry[0], entry[1]);\n      }\n    }\n\n    // Add methods to `MapCache`.\n    MapCache.prototype.clear = mapCacheClear;\n    MapCache.prototype[\'delete\'] = mapCacheDelete;\n    MapCache.prototype.get = mapCacheGet;\n    MapCache.prototype.has = mapCacheHas;\n    MapCache.prototype.set = mapCacheSet;\n\n    /** Error message constants. */\n    var FUNC_ERROR_TEXT = \'Expected a function\';\n\n    /**\n     * Creates a function that memoizes the result of `func`. If `resolver` is\n     * provided, it determines the cache key for storing the result based on the\n     * arguments provided to the memoized function. By default, the first argument\n     * provided to the memoized function is used as the map cache key. The `func`\n     * is invoked with the `this` binding of the memoized function.\n     *\n     * **Note:** The cache is exposed as the `cache` property on the memoized\n     * function. Its creation may be customized by replacing the `_.memoize.Cache`\n     * constructor with one whose instances implement the\n     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)\n     * method interface of `clear`, `delete`, `get`, `has`, and `set`.\n     *\n     * @static\n     * @memberOf _\n     * @since 0.1.0\n     * @category Function\n     * @param {Function} func The function to have its output memoized.\n     * @param {Function} [resolver] The function to resolve the cache key.\n     * @returns {Function} Returns the new memoized function.\n     * @example\n     *\n     * var object = { \'a\': 1, \'b\': 2 };\n     * var other = { \'c\': 3, \'d\': 4 };\n     *\n     * var values = _.memoize(_.values);\n     * values(object);\n     * // => [1, 2]\n     *\n     * values(other);\n     * // => [3, 4]\n     *\n     * object.a = 2;\n     * values(object);\n     * // => [1, 2]\n     *\n     * // Modify the result cache.\n     * values.cache.set(object, [\'a\', \'b\']);\n     * values(object);\n     * // => [\'a\', \'b\']\n     *\n     * // Replace `_.memoize.Cache`.\n     * _.memoize.Cache = WeakMap;\n     */\n    function memoize(func, resolver) {\n      if (typeof func != \'function\' || (resolver != null && typeof resolver != \'function\')) {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      var memoized = function() {\n        var args = arguments,\n            key = resolver ? resolver.apply(this, args) : args[0],\n            cache = memoized.cache;\n\n        if (cache.has(key)) {\n          return cache.get(key);\n        }\n        var result = func.apply(this, args);\n        memoized.cache = cache.set(key, result) || cache;\n        return result;\n      };\n      memoized.cache = new (memoize.Cache || MapCache);\n      return memoized;\n    }\n\n    // Expose `MapCache`.\n    memoize.Cache = MapCache;\n\n    const numberToByteArray = (num, byteLength = getNumberByteLength(num)) => {\n        var byteArray;\n        if (byteLength == 1) {\n            byteArray = new DataView(new ArrayBuffer(1));\n            byteArray.setUint8(0, num);\n        }\n        else if (byteLength == 2) {\n            byteArray = new DataView(new ArrayBuffer(2));\n            byteArray.setUint16(0, num);\n        }\n        else if (byteLength == 3) {\n            byteArray = new DataView(new ArrayBuffer(3));\n            byteArray.setUint8(0, num >> 16);\n            byteArray.setUint16(1, num & 0xffff);\n        }\n        else if (byteLength == 4) {\n            byteArray = new DataView(new ArrayBuffer(4));\n            byteArray.setUint32(0, num);\n        }\n        else if (num < 0xffffffff) {\n            byteArray = new DataView(new ArrayBuffer(5));\n            byteArray.setUint32(1, num);\n        }\n        else if (byteLength == 5) {\n            byteArray = new DataView(new ArrayBuffer(5));\n            byteArray.setUint8(0, num / 0x100000000 | 0);\n            byteArray.setUint32(1, num % 0x100000000);\n        }\n        else if (byteLength == 6) {\n            byteArray = new DataView(new ArrayBuffer(6));\n            byteArray.setUint16(0, num / 0x100000000 | 0);\n            byteArray.setUint32(2, num % 0x100000000);\n        }\n        else if (byteLength == 7) {\n            byteArray = new DataView(new ArrayBuffer(7));\n            byteArray.setUint8(0, num / 0x1000000000000 | 0);\n            byteArray.setUint16(1, num / 0x100000000 & 0xffff);\n            byteArray.setUint32(3, num % 0x100000000);\n        }\n        else if (byteLength == 8) {\n            byteArray = new DataView(new ArrayBuffer(8));\n            byteArray.setUint32(0, num / 0x100000000 | 0);\n            byteArray.setUint32(4, num % 0x100000000);\n        }\n        else {\n            throw new Error("EBML.typedArrayUtils.numberToByteArray: byte length must be less than or equal to 8");\n        }\n        return new Uint8Array(byteArray.buffer);\n    };\n    const stringToByteArray = memoize((str) => {\n        return Uint8Array.from(Array.from(str).map(_ => _.codePointAt(0)));\n    });\n    function getNumberByteLength(num) {\n        if (num < 0) {\n            throw new Error("EBML.typedArrayUtils.getNumberByteLength: negative number not implemented");\n        }\n        else if (num < 0x100) {\n            return 1;\n        }\n        else if (num < 0x10000) {\n            return 2;\n        }\n        else if (num < 0x1000000) {\n            return 3;\n        }\n        else if (num < 0x100000000) {\n            return 4;\n        }\n        else if (num < 0x10000000000) {\n            return 5;\n        }\n        else if (num < 0x1000000000000) {\n            return 6;\n        }\n        else if (num < 0x20000000000000) {\n            return 7;\n        }\n        else {\n            throw new Error("EBML.typedArrayUtils.getNumberByteLength: number exceeds Number.MAX_SAFE_INTEGER");\n        }\n    }\n    const int16Bit = memoize((num) => {\n        const ab = new ArrayBuffer(2);\n        new DataView(ab).setInt16(0, num);\n        return new Uint8Array(ab);\n    });\n    const float32bit = memoize((num) => {\n        const ab = new ArrayBuffer(4);\n        new DataView(ab).setFloat32(0, num);\n        return new Uint8Array(ab);\n    });\n    const dumpBytes = (b) => {\n        return Array.from(new Uint8Array(b)).map(_ => `0x${_.toString(16)}`).join(", ");\n    };\n\n    class Value {\n        constructor(bytes) {\n            this.bytes = bytes;\n        }\n        write(buf, pos) {\n            buf.set(this.bytes, pos);\n            return pos + this.bytes.length;\n        }\n        countSize() {\n            return this.bytes.length;\n        }\n    }\n    class Element {\n        constructor(id, children, isSizeUnknown) {\n            this.id = id;\n            this.children = children;\n            const bodySize = this.children.reduce((p, c) => p + c.countSize(), 0);\n            this.sizeMetaData = isSizeUnknown ?\n                UNKNOWN_SIZE :\n                vintEncode(numberToByteArray(bodySize, getEBMLByteLength(bodySize)));\n            this.size = this.id.length + this.sizeMetaData.length + bodySize;\n        }\n        write(buf, pos) {\n            buf.set(this.id, pos);\n            buf.set(this.sizeMetaData, pos + this.id.length);\n            return this.children.reduce((p, c) => c.write(buf, p), pos + this.id.length + this.sizeMetaData.length);\n        }\n        countSize() {\n            return this.size;\n        }\n    }\n    const bytes = memoize((data) => {\n        return new Value(data);\n    });\n    const number = memoize((num) => {\n        return bytes(numberToByteArray(num));\n    });\n    const vintEncodedNumber = memoize((num) => {\n        return bytes(vintEncode(numberToByteArray(num, getEBMLByteLength(num))));\n    });\n    const int16 = memoize((num) => {\n        return bytes(int16Bit(num));\n    });\n    const float = memoize((num) => {\n        return bytes(float32bit(num));\n    });\n    const string = memoize((str) => {\n        return bytes(stringToByteArray(str));\n    });\n    const element = (id, child) => {\n        return new Element(id, Array.isArray(child) ? child : [child], false);\n    };\n    const unknownSizeElement = (id, child) => {\n        return new Element(id, Array.isArray(child) ? child : [child], true);\n    };\n    const build = (v) => {\n        const b = new Uint8Array(v.countSize());\n        v.write(b, 0);\n        return b;\n    };\n    const getEBMLByteLength = (num) => {\n        if (num < 0x7f) {\n            return 1;\n        }\n        else if (num < 0x3fff) {\n            return 2;\n        }\n        else if (num < 0x1fffff) {\n            return 3;\n        }\n        else if (num < 0xfffffff) {\n            return 4;\n        }\n        else if (num < 0x7ffffffff) {\n            return 5;\n        }\n        else if (num < 0x3ffffffffff) {\n            return 6;\n        }\n        else if (num < 0x1ffffffffffff) {\n            return 7;\n        }\n        else if (num < 0x20000000000000) {\n            return 8;\n        }\n        else if (num < 0xffffffffffffff) {\n            throw new Error("EBMLgetEBMLByteLength: number exceeds Number.MAX_SAFE_INTEGER");\n        }\n        else {\n            throw new Error("EBMLgetEBMLByteLength: data size must be less than or equal to " + (Math.pow(2, 56) - 2));\n        }\n    };\n    const UNKNOWN_SIZE = new Uint8Array([0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);\n    const vintEncode = (byteArray) => {\n        byteArray[0] = getSizeMask(byteArray.length) | byteArray[0];\n        return byteArray;\n    };\n    const getSizeMask = (byteLength) => {\n        return 0x80 >> (byteLength - 1);\n    };\n\n    /**\n     * @see https://www.matroska.org/technical/specs/index.html\n     */\n    const ID = {\n        EBML: Uint8Array.of(0x1A, 0x45, 0xDF, 0xA3),\n        EBMLVersion: Uint8Array.of(0x42, 0x86),\n        EBMLReadVersion: Uint8Array.of(0x42, 0xF7),\n        EBMLMaxIDLength: Uint8Array.of(0x42, 0xF2),\n        EBMLMaxSizeLength: Uint8Array.of(0x42, 0xF3),\n        DocType: Uint8Array.of(0x42, 0x82),\n        DocTypeVersion: Uint8Array.of(0x42, 0x87),\n        DocTypeReadVersion: Uint8Array.of(0x42, 0x85),\n        Void: Uint8Array.of(0xEC),\n        CRC32: Uint8Array.of(0xBF),\n        Segment: Uint8Array.of(0x18, 0x53, 0x80, 0x67),\n        SeekHead: Uint8Array.of(0x11, 0x4D, 0x9B, 0x74),\n        Seek: Uint8Array.of(0x4D, 0xBB),\n        SeekID: Uint8Array.of(0x53, 0xAB),\n        SeekPosition: Uint8Array.of(0x53, 0xAC),\n        Info: Uint8Array.of(0x15, 0x49, 0xA9, 0x66),\n        SegmentUID: Uint8Array.of(0x73, 0xA4),\n        SegmentFilename: Uint8Array.of(0x73, 0x84),\n        PrevUID: Uint8Array.of(0x3C, 0xB9, 0x23),\n        PrevFilename: Uint8Array.of(0x3C, 0x83, 0xAB),\n        NextUID: Uint8Array.of(0x3E, 0xB9, 0x23),\n        NextFilename: Uint8Array.of(0x3E, 0x83, 0xBB),\n        SegmentFamily: Uint8Array.of(0x44, 0x44),\n        ChapterTranslate: Uint8Array.of(0x69, 0x24),\n        ChapterTranslateEditionUID: Uint8Array.of(0x69, 0xFC),\n        ChapterTranslateCodec: Uint8Array.of(0x69, 0xBF),\n        ChapterTranslateID: Uint8Array.of(0x69, 0xA5),\n        TimecodeScale: Uint8Array.of(0x2A, 0xD7, 0xB1),\n        Duration: Uint8Array.of(0x44, 0x89),\n        DateUTC: Uint8Array.of(0x44, 0x61),\n        Title: Uint8Array.of(0x7B, 0xA9),\n        MuxingApp: Uint8Array.of(0x4D, 0x80),\n        WritingApp: Uint8Array.of(0x57, 0x41),\n        Cluster: Uint8Array.of(0x1F, 0x43, 0xB6, 0x75),\n        Timecode: Uint8Array.of(0xE7),\n        SilentTracks: Uint8Array.of(0x58, 0x54),\n        SilentTrackNumber: Uint8Array.of(0x58, 0xD7),\n        Position: Uint8Array.of(0xA7),\n        PrevSize: Uint8Array.of(0xAB),\n        SimpleBlock: Uint8Array.of(0xA3),\n        BlockGroup: Uint8Array.of(0xA0),\n        Block: Uint8Array.of(0xA1),\n        BlockAdditions: Uint8Array.of(0x75, 0xA1),\n        BlockMore: Uint8Array.of(0xA6),\n        BlockAddID: Uint8Array.of(0xEE),\n        BlockAdditional: Uint8Array.of(0xA5),\n        BlockDuration: Uint8Array.of(0x9B),\n        ReferencePriority: Uint8Array.of(0xFA),\n        ReferenceBlock: Uint8Array.of(0xFB),\n        CodecState: Uint8Array.of(0xA4),\n        DiscardPadding: Uint8Array.of(0x75, 0xA2),\n        Slices: Uint8Array.of(0x8E),\n        TimeSlice: Uint8Array.of(0xE8),\n        LaceNumber: Uint8Array.of(0xCC),\n        Tracks: Uint8Array.of(0x16, 0x54, 0xAE, 0x6B),\n        TrackEntry: Uint8Array.of(0xAE),\n        TrackNumber: Uint8Array.of(0xD7),\n        TrackUID: Uint8Array.of(0x73, 0xC5),\n        TrackType: Uint8Array.of(0x83),\n        FlagEnabled: Uint8Array.of(0xB9),\n        FlagDefault: Uint8Array.of(0x88),\n        FlagForced: Uint8Array.of(0x55, 0xAA),\n        FlagLacing: Uint8Array.of(0x9C),\n        MinCache: Uint8Array.of(0x6D, 0xE7),\n        MaxCache: Uint8Array.of(0x6D, 0xF8),\n        DefaultDuration: Uint8Array.of(0x23, 0xE3, 0x83),\n        DefaultDecodedFieldDuration: Uint8Array.of(0x23, 0x4E, 0x7A),\n        MaxBlockAdditionID: Uint8Array.of(0x55, 0xEE),\n        Name: Uint8Array.of(0x53, 0x6E),\n        Language: Uint8Array.of(0x22, 0xB5, 0x9C),\n        CodecID: Uint8Array.of(0x86),\n        CodecPrivate: Uint8Array.of(0x63, 0xA2),\n        CodecName: Uint8Array.of(0x25, 0x86, 0x88),\n        AttachmentLink: Uint8Array.of(0x74, 0x46),\n        CodecDecodeAll: Uint8Array.of(0xAA),\n        TrackOverlay: Uint8Array.of(0x6F, 0xAB),\n        CodecDelay: Uint8Array.of(0x56, 0xAA),\n        SeekPreRoll: Uint8Array.of(0x56, 0xBB),\n        TrackTranslate: Uint8Array.of(0x66, 0x24),\n        TrackTranslateEditionUID: Uint8Array.of(0x66, 0xFC),\n        TrackTranslateCodec: Uint8Array.of(0x66, 0xBF),\n        TrackTranslateTrackID: Uint8Array.of(0x66, 0xA5),\n        Video: Uint8Array.of(0xE0),\n        FlagInterlaced: Uint8Array.of(0x9A),\n        FieldOrder: Uint8Array.of(0x9D),\n        StereoMode: Uint8Array.of(0x53, 0xB8),\n        AlphaMode: Uint8Array.of(0x53, 0xC0),\n        PixelWidth: Uint8Array.of(0xB0),\n        PixelHeight: Uint8Array.of(0xBA),\n        PixelCropBottom: Uint8Array.of(0x54, 0xAA),\n        PixelCropTop: Uint8Array.of(0x54, 0xBB),\n        PixelCropLeft: Uint8Array.of(0x54, 0xCC),\n        PixelCropRight: Uint8Array.of(0x54, 0xDD),\n        DisplayWidth: Uint8Array.of(0x54, 0xB0),\n        DisplayHeight: Uint8Array.of(0x54, 0xBA),\n        DisplayUnit: Uint8Array.of(0x54, 0xB2),\n        AspectRatioType: Uint8Array.of(0x54, 0xB3),\n        ColourSpace: Uint8Array.of(0x2E, 0xB5, 0x24),\n        Colour: Uint8Array.of(0x55, 0xB0),\n        MatrixCoefficients: Uint8Array.of(0x55, 0xB1),\n        BitsPerChannel: Uint8Array.of(0x55, 0xB2),\n        ChromaSubsamplingHorz: Uint8Array.of(0x55, 0xB3),\n        ChromaSubsamplingVert: Uint8Array.of(0x55, 0xB4),\n        CbSubsamplingHorz: Uint8Array.of(0x55, 0xB5),\n        CbSubsamplingVert: Uint8Array.of(0x55, 0xB6),\n        ChromaSitingHorz: Uint8Array.of(0x55, 0xB7),\n        ChromaSitingVert: Uint8Array.of(0x55, 0xB8),\n        Range: Uint8Array.of(0x55, 0xB9),\n        TransferCharacteristics: Uint8Array.of(0x55, 0xBA),\n        Primaries: Uint8Array.of(0x55, 0xBB),\n        MaxCLL: Uint8Array.of(0x55, 0xBC),\n        MaxFALL: Uint8Array.of(0x55, 0xBD),\n        MasteringMetadata: Uint8Array.of(0x55, 0xD0),\n        PrimaryRChromaticityX: Uint8Array.of(0x55, 0xD1),\n        PrimaryRChromaticityY: Uint8Array.of(0x55, 0xD2),\n        PrimaryGChromaticityX: Uint8Array.of(0x55, 0xD3),\n        PrimaryGChromaticityY: Uint8Array.of(0x55, 0xD4),\n        PrimaryBChromaticityX: Uint8Array.of(0x55, 0xD5),\n        PrimaryBChromaticityY: Uint8Array.of(0x55, 0xD6),\n        WhitePointChromaticityX: Uint8Array.of(0x55, 0xD7),\n        WhitePointChromaticityY: Uint8Array.of(0x55, 0xD8),\n        LuminanceMax: Uint8Array.of(0x55, 0xD9),\n        LuminanceMin: Uint8Array.of(0x55, 0xDA),\n        Audio: Uint8Array.of(0xE1),\n        SamplingFrequency: Uint8Array.of(0xB5),\n        OutputSamplingFrequency: Uint8Array.of(0x78, 0xB5),\n        Channels: Uint8Array.of(0x9F),\n        BitDepth: Uint8Array.of(0x62, 0x64),\n        TrackOperation: Uint8Array.of(0xE2),\n        TrackCombinePlanes: Uint8Array.of(0xE3),\n        TrackPlane: Uint8Array.of(0xE4),\n        TrackPlaneUID: Uint8Array.of(0xE5),\n        TrackPlaneType: Uint8Array.of(0xE6),\n        TrackJoinBlocks: Uint8Array.of(0xE9),\n        TrackJoinUID: Uint8Array.of(0xED),\n        ContentEncodings: Uint8Array.of(0x6D, 0x80),\n        ContentEncoding: Uint8Array.of(0x62, 0x40),\n        ContentEncodingOrder: Uint8Array.of(0x50, 0x31),\n        ContentEncodingScope: Uint8Array.of(0x50, 0x32),\n        ContentEncodingType: Uint8Array.of(0x50, 0x33),\n        ContentCompression: Uint8Array.of(0x50, 0x34),\n        ContentCompAlgo: Uint8Array.of(0x42, 0x54),\n        ContentCompSettings: Uint8Array.of(0x42, 0x55),\n        ContentEncryption: Uint8Array.of(0x50, 0x35),\n        ContentEncAlgo: Uint8Array.of(0x47, 0xE1),\n        ContentEncKeyID: Uint8Array.of(0x47, 0xE2),\n        ContentSignature: Uint8Array.of(0x47, 0xE3),\n        ContentSigKeyID: Uint8Array.of(0x47, 0xE4),\n        ContentSigAlgo: Uint8Array.of(0x47, 0xE5),\n        ContentSigHashAlgo: Uint8Array.of(0x47, 0xE6),\n        Cues: Uint8Array.of(0x1C, 0x53, 0xBB, 0x6B),\n        CuePoint: Uint8Array.of(0xBB),\n        CueTime: Uint8Array.of(0xB3),\n        CueTrackPositions: Uint8Array.of(0xB7),\n        CueTrack: Uint8Array.of(0xF7),\n        CueClusterPosition: Uint8Array.of(0xF1),\n        CueRelativePosition: Uint8Array.of(0xF0),\n        CueDuration: Uint8Array.of(0xB2),\n        CueBlockNumber: Uint8Array.of(0x53, 0x78),\n        CueCodecState: Uint8Array.of(0xEA),\n        CueReference: Uint8Array.of(0xDB),\n        CueRefTime: Uint8Array.of(0x96),\n        Attachments: Uint8Array.of(0x19, 0x41, 0xA4, 0x69),\n        AttachedFile: Uint8Array.of(0x61, 0xA7),\n        FileDescription: Uint8Array.of(0x46, 0x7E),\n        FileName: Uint8Array.of(0x46, 0x6E),\n        FileMimeType: Uint8Array.of(0x46, 0x60),\n        FileData: Uint8Array.of(0x46, 0x5C),\n        FileUID: Uint8Array.of(0x46, 0xAE),\n        Chapters: Uint8Array.of(0x10, 0x43, 0xA7, 0x70),\n        EditionEntry: Uint8Array.of(0x45, 0xB9),\n        EditionUID: Uint8Array.of(0x45, 0xBC),\n        EditionFlagHidden: Uint8Array.of(0x45, 0xBD),\n        EditionFlagDefault: Uint8Array.of(0x45, 0xDB),\n        EditionFlagOrdered: Uint8Array.of(0x45, 0xDD),\n        ChapterAtom: Uint8Array.of(0xB6),\n        ChapterUID: Uint8Array.of(0x73, 0xC4),\n        ChapterStringUID: Uint8Array.of(0x56, 0x54),\n        ChapterTimeStart: Uint8Array.of(0x91),\n        ChapterTimeEnd: Uint8Array.of(0x92),\n        ChapterFlagHidden: Uint8Array.of(0x98),\n        ChapterFlagEnabled: Uint8Array.of(0x45, 0x98),\n        ChapterSegmentUID: Uint8Array.of(0x6E, 0x67),\n        ChapterSegmentEditionUID: Uint8Array.of(0x6E, 0xBC),\n        ChapterPhysicalEquiv: Uint8Array.of(0x63, 0xC3),\n        ChapterTrack: Uint8Array.of(0x8F),\n        ChapterTrackNumber: Uint8Array.of(0x89),\n        ChapterDisplay: Uint8Array.of(0x80),\n        ChapString: Uint8Array.of(0x85),\n        ChapLanguage: Uint8Array.of(0x43, 0x7C),\n        ChapCountry: Uint8Array.of(0x43, 0x7E),\n        ChapProcess: Uint8Array.of(0x69, 0x44),\n        ChapProcessCodecID: Uint8Array.of(0x69, 0x55),\n        ChapProcessPrivate: Uint8Array.of(0x45, 0x0D),\n        ChapProcessCommand: Uint8Array.of(0x69, 0x11),\n        ChapProcessTime: Uint8Array.of(0x69, 0x22),\n        ChapProcessData: Uint8Array.of(0x69, 0x33),\n        Tags: Uint8Array.of(0x12, 0x54, 0xC3, 0x67),\n        Tag: Uint8Array.of(0x73, 0x73),\n        Targets: Uint8Array.of(0x63, 0xC0),\n        TargetTypeValue: Uint8Array.of(0x68, 0xCA),\n        TargetType: Uint8Array.of(0x63, 0xCA),\n        TagTrackUID: Uint8Array.of(0x63, 0xC5),\n        TagEditionUID: Uint8Array.of(0x63, 0xC9),\n        TagChapterUID: Uint8Array.of(0x63, 0xC4),\n        TagAttachmentUID: Uint8Array.of(0x63, 0xC6),\n        SimpleTag: Uint8Array.of(0x67, 0xC8),\n        TagName: Uint8Array.of(0x45, 0xA3),\n        TagLanguage: Uint8Array.of(0x44, 0x7A),\n        TagDefault: Uint8Array.of(0x44, 0x84),\n        TagString: Uint8Array.of(0x44, 0x87),\n        TagBinary: Uint8Array.of(0x44, 0x85),\n    };\n\n\n\n    var EBML = /*#__PURE__*/Object.freeze({\n        Value: Value,\n        Element: Element,\n        bytes: bytes,\n        number: number,\n        vintEncodedNumber: vintEncodedNumber,\n        int16: int16,\n        float: float,\n        string: string,\n        element: element,\n        unknownSizeElement: unknownSizeElement,\n        build: build,\n        getEBMLByteLength: getEBMLByteLength,\n        UNKNOWN_SIZE: UNKNOWN_SIZE,\n        vintEncode: vintEncode,\n        getSizeMask: getSizeMask,\n        ID: ID,\n        numberToByteArray: numberToByteArray,\n        stringToByteArray: stringToByteArray,\n        getNumberByteLength: getNumberByteLength,\n        int16Bit: int16Bit,\n        float32bit: float32bit,\n        dumpBytes: dumpBytes\n    });\n\n    /***\n     * The EMBL builder is from simple-ebml-builder\n     * \n     * Copyright 2017 ryiwamoto\n     * \n     * @author ryiwamoto, qli5\n     * \n     * Permission is hereby granted, free of charge, to any person obtaining\n     * a copy of this software and associated documentation files (the\n     * "Software"), to deal in the Software without restriction, including \n     * without limitation the rights to use, copy, modify, merge, publish, \n     * distribute, sublicense, and/or sell copies of the Software, and to \n     * permit persons to whom the Software is furnished to do so, subject \n     * to the following conditions:\n     * \n     * The above copyright notice and this permission notice shall be \n     * included in all copies or substantial portions of the Software.\n     * \n     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS \n     * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, \n     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL \n     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR \n     * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, \n     * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER \n     * DEALINGS IN THE SOFTWARE.\n     */\n\n    /***\n     * Copyright (C) 2018 Qli5. All Rights Reserved.\n     * \n     * @author qli5 <goodlq11[at](163|gmail).com>\n     * \n     * This Source Code Form is subject to the terms of the Mozilla Public\n     * License, v. 2.0. If a copy of the MPL was not distributed with this\n     * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n    */\n\n    class MKV {\n        constructor(config) {\n            this.min = true;\n            this.onprogress = null;\n            Object.assign(this, config);\n            this.segmentUID = MKV.randomBytes(16);\n            this.trackUIDBase = Math.trunc(Math.random() * 2 ** 16);\n            this.trackMetadata = { h264: null, aac: null, ass: null };\n            this.duration = 0;\n            this.blocks = { h264: [], aac: [], ass: [] };\n        }\n\n        static randomBytes(num) {\n            return Array.from(new Array(num), () => Math.trunc(Math.random() * 256));\n        }\n\n        static textToMS(str) {\n            const [, h, mm, ss, ms10] = str.match(/(\\d+):(\\d+):(\\d+).(\\d+)/);\n            return h * 3600000 + mm * 60000 + ss * 1000 + ms10 * 10;\n        }\n\n        static mimeToCodecID(str) {\n            if (str.startsWith(\'avc1\')) {\n                return \'V_MPEG4/ISO/AVC\';\n            }\n            else if (str.startsWith(\'mp4a\')) {\n                return \'A_AAC\';\n            }\n            else {\n                throw new Error(`MKVRemuxer: unknown codec ${str}`);\n            }\n        }\n\n        static uint8ArrayConcat(...array) {\n            // if (Array.isArray(array[0])) array = array[0];\n            if (array.length == 1) return array[0];\n            if (typeof Buffer != \'undefined\') return Buffer.concat(array);\n            const ret = new Uint8Array(array.reduce((i, j) => i + j.byteLength, 0));\n            let length = 0;\n            for (let e of array) {\n                ret.set(e, length);\n                length += e.byteLength;\n            }\n            return ret;\n        }\n\n        addH264Metadata(h264) {\n            this.trackMetadata.h264 = {\n                codecId: MKV.mimeToCodecID(h264.codec),\n                codecPrivate: h264.avcc,\n                defaultDuration: h264.refSampleDuration * 1000000,\n                pixelWidth: h264.codecWidth,\n                pixelHeight: h264.codecHeight,\n                displayWidth: h264.presentWidth,\n                displayHeight: h264.presentHeight\n            };\n            this.duration = Math.max(this.duration, h264.duration);\n        }\n\n        addAACMetadata(aac) {\n            this.trackMetadata.aac = {\n                codecId: MKV.mimeToCodecID(aac.originalCodec),\n                codecPrivate: aac.configRaw,\n                defaultDuration: aac.refSampleDuration * 1000000,\n                samplingFrequence: aac.audioSampleRate,\n                channels: aac.channelCount\n            };\n            this.duration = Math.max(this.duration, aac.duration);\n        }\n\n        addASSMetadata(ass) {\n            this.trackMetadata.ass = {\n                codecId: \'S_TEXT/ASS\',\n                codecPrivate: new _TextEncoder().encode(ass.header)\n            };\n        }\n\n        addH264Stream(h264) {\n            this.blocks.h264 = this.blocks.h264.concat(h264.samples.map(e => ({\n                track: 1,\n                frame: MKV.uint8ArrayConcat(...e.units.map(i => i.data)),\n                isKeyframe: e.isKeyframe,\n                discardable: Boolean(e.refIdc),\n                timestamp: e.pts,\n                simple: true,\n            })));\n        }\n\n        addAACStream(aac) {\n            this.blocks.aac = this.blocks.aac.concat(aac.samples.map(e => ({\n                track: 2,\n                frame: e.unit,\n                timestamp: e.pts,\n                simple: true,\n            })));\n        }\n\n        addASSStream(ass) {\n            this.blocks.ass = this.blocks.ass.concat(ass.lines.map((e, i) => ({\n                track: 3,\n                frame: new _TextEncoder().encode(`${i},${e[\'Layer\'] || \'\'},${e[\'Style\'] || \'\'},${e[\'Name\'] || \'\'},${e[\'MarginL\'] || \'\'},${e[\'MarginR\'] || \'\'},${e[\'MarginV\'] || \'\'},${e[\'Effect\'] || \'\'},${e[\'Text\'] || \'\'}`),\n                timestamp: MKV.textToMS(e[\'Start\']),\n                duration: MKV.textToMS(e[\'End\']) - MKV.textToMS(e[\'Start\']),\n            })));\n        }\n\n        build() {\n            return new _Blob([\n                this.buildHeader(),\n                this.buildBody()\n            ]);\n        }\n\n        buildHeader() {\n            return new _Blob([EBML.build(EBML.element(EBML.ID.EBML, [\n                EBML.element(EBML.ID.EBMLVersion, EBML.number(1)),\n                EBML.element(EBML.ID.EBMLReadVersion, EBML.number(1)),\n                EBML.element(EBML.ID.EBMLMaxIDLength, EBML.number(4)),\n                EBML.element(EBML.ID.EBMLMaxSizeLength, EBML.number(8)),\n                EBML.element(EBML.ID.DocType, EBML.string(\'matroska\')),\n                EBML.element(EBML.ID.DocTypeVersion, EBML.number(4)),\n                EBML.element(EBML.ID.DocTypeReadVersion, EBML.number(2)),\n            ]))]);\n        }\n\n        buildBody() {\n            if (this.min) {\n                return new _Blob([EBML.build(EBML.element(EBML.ID.Segment, [\n                    this.getSegmentInfo(),\n                    this.getTracks(),\n                    ...this.getClusterArray()\n                ]))]);\n            }\n            else {\n                return new _Blob([EBML.build(EBML.element(EBML.ID.Segment, [\n                    this.getSeekHead(),\n                    this.getVoid(4100),\n                    this.getSegmentInfo(),\n                    this.getTracks(),\n                    this.getVoid(1100),\n                    ...this.getClusterArray()\n                ]))]);\n            }\n        }\n\n        getSeekHead() {\n            return EBML.element(EBML.ID.SeekHead, [\n                EBML.element(EBML.ID.Seek, [\n                    EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Info)),\n                    EBML.element(EBML.ID.SeekPosition, EBML.number(4050))\n                ]),\n                EBML.element(EBML.ID.Seek, [\n                    EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Tracks)),\n                    EBML.element(EBML.ID.SeekPosition, EBML.number(4200))\n                ]),\n            ]);\n        }\n\n        getVoid(length = 2000) {\n            return EBML.element(EBML.ID.Void, EBML.bytes(new Uint8Array(length)));\n        }\n\n        getSegmentInfo() {\n            return EBML.element(EBML.ID.Info, [\n                EBML.element(EBML.ID.TimecodeScale, EBML.number(1000000)),\n                EBML.element(EBML.ID.MuxingApp, EBML.string(\'flv.js + assparser_qli5 -> simple-ebml-builder\')),\n                EBML.element(EBML.ID.WritingApp, EBML.string(\'flvass2mkv.js by qli5\')),\n                EBML.element(EBML.ID.Duration, EBML.float(this.duration)),\n                EBML.element(EBML.ID.SegmentUID, EBML.bytes(this.segmentUID)),\n            ]);\n        }\n\n        getTracks() {\n            return EBML.element(EBML.ID.Tracks, [\n                this.getVideoTrackEntry(),\n                this.getAudioTrackEntry(),\n                this.getSubtitleTrackEntry()\n            ]);\n        }\n\n        getVideoTrackEntry() {\n            return EBML.element(EBML.ID.TrackEntry, [\n                EBML.element(EBML.ID.TrackNumber, EBML.number(1)),\n                EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 1)),\n                EBML.element(EBML.ID.TrackType, EBML.number(0x01)),\n                EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.h264.codecId)),\n                EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.h264.codecPrivate)),\n                EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.h264.defaultDuration)),\n                EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n                EBML.element(EBML.ID.Video, [\n                    EBML.element(EBML.ID.PixelWidth, EBML.number(this.trackMetadata.h264.pixelWidth)),\n                    EBML.element(EBML.ID.PixelHeight, EBML.number(this.trackMetadata.h264.pixelHeight)),\n                    EBML.element(EBML.ID.DisplayWidth, EBML.number(this.trackMetadata.h264.displayWidth)),\n                    EBML.element(EBML.ID.DisplayHeight, EBML.number(this.trackMetadata.h264.displayHeight)),\n                ]),\n            ]);\n        }\n\n        getAudioTrackEntry() {\n            return EBML.element(EBML.ID.TrackEntry, [\n                EBML.element(EBML.ID.TrackNumber, EBML.number(2)),\n                EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 2)),\n                EBML.element(EBML.ID.TrackType, EBML.number(0x02)),\n                EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.aac.codecId)),\n                EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.aac.codecPrivate)),\n                EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.aac.defaultDuration)),\n                EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n                EBML.element(EBML.ID.Audio, [\n                    EBML.element(EBML.ID.SamplingFrequency, EBML.float(this.trackMetadata.aac.samplingFrequence)),\n                    EBML.element(EBML.ID.Channels, EBML.number(this.trackMetadata.aac.channels)),\n                ]),\n            ]);\n        }\n\n        getSubtitleTrackEntry() {\n            return EBML.element(EBML.ID.TrackEntry, [\n                EBML.element(EBML.ID.TrackNumber, EBML.number(3)),\n                EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 3)),\n                EBML.element(EBML.ID.TrackType, EBML.number(0x11)),\n                EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.ass.codecId)),\n                EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.ass.codecPrivate)),\n                EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n            ]);\n        }\n\n        getClusterArray() {\n            // H264 codecState\n            this.blocks.h264[0].simple = false;\n            this.blocks.h264[0].codecState = this.trackMetadata.h264.codecPrivate;\n\n            let i = 0;\n            let j = 0;\n            let k = 0;\n            let clusterTimeCode = 0;\n            let clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];\n            let ret = [clusterContent];\n            const progressThrottler = Math.pow(2, Math.floor(Math.log(this.blocks.h264.length >> 7) / Math.log(2))) - 1;\n            for (i = 0; i < this.blocks.h264.length; i++) {\n                const e = this.blocks.h264[i];\n                for (; j < this.blocks.aac.length; j++) {\n                    if (this.blocks.aac[j].timestamp < e.timestamp) {\n                        clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));\n                    }\n                    else {\n                        break;\n                    }\n                }\n                for (; k < this.blocks.ass.length; k++) {\n                    if (this.blocks.ass[k].timestamp < e.timestamp) {\n                        clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));\n                    }\n                    else {\n                        break;\n                    }\n                }\n                if (e.isKeyframe/*  || clusterContent.length > 72 */) {\n                    // start new cluster\n                    clusterTimeCode = e.timestamp;\n                    clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];\n                    ret.push(clusterContent);\n                }\n                clusterContent.push(this.getBlocks(e, clusterTimeCode));\n                if (this.onprogress && !(i & progressThrottler)) this.onprogress({ loaded: i, total: this.blocks.h264.length });\n            }\n            for (; j < this.blocks.aac.length; j++) clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));\n            for (; k < this.blocks.ass.length; k++) clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));\n            if (this.onprogress) this.onprogress({ loaded: i, total: this.blocks.h264.length });\n            if (ret[0].length == 1) ret.shift();\n            ret = ret.map(clusterContent => EBML.element(EBML.ID.Cluster, clusterContent));\n\n            return ret;\n        }\n\n        getBlocks(e, clusterTimeCode) {\n            if (e.simple) {\n                return EBML.element(EBML.ID.SimpleBlock, [\n                    EBML.vintEncodedNumber(e.track),\n                    EBML.int16(e.timestamp - clusterTimeCode),\n                    EBML.bytes(e.isKeyframe ? [128] : [0]),\n                    EBML.bytes(e.frame)\n                ]);\n            }\n            else {\n                let blockGroupContent = [EBML.element(EBML.ID.Block, [\n                    EBML.vintEncodedNumber(e.track),\n                    EBML.int16(e.timestamp - clusterTimeCode),\n                    EBML.bytes([0]),\n                    EBML.bytes(e.frame)\n                ])];\n                if (typeof e.duration != \'undefined\') {\n                    blockGroupContent.push(EBML.element(EBML.ID.BlockDuration, EBML.number(e.duration)));\n                }\n                if (typeof e.codecState != \'undefined\') {\n                    blockGroupContent.push(EBML.element(EBML.ID.CodecState, EBML.bytes(e.codecState)));\n                }\n                return EBML.element(EBML.ID.BlockGroup, blockGroupContent);\n            }\n        }\n    }\n\n    /***\n     * FLV + ASS => MKV transmuxer\n     * Demux FLV into H264 + AAC stream and ASS into line stream; then\n     * remux them into a MKV file.\n     * \n     * @author qli5 <goodlq11[at](163|gmail).com>\n     * \n     * This Source Code Form is subject to the terms of the Mozilla Public\n     * License, v. 2.0. If a copy of the MPL was not distributed with this\n     * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n     * \n     * The FLV demuxer is from flv.js <https://github.com/Bilibili/flv.js/>\n     * by zheng qian <xqq@xqq.im>, licensed under Apache 2.0.\n     * \n     * The EMBL builder is from simple-ebml-builder\n     * <https://www.npmjs.com/package/simple-ebml-builder> by ryiwamoto, \n     * licensed under MIT.\n     */\n\n    const FLVASS2MKV = class {\n        constructor(config = {}) {\n            this.onflvprogress = null;\n            this.onassprogress = null;\n            this.onurlrevokesafe = null;\n            this.onfileload = null;\n            this.onmkvprogress = null;\n            this.onload = null;\n            Object.assign(this, config);\n            this.mkvConfig = { onprogress: this.onmkvprogress };\n            Object.assign(this.mkvConfig, config.mkvConfig);\n        }\n\n        /**\n         * Demux FLV into H264 + AAC stream and ASS into line stream; then\n         * remux them into a MKV file.\n         * @param {Blob|string|ArrayBuffer} flv \n         * @param {Blob|string|ArrayBuffer} ass \n         */\n        async build(flv = \'./samples/gen_case.flv\', ass = \'./samples/gen_case.ass\') {\n            // load flv and ass as arraybuffer\n            await Promise.all([\n                new Promise((r, j) => {\n                    if (flv instanceof _Blob) {\n                        const e = new FileReader();\n                        e.onprogress = this.onflvprogress;\n                        e.onload = () => r(flv = e.result);\n                        e.onerror = j;\n                        e.readAsArrayBuffer(flv);\n                    }\n                    else if (typeof flv == \'string\') {\n                        const e = new XMLHttpRequest();\n                        e.responseType = \'arraybuffer\';\n                        e.onprogress = this.onflvprogress;\n                        e.onload = () => r(flv = e.response);\n                        e.onerror = j;\n                        e.open(\'get\', flv);\n                        e.send();\n                        flv = 2; // onurlrevokesafe\n                    }\n                    else if (flv instanceof ArrayBuffer) {\n                        r(flv);\n                    }\n                    else {\n                        j(new TypeError(\'flvass2mkv: flv {Blob|string|ArrayBuffer}\'));\n                    }\n                    if (typeof ass != \'string\' && this.onurlrevokesafe) this.onurlrevokesafe();\n                }),\n                new Promise((r, j) => {\n                    if (ass instanceof _Blob) {\n                        const e = new FileReader();\n                        e.onprogress = this.onflvprogress;\n                        e.onload = () => r(ass = e.result);\n                        e.onerror = j;\n                        e.readAsArrayBuffer(ass);\n                    }\n                    else if (typeof ass == \'string\') {\n                        const e = new XMLHttpRequest();\n                        e.responseType = \'arraybuffer\';\n                        e.onprogress = this.onflvprogress;\n                        e.onload = () => r(ass = e.response);\n                        e.onerror = j;\n                        e.open(\'get\', ass);\n                        e.send();\n                        ass = 2; // onurlrevokesafe\n                    }\n                    else if (ass instanceof ArrayBuffer) {\n                        r(ass);\n                    }\n                    else {\n                        j(new TypeError(\'flvass2mkv: ass {Blob|string|ArrayBuffer}\'));\n                    }\n                    if (typeof flv != \'string\' && this.onurlrevokesafe) this.onurlrevokesafe();\n                }),\n            ]);\n            if (this.onfileload) this.onfileload();\n\n            const mkv = new MKV(this.mkvConfig);\n\n            const assParser = new ASS();\n            ass = assParser.parseFile(ass);\n            mkv.addASSMetadata(ass);\n            mkv.addASSStream(ass);\n\n            const flvProbeData = FLVDemuxer.probe(flv);\n            const flvDemuxer = new FLVDemuxer(flvProbeData);\n            let mediaInfo = null;\n            let h264 = null;\n            let aac = null;\n            flvDemuxer.onDataAvailable = (...array) => {\n                array.forEach(e => {\n                    if (e.type == \'video\') h264 = e;\n                    else if (e.type == \'audio\') aac = e;\n                    else throw new Error(`MKVRemuxer: unrecoginzed data type ${e.type}`);\n                });\n            };\n            flvDemuxer.onMediaInfo = i => mediaInfo = i;\n            flvDemuxer.onTrackMetadata = (i, e) => {\n                if (i == \'video\') mkv.addH264Metadata(e);\n                else if (i == \'audio\') mkv.addAACMetadata(e);\n                else throw new Error(`MKVRemuxer: unrecoginzed metadata type ${i}`);\n            };\n            flvDemuxer.onError = e => { throw new Error(e); };\n            const finalOffset = flvDemuxer.parseChunks(flv, flvProbeData.dataOffset);\n            if (finalOffset != flv.byteLength) throw new Error(\'FLVDemuxer: unexpected EOF\');\n            mkv.addH264Stream(h264);\n            mkv.addAACStream(aac);\n\n            const ret = mkv.build();\n            if (this.onload) this.onload(ret);\n            return ret;\n        }\n    };\n\n    // if nodejs then test\n    if (typeof window == \'undefined\') {\n        if (require.main == module) {\n            (async () => {\n                const fs = require(\'fs\');\n                const assFileName = process.argv.slice(1).find(e => e.includes(\'.ass\')) || \'./samples/gen_case.ass\';\n                const flvFileName = process.argv.slice(1).find(e => e.includes(\'.flv\')) || \'./samples/gen_case.flv\';\n                const assFile = fs.readFileSync(assFileName).buffer;\n                const flvFile = fs.readFileSync(flvFileName).buffer;\n                fs.writeFileSync(\'out.mkv\', await new FLVASS2MKV({ onmkvprogress: console.log.bind(console) }).build(flvFile, assFile));\n            })();\n        }\n    }\n\n    return FLVASS2MKV;\n\n}());\n//# sourceMappingURL=index.js.map\n\n</script>\n    <script>\n        const fileProgress = document.getElementById(\'fileProgress\');\n        const mkvProgress = document.getElementById(\'mkvProgress\');\n        const a = document.getElementById(\'a\');\n        window.exec = async option => {\n            const defaultOption = {\n                onflvprogress: ({ loaded, total }) => {\n                    fileProgress.value = loaded;\n                    fileProgress.max = total;\n                },\n                onfileload: () => {\n                    console.timeEnd(\'file\');\n                    console.time(\'flvass2mkv\');\n                },\n                onmkvprogress: ({ loaded, total }) => {\n                    mkvProgress.value = loaded;\n                    mkvProgress.max = total;\n                },\n                name: \'merged.mkv\',\n            };\n            option = Object.assign(defaultOption, option);\n            a.download = a.textContent = option.name;\n            console.time(\'file\');\n            const mkv = await new FLVASS2MKV(option).build(option.flv, option.ass);\n            console.timeEnd(\'flvass2mkv\');\n            return a.href = URL.createObjectURL(mkv);\n        };\n        \n    </script>\n</body>\n\n</html>\n';

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
     */


    _createClass(MKVTransmuxer, [{
        key: 'exec',
        value: function exec(flv, ass, name) {
            // 1. Allocate for a new window
            if (!this.workerWin) this.workerWin = top.open('', undefined, ' ');

            // 2. Inject scripts
            this.workerWin.document.write(embeddedHTML);
            this.workerWin.document.close();

            // 3. Invoke exec
            if (!(this.option instanceof Object)) this.option = null;
            this.workerWin.exec(Object.assign({}, this.option, { flv: flv, ass: ass, name: name }));
            URL.revokeObjectURL(flv);
            URL.revokeObjectURL(ass);

            // 4. Free parent window
            // if (top.confirm('MKV打包中……要关掉这个窗口，释放内存吗？')) 
            top.location = 'about:blank';
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

var UI = function () {
    function UI(twin) {
        var _this45 = this;

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
            Object.values(_this45.dom).forEach(function (e) {
                return e.remove();
            });
            _this45.dom = {};
        });
        this.cidSessionDestroy.addCallback(function () {
            Object.values(_this45.cidSessionDom).forEach(function (e) {
                return e.remove();
            });
            _this45.cidSessionDom = {};
        });

        this.styleClearance();
    }

    _createClass(UI, [{
        key: 'styleClearance',
        value: function styleClearance() {
            var ret = '\n        .bilibili-player-context-menu-container.black ul.bilitwin li.context-menu-function > a:hover {\n            background: rgba(255,255,255,.12);\n            transition: all .3s ease-in-out;\n            cursor: pointer;\n        }\n\n        .bilitwin a {\n            cursor: pointer;\n            color: #00a1d6;\n        }\n\n        .bilitwin a:hover {\n            color: #f25d8e;\n        }\n\n        .bilitwin button {\n            color: #fff;\n            cursor: pointer;\n            text-align: center;\n            border-radius: 4px;\n            background-color: #00a1d6;\n            vertical-align: middle;\n            border: 1px solid #00a1d6;\n            transition: .1s;\n            transition-property: background-color,border,color;\n            user-select: none;\n        }\n\n        .bilitwin button:hover {\n            background-color: #00b5e5;\n            border-color: #00b5e5;\n        }\n\n        .bilitwin progress {\n            -webkit-appearance: progress-bar;\n            -moz-appearance: progress-bar;\n            appearance: progress-bar;\n        }\n\n        .bilitwin input[type="checkbox" i] {\n            -webkit-appearance: checkbox;\n            -moz-appearance: checkbox;\n            appearance: checkbox;\n        }\n        ';

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

            if (this.option.title) this.appendTitle();
            if (this.option.menu) this.appendMenu();
        }

        // Title Append

    }, {
        key: 'buildTitle',
        value: function buildTitle() {
            var _this46 = this;

            var monkey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin.monkey;

            // 1. build flvA, mp4A, assA
            var fontSize = '15px';
            var flvA = document.createElement('a');
            flvA.style.fontSize = fontSize;
            flvA.textContent = '\u89C6\u9891FLV';
            var assA = document.createElement('a');

            // 1.1 build flvA
            assA.style.fontSize = fontSize;
            assA.textContent = '\u5F39\u5E55ASS';
            flvA.onmouseover = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee63() {
                var href;
                return regeneratorRuntime.wrap(function _callee63$(_context64) {
                    while (1) {
                        switch (_context64.prev = _context64.next) {
                            case 0:
                                // 1.1.1 give processing hint
                                flvA.textContent = '正在FLV';
                                flvA.onmouseover = null;

                                // 1.1.2 query flv
                                _context64.next = 4;
                                return monkey.queryInfo('video');

                            case 4:
                                href = _context64.sent;

                                if (!(href == 'does_not_exist')) {
                                    _context64.next = 7;
                                    break;
                                }

                                return _context64.abrupt('return', flvA.textContent = '没有FLV视频');

                            case 7:

                                // 1.1.3 display flv
                                flvA.textContent = '视频FLV';
                                flvA.onclick = function () {
                                    return _this46.displayFLVDiv();
                                };

                            case 9:
                            case 'end':
                                return _context64.stop();
                        }
                    }
                }, _callee63, _this46);
            }));

            // 1.2 build assA
            assA.onmouseover = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee64() {
                return regeneratorRuntime.wrap(function _callee64$(_context65) {
                    while (1) {
                        switch (_context65.prev = _context65.next) {
                            case 0:
                                // 1.2.1 give processing hint
                                assA.textContent = '正在ASS';
                                assA.onmouseover = null;

                                // 1.2.2 query flv
                                _context65.next = 4;
                                return monkey.queryInfo('ass');

                            case 4:
                                assA.href = _context65.sent;


                                // 1.2.3 response mp4
                                assA.textContent = '弹幕ASS';
                                if (monkey.mp4 && monkey.mp4.match) {
                                    assA.download = monkey.mp4.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0] + '.ass';
                                } else {
                                    assA.download = monkey.cid + '.ass';
                                }

                            case 7:
                            case 'end':
                                return _context65.stop();
                        }
                    }
                }, _callee64, _this46);
            }));

            // 2. save to cache
            Object.assign(this.cidSessionDom, { flvA: flvA, assA: assA });
            return this.cidSessionDom;
        }
    }, {
        key: 'appendTitle',
        value: function appendTitle() {
            var _ref82 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cidSessionDom,
                flvA = _ref82.flvA,
                assA = _ref82.assA;

            // 1. build div
            var div = document.createElement('div');

            // 2. append to title
            div.addEventListener('click', function (e) {
                return e.stopPropagation();
            });
            div.className = 'bilitwin';
            div.append.apply(div, [flvA, ' ', assA]);
            var tminfo = document.querySelector('div.tminfo') || document.querySelector('div.info-second') || document.querySelector('div.video-data');
            tminfo.style.float = 'none';
            tminfo.parentElement.insertBefore(div, tminfo);

            // 3. save to cache
            this.cidSessionDom.titleDiv = div;

            return div;
        }
    }, {
        key: 'buildFLVDiv',
        value: function buildFLVDiv() {
            var monkey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin.monkey;

            var _this47 = this;

            var blobs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : monkey.blobs;
            var cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : monkey.cache;

            var format = blobs.shift();
            var flvs = blobs.map(function (blob) {
                return window.URL.createObjectURL(blob);
            });

            // 1. build video splits
            var flvTrs = flvs.map(function (href, index) {
                var tr = document.createElement('tr');
                {
                    var td1 = document.createElement('td');
                    var a1 = document.createElement('a');
                    a1.href = href;
                    a1.download = aid + '-' + (index + 1) + '.' + format;
                    a1.textContent = '\u89C6\u9891\u5206\u6BB5 ' + (index + 1);
                    td1.append(a1);
                    tr.append(td1);
                    var td2 = document.createElement('td');
                    var a2 = document.createElement('a');
                    a2.href = href;
                    a2.download = aid + '-' + (index + 1) + '.' + format;
                    a2.textContent = '\u53E6\u5B58\u4E3A';
                    td2.append(a2);
                    tr.append(td2);
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
                    return _this47.downloadAllFLVs({
                        a: e.target,
                        blobs: blobs,
                        monkey: monkey, table: table
                    });
                };

                a1.textContent = '\u7F13\u5B58\u5168\u90E8+\u81EA\u52A8\u5408\u5E76';
                td2.append(a1);
                tr1.append(td2);
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
                _this47.displayQuota.bind(_this47)(td1);
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
                var _ref83 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee65(e) {
                    var files, outputName, href;
                    return regeneratorRuntime.wrap(function _callee65$(_context66) {
                        while (1) {
                            switch (_context66.prev = _context66.next) {
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
                                    _context66.next = 8;
                                    return _this47.twin.mergeFLVFiles(files);

                                case 8:
                                    href = _context66.sent;

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
                                    return _context66.stop();
                            }
                        }
                    }, _callee65, _this47);
                }));

                return function (_x84) {
                    return _ref83.apply(this, arguments);
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
                    return _this47.twin.clearCacheDB(cache);
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
            var _ref85 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee66(_ref84) {
                var _this48 = this;

                var a = _ref84.a,
                    blobs = _ref84.blobs,
                    _ref84$monkey = _ref84.monkey,
                    monkey = _ref84$monkey === undefined ? this.twin.monkey : _ref84$monkey,
                    _ref84$table = _ref84.table,
                    table = _ref84$table === undefined ? this.cidSessionDom.flvTable : _ref84$table;
                var href, ass, outputName;
                return regeneratorRuntime.wrap(function _callee66$(_context67) {
                    while (1) {
                        switch (_context67.prev = _context67.next) {
                            case 0:
                                if (!this.cidSessionDom.downloadAllTr) {
                                    _context67.next = 2;
                                    break;
                                }

                                return _context67.abrupt('return');

                            case 2:

                                // 1. hang player
                                monkey.hangPlayer();

                                // 2. give hang player hint
                                this.cidSessionDom.downloadAllTr = function () {
                                    var tr1 = document.createElement('tr');
                                    var td1 = document.createElement('td');
                                    td1.colSpan = '3';
                                    td1.textContent = '\u5DF2\u5C4F\u853D\u7F51\u9875\u64AD\u653E\u5668\u7684\u7F51\u7EDC\u94FE\u63A5\u3002\u5207\u6362\u6E05\u6670\u5EA6\u53EF\u91CD\u65B0\u6FC0\u6D3B\u64AD\u653E\u5668\u3002';
                                    tr1.append(td1);
                                    return tr1;
                                }();
                                table.append(this.cidSessionDom.downloadAllTr);

                                // 3. merge splits
                                _context67.next = 7;
                                return this.twin.mergeFLVFiles(blobs);

                            case 7:
                                href = _context67.sent;
                                _context67.next = 10;
                                return monkey.ass;

                            case 10:
                                ass = _context67.sent;
                                outputName = top.document.getElementsByTagName('h1')[0].textContent.trim();

                                // 4. build download all ui

                                table.prepend(function () {
                                    var tr1 = document.createElement('tr');
                                    var td1 = document.createElement('td');
                                    td1.colSpan = '3';
                                    td1.style = 'border: 1px solid black';
                                    var a1 = document.createElement('a');
                                    a1.href = href;
                                    a1.download = outputName + '.flv';

                                    (function (a) {
                                        if (_this48.option.autoDanmaku) a.onclick = function () {
                                            return a.nextElementSibling.click();
                                        };
                                    })(a1);

                                    a1.textContent = '\u4FDD\u5B58\u5408\u5E76\u540EFLV';
                                    td1.append(a1);
                                    td1.append(' ');
                                    var a2 = document.createElement('a');
                                    a2.href = ass;
                                    a2.download = outputName + '.ass';
                                    a2.textContent = '\u5F39\u5E55ASS';
                                    td1.append(a2);
                                    td1.append(' ');
                                    var a3 = document.createElement('a');

                                    a3.onclick = function () {
                                        return new MKVTransmuxer().exec(href, ass, outputName + '.mkv');
                                    };

                                    a3.textContent = '\u6253\u5305MKV(\u8F6F\u5B57\u5E55\u5C01\u88C5)';
                                    td1.append(a3);
                                    td1.append(' ');
                                    td1.append('\u8BB0\u5F97\u6E05\u7406\u5206\u6BB5\u7F13\u5B58\u54E6~');
                                    tr1.append(td1);
                                    return tr1;
                                }());

                                return _context67.abrupt('return', href);

                            case 14:
                            case 'end':
                                return _context67.stop();
                        }
                    }
                }, _callee66, this);
            }));

            function downloadAllFLVs(_x86) {
                return _ref85.apply(this, arguments);
            }

            return downloadAllFLVs;
        }()
    }, {
        key: 'displayQuota',
        value: function () {
            var _ref86 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee67(td) {
                return regeneratorRuntime.wrap(function _callee67$(_context68) {
                    while (1) {
                        switch (_context68.prev = _context68.next) {
                            case 0:
                                return _context68.abrupt('return', new Promise(function (resolve) {
                                    var temporaryStorage = window.navigator.temporaryStorage || window.navigator.webkitTemporaryStorage || window.navigator.mozTemporaryStorage || window.navigator.msTemporaryStorage;
                                    if (!temporaryStorage) return resolve(td.textContent = '这个浏览器不支持缓存呢~关掉标签页后，缓存马上就会消失哦');
                                    temporaryStorage.queryUsageAndQuota(function (usage, quota) {
                                        return resolve(td.textContent = '\u7F13\u5B58\u5DF2\u7528\u7A7A\u95F4\uFF1A' + Math.round(usage / 1048576) + ' MB / ' + Math.round(quota / 1048576) + ' MB \u4E5F\u5305\u62EC\u4E86B\u7AD9\u672C\u6765\u7684\u7F13\u5B58');
                                    });
                                }));

                            case 1:
                            case 'end':
                                return _context68.stop();
                        }
                    }
                }, _callee67, this);
            }));

            function displayQuota(_x87) {
                return _ref86.apply(this, arguments);
            }

            return displayQuota;
        }()

        // Menu Append

    }, {
        key: 'appendMenu',
        value: function appendMenu() {
            var playerWin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.twin.playerWin;

            // 1. build monkey menu and polyfill menu
            var monkeyMenu = this.buildMonkeyMenu();
            var polyfillMenu = this.buildPolyfillMenu();

            // 2. build ul
            var ul = document.createElement('ul');

            // 3. append to menu
            ul.className = 'bilitwin';
            ul.style.borderBottom = '1px solid rgba(255,255,255,.12)';
            ul.append.apply(ul, [monkeyMenu, polyfillMenu]);
            var div = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0];
            div.prepend(ul);

            // 4. save to cache
            this.cidSessionDom.menuUl = ul;

            return ul;
        }
    }, {
        key: 'buildMonkeyMenu',
        value: function buildMonkeyMenu() {
            var _this49 = this;

            var _ref87 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref87$playerWin = _ref87.playerWin,
                playerWin = _ref87$playerWin === undefined ? this.twin.playerWin : _ref87$playerWin,
                _ref87$BiliMonkey = _ref87.BiliMonkey,
                BiliMonkey = _ref87$BiliMonkey === undefined ? this.twin.BiliMonkey : _ref87$BiliMonkey,
                _ref87$monkey = _ref87.monkey,
                monkey = _ref87$monkey === undefined ? this.twin.monkey : _ref87$monkey,
                _ref87$flvA = _ref87.flvA,
                flvA = _ref87$flvA === undefined ? this.cidSessionDom.flvA : _ref87$flvA,
                _ref87$mp4A = _ref87.mp4A,
                mp4A = _ref87$mp4A === undefined ? this.cidSessionDom.mp4A : _ref87$mp4A,
                _ref87$assA = _ref87.assA,
                assA = _ref87$assA === undefined ? this.cidSessionDom.assA : _ref87$assA;

            var li = document.createElement('li');
            li.className = 'context-menu-menu bilitwin';

            li.onclick = function () {
                return playerWin.document.getElementById('bilibiliPlayer').click();
            };

            var a1 = document.createElement('a');
            a1.className = 'context-menu-a';
            a1.append('BiliMonkey');
            var span = document.createElement('span');
            span.className = 'bpui-icon bpui-icon-arrow-down';
            span.style = 'transform:rotate(-90deg);margin-top:3px;';
            a1.append(span);
            li.append(a1);
            var ul1 = document.createElement('ul');
            var li1 = document.createElement('li');
            li1.className = 'context-menu-function';

            li1.onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee68() {
                return regeneratorRuntime.wrap(function _callee68$(_context69) {
                    while (1) {
                        switch (_context69.prev = _context69.next) {
                            case 0:
                                if (!flvA.onmouseover) {
                                    _context69.next = 3;
                                    break;
                                }

                                _context69.next = 3;
                                return flvA.onmouseover();

                            case 3:
                                flvA.click();

                            case 4:
                            case 'end':
                                return _context69.stop();
                        }
                    }
                }, _callee68, _this49);
            }));

            var a2 = document.createElement('a');
            a2.className = 'context-menu-a';
            var span1 = document.createElement('span');
            span1.className = 'video-contextmenu-icon';
            a2.append(span1);
            a2.append(' \u4E0B\u8F7D\u89C6\u9891FLV');
            li1.append(a2);
            ul1.append(li1);
            var li2 = document.createElement('li');
            li2.className = 'context-menu-function';

            li2.onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee69() {
                return regeneratorRuntime.wrap(function _callee69$(_context70) {
                    while (1) {
                        switch (_context70.prev = _context70.next) {
                            case 0:
                                if (!assA.onmouseover) {
                                    _context70.next = 3;
                                    break;
                                }

                                _context70.next = 3;
                                return assA.onmouseover();

                            case 3:
                                assA.click();

                            case 4:
                            case 'end':
                                return _context70.stop();
                        }
                    }
                }, _callee69, _this49);
            }));

            var a3 = document.createElement('a');
            a3.className = 'context-menu-a';
            var span2 = document.createElement('span');
            span2.className = 'video-contextmenu-icon';
            a3.append(span2);
            a3.append(' \u4E0B\u8F7D\u5F39\u5E55ASS');
            li2.append(a3);
            ul1.append(li2);
            var li3 = document.createElement('li');
            li3.className = 'context-menu-function';

            li3.onclick = function () {
                return _this49.displayOptionDiv();
            };

            var a4 = document.createElement('a');
            a4.className = 'context-menu-a';
            var span3 = document.createElement('span');
            span3.className = 'video-contextmenu-icon';
            a4.append(span3);
            a4.append(' \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E');
            li3.append(a4);
            ul1.append(li3);
            var li4 = document.createElement('li');
            li4.className = 'context-menu-function';

            li4.onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee70() {
                return regeneratorRuntime.wrap(function _callee70$(_context71) {
                    while (1) {
                        switch (_context71.prev = _context71.next) {
                            case 0:
                                _context71.t0 = UI;
                                _context71.next = 3;
                                return BiliMonkey.getAllPageDefaultFormats(playerWin);

                            case 3:
                                _context71.t1 = _context71.sent;
                                return _context71.abrupt('return', _context71.t0.displayDownloadAllPageDefaultFormatsBody.call(_context71.t0, _context71.t1));

                            case 5:
                            case 'end':
                                return _context71.stop();
                        }
                    }
                }, _callee70, _this49);
            }));

            var a5 = document.createElement('a');
            a5.className = 'context-menu-a';
            var span4 = document.createElement('span');
            span4.className = 'video-contextmenu-icon';
            a5.append(span4);
            a5.append(' (\u6D4B)\u6279\u91CF\u4E0B\u8F7D');
            li4.append(a5);
            ul1.append(li4);
            var li5 = document.createElement('li');
            li5.className = 'context-menu-function';

            li5.onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee71() {
                return regeneratorRuntime.wrap(function _callee71$(_context72) {
                    while (1) {
                        switch (_context72.prev = _context72.next) {
                            case 0:
                                monkey.proxy = true;
                                monkey.flvs = null;
                                UI.hintInfo('请稍候，可能需要10秒时间……', playerWin);
                                // Yes, I AM lazy.
                                playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="80"]').click();
                                _context72.next = 6;
                                return new Promise(function (r) {
                                    return playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', r);
                                });

                            case 6:
                                return _context72.abrupt('return', monkey.queryInfo('flv'));

                            case 7:
                            case 'end':
                                return _context72.stop();
                        }
                    }
                }, _callee71, _this49);
            }));

            var a6 = document.createElement('a');
            a6.className = 'context-menu-a';
            var span5 = document.createElement('span');
            span5.className = 'video-contextmenu-icon';
            a6.append(span5);
            a6.append(' (\u6D4B)\u8F7D\u5165\u7F13\u5B58FLV');
            li5.append(a6);
            ul1.append(li5);
            var li6 = document.createElement('li');
            li6.className = 'context-menu-function';

            li6.onclick = function () {
                return top.location.reload(true);
            };

            var a7 = document.createElement('a');
            a7.className = 'context-menu-a';
            var span6 = document.createElement('span');
            span6.className = 'video-contextmenu-icon';
            a7.append(span6);
            a7.append(' (\u6D4B)\u5F3A\u5236\u5237\u65B0');
            li6.append(a7);
            ul1.append(li6);
            var li7 = document.createElement('li');
            li7.className = 'context-menu-function';

            li7.onclick = function () {
                return _this49.cidSessionDestroy() && _this49.cidSessionRender();
            };

            var a8 = document.createElement('a');
            a8.className = 'context-menu-a';
            var span7 = document.createElement('span');
            span7.className = 'video-contextmenu-icon';
            a8.append(span7);
            a8.append(' (\u6D4B)\u91CD\u542F\u811A\u672C');
            li7.append(a8);
            ul1.append(li7);
            var li8 = document.createElement('li');
            li8.className = 'context-menu-function';

            li8.onclick = function () {
                return playerWin.player && playerWin.player.destroy();
            };

            var a9 = document.createElement('a');
            a9.className = 'context-menu-a';
            var span8 = document.createElement('span');
            span8.className = 'video-contextmenu-icon';
            a9.append(span8);
            a9.append(' (\u6D4B)\u9500\u6BC1\u64AD\u653E\u5668');
            li8.append(a9);
            ul1.append(li8);
            li.append(ul1);

            return li;
        }
    }, {
        key: 'buildPolyfillMenu',
        value: function buildPolyfillMenu() {
            var _this50 = this;

            var _ref92 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref92$playerWin = _ref92.playerWin,
                playerWin = _ref92$playerWin === undefined ? this.twin.playerWin : _ref92$playerWin,
                _ref92$BiliPolyfill = _ref92.BiliPolyfill,
                BiliPolyfill = _ref92$BiliPolyfill === undefined ? this.twin.BiliPolyfill : _ref92$BiliPolyfill,
                _ref92$polyfill = _ref92.polyfill,
                polyfill = _ref92$polyfill === undefined ? this.twin.polyfill : _ref92$polyfill;

            var oped = [];
            var refreshSession = new HookedFunction(function () {
                return oped = polyfill.userdata.oped[polyfill.getCollectionId()] || [];
            }); // as a convenient callback register
            var li = document.createElement('li');
            li.className = 'context-menu-menu bilitwin';

            li.onclick = function () {
                return playerWin.document.getElementById('bilibiliPlayer').click();
            };

            var a1 = document.createElement('a');
            a1.className = 'context-menu-a';

            a1.onmouseover = function () {
                return refreshSession();
            };

            a1.append('BiliPolyfill');
            a1.append(!polyfill.option.betabeta ? '(到设置开启)' : '');
            var span = document.createElement('span');
            span.className = 'bpui-icon bpui-icon-arrow-down';
            span.style = 'transform:rotate(-90deg);margin-top:3px;';
            a1.append(span);
            li.append(a1);
            var ul1 = document.createElement('ul');
            var li1 = document.createElement('li');
            li1.className = 'context-menu-function';

            li1.onclick = function () {
                return top.window.open(polyfill.getCoverImage(), '_blank');
            };

            var a2 = document.createElement('a');
            a2.className = 'context-menu-a';
            var span1 = document.createElement('span');
            span1.className = 'video-contextmenu-icon';
            a2.append(span1);
            a2.append(' \u83B7\u53D6\u5C01\u9762');
            li1.append(a2);
            ul1.append(li1);
            var li2 = document.createElement('li');
            li2.className = 'context-menu-menu';
            var a3 = document.createElement('a');
            a3.className = 'context-menu-a';
            var span2 = document.createElement('span');
            span2.className = 'video-contextmenu-icon';
            a3.append(span2);
            a3.append(' \u66F4\u591A\u64AD\u653E\u901F\u5EA6');
            var span3 = document.createElement('span');
            span3.className = 'bpui-icon bpui-icon-arrow-down';
            span3.style = 'transform:rotate(-90deg);margin-top:3px;';
            a3.append(span3);
            li2.append(a3);
            var ul2 = document.createElement('ul');
            var li3 = document.createElement('li');
            li3.className = 'context-menu-function';

            li3.onclick = function () {
                polyfill.setVideoSpeed(0.1);
            };

            var a4 = document.createElement('a');
            a4.className = 'context-menu-a';
            var span4 = document.createElement('span');
            span4.className = 'video-contextmenu-icon';
            a4.append(span4);
            a4.append(' 0.1');
            li3.append(a4);
            ul2.append(li3);
            var li4 = document.createElement('li');
            li4.className = 'context-menu-function';

            li4.onclick = function () {
                polyfill.setVideoSpeed(3);
            };

            var a5 = document.createElement('a');
            a5.className = 'context-menu-a';
            var span5 = document.createElement('span');
            span5.className = 'video-contextmenu-icon';
            a5.append(span5);
            a5.append(' 3');
            li4.append(a5);
            ul2.append(li4);
            var li5 = document.createElement('li');
            li5.className = 'context-menu-function';

            li5.onclick = function (e) {
                return polyfill.setVideoSpeed(e.children[0].children[1].value);
            };

            var a6 = document.createElement('a');
            a6.className = 'context-menu-a';
            var span6 = document.createElement('span');
            span6.className = 'video-contextmenu-icon';
            a6.append(span6);
            a6.append(' \u70B9\u51FB\u786E\u8BA4');
            var input = document.createElement('input');
            input.type = 'text';
            input.style = 'width: 35px; height: 70%';

            input.onclick = function (e) {
                return e.stopPropagation();
            };

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.value = polyfill.video.playbackRate;
                });
            })(input);

            a6.append(input);
            li5.append(a6);
            ul2.append(li5);
            li2.append(ul2);
            ul1.append(li2);
            var li6 = document.createElement('li');
            li6.className = 'context-menu-menu';
            var a7 = document.createElement('a');
            a7.className = 'context-menu-a';
            var span7 = document.createElement('span');
            span7.className = 'video-contextmenu-icon';
            a7.append(span7);
            a7.append(' \u7247\u5934\u7247\u5C3E');
            var span8 = document.createElement('span');
            span8.className = 'bpui-icon bpui-icon-arrow-down';
            span8.style = 'transform:rotate(-90deg);margin-top:3px;';
            a7.append(span8);
            li6.append(a7);
            var ul3 = document.createElement('ul');
            var li7 = document.createElement('li');
            li7.className = 'context-menu-function';

            li7.onclick = function () {
                return polyfill.markOPEDPosition(0);
            };

            var a8 = document.createElement('a');
            a8.className = 'context-menu-a';
            var span9 = document.createElement('span');
            span9.className = 'video-contextmenu-icon';
            a8.append(span9);
            a8.append(' \u7247\u5934\u5F00\u59CB:');
            var span10 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = oped[0] ? BiliPolyfill.secondToReadable(oped[0]) : '无';
                });
            })(span10);

            a8.append(span10);
            li7.append(a8);
            ul3.append(li7);
            var li8 = document.createElement('li');
            li8.className = 'context-menu-function';

            li8.onclick = function () {
                return polyfill.markOPEDPosition(1);
            };

            var a9 = document.createElement('a');
            a9.className = 'context-menu-a';
            var span11 = document.createElement('span');
            span11.className = 'video-contextmenu-icon';
            a9.append(span11);
            a9.append(' \u7247\u5934\u7ED3\u675F:');
            var span12 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = oped[1] ? BiliPolyfill.secondToReadable(oped[1]) : '无';
                });
            })(span12);

            a9.append(span12);
            li8.append(a9);
            ul3.append(li8);
            var li9 = document.createElement('li');
            li9.className = 'context-menu-function';

            li9.onclick = function () {
                return polyfill.markOPEDPosition(2);
            };

            var a10 = document.createElement('a');
            a10.className = 'context-menu-a';
            var span13 = document.createElement('span');
            span13.className = 'video-contextmenu-icon';
            a10.append(span13);
            a10.append(' \u7247\u5C3E\u5F00\u59CB:');
            var span14 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = oped[2] ? BiliPolyfill.secondToReadable(oped[2]) : '无';
                });
            })(span14);

            a10.append(span14);
            li9.append(a10);
            ul3.append(li9);
            var li10 = document.createElement('li');
            li10.className = 'context-menu-function';

            li10.onclick = function () {
                return polyfill.markOPEDPosition(3);
            };

            var a11 = document.createElement('a');
            a11.className = 'context-menu-a';
            var span15 = document.createElement('span');
            span15.className = 'video-contextmenu-icon';
            a11.append(span15);
            a11.append(' \u7247\u5C3E\u7ED3\u675F:');
            var span16 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = oped[3] ? BiliPolyfill.secondToReadable(oped[3]) : '无';
                });
            })(span16);

            a11.append(span16);
            li10.append(a11);
            ul3.append(li10);
            var li11 = document.createElement('li');
            li11.className = 'context-menu-function';

            li11.onclick = function () {
                return polyfill.clearOPEDPosition();
            };

            var a12 = document.createElement('a');
            a12.className = 'context-menu-a';
            var span17 = document.createElement('span');
            span17.className = 'video-contextmenu-icon';
            a12.append(span17);
            a12.append(' \u53D6\u6D88\u6807\u8BB0');
            li11.append(a12);
            ul3.append(li11);
            var li12 = document.createElement('li');
            li12.className = 'context-menu-function';

            li12.onclick = function () {
                return _this50.displayPolyfillDataDiv();
            };

            var a13 = document.createElement('a');
            a13.className = 'context-menu-a';
            var span18 = document.createElement('span');
            span18.className = 'video-contextmenu-icon';
            a13.append(span18);
            a13.append(' \u68C0\u89C6\u6570\u636E/\u8BF4\u660E');
            li12.append(a13);
            ul3.append(li12);
            li6.append(ul3);
            ul1.append(li6);
            var li13 = document.createElement('li');
            li13.className = 'context-menu-menu';
            var a14 = document.createElement('a');
            a14.className = 'context-menu-a';
            var span19 = document.createElement('span');
            span19.className = 'video-contextmenu-icon';
            a14.append(span19);
            a14.append(' \u627E\u4E0A\u4E0B\u96C6');
            var span20 = document.createElement('span');
            span20.className = 'bpui-icon bpui-icon-arrow-down';
            span20.style = 'transform:rotate(-90deg);margin-top:3px;';
            a14.append(span20);
            li13.append(a14);
            var ul4 = document.createElement('ul');
            var li14 = document.createElement('li');
            li14.className = 'context-menu-function';

            li14.onclick = function () {
                if (polyfill.series[0]) {
                    top.window.open('https://www.bilibili.com/video/av' + polyfill.series[0].aid, '_blank');
                }
            };

            var a15 = document.createElement('a');
            a15.className = 'context-menu-a';
            a15.style.width = 'initial';
            var span21 = document.createElement('span');
            span21.className = 'video-contextmenu-icon';
            a15.append(span21);
            var span22 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = polyfill.series[0] ? polyfill.series[0].title : '找不到';
                });
            })(span22);

            a15.append(span22);
            li14.append(a15);
            ul4.append(li14);
            var li15 = document.createElement('li');
            li15.className = 'context-menu-function';

            li15.onclick = function () {
                if (polyfill.series[1]) {
                    top.window.open('https://www.bilibili.com/video/av' + polyfill.series[1].aid, '_blank');
                }
            };

            var a16 = document.createElement('a');
            a16.className = 'context-menu-a';
            a16.style.width = 'initial';
            var span23 = document.createElement('span');
            span23.className = 'video-contextmenu-icon';
            a16.append(span23);
            var span24 = document.createElement('span');

            (function (e) {
                return refreshSession.addCallback(function () {
                    return e.textContent = polyfill.series[1] ? polyfill.series[1].title : '找不到';
                });
            })(span24);

            a16.append(span24);
            li15.append(a16);
            ul4.append(li15);
            li13.append(ul4);
            ul1.append(li13);
            var li16 = document.createElement('li');
            li16.className = 'context-menu-function';

            li16.onclick = function () {
                return BiliPolyfill.openMinimizedPlayer();
            };

            var a17 = document.createElement('a');
            a17.className = 'context-menu-a';
            var span25 = document.createElement('span');
            span25.className = 'video-contextmenu-icon';
            a17.append(span25);
            a17.append(' \u5C0F\u7A97\u64AD\u653E');
            li16.append(a17);
            ul1.append(li16);
            var li17 = document.createElement('li');
            li17.className = 'context-menu-function';

            li17.onclick = function () {
                return _this50.displayOptionDiv();
            };

            var a18 = document.createElement('a');
            a18.className = 'context-menu-a';
            var span26 = document.createElement('span');
            span26.className = 'video-contextmenu-icon';
            a18.append(span26);
            a18.append(' \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E');
            li17.append(a18);
            ul1.append(li17);
            var li18 = document.createElement('li');
            li18.className = 'context-menu-function';

            li18.onclick = function () {
                return polyfill.saveUserdata();
            };

            var a19 = document.createElement('a');
            a19.className = 'context-menu-a';
            var span27 = document.createElement('span');
            span27.className = 'video-contextmenu-icon';
            a19.append(span27);
            a19.append(' (\u6D4B)\u7ACB\u5373\u4FDD\u5B58\u6570\u636E');
            li18.append(a19);
            ul1.append(li18);
            var li19 = document.createElement('li');
            li19.className = 'context-menu-function';

            li19.onclick = function () {
                BiliPolyfill.clearAllUserdata(playerWin);
                polyfill.retrieveUserdata();
            };

            var a20 = document.createElement('a');
            a20.className = 'context-menu-a';
            var span28 = document.createElement('span');
            span28.className = 'video-contextmenu-icon';
            a20.append(span28);
            a20.append(' (\u6D4B)\u5F3A\u5236\u6E05\u7A7A\u6570\u636E');
            li19.append(a20);
            ul1.append(li19);
            li.append(ul1);
            return li;
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
                var a1 = document.createElement('a');
                a1.href = 'https://greasyfork.org/zh-CN/scripts/27819';
                a1.target = '_blank';
                a1.textContent = '\u66F4\u65B0/\u8BA8\u8BBA';
                td5.append(a1);
                td5.append(' ');
                var a2 = document.createElement('a');
                a2.href = 'https://github.com/liqi0816/bilitwin/';
                a2.target = '_blank';
                a2.textContent = 'GitHub';
                td5.append(a2);
                td5.append(' ');
                td5.append('Author: qli5. Copyright: qli5, 2014+, \u7530\u751F, grepmusic');
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
                var tr2 = document.createElement('tr');
                var td2 = document.createElement('td');
                td2.style = 'text-align:center';
                td2.textContent = '\u56E0\u4E3A\u4F5C\u8005\u5077\u61D2\u4E86\uFF0C\u7F13\u5B58\u7684\u4E09\u4E2A\u9009\u9879\u6700\u597D\u8981\u4E48\u5168\u5F00\uFF0C\u8981\u4E48\u5168\u5173\u3002\u6700\u597D\u3002';
                tr2.append(td2);
                table.append(tr2);
            }

            table.append.apply(table, _toConsumableArray(BiliMonkey.optionDescriptions.map(function (_ref93) {
                var _ref94 = _slicedToArray(_ref93, 2),
                    name = _ref94[0],
                    description = _ref94[1];

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

            table.append.apply(table, _toConsumableArray(BiliPolyfill.optionDescriptions.map(function (_ref95) {
                var _ref96 = _slicedToArray(_ref95, 3),
                    name = _ref96[0],
                    description = _ref96[1],
                    disabled = _ref96[2];

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

            table.append.apply(table, _toConsumableArray(UI.optionDescriptions.map(function (_ref97) {
                var _ref98 = _slicedToArray(_ref97, 2),
                    name = _ref98[0],
                    description = _ref98[1];

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
                var p = document.createElement('p');
                p.style.margin = '0.3em';
                p.textContent = '\u8FD9\u91CC\u662F\u811A\u672C\u50A8\u5B58\u7684\u6570\u636E\u3002\u6240\u6709\u6570\u636E\u90FD\u53EA\u5B58\u5728\u6D4F\u89C8\u5668\u91CC\uFF0C\u522B\u4EBA\u4E0D\u77E5\u9053\uFF0CB\u7AD9\u4E5F\u4E0D\u77E5\u9053\uFF0C\u811A\u672C\u4F5C\u8005\u66F4\u4E0D\u77E5\u9053(\u8FD9\u4E2A\u5BB6\u4F19\u8FDE\u670D\u52A1\u5668\u90FD\u79DF\u4E0D\u8D77 \u6454';
                return p;
            }(), function () {
                var p = document.createElement('p');
                p.style.margin = '0.3em';
                p.textContent = 'B\u7AD9\u5DF2\u4E0A\u7EBF\u539F\u751F\u7684\u7A0D\u540E\u89C2\u770B\u529F\u80FD\u3002';
                return p;
            }(), function () {
                var p = document.createElement('p');
                p.style.margin = '0.3em';
                p.textContent = '\u8FD9\u91CC\u662F\u7247\u5934\u7247\u5C3E\u3002\u683C\u5F0F\u662F\uFF0Cav\u53F7\u6216\u756A\u5267\u53F7:[\u7247\u5934\u5F00\u59CB(\u9ED8\u8BA4=0),\u7247\u5934\u7ED3\u675F(\u9ED8\u8BA4=\u4E0D\u8DF3),\u7247\u5C3E\u5F00\u59CB(\u9ED8\u8BA4=\u4E0D\u8DF3),\u7247\u5C3E\u7ED3\u675F(\u9ED8\u8BA4=\u65E0\u7A77\u5927)]\u3002\u53EF\u4EE5\u4EFB\u610F\u586B\u5199null\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u91C7\u7528\u9ED8\u8BA4\u503C\u3002';
                return p;
            }(), textarea, function () {
                var p = document.createElement('p');
                p.style.margin = '0.3em';
                p.textContent = '\u5F53\u7136\u53EF\u4EE5\u76F4\u63A5\u6E05\u7A7A\u5566\u3002\u53EA\u5220\u9664\u5176\u4E2D\u7684\u4E00\u4E9B\u884C\u7684\u8BDD\uFF0C\u4E00\u5B9A\u8981\u8BB0\u5F97\u5220\u6389\u591A\u4F59\u7684\u9017\u53F7\u3002';
                return p;
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
        value: function buildDownloadAllPageDefaultFormatsBody(ret) {
            var table = document.createElement('table');

            table.onclick = function (e) {
                return e.stopPropagation();
            };

            var _loop2 = function _loop2(i) {
                table.append.apply(table, [function () {
                    var tr1 = document.createElement('tr');
                    var td1 = document.createElement('td');
                    td1.textContent = '\n                        ' + i.name + '\n                    ';
                    tr1.append(td1);
                    var td2 = document.createElement('td');
                    var a1 = document.createElement('a');
                    a1.href = i.durl[0];
                    a1.download = '';
                    a1.setAttribute('referrerpolicy', 'origin');
                    a1.textContent = i.durl[0];
                    td2.append(a1);
                    tr1.append(td2);
                    var td3 = document.createElement('td');
                    var a2 = document.createElement('a');
                    a2.href = i.danmuku;
                    a2.download = i.outputName + '.ass';
                    a2.setAttribute('referrerpolicy', 'origin');
                    a2.textContent = i.danmuku;
                    td3.append(a2);
                    tr1.append(td3);
                    return tr1;
                }()].concat(_toConsumableArray(i.durl.slice(1).map(function (href) {
                    var tr1 = document.createElement('tr');
                    var td1 = document.createElement('td');
                    td1.textContent = '\n                    ';
                    tr1.append(td1);
                    var td2 = document.createElement('td');
                    var a1 = document.createElement('a');
                    a1.href = href;
                    a1.download = '';
                    a1.setAttribute('referrerpolicy', 'origin');
                    a1.textContent = href;
                    td2.append(a1);
                    tr1.append(td2);
                    var td3 = document.createElement('td');
                    td3.textContent = '\n                    ';
                    tr1.append(td3);
                    return tr1;
                }))));
            };

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = ret[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var i = _step8.value;

                    _loop2(i);
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            var fragment = document.createDocumentFragment();
            var style1 = document.createElement('style');
            style1.textContent = '\n                table {\n                    width: 100%;\n                    table-layout: fixed;\n                }\n            \n                td {\n                    overflow: hidden;\n                    white-space: nowrap;\n                    text-overflow: ellipsis;\n                    text-align: center;\n                }\n            ';
            fragment.append(style1);
            var h1 = document.createElement('h1');
            h1.textContent = '(\u6D4B\u8BD5) \u6279\u91CF\u6293\u53D6';
            fragment.append(h1);
            var ul1 = document.createElement('ul');
            var li = document.createElement('li');
            var p = document.createElement('p');
            p.textContent = '\u53EA\u6293\u53D6\u9ED8\u8BA4\u6E05\u6670\u5EA6';
            li.append(p);
            ul1.append(li);
            var li1 = document.createElement('li');
            var p1 = document.createElement('p');
            p1.textContent = '\u590D\u5236\u94FE\u63A5\u5730\u5740\u65E0\u6548\uFF0C\u8BF7\u5DE6\u952E\u5355\u51FB/\u53F3\u952E\u53E6\u5B58\u4E3A/\u53F3\u952E\u8C03\u7528\u4E0B\u8F7D\u5DE5\u5177';
            li1.append(p1);
            var p2 = document.createElement('p');
            var em = document.createElement('em');
            em.textContent = '\u5F00\u53D1\u8005\uFF1A\u9700\u8981\u6821\u9A8Creferrer\u548Cuser agent';
            p2.append(em);
            li1.append(p2);
            ul1.append(li1);
            var li2 = document.createElement('li');
            var p3 = document.createElement('p');
            p3.append('flv\u5408\u5E76');
            var a1 = document.createElement('a');
            a1.href = 'http://www.flvcd.com/teacher2.htm';
            a1.textContent = '\u7855\u9F20';
            p3.append(a1);
            li2.append(p3);
            var p4 = document.createElement('p');
            p4.textContent = '\u6279\u91CF\u5408\u5E76\u5BF9\u5355\u6807\u7B7E\u9875\u8D1F\u8377\u592A\u5927';
            li2.append(p4);
            var p5 = document.createElement('p');
            var em1 = document.createElement('em');
            em1.textContent = '\u5F00\u53D1\u8005\uFF1A\u53EF\u4EE5\u7528webworker\uFF0C\u4F46\u662F\u6211\u6CA1\u9700\u6C42\uFF0C\u53C8\u61D2';
            p5.append(em1);
            li2.append(p5);
            ul1.append(li2);
            fragment.append(ul1);
            fragment.append(table);
            return fragment;
        }
    }, {
        key: 'displayDownloadAllPageDefaultFormatsBody',
        value: function displayDownloadAllPageDefaultFormatsBody(ret) {
            top.document.open();
            top.document.close();

            top.document.body.append(UI.buildDownloadAllPageDefaultFormatsBody(ret));
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
                var span = document.createElement('span');
                span.textContent = text;
                div2.append(span);
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
            ['title', '在视频标题旁添加链接'], ['menu', '在视频菜单栏添加链接'],

            // 3. download
            ['aria2', '导出aria2'], ['aria2RPC', '发送到aria2 RPC'], ['m3u8', '(限VLC兼容播放器)导出m3u8'], ['clipboard', '(测)(请自行解决referrer)强制导出剪贴板']];
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

        var _this51 = _possibleConstructorReturn(this, (BiliTwin.__proto__ || Object.getPrototypeOf(BiliTwin)).call(this));

        _this51.BiliMonkey = BiliMonkey;
        _this51.BiliPolyfill = BiliPolyfill;
        _this51.playerWin = null;
        _this51.monkey = null;
        _this51.polifill = null;
        _this51.ui = ui || new UI(_this51);
        _this51.option = option;
        return _this51;
    }

    _createClass(BiliTwin, [{
        key: 'runCidSession',
        value: function () {
            var _ref99 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee72() {
                var _this52 = this;

                var href, cidRefresh, _ref100;

                return regeneratorRuntime.wrap(function _callee72$(_context73) {
                    while (1) {
                        switch (_context73.prev = _context73.next) {
                            case 0:
                                _context73.prev = 0;
                                _context73.t0 = BiliUserJS.tryGetPlayerWinSync();

                                if (_context73.t0) {
                                    _context73.next = 6;
                                    break;
                                }

                                _context73.next = 5;
                                return BiliTwin.getPlayerWin();

                            case 5:
                                _context73.t0 = _context73.sent;

                            case 6:
                                this.playerWin = _context73.t0;
                                _context73.next = 13;
                                break;

                            case 9:
                                _context73.prev = 9;
                                _context73.t1 = _context73['catch'](0);

                                if (_context73.t1 == 'Need H5 Player') UI.requestH5Player();
                                throw _context73.t1;

                            case 13:
                                href = location.href;

                                this.option = this.getOption();
                                if (this.option.debug) {}
                                // if (top.console) top.console.clear();


                                // 2. monkey and polyfill
                                this.monkey = new BiliMonkey(this.playerWin, this.option);
                                this.polyfill = new BiliPolyfill(this.playerWin, this.option, function (t) {
                                    return UI.hintInfo(t, _this52.playerWin);
                                });
                                _context73.next = 20;
                                return Promise.all([this.monkey.execOptions(), this.polyfill.setFunctions()]);

                            case 20:

                                // 3. async consistent => render UI
                                cidRefresh = BiliTwin.getCidRefreshPromise(this.playerWin);

                                if (href == location.href) {
                                    this.ui.option = this.option;
                                    this.ui.cidSessionRender();
                                } else {
                                    cidRefresh.resolve();
                                }

                                // 4. debug
                                if (this.option.debug) {
                                    _ref100 = [this.monkey, this.polyfill];
                                    (top.unsafeWindow || top).monkey = _ref100[0];
                                    (top.unsafeWindow || top).polyfill = _ref100[1];
                                }

                                // 5. refresh => session expire
                                _context73.next = 25;
                                return cidRefresh;

                            case 25:
                                this.monkey.destroy();
                                this.polyfill.destroy();
                                this.ui.cidSessionDestroy();

                            case 28:
                            case 'end':
                                return _context73.stop();
                        }
                    }
                }, _callee72, this, [[0, 9]]);
            }));

            function runCidSession() {
                return _ref99.apply(this, arguments);
            }

            return runCidSession;
        }()
    }, {
        key: 'mergeFLVFiles',
        value: function () {
            var _ref101 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee73(files) {
                return regeneratorRuntime.wrap(function _callee73$(_context74) {
                    while (1) {
                        switch (_context74.prev = _context74.next) {
                            case 0:
                                _context74.t0 = URL;
                                _context74.next = 3;
                                return FLV.mergeBlobs(files);

                            case 3:
                                _context74.t1 = _context74.sent;
                                return _context74.abrupt('return', _context74.t0.createObjectURL.call(_context74.t0, _context74.t1));

                            case 5:
                            case 'end':
                                return _context74.stop();
                        }
                    }
                }, _callee73, this);
            }));

            function mergeFLVFiles(_x100) {
                return _ref101.apply(this, arguments);
            }

            return mergeFLVFiles;
        }()
    }, {
        key: 'clearCacheDB',
        value: function () {
            var _ref102 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee74(cache) {
                return regeneratorRuntime.wrap(function _callee74$(_context75) {
                    while (1) {
                        switch (_context75.prev = _context75.next) {
                            case 0:
                                if (!cache) {
                                    _context75.next = 2;
                                    break;
                                }

                                return _context75.abrupt('return', cache.deleteEntireDB());

                            case 2:
                            case 'end':
                                return _context75.stop();
                        }
                    }
                }, _callee74, this);
            }));

            function clearCacheDB(_x101) {
                return _ref102.apply(this, arguments);
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
    }], [{
        key: 'init',
        value: function () {
            var _ref103 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee75() {
                var twin;
                return regeneratorRuntime.wrap(function _callee75$(_context76) {
                    while (1) {
                        switch (_context76.prev = _context76.next) {
                            case 0:
                                if (document.body) {
                                    _context76.next = 2;
                                    break;
                                }

                                return _context76.abrupt('return');

                            case 2:
                                BiliTwin.outdatedEngineClearance();
                                BiliTwin.firefoxClearance();

                                twin = new BiliTwin();

                            case 5:
                                if (!1) {
                                    _context76.next = 10;
                                    break;
                                }

                                _context76.next = 8;
                                return twin.runCidSession();

                            case 8:
                                _context76.next = 5;
                                break;

                            case 10:
                            case 'end':
                                return _context76.stop();
                        }
                    }
                }, _callee75, this);
            }));

            function init() {
                return _ref103.apply(this, arguments);
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


