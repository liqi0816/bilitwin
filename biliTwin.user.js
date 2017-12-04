// ==UserScript==
// @name        bilibili merged flv+mp4+ass+enhance
// @namespace   http://qli5.tk/
// @homepageURL https://github.com/liqi0816/bilitwin/
// @description bilibili/哔哩哔哩:超清FLV下载,FLV合并,原生MP4下载,弹幕ASS下载,播放体验增强,HTTPS,原生appsecret,不借助其他网站
// @match       *://www.bilibili.com/video/av*
// @match       *://bangumi.bilibili.com/anime/*/play*
// @match       *://www.bilibili.com/watchlater/
// @version     1.10
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
        if (littleEndian) throw 'littleEndian int24 not supported';
        let msb = this.getUint8(byteOffset);
        return (msb << 16 | this.getUint16(byteOffset + 1));
    }

    setUint24(byteOffset, value, littleEndian) {
        if (littleEndian) throw 'littleEndian int24 not supported';
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
    constructor(dataView, currentOffset) {
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
        this.assAsyncScript = BiliMonkey.loadASSScript();
        this.queryInfoMutex = new Mutex();
        this.queryInfoMutex.lockAndAwait(() => this.getPlayer());
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
                if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
                if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
            if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
            if (!this.cid) this.cid = new Promise(resolve => {
                if (!clickableFormat) reject('get ASS Error: cid unavailable, nor clickable format given.');
                const jq = this.playerWin.jQuery;
                const _ajax = jq.ajax;
                const _setItem = this.playerWin.localStorage.setItem;

                this.lockFormat(clickableFormat);
                let self = this;
                jq.ajax = function (a, c) {
                    if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                    if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
            let [{ fetchDanmaku, generateASS, setPosition }, cid] = await Promise.all([this.assAsyncScript, this.cid]);

            fetchDanmaku(cid, danmaku => {
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

    async getPlayer() {
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
        await this.getPlayer();

        const fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': '' }] };
        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;
        const _setItem = this.playerWin.localStorage.setItem;

        return new Promise(async resolve => {
            let blockerTimeout;
            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/playurl?')) {
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
        });
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
        let resProxy = {};
        Object.assign(resProxy, res);
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

    static async loadASSScript(src = 'https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.user.js') {
        let script = await new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onload = () => resolve(req.responseText);
            req.onerror = reject;
            req.open('get', src);
            req.send();
        });
        script = script.slice(0, script.indexOf('var init = function ()'));
        let head = `
        (function () {
        `;
        let foot = `
            fetchXML = function (cid, callback) {
                var oReq = new XMLHttpRequest();
                oReq.open('GET', 'https://comment.bilibili.com/{{cid}}.xml'.replace('{{cid}}', cid));
                oReq.onload = function () {
                    var content = oReq.responseText.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, "");
                    callback(content);
                };
                oReq.send();
            };
            initFont();
            return { fetchDanmaku: fetchDanmaku, generateASS: generateASS, setPosition: setPosition };
        })()
        `;
        script = `${head}${script}${foot}`;
        return top.eval(script);
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
        this.userdata = null;
    }

    saveUserdata() {
        this.setStorage('biliPolyfill', JSON.stringify(this.userdata));
    }

    retriveUserdata() {
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
        if (!this.option.betabeta) {
            await this.getPlayerVideo();
            this.userdata = { oped: {} };
            return;
        }
        if (videoRefresh) {
            this.video = this.playerWin.document.getElementsByTagName('video')[0];
            if (!this.video) return;
            if (this.option.dblclick) this.dblclickFullScreen();
            if (this.option.electric) this.reallocateElectricPanel();
            if (this.option.oped) this.skipOPED();
            this.video.addEventListener('emptied', () => this.setFunctions({ videoRefresh: true }));
            return;
        }
        this.video = await this.getPlayerVideo();
        this.retriveUserdata();
        if (this.option.badgeWatchLater) this.badgeWatchLater();
        if (this.option.dblclick) this.dblclickFullScreen();
        if (this.option.scroll) this.scrollToPlayer();
        if (this.option.recommend) this.showRecommendTab();
        if (this.option.electric) this.reallocateElectricPanel();
        if (this.option.lift) this.liftBottomDanmuku();
        if (this.option.autoResume) this.autoResume();
        if (this.option.autoPlay) this.autoPlay();
        if (this.option.autoWideScreen) this.autoWideScreen();
        if (this.option.autoFullScreen) this.autoFullScreen();
        if (this.option.oped) this.skipOPED();
        if (this.option.focus) this.focusOnPlayer();
        if (this.option.menuFocus) this.menuFocusOnPlayer();
        if (this.option.limitedKeydown) this.limitedKeydownFullScreenPlay();
        this.playerWin.addEventListener('beforeunload', () => this.saveUserdata());
        this.video.addEventListener('emptied', () => this.setFunctions({ videoRefresh: true }));
        // beta
        if (this.option.speech) top.document.body.addEventListener('click', e => e.detail > 2 && this.speechRecognition());
        if (this.option.series) this.inferNextInSeries();
    }

    async inferNextInSeries() {
        let title = (top.document.getElementsByClassName('v-title')[0] || top.document.getElementsByClassName('video-info-module')[0]).children[0].textContent.replace(/\(\d+\)$/, '').trim();

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
        if (top.document.querySelector('.cover_image'))
            return top.document.querySelector('.cover_image').src;
        else if (top.document.querySelector('div.v1-bangumi-info-img > a > img'))
            return top.document.querySelector('div.v1-bangumi-info-img > a > img').src.slice(0, top.document.querySelector('div.v1-bangumi-info-img > a > img').src.indexOf('.jpg') + 4);
        else if (top.document.querySelector('[data-state-play="true"]  img'))
            return top.document.querySelector('[data-state-play="true"]  img').src.slice(0, top.document.querySelector('[data-state-play="true"]  img').src.indexOf('.jpg') + 4);
        else
            return null;
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
        return (top.location.pathname.match(/av\d+/) || top.location.pathname.match(/anime\/\d+/) || top.location.hash.match(/av\d+/))[0];
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
        let r, g;
        try { [r, g] = [SpeechRecognition, SpeechGrammarList] } catch (e) {
            try { [r, g] = [webkitSpeechRecognition, webkitSpeechGrammarList] } catch (e) { }
        }
        let [SpeechRecognition, SpeechGrammarList] = [r, g];
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
            console && console.log(e.results);
            console && console.log(`transcript:${transcript} confidence:${e.results[0][0].confidence}`);
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

    static openMinimizedPlayer(option = { cid: top.cid, aid: '' }) {
        if (!option) throw 'usage: openMinimizedPlayer({cid[, aid]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) option.aid = '';
        let h = top.open(`//www.bilibili.com/blackboard/html5player.html?cid=${option.cid}&aid=${option.aid}&crossDomain=${top.document.domain != 'www.bilibili.com' ? 'true' : ''}`, undefined, ' ');

        (async () => {
            await new Promise(resolve => {
                h.addEventListener('load', resolve);
                setTimeout(() => {
                    h.removeEventListener('load', resolve);
                    resolve();
                }, 6000);
            });
            let div = h.document.getElementById('bilibiliPlayer');
            if (!div) { console.warn('openMinimizedPlayer: fullscreen timeout'); return; }
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
        })();
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
                    resolve();
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
                            resolve();
                            observer.disconnect();
                        }
                    });
                    observer.observe(document, { childList: true, subtree: true });
                });
            }
        }
        if (location.host == 'bangumi.bilibili.com') {
            if (document.querySelector('#bofqi > iframe')) {
                return BiliUserJS.getIframeWin();
            }
            else if (document.querySelector('#bofqi > object')) {
                throw 'Need H5 Player';
            }
            else {
                return new Promise(resolve => {
                    let observer = new MutationObserver(() => {
                        if (document.querySelector('#bofqi > iframe')) {
                            observer.disconnect();
                            resolve(BiliUserJS.getIframeWin());
                        }
                        else if (document.querySelector('#bofqi > object')) {
                            observer.disconnect();
                            throw 'Need H5 Player';
                        }
                    });
                    observer.observe(document.getElementById('bofqi'), { childList: true });
                });
            }
        }
        else {
            if (document.getElementById('bilibiliPlayer')) {
                return window;
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
}

class UI extends BiliUserJS {
    // Title Append
    static titleAppend(monkey) {
        let h = document.querySelector('div.viewbox div.info') || document.querySelector('div.video-top-info div.video-info-module');
        let tminfo = document.querySelector('div.tminfo');
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
        div.style.zIndex = '1';
        div.style.paddingTop = '4px';
        div.style.width = '32%';
        div.style.float = 'left';
        tminfo.style.float = 'left';
        tminfo.style.width = '68%';
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
        if (top.location.origin == 'bangumi.bilibili.com') {
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
        let url = URL.createObjectURL(mergedFLV);
        let outputName = document.getElementsByClassName('v-title')[0].textContent.trim();

        bar.value++;
        table.insertRow(0).innerHTML = `
        <td colspan="3" style="border: 1px solid black">
            <a href="${url}" download="${outputName}.flv">保存合并后FLV</a> 
            <a href="${await monkey.ass}" download="${outputName}.ass">弹幕ASS</a> 
            记得清理分段缓存哦~
        </td>
        `;
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
            polyfill.retriveUserdata();
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
            td.appendChild(checkbox);
            td.appendChild(document.createTextNode(d[1]));
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
            ['speech', '(测)(需墙外)任意三击鼠标左键开启语音识别'],
            ['series', '(测)尝试自动找上下集'],
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
            td.appendChild(checkbox);
            td.appendChild(document.createTextNode(d[1]));
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
            return Object.assign({}, defaultOption, rawOption, top.debugOption);
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
            top.debugOption.proxy = false;
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

    static watchLaterClearnce() {
        if (location.pathname == '/watchlater/') {
            let style = document.createElement('style');
            style.type = 'text/css';
            style.rel = 'stylesheet';
            style.textContent = `
                .bilitwin a {
                    cursor: pointer;
                    color: #00a1d6;
                }

                div.video-top-info > div.video-info-module > div.info.bilitwin {
                    padding-top: 5px;
                    float: left;
                }
                `;
            document.head.appendChild(style);
        }
    }

    static menuStyleFix(playerWin) {
        if (playerWin.document.getElementById('bilitwinMenuStyleFix')) return;
        let style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.id = 'bilitwinMenuStyleFix';
        style.textContent = `
            .bilibili-player-context-menu-container.black ul.bilitwin li.context-menu-function > a:hover {
                background: rgba(255,255,255,.12);
                transition: all .3s ease-in-out;
                cursor: pointer;
            }
            `;
        playerWin.document.head.appendChild(style);
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
        UI.menuStyleFix(playerWin);

        // 4. refresh
        let h = () => {
            let video = playerWin.document.getElementsByTagName('video')[0];
            if (video) video.addEventListener('emptied', h);
            else setTimeout(() => cidRefresh.resolve(), 0);
        }
        playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
        playerWin.addEventListener('unload', () => setTimeout(() => cidRefresh.resolve(), 0));

        // 5. debug
        if (top.debugOption && top.debugOption.debug && top.console) top.console.clear();
        if (top.debugOption && top.debugOption.debug) ([(top.unsafeWindow || top).m, (top.unsafeWindow || top).p] = [monkey, polyfill]);

        await cidRefresh;
        UI.cleanUp();
    }

    static async init() {
        if (!document.body) return;
        UI.outdatedEngineClearance();
        UI.firefoxClearance();
        UI.watchLaterClearnce();

        while (1) {
            await UI.start();
        }
    }
}

UI.init();
