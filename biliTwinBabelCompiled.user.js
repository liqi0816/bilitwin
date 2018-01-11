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
// @version     1.11
// @author      qli5
// @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto
// @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
// @grant       none
// ==/UserScript==

new Promise(function (resolve) {
    var req = new XMLHttpRequest();
    req.onload = function () { resolve(req.responseText); };
    req.open('get', 'https://cdn.bootcss.com/babel-polyfill/6.26.0/polyfill.min.js');
    req.send();
}).then(function (script) {
    top.eval(script);
}).then(function () {
    //'use strict';

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    // @version     1.11
    // @author      qli5
    // @copyright   qli5, 2014+, 田生, grepmusic, zheng qian, ryiwamoto
    // @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
    // @grant       none
    // ==/UserScript==

    var debugOption = {
        // console会清空，生成 window.m 和 window.p
        //debug: 1,

        // 别拖啦~
        //betabeta: 1,

        // UP主不容易，B站也不容易，充电是有益的尝试，我不鼓励跳。
        //electricSkippable: 0,
    };

    /**
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

    /**
     * BiliMonkey
     * A bilibili user script
     * by qli5 goodlq11[at](gmail|163).com
     * 
     * The FLV merge utility is a Javascript translation of 
     * https://github.com/grepmusic/flvmerge
     * by grepmusic
     * 
     * The ASS convert utility is a fork of
     * https://tiansh.github.io/us-danmaku/bilibili/
     * by tiansh
     * 
     * The FLV demuxer is from
     * https://github.com/Bilibili/flv.js/
     * by zheng qian
     * 
     * The EMBL builder is from
     * <https://www.npmjs.com/package/simple-ebml-builder>
     * by ryiwamoto
     * 
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at http://mozilla.org/MPL/2.0/.
     */

    /**
     * BiliPolyfill
     * A bilibili user script
     * by qli5 goodlq11[at](gmail|163).com
     * 
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at http://mozilla.org/MPL/2.0/.
     */

    var TwentyFourDataView = function (_DataView) {
        _inherits(TwentyFourDataView, _DataView);

        function TwentyFourDataView() {
            _classCallCheck(this, TwentyFourDataView);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (TwentyFourDataView.es6) {
                var _ref;

                var _this = _possibleConstructorReturn(this, (_ref = TwentyFourDataView.__proto__ || Object.getPrototypeOf(TwentyFourDataView)).call.apply(_ref, [this].concat(args)));
            } else {
                var _ret2;

                // ES5 polyfill
                // It is dirty. Very dirty.
                if (TwentyFourDataView.es6 === undefined) {
                    try {
                        var _this, _ret, _ref2;

                        TwentyFourDataView.es6 = 1;
                        return _ret = (_this = _possibleConstructorReturn(this, (_ref2 = TwentyFourDataView.__proto__ || Object.getPrototypeOf(TwentyFourDataView)).call.apply(_ref2, [this].concat(args))), _this), _possibleConstructorReturn(_this, _ret);
                    } catch (e) {
                        if (e.name == 'TypeError') {
                            TwentyFourDataView.es6 = 0;
                            var setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
                                obj.__proto__ = proto;
                                return obj;
                            };
                            setPrototypeOf(TwentyFourDataView, Object);
                        } else throw e;
                    }
                }

                var _this = _possibleConstructorReturn(this, (TwentyFourDataView.__proto__ || Object.getPrototypeOf(TwentyFourDataView)).call(this));

                var _dataView = new (Function.prototype.bind.apply(DataView, [null].concat(args)))();
                _dataView.getUint24 = TwentyFourDataView.prototype.getUint24;
                _dataView.setUint24 = TwentyFourDataView.prototype.setUint24;
                _dataView.indexOf = TwentyFourDataView.prototype.indexOf;
                return _ret2 = _dataView, _possibleConstructorReturn(_this, _ret2);
            }
            return _possibleConstructorReturn(_this);
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
    }(DataView);

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
                var keyframes = '\x00\x09keyframs\x03';
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

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = flvs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var flv = _step.value;

                        var bts = duration * 1000;
                        basetimestamp[0] = lasttimestamp[0];
                        basetimestamp[1] = lasttimestamp[1];
                        bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
                        var foundDuration = 0;
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = flv.tags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var tag = _step2.value;

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
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
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

                durationDataView.setFloat64(0, duration);

                return new Blob(blobParts);
            }
        }, {
            key: 'mergeBlobs',
            value: function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(blobs) {
                    var _this2 = this;

                    var resultParts, basetimestamp, lasttimestamp, duration, durationDataView, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _loop, _iterator3, _step3;

                    return regeneratorRuntime.wrap(function _callee$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    if (!(blobs.length < 1)) {
                                        _context2.next = 2;
                                        break;
                                    }

                                    throw 'Usage: FLV.mergeBlobs([blobs])';

                                case 2:
                                    resultParts = [];
                                    basetimestamp = [0, 0];
                                    lasttimestamp = [0, 0];
                                    duration = 0.0;
                                    durationDataView = void 0;
                                    _iteratorNormalCompletion3 = true;
                                    _didIteratorError3 = false;
                                    _iteratorError3 = undefined;
                                    _context2.prev = 10;
                                    _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                                        var blob, bts, foundDuration, flv, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, tag, _tag$getDurationAndVi2;

                                        return regeneratorRuntime.wrap(function _loop$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        blob = _step3.value;
                                                        bts = duration * 1000;

                                                        basetimestamp[0] = lasttimestamp[0];
                                                        basetimestamp[1] = lasttimestamp[1];
                                                        bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
                                                        foundDuration = 0;
                                                        _context.next = 8;
                                                        return new Promise(function (resolve, reject) {
                                                            var fr = new FileReader();
                                                            fr.onload = function () {
                                                                return resolve(new FLV(new TwentyFourDataView(fr.result)));
                                                            };
                                                            fr.readAsArrayBuffer(blob);
                                                            fr.onerror = reject;
                                                        });

                                                    case 8:
                                                        flv = _context.sent;
                                                        _iteratorNormalCompletion4 = true;
                                                        _didIteratorError4 = false;
                                                        _iteratorError4 = undefined;
                                                        _context.prev = 12;


                                                        for (_iterator4 = flv.tags[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                                            tag = _step4.value;

                                                            if (tag.tagType == 0x12 && !foundDuration) {
                                                                duration += tag.getDuration();
                                                                foundDuration = 1;
                                                                if (blob == blobs[0]) {
                                                                    resultParts.push(new Blob([flv.header, flv.firstPreviousTagSize]));
                                                                    _tag$getDurationAndVi2 = tag.getDurationAndView();
                                                                    duration = _tag$getDurationAndVi2.duration;
                                                                    durationDataView = _tag$getDurationAndVi2.durationDataView;

                                                                    tag.stripKeyframesScriptData();
                                                                    resultParts.push(new Blob([tag.tagHeader]));
                                                                    resultParts.push(tag.tagData);
                                                                    resultParts.push(new Blob([tag.previousSize]));
                                                                }
                                                            } else if (tag.tagType == 0x08 || tag.tagType == 0x09) {
                                                                lasttimestamp[tag.tagType - 0x08] = bts + tag.getCombinedTimestamp();
                                                                tag.setCombinedTimestamp(lasttimestamp[tag.tagType - 0x08]);
                                                                resultParts.push(new Blob([tag.tagHeader, tag.tagData, tag.previousSize]));
                                                            }
                                                        }
                                                        _context.next = 20;
                                                        break;

                                                    case 16:
                                                        _context.prev = 16;
                                                        _context.t0 = _context['catch'](12);
                                                        _didIteratorError4 = true;
                                                        _iteratorError4 = _context.t0;

                                                    case 20:
                                                        _context.prev = 20;
                                                        _context.prev = 21;

                                                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                                            _iterator4.return();
                                                        }

                                                    case 23:
                                                        _context.prev = 23;

                                                        if (!_didIteratorError4) {
                                                            _context.next = 26;
                                                            break;
                                                        }

                                                        throw _iteratorError4;

                                                    case 26:
                                                        return _context.finish(23);

                                                    case 27:
                                                        return _context.finish(20);

                                                    case 28:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _loop, _this2, [[12, 16, 20, 28], [21, , 23, 27]]);
                                    });
                                    _iterator3 = blobs[Symbol.iterator]();

                                case 13:
                                    if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                        _context2.next = 18;
                                        break;
                                    }

                                    return _context2.delegateYield(_loop(), 't0', 15);

                                case 15:
                                    _iteratorNormalCompletion3 = true;
                                    _context2.next = 13;
                                    break;

                                case 18:
                                    _context2.next = 24;
                                    break;

                                case 20:
                                    _context2.prev = 20;
                                    _context2.t1 = _context2['catch'](10);
                                    _didIteratorError3 = true;
                                    _iteratorError3 = _context2.t1;

                                case 24:
                                    _context2.prev = 24;
                                    _context2.prev = 25;

                                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                        _iterator3.return();
                                    }

                                case 27:
                                    _context2.prev = 27;

                                    if (!_didIteratorError3) {
                                        _context2.next = 30;
                                        break;
                                    }

                                    throw _iteratorError3;

                                case 30:
                                    return _context2.finish(27);

                                case 31:
                                    return _context2.finish(24);

                                case 32:
                                    durationDataView.setFloat64(0, duration);

                                    return _context2.abrupt('return', new Blob(resultParts));

                                case 34:
                                case 'end':
                                    return _context2.stop();
                            }
                        }
                    }, _callee, this, [[10, 20, 24, 32], [25, , 27, 31]]);
                }));

                function mergeBlobs(_x4) {
                    return _ref3.apply(this, arguments);
                }

                return mergeBlobs;
            }()
        }]);

        return FLV;
    }();

    var CacheDB = function () {
        function CacheDB() {
            var dbName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'biliMonkey';
            var osName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'flv';
            var keyPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'name';
            var maxItemSize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100 * 1024 * 1024;

            _classCallCheck(this, CacheDB);

            this.dbName = dbName;
            this.osName = osName;
            this.keyPath = keyPath;
            this.maxItemSize = maxItemSize;
            this.db = null;
        }

        _createClass(CacheDB, [{
            key: 'getDB',
            value: function () {
                var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                    var _this3 = this;

                    return regeneratorRuntime.wrap(function _callee2$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    if (!this.db) {
                                        _context3.next = 2;
                                        break;
                                    }

                                    return _context3.abrupt('return', this.db);

                                case 2:
                                    this.db = new Promise(function (resolve, reject) {
                                        var openRequest = indexedDB.open(_this3.dbName);
                                        openRequest.onupgradeneeded = function (e) {
                                            var db = e.target.result;
                                            if (!db.objectStoreNames.contains(_this3.osName)) {
                                                db.createObjectStore(_this3.osName, { keyPath: _this3.keyPath });
                                            }
                                        };
                                        openRequest.onsuccess = function (e) {
                                            resolve(_this3.db = e.target.result);
                                        };
                                        openRequest.onerror = reject;
                                    });
                                    return _context3.abrupt('return', this.db);

                                case 4:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee2, this);
                }));

                function getDB() {
                    return _ref4.apply(this, arguments);
                }

                return getDB;
            }()
        }, {
            key: 'addData',
            value: function () {
                var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(item) {
                    var _this4 = this;

                    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : item.name;
                    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : item.data;

                    var db, itemChunks, numChunks, i, reqArr, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _loop2, _iterator5, _step5;

                    return regeneratorRuntime.wrap(function _callee3$(_context4) {
                        while (1) {
                            switch (_context4.prev = _context4.next) {
                                case 0:
                                    if (!(!data instanceof Blob)) {
                                        _context4.next = 2;
                                        break;
                                    }

                                    throw 'CacheDB: data must be a Blob';

                                case 2:
                                    _context4.next = 4;
                                    return this.getDB();

                                case 4:
                                    db = _context4.sent;
                                    itemChunks = [];
                                    numChunks = Math.ceil(data.size / this.maxItemSize);

                                    for (i = 0; i < numChunks; i++) {
                                        itemChunks.push({
                                            name: name + '_part_' + i,
                                            numChunks: numChunks,
                                            data: data.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
                                        });
                                    }
                                    reqArr = [];
                                    _iteratorNormalCompletion5 = true;
                                    _didIteratorError5 = false;
                                    _iteratorError5 = undefined;
                                    _context4.prev = 12;

                                    _loop2 = function _loop2() {
                                        var chunk = _step5.value;

                                        reqArr.push(new Promise(function (resolve, reject) {
                                            var req = db.transaction([_this4.osName], 'readwrite').objectStore(_this4.osName).add(chunk);
                                            req.onsuccess = resolve;
                                            req.onerror = reject;
                                        }));
                                    };

                                    for (_iterator5 = itemChunks[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                        _loop2();
                                    }

                                    _context4.next = 21;
                                    break;

                                case 17:
                                    _context4.prev = 17;
                                    _context4.t0 = _context4['catch'](12);
                                    _didIteratorError5 = true;
                                    _iteratorError5 = _context4.t0;

                                case 21:
                                    _context4.prev = 21;
                                    _context4.prev = 22;

                                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                        _iterator5.return();
                                    }

                                case 24:
                                    _context4.prev = 24;

                                    if (!_didIteratorError5) {
                                        _context4.next = 27;
                                        break;
                                    }

                                    throw _iteratorError5;

                                case 27:
                                    return _context4.finish(24);

                                case 28:
                                    return _context4.finish(21);

                                case 29:
                                    return _context4.abrupt('return', Promise.all(reqArr));

                                case 30:
                                case 'end':
                                    return _context4.stop();
                            }
                        }
                    }, _callee3, this, [[12, 17, 21, 29], [22, , 24, 28]]);
                }));

                function addData(_x9) {
                    return _ref5.apply(this, arguments);
                }

                return addData;
            }()
        }, {
            key: 'putData',
            value: function () {
                var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(item) {
                    var _this5 = this;

                    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : item.name;
                    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : item.data;

                    var db, itemChunks, numChunks, i, reqArr, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _loop3, _iterator6, _step6;

                    return regeneratorRuntime.wrap(function _callee4$(_context5) {
                        while (1) {
                            switch (_context5.prev = _context5.next) {
                                case 0:
                                    if (!(!data instanceof Blob)) {
                                        _context5.next = 2;
                                        break;
                                    }

                                    throw 'CacheDB: data must be a Blob';

                                case 2:
                                    _context5.next = 4;
                                    return this.getDB();

                                case 4:
                                    db = _context5.sent;
                                    itemChunks = [];
                                    numChunks = Math.ceil(data.size / this.maxItemSize);

                                    for (i = 0; i < numChunks; i++) {
                                        itemChunks.push({
                                            name: name + '_part_' + i,
                                            numChunks: numChunks,
                                            data: data.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
                                        });
                                    }
                                    reqArr = [];
                                    _iteratorNormalCompletion6 = true;
                                    _didIteratorError6 = false;
                                    _iteratorError6 = undefined;
                                    _context5.prev = 12;

                                    _loop3 = function _loop3() {
                                        var chunk = _step6.value;

                                        reqArr.push(new Promise(function (resolve, reject) {
                                            var req = db.transaction([_this5.osName], 'readwrite').objectStore(_this5.osName).put(chunk);
                                            req.onsuccess = resolve;
                                            req.onerror = reject;
                                        }));
                                    };

                                    for (_iterator6 = itemChunks[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                        _loop3();
                                    }

                                    _context5.next = 21;
                                    break;

                                case 17:
                                    _context5.prev = 17;
                                    _context5.t0 = _context5['catch'](12);
                                    _didIteratorError6 = true;
                                    _iteratorError6 = _context5.t0;

                                case 21:
                                    _context5.prev = 21;
                                    _context5.prev = 22;

                                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                        _iterator6.return();
                                    }

                                case 24:
                                    _context5.prev = 24;

                                    if (!_didIteratorError6) {
                                        _context5.next = 27;
                                        break;
                                    }

                                    throw _iteratorError6;

                                case 27:
                                    return _context5.finish(24);

                                case 28:
                                    return _context5.finish(21);

                                case 29:
                                    return _context5.abrupt('return', Promise.all(reqArr));

                                case 30:
                                case 'end':
                                    return _context5.stop();
                            }
                        }
                    }, _callee4, this, [[12, 17, 21, 29], [22, , 24, 28]]);
                }));

                function putData(_x12) {
                    return _ref6.apply(this, arguments);
                }

                return putData;
            }()
        }, {
            key: 'getData',
            value: function () {
                var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(index) {
                    var _this6 = this;

                    var db, item_0, numChunks, data_0, reqArr, _loop4, i, itemChunks;

                    return regeneratorRuntime.wrap(function _callee5$(_context6) {
                        while (1) {
                            switch (_context6.prev = _context6.next) {
                                case 0:
                                    _context6.next = 2;
                                    return this.getDB();

                                case 2:
                                    db = _context6.sent;
                                    _context6.next = 5;
                                    return new Promise(function (resolve, reject) {
                                        var req = db.transaction([_this6.osName]).objectStore(_this6.osName).get(index + '_part_0');
                                        req.onsuccess = function () {
                                            return resolve(req.result);
                                        };
                                        req.onerror = reject;
                                    });

                                case 5:
                                    item_0 = _context6.sent;

                                    if (item_0) {
                                        _context6.next = 8;
                                        break;
                                    }

                                    return _context6.abrupt('return', undefined);

                                case 8:
                                    numChunks = item_0.numChunks, data_0 = item_0.data;
                                    reqArr = [Promise.resolve(data_0)];

                                    _loop4 = function _loop4(i) {
                                        reqArr.push(new Promise(function (resolve, reject) {
                                            var req = db.transaction([_this6.osName]).objectStore(_this6.osName).get(index + '_part_' + i);
                                            req.onsuccess = function () {
                                                return resolve(req.result.data);
                                            };
                                            req.onerror = reject;
                                        }));
                                    };

                                    for (i = 1; i < numChunks; i++) {
                                        _loop4(i);
                                    }

                                    _context6.next = 14;
                                    return Promise.all(reqArr);

                                case 14:
                                    itemChunks = _context6.sent;
                                    return _context6.abrupt('return', { name: index, data: new Blob(itemChunks) });

                                case 16:
                                case 'end':
                                    return _context6.stop();
                            }
                        }
                    }, _callee5, this);
                }));

                function getData(_x15) {
                    return _ref7.apply(this, arguments);
                }

                return getData;
            }()
        }, {
            key: 'deleteData',
            value: function () {
                var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(index) {
                    var _this7 = this;

                    var db, item_0, numChunks, reqArr, _loop5, i;

                    return regeneratorRuntime.wrap(function _callee6$(_context7) {
                        while (1) {
                            switch (_context7.prev = _context7.next) {
                                case 0:
                                    _context7.next = 2;
                                    return this.getDB();

                                case 2:
                                    db = _context7.sent;
                                    _context7.next = 5;
                                    return new Promise(function (resolve, reject) {
                                        var req = db.transaction([_this7.osName]).objectStore(_this7.osName).get(index + '_part_0');
                                        req.onsuccess = function () {
                                            return resolve(req.result);
                                        };
                                        req.onerror = reject;
                                    });

                                case 5:
                                    item_0 = _context7.sent;

                                    if (item_0) {
                                        _context7.next = 8;
                                        break;
                                    }

                                    return _context7.abrupt('return', undefined);

                                case 8:
                                    numChunks = item_0.numChunks;
                                    reqArr = [];

                                    _loop5 = function _loop5(i) {
                                        reqArr.push(new Promise(function (resolve, reject) {
                                            var req = db.transaction([_this7.osName], 'readwrite').objectStore(_this7.osName).delete(index + '_part_' + i);
                                            req.onsuccess = resolve;
                                            req.onerror = reject;
                                        }));
                                    };

                                    for (i = 0; i < numChunks; i++) {
                                        _loop5(i);
                                    }
                                    return _context7.abrupt('return', Promise.all(reqArr));

                                case 13:
                                case 'end':
                                    return _context7.stop();
                            }
                        }
                    }, _callee6, this);
                }));

                function deleteData(_x16) {
                    return _ref8.apply(this, arguments);
                }

                return deleteData;
            }()
        }, {
            key: 'deleteEntireDB',
            value: function () {
                var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
                    var _this8 = this;

                    var req;
                    return regeneratorRuntime.wrap(function _callee7$(_context8) {
                        while (1) {
                            switch (_context8.prev = _context8.next) {
                                case 0:
                                    req = indexedDB.deleteDatabase(this.dbName);
                                    return _context8.abrupt('return', new Promise(function (resolve, reject) {
                                        req.onsuccess = function () {
                                            return resolve(_this8.db = null);
                                        };
                                        req.onerror = reject;
                                    }));

                                case 2:
                                case 'end':
                                    return _context8.stop();
                            }
                        }
                    }, _callee7, this);
                }));

                function deleteEntireDB() {
                    return _ref9.apply(this, arguments);
                }

                return deleteEntireDB;
            }()
        }]);

        return CacheDB;
    }();

    var DetailedFetchBlob = function () {
        function DetailedFetchBlob(input) {
            var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var onprogress = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : init.onprogress;
            var onabort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : init.onabort;

            var _this9 = this;

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
                if (_this9.reader == 'abort') return res.body.getReader().cancel().then(function () {
                    return null;
                });
                if (!res.ok) throw 'HTTP Error ' + res.status + ': ' + res.statusText;
                _this9.lengthComputable = res.headers.has('Content-Length');
                _this9.total += parseInt(res.headers.get('Content-Length')) || Infinity;
                if (_this9.lengthComputable) {
                    _this9.reader = res.body.getReader();
                    return _this9.blob = _this9.consume();
                } else {
                    if (_this9.onprogress) _this9.onprogress(_this9.loaded, _this9.total, _this9.lengthComputable);
                    return _this9.blob = res.blob();
                }
            });
            this.blobPromise.then(function () {
                return _this9.abort = function () { };
            });
            this.blobPromise.catch(function (e) {
                return _this9.onerror({ target: _this9, type: e });
            });
            this.promise = Promise.race([this.blobPromise, new Promise(function (resolve) {
                return _this9.abort = function () {
                    _this9.onabort({ target: _this9, type: 'abort' });
                    resolve('abort');
                    _this9.buffer = [];
                    _this9.blob = null;
                    if (_this9.reader) _this9.reader.cancel(); else _this9.reader = 'abort';
                };
            })]).then(function (s) {
                return s == 'abort' ? new Promise(function () { }) : s;
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
                var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
                    return regeneratorRuntime.wrap(function _callee8$(_context9) {
                        while (1) {
                            switch (_context9.prev = _context9.next) {
                                case 0:
                                    return _context9.abrupt('return', this.promise);

                                case 1:
                                case 'end':
                                    return _context9.stop();
                            }
                        }
                    }, _callee8, this);
                }));

                function getBlob() {
                    return _ref10.apply(this, arguments);
                }

                return getBlob;
            }()
        }, {
            key: 'pump',
            value: function () {
                var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
                    var _ref12, done, value;

                    return regeneratorRuntime.wrap(function _callee9$(_context10) {
                        while (1) {
                            switch (_context10.prev = _context10.next) {
                                case 0:
                                    if (!true) {
                                        _context10.next = 13;
                                        break;
                                    }

                                    _context10.next = 3;
                                    return this.reader.read();

                                case 3:
                                    _ref12 = _context10.sent;
                                    done = _ref12.done;
                                    value = _ref12.value;

                                    if (!done) {
                                        _context10.next = 8;
                                        break;
                                    }

                                    return _context10.abrupt('return', this.loaded);

                                case 8:
                                    this.loaded += value.byteLength;
                                    this.buffer.push(new Blob([value]));
                                    if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
                                    _context10.next = 0;
                                    break;

                                case 13:
                                case 'end':
                                    return _context10.stop();
                            }
                        }
                    }, _callee9, this);
                }));

                function pump() {
                    return _ref11.apply(this, arguments);
                }

                return pump;
            }()
        }, {
            key: 'consume',
            value: function () {
                var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
                    return regeneratorRuntime.wrap(function _callee10$(_context11) {
                        while (1) {
                            switch (_context11.prev = _context11.next) {
                                case 0:
                                    _context11.next = 2;
                                    return this.pump();

                                case 2:
                                    this.blob = new Blob(this.buffer);
                                    this.buffer = null;
                                    return _context11.abrupt('return', this.blob);

                                case 5:
                                case 'end':
                                    return _context11.stop();
                            }
                        }
                    }, _callee10, this);
                }));

                function consume() {
                    return _ref13.apply(this, arguments);
                }

                return consume;
            }()
        }, {
            key: 'firefoxConstructor',
            value: function firefoxConstructor(input) {
                var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var onprogress = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : init.onprogress;

                var _this10 = this;

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
                        resolve(_this10.blob = new Blob(_this10.buffer)); _this10.buffer = null;
                    };
                    var cacheLoaded = _this10.loaded;
                    xhr.onprogress = function (e) {
                        _this10.loaded = e.loaded + cacheLoaded;
                        _this10.total = e.total + cacheLoaded;
                        _this10.lengthComputable = e.lengthComputable;
                        _this10.buffer.push(new Blob([xhr.response]));
                        if (_this10.onprogress) _this10.onprogress(_this10.loaded, _this10.total, _this10.lengthComputable);
                    };
                    xhr.onabort = function (e) {
                        return _this10.onabort({ target: _this10, type: 'abort' });
                    };
                    xhr.onerror = function (e) {
                        _this10.onerror({ target: _this10, type: e.type }); reject(e);
                    };
                    _this10.abort = xhr.abort.bind(xhr);
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

    var Mutex = function () {
        function Mutex() {
            _classCallCheck(this, Mutex);

            this.queueTail = Promise.resolve();
            this.resolveHead = null;
        }

        _createClass(Mutex, [{
            key: 'lock',
            value: function () {
                var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
                    var myResolve, _queueTail;

                    return regeneratorRuntime.wrap(function _callee11$(_context12) {
                        while (1) {
                            switch (_context12.prev = _context12.next) {
                                case 0:
                                    myResolve = void 0;
                                    _queueTail = this.queueTail;

                                    this.queueTail = new Promise(function (resolve) {
                                        return myResolve = resolve;
                                    });
                                    _context12.next = 5;
                                    return _queueTail;

                                case 5:
                                    this.resolveHead = myResolve;
                                    return _context12.abrupt('return');

                                case 7:
                                case 'end':
                                    return _context12.stop();
                            }
                        }
                    }, _callee11, this);
                }));

                function lock() {
                    return _ref14.apply(this, arguments);
                }

                return lock;
            }()
        }, {
            key: 'unlock',
            value: function unlock() {
                this.resolveHead();
                return;
            }
        }, {
            key: 'lockAndAwait',
            value: function () {
                var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(asyncFunc) {
                    var ret;
                    return regeneratorRuntime.wrap(function _callee12$(_context13) {
                        while (1) {
                            switch (_context13.prev = _context13.next) {
                                case 0:
                                    _context13.next = 2;
                                    return this.lock();

                                case 2:
                                    ret = void 0;
                                    _context13.prev = 3;
                                    _context13.next = 6;
                                    return asyncFunc();

                                case 6:
                                    ret = _context13.sent;

                                case 7:
                                    _context13.prev = 7;

                                    this.unlock();
                                    return _context13.finish(7);

                                case 10:
                                    return _context13.abrupt('return', ret);

                                case 11:
                                case 'end':
                                    return _context13.stop();
                            }
                        }
                    }, _callee12, this, [[3, , 7, 10]]);
                }));

                function lockAndAwait(_x26) {
                    return _ref15.apply(this, arguments);
                }

                return lockAndAwait;
            }()
        }], [{
            key: '_UNIT_TEST',
            value: function _UNIT_TEST() {
                var _this11 = this;

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
                m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
                    return regeneratorRuntime.wrap(function _callee13$(_context14) {
                        while (1) {
                            switch (_context14.prev = _context14.next) {
                                case 0:
                                    _context14.next = 2;
                                    return sleep(1000);

                                case 2:
                                    _context14.next = 4;
                                    return sleep(1000);

                                case 4:
                                    _context14.next = 6;
                                    return sleep(1000);

                                case 6:
                                    _context14.next = 8;
                                    return sleep(1000);

                                case 8:
                                    _context14.next = 10;
                                    return sleep(1000);

                                case 10:
                                case 'end':
                                    return _context14.stop();
                            }
                        }
                    }, _callee13, _this11);
                })));
                m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
                    return regeneratorRuntime.wrap(function _callee14$(_context15) {
                        while (1) {
                            switch (_context15.prev = _context15.next) {
                                case 0:
                                    return _context15.abrupt('return', console.log('5s!'));

                                case 1:
                                case 'end':
                                    return _context15.stop();
                            }
                        }
                    }, _callee14, _this11);
                })));
                m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                    return regeneratorRuntime.wrap(function _callee15$(_context16) {
                        while (1) {
                            switch (_context16.prev = _context16.next) {
                                case 0:
                                    _context16.next = 2;
                                    return sleep(1000);

                                case 2:
                                    _context16.next = 4;
                                    return sleep(1000);

                                case 4:
                                    _context16.next = 6;
                                    return sleep(1000);

                                case 6:
                                    _context16.next = 8;
                                    return sleep(1000);

                                case 8:
                                    _context16.next = 10;
                                    return sleep(1000);

                                case 10:
                                case 'end':
                                    return _context16.stop();
                            }
                        }
                    }, _callee15, _this11);
                })));
                m.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
                    return regeneratorRuntime.wrap(function _callee16$(_context17) {
                        while (1) {
                            switch (_context17.prev = _context17.next) {
                                case 0:
                                    return _context17.abrupt('return', console.log('10s!'));

                                case 1:
                                case 'end':
                                    return _context17.stop();
                            }
                        }
                    }, _callee16, _this11);
                })));
            }
        }]);

        return Mutex;
    }();

    var AsyncContainer = function () {
        // Yes, this is something like cancelable Promise. But I insist they are different.
        function AsyncContainer() {
            var _this12 = this;

            _classCallCheck(this, AsyncContainer);

            //this.state = 0; // I do not know why will I need this.
            this.resolve = null;
            this.reject = null;
            this.hang = null;
            this.hangReturn = Symbol();
            this.primaryPromise = new Promise(function (s, j) {
                _this12.resolve = function (arg) {
                    s(arg); return arg;
                };
                _this12.reject = function (arg) {
                    j(arg); return arg;
                };
            });
            //this.primaryPromise.then(() => this.state = 1);
            //this.primaryPromise.catch(() => this.state = 2);
            this.hangPromise = new Promise(function (s) {
                return _this12.hang = function () {
                    return s(_this12.hangReturn);
                };
            });
            //this.hangPromise.then(() => this.state = 3);
            this.promise = Promise.race([this.primaryPromise, this.hangPromise]).then(function (s) {
                return s == _this12.hangReturn ? new Promise(function () { }) : s;
            });
            this.then = this.promise.then.bind(this.promise);
            this.catch = this.promise.catch.bind(this.promise);
            this.destroiedThen = this.hangPromise.then.bind(this.hangPromise);
        }

        _createClass(AsyncContainer, [{
            key: 'destroy',
            value: function destroy() {
                this.hang();
                this.resolve = function () { };
                this.reject = this.resolve;
                this.hang = this.resolve;
                this.primaryPromise = null;
                this.hangPromise = null;
                this.promise = null;
                this.then = this.resolve;
                this.catch = this.resolve;
                this.destroiedThen = function (f) {
                    return f();
                };
                // Do NEVER NEVER NEVER dereference hangReturn.
                // Mysteriously this tiny symbol will keep you from Memory LEAK.
                //this.hangReturn = null;
            }
        }], [{
            key: '_UNIT_TEST',
            value: function _UNIT_TEST() {
                var foo = function () {
                    var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
                        var buf, ac;
                        return regeneratorRuntime.wrap(function _callee17$(_context18) {
                            while (1) {
                                switch (_context18.prev = _context18.next) {
                                    case 0:
                                        buf = new ArrayBuffer(600000000);
                                        ac = new AsyncContainer();

                                        ac.destroiedThen(function () {
                                            return console.log('asyncContainer destroied');
                                        });
                                        containers.push(ac);
                                        _context18.next = 6;
                                        return ac;

                                    case 6:
                                        return _context18.abrupt('return', buf);

                                    case 7:
                                    case 'end':
                                        return _context18.stop();
                                }
                            }
                        }, _callee17, this);
                    }));

                    return function foo() {
                        return _ref20.apply(this, arguments);
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

    var ASSDownloader = function () {
        function ASSDownloader(option) {
            _classCallCheck(this, ASSDownloader);

            var _ref21 = new Function('option', '\n        // ==UserScript==\n        // @name        bilibili ASS Danmaku Downloader\n        // @namespace   https://github.com/tiansh\n        // @description \u4EE5 ASS \u683C\u5F0F\u4E0B\u8F7D bilibili \u7684\u5F39\u5E55\n        // @include     http://www.bilibili.com/video/av*\n        // @include     http://bangumi.bilibili.com/movie/*\n        // @updateURL   https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.meta.js\n        // @downloadURL https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.user.js\n        // @version     1.11\n        // @grant       GM_addStyle\n        // @grant       GM_xmlhttpRequest\n        // @run-at      document-start\n        // @author      \u7530\u751F\n        // @copyright   2014+, \u7530\u751F\n        // @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/\n        // @license     CC Attribution-ShareAlike 4.0 International; http://creativecommons.org/licenses/by-sa/4.0/\n        // @connect-src comment.bilibili.com\n        // @connect-src interface.bilibili.com\n        // ==/UserScript==\n        \n        /*\n         * Common\n         */\n        \n        // \u8BBE\u7F6E\u9879\n        var config = {\n          \'playResX\': 560,           // \u5C4F\u5E55\u5206\u8FA8\u7387\u5BBD\uFF08\u50CF\u7D20\uFF09\n          \'playResY\': 420,           // \u5C4F\u5E55\u5206\u8FA8\u7387\u9AD8\uFF08\u50CF\u7D20\uFF09\n          \'fontlist\': [              // \u5B57\u5F62\uFF08\u4F1A\u81EA\u52A8\u9009\u62E9\u6700\u524D\u9762\u4E00\u4E2A\u53EF\u7528\u7684\uFF09\n            \'Microsoft YaHei UI\',\n            \'Microsoft YaHei\',\n            \'\u6587\u6CC9\u9A7F\u6B63\u9ED1\',\n            \'STHeitiSC\',\n            \'\u9ED1\u4F53\',\n          ],\n          \'font_size\': 1.0,          // \u5B57\u53F7\uFF08\u6BD4\u4F8B\uFF09\n          \'r2ltime\': 8,              // \u53F3\u5230\u5DE6\u5F39\u5E55\u6301\u7EED\u65F6\u95F4\uFF08\u79D2\uFF09\n          \'fixtime\': 4,              // \u56FA\u5B9A\u5F39\u5E55\u6301\u7EED\u65F6\u95F4\uFF08\u79D2\uFF09\n          \'opacity\': 0.6,            // \u4E0D\u900F\u660E\u5EA6\uFF08\u6BD4\u4F8B\uFF09\n          \'space\': 0,                // \u5F39\u5E55\u95F4\u9694\u7684\u6700\u5C0F\u6C34\u5E73\u8DDD\u79BB\uFF08\u50CF\u7D20\uFF09\n          \'max_delay\': 6,            // \u6700\u591A\u5141\u8BB8\u5EF6\u8FDF\u51E0\u79D2\u51FA\u73B0\u5F39\u5E55\n          \'bottom\': 50,              // \u5E95\u7AEF\u7ED9\u5B57\u5E55\u4FDD\u7559\u7684\u7A7A\u95F4\uFF08\u50CF\u7D20\uFF09\n          \'use_canvas\': null,        // \u662F\u5426\u4F7F\u7528canvas\u8BA1\u7B97\u6587\u672C\u5BBD\u5EA6\uFF08\u5E03\u5C14\u503C\uFF0CLinux\u4E0B\u7684\u706B\u72D0\u9ED8\u8BA4\u5426\uFF0C\u5176\u4ED6\u9ED8\u8BA4\u662F\uFF0CFirefox bug #561361\uFF09\n          \'debug\': false,            // \u6253\u5370\u8C03\u8BD5\u4FE1\u606F\n        };\n        if (option instanceof Object) {\n            for (var prop in config) {\n                if (prop in option) {\n                    config[prop] = option[prop]\n                }\n            }\n        }\n        \n        var debug = config.debug ? console.log.bind(console) : function () { };\n        \n        // \u5C06\u5B57\u5178\u4E2D\u7684\u503C\u586B\u5165\u5B57\u7B26\u4E32\n        var fillStr = function (str) {\n          var dict = Array.apply(Array, arguments);\n          return str.replace(/{{([^}]+)}}/g, function (r, o) {\n            var ret;\n            dict.some(function (i) { return ret = i[o]; });\n            return ret || \'\';\n          });\n        };\n        \n        // \u5C06\u989C\u8272\u7684\u6570\u503C\u5316\u4E3A\u5341\u516D\u8FDB\u5236\u5B57\u7B26\u4E32\u8868\u793A\n        var RRGGBB = function (color) {\n          var t = Number(color).toString(16).toUpperCase();\n          return (Array(7).join(\'0\') + t).slice(-6);\n        };\n        \n        // \u5C06\u53EF\u89C1\u5EA6\u8F6C\u6362\u4E3A\u900F\u660E\u5EA6\n        var hexAlpha = function (opacity) {\n          var alpha = Math.round(0xFF * (1 - opacity)).toString(16).toUpperCase();\n          return Array(3 - alpha.length).join(\'0\') + alpha;\n        };\n        \n        // \u5B57\u7B26\u4E32\n        var funStr = function (fun) {\n          return fun.toString().split(/\\r\\n|\\n|\\r/).slice(1, -1).join(\'\\n\');\n        };\n        \n        // \u5E73\u65B9\u548C\u5F00\u6839\n        var hypot = Math.hypot ? Math.hypot.bind(Math) : function () {\n          return Math.sqrt([0].concat(Array.apply(Array, arguments))\n            .reduce(function (x, y) { return x + y * y; }));\n        };\n        \n        // \u521B\u5EFA\u4E0B\u8F7D\n        var startDownload = function (data, filename) {\n          var blob = new Blob([data], { type: \'application/octet-stream\' });\n          var url = window.URL.createObjectURL(blob);\n          var saveas = document.createElement(\'a\');\n          saveas.href = url;\n          saveas.style.display = \'none\';\n          document.body.appendChild(saveas);\n          saveas.download = filename;\n          saveas.click();\n          setTimeout(function () { saveas.parentNode.removeChild(saveas); }, 1000)\n          document.addEventListener(\'unload\', function () { window.URL.revokeObjectURL(url); });\n        };\n        \n        // \u8BA1\u7B97\u6587\u5B57\u5BBD\u5EA6\n        var calcWidth = (function () {\n        \n          // \u4F7F\u7528Canvas\u8BA1\u7B97\n          var calcWidthCanvas = function () {\n            var canvas = document.createElement("canvas");\n            var context = canvas.getContext("2d");\n            return function (fontname, text, fontsize) {\n              context.font = \'bold \' + fontsize + \'px \' + fontname;\n              return Math.ceil(context.measureText(text).width + config.space);\n            };\n          }\n        \n          // \u4F7F\u7528Div\u8BA1\u7B97\n          var calcWidthDiv = function () {\n            var d = document.createElement(\'div\');\n            d.setAttribute(\'style\', [\n              \'all: unset\', \'top: -10000px\', \'left: -10000px\',\n              \'width: auto\', \'height: auto\', \'position: absolute\',\n            \'\',].join(\' !important; \'));\n            var ld = function () { document.body.parentNode.appendChild(d); }\n            if (!document.body) document.addEventListener(\'DOMContentLoaded\', ld);\n            else ld();\n            return function (fontname, text, fontsize) {\n              d.textContent = text;\n              d.style.font = \'bold \' + fontsize + \'px \' + fontname;\n              return d.clientWidth + config.space;\n            };\n          };\n        \n          // \u68C0\u67E5\u4F7F\u7528\u54EA\u4E2A\u6D4B\u91CF\u6587\u5B57\u5BBD\u5EA6\u7684\u65B9\u6CD5\n          if (config.use_canvas === null) {\n            if (navigator.platform.match(/linux/i) &&\n            !navigator.userAgent.match(/chrome/i)) config.use_canvas = false;\n          }\n          debug(\'use canvas: %o\', config.use_canvas !== false);\n          if (config.use_canvas === false) return calcWidthDiv();\n          return calcWidthCanvas();\n        \n        }());\n        \n        // \u9009\u62E9\u5408\u9002\u7684\u5B57\u4F53\n        var choseFont = function (fontlist) {\n          // \u68C0\u67E5\u8FD9\u4E2A\u5B57\u4E32\u7684\u5BBD\u5EA6\u6765\u68C0\u67E5\u5B57\u4F53\u662F\u5426\u5B58\u5728\n          var sampleText =\n            \'The quick brown fox jumps over the lazy dog\' +\n            \'7531902468\' + \',.!-\' + \'\uFF0C\u3002\uFF1A\uFF01\' +\n            \'\u5929\u5730\u7384\u9EC4\' + \'\u5247\u8FD1\u9053\u77E3\';\n          // \u548C\u8FD9\u4E9B\u5B57\u4F53\u8FDB\u884C\u6BD4\u8F83\n          var sampleFont = [\n            \'monospace\', \'sans-serif\', \'sans\',\n            \'Symbol\', \'Arial\', \'Comic Sans MS\', \'Fixed\', \'Terminal\',\n            \'Times\', \'Times New Roman\',\n            \'\u5B8B\u4F53\', \'\u9ED1\u4F53\', \'\u6587\u6CC9\u9A7F\u6B63\u9ED1\', \'Microsoft YaHei\'\n          ];\n          // \u5982\u679C\u88AB\u68C0\u67E5\u7684\u5B57\u4F53\u548C\u57FA\u51C6\u5B57\u4F53\u53EF\u4EE5\u6E32\u67D3\u51FA\u4E0D\u540C\u7684\u5BBD\u5EA6\n          // \u90A3\u4E48\u8BF4\u660E\u88AB\u68C0\u67E5\u7684\u5B57\u4F53\u603B\u662F\u5B58\u5728\u7684\n          var diffFont = function (base, test) {\n            var baseSize = calcWidth(base, sampleText, 72);\n            var testSize = calcWidth(test + \',\' + base, sampleText, 72);\n            return baseSize !== testSize;\n          };\n          var validFont = function (test) {\n            var valid = sampleFont.some(function (base) {\n              return diffFont(base, test);\n            });\n            debug(\'font %s: %o\', test, valid);\n            return valid;\n          };\n          // \u627E\u4E00\u4E2A\u80FD\u7528\u7684\u5B57\u4F53\n          var f = fontlist[fontlist.length - 1];\n          fontlist = fontlist.filter(validFont);\n          debug(\'fontlist: %o\', fontlist);\n          return fontlist[0] || f;\n        };\n        \n        // \u4ECE\u5907\u9009\u7684\u5B57\u4F53\u4E2D\u9009\u62E9\u4E00\u4E2A\u673A\u5668\u4E0A\u63D0\u4F9B\u4E86\u7684\u5B57\u4F53\n        var initFont = (function () {\n          var done = false;\n          return function () {\n            if (done) return; done = true;\n            calcWidth = calcWidth.bind(window,\n              config.font = choseFont(config.fontlist)\n            );\n          };\n        }());\n        \n        var generateASS = function (danmaku, info) {\n          var assHeader = fillStr(\n            \'[Script Info]\\nTitle: {{title}}\\nOriginal Script: \\u6839\\u636E {{ori}} \\u7684\\u5F39\\u5E55\\u4FE1\\u606F\\uFF0C\\u7531 https://github.com/tiansh/us-danmaku \\u751F\\u6210\\nScriptType: v4.00+\\nCollisions: Normal\\nPlayResX: {{playResX}}\\nPlayResY: {{playResY}}\\nTimer: 10.0000\\n\\n[V4+ Styles]\\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\\nStyle: Fix,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\\nStyle: R2L,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\\n\\n[Events]\\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\\n\',\n            config, info, {\'alpha\': hexAlpha(config.opacity) }\n          );\n          // \u8865\u9F50\u6570\u5B57\u5F00\u5934\u76840\n          var paddingNum = function (num, len) {\n            num = \'\' + num;\n            while (num.length < len) num = \'0\' + num;\n            return num;\n          };\n          // \u683C\u5F0F\u5316\u65F6\u95F4\n          var formatTime = function (time) {\n            time = 100 * time ^ 0;\n            var l = [[100, 2], [60, 2], [60, 2], [Infinity, 0]].map(function (c) {\n              var r = time % c[0];\n              time = (time - r) / c[0];\n              return paddingNum(r, c[1]);\n            }).reverse();\n            return l.slice(0, -1).join(\':\') + \'.\' + l[3];\n          };\n          // \u683C\u5F0F\u5316\u7279\u6548\n          var format = (function () {\n            // \u9002\u7528\u4E8E\u6240\u6709\u5F39\u5E55\n            var common = function (line) {\n              var s = \'\';\n              var rgb = line.color.split(/(..)/).filter(function (x) { return x; })\n                .map(function (x) { return parseInt(x, 16); });\n              // \u5982\u679C\u4E0D\u662F\u767D\u8272\uFF0C\u8981\u6307\u5B9A\u5F39\u5E55\u7279\u6B8A\u7684\u989C\u8272\n              if (line.color !== \'FFFFFF\') // line.color \u662F RRGGBB \u683C\u5F0F\n                s += \'\\\\c&H\' + line.color.split(/(..)/).reverse().join(\'\');\n              // \u5982\u679C\u5F39\u5E55\u989C\u8272\u6BD4\u8F83\u6DF1\uFF0C\u7528\u767D\u8272\u7684\u5916\u8FB9\u6846\n              var dark = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 0x30;\n              if (dark) s += \'\\\\3c&HFFFFFF\';\n              if (line.size !== 25) s += \'\\\\fs\' + line.size;\n              return s;\n            };\n            // \u9002\u7528\u4E8E\u4ECE\u53F3\u5230\u5DE6\u5F39\u5E55\n            var r2l = function (line) {\n              return \'\\\\move(\' + [\n                line.poss.x, line.poss.y, line.posd.x, line.posd.y\n              ].join(\',\') + \')\';\n            };\n            // \u9002\u7528\u4E8E\u56FA\u5B9A\u4F4D\u7F6E\u5F39\u5E55\n            var fix = function (line) {\n              return \'\\\\pos(\' + [\n                line.poss.x, line.poss.y\n              ].join(\',\') + \')\';\n            };\n            var withCommon = function (f) {\n              return function (line) { return f(line) + common(line); };\n            };\n            return {\n              \'R2L\': withCommon(r2l),\n              \'Fix\': withCommon(fix),\n            };\n          }());\n          // \u8F6C\u4E49\u4E00\u4E9B\u5B57\u7B26\n          var escapeAssText = function (s) {\n            // "{"\u3001"}"\u5B57\u7B26libass\u53EF\u4EE5\u8F6C\u4E49\uFF0C\u4F46\u662FVSFilter\u4E0D\u53EF\u4EE5\uFF0C\u6240\u4EE5\u76F4\u63A5\u7528\u5168\u89D2\u8865\u4E0A\n            return s.replace(/{/g, \'\uFF5B\').replace(/}/g, \'\uFF5D\').replace(/\\r|\\n/g, \'\');\n          };\n          // \u5C06\u4E00\u884C\u8F6C\u6362\u4E3AASS\u7684\u4E8B\u4EF6\n          var convert2Ass = function (line) {\n            return \'Dialogue: \' + [\n              0,\n              formatTime(line.stime),\n              formatTime(line.dtime),\n              line.type,\n              \',20,20,2,,\',\n            ].join(\',\')\n              + \'{\' + format[line.type](line) + \'}\'\n              + escapeAssText(line.text);\n          };\n          return assHeader +\n            danmaku.map(convert2Ass)\n            .filter(function (x) { return x; })\n            .join(\'\\n\');\n        };\n        \n        /*\n        \n        \u4E0B\u6587\u5B57\u6BCD\u542B\u4E49\uFF1A\n        0       ||----------------------x---------------------->\n                   _____________________c_____________________\n        =        /                     wc                      \\      0\n        |       |                   |--v--|                 wv  |  |--v--|\n        |    d  |--v--|               d f                 |--v--|\n        y |--v--|  l                                         f  |  s    _ p\n        |       |              VIDEO           |--v--|          |--v--| _ m\n        v       |              AREA            (x ^ y)          |\n        \n        v: \u5F39\u5E55\n        c: \u5C4F\u5E55\n        \n        0: \u5F39\u5E55\u53D1\u9001\n        a: \u53EF\u884C\u65B9\u6848\n        \n        s: \u5F00\u59CB\u51FA\u73B0\n        f: \u51FA\u73B0\u5B8C\u5168\n        l: \u5F00\u59CB\u6D88\u5931\n        d: \u6D88\u5931\u5B8C\u5168\n        \n        p: \u4E0A\u8FB9\u7F18\uFF08\u542B\uFF09\n        m: \u4E0B\u8FB9\u7F18\uFF08\u4E0D\u542B\uFF09\n        \n        w: \u5BBD\u5EA6\n        h: \u9AD8\u5EA6\n        b: \u5E95\u7AEF\u4FDD\u7559\n        \n        t: \u65F6\u95F4\u70B9\n        u: \u65F6\u95F4\u6BB5\n        r: \u5EF6\u8FDF\n        \n        \u5E76\u89C4\u5B9A\n        ts := t0s + r\n        tf := wv / (wc + ws) * p + ts\n        tl := ws / (wc + ws) * p + ts\n        td := p + ts\n        \n        */\n        \n        // \u6EDA\u52A8\u5F39\u5E55\n        var normalDanmaku = (function (wc, hc, b, u, maxr) {\n          return function () {\n            // \u521D\u59CB\u5316\u5C4F\u5E55\u5916\u9762\u662F\u4E0D\u53EF\u7528\u7684\n            var used = [\n              { \'p\': -Infinity, \'m\': 0, \'tf\': Infinity, \'td\': Infinity, \'b\': false },\n              { \'p\': hc, \'m\': Infinity, \'tf\': Infinity, \'td\': Infinity, \'b\': false },\n              { \'p\': hc - b, \'m\': hc, \'tf\': Infinity, \'td\': Infinity, \'b\': true },\n            ];\n            // \u68C0\u67E5\u4E00\u4E9B\u53EF\u7528\u7684\u4F4D\u7F6E\n            var available = function (hv, t0s, t0l, b) {\n              var suggestion = [];\n              // \u8FD9\u4E9B\u4E0A\u8FB9\u7F18\u603B\u4E4B\u522B\u7684\u5757\u7684\u4E0B\u8FB9\u7F18\n              used.forEach(function (i) {\n                if (i.m > hc) return;\n                var p = i.m;\n                var m = p + hv;\n                var tas = t0s;\n                var tal = t0l;\n                // \u8FD9\u4E9B\u5757\u7684\u5DE6\u8FB9\u7F18\u603B\u662F\u8FD9\u4E2A\u533A\u57DF\u91CC\u9762\u6700\u5927\u7684\u8FB9\u7F18\n                used.forEach(function (j) {\n                  if (j.p >= m) return;\n                  if (j.m <= p) return;\n                  if (j.b && b) return;\n                  tas = Math.max(tas, j.tf);\n                  tal = Math.max(tal, j.td);\n                });\n                // \u6700\u540E\u4F5C\u4E3A\u4E00\u79CD\u5907\u9009\u7559\u4E0B\u6765\n                suggestion.push({\n                  \'p\': p,\n                  \'r\': Math.max(tas - t0s, tal - t0l),\n                });\n              });\n              // \u6839\u636E\u9AD8\u5EA6\u6392\u5E8F\n              suggestion.sort(function (x, y) { return x.p - y.p; });\n              var mr = maxr;\n              // \u53C8\u9760\u53F3\u53C8\u9760\u4E0B\u7684\u9009\u62E9\u53EF\u4EE5\u5FFD\u7565\uFF0C\u5269\u4E0B\u7684\u8FD4\u56DE\n              suggestion = suggestion.filter(function (i) {\n                if (i.r >= mr) return false;\n                mr = i.r;\n                return true;\n              });\n              return suggestion;\n            };\n            // \u6DFB\u52A0\u4E00\u4E2A\u88AB\u4F7F\u7528\u7684\n            var use = function (p, m, tf, td) {\n              used.push({ \'p\': p, \'m\': m, \'tf\': tf, \'td\': td, \'b\': false });\n            };\n            // \u6839\u636E\u65F6\u95F4\u540C\u6B65\u6389\u65E0\u7528\u7684\n            var syn = function (t0s, t0l) {\n              used = used.filter(function (i) { return i.tf > t0s || i.td > t0l; });\n            };\n            // \u7ED9\u6240\u6709\u53EF\u80FD\u7684\u4F4D\u7F6E\u6253\u5206\uFF0C\u5206\u6570\u662F[0, 1)\u7684\n            var score = function (i) {\n              if (i.r > maxr) return -Infinity;\n              return 1 - hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;\n            };\n            // \u6DFB\u52A0\u4E00\u6761\n            return function (t0s, wv, hv, b) {\n              var t0l = wc / (wv + wc) * u + t0s;\n              syn(t0s, t0l);\n              var al = available(hv, t0s, t0l, b);\n              if (!al.length) return null;\n              var scored = al.map(function (i) { return [score(i), i]; });\n              var best = scored.reduce(function (x, y) {\n                return x[0] > y[0] ? x : y;\n              })[1];\n              var ts = t0s + best.r;\n              var tf = wv / (wv + wc) * u + ts;\n              var td = u + ts;\n              use(best.p, best.p + hv, tf, td);\n              return {\n                \'top\': best.p,\n                \'time\': ts,\n              };\n            };\n          };\n        }(config.playResX, config.playResY, config.bottom, config.r2ltime, config.max_delay));\n        \n        // \u9876\u90E8\u3001\u5E95\u90E8\u5F39\u5E55\n        var sideDanmaku = (function (hc, b, u, maxr) {\n          return function () {\n            var used = [\n              { \'p\': -Infinity, \'m\': 0, \'td\': Infinity, \'b\': false },\n              { \'p\': hc, \'m\': Infinity, \'td\': Infinity, \'b\': false },\n              { \'p\': hc - b, \'m\': hc, \'td\': Infinity, \'b\': true },\n            ];\n            // \u67E5\u627E\u53EF\u7528\u7684\u4F4D\u7F6E\n            var fr = function (p, m, t0s, b) {\n              var tas = t0s;\n              used.forEach(function (j) {\n                if (j.p >= m) return;\n                if (j.m <= p) return;\n                if (j.b && b) return;\n                tas = Math.max(tas, j.td);\n              });\n              return { \'r\': tas - t0s, \'p\': p, \'m\': m };\n            };\n            // \u9876\u90E8\n            var top = function (hv, t0s, b) {\n              var suggestion = [];\n              used.forEach(function (i) {\n                if (i.m > hc) return;\n                suggestion.push(fr(i.m, i.m + hv, t0s, b));\n              });\n              return suggestion;\n            };\n            // \u5E95\u90E8\n            var bottom = function (hv, t0s, b) {\n              var suggestion = [];\n              used.forEach(function (i) {\n                if (i.p < 0) return;\n                suggestion.push(fr(i.p - hv, i.p, t0s, b));\n              });\n              return suggestion;\n            };\n            var use = function (p, m, td) {\n              used.push({ \'p\': p, \'m\': m, \'td\': td, \'b\': false });\n            };\n            var syn = function (t0s) {\n              used = used.filter(function (i) { return i.td > t0s; });\n            };\n            // \u6311\u9009\u6700\u597D\u7684\u65B9\u6848\uFF1A\u5EF6\u8FDF\u5C0F\u7684\u4F18\u5148\uFF0C\u4F4D\u7F6E\u4E0D\u91CD\u8981\n            var score = function (i, is_top) {\n              if (i.r > maxr) return -Infinity;\n              var f = function (p) { return is_top ? p : (hc - p); };\n              return 1 - (i.r / maxr * (31/32) + f(i.p) / hc * (1/32));\n            };\n            return function (t0s, hv, is_top, b) {\n              syn(t0s);\n              var al = (is_top ? top : bottom)(hv, t0s, b);\n              if (!al.length) return null;\n              var scored = al.map(function (i) { return [score(i, is_top), i]; });\n              var best = scored.reduce(function (x, y) {\n                return x[0] > y[0] ? x : y;\n              })[1];\n              use(best.p, best.m, best.r + t0s + u)\n              return { \'top\': best.p, \'time\': best.r + t0s };\n            };\n          };\n        }(config.playResY, config.bottom, config.fixtime, config.max_delay));\n        \n        // \u4E3A\u6BCF\u6761\u5F39\u5E55\u5B89\u7F6E\u4F4D\u7F6E\n        var setPosition = function (danmaku) {\n          var normal = normalDanmaku(), side = sideDanmaku();\n          return danmaku\n            .sort(function (x, y) { return x.time - y.time; })\n            .map(function (line) {\n              var font_size = Math.round(line.size * config.font_size);\n              var width = calcWidth(line.text, font_size);\n              switch (line.mode) {\n                case \'R2L\': return (function () {\n                  var pos = normal(line.time, width, font_size, line.bottom);\n                  if (!pos) return null;\n                  line.type = \'R2L\';\n                  line.stime = pos.time;\n                  line.poss = {\n                    \'x\': config.playResX + width / 2,\n                    \'y\': pos.top + font_size,\n                  };\n                  line.posd = {\n                    \'x\': -width / 2,\n                    \'y\': pos.top + font_size,\n                  };\n                  line.dtime = config.r2ltime + line.stime;\n                  return line;\n                }());\n                case \'TOP\': case \'BOTTOM\': return (function (isTop) {\n                  var pos = side(line.time, font_size, isTop, line.bottom);\n                  if (!pos) return null;\n                  line.type = \'Fix\';\n                  line.stime = pos.time;\n                  line.posd = line.poss = {\n                    \'x\': Math.round(config.playResX / 2),\n                    \'y\': pos.top + font_size,\n                  };\n                  line.dtime = config.fixtime + line.stime;\n                  return line;\n                }(line.mode === \'TOP\'));\n                default: return null;\n              };\n            })\n            .filter(function (l) { return l; })\n            .sort(function (x, y) { return x.stime - y.stime; });\n        };\n        \n        /*\n         * bilibili\n         */\n        \n        // \u83B7\u53D6xml\n        var fetchXML = function (cid, callback) {\n          GM_xmlhttpRequest({\n            \'method\': \'GET\',\n            \'url\': \'http://comment.bilibili.com/{{cid}}.xml\'.replace(\'{{cid}}\', cid),\n            \'onload\': function (resp) {\n              var content = resp.responseText.replace(/(?:[\\0-\\x08\\x0B\\f\\x0E-\\x1F\\uFFFE\\uFFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])/g, "");\n              callback(content);\n            }\n          });\n        };\n        \n        var fetchDanmaku = function (cid, callback) {\n          fetchXML(cid, function (content) {\n            callback(parseXML(content));\n          });\n        };\n        \n        var parseXML = function (content) {\n          var data = (new DOMParser()).parseFromString(content, \'text/xml\');\n          return Array.apply(Array, data.querySelectorAll(\'d\')).map(function (line) {\n            var info = line.getAttribute(\'p\').split(\',\'), text = line.textContent;\n            return {\n              \'text\': text,\n              \'time\': Number(info[0]),\n              \'mode\': [undefined, \'R2L\', \'R2L\', \'R2L\', \'BOTTOM\', \'TOP\'][Number(info[1])],\n              \'size\': Number(info[2]),\n              \'color\': RRGGBB(parseInt(info[3], 10) & 0xffffff),\n              \'bottom\': Number(info[5]) > 0,\n              // \'create\': new Date(Number(info[4])),\n              // \'pool\': Number(info[5]),\n              // \'sender\': String(info[6]),\n              // \'dmid\': Number(info[7]),\n            };\n          });\n        };\n        \n        fetchXML = function (cid, callback) {\n            var oReq = new XMLHttpRequest();\n            oReq.open(\'GET\', \'https://comment.bilibili.com/{{cid}}.xml\'.replace(\'{{cid}}\', cid));\n            oReq.onload = function () {\n                var content = oReq.responseText.replace(/(?:[\\0-\\x08\\x0B\\f\\x0E-\\x1F\\uFFFE\\uFFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])/g, "");\n                callback(content);\n            };\n            oReq.send();\n        };\n        \n        initFont();\n        \n        return { fetchDanmaku: fetchDanmaku, generateASS: generateASS, setPosition: setPosition };        \n        ')(option);

            this.fetchDanmaku = _ref21.fetchDanmaku;
            this.generateASS = _ref21.generateASS;
            this.setPosition = _ref21.setPosition;
        }

        _createClass(ASSDownloader, [{
            key: 'fetchDanmaku',
            value: function fetchDanmaku() { }
        }, {
            key: 'generateASS',
            value: function generateASS() { }
        }, {
            key: 'setPosition',
            value: function setPosition() { }
        }]);

        return ASSDownloader;
    }();

    var MKVTransmuxer = function () {
        function MKVTransmuxer(option) {
            _classCallCheck(this, MKVTransmuxer);

            this.playerWin = null;
            this.option = option;
        }

        _createClass(MKVTransmuxer, [{
            key: 'exec',
            value: function exec(flv, ass, name) {
                // 1. Allocate for a new window
                if (!this.playerWin) this.playerWin = top.open('', undefined, ' ');

                // 2. Inject scripts
                this.playerWin.document.write('\n        <p>\n            \u52A0\u8F7D\u6587\u4EF6\u2026\u2026 loading files...\n            <progress value="0" max="100" id="fileProgress"></progress>\n        </p>\n        <p>\n            \u6784\u5EFAmkv\u2026\u2026 building mkv...\n            <progress value="0" max="100" id="mkvProgress"></progress>\n        </p>\n        <p>\n            <a id="a" download="merged.mkv">merged.mkv</a>\n        </p>\n        <script>\n        /**\n         * FLV + ASS => MKV transmuxer\n         * Demux FLV into H264 + AAC stream and ASS into line stream; then\n         * remux them into a MKV file.\n         * \n         * @author qli5 <goodlq11[at](163|gmail).com>\n         * \n         * This Source Code Form is subject to the terms of the Mozilla Public\n         * License, v. 2.0. If a copy of the MPL was not distributed with this\n         * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n         * \n         * The FLV demuxer is from flv.js <https://github.com/Bilibili/flv.js/>\n         * by zheng qian <xqq@xqq.im>, licensed under Apache 2.0.\n         * \n         * The EMBL builder is from simple-ebml-builder\n         * <https://www.npmjs.com/package/simple-ebml-builder> by ryiwamoto, \n         * licensed under MIT.\n         */\n        \n        // nodejs polyfill\n        if (typeof Blob == \'undefined\') {\n            var Blob = class {\n                constructor(array) {\n                    return Buffer.concat(array.map(Buffer.from.bind(Buffer)));\n                }\n            };\n        }\n        if (typeof TextEncoder == \'undefined\') {\n            var TextEncoder = class {\n                /**\n                 * \n                 * @param {string} chunk \n                 * @returns {Uint8Array}\n                 */\n                encode(chunk) {\n                    return Buffer.from(chunk, \'utf-8\');\n                }\n            }\n        }\n        if (typeof TextDecoder == \'undefined\') {\n            const StringDecoder = require(\'string_decoder\').StringDecoder;\n            var TextDecoder = class extends StringDecoder {\n                /**\n                 * \n                 * @param {ArrayBuffer} chunk \n                 * @returns {string}\n                 */\n                decode(chunk) {\n                    return this.end(Buffer.from(chunk));\n                }\n            }\n        }\n        \n        /**\n         * The FLV demuxer is from flv.js\n         * \n         * Copyright (C) 2016 Bilibili. All Rights Reserved.\n         *\n         * @author zheng qian <xqq@xqq.im>\n         *\n         * Licensed under the Apache License, Version 2.0 (the "License");\n         * you may not use this file except in compliance with the License.\n         * You may obtain a copy of the License at\n         *\n         *     http://www.apache.org/licenses/LICENSE-2.0\n         *\n         * Unless required by applicable law or agreed to in writing, software\n         * distributed under the License is distributed on an "AS IS" BASIS,\n         * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n         * See the License for the specific language governing permissions and\n         * limitations under the License.\n         */\n        \n        const FLVDemuxer = (() => {\n            // I browserified flv.js manually - so that I can know how it works\n            if (typeof navigator == \'undefined\') navigator = {\n                userAgent: \'chrome\',\n            }\n        \n            // import FLVDemuxer from \'flv.js/src/demux/flv-demuxer\';\n            // ..import Log from \'../utils/logger.js\';\n            const Log = {\n                e: console.error.bind(console),\n                w: console.warn.bind(console),\n                i: console.log.bind(console),\n                v: console.log.bind(console),\n            };\n        \n            // ..import AMF from \'./amf-parser.js\';\n            // ....import Log from \'../utils/logger.js\';\n            // ....import decodeUTF8 from \'../utils/utf8-conv.js\';\n            function checkContinuation(uint8array, start, checkLength) {\n                let array = uint8array;\n                if (start + checkLength < array.length) {\n                    while (checkLength--) {\n                        if ((array[++start] & 0xC0) !== 0x80)\n                            return false;\n                    }\n                    return true;\n                } else {\n                    return false;\n                }\n            }\n        \n            function decodeUTF8(uint8array) {\n                let out = [];\n                let input = uint8array;\n                let i = 0;\n                let length = uint8array.length;\n        \n                while (i < length) {\n                    if (input[i] < 0x80) {\n                        out.push(String.fromCharCode(input[i]));\n                        ++i;\n                        continue;\n                    } else if (input[i] < 0xC0) {\n                        // fallthrough\n                    } else if (input[i] < 0xE0) {\n                        if (checkContinuation(input, i, 1)) {\n                            let ucs4 = (input[i] & 0x1F) << 6 | (input[i + 1] & 0x3F);\n                            if (ucs4 >= 0x80) {\n                                out.push(String.fromCharCode(ucs4 & 0xFFFF));\n                                i += 2;\n                                continue;\n                            }\n                        }\n                    } else if (input[i] < 0xF0) {\n                        if (checkContinuation(input, i, 2)) {\n                            let ucs4 = (input[i] & 0xF) << 12 | (input[i + 1] & 0x3F) << 6 | input[i + 2] & 0x3F;\n                            if (ucs4 >= 0x800 && (ucs4 & 0xF800) !== 0xD800) {\n                                out.push(String.fromCharCode(ucs4 & 0xFFFF));\n                                i += 3;\n                                continue;\n                            }\n                        }\n                    } else if (input[i] < 0xF8) {\n                        if (checkContinuation(input, i, 3)) {\n                            let ucs4 = (input[i] & 0x7) << 18 | (input[i + 1] & 0x3F) << 12\n                                | (input[i + 2] & 0x3F) << 6 | (input[i + 3] & 0x3F);\n                            if (ucs4 > 0x10000 && ucs4 < 0x110000) {\n                                ucs4 -= 0x10000;\n                                out.push(String.fromCharCode((ucs4 >>> 10) | 0xD800));\n                                out.push(String.fromCharCode((ucs4 & 0x3FF) | 0xDC00));\n                                i += 4;\n                                continue;\n                            }\n                        }\n                    }\n                    out.push(String.fromCharCode(0xFFFD));\n                    ++i;\n                }\n        \n                return out.join(\'\');\n            }\n        \n            // ....import {IllegalStateException} from \'../utils/exception.js\';\n            class IllegalStateException extends Error { }\n        \n            let le = (function () {\n                let buf = new ArrayBuffer(2);\n                (new DataView(buf)).setInt16(0, 256, true);  // little-endian write\n                return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE\n            })();\n        \n            class AMF {\n        \n                static parseScriptData(arrayBuffer, dataOffset, dataSize) {\n                    let data = {};\n        \n                    try {\n                        let name = AMF.parseValue(arrayBuffer, dataOffset, dataSize);\n                        let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);\n        \n                        data[name.data] = value.data;\n                    } catch (e) {\n                        Log.e(\'AMF\', e.toString());\n                    }\n        \n                    return data;\n                }\n        \n                static parseObject(arrayBuffer, dataOffset, dataSize) {\n                    if (dataSize < 3) {\n                        throw new IllegalStateException(\'Data not enough when parse ScriptDataObject\');\n                    }\n                    let name = AMF.parseString(arrayBuffer, dataOffset, dataSize);\n                    let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);\n                    let isObjectEnd = value.objectEnd;\n        \n                    return {\n                        data: {\n                            name: name.data,\n                            value: value.data\n                        },\n                        size: name.size + value.size,\n                        objectEnd: isObjectEnd\n                    };\n                }\n        \n                static parseVariable(arrayBuffer, dataOffset, dataSize) {\n                    return AMF.parseObject(arrayBuffer, dataOffset, dataSize);\n                }\n        \n                static parseString(arrayBuffer, dataOffset, dataSize) {\n                    if (dataSize < 2) {\n                        throw new IllegalStateException(\'Data not enough when parse String\');\n                    }\n                    let v = new DataView(arrayBuffer, dataOffset, dataSize);\n                    let length = v.getUint16(0, !le);\n        \n                    let str;\n                    if (length > 0) {\n                        str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 2, length));\n                    } else {\n                        str = \'\';\n                    }\n        \n                    return {\n                        data: str,\n                        size: 2 + length\n                    };\n                }\n        \n                static parseLongString(arrayBuffer, dataOffset, dataSize) {\n                    if (dataSize < 4) {\n                        throw new IllegalStateException(\'Data not enough when parse LongString\');\n                    }\n                    let v = new DataView(arrayBuffer, dataOffset, dataSize);\n                    let length = v.getUint32(0, !le);\n        \n                    let str;\n                    if (length > 0) {\n                        str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 4, length));\n                    } else {\n                        str = \'\';\n                    }\n        \n                    return {\n                        data: str,\n                        size: 4 + length\n                    };\n                }\n        \n                static parseDate(arrayBuffer, dataOffset, dataSize) {\n                    if (dataSize < 10) {\n                        throw new IllegalStateException(\'Data size invalid when parse Date\');\n                    }\n                    let v = new DataView(arrayBuffer, dataOffset, dataSize);\n                    let timestamp = v.getFloat64(0, !le);\n                    let localTimeOffset = v.getInt16(8, !le);\n                    timestamp += localTimeOffset * 60 * 1000;  // get UTC time\n        \n                    return {\n                        data: new Date(timestamp),\n                        size: 8 + 2\n                    };\n                }\n        \n                static parseValue(arrayBuffer, dataOffset, dataSize) {\n                    if (dataSize < 1) {\n                        throw new IllegalStateException(\'Data not enough when parse Value\');\n                    }\n        \n                    let v = new DataView(arrayBuffer, dataOffset, dataSize);\n        \n                    let offset = 1;\n                    let type = v.getUint8(0);\n                    let value;\n                    let objectEnd = false;\n        \n                    try {\n                        switch (type) {\n                            case 0:  // Number(Double) type\n                                value = v.getFloat64(1, !le);\n                                offset += 8;\n                                break;\n                            case 1: {  // Boolean type\n                                let b = v.getUint8(1);\n                                value = b ? true : false;\n                                offset += 1;\n                                break;\n                            }\n                            case 2: {  // String type\n                                let amfstr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);\n                                value = amfstr.data;\n                                offset += amfstr.size;\n                                break;\n                            }\n                            case 3: { // Object(s) type\n                                value = {};\n                                let terminal = 0;  // workaround for malformed Objects which has missing ScriptDataObjectEnd\n                                if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {\n                                    terminal = 3;\n                                }\n                                while (offset < dataSize - 4) {  // 4 === type(UI8) + ScriptDataObjectEnd(UI24)\n                                    let amfobj = AMF.parseObject(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);\n                                    if (amfobj.objectEnd)\n                                        break;\n                                    value[amfobj.data.name] = amfobj.data.value;\n                                    offset += amfobj.size;\n                                }\n                                if (offset <= dataSize - 3) {\n                                    let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;\n                                    if (marker === 9) {\n                                        offset += 3;\n                                    }\n                                }\n                                break;\n                            }\n                            case 8: { // ECMA array type (Mixed array)\n                                value = {};\n                                offset += 4;  // ECMAArrayLength(UI32)\n                                let terminal = 0;  // workaround for malformed MixedArrays which has missing ScriptDataObjectEnd\n                                if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {\n                                    terminal = 3;\n                                }\n                                while (offset < dataSize - 8) {  // 8 === type(UI8) + ECMAArrayLength(UI32) + ScriptDataVariableEnd(UI24)\n                                    let amfvar = AMF.parseVariable(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);\n                                    if (amfvar.objectEnd)\n                                        break;\n                                    value[amfvar.data.name] = amfvar.data.value;\n                                    offset += amfvar.size;\n                                }\n                                if (offset <= dataSize - 3) {\n                                    let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;\n                                    if (marker === 9) {\n                                        offset += 3;\n                                    }\n                                }\n                                break;\n                            }\n                            case 9:  // ScriptDataObjectEnd\n                                value = undefined;\n                                offset = 1;\n                                objectEnd = true;\n                                break;\n                            case 10: {  // Strict array type\n                                // ScriptDataValue[n]. NOTE: according to video_file_format_spec_v10_1.pdf\n                                value = [];\n                                let strictArrayLength = v.getUint32(1, !le);\n                                offset += 4;\n                                for (let i = 0; i < strictArrayLength; i++) {\n                                    let val = AMF.parseValue(arrayBuffer, dataOffset + offset, dataSize - offset);\n                                    value.push(val.data);\n                                    offset += val.size;\n                                }\n                                break;\n                            }\n                            case 11: {  // Date type\n                                let date = AMF.parseDate(arrayBuffer, dataOffset + 1, dataSize - 1);\n                                value = date.data;\n                                offset += date.size;\n                                break;\n                            }\n                            case 12: {  // Long string type\n                                let amfLongStr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);\n                                value = amfLongStr.data;\n                                offset += amfLongStr.size;\n                                break;\n                            }\n                            default:\n                                // ignore and skip\n                                offset = dataSize;\n                                Log.w(\'AMF\', \'Unsupported AMF value type \' + type);\n                        }\n                    } catch (e) {\n                        Log.e(\'AMF\', e.toString());\n                    }\n        \n                    return {\n                        data: value,\n                        size: offset,\n                        objectEnd: objectEnd\n                    };\n                }\n        \n            }\n        \n            // ..import SPSParser from \'./sps-parser.js\';\n            // ....import ExpGolomb from \'./exp-golomb.js\';\n            // ......import {IllegalStateException, InvalidArgumentException} from \'../utils/exception.js\';\n            class InvalidArgumentException extends Error { }\n        \n            class ExpGolomb {\n        \n                constructor(uint8array) {\n                    this.TAG = \'ExpGolomb\';\n        \n                    this._buffer = uint8array;\n                    this._buffer_index = 0;\n                    this._total_bytes = uint8array.byteLength;\n                    this._total_bits = uint8array.byteLength * 8;\n                    this._current_word = 0;\n                    this._current_word_bits_left = 0;\n                }\n        \n                destroy() {\n                    this._buffer = null;\n                }\n        \n                _fillCurrentWord() {\n                    let buffer_bytes_left = this._total_bytes - this._buffer_index;\n                    if (buffer_bytes_left <= 0)\n                        throw new IllegalStateException(\'ExpGolomb: _fillCurrentWord() but no bytes available\');\n        \n                    let bytes_read = Math.min(4, buffer_bytes_left);\n                    let word = new Uint8Array(4);\n                    word.set(this._buffer.subarray(this._buffer_index, this._buffer_index + bytes_read));\n                    this._current_word = new DataView(word.buffer).getUint32(0, false);\n        \n                    this._buffer_index += bytes_read;\n                    this._current_word_bits_left = bytes_read * 8;\n                }\n        \n                readBits(bits) {\n                    if (bits > 32)\n                        throw new InvalidArgumentException(\'ExpGolomb: readBits() bits exceeded max 32bits!\');\n        \n                    if (bits <= this._current_word_bits_left) {\n                        let result = this._current_word >>> (32 - bits);\n                        this._current_word <<= bits;\n                        this._current_word_bits_left -= bits;\n                        return result;\n                    }\n        \n                    let result = this._current_word_bits_left ? this._current_word : 0;\n                    result = result >>> (32 - this._current_word_bits_left);\n                    let bits_need_left = bits - this._current_word_bits_left;\n        \n                    this._fillCurrentWord();\n                    let bits_read_next = Math.min(bits_need_left, this._current_word_bits_left);\n        \n                    let result2 = this._current_word >>> (32 - bits_read_next);\n                    this._current_word <<= bits_read_next;\n                    this._current_word_bits_left -= bits_read_next;\n        \n                    result = (result << bits_read_next) | result2;\n                    return result;\n                }\n        \n                readBool() {\n                    return this.readBits(1) === 1;\n                }\n        \n                readByte() {\n                    return this.readBits(8);\n                }\n        \n                _skipLeadingZero() {\n                    let zero_count;\n                    for (zero_count = 0; zero_count < this._current_word_bits_left; zero_count++) {\n                        if (0 !== (this._current_word & (0x80000000 >>> zero_count))) {\n                            this._current_word <<= zero_count;\n                            this._current_word_bits_left -= zero_count;\n                            return zero_count;\n                        }\n                    }\n                    this._fillCurrentWord();\n                    return zero_count + this._skipLeadingZero();\n                }\n        \n                readUEG() {  // unsigned exponential golomb\n                    let leading_zeros = this._skipLeadingZero();\n                    return this.readBits(leading_zeros + 1) - 1;\n                }\n        \n                readSEG() {  // signed exponential golomb\n                    let value = this.readUEG();\n                    if (value & 0x01) {\n                        return (value + 1) >>> 1;\n                    } else {\n                        return -1 * (value >>> 1);\n                    }\n                }\n        \n            }\n        \n            class SPSParser {\n        \n                static _ebsp2rbsp(uint8array) {\n                    let src = uint8array;\n                    let src_length = src.byteLength;\n                    let dst = new Uint8Array(src_length);\n                    let dst_idx = 0;\n        \n                    for (let i = 0; i < src_length; i++) {\n                        if (i >= 2) {\n                            // Unescape: Skip 0x03 after 00 00\n                            if (src[i] === 0x03 && src[i - 1] === 0x00 && src[i - 2] === 0x00) {\n                                continue;\n                            }\n                        }\n                        dst[dst_idx] = src[i];\n                        dst_idx++;\n                    }\n        \n                    return new Uint8Array(dst.buffer, 0, dst_idx);\n                }\n        \n                static parseSPS(uint8array) {\n                    let rbsp = SPSParser._ebsp2rbsp(uint8array);\n                    let gb = new ExpGolomb(rbsp);\n        \n                    gb.readByte();\n                    let profile_idc = gb.readByte();  // profile_idc\n                    gb.readByte();  // constraint_set_flags[5] + reserved_zero[3]\n                    let level_idc = gb.readByte();  // level_idc\n                    gb.readUEG();  // seq_parameter_set_id\n        \n                    let profile_string = SPSParser.getProfileString(profile_idc);\n                    let level_string = SPSParser.getLevelString(level_idc);\n                    let chroma_format_idc = 1;\n                    let chroma_format = 420;\n                    let chroma_format_table = [0, 420, 422, 444];\n                    let bit_depth = 8;\n        \n                    if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 ||\n                        profile_idc === 244 || profile_idc === 44 || profile_idc === 83 ||\n                        profile_idc === 86 || profile_idc === 118 || profile_idc === 128 ||\n                        profile_idc === 138 || profile_idc === 144) {\n        \n                        chroma_format_idc = gb.readUEG();\n                        if (chroma_format_idc === 3) {\n                            gb.readBits(1);  // separate_colour_plane_flag\n                        }\n                        if (chroma_format_idc <= 3) {\n                            chroma_format = chroma_format_table[chroma_format_idc];\n                        }\n        \n                        bit_depth = gb.readUEG() + 8;  // bit_depth_luma_minus8\n                        gb.readUEG();  // bit_depth_chroma_minus8\n                        gb.readBits(1);  // qpprime_y_zero_transform_bypass_flag\n                        if (gb.readBool()) {  // seq_scaling_matrix_present_flag\n                            let scaling_list_count = (chroma_format_idc !== 3) ? 8 : 12;\n                            for (let i = 0; i < scaling_list_count; i++) {\n                                if (gb.readBool()) {  // seq_scaling_list_present_flag\n                                    if (i < 6) {\n                                        SPSParser._skipScalingList(gb, 16);\n                                    } else {\n                                        SPSParser._skipScalingList(gb, 64);\n                                    }\n                                }\n                            }\n                        }\n                    }\n                    gb.readUEG();  // log2_max_frame_num_minus4\n                    let pic_order_cnt_type = gb.readUEG();\n                    if (pic_order_cnt_type === 0) {\n                        gb.readUEG();  // log2_max_pic_order_cnt_lsb_minus_4\n                    } else if (pic_order_cnt_type === 1) {\n                        gb.readBits(1);  // delta_pic_order_always_zero_flag\n                        gb.readSEG();  // offset_for_non_ref_pic\n                        gb.readSEG();  // offset_for_top_to_bottom_field\n                        let num_ref_frames_in_pic_order_cnt_cycle = gb.readUEG();\n                        for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i++) {\n                            gb.readSEG();  // offset_for_ref_frame\n                        }\n                    }\n                    gb.readUEG();  // max_num_ref_frames\n                    gb.readBits(1);  // gaps_in_frame_num_value_allowed_flag\n        \n                    let pic_width_in_mbs_minus1 = gb.readUEG();\n                    let pic_height_in_map_units_minus1 = gb.readUEG();\n        \n                    let frame_mbs_only_flag = gb.readBits(1);\n                    if (frame_mbs_only_flag === 0) {\n                        gb.readBits(1);  // mb_adaptive_frame_field_flag\n                    }\n                    gb.readBits(1);  // direct_8x8_inference_flag\n        \n                    let frame_crop_left_offset = 0;\n                    let frame_crop_right_offset = 0;\n                    let frame_crop_top_offset = 0;\n                    let frame_crop_bottom_offset = 0;\n        \n                    let frame_cropping_flag = gb.readBool();\n                    if (frame_cropping_flag) {\n                        frame_crop_left_offset = gb.readUEG();\n                        frame_crop_right_offset = gb.readUEG();\n                        frame_crop_top_offset = gb.readUEG();\n                        frame_crop_bottom_offset = gb.readUEG();\n                    }\n        \n                    let sar_width = 1, sar_height = 1;\n                    let fps = 0, fps_fixed = true, fps_num = 0, fps_den = 0;\n        \n                    let vui_parameters_present_flag = gb.readBool();\n                    if (vui_parameters_present_flag) {\n                        if (gb.readBool()) {  // aspect_ratio_info_present_flag\n                            let aspect_ratio_idc = gb.readByte();\n                            let sar_w_table = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2];\n                            let sar_h_table = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33, 99, 3, 2, 1];\n        \n                            if (aspect_ratio_idc > 0 && aspect_ratio_idc < 16) {\n                                sar_width = sar_w_table[aspect_ratio_idc - 1];\n                                sar_height = sar_h_table[aspect_ratio_idc - 1];\n                            } else if (aspect_ratio_idc === 255) {\n                                sar_width = gb.readByte() << 8 | gb.readByte();\n                                sar_height = gb.readByte() << 8 | gb.readByte();\n                            }\n                        }\n        \n                        if (gb.readBool()) {  // overscan_info_present_flag\n                            gb.readBool();  // overscan_appropriate_flag\n                        }\n                        if (gb.readBool()) {  // video_signal_type_present_flag\n                            gb.readBits(4);  // video_format & video_full_range_flag\n                            if (gb.readBool()) {  // colour_description_present_flag\n                                gb.readBits(24);  // colour_primaries & transfer_characteristics & matrix_coefficients\n                            }\n                        }\n                        if (gb.readBool()) {  // chroma_loc_info_present_flag\n                            gb.readUEG();  // chroma_sample_loc_type_top_field\n                            gb.readUEG();  // chroma_sample_loc_type_bottom_field\n                        }\n                        if (gb.readBool()) {  // timing_info_present_flag\n                            let num_units_in_tick = gb.readBits(32);\n                            let time_scale = gb.readBits(32);\n                            fps_fixed = gb.readBool();  // fixed_frame_rate_flag\n        \n                            fps_num = time_scale;\n                            fps_den = num_units_in_tick * 2;\n                            fps = fps_num / fps_den;\n                        }\n                    }\n        \n                    let sarScale = 1;\n                    if (sar_width !== 1 || sar_height !== 1) {\n                        sarScale = sar_width / sar_height;\n                    }\n        \n                    let crop_unit_x = 0, crop_unit_y = 0;\n                    if (chroma_format_idc === 0) {\n                        crop_unit_x = 1;\n                        crop_unit_y = 2 - frame_mbs_only_flag;\n                    } else {\n                        let sub_wc = (chroma_format_idc === 3) ? 1 : 2;\n                        let sub_hc = (chroma_format_idc === 1) ? 2 : 1;\n                        crop_unit_x = sub_wc;\n                        crop_unit_y = sub_hc * (2 - frame_mbs_only_flag);\n                    }\n        \n                    let codec_width = (pic_width_in_mbs_minus1 + 1) * 16;\n                    let codec_height = (2 - frame_mbs_only_flag) * ((pic_height_in_map_units_minus1 + 1) * 16);\n        \n                    codec_width -= (frame_crop_left_offset + frame_crop_right_offset) * crop_unit_x;\n                    codec_height -= (frame_crop_top_offset + frame_crop_bottom_offset) * crop_unit_y;\n        \n                    let present_width = Math.ceil(codec_width * sarScale);\n        \n                    gb.destroy();\n                    gb = null;\n        \n                    return {\n                        profile_string: profile_string,  // baseline, high, high10, ...\n                        level_string: level_string,  // 3, 3.1, 4, 4.1, 5, 5.1, ...\n                        bit_depth: bit_depth,  // 8bit, 10bit, ...\n                        chroma_format: chroma_format,  // 4:2:0, 4:2:2, ...\n                        chroma_format_string: SPSParser.getChromaFormatString(chroma_format),\n        \n                        frame_rate: {\n                            fixed: fps_fixed,\n                            fps: fps,\n                            fps_den: fps_den,\n                            fps_num: fps_num\n                        },\n        \n                        sar_ratio: {\n                            width: sar_width,\n                            height: sar_height\n                        },\n        \n                        codec_size: {\n                            width: codec_width,\n                            height: codec_height\n                        },\n        \n                        present_size: {\n                            width: present_width,\n                            height: codec_height\n                        }\n                    };\n                }\n        \n                static _skipScalingList(gb, count) {\n                    let last_scale = 8, next_scale = 8;\n                    let delta_scale = 0;\n                    for (let i = 0; i < count; i++) {\n                        if (next_scale !== 0) {\n                            delta_scale = gb.readSEG();\n                            next_scale = (last_scale + delta_scale + 256) % 256;\n                        }\n                        last_scale = (next_scale === 0) ? last_scale : next_scale;\n                    }\n                }\n        \n                static getProfileString(profile_idc) {\n                    switch (profile_idc) {\n                        case 66:\n                            return \'Baseline\';\n                        case 77:\n                            return \'Main\';\n                        case 88:\n                            return \'Extended\';\n                        case 100:\n                            return \'High\';\n                        case 110:\n                            return \'High10\';\n                        case 122:\n                            return \'High422\';\n                        case 244:\n                            return \'High444\';\n                        default:\n                            return \'Unknown\';\n                    }\n                }\n        \n                static getLevelString(level_idc) {\n                    return (level_idc / 10).toFixed(1);\n                }\n        \n                static getChromaFormatString(chroma) {\n                    switch (chroma) {\n                        case 420:\n                            return \'4:2:0\';\n                        case 422:\n                            return \'4:2:2\';\n                        case 444:\n                            return \'4:4:4\';\n                        default:\n                            return \'Unknown\';\n                    }\n                }\n        \n            }\n        \n            // ..import DemuxErrors from \'./demux-errors.js\';\n            const DemuxErrors = {\n                OK: \'OK\',\n                FORMAT_ERROR: \'FormatError\',\n                FORMAT_UNSUPPORTED: \'FormatUnsupported\',\n                CODEC_UNSUPPORTED: \'CodecUnsupported\'\n            };\n        \n            // ..import MediaInfo from \'../core/media-info.js\';\n            class MediaInfo {\n        \n                constructor() {\n                    this.mimeType = null;\n                    this.duration = null;\n        \n                    this.hasAudio = null;\n                    this.hasVideo = null;\n                    this.audioCodec = null;\n                    this.videoCodec = null;\n                    this.audioDataRate = null;\n                    this.videoDataRate = null;\n        \n                    this.audioSampleRate = null;\n                    this.audioChannelCount = null;\n        \n                    this.width = null;\n                    this.height = null;\n                    this.fps = null;\n                    this.profile = null;\n                    this.level = null;\n                    this.chromaFormat = null;\n                    this.sarNum = null;\n                    this.sarDen = null;\n        \n                    this.metadata = null;\n                    this.segments = null;  // MediaInfo[]\n                    this.segmentCount = null;\n                    this.hasKeyframesIndex = null;\n                    this.keyframesIndex = null;\n                }\n        \n                isComplete() {\n                    let audioInfoComplete = (this.hasAudio === false) ||\n                        (this.hasAudio === true &&\n                            this.audioCodec != null &&\n                            this.audioSampleRate != null &&\n                            this.audioChannelCount != null);\n        \n                    let videoInfoComplete = (this.hasVideo === false) ||\n                        (this.hasVideo === true &&\n                            this.videoCodec != null &&\n                            this.width != null &&\n                            this.height != null &&\n                            this.fps != null &&\n                            this.profile != null &&\n                            this.level != null &&\n                            this.chromaFormat != null &&\n                            this.sarNum != null &&\n                            this.sarDen != null);\n        \n                    // keyframesIndex may not be present\n                    return this.mimeType != null &&\n                        this.duration != null &&\n                        this.metadata != null &&\n                        this.hasKeyframesIndex != null &&\n                        audioInfoComplete &&\n                        videoInfoComplete;\n                }\n        \n                isSeekable() {\n                    return this.hasKeyframesIndex === true;\n                }\n        \n                getNearestKeyframe(milliseconds) {\n                    if (this.keyframesIndex == null) {\n                        return null;\n                    }\n        \n                    let table = this.keyframesIndex;\n                    let keyframeIdx = this._search(table.times, milliseconds);\n        \n                    return {\n                        index: keyframeIdx,\n                        milliseconds: table.times[keyframeIdx],\n                        fileposition: table.filepositions[keyframeIdx]\n                    };\n                }\n        \n                _search(list, value) {\n                    let idx = 0;\n        \n                    let last = list.length - 1;\n                    let mid = 0;\n                    let lbound = 0;\n                    let ubound = last;\n        \n                    if (value < list[0]) {\n                        idx = 0;\n                        lbound = ubound + 1;  // skip search\n                    }\n        \n                    while (lbound <= ubound) {\n                        mid = lbound + Math.floor((ubound - lbound) / 2);\n                        if (mid === last || (value >= list[mid] && value < list[mid + 1])) {\n                            idx = mid;\n                            break;\n                        } else if (list[mid] < value) {\n                            lbound = mid + 1;\n                        } else {\n                            ubound = mid - 1;\n                        }\n                    }\n        \n                    return idx;\n                }\n        \n            }\n        \n            function Swap16(src) {\n                return (((src >>> 8) & 0xFF) |\n                    ((src & 0xFF) << 8));\n            }\n        \n            function Swap32(src) {\n                return (((src & 0xFF000000) >>> 24) |\n                    ((src & 0x00FF0000) >>> 8) |\n                    ((src & 0x0000FF00) << 8) |\n                    ((src & 0x000000FF) << 24));\n            }\n        \n            function ReadBig32(array, index) {\n                return ((array[index] << 24) |\n                    (array[index + 1] << 16) |\n                    (array[index + 2] << 8) |\n                    (array[index + 3]));\n            }\n        \n            class FLVDemuxer {\n        \n                /**\n                 * Create a new FLV demuxer\n                 * @param {Object} probeData\n                 * @param {boolean} probeData.match\n                 * @param {number} probeData.consumed\n                 * @param {number} probeData.dataOffset\n                 * @param {booleam} probeData.hasAudioTrack\n                 * @param {boolean} probeData.hasVideoTrack\n                 * @param {*} config \n                 */\n                constructor(probeData, config) {\n                    this.TAG = \'FLVDemuxer\';\n        \n                    this._config = config;\n        \n                    this._onError = null;\n                    this._onMediaInfo = null;\n                    this._onTrackMetadata = null;\n                    this._onDataAvailable = null;\n        \n                    this._dataOffset = probeData.dataOffset;\n                    this._firstParse = true;\n                    this._dispatch = false;\n        \n                    this._hasAudio = probeData.hasAudioTrack;\n                    this._hasVideo = probeData.hasVideoTrack;\n        \n                    this._hasAudioFlagOverrided = false;\n                    this._hasVideoFlagOverrided = false;\n        \n                    this._audioInitialMetadataDispatched = false;\n                    this._videoInitialMetadataDispatched = false;\n        \n                    this._mediaInfo = new MediaInfo();\n                    this._mediaInfo.hasAudio = this._hasAudio;\n                    this._mediaInfo.hasVideo = this._hasVideo;\n                    this._metadata = null;\n                    this._audioMetadata = null;\n                    this._videoMetadata = null;\n        \n                    this._naluLengthSize = 4;\n                    this._timestampBase = 0;  // int32, in milliseconds\n                    this._timescale = 1000;\n                    this._duration = 0;  // int32, in milliseconds\n                    this._durationOverrided = false;\n                    this._referenceFrameRate = {\n                        fixed: true,\n                        fps: 23.976,\n                        fps_num: 23976,\n                        fps_den: 1000\n                    };\n        \n                    this._flvSoundRateTable = [5500, 11025, 22050, 44100, 48000];\n        \n                    this._mpegSamplingRates = [\n                        96000, 88200, 64000, 48000, 44100, 32000,\n                        24000, 22050, 16000, 12000, 11025, 8000, 7350\n                    ];\n        \n                    this._mpegAudioV10SampleRateTable = [44100, 48000, 32000, 0];\n                    this._mpegAudioV20SampleRateTable = [22050, 24000, 16000, 0];\n                    this._mpegAudioV25SampleRateTable = [11025, 12000, 8000, 0];\n        \n                    this._mpegAudioL1BitRateTable = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1];\n                    this._mpegAudioL2BitRateTable = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1];\n                    this._mpegAudioL3BitRateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1];\n        \n                    this._videoTrack = { type: \'video\', id: 1, sequenceNumber: 0, samples: [], length: 0 };\n                    this._audioTrack = { type: \'audio\', id: 2, sequenceNumber: 0, samples: [], length: 0 };\n        \n                    this._littleEndian = (function () {\n                        let buf = new ArrayBuffer(2);\n                        (new DataView(buf)).setInt16(0, 256, true);  // little-endian write\n                        return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE\n                    })();\n                }\n        \n                destroy() {\n                    this._mediaInfo = null;\n                    this._metadata = null;\n                    this._audioMetadata = null;\n                    this._videoMetadata = null;\n                    this._videoTrack = null;\n                    this._audioTrack = null;\n        \n                    this._onError = null;\n                    this._onMediaInfo = null;\n                    this._onTrackMetadata = null;\n                    this._onDataAvailable = null;\n                }\n        \n                /**\n                 * Probe the flv data\n                 * @param {ArrayBuffer} buffer\n                 * @returns {Object} - probeData to be feed into constructor\n                 */\n                static probe(buffer) {\n                    let data = new Uint8Array(buffer);\n                    let mismatch = { match: false };\n        \n                    if (data[0] !== 0x46 || data[1] !== 0x4C || data[2] !== 0x56 || data[3] !== 0x01) {\n                        return mismatch;\n                    }\n        \n                    let hasAudio = ((data[4] & 4) >>> 2) !== 0;\n                    let hasVideo = (data[4] & 1) !== 0;\n        \n                    let offset = ReadBig32(data, 5);\n        \n                    if (offset < 9) {\n                        return mismatch;\n                    }\n        \n                    return {\n                        match: true,\n                        consumed: offset,\n                        dataOffset: offset,\n                        hasAudioTrack: hasAudio,\n                        hasVideoTrack: hasVideo\n                    };\n                }\n        \n                bindDataSource(loader) {\n                    loader.onDataArrival = this.parseChunks.bind(this);\n                    return this;\n                }\n        \n                // prototype: function(type: string, metadata: any): void\n                get onTrackMetadata() {\n                    return this._onTrackMetadata;\n                }\n        \n                set onTrackMetadata(callback) {\n                    this._onTrackMetadata = callback;\n                }\n        \n                // prototype: function(mediaInfo: MediaInfo): void\n                get onMediaInfo() {\n                    return this._onMediaInfo;\n                }\n        \n                set onMediaInfo(callback) {\n                    this._onMediaInfo = callback;\n                }\n        \n                // prototype: function(type: number, info: string): void\n                get onError() {\n                    return this._onError;\n                }\n        \n                set onError(callback) {\n                    this._onError = callback;\n                }\n        \n                // prototype: function(videoTrack: any, audioTrack: any): void\n                get onDataAvailable() {\n                    return this._onDataAvailable;\n                }\n        \n                set onDataAvailable(callback) {\n                    this._onDataAvailable = callback;\n                }\n        \n                // timestamp base for output samples, must be in milliseconds\n                get timestampBase() {\n                    return this._timestampBase;\n                }\n        \n                set timestampBase(base) {\n                    this._timestampBase = base;\n                }\n        \n                get overridedDuration() {\n                    return this._duration;\n                }\n        \n                // Force-override media duration. Must be in milliseconds, int32\n                set overridedDuration(duration) {\n                    this._durationOverrided = true;\n                    this._duration = duration;\n                    this._mediaInfo.duration = duration;\n                }\n        \n                // Force-override audio track present flag, boolean\n                set overridedHasAudio(hasAudio) {\n                    this._hasAudioFlagOverrided = true;\n                    this._hasAudio = hasAudio;\n                    this._mediaInfo.hasAudio = hasAudio;\n                }\n        \n                // Force-override video track present flag, boolean\n                set overridedHasVideo(hasVideo) {\n                    this._hasVideoFlagOverrided = true;\n                    this._hasVideo = hasVideo;\n                    this._mediaInfo.hasVideo = hasVideo;\n                }\n        \n                resetMediaInfo() {\n                    this._mediaInfo = new MediaInfo();\n                }\n        \n                _isInitialMetadataDispatched() {\n                    if (this._hasAudio && this._hasVideo) {  // both audio & video\n                        return this._audioInitialMetadataDispatched && this._videoInitialMetadataDispatched;\n                    }\n                    if (this._hasAudio && !this._hasVideo) {  // audio only\n                        return this._audioInitialMetadataDispatched;\n                    }\n                    if (!this._hasAudio && this._hasVideo) {  // video only\n                        return this._videoInitialMetadataDispatched;\n                    }\n                    return false;\n                }\n        \n                // function parseChunks(chunk: ArrayBuffer, byteStart: number): number;\n                parseChunks(chunk, byteStart) {\n                    if (!this._onError || !this._onMediaInfo || !this._onTrackMetadata || !this._onDataAvailable) {\n                        throw new IllegalStateException(\'Flv: onError & onMediaInfo & onTrackMetadata & onDataAvailable callback must be specified\');\n                    }\n        \n                    // qli5: fix nonzero byteStart\n                    let offset = byteStart || 0;\n                    let le = this._littleEndian;\n        \n                    if (byteStart === 0) {  // buffer with FLV header\n                        if (chunk.byteLength > 13) {\n                            let probeData = FLVDemuxer.probe(chunk);\n                            offset = probeData.dataOffset;\n                        } else {\n                            return 0;\n                        }\n                    }\n        \n                    if (this._firstParse) {  // handle PreviousTagSize0 before Tag1\n                        this._firstParse = false;\n                        if (offset !== this._dataOffset) {\n                            Log.w(this.TAG, \'First time parsing but chunk byteStart invalid!\');\n                        }\n        \n                        let v = new DataView(chunk, offset);\n                        let prevTagSize0 = v.getUint32(0, !le);\n                        if (prevTagSize0 !== 0) {\n                            Log.w(this.TAG, \'PrevTagSize0 !== 0 !!!\');\n                        }\n                        offset += 4;\n                    }\n        \n                    while (offset < chunk.byteLength) {\n                        this._dispatch = true;\n        \n                        let v = new DataView(chunk, offset);\n        \n                        if (offset + 11 + 4 > chunk.byteLength) {\n                            // data not enough for parsing an flv tag\n                            break;\n                        }\n        \n                        let tagType = v.getUint8(0);\n                        let dataSize = v.getUint32(0, !le) & 0x00FFFFFF;\n        \n                        if (offset + 11 + dataSize + 4 > chunk.byteLength) {\n                            // data not enough for parsing actual data body\n                            break;\n                        }\n        \n                        if (tagType !== 8 && tagType !== 9 && tagType !== 18) {\n                            Log.w(this.TAG, `Unsupported tag type ${tagType}, skipped`);\n                            // consume the whole tag (skip it)\n                            offset += 11 + dataSize + 4;\n                            continue;\n                        }\n        \n                        let ts2 = v.getUint8(4);\n                        let ts1 = v.getUint8(5);\n                        let ts0 = v.getUint8(6);\n                        let ts3 = v.getUint8(7);\n        \n                        let timestamp = ts0 | (ts1 << 8) | (ts2 << 16) | (ts3 << 24);\n        \n                        let streamId = v.getUint32(7, !le) & 0x00FFFFFF;\n                        if (streamId !== 0) {\n                            Log.w(this.TAG, \'Meet tag which has StreamID != 0!\');\n                        }\n        \n                        let dataOffset = offset + 11;\n        \n                        switch (tagType) {\n                            case 8:  // Audio\n                                this._parseAudioData(chunk, dataOffset, dataSize, timestamp);\n                                break;\n                            case 9:  // Video\n                                this._parseVideoData(chunk, dataOffset, dataSize, timestamp, byteStart + offset);\n                                break;\n                            case 18:  // ScriptDataObject\n                                this._parseScriptData(chunk, dataOffset, dataSize);\n                                break;\n                        }\n        \n                        let prevTagSize = v.getUint32(11 + dataSize, !le);\n                        if (prevTagSize !== 11 + dataSize) {\n                            Log.w(this.TAG, `Invalid PrevTagSize ${prevTagSize}`);\n                        }\n        \n                        offset += 11 + dataSize + 4;  // tagBody + dataSize + prevTagSize\n                    }\n        \n                    // dispatch parsed frames to consumer (typically, the remuxer)\n                    if (this._isInitialMetadataDispatched()) {\n                        if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                            this._onDataAvailable(this._audioTrack, this._videoTrack);\n                        }\n                    }\n        \n                    return offset;  // consumed bytes, just equals latest offset index\n                }\n        \n                _parseScriptData(arrayBuffer, dataOffset, dataSize) {\n                    let scriptData = AMF.parseScriptData(arrayBuffer, dataOffset, dataSize);\n        \n                    if (scriptData.hasOwnProperty(\'onMetaData\')) {\n                        if (scriptData.onMetaData == null || typeof scriptData.onMetaData !== \'object\') {\n                            Log.w(this.TAG, \'Invalid onMetaData structure!\');\n                            return;\n                        }\n                        if (this._metadata) {\n                            Log.w(this.TAG, \'Found another onMetaData tag!\');\n                        }\n                        this._metadata = scriptData;\n                        let onMetaData = this._metadata.onMetaData;\n        \n                        if (typeof onMetaData.hasAudio === \'boolean\') {  // hasAudio\n                            if (this._hasAudioFlagOverrided === false) {\n                                this._hasAudio = onMetaData.hasAudio;\n                                this._mediaInfo.hasAudio = this._hasAudio;\n                            }\n                        }\n                        if (typeof onMetaData.hasVideo === \'boolean\') {  // hasVideo\n                            if (this._hasVideoFlagOverrided === false) {\n                                this._hasVideo = onMetaData.hasVideo;\n                                this._mediaInfo.hasVideo = this._hasVideo;\n                            }\n                        }\n                        if (typeof onMetaData.audiodatarate === \'number\') {  // audiodatarate\n                            this._mediaInfo.audioDataRate = onMetaData.audiodatarate;\n                        }\n                        if (typeof onMetaData.videodatarate === \'number\') {  // videodatarate\n                            this._mediaInfo.videoDataRate = onMetaData.videodatarate;\n                        }\n                        if (typeof onMetaData.width === \'number\') {  // width\n                            this._mediaInfo.width = onMetaData.width;\n                        }\n                        if (typeof onMetaData.height === \'number\') {  // height\n                            this._mediaInfo.height = onMetaData.height;\n                        }\n                        if (typeof onMetaData.duration === \'number\') {  // duration\n                            if (!this._durationOverrided) {\n                                let duration = Math.floor(onMetaData.duration * this._timescale);\n                                this._duration = duration;\n                                this._mediaInfo.duration = duration;\n                            }\n                        } else {\n                            this._mediaInfo.duration = 0;\n                        }\n                        if (typeof onMetaData.framerate === \'number\') {  // framerate\n                            let fps_num = Math.floor(onMetaData.framerate * 1000);\n                            if (fps_num > 0) {\n                                let fps = fps_num / 1000;\n                                this._referenceFrameRate.fixed = true;\n                                this._referenceFrameRate.fps = fps;\n                                this._referenceFrameRate.fps_num = fps_num;\n                                this._referenceFrameRate.fps_den = 1000;\n                                this._mediaInfo.fps = fps;\n                            }\n                        }\n                        if (typeof onMetaData.keyframes === \'object\') {  // keyframes\n                            this._mediaInfo.hasKeyframesIndex = true;\n                            let keyframes = onMetaData.keyframes;\n                            this._mediaInfo.keyframesIndex = this._parseKeyframesIndex(keyframes);\n                            onMetaData.keyframes = null;  // keyframes has been extracted, remove it\n                        } else {\n                            this._mediaInfo.hasKeyframesIndex = false;\n                        }\n                        this._dispatch = false;\n                        this._mediaInfo.metadata = onMetaData;\n                        Log.v(this.TAG, \'Parsed onMetaData\');\n                        if (this._mediaInfo.isComplete()) {\n                            this._onMediaInfo(this._mediaInfo);\n                        }\n                    }\n                }\n        \n                _parseKeyframesIndex(keyframes) {\n                    let times = [];\n                    let filepositions = [];\n        \n                    // ignore first keyframe which is actually AVC Sequence Header (AVCDecoderConfigurationRecord)\n                    for (let i = 1; i < keyframes.times.length; i++) {\n                        let time = this._timestampBase + Math.floor(keyframes.times[i] * 1000);\n                        times.push(time);\n                        filepositions.push(keyframes.filepositions[i]);\n                    }\n        \n                    return {\n                        times: times,\n                        filepositions: filepositions\n                    };\n                }\n        \n                _parseAudioData(arrayBuffer, dataOffset, dataSize, tagTimestamp) {\n                    if (dataSize <= 1) {\n                        Log.w(this.TAG, \'Flv: Invalid audio packet, missing SoundData payload!\');\n                        return;\n                    }\n        \n                    if (this._hasAudioFlagOverrided === true && this._hasAudio === false) {\n                        // If hasAudio: false indicated explicitly in MediaDataSource,\n                        // Ignore all the audio packets\n                        return;\n                    }\n        \n                    let le = this._littleEndian;\n                    let v = new DataView(arrayBuffer, dataOffset, dataSize);\n        \n                    let soundSpec = v.getUint8(0);\n        \n                    let soundFormat = soundSpec >>> 4;\n                    if (soundFormat !== 2 && soundFormat !== 10) {  // MP3 or AAC\n                        this._onError(DemuxErrors.CODEC_UNSUPPORTED, \'Flv: Unsupported audio codec idx: \' + soundFormat);\n                        return;\n                    }\n        \n                    let soundRate = 0;\n                    let soundRateIndex = (soundSpec & 12) >>> 2;\n                    if (soundRateIndex >= 0 && soundRateIndex <= 4) {\n                        soundRate = this._flvSoundRateTable[soundRateIndex];\n                    } else {\n                        this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid audio sample rate idx: \' + soundRateIndex);\n                        return;\n                    }\n        \n                    let soundSize = (soundSpec & 2) >>> 1;  // unused\n                    let soundType = (soundSpec & 1);\n        \n        \n                    let meta = this._audioMetadata;\n                    let track = this._audioTrack;\n        \n                    if (!meta) {\n                        if (this._hasAudio === false && this._hasAudioFlagOverrided === false) {\n                            this._hasAudio = true;\n                            this._mediaInfo.hasAudio = true;\n                        }\n        \n                        // initial metadata\n                        meta = this._audioMetadata = {};\n                        meta.type = \'audio\';\n                        meta.id = track.id;\n                        meta.timescale = this._timescale;\n                        meta.duration = this._duration;\n                        meta.audioSampleRate = soundRate;\n                        meta.channelCount = (soundType === 0 ? 1 : 2);\n                    }\n        \n                    if (soundFormat === 10) {  // AAC\n                        let aacData = this._parseAACAudioData(arrayBuffer, dataOffset + 1, dataSize - 1);\n                        if (aacData == undefined) {\n                            return;\n                        }\n        \n                        if (aacData.packetType === 0) {  // AAC sequence header (AudioSpecificConfig)\n                            if (meta.config) {\n                                Log.w(this.TAG, \'Found another AudioSpecificConfig!\');\n                            }\n                            let misc = aacData.data;\n                            meta.audioSampleRate = misc.samplingRate;\n                            meta.channelCount = misc.channelCount;\n                            meta.codec = misc.codec;\n                            meta.originalCodec = misc.originalCodec;\n                            meta.config = misc.config;\n                            // added by qli5\n                            meta.configRaw = misc.configRaw;\n                            // The decode result of an aac sample is 1024 PCM samples\n                            meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale;\n                            Log.v(this.TAG, \'Parsed AudioSpecificConfig\');\n        \n                            if (this._isInitialMetadataDispatched()) {\n                                // Non-initial metadata, force dispatch (or flush) parsed frames to remuxer\n                                if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                                    this._onDataAvailable(this._audioTrack, this._videoTrack);\n                                }\n                            } else {\n                                this._audioInitialMetadataDispatched = true;\n                            }\n                            // then notify new metadata\n                            this._dispatch = false;\n                            this._onTrackMetadata(\'audio\', meta);\n        \n                            let mi = this._mediaInfo;\n                            mi.audioCodec = meta.originalCodec;\n                            mi.audioSampleRate = meta.audioSampleRate;\n                            mi.audioChannelCount = meta.channelCount;\n                            if (mi.hasVideo) {\n                                if (mi.videoCodec != null) {\n                                    mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                                }\n                            } else {\n                                mi.mimeType = \'video/x-flv; codecs="\' + mi.audioCodec + \'"\';\n                            }\n                            if (mi.isComplete()) {\n                                this._onMediaInfo(mi);\n                            }\n                        } else if (aacData.packetType === 1) {  // AAC raw frame data\n                            let dts = this._timestampBase + tagTimestamp;\n                            let aacSample = { unit: aacData.data, length: aacData.data.byteLength, dts: dts, pts: dts };\n                            track.samples.push(aacSample);\n                            track.length += aacData.data.length;\n                        } else {\n                            Log.e(this.TAG, `Flv: Unsupported AAC data type ${aacData.packetType}`);\n                        }\n                    } else if (soundFormat === 2) {  // MP3\n                        if (!meta.codec) {\n                            // We need metadata for mp3 audio track, extract info from frame header\n                            let misc = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, true);\n                            if (misc == undefined) {\n                                return;\n                            }\n                            meta.audioSampleRate = misc.samplingRate;\n                            meta.channelCount = misc.channelCount;\n                            meta.codec = misc.codec;\n                            meta.originalCodec = misc.originalCodec;\n                            // The decode result of an mp3 sample is 1152 PCM samples\n                            meta.refSampleDuration = 1152 / meta.audioSampleRate * meta.timescale;\n                            Log.v(this.TAG, \'Parsed MPEG Audio Frame Header\');\n        \n                            this._audioInitialMetadataDispatched = true;\n                            this._onTrackMetadata(\'audio\', meta);\n        \n                            let mi = this._mediaInfo;\n                            mi.audioCodec = meta.codec;\n                            mi.audioSampleRate = meta.audioSampleRate;\n                            mi.audioChannelCount = meta.channelCount;\n                            mi.audioDataRate = misc.bitRate;\n                            if (mi.hasVideo) {\n                                if (mi.videoCodec != null) {\n                                    mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                                }\n                            } else {\n                                mi.mimeType = \'video/x-flv; codecs="\' + mi.audioCodec + \'"\';\n                            }\n                            if (mi.isComplete()) {\n                                this._onMediaInfo(mi);\n                            }\n                        }\n        \n                        // This packet is always a valid audio packet, extract it\n                        let data = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, false);\n                        if (data == undefined) {\n                            return;\n                        }\n                        let dts = this._timestampBase + tagTimestamp;\n                        let mp3Sample = { unit: data, length: data.byteLength, dts: dts, pts: dts };\n                        track.samples.push(mp3Sample);\n                        track.length += data.length;\n                    }\n                }\n        \n                _parseAACAudioData(arrayBuffer, dataOffset, dataSize) {\n                    if (dataSize <= 1) {\n                        Log.w(this.TAG, \'Flv: Invalid AAC packet, missing AACPacketType or/and Data!\');\n                        return;\n                    }\n        \n                    let result = {};\n                    let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n        \n                    result.packetType = array[0];\n        \n                    if (array[0] === 0) {\n                        result.data = this._parseAACAudioSpecificConfig(arrayBuffer, dataOffset + 1, dataSize - 1);\n                    } else {\n                        result.data = array.subarray(1);\n                    }\n        \n                    return result;\n                }\n        \n                _parseAACAudioSpecificConfig(arrayBuffer, dataOffset, dataSize) {\n                    let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n                    let config = null;\n        \n                    /* Audio Object Type:\n                       0: Null\n                       1: AAC Main\n                       2: AAC LC\n                       3: AAC SSR (Scalable Sample Rate)\n                       4: AAC LTP (Long Term Prediction)\n                       5: HE-AAC / SBR (Spectral Band Replication)\n                       6: AAC Scalable\n                    */\n        \n                    let audioObjectType = 0;\n                    let originalAudioObjectType = 0;\n                    let audioExtensionObjectType = null;\n                    let samplingIndex = 0;\n                    let extensionSamplingIndex = null;\n        \n                    // 5 bits\n                    audioObjectType = originalAudioObjectType = array[0] >>> 3;\n                    // 4 bits\n                    samplingIndex = ((array[0] & 0x07) << 1) | (array[1] >>> 7);\n                    if (samplingIndex < 0 || samplingIndex >= this._mpegSamplingRates.length) {\n                        this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: AAC invalid sampling frequency index!\');\n                        return;\n                    }\n        \n                    let samplingFrequence = this._mpegSamplingRates[samplingIndex];\n        \n                    // 4 bits\n                    let channelConfig = (array[1] & 0x78) >>> 3;\n                    if (channelConfig < 0 || channelConfig >= 8) {\n                        this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: AAC invalid channel configuration\');\n                        return;\n                    }\n        \n                    if (audioObjectType === 5) {  // HE-AAC?\n                        // 4 bits\n                        extensionSamplingIndex = ((array[1] & 0x07) << 1) | (array[2] >>> 7);\n                        // 5 bits\n                        audioExtensionObjectType = (array[2] & 0x7C) >>> 2;\n                    }\n        \n                    // workarounds for various browsers\n                    let userAgent = navigator.userAgent.toLowerCase();\n        \n                    if (userAgent.indexOf(\'firefox\') !== -1) {\n                        // firefox: use SBR (HE-AAC) if freq less than 24kHz\n                        if (samplingIndex >= 6) {\n                            audioObjectType = 5;\n                            config = new Array(4);\n                            extensionSamplingIndex = samplingIndex - 3;\n                        } else {  // use LC-AAC\n                            audioObjectType = 2;\n                            config = new Array(2);\n                            extensionSamplingIndex = samplingIndex;\n                        }\n                    } else if (userAgent.indexOf(\'android\') !== -1) {\n                        // android: always use LC-AAC\n                        audioObjectType = 2;\n                        config = new Array(2);\n                        extensionSamplingIndex = samplingIndex;\n                    } else {\n                        // for other browsers, e.g. chrome...\n                        // Always use HE-AAC to make it easier to switch aac codec profile\n                        audioObjectType = 5;\n                        extensionSamplingIndex = samplingIndex;\n                        config = new Array(4);\n        \n                        if (samplingIndex >= 6) {\n                            extensionSamplingIndex = samplingIndex - 3;\n                        } else if (channelConfig === 1) {  // Mono channel\n                            audioObjectType = 2;\n                            config = new Array(2);\n                            extensionSamplingIndex = samplingIndex;\n                        }\n                    }\n        \n                    config[0] = audioObjectType << 3;\n                    config[0] |= (samplingIndex & 0x0F) >>> 1;\n                    config[1] = (samplingIndex & 0x0F) << 7;\n                    config[1] |= (channelConfig & 0x0F) << 3;\n                    if (audioObjectType === 5) {\n                        config[1] |= ((extensionSamplingIndex & 0x0F) >>> 1);\n                        config[2] = (extensionSamplingIndex & 0x01) << 7;\n                        // extended audio object type: force to 2 (LC-AAC)\n                        config[2] |= (2 << 2);\n                        config[3] = 0;\n                    }\n        \n                    return {\n                        // configRaw: added by qli5\n                        configRaw: array,\n                        config: config,\n                        samplingRate: samplingFrequence,\n                        channelCount: channelConfig,\n                        codec: \'mp4a.40.\' + audioObjectType,\n                        originalCodec: \'mp4a.40.\' + originalAudioObjectType\n                    };\n                }\n        \n                _parseMP3AudioData(arrayBuffer, dataOffset, dataSize, requestHeader) {\n                    if (dataSize < 4) {\n                        Log.w(this.TAG, \'Flv: Invalid MP3 packet, header missing!\');\n                        return;\n                    }\n        \n                    let le = this._littleEndian;\n                    let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);\n                    let result = null;\n        \n                    if (requestHeader) {\n                        if (array[0] !== 0xFF) {\n                            return;\n                        }\n                        let ver = (array[1] >>> 3) & 0x03;\n                        let layer = (array[1] & 0x06) >> 1;\n        \n                        let bitrate_index = (array[2] & 0xF0) >>> 4;\n                        let sampling_freq_index = (array[2] & 0x0C) >>> 2;\n        \n                        let channel_mode = (array[3] >>> 6) & 0x03;\n                        let channel_count = channel_mode !== 3 ? 2 : 1;\n        \n                        let sample_rate = 0;\n                        let bit_rate = 0;\n                        let object_type = 34;  // Layer-3, listed in MPEG-4 Audio Object Types\n        \n                        let codec = \'mp3\';\n        \n                        switch (ver) {\n                            case 0:  // MPEG 2.5\n                                sample_rate = this._mpegAudioV25SampleRateTable[sampling_freq_index];\n                                break;\n                            case 2:  // MPEG 2\n                                sample_rate = this._mpegAudioV20SampleRateTable[sampling_freq_index];\n                                break;\n                            case 3:  // MPEG 1\n                                sample_rate = this._mpegAudioV10SampleRateTable[sampling_freq_index];\n                                break;\n                        }\n        \n                        switch (layer) {\n                            case 1:  // Layer 3\n                                object_type = 34;\n                                if (bitrate_index < this._mpegAudioL3BitRateTable.length) {\n                                    bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];\n                                }\n                                break;\n                            case 2:  // Layer 2\n                                object_type = 33;\n                                if (bitrate_index < this._mpegAudioL2BitRateTable.length) {\n                                    bit_rate = this._mpegAudioL2BitRateTable[bitrate_index];\n                                }\n                                break;\n                            case 3:  // Layer 1\n                                object_type = 32;\n                                if (bitrate_index < this._mpegAudioL1BitRateTable.length) {\n                                    bit_rate = this._mpegAudioL1BitRateTable[bitrate_index];\n                                }\n                                break;\n                        }\n        \n                        result = {\n                            bitRate: bit_rate,\n                            samplingRate: sample_rate,\n                            channelCount: channel_count,\n                            codec: codec,\n                            originalCodec: codec\n                        };\n                    } else {\n                        result = array;\n                    }\n        \n                    return result;\n                }\n        \n                _parseVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition) {\n                    if (dataSize <= 1) {\n                        Log.w(this.TAG, \'Flv: Invalid video packet, missing VideoData payload!\');\n                        return;\n                    }\n        \n                    if (this._hasVideoFlagOverrided === true && this._hasVideo === false) {\n                        // If hasVideo: false indicated explicitly in MediaDataSource,\n                        // Ignore all the video packets\n                        return;\n                    }\n        \n                    let spec = (new Uint8Array(arrayBuffer, dataOffset, dataSize))[0];\n        \n                    let frameType = (spec & 240) >>> 4;\n                    let codecId = spec & 15;\n        \n                    if (codecId !== 7) {\n                        this._onError(DemuxErrors.CODEC_UNSUPPORTED, `Flv: Unsupported codec in video frame: ${codecId}`);\n                        return;\n                    }\n        \n                    this._parseAVCVideoPacket(arrayBuffer, dataOffset + 1, dataSize - 1, tagTimestamp, tagPosition, frameType);\n                }\n        \n                _parseAVCVideoPacket(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType) {\n                    if (dataSize < 4) {\n                        Log.w(this.TAG, \'Flv: Invalid AVC packet, missing AVCPacketType or/and CompositionTime\');\n                        return;\n                    }\n        \n                    let le = this._littleEndian;\n                    let v = new DataView(arrayBuffer, dataOffset, dataSize);\n        \n                    let packetType = v.getUint8(0);\n                    let cts = v.getUint32(0, !le) & 0x00FFFFFF;\n        \n                    if (packetType === 0) {  // AVCDecoderConfigurationRecord\n                        this._parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset + 4, dataSize - 4);\n                    } else if (packetType === 1) {  // One or more Nalus\n                        this._parseAVCVideoData(arrayBuffer, dataOffset + 4, dataSize - 4, tagTimestamp, tagPosition, frameType, cts);\n                    } else if (packetType === 2) {\n                        // empty, AVC end of sequence\n                    } else {\n                        this._onError(DemuxErrors.FORMAT_ERROR, `Flv: Invalid video packet type ${packetType}`);\n                        return;\n                    }\n                }\n        \n                _parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset, dataSize) {\n                    if (dataSize < 7) {\n                        Log.w(this.TAG, \'Flv: Invalid AVCDecoderConfigurationRecord, lack of data!\');\n                        return;\n                    }\n        \n                    let meta = this._videoMetadata;\n                    let track = this._videoTrack;\n                    let le = this._littleEndian;\n                    let v = new DataView(arrayBuffer, dataOffset, dataSize);\n        \n                    if (!meta) {\n                        if (this._hasVideo === false && this._hasVideoFlagOverrided === false) {\n                            this._hasVideo = true;\n                            this._mediaInfo.hasVideo = true;\n                        }\n        \n                        meta = this._videoMetadata = {};\n                        meta.type = \'video\';\n                        meta.id = track.id;\n                        meta.timescale = this._timescale;\n                        meta.duration = this._duration;\n                    } else {\n                        if (typeof meta.avcc !== \'undefined\') {\n                            Log.w(this.TAG, \'Found another AVCDecoderConfigurationRecord!\');\n                        }\n                    }\n        \n                    let version = v.getUint8(0);  // configurationVersion\n                    let avcProfile = v.getUint8(1);  // avcProfileIndication\n                    let profileCompatibility = v.getUint8(2);  // profile_compatibility\n                    let avcLevel = v.getUint8(3);  // AVCLevelIndication\n        \n                    if (version !== 1 || avcProfile === 0) {\n                        this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord\');\n                        return;\n                    }\n        \n                    this._naluLengthSize = (v.getUint8(4) & 3) + 1;  // lengthSizeMinusOne\n                    if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {  // holy shit!!!\n                        this._onError(DemuxErrors.FORMAT_ERROR, `Flv: Strange NaluLengthSizeMinusOne: ${this._naluLengthSize - 1}`);\n                        return;\n                    }\n        \n                    let spsCount = v.getUint8(5) & 31;  // numOfSequenceParameterSets\n                    if (spsCount === 0) {\n                        this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord: No SPS\');\n                        return;\n                    } else if (spsCount > 1) {\n                        Log.w(this.TAG, `Flv: Strange AVCDecoderConfigurationRecord: SPS Count = ${spsCount}`);\n                    }\n        \n                    let offset = 6;\n        \n                    for (let i = 0; i < spsCount; i++) {\n                        let len = v.getUint16(offset, !le);  // sequenceParameterSetLength\n                        offset += 2;\n        \n                        if (len === 0) {\n                            continue;\n                        }\n        \n                        // Notice: Nalu without startcode header (00 00 00 01)\n                        let sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);\n                        offset += len;\n        \n                        let config = SPSParser.parseSPS(sps);\n                        if (i !== 0) {\n                            // ignore other sps\'s config\n                            continue;\n                        }\n        \n                        meta.codecWidth = config.codec_size.width;\n                        meta.codecHeight = config.codec_size.height;\n                        meta.presentWidth = config.present_size.width;\n                        meta.presentHeight = config.present_size.height;\n        \n                        meta.profile = config.profile_string;\n                        meta.level = config.level_string;\n                        meta.bitDepth = config.bit_depth;\n                        meta.chromaFormat = config.chroma_format;\n                        meta.sarRatio = config.sar_ratio;\n                        meta.frameRate = config.frame_rate;\n        \n                        if (config.frame_rate.fixed === false ||\n                            config.frame_rate.fps_num === 0 ||\n                            config.frame_rate.fps_den === 0) {\n                            meta.frameRate = this._referenceFrameRate;\n                        }\n        \n                        let fps_den = meta.frameRate.fps_den;\n                        let fps_num = meta.frameRate.fps_num;\n                        meta.refSampleDuration = meta.timescale * (fps_den / fps_num);\n        \n                        let codecArray = sps.subarray(1, 4);\n                        let codecString = \'avc1.\';\n                        for (let j = 0; j < 3; j++) {\n                            let h = codecArray[j].toString(16);\n                            if (h.length < 2) {\n                                h = \'0\' + h;\n                            }\n                            codecString += h;\n                        }\n                        meta.codec = codecString;\n        \n                        let mi = this._mediaInfo;\n                        mi.width = meta.codecWidth;\n                        mi.height = meta.codecHeight;\n                        mi.fps = meta.frameRate.fps;\n                        mi.profile = meta.profile;\n                        mi.level = meta.level;\n                        mi.chromaFormat = config.chroma_format_string;\n                        mi.sarNum = meta.sarRatio.width;\n                        mi.sarDen = meta.sarRatio.height;\n                        mi.videoCodec = codecString;\n        \n                        if (mi.hasAudio) {\n                            if (mi.audioCodec != null) {\n                                mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \',\' + mi.audioCodec + \'"\';\n                            }\n                        } else {\n                            mi.mimeType = \'video/x-flv; codecs="\' + mi.videoCodec + \'"\';\n                        }\n                        if (mi.isComplete()) {\n                            this._onMediaInfo(mi);\n                        }\n                    }\n        \n                    let ppsCount = v.getUint8(offset);  // numOfPictureParameterSets\n                    if (ppsCount === 0) {\n                        this._onError(DemuxErrors.FORMAT_ERROR, \'Flv: Invalid AVCDecoderConfigurationRecord: No PPS\');\n                        return;\n                    } else if (ppsCount > 1) {\n                        Log.w(this.TAG, `Flv: Strange AVCDecoderConfigurationRecord: PPS Count = ${ppsCount}`);\n                    }\n        \n                    offset++;\n        \n                    for (let i = 0; i < ppsCount; i++) {\n                        let len = v.getUint16(offset, !le);  // pictureParameterSetLength\n                        offset += 2;\n        \n                        if (len === 0) {\n                            continue;\n                        }\n        \n                        // pps is useless for extracting video information\n                        offset += len;\n                    }\n        \n                    meta.avcc = new Uint8Array(dataSize);\n                    meta.avcc.set(new Uint8Array(arrayBuffer, dataOffset, dataSize), 0);\n                    Log.v(this.TAG, \'Parsed AVCDecoderConfigurationRecord\');\n        \n                    if (this._isInitialMetadataDispatched()) {\n                        // flush parsed frames\n                        if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {\n                            this._onDataAvailable(this._audioTrack, this._videoTrack);\n                        }\n                    } else {\n                        this._videoInitialMetadataDispatched = true;\n                    }\n                    // notify new metadata\n                    this._dispatch = false;\n                    this._onTrackMetadata(\'video\', meta);\n                }\n        \n                _parseAVCVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType, cts) {\n                    let le = this._littleEndian;\n                    let v = new DataView(arrayBuffer, dataOffset, dataSize);\n        \n                    let units = [], length = 0;\n        \n                    let offset = 0;\n                    const lengthSize = this._naluLengthSize;\n                    let dts = this._timestampBase + tagTimestamp;\n                    let keyframe = (frameType === 1);  // from FLV Frame Type constants\n                    let refIdc = 1; // added by qli5\n        \n                    while (offset < dataSize) {\n                        if (offset + 4 >= dataSize) {\n                            Log.w(this.TAG, `Malformed Nalu near timestamp ${dts}, offset = ${offset}, dataSize = ${dataSize}`);\n                            break;  // data not enough for next Nalu\n                        }\n                        // Nalu with length-header (AVC1)\n                        let naluSize = v.getUint32(offset, !le);  // Big-Endian read\n                        if (lengthSize === 3) {\n                            naluSize >>>= 8;\n                        }\n                        if (naluSize > dataSize - lengthSize) {\n                            Log.w(this.TAG, `Malformed Nalus near timestamp ${dts}, NaluSize > DataSize!`);\n                            return;\n                        }\n        \n                        let unitType = v.getUint8(offset + lengthSize) & 0x1F;\n                        // added by qli5\n                        refIdc = v.getUint8(offset + lengthSize) & 0x60;\n        \n                        if (unitType === 5) {  // IDR\n                            keyframe = true;\n                        }\n        \n                        let data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);\n                        let unit = { type: unitType, data: data };\n                        units.push(unit);\n                        length += data.byteLength;\n        \n                        offset += lengthSize + naluSize;\n                    }\n        \n                    if (units.length) {\n                        let track = this._videoTrack;\n                        let avcSample = {\n                            units: units,\n                            length: length,\n                            isKeyframe: keyframe,\n                            refIdc: refIdc,\n                            dts: dts,\n                            cts: cts,\n                            pts: (dts + cts)\n                        };\n                        if (keyframe) {\n                            avcSample.fileposition = tagPosition;\n                        }\n                        track.samples.push(avcSample);\n                        track.length += length;\n                    }\n                }\n        \n            }\n        \n            return FLVDemuxer;\n        })();\n        \n        const ASS = class {\n            /**\n             * Extract sections from ass string\n             * @param {string} str \n             * @returns {Object} - object from sections\n             */\n            static extractSections(str) {\n                const regex = /\\[(.*)\\]/g;\n                let match;\n                let matchArr = [];\n                while ((match = regex.exec(str)) !== null) {\n                    matchArr.push({ name: match[1], index: match.index });\n                }\n                let ret = {};\n                matchArr.forEach((match, i) => ret[match.name] = str.slice(match.index, matchArr[i + 1] && matchArr[i + 1].index));\n                return ret;\n            }\n        \n            /**\n             * Extract subtitle lines from section Events\n             * @param {string} str \n             * @returns {Array<Object>} - array of subtitle lines\n             */\n            static extractSubtitleLines(str) {\n                const lines = str.split(\'\\n\');\n                if (lines[0] != \'[Events]\' && lines[0] != \'[events]\') throw new Error(\'ASSDemuxer: section is not [Events]\');\n                if (lines[1].indexOf(\'Format:\') != 0 && lines[1].indexOf(\'format:\') != 0) throw new Error(\'ASSDemuxer: cannot find Format definition in section [Events]\');\n        \n                const format = lines[1].slice(lines[1].indexOf(\':\') + 1).split(\',\').map(e => e.trim());\n                return lines.slice(2).map(e => {\n                    let j = {};\n                    e.replace(/[d|D]ialogue:\\s*/, \'\')\n                        .match(new RegExp(new Array(format.length - 1).fill(\'(.*?),\').join(\'\') + \'(.*)\'))\n                        .slice(1)\n                        .forEach((k, index) => j[format[index]] = k)\n                    return j;\n                });\n            }\n        \n            /**\n             * Create a new ASS Demuxer\n             */\n            constructor() {\n                this.info = \'\';\n                this.styles = \'\';\n                this.events = \'\';\n                this.eventsHeader = \'\';\n                this.pictures = \'\';\n                this.fonts = \'\';\n                this.lines = \'\';\n            }\n        \n            get header() {\n                // return this.info + this.styles + this.eventsHeader;\n                return this.info + this.styles;\n            }\n        \n            /**\n             * Load a file from an arraybuffer of a string\n             * @param {(ArrayBuffer|string)} chunk \n             */\n            parseFile(chunk) {\n                const str = typeof chunk == \'string\' ? chunk : new TextDecoder(\'utf-8\').decode(chunk);\n                for (let [i, j] of Object.entries(ASS.extractSections(str))) {\n                    if (i.match(/Script Info(?:mation)?/i)) this.info = j;\n                    else if (i.match(/V4\\+? Styles?/i)) this.styles = j;\n                    else if (i.match(/Events?/i)) this.events = j;\n                    else if (i.match(/Pictures?/i)) this.pictures = j;\n                    else if (i.match(/Fonts?/i)) this.fonts = j;\n                }\n                this.eventsHeader = this.events.split(\'\\n\', 2).join(\'\\n\') + \'\\n\';\n                this.lines = ASS.extractSubtitleLines(this.events);\n                return this;\n            }\n        };\n        \n        /**\n         * The EMBL builder is from simple-ebml-builder\n         * \n         * Copyright 2017 ryiwamoto\n         * \n         * @author ryiwamoto\n         * \n         * Permission is hereby granted, free of charge, to any person obtaining\n         * a copy of this software and associated documentation files (the\n         * "Software"), to deal in the Software without restriction, including \n         * without limitation the rights to use, copy, modify, merge, publish, \n         * distribute, sublicense, and/or sell copies of the Software, and to \n         * permit persons to whom the Software is furnished to do so, subject \n         * to the following conditions:\n         * \n         * The above copyright notice and this permission notice shall be \n         * included in all copies or substantial portions of the Software.\n         * \n         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS \n         * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, \n         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL \n         * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR \n         * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, \n         * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER \n         * DEALINGS IN THE SOFTWARE.\n         */\n        // const EBML = require(\'./ebml\');\n        const EBML = (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module \'" + o + "\'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++)s(r[o]); return s })({\n            1: [function (require, module, exports) {\n                let EBML = require(\'simple-ebml-builder\');\n                EBML.float = num => new EBML.Value(EBML.float32bit(num));\n                EBML.int16 = num => new EBML.Value(EBML.int16Bit(num));\n                module.exports = EBML;\n        \n            }, { "simple-ebml-builder": 5 }], 2: [function (require, module, exports) {\n                (function (global) {\n                    /**\n                     * lodash (Custom Build) <https://lodash.com/>\n                     * Build: `lodash modularize exports="npm" -o ./`\n                     * Copyright jQuery Foundation and other contributors <https://jquery.org/>\n                     * Released under MIT license <https://lodash.com/license>\n                     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>\n                     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n                     */\n        \n                    /** Used as the `TypeError` message for "Functions" methods. */\n                    var FUNC_ERROR_TEXT = \'Expected a function\';\n        \n                    /** Used to stand-in for `undefined` hash values. */\n                    var HASH_UNDEFINED = \'__lodash_hash_undefined__\';\n        \n                    /** `Object#toString` result references. */\n                    var funcTag = \'[object Function]\',\n                        genTag = \'[object GeneratorFunction]\';\n        \n                    /**\n                     * Used to match `RegExp`\n                     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).\n                     */\n                    var reRegExpChar = /[\\\\^$.*+?()[\\]{}|]/g;\n        \n                    /** Used to detect host constructors (Safari). */\n                    var reIsHostCtor = /^\\[object .+?Constructor\\]$/;\n        \n                    /** Detect free variable `global` from Node.js. */\n                    var freeGlobal = typeof global == \'object\' && global && global.Object === Object && global;\n        \n                    /** Detect free variable `self`. */\n                    var freeSelf = typeof self == \'object\' && self && self.Object === Object && self;\n        \n                    /** Used as a reference to the global object. */\n                    var root = freeGlobal || freeSelf || Function(\'return this\')();\n        \n                    /**\n                     * Gets the value at `key` of `object`.\n                     *\n                     * @private\n                     * @param {Object} [object] The object to query.\n                     * @param {string} key The key of the property to get.\n                     * @returns {*} Returns the property value.\n                     */\n                    function getValue(object, key) {\n                        return object == null ? undefined : object[key];\n                    }\n        \n                    /**\n                     * Checks if `value` is a host object in IE < 9.\n                     *\n                     * @private\n                     * @param {*} value The value to check.\n                     * @returns {boolean} Returns `true` if `value` is a host object, else `false`.\n                     */\n                    function isHostObject(value) {\n                        // Many host objects are `Object` objects that can coerce to strings\n                        // despite having improperly defined `toString` methods.\n                        var result = false;\n                        if (value != null && typeof value.toString != \'function\') {\n                            try {\n                                result = !!(value + \'\');\n                            } catch (e) { }\n                        }\n                        return result;\n                    }\n        \n                    /** Used for built-in method references. */\n                    var arrayProto = Array.prototype,\n                        funcProto = Function.prototype,\n                        objectProto = Object.prototype;\n        \n                    /** Used to detect overreaching core-js shims. */\n                    var coreJsData = root[\'__core-js_shared__\'];\n        \n                    /** Used to detect methods masquerading as native. */\n                    var maskSrcKey = (function () {\n                        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || \'\');\n                        return uid ? (\'Symbol(src)_1.\' + uid) : \'\';\n                    }());\n        \n                    /** Used to resolve the decompiled source of functions. */\n                    var funcToString = funcProto.toString;\n        \n                    /** Used to check objects for own properties. */\n                    var hasOwnProperty = objectProto.hasOwnProperty;\n        \n                    /**\n                     * Used to resolve the\n                     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n                     * of values.\n                     */\n                    var objectToString = objectProto.toString;\n        \n                    /** Used to detect if a method is native. */\n                    var reIsNative = RegExp(\'^\' +\n                        funcToString.call(hasOwnProperty).replace(reRegExpChar, \'\\\\$&\')\n                            .replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, \'$1.*?\') + \'$\'\n                    );\n        \n                    /** Built-in value references. */\n                    var splice = arrayProto.splice;\n        \n                    /* Built-in method references that are verified to be native. */\n                    var Map = getNative(root, \'Map\'),\n                        nativeCreate = getNative(Object, \'create\');\n        \n                    /**\n                     * Creates a hash object.\n                     *\n                     * @private\n                     * @constructor\n                     * @param {Array} [entries] The key-value pairs to cache.\n                     */\n                    function Hash(entries) {\n                        var index = -1,\n                            length = entries ? entries.length : 0;\n        \n                        this.clear();\n                        while (++index < length) {\n                            var entry = entries[index];\n                            this.set(entry[0], entry[1]);\n                        }\n                    }\n        \n                    /**\n                     * Removes all key-value entries from the hash.\n                     *\n                     * @private\n                     * @name clear\n                     * @memberOf Hash\n                     */\n                    function hashClear() {\n                        this.__data__ = nativeCreate ? nativeCreate(null) : {};\n                    }\n        \n                    /**\n                     * Removes `key` and its value from the hash.\n                     *\n                     * @private\n                     * @name delete\n                     * @memberOf Hash\n                     * @param {Object} hash The hash to modify.\n                     * @param {string} key The key of the value to remove.\n                     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n                     */\n                    function hashDelete(key) {\n                        return this.has(key) && delete this.__data__[key];\n                    }\n        \n                    /**\n                     * Gets the hash value for `key`.\n                     *\n                     * @private\n                     * @name get\n                     * @memberOf Hash\n                     * @param {string} key The key of the value to get.\n                     * @returns {*} Returns the entry value.\n                     */\n                    function hashGet(key) {\n                        var data = this.__data__;\n                        if (nativeCreate) {\n                            var result = data[key];\n                            return result === HASH_UNDEFINED ? undefined : result;\n                        }\n                        return hasOwnProperty.call(data, key) ? data[key] : undefined;\n                    }\n        \n                    /**\n                     * Checks if a hash value for `key` exists.\n                     *\n                     * @private\n                     * @name has\n                     * @memberOf Hash\n                     * @param {string} key The key of the entry to check.\n                     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n                     */\n                    function hashHas(key) {\n                        var data = this.__data__;\n                        return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);\n                    }\n        \n                    /**\n                     * Sets the hash `key` to `value`.\n                     *\n                     * @private\n                     * @name set\n                     * @memberOf Hash\n                     * @param {string} key The key of the value to set.\n                     * @param {*} value The value to set.\n                     * @returns {Object} Returns the hash instance.\n                     */\n                    function hashSet(key, value) {\n                        var data = this.__data__;\n                        data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;\n                        return this;\n                    }\n        \n                    // Add methods to `Hash`.\n                    Hash.prototype.clear = hashClear;\n                    Hash.prototype[\'delete\'] = hashDelete;\n                    Hash.prototype.get = hashGet;\n                    Hash.prototype.has = hashHas;\n                    Hash.prototype.set = hashSet;\n        \n                    /**\n                     * Creates an list cache object.\n                     *\n                     * @private\n                     * @constructor\n                     * @param {Array} [entries] The key-value pairs to cache.\n                     */\n                    function ListCache(entries) {\n                        var index = -1,\n                            length = entries ? entries.length : 0;\n        \n                        this.clear();\n                        while (++index < length) {\n                            var entry = entries[index];\n                            this.set(entry[0], entry[1]);\n                        }\n                    }\n        \n                    /**\n                     * Removes all key-value entries from the list cache.\n                     *\n                     * @private\n                     * @name clear\n                     * @memberOf ListCache\n                     */\n                    function listCacheClear() {\n                        this.__data__ = [];\n                    }\n        \n                    /**\n                     * Removes `key` and its value from the list cache.\n                     *\n                     * @private\n                     * @name delete\n                     * @memberOf ListCache\n                     * @param {string} key The key of the value to remove.\n                     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n                     */\n                    function listCacheDelete(key) {\n                        var data = this.__data__,\n                            index = assocIndexOf(data, key);\n        \n                        if (index < 0) {\n                            return false;\n                        }\n                        var lastIndex = data.length - 1;\n                        if (index == lastIndex) {\n                            data.pop();\n                        } else {\n                            splice.call(data, index, 1);\n                        }\n                        return true;\n                    }\n        \n                    /**\n                     * Gets the list cache value for `key`.\n                     *\n                     * @private\n                     * @name get\n                     * @memberOf ListCache\n                     * @param {string} key The key of the value to get.\n                     * @returns {*} Returns the entry value.\n                     */\n                    function listCacheGet(key) {\n                        var data = this.__data__,\n                            index = assocIndexOf(data, key);\n        \n                        return index < 0 ? undefined : data[index][1];\n                    }\n        \n                    /**\n                     * Checks if a list cache value for `key` exists.\n                     *\n                     * @private\n                     * @name has\n                     * @memberOf ListCache\n                     * @param {string} key The key of the entry to check.\n                     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n                     */\n                    function listCacheHas(key) {\n                        return assocIndexOf(this.__data__, key) > -1;\n                    }\n        \n                    /**\n                     * Sets the list cache `key` to `value`.\n                     *\n                     * @private\n                     * @name set\n                     * @memberOf ListCache\n                     * @param {string} key The key of the value to set.\n                     * @param {*} value The value to set.\n                     * @returns {Object} Returns the list cache instance.\n                     */\n                    function listCacheSet(key, value) {\n                        var data = this.__data__,\n                            index = assocIndexOf(data, key);\n        \n                        if (index < 0) {\n                            data.push([key, value]);\n                        } else {\n                            data[index][1] = value;\n                        }\n                        return this;\n                    }\n        \n                    // Add methods to `ListCache`.\n                    ListCache.prototype.clear = listCacheClear;\n                    ListCache.prototype[\'delete\'] = listCacheDelete;\n                    ListCache.prototype.get = listCacheGet;\n                    ListCache.prototype.has = listCacheHas;\n                    ListCache.prototype.set = listCacheSet;\n        \n                    /**\n                     * Creates a map cache object to store key-value pairs.\n                     *\n                     * @private\n                     * @constructor\n                     * @param {Array} [entries] The key-value pairs to cache.\n                     */\n                    function MapCache(entries) {\n                        var index = -1,\n                            length = entries ? entries.length : 0;\n        \n                        this.clear();\n                        while (++index < length) {\n                            var entry = entries[index];\n                            this.set(entry[0], entry[1]);\n                        }\n                    }\n        \n                    /**\n                     * Removes all key-value entries from the map.\n                     *\n                     * @private\n                     * @name clear\n                     * @memberOf MapCache\n                     */\n                    function mapCacheClear() {\n                        this.__data__ = {\n                            \'hash\': new Hash,\n                            \'map\': new (Map || ListCache),\n                            \'string\': new Hash\n                        };\n                    }\n        \n                    /**\n                     * Removes `key` and its value from the map.\n                     *\n                     * @private\n                     * @name delete\n                     * @memberOf MapCache\n                     * @param {string} key The key of the value to remove.\n                     * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n                     */\n                    function mapCacheDelete(key) {\n                        return getMapData(this, key)[\'delete\'](key);\n                    }\n        \n                    /**\n                     * Gets the map value for `key`.\n                     *\n                     * @private\n                     * @name get\n                     * @memberOf MapCache\n                     * @param {string} key The key of the value to get.\n                     * @returns {*} Returns the entry value.\n                     */\n                    function mapCacheGet(key) {\n                        return getMapData(this, key).get(key);\n                    }\n        \n                    /**\n                     * Checks if a map value for `key` exists.\n                     *\n                     * @private\n                     * @name has\n                     * @memberOf MapCache\n                     * @param {string} key The key of the entry to check.\n                     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n                     */\n                    function mapCacheHas(key) {\n                        return getMapData(this, key).has(key);\n                    }\n        \n                    /**\n                     * Sets the map `key` to `value`.\n                     *\n                     * @private\n                     * @name set\n                     * @memberOf MapCache\n                     * @param {string} key The key of the value to set.\n                     * @param {*} value The value to set.\n                     * @returns {Object} Returns the map cache instance.\n                     */\n                    function mapCacheSet(key, value) {\n                        getMapData(this, key).set(key, value);\n                        return this;\n                    }\n        \n                    // Add methods to `MapCache`.\n                    MapCache.prototype.clear = mapCacheClear;\n                    MapCache.prototype[\'delete\'] = mapCacheDelete;\n                    MapCache.prototype.get = mapCacheGet;\n                    MapCache.prototype.has = mapCacheHas;\n                    MapCache.prototype.set = mapCacheSet;\n        \n                    /**\n                     * Gets the index at which the `key` is found in `array` of key-value pairs.\n                     *\n                     * @private\n                     * @param {Array} array The array to inspect.\n                     * @param {*} key The key to search for.\n                     * @returns {number} Returns the index of the matched value, else `-1`.\n                     */\n                    function assocIndexOf(array, key) {\n                        var length = array.length;\n                        while (length--) {\n                            if (eq(array[length][0], key)) {\n                                return length;\n                            }\n                        }\n                        return -1;\n                    }\n        \n                    /**\n                     * The base implementation of `_.isNative` without bad shim checks.\n                     *\n                     * @private\n                     * @param {*} value The value to check.\n                     * @returns {boolean} Returns `true` if `value` is a native function,\n                     *  else `false`.\n                     */\n                    function baseIsNative(value) {\n                        if (!isObject(value) || isMasked(value)) {\n                            return false;\n                        }\n                        var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;\n                        return pattern.test(toSource(value));\n                    }\n        \n                    /**\n                     * Gets the data for `map`.\n                     *\n                     * @private\n                     * @param {Object} map The map to query.\n                     * @param {string} key The reference key.\n                     * @returns {*} Returns the map data.\n                     */\n                    function getMapData(map, key) {\n                        var data = map.__data__;\n                        return isKeyable(key)\n                            ? data[typeof key == \'string\' ? \'string\' : \'hash\']\n                            : data.map;\n                    }\n        \n                    /**\n                     * Gets the native function at `key` of `object`.\n                     *\n                     * @private\n                     * @param {Object} object The object to query.\n                     * @param {string} key The key of the method to get.\n                     * @returns {*} Returns the function if it\'s native, else `undefined`.\n                     */\n                    function getNative(object, key) {\n                        var value = getValue(object, key);\n                        return baseIsNative(value) ? value : undefined;\n                    }\n        \n                    /**\n                     * Checks if `value` is suitable for use as unique object key.\n                     *\n                     * @private\n                     * @param {*} value The value to check.\n                     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.\n                     */\n                    function isKeyable(value) {\n                        var type = typeof value;\n                        return (type == \'string\' || type == \'number\' || type == \'symbol\' || type == \'boolean\')\n                            ? (value !== \'__proto__\')\n                            : (value === null);\n                    }\n        \n                    /**\n                     * Checks if `func` has its source masked.\n                     *\n                     * @private\n                     * @param {Function} func The function to check.\n                     * @returns {boolean} Returns `true` if `func` is masked, else `false`.\n                     */\n                    function isMasked(func) {\n                        return !!maskSrcKey && (maskSrcKey in func);\n                    }\n        \n                    /**\n                     * Converts `func` to its source code.\n                     *\n                     * @private\n                     * @param {Function} func The function to process.\n                     * @returns {string} Returns the source code.\n                     */\n                    function toSource(func) {\n                        if (func != null) {\n                            try {\n                                return funcToString.call(func);\n                            } catch (e) { }\n                            try {\n                                return (func + \'\');\n                            } catch (e) { }\n                        }\n                        return \'\';\n                    }\n        \n                    /**\n                     * Creates a function that memoizes the result of `func`. If `resolver` is\n                     * provided, it determines the cache key for storing the result based on the\n                     * arguments provided to the memoized function. By default, the first argument\n                     * provided to the memoized function is used as the map cache key. The `func`\n                     * is invoked with the `this` binding of the memoized function.\n                     *\n                     * **Note:** The cache is exposed as the `cache` property on the memoized\n                     * function. Its creation may be customized by replacing the `_.memoize.Cache`\n                     * constructor with one whose instances implement the\n                     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)\n                     * method interface of `delete`, `get`, `has`, and `set`.\n                     *\n                     * @static\n                     * @memberOf _\n                     * @since 0.1.0\n                     * @category Function\n                     * @param {Function} func The function to have its output memoized.\n                     * @param {Function} [resolver] The function to resolve the cache key.\n                     * @returns {Function} Returns the new memoized function.\n                     * @example\n                     *\n                     * var object = { \'a\': 1, \'b\': 2 };\n                     * var other = { \'c\': 3, \'d\': 4 };\n                     *\n                     * var values = _.memoize(_.values);\n                     * values(object);\n                     * // => [1, 2]\n                     *\n                     * values(other);\n                     * // => [3, 4]\n                     *\n                     * object.a = 2;\n                     * values(object);\n                     * // => [1, 2]\n                     *\n                     * // Modify the result cache.\n                     * values.cache.set(object, [\'a\', \'b\']);\n                     * values(object);\n                     * // => [\'a\', \'b\']\n                     *\n                     * // Replace `_.memoize.Cache`.\n                     * _.memoize.Cache = WeakMap;\n                     */\n                    function memoize(func, resolver) {\n                        if (typeof func != \'function\' || (resolver && typeof resolver != \'function\')) {\n                            throw new TypeError(FUNC_ERROR_TEXT);\n                        }\n                        var memoized = function () {\n                            var args = arguments,\n                                key = resolver ? resolver.apply(this, args) : args[0],\n                                cache = memoized.cache;\n        \n                            if (cache.has(key)) {\n                                return cache.get(key);\n                            }\n                            var result = func.apply(this, args);\n                            memoized.cache = cache.set(key, result);\n                            return result;\n                        };\n                        memoized.cache = new (memoize.Cache || MapCache);\n                        return memoized;\n                    }\n        \n                    // Assign cache to `_.memoize`.\n                    memoize.Cache = MapCache;\n        \n                    /**\n                     * Performs a\n                     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)\n                     * comparison between two values to determine if they are equivalent.\n                     *\n                     * @static\n                     * @memberOf _\n                     * @since 4.0.0\n                     * @category Lang\n                     * @param {*} value The value to compare.\n                     * @param {*} other The other value to compare.\n                     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\n                     * @example\n                     *\n                     * var object = { \'a\': 1 };\n                     * var other = { \'a\': 1 };\n                     *\n                     * _.eq(object, object);\n                     * // => true\n                     *\n                     * _.eq(object, other);\n                     * // => false\n                     *\n                     * _.eq(\'a\', \'a\');\n                     * // => true\n                     *\n                     * _.eq(\'a\', Object(\'a\'));\n                     * // => false\n                     *\n                     * _.eq(NaN, NaN);\n                     * // => true\n                     */\n                    function eq(value, other) {\n                        return value === other || (value !== value && other !== other);\n                    }\n        \n                    /**\n                     * Checks if `value` is classified as a `Function` object.\n                     *\n                     * @static\n                     * @memberOf _\n                     * @since 0.1.0\n                     * @category Lang\n                     * @param {*} value The value to check.\n                     * @returns {boolean} Returns `true` if `value` is a function, else `false`.\n                     * @example\n                     *\n                     * _.isFunction(_);\n                     * // => true\n                     *\n                     * _.isFunction(/abc/);\n                     * // => false\n                     */\n                    function isFunction(value) {\n                        // The use of `Object#toString` avoids issues with the `typeof` operator\n                        // in Safari 8-9 which returns \'object\' for typed array and other constructors.\n                        var tag = isObject(value) ? objectToString.call(value) : \'\';\n                        return tag == funcTag || tag == genTag;\n                    }\n        \n                    /**\n                     * Checks if `value` is the\n                     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)\n                     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String(\'\')`)\n                     *\n                     * @static\n                     * @memberOf _\n                     * @since 0.1.0\n                     * @category Lang\n                     * @param {*} value The value to check.\n                     * @returns {boolean} Returns `true` if `value` is an object, else `false`.\n                     * @example\n                     *\n                     * _.isObject({});\n                     * // => true\n                     *\n                     * _.isObject([1, 2, 3]);\n                     * // => true\n                     *\n                     * _.isObject(_.noop);\n                     * // => true\n                     *\n                     * _.isObject(null);\n                     * // => false\n                     */\n                    function isObject(value) {\n                        var type = typeof value;\n                        return !!value && (type == \'object\' || type == \'function\');\n                    }\n        \n                    module.exports = memoize;\n        \n                }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})\n            }, {}], 3: [function (require, module, exports) {\n                "use strict";\n                var memoize = require("lodash.memoize");\n                var typedArrayUtils_1 = require("./typedArrayUtils");\n                var Value = (function () {\n                    function Value(bytes) {\n                        this.bytes = bytes;\n                    }\n                    Value.prototype.write = function (buf, pos) {\n                        buf.set(this.bytes, pos);\n                        return pos + this.bytes.length;\n                    };\n                    Value.prototype.countSize = function () {\n                        return this.bytes.length;\n                    };\n                    return Value;\n                }());\n                exports.Value = Value;\n                var Element = (function () {\n                    function Element(id, children, isSizeUnknown) {\n                        this.id = id;\n                        this.children = children;\n                        var bodySize = this.children.reduce(function (p, c) { return p + c.countSize(); }, 0);\n                        this.sizeMetaData = isSizeUnknown ?\n                            exports.UNKNOWN_SIZE :\n                            exports.vintEncode(typedArrayUtils_1.numberToByteArray(bodySize, exports.getEBMLByteLength(bodySize)));\n                        this.size = this.id.length + this.sizeMetaData.length + bodySize;\n                    }\n                    Element.prototype.write = function (buf, pos) {\n                        buf.set(this.id, pos);\n                        buf.set(this.sizeMetaData, pos + this.id.length);\n                        return this.children.reduce(function (p, c) { return c.write(buf, p); }, pos + this.id.length + this.sizeMetaData.length);\n                    };\n                    Element.prototype.countSize = function () {\n                        return this.size;\n                    };\n                    return Element;\n                }());\n                exports.Element = Element;\n                exports.bytes = memoize(function (data) {\n                    return new Value(data);\n                });\n                exports.number = memoize(function (num) {\n                    return exports.bytes(typedArrayUtils_1.numberToByteArray(num));\n                });\n                exports.vintEncodedNumber = memoize(function (num) {\n                    return exports.bytes(exports.vintEncode(typedArrayUtils_1.numberToByteArray(num, exports.getEBMLByteLength(num))));\n                });\n                exports.string = memoize(function (str) {\n                    return exports.bytes(typedArrayUtils_1.stringToByteArray(str));\n                });\n                exports.element = function (id, child) {\n                    return new Element(id, Array.isArray(child) ? child : [child], false);\n                };\n                exports.unknownSizeElement = function (id, child) {\n                    return new Element(id, Array.isArray(child) ? child : [child], true);\n                };\n                exports.build = function (v) {\n                    var b = new Uint8Array(v.countSize());\n                    v.write(b, 0);\n                    return b;\n                };\n                exports.getEBMLByteLength = function (num) {\n                    if (num < 0) {\n                        throw new Error("EBML.getEBMLByteLength: negative number not implemented");\n                    }\n                    else if (num < 0x7f) {\n                        return 1;\n                    }\n                    else if (num < 0x3fff) {\n                        return 2;\n                    }\n                    else if (num < 0x1fffff) {\n                        return 3;\n                    }\n                    else if (num < 0xfffffff) {\n                        return 4;\n                    }\n                    else if (num < 0x7ffffffff) {\n                        return 5;\n                    }\n                    else if (num < 0x3ffffffffff) {\n                        return 6;\n                    }\n                    else if (num < 0x1ffffffffffff) {\n                        return 7;\n                    }\n                    else if (num < 0x20000000000000) {\n                        return 8;\n                    }\n                    else if (num < 0xffffffffffffff) {\n                        throw new Error("EBMLgetEBMLByteLength: number exceeds Number.MAX_SAFE_INTEGER");\n                    }\n                    else {\n                        throw new Error("EBMLgetEBMLByteLength: data size must be less than or equal to " + (Math.pow(2, 56) - 2));\n                    }\n                };\n                exports.UNKNOWN_SIZE = new Uint8Array([0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);\n                exports.vintEncode = function (byteArray) {\n                    byteArray[0] = exports.getSizeMask(byteArray.length) | byteArray[0];\n                    return byteArray;\n                };\n                exports.getSizeMask = function (byteLength) {\n                    return 0x80 >> (byteLength - 1);\n                };\n        \n            }, { "./typedArrayUtils": 6, "lodash.memoize": 2 }], 4: [function (require, module, exports) {\n                "use strict";\n                /**\n                 * @see https://www.matroska.org/technical/specs/index.html\n                 */\n                exports.ID = {\n                    EBML: Uint8Array.of(0x1A, 0x45, 0xDF, 0xA3),\n                    EBMLVersion: Uint8Array.of(0x42, 0x86),\n                    EBMLReadVersion: Uint8Array.of(0x42, 0xF7),\n                    EBMLMaxIDLength: Uint8Array.of(0x42, 0xF2),\n                    EBMLMaxSizeLength: Uint8Array.of(0x42, 0xF3),\n                    DocType: Uint8Array.of(0x42, 0x82),\n                    DocTypeVersion: Uint8Array.of(0x42, 0x87),\n                    DocTypeReadVersion: Uint8Array.of(0x42, 0x85),\n                    Void: Uint8Array.of(0xEC),\n                    CRC32: Uint8Array.of(0xBF),\n                    Segment: Uint8Array.of(0x18, 0x53, 0x80, 0x67),\n                    SeekHead: Uint8Array.of(0x11, 0x4D, 0x9B, 0x74),\n                    Seek: Uint8Array.of(0x4D, 0xBB),\n                    SeekID: Uint8Array.of(0x53, 0xAB),\n                    SeekPosition: Uint8Array.of(0x53, 0xAC),\n                    Info: Uint8Array.of(0x15, 0x49, 0xA9, 0x66),\n                    SegmentUID: Uint8Array.of(0x73, 0xA4),\n                    SegmentFilename: Uint8Array.of(0x73, 0x84),\n                    PrevUID: Uint8Array.of(0x3C, 0xB9, 0x23),\n                    PrevFilename: Uint8Array.of(0x3C, 0x83, 0xAB),\n                    NextUID: Uint8Array.of(0x3E, 0xB9, 0x23),\n                    NextFilename: Uint8Array.of(0x3E, 0x83, 0xBB),\n                    SegmentFamily: Uint8Array.of(0x44, 0x44),\n                    ChapterTranslate: Uint8Array.of(0x69, 0x24),\n                    ChapterTranslateEditionUID: Uint8Array.of(0x69, 0xFC),\n                    ChapterTranslateCodec: Uint8Array.of(0x69, 0xBF),\n                    ChapterTranslateID: Uint8Array.of(0x69, 0xA5),\n                    TimecodeScale: Uint8Array.of(0x2A, 0xD7, 0xB1),\n                    Duration: Uint8Array.of(0x44, 0x89),\n                    DateUTC: Uint8Array.of(0x44, 0x61),\n                    Title: Uint8Array.of(0x7B, 0xA9),\n                    MuxingApp: Uint8Array.of(0x4D, 0x80),\n                    WritingApp: Uint8Array.of(0x57, 0x41),\n                    Cluster: Uint8Array.of(0x1F, 0x43, 0xB6, 0x75),\n                    Timecode: Uint8Array.of(0xE7),\n                    SilentTracks: Uint8Array.of(0x58, 0x54),\n                    SilentTrackNumber: Uint8Array.of(0x58, 0xD7),\n                    Position: Uint8Array.of(0xA7),\n                    PrevSize: Uint8Array.of(0xAB),\n                    SimpleBlock: Uint8Array.of(0xA3),\n                    BlockGroup: Uint8Array.of(0xA0),\n                    Block: Uint8Array.of(0xA1),\n                    BlockAdditions: Uint8Array.of(0x75, 0xA1),\n                    BlockMore: Uint8Array.of(0xA6),\n                    BlockAddID: Uint8Array.of(0xEE),\n                    BlockAdditional: Uint8Array.of(0xA5),\n                    BlockDuration: Uint8Array.of(0x9B),\n                    ReferencePriority: Uint8Array.of(0xFA),\n                    ReferenceBlock: Uint8Array.of(0xFB),\n                    CodecState: Uint8Array.of(0xA4),\n                    DiscardPadding: Uint8Array.of(0x75, 0xA2),\n                    Slices: Uint8Array.of(0x8E),\n                    TimeSlice: Uint8Array.of(0xE8),\n                    LaceNumber: Uint8Array.of(0xCC),\n                    Tracks: Uint8Array.of(0x16, 0x54, 0xAE, 0x6B),\n                    TrackEntry: Uint8Array.of(0xAE),\n                    TrackNumber: Uint8Array.of(0xD7),\n                    TrackUID: Uint8Array.of(0x73, 0xC5),\n                    TrackType: Uint8Array.of(0x83),\n                    FlagEnabled: Uint8Array.of(0xB9),\n                    FlagDefault: Uint8Array.of(0x88),\n                    FlagForced: Uint8Array.of(0x55, 0xAA),\n                    FlagLacing: Uint8Array.of(0x9C),\n                    MinCache: Uint8Array.of(0x6D, 0xE7),\n                    MaxCache: Uint8Array.of(0x6D, 0xF8),\n                    DefaultDuration: Uint8Array.of(0x23, 0xE3, 0x83),\n                    DefaultDecodedFieldDuration: Uint8Array.of(0x23, 0x4E, 0x7A),\n                    MaxBlockAdditionID: Uint8Array.of(0x55, 0xEE),\n                    Name: Uint8Array.of(0x53, 0x6E),\n                    Language: Uint8Array.of(0x22, 0xB5, 0x9C),\n                    CodecID: Uint8Array.of(0x86),\n                    CodecPrivate: Uint8Array.of(0x63, 0xA2),\n                    CodecName: Uint8Array.of(0x25, 0x86, 0x88),\n                    AttachmentLink: Uint8Array.of(0x74, 0x46),\n                    CodecDecodeAll: Uint8Array.of(0xAA),\n                    TrackOverlay: Uint8Array.of(0x6F, 0xAB),\n                    CodecDelay: Uint8Array.of(0x56, 0xAA),\n                    SeekPreRoll: Uint8Array.of(0x56, 0xBB),\n                    TrackTranslate: Uint8Array.of(0x66, 0x24),\n                    TrackTranslateEditionUID: Uint8Array.of(0x66, 0xFC),\n                    TrackTranslateCodec: Uint8Array.of(0x66, 0xBF),\n                    TrackTranslateTrackID: Uint8Array.of(0x66, 0xA5),\n                    Video: Uint8Array.of(0xE0),\n                    FlagInterlaced: Uint8Array.of(0x9A),\n                    FieldOrder: Uint8Array.of(0x9D),\n                    StereoMode: Uint8Array.of(0x53, 0xB8),\n                    AlphaMode: Uint8Array.of(0x53, 0xC0),\n                    PixelWidth: Uint8Array.of(0xB0),\n                    PixelHeight: Uint8Array.of(0xBA),\n                    PixelCropBottom: Uint8Array.of(0x54, 0xAA),\n                    PixelCropTop: Uint8Array.of(0x54, 0xBB),\n                    PixelCropLeft: Uint8Array.of(0x54, 0xCC),\n                    PixelCropRight: Uint8Array.of(0x54, 0xDD),\n                    DisplayWidth: Uint8Array.of(0x54, 0xB0),\n                    DisplayHeight: Uint8Array.of(0x54, 0xBA),\n                    DisplayUnit: Uint8Array.of(0x54, 0xB2),\n                    AspectRatioType: Uint8Array.of(0x54, 0xB3),\n                    ColourSpace: Uint8Array.of(0x2E, 0xB5, 0x24),\n                    Colour: Uint8Array.of(0x55, 0xB0),\n                    MatrixCoefficients: Uint8Array.of(0x55, 0xB1),\n                    BitsPerChannel: Uint8Array.of(0x55, 0xB2),\n                    ChromaSubsamplingHorz: Uint8Array.of(0x55, 0xB3),\n                    ChromaSubsamplingVert: Uint8Array.of(0x55, 0xB4),\n                    CbSubsamplingHorz: Uint8Array.of(0x55, 0xB5),\n                    CbSubsamplingVert: Uint8Array.of(0x55, 0xB6),\n                    ChromaSitingHorz: Uint8Array.of(0x55, 0xB7),\n                    ChromaSitingVert: Uint8Array.of(0x55, 0xB8),\n                    Range: Uint8Array.of(0x55, 0xB9),\n                    TransferCharacteristics: Uint8Array.of(0x55, 0xBA),\n                    Primaries: Uint8Array.of(0x55, 0xBB),\n                    MaxCLL: Uint8Array.of(0x55, 0xBC),\n                    MaxFALL: Uint8Array.of(0x55, 0xBD),\n                    MasteringMetadata: Uint8Array.of(0x55, 0xD0),\n                    PrimaryRChromaticityX: Uint8Array.of(0x55, 0xD1),\n                    PrimaryRChromaticityY: Uint8Array.of(0x55, 0xD2),\n                    PrimaryGChromaticityX: Uint8Array.of(0x55, 0xD3),\n                    PrimaryGChromaticityY: Uint8Array.of(0x55, 0xD4),\n                    PrimaryBChromaticityX: Uint8Array.of(0x55, 0xD5),\n                    PrimaryBChromaticityY: Uint8Array.of(0x55, 0xD6),\n                    WhitePointChromaticityX: Uint8Array.of(0x55, 0xD7),\n                    WhitePointChromaticityY: Uint8Array.of(0x55, 0xD8),\n                    LuminanceMax: Uint8Array.of(0x55, 0xD9),\n                    LuminanceMin: Uint8Array.of(0x55, 0xDA),\n                    Audio: Uint8Array.of(0xE1),\n                    SamplingFrequency: Uint8Array.of(0xB5),\n                    OutputSamplingFrequency: Uint8Array.of(0x78, 0xB5),\n                    Channels: Uint8Array.of(0x9F),\n                    BitDepth: Uint8Array.of(0x62, 0x64),\n                    TrackOperation: Uint8Array.of(0xE2),\n                    TrackCombinePlanes: Uint8Array.of(0xE3),\n                    TrackPlane: Uint8Array.of(0xE4),\n                    TrackPlaneUID: Uint8Array.of(0xE5),\n                    TrackPlaneType: Uint8Array.of(0xE6),\n                    TrackJoinBlocks: Uint8Array.of(0xE9),\n                    TrackJoinUID: Uint8Array.of(0xED),\n                    ContentEncodings: Uint8Array.of(0x6D, 0x80),\n                    ContentEncoding: Uint8Array.of(0x62, 0x40),\n                    ContentEncodingOrder: Uint8Array.of(0x50, 0x31),\n                    ContentEncodingScope: Uint8Array.of(0x50, 0x32),\n                    ContentEncodingType: Uint8Array.of(0x50, 0x33),\n                    ContentCompression: Uint8Array.of(0x50, 0x34),\n                    ContentCompAlgo: Uint8Array.of(0x42, 0x54),\n                    ContentCompSettings: Uint8Array.of(0x42, 0x55),\n                    ContentEncryption: Uint8Array.of(0x50, 0x35),\n                    ContentEncAlgo: Uint8Array.of(0x47, 0xE1),\n                    ContentEncKeyID: Uint8Array.of(0x47, 0xE2),\n                    ContentSignature: Uint8Array.of(0x47, 0xE3),\n                    ContentSigKeyID: Uint8Array.of(0x47, 0xE4),\n                    ContentSigAlgo: Uint8Array.of(0x47, 0xE5),\n                    ContentSigHashAlgo: Uint8Array.of(0x47, 0xE6),\n                    Cues: Uint8Array.of(0x1C, 0x53, 0xBB, 0x6B),\n                    CuePoint: Uint8Array.of(0xBB),\n                    CueTime: Uint8Array.of(0xB3),\n                    CueTrackPositions: Uint8Array.of(0xB7),\n                    CueTrack: Uint8Array.of(0xF7),\n                    CueClusterPosition: Uint8Array.of(0xF1),\n                    CueRelativePosition: Uint8Array.of(0xF0),\n                    CueDuration: Uint8Array.of(0xB2),\n                    CueBlockNumber: Uint8Array.of(0x53, 0x78),\n                    CueCodecState: Uint8Array.of(0xEA),\n                    CueReference: Uint8Array.of(0xDB),\n                    CueRefTime: Uint8Array.of(0x96),\n                    Attachments: Uint8Array.of(0x19, 0x41, 0xA4, 0x69),\n                    AttachedFile: Uint8Array.of(0x61, 0xA7),\n                    FileDescription: Uint8Array.of(0x46, 0x7E),\n                    FileName: Uint8Array.of(0x46, 0x6E),\n                    FileMimeType: Uint8Array.of(0x46, 0x60),\n                    FileData: Uint8Array.of(0x46, 0x5C),\n                    FileUID: Uint8Array.of(0x46, 0xAE),\n                    Chapters: Uint8Array.of(0x10, 0x43, 0xA7, 0x70),\n                    EditionEntry: Uint8Array.of(0x45, 0xB9),\n                    EditionUID: Uint8Array.of(0x45, 0xBC),\n                    EditionFlagHidden: Uint8Array.of(0x45, 0xBD),\n                    EditionFlagDefault: Uint8Array.of(0x45, 0xDB),\n                    EditionFlagOrdered: Uint8Array.of(0x45, 0xDD),\n                    ChapterAtom: Uint8Array.of(0xB6),\n                    ChapterUID: Uint8Array.of(0x73, 0xC4),\n                    ChapterStringUID: Uint8Array.of(0x56, 0x54),\n                    ChapterTimeStart: Uint8Array.of(0x91),\n                    ChapterTimeEnd: Uint8Array.of(0x92),\n                    ChapterFlagHidden: Uint8Array.of(0x98),\n                    ChapterFlagEnabled: Uint8Array.of(0x45, 0x98),\n                    ChapterSegmentUID: Uint8Array.of(0x6E, 0x67),\n                    ChapterSegmentEditionUID: Uint8Array.of(0x6E, 0xBC),\n                    ChapterPhysicalEquiv: Uint8Array.of(0x63, 0xC3),\n                    ChapterTrack: Uint8Array.of(0x8F),\n                    ChapterTrackNumber: Uint8Array.of(0x89),\n                    ChapterDisplay: Uint8Array.of(0x80),\n                    ChapString: Uint8Array.of(0x85),\n                    ChapLanguage: Uint8Array.of(0x43, 0x7C),\n                    ChapCountry: Uint8Array.of(0x43, 0x7E),\n                    ChapProcess: Uint8Array.of(0x69, 0x44),\n                    ChapProcessCodecID: Uint8Array.of(0x69, 0x55),\n                    ChapProcessPrivate: Uint8Array.of(0x45, 0x0D),\n                    ChapProcessCommand: Uint8Array.of(0x69, 0x11),\n                    ChapProcessTime: Uint8Array.of(0x69, 0x22),\n                    ChapProcessData: Uint8Array.of(0x69, 0x33),\n                    Tags: Uint8Array.of(0x12, 0x54, 0xC3, 0x67),\n                    Tag: Uint8Array.of(0x73, 0x73),\n                    Targets: Uint8Array.of(0x63, 0xC0),\n                    TargetTypeValue: Uint8Array.of(0x68, 0xCA),\n                    TargetType: Uint8Array.of(0x63, 0xCA),\n                    TagTrackUID: Uint8Array.of(0x63, 0xC5),\n                    TagEditionUID: Uint8Array.of(0x63, 0xC9),\n                    TagChapterUID: Uint8Array.of(0x63, 0xC4),\n                    TagAttachmentUID: Uint8Array.of(0x63, 0xC6),\n                    SimpleTag: Uint8Array.of(0x67, 0xC8),\n                    TagName: Uint8Array.of(0x45, 0xA3),\n                    TagLanguage: Uint8Array.of(0x44, 0x7A),\n                    TagDefault: Uint8Array.of(0x44, 0x84),\n                    TagString: Uint8Array.of(0x44, 0x87),\n                    TagBinary: Uint8Array.of(0x44, 0x85),\n                };\n        \n            }, {}], 5: [function (require, module, exports) {\n                "use strict";\n                function __export(m) {\n                    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];\n                }\n                __export(require("./ebml"));\n                __export(require("./id"));\n                __export(require("./typedArrayUtils"));\n        \n            }, { "./ebml": 3, "./id": 4, "./typedArrayUtils": 6 }], 6: [function (require, module, exports) {\n                "use strict";\n                var memoize = require("lodash.memoize");\n                exports.numberToByteArray = function (num, byteLength) {\n                    if (byteLength === void 0) byteLength = getNumberByteLength(num);\n                    var byteArray;\n                    if (byteLength == 1) {\n                        byteArray = new DataView(new ArrayBuffer(1));\n                        byteArray.setUint8(0, num);\n                    }\n                    else if (byteLength == 2) {\n                        byteArray = new DataView(new ArrayBuffer(2));\n                        byteArray.setUint16(0, num);\n                    }\n                    else if (byteLength == 3) {\n                        byteArray = new DataView(new ArrayBuffer(3));\n                        byteArray.setUint8(0, num >> 16);\n                        byteArray.setUint16(1, num & 0xffff);\n                    }\n                    else if (byteLength == 4) {\n                        byteArray = new DataView(new ArrayBuffer(4));\n                        byteArray.setUint32(0, num);\n                    }\n                    // 4GB (upper limit for int32) should be enough in most cases\n                    else if (/* byteLength == 5 && */num < 0xffffffff) {\n                        byteArray = new DataView(new ArrayBuffer(5));\n                        byteArray.setUint32(1, num);\n                    }\n                    // Naive emulations of int64 bitwise opreators\n                    else if (byteLength == 5) {\n                        byteArray = new DataView(new ArrayBuffer(5));\n                        byteArray.setUint8(0, num / 0x100000000 | 0);\n                        byteArray.setUint32(1, num % 0x100000000);\n                    }\n                    else if (byteLength == 6) {\n                        byteArray = new DataView(new ArrayBuffer(6));\n                        byteArray.setUint16(0, num / 0x100000000 | 0);\n                        byteArray.setUint32(2, num % 0x100000000);\n                    }\n                    else if (byteLength == 7) {\n                        byteArray = new DataView(new ArrayBuffer(7));\n                        byteArray.setUint8(0, num / 0x1000000000000 | 0);\n                        byteArray.setUint16(1, num / 0x100000000 & 0xffff);\n                        byteArray.setUint32(3, num % 0x100000000);\n                    }\n                    else if (byteLength == 8) {\n                        byteArray = new DataView(new ArrayBuffer(8));\n                        byteArray.setUint32(0, num / 0x100000000 | 0);\n                        byteArray.setUint32(4, num % 0x100000000);\n                    }\n                    else {\n                        throw new Error("EBML.typedArrayUtils.numberToByteArray: byte length must be less than or equal to 8");\n                    }\n                    return new Uint8Array(byteArray.buffer)\n                };\n                exports.stringToByteArray = memoize(function (str) {\n                    return Uint8Array.from(Array.from(str).map(function (_) { return _.codePointAt(0); }));\n                });\n                function getNumberByteLength(num) {\n                    if (num < 0) {\n                        throw new Error("EBML.typedArrayUtils.getNumberByteLength: negative number not implemented");\n                    }\n                    else if (num < 0x100) {\n                        return 1;\n                    }\n                    else if (num < 0x10000) {\n                        return 2;\n                    }\n                    else if (num < 0x1000000) {\n                        return 3;\n                    }\n                    else if (num < 0x100000000) {\n                        return 4;\n                    }\n                    else if (num < 0x10000000000) {\n                        return 5;\n                    }\n                    else if (num < 0x1000000000000) {\n                        return 6;\n                    }\n                    else if (num < 0x20000000000000) {\n                        return 7;\n                    }\n                    else {\n                        throw new Error("EBML.typedArrayUtils.getNumberByteLength: number exceeds Number.MAX_SAFE_INTEGER");\n                    }\n                }\n                exports.getNumberByteLength = getNumberByteLength;\n                exports.int16Bit = memoize(function (num) {\n                    var ab = new ArrayBuffer(2);\n                    new DataView(ab).setInt16(0, num);\n                    return new Uint8Array(ab);\n                });\n                exports.float32bit = memoize(function (num) {\n                    var ab = new ArrayBuffer(4);\n                    new DataView(ab).setFloat32(0, num);\n                    return new Uint8Array(ab);\n                });\n                exports.dumpBytes = function (b) {\n                    return Array.from(new Uint8Array(b)).map(function (_) { return "0x" + _.toString(16); }).join(", ");\n                };\n        \n            }, { "lodash.memoize": 2 }]\n        }, {}, [])(1);\n        \n        const MKV = class {\n            constructor(config) {\n                this.min = true;\n                this.onprogress = null;\n                Object.assign(this, config);\n                this.segmentUID = MKV.randomBytes(16);\n                this.trackUIDBase = Math.trunc(Math.random() * 2 ** 16);\n                this.trackMetadata = { h264: null, aac: null, ass: null };\n                this.duration = 0;\n                this.blocks = { h264: [], aac: [], ass: [] };\n            }\n        \n            static randomBytes(num) {\n                return Array.from(new Array(num), () => Math.trunc(Math.random() * 256));\n            }\n        \n            static textToMS(str) {\n                const [, h, mm, ss, ms10] = str.match(/(\\d+):(\\d+):(\\d+).(\\d+)/);\n                return h * 3600000 + mm * 60000 + ss * 1000 + ms10 * 10;\n            }\n        \n            static mimeToCodecID(str) {\n                switch (str) {\n                    case \'avc1.640029\':\n                        return \'V_MPEG4/ISO/AVC\';\n                    case \'mp4a.40.2\':\n                        return \'A_AAC\';\n                    default:\n                        throw new Error(`MKVRemuxer: unknown codec ${str}`);\n                }\n            }\n        \n            static uint8ArrayConcat(...array) {\n                // if (Array.isArray(array[0])) array = array[0];\n                if (array.length == 1) return array[0];\n                if (typeof Buffer != \'undefined\') return Buffer.concat(array);\n                const ret = new Uint8Array(array.reduce((i, j) => i.byteLength + j.byteLength));\n                let length = 0;\n                for (let e of array) {\n                    ret.set(e, length);\n                    length += e.byteLength;\n                }\n                return ret;\n            }\n        \n            addH264Metadata(h264) {\n                this.trackMetadata.h264 = {\n                    codecId: MKV.mimeToCodecID(h264.codec),\n                    codecPrivate: h264.avcc,\n                    defaultDuration: h264.refSampleDuration * 1000000,\n                    pixelWidth: h264.codecWidth,\n                    pixelHeight: h264.codecHeight,\n                    displayWidth: h264.presentWidth,\n                    displayHeight: h264.presentHeight\n                };\n                this.duration = Math.max(this.duration, h264.duration);\n            }\n        \n            addAACMetadata(aac) {\n                this.trackMetadata.aac = {\n                    codecId: MKV.mimeToCodecID(aac.originalCodec),\n                    codecPrivate: aac.configRaw,\n                    defaultDuration: aac.refSampleDuration * 1000000,\n                    samplingFrequence: aac.audioSampleRate,\n                    channels: aac.channelCount\n                };\n                this.duration = Math.max(this.duration, aac.duration);\n            }\n        \n            addASSMetadata(ass) {\n                this.trackMetadata.ass = {\n                    codecId: \'S_TEXT/ASS\',\n                    codecPrivate: new TextEncoder().encode(ass.header)\n                };\n            }\n        \n            addH264Stream(h264) {\n                this.blocks.h264 = this.blocks.h264.concat(h264.samples.map(e => ({\n                    track: 1,\n                    frame: MKV.uint8ArrayConcat(...e.units.map(i => i.data)),\n                    isKeyframe: e.isKeyframe,\n                    discardable: Boolean(e.refIdc),\n                    timestamp: e.pts,\n                    simple: true,\n                })));\n            }\n        \n            addAACStream(aac) {\n                this.blocks.aac = this.blocks.aac.concat(aac.samples.map(e => ({\n                    track: 2,\n                    frame: e.unit,\n                    timestamp: e.pts,\n                    simple: true,\n                })));\n            }\n        \n            addASSStream(ass) {\n                this.blocks.ass = this.blocks.ass.concat(ass.lines.map((e, i) => ({\n                    track: 3,\n                    frame: new TextEncoder().encode(`${i},${e[\'Layer\'] || \'\'},${e[\'Style\'] || \'\'},${e[\'Name\'] || \'\'},${e[\'MarginL\'] || \'\'},${e[\'MarginR\'] || \'\'},${e[\'MarginV\'] || \'\'},${e[\'Effect\'] || \'\'},${e[\'Text\'] || \'\'}`),\n                    timestamp: MKV.textToMS(e[\'Start\']),\n                    duration: MKV.textToMS(e[\'End\']) - MKV.textToMS(e[\'Start\']),\n                })));\n            }\n        \n            build() {\n                return new Blob([\n                    this.buildHeader(),\n                    this.buildBody()\n                ]);\n            }\n        \n            buildHeader() {\n                return new Blob([EBML.build(EBML.element(EBML.ID.EBML, [\n                    EBML.element(EBML.ID.EBMLVersion, EBML.number(1)),\n                    EBML.element(EBML.ID.EBMLReadVersion, EBML.number(1)),\n                    EBML.element(EBML.ID.EBMLMaxIDLength, EBML.number(4)),\n                    EBML.element(EBML.ID.EBMLMaxSizeLength, EBML.number(8)),\n                    EBML.element(EBML.ID.DocType, EBML.string(\'matroska\')),\n                    EBML.element(EBML.ID.DocTypeVersion, EBML.number(4)),\n                    EBML.element(EBML.ID.DocTypeReadVersion, EBML.number(2)),\n                ]))]);\n            }\n        \n            buildBody() {\n                if (this.min) {\n                    return new Blob([EBML.build(EBML.element(EBML.ID.Segment, [\n                        this.getSegmentInfo(),\n                        this.getTracks(),\n                        ...this.getClusterArray()\n                    ]))]);\n                }\n                else {\n                    return new Blob([EBML.build(EBML.element(EBML.ID.Segment, [\n                        this.getSeekHead(),\n                        this.getVoid(4100),\n                        this.getSegmentInfo(),\n                        this.getTracks(),\n                        this.getVoid(1100),\n                        ...this.getClusterArray()\n                    ]))]);\n                }\n            }\n        \n            getSeekHead() {\n                return EBML.element(EBML.ID.SeekHead, [\n                    EBML.element(EBML.ID.Seek, [\n                        EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Info)),\n                        EBML.element(EBML.ID.SeekPosition, EBML.number(4050))\n                    ]),\n                    EBML.element(EBML.ID.Seek, [\n                        EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Tracks)),\n                        EBML.element(EBML.ID.SeekPosition, EBML.number(4200))\n                    ]),\n                ]);\n            }\n        \n            getVoid(length = 2000) {\n                return EBML.element(EBML.ID.Void, EBML.bytes(new Uint8Array(length)));\n            }\n        \n            getSegmentInfo() {\n                return EBML.element(EBML.ID.Info, [\n                    EBML.element(EBML.ID.TimecodeScale, EBML.number(1000000)),\n                    EBML.element(EBML.ID.MuxingApp, EBML.string(\'flv.js + assparser_qli5 -> simple-ebml-builder\')),\n                    EBML.element(EBML.ID.WritingApp, EBML.string(\'flvass2mkv.js by qli5\')),\n                    EBML.element(EBML.ID.Duration, EBML.float(this.duration)),\n                    EBML.element(EBML.ID.SegmentUID, EBML.bytes(this.segmentUID)),\n                ]);\n            }\n        \n            getTracks() {\n                return EBML.element(EBML.ID.Tracks, [\n                    this.getVideoTrackEntry(),\n                    this.getAudioTrackEntry(),\n                    this.getSubtitleTrackEntry()\n                ]);\n            }\n        \n            getVideoTrackEntry() {\n                return EBML.element(EBML.ID.TrackEntry, [\n                    EBML.element(EBML.ID.TrackNumber, EBML.number(1)),\n                    EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 1)),\n                    EBML.element(EBML.ID.TrackType, EBML.number(0x01)),\n                    EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                    EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.h264.codecId)),\n                    EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.h264.codecPrivate)),\n                    EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.h264.defaultDuration)),\n                    EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n                    EBML.element(EBML.ID.Video, [\n                        EBML.element(EBML.ID.PixelWidth, EBML.number(this.trackMetadata.h264.pixelWidth)),\n                        EBML.element(EBML.ID.PixelHeight, EBML.number(this.trackMetadata.h264.pixelHeight)),\n                        EBML.element(EBML.ID.DisplayWidth, EBML.number(this.trackMetadata.h264.displayWidth)),\n                        EBML.element(EBML.ID.DisplayHeight, EBML.number(this.trackMetadata.h264.displayHeight)),\n                    ]),\n                ]);\n            }\n        \n            getAudioTrackEntry() {\n                return EBML.element(EBML.ID.TrackEntry, [\n                    EBML.element(EBML.ID.TrackNumber, EBML.number(2)),\n                    EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 2)),\n                    EBML.element(EBML.ID.TrackType, EBML.number(0x02)),\n                    EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                    EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.aac.codecId)),\n                    EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.aac.codecPrivate)),\n                    EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.aac.defaultDuration)),\n                    EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n                    EBML.element(EBML.ID.Audio, [\n                        EBML.element(EBML.ID.SamplingFrequency, EBML.float(this.trackMetadata.aac.samplingFrequence)),\n                        EBML.element(EBML.ID.Channels, EBML.number(this.trackMetadata.aac.channels)),\n                    ]),\n                ]);\n            }\n        \n            getSubtitleTrackEntry() {\n                return EBML.element(EBML.ID.TrackEntry, [\n                    EBML.element(EBML.ID.TrackNumber, EBML.number(3)),\n                    EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 3)),\n                    EBML.element(EBML.ID.TrackType, EBML.number(0x11)),\n                    EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),\n                    EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.ass.codecId)),\n                    EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.ass.codecPrivate)),\n                    EBML.element(EBML.ID.Language, EBML.string(\'und\')),\n                ]);\n            }\n        \n            getClusterArray() {\n                // H264 codecState\n                this.blocks.h264[0].simple = false;\n                this.blocks.h264[0].codecState = this.trackMetadata.h264.codecPrivate;\n        \n                let i = 0;\n                let j = 0;\n                let k = 0;\n                let clusterTimeCode = 0;\n                let clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];\n                let ret = [clusterContent];\n                const progressThrottler = Math.pow(2, Math.floor(Math.log(this.blocks.h264.length >> 7) / Math.log(2))) - 1;\n                for (i = 0; i < this.blocks.h264.length; i++) {\n                    const e = this.blocks.h264[i];\n                    for (; j < this.blocks.aac.length; j++) {\n                        if (this.blocks.aac[j].timestamp < e.timestamp) {\n                            clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));\n                        }\n                        else {\n                            break;\n                        }\n                    }\n                    for (; k < this.blocks.ass.length; k++) {\n                        if (this.blocks.ass[k].timestamp < e.timestamp) {\n                            clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));\n                        }\n                        else {\n                            break;\n                        }\n                    }\n                    if (e.isKeyframe/*  || clusterContent.length > 72 */) {\n                        // start new cluster\n                        clusterTimeCode = e.timestamp;\n                        clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];\n                        ret.push(clusterContent);\n                    }\n                    clusterContent.push(this.getBlocks(e, clusterTimeCode));\n                    if (this.onprogress && !(i & progressThrottler)) this.onprogress({ loaded: i, total: this.blocks.h264.length });\n                }\n                for (; j < this.blocks.aac.length; j++) clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));\n                for (; k < this.blocks.ass.length; k++) clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));\n                if (this.onprogress) this.onprogress({ loaded: i, total: this.blocks.h264.length });\n                if (ret[0].length == 1) ret.shift();\n                ret = ret.map(clusterContent => EBML.element(EBML.ID.Cluster, clusterContent));\n        \n                return ret;\n            }\n        \n            getBlocks(e, clusterTimeCode) {\n                if (e.simple) {\n                    return EBML.element(EBML.ID.SimpleBlock, [\n                        EBML.vintEncodedNumber(e.track),\n                        EBML.int16(e.timestamp - clusterTimeCode),\n                        EBML.bytes(e.isKeyframe ? [128] : [0]),\n                        EBML.bytes(e.frame)\n                    ]);\n                }\n                else {\n                    let blockGroupContent = [EBML.element(EBML.ID.Block, [\n                        EBML.vintEncodedNumber(e.track),\n                        EBML.int16(e.timestamp - clusterTimeCode),\n                        EBML.bytes([0]),\n                        EBML.bytes(e.frame)\n                    ])];\n                    if (typeof e.duration != \'undefined\') {\n                        blockGroupContent.push(EBML.element(EBML.ID.BlockDuration, EBML.number(e.duration)));\n                    }\n                    if (typeof e.codecState != \'undefined\') {\n                        blockGroupContent.push(EBML.element(EBML.ID.CodecState, EBML.bytes(e.codecState)));\n                    }\n                    return EBML.element(EBML.ID.BlockGroup, blockGroupContent);\n                }\n            }\n        };\n        \n        const FLVASS2MKV = class {\n            constructor(config = {}) {\n                this.onflvprogress = null;\n                this.onassprogress = null;\n                this.onurlrevokesafe = null;\n                this.onfileload = null;\n                this.onmkvprogress = null;\n                this.onload = null;\n                Object.assign(this, config);\n                this.mkvConfig = { onprogress: this.onmkvprogress };\n                Object.assign(this.mkvConfig, config.mkvConfig);\n            }\n        \n            /**\n             * Demux FLV into H264 + AAC stream and ASS into line stream; then\n             * remux them into a MKV file.\n             * @param {Blob|string|ArrayBuffer} flv \n             * @param {Blob|string|ArrayBuffer} ass \n             */\n            async build(flv = \'./gen_case.flv\', ass = \'./gen_case.ass\') {\n                // load flv and ass as arraybuffer\n                await Promise.all([\n                    new Promise((r, j) => {\n                        if (flv instanceof Blob) {\n                            const e = new FileReader();\n                            e.onprogress = this.onflvprogress;\n                            e.onload = () => r(flv = e.result);\n                            e.onerror = j;\n                            e.readAsArrayBuffer(flv);\n                        }\n                        else if (typeof flv == \'string\') {\n                            const e = new XMLHttpRequest();\n                            e.responseType = \'arraybuffer\';\n                            e.onprogress = this.onflvprogress;\n                            e.onload = () => r(flv = e.response);\n                            e.onerror = j;\n                            e.open(\'get\', flv);\n                            e.send();\n                            flv = 2; // onurlrevokesafe\n                        }\n                        else if (flv instanceof ArrayBuffer) {\n                            r(flv);\n                        }\n                        else {\n                            j(new TypeError(\'flvass2mkv: flv {Blob|string|ArrayBuffer}\'));\n                        }\n                        if (typeof ass != \'string\' && this.onurlrevokesafe) this.onurlrevokesafe();\n                    }),\n                    new Promise((r, j) => {\n                        if (ass instanceof Blob) {\n                            const e = new FileReader();\n                            e.onprogress = this.onflvprogress;\n                            e.onload = () => r(ass = e.result);\n                            e.onerror = j;\n                            e.readAsArrayBuffer(ass);\n                        }\n                        else if (typeof ass == \'string\') {\n                            const e = new XMLHttpRequest();\n                            e.responseType = \'arraybuffer\';\n                            e.onprogress = this.onflvprogress;\n                            e.onload = () => r(ass = e.response);\n                            e.onerror = j;\n                            e.open(\'get\', ass);\n                            e.send();\n                            ass = 2; // onurlrevokesafe\n                        }\n                        else if (ass instanceof ArrayBuffer) {\n                            r(ass);\n                        }\n                        else {\n                            j(new TypeError(\'flvass2mkv: ass {Blob|string|ArrayBuffer}\'));\n                        }\n                        if (typeof flv != \'string\' && this.onurlrevokesafe) this.onurlrevokesafe();\n                    }),\n                ]);\n                if (this.onfileload) this.onfileload();\n        \n                const mkv = new MKV(this.mkvConfig);\n        \n                const assParser = new ASS();\n                ass = assParser.parseFile(ass);\n                mkv.addASSMetadata(ass);\n                mkv.addASSStream(ass);\n        \n                const flvProbeData = FLVDemuxer.probe(flv);\n                const flvDemuxer = new FLVDemuxer(flvProbeData);\n                let mediaInfo = null;\n                let h264 = null;\n                let aac = null;\n                flvDemuxer.onDataAvailable = (...array) => {\n                    array.forEach(e => {\n                        if (e.type == \'video\') h264 = e;\n                        else if (e.type == \'audio\') aac = e;\n                        else throw new Error(`MKVRemuxer: unrecoginzed data type ${e.type}`);\n                    });\n                };\n                flvDemuxer.onMediaInfo = i => mediaInfo = i;\n                flvDemuxer.onTrackMetadata = (i, e) => {\n                    if (i == \'video\') mkv.addH264Metadata(e);\n                    else if (i == \'audio\') mkv.addAACMetadata(e);\n                    else throw new Error(`MKVRemuxer: unrecoginzed metadata type ${i}`);\n                };\n                flvDemuxer.onError = e => { throw new Error(e); };\n                const finalOffset = flvDemuxer.parseChunks(flv, flvProbeData.dataOffset);\n                if (finalOffset != flv.byteLength) throw new Error(\'FLVDemuxer: unexpected EOF\');\n                mkv.addH264Stream(h264);\n                mkv.addAACStream(aac);\n        \n                const ret = mkv.build();\n                if (this.onload) this.onload(ret);\n                return ret;\n            }\n        };\n        \n        // if nodejs then test\n        if (typeof require == \'function\') {\n            (async () => {\n                const fs = require(\'fs\');\n                const assFile = fs.readFileSync(\'gen_case.ass\').buffer;\n                const flvFile = fs.readFileSync(\'large_case.flv\').buffer;\n                fs.writeFileSync(\'out.mkv\', await new FLVASS2MKV({ onmkvprogress: console.log.bind(console) }).build(flvFile, assFile));\n            })();\n        }\n        </script>\n        <script>\n        const fileProgress = document.getElementById(\'fileProgress\');\n        const mkvProgress = document.getElementById(\'mkvProgress\');\n        const a = document.getElementById(\'a\');\n\n        top.exec = async option => {\n            const defaultOption = {\n                onflvprogress: ({ loaded, total }) => {\n                    fileProgress.value = loaded;\n                    fileProgress.max = total;\n                },\n                onfileload: () => {\n                    console.timeEnd(\'file\');\n                    console.time(\'flvass2mkv\');\n                },\n                onmkvprogress: ({ loaded, total }) => {\n                    mkvProgress.value = loaded;\n                    mkvProgress.max = total;\n                },\n                name: \'merged.mkv\',\n            };\n            option = Object.assign(defaultOption, option);\n            a.download = a.textContent = option.name;\n            console.time(\'file\');\n            const mkv = await new FLVASS2MKV(option).build(option.flv, option.ass);\n            console.timeEnd(\'flvass2mkv\');\n            a.href = URL.createObjectURL(mkv);\n        }\n        </script>\n        ');

                // 3. Invoke exec
                if (!(this.option instanceof Object)) this.option = null;
                this.playerWin.exec(Object.assign({}, this.option, { flv: flv, ass: ass, name: name }));
                URL.revokeObjectURL(flv);
                URL.revokeObjectURL(ass);

                // 4. Free parent window
                // if (top.confirm('MKV打包中……要关掉这个窗口，释放内存吗？')) 
                top.location = 'about:blank';
            }
        }]);

        return MKVTransmuxer;
    }();

    var BiliMonkey = function () {
        function BiliMonkey(playerWin) {
            var _this13 = this;

            var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { cache: null, partial: false, proxy: false, blocker: false };

            _classCallCheck(this, BiliMonkey);

            this.playerWin = playerWin;
            this.protocol = playerWin.location.protocol;
            this.cid = null;
            this.flvs = null;
            this.mp4 = null;
            this.ass = null;
            this.flvFormatName = null;
            this.mp4FormatName = null;
            this.cidAsyncContainer = new AsyncContainer();
            this.cidAsyncContainer.then(function (cid) {
                _this13.cid = cid; _this13.ass = _this13.getASS();
            });
            if (typeof top.cid === 'string') this.cidAsyncContainer.resolve(top.cid);

            /* cache + proxy = Service Worker
             * Hope bilibili will have a SW as soon as possible.
             * partial = Stream
             * Hope the fetch API will be stabilized as soon as possible.
             * If you are using your grandpa's browser, do not enable these functions.
            **/
            this.cache = option.cache;
            this.partial = option.partial;
            this.proxy = option.proxy;
            this.blocker = option.blocker;
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
        }

        _createClass(BiliMonkey, [{
            key: 'lockFormat',
            value: function lockFormat(format) {
                // null => uninitialized
                // async pending => another one is working on it
                // async resolve => that guy just finished work
                // sync value => someone already finished work
                var h = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
                if (h) h.style.visibility = 'hidden';
                switch (format) {
                    // Single writer is not a must.
                    // Plus, if one writer fail, others should be able to overwrite its garbage.
                    case 'flv':
                    case 'hdflv2':
                    case 'flv720':
                    case 'flv480':
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

                var h = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
                if (h) {
                    h.style.visibility = '';
                    if (h.children.length) h.children[0].style.visibility = 'hidden';
                    var i = function i(e) {
                        if (h.children.length) h.children[0].style.visibility = 'hidden';
                        e.target.removeEventListener(e.type, i);
                    };
                    var j = this.playerWin.document.getElementsByTagName('video')[0];
                    if (j) j.addEventListener('emptied', i);
                }
                if (shouldBe && shouldBe != res.format) {
                    switch (shouldBe) {
                        case 'flv': case 'hdflv2': case 'flv720': case 'flv480':
                            this.flvs = null; break;
                        case 'hdmp4': case 'mp4':
                            this.mp4 = null; break;
                    }
                    throw 'URL interface error: response is not ' + shouldBe;
                }
                switch (res.format) {
                    case 'flv':
                    case 'hdflv2':
                    case 'flv720':
                    case 'flv480':
                        return this.flvs = this.flvs.resolve(res.durl.map(function (e) {
                            return e.url.replace('http:', _this14.protocol);
                        }));
                    case 'hdmp4':
                    case 'mp4':
                        return this.mp4 = this.mp4.resolve(res.durl[0].url.replace('http:', this.protocol));
                    default:
                        throw 'resolveFormat error: ' + res.format + ' is a unrecognizable format';
                }
            }
        }, {
            key: 'getAvailableFormatName',
            value: function getAvailableFormatName(accept_quality) {
                if (!(accept_quality instanceof Array)) accept_quality = Array.from(this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul').getElementsByTagName('li')).map(function (e) {
                    return e.getAttribute('data-value');
                });
                this.flvFormatName = accept_quality.includes('80') ? 'flv' : accept_quality.includes('64') ? 'flv720' : 'flv480';
                this.mp4FormatName = 'mp4';
            }
        }, {
            key: 'execOptions',
            value: function () {
                var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
                    return regeneratorRuntime.wrap(function _callee18$(_context19) {
                        while (1) {
                            switch (_context19.prev = _context19.next) {
                                case 0:
                                    if (!this.cache) {
                                        _context19.next = 3;
                                        break;
                                    }

                                    _context19.next = 3;
                                    return this.cache.getDB();

                                case 3:
                                    if (!this.option.autoDefault) {
                                        _context19.next = 6;
                                        break;
                                    }

                                    _context19.next = 6;
                                    return this.sniffDefaultFormat();

                                case 6:
                                    if (this.option.autoFLV) this.queryInfo('flv');
                                    if (this.option.autoMP4) this.queryInfo('mp4');

                                case 8:
                                case 'end':
                                    return _context19.stop();
                            }
                        }
                    }, _callee18, this);
                }));

                function execOptions() {
                    return _ref22.apply(this, arguments);
                }

                return execOptions;
            }()
        }, {
            key: 'sniffDefaultFormat',
            value: function () {
                var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
                    var _this15 = this;

                    var jq, _ajax;

                    return regeneratorRuntime.wrap(function _callee19$(_context20) {
                        while (1) {
                            switch (_context20.prev = _context20.next) {
                                case 0:
                                    if (!this.defaultFormatPromise) {
                                        _context20.next = 2;
                                        break;
                                    }

                                    return _context20.abrupt('return', this.defaultFormatPromise);

                                case 2:
                                    if (!this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
                                        _context20.next = 4;
                                        break;
                                    }

                                    return _context20.abrupt('return', this.defaultFormatPromise = Promise.resolve());

                                case 4:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;


                                    this.defaultFormatPromise = new Promise(function (resolve) {
                                        var timeout = setTimeout(function () {
                                            jq.ajax = _ajax; resolve();
                                        }, 5000);
                                        var self = _this15;
                                        jq.ajax = function (a, c) {
                                            if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                            };
                                            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                                clearTimeout(timeout);
                                                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                                                var _success = a.success;
                                                a.success = function (res) {
                                                    var format = res.format;
                                                    var accept_format = res.accept_format.split(',');
                                                    switch (format) {
                                                        case 'flv480':
                                                            if (accept_format.includes('flv720')) break;
                                                        case 'flv720':
                                                            if (accept_format.includes('flv')) break;
                                                        case 'flv':
                                                        case 'hdflv2':
                                                            self.lockFormat(format);
                                                            self.resolveFormat(res, format);
                                                            break;

                                                        case 'mp4':
                                                            if (accept_format.includes('hdmp4')) break;
                                                        case 'hdmp4':
                                                            self.lockFormat(format);
                                                            self.resolveFormat(res, format);
                                                            break;
                                                    }
                                                    _success(res);
                                                    resolve(res);
                                                };
                                                jq.ajax = _ajax;
                                            }
                                            return _ajax.call(jq, a, c);
                                        };
                                    });
                                    return _context20.abrupt('return', this.defaultFormatPromise);

                                case 8:
                                case 'end':
                                    return _context20.stop();
                            }
                        }
                    }, _callee19, this);
                }));

                function sniffDefaultFormat() {
                    return _ref23.apply(this, arguments);
                }

                return sniffDefaultFormat;
            }()
        }, {
            key: 'getBackgroundFormat',
            value: function () {
                var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(format) {
                    var src, _pendingFormat, jq, _ajax, pendingFormat, self;

                    return regeneratorRuntime.wrap(function _callee20$(_context21) {
                        while (1) {
                            switch (_context21.prev = _context21.next) {
                                case 0:
                                    if (!(format == 'hdmp4' || format == 'mp4')) {
                                        _context21.next = 6;
                                        break;
                                    }

                                    src = this.playerWin.document.getElementsByTagName('video')[0].src;

                                    if (!((src.includes('hd') || format == 'mp4') && src.includes('.mp4'))) {
                                        _context21.next = 6;
                                        break;
                                    }

                                    _pendingFormat = this.lockFormat(format);

                                    this.resolveFormat({ durl: [{ url: src }] }, format);
                                    return _context21.abrupt('return', _pendingFormat);

                                case 6:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    pendingFormat = this.lockFormat(format);
                                    self = this;

                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                        };
                                        if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
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

                                    return _context21.abrupt('return', pendingFormat);

                                case 13:
                                case 'end':
                                    return _context21.stop();
                            }
                        }
                    }, _callee20, this);
                }));

                function getBackgroundFormat(_x28) {
                    return _ref24.apply(this, arguments);
                }

                return getBackgroundFormat;
            }()
        }, {
            key: 'getCurrentFormat',
            value: function () {
                var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(format) {
                    var _this16 = this;

                    var jq, _ajax, _setItem, siblingFormat, fakedRes, pendingFormat, self, blockedRequest, siblingOK;

                    return regeneratorRuntime.wrap(function _callee21$(_context22) {
                        while (1) {
                            switch (_context22.prev = _context22.next) {
                                case 0:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    _setItem = this.playerWin.localStorage.setItem;
                                    siblingFormat = format == this.flvFormatName ? this.mp4FormatName : this.flvFormatName;
                                    fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': 'https://static.hdslb.com/encoding.mp4', 'backup_url': ['https://static.hdslb.com/encoding.mp4'] }] };
                                    pendingFormat = this.lockFormat(format);
                                    self = this;
                                    _context22.next = 9;
                                    return new Promise(function (resolve) {
                                        jq.ajax = function (a, c) {
                                            if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                            };
                                            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                                // Send back a fake response to enable the change-format button.
                                                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                                                a.success(fakedRes);
                                                self.playerWin.document.getElementsByTagName('video')[1].loop = true;
                                                var h = function h(e) {
                                                    resolve([a, c]); e.target.removeEventListener(e.type, h);
                                                };
                                                self.playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
                                            } else {
                                                return _ajax.call(jq, a, c);
                                            }
                                        };
                                        _this16.playerWin.localStorage.setItem = function () {
                                            return _this16.playerWin.localStorage.setItem = _setItem;
                                        };
                                        _this16.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="' + BiliMonkey.formatToValue(siblingFormat) + '"]').click();
                                    });

                                case 9:
                                    blockedRequest = _context22.sent;
                                    siblingOK = siblingFormat == this.flvFormatName ? this.flvs : this.mp4;

                                    if (!siblingOK) {
                                        this.lockFormat(siblingFormat);
                                        blockedRequest[0].success = function (res) {
                                            return _this16.resolveFormat(res, siblingFormat);
                                        };
                                        _ajax.call.apply(_ajax, [jq].concat(_toConsumableArray(blockedRequest)));
                                    }

                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                        };
                                        if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                            var _success = a.success;
                                            a.success = function (res) {
                                                if (self.proxy && res.format == 'flv') {
                                                    self.resolveFormat(res, format);
                                                    self.setupProxy(res, _success);
                                                } else {
                                                    _success(res);
                                                    self.resolveFormat(res, format);
                                                }
                                            };
                                            jq.ajax = _ajax;
                                        }
                                        return _ajax.call(jq, a, c);
                                    };
                                    this.playerWin.localStorage.setItem = function () {
                                        return _this16.playerWin.localStorage.setItem = _setItem;
                                    };
                                    this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="' + BiliMonkey.formatToValue(format) + '"]').click();

                                    return _context22.abrupt('return', pendingFormat);

                                case 16:
                                case 'end':
                                    return _context22.stop();
                            }
                        }
                    }, _callee21, this);
                }));

                function getCurrentFormat(_x29) {
                    return _ref25.apply(this, arguments);
                }

                return getCurrentFormat;
            }()
        }, {
            key: 'getNonCurrentFormat',
            value: function () {
                var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(format) {
                    var _this17 = this;

                    var jq, _ajax, _setItem, pendingFormat, self;

                    return regeneratorRuntime.wrap(function _callee22$(_context23) {
                        while (1) {
                            switch (_context23.prev = _context23.next) {
                                case 0:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    _setItem = this.playerWin.localStorage.setItem;
                                    pendingFormat = this.lockFormat(format);
                                    self = this;

                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                        };
                                        if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
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
                                        return _this17.playerWin.localStorage.setItem = _setItem;
                                    };
                                    this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="' + BiliMonkey.formatToValue(format) + '"]').click();
                                    return _context23.abrupt('return', pendingFormat);

                                case 9:
                                case 'end':
                                    return _context23.stop();
                            }
                        }
                    }, _callee22, this);
                }));

                function getNonCurrentFormat(_x30) {
                    return _ref26.apply(this, arguments);
                }

                return getNonCurrentFormat;
            }()
        }, {
            key: 'getASS',
            value: function () {
                var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(clickableFormat) {
                    var _this18 = this;

                    return regeneratorRuntime.wrap(function _callee24$(_context25) {
                        while (1) {
                            switch (_context25.prev = _context25.next) {
                                case 0:
                                    if (!this.ass) {
                                        _context25.next = 2;
                                        break;
                                    }

                                    return _context25.abrupt('return', this.ass);

                                case 2:
                                    this.ass = new Promise(function () {
                                        var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(resolve) {
                                            var _ref29, fetchDanmaku, generateASS, setPosition;

                                            return regeneratorRuntime.wrap(function _callee23$(_context24) {
                                                while (1) {
                                                    switch (_context24.prev = _context24.next) {
                                                        case 0:
                                                            if (_this18.cid) {
                                                                _context24.next = 4;
                                                                break;
                                                            }

                                                            _context24.next = 3;
                                                            return new Promise(function (resolve) {
                                                                if (!clickableFormat) reject('get ASS Error: cid unavailable, nor clickable format given.');
                                                                var jq = _this18.playerWin.jQuery;
                                                                var _ajax = jq.ajax;
                                                                var _setItem = _this18.playerWin.localStorage.setItem;

                                                                _this18.lockFormat(clickableFormat);
                                                                var self = _this18;
                                                                jq.ajax = function (a, c) {
                                                                    if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                                        if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                                                    };
                                                                    if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                                                        resolve(self.cid = a.url.match(/cid=\d+/)[0].slice(4));
                                                                        var _success = a.success;
                                                                        _success({});
                                                                        a.success = function (res) {
                                                                            return self.resolveFormat(res, clickableFormat);
                                                                        };
                                                                        jq.ajax = _ajax;
                                                                    }
                                                                    return _ajax.call(jq, a, c);
                                                                };
                                                                _this18.playerWin.localStorage.setItem = function () {
                                                                    return _this18.playerWin.localStorage.setItem = _setItem;
                                                                };
                                                                _this18.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="' + BiliMonkey.formatToValue(clickableFormat) + '"]').click();
                                                            });

                                                        case 3:
                                                            _this18.cid = _context24.sent;

                                                        case 4:
                                                            _ref29 = new ASSDownloader(), fetchDanmaku = _ref29.fetchDanmaku, generateASS = _ref29.generateASS, setPosition = _ref29.setPosition;


                                                            fetchDanmaku(_this18.cid, function (danmaku) {
                                                                if (_this18.blocker) {
                                                                    if (_this18.playerWin.localStorage.bilibili_player_settings) {
                                                                        var regexps = JSON.parse(_this18.playerWin.localStorage.bilibili_player_settings).block.list.map(function (e) {
                                                                            return e.v;
                                                                        }).join('|');
                                                                        if (regexps) {
                                                                            regexps = new RegExp(regexps);
                                                                            danmaku = danmaku.filter(function (d) {
                                                                                return !regexps.test(d.text);
                                                                            });
                                                                        }
                                                                    }
                                                                }
                                                                var ass = generateASS(setPosition(danmaku), {
                                                                    'title': document.title,
                                                                    'ori': location.href
                                                                });
                                                                // I would assume most users are using Windows
                                                                var blob = new Blob(['\uFEFF' + ass], { type: 'application/octet-stream' });
                                                                resolve(_this18.ass = top.URL.createObjectURL(blob));
                                                            });

                                                        case 6:
                                                        case 'end':
                                                            return _context24.stop();
                                                    }
                                                }
                                            }, _callee23, _this18);
                                        }));

                                        return function (_x32) {
                                            return _ref28.apply(this, arguments);
                                        };
                                    }());
                                    return _context25.abrupt('return', this.ass);

                                case 4:
                                case 'end':
                                    return _context25.stop();
                            }
                        }
                    }, _callee24, this);
                }));

                function getASS(_x31) {
                    return _ref27.apply(this, arguments);
                }

                return getASS;
            }()
        }, {
            key: 'queryInfo',
            value: function () {
                var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(format) {
                    var _this19 = this;

                    return regeneratorRuntime.wrap(function _callee26$(_context27) {
                        while (1) {
                            switch (_context27.prev = _context27.next) {
                                case 0:
                                    return _context27.abrupt('return', this.queryInfoMutex.lockAndAwait(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
                                        return regeneratorRuntime.wrap(function _callee25$(_context26) {
                                            while (1) {
                                                switch (_context26.prev = _context26.next) {
                                                    case 0:
                                                        _context26.t0 = format;
                                                        _context26.next = _context26.t0 === 'flv' ? 3 : _context26.t0 === 'mp4' ? 12 : _context26.t0 === 'ass' ? 21 : 30;
                                                        break;

                                                    case 3:
                                                        if (!_this19.flvs) {
                                                            _context26.next = 7;
                                                            break;
                                                        }

                                                        return _context26.abrupt('return', _this19.flvs);

                                                    case 7:
                                                        if (!(_this19.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(_this19.flvFormatName))) {
                                                            _context26.next = 11;
                                                            break;
                                                        }

                                                        return _context26.abrupt('return', _this19.getCurrentFormat(_this19.flvFormatName));

                                                    case 11:
                                                        return _context26.abrupt('return', _this19.getNonCurrentFormat(_this19.flvFormatName));

                                                    case 12:
                                                        if (!_this19.mp4) {
                                                            _context26.next = 16;
                                                            break;
                                                        }

                                                        return _context26.abrupt('return', _this19.mp4);

                                                    case 16:
                                                        if (!(_this19.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(_this19.mp4FormatName))) {
                                                            _context26.next = 20;
                                                            break;
                                                        }

                                                        return _context26.abrupt('return', _this19.getCurrentFormat(_this19.mp4FormatName));

                                                    case 20:
                                                        return _context26.abrupt('return', _this19.getNonCurrentFormat(_this19.mp4FormatName));

                                                    case 21:
                                                        if (!_this19.ass) {
                                                            _context26.next = 25;
                                                            break;
                                                        }

                                                        return _context26.abrupt('return', _this19.ass);

                                                    case 25:
                                                        if (!(_this19.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(_this19.flvFormatName))) {
                                                            _context26.next = 29;
                                                            break;
                                                        }

                                                        return _context26.abrupt('return', _this19.getASS(_this19.mp4FormatName));

                                                    case 29:
                                                        return _context26.abrupt('return', _this19.getASS(_this19.flvFormatName));

                                                    case 30:
                                                        throw 'Bilimonkey: What is format ' + format + '?';

                                                    case 31:
                                                    case 'end':
                                                        return _context26.stop();
                                                }
                                            }
                                        }, _callee25, _this19);
                                    }))));

                                case 1:
                                case 'end':
                                    return _context27.stop();
                            }
                        }
                    }, _callee26, this);
                }));

                function queryInfo(_x33) {
                    return _ref30.apply(this, arguments);
                }

                return queryInfo;
            }()
        }, {
            key: 'getPlayerButtons',
            value: function () {
                var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
                    var _this20 = this;

                    return regeneratorRuntime.wrap(function _callee27$(_context28) {
                        while (1) {
                            switch (_context28.prev = _context28.next) {
                                case 0:
                                    if (!this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
                                        _context28.next = 4;
                                        break;
                                    }

                                    return _context28.abrupt('return', this.playerWin);

                                case 4:
                                    return _context28.abrupt('return', new Promise(function (resolve) {
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
                                    return _context28.stop();
                            }
                        }
                    }, _callee27, this);
                }));

                function getPlayerButtons() {
                    return _ref32.apply(this, arguments);
                }

                return getPlayerButtons;
            }()
        }, {
            key: 'hangPlayer',
            value: function () {
                var _ref33 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
                    var _this21 = this;

                    var fakedRes, jq, _ajax, _setItem;

                    return regeneratorRuntime.wrap(function _callee29$(_context30) {
                        while (1) {
                            switch (_context30.prev = _context30.next) {
                                case 0:
                                    fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': '' }] };
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    _setItem = this.playerWin.localStorage.setItem;
                                    return _context30.abrupt('return', this.queryInfoMutex.lockAndAwait(function () {
                                        return new Promise(function () {
                                            var _ref34 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(resolve) {
                                                var blockerTimeout, button;
                                                return regeneratorRuntime.wrap(function _callee28$(_context29) {
                                                    while (1) {
                                                        switch (_context29.prev = _context29.next) {
                                                            case 0:
                                                                blockerTimeout = void 0;

                                                                jq.ajax = function (a, c) {
                                                                    if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                                        if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                                                    };
                                                                    if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
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
                                                                    return !e.getAttribute('data-selected') && !e.children.length;
                                                                });

                                                                button.click();

                                                            case 5:
                                                            case 'end':
                                                                return _context29.stop();
                                                        }
                                                    }
                                                }, _callee28, _this21);
                                            }));

                                            return function (_x34) {
                                                return _ref34.apply(this, arguments);
                                            };
                                        }());
                                    }));

                                case 5:
                                case 'end':
                                    return _context30.stop();
                            }
                        }
                    }, _callee29, this);
                }));

                function hangPlayer() {
                    return _ref33.apply(this, arguments);
                }

                return hangPlayer;
            }()
        }, {
            key: 'loadFLVFromCache',
            value: function () {
                var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(index) {
                    var name, item;
                    return regeneratorRuntime.wrap(function _callee30$(_context31) {
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
                                    name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
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
                    }, _callee30, this);
                }));

                function loadFLVFromCache(_x35) {
                    return _ref35.apply(this, arguments);
                }

                return loadFLVFromCache;
            }()
        }, {
            key: 'loadPartialFLVFromCache',
            value: function () {
                var _ref36 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(index) {
                    var name, item;
                    return regeneratorRuntime.wrap(function _callee31$(_context32) {
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
                                    name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];

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
                    }, _callee31, this);
                }));

                function loadPartialFLVFromCache(_x36) {
                    return _ref36.apply(this, arguments);
                }

                return loadPartialFLVFromCache;
            }()
        }, {
            key: 'loadAllFLVFromCache',
            value: function () {
                var _ref37 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32() {
                    var promises, i;
                    return regeneratorRuntime.wrap(function _callee32$(_context33) {
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
                                    } return _context33.abrupt('return', Promise.all(promises));

                                case 7:
                                case 'end':
                                    return _context33.stop();
                            }
                        }
                    }, _callee32, this);
                }));

                function loadAllFLVFromCache() {
                    return _ref37.apply(this, arguments);
                }

                return loadAllFLVFromCache;
            }()
        }, {
            key: 'saveFLVToCache',
            value: function () {
                var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(index, blob) {
                    var name;
                    return regeneratorRuntime.wrap(function _callee33$(_context34) {
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
                                    name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
                                    return _context34.abrupt('return', this.cache.addData({ name: name, data: blob }));

                                case 6:
                                case 'end':
                                    return _context34.stop();
                            }
                        }
                    }, _callee33, this);
                }));

                function saveFLVToCache(_x37, _x38) {
                    return _ref38.apply(this, arguments);
                }

                return saveFLVToCache;
            }()
        }, {
            key: 'savePartialFLVToCache',
            value: function () {
                var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(index, blob) {
                    var name;
                    return regeneratorRuntime.wrap(function _callee34$(_context35) {
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
                                    name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];

                                    name = 'PC_' + name;
                                    return _context35.abrupt('return', this.cache.putData({ name: name, data: blob }));

                                case 7:
                                case 'end':
                                    return _context35.stop();
                            }
                        }
                    }, _callee34, this);
                }));

                function savePartialFLVToCache(_x39, _x40) {
                    return _ref39.apply(this, arguments);
                }

                return savePartialFLVToCache;
            }()
        }, {
            key: 'cleanPartialFLVInCache',
            value: function () {
                var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(index) {
                    var name;
                    return regeneratorRuntime.wrap(function _callee35$(_context36) {
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
                                    name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];

                                    name = 'PC_' + name;
                                    return _context36.abrupt('return', this.cache.deleteData(name));

                                case 7:
                                case 'end':
                                    return _context36.stop();
                            }
                        }
                    }, _callee35, this);
                }));

                function cleanPartialFLVInCache(_x41) {
                    return _ref40.apply(this, arguments);
                }

                return cleanPartialFLVInCache;
            }()
        }, {
            key: 'getFLV',
            value: function () {
                var _ref41 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(index, progressHandler) {
                    var _this22 = this;

                    return regeneratorRuntime.wrap(function _callee37$(_context38) {
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
                                    this.flvsBlob[index] = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36() {
                                        var cache, partialCache, burl, opt, fch, fullResponse;
                                        return regeneratorRuntime.wrap(function _callee36$(_context37) {
                                            while (1) {
                                                switch (_context37.prev = _context37.next) {
                                                    case 0:
                                                        _context37.next = 2;
                                                        return _this22.loadFLVFromCache(index);

                                                    case 2:
                                                        cache = _context37.sent;

                                                        if (!cache) {
                                                            _context37.next = 5;
                                                            break;
                                                        }

                                                        return _context37.abrupt('return', _this22.flvsBlob[index] = cache);

                                                    case 5:
                                                        _context37.next = 7;
                                                        return _this22.loadPartialFLVFromCache(index);

                                                    case 7:
                                                        partialCache = _context37.sent;
                                                        burl = _this22.flvs[index];

                                                        if (partialCache) burl += '&bstart=' + partialCache.size;
                                                        opt = {
                                                            fetch: _this22.playerWin.fetch,
                                                            method: 'GET',
                                                            mode: 'cors',
                                                            cache: 'default',
                                                            referrerPolicy: 'no-referrer-when-downgrade',
                                                            cacheLoaded: partialCache ? partialCache.size : 0,
                                                            headers: partialCache && !burl.includes('wsTime') ? { Range: 'bytes=' + partialCache.size + '-' } : undefined
                                                        };

                                                        opt.onprogress = progressHandler;
                                                        opt.onerror = opt.onabort = function (_ref43) {
                                                            var target = _ref43.target,
                                                                type = _ref43.type;

                                                            var pBlob = target.getPartialBlob();
                                                            if (partialCache) pBlob = new Blob([partialCache, pBlob]);
                                                            _this22.savePartialFLVToCache(index, pBlob);
                                                        };

                                                        fch = new DetailedFetchBlob(burl, opt);

                                                        _this22.flvsDetailedFetch[index] = fch;
                                                        _context37.next = 17;
                                                        return fch.getBlob();

                                                    case 17:
                                                        fullResponse = _context37.sent;

                                                        _this22.flvsDetailedFetch[index] = undefined;
                                                        if (partialCache) {
                                                            fullResponse = new Blob([partialCache, fullResponse]);
                                                            _this22.cleanPartialFLVInCache(index);
                                                        }
                                                        _this22.saveFLVToCache(index, fullResponse);
                                                        return _context37.abrupt('return', _this22.flvsBlob[index] = fullResponse);

                                                    case 22:
                                                    case 'end':
                                                        return _context37.stop();
                                                }
                                            }
                                        }, _callee36, _this22);
                                    }))();
                                    return _context38.abrupt('return', this.flvsBlob[index]);

                                case 6:
                                case 'end':
                                    return _context38.stop();
                            }
                        }
                    }, _callee37, this);
                }));

                function getFLV(_x42, _x43) {
                    return _ref41.apply(this, arguments);
                }

                return getFLV;
            }()
        }, {
            key: 'abortFLV',
            value: function () {
                var _ref44 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38(index) {
                    return regeneratorRuntime.wrap(function _callee38$(_context39) {
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
                    }, _callee38, this);
                }));

                function abortFLV(_x44) {
                    return _ref44.apply(this, arguments);
                }

                return abortFLV;
            }()
        }, {
            key: 'getAllFLVs',
            value: function () {
                var _ref45 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(progressHandler) {
                    var promises, i;
                    return regeneratorRuntime.wrap(function _callee39$(_context40) {
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
                                    } return _context40.abrupt('return', Promise.all(promises));

                                case 5:
                                case 'end':
                                    return _context40.stop();
                            }
                        }
                    }, _callee39, this);
                }));

                function getAllFLVs(_x45) {
                    return _ref45.apply(this, arguments);
                }

                return getAllFLVs;
            }()
        }, {
            key: 'cleanAllFLVsInCache',
            value: function () {
                var _ref46 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40() {
                    var promises, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _flv, name;

                    return regeneratorRuntime.wrap(function _callee40$(_context41) {
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
                                    _iteratorNormalCompletion7 = true;
                                    _didIteratorError7 = false;
                                    _iteratorError7 = undefined;
                                    _context41.prev = 8;

                                    for (_iterator7 = this.flvs[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                        _flv = _step7.value;
                                        name = _flv.match(/\d+-\d+(?:-\d+)?\.flv/)[0];

                                        promises.push(this.cache.deleteData(name));
                                        promises.push(this.cache.deleteData('PC_' + name));
                                    }
                                    _context41.next = 16;
                                    break;

                                case 12:
                                    _context41.prev = 12;
                                    _context41.t0 = _context41['catch'](8);
                                    _didIteratorError7 = true;
                                    _iteratorError7 = _context41.t0;

                                case 16:
                                    _context41.prev = 16;
                                    _context41.prev = 17;

                                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                        _iterator7.return();
                                    }

                                case 19:
                                    _context41.prev = 19;

                                    if (!_didIteratorError7) {
                                        _context41.next = 22;
                                        break;
                                    }

                                    throw _iteratorError7;

                                case 22:
                                    return _context41.finish(19);

                                case 23:
                                    return _context41.finish(16);

                                case 24:
                                    return _context41.abrupt('return', Promise.all(promises));

                                case 25:
                                case 'end':
                                    return _context41.stop();
                            }
                        }
                    }, _callee40, this, [[8, 12, 16, 24], [17, , 19, 23]]);
                }));

                function cleanAllFLVsInCache() {
                    return _ref46.apply(this, arguments);
                }

                return cleanAllFLVsInCache;
            }()
        }, {
            key: 'setupProxy',
            value: function () {
                var _ref47 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41(res, onsuccess) {
                    var _this23 = this;

                    var resProxy, i;
                    return regeneratorRuntime.wrap(function _callee41$(_context42) {
                        while (1) {
                            switch (_context42.prev = _context42.next) {
                                case 0:
                                    (function () {
                                        var _fetch = _this23.playerWin.fetch;
                                        _this23.playerWin.fetch = function (input, init) {
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
                                    })();
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
                    }, _callee41, this);
                }));

                function setupProxy(_x46, _x47) {
                    return _ref47.apply(this, arguments);
                }

                return setupProxy;
            }()
        }], [{
            key: 'formatToValue',
            value: function formatToValue(format) {
                switch (format) {
                    case 'hdflv2':
                        return '112';
                    case 'flv':
                        return '80';
                    case 'flv720':
                        return '64';
                    case 'hdmp4':
                        return '64'; // data-value is still '64' instead of '48'. return '48';
                    case 'flv480':
                        return '32';
                    case 'mp4':
                        return '16';
                    default:
                        return null;
                }
            }
        }, {
            key: 'valueToFormat',
            value: function valueToFormat(value) {
                switch (parseInt(value)) {
                    case 112:
                        return 'hdflv2';
                    case 80:
                        return 'flv';
                    case 64:
                        return 'flv720';
                    case 48:
                        return 'hdmp4';
                    case 32:
                        return 'flv480';
                    case 16:
                        return 'mp4';
                    case 3:
                        return 'flv';
                    case 2:
                        return 'hdmp4';
                    case 1:
                        return 'mp4';
                    default:
                        return null;
                }
            }
        }, {
            key: '_UNIT_TEST',
            value: function _UNIT_TEST() {
                var _this24 = this;

                _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42() {
                    var playerWin;
                    return regeneratorRuntime.wrap(function _callee42$(_context43) {
                        while (1) {
                            switch (_context43.prev = _context43.next) {
                                case 0:
                                    _context43.next = 2;
                                    return BiliUserJS.getPlayerWin();

                                case 2:
                                    playerWin = _context43.sent;

                                    window.m = new BiliMonkey(playerWin);

                                    console.warn('sniffDefaultFormat test');
                                    _context43.next = 7;
                                    return m.sniffDefaultFormat();

                                case 7:
                                    console.log(m);

                                    console.warn('data race test');
                                    m.queryInfo('mp4');
                                    console.log(m.queryInfo('mp4'));

                                    console.warn('getNonCurrentFormat test');
                                    _context43.t0 = console;
                                    _context43.next = 15;
                                    return m.queryInfo('mp4');

                                case 15:
                                    _context43.t1 = _context43.sent;

                                    _context43.t0.log.call(_context43.t0, _context43.t1);

                                    console.warn('getCurrentFormat test');
                                    _context43.t2 = console;
                                    _context43.next = 21;
                                    return m.queryInfo('flv');

                                case 21:
                                    _context43.t3 = _context43.sent;

                                    _context43.t2.log.call(_context43.t2, _context43.t3);

                                case 23:
                                case 'end':
                                    return _context43.stop();
                            }
                        }
                    }, _callee42, _this24);
                }))();
            }
        }]);

        return BiliMonkey;
    }();

    var BiliPolyfill = function () {
        function BiliPolyfill(playerWin) {
            var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
                setStorage: function setStorage(n, i) {
                    return playerWin.localStorage.setItem(n, i);
                },
                getStorage: function getStorage(n) {
                    return playerWin.localStorage.getItem(n);
                },
                badgeWatchLater: true,
                dblclick: true,
                scroll: true,
                recommend: true,
                electric: true,
                electricSkippable: false,
                lift: true,
                autoResume: true,
                autoPlay: false,
                autoWideScreen: false,
                autoFullScreen: false,
                oped: true,
                focus: true,
                menuFocus: true,
                limitedKeydown: true,
                speech: false,
                series: true
            };
            var hintInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () { };

            _classCallCheck(this, BiliPolyfill);

            this.playerWin = playerWin;
            this.video = null;
            this.vanillaPlayer = null;
            this.option = option;
            this.setStorage = option.setStorage;
            this.getStorage = option.getStorage;
            this.hintInfo = hintInfo;
            this.series = [];
            this.userdata = { oped: {} };
        }

        _createClass(BiliPolyfill, [{
            key: 'saveUserdata',
            value: function saveUserdata() {
                this.setStorage('biliPolyfill', JSON.stringify(this.userdata));
            }
        }, {
            key: 'retrieveUserdata',
            value: function retrieveUserdata() {
                try {
                    this.userdata = this.getStorage('biliPolyfill');
                    if (this.userdata.length > 1073741824) top.alert('BiliPolyfill脚本数据已经快满了，在播放器上右键->BiliPolyfill->片头片尾->检视数据，删掉一些吧。');
                    this.userdata = JSON.parse(this.userdata);
                } catch (e) { } finally {
                    if (!this.userdata) this.userdata = {};
                    if (!(this.userdata.oped instanceof Object)) this.userdata.oped = {};
                }
            }
        }, {
            key: 'setFunctions',
            value: function () {
                var _ref49 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43() {
                    var _this25 = this;

                    var _ref50 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                        _ref50$videoRefresh = _ref50.videoRefresh,
                        videoRefresh = _ref50$videoRefresh === undefined ? false : _ref50$videoRefresh;

                    return regeneratorRuntime.wrap(function _callee43$(_context44) {
                        while (1) {
                            switch (_context44.prev = _context44.next) {
                                case 0:
                                    _context44.next = 2;
                                    return this.getPlayerVideo();

                                case 2:
                                    this.video = _context44.sent;

                                    if (this.option.betabeta) {
                                        _context44.next = 5;
                                        break;
                                    }

                                    return _context44.abrupt('return', this.getPlayerMenu());

                                case 5:

                                    // 3. Set up functions that are page static
                                    if (!videoRefresh) {
                                        this.retrieveUserdata();
                                        if (this.option.badgeWatchLater) this.badgeWatchLater();
                                        if (this.option.scroll) this.scrollToPlayer();
                                        if (this.option.recommend) this.showRecommendTab();
                                        if (this.option.autoResume) this.autoResume();
                                        if (this.option.autoPlay) this.autoPlay();
                                        if (this.option.autoWideScreen) this.autoWideScreen();
                                        if (this.option.autoFullScreen) this.autoFullScreen();
                                        if (this.option.focus) this.focusOnPlayer();
                                        if (this.option.limitedKeydown) this.limitedKeydownFullScreenPlay();
                                        if (this.option.series) this.inferNextInSeries();
                                        this.playerWin.addEventListener('beforeunload', function () {
                                            return _this25.saveUserdata();
                                        });
                                    }

                                    // 4. Set up functions that are binded to the video DOM
                                    if (this.option.lift) this.liftBottomDanmuku();
                                    if (this.option.dblclick) this.dblclickFullScreen();
                                    if (this.option.electric) this.reallocateElectricPanel();
                                    if (this.option.oped) this.skipOPED();
                                    this.video.addEventListener('emptied', function () {
                                        return _this25.setFunctions({ videoRefresh: true });
                                    });

                                    // 5. Set up functions that require everything to be ready
                                    _context44.next = 13;
                                    return this.getPlayerMenu();

                                case 13:
                                    if (this.option.menuFocus) this.menuFocusOnPlayer();

                                    // 6. Set up experimental functions
                                    if (this.option.speech) top.document.body.addEventListener('click', function (e) {
                                        return e.detail > 2 && _this25.speechRecognition();
                                    });

                                case 15:
                                case 'end':
                                    return _context44.stop();
                            }
                        }
                    }, _callee43, this);
                }));

                function setFunctions() {
                    return _ref49.apply(this, arguments);
                }

                return setFunctions;
            }()
        }, {
            key: 'inferNextInSeries',
            value: function () {
                var _ref51 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44() {
                    var title, epNumberText, seriesTitle, ep, mid, vlist;
                    return regeneratorRuntime.wrap(function _callee44$(_context45) {
                        while (1) {
                            switch (_context45.prev = _context45.next) {
                                case 0:
                                    title = (top.document.getElementsByClassName('v-title')[0] || top.document.getElementsByClassName('header-info')[0] || top.document.getElementsByClassName('video-info-module')[0]).children[0].textContent.replace(/\(\d+\)$/, '').trim();

                                    // 1. Find series name

                                    epNumberText = title.match(/\d+/g);

                                    if (epNumberText) {
                                        _context45.next = 4;
                                        break;
                                    }

                                    return _context45.abrupt('return', this.series = []);

                                case 4:
                                    epNumberText = epNumberText.pop();
                                    seriesTitle = title.slice(0, title.lastIndexOf(epNumberText)).trim();
                                    // 2. Substitude ep number

                                    ep = parseInt(epNumberText);

                                    if (epNumberText === '09') ep = ['08', '10']; else if (epNumberText[0] === '0') ep = ['0' + (ep - 1), '0' + (ep + 1)]; else ep = ['' + (ep - 1), '' + (ep + 1)];
                                    ep = [].concat(_toConsumableArray(ep.map(function (e) {
                                        return seriesTitle + e;
                                    })), _toConsumableArray(ep));

                                    mid = top.document.getElementById('r-info-rank');

                                    if (mid) {
                                        _context45.next = 12;
                                        break;
                                    }

                                    return _context45.abrupt('return', this.series = []);

                                case 12:
                                    mid = mid.children[0].href.match(/\d+/)[0];
                                    _context45.next = 15;
                                    return Promise.all([title].concat(_toConsumableArray(ep)).map(function (keyword) {
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

                                case 15:
                                    vlist = _context45.sent;


                                    vlist[0] = [vlist[0].find(function (e) {
                                        return e.title == title;
                                    })];

                                    if (vlist[0][0]) {
                                        _context45.next = 20;
                                        break;
                                    }

                                    console && console.warn('BiliPolyfill: inferNextInSeries: cannot find current video in mid space'); return _context45.abrupt('return', this.series = []);

                                case 20:
                                    this.series = [vlist[1].find(function (e) {
                                        return e.created < vlist[0][0].created;
                                    }), vlist[2].reverse().find(function (e) {
                                        return e.created > vlist[0][0].created;
                                    })];
                                    if (!this.series[0]) this.series[0] = vlist[3].find(function (e) {
                                        return e.created < vlist[0][0].created;
                                    }) || null;
                                    if (!this.series[1]) this.series[1] = vlist[4].reverse().find(function (e) {
                                        return e.created > vlist[0][0].created;
                                    }) || null;

                                    return _context45.abrupt('return', this.series);

                                case 24:
                                case 'end':
                                    return _context45.stop();
                            }
                        }
                    }, _callee44, this);
                }));

                function inferNextInSeries() {
                    return _ref51.apply(this, arguments);
                }

                return inferNextInSeries;
            }()
        }, {
            key: 'badgeWatchLater',
            value: function badgeWatchLater() {
                var li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn');
                if (!li || !li.children[1]) return;
                li.children[1].style.visibility = 'hidden';
                li.dispatchEvent(new Event('mouseover'));
                var observer = new MutationObserver(function () {
                    if (li.children[1].children[0].children[0].className == 'm-w-loading') return;
                    observer.disconnect();
                    li.dispatchEvent(new Event('mouseout'));
                    setTimeout(function () {
                        return li.children[1].style.visibility = '';
                    }, 700);
                    if (li.children[1].children[0].children[0].className == 'no-data') return;
                    var div = top.document.createElement('div');
                    div.className = 'num';
                    div.style.display = 'block';
                    div.style.left = 'initial';
                    div.style.right = '-6px';
                    if (li.children[1].children[0].children.length > 5) {
                        div.textContent = '5+';
                    } else {
                        div.textContent = li.children[1].children[0].children.length;
                    }
                    li.appendChild(div);
                });
                observer.observe(li.children[1].children[0], { childList: true });
            }
        }, {
            key: 'dblclickFullScreen',
            value: function dblclickFullScreen() {
                var _this26 = this;

                this.video.addEventListener('dblclick', function () {
                    return _this26.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
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
                var ret = top.document.querySelector('.cover_image') || top.document.querySelector('div.info-cover > a > img') || top.document.querySelector('[data-state-play="true"]  img');
                if (!ret) return null;

                ret = ret.src;
                ret = ret.slice(0, ret.indexOf('.jpg') + 4);
                return ret;
            }
        }, {
            key: 'reallocateElectricPanel',
            value: function reallocateElectricPanel() {
                var _this27 = this;

                if (!this.playerWin.localStorage.bilibili_player_settings) return;
                if (!this.playerWin.localStorage.bilibili_player_settings.includes('"autopart":1') && !this.option.electricSkippable) return;
                this.video.addEventListener('ended', function () {
                    setTimeout(function () {
                        var i = _this27.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0];
                        if (!i) return;
                        i.children[2].click();
                        i.style.display = 'block';
                        i.style.zIndex = 233;
                        var j = 5;
                        var h = setInterval(function () {
                            if (_this27.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) i.style.zIndex = '';
                            if (j > 0) {
                                i.children[2].children[0].textContent = '0' + j;
                                j--;
                            } else {
                                clearInterval(h);
                                i.remove();
                            }
                        }, 1000);
                    }, 0);
                });
            }
        }, {
            key: 'liftBottomDanmuku',
            value: function liftBottomDanmuku() {
                // MUST initialize setting panel before click
                this.playerWin.document.getElementsByName('ctlbar_danmuku_close')[0].dispatchEvent(new Event('mouseover'));
                this.playerWin.document.getElementsByName('ctlbar_danmuku_close')[0].dispatchEvent(new Event('mouseout'));
                if (!this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0].nextSibling.className.includes('bpui-state-active')) this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0].click();
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
                var _this28 = this;

                var h = function h() {
                    var span = _this28.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
                    if (!span) return;

                    var _span$textContent$spl = span.textContent.split(':'),
                        _span$textContent$spl2 = _slicedToArray(_span$textContent$spl, 2),
                        min = _span$textContent$spl2[0],
                        sec = _span$textContent$spl2[1];

                    if (!min || !sec) return;
                    var time = parseInt(min) * 60 + parseInt(sec);
                    if (time < _this28.video.duration - 10) {
                        if (!_this28.video.paused || _this28.video.autoplay) {
                            _this28.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                        } else {
                            var play = _this28.video.play;
                            _this28.video.play = function () {
                                return setTimeout(function () {
                                    _this28.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                                    _this28.video.play = play;
                                }, 0);
                            };
                            _this28.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                        }
                    } else {
                        _this28.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-close').click();
                        _this28.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom').children[0].style.visibility = 'hidden';
                    }
                };
                this.video.addEventListener('canplay', h);
                setTimeout(function () {
                    return _this28.video && _this28.video.removeEventListener && _this28.video.removeEventListener('canplay', h);
                }, 3000);
            }
        }, {
            key: 'autoPlay',
            value: function autoPlay() {
                var _this29 = this;

                this.video.autoplay = true;
                setTimeout(function () {
                    if (_this29.video.paused) _this29.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                }, 0);
            }
        }, {
            key: 'autoWideScreen',
            value: function autoWideScreen() {
                if (this.playerWin.document.querySelector('#bilibiliPlayer i.icon-24wideoff')) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-widescreen').click();
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
            key: 'markOPPosition',
            value: function markOPPosition() {
                var collectionId = this.getCollectionId();
                if (!(this.userdata.oped[collectionId] instanceof Array)) this.userdata.oped[collectionId] = [];
                this.userdata.oped[collectionId][0] = this.video.currentTime;
            }
        }, {
            key: 'markEDPostion',
            value: function markEDPostion() {
                var collectionId = this.getCollectionId();
                if (!(this.userdata.oped[collectionId] instanceof Array)) this.userdata.oped[collectionId] = [];
                this.userdata.oped[collectionId][1] = this.video.currentTime;
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
                var _this30 = this;

                var collectionId = this.getCollectionId();
                if (!(this.userdata.oped[collectionId] instanceof Array)) return;
                if (this.userdata.oped[collectionId][0]) {
                    if (this.video.currentTime < this.userdata.oped[collectionId][0]) {
                        this.video.currentTime = this.userdata.oped[collectionId][0];
                        this.hintInfo('BiliPolyfill: 已跳过片头');
                    }
                }
                if (this.userdata.oped[collectionId][1]) {
                    var edHandler = function edHandler(v) {
                        if (v.target.currentTime > _this30.userdata.oped[collectionId][1]) {
                            v.target.removeEventListener('timeupdate', edHandler);
                            v.target.dispatchEvent(new Event('ended'));
                        }
                    };
                    this.video.addEventListener('timeupdate', edHandler);
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
                var _this31 = this;

                this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0].addEventListener('click', function () {
                    return setTimeout(function () {
                        return _this31.focusOnPlayer();
                    }, 0);
                });
            }
        }, {
            key: 'limitedKeydownFullScreenPlay',
            value: function limitedKeydownFullScreenPlay() {
                var _this32 = this;

                var h = function h(e) {
                    if (!e.isTrusted) return;
                    if (e.key == 'Enter') {
                        if (_this32.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                            _this32.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                        }
                        if (_this32.video.paused) {
                            if (_this32.video.readyState) {
                                _this32.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                            } else {
                                var i = function i() {
                                    _this32.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                                    _this32.video.removeEventListener('canplay', i);
                                };
                                _this32.video.addEventListener('canplay', i);
                            }
                        }
                    }
                    top.document.removeEventListener('keydown', h);
                    top.document.removeEventListener('click', h);
                };
                top.document.addEventListener('keydown', h);
                top.document.addEventListener('click', h);
            }
        }, {
            key: 'speechRecognition',
            value: function speechRecognition() {
                var _this33 = this;

                var SpeechRecognition = top.SpeechRecognition || top.webkitSpeechRecognition;
                var SpeechGrammarList = top.SpeechGrammarList || top.webkitSpeechGrammarList;
                alert('Yahaha! You found me!\nBiliTwin支持的语音命令: 播放 暂停 全屏 关闭 加速 减速 下一集\nChrome may support Cantonese or Hakka as well. See BiliPolyfill::speechRecognition.');
                if (!SpeechRecognition || !SpeechGrammarList) alert('浏览器太旧啦~彩蛋没法运行~');
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
                            if (_this33.video.paused) _this33.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                            _this33.hintInfo('BiliPolyfill: \u8BED\u97F3:\u64AD\u653E');
                            break;
                        case '暂停':
                            if (!_this33.video.paused) _this33.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                            _this33.hintInfo('BiliPolyfill: \u8BED\u97F3:\u6682\u505C');
                            break;
                        case '全屏':
                            _this33.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                            _this33.hintInfo('BiliPolyfill: \u8BED\u97F3:\u5168\u5C4F');
                            break;
                        case '关闭':
                            top.close();
                            break;
                        case '加速':
                            _this33.setVideoSpeed(2);
                            _this33.hintInfo('BiliPolyfill: \u8BED\u97F3:\u52A0\u901F');
                            break;
                        case '减速':
                            _this33.setVideoSpeed(0.5);
                            _this33.hintInfo('BiliPolyfill: \u8BED\u97F3:\u51CF\u901F');
                            break;
                        case '下一集':
                            _this33.video.dispatchEvent(new Event('ended'));
                        default:
                            _this33.hintInfo('BiliPolyfill: \u8BED\u97F3:"' + transcript + '"\uFF1F');
                            break;
                    }
                    (typeof console === 'undefined' ? 'undefined' : _typeof(console)) == "object" && console.log(e.results);
                    (typeof console === 'undefined' ? 'undefined' : _typeof(console)) == "object" && console.log('transcript:' + transcript + ' confidence:' + e.results[0][0].confidence);
                };
            }
        }, {
            key: 'substitudeFullscreenPlayer',
            value: function substitudeFullscreenPlayer(option) {
                if (!option) throw 'usage: substitudeFullscreenPlayer({cid, aid[, p][, ...otherOptions]})';
                if (!option.cid) throw 'player init: cid missing';
                if (!option.aid) throw 'player init: aid missing';
                var h = this.playerWin.document;
                var i = [h.webkitExitFullscreen, h.mozExitFullScreen, h.msExitFullscreen, h.exitFullscreen];
                h.webkitExitFullscreen = h.mozExitFullScreen = h.msExitFullscreen = h.exitFullscreen = function () { };
                this.playerWin.player.destroy();
                this.playerWin.player = new bilibiliPlayer(option);
                if (option.p) this.playerWin.callAppointPart(option.p);
                h.webkitExitFullscreen = i[0];
                h.mozExitFullScreen = i[1];
                h.msExitFullscreen = i[2];
                h.exitFullscreen = i[3];
            }
        }, {
            key: 'getPlayerVideo',
            value: function () {
                var _ref52 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45() {
                    var _this34 = this;

                    return regeneratorRuntime.wrap(function _callee45$(_context46) {
                        while (1) {
                            switch (_context46.prev = _context46.next) {
                                case 0:
                                    if (!this.playerWin.document.getElementsByTagName('video').length) {
                                        _context46.next = 4;
                                        break;
                                    }

                                    return _context46.abrupt('return', this.video = this.playerWin.document.getElementsByTagName('video')[0]);

                                case 4:
                                    return _context46.abrupt('return', new Promise(function (resolve) {
                                        var observer = new MutationObserver(function () {
                                            if (_this34.playerWin.document.getElementsByTagName('video').length) {
                                                observer.disconnect();
                                                resolve(_this34.video = _this34.playerWin.document.getElementsByTagName('video')[0]);
                                            }
                                        });
                                        observer.observe(_this34.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                    }));

                                case 5:
                                case 'end':
                                    return _context46.stop();
                            }
                        }
                    }, _callee45, this);
                }));

                function getPlayerVideo() {
                    return _ref52.apply(this, arguments);
                }

                return getPlayerVideo;
            }()
        }, {
            key: 'getPlayerMenu',
            value: function () {
                var _ref53 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee46() {
                    var _this35 = this;

                    return regeneratorRuntime.wrap(function _callee46$(_context47) {
                        while (1) {
                            switch (_context47.prev = _context47.next) {
                                case 0:
                                    if (!this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                                        _context47.next = 4;
                                        break;
                                    }

                                    return _context47.abrupt('return', this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);

                                case 4:
                                    return _context47.abrupt('return', new Promise(function (resolve) {
                                        var observer = new MutationObserver(function () {
                                            if (_this35.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                                                observer.disconnect();
                                                resolve(_this35.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);
                                            }
                                        });
                                        observer.observe(_this35.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                    }));

                                case 5:
                                case 'end':
                                    return _context47.stop();
                            }
                        }
                    }, _callee46, this);
                }));

                function getPlayerMenu() {
                    return _ref53.apply(this, arguments);
                }

                return getPlayerMenu;
            }()
        }], [{
            key: 'openMinimizedPlayer',
            value: function () {
                var _ref54 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee47() {
                    var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { cid: top.cid, aid: top.aid, playerWin: top };
                    var h, res, div, i;
                    return regeneratorRuntime.wrap(function _callee47$(_context48) {
                        while (1) {
                            switch (_context48.prev = _context48.next) {
                                case 0:
                                    if (option) {
                                        _context48.next = 2;
                                        break;
                                    }

                                    throw 'usage: openMinimizedPlayer({cid[, aid]})';

                                case 2:
                                    if (option.cid) {
                                        _context48.next = 4;
                                        break;
                                    }

                                    throw 'player init: cid missing';

                                case 4:
                                    if (!option.aid) option.aid = top.aid;
                                    if (!option.playerWin) option.playerWin = top;

                                    h = top.open('//www.bilibili.com/blackboard/html5player.html?cid=' + option.cid + '&aid=' + option.aid + '&crossDomain=' + (top.document.domain != 'www.bilibili.com' ? 'true' : ''), undefined, ' ');
                                    _context48.t0 = top.location.href.includes('bangumi');

                                    if (!_context48.t0) {
                                        _context48.next = 12;
                                        break;
                                    }

                                    _context48.next = 11;
                                    return new Promise(function (resolve) {
                                        var jq = option.playerWin.jQuery;
                                        var _ajax = jq.ajax;

                                        jq.ajax = function (a, c) {
                                            if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                            };
                                            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                                a.success = resolve;
                                                jq.ajax = _ajax;
                                            }
                                            return _ajax.call(jq, a, c);
                                        };
                                        option.playerWin.player.reloadAccess();
                                    });

                                case 11:
                                    _context48.t0 = _context48.sent;

                                case 12:
                                    res = _context48.t0;
                                    _context48.next = 15;
                                    return new Promise(function (resolve) {
                                        var i = setInterval(function () {
                                            return h.document.getElementById('bilibiliPlayer') && resolve();
                                        }, 500);
                                        h.addEventListener('load', resolve);
                                        setTimeout(function () {
                                            clearInterval(i);
                                            h.removeEventListener('load', resolve);
                                            resolve();
                                        }, 6000);
                                    });

                                case 15:
                                    div = h.document.getElementById('bilibiliPlayer');

                                    if (div) {
                                        _context48.next = 19;
                                        break;
                                    }

                                    console.warn('openMinimizedPlayer: document load timeout'); return _context48.abrupt('return');

                                case 19:
                                    if (!res) {
                                        _context48.next = 22;
                                        break;
                                    }

                                    _context48.next = 22;
                                    return new Promise(function (resolve) {
                                        var jq = h.jQuery;
                                        var _ajax = jq.ajax;

                                        jq.ajax = function (a, c) {
                                            if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                            };
                                            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                                                a.success(res);
                                                jq.ajax = _ajax;
                                                resolve();
                                            } else {
                                                return _ajax.call(jq, a, c);
                                            }
                                        };
                                        h.player = new h.bilibiliPlayer({ cid: option.cid, aid: option.aid });
                                        // h.eval(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
                                        // console.log(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
                                    });

                                case 22:
                                    _context48.next = 24;
                                    return new Promise(function (resolve) {
                                        if (h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) resolve(); else {
                                            var observer = new MutationObserver(function () {
                                                if (h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) {
                                                    observer.disconnect();
                                                    resolve();
                                                }
                                            });
                                            observer.observe(h.document.getElementById('bilibiliPlayer'), { childList: true });
                                        }
                                    });

                                case 24:
                                    i = [div.webkitRequestFullscreen, div.mozRequestFullScreen, div.msRequestFullscreen, div.requestFullscreen];

                                    div.webkitRequestFullscreen = div.mozRequestFullScreen = div.msRequestFullscreen = div.requestFullscreen = function () { };
                                    if (h.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                                    div.webkitRequestFullscreen = i[0];
                                    div.mozRequestFullScreen = i[1];
                                    div.msRequestFullscreen = i[2];
                                    div.requestFullscreen = i[3];

                                case 31:
                                case 'end':
                                    return _context48.stop();
                            }
                        }
                    }, _callee47, this);
                }));

                function openMinimizedPlayer() {
                    return _ref54.apply(this, arguments);
                }

                return openMinimizedPlayer;
            }()
        }, {
            key: 'parseHref',
            value: function parseHref() {
                var href = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : top.location.href;

                if (href.includes('bangumi')) {
                    var anime = void 0,
                        play = void 0;
                    anime = (anime = /anime\/\d+/.exec(href)) ? anime[0].slice(6) : null;
                    play = (play = /play#\d+/.exec(href)) ? play[0].slice(5) : null;
                    if (!anime || !play) return null;
                    return 'bangumi.bilibili.com/anime/' + anime + '/play#' + play;
                } else {
                    var aid = void 0,
                        pid = void 0;
                    aid = (aid = /av\d+/.exec(href)) ? aid[0].slice(2) : null;
                    if (!aid) return null;
                    pid = (pid = /page=\d+/.exec(href)) ? pid[0].slice(5) : (pid = /index_\d+.html/.exec(href)) ? pid[0].slice(6, -5) : null;
                    if (!pid) return 'www.bilibili.com/video/av' + aid;
                    return 'www.bilibili.com/video/av' + aid + '/index_' + pid + '.html';
                }
            }
        }, {
            key: 'secondToReadable',
            value: function secondToReadable(s) {
                if (s > 60) return parseInt(s / 60) + '\u5206' + parseInt(s % 60) + '\u79D2'; else return parseInt(s % 60) + '\u79D2';
            }
        }, {
            key: 'clearAllUserdata',
            value: function clearAllUserdata() {
                var playerWin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : top;

                if (playerWin.GM_setValue) return GM_setValue('biliPolyfill', '');
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
        }]);

        return BiliPolyfill;
    }();

    var BiliUserJS = function () {
        function BiliUserJS() {
            _classCallCheck(this, BiliUserJS);
        }

        _createClass(BiliUserJS, null, [{
            key: 'getIframeWin',
            value: function () {
                var _ref55 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee48() {
                    return regeneratorRuntime.wrap(function _callee48$(_context49) {
                        while (1) {
                            switch (_context49.prev = _context49.next) {
                                case 0:
                                    if (!document.querySelector('#bofqi > iframe').contentDocument.getElementById('bilibiliPlayer')) {
                                        _context49.next = 4;
                                        break;
                                    }

                                    return _context49.abrupt('return', document.querySelector('#bofqi > iframe').contentWindow);

                                case 4:
                                    return _context49.abrupt('return', new Promise(function (resolve) {
                                        document.querySelector('#bofqi > iframe').addEventListener('load', function () {
                                            resolve(document.querySelector('#bofqi > iframe').contentWindow);
                                        });
                                    }));

                                case 5:
                                case 'end':
                                    return _context49.stop();
                            }
                        }
                    }, _callee48, this);
                }));

                function getIframeWin() {
                    return _ref55.apply(this, arguments);
                }

                return getIframeWin;
            }()
        }, {
            key: 'getPlayerWin',
            value: function () {
                var _ref56 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee49() {
                    return regeneratorRuntime.wrap(function _callee49$(_context50) {
                        while (1) {
                            switch (_context50.prev = _context50.next) {
                                case 0:
                                    if (!location.href.includes('/watchlater/#/list')) {
                                        _context50.next = 3;
                                        break;
                                    }

                                    _context50.next = 3;
                                    return new Promise(function (resolve) {
                                        var h = function h() {
                                            resolve(location.href);
                                            window.removeEventListener('hashchange', h);
                                        };
                                        window.addEventListener('hashchange', h);
                                    });

                                case 3:
                                    if (!location.href.includes('/watchlater/#/')) {
                                        _context50.next = 7;
                                        break;
                                    }

                                    if (document.getElementById('bofqi')) {
                                        _context50.next = 7;
                                        break;
                                    }

                                    _context50.next = 7;
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
                                        _context50.next = 11;
                                        break;
                                    }

                                    return _context50.abrupt('return', window);

                                case 11:
                                    if (!document.querySelector('#bofqi > iframe')) {
                                        _context50.next = 15;
                                        break;
                                    }

                                    return _context50.abrupt('return', BiliUserJS.getIframeWin());

                                case 15:
                                    if (!document.querySelector('#bofqi > object')) {
                                        _context50.next = 19;
                                        break;
                                    }

                                    throw 'Need H5 Player';

                                case 19:
                                    return _context50.abrupt('return', new Promise(function (resolve) {
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
                                    return _context50.stop();
                            }
                        }
                    }, _callee49, this);
                }));

                function getPlayerWin() {
                    return _ref56.apply(this, arguments);
                }

                return getPlayerWin;
            }()
        }]);

        return BiliUserJS;
    }();

    var UI = function (_BiliUserJS) {
        _inherits(UI, _BiliUserJS);

        function UI() {
            _classCallCheck(this, UI);

            return _possibleConstructorReturn(this, (UI.__proto__ || Object.getPrototypeOf(UI)).apply(this, arguments));
        }

        _createClass(UI, null, [{
            key: 'titleAppend',

            // Title Append
            value: function titleAppend(monkey) {
                var _this37 = this;

                var h = document.querySelector('div.viewbox div.info') || document.querySelector('div.bangumi-header div.header-info') || document.querySelector('div.video-info-module');
                var tminfo = document.querySelector('div.tminfo') || document.querySelector('div.info-second');
                var div = document.createElement('div');
                var flvA = document.createElement('a');
                var mp4A = document.createElement('a');
                var assA = document.createElement('a');
                flvA.textContent = '超清FLV';
                mp4A.textContent = '原生MP4';
                assA.textContent = '弹幕ASS';

                flvA.onmouseover = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee50() {
                    var flvDiv;
                    return regeneratorRuntime.wrap(function _callee50$(_context51) {
                        while (1) {
                            switch (_context51.prev = _context51.next) {
                                case 0:
                                    flvA.textContent = '正在FLV';
                                    flvA.onmouseover = null;
                                    _context51.next = 4;
                                    return monkey.queryInfo('flv');

                                case 4:
                                    flvA.textContent = '超清FLV';
                                    flvDiv = UI.genFLVDiv(monkey);

                                    document.body.appendChild(flvDiv);
                                    flvA.onclick = function () {
                                        return flvDiv.style.display = 'block';
                                    };

                                case 8:
                                case 'end':
                                    return _context51.stop();
                            }
                        }
                    }, _callee50, _this37);
                }));
                mp4A.onmouseover = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee51() {
                    return regeneratorRuntime.wrap(function _callee51$(_context52) {
                        while (1) {
                            switch (_context52.prev = _context52.next) {
                                case 0:
                                    mp4A.textContent = '正在MP4';
                                    mp4A.onmouseover = null;
                                    _context52.next = 4;
                                    return monkey.queryInfo('mp4');

                                case 4:
                                    mp4A.href = _context52.sent;

                                    mp4A.textContent = '原生MP4';
                                    mp4A.download = '';
                                    mp4A.referrerPolicy = 'origin';

                                case 8:
                                case 'end':
                                    return _context52.stop();
                            }
                        }
                    }, _callee51, _this37);
                }));
                assA.onmouseover = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee52() {
                    return regeneratorRuntime.wrap(function _callee52$(_context53) {
                        while (1) {
                            switch (_context53.prev = _context53.next) {
                                case 0:
                                    assA.textContent = '正在ASS';
                                    assA.onmouseover = null;
                                    _context53.next = 4;
                                    return monkey.queryInfo('ass');

                                case 4:
                                    assA.href = _context53.sent;

                                    assA.textContent = '弹幕ASS';
                                    if (monkey.mp4 && monkey.mp4.match) assA.download = monkey.mp4.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0] + '.ass'; else assA.download = monkey.cid + '.ass';

                                case 7:
                                case 'end':
                                    return _context53.stop();
                            }
                        }
                    }, _callee52, _this37);
                }));

                flvA.style.fontSize = mp4A.style.fontSize = assA.style.fontSize = '15px';
                div.appendChild(flvA);
                div.appendChild(document.createTextNode(' '));
                div.appendChild(mp4A);
                div.appendChild(document.createTextNode(' '));
                div.appendChild(assA);
                div.className = 'bilitwin';
                div.style.float = 'left';
                tminfo.style.float = 'none';
                tminfo.style.marginLeft = '185px';
                h.insertBefore(div, tminfo);
                return { flvA: flvA, mp4A: mp4A, assA: assA };
            }
        }, {
            key: 'genFLVDiv',
            value: function genFLVDiv(monkey) {
                var _this38 = this;

                var flvs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : monkey.flvs;
                var cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : monkey.cache;

                var div = UI.genDiv();

                var table = document.createElement('table');
                table.style.width = '100%';
                table.style.lineHeight = '2em';

                var _loop6 = function _loop6(i) {
                    var tr = table.insertRow(-1);
                    tr.insertCell(0).innerHTML = '<a href="' + flvs[i] + '">FLV\u5206\u6BB5 ' + (i + 1) + '</a>';
                    tr.insertCell(1).innerHTML = '<a>缓存本段</a>';
                    tr.insertCell(2).innerHTML = '<progress value="0" max="100">进度条</progress>';
                    tr.children[1].children[0].onclick = function () {
                        UI.downloadFLV(tr.children[1].children[0], monkey, i, tr.children[2].children[0]);
                    };
                };

                for (var i = 0; i < flvs.length; i++) {
                    _loop6(i);
                }
                var tr = table.insertRow(-1);
                tr.insertCell(0).innerHTML = '<a>全部复制到剪贴板</a>';
                tr.insertCell(1).innerHTML = '<a>缓存全部+自动合并</a>';
                tr.insertCell(2).innerHTML = '<progress value="0" max="' + (flvs.length + 1) + '">\u8FDB\u5EA6\u6761</progress>';
                if (top.location.href.includes('bangumi')) {
                    tr.children[0].children[0].onclick = function () {
                        return UI.copyToClipboard(flvs.join('\n'));
                    };
                } else {
                    tr.children[0].innerHTML = '<a download="biliTwin.ef2">IDM导出</a>';
                    tr.children[0].children[0].href = URL.createObjectURL(new Blob([UI.exportIDM(flvs, top.location.origin)]));
                }
                tr.children[1].children[0].onclick = function () {
                    return UI.downloadAllFLVs(tr.children[1].children[0], monkey, table);
                };
                table.insertRow(-1).innerHTML = '<td colspan="3">合并功能推荐配置：至少8G RAM。把自己下载的分段FLV拖动到这里，也可以合并哦~</td>';
                table.insertRow(-1).innerHTML = cache ? '<td colspan="3">下载的缓存分段会暂时停留在电脑里，过一段时间会自动消失。建议只开一个标签页。</td>' : '<td colspan="3">建议只开一个标签页。关掉标签页后，缓存就会被清理。别忘了另存为！</td>';
                UI.displayQuota(table.insertRow(-1));
                div.appendChild(table);

                div.ondragenter = div.ondragover = function (e) {
                    return UI.allowDrag(e);
                };
                div.ondrop = function () {
                    var _ref60 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee53(e) {
                        var files, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, file, outputName, url;

                        return regeneratorRuntime.wrap(function _callee53$(_context54) {
                            while (1) {
                                switch (_context54.prev = _context54.next) {
                                    case 0:
                                        UI.allowDrag(e);
                                        files = Array.from(e.dataTransfer.files);

                                        if (files.every(function (e) {
                                            return e.name.search(/\d+-\d+(?:-\d+)?\.flv/) != -1;
                                        })) {
                                            files.sort(function (a, b) {
                                                return a.name.match(/\d+-(\d+)(?:-\d+)?\.flv/)[1] - b.name.match(/\d+-(\d+)(?:-\d+)?\.flv/)[1];
                                            });
                                        }
                                        _iteratorNormalCompletion8 = true;
                                        _didIteratorError8 = false;
                                        _iteratorError8 = undefined;
                                        _context54.prev = 6;
                                        for (_iterator8 = files[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                            file = _step8.value;

                                            table.insertRow(-1).innerHTML = '<td colspan="3">' + file.name + '</td>';
                                        }
                                        _context54.next = 14;
                                        break;

                                    case 10:
                                        _context54.prev = 10;
                                        _context54.t0 = _context54['catch'](6);
                                        _didIteratorError8 = true;
                                        _iteratorError8 = _context54.t0;

                                    case 14:
                                        _context54.prev = 14;
                                        _context54.prev = 15;

                                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                            _iterator8.return();
                                        }

                                    case 17:
                                        _context54.prev = 17;

                                        if (!_didIteratorError8) {
                                            _context54.next = 20;
                                            break;
                                        }

                                        throw _iteratorError8;

                                    case 20:
                                        return _context54.finish(17);

                                    case 21:
                                        return _context54.finish(14);

                                    case 22:
                                        outputName = files[0].name.match(/\d+-\d+(?:-\d+)?\.flv/);

                                        if (outputName) outputName = outputName[0].replace(/-\d/, ""); else outputName = 'merge_' + files[0].name;
                                        _context54.next = 26;
                                        return UI.mergeFLVFiles(files);

                                    case 26:
                                        url = _context54.sent;

                                        table.insertRow(-1).innerHTML = '<td colspan="3"><a href="' + url + '" download="' + outputName + '">' + outputName + '</a></td>';

                                    case 28:
                                    case 'end':
                                        return _context54.stop();
                                }
                            }
                        }, _callee53, _this38, [[6, 10, 14, 22], [15, , 17, 21]]);
                    }));

                    return function (_x56) {
                        return _ref60.apply(this, arguments);
                    };
                }();

                var buttons = [];
                for (var i = 0; i < 3; i++) {
                    buttons.push(document.createElement('button'));
                } buttons.forEach(function (btn) {
                    return btn.style.padding = '0.5em';
                });
                buttons.forEach(function (btn) {
                    return btn.style.margin = '0.2em';
                });
                buttons[0].textContent = '关闭';
                buttons[0].onclick = function () {
                    div.style.display = 'none';
                };
                buttons[1].textContent = '清空这个视频的缓存';
                buttons[1].onclick = function () {
                    monkey.cleanAllFLVsInCache();
                };
                buttons[2].textContent = '清空所有视频的缓存';
                buttons[2].onclick = function () {
                    UI.clearCacheDB(cache);
                };
                buttons.forEach(function (btn) {
                    return div.appendChild(btn);
                });

                return div;
            }
        }, {
            key: 'downloadAllFLVs',
            value: function () {
                var _ref61 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee54(a, monkey, table) {
                    var i, bar, _i2, blobs, mergedFLV, ass, url, outputName;

                    return regeneratorRuntime.wrap(function _callee54$(_context55) {
                        while (1) {
                            switch (_context55.prev = _context55.next) {
                                case 0:
                                    if (!(table.rows[0].cells.length < 3)) {
                                        _context55.next = 2;
                                        break;
                                    }

                                    return _context55.abrupt('return');

                                case 2:
                                    monkey.hangPlayer();
                                    table.insertRow(-1).innerHTML = '<td colspan="3">已屏蔽网页播放器的网络链接。切换清晰度可重新激活播放器。</td>';

                                    for (i = 0; i < monkey.flvs.length; i++) {
                                        if (table.rows[i].cells[1].children[0].textContent == '缓存本段') table.rows[i].cells[1].children[0].click();
                                    }

                                    bar = a.parentNode.nextSibling.children[0];

                                    bar.max = monkey.flvs.length + 1;
                                    bar.value = 0;
                                    for (_i2 = 0; _i2 < monkey.flvs.length; _i2++) {
                                        monkey.getFLV(_i2).then(function (e) {
                                            return bar.value++;
                                        });
                                    } blobs = void 0;
                                    _context55.next = 12;
                                    return monkey.getAllFLVs();

                                case 12:
                                    blobs = _context55.sent;
                                    _context55.next = 15;
                                    return FLV.mergeBlobs(blobs);

                                case 15:
                                    mergedFLV = _context55.sent;
                                    _context55.next = 18;
                                    return monkey.ass;

                                case 18:
                                    ass = _context55.sent;
                                    url = URL.createObjectURL(mergedFLV);
                                    outputName = (top.document.getElementsByClassName('v-title')[0] || top.document.getElementsByClassName('header-info')[0] || top.document.getElementsByClassName('video-info-module')[0]).children[0].textContent.trim();


                                    bar.value++;
                                    table.insertRow(0).innerHTML = '\n        <td colspan="3" style="border: 1px solid black">\n            <a href="' + url + '" download="' + outputName + '.flv">\u4FDD\u5B58\u5408\u5E76\u540EFLV</a> \n            <a href="' + ass + '" download="' + outputName + '.ass">\u5F39\u5E55ASS</a> \n            <a>\u6253\u5305MKV(\u8F6F\u5B57\u5E55\u5C01\u88C5)</a>\n            \u8BB0\u5F97\u6E05\u7406\u5206\u6BB5\u7F13\u5B58\u54E6~\n        </td>\n        ';
                                    table.rows[0].cells[0].children[2].onclick = function () {
                                        return new MKVTransmuxer().exec(url, ass, outputName + '.mkv');
                                    };
                                    return _context55.abrupt('return', url);

                                case 25:
                                case 'end':
                                    return _context55.stop();
                            }
                        }
                    }, _callee54, this);
                }));

                function downloadAllFLVs(_x57, _x58, _x59) {
                    return _ref61.apply(this, arguments);
                }

                return downloadAllFLVs;
            }()
        }, {
            key: 'downloadFLV',
            value: function () {
                var _ref62 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee55(a, monkey, index) {
                    var bar = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
                    var handler, url;
                    return regeneratorRuntime.wrap(function _callee55$(_context56) {
                        while (1) {
                            switch (_context56.prev = _context56.next) {
                                case 0:
                                    handler = function handler(e) {
                                        return UI.beforeUnloadHandler(e);
                                    };

                                    window.addEventListener('beforeunload', handler);

                                    a.textContent = '取消';
                                    a.onclick = function () {
                                        a.onclick = null;
                                        window.removeEventListener('beforeunload', handler);
                                        a.textContent = '已取消';
                                        monkey.abortFLV(index);
                                    };

                                    url = void 0;
                                    _context56.prev = 5;
                                    _context56.next = 8;
                                    return monkey.getFLV(index, function (loaded, total) {
                                        bar.value = loaded;
                                        bar.max = total;
                                    });

                                case 8:
                                    url = _context56.sent;

                                    url = URL.createObjectURL(url);
                                    if (bar.value == 0) bar.value = bar.max = 1;
                                    _context56.next = 19;
                                    break;

                                case 13:
                                    _context56.prev = 13;
                                    _context56.t0 = _context56['catch'](5);

                                    a.onclick = null;
                                    window.removeEventListener('beforeunload', handler);
                                    a.textContent = '错误';
                                    throw _context56.t0;

                                case 19:

                                    a.onclick = null;
                                    window.removeEventListener('beforeunload', handler);
                                    a.textContent = '另存为';
                                    a.download = monkey.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
                                    a.href = url;
                                    return _context56.abrupt('return', url);

                                case 25:
                                case 'end':
                                    return _context56.stop();
                            }
                        }
                    }, _callee55, this, [[5, 13]]);
                }));

                function downloadFLV(_x60, _x61, _x62) {
                    return _ref62.apply(this, arguments);
                }

                return downloadFLV;
            }()
        }, {
            key: 'mergeFLVFiles',
            value: function () {
                var _ref63 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee56(files) {
                    var merged;
                    return regeneratorRuntime.wrap(function _callee56$(_context57) {
                        while (1) {
                            switch (_context57.prev = _context57.next) {
                                case 0:
                                    _context57.next = 2;
                                    return FLV.mergeBlobs(files);

                                case 2:
                                    merged = _context57.sent;
                                    return _context57.abrupt('return', URL.createObjectURL(merged));

                                case 4:
                                case 'end':
                                    return _context57.stop();
                            }
                        }
                    }, _callee56, this);
                }));

                function mergeFLVFiles(_x64) {
                    return _ref63.apply(this, arguments);
                }

                return mergeFLVFiles;
            }()
        }, {
            key: 'clearCacheDB',
            value: function () {
                var _ref64 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee57(cache) {
                    return regeneratorRuntime.wrap(function _callee57$(_context58) {
                        while (1) {
                            switch (_context58.prev = _context58.next) {
                                case 0:
                                    if (!cache) {
                                        _context58.next = 2;
                                        break;
                                    }

                                    return _context58.abrupt('return', cache.deleteEntireDB());

                                case 2:
                                case 'end':
                                    return _context58.stop();
                            }
                        }
                    }, _callee57, this);
                }));

                function clearCacheDB(_x65) {
                    return _ref64.apply(this, arguments);
                }

                return clearCacheDB;
            }()
        }, {
            key: 'displayQuota',
            value: function () {
                var _ref65 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee58(tr) {
                    return regeneratorRuntime.wrap(function _callee58$(_context59) {
                        while (1) {
                            switch (_context59.prev = _context59.next) {
                                case 0:
                                    return _context59.abrupt('return', new Promise(function (resolve) {
                                        var temporaryStorage = window.navigator.temporaryStorage || window.navigator.webkitTemporaryStorage || window.navigator.mozTemporaryStorage || window.navigator.msTemporaryStorage;
                                        if (!temporaryStorage) return resolve(tr.innerHTML = '<td colspan="3">\u8FD9\u4E2A\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u7F13\u5B58\u5462~\u5173\u6389\u6807\u7B7E\u9875\u540E\uFF0C\u7F13\u5B58\u9A6C\u4E0A\u5C31\u4F1A\u6D88\u5931\u54E6</td>');
                                        temporaryStorage.queryUsageAndQuota(function (usage, quota) {
                                            return resolve(tr.innerHTML = '<td colspan="3">\u7F13\u5B58\u5DF2\u7528\u7A7A\u95F4\uFF1A' + Math.round(usage / 1048576) + 'MB / ' + Math.round(quota / 1048576) + 'MB \u4E5F\u5305\u62EC\u4E86B\u7AD9\u672C\u6765\u7684\u7F13\u5B58</td>');
                                        });
                                    }));

                                case 1:
                                case 'end':
                                    return _context59.stop();
                            }
                        }
                    }, _callee58, this);
                }));

                function displayQuota(_x66) {
                    return _ref65.apply(this, arguments);
                }

                return displayQuota;
            }()

            // Menu Append

        }, {
            key: 'menuAppend',
            value: function menuAppend(playerWin, _ref66) {
                var monkey = _ref66.monkey,
                    monkeyTitle = _ref66.monkeyTitle,
                    polyfill = _ref66.polyfill,
                    displayPolyfillDataDiv = _ref66.displayPolyfillDataDiv,
                    optionDiv = _ref66.optionDiv;

                var monkeyMenu = UI.genMonkeyMenu(playerWin, { monkey: monkey, monkeyTitle: monkeyTitle, optionDiv: optionDiv });
                var polyfillMenu = UI.genPolyfillMenu(playerWin, { polyfill: polyfill, displayPolyfillDataDiv: displayPolyfillDataDiv, optionDiv: optionDiv });
                var div = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0];
                var ul = playerWin.document.createElement('ul');
                ul.className = 'bilitwin';
                ul.style.borderBottom = '1px solid rgba(255,255,255,.12)';
                div.insertBefore(ul, div.children[0]);
                ul.appendChild(monkeyMenu);
                ul.appendChild(polyfillMenu);
            }
        }, {
            key: 'genMonkeyMenu',
            value: function genMonkeyMenu(playerWin, _ref67) {
                var _this39 = this;

                var monkey = _ref67.monkey,
                    monkeyTitle = _ref67.monkeyTitle,
                    optionDiv = _ref67.optionDiv;

                var li = playerWin.document.createElement('li');
                li.className = 'context-menu-menu bilitwin';
                li.innerHTML = '\n            <a class="context-menu-a">\n                BiliMonkey\n                <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n            </a>\n            <ul>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u4E0B\u8F7DFLV\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u4E0B\u8F7DMP4\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u4E0B\u8F7DASS\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u8F7D\u5165\u7F13\u5B58FLV\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u5F3A\u5236\u5237\u65B0\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u91CD\u542F\u811A\u672C\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u9500\u6BC1\u64AD\u653E\u5668\n                    </a>\n                </li>\n            </ul>\n            ';
                li.onclick = function () {
                    return playerWin.document.getElementById('bilibiliPlayer').click();
                };
                var ul = li.children[1];
                ul.children[0].onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee59() {
                    return regeneratorRuntime.wrap(function _callee59$(_context60) {
                        while (1) {
                            switch (_context60.prev = _context60.next) {
                                case 0:
                                    if (!monkeyTitle.flvA.onmouseover) {
                                        _context60.next = 3;
                                        break;
                                    }

                                    _context60.next = 3;
                                    return monkeyTitle.flvA.onmouseover();

                                case 3:
                                    monkeyTitle.flvA.click();
                                case 4:
                                case 'end':
                                    return _context60.stop();
                            }
                        }
                    }, _callee59, _this39);
                }));
                ul.children[1].onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee60() {
                    return regeneratorRuntime.wrap(function _callee60$(_context61) {
                        while (1) {
                            switch (_context61.prev = _context61.next) {
                                case 0:
                                    if (!monkeyTitle.mp4A.onmouseover) {
                                        _context61.next = 3;
                                        break;
                                    }

                                    _context61.next = 3;
                                    return monkeyTitle.mp4A.onmouseover();

                                case 3:
                                    monkeyTitle.mp4A.click();
                                case 4:
                                case 'end':
                                    return _context61.stop();
                            }
                        }
                    }, _callee60, _this39);
                }));
                ul.children[2].onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee61() {
                    return regeneratorRuntime.wrap(function _callee61$(_context62) {
                        while (1) {
                            switch (_context62.prev = _context62.next) {
                                case 0:
                                    if (!monkeyTitle.assA.onmouseover) {
                                        _context62.next = 3;
                                        break;
                                    }

                                    _context62.next = 3;
                                    return monkeyTitle.assA.onmouseover();

                                case 3:
                                    monkeyTitle.assA.click();
                                case 4:
                                case 'end':
                                    return _context62.stop();
                            }
                        }
                    }, _callee61, _this39);
                }));
                ul.children[3].onclick = function () {
                    optionDiv.style.display = 'block';
                };
                ul.children[4].onclick = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee62() {
                    return regeneratorRuntime.wrap(function _callee62$(_context63) {
                        while (1) {
                            switch (_context63.prev = _context63.next) {
                                case 0:
                                    monkey.proxy = true;
                                    monkey.flvs = null;
                                    UI.hintInfo('请稍候，可能需要10秒时间……', playerWin);
                                    // Yes, I AM lazy.
                                    playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="80"]').click();
                                    _context63.next = 6;
                                    return new Promise(function (r) {
                                        return playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', r);
                                    });

                                case 6:
                                    return _context63.abrupt('return', monkey.queryInfo('flv'));

                                case 7:
                                case 'end':
                                    return _context63.stop();
                            }
                        }
                    }, _callee62, _this39);
                }));
                ul.children[5].onclick = function () {
                    top.location.reload(true);
                };
                ul.children[6].onclick = function () {
                    playerWin.dispatchEvent(new Event('unload'));
                };
                ul.children[7].onclick = function () {
                    playerWin.player && playerWin.player.destroy();
                };
                return li;
            }
        }, {
            key: 'genPolyfillMenu',
            value: function genPolyfillMenu(playerWin, _ref72) {
                var polyfill = _ref72.polyfill,
                    displayPolyfillDataDiv = _ref72.displayPolyfillDataDiv,
                    optionDiv = _ref72.optionDiv;

                var li = playerWin.document.createElement('li');
                li.className = 'context-menu-menu bilitwin';
                li.innerHTML = '\n            <a class="context-menu-a">\n                BiliPolyfill\n                <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n            </a>\n            <ul>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u83B7\u53D6\u5C01\u9762\n                    </a>\n                </li>\n                <li class="context-menu-menu">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u66F4\u591A\u64AD\u653E\u901F\u5EA6\n                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n                    </a>\n                    <ul>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> 0.1\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> 3\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u70B9\u51FB\u786E\u8BA4\n                                <input type="text" style="width: 35px; height: 70%">\n                            </a>\n                        </li>\n                    </ul>\n                </li>\n                <li class="context-menu-menu">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u7247\u5934\u7247\u5C3E\n                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n                    </a>\n                    <ul>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u6807\u8BB0\u7247\u5934:<span></span>\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u6807\u8BB0\u7247\u5C3E:<span></span>\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u53D6\u6D88\u6807\u8BB0\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u68C0\u89C6\u6570\u636E\n                            </a>\n                        </li>\n                    </ul>\n                </li>\n                <li class="context-menu-menu">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u627E\u4E0A\u4E0B\u96C6\n                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n                    </a>\n                    <ul>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> <span></span>\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> <span></span>\n                            </a>\n                        </li>\n                    </ul>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u5C0F\u7A97\u64AD\u653E\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u7ACB\u5373\u4FDD\u5B58\u6570\u636E\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u5F3A\u5236\u6E05\u7A7A\u6570\u636E\n                    </a>\n                </li>\n            </ul>\n            ';
                li.onclick = function () {
                    return playerWin.document.getElementById('bilibiliPlayer').click();
                };
                if (!polyfill.option.betabeta) li.children[0].childNodes[0].textContent += '(到设置开启)';
                var ul = li.children[1];
                ul.children[0].onclick = function () {
                    top.window.open(polyfill.getCoverImage(), '_blank');
                };

                ul.children[1].children[1].children[0].onclick = function () {
                    polyfill.setVideoSpeed(0.1);
                };
                ul.children[1].children[1].children[1].onclick = function () {
                    polyfill.setVideoSpeed(3);
                };
                ul.children[1].children[1].children[2].onclick = function (e) {
                    polyfill.setVideoSpeed(e.target.getElementsByTagName('input')[0].value);
                };
                ul.children[1].children[1].children[2].getElementsByTagName('input')[0].onclick = function (e) {
                    return e.stopPropagation();
                };

                ul.children[2].children[1].children[0].onclick = function () {
                    polyfill.markOPPosition();
                };
                ul.children[2].children[1].children[1].onclick = function () {
                    polyfill.markEDPostion(3);
                };
                ul.children[2].children[1].children[2].onclick = function () {
                    polyfill.clearOPEDPosition();
                };
                ul.children[2].children[1].children[3].onclick = function () {
                    displayPolyfillDataDiv(polyfill);
                };

                ul.children[3].children[1].children[0].getElementsByTagName('a')[0].style.width = 'initial';
                ul.children[3].children[1].children[1].getElementsByTagName('a')[0].style.width = 'initial';

                ul.children[4].onclick = function () {
                    BiliPolyfill.openMinimizedPlayer();
                };
                ul.children[5].onclick = function () {
                    optionDiv.style.display = 'block';
                };
                ul.children[6].onclick = function () {
                    polyfill.saveUserdata();
                };
                ul.children[7].onclick = function () {
                    BiliPolyfill.clearAllUserdata(playerWin);
                    polyfill.retrieveUserdata();
                };

                li.onmouseenter = function () {
                    var ul = li.children[1];
                    ul.children[1].children[1].children[2].getElementsByTagName('input')[0].value = polyfill.video.playbackRate;

                    var oped = polyfill.userdata.oped[polyfill.getCollectionId()] || [];
                    ul.children[2].children[1].children[0].getElementsByTagName('span')[1].textContent = oped[0] ? BiliPolyfill.secondToReadable(oped[0]) : '无';
                    ul.children[2].children[1].children[1].getElementsByTagName('span')[1].textContent = oped[1] ? BiliPolyfill.secondToReadable(oped[1]) : '无';

                    ul.children[3].children[1].children[0].onclick = function () {
                        if (polyfill.series[0]) top.window.open('https://www.bilibili.com/video/av' + polyfill.series[0].aid, '_blank');
                    };
                    ul.children[3].children[1].children[1].onclick = function () {
                        if (polyfill.series[1]) top.window.open('https://www.bilibili.com/video/av' + polyfill.series[1].aid, '_blank');
                    };
                    ul.children[3].children[1].children[0].getElementsByTagName('span')[1].textContent = polyfill.series[0] ? polyfill.series[0].title : '找不到';
                    ul.children[3].children[1].children[1].getElementsByTagName('span')[1].textContent = polyfill.series[1] ? polyfill.series[1].title : '找不到';
                };
                return li;
            }
        }, {
            key: 'genOptionDiv',
            value: function genOptionDiv(option) {
                var div = UI.genDiv();

                div.appendChild(UI.genMonkeyOptionTable(option));
                div.appendChild(UI.genPolyfillOptionTable(option));
                var table = document.createElement('table');
                table.style = 'width: 100%; line-height: 2em;';
                table.insertRow(-1).innerHTML = '<td>设置自动保存，刷新后生效。</td>';
                table.insertRow(-1).innerHTML = '<td>视频下载组件的缓存功能只在Windows+Chrome测试过，如果出现问题，请关闭缓存。</td>';
                table.insertRow(-1).innerHTML = '<td>功能增强组件尽量保证了兼容性。但如果有同功能脚本/插件，请关闭本插件的对应功能。</td>';
                table.insertRow(-1).innerHTML = '<td>这个脚本乃“按原样”提供，不附带任何明示，暗示或法定的保证，包括但不限于其没有缺陷，适合特定目的或非侵权。</td>';
                table.insertRow(-1).innerHTML = '<td><a href="https://greasyfork.org/zh-CN/scripts/27819" target="_blank">更新/讨论</a> <a href="https://github.com/liqi0816/bilitwin/" target="_blank">GitHub</a> Author: qli5. Copyright: qli5, 2014+, 田生, grepmusic</td>';
                div.appendChild(table);

                var buttons = [];
                for (var i = 0; i < 3; i++) {
                    buttons.push(document.createElement('button'));
                } buttons.forEach(function (btn) {
                    return btn.style.padding = '0.5em';
                });
                buttons.forEach(function (btn) {
                    return btn.style.margin = '0.2em';
                });
                buttons[0].textContent = '保存并关闭';
                buttons[0].onclick = function () {
                    div.style.display = 'none';;
                };
                buttons[1].textContent = '保存并刷新';
                buttons[1].onclick = function () {
                    top.location.reload();
                };
                buttons[2].textContent = '重置并刷新';
                buttons[2].onclick = function () {
                    UI.saveOption({ setStorage: option.setStorage });
                    top.location.reload();
                };
                buttons.forEach(function (btn) {
                    return div.appendChild(btn);
                });

                return div;
            }
        }, {
            key: 'genMonkeyOptionTable',
            value: function genMonkeyOptionTable() {
                var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                var description = [['autoDefault', '尝试自动抓取：不会拖慢页面，抓取默认清晰度，但可能抓不到。'], ['autoFLV', '强制自动抓取FLV：会拖慢页面，如果默认清晰度也是超清会更慢，但保证抓到。'], ['autoMP4', '强制自动抓取MP4：会拖慢页面，如果默认清晰度也是高清会更慢，但保证抓到。'], ['cache', '关标签页不清缓存：保留完全下载好的分段到缓存，忘记另存为也没关系。'], ['partial', '断点续传：点击“取消”保留部分下载的分段到缓存，忘记点击会弹窗确认。'], ['proxy', '用缓存加速播放器：如果缓存里有完全下载好的分段，直接喂给网页播放器，不重新访问网络。小水管利器，播放只需500k流量。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。'], ['blocker', '弹幕过滤：在网页播放器里设置的屏蔽词也对下载的弹幕生效。']];

                var table = document.createElement('table');
                table.style.width = '100%';
                table.style.lineHeight = '2em';

                table.insertRow(-1).innerHTML = '<td style="text-align:center">BiliMonkey（视频抓取组件）</td>';
                table.insertRow(-1).innerHTML = '<td style="text-align:center">因为作者偷懒了，缓存的三个选项最好要么全开，要么全关。最好。</td>';
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    var _loop7 = function _loop7() {
                        var d = _step9.value;

                        var checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.checked = option[d[0]];
                        checkbox.onchange = function () {
                            option[d[0]] = checkbox.checked; UI.saveOption(option);
                        };
                        var td = table.insertRow(-1).insertCell(0);
                        td.appendChild(checkbox);
                        td.appendChild(document.createTextNode(d[1]));
                    };

                    for (var _iterator9 = description[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        _loop7();
                    }
                } catch (err) {
                    _didIteratorError9 = true;
                    _iteratorError9 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }
                    } finally {
                        if (_didIteratorError9) {
                            throw _iteratorError9;
                        }
                    }
                }

                return table;
            }
        }, {
            key: 'genPolyfillOptionTable',
            value: function genPolyfillOptionTable() {
                var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                var description = [['betabeta', '增强组件总开关 <---------更加懒得测试了，反正以后B站也会自己提供这些功能。也许吧。'], //betabeta
                ['badgeWatchLater', '稍后再看添加数字角标'], ['dblclick', '双击全屏'], ['scroll', '自动滚动到播放器'], ['recommend', '弹幕列表换成相关视频'], ['electric', '整合充电榜与换P倒计时'],
                //['electricSkippable', '跳过充电榜'],
                ['lift', '自动防挡字幕'], ['autoResume', '自动跳转上次看到'], ['autoPlay', '自动播放'], ['autoWideScreen', '自动宽屏'], ['autoFullScreen', '自动全屏'], ['oped', '标记后自动跳OP/ED'], ['focus', '自动聚焦到播放器'], ['menuFocus', '关闭菜单后聚焦到播放器'], ['limitedKeydown', '首次回车键可全屏自动播放'], ['series', '尝试自动找上下集'], ['speech', '(测)(需墙外)任意三击鼠标左键开启语音识别']];

                var table = document.createElement('table');
                table.style.width = '100%';
                table.style.lineHeight = '2em';

                table.insertRow(-1).innerHTML = '<td style="text-align:center">BiliPolyfill（功能增强组件）</td>';
                table.insertRow(-1).innerHTML = '<td style="text-align:center">懒鬼作者还在测试的时候，B站已经上线了原生的稍后再看(๑•̀ㅂ•́)و✧</td>';
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    var _loop8 = function _loop8() {
                        var d = _step10.value;

                        var checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.checked = option[d[0]];
                        checkbox.onchange = function () {
                            option[d[0]] = checkbox.checked; UI.saveOption(option);
                        };
                        var td = table.insertRow(-1).insertCell(0);
                        td.appendChild(checkbox);
                        td.appendChild(document.createTextNode(d[1]));
                    };

                    for (var _iterator10 = description[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        _loop8();
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }

                return table;
            }
        }, {
            key: 'displayPolyfillDataDiv',
            value: function displayPolyfillDataDiv(polyfill) {
                var div = UI.genDiv();
                var p = document.createElement('p');
                p.textContent = '这里是脚本储存的数据。所有数据都只存在浏览器里，别人不知道，B站也不知道，脚本作者更不知道(这个家伙连服务器都租不起 摔';
                p.style.margin = '0.3em';
                div.appendChild(p);

                var textareas = [];
                for (var i = 0; i < 2; i++) {
                    textareas.push(document.createElement('textarea'));
                } textareas.forEach(function (ta) {
                    return ta.style = 'resize:vertical; width: 100%; height: 200px';
                });

                p = document.createElement('p');
                p.textContent = 'B站已上线原生的稍后观看功能。';
                p.style.margin = '0.3em';
                div.appendChild(p);
                //textareas[0].textContent = JSON.stringify(polyfill.userdata.watchLater).replace(/\[/, '[\n').replace(/\]/, '\n]').replace(/,/g, ',\n');
                //div.appendChild(textareas[0]);

                p = document.createElement('p');
                p.textContent = '这里是片头片尾。格式是，av号或番剧号:[片头,片尾]。null代表没有片头。';
                p.style.margin = '0.3em';
                div.appendChild(p);
                textareas[1].textContent = JSON.stringify(polyfill.userdata.oped).replace(/{/, '{\n').replace(/}/, '\n}').replace(/],/g, '],\n');
                div.appendChild(textareas[1]);

                p = document.createElement('p');
                p.textContent = '当然可以直接清空啦。只删除其中的一些行的话，一定要记得删掉多余的逗号。';
                p.style.margin = '0.3em';
                div.appendChild(p);

                var buttons = [];
                for (var _i3 = 0; _i3 < 3; _i3++) {
                    buttons.push(document.createElement('button'));
                } buttons.forEach(function (btn) {
                    return btn.style.padding = '0.5em';
                });
                buttons.forEach(function (btn) {
                    return btn.style.margin = '0.2em';
                });
                buttons[0].textContent = '关闭';
                buttons[0].onclick = function () {
                    div.remove();
                };
                buttons[1].textContent = '验证格式';
                buttons[1].onclick = function () {
                    if (!textareas[0].value) textareas[0].value = '{\n\n}';
                    textareas[0].value = textareas[0].value.replace(/,(\s|\n)*}/, '\n}').replace(/,(\s|\n),/g, ',\n');
                    if (!textareas[1].value) textareas[1].value = '{\n\n}';
                    textareas[1].value = textareas[1].value.replace(/,(\s|\n)*}/, '\n}').replace(/,(\s|\n),/g, ',\n').replace(/,(\s|\n)*]/g, ']');
                    var userdata = {};
                    try {
                        //userdata.watchLater = JSON.parse(textareas[0].value);
                    } catch (e) {
                        alert('稍后观看列表: ' + e); throw e;
                    }
                    try {
                        userdata.oped = JSON.parse(textareas[1].value);
                    } catch (e) {
                        alert('片头片尾: ' + e); throw e;
                    }
                    buttons[1].textContent = '格式没有问题！';
                    return userdata;
                };
                buttons[2].textContent = '尝试保存';
                buttons[2].onclick = function () {
                    polyfill.userdata = buttons[1].onclick();
                    polyfill.saveUserdata();
                    buttons[2].textContent = '保存成功';
                };
                buttons.forEach(function (btn) {
                    return div.appendChild(btn);
                });

                document.body.appendChild(div);
                div.style.display = 'block';
            }

            // Common

        }, {
            key: 'genDiv',
            value: function genDiv() {
                var div = document.createElement('div');
                div.style.position = 'fixed';
                div.style.zIndex = '10036';
                div.style.top = '50%';
                div.style.marginTop = '-200px';
                div.style.left = '50%';
                div.style.marginLeft = '-320px';
                div.style.width = '540px';
                div.style.maxHeight = '400px';
                div.style.overflowY = 'auto';
                div.style.padding = '30px 50px';
                div.style.backgroundColor = 'white';
                div.style.borderRadius = '6px';
                div.style.boxShadow = 'rgba(0, 0, 0, 0.6) 1px 1px 40px 0px';
                div.style.display = 'none';
                div.className = 'bilitwin';
                return div;
            }
        }, {
            key: 'requestH5Player',
            value: function requestH5Player() {
                var h = document.querySelector('div.tminfo');
                h.insertBefore(document.createTextNode('[[脚本需要HTML5播放器(弹幕列表右上角三个点的按钮切换)]] '), h.firstChild);
            }
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
        }, {
            key: 'exportIDM',
            value: function exportIDM(url, referrer) {
                return url.map(function (e) {
                    return '<\r\n' + e + '\r\nreferer: ' + referrer + '\r\n>\r\n';
                }).join('');
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
                var infoDiv = playerWin.document.createElement('div');
                infoDiv.className = 'bilibili-player-video-toast-bottom';
                infoDiv.innerHTML = '\n        <div class="bilibili-player-video-toast-item">\n            <div class="bilibili-player-video-toast-item-text">\n                <span>' + text + '</span>\n            </div>\n        </div>\n        ';
                playerWin.document.getElementsByClassName('bilibili-player-video-toast-wrp')[0].appendChild(infoDiv);
                setTimeout(function () {
                    return infoDiv.remove();
                }, 3000);
            }
        }, {
            key: 'getOption',
            value: function getOption(playerWin) {
                var rawOption = null;
                try {
                    rawOption = JSON.parse(playerWin.localStorage.getItem('BiliTwin'));
                } catch (e) { } finally {
                    if (!rawOption) rawOption = {};
                    rawOption.setStorage = function (n, i) {
                        return playerWin.localStorage.setItem(n, i);
                    };
                    rawOption.getStorage = function (n) {
                        return playerWin.localStorage.getItem(n);
                    };
                    var defaultOption = {
                        autoDefault: true,
                        autoFLV: false,
                        autoMP4: false,
                        cache: true,
                        partial: true,
                        proxy: true,
                        blocker: true,
                        badgeWatchLater: true,
                        dblclick: true,
                        scroll: true,
                        recommend: true,
                        electric: true,
                        electricSkippable: false,
                        lift: true,
                        autoResume: true,
                        autoPlay: false,
                        autoWideScreen: false,
                        autoFullScreen: false,
                        oped: true,
                        focus: true,
                        menuFocus: true,
                        limitedKeydown: true,
                        speech: false,
                        series: true,
                        betabeta: false
                    };
                    return Object.assign({}, defaultOption, rawOption, debugOption);
                }
            }
        }, {
            key: 'saveOption',
            value: function saveOption(option) {
                return option.setStorage('BiliTwin', JSON.stringify(option));
            }
        }, {
            key: 'outdatedEngineClearance',
            value: function outdatedEngineClearance() {
                if (!Promise || !MutationObserver) {
                    alert('这个浏览器实在太老了，脚本决定罢工。');
                    throw 'BiliTwin: browser outdated: Promise or MutationObserver unsupported';
                }
            }
        }, {
            key: 'firefoxClearance',
            value: function firefoxClearance() {
                if (navigator.userAgent.includes('Firefox')) {
                    debugOption.proxy = false;
                    if (!window.navigator.temporaryStorage && !window.navigator.mozTemporaryStorage) window.navigator.temporaryStorage = {
                        queryUsageAndQuota: function queryUsageAndQuota(func) {
                            return func(-1048576, 10484711424);
                        }
                    };
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
        }, {
            key: 'styleClearance',
            value: function styleClearance() {
                var ret = '\n        .bilibili-player-context-menu-container.black ul.bilitwin li.context-menu-function > a:hover {\n            background: rgba(255,255,255,.12);\n            transition: all .3s ease-in-out;\n            cursor: pointer;\n        }\n        ';
                if (!top.location.href.includes('www.bilibili.com/video/av')) ret += '\n        .bilitwin a {\n            cursor: pointer;\n            color: #00a1d6;\n        }\n\n        .bilitwin a:hover {\n            color: #f25d8e;\n        }\n\n        .bilitwin button {\n            color: #fff;\n            cursor: pointer;\n            text-align: center;\n            border-radius: 4px;\n            background-color: #00a1d6;\n            vertical-align: middle;\n            border: 1px solid #00a1d6;\n            transition: .1s;\n            transition-property: background-color,border,color;\n            user-select: none;\n        }\n\n        .bilitwin button:hover {\n            background-color: #00b5e5;\n            border-color: #00b5e5;\n        }\n\n        .bilitwin progress {\n            -webkit-appearance: progress;\n        }\n        ';
                var style = document.createElement('style');
                style.type = 'text/css';
                style.rel = 'stylesheet';
                style.textContent = ret;
                document.head.appendChild(style);
            }
        }, {
            key: 'cleanUp',
            value: function cleanUp() {
                Array.from(document.getElementsByClassName('bilitwin')).filter(function (e) {
                    return e.textContent.includes('FLV分段');
                }).forEach(function (e) {
                    return Array.from(e.getElementsByTagName('a')).forEach(function (e) {
                        return e.textContent == '取消' && e.click();
                    });
                });
                Array.from(document.getElementsByClassName('bilitwin')).forEach(function (e) {
                    return e.remove();
                });
            }
        }, {
            key: 'start',
            value: function () {
                var _ref73 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee65() {
                    var _this40 = this;

                    var cidRefresh, href, playerWin, option, optionDiv, monkeyTitle, displayPolyfillDataDiv, _ref74, _ref75, monkey, polyfill, h, _ref78;

                    return regeneratorRuntime.wrap(function _callee65$(_context66) {
                        while (1) {
                            switch (_context66.prev = _context66.next) {
                                case 0:
                                    cidRefresh = new AsyncContainer();
                                    href = location.href;

                                    // 1. playerWin and option

                                    playerWin = void 0;
                                    _context66.prev = 3;
                                    _context66.next = 6;
                                    return UI.getPlayerWin();

                                case 6:
                                    playerWin = _context66.sent;
                                    _context66.next = 13;
                                    break;

                                case 9:
                                    _context66.prev = 9;
                                    _context66.t0 = _context66['catch'](3);

                                    if (_context66.t0 == 'Need H5 Player') UI.requestH5Player();
                                    throw _context66.t0;

                                case 13:
                                    option = UI.getOption(playerWin);
                                    optionDiv = UI.genOptionDiv(option);

                                    document.body.appendChild(optionDiv);

                                    // 2. monkey and polyfill
                                    monkeyTitle = void 0;

                                    displayPolyfillDataDiv = function displayPolyfillDataDiv(polyfill) {
                                        return UI.displayPolyfillDataDiv(polyfill);
                                    };

                                    _context66.next = 20;
                                    return Promise.all([_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee63() {
                                        var monkey;
                                        return regeneratorRuntime.wrap(function _callee63$(_context64) {
                                            while (1) {
                                                switch (_context64.prev = _context64.next) {
                                                    case 0:
                                                        monkey = new BiliMonkey(playerWin, option);
                                                        _context64.next = 3;
                                                        return monkey.execOptions();

                                                    case 3:
                                                        monkeyTitle = UI.titleAppend(monkey);
                                                        return _context64.abrupt('return', monkey);

                                                    case 5:
                                                    case 'end':
                                                        return _context64.stop();
                                                }
                                            }
                                        }, _callee63, _this40);
                                    }))(), _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee64() {
                                        var polyfill;
                                        return regeneratorRuntime.wrap(function _callee64$(_context65) {
                                            while (1) {
                                                switch (_context65.prev = _context65.next) {
                                                    case 0:
                                                        polyfill = new BiliPolyfill(playerWin, option, function (t) {
                                                            return UI.hintInfo(t, playerWin);
                                                        });
                                                        _context65.next = 3;
                                                        return polyfill.setFunctions();

                                                    case 3:
                                                        return _context65.abrupt('return', polyfill);

                                                    case 4:
                                                    case 'end':
                                                        return _context65.stop();
                                                }
                                            }
                                        }, _callee64, _this40);
                                    }))()]);

                                case 20:
                                    _ref74 = _context66.sent;
                                    _ref75 = _slicedToArray(_ref74, 2);
                                    monkey = _ref75[0];
                                    polyfill = _ref75[1];

                                    if (!(href != location.href)) {
                                        _context66.next = 26;
                                        break;
                                    }

                                    return _context66.abrupt('return', UI.cleanUp());

                                case 26:

                                    // 3. menu
                                    UI.menuAppend(playerWin, { monkey: monkey, monkeyTitle: monkeyTitle, polyfill: polyfill, displayPolyfillDataDiv: displayPolyfillDataDiv, optionDiv: optionDiv });

                                    // 4. refresh

                                    h = function h() {
                                        var video = playerWin.document.getElementsByTagName('video')[0];
                                        if (video) video.addEventListener('emptied', h); else setTimeout(function () {
                                            return cidRefresh.resolve();
                                        }, 0);
                                    };

                                    playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
                                    playerWin.addEventListener('unload', function () {
                                        return setTimeout(function () {
                                            return cidRefresh.resolve();
                                        }, 0);
                                    });

                                    // 5. debug
                                    if (debugOption.debug && top.console) top.console.clear();
                                    if (debugOption.debug) {
                                        ;

                                        _ref78 = [monkey, polyfill];
                                        (top.unsafeWindow || top).m = _ref78[0];
                                        (top.unsafeWindow || top).p = _ref78[1];
                                    } _context66.next = 34;
                                    return cidRefresh;

                                case 34:
                                    UI.cleanUp();

                                case 35:
                                case 'end':
                                    return _context66.stop();
                            }
                        }
                    }, _callee65, this, [[3, 9]]);
                }));

                function start() {
                    return _ref73.apply(this, arguments);
                }

                return start;
            }()
        }, {
            key: 'init',
            value: function () {
                var _ref79 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee66() {
                    return regeneratorRuntime.wrap(function _callee66$(_context67) {
                        while (1) {
                            switch (_context67.prev = _context67.next) {
                                case 0:
                                    if (document.body) {
                                        _context67.next = 2;
                                        break;
                                    }

                                    return _context67.abrupt('return');

                                case 2:
                                    UI.outdatedEngineClearance();
                                    UI.firefoxClearance();
                                    UI.styleClearance();

                                case 5:
                                    if (!1) {
                                        _context67.next = 10;
                                        break;
                                    }

                                    _context67.next = 8;
                                    return UI.start();

                                case 8:
                                    _context67.next = 5;
                                    break;

                                case 10:
                                case 'end':
                                    return _context67.stop();
                            }
                        }
                    }, _callee66, this);
                }));

                function init() {
                    return _ref79.apply(this, arguments);
                }

                return init;
            }()
        }]);

        return UI;
    }(BiliUserJS);

    UI.init();
});