// ==UserScript==
// @name        (Babel)bilibili merged flv+mp4+ass+enhance
// @namespace   http://qli5.tk/
// @homepageURL https://github.com/liqi0816/bilitwin/
// @description (国产浏览器专用)bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,播放体验增强,HTTPS,原生appsecret,不借助其他网站
// @match       *://www.bilibili.com/video/av*
// @match       *://bangumi.bilibili.com/anime/*/play*
// @match       *://www.bilibili.com/watchlater/
// @version     1.5
// @author      qli5
// @copyright   qli5, 2014+, 田生, grepmusic
// @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
// @grant       none
// ==/UserScript==

new Promise(function (resolve) {
    var req = new XMLHttpRequest();
    req.onload = function () { resolve(req.responseText); };
    req.open('get', 'https://cdn.bootcss.com/babel-polyfill/6.23.0/polyfill.min.js');
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
    // @description bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,播放体验增强,HTTPS,原生appsecret,不借助其他网站
    // @match       *://www.bilibili.com/video/av*
    // @match       *://bangumi.bilibili.com/anime/*/play*
    // @match       *://www.bilibili.com/watchlater/
    // @version     1.5
    // @author      qli5
    // @copyright   qli5, 2014+, 田生, grepmusic
    // @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
    // @grant       none
    // ==/UserScript==

    top.debugOption = {
        // console会清空，生成 window.m 和 window.p
        //debug: 1,

        // 别拖啦~
        //betabeta: 1,

        // UP主不容易，B站也不容易，充电是有益的尝试，我不鼓励跳。
        //electricSkippable: 0,
    };

    /**
     * BiliTwin consist of two parts - BiliMonkey and BiliPolyfill. 
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
     * This script is licensed under Mozilla Public License 2.0
     * https://www.mozilla.org/MPL/2.0/
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
     * The ASS convert utility is a wrapper of
     * https://tiansh.github.io/us-danmaku/bilibili/
     * by tiansh
     * (This script is loaded dynamically so that updates can be applied 
     * instantly. If github gets blocked from your region, please give 
     * BiliMonkey::loadASSScript a new default src.)
     * （如果github被墙了，Ctrl+F搜索loadASSScript，给它一个新的网址。）
     * 
     * This script is licensed under Mozilla Public License 2.0
     * https://www.mozilla.org/MPL/2.0/
     */

    /**
     * BiliPolyfill
     * A bilibili user script
     * by qli5 goodlq11[at](gmail|163).com
     * 
     * This script is licensed under Mozilla Public License 2.0
     * https://www.mozilla.org/MPL/2.0/
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
                if (littleEndian) throw 'littleEndian int24 not supported';
                var msb = this.getUint8(byteOffset);
                return msb << 16 | this.getUint16(byteOffset + 1);
            }
        }, {
            key: 'setUint24',
            value: function setUint24(byteOffset, value, littleEndian) {
                if (littleEndian) throw 'littleEndian int24 not supported';
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
        function FLVTag(dataView, currentOffset) {
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
                var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(blobs) {
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
                                    _loop = regeneratorRuntime.mark(function _loop() {
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

                function mergeBlobs(_x3) {
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
                var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
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
                var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(item) {
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

                function addData(_x8) {
                    return _ref5.apply(this, arguments);
                }

                return addData;
            }()
        }, {
            key: 'putData',
            value: function () {
                var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(item) {
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

                function putData(_x11) {
                    return _ref6.apply(this, arguments);
                }

                return putData;
            }()
        }, {
            key: 'getData',
            value: function () {
                var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(index) {
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

                function getData(_x14) {
                    return _ref7.apply(this, arguments);
                }

                return getData;
            }()
        }, {
            key: 'deleteData',
            value: function () {
                var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(index) {
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

                function deleteData(_x15) {
                    return _ref8.apply(this, arguments);
                }

                return deleteData;
            }()
        }, {
            key: 'deleteEntireDB',
            value: function () {
                var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
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

            var _this9 = this;

            var onabort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : init.onabort;
            var onerror = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : init.onerror;

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
                var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
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
                var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
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
                var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
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
                var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
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
                var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(asyncFunc) {
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

                function lockAndAwait(_x24) {
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
                m.lockAndAwait(_asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
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
                m.lockAndAwait(_asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
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
                m.lockAndAwait(_asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
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
                m.lockAndAwait(_asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
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
                    var _ref20 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17() {
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
            this.assAsyncScript = BiliMonkey.loadASSScript();
            this.queryInfoMutex = new Mutex();
            this.queryInfoMutex.lockAndAwait(function () {
                return _this13.getPlayer();
            });
            this.queryInfoMutex.lockAndAwait(function () {
                if (_this13.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul').children.length == 4) _this13.queryInfo = _this13.queryInfoSixteen;
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
                    case 'flv':
                        // Single writer is not a must.
                        // Plus, if one writer failed, others should be able to overwrite its garbage.
                        //if (this.flvs) return this.flvs; 
                        return this.flvs = new AsyncContainer();
                    case 'hdmp4':
                        //if (this.mp4) return this.mp4;
                        return this.mp4 = new AsyncContainer();
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
                if (shouldBe && shouldBe != res.format) throw 'URL interface error: response is not ' + shouldBe;
                switch (res.format) {
                    case 'flv':
                        return this.flvs = this.flvs.resolve(res.durl.map(function (e) {
                            return e.url.replace('http:', _this14.protocol);
                        }));
                    case 'hdmp4':
                        return this.mp4 = this.mp4.resolve(res.durl[0].url.replace('http:', this.protocol));
                    case 'mp4':
                        return this.mp4 = this.mp4.resolve(res.durl[0].url.replace('http:', this.protocol));
                    default:
                        throw 'resolveFormat error: ' + res.format + ' is a unrecognizable format';
                }
            }
        }, {
            key: 'execOptions',
            value: function () {
                var _ref21 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18() {
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
                    return _ref21.apply(this, arguments);
                }

                return execOptions;
            }()
        }, {
            key: 'sniffDefaultFormat',
            value: function () {
                var _ref22 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19() {
                    var _this15 = this;

                    var jq, _ajax, defquality;

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
                                    if (!this.playerWin.document.querySelector('div.bilibili-player-video-btn.bilibili-player-video-btn-quality > div > ul > li:nth-child(2)')) {
                                        _context20.next = 4;
                                        break;
                                    }

                                    return _context20.abrupt('return', this.defaultFormatPromise = Promise.resolve());

                                case 4:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    defquality = this.playerWin.localStorage && this.playerWin.localStorage.bilibili_player_settings ? JSON.parse(this.playerWin.localStorage.bilibili_player_settings).setting_config.defquality : undefined;


                                    this.defaultFormatPromise = new Promise(function (resolve) {
                                        var timeout = setTimeout(function () {
                                            jq.ajax = _ajax; resolve();
                                        }, 5000);
                                        var self = _this15;
                                        jq.ajax = function (a, c) {
                                            if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                            };
                                            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
                                                clearTimeout(timeout);
                                                var format = a.url.match(/quality=\d*/)[0].slice(8);
                                                format = format == 112 || format == 80 || format == 4 || format == 3 ? 'flv' : format == 2 || format == 48 ? 'hdmp4' : format == 1 || format == 16 ? 'mp4' : undefined;
                                                if (!format) {
                                                    console && console.error('lockFormat error: ' + a.url.match(/quality=\d*/)[0].slice(8) + ' is a unrecognizable format'); jq.ajax = _ajax; resolve(); return _ajax.call(jq, a, c);
                                                }
                                                self.lockFormat(format);
                                                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                                                var _success = a.success;
                                                a.success = function (res) {
                                                    if (self.proxy && res.format == 'flv') {
                                                        self.resolveFormat(res, format);
                                                        self.setupProxy(res, _success);
                                                    } else {
                                                        _success(res);
                                                        self.resolveFormat(res, format);
                                                    }
                                                    resolve(res);
                                                };
                                                jq.ajax = _ajax;
                                            }
                                            return _ajax.call(jq, a, c);
                                        };
                                    });
                                    return _context20.abrupt('return', this.defaultFormatPromise);

                                case 9:
                                case 'end':
                                    return _context20.stop();
                            }
                        }
                    }, _callee19, this);
                }));

                function sniffDefaultFormat() {
                    return _ref22.apply(this, arguments);
                }

                return sniffDefaultFormat;
            }()
        }, {
            key: 'getBackgroundFormat',
            value: function () {
                var _ref23 = _asyncToGenerator(regeneratorRuntime.mark(function _callee20(format) {
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
                                        if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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

                function getBackgroundFormat(_x26) {
                    return _ref23.apply(this, arguments);
                }

                return getBackgroundFormat;
            }()
        }, {
            key: 'getCurrentFormat',
            value: function () {
                var _ref24 = _asyncToGenerator(regeneratorRuntime.mark(function _callee21(format) {
                    var _this16 = this;

                    var jq, _ajax, buttonNumber, siblingFormat, trivialRes, pendingFormat, self, blockedRequest, siblingOK;

                    return regeneratorRuntime.wrap(function _callee21$(_context22) {
                        while (1) {
                            switch (_context22.prev = _context22.next) {
                                case 0:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    buttonNumber = format == 'flv' ? 1 : 2;
                                    siblingFormat = format == 'flv' ? 'hdmp4' : 'flv';
                                    trivialRes = { 'from': 'local', 'result': 'suee', 'format': 'hdmp4', 'timelength': 10, 'accept_format': 'flv,hdmp4,mp4', 'accept_quality': [3, 2, 1], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': 'https://static.hdslb.com/encoding.mp4', 'backup_url': ['https://static.hdslb.com/encoding.mp4'] }] };
                                    pendingFormat = this.lockFormat(format);
                                    self = this;
                                    _context22.next = 9;
                                    return new Promise(function (resolve) {
                                        jq.ajax = function (a, c) {
                                            if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                            };
                                            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
                                                // Send back a fake response to enable the change-format button.
                                                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                                                a.success(trivialRes);
                                                var h = function h(e) {
                                                    resolve([a, c]); e.target.removeEventListener(e.type, h);
                                                };
                                                self.playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
                                            } else {
                                                return _ajax.call(jq, a, c);
                                            }
                                        };
                                        _this16.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(' + (3 - buttonNumber) + ')').click();
                                    });

                                case 9:
                                    blockedRequest = _context22.sent;
                                    siblingOK = siblingFormat == 'hdmp4' ? this.mp4 : this.flvs;

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
                                        if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
                                    this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(' + buttonNumber + ')').click();

                                    return _context22.abrupt('return', pendingFormat);

                                case 15:
                                case 'end':
                                    return _context22.stop();
                            }
                        }
                    }, _callee21, this);
                }));

                function getCurrentFormat(_x27) {
                    return _ref24.apply(this, arguments);
                }

                return getCurrentFormat;
            }()
        }, {
            key: 'getNonCurrentFormat',
            value: function () {
                var _ref25 = _asyncToGenerator(regeneratorRuntime.mark(function _callee22(format) {
                    var jq, _ajax, buttonNumber, pendingFormat, self;

                    return regeneratorRuntime.wrap(function _callee22$(_context23) {
                        while (1) {
                            switch (_context23.prev = _context23.next) {
                                case 0:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    buttonNumber = format == 'flv' ? 1 : 2;
                                    pendingFormat = this.lockFormat(format);
                                    self = this;

                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                        };
                                        if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
                                    this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(' + buttonNumber + ')').click();
                                    return _context23.abrupt('return', pendingFormat);

                                case 8:
                                case 'end':
                                    return _context23.stop();
                            }
                        }
                    }, _callee22, this);
                }));

                function getNonCurrentFormat(_x28) {
                    return _ref25.apply(this, arguments);
                }

                return getNonCurrentFormat;
            }()
        }, {
            key: 'getCurrentFormatSixteen',
            value: function () {
                var _ref26 = _asyncToGenerator(regeneratorRuntime.mark(function _callee23(format) {
                    var _this17 = this;

                    var jq, _ajax, buttonNumber, siblingFormat, trivialRes, pendingFormat, self, blockedRequest, siblingOK;

                    return regeneratorRuntime.wrap(function _callee23$(_context24) {
                        while (1) {
                            switch (_context24.prev = _context24.next) {
                                case 0:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    buttonNumber = format == 'flv' ? 1 : 4;
                                    siblingFormat = format == 'flv' ? 'mp4' : 'flv';
                                    trivialRes = { 'from': 'local', 'result': 'suee', 'format': 'mp4', 'timelength': 10, 'accept_format': 'flv,flv720,flv480,mp4', 'accept_quality': [80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': 'https://static.hdslb.com/encoding.mp4', 'backup_url': ['https://static.hdslb.com/encoding.mp4'] }] };
                                    pendingFormat = this.lockFormat(format);
                                    self = this;
                                    _context24.next = 9;
                                    return new Promise(function (resolve) {
                                        jq.ajax = function (a, c) {
                                            if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                            };
                                            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
                                                // Send back a fake response to enable the change-format button.
                                                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                                                a.success(trivialRes);
                                                var h = function h(e) {
                                                    resolve([a, c]); e.target.removeEventListener(e.type, h);
                                                };
                                                self.playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
                                            } else {
                                                return _ajax.call(jq, a, c);
                                            }
                                        };
                                        _this17.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(' + (5 - buttonNumber) + ')').click();
                                    });

                                case 9:
                                    blockedRequest = _context24.sent;
                                    siblingOK = siblingFormat == 'mp4' ? this.mp4 : this.flvs;

                                    if (!siblingOK) {
                                        this.lockFormat(siblingFormat);
                                        blockedRequest[0].success = function (res) {
                                            return _this17.resolveFormat(res, siblingFormat);
                                        };
                                        _ajax.call.apply(_ajax, [jq].concat(_toConsumableArray(blockedRequest)));
                                    }

                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                        };
                                        if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
                                    this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(' + buttonNumber + ')').click();

                                    return _context24.abrupt('return', pendingFormat);

                                case 15:
                                case 'end':
                                    return _context24.stop();
                            }
                        }
                    }, _callee23, this);
                }));

                function getCurrentFormatSixteen(_x29) {
                    return _ref26.apply(this, arguments);
                }

                return getCurrentFormatSixteen;
            }()
        }, {
            key: 'getNonCurrentFormatSixteen',
            value: function () {
                var _ref27 = _asyncToGenerator(regeneratorRuntime.mark(function _callee24(format) {
                    var jq, _ajax, buttonNumber, pendingFormat, self;

                    return regeneratorRuntime.wrap(function _callee24$(_context25) {
                        while (1) {
                            switch (_context25.prev = _context25.next) {
                                case 0:
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    buttonNumber = format == 'flv' ? 1 : 4;
                                    pendingFormat = this.lockFormat(format);
                                    self = this;

                                    jq.ajax = function (a, c) {
                                        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                            if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                        };
                                        if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
                                    this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(' + buttonNumber + ')').click();
                                    return _context25.abrupt('return', pendingFormat);

                                case 8:
                                case 'end':
                                    return _context25.stop();
                            }
                        }
                    }, _callee24, this);
                }));

                function getNonCurrentFormatSixteen(_x30) {
                    return _ref27.apply(this, arguments);
                }

                return getNonCurrentFormatSixteen;
            }()
        }, {
            key: 'getASS',
            value: function () {
                var _ref28 = _asyncToGenerator(regeneratorRuntime.mark(function _callee26(clickableFormat) {
                    var _this18 = this;

                    return regeneratorRuntime.wrap(function _callee26$(_context27) {
                        while (1) {
                            switch (_context27.prev = _context27.next) {
                                case 0:
                                    if (!this.ass) {
                                        _context27.next = 2;
                                        break;
                                    }

                                    return _context27.abrupt('return', this.ass);

                                case 2:
                                    this.ass = new Promise(function () {
                                        var _ref29 = _asyncToGenerator(regeneratorRuntime.mark(function _callee25(resolve) {
                                            var _ref30, _ref31, _ref31$, fetchDanmaku, generateASS, setPosition, cid;

                                            return regeneratorRuntime.wrap(function _callee25$(_context26) {
                                                while (1) {
                                                    switch (_context26.prev = _context26.next) {
                                                        case 0:
                                                            if (!_this18.cid) _this18.cid = new Promise(function (resolve) {
                                                                if (!clickableFormat) reject('get ASS Error: cid unavailable, nor clickable format given.');
                                                                var jq = _this18.playerWin.jQuery;
                                                                var _ajax = jq.ajax;
                                                                var buttonNumber = clickableFormat == 'flv' ? 1 : 2;

                                                                _this18.lockFormat(clickableFormat);
                                                                var self = _this18;
                                                                jq.ajax = function (a, c) {
                                                                    if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                                        if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                                                    };
                                                                    if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
                                                                _this18.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(' + buttonNumber + ')').click();
                                                            });
                                                            _context26.next = 3;
                                                            return Promise.all([_this18.assAsyncScript, _this18.cid]);

                                                        case 3:
                                                            _ref30 = _context26.sent;
                                                            _ref31 = _slicedToArray(_ref30, 2);
                                                            _ref31$ = _ref31[0];
                                                            fetchDanmaku = _ref31$.fetchDanmaku;
                                                            generateASS = _ref31$.generateASS;
                                                            setPosition = _ref31$.setPosition;
                                                            cid = _ref31[1];


                                                            fetchDanmaku(cid, function (danmaku) {
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

                                                        case 11:
                                                        case 'end':
                                                            return _context26.stop();
                                                    }
                                                }
                                            }, _callee25, _this18);
                                        }));

                                        return function (_x32) {
                                            return _ref29.apply(this, arguments);
                                        };
                                    }());
                                    return _context27.abrupt('return', this.ass);

                                case 4:
                                case 'end':
                                    return _context27.stop();
                            }
                        }
                    }, _callee26, this);
                }));

                function getASS(_x31) {
                    return _ref28.apply(this, arguments);
                }

                return getASS;
            }()
        }, {
            key: 'queryInfo',
            value: function () {
                var _ref32 = _asyncToGenerator(regeneratorRuntime.mark(function _callee28(format) {
                    var _this19 = this;

                    return regeneratorRuntime.wrap(function _callee28$(_context29) {
                        while (1) {
                            switch (_context29.prev = _context29.next) {
                                case 0:
                                    return _context29.abrupt('return', this.queryInfoMutex.lockAndAwait(_asyncToGenerator(regeneratorRuntime.mark(function _callee27() {
                                        return regeneratorRuntime.wrap(function _callee27$(_context28) {
                                            while (1) {
                                                switch (_context28.prev = _context28.next) {
                                                    case 0:
                                                        _context28.t0 = format;
                                                        _context28.next = _context28.t0 === 'flv' ? 3 : _context28.t0 === 'mp4' ? 12 : _context28.t0 === 'ass' ? 21 : 30;
                                                        break;

                                                    case 3:
                                                        if (!_this19.flvs) {
                                                            _context28.next = 7;
                                                            break;
                                                        }

                                                        return _context28.abrupt('return', _this19.flvs);

                                                    case 7:
                                                        if (!_this19.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(1)').getAttribute('data-selected')) {
                                                            _context28.next = 11;
                                                            break;
                                                        }

                                                        return _context28.abrupt('return', _this19.getCurrentFormat('flv'));

                                                    case 11:
                                                        return _context28.abrupt('return', _this19.getNonCurrentFormat('flv'));

                                                    case 12:
                                                        if (!_this19.mp4) {
                                                            _context28.next = 16;
                                                            break;
                                                        }

                                                        return _context28.abrupt('return', _this19.mp4);

                                                    case 16:
                                                        if (!_this19.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(2)').getAttribute('data-selected')) {
                                                            _context28.next = 20;
                                                            break;
                                                        }

                                                        return _context28.abrupt('return', _this19.getCurrentFormat('hdmp4'));

                                                    case 20:
                                                        return _context28.abrupt('return', _this19.getNonCurrentFormat('hdmp4'));

                                                    case 21:
                                                        if (!_this19.ass) {
                                                            _context28.next = 25;
                                                            break;
                                                        }

                                                        return _context28.abrupt('return', _this19.ass);

                                                    case 25:
                                                        if (!_this19.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(1)').getAttribute('data-selected')) {
                                                            _context28.next = 29;
                                                            break;
                                                        }

                                                        return _context28.abrupt('return', _this19.getASS('hdmp4'));

                                                    case 29:
                                                        return _context28.abrupt('return', _this19.getASS('flv'));

                                                    case 30:
                                                        throw 'Bilimonkey: What is format ' + format + '?';

                                                    case 31:
                                                    case 'end':
                                                        return _context28.stop();
                                                }
                                            }
                                        }, _callee27, _this19);
                                    }))));

                                case 1:
                                case 'end':
                                    return _context29.stop();
                            }
                        }
                    }, _callee28, this);
                }));

                function queryInfo(_x33) {
                    return _ref32.apply(this, arguments);
                }

                return queryInfo;
            }()
        }, {
            key: 'queryInfoSixteen',
            value: function () {
                var _ref34 = _asyncToGenerator(regeneratorRuntime.mark(function _callee30(format) {
                    var _this20 = this;

                    return regeneratorRuntime.wrap(function _callee30$(_context31) {
                        while (1) {
                            switch (_context31.prev = _context31.next) {
                                case 0:
                                    return _context31.abrupt('return', this.queryInfoMutex.lockAndAwait(_asyncToGenerator(regeneratorRuntime.mark(function _callee29() {
                                        return regeneratorRuntime.wrap(function _callee29$(_context30) {
                                            while (1) {
                                                switch (_context30.prev = _context30.next) {
                                                    case 0:
                                                        _context30.t0 = format;
                                                        _context30.next = _context30.t0 === 'flv' ? 3 : _context30.t0 === 'mp4' ? 12 : _context30.t0 === 'ass' ? 21 : 30;
                                                        break;

                                                    case 3:
                                                        if (!_this20.flvs) {
                                                            _context30.next = 7;
                                                            break;
                                                        }

                                                        return _context30.abrupt('return', _this20.flvs);

                                                    case 7:
                                                        if (!_this20.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(1)').getAttribute('data-selected')) {
                                                            _context30.next = 11;
                                                            break;
                                                        }

                                                        return _context30.abrupt('return', _this20.getCurrentFormatSixteen('flv'));

                                                    case 11:
                                                        return _context30.abrupt('return', _this20.getNonCurrentFormatSixteen('flv'));

                                                    case 12:
                                                        if (!_this20.mp4) {
                                                            _context30.next = 16;
                                                            break;
                                                        }

                                                        return _context30.abrupt('return', _this20.mp4);

                                                    case 16:
                                                        if (!_this20.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(4)').getAttribute('data-selected')) {
                                                            _context30.next = 20;
                                                            break;
                                                        }

                                                        return _context30.abrupt('return', _this20.getCurrentFormatSixteen('mp4'));

                                                    case 20:
                                                        return _context30.abrupt('return', _this20.getNonCurrentFormatSixteen('mp4'));

                                                    case 21:
                                                        if (!_this20.ass) {
                                                            _context30.next = 25;
                                                            break;
                                                        }

                                                        return _context30.abrupt('return', _this20.ass);

                                                    case 25:
                                                        if (!_this20.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(1)').getAttribute('data-selected')) {
                                                            _context30.next = 29;
                                                            break;
                                                        }

                                                        return _context30.abrupt('return', _this20.getASS('mp4'));

                                                    case 29:
                                                        return _context30.abrupt('return', _this20.getASS('flv'));

                                                    case 30:
                                                        throw 'Bilimonkey: What is format ' + format + '?';

                                                    case 31:
                                                    case 'end':
                                                        return _context30.stop();
                                                }
                                            }
                                        }, _callee29, _this20);
                                    }))));

                                case 1:
                                case 'end':
                                    return _context31.stop();
                            }
                        }
                    }, _callee30, this);
                }));

                function queryInfoSixteen(_x34) {
                    return _ref34.apply(this, arguments);
                }

                return queryInfoSixteen;
            }()
        }, {
            key: 'getPlayer',
            value: function () {
                var _ref36 = _asyncToGenerator(regeneratorRuntime.mark(function _callee31() {
                    var _this21 = this;

                    return regeneratorRuntime.wrap(function _callee31$(_context32) {
                        while (1) {
                            switch (_context32.prev = _context32.next) {
                                case 0:
                                    if (!this.playerWin.document.querySelector('div.bilibili-player-video-btn.bilibili-player-video-btn-quality > div > ul > li:nth-child(2)')) {
                                        _context32.next = 5;
                                        break;
                                    }

                                    this.playerWin.document.getElementsByClassName('bilibili-player-video-panel')[0].style.display = 'none';
                                    return _context32.abrupt('return', this.playerWin);

                                case 5:
                                    return _context32.abrupt('return', new Promise(function (resolve) {
                                        var observer = new MutationObserver(function () {
                                            if (_this21.playerWin.document.querySelector('div.bilibili-player-video-btn.bilibili-player-video-btn-quality > div > ul > li:nth-child(2)')) {
                                                observer.disconnect();
                                                _this21.playerWin.document.getElementsByClassName('bilibili-player-video-panel')[0].style.display = 'none';
                                                resolve(_this21.playerWin);
                                            }
                                        });
                                        observer.observe(_this21.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                    }));

                                case 6:
                                case 'end':
                                    return _context32.stop();
                            }
                        }
                    }, _callee31, this);
                }));

                function getPlayer() {
                    return _ref36.apply(this, arguments);
                }

                return getPlayer;
            }()
        }, {
            key: 'hangPlayer',
            value: function () {
                var _ref37 = _asyncToGenerator(regeneratorRuntime.mark(function _callee33() {
                    var _this22 = this;

                    var trivialRes, jq, _ajax;

                    return regeneratorRuntime.wrap(function _callee33$(_context34) {
                        while (1) {
                            switch (_context34.prev = _context34.next) {
                                case 0:
                                    _context34.next = 2;
                                    return this.getPlayer();

                                case 2:
                                    trivialRes = { 'from': 'local', 'result': 'suee', 'format': 'hdmp4', 'timelength': 10, 'accept_format': 'flv,hdmp4,mp4', 'accept_quality': [3, 2, 1], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': '' }] };
                                    jq = this.playerWin.jQuery;
                                    _ajax = jq.ajax;
                                    return _context34.abrupt('return', new Promise(function () {
                                        var _ref38 = _asyncToGenerator(regeneratorRuntime.mark(function _callee32(resolve) {
                                            var blockerTimeout, button;
                                            return regeneratorRuntime.wrap(function _callee32$(_context33) {
                                                while (1) {
                                                    switch (_context33.prev = _context33.next) {
                                                        case 0:
                                                            blockerTimeout = void 0;

                                                            jq.ajax = function (a, c) {
                                                                if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
                                                                    if (typeof a === 'string') c.url = a; a = c; c = undefined;
                                                                };
                                                                if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
                                                                    clearTimeout(blockerTimeout);
                                                                    a.success(trivialRes);
                                                                    blockerTimeout = setTimeout(function () {
                                                                        jq.ajax = _ajax;
                                                                        resolve();
                                                                    }, 2500);
                                                                } else {
                                                                    return _ajax.call(jq, a, c);
                                                                }
                                                            };
                                                            button = Array.from(_this22.playerWin.document.querySelector('div.bilibili-player-video-btn.bilibili-player-video-btn-quality > div > ul').children).find(function (e) {
                                                                return !e.getAttribute('data-selected');
                                                            });

                                                            button.click();

                                                        case 4:
                                                        case 'end':
                                                            return _context33.stop();
                                                    }
                                                }
                                            }, _callee32, _this22);
                                        }));

                                        return function (_x35) {
                                            return _ref38.apply(this, arguments);
                                        };
                                    }()));

                                case 6:
                                case 'end':
                                    return _context34.stop();
                            }
                        }
                    }, _callee33, this);
                }));

                function hangPlayer() {
                    return _ref37.apply(this, arguments);
                }

                return hangPlayer;
            }()
        }, {
            key: 'loadFLVFromCache',
            value: function () {
                var _ref39 = _asyncToGenerator(regeneratorRuntime.mark(function _callee34(index) {
                    var name, item;
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
                                    _context35.next = 7;
                                    return this.cache.getData(name);

                                case 7:
                                    item = _context35.sent;

                                    if (item) {
                                        _context35.next = 10;
                                        break;
                                    }

                                    return _context35.abrupt('return');

                                case 10:
                                    return _context35.abrupt('return', this.flvsBlob[index] = item.data);

                                case 11:
                                case 'end':
                                    return _context35.stop();
                            }
                        }
                    }, _callee34, this);
                }));

                function loadFLVFromCache(_x36) {
                    return _ref39.apply(this, arguments);
                }

                return loadFLVFromCache;
            }()
        }, {
            key: 'loadPartialFLVFromCache',
            value: function () {
                var _ref40 = _asyncToGenerator(regeneratorRuntime.mark(function _callee35(index) {
                    var name, item;
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
                                    _context36.next = 8;
                                    return this.cache.getData(name);

                                case 8:
                                    item = _context36.sent;

                                    if (item) {
                                        _context36.next = 11;
                                        break;
                                    }

                                    return _context36.abrupt('return');

                                case 11:
                                    return _context36.abrupt('return', item.data);

                                case 12:
                                case 'end':
                                    return _context36.stop();
                            }
                        }
                    }, _callee35, this);
                }));

                function loadPartialFLVFromCache(_x37) {
                    return _ref40.apply(this, arguments);
                }

                return loadPartialFLVFromCache;
            }()
        }, {
            key: 'loadAllFLVFromCache',
            value: function () {
                var _ref41 = _asyncToGenerator(regeneratorRuntime.mark(function _callee36() {
                    var promises, i;
                    return regeneratorRuntime.wrap(function _callee36$(_context37) {
                        while (1) {
                            switch (_context37.prev = _context37.next) {
                                case 0:
                                    if (this.cache) {
                                        _context37.next = 2;
                                        break;
                                    }

                                    return _context37.abrupt('return');

                                case 2:
                                    if (this.flvs) {
                                        _context37.next = 4;
                                        break;
                                    }

                                    throw 'BiliMonkey: info uninitialized';

                                case 4:
                                    promises = [];

                                    for (i = 0; i < this.flvs.length; i++) {
                                        promises.push(this.loadFLVFromCache(i));
                                    } return _context37.abrupt('return', Promise.all(promises));

                                case 7:
                                case 'end':
                                    return _context37.stop();
                            }
                        }
                    }, _callee36, this);
                }));

                function loadAllFLVFromCache() {
                    return _ref41.apply(this, arguments);
                }

                return loadAllFLVFromCache;
            }()
        }, {
            key: 'saveFLVToCache',
            value: function () {
                var _ref42 = _asyncToGenerator(regeneratorRuntime.mark(function _callee37(index, blob) {
                    var name;
                    return regeneratorRuntime.wrap(function _callee37$(_context38) {
                        while (1) {
                            switch (_context38.prev = _context38.next) {
                                case 0:
                                    if (this.cache) {
                                        _context38.next = 2;
                                        break;
                                    }

                                    return _context38.abrupt('return');

                                case 2:
                                    if (this.flvs) {
                                        _context38.next = 4;
                                        break;
                                    }

                                    throw 'BiliMonkey: info uninitialized';

                                case 4:
                                    name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
                                    return _context38.abrupt('return', this.cache.addData({ name: name, data: blob }));

                                case 6:
                                case 'end':
                                    return _context38.stop();
                            }
                        }
                    }, _callee37, this);
                }));

                function saveFLVToCache(_x38, _x39) {
                    return _ref42.apply(this, arguments);
                }

                return saveFLVToCache;
            }()
        }, {
            key: 'savePartialFLVToCache',
            value: function () {
                var _ref43 = _asyncToGenerator(regeneratorRuntime.mark(function _callee38(index, blob) {
                    var name;
                    return regeneratorRuntime.wrap(function _callee38$(_context39) {
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
                                    name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];

                                    name = 'PC_' + name;
                                    return _context39.abrupt('return', this.cache.putData({ name: name, data: blob }));

                                case 7:
                                case 'end':
                                    return _context39.stop();
                            }
                        }
                    }, _callee38, this);
                }));

                function savePartialFLVToCache(_x40, _x41) {
                    return _ref43.apply(this, arguments);
                }

                return savePartialFLVToCache;
            }()
        }, {
            key: 'cleanPartialFLVInCache',
            value: function () {
                var _ref44 = _asyncToGenerator(regeneratorRuntime.mark(function _callee39(index) {
                    var name;
                    return regeneratorRuntime.wrap(function _callee39$(_context40) {
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
                                    name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];

                                    name = 'PC_' + name;
                                    return _context40.abrupt('return', this.cache.deleteData(name));

                                case 7:
                                case 'end':
                                    return _context40.stop();
                            }
                        }
                    }, _callee39, this);
                }));

                function cleanPartialFLVInCache(_x42) {
                    return _ref44.apply(this, arguments);
                }

                return cleanPartialFLVInCache;
            }()
        }, {
            key: 'getFLV',
            value: function () {
                var _ref45 = _asyncToGenerator(regeneratorRuntime.mark(function _callee41(index, progressHandler) {
                    var _this23 = this;

                    return regeneratorRuntime.wrap(function _callee41$(_context42) {
                        while (1) {
                            switch (_context42.prev = _context42.next) {
                                case 0:
                                    if (!this.flvsBlob[index]) {
                                        _context42.next = 2;
                                        break;
                                    }

                                    return _context42.abrupt('return', this.flvsBlob[index]);

                                case 2:
                                    if (this.flvs) {
                                        _context42.next = 4;
                                        break;
                                    }

                                    throw 'BiliMonkey: info uninitialized';

                                case 4:
                                    this.flvsBlob[index] = _asyncToGenerator(regeneratorRuntime.mark(function _callee40() {
                                        var cache, partialCache, burl, opt, fch, fullResponse;
                                        return regeneratorRuntime.wrap(function _callee40$(_context41) {
                                            while (1) {
                                                switch (_context41.prev = _context41.next) {
                                                    case 0:
                                                        _context41.next = 2;
                                                        return _this23.loadFLVFromCache(index);

                                                    case 2:
                                                        cache = _context41.sent;

                                                        if (!cache) {
                                                            _context41.next = 5;
                                                            break;
                                                        }

                                                        return _context41.abrupt('return', _this23.flvsBlob[index] = cache);

                                                    case 5:
                                                        _context41.next = 7;
                                                        return _this23.loadPartialFLVFromCache(index);

                                                    case 7:
                                                        partialCache = _context41.sent;
                                                        burl = _this23.flvs[index];

                                                        if (partialCache) burl += '&bstart=' + partialCache.size;
                                                        opt = {
                                                            method: 'GET',
                                                            mode: 'cors',
                                                            cache: 'default',
                                                            referrerPolicy: 'no-referrer-when-downgrade',
                                                            cacheLoaded: partialCache ? partialCache.size : 0,
                                                            headers: partialCache && !burl.includes('wsTime') ? { Range: 'bytes=' + partialCache.size + '-' } : undefined
                                                        };

                                                        opt.onprogress = progressHandler;
                                                        opt.onerror = opt.onabort = function (_ref47) {
                                                            var target = _ref47.target,
                                                                type = _ref47.type;

                                                            var pBlob = target.getPartialBlob();
                                                            if (partialCache) pBlob = new Blob([partialCache, pBlob]);
                                                            _this23.savePartialFLVToCache(index, pBlob);
                                                        };

                                                        fch = new DetailedFetchBlob(burl, opt);

                                                        _this23.flvsDetailedFetch[index] = fch;
                                                        _context41.next = 17;
                                                        return fch.getBlob();

                                                    case 17:
                                                        fullResponse = _context41.sent;

                                                        _this23.flvsDetailedFetch[index] = undefined;
                                                        if (partialCache) {
                                                            fullResponse = new Blob([partialCache, fullResponse]);
                                                            _this23.cleanPartialFLVInCache(index);
                                                        }
                                                        _this23.saveFLVToCache(index, fullResponse);
                                                        return _context41.abrupt('return', _this23.flvsBlob[index] = fullResponse);

                                                    case 22:
                                                    case 'end':
                                                        return _context41.stop();
                                                }
                                            }
                                        }, _callee40, _this23);
                                    }))();
                                    return _context42.abrupt('return', this.flvsBlob[index]);

                                case 6:
                                case 'end':
                                    return _context42.stop();
                            }
                        }
                    }, _callee41, this);
                }));

                function getFLV(_x43, _x44) {
                    return _ref45.apply(this, arguments);
                }

                return getFLV;
            }()
        }, {
            key: 'abortFLV',
            value: function () {
                var _ref48 = _asyncToGenerator(regeneratorRuntime.mark(function _callee42(index) {
                    return regeneratorRuntime.wrap(function _callee42$(_context43) {
                        while (1) {
                            switch (_context43.prev = _context43.next) {
                                case 0:
                                    if (!this.flvsDetailedFetch[index]) {
                                        _context43.next = 2;
                                        break;
                                    }

                                    return _context43.abrupt('return', this.flvsDetailedFetch[index].abort());

                                case 2:
                                case 'end':
                                    return _context43.stop();
                            }
                        }
                    }, _callee42, this);
                }));

                function abortFLV(_x45) {
                    return _ref48.apply(this, arguments);
                }

                return abortFLV;
            }()
        }, {
            key: 'getAllFLVs',
            value: function () {
                var _ref49 = _asyncToGenerator(regeneratorRuntime.mark(function _callee43(progressHandler) {
                    var promises, i;
                    return regeneratorRuntime.wrap(function _callee43$(_context44) {
                        while (1) {
                            switch (_context44.prev = _context44.next) {
                                case 0:
                                    if (this.flvs) {
                                        _context44.next = 2;
                                        break;
                                    }

                                    throw 'BiliMonkey: info uninitialized';

                                case 2:
                                    promises = [];

                                    for (i = 0; i < this.flvs.length; i++) {
                                        promises.push(this.getFLV(i, progressHandler));
                                    } return _context44.abrupt('return', Promise.all(promises));

                                case 5:
                                case 'end':
                                    return _context44.stop();
                            }
                        }
                    }, _callee43, this);
                }));

                function getAllFLVs(_x46) {
                    return _ref49.apply(this, arguments);
                }

                return getAllFLVs;
            }()
        }, {
            key: 'cleanAllFLVsInCache',
            value: function () {
                var _ref50 = _asyncToGenerator(regeneratorRuntime.mark(function _callee44() {
                    var promises, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _flv, name;

                    return regeneratorRuntime.wrap(function _callee44$(_context45) {
                        while (1) {
                            switch (_context45.prev = _context45.next) {
                                case 0:
                                    if (this.cache) {
                                        _context45.next = 2;
                                        break;
                                    }

                                    return _context45.abrupt('return');

                                case 2:
                                    if (this.flvs) {
                                        _context45.next = 4;
                                        break;
                                    }

                                    throw 'BiliMonkey: info uninitialized';

                                case 4:
                                    promises = [];
                                    _iteratorNormalCompletion7 = true;
                                    _didIteratorError7 = false;
                                    _iteratorError7 = undefined;
                                    _context45.prev = 8;

                                    for (_iterator7 = this.flvs[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                        _flv = _step7.value;
                                        name = _flv.match(/\d+-\d+(?:-\d+)?\.flv/)[0];

                                        promises.push(this.cache.deleteData(name));
                                        promises.push(this.cache.deleteData('PC_' + name));
                                    }
                                    _context45.next = 16;
                                    break;

                                case 12:
                                    _context45.prev = 12;
                                    _context45.t0 = _context45['catch'](8);
                                    _didIteratorError7 = true;
                                    _iteratorError7 = _context45.t0;

                                case 16:
                                    _context45.prev = 16;
                                    _context45.prev = 17;

                                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                        _iterator7.return();
                                    }

                                case 19:
                                    _context45.prev = 19;

                                    if (!_didIteratorError7) {
                                        _context45.next = 22;
                                        break;
                                    }

                                    throw _iteratorError7;

                                case 22:
                                    return _context45.finish(19);

                                case 23:
                                    return _context45.finish(16);

                                case 24:
                                    return _context45.abrupt('return', Promise.all(promises));

                                case 25:
                                case 'end':
                                    return _context45.stop();
                            }
                        }
                    }, _callee44, this, [[8, 12, 16, 24], [17, , 19, 23]]);
                }));

                function cleanAllFLVsInCache() {
                    return _ref50.apply(this, arguments);
                }

                return cleanAllFLVsInCache;
            }()
        }, {
            key: 'setupProxy',
            value: function () {
                var _ref51 = _asyncToGenerator(regeneratorRuntime.mark(function _callee45(res, onsuccess) {
                    var _this24 = this;

                    var resProxy, i;
                    return regeneratorRuntime.wrap(function _callee45$(_context46) {
                        while (1) {
                            switch (_context46.prev = _context46.next) {
                                case 0:
                                    (function () {
                                        var _fetch = _this24.playerWin.fetch;
                                        _this24.playerWin.fetch = function (input, init) {
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
                                    _context46.next = 3;
                                    return this.loadAllFLVFromCache();

                                case 3:
                                    resProxy = {};

                                    Object.assign(resProxy, res);
                                    for (i = 0; i < this.flvsBlob.length; i++) {
                                        if (this.flvsBlob[i]) resProxy.durl[i].url = this.playerWin.URL.createObjectURL(this.flvsBlob[i]);
                                    }
                                    return _context46.abrupt('return', onsuccess(resProxy));

                                case 7:
                                case 'end':
                                    return _context46.stop();
                            }
                        }
                    }, _callee45, this);
                }));

                function setupProxy(_x47, _x48) {
                    return _ref51.apply(this, arguments);
                }

                return setupProxy;
            }()
        }], [{
            key: 'loadASSScript',
            value: function () {
                var _ref52 = _asyncToGenerator(regeneratorRuntime.mark(function _callee46() {
                    var src = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.user.js';
                    var script, head, foot, indirectEvalWrapper;
                    return regeneratorRuntime.wrap(function _callee46$(_context47) {
                        while (1) {
                            switch (_context47.prev = _context47.next) {
                                case 0:
                                    _context47.next = 2;
                                    return new Promise(function (resolve, reject) {
                                        var req = new XMLHttpRequest();
                                        req.onload = function () {
                                            return resolve(req.responseText);
                                        };
                                        req.onerror = reject;
                                        req.open('get', src);
                                        req.send();
                                    });

                                case 2:
                                    script = _context47.sent;

                                    script = script.slice(0, script.indexOf('var init = function ()'));
                                    head = '\n        (function () {\n        ';
                                    foot = '\n            fetchXML = function (cid, callback) {\n                var oReq = new XMLHttpRequest();\n                oReq.open(\'GET\', \'https://comment.bilibili.com/{{cid}}.xml\'.replace(\'{{cid}}\', cid));\n                oReq.onload = function () {\n                    var content = oReq.responseText.replace(/(?:[\0-\b\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, "");\n                    callback(content);\n                };\n                oReq.send();\n            };\n            initFont();\n            return { fetchDanmaku: fetchDanmaku, generateASS: generateASS, setPosition: setPosition };\n        })()\n        ';

                                    script = '' + head + script + foot;
                                    indirectEvalWrapper = { 'eval': eval };
                                    return _context47.abrupt('return', indirectEvalWrapper.eval(script));

                                case 9:
                                case 'end':
                                    return _context47.stop();
                            }
                        }
                    }, _callee46, this);
                }));

                function loadASSScript() {
                    return _ref52.apply(this, arguments);
                }

                return loadASSScript;
            }()
        }, {
            key: '_UNIT_TEST',
            value: function _UNIT_TEST() {
                var _this25 = this;

                _asyncToGenerator(regeneratorRuntime.mark(function _callee47() {
                    var playerWin;
                    return regeneratorRuntime.wrap(function _callee47$(_context48) {
                        while (1) {
                            switch (_context48.prev = _context48.next) {
                                case 0:
                                    _context48.next = 2;
                                    return BiliUserJS.getPlayerWin();

                                case 2:
                                    playerWin = _context48.sent;

                                    window.m = new BiliMonkey(playerWin);

                                    console.warn('sniffDefaultFormat test');
                                    _context48.next = 7;
                                    return m.sniffDefaultFormat();

                                case 7:
                                    console.log(m);

                                    console.warn('data race test');
                                    m.queryInfo('mp4');
                                    console.log(m.queryInfo('mp4'));

                                    console.warn('getNonCurrentFormat test');
                                    _context48.t0 = console;
                                    _context48.next = 15;
                                    return m.queryInfo('mp4');

                                case 15:
                                    _context48.t1 = _context48.sent;

                                    _context48.t0.log.call(_context48.t0, _context48.t1);

                                    console.warn('getCurrentFormat test');
                                    _context48.t2 = console;
                                    _context48.next = 21;
                                    return m.queryInfo('flv');

                                case 21:
                                    _context48.t3 = _context48.sent;

                                    _context48.t2.log.call(_context48.t2, _context48.t3);

                                case 23:
                                case 'end':
                                    return _context48.stop();
                            }
                        }
                    }, _callee47, _this25);
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
                autoNext: true,
                autoNextTimeout: 2000,
                autoNextRecommend: false,
                electric: true,
                electricSkippable: false,
                lift: true,
                autoResume: true,
                autoPlay: false,
                autoWideScreen: false,
                autoFullScreen: false,
                oped: true,
                focus: true,
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
            this.autoNextDestination = null;
            this.autoNextTimeout = option.autoNextTimeout;
            this.series = [];
            this.userdata = null;
        }

        _createClass(BiliPolyfill, [{
            key: 'saveUserdata',
            value: function saveUserdata() {
                this.setStorage('biliPolyfill', JSON.stringify(this.userdata));
            }
        }, {
            key: 'retriveUserdata',
            value: function retriveUserdata() {
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
                var _ref54 = _asyncToGenerator(regeneratorRuntime.mark(function _callee48() {
                    var _this26 = this;

                    var _ref55 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                        _ref55$videoRefresh = _ref55.videoRefresh,
                        videoRefresh = _ref55$videoRefresh === undefined ? false : _ref55$videoRefresh;

                    return regeneratorRuntime.wrap(function _callee48$(_context49) {
                        while (1) {
                            switch (_context49.prev = _context49.next) {
                                case 0:
                                    if (this.option.betabeta) {
                                        _context49.next = 6;
                                        break;
                                    }

                                    this.autoNextDestination = '到设置开启';
                                    _context49.next = 4;
                                    return this.getPlayerVideo();

                                case 4:
                                    this.userdata = { oped: {} };
                                    return _context49.abrupt('return');

                                case 6:
                                    if (!videoRefresh) {
                                        _context49.next = 16;
                                        break;
                                    }

                                    this.video = this.playerWin.document.getElementsByTagName('video')[0];

                                    if (this.video) {
                                        _context49.next = 10;
                                        break;
                                    }

                                    return _context49.abrupt('return');

                                case 10:
                                    if (this.option.dblclick) this.dblclickFullScreen();
                                    if (this.option.autoNext) this.autoNext();
                                    if (this.option.electric) this.reallocateElectricPanel();
                                    if (this.option.oped) this.skipOPED();
                                    this.video.addEventListener('emptied', function () {
                                        return _this26.setFunctions({ videoRefresh: true });
                                    });
                                    return _context49.abrupt('return');

                                case 16:
                                    _context49.next = 18;
                                    return this.getPlayerVideo();

                                case 18:
                                    this.video = _context49.sent;

                                    this.retriveUserdata();
                                    if (this.option.badgeWatchLater) this.badgeWatchLater();
                                    if (this.option.dblclick) this.dblclickFullScreen();
                                    if (this.option.scroll) this.scrollToPlayer();
                                    if (this.option.recommend) this.showRecommendTab();
                                    if (this.option.autoNext) this.autoNext();
                                    if (this.option.electric) this.reallocateElectricPanel();
                                    if (this.option.lift) this.liftBottomDanmuku();
                                    if (this.option.autoResume) this.autoResume();
                                    if (this.option.autoPlay) this.autoPlay();
                                    if (this.option.autoWideScreen) this.autoWideScreen();
                                    if (this.option.autoFullScreen) this.autoFullScreen();
                                    if (this.option.oped) this.skipOPED();
                                    if (this.option.focus) this.focusOnPlayer();
                                    if (this.option.limitedKeydown) this.limitedKeydownFullScreenPlay();
                                    this.playerWin.addEventListener('beforeunload', function () {
                                        return _this26.saveUserdata();
                                    });
                                    this.video.addEventListener('emptied', function () {
                                        return _this26.setFunctions({ videoRefresh: true });
                                    });
                                    // beta
                                    if (this.option.speech) top.document.body.addEventListener('click', function (e) {
                                        return e.detail > 2 ? _this26.speechRecognition() : undefined;
                                    });
                                    if (this.option.series) this.inferNextInSeries();

                                case 38:
                                case 'end':
                                    return _context49.stop();
                            }
                        }
                    }, _callee48, this);
                }));

                function setFunctions() {
                    return _ref54.apply(this, arguments);
                }

                return setFunctions;
            }()
        }, {
            key: 'inferNextInSeries',
            value: function () {
                var _ref56 = _asyncToGenerator(regeneratorRuntime.mark(function _callee49() {
                    var title, epNumberText, seriesTitle, ep, mid, vlist;
                    return regeneratorRuntime.wrap(function _callee49$(_context50) {
                        while (1) {
                            switch (_context50.prev = _context50.next) {
                                case 0:
                                    title = (top.document.getElementsByClassName('v-title')[0] || top.document.getElementsByClassName('video-info-module')[0]).children[0].textContent.replace(/\(\d+\)$/, '').trim();

                                    // 1. Find series name

                                    epNumberText = title.match(/\d+/g);

                                    if (epNumberText) {
                                        _context50.next = 4;
                                        break;
                                    }

                                    return _context50.abrupt('return', this.series = []);

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
                                        _context50.next = 12;
                                        break;
                                    }

                                    return _context50.abrupt('return', this.series = []);

                                case 12:
                                    mid = mid.children[0].href.match(/\d+/)[0];
                                    _context50.next = 15;
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
                                    vlist = _context50.sent;


                                    vlist[0] = [vlist[0].find(function (e) {
                                        return e.title == title;
                                    })];

                                    if (vlist[0][0]) {
                                        _context50.next = 20;
                                        break;
                                    }

                                    console && console.warn('BiliPolyfill: inferNextInSeries: cannot find current video in mid space'); return _context50.abrupt('return', this.series = []);

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

                                    return _context50.abrupt('return', this.series);

                                case 24:
                                case 'end':
                                    return _context50.stop();
                            }
                        }
                    }, _callee49, this);
                }));

                function inferNextInSeries() {
                    return _ref56.apply(this, arguments);
                }

                return inferNextInSeries;
            }()
        }, {
            key: 'badgeWatchLater',
            value: function badgeWatchLater() {
                var li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn');
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
                var _this27 = this;

                this.video.addEventListener('dblclick', function () {
                    return _this27.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
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
                if (top.document.querySelector('.cover_image')) return top.document.querySelector('.cover_image').src; else if (top.document.querySelector('div.v1-bangumi-info-img > a > img')) return top.document.querySelector('div.v1-bangumi-info-img > a > img').src.slice(0, top.document.querySelector('div.v1-bangumi-info-img > a > img').src.indexOf('.jpg') + 4); else if (top.document.querySelector('[data-state-play="true"]  img')) return top.document.querySelector('[data-state-play="true"]  img').src.slice(0, top.document.querySelector('[data-state-play="true"]  img').src.indexOf('.jpg') + 4); else return null;
            }
        }, {
            key: 'autoNext',
            value: function autoNext() {
                var _this28 = this;

                // 1 Next Part
                // // 2 Watch Later: how to cooperate with bilibili's vanilla watchlater? it is more a playlist
                // 3 Recommendations
                if (this.autoNextDestination && this.autoNextDestination != '没有了') return;
                var destination = void 0,
                    nextLocation = void 0;
                if (!nextLocation && top.location.host == 'bangumi.bilibili.com') {
                    destination = '请用左下角'; //番剧:
                    nextLocation = function nextLocation() {
                        return _this28.playerWin.getElementsByClassName('bilibili-player-video-btn-next')[0].click();
                    };
                }
                if (!nextLocation) {
                    destination = '下一P'; //视频:
                    nextLocation = (nextLocation = this.playerWin.document.querySelector('#plist .curPage + a[data-index]')) ? nextLocation.click.bind(nextLocation) : undefined;
                }
                if (!nextLocation) {
                    destination = '请用左下角'; //列表:
                    nextLocation = (nextLocation = this.playerWin.document.querySelector('li.bilibili-player-watchlater-item[data-state-play="true"] + li')) ? nextLocation.click.bind(nextLocation) : undefined;
                }
                if (!nextLocation) {
                    destination = 'B站推荐'; //列表:
                    nextLocation = this.option.autoNextRecommend ? (nextLocation = this.playerWin.document.querySelector('div.bilibili-player-recommend a')) ? nextLocation.href : undefined : undefined;
                }
                if (!nextLocation) return this.autoNextDestination = '没有了';

                var h = function h() {
                    _this28.hintInfo('BiliPolyfill: ' + BiliPolyfill.secondToReadable(_this28.autoNextTimeout / 1000) + '\u540E\u64AD\u653E\u4E0B\u4E00\u4E2A(\u4EFB\u610F\u70B9\u51FB\u53D6\u6D88)');
                    var t = setTimeout(function () {
                        return nextLocation instanceof Function ? nextLocation() : top.window.location.assign(nextLocation);
                    }, _this28.autoNextTimeout);
                    var ht = function ht() {
                        clearTimeout(t); _this28.playerWin.removeEventListener('click', ht);
                    };
                    setTimeout(function () {
                        return _this28.playerWin.addEventListener('click', ht);
                    }, 0);
                    _this28.video.removeEventListener('ended', h);
                };
                // No longer need to alter default behaviour
                //this.video.addEventListener('ended', h);
                return this.autoNextDestination = destination;
            }
        }, {
            key: 'reallocateElectricPanel',
            value: function reallocateElectricPanel() {
                var _this29 = this;

                if (!this.playerWin.localStorage.bilibili_player_settings.includes('"autopart":1') && !this.option.electricSkippable) return;
                this.video.addEventListener('ended', function () {
                    setTimeout(function () {
                        var i = _this29.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0];
                        if (!i) return;
                        i.children[2].click();
                        i.style.display = 'block';
                        i.style.zIndex = 233;
                        var j = 5;
                        var h = setInterval(function () {
                            if (_this29.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) i.style.zIndex = '';
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
                if (!this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0].checked) this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0].click();
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

                var h = function h() {
                    var span = _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
                    if (!span) return;

                    var _span$textContent$spl = span.textContent.split(':'),
                        _span$textContent$spl2 = _slicedToArray(_span$textContent$spl, 2),
                        min = _span$textContent$spl2[0],
                        sec = _span$textContent$spl2[1];

                    if (!min || !sec) return;
                    var time = parseInt(min) * 60 + parseInt(sec);
                    if (time < _this30.video.duration - 10) {
                        var _h = _this30.video.muted;
                        var i = function i() {
                            if (!_this30.video.autoplay && !_this30.video.paused) {
                                _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn').click();
                            }
                            _this30.video.muted = _h;
                            _this30.video.removeEventListener('play', i);
                        };
                        _this30.video.muted = true;
                        _this30.video.addEventListener('play', i);
                        _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                    } else {
                        _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-close').click();
                        _this30.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom').children[0].style.visibility = 'hidden';
                    }
                };
                this.video.addEventListener('canplay', h);
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
                    if (_this31.video.paused) _this31.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn').click();
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
                return (top.location.pathname.match(/av\d+/) || top.location.pathname.match(/anime\/\d+/) || top.location.hash.match(/av\d+/))[0];
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
                var _this32 = this;

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
                        if (v.target.currentTime > _this32.userdata.oped[collectionId][1]) {
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
                this.playerWin.document.getElementsByClassName('bilibili-player-iconfont-volume-min')[0].click();
                this.playerWin.document.getElementsByClassName('bilibili-player-iconfont-volume-min')[0].click();
            }
        }, {
            key: 'limitedKeydownFullScreenPlay',
            value: function limitedKeydownFullScreenPlay() {
                var _this33 = this;

                var h = function h(e) {
                    if (!e.isTrusted) return;
                    if (e.key == 'Enter') {
                        if (_this33.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                            _this33.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                        }
                        if (_this33.video.paused) {
                            if (_this33.video.readyState) {
                                _this33.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn').click();
                            } else {
                                var i = function i() {
                                    _this33.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn').click();
                                    _this33.video.removeEventListener('canplay', i);
                                };
                                _this33.video.addEventListener('canplay', i);
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
                var _this34 = this;

                var r = void 0,
                    g = void 0;
                try {
                    r = SpeechRecognition;
                    g = SpeechGrammarList;
                } catch (e) {
                    try {
                        r = webkitSpeechRecognition;
                        g = webkitSpeechGrammarList;
                    } catch (e) { }
                }
                var SpeechRecognition = r,
                    SpeechGrammarList = g;

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
                            if (_this34.video.paused) _this34.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn').click();
                            _this34.hintInfo('BiliPolyfill: \u8BED\u97F3:\u64AD\u653E');
                            break;
                        case '暂停':
                            if (!_this34.video.paused) _this34.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn').click();
                            _this34.hintInfo('BiliPolyfill: \u8BED\u97F3:\u6682\u505C');
                            break;
                        case '全屏':
                            _this34.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                            _this34.hintInfo('BiliPolyfill: \u8BED\u97F3:\u5168\u5C4F');
                            break;
                        case '关闭':
                            top.window.close();
                            break;
                        case '加速':
                            _this34.setVideoSpeed(2);
                            _this34.hintInfo('BiliPolyfill: \u8BED\u97F3:\u52A0\u901F');
                            break;
                        case '减速':
                            _this34.setVideoSpeed(0.5);
                            _this34.hintInfo('BiliPolyfill: \u8BED\u97F3:\u51CF\u901F');
                            break;
                        case '下一集':
                            _this34.video.dispatchEvent(new Event('ended'));
                        default:
                            _this34.hintInfo('BiliPolyfill: \u8BED\u97F3:"' + transcript + '"\uFF1F');
                            break;
                    }
                    console && console.log(e.results);
                    console && console.log('transcript:' + transcript + ' confidence:' + e.results[0][0].confidence);
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
                var _ref57 = _asyncToGenerator(regeneratorRuntime.mark(function _callee50() {
                    var _this35 = this;

                    return regeneratorRuntime.wrap(function _callee50$(_context51) {
                        while (1) {
                            switch (_context51.prev = _context51.next) {
                                case 0:
                                    if (!this.playerWin.document.getElementsByTagName('video').length) {
                                        _context51.next = 4;
                                        break;
                                    }

                                    return _context51.abrupt('return', this.video = this.playerWin.document.getElementsByTagName('video')[0]);

                                case 4:
                                    return _context51.abrupt('return', new Promise(function (resolve) {
                                        var observer = new MutationObserver(function () {
                                            if (_this35.playerWin.document.getElementsByTagName('video').length) {
                                                observer.disconnect();
                                                resolve(_this35.video = _this35.playerWin.document.getElementsByTagName('video')[0]);
                                            }
                                        });
                                        observer.observe(_this35.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
                                    }));

                                case 5:
                                case 'end':
                                    return _context51.stop();
                            }
                        }
                    }, _callee50, this);
                }));

                function getPlayerVideo() {
                    return _ref57.apply(this, arguments);
                }

                return getPlayerVideo;
            }()
        }], [{
            key: 'openMinimizedPlayer',
            value: function openMinimizedPlayer() {
                var _this36 = this;

                var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { cid: top.cid, aid: '' };

                if (!option) throw 'usage: openMinimizedPlayer({cid[, aid]})';
                if (!option.cid) throw 'player init: cid missing';
                if (!option.aid) option.aid = '';
                var h = top.open('//www.bilibili.com/blackboard/html5player.html?cid=' + option.cid + '&aid=' + option.aid + '&crossDomain=' + (top.document.domain != 'www.bilibili.com' ? 'true' : ''), undefined, ' ');

                _asyncToGenerator(regeneratorRuntime.mark(function _callee51() {
                    var div, i;
                    return regeneratorRuntime.wrap(function _callee51$(_context52) {
                        while (1) {
                            switch (_context52.prev = _context52.next) {
                                case 0:
                                    _context52.next = 2;
                                    return new Promise(function (resolve) {
                                        h.addEventListener('load', resolve);
                                        setTimeout(function () {
                                            h.removeEventListener('load', resolve);
                                            resolve();
                                        }, 6000);
                                    });

                                case 2:
                                    div = h.document.getElementById('bilibiliPlayer');

                                    if (div) {
                                        _context52.next = 6;
                                        break;
                                    }

                                    console.warn('openMinimizedPlayer: fullscreen timeout'); return _context52.abrupt('return');

                                case 6:
                                    _context52.next = 8;
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

                                case 8:
                                    i = [div.webkitRequestFullscreen, div.mozRequestFullScreen, div.msRequestFullscreen, div.requestFullscreen];

                                    div.webkitRequestFullscreen = div.mozRequestFullScreen = div.msRequestFullscreen = div.requestFullscreen = function () { };
                                    if (h.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                                    div.webkitRequestFullscreen = i[0];
                                    div.mozRequestFullScreen = i[1];
                                    div.msRequestFullscreen = i[2];
                                    div.requestFullscreen = i[3];

                                case 15:
                                case 'end':
                                    return _context52.stop();
                            }
                        }
                    }, _callee51, _this36);
                }))();
            }
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
                var _ref59 = _asyncToGenerator(regeneratorRuntime.mark(function _callee52() {
                    return regeneratorRuntime.wrap(function _callee52$(_context53) {
                        while (1) {
                            switch (_context53.prev = _context53.next) {
                                case 0:
                                    if (!document.querySelector('#bofqi > iframe').contentDocument.getElementById('bilibiliPlayer')) {
                                        _context53.next = 4;
                                        break;
                                    }

                                    return _context53.abrupt('return', document.querySelector('#bofqi > iframe').contentWindow);

                                case 4:
                                    return _context53.abrupt('return', new Promise(function (resolve) {
                                        document.querySelector('#bofqi > iframe').addEventListener('load', function () {
                                            resolve(document.querySelector('#bofqi > iframe').contentWindow);
                                        });
                                    }));

                                case 5:
                                case 'end':
                                    return _context53.stop();
                            }
                        }
                    }, _callee52, this);
                }));

                function getIframeWin() {
                    return _ref59.apply(this, arguments);
                }

                return getIframeWin;
            }()
        }, {
            key: 'getPlayerWin',
            value: function () {
                var _ref60 = _asyncToGenerator(regeneratorRuntime.mark(function _callee53() {
                    return regeneratorRuntime.wrap(function _callee53$(_context54) {
                        while (1) {
                            switch (_context54.prev = _context54.next) {
                                case 0:
                                    if (!location.href.includes('/watchlater/#/list')) {
                                        _context54.next = 3;
                                        break;
                                    }

                                    _context54.next = 3;
                                    return new Promise(function (resolve) {
                                        var h = function h() {
                                            resolve();
                                            window.removeEventListener('hashchange', h);
                                        };
                                        window.addEventListener('hashchange', h);
                                    });

                                case 3:
                                    if (!location.href.includes('/watchlater/#/')) {
                                        _context54.next = 7;
                                        break;
                                    }

                                    if (document.getElementById('bofqi')) {
                                        _context54.next = 7;
                                        break;
                                    }

                                    _context54.next = 7;
                                    return new Promise(function (resolve) {
                                        var observer = new MutationObserver(function () {
                                            if (document.getElementById('bofqi')) {
                                                resolve();
                                                observer.disconnect();
                                            }
                                        });
                                        observer.observe(document, { childList: true, subtree: true });
                                    });

                                case 7:
                                    if (!(location.host == 'bangumi.bilibili.com')) {
                                        _context54.next = 19;
                                        break;
                                    }

                                    if (!document.querySelector('#bofqi > iframe')) {
                                        _context54.next = 12;
                                        break;
                                    }

                                    return _context54.abrupt('return', BiliUserJS.getIframeWin());

                                case 12:
                                    if (!document.querySelector('#bofqi > object')) {
                                        _context54.next = 16;
                                        break;
                                    }

                                    throw 'Need H5 Player';

                                case 16:
                                    return _context54.abrupt('return', new Promise(function (resolve) {
                                        var observer = new MutationObserver(function () {
                                            if (document.querySelector('#bofqi > iframe')) {
                                                observer.disconnect();
                                                resolve(BiliUserJS.getIframeWin());
                                            } else if (document.querySelector('#bofqi > object')) {
                                                observer.disconnect();
                                                throw 'Need H5 Player';
                                            }
                                        });
                                        observer.observe(document.getElementById('bofqi'), { childList: true });
                                    }));

                                case 17:
                                    _context54.next = 28;
                                    break;

                                case 19:
                                    if (!document.getElementById('bilibiliPlayer')) {
                                        _context54.next = 23;
                                        break;
                                    }

                                    return _context54.abrupt('return', window);

                                case 23:
                                    if (!document.querySelector('#bofqi > object')) {
                                        _context54.next = 27;
                                        break;
                                    }

                                    throw 'Need H5 Player';

                                case 27:
                                    return _context54.abrupt('return', new Promise(function (resolve) {
                                        var observer = new MutationObserver(function () {
                                            if (document.getElementById('bilibiliPlayer')) {
                                                observer.disconnect();
                                                resolve(window);
                                            } else if (document.querySelector('#bofqi > object')) {
                                                observer.disconnect();
                                                throw 'Need H5 Player';
                                            }
                                        });
                                        observer.observe(document.getElementById('bofqi'), { childList: true });
                                    }));

                                case 28:
                                case 'end':
                                    return _context54.stop();
                            }
                        }
                    }, _callee53, this);
                }));

                function getPlayerWin() {
                    return _ref60.apply(this, arguments);
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
                var _this38 = this;

                var h = document.querySelector('div.viewbox div.info') || document.querySelector('div.video-top-info div.video-info-module');
                var tminfo = document.querySelector('div.tminfo');
                var div = document.createElement('div');
                var flvA = document.createElement('a');
                var mp4A = document.createElement('a');
                var assA = document.createElement('a');
                flvA.textContent = '超清FLV';
                mp4A.textContent = '原生MP4';
                assA.textContent = '弹幕ASS';

                flvA.onmouseover = _asyncToGenerator(regeneratorRuntime.mark(function _callee54() {
                    var flvDiv;
                    return regeneratorRuntime.wrap(function _callee54$(_context55) {
                        while (1) {
                            switch (_context55.prev = _context55.next) {
                                case 0:
                                    flvA.textContent = '正在FLV';
                                    flvA.onmouseover = null;
                                    _context55.next = 4;
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
                                    return _context55.stop();
                            }
                        }
                    }, _callee54, _this38);
                }));
                mp4A.onmouseover = _asyncToGenerator(regeneratorRuntime.mark(function _callee55() {
                    return regeneratorRuntime.wrap(function _callee55$(_context56) {
                        while (1) {
                            switch (_context56.prev = _context56.next) {
                                case 0:
                                    mp4A.textContent = '正在MP4';
                                    mp4A.onmouseover = null;
                                    _context56.next = 4;
                                    return monkey.queryInfo('mp4');

                                case 4:
                                    mp4A.href = _context56.sent;

                                    mp4A.textContent = '原生MP4';
                                    mp4A.download = '';
                                    mp4A.referrerPolicy = 'origin';

                                case 8:
                                case 'end':
                                    return _context56.stop();
                            }
                        }
                    }, _callee55, _this38);
                }));
                assA.onmouseover = _asyncToGenerator(regeneratorRuntime.mark(function _callee56() {
                    return regeneratorRuntime.wrap(function _callee56$(_context57) {
                        while (1) {
                            switch (_context57.prev = _context57.next) {
                                case 0:
                                    assA.textContent = '正在ASS';
                                    assA.onmouseover = null;
                                    _context57.next = 4;
                                    return monkey.queryInfo('ass');

                                case 4:
                                    assA.href = _context57.sent;

                                    assA.textContent = '弹幕ASS';
                                    if (monkey.mp4 && monkey.mp4.match) assA.download = monkey.mp4.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0] + '.ass'; else assA.download = monkey.cid + '.ass';

                                case 7:
                                case 'end':
                                    return _context57.stop();
                            }
                        }
                    }, _callee56, _this38);
                }));

                flvA.style.fontSize = mp4A.style.fontSize = assA.style.fontSize = '16px';
                div.appendChild(flvA);
                div.appendChild(document.createTextNode(' '));
                div.appendChild(mp4A);
                div.appendChild(document.createTextNode(' '));
                div.appendChild(assA);
                div.className = 'info bilitwin';
                div.style.zIndex = '1';
                div.style.width = '32%';
                tminfo.style.float = 'left';
                tminfo.style.width = '68%';
                h.insertBefore(div, tminfo);
                return { flvA: flvA, mp4A: mp4A, assA: assA };
            }
        }, {
            key: 'genFLVDiv',
            value: function genFLVDiv(monkey) {
                var _this39 = this;

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
                tr.children[0].children[0].onclick = function () {
                    UI.copyToClipboard(flvs.join('\n'));
                };
                tr.children[1].children[0].onclick = function () {
                    UI.downloadAllFLVs(tr.children[1].children[0], monkey, table);
                };
                if (flvs[0].includes('-80.flv')) {
                    tr.children[0].innerHTML = '<a download="biliTwin.ef2">IDM导出</a>';
                    tr.children[0].children[0].href = URL.createObjectURL(new Blob([UI.exportIDM(flvs, top.location.origin)]));
                }
                table.insertRow(-1).innerHTML = '<td colspan="3">合并功能推荐配置：至少8G RAM。把自己下载的分段FLV拖动到这里，也可以合并哦~</td>';
                table.insertRow(-1).innerHTML = cache ? '<td colspan="3">下载的缓存分段会暂时停留在电脑里，过一段时间会自动消失。建议只开一个标签页。</td>' : '<td colspan="3">建议只开一个标签页。关掉标签页后，缓存就会被清理。别忘了另存为！</td>';
                UI.displayQuota(table.insertRow(-1));
                div.appendChild(table);

                div.ondragenter = div.ondragover = function (e) {
                    return UI.allowDrag(e);
                };
                div.ondrop = function () {
                    var _ref64 = _asyncToGenerator(regeneratorRuntime.mark(function _callee57(e) {
                        var files, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, file, outputName, url;

                        return regeneratorRuntime.wrap(function _callee57$(_context58) {
                            while (1) {
                                switch (_context58.prev = _context58.next) {
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
                                        _context58.prev = 6;
                                        for (_iterator8 = files[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                            file = _step8.value;

                                            table.insertRow(-1).innerHTML = '<td colspan="3">' + file.name + '</td>';
                                        }
                                        _context58.next = 14;
                                        break;

                                    case 10:
                                        _context58.prev = 10;
                                        _context58.t0 = _context58['catch'](6);
                                        _didIteratorError8 = true;
                                        _iteratorError8 = _context58.t0;

                                    case 14:
                                        _context58.prev = 14;
                                        _context58.prev = 15;

                                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                            _iterator8.return();
                                        }

                                    case 17:
                                        _context58.prev = 17;

                                        if (!_didIteratorError8) {
                                            _context58.next = 20;
                                            break;
                                        }

                                        throw _iteratorError8;

                                    case 20:
                                        return _context58.finish(17);

                                    case 21:
                                        return _context58.finish(14);

                                    case 22:
                                        outputName = files[0].name.match(/\d+-\d+(?:-\d+)?\.flv/);

                                        if (outputName) outputName = outputName[0].replace(/-\d/, ""); else outputName = 'merge_' + files[0].name;
                                        _context58.next = 26;
                                        return UI.mergeFLVFiles(files);

                                    case 26:
                                        url = _context58.sent;

                                        table.insertRow(-1).innerHTML = '<td colspan="3"><a href="' + url + '" download="' + outputName + '">' + outputName + '</a></td>';

                                    case 28:
                                    case 'end':
                                        return _context58.stop();
                                }
                            }
                        }, _callee57, _this39, [[6, 10, 14, 22], [15, , 17, 21]]);
                    }));

                    return function (_x58) {
                        return _ref64.apply(this, arguments);
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
                var _ref65 = _asyncToGenerator(regeneratorRuntime.mark(function _callee58(a, monkey, table) {
                    var i, bar, _i2, blobs, mergedFLV, url, outputName;

                    return regeneratorRuntime.wrap(function _callee58$(_context59) {
                        while (1) {
                            switch (_context59.prev = _context59.next) {
                                case 0:
                                    if (!(table.rows[0].cells.length < 3)) {
                                        _context59.next = 2;
                                        break;
                                    }

                                    return _context59.abrupt('return');

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
                                    _context59.next = 12;
                                    return monkey.getAllFLVs();

                                case 12:
                                    blobs = _context59.sent;
                                    _context59.next = 15;
                                    return FLV.mergeBlobs(blobs);

                                case 15:
                                    mergedFLV = _context59.sent;
                                    url = URL.createObjectURL(mergedFLV);
                                    outputName = document.getElementsByClassName('v-title')[0].textContent;


                                    bar.value++;
                                    _context59.t0 = '\n        <td colspan="3" style="border: 1px solid black">\n            <a href="' + url + '" download="' + outputName + '.flv">\u4FDD\u5B58\u5408\u5E76\u540EFLV</a> \n            <a href="';
                                    _context59.next = 22;
                                    return monkey.ass;

                                case 22:
                                    _context59.t1 = _context59.sent;
                                    _context59.t2 = _context59.t0 + _context59.t1;
                                    _context59.t3 = _context59.t2 + '" download="';
                                    _context59.t4 = outputName;
                                    _context59.t5 = _context59.t3 + _context59.t4;
                                    table.insertRow(0).innerHTML = _context59.t5 + '.ass">\u5F39\u5E55ASS</a> \n            \u8BB0\u5F97\u6E05\u7406\u5206\u6BB5\u7F13\u5B58\u54E6~\n        </td>\n        ';
                                    return _context59.abrupt('return', url);

                                case 29:
                                case 'end':
                                    return _context59.stop();
                            }
                        }
                    }, _callee58, this);
                }));

                function downloadAllFLVs(_x59, _x60, _x61) {
                    return _ref65.apply(this, arguments);
                }

                return downloadAllFLVs;
            }()
        }, {
            key: 'downloadFLV',
            value: function () {
                var _ref66 = _asyncToGenerator(regeneratorRuntime.mark(function _callee59(a, monkey, index) {
                    var bar = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
                    var handler, url;
                    return regeneratorRuntime.wrap(function _callee59$(_context60) {
                        while (1) {
                            switch (_context60.prev = _context60.next) {
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
                                    _context60.prev = 5;
                                    _context60.next = 8;
                                    return monkey.getFLV(index, function (loaded, total) {
                                        bar.value = loaded;
                                        bar.max = total;
                                    });

                                case 8:
                                    url = _context60.sent;

                                    url = URL.createObjectURL(url);
                                    if (bar.value == 0) bar.value = bar.max = 1;
                                    _context60.next = 19;
                                    break;

                                case 13:
                                    _context60.prev = 13;
                                    _context60.t0 = _context60['catch'](5);

                                    a.onclick = null;
                                    window.removeEventListener('beforeunload', handler);
                                    a.textContent = '错误';
                                    throw _context60.t0;

                                case 19:

                                    a.onclick = null;
                                    window.removeEventListener('beforeunload', handler);
                                    a.textContent = '另存为';
                                    a.download = monkey.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
                                    a.href = url;
                                    return _context60.abrupt('return', url);

                                case 25:
                                case 'end':
                                    return _context60.stop();
                            }
                        }
                    }, _callee59, this, [[5, 13]]);
                }));

                function downloadFLV(_x62, _x63, _x64) {
                    return _ref66.apply(this, arguments);
                }

                return downloadFLV;
            }()
        }, {
            key: 'mergeFLVFiles',
            value: function () {
                var _ref67 = _asyncToGenerator(regeneratorRuntime.mark(function _callee60(files) {
                    var merged;
                    return regeneratorRuntime.wrap(function _callee60$(_context61) {
                        while (1) {
                            switch (_context61.prev = _context61.next) {
                                case 0:
                                    _context61.next = 2;
                                    return FLV.mergeBlobs(files);

                                case 2:
                                    merged = _context61.sent;
                                    return _context61.abrupt('return', URL.createObjectURL(merged));

                                case 4:
                                case 'end':
                                    return _context61.stop();
                            }
                        }
                    }, _callee60, this);
                }));

                function mergeFLVFiles(_x66) {
                    return _ref67.apply(this, arguments);
                }

                return mergeFLVFiles;
            }()
        }, {
            key: 'clearCacheDB',
            value: function () {
                var _ref68 = _asyncToGenerator(regeneratorRuntime.mark(function _callee61(cache) {
                    return regeneratorRuntime.wrap(function _callee61$(_context62) {
                        while (1) {
                            switch (_context62.prev = _context62.next) {
                                case 0:
                                    if (!cache) {
                                        _context62.next = 2;
                                        break;
                                    }

                                    return _context62.abrupt('return', cache.deleteEntireDB());

                                case 2:
                                case 'end':
                                    return _context62.stop();
                            }
                        }
                    }, _callee61, this);
                }));

                function clearCacheDB(_x67) {
                    return _ref68.apply(this, arguments);
                }

                return clearCacheDB;
            }()
        }, {
            key: 'displayQuota',
            value: function () {
                var _ref69 = _asyncToGenerator(regeneratorRuntime.mark(function _callee62(tr) {
                    return regeneratorRuntime.wrap(function _callee62$(_context63) {
                        while (1) {
                            switch (_context63.prev = _context63.next) {
                                case 0:
                                    return _context63.abrupt('return', new Promise(function (resolve) {
                                        var temporaryStorage = window.navigator.temporaryStorage || window.navigator.webkitTemporaryStorage || window.navigator.mozTemporaryStorage || window.navigator.msTemporaryStorage;
                                        if (!temporaryStorage) return resolve(tr.innerHTML = '<td colspan="3">\u8FD9\u4E2A\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u7F13\u5B58\u5462~\u5173\u6389\u6807\u7B7E\u9875\u540E\uFF0C\u7F13\u5B58\u9A6C\u4E0A\u5C31\u4F1A\u6D88\u5931\u54E6</td>');
                                        temporaryStorage.queryUsageAndQuota(function (usage, quota) {
                                            return resolve(tr.innerHTML = '<td colspan="3">\u7F13\u5B58\u5DF2\u7528\u7A7A\u95F4\uFF1A' + Math.round(usage / 1048576) + 'MB / ' + Math.round(quota / 1048576) + 'MB \u4E5F\u5305\u62EC\u4E86B\u7AD9\u672C\u6765\u7684\u7F13\u5B58</td>');
                                        });
                                    }));

                                case 1:
                                case 'end':
                                    return _context63.stop();
                            }
                        }
                    }, _callee62, this);
                }));

                function displayQuota(_x68) {
                    return _ref69.apply(this, arguments);
                }

                return displayQuota;
            }()

            // Menu Append

        }, {
            key: 'menuAppend',
            value: function menuAppend(playerWin, _ref70) {
                var monkey = _ref70.monkey,
                    monkeyTitle = _ref70.monkeyTitle,
                    polyfill = _ref70.polyfill,
                    displayPolyfillDataDiv = _ref70.displayPolyfillDataDiv,
                    optionDiv = _ref70.optionDiv;

                var monkeyMenu = UI.genMonkeyMenu(playerWin, { monkey: monkey, monkeyTitle: monkeyTitle, optionDiv: optionDiv });
                var polyfillMenu = UI.genPolyfillMenu(playerWin, { polyfill: polyfill, displayPolyfillDataDiv: displayPolyfillDataDiv, optionDiv: optionDiv });
                var ul = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0].children[0];
                ul.appendChild(monkeyMenu);
                ul.appendChild(polyfillMenu);

                var observer = new MutationObserver(function (record) {
                    if (ul.children.length > 2 && ul.children[ul.children.length - 2] == monkeyMenu && ul.children[ul.children.length - 1] == polyfillMenu) {
                        ul.insertBefore(polyfillMenu, ul.firstChild);
                        ul.insertBefore(monkeyMenu, ul.firstChild);
                    }
                    if (ul.children.length == 0) {
                        observer.disconnect();
                    }
                });
                observer.observe(playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0], { attributes: true });
            }
        }, {
            key: 'genMonkeyMenu',
            value: function genMonkeyMenu(playerWin, _ref71) {
                var _this40 = this;

                var monkey = _ref71.monkey,
                    monkeyTitle = _ref71.monkeyTitle,
                    optionDiv = _ref71.optionDiv;

                var li = playerWin.document.createElement('li');
                li.className = 'context-menu-menu bilitwin';
                li.innerHTML = '\n            <a class="context-menu-a">\n                BiliMonkey\n                <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n            </a>\n            <ul>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u4E0B\u8F7DFLV\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u4E0B\u8F7DMP4\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u4E0B\u8F7DASS\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u8F7D\u5165\u7F13\u5B58FLV\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u5F3A\u5236\u5237\u65B0\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u91CD\u542F\u811A\u672C\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u9500\u6BC1\u64AD\u653E\u5668\n                    </a>\n                </li>\n            </ul>\n            ';
                li.onclick = function () {
                    return playerWin.document.getElementById('bilibiliPlayer').click();
                };
                var ul = li.children[1];
                ul.children[0].onclick = _asyncToGenerator(regeneratorRuntime.mark(function _callee63() {
                    return regeneratorRuntime.wrap(function _callee63$(_context64) {
                        while (1) {
                            switch (_context64.prev = _context64.next) {
                                case 0:
                                    if (!monkeyTitle.flvA.onmouseover) {
                                        _context64.next = 3;
                                        break;
                                    }

                                    _context64.next = 3;
                                    return monkeyTitle.flvA.onmouseover();

                                case 3:
                                    monkeyTitle.flvA.click();
                                case 4:
                                case 'end':
                                    return _context64.stop();
                            }
                        }
                    }, _callee63, _this40);
                }));
                ul.children[1].onclick = _asyncToGenerator(regeneratorRuntime.mark(function _callee64() {
                    return regeneratorRuntime.wrap(function _callee64$(_context65) {
                        while (1) {
                            switch (_context65.prev = _context65.next) {
                                case 0:
                                    if (!monkeyTitle.mp4A.onmouseover) {
                                        _context65.next = 3;
                                        break;
                                    }

                                    _context65.next = 3;
                                    return monkeyTitle.mp4A.onmouseover();

                                case 3:
                                    monkeyTitle.mp4A.click();
                                case 4:
                                case 'end':
                                    return _context65.stop();
                            }
                        }
                    }, _callee64, _this40);
                }));
                ul.children[2].onclick = _asyncToGenerator(regeneratorRuntime.mark(function _callee65() {
                    return regeneratorRuntime.wrap(function _callee65$(_context66) {
                        while (1) {
                            switch (_context66.prev = _context66.next) {
                                case 0:
                                    if (!monkeyTitle.assA.onmouseover) {
                                        _context66.next = 3;
                                        break;
                                    }

                                    _context66.next = 3;
                                    return monkeyTitle.assA.onmouseover();

                                case 3:
                                    monkeyTitle.assA.click();
                                case 4:
                                case 'end':
                                    return _context66.stop();
                            }
                        }
                    }, _callee65, _this40);
                }));
                ul.children[3].onclick = function () {
                    optionDiv.style.display = 'block';
                };
                ul.children[4].onclick = _asyncToGenerator(regeneratorRuntime.mark(function _callee66() {
                    return regeneratorRuntime.wrap(function _callee66$(_context67) {
                        while (1) {
                            switch (_context67.prev = _context67.next) {
                                case 0:
                                    monkey.proxy = true;
                                    monkey.flvs = null;
                                    UI.hintInfo('请稍候，可能需要10秒时间……', playerWin);
                                    // Yes, I AM lazy.
                                    playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div > ul > li:nth-child(1)').click();
                                    _context67.next = 6;
                                    return new Promise(function (r) {
                                        return playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', r);
                                    });

                                case 6:
                                    return _context67.abrupt('return', monkey.queryInfo('flv'));

                                case 7:
                                case 'end':
                                    return _context67.stop();
                            }
                        }
                    }, _callee66, _this40);
                }));
                ul.children[5].onclick = function () {
                    top.location.reload(true);
                };
                ul.children[6].onclick = function () {
                    playerWin.dispatchEvent(new Event('unload'));
                };
                ul.children[7].onclick = function () {
                    playerWin.player ? playerWin.player.destroy() : undefined;
                };
                return li;
            }
        }, {
            key: 'genPolyfillMenu',
            value: function genPolyfillMenu(playerWin, _ref76) {
                var polyfill = _ref76.polyfill,
                    displayPolyfillDataDiv = _ref76.displayPolyfillDataDiv,
                    optionDiv = _ref76.optionDiv;

                var li = playerWin.document.createElement('li');
                li.className = 'context-menu-menu bilitwin';
                li.innerHTML = '\n            <a class="context-menu-a">\n                BiliPolyfill\n                <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n            </a>\n            <ul>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u5207\u7247:<span></span>\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u83B7\u53D6\u5C01\u9762\n                    </a>\n                </li>\n                <li class="context-menu-menu">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u66F4\u591A\u64AD\u653E\u901F\u5EA6\n                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n                    </a>\n                    <ul>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> 0.1\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> 3\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u70B9\u51FB\u786E\u8BA4\n                                <input type="text" style="width: 35px; height: 70%">\n                            </a>\n                        </li>\n                    </ul>\n                </li>\n                <li class="context-menu-menu">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u7247\u5934\u7247\u5C3E\n                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n                    </a>\n                    <ul>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u6807\u8BB0\u7247\u5934:<span></span>\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u6807\u8BB0\u7247\u5C3E:<span></span>\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u53D6\u6D88\u6807\u8BB0\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> \u68C0\u89C6\u6570\u636E\n                            </a>\n                        </li>\n                    </ul>\n                </li>\n                <li class="context-menu-menu">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u627E\u4E0A\u4E0B\u96C6\n                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>\n                    </a>\n                    <ul>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> <span></span>\n                            </a>\n                        </li>\n                        <li class="context-menu-function">\n                            <a class="context-menu-a">\n                                <span class="video-contextmenu-icon"></span> <span></span>\n                            </a>\n                        </li>\n                    </ul>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u5C0F\u7A97\u64AD\u653E\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u7ACB\u5373\u4FDD\u5B58\u6570\u636E\n                    </a>\n                </li>\n                <li class="context-menu-function">\n                    <a class="context-menu-a">\n                        <span class="video-contextmenu-icon"></span> (\u6D4B)\u5F3A\u5236\u6E05\u7A7A\u6570\u636E\n                    </a>\n                </li>\n            </ul>\n            ';
                li.onclick = function () {
                    return playerWin.document.getElementById('bilibiliPlayer').click();
                };
                var ul = li.children[1];
                ul.children[0].onclick = function () {
                    polyfill.video.dispatchEvent(new Event('ended'));
                };
                ul.children[1].onclick = function () {
                    top.window.open(polyfill.getCoverImage(), '_blank');
                };

                ul.children[2].children[1].children[0].onclick = function () {
                    polyfill.setVideoSpeed(0.1);
                };
                ul.children[2].children[1].children[1].onclick = function () {
                    polyfill.setVideoSpeed(3);
                };
                ul.children[2].children[1].children[2].onclick = function () {
                    polyfill.setVideoSpeed(ul.children[2].children[1].children[2].getElementsByTagName('input')[0].value);
                };
                ul.children[2].children[1].children[2].getElementsByTagName('input')[0].onclick = function (e) {
                    return e.stopPropagation();
                };

                ul.children[3].children[1].children[0].onclick = function () {
                    polyfill.markOPPosition();
                };
                ul.children[3].children[1].children[1].onclick = function () {
                    polyfill.markEDPostion(3);
                };
                ul.children[3].children[1].children[2].onclick = function () {
                    polyfill.clearOPEDPosition();
                };
                ul.children[3].children[1].children[3].onclick = function () {
                    displayPolyfillDataDiv(polyfill);
                };

                ul.children[4].children[1].children[0].getElementsByTagName('a')[0].style.width = 'initial';
                ul.children[4].children[1].children[1].getElementsByTagName('a')[0].style.width = 'initial';

                ul.children[5].onclick = function () {
                    BiliPolyfill.openMinimizedPlayer();
                };
                ul.children[6].onclick = function () {
                    optionDiv.style.display = 'block';
                };
                ul.children[7].onclick = function () {
                    polyfill.saveUserdata();
                };
                ul.children[8].onclick = function () {
                    BiliPolyfill.clearAllUserdata(playerWin);
                    polyfill.retriveUserdata();
                };

                li.onmouseenter = function () {
                    var ul = li.children[1];
                    ul.children[0].children[0].getElementsByTagName('span')[1].textContent = polyfill.autoNextDestination;

                    ul.children[2].children[1].children[2].getElementsByTagName('input')[0].value = polyfill.video.playbackRate;

                    ul.children[4].children[1].children[0].onclick = function () {
                        if (polyfill.series[0]) top.window.open('https://www.bilibili.com/video/av' + polyfill.series[0].aid, '_blank');
                    };
                    ul.children[4].children[1].children[1].onclick = function () {
                        if (polyfill.series[1]) top.window.open('https://www.bilibili.com/video/av' + polyfill.series[1].aid, '_blank');
                    };
                    ul.children[4].children[1].children[0].getElementsByTagName('span')[1].textContent = polyfill.series[0] ? polyfill.series[0].title : '找不到';
                    ul.children[4].children[1].children[1].getElementsByTagName('span')[1].textContent = polyfill.series[1] ? polyfill.series[1].title : '找不到';

                    var oped = polyfill.userdata.oped[polyfill.getCollectionId()] || [];
                    ul.children[3].children[1].children[0].getElementsByTagName('span')[1].textContent = oped[0] ? BiliPolyfill.secondToReadable(oped[0]) : '无';
                    ul.children[3].children[1].children[1].getElementsByTagName('span')[1].textContent = oped[1] ? BiliPolyfill.secondToReadable(oped[1]) : '无';
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
                ['badgeWatchLater', '稍后再看添加数字角标'], ['dblclick', '双击全屏'], ['scroll', '自动滚动到播放器'], ['recommend', '弹幕列表换成相关视频'], ['autoNext', '右键菜单换P(B站原生按钮BUG:刷新后总会跳到2P)'],
                //['autoNextTimeout', '快速换P等待时间(毫秒)'],
                //['autoNextRecommend', '右键菜单跳转相关视频'],
                ['electric', '整合充电榜与换P倒计时'],
                //['electricSkippable', '跳过充电榜'],
                ['lift', '自动防挡字幕'], ['autoResume', '自动跳转上次看到'], ['autoPlay', '自动播放'], ['autoWideScreen', '自动宽屏'], ['autoFullScreen', '自动全屏'], ['oped', '标记后自动跳OP/ED'], ['focus', '自动聚焦到播放器'], ['limitedKeydown', '首次回车键可全屏自动播放'], ['speech', '(测)(需墙外)任意三击鼠标左键开启语音识别'], ['series', '(测)尝试自动找上下集']];

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
                        autoNext: true,
                        autoNextTimeout: 2000,
                        autoNextRecommend: false,
                        electric: true,
                        electricSkippable: false,
                        lift: true,
                        autoResume: true,
                        autoPlay: false,
                        autoWideScreen: false,
                        autoFullScreen: false,
                        oped: true,
                        focus: true,
                        limitedKeydown: true,
                        speech: false,
                        series: true,
                        betabeta: false
                    };
                    return Object.assign({}, defaultOption, rawOption, top.debugOption);
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
                    top.debugOption.proxy = false;
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
            key: 'watchLaterClearnce',
            value: function watchLaterClearnce() {
                if (location.pathname == '/watchlater/') {
                    var style = document.createElement('style');
                    style.type = 'text/css';
                    style.rel = 'stylesheet';
                    style.textContent = '\n                .bilitwin a {\n                    cursor: pointer;\n                    color: #00a1d6;\n                }\n\n                div.video-top-info > div.video-info-module > div.info.bilitwin {\n                    padding-top: 5px;\n                    float: left;\n                }\n                ';
                    document.head.appendChild(style);
                }
            }
        }, {
            key: 'cleanUp',
            value: function cleanUp() {
                Array.from(document.getElementsByClassName('bilitwin')).filter(function (e) {
                    return e.textContent.includes('FLV分段');
                }).forEach(function (e) {
                    return Array.from(e.getElementsByTagName('a')).forEach(function (e) {
                        return e.textContent == '取消' ? e.click() : undefined;
                    });
                });
                Array.from(document.getElementsByClassName('bilitwin')).forEach(function (e) {
                    return e.remove();
                });
            }
        }, {
            key: 'start',
            value: function () {
                var _ref77 = _asyncToGenerator(regeneratorRuntime.mark(function _callee69() {
                    var _this41 = this;

                    var cidRefresh, playerWin, option, optionDiv, monkeyTitle, displayPolyfillDataDiv, _ref78, _ref79, monkey, polyfill, h, _ref82;

                    return regeneratorRuntime.wrap(function _callee69$(_context70) {
                        while (1) {
                            switch (_context70.prev = _context70.next) {
                                case 0:
                                    cidRefresh = new AsyncContainer();

                                    // 1. playerWin and option

                                    playerWin = void 0;
                                    _context70.prev = 2;
                                    _context70.next = 5;
                                    return UI.getPlayerWin();

                                case 5:
                                    playerWin = _context70.sent;
                                    _context70.next = 12;
                                    break;

                                case 8:
                                    _context70.prev = 8;
                                    _context70.t0 = _context70['catch'](2);

                                    if (_context70.t0 == 'Need H5 Player') UI.requestH5Player();
                                    throw _context70.t0;

                                case 12:
                                    option = UI.getOption(playerWin);
                                    optionDiv = UI.genOptionDiv(option);

                                    document.body.appendChild(optionDiv);

                                    // 2. monkey and polyfill
                                    monkeyTitle = void 0;

                                    displayPolyfillDataDiv = function displayPolyfillDataDiv(polyfill) {
                                        return UI.displayPolyfillDataDiv(polyfill);
                                    };

                                    _context70.next = 19;
                                    return Promise.all([_asyncToGenerator(regeneratorRuntime.mark(function _callee67() {
                                        var monkey;
                                        return regeneratorRuntime.wrap(function _callee67$(_context68) {
                                            while (1) {
                                                switch (_context68.prev = _context68.next) {
                                                    case 0:
                                                        monkey = new BiliMonkey(playerWin, option);
                                                        _context68.next = 3;
                                                        return monkey.execOptions();

                                                    case 3:
                                                        monkeyTitle = UI.titleAppend(monkey);
                                                        return _context68.abrupt('return', monkey);

                                                    case 5:
                                                    case 'end':
                                                        return _context68.stop();
                                                }
                                            }
                                        }, _callee67, _this41);
                                    }))(), _asyncToGenerator(regeneratorRuntime.mark(function _callee68() {
                                        var polyfill;
                                        return regeneratorRuntime.wrap(function _callee68$(_context69) {
                                            while (1) {
                                                switch (_context69.prev = _context69.next) {
                                                    case 0:
                                                        polyfill = new BiliPolyfill(playerWin, option, function (t) {
                                                            return UI.hintInfo(t, playerWin);
                                                        });
                                                        _context69.next = 3;
                                                        return polyfill.setFunctions();

                                                    case 3:
                                                        return _context69.abrupt('return', polyfill);

                                                    case 4:
                                                    case 'end':
                                                        return _context69.stop();
                                                }
                                            }
                                        }, _callee68, _this41);
                                    }))()]);

                                case 19:
                                    _ref78 = _context70.sent;
                                    _ref79 = _slicedToArray(_ref78, 2);
                                    monkey = _ref79[0];
                                    polyfill = _ref79[1];


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
                                    if (top.debugOption && top.debugOption.debug && top.console) top.console.clear();
                                    if (top.debugOption && top.debugOption.debug) {
                                        ;

                                        _ref82 = [monkey, polyfill];
                                        (top.unsafeWindow || top).m = _ref82[0];
                                        (top.unsafeWindow || top).p = _ref82[1];
                                    } _context70.next = 31;
                                    return cidRefresh;

                                case 31:
                                    UI.cleanUp();

                                case 32:
                                case 'end':
                                    return _context70.stop();
                            }
                        }
                    }, _callee69, this, [[2, 8]]);
                }));

                function start() {
                    return _ref77.apply(this, arguments);
                }

                return start;
            }()
        }, {
            key: 'init',
            value: function () {
                var _ref83 = _asyncToGenerator(regeneratorRuntime.mark(function _callee70() {
                    return regeneratorRuntime.wrap(function _callee70$(_context71) {
                        while (1) {
                            switch (_context71.prev = _context71.next) {
                                case 0:
                                    if (document.body) {
                                        _context71.next = 2;
                                        break;
                                    }

                                    return _context71.abrupt('return');

                                case 2:
                                    UI.outdatedEngineClearance();
                                    UI.firefoxClearance();
                                    UI.watchLaterClearnce();

                                case 5:
                                    if (!1) {
                                        _context71.next = 10;
                                        break;
                                    }

                                    _context71.next = 8;
                                    return UI.start();

                                case 8:
                                    _context71.next = 5;
                                    break;

                                case 10:
                                case 'end':
                                    return _context71.stop();
                            }
                        }
                    }, _callee70, this);
                }));

                function init() {
                    return _ref83.apply(this, arguments);
                }

                return init;
            }()
        }]);

        return UI;
    }(BiliUserJS);

    UI.init();
});