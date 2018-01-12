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

let debugOption = {
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

class TwentyFourDataView extends DataView {
    constructor(...args) {
        if (TwentyFourDataView.es6) {
            super(...args);
        }
        else {
            // ES5 polyfill
            // It is dirty. Very dirty.
            if (TwentyFourDataView.es6 === undefined) {
                try {
                    TwentyFourDataView.es6 = 1;
                    return super(...args);
                }
                catch (e) {
                    if (e.name == 'TypeError') {
                        TwentyFourDataView.es6 = 0;
                        let setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
                            obj.__proto__ = proto;
                            return obj;
                        };
                        setPrototypeOf(TwentyFourDataView, Object);
                    }
                    else throw e;
                }
            }
            super();
            let _dataView = new DataView(...args);
            _dataView.getUint24 = TwentyFourDataView.prototype.getUint24;
            _dataView.setUint24 = TwentyFourDataView.prototype.setUint24;
            _dataView.indexOf = TwentyFourDataView.prototype.indexOf;
            return _dataView;
        }
    }

    getUint24(byteOffset, littleEndian) {
        if (littleEndian) throw 'littleEndian int24 not implemented';
        return this.getUint32(byteOffset - 1) & 0x00FFFFFF;
    }

    setUint24(byteOffset, value, littleEndian) {
        if (littleEndian) throw 'littleEndian int24 not implemented';
        if (value > 0x00FFFFFF) throw 'setUint24: number out of range';
        let msb = value >> 16;
        let lsb = value & 0xFFFF;
        this.setUint8(byteOffset, msb);
        this.setUint16(byteOffset + 1, lsb);
    }

    indexOf(search, startOffset = 0, endOffset = this.byteLength - search.length + 1) {
        // I know it is NAIVE
        if (search.charCodeAt) {
            for (let i = startOffset; i < endOffset; i++) {
                if (this.getUint8(i) != search.charCodeAt(0)) continue;
                let found = 1;
                for (let j = 0; j < search.length; j++) {
                    if (this.getUint8(i + j) != search.charCodeAt(j)) {
                        found = 0;
                        break;
                    }
                }
                if (found) return i;
            }
            return -1;
        }
        else {
            for (let i = startOffset; i < endOffset; i++) {
                if (this.getUint8(i) != search[0]) continue;
                let found = 1;
                for (let j = 0; j < search.length; j++) {
                    if (this.getUint8(i + j) != search[j]) {
                        found = 0;
                        break;
                    }
                }
                if (found) return i;
            }
            return -1;
        }
    }
}

class FLVTag {
    constructor(dataView, currentOffset = 0) {
        this.tagHeader = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset, 11);
        this.tagData = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset + 11, this.dataSize);
        this.previousSize = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset + 11 + this.dataSize, 4);
    }

    get tagType() {
        return this.tagHeader.getUint8(0);
    }

    get dataSize() {
        return this.tagHeader.getUint24(1);
    }

    get timestamp() {
        return this.tagHeader.getUint24(4);
    }

    get timestampExtension() {
        return this.tagHeader.getUint8(7);
    }

    get streamID() {
        return this.tagHeader.getUint24(8);
    }

    stripKeyframesScriptData() {
        let hasKeyframes = 'hasKeyframes\x01';
        let keyframes = '\x00\x09keyframs\x03';
        if (this.tagType != 0x12) throw 'can not strip non-scriptdata\'s keyframes';

        let index;
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

    getDuration() {
        if (this.tagType != 0x12) throw 'can not find non-scriptdata\'s duration';

        let duration = 'duration\x00';
        let index = this.tagData.indexOf(duration);
        if (index == -1) throw 'can not get flv meta duration';

        index += 9;
        return this.tagData.getFloat64(index);
    }

    getDurationAndView() {
        if (this.tagType != 0x12) throw 'can not find non-scriptdata\'s duration';

        let duration = 'duration\x00';
        let index = this.tagData.indexOf(duration);
        if (index == -1) throw 'can not get flv meta duration';

        index += 9;
        return {
            duration: this.tagData.getFloat64(index),
            durationDataView: new TwentyFourDataView(this.tagData.buffer, this.tagData.byteOffset + index, 8)
        };
    }

    getCombinedTimestamp() {
        return (this.timestampExtension << 24 | this.timestamp);
    }

    setCombinedTimestamp(timestamp) {
        if (timestamp < 0) throw 'timestamp < 0';
        this.tagHeader.setUint8(7, timestamp >> 24);
        this.tagHeader.setUint24(4, timestamp & 0x00FFFFFF);
    }
}

class FLV {
    constructor(dataView) {
        if (dataView.indexOf('FLV', 0, 1) != 0) throw 'Invalid FLV header';
        this.header = new TwentyFourDataView(dataView.buffer, dataView.byteOffset, 9);
        this.firstPreviousTagSize = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + 9, 4);

        this.tags = [];
        let offset = this.headerLength + 4;
        while (offset < dataView.byteLength) {
            let tag = new FLVTag(dataView, offset);
            // debug for scrpit data tag
            // if (tag.tagType != 0x08 && tag.tagType != 0x09) 
            offset += 11 + tag.dataSize + 4;
            this.tags.push(tag);
        }

        if (offset != dataView.byteLength) throw 'FLV unexpected end of file';
    }

    get type() {
        return 'FLV';
    }

    get version() {
        return this.header.getUint8(3);
    }

    get typeFlag() {
        return this.header.getUint8(4);
    }

    get headerLength() {
        return this.header.getUint32(5);
    }

    static merge(flvs) {
        if (flvs.length < 1) throw 'Usage: FLV.merge([flvs])';
        let blobParts = [];
        let basetimestamp = [0, 0];
        let lasttimestamp = [0, 0];
        let duration = 0.0;
        let durationDataView;

        blobParts.push(flvs[0].header);
        blobParts.push(flvs[0].firstPreviousTagSize);

        for (let flv of flvs) {
            let bts = duration * 1000;
            basetimestamp[0] = lasttimestamp[0];
            basetimestamp[1] = lasttimestamp[1];
            bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
            let foundDuration = 0;
            for (let tag of flv.tags) {
                if (tag.tagType == 0x12 && !foundDuration) {
                    duration += tag.getDuration();
                    foundDuration = 1;
                    if (flv == flvs[0]) {
                        ({ duration, durationDataView } = tag.getDurationAndView());
                        tag.stripKeyframesScriptData();
                        blobParts.push(tag.tagHeader);
                        blobParts.push(tag.tagData);
                        blobParts.push(tag.previousSize);
                    }
                }
                else if (tag.tagType == 0x08 || tag.tagType == 0x09) {
                    lasttimestamp[tag.tagType - 0x08] = bts + tag.getCombinedTimestamp();
                    tag.setCombinedTimestamp(lasttimestamp[tag.tagType - 0x08]);
                    blobParts.push(tag.tagHeader);
                    blobParts.push(tag.tagData);
                    blobParts.push(tag.previousSize);
                }
            }
        }
        durationDataView.setFloat64(0, duration);

        return new Blob(blobParts);
    }

    static async mergeBlobs(blobs) {
        // Blobs can be swapped to disk, while Arraybuffers can not.
        // This is a RAM saving workaround. Somewhat.
        if (blobs.length < 1) throw 'Usage: FLV.mergeBlobs([blobs])';
        let resultParts = [];
        let basetimestamp = [0, 0];
        let lasttimestamp = [0, 0];
        let duration = 0.0;
        let durationDataView;

        for (let blob of blobs) {
            let bts = duration * 1000;
            basetimestamp[0] = lasttimestamp[0];
            basetimestamp[1] = lasttimestamp[1];
            bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
            let foundDuration = 0;

            let flv = await new Promise((resolve, reject) => {
                let fr = new FileReader();
                fr.onload = () => resolve(new FLV(new TwentyFourDataView(fr.result)));
                fr.readAsArrayBuffer(blob);
                fr.onerror = reject;
            });

            for (let tag of flv.tags) {
                if (tag.tagType == 0x12 && !foundDuration) {
                    duration += tag.getDuration();
                    foundDuration = 1;
                    if (blob == blobs[0]) {
                        resultParts.push(new Blob([flv.header, flv.firstPreviousTagSize]));
                        ({ duration, durationDataView } = tag.getDurationAndView());
                        tag.stripKeyframesScriptData();
                        resultParts.push(new Blob([tag.tagHeader]));
                        resultParts.push(tag.tagData);
                        resultParts.push(new Blob([tag.previousSize]));
                    }
                }
                else if (tag.tagType == 0x08 || tag.tagType == 0x09) {
                    lasttimestamp[tag.tagType - 0x08] = bts + tag.getCombinedTimestamp();
                    tag.setCombinedTimestamp(lasttimestamp[tag.tagType - 0x08]);
                    resultParts.push(new Blob([tag.tagHeader, tag.tagData, tag.previousSize]));
                }
            }
        }
        durationDataView.setFloat64(0, duration);

        return new Blob(resultParts);
    }
}

class CacheDB {
    constructor(dbName = 'biliMonkey', osName = 'flv', keyPath = 'name', maxItemSize = 100 * 1024 * 1024) {
        this.dbName = dbName;
        this.osName = osName;
        this.keyPath = keyPath;
        this.maxItemSize = maxItemSize;
        this.db = null;
    }

    async getDB() {
        if (this.db) return this.db;
        this.db = new Promise((resolve, reject) => {
            let openRequest = indexedDB.open(this.dbName);
            openRequest.onupgradeneeded = e => {
                let db = e.target.result;
                if (!db.objectStoreNames.contains(this.osName)) {
                    db.createObjectStore(this.osName, { keyPath: this.keyPath });
                }
            }
            openRequest.onsuccess = e => {
                resolve(this.db = e.target.result);
            }
            openRequest.onerror = reject;
        });
        return this.db;
    }

    async addData(item, name = item.name, data = item.data) {
        if (!data instanceof Blob) throw 'CacheDB: data must be a Blob';
        let db = await this.getDB();
        let itemChunks = [];
        let numChunks = Math.ceil(data.size / this.maxItemSize);
        for (let i = 0; i < numChunks; i++) {
            itemChunks.push({
                name: `${name}_part_${i}`,
                numChunks,
                data: data.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
            });
        }
        let reqArr = [];
        for (let chunk of itemChunks) {
            reqArr.push(new Promise((resolve, reject) => {
                let req = db
                    .transaction([this.osName], 'readwrite')
                    .objectStore(this.osName)
                    .add(chunk);
                req.onsuccess = resolve;
                req.onerror = reject;
            }));
        }

        return Promise.all(reqArr);
    }

    async putData(item, name = item.name, data = item.data) {
        if (!data instanceof Blob) throw 'CacheDB: data must be a Blob';
        let db = await this.getDB();
        let itemChunks = [];
        let numChunks = Math.ceil(data.size / this.maxItemSize);
        for (let i = 0; i < numChunks; i++) {
            itemChunks.push({
                name: `${name}_part_${i}`,
                numChunks,
                data: data.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
            });
        }
        let reqArr = [];
        for (let chunk of itemChunks) {
            reqArr.push(new Promise((resolve, reject) => {
                let req = db
                    .transaction([this.osName], 'readwrite')
                    .objectStore(this.osName)
                    .put(chunk);
                req.onsuccess = resolve;
                req.onerror = reject;
            }));
        }

        return Promise.all(reqArr);
    }

    async getData(index) {
        let db = await this.getDB();
        let item_0 = await new Promise((resolve, reject) => {
            let req = db
                .transaction([this.osName])
                .objectStore(this.osName)
                .get(`${index}_part_0`);
            req.onsuccess = () => resolve(req.result);
            req.onerror = reject;
        });
        if (!item_0) return undefined;
        let { numChunks, data: data_0 } = item_0;

        let reqArr = [Promise.resolve(data_0)];
        for (let i = 1; i < numChunks; i++) {
            reqArr.push(new Promise((resolve, reject) => {
                let req = db
                    .transaction([this.osName])
                    .objectStore(this.osName)
                    .get(`${index}_part_${i}`);
                req.onsuccess = () => resolve(req.result.data);
                req.onerror = reject;
            }));
        }

        let itemChunks = await Promise.all(reqArr);
        return { name: index, data: new Blob(itemChunks) };
    }

    async deleteData(index) {
        let db = await this.getDB();
        let item_0 = await new Promise((resolve, reject) => {
            let req = db
                .transaction([this.osName])
                .objectStore(this.osName)
                .get(`${index}_part_0`);
            req.onsuccess = () => resolve(req.result);
            req.onerror = reject;
        });
        if (!item_0) return undefined;
        let numChunks = item_0.numChunks;

        let reqArr = [];
        for (let i = 0; i < numChunks; i++) {
            reqArr.push(new Promise((resolve, reject) => {
                let req = db
                    .transaction([this.osName], 'readwrite')
                    .objectStore(this.osName)
                    .delete(`${index}_part_${i}`);
                req.onsuccess = resolve;
                req.onerror = reject;
            }));
        }
        return Promise.all(reqArr);
    }

    async deleteEntireDB() {
        let req = indexedDB.deleteDatabase(this.dbName);
        return new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(this.db = null);
            req.onerror = reject;
        });
    }
}

class DetailedFetchBlob {
    constructor(input, init = {}, onprogress = init.onprogress, onabort = init.onabort, onerror = init.onerror, fetch = init.fetch || top.fetch) {
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
        this.blobPromise = fetch(input, init).then(res => {
            if (this.reader == 'abort') return res.body.getReader().cancel().then(() => null);
            if (!res.ok) throw `HTTP Error ${res.status}: ${res.statusText}`;
            this.lengthComputable = res.headers.has('Content-Length');
            this.total += parseInt(res.headers.get('Content-Length')) || Infinity;
            if (this.lengthComputable) {
                this.reader = res.body.getReader();
                return this.blob = this.consume();
            }
            else {
                if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
                return this.blob = res.blob();
            }
        });
        this.blobPromise.then(() => this.abort = () => { });
        this.blobPromise.catch(e => this.onerror({ target: this, type: e }));
        this.promise = Promise.race([
            this.blobPromise,
            new Promise(resolve => this.abort = () => {
                this.onabort({ target: this, type: 'abort' });
                resolve('abort');
                this.buffer = [];
                this.blob = null;
                if (this.reader) this.reader.cancel();
                else this.reader = 'abort';
            })
        ]).then(s => s == 'abort' ? new Promise(() => { }) : s);
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
    }

    getPartialBlob() {
        return new Blob(this.buffer);
    }

    async getBlob() {
        return this.promise;
    }

    async pump() {
        while (true) {
            let { done, value } = await this.reader.read();
            if (done) return this.loaded;
            this.loaded += value.byteLength;
            this.buffer.push(new Blob([value]));
            if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
        }
    }

    async consume() {
        await this.pump();
        this.blob = new Blob(this.buffer);
        this.buffer = null;
        return this.blob;
    }

    firefoxConstructor(input, init = {}, onprogress = init.onprogress, onabort = init.onabort, onerror = init.onerror) {
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
        this.blobPromise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'moz-chunked-arraybuffer';
            xhr.onload = () => { resolve(this.blob = new Blob(this.buffer)); this.buffer = null; }
            let cacheLoaded = this.loaded;
            xhr.onprogress = e => {
                this.loaded = e.loaded + cacheLoaded;
                this.total = e.total + cacheLoaded;
                this.lengthComputable = e.lengthComputable;
                this.buffer.push(new Blob([xhr.response]));
                if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
            };
            xhr.onabort = e => this.onabort({ target: this, type: 'abort' });
            xhr.onerror = e => { this.onerror({ target: this, type: e.type }); reject(e); };
            this.abort = xhr.abort.bind(xhr);
            xhr.open('get', input);
            xhr.send();
        });
        this.promise = this.blobPromise;
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
        return true;
    }
}

class Mutex {
    constructor() {
        this.queueTail = Promise.resolve();
        this.resolveHead = null;
    }

    async lock() {
        let myResolve;
        let _queueTail = this.queueTail;
        this.queueTail = new Promise(resolve => myResolve = resolve);
        await _queueTail;
        this.resolveHead = myResolve;
        return;
    }

    unlock() {
        this.resolveHead();
        return;
    }

    async lockAndAwait(asyncFunc) {
        await this.lock();
        let ret;
        try {
            ret = await asyncFunc();
        }
        finally {
            this.unlock();
        }
        return ret;
    }

    static _UNIT_TEST() {
        let m = new Mutex();
        function sleep(time) {
            return new Promise(r => setTimeout(r, time));
        }
        m.lockAndAwait(() => {
            console.warn('Check message timestamps.');
            console.warn('Bad:');
            console.warn('1 1 1 1 1:5s');
            console.warn(' 1 1 1 1 1:10s');
            console.warn('Good:');
            console.warn('1 1 1 1 1:5s');
            console.warn('         1 1 1 1 1:10s');
        });
        m.lockAndAwait(async () => {
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
        });
        m.lockAndAwait(async () => console.log('5s!'));
        m.lockAndAwait(async () => {
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
        });
        m.lockAndAwait(async () => console.log('10s!'));
    }
}

class AsyncContainer {
    // Yes, this is something like cancelable Promise. But I insist they are different.
    constructor() {
        //this.state = 0; // I do not know why will I need this.
        this.resolve = null;
        this.reject = null;
        this.hang = null;
        this.hangReturn = Symbol();
        this.primaryPromise = new Promise((s, j) => {
            this.resolve = arg => { s(arg); return arg; }
            this.reject = arg => { j(arg); return arg; }
        });
        //this.primaryPromise.then(() => this.state = 1);
        //this.primaryPromise.catch(() => this.state = 2);
        this.hangPromise = new Promise(s => this.hang = () => s(this.hangReturn));
        //this.hangPromise.then(() => this.state = 3);
        this.promise = Promise
            .race([this.primaryPromise, this.hangPromise])
            .then(s => s == this.hangReturn ? new Promise(() => { }) : s);
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
        this.destroiedThen = this.hangPromise.then.bind(this.hangPromise);
    }

    destroy() {
        this.hang();
        this.resolve = () => { };
        this.reject = this.resolve;
        this.hang = this.resolve;
        this.primaryPromise = null;
        this.hangPromise = null;
        this.promise = null;
        this.then = this.resolve;
        this.catch = this.resolve;
        this.destroiedThen = f => f();
        // Do NEVER NEVER NEVER dereference hangReturn.
        // Mysteriously this tiny symbol will keep you from Memory LEAK.
        //this.hangReturn = null;
    }

    static _UNIT_TEST() {
        let containers = [];
        async function foo() {
            let buf = new ArrayBuffer(600000000);
            let ac = new AsyncContainer();
            ac.destroiedThen(() => console.log('asyncContainer destroied'))
            containers.push(ac);
            await ac;
            return buf;
        }
        let foos = [foo(), foo(), foo()];
        containers.forEach(e => e.destroy());
        console.warn('Check your RAM usage. I allocated 1.8GB in three dead-end promises.')
        return [foos, containers];
    }
}

class ASSDownloader {
    constructor(option) {
        ({ fetchDanmaku: this.fetchDanmaku, generateASS: this.generateASS, setPosition: this.setPosition } = new Function('option', `
        // ==UserScript==
        // @name        bilibili ASS Danmaku Downloader
        // @namespace   https://github.com/tiansh
        // @description 以 ASS 格式下载 bilibili 的弹幕
        // @include     http://www.bilibili.com/video/av*
        // @include     http://bangumi.bilibili.com/movie/*
        // @updateURL   https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.meta.js
        // @downloadURL https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.user.js
        // @version     1.11
        // @grant       GM_addStyle
        // @grant       GM_xmlhttpRequest
        // @run-at      document-start
        // @author      田生
        // @copyright   2014+, 田生
        // @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
        // @license     CC Attribution-ShareAlike 4.0 International; http://creativecommons.org/licenses/by-sa/4.0/
        // @connect-src comment.bilibili.com
        // @connect-src interface.bilibili.com
        // ==/UserScript==
        
        /*
         * Common
         */
        
        // 设置项
        var config = {
          'playResX': 560,           // 屏幕分辨率宽（像素）
          'playResY': 420,           // 屏幕分辨率高（像素）
          'fontlist': [              // 字形（会自动选择最前面一个可用的）
            'Microsoft YaHei UI',
            'Microsoft YaHei',
            '文泉驿正黑',
            'STHeitiSC',
            '黑体',
          ],
          'font_size': 1.0,          // 字号（比例）
          'r2ltime': 8,              // 右到左弹幕持续时间（秒）
          'fixtime': 4,              // 固定弹幕持续时间（秒）
          'opacity': 0.6,            // 不透明度（比例）
          'space': 0,                // 弹幕间隔的最小水平距离（像素）
          'max_delay': 6,            // 最多允许延迟几秒出现弹幕
          'bottom': 50,              // 底端给字幕保留的空间（像素）
          'use_canvas': null,        // 是否使用canvas计算文本宽度（布尔值，Linux下的火狐默认否，其他默认是，Firefox bug #561361）
          'debug': false,            // 打印调试信息
        };
        if (option instanceof Object) {
            for (var prop in config) {
                if (prop in option) {
                    config[prop] = option[prop]
                }
            }
        }
        
        var debug = config.debug ? console.log.bind(console) : function () { };
        
        // 将字典中的值填入字符串
        var fillStr = function (str) {
          var dict = Array.apply(Array, arguments);
          return str.replace(/{{([^}]+)}}/g, function (r, o) {
            var ret;
            dict.some(function (i) { return ret = i[o]; });
            return ret || '';
          });
        };
        
        // 将颜色的数值化为十六进制字符串表示
        var RRGGBB = function (color) {
          var t = Number(color).toString(16).toUpperCase();
          return (Array(7).join('0') + t).slice(-6);
        };
        
        // 将可见度转换为透明度
        var hexAlpha = function (opacity) {
          var alpha = Math.round(0xFF * (1 - opacity)).toString(16).toUpperCase();
          return Array(3 - alpha.length).join('0') + alpha;
        };
        
        // 字符串
        var funStr = function (fun) {
          return fun.toString().split(/\\r\\n|\\n|\\r/).slice(1, -1).join('\\n');
        };
        
        // 平方和开根
        var hypot = Math.hypot ? Math.hypot.bind(Math) : function () {
          return Math.sqrt([0].concat(Array.apply(Array, arguments))
            .reduce(function (x, y) { return x + y * y; }));
        };
        
        // 创建下载
        var startDownload = function (data, filename) {
          var blob = new Blob([data], { type: 'application/octet-stream' });
          var url = window.URL.createObjectURL(blob);
          var saveas = document.createElement('a');
          saveas.href = url;
          saveas.style.display = 'none';
          document.body.appendChild(saveas);
          saveas.download = filename;
          saveas.click();
          setTimeout(function () { saveas.parentNode.removeChild(saveas); }, 1000)
          document.addEventListener('unload', function () { window.URL.revokeObjectURL(url); });
        };
        
        // 计算文字宽度
        var calcWidth = (function () {
        
          // 使用Canvas计算
          var calcWidthCanvas = function () {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            return function (fontname, text, fontsize) {
              context.font = 'bold ' + fontsize + 'px ' + fontname;
              return Math.ceil(context.measureText(text).width + config.space);
            };
          }
        
          // 使用Div计算
          var calcWidthDiv = function () {
            var d = document.createElement('div');
            d.setAttribute('style', [
              'all: unset', 'top: -10000px', 'left: -10000px',
              'width: auto', 'height: auto', 'position: absolute',
            '',].join(' !important; '));
            var ld = function () { document.body.parentNode.appendChild(d); }
            if (!document.body) document.addEventListener('DOMContentLoaded', ld);
            else ld();
            return function (fontname, text, fontsize) {
              d.textContent = text;
              d.style.font = 'bold ' + fontsize + 'px ' + fontname;
              return d.clientWidth + config.space;
            };
          };
        
          // 检查使用哪个测量文字宽度的方法
          if (config.use_canvas === null) {
            if (navigator.platform.match(/linux/i) &&
            !navigator.userAgent.match(/chrome/i)) config.use_canvas = false;
          }
          debug('use canvas: %o', config.use_canvas !== false);
          if (config.use_canvas === false) return calcWidthDiv();
          return calcWidthCanvas();
        
        }());
        
        // 选择合适的字体
        var choseFont = function (fontlist) {
          // 检查这个字串的宽度来检查字体是否存在
          var sampleText =
            'The quick brown fox jumps over the lazy dog' +
            '7531902468' + ',.!-' + '，。：！' +
            '天地玄黄' + '則近道矣';
          // 和这些字体进行比较
          var sampleFont = [
            'monospace', 'sans-serif', 'sans',
            'Symbol', 'Arial', 'Comic Sans MS', 'Fixed', 'Terminal',
            'Times', 'Times New Roman',
            '宋体', '黑体', '文泉驿正黑', 'Microsoft YaHei'
          ];
          // 如果被检查的字体和基准字体可以渲染出不同的宽度
          // 那么说明被检查的字体总是存在的
          var diffFont = function (base, test) {
            var baseSize = calcWidth(base, sampleText, 72);
            var testSize = calcWidth(test + ',' + base, sampleText, 72);
            return baseSize !== testSize;
          };
          var validFont = function (test) {
            var valid = sampleFont.some(function (base) {
              return diffFont(base, test);
            });
            debug('font %s: %o', test, valid);
            return valid;
          };
          // 找一个能用的字体
          var f = fontlist[fontlist.length - 1];
          fontlist = fontlist.filter(validFont);
          debug('fontlist: %o', fontlist);
          return fontlist[0] || f;
        };
        
        // 从备选的字体中选择一个机器上提供了的字体
        var initFont = (function () {
          var done = false;
          return function () {
            if (done) return; done = true;
            calcWidth = calcWidth.bind(window,
              config.font = choseFont(config.fontlist)
            );
          };
        }());
        
        var generateASS = function (danmaku, info) {
          var assHeader = fillStr(
            '[Script Info]\\nTitle: {{title}}\\nOriginal Script: \\u6839\\u636E {{ori}} \\u7684\\u5F39\\u5E55\\u4FE1\\u606F\\uFF0C\\u7531 https://github.com/tiansh/us-danmaku \\u751F\\u6210\\nScriptType: v4.00+\\nCollisions: Normal\\nPlayResX: {{playResX}}\\nPlayResY: {{playResY}}\\nTimer: 10.0000\\n\\n[V4+ Styles]\\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\\nStyle: Fix,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\\nStyle: R2L,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\\n\\n[Events]\\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\\n',
            config, info, {'alpha': hexAlpha(config.opacity) }
          );
          // 补齐数字开头的0
          var paddingNum = function (num, len) {
            num = '' + num;
            while (num.length < len) num = '0' + num;
            return num;
          };
          // 格式化时间
          var formatTime = function (time) {
            time = 100 * time ^ 0;
            var l = [[100, 2], [60, 2], [60, 2], [Infinity, 0]].map(function (c) {
              var r = time % c[0];
              time = (time - r) / c[0];
              return paddingNum(r, c[1]);
            }).reverse();
            return l.slice(0, -1).join(':') + '.' + l[3];
          };
          // 格式化特效
          var format = (function () {
            // 适用于所有弹幕
            var common = function (line) {
              var s = '';
              var rgb = line.color.split(/(..)/).filter(function (x) { return x; })
                .map(function (x) { return parseInt(x, 16); });
              // 如果不是白色，要指定弹幕特殊的颜色
              if (line.color !== 'FFFFFF') // line.color 是 RRGGBB 格式
                s += '\\\\c&H' + line.color.split(/(..)/).reverse().join('');
              // 如果弹幕颜色比较深，用白色的外边框
              var dark = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 0x30;
              if (dark) s += '\\\\3c&HFFFFFF';
              if (line.size !== 25) s += '\\\\fs' + line.size;
              return s;
            };
            // 适用于从右到左弹幕
            var r2l = function (line) {
              return '\\\\move(' + [
                line.poss.x, line.poss.y, line.posd.x, line.posd.y
              ].join(',') + ')';
            };
            // 适用于固定位置弹幕
            var fix = function (line) {
              return '\\\\pos(' + [
                line.poss.x, line.poss.y
              ].join(',') + ')';
            };
            var withCommon = function (f) {
              return function (line) { return f(line) + common(line); };
            };
            return {
              'R2L': withCommon(r2l),
              'Fix': withCommon(fix),
            };
          }());
          // 转义一些字符
          var escapeAssText = function (s) {
            // "{"、"}"字符libass可以转义，但是VSFilter不可以，所以直接用全角补上
            return s.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\\r|\\n/g, '');
          };
          // 将一行转换为ASS的事件
          var convert2Ass = function (line) {
            return 'Dialogue: ' + [
              0,
              formatTime(line.stime),
              formatTime(line.dtime),
              line.type,
              ',20,20,2,,',
            ].join(',')
              + '{' + format[line.type](line) + '}'
              + escapeAssText(line.text);
          };
          return assHeader +
            danmaku.map(convert2Ass)
            .filter(function (x) { return x; })
            .join('\\n');
        };
        
        /*
        
        下文字母含义：
        0       ||----------------------x---------------------->
                   _____________________c_____________________
        =        /                     wc                      \\      0
        |       |                   |--v--|                 wv  |  |--v--|
        |    d  |--v--|               d f                 |--v--|
        y |--v--|  l                                         f  |  s    _ p
        |       |              VIDEO           |--v--|          |--v--| _ m
        v       |              AREA            (x ^ y)          |
        
        v: 弹幕
        c: 屏幕
        
        0: 弹幕发送
        a: 可行方案
        
        s: 开始出现
        f: 出现完全
        l: 开始消失
        d: 消失完全
        
        p: 上边缘（含）
        m: 下边缘（不含）
        
        w: 宽度
        h: 高度
        b: 底端保留
        
        t: 时间点
        u: 时间段
        r: 延迟
        
        并规定
        ts := t0s + r
        tf := wv / (wc + ws) * p + ts
        tl := ws / (wc + ws) * p + ts
        td := p + ts
        
        */
        
        // 滚动弹幕
        var normalDanmaku = (function (wc, hc, b, u, maxr) {
          return function () {
            // 初始化屏幕外面是不可用的
            var used = [
              { 'p': -Infinity, 'm': 0, 'tf': Infinity, 'td': Infinity, 'b': false },
              { 'p': hc, 'm': Infinity, 'tf': Infinity, 'td': Infinity, 'b': false },
              { 'p': hc - b, 'm': hc, 'tf': Infinity, 'td': Infinity, 'b': true },
            ];
            // 检查一些可用的位置
            var available = function (hv, t0s, t0l, b) {
              var suggestion = [];
              // 这些上边缘总之别的块的下边缘
              used.forEach(function (i) {
                if (i.m > hc) return;
                var p = i.m;
                var m = p + hv;
                var tas = t0s;
                var tal = t0l;
                // 这些块的左边缘总是这个区域里面最大的边缘
                used.forEach(function (j) {
                  if (j.p >= m) return;
                  if (j.m <= p) return;
                  if (j.b && b) return;
                  tas = Math.max(tas, j.tf);
                  tal = Math.max(tal, j.td);
                });
                // 最后作为一种备选留下来
                suggestion.push({
                  'p': p,
                  'r': Math.max(tas - t0s, tal - t0l),
                });
              });
              // 根据高度排序
              suggestion.sort(function (x, y) { return x.p - y.p; });
              var mr = maxr;
              // 又靠右又靠下的选择可以忽略，剩下的返回
              suggestion = suggestion.filter(function (i) {
                if (i.r >= mr) return false;
                mr = i.r;
                return true;
              });
              return suggestion;
            };
            // 添加一个被使用的
            var use = function (p, m, tf, td) {
              used.push({ 'p': p, 'm': m, 'tf': tf, 'td': td, 'b': false });
            };
            // 根据时间同步掉无用的
            var syn = function (t0s, t0l) {
              used = used.filter(function (i) { return i.tf > t0s || i.td > t0l; });
            };
            // 给所有可能的位置打分，分数是[0, 1)的
            var score = function (i) {
              if (i.r > maxr) return -Infinity;
              return 1 - hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;
            };
            // 添加一条
            return function (t0s, wv, hv, b) {
              var t0l = wc / (wv + wc) * u + t0s;
              syn(t0s, t0l);
              var al = available(hv, t0s, t0l, b);
              if (!al.length) return null;
              var scored = al.map(function (i) { return [score(i), i]; });
              var best = scored.reduce(function (x, y) {
                return x[0] > y[0] ? x : y;
              })[1];
              var ts = t0s + best.r;
              var tf = wv / (wv + wc) * u + ts;
              var td = u + ts;
              use(best.p, best.p + hv, tf, td);
              return {
                'top': best.p,
                'time': ts,
              };
            };
          };
        }(config.playResX, config.playResY, config.bottom, config.r2ltime, config.max_delay));
        
        // 顶部、底部弹幕
        var sideDanmaku = (function (hc, b, u, maxr) {
          return function () {
            var used = [
              { 'p': -Infinity, 'm': 0, 'td': Infinity, 'b': false },
              { 'p': hc, 'm': Infinity, 'td': Infinity, 'b': false },
              { 'p': hc - b, 'm': hc, 'td': Infinity, 'b': true },
            ];
            // 查找可用的位置
            var fr = function (p, m, t0s, b) {
              var tas = t0s;
              used.forEach(function (j) {
                if (j.p >= m) return;
                if (j.m <= p) return;
                if (j.b && b) return;
                tas = Math.max(tas, j.td);
              });
              return { 'r': tas - t0s, 'p': p, 'm': m };
            };
            // 顶部
            var top = function (hv, t0s, b) {
              var suggestion = [];
              used.forEach(function (i) {
                if (i.m > hc) return;
                suggestion.push(fr(i.m, i.m + hv, t0s, b));
              });
              return suggestion;
            };
            // 底部
            var bottom = function (hv, t0s, b) {
              var suggestion = [];
              used.forEach(function (i) {
                if (i.p < 0) return;
                suggestion.push(fr(i.p - hv, i.p, t0s, b));
              });
              return suggestion;
            };
            var use = function (p, m, td) {
              used.push({ 'p': p, 'm': m, 'td': td, 'b': false });
            };
            var syn = function (t0s) {
              used = used.filter(function (i) { return i.td > t0s; });
            };
            // 挑选最好的方案：延迟小的优先，位置不重要
            var score = function (i, is_top) {
              if (i.r > maxr) return -Infinity;
              var f = function (p) { return is_top ? p : (hc - p); };
              return 1 - (i.r / maxr * (31/32) + f(i.p) / hc * (1/32));
            };
            return function (t0s, hv, is_top, b) {
              syn(t0s);
              var al = (is_top ? top : bottom)(hv, t0s, b);
              if (!al.length) return null;
              var scored = al.map(function (i) { return [score(i, is_top), i]; });
              var best = scored.reduce(function (x, y) {
                return x[0] > y[0] ? x : y;
              })[1];
              use(best.p, best.m, best.r + t0s + u)
              return { 'top': best.p, 'time': best.r + t0s };
            };
          };
        }(config.playResY, config.bottom, config.fixtime, config.max_delay));
        
        // 为每条弹幕安置位置
        var setPosition = function (danmaku) {
          var normal = normalDanmaku(), side = sideDanmaku();
          return danmaku
            .sort(function (x, y) { return x.time - y.time; })
            .map(function (line) {
              var font_size = Math.round(line.size * config.font_size);
              var width = calcWidth(line.text, font_size);
              switch (line.mode) {
                case 'R2L': return (function () {
                  var pos = normal(line.time, width, font_size, line.bottom);
                  if (!pos) return null;
                  line.type = 'R2L';
                  line.stime = pos.time;
                  line.poss = {
                    'x': config.playResX + width / 2,
                    'y': pos.top + font_size,
                  };
                  line.posd = {
                    'x': -width / 2,
                    'y': pos.top + font_size,
                  };
                  line.dtime = config.r2ltime + line.stime;
                  return line;
                }());
                case 'TOP': case 'BOTTOM': return (function (isTop) {
                  var pos = side(line.time, font_size, isTop, line.bottom);
                  if (!pos) return null;
                  line.type = 'Fix';
                  line.stime = pos.time;
                  line.posd = line.poss = {
                    'x': Math.round(config.playResX / 2),
                    'y': pos.top + font_size,
                  };
                  line.dtime = config.fixtime + line.stime;
                  return line;
                }(line.mode === 'TOP'));
                default: return null;
              };
            })
            .filter(function (l) { return l; })
            .sort(function (x, y) { return x.stime - y.stime; });
        };
        
        /*
         * bilibili
         */
        
        // 获取xml
        var fetchXML = function (cid, callback) {
          GM_xmlhttpRequest({
            'method': 'GET',
            'url': 'http://comment.bilibili.com/{{cid}}.xml'.replace('{{cid}}', cid),
            'onload': function (resp) {
              var content = resp.responseText.replace(/(?:[\\0-\\x08\\x0B\\f\\x0E-\\x1F\\uFFFE\\uFFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])/g, "");
              callback(content);
            }
          });
        };
        
        var fetchDanmaku = function (cid, callback) {
          fetchXML(cid, function (content) {
            callback(parseXML(content));
          });
        };
        
        var parseXML = function (content) {
          var data = (new DOMParser()).parseFromString(content, 'text/xml');
          return Array.apply(Array, data.querySelectorAll('d')).map(function (line) {
            var info = line.getAttribute('p').split(','), text = line.textContent;
            return {
              'text': text,
              'time': Number(info[0]),
              'mode': [undefined, 'R2L', 'R2L', 'R2L', 'BOTTOM', 'TOP'][Number(info[1])],
              'size': Number(info[2]),
              'color': RRGGBB(parseInt(info[3], 10) & 0xffffff),
              'bottom': Number(info[5]) > 0,
              // 'create': new Date(Number(info[4])),
              // 'pool': Number(info[5]),
              // 'sender': String(info[6]),
              // 'dmid': Number(info[7]),
            };
          });
        };
        
        fetchXML = function (cid, callback) {
            var oReq = new XMLHttpRequest();
            oReq.open('GET', 'https://comment.bilibili.com/{{cid}}.xml'.replace('{{cid}}', cid));
            oReq.onload = function () {
                var content = oReq.responseText.replace(/(?:[\\0-\\x08\\x0B\\f\\x0E-\\x1F\\uFFFE\\uFFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])/g, "");
                callback(content);
            };
            oReq.send();
        };
        
        initFont();
        
        return { fetchDanmaku: fetchDanmaku, generateASS: generateASS, setPosition: setPosition };        
        `)(option));
    }

    fetchDanmaku() { }

    generateASS() { }

    setPosition() { }
}

class MKVTransmuxer {
    constructor(option) {
        this.playerWin = null;
        this.option = option;
    }

    exec(flv, ass, name) {
        // 1. Allocate for a new window
        if (!this.playerWin) this.playerWin = top.open('', undefined, ' ');

        // 2. Inject scripts
        this.playerWin.document.write(`
        <p>
            加载文件…… loading files...
            <progress value="0" max="100" id="fileProgress"></progress>
        </p>
        <p>
            构建mkv…… building mkv...
            <progress value="0" max="100" id="mkvProgress"></progress>
        </p>
        <p>
            <a id="a" download="merged.mkv">merged.mkv</a>
        </p>
        <script>
        /**
         * FLV + ASS => MKV transmuxer
         * Demux FLV into H264 + AAC stream and ASS into line stream; then
         * remux them into a MKV file.
         * 
         * @author qli5 <goodlq11[at](163|gmail).com>
         * 
         * This Source Code Form is subject to the terms of the Mozilla Public
         * License, v. 2.0. If a copy of the MPL was not distributed with this
         * file, You can obtain one at http://mozilla.org/MPL/2.0/.
         * 
         * The FLV demuxer is from flv.js <https://github.com/Bilibili/flv.js/>
         * by zheng qian <xqq@xqq.im>, licensed under Apache 2.0.
         * 
         * The EMBL builder is from simple-ebml-builder
         * <https://www.npmjs.com/package/simple-ebml-builder> by ryiwamoto, 
         * licensed under MIT.
         */
        
        // nodejs polyfill
        if (typeof Blob == 'undefined') {
            var Blob = class {
                constructor(array) {
                    return Buffer.concat(array.map(Buffer.from.bind(Buffer)));
                }
            };
        }
        if (typeof TextEncoder == 'undefined') {
            var TextEncoder = class {
                /**
                 * 
                 * @param {string} chunk 
                 * @returns {Uint8Array}
                 */
                encode(chunk) {
                    return Buffer.from(chunk, 'utf-8');
                }
            }
        }
        if (typeof TextDecoder == 'undefined') {
            const StringDecoder = require('string_decoder').StringDecoder;
            var TextDecoder = class extends StringDecoder {
                /**
                 * 
                 * @param {ArrayBuffer} chunk 
                 * @returns {string}
                 */
                decode(chunk) {
                    return this.end(Buffer.from(chunk));
                }
            }
        }
        
        /**
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
        
        const FLVDemuxer = (() => {
            // I browserified flv.js manually - so that I can know how it works
            if (typeof navigator == 'undefined') navigator = {
                userAgent: 'chrome',
            }
        
            // import FLVDemuxer from 'flv.js/src/demux/flv-demuxer';
            // ..import Log from '../utils/logger.js';
            const Log = {
                e: console.error.bind(console),
                w: console.warn.bind(console),
                i: console.log.bind(console),
                v: console.log.bind(console),
            };
        
            // ..import AMF from './amf-parser.js';
            // ....import Log from '../utils/logger.js';
            // ....import decodeUTF8 from '../utils/utf8-conv.js';
            function checkContinuation(uint8array, start, checkLength) {
                let array = uint8array;
                if (start + checkLength < array.length) {
                    while (checkLength--) {
                        if ((array[++start] & 0xC0) !== 0x80)
                            return false;
                    }
                    return true;
                } else {
                    return false;
                }
            }
        
            function decodeUTF8(uint8array) {
                let out = [];
                let input = uint8array;
                let i = 0;
                let length = uint8array.length;
        
                while (i < length) {
                    if (input[i] < 0x80) {
                        out.push(String.fromCharCode(input[i]));
                        ++i;
                        continue;
                    } else if (input[i] < 0xC0) {
                        // fallthrough
                    } else if (input[i] < 0xE0) {
                        if (checkContinuation(input, i, 1)) {
                            let ucs4 = (input[i] & 0x1F) << 6 | (input[i + 1] & 0x3F);
                            if (ucs4 >= 0x80) {
                                out.push(String.fromCharCode(ucs4 & 0xFFFF));
                                i += 2;
                                continue;
                            }
                        }
                    } else if (input[i] < 0xF0) {
                        if (checkContinuation(input, i, 2)) {
                            let ucs4 = (input[i] & 0xF) << 12 | (input[i + 1] & 0x3F) << 6 | input[i + 2] & 0x3F;
                            if (ucs4 >= 0x800 && (ucs4 & 0xF800) !== 0xD800) {
                                out.push(String.fromCharCode(ucs4 & 0xFFFF));
                                i += 3;
                                continue;
                            }
                        }
                    } else if (input[i] < 0xF8) {
                        if (checkContinuation(input, i, 3)) {
                            let ucs4 = (input[i] & 0x7) << 18 | (input[i + 1] & 0x3F) << 12
                                | (input[i + 2] & 0x3F) << 6 | (input[i + 3] & 0x3F);
                            if (ucs4 > 0x10000 && ucs4 < 0x110000) {
                                ucs4 -= 0x10000;
                                out.push(String.fromCharCode((ucs4 >>> 10) | 0xD800));
                                out.push(String.fromCharCode((ucs4 & 0x3FF) | 0xDC00));
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
            class IllegalStateException extends Error { }
        
            let le = (function () {
                let buf = new ArrayBuffer(2);
                (new DataView(buf)).setInt16(0, 256, true);  // little-endian write
                return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE
            })();
        
            class AMF {
        
                static parseScriptData(arrayBuffer, dataOffset, dataSize) {
                    let data = {};
        
                    try {
                        let name = AMF.parseValue(arrayBuffer, dataOffset, dataSize);
                        let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);
        
                        data[name.data] = value.data;
                    } catch (e) {
                        Log.e('AMF', e.toString());
                    }
        
                    return data;
                }
        
                static parseObject(arrayBuffer, dataOffset, dataSize) {
                    if (dataSize < 3) {
                        throw new IllegalStateException('Data not enough when parse ScriptDataObject');
                    }
                    let name = AMF.parseString(arrayBuffer, dataOffset, dataSize);
                    let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);
                    let isObjectEnd = value.objectEnd;
        
                    return {
                        data: {
                            name: name.data,
                            value: value.data
                        },
                        size: name.size + value.size,
                        objectEnd: isObjectEnd
                    };
                }
        
                static parseVariable(arrayBuffer, dataOffset, dataSize) {
                    return AMF.parseObject(arrayBuffer, dataOffset, dataSize);
                }
        
                static parseString(arrayBuffer, dataOffset, dataSize) {
                    if (dataSize < 2) {
                        throw new IllegalStateException('Data not enough when parse String');
                    }
                    let v = new DataView(arrayBuffer, dataOffset, dataSize);
                    let length = v.getUint16(0, !le);
        
                    let str;
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
        
                static parseLongString(arrayBuffer, dataOffset, dataSize) {
                    if (dataSize < 4) {
                        throw new IllegalStateException('Data not enough when parse LongString');
                    }
                    let v = new DataView(arrayBuffer, dataOffset, dataSize);
                    let length = v.getUint32(0, !le);
        
                    let str;
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
        
                static parseDate(arrayBuffer, dataOffset, dataSize) {
                    if (dataSize < 10) {
                        throw new IllegalStateException('Data size invalid when parse Date');
                    }
                    let v = new DataView(arrayBuffer, dataOffset, dataSize);
                    let timestamp = v.getFloat64(0, !le);
                    let localTimeOffset = v.getInt16(8, !le);
                    timestamp += localTimeOffset * 60 * 1000;  // get UTC time
        
                    return {
                        data: new Date(timestamp),
                        size: 8 + 2
                    };
                }
        
                static parseValue(arrayBuffer, dataOffset, dataSize) {
                    if (dataSize < 1) {
                        throw new IllegalStateException('Data not enough when parse Value');
                    }
        
                    let v = new DataView(arrayBuffer, dataOffset, dataSize);
        
                    let offset = 1;
                    let type = v.getUint8(0);
                    let value;
                    let objectEnd = false;
        
                    try {
                        switch (type) {
                            case 0:  // Number(Double) type
                                value = v.getFloat64(1, !le);
                                offset += 8;
                                break;
                            case 1: {  // Boolean type
                                let b = v.getUint8(1);
                                value = b ? true : false;
                                offset += 1;
                                break;
                            }
                            case 2: {  // String type
                                let amfstr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);
                                value = amfstr.data;
                                offset += amfstr.size;
                                break;
                            }
                            case 3: { // Object(s) type
                                value = {};
                                let terminal = 0;  // workaround for malformed Objects which has missing ScriptDataObjectEnd
                                if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
                                    terminal = 3;
                                }
                                while (offset < dataSize - 4) {  // 4 === type(UI8) + ScriptDataObjectEnd(UI24)
                                    let amfobj = AMF.parseObject(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);
                                    if (amfobj.objectEnd)
                                        break;
                                    value[amfobj.data.name] = amfobj.data.value;
                                    offset += amfobj.size;
                                }
                                if (offset <= dataSize - 3) {
                                    let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;
                                    if (marker === 9) {
                                        offset += 3;
                                    }
                                }
                                break;
                            }
                            case 8: { // ECMA array type (Mixed array)
                                value = {};
                                offset += 4;  // ECMAArrayLength(UI32)
                                let terminal = 0;  // workaround for malformed MixedArrays which has missing ScriptDataObjectEnd
                                if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
                                    terminal = 3;
                                }
                                while (offset < dataSize - 8) {  // 8 === type(UI8) + ECMAArrayLength(UI32) + ScriptDataVariableEnd(UI24)
                                    let amfvar = AMF.parseVariable(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);
                                    if (amfvar.objectEnd)
                                        break;
                                    value[amfvar.data.name] = amfvar.data.value;
                                    offset += amfvar.size;
                                }
                                if (offset <= dataSize - 3) {
                                    let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;
                                    if (marker === 9) {
                                        offset += 3;
                                    }
                                }
                                break;
                            }
                            case 9:  // ScriptDataObjectEnd
                                value = undefined;
                                offset = 1;
                                objectEnd = true;
                                break;
                            case 10: {  // Strict array type
                                // ScriptDataValue[n]. NOTE: according to video_file_format_spec_v10_1.pdf
                                value = [];
                                let strictArrayLength = v.getUint32(1, !le);
                                offset += 4;
                                for (let i = 0; i < strictArrayLength; i++) {
                                    let val = AMF.parseValue(arrayBuffer, dataOffset + offset, dataSize - offset);
                                    value.push(val.data);
                                    offset += val.size;
                                }
                                break;
                            }
                            case 11: {  // Date type
                                let date = AMF.parseDate(arrayBuffer, dataOffset + 1, dataSize - 1);
                                value = date.data;
                                offset += date.size;
                                break;
                            }
                            case 12: {  // Long string type
                                let amfLongStr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);
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
        
            }
        
            // ..import SPSParser from './sps-parser.js';
            // ....import ExpGolomb from './exp-golomb.js';
            // ......import {IllegalStateException, InvalidArgumentException} from '../utils/exception.js';
            class InvalidArgumentException extends Error { }
        
            class ExpGolomb {
        
                constructor(uint8array) {
                    this.TAG = 'ExpGolomb';
        
                    this._buffer = uint8array;
                    this._buffer_index = 0;
                    this._total_bytes = uint8array.byteLength;
                    this._total_bits = uint8array.byteLength * 8;
                    this._current_word = 0;
                    this._current_word_bits_left = 0;
                }
        
                destroy() {
                    this._buffer = null;
                }
        
                _fillCurrentWord() {
                    let buffer_bytes_left = this._total_bytes - this._buffer_index;
                    if (buffer_bytes_left <= 0)
                        throw new IllegalStateException('ExpGolomb: _fillCurrentWord() but no bytes available');
        
                    let bytes_read = Math.min(4, buffer_bytes_left);
                    let word = new Uint8Array(4);
                    word.set(this._buffer.subarray(this._buffer_index, this._buffer_index + bytes_read));
                    this._current_word = new DataView(word.buffer).getUint32(0, false);
        
                    this._buffer_index += bytes_read;
                    this._current_word_bits_left = bytes_read * 8;
                }
        
                readBits(bits) {
                    if (bits > 32)
                        throw new InvalidArgumentException('ExpGolomb: readBits() bits exceeded max 32bits!');
        
                    if (bits <= this._current_word_bits_left) {
                        let result = this._current_word >>> (32 - bits);
                        this._current_word <<= bits;
                        this._current_word_bits_left -= bits;
                        return result;
                    }
        
                    let result = this._current_word_bits_left ? this._current_word : 0;
                    result = result >>> (32 - this._current_word_bits_left);
                    let bits_need_left = bits - this._current_word_bits_left;
        
                    this._fillCurrentWord();
                    let bits_read_next = Math.min(bits_need_left, this._current_word_bits_left);
        
                    let result2 = this._current_word >>> (32 - bits_read_next);
                    this._current_word <<= bits_read_next;
                    this._current_word_bits_left -= bits_read_next;
        
                    result = (result << bits_read_next) | result2;
                    return result;
                }
        
                readBool() {
                    return this.readBits(1) === 1;
                }
        
                readByte() {
                    return this.readBits(8);
                }
        
                _skipLeadingZero() {
                    let zero_count;
                    for (zero_count = 0; zero_count < this._current_word_bits_left; zero_count++) {
                        if (0 !== (this._current_word & (0x80000000 >>> zero_count))) {
                            this._current_word <<= zero_count;
                            this._current_word_bits_left -= zero_count;
                            return zero_count;
                        }
                    }
                    this._fillCurrentWord();
                    return zero_count + this._skipLeadingZero();
                }
        
                readUEG() {  // unsigned exponential golomb
                    let leading_zeros = this._skipLeadingZero();
                    return this.readBits(leading_zeros + 1) - 1;
                }
        
                readSEG() {  // signed exponential golomb
                    let value = this.readUEG();
                    if (value & 0x01) {
                        return (value + 1) >>> 1;
                    } else {
                        return -1 * (value >>> 1);
                    }
                }
        
            }
        
            class SPSParser {
        
                static _ebsp2rbsp(uint8array) {
                    let src = uint8array;
                    let src_length = src.byteLength;
                    let dst = new Uint8Array(src_length);
                    let dst_idx = 0;
        
                    for (let i = 0; i < src_length; i++) {
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
        
                static parseSPS(uint8array) {
                    let rbsp = SPSParser._ebsp2rbsp(uint8array);
                    let gb = new ExpGolomb(rbsp);
        
                    gb.readByte();
                    let profile_idc = gb.readByte();  // profile_idc
                    gb.readByte();  // constraint_set_flags[5] + reserved_zero[3]
                    let level_idc = gb.readByte();  // level_idc
                    gb.readUEG();  // seq_parameter_set_id
        
                    let profile_string = SPSParser.getProfileString(profile_idc);
                    let level_string = SPSParser.getLevelString(level_idc);
                    let chroma_format_idc = 1;
                    let chroma_format = 420;
                    let chroma_format_table = [0, 420, 422, 444];
                    let bit_depth = 8;
        
                    if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 ||
                        profile_idc === 244 || profile_idc === 44 || profile_idc === 83 ||
                        profile_idc === 86 || profile_idc === 118 || profile_idc === 128 ||
                        profile_idc === 138 || profile_idc === 144) {
        
                        chroma_format_idc = gb.readUEG();
                        if (chroma_format_idc === 3) {
                            gb.readBits(1);  // separate_colour_plane_flag
                        }
                        if (chroma_format_idc <= 3) {
                            chroma_format = chroma_format_table[chroma_format_idc];
                        }
        
                        bit_depth = gb.readUEG() + 8;  // bit_depth_luma_minus8
                        gb.readUEG();  // bit_depth_chroma_minus8
                        gb.readBits(1);  // qpprime_y_zero_transform_bypass_flag
                        if (gb.readBool()) {  // seq_scaling_matrix_present_flag
                            let scaling_list_count = (chroma_format_idc !== 3) ? 8 : 12;
                            for (let i = 0; i < scaling_list_count; i++) {
                                if (gb.readBool()) {  // seq_scaling_list_present_flag
                                    if (i < 6) {
                                        SPSParser._skipScalingList(gb, 16);
                                    } else {
                                        SPSParser._skipScalingList(gb, 64);
                                    }
                                }
                            }
                        }
                    }
                    gb.readUEG();  // log2_max_frame_num_minus4
                    let pic_order_cnt_type = gb.readUEG();
                    if (pic_order_cnt_type === 0) {
                        gb.readUEG();  // log2_max_pic_order_cnt_lsb_minus_4
                    } else if (pic_order_cnt_type === 1) {
                        gb.readBits(1);  // delta_pic_order_always_zero_flag
                        gb.readSEG();  // offset_for_non_ref_pic
                        gb.readSEG();  // offset_for_top_to_bottom_field
                        let num_ref_frames_in_pic_order_cnt_cycle = gb.readUEG();
                        for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i++) {
                            gb.readSEG();  // offset_for_ref_frame
                        }
                    }
                    gb.readUEG();  // max_num_ref_frames
                    gb.readBits(1);  // gaps_in_frame_num_value_allowed_flag
        
                    let pic_width_in_mbs_minus1 = gb.readUEG();
                    let pic_height_in_map_units_minus1 = gb.readUEG();
        
                    let frame_mbs_only_flag = gb.readBits(1);
                    if (frame_mbs_only_flag === 0) {
                        gb.readBits(1);  // mb_adaptive_frame_field_flag
                    }
                    gb.readBits(1);  // direct_8x8_inference_flag
        
                    let frame_crop_left_offset = 0;
                    let frame_crop_right_offset = 0;
                    let frame_crop_top_offset = 0;
                    let frame_crop_bottom_offset = 0;
        
                    let frame_cropping_flag = gb.readBool();
                    if (frame_cropping_flag) {
                        frame_crop_left_offset = gb.readUEG();
                        frame_crop_right_offset = gb.readUEG();
                        frame_crop_top_offset = gb.readUEG();
                        frame_crop_bottom_offset = gb.readUEG();
                    }
        
                    let sar_width = 1, sar_height = 1;
                    let fps = 0, fps_fixed = true, fps_num = 0, fps_den = 0;
        
                    let vui_parameters_present_flag = gb.readBool();
                    if (vui_parameters_present_flag) {
                        if (gb.readBool()) {  // aspect_ratio_info_present_flag
                            let aspect_ratio_idc = gb.readByte();
                            let sar_w_table = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2];
                            let sar_h_table = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33, 99, 3, 2, 1];
        
                            if (aspect_ratio_idc > 0 && aspect_ratio_idc < 16) {
                                sar_width = sar_w_table[aspect_ratio_idc - 1];
                                sar_height = sar_h_table[aspect_ratio_idc - 1];
                            } else if (aspect_ratio_idc === 255) {
                                sar_width = gb.readByte() << 8 | gb.readByte();
                                sar_height = gb.readByte() << 8 | gb.readByte();
                            }
                        }
        
                        if (gb.readBool()) {  // overscan_info_present_flag
                            gb.readBool();  // overscan_appropriate_flag
                        }
                        if (gb.readBool()) {  // video_signal_type_present_flag
                            gb.readBits(4);  // video_format & video_full_range_flag
                            if (gb.readBool()) {  // colour_description_present_flag
                                gb.readBits(24);  // colour_primaries & transfer_characteristics & matrix_coefficients
                            }
                        }
                        if (gb.readBool()) {  // chroma_loc_info_present_flag
                            gb.readUEG();  // chroma_sample_loc_type_top_field
                            gb.readUEG();  // chroma_sample_loc_type_bottom_field
                        }
                        if (gb.readBool()) {  // timing_info_present_flag
                            let num_units_in_tick = gb.readBits(32);
                            let time_scale = gb.readBits(32);
                            fps_fixed = gb.readBool();  // fixed_frame_rate_flag
        
                            fps_num = time_scale;
                            fps_den = num_units_in_tick * 2;
                            fps = fps_num / fps_den;
                        }
                    }
        
                    let sarScale = 1;
                    if (sar_width !== 1 || sar_height !== 1) {
                        sarScale = sar_width / sar_height;
                    }
        
                    let crop_unit_x = 0, crop_unit_y = 0;
                    if (chroma_format_idc === 0) {
                        crop_unit_x = 1;
                        crop_unit_y = 2 - frame_mbs_only_flag;
                    } else {
                        let sub_wc = (chroma_format_idc === 3) ? 1 : 2;
                        let sub_hc = (chroma_format_idc === 1) ? 2 : 1;
                        crop_unit_x = sub_wc;
                        crop_unit_y = sub_hc * (2 - frame_mbs_only_flag);
                    }
        
                    let codec_width = (pic_width_in_mbs_minus1 + 1) * 16;
                    let codec_height = (2 - frame_mbs_only_flag) * ((pic_height_in_map_units_minus1 + 1) * 16);
        
                    codec_width -= (frame_crop_left_offset + frame_crop_right_offset) * crop_unit_x;
                    codec_height -= (frame_crop_top_offset + frame_crop_bottom_offset) * crop_unit_y;
        
                    let present_width = Math.ceil(codec_width * sarScale);
        
                    gb.destroy();
                    gb = null;
        
                    return {
                        profile_string: profile_string,  // baseline, high, high10, ...
                        level_string: level_string,  // 3, 3.1, 4, 4.1, 5, 5.1, ...
                        bit_depth: bit_depth,  // 8bit, 10bit, ...
                        chroma_format: chroma_format,  // 4:2:0, 4:2:2, ...
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
        
                static _skipScalingList(gb, count) {
                    let last_scale = 8, next_scale = 8;
                    let delta_scale = 0;
                    for (let i = 0; i < count; i++) {
                        if (next_scale !== 0) {
                            delta_scale = gb.readSEG();
                            next_scale = (last_scale + delta_scale + 256) % 256;
                        }
                        last_scale = (next_scale === 0) ? last_scale : next_scale;
                    }
                }
        
                static getProfileString(profile_idc) {
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
        
                static getLevelString(level_idc) {
                    return (level_idc / 10).toFixed(1);
                }
        
                static getChromaFormatString(chroma) {
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
        
            }
        
            // ..import DemuxErrors from './demux-errors.js';
            const DemuxErrors = {
                OK: 'OK',
                FORMAT_ERROR: 'FormatError',
                FORMAT_UNSUPPORTED: 'FormatUnsupported',
                CODEC_UNSUPPORTED: 'CodecUnsupported'
            };
        
            // ..import MediaInfo from '../core/media-info.js';
            class MediaInfo {
        
                constructor() {
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
                    this.segments = null;  // MediaInfo[]
                    this.segmentCount = null;
                    this.hasKeyframesIndex = null;
                    this.keyframesIndex = null;
                }
        
                isComplete() {
                    let audioInfoComplete = (this.hasAudio === false) ||
                        (this.hasAudio === true &&
                            this.audioCodec != null &&
                            this.audioSampleRate != null &&
                            this.audioChannelCount != null);
        
                    let videoInfoComplete = (this.hasVideo === false) ||
                        (this.hasVideo === true &&
                            this.videoCodec != null &&
                            this.width != null &&
                            this.height != null &&
                            this.fps != null &&
                            this.profile != null &&
                            this.level != null &&
                            this.chromaFormat != null &&
                            this.sarNum != null &&
                            this.sarDen != null);
        
                    // keyframesIndex may not be present
                    return this.mimeType != null &&
                        this.duration != null &&
                        this.metadata != null &&
                        this.hasKeyframesIndex != null &&
                        audioInfoComplete &&
                        videoInfoComplete;
                }
        
                isSeekable() {
                    return this.hasKeyframesIndex === true;
                }
        
                getNearestKeyframe(milliseconds) {
                    if (this.keyframesIndex == null) {
                        return null;
                    }
        
                    let table = this.keyframesIndex;
                    let keyframeIdx = this._search(table.times, milliseconds);
        
                    return {
                        index: keyframeIdx,
                        milliseconds: table.times[keyframeIdx],
                        fileposition: table.filepositions[keyframeIdx]
                    };
                }
        
                _search(list, value) {
                    let idx = 0;
        
                    let last = list.length - 1;
                    let mid = 0;
                    let lbound = 0;
                    let ubound = last;
        
                    if (value < list[0]) {
                        idx = 0;
                        lbound = ubound + 1;  // skip search
                    }
        
                    while (lbound <= ubound) {
                        mid = lbound + Math.floor((ubound - lbound) / 2);
                        if (mid === last || (value >= list[mid] && value < list[mid + 1])) {
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
        
            }
        
            function Swap16(src) {
                return (((src >>> 8) & 0xFF) |
                    ((src & 0xFF) << 8));
            }
        
            function Swap32(src) {
                return (((src & 0xFF000000) >>> 24) |
                    ((src & 0x00FF0000) >>> 8) |
                    ((src & 0x0000FF00) << 8) |
                    ((src & 0x000000FF) << 24));
            }
        
            function ReadBig32(array, index) {
                return ((array[index] << 24) |
                    (array[index + 1] << 16) |
                    (array[index + 2] << 8) |
                    (array[index + 3]));
            }
        
            class FLVDemuxer {
        
                /**
                 * Create a new FLV demuxer
                 * @param {Object} probeData
                 * @param {boolean} probeData.match
                 * @param {number} probeData.consumed
                 * @param {number} probeData.dataOffset
                 * @param {booleam} probeData.hasAudioTrack
                 * @param {boolean} probeData.hasVideoTrack
                 * @param {*} config 
                 */
                constructor(probeData, config) {
                    this.TAG = 'FLVDemuxer';
        
                    this._config = config;
        
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
                    this._timestampBase = 0;  // int32, in milliseconds
                    this._timescale = 1000;
                    this._duration = 0;  // int32, in milliseconds
                    this._durationOverrided = false;
                    this._referenceFrameRate = {
                        fixed: true,
                        fps: 23.976,
                        fps_num: 23976,
                        fps_den: 1000
                    };
        
                    this._flvSoundRateTable = [5500, 11025, 22050, 44100, 48000];
        
                    this._mpegSamplingRates = [
                        96000, 88200, 64000, 48000, 44100, 32000,
                        24000, 22050, 16000, 12000, 11025, 8000, 7350
                    ];
        
                    this._mpegAudioV10SampleRateTable = [44100, 48000, 32000, 0];
                    this._mpegAudioV20SampleRateTable = [22050, 24000, 16000, 0];
                    this._mpegAudioV25SampleRateTable = [11025, 12000, 8000, 0];
        
                    this._mpegAudioL1BitRateTable = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1];
                    this._mpegAudioL2BitRateTable = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1];
                    this._mpegAudioL3BitRateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1];
        
                    this._videoTrack = { type: 'video', id: 1, sequenceNumber: 0, samples: [], length: 0 };
                    this._audioTrack = { type: 'audio', id: 2, sequenceNumber: 0, samples: [], length: 0 };
        
                    this._littleEndian = (function () {
                        let buf = new ArrayBuffer(2);
                        (new DataView(buf)).setInt16(0, 256, true);  // little-endian write
                        return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE
                    })();
                }
        
                destroy() {
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
                static probe(buffer) {
                    let data = new Uint8Array(buffer);
                    let mismatch = { match: false };
        
                    if (data[0] !== 0x46 || data[1] !== 0x4C || data[2] !== 0x56 || data[3] !== 0x01) {
                        return mismatch;
                    }
        
                    let hasAudio = ((data[4] & 4) >>> 2) !== 0;
                    let hasVideo = (data[4] & 1) !== 0;
        
                    let offset = ReadBig32(data, 5);
        
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
        
                bindDataSource(loader) {
                    loader.onDataArrival = this.parseChunks.bind(this);
                    return this;
                }
        
                // prototype: function(type: string, metadata: any): void
                get onTrackMetadata() {
                    return this._onTrackMetadata;
                }
        
                set onTrackMetadata(callback) {
                    this._onTrackMetadata = callback;
                }
        
                // prototype: function(mediaInfo: MediaInfo): void
                get onMediaInfo() {
                    return this._onMediaInfo;
                }
        
                set onMediaInfo(callback) {
                    this._onMediaInfo = callback;
                }
        
                // prototype: function(type: number, info: string): void
                get onError() {
                    return this._onError;
                }
        
                set onError(callback) {
                    this._onError = callback;
                }
        
                // prototype: function(videoTrack: any, audioTrack: any): void
                get onDataAvailable() {
                    return this._onDataAvailable;
                }
        
                set onDataAvailable(callback) {
                    this._onDataAvailable = callback;
                }
        
                // timestamp base for output samples, must be in milliseconds
                get timestampBase() {
                    return this._timestampBase;
                }
        
                set timestampBase(base) {
                    this._timestampBase = base;
                }
        
                get overridedDuration() {
                    return this._duration;
                }
        
                // Force-override media duration. Must be in milliseconds, int32
                set overridedDuration(duration) {
                    this._durationOverrided = true;
                    this._duration = duration;
                    this._mediaInfo.duration = duration;
                }
        
                // Force-override audio track present flag, boolean
                set overridedHasAudio(hasAudio) {
                    this._hasAudioFlagOverrided = true;
                    this._hasAudio = hasAudio;
                    this._mediaInfo.hasAudio = hasAudio;
                }
        
                // Force-override video track present flag, boolean
                set overridedHasVideo(hasVideo) {
                    this._hasVideoFlagOverrided = true;
                    this._hasVideo = hasVideo;
                    this._mediaInfo.hasVideo = hasVideo;
                }
        
                resetMediaInfo() {
                    this._mediaInfo = new MediaInfo();
                }
        
                _isInitialMetadataDispatched() {
                    if (this._hasAudio && this._hasVideo) {  // both audio & video
                        return this._audioInitialMetadataDispatched && this._videoInitialMetadataDispatched;
                    }
                    if (this._hasAudio && !this._hasVideo) {  // audio only
                        return this._audioInitialMetadataDispatched;
                    }
                    if (!this._hasAudio && this._hasVideo) {  // video only
                        return this._videoInitialMetadataDispatched;
                    }
                    return false;
                }
        
                // function parseChunks(chunk: ArrayBuffer, byteStart: number): number;
                parseChunks(chunk, byteStart) {
                    if (!this._onError || !this._onMediaInfo || !this._onTrackMetadata || !this._onDataAvailable) {
                        throw new IllegalStateException('Flv: onError & onMediaInfo & onTrackMetadata & onDataAvailable callback must be specified');
                    }
        
                    // qli5: fix nonzero byteStart
                    let offset = byteStart || 0;
                    let le = this._littleEndian;
        
                    if (byteStart === 0) {  // buffer with FLV header
                        if (chunk.byteLength > 13) {
                            let probeData = FLVDemuxer.probe(chunk);
                            offset = probeData.dataOffset;
                        } else {
                            return 0;
                        }
                    }
        
                    if (this._firstParse) {  // handle PreviousTagSize0 before Tag1
                        this._firstParse = false;
                        if (offset !== this._dataOffset) {
                            Log.w(this.TAG, 'First time parsing but chunk byteStart invalid!');
                        }
        
                        let v = new DataView(chunk, offset);
                        let prevTagSize0 = v.getUint32(0, !le);
                        if (prevTagSize0 !== 0) {
                            Log.w(this.TAG, 'PrevTagSize0 !== 0 !!!');
                        }
                        offset += 4;
                    }
        
                    while (offset < chunk.byteLength) {
                        this._dispatch = true;
        
                        let v = new DataView(chunk, offset);
        
                        if (offset + 11 + 4 > chunk.byteLength) {
                            // data not enough for parsing an flv tag
                            break;
                        }
        
                        let tagType = v.getUint8(0);
                        let dataSize = v.getUint32(0, !le) & 0x00FFFFFF;
        
                        if (offset + 11 + dataSize + 4 > chunk.byteLength) {
                            // data not enough for parsing actual data body
                            break;
                        }
        
                        if (tagType !== 8 && tagType !== 9 && tagType !== 18) {
                            Log.w(this.TAG, \`Unsupported tag type \${tagType}, skipped\`);
                            // consume the whole tag (skip it)
                            offset += 11 + dataSize + 4;
                            continue;
                        }
        
                        let ts2 = v.getUint8(4);
                        let ts1 = v.getUint8(5);
                        let ts0 = v.getUint8(6);
                        let ts3 = v.getUint8(7);
        
                        let timestamp = ts0 | (ts1 << 8) | (ts2 << 16) | (ts3 << 24);
        
                        let streamId = v.getUint32(7, !le) & 0x00FFFFFF;
                        if (streamId !== 0) {
                            Log.w(this.TAG, 'Meet tag which has StreamID != 0!');
                        }
        
                        let dataOffset = offset + 11;
        
                        switch (tagType) {
                            case 8:  // Audio
                                this._parseAudioData(chunk, dataOffset, dataSize, timestamp);
                                break;
                            case 9:  // Video
                                this._parseVideoData(chunk, dataOffset, dataSize, timestamp, byteStart + offset);
                                break;
                            case 18:  // ScriptDataObject
                                this._parseScriptData(chunk, dataOffset, dataSize);
                                break;
                        }
        
                        let prevTagSize = v.getUint32(11 + dataSize, !le);
                        if (prevTagSize !== 11 + dataSize) {
                            Log.w(this.TAG, \`Invalid PrevTagSize \${prevTagSize}\`);
                        }
        
                        offset += 11 + dataSize + 4;  // tagBody + dataSize + prevTagSize
                    }
        
                    // dispatch parsed frames to consumer (typically, the remuxer)
                    if (this._isInitialMetadataDispatched()) {
                        if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {
                            this._onDataAvailable(this._audioTrack, this._videoTrack);
                        }
                    }
        
                    return offset;  // consumed bytes, just equals latest offset index
                }
        
                _parseScriptData(arrayBuffer, dataOffset, dataSize) {
                    let scriptData = AMF.parseScriptData(arrayBuffer, dataOffset, dataSize);
        
                    if (scriptData.hasOwnProperty('onMetaData')) {
                        if (scriptData.onMetaData == null || typeof scriptData.onMetaData !== 'object') {
                            Log.w(this.TAG, 'Invalid onMetaData structure!');
                            return;
                        }
                        if (this._metadata) {
                            Log.w(this.TAG, 'Found another onMetaData tag!');
                        }
                        this._metadata = scriptData;
                        let onMetaData = this._metadata.onMetaData;
        
                        if (typeof onMetaData.hasAudio === 'boolean') {  // hasAudio
                            if (this._hasAudioFlagOverrided === false) {
                                this._hasAudio = onMetaData.hasAudio;
                                this._mediaInfo.hasAudio = this._hasAudio;
                            }
                        }
                        if (typeof onMetaData.hasVideo === 'boolean') {  // hasVideo
                            if (this._hasVideoFlagOverrided === false) {
                                this._hasVideo = onMetaData.hasVideo;
                                this._mediaInfo.hasVideo = this._hasVideo;
                            }
                        }
                        if (typeof onMetaData.audiodatarate === 'number') {  // audiodatarate
                            this._mediaInfo.audioDataRate = onMetaData.audiodatarate;
                        }
                        if (typeof onMetaData.videodatarate === 'number') {  // videodatarate
                            this._mediaInfo.videoDataRate = onMetaData.videodatarate;
                        }
                        if (typeof onMetaData.width === 'number') {  // width
                            this._mediaInfo.width = onMetaData.width;
                        }
                        if (typeof onMetaData.height === 'number') {  // height
                            this._mediaInfo.height = onMetaData.height;
                        }
                        if (typeof onMetaData.duration === 'number') {  // duration
                            if (!this._durationOverrided) {
                                let duration = Math.floor(onMetaData.duration * this._timescale);
                                this._duration = duration;
                                this._mediaInfo.duration = duration;
                            }
                        } else {
                            this._mediaInfo.duration = 0;
                        }
                        if (typeof onMetaData.framerate === 'number') {  // framerate
                            let fps_num = Math.floor(onMetaData.framerate * 1000);
                            if (fps_num > 0) {
                                let fps = fps_num / 1000;
                                this._referenceFrameRate.fixed = true;
                                this._referenceFrameRate.fps = fps;
                                this._referenceFrameRate.fps_num = fps_num;
                                this._referenceFrameRate.fps_den = 1000;
                                this._mediaInfo.fps = fps;
                            }
                        }
                        if (typeof onMetaData.keyframes === 'object') {  // keyframes
                            this._mediaInfo.hasKeyframesIndex = true;
                            let keyframes = onMetaData.keyframes;
                            this._mediaInfo.keyframesIndex = this._parseKeyframesIndex(keyframes);
                            onMetaData.keyframes = null;  // keyframes has been extracted, remove it
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
        
                _parseKeyframesIndex(keyframes) {
                    let times = [];
                    let filepositions = [];
        
                    // ignore first keyframe which is actually AVC Sequence Header (AVCDecoderConfigurationRecord)
                    for (let i = 1; i < keyframes.times.length; i++) {
                        let time = this._timestampBase + Math.floor(keyframes.times[i] * 1000);
                        times.push(time);
                        filepositions.push(keyframes.filepositions[i]);
                    }
        
                    return {
                        times: times,
                        filepositions: filepositions
                    };
                }
        
                _parseAudioData(arrayBuffer, dataOffset, dataSize, tagTimestamp) {
                    if (dataSize <= 1) {
                        Log.w(this.TAG, 'Flv: Invalid audio packet, missing SoundData payload!');
                        return;
                    }
        
                    if (this._hasAudioFlagOverrided === true && this._hasAudio === false) {
                        // If hasAudio: false indicated explicitly in MediaDataSource,
                        // Ignore all the audio packets
                        return;
                    }
        
                    let le = this._littleEndian;
                    let v = new DataView(arrayBuffer, dataOffset, dataSize);
        
                    let soundSpec = v.getUint8(0);
        
                    let soundFormat = soundSpec >>> 4;
                    if (soundFormat !== 2 && soundFormat !== 10) {  // MP3 or AAC
                        this._onError(DemuxErrors.CODEC_UNSUPPORTED, 'Flv: Unsupported audio codec idx: ' + soundFormat);
                        return;
                    }
        
                    let soundRate = 0;
                    let soundRateIndex = (soundSpec & 12) >>> 2;
                    if (soundRateIndex >= 0 && soundRateIndex <= 4) {
                        soundRate = this._flvSoundRateTable[soundRateIndex];
                    } else {
                        this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid audio sample rate idx: ' + soundRateIndex);
                        return;
                    }
        
                    let soundSize = (soundSpec & 2) >>> 1;  // unused
                    let soundType = (soundSpec & 1);
        
        
                    let meta = this._audioMetadata;
                    let track = this._audioTrack;
        
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
                        meta.channelCount = (soundType === 0 ? 1 : 2);
                    }
        
                    if (soundFormat === 10) {  // AAC
                        let aacData = this._parseAACAudioData(arrayBuffer, dataOffset + 1, dataSize - 1);
                        if (aacData == undefined) {
                            return;
                        }
        
                        if (aacData.packetType === 0) {  // AAC sequence header (AudioSpecificConfig)
                            if (meta.config) {
                                Log.w(this.TAG, 'Found another AudioSpecificConfig!');
                            }
                            let misc = aacData.data;
                            meta.audioSampleRate = misc.samplingRate;
                            meta.channelCount = misc.channelCount;
                            meta.codec = misc.codec;
                            meta.originalCodec = misc.originalCodec;
                            meta.config = misc.config;
                            // added by qli5
                            meta.configRaw = misc.configRaw;
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
        
                            let mi = this._mediaInfo;
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
                        } else if (aacData.packetType === 1) {  // AAC raw frame data
                            let dts = this._timestampBase + tagTimestamp;
                            let aacSample = { unit: aacData.data, length: aacData.data.byteLength, dts: dts, pts: dts };
                            track.samples.push(aacSample);
                            track.length += aacData.data.length;
                        } else {
                            Log.e(this.TAG, \`Flv: Unsupported AAC data type \${aacData.packetType}\`);
                        }
                    } else if (soundFormat === 2) {  // MP3
                        if (!meta.codec) {
                            // We need metadata for mp3 audio track, extract info from frame header
                            let misc = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, true);
                            if (misc == undefined) {
                                return;
                            }
                            meta.audioSampleRate = misc.samplingRate;
                            meta.channelCount = misc.channelCount;
                            meta.codec = misc.codec;
                            meta.originalCodec = misc.originalCodec;
                            // The decode result of an mp3 sample is 1152 PCM samples
                            meta.refSampleDuration = 1152 / meta.audioSampleRate * meta.timescale;
                            Log.v(this.TAG, 'Parsed MPEG Audio Frame Header');
        
                            this._audioInitialMetadataDispatched = true;
                            this._onTrackMetadata('audio', meta);
        
                            let mi = this._mediaInfo;
                            mi.audioCodec = meta.codec;
                            mi.audioSampleRate = meta.audioSampleRate;
                            mi.audioChannelCount = meta.channelCount;
                            mi.audioDataRate = misc.bitRate;
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
                        }
        
                        // This packet is always a valid audio packet, extract it
                        let data = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, false);
                        if (data == undefined) {
                            return;
                        }
                        let dts = this._timestampBase + tagTimestamp;
                        let mp3Sample = { unit: data, length: data.byteLength, dts: dts, pts: dts };
                        track.samples.push(mp3Sample);
                        track.length += data.length;
                    }
                }
        
                _parseAACAudioData(arrayBuffer, dataOffset, dataSize) {
                    if (dataSize <= 1) {
                        Log.w(this.TAG, 'Flv: Invalid AAC packet, missing AACPacketType or/and Data!');
                        return;
                    }
        
                    let result = {};
                    let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
        
                    result.packetType = array[0];
        
                    if (array[0] === 0) {
                        result.data = this._parseAACAudioSpecificConfig(arrayBuffer, dataOffset + 1, dataSize - 1);
                    } else {
                        result.data = array.subarray(1);
                    }
        
                    return result;
                }
        
                _parseAACAudioSpecificConfig(arrayBuffer, dataOffset, dataSize) {
                    let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
                    let config = null;
        
                    /* Audio Object Type:
                       0: Null
                       1: AAC Main
                       2: AAC LC
                       3: AAC SSR (Scalable Sample Rate)
                       4: AAC LTP (Long Term Prediction)
                       5: HE-AAC / SBR (Spectral Band Replication)
                       6: AAC Scalable
                    */
        
                    let audioObjectType = 0;
                    let originalAudioObjectType = 0;
                    let audioExtensionObjectType = null;
                    let samplingIndex = 0;
                    let extensionSamplingIndex = null;
        
                    // 5 bits
                    audioObjectType = originalAudioObjectType = array[0] >>> 3;
                    // 4 bits
                    samplingIndex = ((array[0] & 0x07) << 1) | (array[1] >>> 7);
                    if (samplingIndex < 0 || samplingIndex >= this._mpegSamplingRates.length) {
                        this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: AAC invalid sampling frequency index!');
                        return;
                    }
        
                    let samplingFrequence = this._mpegSamplingRates[samplingIndex];
        
                    // 4 bits
                    let channelConfig = (array[1] & 0x78) >>> 3;
                    if (channelConfig < 0 || channelConfig >= 8) {
                        this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: AAC invalid channel configuration');
                        return;
                    }
        
                    if (audioObjectType === 5) {  // HE-AAC?
                        // 4 bits
                        extensionSamplingIndex = ((array[1] & 0x07) << 1) | (array[2] >>> 7);
                        // 5 bits
                        audioExtensionObjectType = (array[2] & 0x7C) >>> 2;
                    }
        
                    // workarounds for various browsers
                    let userAgent = navigator.userAgent.toLowerCase();
        
                    if (userAgent.indexOf('firefox') !== -1) {
                        // firefox: use SBR (HE-AAC) if freq less than 24kHz
                        if (samplingIndex >= 6) {
                            audioObjectType = 5;
                            config = new Array(4);
                            extensionSamplingIndex = samplingIndex - 3;
                        } else {  // use LC-AAC
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
                        } else if (channelConfig === 1) {  // Mono channel
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
                        config[1] |= ((extensionSamplingIndex & 0x0F) >>> 1);
                        config[2] = (extensionSamplingIndex & 0x01) << 7;
                        // extended audio object type: force to 2 (LC-AAC)
                        config[2] |= (2 << 2);
                        config[3] = 0;
                    }
        
                    return {
                        // configRaw: added by qli5
                        configRaw: array,
                        config: config,
                        samplingRate: samplingFrequence,
                        channelCount: channelConfig,
                        codec: 'mp4a.40.' + audioObjectType,
                        originalCodec: 'mp4a.40.' + originalAudioObjectType
                    };
                }
        
                _parseMP3AudioData(arrayBuffer, dataOffset, dataSize, requestHeader) {
                    if (dataSize < 4) {
                        Log.w(this.TAG, 'Flv: Invalid MP3 packet, header missing!');
                        return;
                    }
        
                    let le = this._littleEndian;
                    let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
                    let result = null;
        
                    if (requestHeader) {
                        if (array[0] !== 0xFF) {
                            return;
                        }
                        let ver = (array[1] >>> 3) & 0x03;
                        let layer = (array[1] & 0x06) >> 1;
        
                        let bitrate_index = (array[2] & 0xF0) >>> 4;
                        let sampling_freq_index = (array[2] & 0x0C) >>> 2;
        
                        let channel_mode = (array[3] >>> 6) & 0x03;
                        let channel_count = channel_mode !== 3 ? 2 : 1;
        
                        let sample_rate = 0;
                        let bit_rate = 0;
                        let object_type = 34;  // Layer-3, listed in MPEG-4 Audio Object Types
        
                        let codec = 'mp3';
        
                        switch (ver) {
                            case 0:  // MPEG 2.5
                                sample_rate = this._mpegAudioV25SampleRateTable[sampling_freq_index];
                                break;
                            case 2:  // MPEG 2
                                sample_rate = this._mpegAudioV20SampleRateTable[sampling_freq_index];
                                break;
                            case 3:  // MPEG 1
                                sample_rate = this._mpegAudioV10SampleRateTable[sampling_freq_index];
                                break;
                        }
        
                        switch (layer) {
                            case 1:  // Layer 3
                                object_type = 34;
                                if (bitrate_index < this._mpegAudioL3BitRateTable.length) {
                                    bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];
                                }
                                break;
                            case 2:  // Layer 2
                                object_type = 33;
                                if (bitrate_index < this._mpegAudioL2BitRateTable.length) {
                                    bit_rate = this._mpegAudioL2BitRateTable[bitrate_index];
                                }
                                break;
                            case 3:  // Layer 1
                                object_type = 32;
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
        
                _parseVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition) {
                    if (dataSize <= 1) {
                        Log.w(this.TAG, 'Flv: Invalid video packet, missing VideoData payload!');
                        return;
                    }
        
                    if (this._hasVideoFlagOverrided === true && this._hasVideo === false) {
                        // If hasVideo: false indicated explicitly in MediaDataSource,
                        // Ignore all the video packets
                        return;
                    }
        
                    let spec = (new Uint8Array(arrayBuffer, dataOffset, dataSize))[0];
        
                    let frameType = (spec & 240) >>> 4;
                    let codecId = spec & 15;
        
                    if (codecId !== 7) {
                        this._onError(DemuxErrors.CODEC_UNSUPPORTED, \`Flv: Unsupported codec in video frame: \${codecId}\`);
                        return;
                    }
        
                    this._parseAVCVideoPacket(arrayBuffer, dataOffset + 1, dataSize - 1, tagTimestamp, tagPosition, frameType);
                }
        
                _parseAVCVideoPacket(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType) {
                    if (dataSize < 4) {
                        Log.w(this.TAG, 'Flv: Invalid AVC packet, missing AVCPacketType or/and CompositionTime');
                        return;
                    }
        
                    let le = this._littleEndian;
                    let v = new DataView(arrayBuffer, dataOffset, dataSize);
        
                    let packetType = v.getUint8(0);
                    let cts = v.getUint32(0, !le) & 0x00FFFFFF;
        
                    if (packetType === 0) {  // AVCDecoderConfigurationRecord
                        this._parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset + 4, dataSize - 4);
                    } else if (packetType === 1) {  // One or more Nalus
                        this._parseAVCVideoData(arrayBuffer, dataOffset + 4, dataSize - 4, tagTimestamp, tagPosition, frameType, cts);
                    } else if (packetType === 2) {
                        // empty, AVC end of sequence
                    } else {
                        this._onError(DemuxErrors.FORMAT_ERROR, \`Flv: Invalid video packet type \${packetType}\`);
                        return;
                    }
                }
        
                _parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset, dataSize) {
                    if (dataSize < 7) {
                        Log.w(this.TAG, 'Flv: Invalid AVCDecoderConfigurationRecord, lack of data!');
                        return;
                    }
        
                    let meta = this._videoMetadata;
                    let track = this._videoTrack;
                    let le = this._littleEndian;
                    let v = new DataView(arrayBuffer, dataOffset, dataSize);
        
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
        
                    let version = v.getUint8(0);  // configurationVersion
                    let avcProfile = v.getUint8(1);  // avcProfileIndication
                    let profileCompatibility = v.getUint8(2);  // profile_compatibility
                    let avcLevel = v.getUint8(3);  // AVCLevelIndication
        
                    if (version !== 1 || avcProfile === 0) {
                        this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord');
                        return;
                    }
        
                    this._naluLengthSize = (v.getUint8(4) & 3) + 1;  // lengthSizeMinusOne
                    if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {  // holy shit!!!
                        this._onError(DemuxErrors.FORMAT_ERROR, \`Flv: Strange NaluLengthSizeMinusOne: \${this._naluLengthSize - 1}\`);
                        return;
                    }
        
                    let spsCount = v.getUint8(5) & 31;  // numOfSequenceParameterSets
                    if (spsCount === 0) {
                        this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord: No SPS');
                        return;
                    } else if (spsCount > 1) {
                        Log.w(this.TAG, \`Flv: Strange AVCDecoderConfigurationRecord: SPS Count = \${spsCount}\`);
                    }
        
                    let offset = 6;
        
                    for (let i = 0; i < spsCount; i++) {
                        let len = v.getUint16(offset, !le);  // sequenceParameterSetLength
                        offset += 2;
        
                        if (len === 0) {
                            continue;
                        }
        
                        // Notice: Nalu without startcode header (00 00 00 01)
                        let sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);
                        offset += len;
        
                        let config = SPSParser.parseSPS(sps);
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
        
                        if (config.frame_rate.fixed === false ||
                            config.frame_rate.fps_num === 0 ||
                            config.frame_rate.fps_den === 0) {
                            meta.frameRate = this._referenceFrameRate;
                        }
        
                        let fps_den = meta.frameRate.fps_den;
                        let fps_num = meta.frameRate.fps_num;
                        meta.refSampleDuration = meta.timescale * (fps_den / fps_num);
        
                        let codecArray = sps.subarray(1, 4);
                        let codecString = 'avc1.';
                        for (let j = 0; j < 3; j++) {
                            let h = codecArray[j].toString(16);
                            if (h.length < 2) {
                                h = '0' + h;
                            }
                            codecString += h;
                        }
                        meta.codec = codecString;
        
                        let mi = this._mediaInfo;
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
        
                    let ppsCount = v.getUint8(offset);  // numOfPictureParameterSets
                    if (ppsCount === 0) {
                        this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord: No PPS');
                        return;
                    } else if (ppsCount > 1) {
                        Log.w(this.TAG, \`Flv: Strange AVCDecoderConfigurationRecord: PPS Count = \${ppsCount}\`);
                    }
        
                    offset++;
        
                    for (let i = 0; i < ppsCount; i++) {
                        let len = v.getUint16(offset, !le);  // pictureParameterSetLength
                        offset += 2;
        
                        if (len === 0) {
                            continue;
                        }
        
                        // pps is useless for extracting video information
                        offset += len;
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
        
                _parseAVCVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType, cts) {
                    let le = this._littleEndian;
                    let v = new DataView(arrayBuffer, dataOffset, dataSize);
        
                    let units = [], length = 0;
        
                    let offset = 0;
                    const lengthSize = this._naluLengthSize;
                    let dts = this._timestampBase + tagTimestamp;
                    let keyframe = (frameType === 1);  // from FLV Frame Type constants
                    let refIdc = 1; // added by qli5
        
                    while (offset < dataSize) {
                        if (offset + 4 >= dataSize) {
                            Log.w(this.TAG, \`Malformed Nalu near timestamp \${dts}, offset = \${offset}, dataSize = \${dataSize}\`);
                            break;  // data not enough for next Nalu
                        }
                        // Nalu with length-header (AVC1)
                        let naluSize = v.getUint32(offset, !le);  // Big-Endian read
                        if (lengthSize === 3) {
                            naluSize >>>= 8;
                        }
                        if (naluSize > dataSize - lengthSize) {
                            Log.w(this.TAG, \`Malformed Nalus near timestamp \${dts}, NaluSize > DataSize!\`);
                            return;
                        }
        
                        let unitType = v.getUint8(offset + lengthSize) & 0x1F;
                        // added by qli5
                        refIdc = v.getUint8(offset + lengthSize) & 0x60;
        
                        if (unitType === 5) {  // IDR
                            keyframe = true;
                        }
        
                        let data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);
                        let unit = { type: unitType, data: data };
                        units.push(unit);
                        length += data.byteLength;
        
                        offset += lengthSize + naluSize;
                    }
        
                    if (units.length) {
                        let track = this._videoTrack;
                        let avcSample = {
                            units: units,
                            length: length,
                            isKeyframe: keyframe,
                            refIdc: refIdc,
                            dts: dts,
                            cts: cts,
                            pts: (dts + cts)
                        };
                        if (keyframe) {
                            avcSample.fileposition = tagPosition;
                        }
                        track.samples.push(avcSample);
                        track.length += length;
                    }
                }
        
            }
        
            return FLVDemuxer;
        })();
        
        const ASS = class {
            /**
             * Extract sections from ass string
             * @param {string} str 
             * @returns {Object} - object from sections
             */
            static extractSections(str) {
                const regex = /\\[(.*)\\]/g;
                let match;
                let matchArr = [];
                while ((match = regex.exec(str)) !== null) {
                    matchArr.push({ name: match[1], index: match.index });
                }
                let ret = {};
                matchArr.forEach((match, i) => ret[match.name] = str.slice(match.index, matchArr[i + 1] && matchArr[i + 1].index));
                return ret;
            }
        
            /**
             * Extract subtitle lines from section Events
             * @param {string} str 
             * @returns {Array<Object>} - array of subtitle lines
             */
            static extractSubtitleLines(str) {
                const lines = str.split('\\n');
                if (lines[0] != '[Events]' && lines[0] != '[events]') throw new Error('ASSDemuxer: section is not [Events]');
                if (lines[1].indexOf('Format:') != 0 && lines[1].indexOf('format:') != 0) throw new Error('ASSDemuxer: cannot find Format definition in section [Events]');
        
                const format = lines[1].slice(lines[1].indexOf(':') + 1).split(',').map(e => e.trim());
                return lines.slice(2).map(e => {
                    let j = {};
                    e.replace(/[d|D]ialogue:\\s*/, '')
                        .match(new RegExp(new Array(format.length - 1).fill('(.*?),').join('') + '(.*)'))
                        .slice(1)
                        .forEach((k, index) => j[format[index]] = k)
                    return j;
                });
            }
        
            /**
             * Create a new ASS Demuxer
             */
            constructor() {
                this.info = '';
                this.styles = '';
                this.events = '';
                this.eventsHeader = '';
                this.pictures = '';
                this.fonts = '';
                this.lines = '';
            }
        
            get header() {
                // return this.info + this.styles + this.eventsHeader;
                return this.info + this.styles;
            }
        
            /**
             * Load a file from an arraybuffer of a string
             * @param {(ArrayBuffer|string)} chunk 
             */
            parseFile(chunk) {
                const str = typeof chunk == 'string' ? chunk : new TextDecoder('utf-8').decode(chunk);
                for (let [i, j] of Object.entries(ASS.extractSections(str))) {
                    if (i.match(/Script Info(?:mation)?/i)) this.info = j;
                    else if (i.match(/V4\\+? Styles?/i)) this.styles = j;
                    else if (i.match(/Events?/i)) this.events = j;
                    else if (i.match(/Pictures?/i)) this.pictures = j;
                    else if (i.match(/Fonts?/i)) this.fonts = j;
                }
                this.eventsHeader = this.events.split('\\n', 2).join('\\n') + '\\n';
                this.lines = ASS.extractSubtitleLines(this.events);
                return this;
            }
        };
        
        /**
         * The EMBL builder is from simple-ebml-builder
         * 
         * Copyright 2017 ryiwamoto
         * 
         * @author ryiwamoto
         * 
         * Permission is hereby granted, free of charge, to any person obtaining
         * a copy of this software and associated documentation files (the
         * "Software"), to deal in the Software without restriction, including 
         * without limitation the rights to use, copy, modify, merge, publish, 
         * distribute, sublicense, and/or sell copies of the Software, and to 
         * permit persons to whom the Software is furnished to do so, subject 
         * to the following conditions:
         * 
         * The above copyright notice and this permission notice shall be 
         * included in all copies or substantial portions of the Software.
         * 
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
         * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
         * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR 
         * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
         * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
         * DEALINGS IN THE SOFTWARE.
         */
        // const EBML = require('./ebml');
        const EBML = (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++)s(r[o]); return s })({
            1: [function (require, module, exports) {
                let EBML = require('simple-ebml-builder');
                EBML.float = num => new EBML.Value(EBML.float32bit(num));
                EBML.int16 = num => new EBML.Value(EBML.int16Bit(num));
                module.exports = EBML;
        
            }, { "simple-ebml-builder": 5 }], 2: [function (require, module, exports) {
                (function (global) {
                    /**
                     * lodash (Custom Build) <https://lodash.com/>
                     * Build: \`lodash modularize exports="npm" -o ./\`
                     * Copyright jQuery Foundation and other contributors <https://jquery.org/>
                     * Released under MIT license <https://lodash.com/license>
                     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
                     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
                     */
        
                    /** Used as the \`TypeError\` message for "Functions" methods. */
                    var FUNC_ERROR_TEXT = 'Expected a function';
        
                    /** Used to stand-in for \`undefined\` hash values. */
                    var HASH_UNDEFINED = '__lodash_hash_undefined__';
        
                    /** \`Object#toString\` result references. */
                    var funcTag = '[object Function]',
                        genTag = '[object GeneratorFunction]';
        
                    /**
                     * Used to match \`RegExp\`
                     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
                     */
                    var reRegExpChar = /[\\\\^\$.*+?()[\\]{}|]/g;
        
                    /** Used to detect host constructors (Safari). */
                    var reIsHostCtor = /^\\[object .+?Constructor\\]\$/;
        
                    /** Detect free variable \`global\` from Node.js. */
                    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
        
                    /** Detect free variable \`self\`. */
                    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
        
                    /** Used as a reference to the global object. */
                    var root = freeGlobal || freeSelf || Function('return this')();
        
                    /**
                     * Gets the value at \`key\` of \`object\`.
                     *
                     * @private
                     * @param {Object} [object] The object to query.
                     * @param {string} key The key of the property to get.
                     * @returns {*} Returns the property value.
                     */
                    function getValue(object, key) {
                        return object == null ? undefined : object[key];
                    }
        
                    /**
                     * Checks if \`value\` is a host object in IE < 9.
                     *
                     * @private
                     * @param {*} value The value to check.
                     * @returns {boolean} Returns \`true\` if \`value\` is a host object, else \`false\`.
                     */
                    function isHostObject(value) {
                        // Many host objects are \`Object\` objects that can coerce to strings
                        // despite having improperly defined \`toString\` methods.
                        var result = false;
                        if (value != null && typeof value.toString != 'function') {
                            try {
                                result = !!(value + '');
                            } catch (e) { }
                        }
                        return result;
                    }
        
                    /** Used for built-in method references. */
                    var arrayProto = Array.prototype,
                        funcProto = Function.prototype,
                        objectProto = Object.prototype;
        
                    /** Used to detect overreaching core-js shims. */
                    var coreJsData = root['__core-js_shared__'];
        
                    /** Used to detect methods masquerading as native. */
                    var maskSrcKey = (function () {
                        var uid = /[^.]+\$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
                        return uid ? ('Symbol(src)_1.' + uid) : '';
                    }());
        
                    /** Used to resolve the decompiled source of functions. */
                    var funcToString = funcProto.toString;
        
                    /** Used to check objects for own properties. */
                    var hasOwnProperty = objectProto.hasOwnProperty;
        
                    /**
                     * Used to resolve the
                     * [\`toStringTag\`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
                     * of values.
                     */
                    var objectToString = objectProto.toString;
        
                    /** Used to detect if a method is native. */
                    var reIsNative = RegExp('^' +
                        funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\\\\$&')
                            .replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, '\$1.*?') + '\$'
                    );
        
                    /** Built-in value references. */
                    var splice = arrayProto.splice;
        
                    /* Built-in method references that are verified to be native. */
                    var Map = getNative(root, 'Map'),
                        nativeCreate = getNative(Object, 'create');
        
                    /**
                     * Creates a hash object.
                     *
                     * @private
                     * @constructor
                     * @param {Array} [entries] The key-value pairs to cache.
                     */
                    function Hash(entries) {
                        var index = -1,
                            length = entries ? entries.length : 0;
        
                        this.clear();
                        while (++index < length) {
                            var entry = entries[index];
                            this.set(entry[0], entry[1]);
                        }
                    }
        
                    /**
                     * Removes all key-value entries from the hash.
                     *
                     * @private
                     * @name clear
                     * @memberOf Hash
                     */
                    function hashClear() {
                        this.__data__ = nativeCreate ? nativeCreate(null) : {};
                    }
        
                    /**
                     * Removes \`key\` and its value from the hash.
                     *
                     * @private
                     * @name delete
                     * @memberOf Hash
                     * @param {Object} hash The hash to modify.
                     * @param {string} key The key of the value to remove.
                     * @returns {boolean} Returns \`true\` if the entry was removed, else \`false\`.
                     */
                    function hashDelete(key) {
                        return this.has(key) && delete this.__data__[key];
                    }
        
                    /**
                     * Gets the hash value for \`key\`.
                     *
                     * @private
                     * @name get
                     * @memberOf Hash
                     * @param {string} key The key of the value to get.
                     * @returns {*} Returns the entry value.
                     */
                    function hashGet(key) {
                        var data = this.__data__;
                        if (nativeCreate) {
                            var result = data[key];
                            return result === HASH_UNDEFINED ? undefined : result;
                        }
                        return hasOwnProperty.call(data, key) ? data[key] : undefined;
                    }
        
                    /**
                     * Checks if a hash value for \`key\` exists.
                     *
                     * @private
                     * @name has
                     * @memberOf Hash
                     * @param {string} key The key of the entry to check.
                     * @returns {boolean} Returns \`true\` if an entry for \`key\` exists, else \`false\`.
                     */
                    function hashHas(key) {
                        var data = this.__data__;
                        return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
                    }
        
                    /**
                     * Sets the hash \`key\` to \`value\`.
                     *
                     * @private
                     * @name set
                     * @memberOf Hash
                     * @param {string} key The key of the value to set.
                     * @param {*} value The value to set.
                     * @returns {Object} Returns the hash instance.
                     */
                    function hashSet(key, value) {
                        var data = this.__data__;
                        data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
                        return this;
                    }
        
                    // Add methods to \`Hash\`.
                    Hash.prototype.clear = hashClear;
                    Hash.prototype['delete'] = hashDelete;
                    Hash.prototype.get = hashGet;
                    Hash.prototype.has = hashHas;
                    Hash.prototype.set = hashSet;
        
                    /**
                     * Creates an list cache object.
                     *
                     * @private
                     * @constructor
                     * @param {Array} [entries] The key-value pairs to cache.
                     */
                    function ListCache(entries) {
                        var index = -1,
                            length = entries ? entries.length : 0;
        
                        this.clear();
                        while (++index < length) {
                            var entry = entries[index];
                            this.set(entry[0], entry[1]);
                        }
                    }
        
                    /**
                     * Removes all key-value entries from the list cache.
                     *
                     * @private
                     * @name clear
                     * @memberOf ListCache
                     */
                    function listCacheClear() {
                        this.__data__ = [];
                    }
        
                    /**
                     * Removes \`key\` and its value from the list cache.
                     *
                     * @private
                     * @name delete
                     * @memberOf ListCache
                     * @param {string} key The key of the value to remove.
                     * @returns {boolean} Returns \`true\` if the entry was removed, else \`false\`.
                     */
                    function listCacheDelete(key) {
                        var data = this.__data__,
                            index = assocIndexOf(data, key);
        
                        if (index < 0) {
                            return false;
                        }
                        var lastIndex = data.length - 1;
                        if (index == lastIndex) {
                            data.pop();
                        } else {
                            splice.call(data, index, 1);
                        }
                        return true;
                    }
        
                    /**
                     * Gets the list cache value for \`key\`.
                     *
                     * @private
                     * @name get
                     * @memberOf ListCache
                     * @param {string} key The key of the value to get.
                     * @returns {*} Returns the entry value.
                     */
                    function listCacheGet(key) {
                        var data = this.__data__,
                            index = assocIndexOf(data, key);
        
                        return index < 0 ? undefined : data[index][1];
                    }
        
                    /**
                     * Checks if a list cache value for \`key\` exists.
                     *
                     * @private
                     * @name has
                     * @memberOf ListCache
                     * @param {string} key The key of the entry to check.
                     * @returns {boolean} Returns \`true\` if an entry for \`key\` exists, else \`false\`.
                     */
                    function listCacheHas(key) {
                        return assocIndexOf(this.__data__, key) > -1;
                    }
        
                    /**
                     * Sets the list cache \`key\` to \`value\`.
                     *
                     * @private
                     * @name set
                     * @memberOf ListCache
                     * @param {string} key The key of the value to set.
                     * @param {*} value The value to set.
                     * @returns {Object} Returns the list cache instance.
                     */
                    function listCacheSet(key, value) {
                        var data = this.__data__,
                            index = assocIndexOf(data, key);
        
                        if (index < 0) {
                            data.push([key, value]);
                        } else {
                            data[index][1] = value;
                        }
                        return this;
                    }
        
                    // Add methods to \`ListCache\`.
                    ListCache.prototype.clear = listCacheClear;
                    ListCache.prototype['delete'] = listCacheDelete;
                    ListCache.prototype.get = listCacheGet;
                    ListCache.prototype.has = listCacheHas;
                    ListCache.prototype.set = listCacheSet;
        
                    /**
                     * Creates a map cache object to store key-value pairs.
                     *
                     * @private
                     * @constructor
                     * @param {Array} [entries] The key-value pairs to cache.
                     */
                    function MapCache(entries) {
                        var index = -1,
                            length = entries ? entries.length : 0;
        
                        this.clear();
                        while (++index < length) {
                            var entry = entries[index];
                            this.set(entry[0], entry[1]);
                        }
                    }
        
                    /**
                     * Removes all key-value entries from the map.
                     *
                     * @private
                     * @name clear
                     * @memberOf MapCache
                     */
                    function mapCacheClear() {
                        this.__data__ = {
                            'hash': new Hash,
                            'map': new (Map || ListCache),
                            'string': new Hash
                        };
                    }
        
                    /**
                     * Removes \`key\` and its value from the map.
                     *
                     * @private
                     * @name delete
                     * @memberOf MapCache
                     * @param {string} key The key of the value to remove.
                     * @returns {boolean} Returns \`true\` if the entry was removed, else \`false\`.
                     */
                    function mapCacheDelete(key) {
                        return getMapData(this, key)['delete'](key);
                    }
        
                    /**
                     * Gets the map value for \`key\`.
                     *
                     * @private
                     * @name get
                     * @memberOf MapCache
                     * @param {string} key The key of the value to get.
                     * @returns {*} Returns the entry value.
                     */
                    function mapCacheGet(key) {
                        return getMapData(this, key).get(key);
                    }
        
                    /**
                     * Checks if a map value for \`key\` exists.
                     *
                     * @private
                     * @name has
                     * @memberOf MapCache
                     * @param {string} key The key of the entry to check.
                     * @returns {boolean} Returns \`true\` if an entry for \`key\` exists, else \`false\`.
                     */
                    function mapCacheHas(key) {
                        return getMapData(this, key).has(key);
                    }
        
                    /**
                     * Sets the map \`key\` to \`value\`.
                     *
                     * @private
                     * @name set
                     * @memberOf MapCache
                     * @param {string} key The key of the value to set.
                     * @param {*} value The value to set.
                     * @returns {Object} Returns the map cache instance.
                     */
                    function mapCacheSet(key, value) {
                        getMapData(this, key).set(key, value);
                        return this;
                    }
        
                    // Add methods to \`MapCache\`.
                    MapCache.prototype.clear = mapCacheClear;
                    MapCache.prototype['delete'] = mapCacheDelete;
                    MapCache.prototype.get = mapCacheGet;
                    MapCache.prototype.has = mapCacheHas;
                    MapCache.prototype.set = mapCacheSet;
        
                    /**
                     * Gets the index at which the \`key\` is found in \`array\` of key-value pairs.
                     *
                     * @private
                     * @param {Array} array The array to inspect.
                     * @param {*} key The key to search for.
                     * @returns {number} Returns the index of the matched value, else \`-1\`.
                     */
                    function assocIndexOf(array, key) {
                        var length = array.length;
                        while (length--) {
                            if (eq(array[length][0], key)) {
                                return length;
                            }
                        }
                        return -1;
                    }
        
                    /**
                     * The base implementation of \`_.isNative\` without bad shim checks.
                     *
                     * @private
                     * @param {*} value The value to check.
                     * @returns {boolean} Returns \`true\` if \`value\` is a native function,
                     *  else \`false\`.
                     */
                    function baseIsNative(value) {
                        if (!isObject(value) || isMasked(value)) {
                            return false;
                        }
                        var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
                        return pattern.test(toSource(value));
                    }
        
                    /**
                     * Gets the data for \`map\`.
                     *
                     * @private
                     * @param {Object} map The map to query.
                     * @param {string} key The reference key.
                     * @returns {*} Returns the map data.
                     */
                    function getMapData(map, key) {
                        var data = map.__data__;
                        return isKeyable(key)
                            ? data[typeof key == 'string' ? 'string' : 'hash']
                            : data.map;
                    }
        
                    /**
                     * Gets the native function at \`key\` of \`object\`.
                     *
                     * @private
                     * @param {Object} object The object to query.
                     * @param {string} key The key of the method to get.
                     * @returns {*} Returns the function if it's native, else \`undefined\`.
                     */
                    function getNative(object, key) {
                        var value = getValue(object, key);
                        return baseIsNative(value) ? value : undefined;
                    }
        
                    /**
                     * Checks if \`value\` is suitable for use as unique object key.
                     *
                     * @private
                     * @param {*} value The value to check.
                     * @returns {boolean} Returns \`true\` if \`value\` is suitable, else \`false\`.
                     */
                    function isKeyable(value) {
                        var type = typeof value;
                        return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
                            ? (value !== '__proto__')
                            : (value === null);
                    }
        
                    /**
                     * Checks if \`func\` has its source masked.
                     *
                     * @private
                     * @param {Function} func The function to check.
                     * @returns {boolean} Returns \`true\` if \`func\` is masked, else \`false\`.
                     */
                    function isMasked(func) {
                        return !!maskSrcKey && (maskSrcKey in func);
                    }
        
                    /**
                     * Converts \`func\` to its source code.
                     *
                     * @private
                     * @param {Function} func The function to process.
                     * @returns {string} Returns the source code.
                     */
                    function toSource(func) {
                        if (func != null) {
                            try {
                                return funcToString.call(func);
                            } catch (e) { }
                            try {
                                return (func + '');
                            } catch (e) { }
                        }
                        return '';
                    }
        
                    /**
                     * Creates a function that memoizes the result of \`func\`. If \`resolver\` is
                     * provided, it determines the cache key for storing the result based on the
                     * arguments provided to the memoized function. By default, the first argument
                     * provided to the memoized function is used as the map cache key. The \`func\`
                     * is invoked with the \`this\` binding of the memoized function.
                     *
                     * **Note:** The cache is exposed as the \`cache\` property on the memoized
                     * function. Its creation may be customized by replacing the \`_.memoize.Cache\`
                     * constructor with one whose instances implement the
                     * [\`Map\`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
                     * method interface of \`delete\`, \`get\`, \`has\`, and \`set\`.
                     *
                     * @static
                     * @memberOf _
                     * @since 0.1.0
                     * @category Function
                     * @param {Function} func The function to have its output memoized.
                     * @param {Function} [resolver] The function to resolve the cache key.
                     * @returns {Function} Returns the new memoized function.
                     * @example
                     *
                     * var object = { 'a': 1, 'b': 2 };
                     * var other = { 'c': 3, 'd': 4 };
                     *
                     * var values = _.memoize(_.values);
                     * values(object);
                     * // => [1, 2]
                     *
                     * values(other);
                     * // => [3, 4]
                     *
                     * object.a = 2;
                     * values(object);
                     * // => [1, 2]
                     *
                     * // Modify the result cache.
                     * values.cache.set(object, ['a', 'b']);
                     * values(object);
                     * // => ['a', 'b']
                     *
                     * // Replace \`_.memoize.Cache\`.
                     * _.memoize.Cache = WeakMap;
                     */
                    function memoize(func, resolver) {
                        if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
                            throw new TypeError(FUNC_ERROR_TEXT);
                        }
                        var memoized = function () {
                            var args = arguments,
                                key = resolver ? resolver.apply(this, args) : args[0],
                                cache = memoized.cache;
        
                            if (cache.has(key)) {
                                return cache.get(key);
                            }
                            var result = func.apply(this, args);
                            memoized.cache = cache.set(key, result);
                            return result;
                        };
                        memoized.cache = new (memoize.Cache || MapCache);
                        return memoized;
                    }
        
                    // Assign cache to \`_.memoize\`.
                    memoize.Cache = MapCache;
        
                    /**
                     * Performs a
                     * [\`SameValueZero\`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
                     * comparison between two values to determine if they are equivalent.
                     *
                     * @static
                     * @memberOf _
                     * @since 4.0.0
                     * @category Lang
                     * @param {*} value The value to compare.
                     * @param {*} other The other value to compare.
                     * @returns {boolean} Returns \`true\` if the values are equivalent, else \`false\`.
                     * @example
                     *
                     * var object = { 'a': 1 };
                     * var other = { 'a': 1 };
                     *
                     * _.eq(object, object);
                     * // => true
                     *
                     * _.eq(object, other);
                     * // => false
                     *
                     * _.eq('a', 'a');
                     * // => true
                     *
                     * _.eq('a', Object('a'));
                     * // => false
                     *
                     * _.eq(NaN, NaN);
                     * // => true
                     */
                    function eq(value, other) {
                        return value === other || (value !== value && other !== other);
                    }
        
                    /**
                     * Checks if \`value\` is classified as a \`Function\` object.
                     *
                     * @static
                     * @memberOf _
                     * @since 0.1.0
                     * @category Lang
                     * @param {*} value The value to check.
                     * @returns {boolean} Returns \`true\` if \`value\` is a function, else \`false\`.
                     * @example
                     *
                     * _.isFunction(_);
                     * // => true
                     *
                     * _.isFunction(/abc/);
                     * // => false
                     */
                    function isFunction(value) {
                        // The use of \`Object#toString\` avoids issues with the \`typeof\` operator
                        // in Safari 8-9 which returns 'object' for typed array and other constructors.
                        var tag = isObject(value) ? objectToString.call(value) : '';
                        return tag == funcTag || tag == genTag;
                    }
        
                    /**
                     * Checks if \`value\` is the
                     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
                     * of \`Object\`. (e.g. arrays, functions, objects, regexes, \`new Number(0)\`, and \`new String('')\`)
                     *
                     * @static
                     * @memberOf _
                     * @since 0.1.0
                     * @category Lang
                     * @param {*} value The value to check.
                     * @returns {boolean} Returns \`true\` if \`value\` is an object, else \`false\`.
                     * @example
                     *
                     * _.isObject({});
                     * // => true
                     *
                     * _.isObject([1, 2, 3]);
                     * // => true
                     *
                     * _.isObject(_.noop);
                     * // => true
                     *
                     * _.isObject(null);
                     * // => false
                     */
                    function isObject(value) {
                        var type = typeof value;
                        return !!value && (type == 'object' || type == 'function');
                    }
        
                    module.exports = memoize;
        
                }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
            }, {}], 3: [function (require, module, exports) {
                "use strict";
                var memoize = require("lodash.memoize");
                var typedArrayUtils_1 = require("./typedArrayUtils");
                var Value = (function () {
                    function Value(bytes) {
                        this.bytes = bytes;
                    }
                    Value.prototype.write = function (buf, pos) {
                        buf.set(this.bytes, pos);
                        return pos + this.bytes.length;
                    };
                    Value.prototype.countSize = function () {
                        return this.bytes.length;
                    };
                    return Value;
                }());
                exports.Value = Value;
                var Element = (function () {
                    function Element(id, children, isSizeUnknown) {
                        this.id = id;
                        this.children = children;
                        var bodySize = this.children.reduce(function (p, c) { return p + c.countSize(); }, 0);
                        this.sizeMetaData = isSizeUnknown ?
                            exports.UNKNOWN_SIZE :
                            exports.vintEncode(typedArrayUtils_1.numberToByteArray(bodySize, exports.getEBMLByteLength(bodySize)));
                        this.size = this.id.length + this.sizeMetaData.length + bodySize;
                    }
                    Element.prototype.write = function (buf, pos) {
                        buf.set(this.id, pos);
                        buf.set(this.sizeMetaData, pos + this.id.length);
                        return this.children.reduce(function (p, c) { return c.write(buf, p); }, pos + this.id.length + this.sizeMetaData.length);
                    };
                    Element.prototype.countSize = function () {
                        return this.size;
                    };
                    return Element;
                }());
                exports.Element = Element;
                exports.bytes = memoize(function (data) {
                    return new Value(data);
                });
                exports.number = memoize(function (num) {
                    return exports.bytes(typedArrayUtils_1.numberToByteArray(num));
                });
                exports.vintEncodedNumber = memoize(function (num) {
                    return exports.bytes(exports.vintEncode(typedArrayUtils_1.numberToByteArray(num, exports.getEBMLByteLength(num))));
                });
                exports.string = memoize(function (str) {
                    return exports.bytes(typedArrayUtils_1.stringToByteArray(str));
                });
                exports.element = function (id, child) {
                    return new Element(id, Array.isArray(child) ? child : [child], false);
                };
                exports.unknownSizeElement = function (id, child) {
                    return new Element(id, Array.isArray(child) ? child : [child], true);
                };
                exports.build = function (v) {
                    var b = new Uint8Array(v.countSize());
                    v.write(b, 0);
                    return b;
                };
                exports.getEBMLByteLength = function (num) {
                    if (num < 0) {
                        throw new Error("EBML.getEBMLByteLength: negative number not implemented");
                    }
                    else if (num < 0x7f) {
                        return 1;
                    }
                    else if (num < 0x3fff) {
                        return 2;
                    }
                    else if (num < 0x1fffff) {
                        return 3;
                    }
                    else if (num < 0xfffffff) {
                        return 4;
                    }
                    else if (num < 0x7ffffffff) {
                        return 5;
                    }
                    else if (num < 0x3ffffffffff) {
                        return 6;
                    }
                    else if (num < 0x1ffffffffffff) {
                        return 7;
                    }
                    else if (num < 0x20000000000000) {
                        return 8;
                    }
                    else if (num < 0xffffffffffffff) {
                        throw new Error("EBMLgetEBMLByteLength: number exceeds Number.MAX_SAFE_INTEGER");
                    }
                    else {
                        throw new Error("EBMLgetEBMLByteLength: data size must be less than or equal to " + (Math.pow(2, 56) - 2));
                    }
                };
                exports.UNKNOWN_SIZE = new Uint8Array([0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
                exports.vintEncode = function (byteArray) {
                    byteArray[0] = exports.getSizeMask(byteArray.length) | byteArray[0];
                    return byteArray;
                };
                exports.getSizeMask = function (byteLength) {
                    return 0x80 >> (byteLength - 1);
                };
        
            }, { "./typedArrayUtils": 6, "lodash.memoize": 2 }], 4: [function (require, module, exports) {
                "use strict";
                /**
                 * @see https://www.matroska.org/technical/specs/index.html
                 */
                exports.ID = {
                    EBML: Uint8Array.of(0x1A, 0x45, 0xDF, 0xA3),
                    EBMLVersion: Uint8Array.of(0x42, 0x86),
                    EBMLReadVersion: Uint8Array.of(0x42, 0xF7),
                    EBMLMaxIDLength: Uint8Array.of(0x42, 0xF2),
                    EBMLMaxSizeLength: Uint8Array.of(0x42, 0xF3),
                    DocType: Uint8Array.of(0x42, 0x82),
                    DocTypeVersion: Uint8Array.of(0x42, 0x87),
                    DocTypeReadVersion: Uint8Array.of(0x42, 0x85),
                    Void: Uint8Array.of(0xEC),
                    CRC32: Uint8Array.of(0xBF),
                    Segment: Uint8Array.of(0x18, 0x53, 0x80, 0x67),
                    SeekHead: Uint8Array.of(0x11, 0x4D, 0x9B, 0x74),
                    Seek: Uint8Array.of(0x4D, 0xBB),
                    SeekID: Uint8Array.of(0x53, 0xAB),
                    SeekPosition: Uint8Array.of(0x53, 0xAC),
                    Info: Uint8Array.of(0x15, 0x49, 0xA9, 0x66),
                    SegmentUID: Uint8Array.of(0x73, 0xA4),
                    SegmentFilename: Uint8Array.of(0x73, 0x84),
                    PrevUID: Uint8Array.of(0x3C, 0xB9, 0x23),
                    PrevFilename: Uint8Array.of(0x3C, 0x83, 0xAB),
                    NextUID: Uint8Array.of(0x3E, 0xB9, 0x23),
                    NextFilename: Uint8Array.of(0x3E, 0x83, 0xBB),
                    SegmentFamily: Uint8Array.of(0x44, 0x44),
                    ChapterTranslate: Uint8Array.of(0x69, 0x24),
                    ChapterTranslateEditionUID: Uint8Array.of(0x69, 0xFC),
                    ChapterTranslateCodec: Uint8Array.of(0x69, 0xBF),
                    ChapterTranslateID: Uint8Array.of(0x69, 0xA5),
                    TimecodeScale: Uint8Array.of(0x2A, 0xD7, 0xB1),
                    Duration: Uint8Array.of(0x44, 0x89),
                    DateUTC: Uint8Array.of(0x44, 0x61),
                    Title: Uint8Array.of(0x7B, 0xA9),
                    MuxingApp: Uint8Array.of(0x4D, 0x80),
                    WritingApp: Uint8Array.of(0x57, 0x41),
                    Cluster: Uint8Array.of(0x1F, 0x43, 0xB6, 0x75),
                    Timecode: Uint8Array.of(0xE7),
                    SilentTracks: Uint8Array.of(0x58, 0x54),
                    SilentTrackNumber: Uint8Array.of(0x58, 0xD7),
                    Position: Uint8Array.of(0xA7),
                    PrevSize: Uint8Array.of(0xAB),
                    SimpleBlock: Uint8Array.of(0xA3),
                    BlockGroup: Uint8Array.of(0xA0),
                    Block: Uint8Array.of(0xA1),
                    BlockAdditions: Uint8Array.of(0x75, 0xA1),
                    BlockMore: Uint8Array.of(0xA6),
                    BlockAddID: Uint8Array.of(0xEE),
                    BlockAdditional: Uint8Array.of(0xA5),
                    BlockDuration: Uint8Array.of(0x9B),
                    ReferencePriority: Uint8Array.of(0xFA),
                    ReferenceBlock: Uint8Array.of(0xFB),
                    CodecState: Uint8Array.of(0xA4),
                    DiscardPadding: Uint8Array.of(0x75, 0xA2),
                    Slices: Uint8Array.of(0x8E),
                    TimeSlice: Uint8Array.of(0xE8),
                    LaceNumber: Uint8Array.of(0xCC),
                    Tracks: Uint8Array.of(0x16, 0x54, 0xAE, 0x6B),
                    TrackEntry: Uint8Array.of(0xAE),
                    TrackNumber: Uint8Array.of(0xD7),
                    TrackUID: Uint8Array.of(0x73, 0xC5),
                    TrackType: Uint8Array.of(0x83),
                    FlagEnabled: Uint8Array.of(0xB9),
                    FlagDefault: Uint8Array.of(0x88),
                    FlagForced: Uint8Array.of(0x55, 0xAA),
                    FlagLacing: Uint8Array.of(0x9C),
                    MinCache: Uint8Array.of(0x6D, 0xE7),
                    MaxCache: Uint8Array.of(0x6D, 0xF8),
                    DefaultDuration: Uint8Array.of(0x23, 0xE3, 0x83),
                    DefaultDecodedFieldDuration: Uint8Array.of(0x23, 0x4E, 0x7A),
                    MaxBlockAdditionID: Uint8Array.of(0x55, 0xEE),
                    Name: Uint8Array.of(0x53, 0x6E),
                    Language: Uint8Array.of(0x22, 0xB5, 0x9C),
                    CodecID: Uint8Array.of(0x86),
                    CodecPrivate: Uint8Array.of(0x63, 0xA2),
                    CodecName: Uint8Array.of(0x25, 0x86, 0x88),
                    AttachmentLink: Uint8Array.of(0x74, 0x46),
                    CodecDecodeAll: Uint8Array.of(0xAA),
                    TrackOverlay: Uint8Array.of(0x6F, 0xAB),
                    CodecDelay: Uint8Array.of(0x56, 0xAA),
                    SeekPreRoll: Uint8Array.of(0x56, 0xBB),
                    TrackTranslate: Uint8Array.of(0x66, 0x24),
                    TrackTranslateEditionUID: Uint8Array.of(0x66, 0xFC),
                    TrackTranslateCodec: Uint8Array.of(0x66, 0xBF),
                    TrackTranslateTrackID: Uint8Array.of(0x66, 0xA5),
                    Video: Uint8Array.of(0xE0),
                    FlagInterlaced: Uint8Array.of(0x9A),
                    FieldOrder: Uint8Array.of(0x9D),
                    StereoMode: Uint8Array.of(0x53, 0xB8),
                    AlphaMode: Uint8Array.of(0x53, 0xC0),
                    PixelWidth: Uint8Array.of(0xB0),
                    PixelHeight: Uint8Array.of(0xBA),
                    PixelCropBottom: Uint8Array.of(0x54, 0xAA),
                    PixelCropTop: Uint8Array.of(0x54, 0xBB),
                    PixelCropLeft: Uint8Array.of(0x54, 0xCC),
                    PixelCropRight: Uint8Array.of(0x54, 0xDD),
                    DisplayWidth: Uint8Array.of(0x54, 0xB0),
                    DisplayHeight: Uint8Array.of(0x54, 0xBA),
                    DisplayUnit: Uint8Array.of(0x54, 0xB2),
                    AspectRatioType: Uint8Array.of(0x54, 0xB3),
                    ColourSpace: Uint8Array.of(0x2E, 0xB5, 0x24),
                    Colour: Uint8Array.of(0x55, 0xB0),
                    MatrixCoefficients: Uint8Array.of(0x55, 0xB1),
                    BitsPerChannel: Uint8Array.of(0x55, 0xB2),
                    ChromaSubsamplingHorz: Uint8Array.of(0x55, 0xB3),
                    ChromaSubsamplingVert: Uint8Array.of(0x55, 0xB4),
                    CbSubsamplingHorz: Uint8Array.of(0x55, 0xB5),
                    CbSubsamplingVert: Uint8Array.of(0x55, 0xB6),
                    ChromaSitingHorz: Uint8Array.of(0x55, 0xB7),
                    ChromaSitingVert: Uint8Array.of(0x55, 0xB8),
                    Range: Uint8Array.of(0x55, 0xB9),
                    TransferCharacteristics: Uint8Array.of(0x55, 0xBA),
                    Primaries: Uint8Array.of(0x55, 0xBB),
                    MaxCLL: Uint8Array.of(0x55, 0xBC),
                    MaxFALL: Uint8Array.of(0x55, 0xBD),
                    MasteringMetadata: Uint8Array.of(0x55, 0xD0),
                    PrimaryRChromaticityX: Uint8Array.of(0x55, 0xD1),
                    PrimaryRChromaticityY: Uint8Array.of(0x55, 0xD2),
                    PrimaryGChromaticityX: Uint8Array.of(0x55, 0xD3),
                    PrimaryGChromaticityY: Uint8Array.of(0x55, 0xD4),
                    PrimaryBChromaticityX: Uint8Array.of(0x55, 0xD5),
                    PrimaryBChromaticityY: Uint8Array.of(0x55, 0xD6),
                    WhitePointChromaticityX: Uint8Array.of(0x55, 0xD7),
                    WhitePointChromaticityY: Uint8Array.of(0x55, 0xD8),
                    LuminanceMax: Uint8Array.of(0x55, 0xD9),
                    LuminanceMin: Uint8Array.of(0x55, 0xDA),
                    Audio: Uint8Array.of(0xE1),
                    SamplingFrequency: Uint8Array.of(0xB5),
                    OutputSamplingFrequency: Uint8Array.of(0x78, 0xB5),
                    Channels: Uint8Array.of(0x9F),
                    BitDepth: Uint8Array.of(0x62, 0x64),
                    TrackOperation: Uint8Array.of(0xE2),
                    TrackCombinePlanes: Uint8Array.of(0xE3),
                    TrackPlane: Uint8Array.of(0xE4),
                    TrackPlaneUID: Uint8Array.of(0xE5),
                    TrackPlaneType: Uint8Array.of(0xE6),
                    TrackJoinBlocks: Uint8Array.of(0xE9),
                    TrackJoinUID: Uint8Array.of(0xED),
                    ContentEncodings: Uint8Array.of(0x6D, 0x80),
                    ContentEncoding: Uint8Array.of(0x62, 0x40),
                    ContentEncodingOrder: Uint8Array.of(0x50, 0x31),
                    ContentEncodingScope: Uint8Array.of(0x50, 0x32),
                    ContentEncodingType: Uint8Array.of(0x50, 0x33),
                    ContentCompression: Uint8Array.of(0x50, 0x34),
                    ContentCompAlgo: Uint8Array.of(0x42, 0x54),
                    ContentCompSettings: Uint8Array.of(0x42, 0x55),
                    ContentEncryption: Uint8Array.of(0x50, 0x35),
                    ContentEncAlgo: Uint8Array.of(0x47, 0xE1),
                    ContentEncKeyID: Uint8Array.of(0x47, 0xE2),
                    ContentSignature: Uint8Array.of(0x47, 0xE3),
                    ContentSigKeyID: Uint8Array.of(0x47, 0xE4),
                    ContentSigAlgo: Uint8Array.of(0x47, 0xE5),
                    ContentSigHashAlgo: Uint8Array.of(0x47, 0xE6),
                    Cues: Uint8Array.of(0x1C, 0x53, 0xBB, 0x6B),
                    CuePoint: Uint8Array.of(0xBB),
                    CueTime: Uint8Array.of(0xB3),
                    CueTrackPositions: Uint8Array.of(0xB7),
                    CueTrack: Uint8Array.of(0xF7),
                    CueClusterPosition: Uint8Array.of(0xF1),
                    CueRelativePosition: Uint8Array.of(0xF0),
                    CueDuration: Uint8Array.of(0xB2),
                    CueBlockNumber: Uint8Array.of(0x53, 0x78),
                    CueCodecState: Uint8Array.of(0xEA),
                    CueReference: Uint8Array.of(0xDB),
                    CueRefTime: Uint8Array.of(0x96),
                    Attachments: Uint8Array.of(0x19, 0x41, 0xA4, 0x69),
                    AttachedFile: Uint8Array.of(0x61, 0xA7),
                    FileDescription: Uint8Array.of(0x46, 0x7E),
                    FileName: Uint8Array.of(0x46, 0x6E),
                    FileMimeType: Uint8Array.of(0x46, 0x60),
                    FileData: Uint8Array.of(0x46, 0x5C),
                    FileUID: Uint8Array.of(0x46, 0xAE),
                    Chapters: Uint8Array.of(0x10, 0x43, 0xA7, 0x70),
                    EditionEntry: Uint8Array.of(0x45, 0xB9),
                    EditionUID: Uint8Array.of(0x45, 0xBC),
                    EditionFlagHidden: Uint8Array.of(0x45, 0xBD),
                    EditionFlagDefault: Uint8Array.of(0x45, 0xDB),
                    EditionFlagOrdered: Uint8Array.of(0x45, 0xDD),
                    ChapterAtom: Uint8Array.of(0xB6),
                    ChapterUID: Uint8Array.of(0x73, 0xC4),
                    ChapterStringUID: Uint8Array.of(0x56, 0x54),
                    ChapterTimeStart: Uint8Array.of(0x91),
                    ChapterTimeEnd: Uint8Array.of(0x92),
                    ChapterFlagHidden: Uint8Array.of(0x98),
                    ChapterFlagEnabled: Uint8Array.of(0x45, 0x98),
                    ChapterSegmentUID: Uint8Array.of(0x6E, 0x67),
                    ChapterSegmentEditionUID: Uint8Array.of(0x6E, 0xBC),
                    ChapterPhysicalEquiv: Uint8Array.of(0x63, 0xC3),
                    ChapterTrack: Uint8Array.of(0x8F),
                    ChapterTrackNumber: Uint8Array.of(0x89),
                    ChapterDisplay: Uint8Array.of(0x80),
                    ChapString: Uint8Array.of(0x85),
                    ChapLanguage: Uint8Array.of(0x43, 0x7C),
                    ChapCountry: Uint8Array.of(0x43, 0x7E),
                    ChapProcess: Uint8Array.of(0x69, 0x44),
                    ChapProcessCodecID: Uint8Array.of(0x69, 0x55),
                    ChapProcessPrivate: Uint8Array.of(0x45, 0x0D),
                    ChapProcessCommand: Uint8Array.of(0x69, 0x11),
                    ChapProcessTime: Uint8Array.of(0x69, 0x22),
                    ChapProcessData: Uint8Array.of(0x69, 0x33),
                    Tags: Uint8Array.of(0x12, 0x54, 0xC3, 0x67),
                    Tag: Uint8Array.of(0x73, 0x73),
                    Targets: Uint8Array.of(0x63, 0xC0),
                    TargetTypeValue: Uint8Array.of(0x68, 0xCA),
                    TargetType: Uint8Array.of(0x63, 0xCA),
                    TagTrackUID: Uint8Array.of(0x63, 0xC5),
                    TagEditionUID: Uint8Array.of(0x63, 0xC9),
                    TagChapterUID: Uint8Array.of(0x63, 0xC4),
                    TagAttachmentUID: Uint8Array.of(0x63, 0xC6),
                    SimpleTag: Uint8Array.of(0x67, 0xC8),
                    TagName: Uint8Array.of(0x45, 0xA3),
                    TagLanguage: Uint8Array.of(0x44, 0x7A),
                    TagDefault: Uint8Array.of(0x44, 0x84),
                    TagString: Uint8Array.of(0x44, 0x87),
                    TagBinary: Uint8Array.of(0x44, 0x85),
                };
        
            }, {}], 5: [function (require, module, exports) {
                "use strict";
                function __export(m) {
                    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                __export(require("./ebml"));
                __export(require("./id"));
                __export(require("./typedArrayUtils"));
        
            }, { "./ebml": 3, "./id": 4, "./typedArrayUtils": 6 }], 6: [function (require, module, exports) {
                "use strict";
                var memoize = require("lodash.memoize");
                exports.numberToByteArray = function (num, byteLength) {
                    if (byteLength === void 0) byteLength = getNumberByteLength(num);
                    var byteArray;
                    if (byteLength == 1) {
                        byteArray = new DataView(new ArrayBuffer(1));
                        byteArray.setUint8(0, num);
                    }
                    else if (byteLength == 2) {
                        byteArray = new DataView(new ArrayBuffer(2));
                        byteArray.setUint16(0, num);
                    }
                    else if (byteLength == 3) {
                        byteArray = new DataView(new ArrayBuffer(3));
                        byteArray.setUint8(0, num >> 16);
                        byteArray.setUint16(1, num & 0xffff);
                    }
                    else if (byteLength == 4) {
                        byteArray = new DataView(new ArrayBuffer(4));
                        byteArray.setUint32(0, num);
                    }
                    // 4GB (upper limit for int32) should be enough in most cases
                    else if (/* byteLength == 5 && */num < 0xffffffff) {
                        byteArray = new DataView(new ArrayBuffer(5));
                        byteArray.setUint32(1, num);
                    }
                    // Naive emulations of int64 bitwise opreators
                    else if (byteLength == 5) {
                        byteArray = new DataView(new ArrayBuffer(5));
                        byteArray.setUint8(0, num / 0x100000000 | 0);
                        byteArray.setUint32(1, num % 0x100000000);
                    }
                    else if (byteLength == 6) {
                        byteArray = new DataView(new ArrayBuffer(6));
                        byteArray.setUint16(0, num / 0x100000000 | 0);
                        byteArray.setUint32(2, num % 0x100000000);
                    }
                    else if (byteLength == 7) {
                        byteArray = new DataView(new ArrayBuffer(7));
                        byteArray.setUint8(0, num / 0x1000000000000 | 0);
                        byteArray.setUint16(1, num / 0x100000000 & 0xffff);
                        byteArray.setUint32(3, num % 0x100000000);
                    }
                    else if (byteLength == 8) {
                        byteArray = new DataView(new ArrayBuffer(8));
                        byteArray.setUint32(0, num / 0x100000000 | 0);
                        byteArray.setUint32(4, num % 0x100000000);
                    }
                    else {
                        throw new Error("EBML.typedArrayUtils.numberToByteArray: byte length must be less than or equal to 8");
                    }
                    return new Uint8Array(byteArray.buffer)
                };
                exports.stringToByteArray = memoize(function (str) {
                    return Uint8Array.from(Array.from(str).map(function (_) { return _.codePointAt(0); }));
                });
                function getNumberByteLength(num) {
                    if (num < 0) {
                        throw new Error("EBML.typedArrayUtils.getNumberByteLength: negative number not implemented");
                    }
                    else if (num < 0x100) {
                        return 1;
                    }
                    else if (num < 0x10000) {
                        return 2;
                    }
                    else if (num < 0x1000000) {
                        return 3;
                    }
                    else if (num < 0x100000000) {
                        return 4;
                    }
                    else if (num < 0x10000000000) {
                        return 5;
                    }
                    else if (num < 0x1000000000000) {
                        return 6;
                    }
                    else if (num < 0x20000000000000) {
                        return 7;
                    }
                    else {
                        throw new Error("EBML.typedArrayUtils.getNumberByteLength: number exceeds Number.MAX_SAFE_INTEGER");
                    }
                }
                exports.getNumberByteLength = getNumberByteLength;
                exports.int16Bit = memoize(function (num) {
                    var ab = new ArrayBuffer(2);
                    new DataView(ab).setInt16(0, num);
                    return new Uint8Array(ab);
                });
                exports.float32bit = memoize(function (num) {
                    var ab = new ArrayBuffer(4);
                    new DataView(ab).setFloat32(0, num);
                    return new Uint8Array(ab);
                });
                exports.dumpBytes = function (b) {
                    return Array.from(new Uint8Array(b)).map(function (_) { return "0x" + _.toString(16); }).join(", ");
                };
        
            }, { "lodash.memoize": 2 }]
        }, {}, [])(1);
        
        const MKV = class {
            constructor(config) {
                this.min = true;
                this.onprogress = null;
                Object.assign(this, config);
                this.segmentUID = MKV.randomBytes(16);
                this.trackUIDBase = Math.trunc(Math.random() * 2 ** 16);
                this.trackMetadata = { h264: null, aac: null, ass: null };
                this.duration = 0;
                this.blocks = { h264: [], aac: [], ass: [] };
            }
        
            static randomBytes(num) {
                return Array.from(new Array(num), () => Math.trunc(Math.random() * 256));
            }
        
            static textToMS(str) {
                const [, h, mm, ss, ms10] = str.match(/(\\d+):(\\d+):(\\d+).(\\d+)/);
                return h * 3600000 + mm * 60000 + ss * 1000 + ms10 * 10;
            }
        
            static mimeToCodecID(str) {
                switch (str) {
                    case 'avc1.640029':
                        return 'V_MPEG4/ISO/AVC';
                    case 'mp4a.40.2':
                        return 'A_AAC';
                    default:
                        throw new Error(\`MKVRemuxer: unknown codec \${str}\`);
                }
            }
        
            static uint8ArrayConcat(...array) {
                // if (Array.isArray(array[0])) array = array[0];
                if (array.length == 1) return array[0];
                if (typeof Buffer != 'undefined') return Buffer.concat(array);
                const ret = new Uint8Array(array.reduce((i, j) => i.byteLength + j.byteLength));
                let length = 0;
                for (let e of array) {
                    ret.set(e, length);
                    length += e.byteLength;
                }
                return ret;
            }
        
            addH264Metadata(h264) {
                this.trackMetadata.h264 = {
                    codecId: MKV.mimeToCodecID(h264.codec),
                    codecPrivate: h264.avcc,
                    defaultDuration: h264.refSampleDuration * 1000000,
                    pixelWidth: h264.codecWidth,
                    pixelHeight: h264.codecHeight,
                    displayWidth: h264.presentWidth,
                    displayHeight: h264.presentHeight
                };
                this.duration = Math.max(this.duration, h264.duration);
            }
        
            addAACMetadata(aac) {
                this.trackMetadata.aac = {
                    codecId: MKV.mimeToCodecID(aac.originalCodec),
                    codecPrivate: aac.configRaw,
                    defaultDuration: aac.refSampleDuration * 1000000,
                    samplingFrequence: aac.audioSampleRate,
                    channels: aac.channelCount
                };
                this.duration = Math.max(this.duration, aac.duration);
            }
        
            addASSMetadata(ass) {
                this.trackMetadata.ass = {
                    codecId: 'S_TEXT/ASS',
                    codecPrivate: new TextEncoder().encode(ass.header)
                };
            }
        
            addH264Stream(h264) {
                this.blocks.h264 = this.blocks.h264.concat(h264.samples.map(e => ({
                    track: 1,
                    frame: MKV.uint8ArrayConcat(...e.units.map(i => i.data)),
                    isKeyframe: e.isKeyframe,
                    discardable: Boolean(e.refIdc),
                    timestamp: e.pts,
                    simple: true,
                })));
            }
        
            addAACStream(aac) {
                this.blocks.aac = this.blocks.aac.concat(aac.samples.map(e => ({
                    track: 2,
                    frame: e.unit,
                    timestamp: e.pts,
                    simple: true,
                })));
            }
        
            addASSStream(ass) {
                this.blocks.ass = this.blocks.ass.concat(ass.lines.map((e, i) => ({
                    track: 3,
                    frame: new TextEncoder().encode(\`\${i},\${e['Layer'] || ''},\${e['Style'] || ''},\${e['Name'] || ''},\${e['MarginL'] || ''},\${e['MarginR'] || ''},\${e['MarginV'] || ''},\${e['Effect'] || ''},\${e['Text'] || ''}\`),
                    timestamp: MKV.textToMS(e['Start']),
                    duration: MKV.textToMS(e['End']) - MKV.textToMS(e['Start']),
                })));
            }
        
            build() {
                return new Blob([
                    this.buildHeader(),
                    this.buildBody()
                ]);
            }
        
            buildHeader() {
                return new Blob([EBML.build(EBML.element(EBML.ID.EBML, [
                    EBML.element(EBML.ID.EBMLVersion, EBML.number(1)),
                    EBML.element(EBML.ID.EBMLReadVersion, EBML.number(1)),
                    EBML.element(EBML.ID.EBMLMaxIDLength, EBML.number(4)),
                    EBML.element(EBML.ID.EBMLMaxSizeLength, EBML.number(8)),
                    EBML.element(EBML.ID.DocType, EBML.string('matroska')),
                    EBML.element(EBML.ID.DocTypeVersion, EBML.number(4)),
                    EBML.element(EBML.ID.DocTypeReadVersion, EBML.number(2)),
                ]))]);
            }
        
            buildBody() {
                if (this.min) {
                    return new Blob([EBML.build(EBML.element(EBML.ID.Segment, [
                        this.getSegmentInfo(),
                        this.getTracks(),
                        ...this.getClusterArray()
                    ]))]);
                }
                else {
                    return new Blob([EBML.build(EBML.element(EBML.ID.Segment, [
                        this.getSeekHead(),
                        this.getVoid(4100),
                        this.getSegmentInfo(),
                        this.getTracks(),
                        this.getVoid(1100),
                        ...this.getClusterArray()
                    ]))]);
                }
            }
        
            getSeekHead() {
                return EBML.element(EBML.ID.SeekHead, [
                    EBML.element(EBML.ID.Seek, [
                        EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Info)),
                        EBML.element(EBML.ID.SeekPosition, EBML.number(4050))
                    ]),
                    EBML.element(EBML.ID.Seek, [
                        EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Tracks)),
                        EBML.element(EBML.ID.SeekPosition, EBML.number(4200))
                    ]),
                ]);
            }
        
            getVoid(length = 2000) {
                return EBML.element(EBML.ID.Void, EBML.bytes(new Uint8Array(length)));
            }
        
            getSegmentInfo() {
                return EBML.element(EBML.ID.Info, [
                    EBML.element(EBML.ID.TimecodeScale, EBML.number(1000000)),
                    EBML.element(EBML.ID.MuxingApp, EBML.string('flv.js + assparser_qli5 -> simple-ebml-builder')),
                    EBML.element(EBML.ID.WritingApp, EBML.string('flvass2mkv.js by qli5')),
                    EBML.element(EBML.ID.Duration, EBML.float(this.duration)),
                    EBML.element(EBML.ID.SegmentUID, EBML.bytes(this.segmentUID)),
                ]);
            }
        
            getTracks() {
                return EBML.element(EBML.ID.Tracks, [
                    this.getVideoTrackEntry(),
                    this.getAudioTrackEntry(),
                    this.getSubtitleTrackEntry()
                ]);
            }
        
            getVideoTrackEntry() {
                return EBML.element(EBML.ID.TrackEntry, [
                    EBML.element(EBML.ID.TrackNumber, EBML.number(1)),
                    EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 1)),
                    EBML.element(EBML.ID.TrackType, EBML.number(0x01)),
                    EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
                    EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.h264.codecId)),
                    EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.h264.codecPrivate)),
                    EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.h264.defaultDuration)),
                    EBML.element(EBML.ID.Language, EBML.string('und')),
                    EBML.element(EBML.ID.Video, [
                        EBML.element(EBML.ID.PixelWidth, EBML.number(this.trackMetadata.h264.pixelWidth)),
                        EBML.element(EBML.ID.PixelHeight, EBML.number(this.trackMetadata.h264.pixelHeight)),
                        EBML.element(EBML.ID.DisplayWidth, EBML.number(this.trackMetadata.h264.displayWidth)),
                        EBML.element(EBML.ID.DisplayHeight, EBML.number(this.trackMetadata.h264.displayHeight)),
                    ]),
                ]);
            }
        
            getAudioTrackEntry() {
                return EBML.element(EBML.ID.TrackEntry, [
                    EBML.element(EBML.ID.TrackNumber, EBML.number(2)),
                    EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 2)),
                    EBML.element(EBML.ID.TrackType, EBML.number(0x02)),
                    EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
                    EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.aac.codecId)),
                    EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.aac.codecPrivate)),
                    EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.aac.defaultDuration)),
                    EBML.element(EBML.ID.Language, EBML.string('und')),
                    EBML.element(EBML.ID.Audio, [
                        EBML.element(EBML.ID.SamplingFrequency, EBML.float(this.trackMetadata.aac.samplingFrequence)),
                        EBML.element(EBML.ID.Channels, EBML.number(this.trackMetadata.aac.channels)),
                    ]),
                ]);
            }
        
            getSubtitleTrackEntry() {
                return EBML.element(EBML.ID.TrackEntry, [
                    EBML.element(EBML.ID.TrackNumber, EBML.number(3)),
                    EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 3)),
                    EBML.element(EBML.ID.TrackType, EBML.number(0x11)),
                    EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
                    EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.ass.codecId)),
                    EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.ass.codecPrivate)),
                    EBML.element(EBML.ID.Language, EBML.string('und')),
                ]);
            }
        
            getClusterArray() {
                // H264 codecState
                this.blocks.h264[0].simple = false;
                this.blocks.h264[0].codecState = this.trackMetadata.h264.codecPrivate;
        
                let i = 0;
                let j = 0;
                let k = 0;
                let clusterTimeCode = 0;
                let clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];
                let ret = [clusterContent];
                const progressThrottler = Math.pow(2, Math.floor(Math.log(this.blocks.h264.length >> 7) / Math.log(2))) - 1;
                for (i = 0; i < this.blocks.h264.length; i++) {
                    const e = this.blocks.h264[i];
                    for (; j < this.blocks.aac.length; j++) {
                        if (this.blocks.aac[j].timestamp < e.timestamp) {
                            clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));
                        }
                        else {
                            break;
                        }
                    }
                    for (; k < this.blocks.ass.length; k++) {
                        if (this.blocks.ass[k].timestamp < e.timestamp) {
                            clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));
                        }
                        else {
                            break;
                        }
                    }
                    if (e.isKeyframe/*  || clusterContent.length > 72 */) {
                        // start new cluster
                        clusterTimeCode = e.timestamp;
                        clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];
                        ret.push(clusterContent);
                    }
                    clusterContent.push(this.getBlocks(e, clusterTimeCode));
                    if (this.onprogress && !(i & progressThrottler)) this.onprogress({ loaded: i, total: this.blocks.h264.length });
                }
                for (; j < this.blocks.aac.length; j++) clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));
                for (; k < this.blocks.ass.length; k++) clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));
                if (this.onprogress) this.onprogress({ loaded: i, total: this.blocks.h264.length });
                if (ret[0].length == 1) ret.shift();
                ret = ret.map(clusterContent => EBML.element(EBML.ID.Cluster, clusterContent));
        
                return ret;
            }
        
            getBlocks(e, clusterTimeCode) {
                if (e.simple) {
                    return EBML.element(EBML.ID.SimpleBlock, [
                        EBML.vintEncodedNumber(e.track),
                        EBML.int16(e.timestamp - clusterTimeCode),
                        EBML.bytes(e.isKeyframe ? [128] : [0]),
                        EBML.bytes(e.frame)
                    ]);
                }
                else {
                    let blockGroupContent = [EBML.element(EBML.ID.Block, [
                        EBML.vintEncodedNumber(e.track),
                        EBML.int16(e.timestamp - clusterTimeCode),
                        EBML.bytes([0]),
                        EBML.bytes(e.frame)
                    ])];
                    if (typeof e.duration != 'undefined') {
                        blockGroupContent.push(EBML.element(EBML.ID.BlockDuration, EBML.number(e.duration)));
                    }
                    if (typeof e.codecState != 'undefined') {
                        blockGroupContent.push(EBML.element(EBML.ID.CodecState, EBML.bytes(e.codecState)));
                    }
                    return EBML.element(EBML.ID.BlockGroup, blockGroupContent);
                }
            }
        };
        
        const FLVASS2MKV = class {
            constructor(config = {}) {
                this.onflvprogress = null;
                this.onassprogress = null;
                this.onurlrevokesafe = null;
                this.onfileload = null;
                this.onmkvprogress = null;
                this.onload = null;
                Object.assign(this, config);
                this.mkvConfig = { onprogress: this.onmkvprogress };
                Object.assign(this.mkvConfig, config.mkvConfig);
            }
        
            /**
             * Demux FLV into H264 + AAC stream and ASS into line stream; then
             * remux them into a MKV file.
             * @param {Blob|string|ArrayBuffer} flv 
             * @param {Blob|string|ArrayBuffer} ass 
             */
            async build(flv = './gen_case.flv', ass = './gen_case.ass') {
                // load flv and ass as arraybuffer
                await Promise.all([
                    new Promise((r, j) => {
                        if (flv instanceof Blob) {
                            const e = new FileReader();
                            e.onprogress = this.onflvprogress;
                            e.onload = () => r(flv = e.result);
                            e.onerror = j;
                            e.readAsArrayBuffer(flv);
                        }
                        else if (typeof flv == 'string') {
                            const e = new XMLHttpRequest();
                            e.responseType = 'arraybuffer';
                            e.onprogress = this.onflvprogress;
                            e.onload = () => r(flv = e.response);
                            e.onerror = j;
                            e.open('get', flv);
                            e.send();
                            flv = 2; // onurlrevokesafe
                        }
                        else if (flv instanceof ArrayBuffer) {
                            r(flv);
                        }
                        else {
                            j(new TypeError('flvass2mkv: flv {Blob|string|ArrayBuffer}'));
                        }
                        if (typeof ass != 'string' && this.onurlrevokesafe) this.onurlrevokesafe();
                    }),
                    new Promise((r, j) => {
                        if (ass instanceof Blob) {
                            const e = new FileReader();
                            e.onprogress = this.onflvprogress;
                            e.onload = () => r(ass = e.result);
                            e.onerror = j;
                            e.readAsArrayBuffer(ass);
                        }
                        else if (typeof ass == 'string') {
                            const e = new XMLHttpRequest();
                            e.responseType = 'arraybuffer';
                            e.onprogress = this.onflvprogress;
                            e.onload = () => r(ass = e.response);
                            e.onerror = j;
                            e.open('get', ass);
                            e.send();
                            ass = 2; // onurlrevokesafe
                        }
                        else if (ass instanceof ArrayBuffer) {
                            r(ass);
                        }
                        else {
                            j(new TypeError('flvass2mkv: ass {Blob|string|ArrayBuffer}'));
                        }
                        if (typeof flv != 'string' && this.onurlrevokesafe) this.onurlrevokesafe();
                    }),
                ]);
                if (this.onfileload) this.onfileload();
        
                const mkv = new MKV(this.mkvConfig);
        
                const assParser = new ASS();
                ass = assParser.parseFile(ass);
                mkv.addASSMetadata(ass);
                mkv.addASSStream(ass);
        
                const flvProbeData = FLVDemuxer.probe(flv);
                const flvDemuxer = new FLVDemuxer(flvProbeData);
                let mediaInfo = null;
                let h264 = null;
                let aac = null;
                flvDemuxer.onDataAvailable = (...array) => {
                    array.forEach(e => {
                        if (e.type == 'video') h264 = e;
                        else if (e.type == 'audio') aac = e;
                        else throw new Error(\`MKVRemuxer: unrecoginzed data type \${e.type}\`);
                    });
                };
                flvDemuxer.onMediaInfo = i => mediaInfo = i;
                flvDemuxer.onTrackMetadata = (i, e) => {
                    if (i == 'video') mkv.addH264Metadata(e);
                    else if (i == 'audio') mkv.addAACMetadata(e);
                    else throw new Error(\`MKVRemuxer: unrecoginzed metadata type \${i}\`);
                };
                flvDemuxer.onError = e => { throw new Error(e); };
                const finalOffset = flvDemuxer.parseChunks(flv, flvProbeData.dataOffset);
                if (finalOffset != flv.byteLength) throw new Error('FLVDemuxer: unexpected EOF');
                mkv.addH264Stream(h264);
                mkv.addAACStream(aac);
        
                const ret = mkv.build();
                if (this.onload) this.onload(ret);
                return ret;
            }
        };
        
        // if nodejs then test
        if (typeof require == 'function') {
            (async () => {
                const fs = require('fs');
                const assFile = fs.readFileSync('gen_case.ass').buffer;
                const flvFile = fs.readFileSync('large_case.flv').buffer;
                fs.writeFileSync('out.mkv', await new FLVASS2MKV({ onmkvprogress: console.log.bind(console) }).build(flvFile, assFile));
            })();
        }
        </script>
        <script>
        const fileProgress = document.getElementById('fileProgress');
        const mkvProgress = document.getElementById('mkvProgress');
        const a = document.getElementById('a');

        top.exec = async option => {
            const defaultOption = {
                onflvprogress: ({ loaded, total }) => {
                    fileProgress.value = loaded;
                    fileProgress.max = total;
                },
                onfileload: () => {
                    console.timeEnd('file');
                    console.time('flvass2mkv');
                },
                onmkvprogress: ({ loaded, total }) => {
                    mkvProgress.value = loaded;
                    mkvProgress.max = total;
                },
                name: 'merged.mkv',
            };
            option = Object.assign(defaultOption, option);
            a.download = a.textContent = option.name;
            console.time('file');
            const mkv = await new FLVASS2MKV(option).build(option.flv, option.ass);
            console.timeEnd('flvass2mkv');
            a.href = URL.createObjectURL(mkv);
        }
        </script>
        `);

        // 3. Invoke exec
        if (!(this.option instanceof Object)) this.option = null;
        this.playerWin.exec(Object.assign({}, this.option, { flv, ass, name }));
        URL.revokeObjectURL(flv);
        URL.revokeObjectURL(ass);

        // 4. Free parent window
        // if (top.confirm('MKV打包中……要关掉这个窗口，释放内存吗？')) 
        top.location = 'about:blank';
    }
}

class BiliMonkey {
    constructor(playerWin, option = { cache: null, partial: false, proxy: false, blocker: false }) {
        this.playerWin = playerWin;
        this.protocol = playerWin.location.protocol;
        this.cid = null;
        this.flvs = null;
        this.mp4 = null;
        this.ass = null;
        this.flvFormatName = null;
        this.mp4FormatName = null;
        this.cidAsyncContainer = new AsyncContainer();
        this.cidAsyncContainer.then(cid => { this.cid = cid; this.ass = this.getASS(); });
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
        if (this.cache && (!(this.cache instanceof CacheDB))) this.cache = new CacheDB('biliMonkey', 'flv', 'name');

        this.flvsDetailedFetch = [];
        this.flvsBlob = [];

        this.defaultFormatPromise = null;
        this.queryInfoMutex = new Mutex();
        this.queryInfoMutex.lockAndAwait(() => this.getPlayerButtons());
        this.queryInfoMutex.lockAndAwait(() => this.getAvailableFormatName());
    }

    lockFormat(format) {
        // null => uninitialized
        // async pending => another one is working on it
        // async resolve => that guy just finished work
        // sync value => someone already finished work
        let h = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
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
                throw `lockFormat error: ${format} is a unrecognizable format`;
        }
    }

    resolveFormat(res, shouldBe) {
        let h = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
        if (h) {
            h.style.visibility = '';
            if (h.children.length) h.children[0].style.visibility = 'hidden';
            let i = e => {
                if (h.children.length) h.children[0].style.visibility = 'hidden';
                e.target.removeEventListener(e.type, i);
            };
            let j = this.playerWin.document.getElementsByTagName('video')[0];
            if (j) j.addEventListener('emptied', i);
        }
        if (shouldBe && shouldBe != res.format) {
            switch (shouldBe) {
                case 'flv': case 'hdflv2': case 'flv720': case 'flv480': this.flvs = null; break;
                case 'hdmp4': case 'mp4': this.mp4 = null; break;
            }
            throw `URL interface error: response is not ${shouldBe}`;
        }
        switch (res.format) {
            case 'flv':
            case 'hdflv2':
            case 'flv720':
            case 'flv480':
                return this.flvs = this.flvs.resolve(res.durl.map(e => e.url.replace('http:', this.protocol)));
            case 'hdmp4':
            case 'mp4':
                return this.mp4 = this.mp4.resolve(res.durl[0].url.replace('http:', this.protocol));
            default:
                throw `resolveFormat error: ${res.format} is a unrecognizable format`;
        }
    }

    getAvailableFormatName(accept_quality) {
        if (!(accept_quality instanceof Array)) accept_quality = Array.from(this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul').getElementsByTagName('li')).map(e => e.getAttribute('data-value'));
        this.flvFormatName = accept_quality.includes('80') ? 'flv' : accept_quality.includes('64') ? 'flv720' : 'flv480';
        this.mp4FormatName = 'mp4';
    }

    async execOptions() {
        if (this.cache) await this.cache.getDB();
        if (this.option.autoDefault) await this.sniffDefaultFormat();
        if (this.option.autoFLV) this.queryInfo('flv');
        if (this.option.autoMP4) this.queryInfo('mp4');
    }

    async sniffDefaultFormat() {
        if (this.defaultFormatPromise) return this.defaultFormatPromise;
        if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) return this.defaultFormatPromise = Promise.resolve();

        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;

        this.defaultFormatPromise = new Promise(resolve => {
            let timeout = setTimeout(() => { jq.ajax = _ajax; resolve(); }, 5000);
            let self = this;
            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    clearTimeout(timeout);
                    self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                    let _success = a.success;
                    a.success = res => {
                        let format = res.format;
                        let accept_format = res.accept_format.split(',');
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
        return this.defaultFormatPromise;
    }

    async getBackgroundFormat(format) {
        if (format == 'hdmp4' || format == 'mp4') {
            let src = this.playerWin.document.getElementsByTagName('video')[0].src;
            if ((src.includes('hd') || format == 'mp4') && src.includes('.mp4')) {
                let pendingFormat = this.lockFormat(format);
                this.resolveFormat({ durl: [{ url: src }] }, format);
                return pendingFormat;
            }
        }

        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;

        let pendingFormat = this.lockFormat(format);
        let self = this;
        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                let _success = a.success;
                a.success = res => {
                    if (format == 'hdmp4') res.durl = [res.durl[0].backup_url.find(e => e.includes('hd') && e.includes('.mp4'))];
                    if (format == 'mp4') res.durl = [res.durl[0].backup_url.find(e => !e.includes('hd') && e.includes('.mp4'))];
                    self.resolveFormat(res, format);
                };
                jq.ajax = _ajax;
            }
            return _ajax.call(jq, a, c);
        };
        this.playerWin.player.reloadAccess();

        return pendingFormat;
    }

    async getCurrentFormat(format) {
        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;
        const _setItem = this.playerWin.localStorage.setItem;
        const siblingFormat = format == this.flvFormatName ? this.mp4FormatName : this.flvFormatName;
        const fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': 'https://static.hdslb.com/encoding.mp4', 'backup_url': ['https://static.hdslb.com/encoding.mp4'] }] };

        let pendingFormat = this.lockFormat(format);
        let self = this;
        let blockedRequest = await new Promise(resolve => {
            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    // Send back a fake response to enable the change-format button.
                    self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                    a.success(fakedRes);
                    self.playerWin.document.getElementsByTagName('video')[1].loop = true;
                    let h = e => { resolve([a, c]); e.target.removeEventListener(e.type, h); };
                    self.playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
                }
                else {
                    return _ajax.call(jq, a, c);
                }
            };
            this.playerWin.localStorage.setItem = () => this.playerWin.localStorage.setItem = _setItem;
            this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(siblingFormat)}"]`).click();
        });

        let siblingOK = siblingFormat == this.flvFormatName ? this.flvs : this.mp4;
        if (!siblingOK) {
            this.lockFormat(siblingFormat);
            blockedRequest[0].success = res => this.resolveFormat(res, siblingFormat);
            _ajax.call(jq, ...blockedRequest);
        }

        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                let _success = a.success;
                a.success = res => {
                    if (self.proxy && res.format == 'flv') {
                        self.resolveFormat(res, format);
                        self.setupProxy(res, _success);
                    }
                    else {
                        _success(res);
                        self.resolveFormat(res, format);
                    }
                };
                jq.ajax = _ajax;
            }
            return _ajax.call(jq, a, c);
        };
        this.playerWin.localStorage.setItem = () => this.playerWin.localStorage.setItem = _setItem;
        this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(format)}"]`).click();

        return pendingFormat;
    }

    async getNonCurrentFormat(format) {
        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;
        const _setItem = this.playerWin.localStorage.setItem;

        let pendingFormat = this.lockFormat(format);
        let self = this;
        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                let _success = a.success;
                _success({});
                a.success = res => self.resolveFormat(res, format);
                jq.ajax = _ajax;
            }
            return _ajax.call(jq, a, c);
        };
        this.playerWin.localStorage.setItem = () => this.playerWin.localStorage.setItem = _setItem;
        this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(format)}"]`).click();
        return pendingFormat;
    }

    async getASS(clickableFormat) {
        if (this.ass) return this.ass;
        this.ass = new Promise(async resolve => {
            if (!this.cid) this.cid = await new Promise(resolve => {
                if (!clickableFormat) reject('get ASS Error: cid unavailable, nor clickable format given.');
                const jq = this.playerWin.jQuery;
                const _ajax = jq.ajax;
                const _setItem = this.playerWin.localStorage.setItem;

                this.lockFormat(clickableFormat);
                let self = this;
                jq.ajax = function (a, c) {
                    if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                    if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                        resolve(self.cid = a.url.match(/cid=\d+/)[0].slice(4));
                        let _success = a.success;
                        _success({});
                        a.success = res => self.resolveFormat(res, clickableFormat);
                        jq.ajax = _ajax;
                    }
                    return _ajax.call(jq, a, c);
                };
                this.playerWin.localStorage.setItem = () => this.playerWin.localStorage.setItem = _setItem;
                this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(clickableFormat)}"]`).click();
            });
            const { fetchDanmaku, generateASS, setPosition } = new ASSDownloader();

            fetchDanmaku(this.cid, danmaku => {
                if (this.blocker) {
                    if (this.playerWin.localStorage.bilibili_player_settings) {
                        let regexps = JSON.parse(this.playerWin.localStorage.bilibili_player_settings).block.list.map(e => e.v).join('|');
                        if (regexps) {
                            regexps = new RegExp(regexps);
                            danmaku = danmaku.filter(d => !regexps.test(d.text));
                        }
                    }
                }
                let ass = generateASS(setPosition(danmaku), {
                    'title': document.title,
                    'ori': location.href,
                });
                // I would assume most users are using Windows
                let blob = new Blob(['\ufeff' + ass], { type: 'application/octet-stream' });
                resolve(this.ass = top.URL.createObjectURL(blob));
            });
        });
        return this.ass;
    }

    async queryInfo(format) {
        return this.queryInfoMutex.lockAndAwait(async () => {
            switch (format) {
                case 'flv':
                    if (this.flvs)
                        return this.flvs;
                    else if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(this.flvFormatName))
                        return this.getCurrentFormat(this.flvFormatName);
                    else
                        return this.getNonCurrentFormat(this.flvFormatName);
                case 'mp4':
                    if (this.mp4)
                        return this.mp4;
                    else if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(this.mp4FormatName))
                        return this.getCurrentFormat(this.mp4FormatName);
                    else
                        return this.getNonCurrentFormat(this.mp4FormatName);
                case 'ass':
                    if (this.ass)
                        return this.ass;
                    else if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(this.flvFormatName))
                        return this.getASS(this.mp4FormatName);
                    else
                        return this.getASS(this.flvFormatName);
                default:
                    throw `Bilimonkey: What is format ${format}?`;
            }
        });
    }

    async getPlayerButtons() {
        if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
            return this.playerWin;
        }
        else {
            return new Promise(resolve => {
                let observer = new MutationObserver(() => {
                    if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
                        observer.disconnect();
                        resolve(this.playerWin);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    async hangPlayer() {
        const fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': '' }] };
        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;
        const _setItem = this.playerWin.localStorage.setItem;

        return this.queryInfoMutex.lockAndAwait(() => new Promise(async resolve => {
            let blockerTimeout;
            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    clearTimeout(blockerTimeout);
                    a.success(fakedRes);
                    blockerTimeout = setTimeout(() => {
                        jq.ajax = _ajax;
                        resolve();
                    }, 2500);
                }
                else {
                    return _ajax.call(jq, a, c);
                }
            };
            this.playerWin.localStorage.setItem = () => this.playerWin.localStorage.setItem = _setItem;
            let button = Array.from(this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul').getElementsByTagName('li'))
                .find(e => !e.getAttribute('data-selected') && !e.children.length);
            button.click();
        }));
    }

    async loadFLVFromCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
        let item = await this.cache.getData(name);
        if (!item) return;
        return this.flvsBlob[index] = item.data;
    }

    async loadPartialFLVFromCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
        name = 'PC_' + name;
        let item = await this.cache.getData(name);
        if (!item) return;
        return item.data;
    }

    async loadAllFLVFromCache() {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';

        let promises = [];
        for (let i = 0; i < this.flvs.length; i++) promises.push(this.loadFLVFromCache(i));

        return Promise.all(promises);
    }

    async saveFLVToCache(index, blob) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
        return this.cache.addData({ name, data: blob });
    }

    async savePartialFLVToCache(index, blob) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
        name = 'PC_' + name;
        return this.cache.putData({ name, data: blob });
    }

    async cleanPartialFLVInCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
        name = 'PC_' + name;
        return this.cache.deleteData(name);
    }

    async getFLV(index, progressHandler) {
        if (this.flvsBlob[index]) return this.flvsBlob[index];

        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        this.flvsBlob[index] = (async () => {
            let cache = await this.loadFLVFromCache(index);
            if (cache) return this.flvsBlob[index] = cache;
            let partialCache = await this.loadPartialFLVFromCache(index);

            let burl = this.flvs[index];
            if (partialCache) burl += `&bstart=${partialCache.size}`;
            let opt = {
                fetch: this.playerWin.fetch,
                method: 'GET',
                mode: 'cors',
                cache: 'default',
                referrerPolicy: 'no-referrer-when-downgrade',
                cacheLoaded: partialCache ? partialCache.size : 0,
                headers: partialCache && (!burl.includes('wsTime')) ? { Range: `bytes=${partialCache.size}-` } : undefined
            };
            opt.onprogress = progressHandler;
            opt.onerror = opt.onabort = ({ target, type }) => {
                let pBlob = target.getPartialBlob();
                if (partialCache) pBlob = new Blob([partialCache, pBlob]);
                this.savePartialFLVToCache(index, pBlob);
            }

            let fch = new DetailedFetchBlob(burl, opt);
            this.flvsDetailedFetch[index] = fch;
            let fullResponse = await fch.getBlob();
            this.flvsDetailedFetch[index] = undefined;
            if (partialCache) {
                fullResponse = new Blob([partialCache, fullResponse]);
                this.cleanPartialFLVInCache(index);
            }
            this.saveFLVToCache(index, fullResponse);
            return (this.flvsBlob[index] = fullResponse);
        })();
        return this.flvsBlob[index];
    }

    async abortFLV(index) {
        if (this.flvsDetailedFetch[index]) return this.flvsDetailedFetch[index].abort();
    }

    async getAllFLVs(progressHandler) {
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let promises = [];
        for (let i = 0; i < this.flvs.length; i++) promises.push(this.getFLV(i, progressHandler));
        return Promise.all(promises);
    }

    async cleanAllFLVsInCache() {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let promises = [];
        for (let flv of this.flvs) {
            let name = flv.match(/\d+-\d+(?:-\d+)?\.flv/)[0];
            promises.push(this.cache.deleteData(name));
            promises.push(this.cache.deleteData('PC_' + name));
        }
        return Promise.all(promises);
    }

    async setupProxy(res, onsuccess) {
        (() => {
            let _fetch = this.playerWin.fetch;
            this.playerWin.fetch = function (input, init) {
                if (!input.slice || input.slice(0, 5) != 'blob:') {
                    return _fetch(input, init);
                }
                let bstart = input.indexOf('?bstart=');
                if (bstart < 0) {
                    return _fetch(input, init);
                }
                if (!init.headers instanceof Headers) init.headers = new Headers(init.headers || {});
                init.headers.set('Range', `bytes=${input.slice(bstart + 8)}-`);
                return _fetch(input.slice(0, bstart), init)
            }
        })();
        await this.loadAllFLVFromCache();
        let resProxy = Object.assign({}, res);
        for (let i = 0; i < this.flvsBlob.length; i++) {
            if (this.flvsBlob[i]) resProxy.durl[i].url = this.playerWin.URL.createObjectURL(this.flvsBlob[i]);
        }
        return onsuccess(resProxy);
    }

    static formatToValue(format) {
        switch (format) {
            case 'hdflv2': return '112';
            case 'flv': return '80';
            case 'flv720': return '64';
            case 'hdmp4': return '64'; // data-value is still '64' instead of '48'. return '48';
            case 'flv480': return '32';
            case 'mp4': return '16';
            default: return null;
        }
    }

    static valueToFormat(value) {
        switch (parseInt(value)) {
            case 112: return 'hdflv2';
            case 80: return 'flv';
            case 64: return 'flv720';
            case 48: return 'hdmp4';
            case 32: return 'flv480';
            case 16: return 'mp4';
            case 3: return 'flv';
            case 2: return 'hdmp4';
            case 1: return 'mp4';
            default: return null;
        }
    }

    static _UNIT_TEST() {
        (async () => {
            let playerWin = await BiliUserJS.getPlayerWin();
            window.m = new BiliMonkey(playerWin);

            console.warn('sniffDefaultFormat test');
            await m.sniffDefaultFormat();
            console.log(m);

            console.warn('data race test');
            m.queryInfo('mp4');
            console.log(m.queryInfo('mp4'));

            console.warn('getNonCurrentFormat test');
            console.log(await m.queryInfo('mp4'));

            console.warn('getCurrentFormat test');
            console.log(await m.queryInfo('flv'));

            //location.reload();
        })();
    }
}

class BiliPolyfill {
    constructor(playerWin,
        option = {
            setStorage: (n, i) => playerWin.localStorage.setItem(n, i),
            getStorage: n => playerWin.localStorage.getItem(n),
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
        }, hintInfo = () => { }) {
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

    saveUserdata() {
        this.setStorage('biliPolyfill', JSON.stringify(this.userdata));
    }

    retrieveUserdata() {
        try {
            this.userdata = this.getStorage('biliPolyfill');
            if (this.userdata.length > 1073741824) top.alert('BiliPolyfill脚本数据已经快满了，在播放器上右键->BiliPolyfill->片头片尾->检视数据，删掉一些吧。');
            this.userdata = JSON.parse(this.userdata);
        }
        catch (e) { }
        finally {
            if (!this.userdata) this.userdata = {};
            if (!(this.userdata.oped instanceof Object)) this.userdata.oped = {};
        }
    }

    async setFunctions({ videoRefresh = false } = {}) {
        // 1. Initialize
        this.video = await this.getPlayerVideo();

        // 2. If not enabled, run the process without real actions
        if (!this.option.betabeta) return this.getPlayerMenu();

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
            this.playerWin.addEventListener('beforeunload', () => this.saveUserdata());
        }

        // 4. Set up functions that are binded to the video DOM
        if (this.option.lift) this.liftBottomDanmuku();
        if (this.option.dblclick) this.dblclickFullScreen();
        if (this.option.electric) this.reallocateElectricPanel();
        if (this.option.oped) this.skipOPED();
        this.video.addEventListener('emptied', () => this.setFunctions({ videoRefresh: true }));

        // 5. Set up functions that require everything to be ready
        await this.getPlayerMenu();
        if (this.option.menuFocus) this.menuFocusOnPlayer();

        // 6. Set up experimental functions
        if (this.option.speech) top.document.body.addEventListener('click', e => e.detail > 2 && this.speechRecognition());
    }

    async inferNextInSeries() {
        let title = (top.document.getElementsByClassName('v-title')[0] || top.document.getElementsByClassName('header-info')[0] || top.document.getElementsByClassName('video-info-module')[0]).children[0].textContent.replace(/\(\d+\)$/, '').trim();

        // 1. Find series name
        let epNumberText = title.match(/\d+/g);
        if (!epNumberText) return this.series = [];
        epNumberText = epNumberText.pop();
        let seriesTitle = title.slice(0, title.lastIndexOf(epNumberText)).trim();
        // 2. Substitude ep number
        let ep = parseInt(epNumberText);
        if (epNumberText === '09') ep = [`08`, `10`];
        else if (epNumberText[0] === '0') ep = [`0${ep - 1}`, `0${ep + 1}`];
        else ep = [`${ep - 1}`, `${ep + 1}`];
        ep = [...ep.map(e => seriesTitle + e), ...ep];

        let mid = top.document.getElementById('r-info-rank');
        if (!mid) return this.series = [];
        mid = mid.children[0].href.match(/\d+/)[0];
        let vlist = await Promise.all([title, ...ep].map(keyword => new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onload = () => resolve((req.response.status && req.response.data.vlist) || []);
            req.onerror = reject;
            req.open('get', `https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${mid}&keyword=${keyword}`);
            req.responseType = 'json';
            req.send();
        })));

        vlist[0] = [vlist[0].find(e => e.title == title)];
        if (!vlist[0][0]) { console && console.warn('BiliPolyfill: inferNextInSeries: cannot find current video in mid space'); return this.series = []; }
        this.series = [vlist[1].find(e => e.created < vlist[0][0].created), vlist[2].reverse().find(e => e.created > vlist[0][0].created)];
        if (!this.series[0]) this.series[0] = vlist[3].find(e => e.created < vlist[0][0].created) || null;
        if (!this.series[1]) this.series[1] = vlist[4].reverse().find(e => e.created > vlist[0][0].created) || null;

        return this.series;
    }

    badgeWatchLater() {
        let li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn');
        if (!li || !li.children[1]) return;
        li.children[1].style.visibility = 'hidden';
        li.dispatchEvent(new Event('mouseover'));
        let observer = new MutationObserver(() => {
            if (li.children[1].children[0].children[0].className == 'm-w-loading') return;
            observer.disconnect();
            li.dispatchEvent(new Event('mouseout'));
            setTimeout(() => li.children[1].style.visibility = '', 700);
            if (li.children[1].children[0].children[0].className == 'no-data') return;
            let div = top.document.createElement('div');
            div.className = 'num';
            div.style.display = 'block';
            div.style.left = 'initial';
            div.style.right = '-6px';
            if (li.children[1].children[0].children.length > 5) {
                div.textContent = '5+';
            }
            else {
                div.textContent = li.children[1].children[0].children.length;
            }
            li.appendChild(div);

        });
        observer.observe(li.children[1].children[0], { childList: true });
    }

    dblclickFullScreen() {
        this.video.addEventListener('dblclick', () =>
            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click()
        );
    }

    scrollToPlayer() {
        if (top.scrollY < 200) top.document.getElementById('bofqi').scrollIntoView();
    }

    showRecommendTab() {
        let h = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-filter-btn-recommend');
        if (h) h.click();
    }

    getCoverImage() {
        let ret = top.document.querySelector('.cover_image') || top.document.querySelector('div.info-cover > a > img') || top.document.querySelector('[data-state-play="true"]  img');
        if (!ret) return null;

        ret = ret.src;
        ret = ret.slice(0, ret.indexOf('.jpg') + 4);
        return ret;
    }

    reallocateElectricPanel() {
        if (!this.playerWin.localStorage.bilibili_player_settings) return;
        if (!this.playerWin.localStorage.bilibili_player_settings.includes('"autopart":1') && !this.option.electricSkippable) return;
        this.video.addEventListener('ended', () => {
            setTimeout(() => {
                let i = this.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0];
                if (!i) return;
                i.children[2].click();
                i.style.display = 'block';
                i.style.zIndex = 233;
                let j = 5;
                let h = setInterval(() => {
                    if (this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) i.style.zIndex = '';
                    if (j > 0) {
                        i.children[2].children[0].textContent = `0${j}`;
                        j--;
                    }
                    else {
                        clearInterval(h);
                        i.remove();
                    }
                }, 1000);
            }, 0);
        });
    }

    liftBottomDanmuku() {
        // MUST initialize setting panel before click
        this.playerWin.document.getElementsByName('ctlbar_danmuku_close')[0].dispatchEvent(new Event('mouseover'));
        this.playerWin.document.getElementsByName('ctlbar_danmuku_close')[0].dispatchEvent(new Event('mouseout'));
        if (!this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0].nextSibling.className.includes('bpui-state-active'))
            this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0].click();
    }

    loadOffineSubtitles() {
        // NO. NOBODY WILL NEED THIS。
        // Hint: https://github.com/jamiees2/ass-to-vtt
        throw 'Not implemented';
    }

    autoResume() {
        let h = () => {
            let span = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
            if (!span) return;
            let [min, sec] = span.textContent.split(':');
            if (!min || !sec) return;
            let time = parseInt(min) * 60 + parseInt(sec);
            if (time < this.video.duration - 10) {
                if (!this.video.paused || this.video.autoplay) {
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                }
                else {
                    let play = this.video.play;
                    this.video.play = () => setTimeout(() => {
                        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        this.video.play = play;
                    }, 0);
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                }
            }
            else {
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-close').click();
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom').children[0].style.visibility = 'hidden';
            }
        };
        this.video.addEventListener('canplay', h);
        setTimeout(() => this.video && this.video.removeEventListener && this.video.removeEventListener('canplay', h), 3000);
    }

    autoPlay() {
        this.video.autoplay = true;
        setTimeout(() => {
            if (this.video.paused) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click()
        }, 0);
    }

    autoWideScreen() {
        if (this.playerWin.document.querySelector('#bilibiliPlayer i.icon-24wideoff'))
            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-widescreen').click();
    }

    autoFullScreen() {
        if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off'))
            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
    }

    getCollectionId() {
        return (top.location.pathname.match(/av\d+/) || top.location.hash.match(/av\d+/) || top.document.querySelector('div.bangumi-info a').href).toString();
    }

    markOPPosition() {
        let collectionId = this.getCollectionId();
        if (!(this.userdata.oped[collectionId] instanceof Array)) this.userdata.oped[collectionId] = [];
        this.userdata.oped[collectionId][0] = this.video.currentTime;
    }

    markEDPostion() {
        let collectionId = this.getCollectionId();
        if (!(this.userdata.oped[collectionId] instanceof Array)) this.userdata.oped[collectionId] = [];
        this.userdata.oped[collectionId][1] = (this.video.currentTime);
    }

    clearOPEDPosition() {
        let collectionId = this.getCollectionId();
        this.userdata.oped[collectionId] = undefined;
    }

    skipOPED() {
        let collectionId = this.getCollectionId();
        if (!(this.userdata.oped[collectionId] instanceof Array)) return;
        if (this.userdata.oped[collectionId][0]) {
            if (this.video.currentTime < this.userdata.oped[collectionId][0]) {
                this.video.currentTime = this.userdata.oped[collectionId][0];
                this.hintInfo('BiliPolyfill: 已跳过片头');
            }
        }
        if (this.userdata.oped[collectionId][1]) {
            let edHandler = v => {
                if (v.target.currentTime > this.userdata.oped[collectionId][1]) {
                    v.target.removeEventListener('timeupdate', edHandler);
                    v.target.dispatchEvent(new Event('ended'));
                }
            }
            this.video.addEventListener('timeupdate', edHandler);
        }
    }

    setVideoSpeed(speed) {
        if (speed < 0 || speed > 10) return;
        this.video.playbackRate = speed;
    }

    focusOnPlayer() {
        this.playerWin.document.getElementsByClassName('bilibili-player-video-progress')[0].click();
    }

    menuFocusOnPlayer() {
        this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0].addEventListener('click', () => setTimeout(() => this.focusOnPlayer(), 0));
    }

    limitedKeydownFullScreenPlay() {
        let h = e => {
            if (!e.isTrusted) return;
            if (e.key == 'Enter') {
                if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                }
                if (this.video.paused) {
                    if (this.video.readyState) {
                        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                    }
                    else {
                        let i = () => {
                            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                            this.video.removeEventListener('canplay', i);
                        }
                        this.video.addEventListener('canplay', i);
                    }
                }
            }
            top.document.removeEventListener('keydown', h);
            top.document.removeEventListener('click', h);
        };
        top.document.addEventListener('keydown', h);
        top.document.addEventListener('click', h);
    }

    speechRecognition() {
        const SpeechRecognition = top.SpeechRecognition || top.webkitSpeechRecognition;
        const SpeechGrammarList = top.SpeechGrammarList || top.webkitSpeechGrammarList;
        alert('Yahaha! You found me!\nBiliTwin支持的语音命令: 播放 暂停 全屏 关闭 加速 减速 下一集\nChrome may support Cantonese or Hakka as well. See BiliPolyfill::speechRecognition.');
        if (!SpeechRecognition || !SpeechGrammarList) alert('浏览器太旧啦~彩蛋没法运行~');
        let player = ['播放', '暂停', '全屏', '关闭', '加速', '减速', '下一集'];
        let grammar = '#JSGF V1.0; grammar player; public <player> = ' + player.join(' | ') + ' ;';
        let recognition = new SpeechRecognition();
        let speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        // cmn: Mandarin(Putonghua), yue: Cantonese, hak: Hakka
        // See https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
        recognition.lang = 'cmn';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.start();
        recognition.onresult = e => {
            let last = e.results.length - 1;
            let transcript = e.results[last][0].transcript;
            switch (transcript) {
                case '播放':
                    if (this.video.paused) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                    this.hintInfo(`BiliPolyfill: 语音:播放`);
                    break;
                case '暂停':
                    if (!this.video.paused) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                    this.hintInfo(`BiliPolyfill: 语音:暂停`);
                    break;
                case '全屏':
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                    this.hintInfo(`BiliPolyfill: 语音:全屏`);
                    break;
                case '关闭':
                    top.close();
                    break;
                case '加速':
                    this.setVideoSpeed(2);
                    this.hintInfo(`BiliPolyfill: 语音:加速`);
                    break;
                case '减速':
                    this.setVideoSpeed(0.5);
                    this.hintInfo(`BiliPolyfill: 语音:减速`);
                    break;
                case '下一集':
                    this.video.dispatchEvent(new Event('ended'));
                default:
                    this.hintInfo(`BiliPolyfill: 语音:"${transcript}"？`);
                    break;
            }
            typeof console == "object" && console.log(e.results);
            typeof console == "object" && console.log(`transcript:${transcript} confidence:${e.results[0][0].confidence}`);
        };
    }

    substitudeFullscreenPlayer(option) {
        if (!option) throw 'usage: substitudeFullscreenPlayer({cid, aid[, p][, ...otherOptions]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) throw 'player init: aid missing';
        let h = this.playerWin.document;
        let i = [h.webkitExitFullscreen, h.mozExitFullScreen, h.msExitFullscreen, h.exitFullscreen];
        h.webkitExitFullscreen = h.mozExitFullScreen = h.msExitFullscreen = h.exitFullscreen = () => { };
        this.playerWin.player.destroy();
        this.playerWin.player = new bilibiliPlayer(option);
        if (option.p) this.playerWin.callAppointPart(option.p);
        [h.webkitExitFullscreen, h.mozExitFullScreen, h.msExitFullscreen, h.exitFullscreen] = i;
    }

    async getPlayerVideo() {
        if (this.playerWin.document.getElementsByTagName('video').length) {
            return this.video = this.playerWin.document.getElementsByTagName('video')[0];
        }
        else {
            return new Promise(resolve => {
                let observer = new MutationObserver(() => {
                    if (this.playerWin.document.getElementsByTagName('video').length) {
                        observer.disconnect();
                        resolve(this.video = this.playerWin.document.getElementsByTagName('video')[0]);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    async getPlayerMenu() {
        if (this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
            return this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0];
        }
        else {
            return new Promise(resolve => {
                let observer = new MutationObserver(() => {
                    if (this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                        observer.disconnect();
                        resolve(this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    static async openMinimizedPlayer(option = { cid: top.cid, aid: top.aid, playerWin: top }) {
        if (!option) throw 'usage: openMinimizedPlayer({cid[, aid]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) option.aid = top.aid;
        if (!option.playerWin) option.playerWin = top;

        let h = top.open(`//www.bilibili.com/blackboard/html5player.html?cid=${option.cid}&aid=${option.aid}&crossDomain=${top.document.domain != 'www.bilibili.com' ? 'true' : ''}`, undefined, ' ');
        let res = top.location.href.includes('bangumi') && await new Promise(resolve => {
            const jq = option.playerWin.jQuery;
            const _ajax = jq.ajax;

            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    a.success = resolve;
                    jq.ajax = _ajax;
                }
                return _ajax.call(jq, a, c);
            };
            option.playerWin.player.reloadAccess();
        });

        await new Promise(resolve => {
            let i = setInterval(() => h.document.getElementById('bilibiliPlayer') && resolve(), 500);
            h.addEventListener('load', resolve);
            setTimeout(() => {
                clearInterval(i);
                h.removeEventListener('load', resolve);
                resolve();
            }, 6000);
        });
        let div = h.document.getElementById('bilibiliPlayer');
        if (!div) { console.warn('openMinimizedPlayer: document load timeout'); return; }

        if (res) {
            await new Promise(resolve => {
                const jq = h.jQuery;
                const _ajax = jq.ajax;

                jq.ajax = function (a, c) {
                    if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                    if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                        a.success(res)
                        jq.ajax = _ajax;
                        resolve();
                    }
                    else {
                        return _ajax.call(jq, a, c);
                    }
                };
                h.player = new h.bilibiliPlayer({ cid: option.cid, aid: option.aid });
                // h.eval(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
                // console.log(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
            })
        }

        await new Promise(resolve => {
            if (h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) resolve();
            else {
                let observer = new MutationObserver(() => {
                    if (h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) {
                        observer.disconnect();
                        resolve();
                    }
                });
                observer.observe(h.document.getElementById('bilibiliPlayer'), { childList: true });
            }
        });
        let i = [div.webkitRequestFullscreen, div.mozRequestFullScreen, div.msRequestFullscreen, div.requestFullscreen];
        div.webkitRequestFullscreen = div.mozRequestFullScreen = div.msRequestFullscreen = div.requestFullscreen = () => { };
        if (h.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off'))
            h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
        [div.webkitRequestFullscreen, div.mozRequestFullScreen, div.msRequestFullscreen, div.requestFullscreen] = i;
    }

    static parseHref(href = top.location.href) {
        if (href.includes('bangumi')) {
            let anime, play;
            anime = (anime = /anime\/\d+/.exec(href)) ? anime[0].slice(6) : null;
            play = (play = /play#\d+/.exec(href)) ? play[0].slice(5) : null;
            if (!anime || !play) return null;
            return `bangumi.bilibili.com/anime/${anime}/play#${play}`;
        }
        else {
            let aid, pid;
            aid = (aid = /av\d+/.exec(href)) ? aid[0].slice(2) : null;
            if (!aid) return null;
            pid = (pid = /page=\d+/.exec(href)) ? pid[0].slice(5) : (pid = /index_\d+.html/.exec(href)) ? pid[0].slice(6, -5) : null;
            if (!pid) return `www.bilibili.com/video/av${aid}`;
            return `www.bilibili.com/video/av${aid}/index_${pid}.html`;
        }
    }

    static secondToReadable(s) {
        if (s > 60) return `${parseInt(s / 60)}分${parseInt(s % 60)}秒`;
        else return `${parseInt(s % 60)}秒`;
    }

    static clearAllUserdata(playerWin = top) {
        if (playerWin.GM_setValue) return GM_setValue('biliPolyfill', '');
        playerWin.localStorage.removeItem('biliPolyfill');
    }

    static _UNIT_TEST() {
        console.warn('This test is impossible.');
        console.warn('You need to close the tab, reopen it, etc.');
        console.warn('Maybe you also want to test between bideo parts, etc.');
        console.warn('I am too lazy to find workarounds.');
    }
}

class BiliUserJS {
    static async getIframeWin() {
        if (document.querySelector('#bofqi > iframe').contentDocument.getElementById('bilibiliPlayer')) {
            return document.querySelector('#bofqi > iframe').contentWindow;
        }
        else {
            return new Promise(resolve => {
                document.querySelector('#bofqi > iframe').addEventListener('load', () => {
                    resolve(document.querySelector('#bofqi > iframe').contentWindow);
                });
            });
        }
    }

    static async getPlayerWin() {
        if (location.href.includes('/watchlater/#/list')) {
            await new Promise(resolve => {
                let h = () => {
                    resolve(location.href);
                    window.removeEventListener('hashchange', h);
                };
                window.addEventListener('hashchange', h)
            });
        }
        if (location.href.includes('/watchlater/#/')) {
            if (!document.getElementById('bofqi')) {
                await new Promise(resolve => {
                    let observer = new MutationObserver(() => {
                        if (document.getElementById('bofqi')) {
                            resolve(document.getElementById('bofqi'));
                            observer.disconnect();
                        }
                    });
                    observer.observe(document, { childList: true, subtree: true });
                });
            }
        }
        if (document.getElementById('bilibiliPlayer')) {
            return window;
        }
        else if (document.querySelector('#bofqi > iframe')) {
            return BiliUserJS.getIframeWin();
        }
        else if (document.querySelector('#bofqi > object')) {
            throw 'Need H5 Player';
        }
        else {
            return new Promise(resolve => {
                let observer = new MutationObserver(() => {
                    if (document.getElementById('bilibiliPlayer')) {
                        observer.disconnect();
                        resolve(window);
                    }
                    else if (document.querySelector('#bofqi > iframe')) {
                        observer.disconnect();
                        resolve(BiliUserJS.getIframeWin());
                    }
                    else if (document.querySelector('#bofqi > object')) {
                        observer.disconnect();
                        throw 'Need H5 Player';
                    }
                });
                observer.observe(document.getElementById('bofqi'), { childList: true });
            })
        }
    }
}

class UI extends BiliUserJS {
    // Title Append
    static titleAppend(monkey) {
        let h = document.querySelector('div.viewbox div.info') || document.querySelector('div.bangumi-header div.header-info') || document.querySelector('div.video-info-module');
        let tminfo = document.querySelector('div.tminfo') || document.querySelector('div.info-second');
        let div = document.createElement('div');
        let flvA = document.createElement('a');
        let mp4A = document.createElement('a');
        let assA = document.createElement('a');
        flvA.textContent = '超清FLV';
        mp4A.textContent = '原生MP4';
        assA.textContent = '弹幕ASS';

        flvA.onmouseover = async () => {
            flvA.textContent = '正在FLV';
            flvA.onmouseover = null;
            await monkey.queryInfo('flv');
            flvA.textContent = '超清FLV';
            let flvDiv = UI.genFLVDiv(monkey);
            document.body.appendChild(flvDiv);
            flvA.onclick = () => flvDiv.style.display = 'block';
        };
        mp4A.onmouseover = async () => {
            mp4A.textContent = '正在MP4';
            mp4A.onmouseover = null;
            mp4A.href = await monkey.queryInfo('mp4');
            mp4A.textContent = '原生MP4';
            mp4A.download = '';
            mp4A.referrerPolicy = 'origin';
        };
        assA.onmouseover = async () => {
            assA.textContent = '正在ASS';
            assA.onmouseover = null;
            assA.href = await monkey.queryInfo('ass');
            assA.textContent = '弹幕ASS';
            if (monkey.mp4 && monkey.mp4.match) assA.download = monkey.mp4.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0] + '.ass';
            else assA.download = monkey.cid + '.ass';
        };

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
        return { flvA, mp4A, assA };
    }

    static genFLVDiv(monkey, flvs = monkey.flvs, cache = monkey.cache) {
        let div = UI.genDiv();

        let table = document.createElement('table');
        table.style.width = '100%';
        table.style.lineHeight = '2em';
        for (let i = 0; i < flvs.length; i++) {
            let tr = table.insertRow(-1);
            tr.insertCell(0).innerHTML = `<a href="${flvs[i]}">FLV分段 ${i + 1}</a>`;
            tr.insertCell(1).innerHTML = '<a>缓存本段</a>';
            tr.insertCell(2).innerHTML = '<progress value="0" max="100">进度条</progress>';
            tr.children[1].children[0].onclick = () => {
                UI.downloadFLV(tr.children[1].children[0], monkey, i, tr.children[2].children[0]);
            }
        }
        let tr = table.insertRow(-1);
        tr.insertCell(0).innerHTML = '<a>全部复制到剪贴板</a>';
        tr.insertCell(1).innerHTML = '<a>缓存全部+自动合并</a>';
        tr.insertCell(2).innerHTML = `<progress value="0" max="${flvs.length + 1}">进度条</progress>`;
        if (top.location.href.includes('bangumi')) {
            tr.children[0].children[0].onclick = () => UI.copyToClipboard(flvs.join('\n'));
        }
        else {
            tr.children[0].innerHTML = '<a download="biliTwin.ef2">IDM导出</a>';
            tr.children[0].children[0].href = URL.createObjectURL(new Blob([UI.exportIDM(flvs, top.location.origin)]));
        }
        tr.children[1].children[0].onclick = () => UI.downloadAllFLVs(tr.children[1].children[0], monkey, table);
        table.insertRow(-1).innerHTML = '<td colspan="3">合并功能推荐配置：至少8G RAM。把自己下载的分段FLV拖动到这里，也可以合并哦~</td>';
        table.insertRow(-1).innerHTML = cache ? '<td colspan="3">下载的缓存分段会暂时停留在电脑里，过一段时间会自动消失。建议只开一个标签页。</td>' : '<td colspan="3">建议只开一个标签页。关掉标签页后，缓存就会被清理。别忘了另存为！</td>';
        UI.displayQuota(table.insertRow(-1));
        div.appendChild(table);

        div.ondragenter = div.ondragover = e => UI.allowDrag(e);
        div.ondrop = async e => {
            UI.allowDrag(e);
            let files = Array.from(e.dataTransfer.files);
            if (files.every(e => e.name.search(/\d+-\d+(?:-\d+)?\.flv/) != -1)) {
                files.sort((a, b) => a.name.match(/\d+-(\d+)(?:-\d+)?\.flv/)[1] - b.name.match(/\d+-(\d+)(?:-\d+)?\.flv/)[1]);
            }
            for (let file of files) {
                table.insertRow(-1).innerHTML = `<td colspan="3">${file.name}</td>`;
            }
            let outputName = files[0].name.match(/\d+-\d+(?:-\d+)?\.flv/);
            if (outputName) outputName = outputName[0].replace(/-\d/, "");
            else outputName = 'merge_' + files[0].name;
            let url = await UI.mergeFLVFiles(files);
            table.insertRow(-1).innerHTML = `<td colspan="3"><a href="${url}" download="${outputName}">${outputName}</a></td>`;
        }

        let buttons = [];
        for (let i = 0; i < 3; i++) buttons.push(document.createElement('button'));
        buttons.forEach(btn => btn.style.padding = '0.5em');
        buttons.forEach(btn => btn.style.margin = '0.2em');
        buttons[0].textContent = '关闭';
        buttons[0].onclick = () => {
            div.style.display = 'none';
        }
        buttons[1].textContent = '清空这个视频的缓存';
        buttons[1].onclick = () => {
            monkey.cleanAllFLVsInCache();
        }
        buttons[2].textContent = '清空所有视频的缓存';
        buttons[2].onclick = () => {
            UI.clearCacheDB(cache);
        }
        buttons.forEach(btn => div.appendChild(btn));

        return div;
    }

    static async downloadAllFLVs(a, monkey, table) {
        if (table.rows[0].cells.length < 3) return;
        monkey.hangPlayer();
        table.insertRow(-1).innerHTML = '<td colspan="3">已屏蔽网页播放器的网络链接。切换清晰度可重新激活播放器。</td>';

        for (let i = 0; i < monkey.flvs.length; i++) {
            if (table.rows[i].cells[1].children[0].textContent == '缓存本段')
                table.rows[i].cells[1].children[0].click();
        }

        let bar = a.parentNode.nextSibling.children[0];
        bar.max = monkey.flvs.length + 1;
        bar.value = 0;
        for (let i = 0; i < monkey.flvs.length; i++) monkey.getFLV(i).then(e => bar.value++);

        let blobs;
        blobs = await monkey.getAllFLVs();
        let mergedFLV = await FLV.mergeBlobs(blobs);
        let ass = await monkey.ass;
        let url = URL.createObjectURL(mergedFLV);
        let outputName = (top.document.getElementsByClassName('v-title')[0] || top.document.getElementsByClassName('header-info')[0] || top.document.getElementsByClassName('video-info-module')[0]).children[0].textContent.trim();

        bar.value++;
        table.insertRow(0).innerHTML = `
        <td colspan="3" style="border: 1px solid black">
            <a href="${url}" download="${outputName}.flv">保存合并后FLV</a> 
            <a href="${ass}" download="${outputName}.ass">弹幕ASS</a> 
            <a>打包MKV(软字幕封装)</a>
            记得清理分段缓存哦~
        </td>
        `;
        table.rows[0].cells[0].children[2].onclick = () => new MKVTransmuxer().exec(url, ass, `${outputName}.mkv`);
        return url;
    }

    static async downloadFLV(a, monkey, index, bar = {}) {
        let handler = e => UI.beforeUnloadHandler(e);
        window.addEventListener('beforeunload', handler);

        a.textContent = '取消';
        a.onclick = () => {
            a.onclick = null;
            window.removeEventListener('beforeunload', handler);
            a.textContent = '已取消';
            monkey.abortFLV(index);
        };

        let url;
        try {
            url = await monkey.getFLV(index, (loaded, total) => {
                bar.value = loaded;
                bar.max = total;
            });
            url = URL.createObjectURL(url);
            if (bar.value == 0) bar.value = bar.max = 1;
        } catch (e) {
            a.onclick = null;
            window.removeEventListener('beforeunload', handler);
            a.textContent = '错误';
            throw e;
        }

        a.onclick = null;
        window.removeEventListener('beforeunload', handler);
        a.textContent = '另存为';
        a.download = monkey.flvs[index].match(/\d+-\d+(?:-\d+)?\.flv/)[0];
        a.href = url;
        return url;
    }

    static async mergeFLVFiles(files) {
        let merged = await FLV.mergeBlobs(files)
        return URL.createObjectURL(merged);
    }

    static async clearCacheDB(cache) {
        if (cache) return cache.deleteEntireDB();
    }

    static async displayQuota(tr) {
        return new Promise(resolve => {
            let temporaryStorage = window.navigator.temporaryStorage
                || window.navigator.webkitTemporaryStorage
                || window.navigator.mozTemporaryStorage
                || window.navigator.msTemporaryStorage;
            if (!temporaryStorage) return resolve(tr.innerHTML = `<td colspan="3">这个浏览器不支持缓存呢~关掉标签页后，缓存马上就会消失哦</td>`);
            temporaryStorage.queryUsageAndQuota((usage, quota) =>
                resolve(tr.innerHTML = `<td colspan="3">缓存已用空间：${Math.round(usage / 1048576)}MB / ${Math.round(quota / 1048576)}MB 也包括了B站本来的缓存</td>`)
            );
        });
    }

    // Menu Append
    static menuAppend(playerWin, { monkey, monkeyTitle, polyfill, displayPolyfillDataDiv, optionDiv }) {
        let monkeyMenu = UI.genMonkeyMenu(playerWin, { monkey, monkeyTitle, optionDiv });
        let polyfillMenu = UI.genPolyfillMenu(playerWin, { polyfill, displayPolyfillDataDiv, optionDiv });
        let div = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0];
        let ul = playerWin.document.createElement('ul');
        ul.className = 'bilitwin';
        ul.style.borderBottom = '1px solid rgba(255,255,255,.12)';
        div.insertBefore(ul, div.children[0]);
        ul.appendChild(monkeyMenu);
        ul.appendChild(polyfillMenu);
    }

    static genMonkeyMenu(playerWin, { monkey, monkeyTitle, optionDiv }) {
        let li = playerWin.document.createElement('li');
        li.className = 'context-menu-menu bilitwin';
        li.innerHTML = `
            <a class="context-menu-a">
                BiliMonkey
                <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
            </a>
            <ul>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 下载FLV
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 下载MP4
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 下载ASS
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 设置/帮助/关于
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)载入缓存FLV
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)强制刷新
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)重启脚本
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)销毁播放器
                    </a>
                </li>
            </ul>
            `;
        li.onclick = () => playerWin.document.getElementById('bilibiliPlayer').click();
        let ul = li.children[1];
        ul.children[0].onclick = async () => { if (monkeyTitle.flvA.onmouseover) await monkeyTitle.flvA.onmouseover(); monkeyTitle.flvA.click(); };
        ul.children[1].onclick = async () => { if (monkeyTitle.mp4A.onmouseover) await monkeyTitle.mp4A.onmouseover(); monkeyTitle.mp4A.click(); };
        ul.children[2].onclick = async () => { if (monkeyTitle.assA.onmouseover) await monkeyTitle.assA.onmouseover(); monkeyTitle.assA.click(); };
        ul.children[3].onclick = () => { optionDiv.style.display = 'block'; };
        ul.children[4].onclick = async () => {
            monkey.proxy = true;
            monkey.flvs = null;
            UI.hintInfo('请稍候，可能需要10秒时间……', playerWin);
            // Yes, I AM lazy.
            playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="80"]').click();
            await new Promise(r => playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', r));
            return monkey.queryInfo('flv');
        };
        ul.children[5].onclick = () => { top.location.reload(true); };
        ul.children[6].onclick = () => { playerWin.dispatchEvent(new Event('unload')); };
        ul.children[7].onclick = () => { playerWin.player && playerWin.player.destroy() };
        return li;
    }

    static genPolyfillMenu(playerWin, { polyfill, displayPolyfillDataDiv, optionDiv }) {
        let li = playerWin.document.createElement('li');
        li.className = 'context-menu-menu bilitwin';
        li.innerHTML = `
            <a class="context-menu-a">
                BiliPolyfill
                <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
            </a>
            <ul>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 获取封面
                    </a>
                </li>
                <li class="context-menu-menu">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 更多播放速度
                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
                    </a>
                    <ul>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 0.1
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 3
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 点击确认
                                <input type="text" style="width: 35px; height: 70%">
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="context-menu-menu">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 片头片尾
                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
                    </a>
                    <ul>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 标记片头:<span></span>
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 标记片尾:<span></span>
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 取消标记
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 检视数据
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="context-menu-menu">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 找上下集
                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
                    </a>
                    <ul>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> <span></span>
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> <span></span>
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 小窗播放
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 设置/帮助/关于
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)立即保存数据
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)强制清空数据
                    </a>
                </li>
            </ul>
            `;
        li.onclick = () => playerWin.document.getElementById('bilibiliPlayer').click();
        if (!polyfill.option.betabeta) li.children[0].childNodes[0].textContent += '(到设置开启)';
        let ul = li.children[1];
        ul.children[0].onclick = () => { top.window.open(polyfill.getCoverImage(), '_blank'); };

        ul.children[1].children[1].children[0].onclick = () => { polyfill.setVideoSpeed(0.1); };
        ul.children[1].children[1].children[1].onclick = () => { polyfill.setVideoSpeed(3); };
        ul.children[1].children[1].children[2].onclick = e => { polyfill.setVideoSpeed(e.target.getElementsByTagName('input')[0].value); };
        ul.children[1].children[1].children[2].getElementsByTagName('input')[0].onclick = e => e.stopPropagation();

        ul.children[2].children[1].children[0].onclick = () => { polyfill.markOPPosition(); };
        ul.children[2].children[1].children[1].onclick = () => { polyfill.markEDPostion(3); };
        ul.children[2].children[1].children[2].onclick = () => { polyfill.clearOPEDPosition(); };
        ul.children[2].children[1].children[3].onclick = () => { displayPolyfillDataDiv(polyfill); };

        ul.children[3].children[1].children[0].getElementsByTagName('a')[0].style.width = 'initial';
        ul.children[3].children[1].children[1].getElementsByTagName('a')[0].style.width = 'initial';

        ul.children[4].onclick = () => { BiliPolyfill.openMinimizedPlayer(); };
        ul.children[5].onclick = () => { optionDiv.style.display = 'block'; };
        ul.children[6].onclick = () => { polyfill.saveUserdata() };
        ul.children[7].onclick = () => {
            BiliPolyfill.clearAllUserdata(playerWin);
            polyfill.retrieveUserdata();
        };

        li.onmouseenter = () => {
            let ul = li.children[1];
            ul.children[1].children[1].children[2].getElementsByTagName('input')[0].value = polyfill.video.playbackRate;

            let oped = polyfill.userdata.oped[polyfill.getCollectionId()] || [];
            ul.children[2].children[1].children[0].getElementsByTagName('span')[1].textContent = oped[0] ? BiliPolyfill.secondToReadable(oped[0]) : '无';
            ul.children[2].children[1].children[1].getElementsByTagName('span')[1].textContent = oped[1] ? BiliPolyfill.secondToReadable(oped[1]) : '无';

            ul.children[3].children[1].children[0].onclick = () => { if (polyfill.series[0]) top.window.open(`https://www.bilibili.com/video/av${polyfill.series[0].aid}`, '_blank'); };
            ul.children[3].children[1].children[1].onclick = () => { if (polyfill.series[1]) top.window.open(`https://www.bilibili.com/video/av${polyfill.series[1].aid}`, '_blank'); };
            ul.children[3].children[1].children[0].getElementsByTagName('span')[1].textContent = polyfill.series[0] ? polyfill.series[0].title : '找不到';
            ul.children[3].children[1].children[1].getElementsByTagName('span')[1].textContent = polyfill.series[1] ? polyfill.series[1].title : '找不到';
        }
        return li;
    }

    static genOptionDiv(option) {
        let div = UI.genDiv();

        div.appendChild(UI.genMonkeyOptionTable(option));
        div.appendChild(UI.genPolyfillOptionTable(option));
        let table = document.createElement('table');
        table.style = 'width: 100%; line-height: 2em;';
        table.insertRow(-1).innerHTML = '<td>设置自动保存，刷新后生效。</td>';
        table.insertRow(-1).innerHTML = '<td>视频下载组件的缓存功能只在Windows+Chrome测试过，如果出现问题，请关闭缓存。</td>';
        table.insertRow(-1).innerHTML = '<td>功能增强组件尽量保证了兼容性。但如果有同功能脚本/插件，请关闭本插件的对应功能。</td>';
        table.insertRow(-1).innerHTML = '<td>这个脚本乃“按原样”提供，不附带任何明示，暗示或法定的保证，包括但不限于其没有缺陷，适合特定目的或非侵权。</td>';
        table.insertRow(-1).innerHTML = '<td><a href="https://greasyfork.org/zh-CN/scripts/27819" target="_blank">更新/讨论</a> <a href="https://github.com/liqi0816/bilitwin/" target="_blank">GitHub</a> Author: qli5. Copyright: qli5, 2014+, 田生, grepmusic</td>';
        div.appendChild(table);

        let buttons = [];
        for (let i = 0; i < 3; i++) buttons.push(document.createElement('button'));
        buttons.forEach(btn => btn.style.padding = '0.5em');
        buttons.forEach(btn => btn.style.margin = '0.2em');
        buttons[0].textContent = '保存并关闭';
        buttons[0].onclick = () => {
            div.style.display = 'none';;
        }
        buttons[1].textContent = '保存并刷新';
        buttons[1].onclick = () => {
            top.location.reload();
        }
        buttons[2].textContent = '重置并刷新';
        buttons[2].onclick = () => {
            UI.saveOption({ setStorage: option.setStorage });
            top.location.reload();
        }
        buttons.forEach(btn => div.appendChild(btn));

        return div;
    }

    static genMonkeyOptionTable(option = {}) {
        const description = [
            ['autoDefault', '尝试自动抓取：不会拖慢页面，抓取默认清晰度，但可能抓不到。'],
            ['autoFLV', '强制自动抓取FLV：会拖慢页面，如果默认清晰度也是超清会更慢，但保证抓到。'],
            ['autoMP4', '强制自动抓取MP4：会拖慢页面，如果默认清晰度也是高清会更慢，但保证抓到。'],
            ['cache', '关标签页不清缓存：保留完全下载好的分段到缓存，忘记另存为也没关系。'],
            ['partial', '断点续传：点击“取消”保留部分下载的分段到缓存，忘记点击会弹窗确认。'],
            ['proxy', '用缓存加速播放器：如果缓存里有完全下载好的分段，直接喂给网页播放器，不重新访问网络。小水管利器，播放只需500k流量。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。'],
            ['blocker', '弹幕过滤：在网页播放器里设置的屏蔽词也对下载的弹幕生效。'],
        ];

        let table = document.createElement('table');
        table.style.width = '100%';
        table.style.lineHeight = '2em';

        table.insertRow(-1).innerHTML = '<td style="text-align:center">BiliMonkey（视频抓取组件）</td>';
        table.insertRow(-1).innerHTML = '<td style="text-align:center">因为作者偷懒了，缓存的三个选项最好要么全开，要么全关。最好。</td>';
        for (let d of description) {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = option[d[0]];
            checkbox.onchange = () => { option[d[0]] = checkbox.checked; UI.saveOption(option); };
            let td = table.insertRow(-1).insertCell(0);
            let label = document.createElement('label');
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(d[1]));
            td.appendChild(label);
        }

        return table;
    }

    static genPolyfillOptionTable(option = {}) {
        const description = [
            ['betabeta', '增强组件总开关 <---------更加懒得测试了，反正以后B站也会自己提供这些功能。也许吧。'], //betabeta
            ['badgeWatchLater', '稍后再看添加数字角标'],
            ['dblclick', '双击全屏'],
            ['scroll', '自动滚动到播放器'],
            ['recommend', '弹幕列表换成相关视频'],
            ['electric', '整合充电榜与换P倒计时'],
            //['electricSkippable', '跳过充电榜'],
            ['lift', '自动防挡字幕'],
            ['autoResume', '自动跳转上次看到'],
            ['autoPlay', '自动播放'],
            ['autoWideScreen', '自动宽屏'],
            ['autoFullScreen', '自动全屏'],
            ['oped', '标记后自动跳OP/ED'],
            ['focus', '自动聚焦到播放器'],
            ['menuFocus', '关闭菜单后聚焦到播放器'],
            ['limitedKeydown', '首次回车键可全屏自动播放'],
            ['series', '尝试自动找上下集'],
            ['speech', '(测)(需墙外)任意三击鼠标左键开启语音识别'],
        ];

        let table = document.createElement('table');
        table.style.width = '100%';
        table.style.lineHeight = '2em';

        table.insertRow(-1).innerHTML = '<td style="text-align:center">BiliPolyfill（功能增强组件）</td>';
        table.insertRow(-1).innerHTML = '<td style="text-align:center">懒鬼作者还在测试的时候，B站已经上线了原生的稍后再看(๑•̀ㅂ•́)و✧</td>';
        for (let d of description) {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = option[d[0]];
            checkbox.onchange = () => { option[d[0]] = checkbox.checked; UI.saveOption(option); };
            let td = table.insertRow(-1).insertCell(0);
            let label = document.createElement('label');
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(d[1]));
            td.appendChild(label);
        }

        return table;
    }

    static displayPolyfillDataDiv(polyfill) {
        let div = UI.genDiv();
        let p = document.createElement('p');
        p.textContent = '这里是脚本储存的数据。所有数据都只存在浏览器里，别人不知道，B站也不知道，脚本作者更不知道(这个家伙连服务器都租不起 摔';
        p.style.margin = '0.3em';
        div.appendChild(p);

        let textareas = [];
        for (let i = 0; i < 2; i++) textareas.push(document.createElement('textarea'));
        textareas.forEach(ta => ta.style = 'resize:vertical; width: 100%; height: 200px');

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

        let buttons = [];
        for (let i = 0; i < 3; i++) buttons.push(document.createElement('button'));
        buttons.forEach(btn => btn.style.padding = '0.5em');
        buttons.forEach(btn => btn.style.margin = '0.2em');
        buttons[0].textContent = '关闭';
        buttons[0].onclick = () => {
            div.remove();
        }
        buttons[1].textContent = '验证格式';
        buttons[1].onclick = () => {
            if (!textareas[0].value) textareas[0].value = '{\n\n}';
            textareas[0].value = textareas[0].value.replace(/,(\s|\n)*}/, '\n}').replace(/,(\s|\n),/g, ',\n');
            if (!textareas[1].value) textareas[1].value = '{\n\n}';
            textareas[1].value = textareas[1].value.replace(/,(\s|\n)*}/, '\n}').replace(/,(\s|\n),/g, ',\n').replace(/,(\s|\n)*]/g, ']');
            let userdata = {};
            try {
                //userdata.watchLater = JSON.parse(textareas[0].value);
            } catch (e) { alert('稍后观看列表: ' + e); throw e; }
            try {
                userdata.oped = JSON.parse(textareas[1].value);
            } catch (e) { alert('片头片尾: ' + e); throw e; }
            buttons[1].textContent = ('格式没有问题！');
            return userdata;
        }
        buttons[2].textContent = '尝试保存';
        buttons[2].onclick = () => {
            polyfill.userdata = buttons[1].onclick();
            polyfill.saveUserdata();
            buttons[2].textContent = ('保存成功');
        }
        buttons.forEach(btn => div.appendChild(btn));

        document.body.appendChild(div);
        div.style.display = 'block';
    }

    // Common
    static genDiv() {
        let div = document.createElement('div');
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

    static requestH5Player() {
        let h = document.querySelector('div.tminfo');
        h.insertBefore(document.createTextNode('[[脚本需要HTML5播放器(弹幕列表右上角三个点的按钮切换)]] '), h.firstChild);
    }

    static copyToClipboard(text) {
        let textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.value = text;
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    static exportIDM(url, referrer) {
        return url.map(e => `<\r\n${e}\r\nreferer: ${referrer}\r\n>\r\n`).join('');
    }

    static allowDrag(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    static beforeUnloadHandler(e) {
        return e.returnValue = '脚本还没做完工作，真的要退出吗？';
    }

    static hintInfo(text, playerWin) {
        let infoDiv = playerWin.document.createElement('div');
        infoDiv.className = 'bilibili-player-video-toast-bottom';
        infoDiv.innerHTML = `
        <div class="bilibili-player-video-toast-item">
            <div class="bilibili-player-video-toast-item-text">
                <span>${text}</span>
            </div>
        </div>
        `;
        playerWin.document.getElementsByClassName('bilibili-player-video-toast-wrp')[0].appendChild(infoDiv);
        setTimeout(() => infoDiv.remove(), 3000);
    }

    static getOption(playerWin) {
        let rawOption = null;
        try {
            rawOption = JSON.parse(playerWin.localStorage.getItem('BiliTwin'));
        }
        catch (e) { }
        finally {
            if (!rawOption) rawOption = {};
            rawOption.setStorage = (n, i) => playerWin.localStorage.setItem(n, i);
            rawOption.getStorage = n => playerWin.localStorage.getItem(n);
            const defaultOption = {
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

    static saveOption(option) {
        return option.setStorage('BiliTwin', JSON.stringify(option));
    }

    static outdatedEngineClearance() {
        if (!Promise || !MutationObserver) {
            alert('这个浏览器实在太老了，脚本决定罢工。');
            throw 'BiliTwin: browser outdated: Promise or MutationObserver unsupported';
        }
    }

    static firefoxClearance() {
        if (navigator.userAgent.includes('Firefox')) {
            debugOption.proxy = false;
            if (!window.navigator.temporaryStorage && !window.navigator.mozTemporaryStorage) window.navigator.temporaryStorage = { queryUsageAndQuota: func => func(-1048576, 10484711424) };
        }
    }

    static xpcWrapperClearance() {
        if (top.unsafeWindow) {
            Object.defineProperty(window, 'cid', {
                configurable: true,
                get: () => String(unsafeWindow.cid)
            });
            Object.defineProperty(window, 'player', {
                configurable: true,
                get: () => ({ destroy: unsafeWindow.player.destroy, reloadAccess: unsafeWindow.player.reloadAccess })
            });
            Object.defineProperty(window, 'jQuery', {
                configurable: true,
                get: () => unsafeWindow.jQuery,
            });
            Object.defineProperty(window, 'fetch', {
                configurable: true,
                get: () => unsafeWindow.fetch.bind(unsafeWindow),
                set: _fetch => unsafeWindow.fetch = _fetch.bind(unsafeWindow)
            });
        }
    }

    static styleClearance() {
        let ret = `
        .bilibili-player-context-menu-container.black ul.bilitwin li.context-menu-function > a:hover {
            background: rgba(255,255,255,.12);
            transition: all .3s ease-in-out;
            cursor: pointer;
        }
        `;
        if (!top.location.href.includes('www.bilibili.com/video/av')) ret += `
        .bilitwin a {
            cursor: pointer;
            color: #00a1d6;
        }

        .bilitwin a:hover {
            color: #f25d8e;
        }

        .bilitwin button {
            color: #fff;
            cursor: pointer;
            text-align: center;
            border-radius: 4px;
            background-color: #00a1d6;
            vertical-align: middle;
            border: 1px solid #00a1d6;
            transition: .1s;
            transition-property: background-color,border,color;
            user-select: none;
        }

        .bilitwin button:hover {
            background-color: #00b5e5;
            border-color: #00b5e5;
        }

        .bilitwin progress {
            -webkit-appearance: progress;
        }
        `;
        let style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.textContent = ret;
        document.head.appendChild(style);
    }

    static cleanUp() {
        Array.from(document.getElementsByClassName('bilitwin'))
            .filter(e => e.textContent.includes('FLV分段'))
            .forEach(e => Array.from(e.getElementsByTagName('a')).forEach(
                e => e.textContent == '取消' && e.click()
            ));
        Array.from(document.getElementsByClassName('bilitwin')).forEach(e => e.remove());
    }

    static async start() {
        let cidRefresh = new AsyncContainer();
        let href = location.href;

        // 1. playerWin and option
        let playerWin;
        try {
            playerWin = await UI.getPlayerWin();
        } catch (e) {
            if (e == 'Need H5 Player') UI.requestH5Player();
            throw e;
        }
        let option = UI.getOption(playerWin);
        let optionDiv = UI.genOptionDiv(option);
        document.body.appendChild(optionDiv);

        // 2. monkey and polyfill
        let monkeyTitle;
        let displayPolyfillDataDiv = polyfill => UI.displayPolyfillDataDiv(polyfill);
        let [monkey, polyfill] = await Promise.all([
            (async () => {
                let monkey = new BiliMonkey(playerWin, option);
                await monkey.execOptions();
                monkeyTitle = UI.titleAppend(monkey);
                return monkey;
            })(),
            (async () => {
                let polyfill = new BiliPolyfill(playerWin, option, t => UI.hintInfo(t, playerWin));
                await polyfill.setFunctions();
                return polyfill;
            })()
        ]);
        if (href != location.href) return UI.cleanUp();

        // 3. menu
        UI.menuAppend(playerWin, { monkey, monkeyTitle, polyfill, displayPolyfillDataDiv, optionDiv });

        // 4. refresh
        let h = () => {
            let video = playerWin.document.getElementsByTagName('video')[0];
            if (video) video.addEventListener('emptied', h);
            else setTimeout(() => cidRefresh.resolve(), 0);
        }
        playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
        playerWin.addEventListener('unload', () => setTimeout(() => cidRefresh.resolve(), 0));

        // 5. debug
        if (debugOption.debug && top.console) top.console.clear();
        if (debugOption.debug) ([(top.unsafeWindow || top).m, (top.unsafeWindow || top).p] = [monkey, polyfill]);

        await cidRefresh;
        UI.cleanUp();
    }

    static async init() {
        if (!document.body) return;
        UI.outdatedEngineClearance();
        UI.firefoxClearance();
        UI.styleClearance();

        while (1) {
            await UI.start();
        }
    }
}

UI.init();
