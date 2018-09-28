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
// @version     1.15.4
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
class AsyncContainer {
    /***
     * The thing is, if we cannot cancel a promise, we should at least be able to 
     * explicitly mark a promise as garbage collectible.
     * 
     * Yes, this is something like cancelable Promise. But I insist they are different.
     */
    constructor(callback) {
        // 1. primary promise
        this.primaryPromise = new Promise((s, j) => {
            this.resolve = arg => { s(arg); return arg; };
            this.reject = arg => { j(arg); return arg; };
        });

        // 2. hang promise
        this.hangReturn = Symbol();
        this.hangPromise = new Promise(s => this.hang = () => s(this.hangReturn));
        this.destroiedThen = this.hangPromise.then.bind(this.hangPromise);
        this.primaryPromise.then(() => this.state = 'fulfilled');
        this.primaryPromise.catch(() => this.state = 'rejected');
        this.hangPromise.then(() => this.state = 'hanged');

        // 4. race
        this.promise = Promise
            .race([this.primaryPromise, this.hangPromise])
            .then(s => s == this.hangReturn ? new Promise(() => { }) : s);

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
        this.finally = this.resolve;
        this.destroiedThen = f => f();
        /***
         * For ease of debug, do not dereference hangReturn
         * 
         * If run from console, mysteriously this tiny symbol will help correct gc
         * before a console.clear
         */
        //this.hangReturn = null;
    }

    static _UNIT_TEST() {
        const containers = [];
        async function foo() {
            const buf = new Uint8Array(600 * 1024 * 1024);
            for (let i = 0; i < buf.length; i++) buf[i] = i;
            const ac = new AsyncContainer();
            ac.destroiedThen(() => console.log('asyncContainer destroied'));
            containers.push(ac);
            await ac;
            return buf;
        }
        const foos = [foo(), foo(), foo()];
        containers.forEach(e => e.destroy());
        console.warn('Check your RAM usage. I allocated 1.8GB in three dead-end promises.');
        return [foos, containers];
    }
}

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
class BiliUserJS {
    static async getIframeWin() {
        if (document.querySelector('#bofqi > iframe').contentDocument.getElementById('bilibiliPlayer')) {
            return document.querySelector('#bofqi > iframe').contentWindow;
        }
        else {
            return new Promise(resolve => {
                document.querySelector('#bofqi > iframe').addEventListener('load', () => {
                    resolve(document.querySelector('#bofqi > iframe').contentWindow);
                }, { once: true });
            });
        }
    }

    static async getPlayerWin() {
        if (location.href.includes('/watchlater/#/list')) {
            await new Promise(resolve => {
                window.addEventListener('hashchange', () => resolve(location.href), { once: true });
            });
        }
        if (location.href.includes('/watchlater/#/')) {
            if (!document.getElementById('bofqi')) {
                await new Promise(resolve => {
                    const observer = new MutationObserver(() => {
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
                const observer = new MutationObserver(() => {
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
            });
        }
    }

    static tryGetPlayerWinSync() {
        if (document.getElementById('bilibiliPlayer')) {
            return window;
        }
        else if (document.querySelector('#bofqi > object')) {
            throw 'Need H5 Player';
        }
    }

    static getCidRefreshPromise(playerWin) {
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
        const cidRefresh = new AsyncContainer();

        // 1. no active video element in document => cid refresh
        const observer = new MutationObserver(() => {
            if (!playerWin.document.getElementsByTagName('video')[0]) {
                observer.disconnect();
                cidRefresh.resolve();
            }
        });
        observer.observe(playerWin.document.getElementsByClassName('bilibili-player-video')[0], { childList: true });

        // 2. playerWin unload => cid refresh
        playerWin.addEventListener('unload', () => Promise.resolve().then(() => cidRefresh.resolve()));

        return cidRefresh;
    }

    static async domContentLoadedThen(func) {
        if (document.readyState == 'loading') {
            return new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', () => resolve(func()), { once: true });
            })
        }
        else {
            return func();
        }
    }
}

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
class CacheDB {
    constructor(dbName = 'biliMonkey', osName = 'flv', keyPath = 'name', maxItemSize = 100 * 1024 * 1024) {
        // Neither Chrome or Firefox can handle item size > 100M
        this.dbName = dbName;
        this.osName = osName;
        this.keyPath = keyPath;
        this.maxItemSize = maxItemSize;
        this.db = null;
    }

    async getDB() {
        if (this.db) return this.db;
        this.db = new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(this.dbName);
            openRequest.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.osName)) {
                    db.createObjectStore(this.osName, { keyPath: this.keyPath });
                }
            };
            openRequest.onsuccess = e => {
                return resolve(this.db = e.target.result);
            };
            openRequest.onerror = reject;
        });
        return this.db;
    }

    async addData(item, name = item.name, data = item.data || item) {
        if (!data instanceof Blob) throw 'CacheDB: data must be a Blob';
        const itemChunks = [];
        const numChunks = Math.ceil(data.size / this.maxItemSize);
        for (let i = 0; i < numChunks; i++) {
            itemChunks.push({
                name: `${name}/part_${i}`,
                numChunks,
                data: data.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
            });
        }

        const reqCascade = new Promise(async (resolve, reject) => {
            const db = await this.getDB();
            const objectStore = db.transaction([this.osName], 'readwrite').objectStore(this.osName);
            const onsuccess = e => {
                const chunk = itemChunks.pop();
                if (!chunk) return resolve(e);
                const req = objectStore.add(chunk);
                req.onerror = reject;
                req.onsuccess = onsuccess;
            };
            onsuccess();
        });

        return reqCascade;
    }

    async putData(item, name = item.name, data = item.data || item) {
        if (!data instanceof Blob) throw 'CacheDB: data must be a Blob';
        const itemChunks = [];
        const numChunks = Math.ceil(data.size / this.maxItemSize);
        for (let i = 0; i < numChunks; i++) {
            itemChunks.push({
                name: `${name}/part_${i}`,
                numChunks,
                data: data.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
            });
        }

        const reqCascade = new Promise(async (resolve, reject) => {
            const db = await this.getDB();
            const objectStore = db.transaction([this.osName], 'readwrite').objectStore(this.osName);
            const onsuccess = e => {
                const chunk = itemChunks.pop();
                if (!chunk) return resolve(e);
                const req = objectStore.put(chunk);
                req.onerror = reject;
                req.onsuccess = onsuccess;
            };
            onsuccess();
        });

        return reqCascade;
    }

    async getData(name) {
        const reqCascade = new Promise(async (resolve, reject) => {
            const dataChunks = [];
            const db = await this.getDB();
            const objectStore = db.transaction([this.osName], 'readwrite').objectStore(this.osName);
            const probe = objectStore.get(`${name}/part_0`);
            probe.onerror = reject;
            probe.onsuccess = e => {
                // 1. Probe fails => key does not exist
                if (!probe.result) return resolve(null);

                // 2. How many chunks to retrieve?
                const { numChunks } = probe.result;

                // 3. Cascade on the remaining chunks
                const onsuccess = e => {
                    dataChunks.push(e.target.result.data);
                    if (dataChunks.length == numChunks) return resolve(dataChunks);
                    const req = objectStore.get(`${name}/part_${dataChunks.length}`);
                    req.onerror = reject;
                    req.onsuccess = onsuccess;
                };
                onsuccess(e);
            };
        });

        const dataChunks = await reqCascade;

        return dataChunks ? { name, data: new Blob(dataChunks) } : null;
    }

    async deleteData(name) {
        const reqCascade = new Promise(async (resolve, reject) => {
            let currentChunkNum = 0;
            const db = await this.getDB();
            const objectStore = db.transaction([this.osName], 'readwrite').objectStore(this.osName);
            const probe = objectStore.get(`${name}/part_0`);
            probe.onerror = reject;
            probe.onsuccess = e => {
                // 1. Probe fails => key does not exist
                if (!probe.result) return resolve(null);

                // 2. How many chunks to delete?
                const { numChunks } = probe.result;

                // 3. Cascade on the remaining chunks
                const onsuccess = e => {
                    const req = objectStore.delete(`${name}/part_${currentChunkNum}`);
                    req.onerror = reject;
                    req.onsuccess = onsuccess;
                    currentChunkNum++;
                    if (currentChunkNum == numChunks) return resolve(e);
                };
                onsuccess();
            };
        });

        return reqCascade;
    }

    async deleteEntireDB() {
        const req = indexedDB.deleteDatabase(this.dbName);
        return new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(this.db = null);
            req.onerror = reject;
        });
    }

    static async _UNIT_TEST() {
        let db = new CacheDB();
        console.warn('Storing 201MB...');
        console.log(await db.putData(new Blob([new ArrayBuffer(201 * 1024 * 1024)]), 'test'));
        console.warn('Deleting 201MB...');
        console.log(await db.deleteData('test'));
    }
}

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
            xhr.onload = () => { resolve(this.blob = new Blob(this.buffer)); this.buffer = null; };
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
class Mutex {
    constructor() {
        this.queueTail = Promise.resolve();
        this.resolveHead = null;
    }

    /** 
     * await mutex.lock = pthread_mutex_lock
     * @returns a promise to be resolved when the mutex is available
    */
    async lock() {
        let myResolve;
        let _queueTail = this.queueTail;
        this.queueTail = new Promise(resolve => myResolve = resolve);
        await _queueTail;
        this.resolveHead = myResolve;
        return;
    }

    /**
     * mutex.unlock = pthread_mutex_unlock
     */
    unlock() {
        this.resolveHead();
        return;
    }

    /**
     * lock, ret = await async, unlock, return ret
     * @param {(Function|Promise)} promise async thing to wait for
     */
    async lockAndAwait(promise) {
        await this.lock();
        let ret;
        try {
            if (typeof promise == 'function') promise = promise();
            ret = await promise;
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

    const parser = {};

    /**
     * @param {Danmaku} danmaku
     * @returns {boolean}
     */
    const danmakuFilter = danmaku => {
      if (!danmaku) return false;
      if (!danmaku.text) return false;
      if (!danmaku.mode) return false;
      if (!danmaku.size) return false;
      if (danmaku.time < 0 || danmaku.time >= 360000) return false;
      return true;
    };

    const parseRgb256IntegerColor = color => {
      const rgb = parseInt(color, 10);
      const r = (rgb >>> 4) & 0xff;
      const g = (rgb >>> 2) & 0xff;
      const b = (rgb >>> 0) & 0xff;
      return { r, g, b };
    };

    const parseNiconicoColor = mail => {
      const colorTable = {
        red: { r: 255, g: 0, b: 0 },
        pink: { r: 255, g: 128, b: 128 },
        orange: { r: 255, g: 184, b: 0 },
        yellow: { r: 255, g: 255, b: 0 },
        green: { r: 0, g: 255, b: 0 },
        cyan: { r: 0, g: 255, b: 255 },
        blue: { r: 0, g: 0, b: 255 },
        purple: { r: 184, g: 0, b: 255 },
        black: { r: 0, g: 0, b: 0 },
      };
      const defaultColor = { r: 255, g: 255, b: 255 };
      const line = mail.toLowerCase().split(/\s+/);
      const color = Object.keys(colorTable).find(color => line.includes(color));
      return color ? colorTable[color] : defaultColor;
    };

    const parseNiconicoMode = mail => {
      const line = mail.toLowerCase().split(/\s+/);
      if (line.includes('ue')) return 'TOP';
      if (line.includes('shita')) return 'BOTTOM';
      return 'RTL';
    };

    const parseNiconicoSize = mail => {
      const line = mail.toLowerCase().split(/\s+/);
      if (line.includes('big')) return 36;
      if (line.includes('small')) return 16;
      return 25;
    };

    /**
     * @param {string|ArrayBuffer} content
     * @return {{ cid: number, danmaku: Array<Danmaku> }}
     */
    parser.bilibili = function (content) {
      const text = typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content);
      const clean = text.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, '');
      const data = (new DOMParser()).parseFromString(clean, 'text/xml');
      const cid = +data.querySelector('chatid').textContent;
      /** @type {Array<Danmaku>} */
      const danmaku = Array.from(data.querySelectorAll('d')).map(d => {
        const p = d.getAttribute('p');
        const [time, mode, size, color, create, bottom, sender, id] = p.split(',');
        return {
          text: d.textContent,
          time: +time,
          // We do not support ltr mode
          mode: [null, 'RTL', 'RTL', 'RTL', 'BOTTOM', 'TOP'][+mode],
          size: +size,
          color: parseRgb256IntegerColor(color),
          bottom: bottom > 0,
        };
      }).filter(danmakuFilter);
      return { cid, danmaku };
    };

    /**
     * @param {string|ArrayBuffer} content
     * @return {{ cid: number, danmaku: Array<Danmaku> }}
     */
    parser.acfun = function (content) {
      const text = typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content);
      const data = JSON.parse(text);
      const list = data.reduce((x, y) => x.concat(y), []);
      const danmaku = list.map(line => {
        const [time, color, mode, size, sender, create, uuid] = line.c.split(','), text = line.m;
        return {
          text,
          time: +time,
          color: parseRgb256IntegerColor(+color),
          mode: [null, 'RTL', null, null, 'BOTTOM', 'TOP'][mode],
          size: +size,
          bottom: false,
          uuid,
        };
      }).filter(danmakuFilter);
      return { danmaku };
    };

    /**
     * @param {string|ArrayBuffer} content
     * @return {{ cid: number, danmaku: Array<Danmaku> }}
     */
    parser.niconico = function (content) {
      const text = typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content);
      const data = JSON.parse(text);
      const list = data.map(item => item.chat).filter(x => x);
      const { thread } = list.find(comment => comment.thread);
      const danmaku = list.map(comment => {
        if (!comment.content || !(comment.vpos >= 0) || !comment.no) return null;
        const { vpos, mail = '', content, no } = comment;
        return {
          text: content,
          time: vpos / 100,
          color: parseNiconicoColor(mail),
          mode: parseNiconicoMode(mail),
          size: parseNiconicoSize(mail),
          bottom: false,
          id: no,
        };
      }).filter(danmakuFilter);
      return { thread, danmaku };
    };

const font = {};

// Meansure using canvas
font.textByCanvas = function () {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  return function (fontname, text, fontsize) {
    context.font = `bold ${fontsize}px ${fontname}`;
    return Math.ceil(context.measureText(text).width);
  };
};

// Meansure using <div>
font.textByDom = function () {
  const container = document.createElement('div');
  container.setAttribute('style', 'all: initial !important');
  const content = document.createElement('div');
  content.setAttribute('style', [
    'top: -10000px', 'left: -10000px',
    'width: auto', 'height: auto', 'position: absolute',
  ].map(item => item + ' !important;').join(' '));
  const active = () => { document.body.parentNode.appendChild(content); };
  if (!document.body) document.addEventListener('DOMContentLoaded', active);
  else active();
  return (fontname, text, fontsize) => {
    content.textContent = text;
    content.style.font = `bold ${fontsize}px ${fontname}`;
    return content.clientWidth;
  };
};

font.text = (function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=561361
  if (/linux/i.test(navigator.platform)) {
    return font.textByDom();
  } else {
    return font.textByCanvas();
  }
}());

font.valid = (function () {
  const cache = new Map();
  const textWidth = font.text;
  // Use following texts for checking
  const sampleText = [
    'The quick brown fox jumps over the lazy dog',
    '7531902468', ',.!-', '，。：！',
    '天地玄黄', '則近道矣',
    'あいうえお', 'アイウエオガパ', 'ｱｲｳｴｵｶﾞﾊﾟ',
  ].join('');
  // Some given font family is avaliable iff we can meansure different width compared to other fonts
  const sampleFont = [
    'monospace', 'sans-serif', 'sans',
    'Symbol', 'Arial', 'Comic Sans MS', 'Fixed', 'Terminal',
    'Times', 'Times New Roman',
    'SimSum', 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', 'WenQuanYi Micro Hei',
    'Pmingliu', 'Microsoft JhengHei', 'PingFang TC', 'Heiti TC',
    'MS Gothic', 'Meiryo', 'Hiragino Kaku Gothic Pro', 'Hiragino Mincho Pro',
  ];
  const diffFont = function (base, test) {
    const baseSize = textWidth(base, sampleText, 72);
    const testSize = textWidth(test + ',' + base, sampleText, 72);
    return baseSize !== testSize;
  };
  const validFont = function (test) {
    if (cache.has(test)) return cache.get(test);
    const result = sampleFont.some(base => diffFont(base, test));
    cache.set(test, result);
    return result;
  };
  return validFont;
}());

const rtlCanvas = function (options) {
      const {
        resolutionX: wc, // width of canvas
        resolutionY: hc, // height of canvas
        bottomReserved: b, // reserved bottom height for subtitle
        rtlDuration: u, // duration appeared on screen
        maxDelay: maxr, // max allowed delay
      } = options;

      // Initial canvas border
      let used = [
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
        { p: hc - b, m: hc, tf: Infinity, td: Infinity, b: true },
      ];
      // Find out some position is available
      const available = (hv, t0s, t0l, b) => {
        const suggestion = [];
        // Upper edge of candidate position should always be bottom of other danmaku (or top of screen)
        used.forEach(i => {
          if (i.m + hv >= hc) return;
          const p = i.m;
          const m = p + hv;
          let tas = t0s;
          let tal = t0l;
          // and left border should be right edge of others
          used.forEach(j => {
            if (j.p >= m) return;
            if (j.m <= p) return;
            if (j.b && b) return;
            tas = Math.max(tas, j.tf);
            tal = Math.max(tal, j.td);
          });
          const r = Math.max(tas - t0s, tal - t0l);
          if (r > maxr) return;
          // save a candidate position
          suggestion.push({ p, r });
        });
        // sorted by its vertical position
        suggestion.sort((x, y) => x.p - y.p);
        let mr = maxr;
        // the bottom and later choice should be ignored
        const filtered = suggestion.filter(i => {
          if (i.r >= mr) return false;
          mr = i.r;
          return true;
        });
        return filtered;
      };
      // mark some area as used
      let use = (p, m, tf, td) => {
        used.push({ p, m, tf, td, b: false });
      };
      // remove danmaku not needed anymore by its time
      const syn = (t0s, t0l) => {
        used = used.filter(i => i.tf > t0s || i.td > t0l);
      };
      // give a score in range [0, 1) for some position
      const score = i => {
        if (i.r > maxr) return -Infinity;
        return 1 - Math.hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;
      };
      // add some danmaku
      return line => {
        const {
          time: t0s, // time sent (start to appear if no delay)
          width: wv, // width of danmaku
          height: hv, // height of danmaku
          bottom: b, // is subtitle
        } = line;
        const t0l = wc / (wv + wc) * u + t0s; // time start to leave
        syn(t0s, t0l);
        const al = available(hv, t0s, t0l, b);
        if (!al.length) return null;
        const scored = al.map(i => [score(i), i]);
        const best = scored.reduce((x, y) => {
          return x[0] > y[0] ? x : y;
        })[1];
        const ts = t0s + best.r; // time start to enter
        const tf = wv / (wv + wc) * u + ts; // time complete enter
        const td = u + ts; // time complete leave
        use(best.p, best.p + hv, tf, td);
        return {
          top: best.p,
          time: ts,
        };
      };
    };

    const fixedCanvas = function (options) {
      const {
        resolutionY: hc,
        bottomReserved: b,
        fixDuration: u,
        maxDelay: maxr,
      } = options;
      let used = [
        { p: -Infinity, m: 0, td: Infinity, b: false },
        { p: hc, m: Infinity, td: Infinity, b: false },
        { p: hc - b, m: hc, td: Infinity, b: true },
      ];
      // Find out some available position
      const fr = (p, m, t0s, b) => {
        let tas = t0s;
        used.forEach(j => {
          if (j.p >= m) return;
          if (j.m <= p) return;
          if (j.b && b) return;
          tas = Math.max(tas, j.td);
        });
        const r = tas - t0s;
        if (r > maxr) return null;
        return { r, p, m };
      };
      // layout for danmaku at top
      const top = (hv, t0s, b) => {
        const suggestion = [];
        used.forEach(i => {
          if (i.m + hv >= hc) return;
          suggestion.push(fr(i.m, i.m + hv, t0s, b));
        });
        return suggestion.filter(x => x);
      };
      // layout for danmaku at bottom
      const bottom = (hv, t0s, b) => {
        const suggestion = [];
        used.forEach(i => {
          if (i.p - hv <= 0) return;
          suggestion.push(fr(i.p - hv, i.p, t0s, b));
        });
        return suggestion.filter(x => x);
      };
      const use = (p, m, td) => {
        used.push({ p, m, td, b: false });
      };
      const syn = t0s => {
        used = used.filter(i => i.td > t0s);
      };
      // Score every position
      const score = (i, is_top) => {
        if (i.r > maxr) return -Infinity;
        const f = p => is_top ? p : (hc - p);
        return 1 - (i.r / maxr * (31 / 32) + f(i.p) / hc * (1 / 32));
      };
      return function (line) {
        const { time: t0s, height: hv, bottom: b } = line;
        const is_top = line.mode === 'TOP';
        syn(t0s);
        const al = (is_top ? top : bottom)(hv, t0s, b);
        if (!al.length) return null;
        const scored = al.map(function (i) { return [score(i, is_top), i]; });
        const best = scored.reduce(function (x, y) {
          return x[0] > y[0] ? x : y;
        }, [-Infinity, null])[1];
        if (!best) return null;
        use(best.p, best.m, best.r + t0s + u);
        return { top: best.p, time: best.r + t0s };
      };
    };

    const placeDanmaku = function (options) {
      const layers = options.maxOverlap;
      const normal = Array(layers).fill(null).map(x => rtlCanvas(options));
      const fixed = Array(layers).fill(null).map(x => fixedCanvas(options));
      return function (line) {
        line.fontSize = Math.round(line.size * options.fontSize);
        line.height = line.fontSize;
        line.width = line.width || font.text(options.fontFamily, line.text, line.fontSize) || 1;

        if (line.mode === 'RTL') {
          const pos = normal.reduce((pos, layer) => pos || layer(line), null);
          if (!pos) return null;
          const { top, time } = pos;
          line.layout = {
            type: 'Rtl',
            start: {
              x: options.resolutionX + line.width / 2,
              y: top + line.height,
              time,
            },
            end: {
              x: -line.width / 2,
              y: top + line.height,
              time: options.rtlDuration + time,
            },
          };
        } else if (['TOP', 'BOTTOM'].includes(line.mode)) {
          const pos = fixed.reduce((pos, layer) => pos || layer(line), null);
          if (!pos) return null;
          const { top, time } = pos;
          line.layout = {
            type: 'Fix',
            start: {
              x: Math.round(options.resolutionX / 2),
              y: top + line.height,
              time,
            },
            end: {
              time: options.fixDuration + time,
            },
          };
        }
        return line;
      };
    };

    // main layout algorithm
    const layout = async function (danmaku, optionGetter) {
      const options = JSON.parse(JSON.stringify(optionGetter));
      const sorted = danmaku.slice(0).sort(({ time: x }, { time: y }) => x - y);
      const place = placeDanmaku(options);
      const result = Array(sorted.length);
      let length = 0;
      for (let i = 0, l = sorted.length; i < l; i++) {
        let placed = place(sorted[i]);
        if (placed) result[length++] = placed;
        if ((i + 1) % 1000 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      result.length = length;
      result.sort((x, y) => x.layout.start.time - y.layout.start.time);
      return result;
    };

// escape string for ass
    const textEscape = s => (
      // VSFilter do not support escaped "{" or "}"; we use full-width version instead
      s.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\s/g, ' ')
    );

    const formatColorChannel = v => (v & 255).toString(16).toUpperCase().padStart(2, '0');

    // format color
    const formatColor = color => '&H' + (
      [color.b, color.g, color.r].map(formatColorChannel).join('')
    );

    // format timestamp
    const formatTimestamp = time => {
      const value = Math.round(time * 100) * 10;
      const rem = value % 3600000;
      const hour = (value - rem) / 3600000;
      const fHour = hour.toFixed(0).padStart(2, '0');
      const fRem = new Date(rem).toISOString().slice(-11, -2);
      return fHour + fRem;
    };

    // test is default color
    const isDefaultColor = ({ r, g, b }) => r === 255 && g === 255 && b === 255;
    // test is dark color
    const isDarkColor = ({ r, g, b }) => r * 0.299 + g * 0.587 + b * 0.114 < 0x30;

    // Ass header
    const header = info => [
      '[Script Info]',
      `Title: ${info.title}`,
      `Original Script: ${info.original}`,
      'ScriptType: v4.00+',
      'Collisions: Normal',
      `PlayResX: ${info.playResX}`,
      `PlayResY: ${info.playResY}`,
      'Timer: 100.0000',
      '',
      '[V4+ Styles]',
      'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
      `Style: Fix,${info.fontFamily},${info.fontSize},&H${info.alpha}FFFFFF,&H${info.alpha}FFFFFF,&H${info.alpha}000000,&H${info.alpha}000000,${info.bold},0,0,0,100,100,0,0,1,2,0,2,20,20,2,0`,
      `Style: Rtl,${info.fontFamily},${info.fontSize},&H${info.alpha}FFFFFF,&H${info.alpha}FFFFFF,&H${info.alpha}000000,&H${info.alpha}000000,${info.bold},0,0,0,100,100,0,0,1,2,0,2,20,20,2,0`,
      '',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    ];

    // Set color of text
    const lineColor = ({ color }) => {
      let output = [];
      if (!isDefaultColor(color)) output.push(`\\c${formatColor(color)}`);
      if (isDarkColor(color)) output.push(`\\3c&HFFFFFF`);
      return output.join('');
    };

    // Set fontsize
    let defaultFontSize;
    const lineFontSize = ({ size }) => {
      if (size === defaultFontSize) return '';
      return `\\fs${size}`;
    };
    const getCommonFontSize = list => {
      const count = new Map();
      let commonCount = 0, common = 1;
      list.forEach(({ size }) => {
        let value = 1;
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
    const lineMove = ({ layout: { type, start = null, end = null } }) => {
      if (type === 'Rtl' && start && end) return `\\move(${start.x},${start.y},${end.x},${end.y})`;
      if (type === 'Fix' && start) return `\\pos(${start.x},${start.y})`;
      return '';
    };

    // format one line
    const formatLine = line => {
      const start = formatTimestamp(line.layout.start.time);
      const end = formatTimestamp(line.layout.end.time);
      const type = line.layout.type;
      const color = lineColor(line);
      const fontSize = lineFontSize(line);
      const move = lineMove(line);
      const format = `${color}${fontSize}${move}`;
      const text = textEscape(line.text);
      return `Dialogue: 0,${start},${end},${type},,20,20,2,,{${format}}${text}`;
    };

    const ass = (danmaku, options) => {
      const info = {
        title: danmaku.meta.name,
        original: `Generated by tiansh/ass-danmaku (embedded in liqi0816/bilitwin) based on ${danmaku.meta.url}`,
        playResX: options.resolutionX,
        playResY: options.resolutionY,
        fontFamily: options.fontFamily.split(",")[0],
        fontSize: getCommonFontSize(danmaku.layout),
        alpha: formatColorChannel(0xFF * (100 - options.textOpacity * 100) / 100),
        bold: options.bold? -1 : 0,
      };
      return [
        ...header(info),
        ...danmaku.layout.map(formatLine).filter(x => x),
      ].join('\r\n');
    };

/**
 * @file Common works for reading / writing optinos
 */

  /**
   * @returns {string}
   */
  const predefFontFamily = () => {
    // const sc = ['Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC'];
    // replaced with bilibili defaults
    const sc = ["SimHei", "'Microsoft JhengHei'", "SimSun", "NSimSun", "FangSong", "'Microsoft YaHei'", "'Microsoft Yahei UI Light'", "'Noto Sans CJK SC Bold'", "'Noto Sans CJK SC DemiLight'", "'Noto Sans CJK SC Regular'"];
    const tc = ['Microsoft JhengHei', 'PingFang TC', 'Noto Sans CJK TC'];
    const ja = ['MS PGothic', 'Hiragino Kaku Gothic Pro', 'Noto Sans CJK JP'];
    const lang = navigator.language;
    const fonts = /^ja/.test(lang) ? ja : /^zh(?!.*Hans).*(?:TW|HK|MO)/.test(lang) ? tc : sc;
    const chosed = fonts.find(font$$1 => font.valid(font$$1)) || fonts[0];
    return chosed;
  };

  const attributes = [
    { name: 'resolutionX', type: 'number', min: 480, predef: 560 },
    { name: 'resolutionY', type: 'number', min: 360, predef: 420 },
    { name: 'bottomReserved', type: 'number', min: 0, predef: 60 },
    { name: 'fontFamily', type: 'string', predef: predefFontFamily(), valid: font$$1 => font.valid(font$$1) },
    { name: 'fontSize', type: 'number', min: 0, predef: 1, step: 0.01 },
    { name: 'textSpace', type: 'number', min: 0, predef: 0 },
    { name: 'rtlDuration', type: 'number', min: 0.1, predef: 8, step: 0.1 },
    { name: 'fixDuration', type: 'number', min: 0.1, predef: 4, step: 0.1 },
    { name: 'maxDelay', type: 'number', min: 0, predef: 6, step: 0.1 },
    { name: 'textOpacity', type: 'number', min: 0.1, max: 1, predef: 0.6 },
    { name: 'maxOverlap', type: 'number', min: 1, max: 20, predef: 1 },
    { name: 'bold', type: 'boolean', predef: true },
  ];

  const attrNormalize = (option, { name, type, min = -Infinity, max = Infinity, step = 1, predef, valid }) => {
    let value = option;
    if (type === 'number') value = +value;
    else if (type === 'string') value = '' + value;
    else if (type === 'boolean') value = !!value;
    if (valid && !valid(value)) value = predef;
    if (type === 'number') {
      if (Number.isNaN(value)) value = predef;
      if (value < min) value = min;
      if (value > max) value = max;
      if (name !='textOpacity') value = Math.round((value - min) / step) * step + min;
    }
    return value;
  };

  /**
   * @param {ExtOption} option
   * @returns {ExtOption}
   */
  const normalize = function (option) {
    return Object.assign({},
      ...attributes.map(attr => ({ [attr.name]: attrNormalize(option[attr.name], attr) }))
    );
  };

/**
   * Convert file content to Blob which describe the file
   * @param {string} content
   * @returns {Blob}
   */
  const convertToBlob = content => {
    const encoder = new TextEncoder();
    // Add a BOM to make some ass parser library happier
    const bom = '\ufeff';
    const encoded = encoder.encode(bom + content);
    const blob = new Blob([encoded], { type: 'application/octet-stream' });
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
class ASSConverter {
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
    constructor(option = {}) {
        this.option = option;
    }

    get option() {
        return this.normalizedOption;
    }

    set option(e) {
        return this.normalizedOption = normalize(e);
    }

    /**
     * @param {Danmaku[]} danmaku use ASSConverter.parseXML
     * @param {string} title 
     * @param {string} originalURL 
     */
    async genASS(danmaku, title = 'danmaku', originalURL = 'anonymous xml') {
        const layout$$1 = await layout(danmaku, this.option);
        const ass$$1 = ass({
            content: danmaku,
            layout: layout$$1,
            meta: {
                name: title,
                url: originalURL
            }
        }, this.option);
        return ass$$1;
    }

    async genASSBlob(danmaku, title = 'danmaku', originalURL = 'anonymous xml') {
        return convertToBlob(await this.genASS(danmaku, title, originalURL));
    }

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

    /**
     * @param {string} xml bilibili danmaku xml
     * @returns {Danmaku[]}
     */
    static parseXML(xml) {
        return parser.bilibili(xml).danmaku;
    }


    static _UNIT_TEST() {
        const e = new ASSConverter();
        const xml = `<?xml version="1.0" encoding="UTF-8"?><i><chatserver>chat.bilibili.com</chatserver><chatid>32873758</chatid><mission>0</mission><maxlimit>6000</maxlimit><state>0</state><realname>0</realname><source>k-v</source><d p="0.00000,1,25,16777215,1519733589,0,d286a97b,4349604072">真第一</d><d p="7.29900,1,25,16777215,1519733812,0,3548796c,4349615908">五分钟前</d><d p="587.05100,1,25,16777215,1519734291,0,f2ed792f,4349641325">惊呆了！</d><d p="136.82200,1,25,16777215,1519734458,0,1e5784f,4349652071">神王代表虚空</d><d p="0.00000,1,25,16777215,1519736251,0,f16cbf44,4349751461">66666666666666666</d><d p="590.60400,1,25,16777215,1519736265,0,fbb3d1b3,4349752331">这要吹多长时间</d><d p="537.15500,1,25,16777215,1519736280,0,1e5784f,4349753170">反而不是，疾病是个恶魔，别人说她伪装成了精灵</d><d p="872.08200,1,25,16777215,1519736881,0,1e5784f,4349787709">精灵都会吃</d><d p="2648.42500,1,25,16777215,1519737840,0,e9e6b2b4,4349844463">就不能大部分都是铜币么？</d><d p="2115.09400,1,25,16777215,1519738271,0,3548796c,4349870808">吓死我了。。。</d><d p="11.45400,1,25,16777215,1519739974,0,9937b428,4349974512">???</d><d p="1285.73900,1,25,16777215,1519748274,0,3bb4c9ee,4350512859">儿砸</d><d p="595.48600,1,25,16777215,1519757148,0,f3ed26b6,4350787048">怕是要吹到缺氧哦</d><d p="1206.31500,1,25,16777215,1519767204,0,62a9186a,4350882680">233333333333333</d><d p="638.68700,1,25,16777215,1519769219,0,de0a99ae,4350893310">菜鸡的借口</d><d p="655.76500,1,25,16777215,1519769236,0,de0a99ae,4350893397">竟然吹蜡烛打医生</d><d p="2235.89600,1,25,16777215,1519769418,0,de0a99ae,4350894325">这暴击率太高了</d><d p="389.88700,1,25,16777215,1519780435,0,8879732c,4351021740">医生好想进10万，血，上万甲</d><d p="2322.47900,1,25,16777215,1519780901,0,e509a801,4351032321">前一个命都没了</d><d p="2408.93600,1,25,16777215,1519801350,0,1a692eb6,4351826484">23333333333333</d><d p="1290.62000,1,25,16777215,1519809649,0,af8f12dc,4352159267">儿砸~</d><d p="917.96300,1,25,16777215,1519816770,0,fef64b6a,4352474878">应该姆西自己控制洛斯   七杀点太快了差评</d><d p="2328.03100,1,25,16777215,1519825291,0,8549205d,4352919003">现在前一个连命都没了啊喂</d><d p="1246.16700,1,25,16777215,1519827514,0,fef64b6a,4353052309">不如走到面前用扫射   基本全中  伤害爆表</d><d p="592.38100,1,25,16777215,1519912489,0,edc3f0a9,4355960085">这是这个游戏最震撼的几幕之一</d></i>`;
        console.log(window.ass = e.genASSBlob(ASSConverter.parseXML(xml)));
    }
}

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
class HookedFunction extends Function {
    constructor(...init) {
        // 1. init parameter
        const { raw, pre, post } = HookedFunction.parseParameter(...init);

        // 2. build bundle
        const self = function (...args) {
            const { raw, pre, post } = self;
            const context = { args, target: raw, ret: undefined, hook: self };
            pre.forEach(e => e.call(this, context));
            if (context.target) context.ret = context.target.apply(this, context.args);
            post.forEach(e => e.call(this, context));
            return context.ret;
        };
        Object.setPrototypeOf(self, HookedFunction.prototype);
        self.raw = raw;
        self.pre = pre;
        self.post = post;

        // 3. cheat babel - it complains about missing super(), even if it is actual valid 
        try {
            return self;
        } catch (e) {
            super();
            return self;
        }
    }

    addPre(...func) {
        this.pre.push(...func);
    }

    addPost(...func) {
        this.post.push(...func);
    }

    addCallback(...func) {
        this.addPost(...func);
    }

    removePre(func) {
        this.pre = this.pre.filter(e => e != func);
    }

    removePost(func) {
        this.post = this.post.filter(e => e != func);
    }

    removeCallback(func) {
        this.removePost(func);
    }

    static parseParameter(...init) {
        // 1. clone init
        init = init.slice();

        // 2. default
        let raw = null;
        let pre = [];
        let post = [];

        // 3. (raw, ...others)
        if (typeof init[0] === 'function') raw = init.shift();

        // 4. iterate through parameters
        for (const e of init) {
            if (!e) {
                continue;
            }
            else if (Array.isArray(e)) {
                pre = post;
                post = e;
            }
            else if (typeof e == 'object') {
                if (typeof e.raw == 'function') raw = e.raw;
                if (typeof e.pre == 'function') pre.push(e.pre);
                if (typeof e.post == 'function') post.push(e.post);
                if (Array.isArray(e.pre)) pre = e.pre;
                if (Array.isArray(e.post)) post = e.post;
            }
            else if (typeof e == 'function') {
                post.push(e);
            }
            else {
                throw new TypeError(`HookedFunction: cannot recognize paramter ${e} of type ${typeof e}`);
            }
        }
        return { raw, pre, post };
    }

    static hook(...init) {
        // 1. init parameter
        const { raw, pre, post } = HookedFunction.parseParameter(...init);

        // 2 wrap
        // 2.1 already wrapped => concat
        if (raw instanceof HookedFunction) {
            raw.pre.push(...pre);
            raw.post.push(...post);
            return raw;
        }

        // 2.2 otherwise => new
        else {
            return new HookedFunction({ raw, pre, post });
        }
    }

    static hookDebugger(raw, pre = true, post = false) {
        // 1. init hook
        if (!HookedFunction.hookDebugger.hook) HookedFunction.hookDebugger.hook = function (ctx) { debugger };

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
                raw,
                pre: pre && HookedFunction.hookDebugger.hook || undefined,
                post: post && HookedFunction.hookDebugger.hook || undefined,
            });
        }
    }
}

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

class BiliMonkey {
    constructor(playerWin, option = BiliMonkey.optionDefaults) {
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
        this.cidAsyncContainer.then(cid => { this.cid = cid; this.ass = this.getASS(); });
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
        if (this.cache && (!(this.cache instanceof CacheDB))) this.cache = new CacheDB('biliMonkey', 'flv', 'name');

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
    lockFormat(format) {
        // null => uninitialized
        // async pending => another one is working on it
        // async resolve => that guy just finished work
        // sync value => someone already finished work
        const toast = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
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
                throw `lockFormat error: ${format} is a unrecognizable format`;
        }
    }

    resolveFormat(res, shouldBe) {
        const toast = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
        if (toast) {
            toast.style.visibility = '';
            if (toast.children.length) toast.children[0].style.visibility = 'hidden';
            const video = this.playerWin.document.getElementsByTagName('video')[0];
            if (video) {
                const h = () => {
                    if (toast.children.length) toast.children[0].style.visibility = 'hidden';
                };
                video.addEventListener('emptied', h, { once: true });
                setTimeout(() => video.removeEventListener('emptied', h), 500);
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
                    throw `URL interface error: response is not ${shouldBe}`;
                }
                return this.flvs = this.flvs.resolve(res.durl.map(e => e.url.replace('http:', this.protocol)));
            case 'hdmp4':
            case 'mp4':
                if (shouldBe && shouldBe != res.format) {
                    this.mp4 = null;
                    throw `URL interface error: response is not ${shouldBe}`;
                }
                return this.mp4 = this.mp4.resolve(res.durl[0].url.replace('http:', this.protocol));
            default:
                throw `resolveFormat error: ${res.format} is a unrecognizable format`;
        }
    }

    getVIPStatus() {
        const data = this.playerWin.sessionStorage.getItem('bili_login_status');
        try {
            return JSON.parse(data).some(e => e instanceof Object && e.vipStatus);
        }
        catch (e) {
            return false;
        }
    }

    async getASS(clickableFormat) {
        if (this.ass) return this.ass;
        this.ass = new Promise(async resolve => {
            // 1. cid
            if (!this.cid) this.cid = await new Promise((resolve, reject) => {
                clickableFormat = this.fallbackFormatName || clickableFormat;
                if (!clickableFormat) reject('get ASS Error: cid unavailable, nor clickable format given.');
                const jq = this.playerWin.jQuery;
                const _ajax = jq.ajax;
                const _setItem = this.playerWin.localStorage.setItem;

                if (!this.fallbackFormatName) this.lockFormat(clickableFormat);
                let self = this;
                jq.ajax = function (a, c) {
                    if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined; }                    if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                        resolve(self.cid = a.url.match(/cid=\d+/)[0].slice(4));
                        let _success = a.success;
                        _success({});
                        a.success = res => {
                            if (!this.fallbackFormatName) self.resolveFormat(res, clickableFormat);
                        };
                        jq.ajax = _ajax;
                    }
                    return _ajax.call(jq, a, c);
                };
                this.playerWin.localStorage.setItem = () => this.playerWin.localStorage.setItem = _setItem;
                this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(clickableFormat)}"]`).click();
            });

            // 2. options
            const bilibili_player_settings = this.playerWin.localStorage.bilibili_player_settings && JSON.parse(this.playerWin.localStorage.bilibili_player_settings);

            // 2.1 blocker
            let danmaku = await BiliMonkey.fetchDanmaku(this.cid);
            if (bilibili_player_settings && this.blocker) {
                const i = bilibili_player_settings.block.list.map(e => e.v).join('|');
                if (i) {
                    const regexp = new RegExp(i);
                    danmaku = danmaku.filter(e => !regexp.test(e.text));
                }
            }

            // 2.2 font
            const option = bilibili_player_settings && this.font && {
                'fontFamily': bilibili_player_settings.setting_config['fontfamily'] != 'custom' ? bilibili_player_settings.setting_config['fontfamily'].split(/, ?/) : bilibili_player_settings.setting_config['fontfamilycustom'].split(/, ?/),
                'fontSize': parseFloat(bilibili_player_settings.setting_config['fontsize']),
                'textOpacity': parseFloat(bilibili_player_settings.setting_config['opacity']),
                'bold': bilibili_player_settings.setting_config['bold'] ? 1 : 0,
            } || undefined;

            // 3. generate
            resolve(this.ass = top.URL.createObjectURL(await new ASSConverter(option).genASSBlob(
                danmaku, top.document.title, top.location.href
            )));
        });
        return this.ass;
    }

    async queryInfo(format) {
        return this.queryInfoMutex.lockAndAwait(async () => {
            switch (format) {
                case 'video':
                    if (this.flvs)
                        return this.flvs;

                    const api_url = `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&otype=json&qn=116`;

                    let re = await fetch(api_url, { credentials: 'include' });

                    let data = (await re.json()).data;
                    // console.log(data)
                    let durls = data.durl;

                    if (!durls) {
                        durls = JSON.parse(
                            window.Gc.split("\n").filter(
                                x => x.startsWith("{")
                            )[0]
                        ).Y.segments;
                    }

                    let flvs = durls.map(url_obj => url_obj.url.replace("http://", "https://"));

                    this.flvs = flvs;

                    return durls
                case 'ass':
                    if (this.ass)
                        return this.ass;
                    else
                        return this.getASS(this.flvFormatName);
                default:
                    throw `Bilimonkey: What is format ${format}?`;
            }
        });
    }

    async hangPlayer() {
        const fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': '' }] };
        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;
        const _setItem = this.playerWin.localStorage.setItem;

        return this.queryInfoMutex.lockAndAwait(() => new Promise(async resolve => {
            let blockerTimeout;
            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined; }                if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?') || a.url.includes('api.bilibili.com/x/player/playurl?')) {
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
                .find(e => !e.getAttribute('data-selected') && !e.classList.contains("bui-select-item-active") && e.children.length == 2);
            button.click();
        }));
    }

    async loadFLVFromCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0];
        let item = await this.cache.getData(name);
        if (!item) return;
        return this.flvsBlob[index] = item.data;
    }

    async loadPartialFLVFromCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0];
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
        let name = this.flvs[index].split("/").pop().split("?")[0];
        return this.cache.addData({ name, data: blob });
    }

    async savePartialFLVToCache(index, blob) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0];
        name = 'PC_' + name;
        return this.cache.putData({ name, data: blob });
    }

    async cleanPartialFLVInCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0];
        name = 'PC_' + name;
        return this.cache.deleteData(name);
    }

    async getFLV(index, progressHandler) {
        if (this.flvsBlob[index]) return this.flvsBlob[index];

        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        this.flvsBlob[index] = (async () => {
            let cache = await this.loadFLVFromCache(index);
            if (cache) return this.flvsBlob[index] = cache;
            let partialFLVFromCache = await this.loadPartialFLVFromCache(index);

            let burl = this.flvs[index];
            if (partialFLVFromCache) burl += `&bstart=${partialFLVFromCache.size}`;
            let opt = {
                fetch: this.playerWin.fetch,
                method: 'GET',
                mode: 'cors',
                cache: 'default',
                referrerPolicy: 'no-referrer-when-downgrade',
                cacheLoaded: partialFLVFromCache ? partialFLVFromCache.size : 0,
                headers: partialFLVFromCache && (!burl.includes('wsTime')) ? { Range: `bytes=${partialFLVFromCache.size}-` } : undefined
            };
            opt.onprogress = progressHandler;
            opt.onerror = opt.onabort = ({ target, type }) => {
                let partialFLV = target.getPartialBlob();
                if (partialFLVFromCache) partialFLV = new Blob([partialFLVFromCache, partialFLV]);
                this.savePartialFLVToCache(index, partialFLV);
            };

            let fch = new DetailedFetchBlob(burl, opt);
            this.flvsDetailedFetch[index] = fch;
            let fullFLV = await fch.getBlob();
            this.flvsDetailedFetch[index] = undefined;
            if (partialFLVFromCache) {
                fullFLV = new Blob([partialFLVFromCache, fullFLV]);
                this.cleanPartialFLVInCache(index);
            }
            this.saveFLVToCache(index, fullFLV);
            return (this.flvsBlob[index] = fullFLV);
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

        let ret = [];
        for (let flv of this.flvs) {
            let name = flv.split("/").pop().split("?")[0];
            ret.push(await this.cache.deleteData(name));
            ret.push(await this.cache.deleteData('PC_' + name));
        }

        return ret;
    }

    async setupProxy(res, onsuccess) {
        if (!this.setupProxy._fetch) {
            const _fetch = this.setupProxy._fetch = this.playerWin.fetch;
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
            };
            this.destroy.addCallback(() => this.playerWin.fetch = _fetch);
        }

        await this.loadAllFLVFromCache();
        let resProxy = Object.assign({}, res);
        for (let i = 0; i < this.flvsBlob.length; i++) {
            if (this.flvsBlob[i]) resProxy.durl[i].url = this.playerWin.URL.createObjectURL(this.flvsBlob[i]);
        }
        return onsuccess(resProxy);
    }

    static async fetchDanmaku(cid) {
        return ASSConverter.parseXML(
            await new Promise((resolve, reject) => {
                const e = new XMLHttpRequest();
                e.onload = () => resolve(e.responseText);
                e.onerror = reject;
                e.open('get', `https://comment.bilibili.com/${cid}.xml`);
                e.send();
            })
        );
    }

    static async getAllPageDefaultFormats(playerWin = top) {
        const jq = playerWin.jQuery;
        const _ajax = jq.ajax;

        // 1. mutex => you must send requests one by one
        const queryInfoMutex = new Mutex();

        // 2. bilibili has a misconfigured lazy loading => keep trying
        const list = await new Promise(resolve => {
            const i = setInterval(() => {
                const ret = playerWin.player.getPlaylist();
                if (ret) {
                    clearInterval(i);
                    resolve(ret);
                }
            }, 500);
        });

        // 3. build {cid: information} dict
        const index = list.reduce((acc, cur) => { acc[cur.cid] = cur; return acc }, {});

        // 4. find where to stop
        const end = list[list.length - 1].cid.toString();

        // 5. collect information
        const ret = [];
        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined; }            if (a.url.includes('comment.bilibili.com') || a.url.includes('interface.bilibili.com/player?') || a.url.includes('api.bilibili.com/x/player/playurl/token')) return _ajax.call(jq, a, c);
            if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                (async () => {
                    // 5.1 suppress success handler
                    a.success = undefined;

                    // 5.2 find cid
                    const cid = a.url.match(/cid=\d+/)[0].slice(4);

                    // 5.3 grab information
                    const [danmuku, res] = await Promise.all([
                        // 5.3.1 grab danmuku
                        (async () => top.URL.createObjectURL(await new ASSConverter().genASSBlob(
                            await BiliMonkey.fetchDanmaku(cid), top.document.title, top.location.href
                        )))(),

                        // 5.3.2 grab download res
                        _ajax.call(jq, a, c)
                    ]);

                    // 5.4 save information
                    ret.push({
                        durl: res.durl.map(({ url }) => url.replace('http:', playerWin.location.protocol)),
                        danmuku,
                        name: index[cid].part || index[cid].index,
                        outputName: res.durl[0].url.match(/\d+-\d+(?:\d|-|hd)*(?=\.flv)/) ?
                            /***
                             * see #28
                             * Firefox lookbehind assertion not implemented https://bugzilla.mozilla.org/show_bug.cgi?id=1225665
                             * try replace /-\d+(?=(?:\d|-|hd)*\.flv)/ => /(?<=\d+)-\d+(?=(?:\d|-|hd)*\.flv)/ in the future
                             */
                            res.durl[0].url.match(/\d+-\d+(?:\d|-|hd)*(?=\.flv)/)[0].replace(/-\d+(?=(?:\d|-|hd)*\.flv)/, '')
                            : res.durl[0].url.match(/\d(?:\d|-|hd)*(?=\.mp4)/) ?
                                res.durl[0].url.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0]
                                : cid,
                        cid,
                        res,
                    });

                    // 5.5 finish job
                    queryInfoMutex.unlock();
                })();
            }
            return _ajax.call(jq, { url: '//0.0.0.0' });
        };

        // 6.1 from the first page
        await queryInfoMutex.lock();
        playerWin.player.next(1);
        while (1) {
            // 6.2 to the last page
            await queryInfoMutex.lock();
            if (ret[ret.length - 1].cid == end) break;
            playerWin.player.next();
        }

        return ret;
    }

    static formatToValue(format) {
        if (format == 'does_not_exist') throw `formatToValue: cannot lookup does_not_exist`;
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
            'mp4': '16',
        };
        return BiliMonkey.formatToValue.dict[format] || null;
    }

    static valueToFormat(value) {
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
            '1': 'mp4',
        };
        return BiliMonkey.valueToFormat.dict[value] || null;
    }

    static get optionDescriptions() {
        return [
            // 1. cache
            ['cache', '关标签页不清缓存：保留完全下载好的分段到缓存，忘记另存为也没关系。'],
            ['partial', '断点续传：点击“取消”保留部分下载的分段到缓存，忘记点击会弹窗确认。'],
            ['proxy', '用缓存加速播放器：如果缓存里有完全下载好的分段，直接喂给网页播放器，不重新访问网络。小水管利器，播放只需500k流量。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。'],

            // 2. customizing
            ['blocker', '弹幕过滤：在网页播放器里设置的屏蔽词也对下载的弹幕生效。'],
            ['font', '自定义字体：在网页播放器里设置的字体、大小、加粗、透明度也对下载的弹幕生效。']
        ];
    }

    static get optionDefaults() {
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
        }
    }

    static _UNIT_TEST() {
        return (async () => {
            let playerWin = await BiliUserJS.getPlayerWin();
            window.m = new BiliMonkey(playerWin);

            console.warn('data race test');
            m.queryInfo('video');
            console.log(m.queryInfo('video'));

            //location.reload();
        })();
    }
}

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

class BiliPolyfill {
    /***
     * Assumption: aid, cid, pageno does not change during lifecycle
     * Create a new BiliPolyfill if assumption breaks
     */
    constructor(playerWin, option = BiliPolyfill.optionDefaults, hintInfo = () => { }) {
        this.playerWin = playerWin;
        this.option = option;
        this.hintInfo = hintInfo;

        this.video = null;

        this.series = [];
        this.userdata = { oped: {}, restore: {} };

        this.destroy = new HookedFunction();
        this.playerWin.addEventListener('beforeunload', this.destroy);
        this.destroy.addCallback(() => this.playerWin.removeEventListener('beforeunload', this.destroy));
    }

    saveUserdata() {
        this.option.setStorage('biliPolyfill', JSON.stringify(this.userdata));
    }

    retrieveUserdata() {
        try {
            this.userdata = this.option.getStorage('biliPolyfill');
            if (this.userdata.length > 1073741824) top.alert('BiliPolyfill脚本数据已经快满了，在播放器上右键->BiliPolyfill->片头片尾->检视数据，删掉一些吧。');
            this.userdata = JSON.parse(this.userdata);
        }
        catch (e) { }
        finally {
            if (!this.userdata) this.userdata = {};
            if (!(this.userdata.oped instanceof Object)) this.userdata.oped = {};
            if (!(this.userdata.restore instanceof Object)) this.userdata.restore = {};
        }
    }

    async setFunctions({ videoRefresh = false } = {}) {
        // 1. initialize
        this.video = await this.getPlayerVideo();

        // 2. if not enabled, run the process without real actions
        if (!this.option.betabeta) return this.getPlayerMenu();

        // 3. set up functions that are cid static
        if (!videoRefresh) {
            this.retrieveUserdata();
            if (this.option.badgeWatchLater) {
                await this.getWatchLaterBtn();
                this.badgeWatchLater();
            }
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
            this.destroy.addCallback(() => this.saveUserdata());
        }

        // 4. set up functions that are binded to the video DOM
        if (this.option.dblclick) this.dblclickFullScreen();
        if (this.option.electric) this.reallocateElectricPanel();
        if (this.option.oped) this.skipOPED();
        this.video.addEventListener('emptied', () => this.setFunctions({ videoRefresh: true }), { once: true });

        // 5. set up functions that require everything to be ready
        await this.getPlayerMenu();
        if (this.option.menuFocus) this.menuFocusOnPlayer();

        // 6. set up experimental functions
        if (this.option.speech) top.document.body.addEventListener('click', e => e.detail > 2 && this.speechRecognition());
    }

    async inferNextInSeries() {
        // 1. find current title
        const title = top.document.getElementsByTagName('h1')[0].textContent.replace(/\(\d+\)$/, '').trim();

        // 2. find current ep number
        const ep = title.match(/\d+(?=[^\d]*$)/);
        if (!ep) return this.series = [];

        // 3. current title - current ep number => series common title
        const seriesTitle = title.slice(0, title.lastIndexOf(ep)).trim();

        // 4. find sibling ep number
        const epNumber = parseInt(ep);
        const epSibling = ep[0] == '0' ?
            [(epNumber - 1).toString().padStart(ep.length, '0'), (epNumber + 1).toString().padStart(ep.length, '0')] :
            [(epNumber - 1).toString(), (epNumber + 1).toString()];

        // 5. build search keywords
        //    [self, seriesTitle + epSibling, epSibling]
        const keywords = [title, ...epSibling.map(e => seriesTitle + e), ...epSibling];

        // 6. find mid
        const midParent = top.document.getElementById('r-info-rank') || top.document.querySelector('.user');
        if (!midParent) return this.series = [];
        const mid = midParent.children[0].href.match(/\d+/)[0];

        // 7. fetch query
        const vlist = await Promise.all(keywords.map(keyword => new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.onload = () => resolve((req.response.status && req.response.data.vlist) || []);
            req.onerror = reject;
            req.open('get', `https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${mid}&keyword=${keyword}`);
            req.responseType = 'json';
            req.send();
        })));

        // 8. verify current video exists
        vlist[0] = vlist[0].filter(e => e.title == title);
        if (!vlist[0][0]) { console && console.warn('BiliPolyfill: inferNextInSeries: cannot find current video in mid space'); return this.series = []; }

        // 9. if seriesTitle + epSibling qurey has reasonable results => pick
        this.series = [vlist[1].find(e => e.created < vlist[0][0].created), vlist[2].reverse().find(e => e.created > vlist[0][0].created)];

        // 10. fallback: if epSibling qurey has reasonable results => pick
        if (!this.series[0]) this.series[0] = vlist[3].find(e => e.created < vlist[0][0].created);
        if (!this.series[1]) this.series[1] = vlist[4].reverse().find(e => e.created > vlist[0][0].created);

        return this.series;
    }

    badgeWatchLater() {
        // 1. find watchlater button
        const li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');
        if (!li) return;

        // 2. initialize watchlater panel
        const observer = new MutationObserver(() => {

            // 3. hide watchlater panel
            observer.disconnect();
            li.children[1].style.visibility = 'hidden';

            // 4. loading => wait
            if (li.children[1].children[0].children[0].className == 'm-w-loading') {
                const observer = new MutationObserver(() => {

                    // 5. clean up watchlater panel
                    observer.disconnect();
                    li.dispatchEvent(new Event('mouseleave'));
                    setTimeout(() => li.children[1].style.visibility = '', 700);

                    // 6.1 empty list => do nothing
                    if (li.children[1].children[0].children[0].className == 'no-data') return;

                    // 6.2 otherwise => append div
                    const div = top.document.createElement('div');
                    div.className = 'num';
                    if (li.children[1].children[0].children[0].children.length > 5) {
                        div.textContent = '5+';
                    }
                    else {
                        div.textContent = li.children[1].children[0].children[0].children.length;
                    }
                    li.children[0].append(div);
                    this.destroy.addCallback(() => div.remove());
                });
                observer.observe(li.children[1].children[0], { childList: true });
            }

            // 4.2 otherwise => error
            else {
                throw 'badgeWatchLater: cannot find m-w-loading panel';
            }
        });
        observer.observe(li, { childList: true });
        li.dispatchEvent(new Event('mouseenter'));
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
        const h = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-filter-btn-recommend');
        if (h) h.click();
    }

    getCoverImage() { // 番剧用原来的方法只能获取到番剧的封面，改用API可以获取到每集的封面
        const _jq = top.window.jQuery;
        const view_url = "https://api.bilibili.com/x/web-interface/view?aid=" + aid;

        try {
            let view_res = _jq.ajax({ url: view_url, async: false });
            let view_json = JSON.parse(view_res.responseText);
            return view_json.data.pic.replace("http://", "https://")
        }
        catch (e) {
            return null
        }
    }

    reallocateElectricPanel() {
        // 1. autopart == wait => ok
        if (!this.playerWin.localStorage.bilibili_player_settings) return;
        if (!this.playerWin.localStorage.bilibili_player_settings.includes('"autopart":1') && !this.option.electricSkippable) return;

        // 2. wait for electric panel
        this.video.addEventListener('ended', () => {
            setTimeout(() => {
                // 3. click skip
                const electricPanel = this.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0];
                if (!electricPanel) return;
                electricPanel.children[2].click();

                // 4. but display a fake electric panel
                electricPanel.style.display = 'block';
                electricPanel.style.zIndex = 233;

                // 5. and perform a fake countdown
                let countdown = 5;
                const h = setInterval(() => {
                    // 5.1 yield to next part hint
                    if (this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) electricPanel.style.zIndex = '';

                    // 5.2 countdown > 0 => update textContent
                    if (countdown > 0) {
                        electricPanel.children[2].children[0].textContent = `0${countdown}`;
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
    restorePreventShade() {
        // 1. restore option should be an array
        if (!Array.isArray(this.userdata.restore.preventShade)) this.userdata.restore.preventShade = [];

        // 2. find corresponding option index
        const index = top.location.href.includes('bangumi') ? 0 : 1;

        // 3. MUST initialize setting panel before click
        let danmaku_btn = this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0];
        if (!danmaku_btn) return;
        danmaku_btn.dispatchEvent(new Event('mouseover'));

        // 4. restore if true
        const input = this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0];
        if (this.userdata.restore.preventShade[index] && !input.nextElementSibling.classList.contains('bpui-state-active')) {
            input.click();
        }

        // 5. clean up setting panel
        this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseout'));

        // 6. memorize option
        this.destroy.addCallback(() => {
            this.userdata.restore.preventShade[index] = input.nextElementSibling.classList.contains('bpui-state-active');
        });
    }

    restoreDanmukuSwitch() {
        // 1. restore option should be an array
        if (!Array.isArray(this.userdata.restore.danmukuSwitch)) this.userdata.restore.danmukuSwitch = [];
        if (!Array.isArray(this.userdata.restore.danmukuTopSwitch)) this.userdata.restore.danmukuTopSwitch = [];
        if (!Array.isArray(this.userdata.restore.danmukuBottomSwitch)) this.userdata.restore.danmukuBottomSwitch = [];
        if (!Array.isArray(this.userdata.restore.danmukuScrollSwitch)) this.userdata.restore.danmukuScrollSwitch = [];

        // 2. find corresponding option index
        const index = top.location.href.includes('bangumi') ? 0 : 1;

        // 3. MUST initialize setting panel before click
        let danmaku_btn = this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0];
        if (!danmaku_btn) return;
        danmaku_btn.dispatchEvent(new Event('mouseover'));

        // 4. restore if true
        // 4.1 danmukuSwitch
        const danmukuSwitchDiv = this.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0];
        if (this.userdata.restore.danmukuSwitch[index] && !danmukuSwitchDiv.classList.contains('video-state-danmaku-off')) {
            danmukuSwitchDiv.click();
        }

        // 4.2 danmukuTopSwitch danmukuBottomSwitch danmukuScrollSwitch
        const [danmukuTopSwitchDiv, danmukuBottomSwitchDiv, danmukuScrollSwitchDiv] = this.playerWin.document.getElementsByClassName('bilibili-player-danmaku-setting-lite-type-list')[0].children;
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
        this.destroy.addCallback(() => {
            this.userdata.restore.danmukuSwitch[index] = danmukuSwitchDiv.classList.contains('video-state-danmaku-off');
            this.userdata.restore.danmukuTopSwitch[index] = danmukuTopSwitchDiv.classList.contains('disabled');
            this.userdata.restore.danmukuBottomSwitch[index] = danmukuBottomSwitchDiv.classList.contains('disabled');
            this.userdata.restore.danmukuScrollSwitch[index] = danmukuScrollSwitchDiv.classList.contains('disabled');
        });
    }

    restoreSpeed() {
        // 1. restore option should be an array
        if (!Array.isArray(this.userdata.restore.speed)) this.userdata.restore.speed = [];

        // 2. find corresponding option index
        const index = top.location.href.includes('bangumi') ? 0 : 1;

        // 3. restore if different
        if (this.userdata.restore.speed[index] && this.userdata.restore.speed[index] != this.video.playbackRate) {
            this.video.playbackRate = this.userdata.restore.speed[index];
        }

        // 4. memorize option
        this.destroy.addCallback(() => {
            this.userdata.restore.speed[index] = this.video.playbackRate;
        });
    }

    restoreWideScreen() {
        // 1. restore option should be an array
        if (!Array.isArray(this.userdata.restore.wideScreen)) this.userdata.restore.wideScreen = [];

        // 2. find corresponding option index
        const index = top.location.href.includes('bangumi') ? 0 : 1;

        // 3. restore if different
        const i = this.playerWin.document.getElementsByClassName('bilibili-player-iconfont-widescreen')[0];
        if (this.userdata.restore.wideScreen[index] && !i.classList.contains('icon-24wideon')) {
            i.click();
        }

        // 4. memorize option
        this.destroy.addCallback(() => {
            this.userdata.restore.wideScreen[index] = i.classList.contains('icon-24wideon');
        });
    }

    loadOffineSubtitles() {
        // NO. NOBODY WILL NEED THIS。
        // Hint: https://github.com/jamiees2/ass-to-vtt
        throw 'Not implemented';
    }

    autoResume() {
        // 1. wait for canplay => wait for resume popup
        const h = () => {
            // 2. parse resume popup
            const span = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
            if (!span) return;
            const [min, sec] = span.textContent.split(':');
            if (!min || !sec) return;

            // 3. parse last playback progress
            const time = parseInt(min) * 60 + parseInt(sec);

            // 3.1 still far from end => reasonable to resume => click
            if (time < this.video.duration - 10) {
                // 3.1.1 already playing => no need to pause => simply jump
                if (!this.video.paused || this.video.autoplay) {
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                }

                // 3.1.2 paused => should remain paused after jump => hook video.play
                else {
                    const play = this.video.play;
                    this.video.play = () => setTimeout(() => {
                        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        this.video.play = play;
                    }, 0);
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                }
            }

            // 3.2 near end => silent popup
            else {
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-close').click();
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom').children[0].style.visibility = 'hidden';
            }
        };
        this.video.addEventListener('canplay', h, { once: true });
        setTimeout(() => this.video && this.video.removeEventListener && this.video.removeEventListener('canplay', h), 3000);
    }

    autoPlay() {
        this.video.autoplay = true;
        setTimeout(() => {
            if (this.video.paused) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
        }, 0);
    }

    autoFullScreen() {
        if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off'))
            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
    }

    getCollectionId() {
        return (top.location.pathname.match(/av\d+/) || top.location.hash.match(/av\d+/) || top.document.querySelector('div.bangumi-info a').href).toString();
    }

    markOPEDPosition(index) {
        const collectionId = this.getCollectionId();
        if (!Array.isArray(this.userdata.oped[collectionId])) this.userdata.oped[collectionId] = [];
        this.userdata.oped[collectionId][index] = this.video.currentTime;
    }

    clearOPEDPosition() {
        const collectionId = this.getCollectionId();
        this.userdata.oped[collectionId] = undefined;
    }

    skipOPED() {
        // 1. find corresponding userdata
        const collectionId = this.getCollectionId();
        if (!Array.isArray(this.userdata.oped[collectionId]) || !this.userdata.oped[collectionId].length) return;

        /**
         * structure:
         *   listen for time update -> || <- skip -> || <- remove event listenner
         */

        // 2. | 0 <- opening -> oped[collectionId][1] | <- play --
        if (!this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
            const h = () => {
                if (this.video.currentTime >= this.userdata.oped[collectionId][1] - 1) {
                    this.video.removeEventListener('timeupdate', h);
                }
                else {
                    this.video.currentTime = this.userdata.oped[collectionId][1];
                    this.hintInfo('BiliPolyfill: 已跳过片头');
                }
            };
            this.video.addEventListener('timeupdate', h);
        }

        // 3. | <- play -> | oped[collectionId][0] <- opening -> oped[collectionId][1] | <- play --
        if (this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
            const h = () => {
                if (this.video.currentTime >= this.userdata.oped[collectionId][1] - 1) {
                    this.video.removeEventListener('timeupdate', h);
                }
                else if (this.video.currentTime > this.userdata.oped[collectionId][0]) {
                    this.video.currentTime = this.userdata.oped[collectionId][1];
                    this.hintInfo('BiliPolyfill: 已跳过片头');
                }
            };
            this.video.addEventListener('timeupdate', h);
        }

        // 4. -- play -> | oped[collectionId][2] <- ending -> end |
        if (this.userdata.oped[collectionId][2] && !this.userdata.oped[collectionId][3]) {
            const h = () => {
                if (this.video.currentTime >= this.video.duration - 1) {
                    this.video.removeEventListener('timeupdate', h);
                }
                else if (this.video.currentTime > this.userdata.oped[collectionId][2]) {
                    this.video.currentTime = this.video.duration;
                    this.hintInfo('BiliPolyfill: 已跳过片尾');
                }
            };
            this.video.addEventListener('timeupdate', h);
        }

        // 5.-- play -> | oped[collectionId][2] <- ending -> oped[collectionId][3] | <- play -> end |
        if (this.userdata.oped[collectionId][2] && this.userdata.oped[collectionId][3]) {
            const h = () => {
                if (this.video.currentTime >= this.userdata.oped[collectionId][3] - 1) {
                    this.video.removeEventListener('timeupdate', h);
                }
                else if (this.video.currentTime > this.userdata.oped[collectionId][2]) {
                    this.video.currentTime = this.userdata.oped[collectionId][3];
                    this.hintInfo('BiliPolyfill: 已跳过片尾');
                }
            };
            this.video.addEventListener('timeupdate', h);
        }
    }

    setVideoSpeed(speed) {
        if (speed < 0 || speed > 10) return;
        this.video.playbackRate = speed;
    }

    focusOnPlayer() {
        let player = this.playerWin.document.getElementsByClassName('bilibili-player-video-progress')[0];
        if (player) player.click();
    }

    menuFocusOnPlayer() {
        this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0].addEventListener('click', () =>
            setTimeout(() => this.focusOnPlayer(), 0)
        );
    }

    limitedKeydownFullScreenPlay() {
        // 1. listen for any user guesture
        const h = e => {
            // 2. not real user guesture => do nothing
            if (!e.isTrusted) return;

            // 3. key down is Enter => full screen play
            if (e.key == 'Enter') {
                // 3.1 full screen
                if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                }

                // 3.2 play
                if (this.video.paused) {
                    if (this.video.readyState) {
                        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                    }
                    else {
                        this.video.addEventListener('canplay', () => {
                            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
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

    speechRecognition() {
        // 1. polyfill
        const SpeechRecognition = top.SpeechRecognition || top.webkitSpeechRecognition;
        const SpeechGrammarList = top.SpeechGrammarList || top.webkitSpeechGrammarList;

        // 2. give hint
        alert('Yahaha! You found me!\nBiliTwin支持的语音命令: 播放 暂停 全屏 关闭 加速 减速 下一集\nChrome may support Cantonese or Hakka as well. See BiliPolyfill::speechRecognition.');
        if (!SpeechRecognition || !SpeechGrammarList) alert('浏览器太旧啦~彩蛋没法运行~');

        // 3. setup recognition
        const player = ['播放', '暂停', '全屏', '关闭', '加速', '减速', '下一集'];
        const grammar = '#JSGF V1.0; grammar player; public <player> = ' + player.join(' | ') + ' ;';
        const recognition = new SpeechRecognition();
        const speechRecognitionList = new SpeechGrammarList();
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
            const last = e.results.length - 1;
            const transcript = e.results[last][0].transcript;
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
        // 1. check param
        if (!option) throw 'usage: substitudeFullscreenPlayer({cid, aid[, p][, ...otherOptions]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) throw 'player init: aid missing';

        // 2. hook exitFullscreen
        const playerDoc = this.playerWin.document;
        const hook = [playerDoc.webkitExitFullscreen, playerDoc.mozExitFullScreen, playerDoc.msExitFullscreen, playerDoc.exitFullscreen];
        playerDoc.webkitExitFullscreen = playerDoc.mozExitFullScreen = playerDoc.msExitFullscreen = playerDoc.exitFullscreen = () => { };

        // 3. substitude player
        this.playerWin.player.destroy();
        this.playerWin.player = new bilibiliPlayer(option);
        if (option.p) this.playerWin.callAppointPart(option.p);

        // 4. restore exitFullscreen
        [playerDoc.webkitExitFullscreen, playerDoc.mozExitFullScreen, playerDoc.msExitFullscreen, playerDoc.exitFullscreen] = hook;
    }

    async getPlayerVideo() {
        if (this.playerWin.document.getElementsByTagName('video').length) {
            return this.video = this.playerWin.document.getElementsByTagName('video')[0];
        }
        else {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
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
                const observer = new MutationObserver(() => {
                    if (this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                        observer.disconnect();
                        resolve(this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    async getWatchLaterBtn() {
        let li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');

        if (!li) {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');
                    if (li) {
                        observer.disconnect();
                        resolve(li);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    static async openMinimizedPlayer(option = { cid: top.cid, aid: top.aid, playerWin: top }) {
        // 1. check param
        if (!option) throw 'usage: openMinimizedPlayer({cid[, aid]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) option.aid = top.aid;
        if (!option.playerWin) option.playerWin = top;

        // 2. open a new window
        const miniPlayerWin = top.open(`//www.bilibili.com/blackboard/html5player.html?cid=${option.cid}&aid=${option.aid}&crossDomain=${top.document.domain != 'www.bilibili.com' ? 'true' : ''}`, undefined, ' ');

        // 3. bangumi => request referrer must match => hook response of current page
        const res = top.location.href.includes('bangumi') && await new Promise(resolve => {
            const jq = option.playerWin.jQuery;
            const _ajax = jq.ajax;

            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined; }                if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    a.success = resolve;
                    jq.ajax = _ajax;
                }
                return _ajax.call(jq, a, c);
            };
            option.playerWin.player.reloadAccess();
        });

        // 4. wait for miniPlayerWin load
        await new Promise(resolve => {
            // 4.1 check for every500ms
            const i = setInterval(() => miniPlayerWin.document.getElementById('bilibiliPlayer') && resolve(), 500);

            // 4.2 explict event listener
            miniPlayerWin.addEventListener('load', resolve, { once: true });

            // 4.3 timeout after 6s
            setTimeout(() => {
                clearInterval(i);
                miniPlayerWin.removeEventListener('load', resolve);
                resolve();
            }, 6000);
        });
        // 4.4 cannot find bilibiliPlayer => load timeout
        const playerDiv = miniPlayerWin.document.getElementById('bilibiliPlayer');
        if (!playerDiv) { console.warn('openMinimizedPlayer: document load timeout'); return; }

        // 5. need to inject response => new bilibiliPlayer
        if (res) {
            await new Promise(resolve => {
                const jq = miniPlayerWin.jQuery;
                const _ajax = jq.ajax;

                jq.ajax = function (a, c) {
                    if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined; }                    if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                        a.success(res);
                        jq.ajax = _ajax;
                        resolve();
                    }
                    else {
                        return _ajax.call(jq, a, c);
                    }
                };
                miniPlayerWin.player = new miniPlayerWin.bilibiliPlayer({ cid: option.cid, aid: option.aid });
                // miniPlayerWin.eval(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
                // console.log(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
            });
        }

        // 6.  wait for bilibiliPlayer load
        await new Promise(resolve => {
            if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) resolve();
            else {
                const observer = new MutationObserver(() => {
                    if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) {
                        observer.disconnect();
                        resolve();
                    }
                });
                observer.observe(playerDiv, { childList: true });
            }
        });

        // 7. adopt full screen player style withour really trigger full screen
        // 7.1 hook requestFullscreen
        const hook = [playerDiv.webkitRequestFullscreen, playerDiv.mozRequestFullScreen, playerDiv.msRequestFullscreen, playerDiv.requestFullscreen];
        playerDiv.webkitRequestFullscreen = playerDiv.mozRequestFullScreen = playerDiv.msRequestFullscreen = playerDiv.requestFullscreen = () => { };

        // 7.2 adopt full screen player style
        if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off'))
            miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();

        // 7.3 restore requestFullscreen
        [playerDiv.webkitRequestFullscreen, playerDiv.mozRequestFullScreen, playerDiv.msRequestFullscreen, playerDiv.requestFullscreen] = hook;
    }

    static secondToReadable(s) {
        if (s > 60) return `${parseInt(s / 60)}分${parseInt(s % 60)}秒`;
        else return `${parseInt(s % 60)}秒`;
    }

    static clearAllUserdata(playerWin = top) {
        if (playerWin.GM_setValue) return GM_setValue('biliPolyfill', '');
        if (playerWin.GM.setValue) return GM.setValue('biliPolyfill', '');
        playerWin.localStorage.removeItem('biliPolyfill');
    }

    static get optionDescriptions() {
        return [
            ['betabeta', '增强组件总开关 <---------更加懒得测试了，反正以后B站也会自己提供这些功能。也许吧。'],

            // 1. user interface
            ['badgeWatchLater', '稍后再看添加数字角标'],
            ['recommend', '弹幕列表换成相关视频'],
            ['electric', '整合充电榜与换P倒计时'],
            ['electricSkippable', '跳过充电榜', 'disabled'],

            // 2. automation
            ['scroll', '自动滚动到播放器'],
            ['focus', '自动聚焦到播放器(新页面直接按空格会播放而不是向下滚动)'],
            ['menuFocus', '关闭菜单后聚焦到播放器'],
            ['restorePrevent', '记住防挡字幕'],
            ['restoreDanmuku', '记住弹幕开关(顶端/底端/滚动/全部)'],
            ['restoreSpeed', '记住播放速度'],
            ['restoreWide', '记住宽屏'],
            ['autoResume', '自动跳转上次看到'],
            ['autoPlay', '自动播放'],
            ['autoFullScreen', '自动全屏'],
            ['oped', '标记后自动跳OP/ED'],
            ['series', '尝试自动找上下集'],

            // 3. interaction
            ['limitedKeydown', '首次回车键可全屏自动播放'],
            ['dblclick', '双击全屏'],

            // 4. easter eggs
            ['speech', '(彩蛋)(需墙外)任意三击鼠标左键开启语音识别'],
        ];
    }

    static get optionDefaults() {
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
            speech: false,
        }
    }

    static _UNIT_TEST() {
        console.warn('This test is impossible.');
        console.warn('You need to close the tab, reopen it, etc.');
        console.warn('Maybe you also want to test between bideo parts, etc.');
        console.warn('I am too lazy to find workarounds.');
    }
}

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class Exporter {
    static exportIDM(urls, referrer = top.location.origin) {
        return urls.map(url => `<\r\n${url}\r\nreferer: ${referrer}\r\n>\r\n`).join('');
    }

    static exportM3U8(urls, referrer = top.location.origin, userAgent = top.navigator.userAgent) {
        return '#EXTM3U\n' + urls.map(url => `#EXTVLCOPT:http-referrer=${referrer}\n#EXTVLCOPT:http-user-agent=${userAgent}\n#EXTINF:-1\n${url}\n`).join('');
    }

    static exportAria2(urls, referrer = top.location.origin) {
        return urls.map(url => `${url}\r\n  referer=${referrer}\r\n`).join('');
    }

    static async sendToAria2RPC(urls, referrer = top.location.origin, target = 'http://127.0.0.1:6800/jsonrpc') {
        // 1. prepare body
        const h = 'referer';
        const body = JSON.stringify(urls.map((url, id) => ({
            id,
            jsonrpc: 2,
            method: "aria2.addUri",
            params: [
                [url],
                { [h]: referrer }
            ]
        })));

        // 2. send to jsonrpc target
        const method = 'POST';
        while (1) {
            try {
                return await (await fetch(target, { method, body })).json();
            }
            catch (e) {
                target = top.prompt('Aria2 connection failed. Please provide a valid server address:', target);
                if (!target) return null;
            }
        }
    }

    static copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.value = text;
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class TwentyFourDataView extends DataView {
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

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

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
        let ret = [];
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

            let modifiedMediaTags = [];
            for (let tag of flv.tags) {
                if (tag.tagType == 0x12 && !foundDuration) {
                    duration += tag.getDuration();
                    foundDuration = 1;
                    if (blob == blobs[0]) {
                        ret.push(flv.header, flv.firstPreviousTagSize);
                        ({ duration, durationDataView } = tag.getDurationAndView());
                        tag.stripKeyframesScriptData();
                        ret.push(tag.tagHeader);
                        ret.push(tag.tagData);
                        ret.push(tag.previousSize);
                    }
                }
                else if (tag.tagType == 0x08 || tag.tagType == 0x09) {
                    lasttimestamp[tag.tagType - 0x08] = bts + tag.getCombinedTimestamp();
                    tag.setCombinedTimestamp(lasttimestamp[tag.tagType - 0x08]);
                    modifiedMediaTags.push(tag.tagHeader, tag.tagData, tag.previousSize);
                }
            }
            ret.push(new Blob(modifiedMediaTags));
        }
        durationDataView.setFloat64(0, duration);

        return new Blob(ret);
    }
}

var embeddedHTML = `<html>

<body>
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
    <footer>
        author qli5 &lt;goodlq11[at](163|gmail).com&gt;
    </footer>
    <script>
var FLVASS2MKV = (function () {
    'use strict';

    /***
     * Copyright (C) 2018 Qli5. All Rights Reserved.
     * 
     * @author qli5 <goodlq11[at](163|gmail).com>
     * 
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at http://mozilla.org/MPL/2.0/.
    */

    const _navigator = typeof navigator === 'object' && navigator || { userAgent: 'chrome' };

    const _Blob = typeof Blob === 'function' && Blob || class {
        constructor(array) {
            return Buffer.concat(array.map(Buffer.from.bind(Buffer)));
        }
    };

    const _TextEncoder = typeof TextEncoder === 'function' && TextEncoder || class {
        /**
         * @param {string} chunk 
         * @returns {Uint8Array}
         */
        encode(chunk) {
            return Buffer.from(chunk, 'utf-8');
        }
    };

    const _TextDecoder = typeof TextDecoder === 'function' && TextDecoder || class extends require('string_decoder').StringDecoder {
        /**
         * @param {ArrayBuffer} chunk 
         * @returns {string}
         */
        decode(chunk) {
            return this.end(Buffer.from(chunk));
        }
    };

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
            }

            // workarounds for various browsers
            let userAgent = _navigator.userAgent.toLowerCase();

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
                        if (bitrate_index < this._mpegAudioL3BitRateTable.length) {
                            bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];
                        }
                        break;
                    case 2:  // Layer 2
                        if (bitrate_index < this._mpegAudioL2BitRateTable.length) {
                            bit_rate = this._mpegAudioL2BitRateTable[bitrate_index];
                        }
                        break;
                    case 3:  // Layer 1
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

    /***
     * Copyright (C) 2018 Qli5. All Rights Reserved.
     * 
     * @author qli5 <goodlq11[at](163|gmail).com>
     * 
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at http://mozilla.org/MPL/2.0/.
    */

    class ASS {
        /**
         * Extract sections from ass string
         * @param {string} str 
         * @returns {Object} - object from sections
         */
        static extractSections(str) {
            const regex = /^\\ufeff?\\[(.*)\\]\$/mg;
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
            const lines = str.split(/\\r\\n+/);
            if (lines[0] != '[Events]' && lines[0] != '[events]') throw new Error('ASSDemuxer: section is not [Events]');
            if (lines[1].indexOf('Format:') != 0 && lines[1].indexOf('format:') != 0) throw new Error('ASSDemuxer: cannot find Format definition in section [Events]');

            const format = lines[1].slice(lines[1].indexOf(':') + 1).split(',').map(e => e.trim());
            return lines.slice(2).map(e => {
                let j = {};
                e.replace(/[d|D]ialogue:\\s*/, '')
                    .match(new RegExp(new Array(format.length - 1).fill('(.*?),').join('') + '(.*)'))
                    .slice(1)
                    .forEach((k, index) => j[format[index]] = k);
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
            const str = typeof chunk == 'string' ? chunk : new _TextDecoder('utf-8').decode(chunk);
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
    }

    /** Detect free variable \`global\` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable \`self\`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Built-in value references. */
    var Symbol = root.Symbol;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [\`toStringTag\`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

    /**
     * A specialized version of \`baseGetTag\` which ignores \`Symbol.toStringTag\` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw \`toStringTag\`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto\$1 = Object.prototype;

    /**
     * Used to resolve the
     * [\`toStringTag\`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString\$1 = objectProto\$1.toString;

    /**
     * Converts \`value\` to a string using \`Object.prototype.toString\`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString\$1.call(value);
    }

    /** \`Object#toString\` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag\$1 = Symbol ? Symbol.toStringTag : undefined;

    /**
     * The base implementation of \`getTag\` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the \`toStringTag\`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag\$1 && symToStringTag\$1 in Object(value))
        ? getRawTag(value)
        : objectToString(value);
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
      return value != null && (type == 'object' || type == 'function');
    }

    /** \`Object#toString\` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

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
      if (!isObject(value)) {
        return false;
      }
      // The use of \`Object#toString\` avoids issues with the \`typeof\` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+\$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

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

    /** Used for built-in method references. */
    var funcProto = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /**
     * Converts \`func\` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Used to match \`RegExp\`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\\\^\$.*+?()[\\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\\[object .+?Constructor\\]\$/;

    /** Used for built-in method references. */
    var funcProto\$1 = Function.prototype,
        objectProto\$2 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString\$1 = funcProto\$1.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty\$1 = objectProto\$2.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString\$1.call(hasOwnProperty\$1).replace(reRegExpChar, '\\\\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, '\$1.*?') + '\$'
    );

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
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

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

    /* Built-in method references that are verified to be native. */
    var nativeCreate = getNative(Object, 'create');

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
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
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /** Used to stand-in for \`undefined\` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto\$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty\$2 = objectProto\$3.hasOwnProperty;

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
      return hasOwnProperty\$2.call(data, key) ? data[key] : undefined;
    }

    /** Used for built-in method references. */
    var objectProto\$4 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty\$3 = objectProto\$4.hasOwnProperty;

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
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty\$3.call(data, key);
    }

    /** Used to stand-in for \`undefined\` hash values. */
    var HASH_UNDEFINED\$1 = '__lodash_hash_undefined__';

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
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED\$1 : value;
      return this;
    }

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to \`Hash\`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

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

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

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
      --this.size;
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
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to \`ListCache\`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /* Built-in method references that are verified to be native. */
    var Map = getNative(root, 'Map');

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
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
     * Removes \`key\` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns \`true\` if the entry was removed, else \`false\`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
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
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to \`MapCache\`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

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
     * method interface of \`clear\`, \`delete\`, \`get\`, \`has\`, and \`set\`.
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
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache);
      return memoized;
    }

    // Expose \`MapCache\`.
    memoize.Cache = MapCache;

    const numberToByteArray = (num, byteLength = getNumberByteLength(num)) => {
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
        else if (num < 0xffffffff) {
            byteArray = new DataView(new ArrayBuffer(5));
            byteArray.setUint32(1, num);
        }
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
        return new Uint8Array(byteArray.buffer);
    };
    const stringToByteArray = memoize((str) => {
        return Uint8Array.from(Array.from(str).map(_ => _.codePointAt(0)));
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
    const int16Bit = memoize((num) => {
        const ab = new ArrayBuffer(2);
        new DataView(ab).setInt16(0, num);
        return new Uint8Array(ab);
    });
    const float32bit = memoize((num) => {
        const ab = new ArrayBuffer(4);
        new DataView(ab).setFloat32(0, num);
        return new Uint8Array(ab);
    });
    const dumpBytes = (b) => {
        return Array.from(new Uint8Array(b)).map(_ => \`0x\${_.toString(16)}\`).join(", ");
    };

    class Value {
        constructor(bytes) {
            this.bytes = bytes;
        }
        write(buf, pos) {
            buf.set(this.bytes, pos);
            return pos + this.bytes.length;
        }
        countSize() {
            return this.bytes.length;
        }
    }
    class Element {
        constructor(id, children, isSizeUnknown) {
            this.id = id;
            this.children = children;
            const bodySize = this.children.reduce((p, c) => p + c.countSize(), 0);
            this.sizeMetaData = isSizeUnknown ?
                UNKNOWN_SIZE :
                vintEncode(numberToByteArray(bodySize, getEBMLByteLength(bodySize)));
            this.size = this.id.length + this.sizeMetaData.length + bodySize;
        }
        write(buf, pos) {
            buf.set(this.id, pos);
            buf.set(this.sizeMetaData, pos + this.id.length);
            return this.children.reduce((p, c) => c.write(buf, p), pos + this.id.length + this.sizeMetaData.length);
        }
        countSize() {
            return this.size;
        }
    }
    const bytes = memoize((data) => {
        return new Value(data);
    });
    const number = memoize((num) => {
        return bytes(numberToByteArray(num));
    });
    const vintEncodedNumber = memoize((num) => {
        return bytes(vintEncode(numberToByteArray(num, getEBMLByteLength(num))));
    });
    const int16 = memoize((num) => {
        return bytes(int16Bit(num));
    });
    const float = memoize((num) => {
        return bytes(float32bit(num));
    });
    const string = memoize((str) => {
        return bytes(stringToByteArray(str));
    });
    const element = (id, child) => {
        return new Element(id, Array.isArray(child) ? child : [child], false);
    };
    const unknownSizeElement = (id, child) => {
        return new Element(id, Array.isArray(child) ? child : [child], true);
    };
    const build = (v) => {
        const b = new Uint8Array(v.countSize());
        v.write(b, 0);
        return b;
    };
    const getEBMLByteLength = (num) => {
        if (num < 0x7f) {
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
    const UNKNOWN_SIZE = new Uint8Array([0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    const vintEncode = (byteArray) => {
        byteArray[0] = getSizeMask(byteArray.length) | byteArray[0];
        return byteArray;
    };
    const getSizeMask = (byteLength) => {
        return 0x80 >> (byteLength - 1);
    };

    /**
     * @see https://www.matroska.org/technical/specs/index.html
     */
    const ID = {
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



    var EBML = /*#__PURE__*/Object.freeze({
        Value: Value,
        Element: Element,
        bytes: bytes,
        number: number,
        vintEncodedNumber: vintEncodedNumber,
        int16: int16,
        float: float,
        string: string,
        element: element,
        unknownSizeElement: unknownSizeElement,
        build: build,
        getEBMLByteLength: getEBMLByteLength,
        UNKNOWN_SIZE: UNKNOWN_SIZE,
        vintEncode: vintEncode,
        getSizeMask: getSizeMask,
        ID: ID,
        numberToByteArray: numberToByteArray,
        stringToByteArray: stringToByteArray,
        getNumberByteLength: getNumberByteLength,
        int16Bit: int16Bit,
        float32bit: float32bit,
        dumpBytes: dumpBytes
    });

    /***
     * The EMBL builder is from simple-ebml-builder
     * 
     * Copyright 2017 ryiwamoto
     * 
     * @author ryiwamoto, qli5
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

    /***
     * Copyright (C) 2018 Qli5. All Rights Reserved.
     * 
     * @author qli5 <goodlq11[at](163|gmail).com>
     * 
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at http://mozilla.org/MPL/2.0/.
    */

    class MKV {
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
            if (str.startsWith('avc1')) {
                return 'V_MPEG4/ISO/AVC';
            }
            else if (str.startsWith('mp4a')) {
                return 'A_AAC';
            }
            else {
                throw new Error(\`MKVRemuxer: unknown codec \${str}\`);
            }
        }

        static uint8ArrayConcat(...array) {
            // if (Array.isArray(array[0])) array = array[0];
            if (array.length == 1) return array[0];
            if (typeof Buffer != 'undefined') return Buffer.concat(array);
            const ret = new Uint8Array(array.reduce((i, j) => i + j.byteLength, 0));
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
                codecPrivate: new _TextEncoder().encode(ass.header)
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
                frame: new _TextEncoder().encode(\`\${i},\${e['Layer'] || ''},\${e['Style'] || ''},\${e['Name'] || ''},\${e['MarginL'] || ''},\${e['MarginR'] || ''},\${e['MarginV'] || ''},\${e['Effect'] || ''},\${e['Text'] || ''}\`),
                timestamp: MKV.textToMS(e['Start']),
                duration: MKV.textToMS(e['End']) - MKV.textToMS(e['Start']),
            })));
        }

        build() {
            return new _Blob([
                this.buildHeader(),
                this.buildBody()
            ]);
        }

        buildHeader() {
            return new _Blob([EBML.build(EBML.element(EBML.ID.EBML, [
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
                return new _Blob([EBML.build(EBML.element(EBML.ID.Segment, [
                    this.getSegmentInfo(),
                    this.getTracks(),
                    ...this.getClusterArray()
                ]))]);
            }
            else {
                return new _Blob([EBML.build(EBML.element(EBML.ID.Segment, [
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
    }

    /***
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
        async build(flv = './samples/gen_case.flv', ass = './samples/gen_case.ass') {
            // load flv and ass as arraybuffer
            await Promise.all([
                new Promise((r, j) => {
                    if (flv instanceof _Blob) {
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
                    if (ass instanceof _Blob) {
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
    if (typeof window == 'undefined') {
        if (require.main == module) {
            (async () => {
                const fs = require('fs');
                const assFileName = process.argv.slice(1).find(e => e.includes('.ass')) || './samples/gen_case.ass';
                const flvFileName = process.argv.slice(1).find(e => e.includes('.flv')) || './samples/gen_case.flv';
                const assFile = fs.readFileSync(assFileName).buffer;
                const flvFile = fs.readFileSync(flvFileName).buffer;
                fs.writeFileSync('out.mkv', await new FLVASS2MKV({ onmkvprogress: console.log.bind(console) }).build(flvFile, assFile));
            })();
        }
    }

    return FLVASS2MKV;

}());
//# sourceMappingURL=index.js.map

</script>
    <script>
        const fileProgress = document.getElementById('fileProgress');
        const mkvProgress = document.getElementById('mkvProgress');
        const a = document.getElementById('a');
        window.exec = async (option, target) => {
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
            target.download = a.download = a.textContent = option.name;
            console.time('file');
            const mkv = await new FLVASS2MKV(option).build(option.flv, option.ass);
            console.timeEnd('flvass2mkv');
            target.href = a.href = URL.createObjectURL(mkv);
            target.textContent = "另存为MKV"
            target.onclick = () => {
                window.close()
            }
            return a.href
        };
        
    </script>
</body>

</html>`;

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class MKVTransmuxer {
    constructor(option) {
        this.workerWin = null;
        this.option = option;
    }

    /**
     * FLV + ASS => MKV entry point
     * @param {Blob|string|ArrayBuffer} flv
     * @param {Blob|string|ArrayBuffer} ass 
     * @param {string=} name 
     */
    exec(flv, ass, name, target) {
        if (target.textContent != "另存为MKV") {
            target.textContent = "打包中";

            // 1. Allocate for a new window
            if (!this.workerWin) this.workerWin = top.open('', undefined, ' ');

            // 2. Inject scripts
            this.workerWin.document.write(embeddedHTML);
            this.workerWin.document.close();

            // 3. Invoke exec
            if (!(this.option instanceof Object)) this.option = null;
            this.workerWin.exec(Object.assign({}, this.option, { flv, ass, name }), target);
            URL.revokeObjectURL(flv);
            URL.revokeObjectURL(ass);

            // 4. Free parent window
            // if (top.confirm('MKV打包中……要关掉这个窗口，释放内存吗？')) {
            //     top.location = 'about:blank';
            // }
        }
    }
}

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class UI {
    constructor(twin, option = UI.optionDefaults) {
        this.twin = twin;
        this.option = option;

        this.destroy = new HookedFunction();
        this.dom = {};
        this.cidSessionDestroy = new HookedFunction();
        this.cidSessionDom = {};

        this.destroy.addCallback(this.cidSessionDestroy.bind(this));

        this.destroy.addCallback(() => {
            Object.values(this.dom).forEach(e => e.remove());
            this.dom = {};
        });
        this.cidSessionDestroy.addCallback(() => {
            Object.values(this.cidSessionDom).forEach(e => e.remove());
            this.cidSessionDom = {};
        });

        this.styleClearance();
    }

    styleClearance() {
        let ret = `
        .bilibili-player-context-menu-container.black ul.bilitwin li.context-menu-function > a:hover {
            background: rgba(255,255,255,.12);
            transition: all .3s ease-in-out;
            cursor: pointer;
        }

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
            -webkit-appearance: progress-bar;
            -moz-appearance: progress-bar;
            appearance: progress-bar;
        }

        .bilitwin input[type="checkbox" i] {
            -webkit-appearance: checkbox;
            -moz-appearance: checkbox;
            appearance: checkbox;
        }
        `;

        const style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = ret;
        document.head.append(style);

        return this.dom.style = style;
    }

    cidSessionRender() {
        this.buildTitle();

        if (this.option.title) this.appendTitle();
        if (this.option.menu) this.appendMenu();
    }

    // Title Append
    buildTitle(monkey = this.twin.monkey) {
        // 1. build flvA, mp4A, assA
        const fontSize = '15px';
        const flvA = document.createElement('a');
        flvA.style.fontSize = fontSize;
        flvA.textContent = '\u89C6\u9891FLV';
        const assA = document.createElement('a');

        // 1.1 build flvA
        assA.style.fontSize = fontSize;
        assA.textContent = '\u5F39\u5E55ASS';
        flvA.onmouseover = async () => {
            // 1.1.1 give processing hint
            flvA.textContent = '正在FLV';
            flvA.onmouseover = null;

            // 1.1.2 query flv
            const href = await monkey.queryInfo('video');
            if (href == 'does_not_exist') return flvA.textContent = '没有FLV视频';

            // 1.1.3 display flv
            flvA.textContent = '视频FLV';
            flvA.onclick = () => this.displayFLVDiv();
        };

        // 1.2 build assA
        assA.onmouseover = async () => {
            // 1.2.1 give processing hint
            assA.textContent = '正在ASS';
            assA.onmouseover = null;

            // 1.2.2 query flv
            assA.href = await monkey.queryInfo('ass');

            // 1.2.3 response mp4
            assA.textContent = '弹幕ASS';
            if (monkey.mp4 && monkey.mp4.match) {
                assA.download = monkey.mp4.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0] + '.ass';
            } else {
                assA.download = monkey.cid + '.ass';
            }
        };

        // 2. save to cache
        Object.assign(this.cidSessionDom, { flvA, assA });
        return this.cidSessionDom;
    }

    appendTitle({ flvA, assA } = this.cidSessionDom) {
        // 1. build div
        const div = document.createElement('div');

        // 2. append to title
        div.addEventListener('click', e => e.stopPropagation());
        div.className = 'bilitwin';
        div.append(...[flvA, ' ', assA]);
        const tminfo = document.querySelector('div.tminfo') || document.querySelector('div.info-second') || document.querySelector('div.video-data');
        tminfo.style.float = 'none';
        tminfo.after(div);

        // 3. save to cache
        this.cidSessionDom.titleDiv = div;

        return div;
    }

    buildFLVDiv(monkey = this.twin.monkey, flvs = monkey.flvs, cache = monkey.cache) {
        // 1. build video splits
        const flvTrs = flvs.map((href, index) => {
            const tr = document.createElement('tr');
            {
                const td1 = document.createElement('td');
                const a1 = document.createElement('a');
                a1.href = href;
                a1.download = aid + '-' + (index + 1) + '.flv';
                a1.textContent = `视频分段 ${index + 1}`;
                td1.append(a1);
                tr.append(td1);
                const td2 = document.createElement('td');
                const a2 = document.createElement('a');

                a2.onclick = e => this.downloadFLV({
                    monkey,
                    index,
                    a: e.target,
                    progress: tr.children[2].children[0]
                });

                a2.textContent = '\u7F13\u5B58\u672C\u6BB5';
                td2.append(a2);
                tr.append(td2);
                const td3 = document.createElement('td');
                const progress1 = document.createElement('progress');
                progress1.setAttribute('value', '0');
                progress1.setAttribute('max', '100');
                progress1.textContent = '\u8FDB\u5EA6\u6761';
                td3.append(progress1);
                tr.append(td3);
            }
            return tr;
        });

        // 2. build exporter a
        const exporterA = document.createElement('a');
        if (this.option.aria2) {
            exporterA.textContent = '导出Aria2';
            exporterA.download = 'bilitwin.session';
            exporterA.href = URL.createObjectURL(new Blob([Exporter.exportAria2(flvs, top.location.origin)]));
        } else if (this.option.aria2RPC) {
            exporterA.textContent = '发送Aria2 RPC';
            exporterA.onclick = () => Exporter.sendToAria2RPC(flvs, top.location.origin);
        } else if (this.option.m3u8) {
            exporterA.textContent = '导出m3u8';
            exporterA.download = 'bilitwin.m3u8';
            exporterA.href = URL.createObjectURL(new Blob([Exporter.exportM3U8(flvs, top.location.origin, top.navigator.userAgent)]));
        } else if (this.option.clipboard) {
            exporterA.textContent = '全部复制到剪贴板';
            exporterA.onclick = () => Exporter.copyToClipboard(flvs.join('\n'));
        } else {
            exporterA.textContent = '导出IDM';
            exporterA.download = 'bilitwin.ef2';
            exporterA.href = URL.createObjectURL(new Blob([Exporter.exportIDM(flvs, top.location.origin)]));
        }

        // 3. build body table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.lineHeight = '2em';
        table.append(...flvTrs, (() => {
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.append(...[exporterA]);
            tr1.append(td1);
            const td2 = document.createElement('td');
            const a1 = document.createElement('a');

            a1.onclick = e => this.downloadAllFLVs({
                a: e.target,
                monkey,
                table
            });

            a1.textContent = '\u7F13\u5B58\u5168\u90E8+\u81EA\u52A8\u5408\u5E76';
            td2.append(a1);
            tr1.append(td2);
            const td3 = document.createElement('td');
            const progress1 = document.createElement('progress');
            progress1.setAttribute('value', '0');
            progress1.setAttribute('max', flvs.length + 1);
            progress1.textContent = '\u8FDB\u5EA6\u6761';
            td3.append(progress1);
            tr1.append(td3);
            return tr1;
        })(), (() => {
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.colSpan = '3';
            td1.textContent = '\u5408\u5E76\u529F\u80FD\u63A8\u8350\u914D\u7F6E\uFF1A\u81F3\u5C118G RAM\u3002\u628A\u81EA\u5DF1\u4E0B\u8F7D\u7684\u5206\u6BB5FLV\u62D6\u52A8\u5230\u8FD9\u91CC\uFF0C\u4E5F\u53EF\u4EE5\u5408\u5E76\u54E6~';
            tr1.append(td1);
            return tr1;
        })(), cache ? (() => {
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.colSpan = '3';
            td1.textContent = '\u4E0B\u8F7D\u7684\u7F13\u5B58\u5206\u6BB5\u4F1A\u6682\u65F6\u505C\u7559\u5728\u7535\u8111\u91CC\uFF0C\u8FC7\u4E00\u6BB5\u65F6\u95F4\u4F1A\u81EA\u52A8\u6D88\u5931\u3002\u5EFA\u8BAE\u53EA\u5F00\u4E00\u4E2A\u6807\u7B7E\u9875\u3002';
            tr1.append(td1);
            return tr1;
        })() : (() => {
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.colSpan = '3';
            td1.textContent = '\u5EFA\u8BAE\u53EA\u5F00\u4E00\u4E2A\u6807\u7B7E\u9875\u3002\u5173\u6389\u6807\u7B7E\u9875\u540E\uFF0C\u7F13\u5B58\u5C31\u4F1A\u88AB\u6E05\u7406\u3002\u522B\u5FD8\u4E86\u53E6\u5B58\u4E3A\uFF01';
            tr1.append(td1);
            return tr1;
        })(), (() => {
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.colSpan = '3';
            this.displayQuota.bind(this)(td1);
            tr1.append(td1);
            return tr1;
        })());
        this.cidSessionDom.flvTable = table;

        // 4. build container dlv
        const div = UI.genDiv();
        div.ondragenter = div.ondragover = e => UI.allowDrag(e);
        div.ondrop = async e => {
            // 4.1 allow drag
            UI.allowDrag(e);

            // 4.2 sort files if possible
            const files = Array.from(e.dataTransfer.files);
            if (files.every(e => e.name.search(/\d+-\d+(?:\d|-|hd)*\.flv/) != -1)) {
                files.sort((a, b) => a.name.match(/\d+-(\d+)(?:\d|-|hd)*\.flv/)[1] - b.name.match(/\d+-(\d+)(?:\d|-|hd)*\.flv/)[1]);
            }

            // 4.3 give loaded files hint
            table.append(...files.map(e => {
                const tr1 = document.createElement('tr');
                const td1 = document.createElement('td');
                td1.colSpan = '3';
                td1.textContent = e.name;
                tr1.append(td1);
                return tr1;
            }));

            // 4.4 determine output name
            let outputName = files[0].name.match(/\d+-\d+(?:\d|-|hd)*\.flv/);
            if (outputName) outputName = outputName[0].replace(/-\d/, "");else outputName = 'merge_' + files[0].name;

            // 4.5 build output ui
            const href = await this.twin.mergeFLVFiles(files);
            table.append((() => {
                const tr1 = document.createElement('tr');
                const td1 = document.createElement('td');
                td1.colSpan = '3';
                const a1 = document.createElement('a');
                a1.href = href;
                a1.download = outputName;
                a1.textContent = outputName;
                td1.append(a1);
                tr1.append(td1);
                return tr1;
            })());
        };

        // 5. build util buttons
        div.append(table, (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = () => div.style.display = 'none';

            button.textContent = '\u5173\u95ED';
            return button;
        })(), (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = () => monkey.cleanAllFLVsInCache();

            button.textContent = '\u6E05\u7A7A\u8FD9\u4E2A\u89C6\u9891\u7684\u7F13\u5B58';
            return button;
        })(), (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = () => this.twin.clearCacheDB(cache);

            button.textContent = '\u6E05\u7A7A\u6240\u6709\u89C6\u9891\u7684\u7F13\u5B58';
            return button;
        })());

        // 6. cancel on destroy
        this.cidSessionDestroy.addCallback(() => {
            flvTrs.map(tr => {
                const a = tr.children[1].children[0];
                if (a.textContent == '取消') a.click();
            });
        });

        return this.cidSessionDom.flvDiv = div;
    }

    displayFLVDiv(flvDiv = this.cidSessionDom.flvDiv) {
        if (!flvDiv) {
            flvDiv = this.buildFLVDiv();
            document.body.append(flvDiv);
        }
        flvDiv.style.display = '';
        return flvDiv;
    }

    async downloadAllFLVs({ a, monkey = this.twin.monkey, table = this.cidSessionDom.flvTable }) {
        if (this.cidSessionDom.downloadAllTr) return;

        // 1. hang player
        monkey.hangPlayer();

        // 2. give hang player hint
        this.cidSessionDom.downloadAllTr = (() => {
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.colSpan = '3';
            td1.textContent = '\u5DF2\u5C4F\u853D\u7F51\u9875\u64AD\u653E\u5668\u7684\u7F51\u7EDC\u94FE\u63A5\u3002\u5207\u6362\u6E05\u6670\u5EA6\u53EF\u91CD\u65B0\u6FC0\u6D3B\u64AD\u653E\u5668\u3002';
            tr1.append(td1);
            return tr1;
        })();
        table.append(this.cidSessionDom.downloadAllTr);

        // 3. click download all split
        for (let i = 0; i < monkey.flvs.length; i++) {
            if (table.rows[i].cells[1].children[0].textContent == '缓存本段') table.rows[i].cells[1].children[0].click();
        }

        // 4. set sprogress
        const progress = a.parentElement.nextElementSibling.children[0];
        progress.max = monkey.flvs.length + 1;
        progress.value = 0;
        for (let i = 0; i < monkey.flvs.length; i++) monkey.getFLV(i).then(e => progress.value++);

        // 5. merge splits
        const files = await monkey.getAllFLVs();
        const href = await this.twin.mergeFLVFiles(files);
        const ass = await monkey.ass;
        const outputName = top.document.getElementsByTagName('h1')[0].textContent.trim();

        // 6. build download all ui
        progress.value++;
        table.prepend((() => {
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.colSpan = '3';
            td1.style = 'border: 1px solid black';
            const a1 = document.createElement('a');
            a1.href = href;
            a1.download = `${outputName}.flv`;

            (a => {
                if (this.option.autoDanmaku) a.onclick = () => a.nextElementSibling.click();
            })(a1);

            a1.textContent = '\u4FDD\u5B58\u5408\u5E76\u540EFLV';
            td1.append(a1);
            td1.append(' ');
            const a2 = document.createElement('a');
            a2.href = ass;
            a2.download = `${outputName}.ass`;
            a2.textContent = '\u5F39\u5E55ASS';
            td1.append(a2);
            td1.append(' ');
            const a3 = document.createElement('a');

            a3.onclick = e => new MKVTransmuxer().exec(href, ass, `${outputName}.mkv`, e.target);

            a3.textContent = '\u6253\u5305MKV(\u8F6F\u5B57\u5E55\u5C01\u88C5)';
            td1.append(a3);
            td1.append(' ');
            td1.append('\u8BB0\u5F97\u6E05\u7406\u5206\u6BB5\u7F13\u5B58\u54E6~');
            tr1.append(td1);
            return tr1;
        })());

        return href;
    }

    async downloadFLV({ a, monkey = this.twin.monkey, index, progress = {} }) {
        // 1. add beforeUnloadHandler
        const handler = e => UI.beforeUnloadHandler(e);
        window.addEventListener('beforeunload', handler);

        // 2. switch to cancel ui
        a.textContent = '取消';
        a.onclick = () => {
            a.onclick = null;
            window.removeEventListener('beforeunload', handler);
            a.textContent = '已取消';
            monkey.abortFLV(index);
        };

        // 3. try download
        let url;
        try {
            url = await monkey.getFLV(index, (loaded, total) => {
                progress.value = loaded;
                progress.max = total;
            });
            url = URL.createObjectURL(url);
            if (progress.value == 0) progress.value = progress.max = 1;
        } catch (e) {
            a.onclick = null;
            window.removeEventListener('beforeunload', handler);
            a.textContent = '错误';
            throw e;
        }

        // 4. switch to complete ui
        a.onclick = null;
        window.removeEventListener('beforeunload', handler);
        a.textContent = '另存为';
        a.download = monkey.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.flv/)[0];
        a.href = url;
        return url;
    }

    async displayQuota(td) {
        return new Promise(resolve => {
            const temporaryStorage = window.navigator.temporaryStorage || window.navigator.webkitTemporaryStorage || window.navigator.mozTemporaryStorage || window.navigator.msTemporaryStorage;
            if (!temporaryStorage) return resolve(td.textContent = '这个浏览器不支持缓存呢~关掉标签页后，缓存马上就会消失哦');
            temporaryStorage.queryUsageAndQuota((usage, quota) => resolve(td.textContent = `缓存已用空间：${Math.round(usage / 1048576)} MB / ${Math.round(quota / 1048576)} MB 也包括了B站本来的缓存`));
        });
    }

    // Menu Append
    appendMenu(playerWin = this.twin.playerWin) {
        // 1. build monkey menu and polyfill menu
        const monkeyMenu = this.buildMonkeyMenu();
        const polyfillMenu = this.buildPolyfillMenu();

        // 2. build ul
        const ul = document.createElement('ul');

        // 3. append to menu
        ul.className = 'bilitwin';
        ul.style.borderBottom = '1px solid rgba(255,255,255,.12)';
        ul.append(...[monkeyMenu, polyfillMenu]);
        const div = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0];
        div.prepend(ul);

        // 4. save to cache
        this.cidSessionDom.menuUl = ul;

        return ul;
    }

    buildMonkeyMenu({
        playerWin = this.twin.playerWin,
        BiliMonkey = this.twin.BiliMonkey,
        monkey = this.twin.monkey,
        flvA = this.cidSessionDom.flvA,
        mp4A = this.cidSessionDom.mp4A,
        assA = this.cidSessionDom.assA
    } = {}) {
        const li = document.createElement('li');
        li.className = 'context-menu-menu bilitwin';

        li.onclick = () => playerWin.document.getElementById('bilibiliPlayer').click();

        const a1 = document.createElement('a');
        a1.className = 'context-menu-a';
        a1.append('BiliMonkey');
        const span = document.createElement('span');
        span.className = 'bpui-icon bpui-icon-arrow-down';
        span.style = 'transform:rotate(-90deg);margin-top:3px;';
        a1.append(span);
        li.append(a1);
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        li1.className = 'context-menu-function';

        li1.onclick = async () => {
            if (flvA.onmouseover) await flvA.onmouseover();
            flvA.click();
        };

        const a2 = document.createElement('a');
        a2.className = 'context-menu-a';
        const span1 = document.createElement('span');
        span1.className = 'video-contextmenu-icon';
        a2.append(span1);
        a2.append(' \u4E0B\u8F7D\u89C6\u9891FLV');
        li1.append(a2);
        ul1.append(li1);
        const li2 = document.createElement('li');
        li2.className = 'context-menu-function';

        li2.onclick = async () => {
            if (assA.onmouseover) await assA.onmouseover();
            assA.click();
        };

        const a3 = document.createElement('a');
        a3.className = 'context-menu-a';
        const span2 = document.createElement('span');
        span2.className = 'video-contextmenu-icon';
        a3.append(span2);
        a3.append(' \u4E0B\u8F7D\u5F39\u5E55ASS');
        li2.append(a3);
        ul1.append(li2);
        const li3 = document.createElement('li');
        li3.className = 'context-menu-function';

        li3.onclick = () => this.displayOptionDiv();

        const a4 = document.createElement('a');
        a4.className = 'context-menu-a';
        const span3 = document.createElement('span');
        span3.className = 'video-contextmenu-icon';
        a4.append(span3);
        a4.append(' \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E');
        li3.append(a4);
        ul1.append(li3);
        const li4 = document.createElement('li');
        li4.className = 'context-menu-function';

        li4.onclick = async () => UI.displayDownloadAllPageDefaultFormatsBody((await BiliMonkey.getAllPageDefaultFormats(playerWin)));

        const a5 = document.createElement('a');
        a5.className = 'context-menu-a';
        const span4 = document.createElement('span');
        span4.className = 'video-contextmenu-icon';
        a5.append(span4);
        a5.append(' (\u6D4B)\u6279\u91CF\u4E0B\u8F7D');
        li4.append(a5);
        ul1.append(li4);
        const li5 = document.createElement('li');
        li5.className = 'context-menu-function';

        li5.onclick = async () => {
            monkey.proxy = true;
            monkey.flvs = null;
            UI.hintInfo('请稍候，可能需要10秒时间……', playerWin);
            // Yes, I AM lazy.
            playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="80"]').click();
            await new Promise(r => playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', r));
            return monkey.queryInfo('video');
        };

        const a6 = document.createElement('a');
        a6.className = 'context-menu-a';
        const span5 = document.createElement('span');
        span5.className = 'video-contextmenu-icon';
        a6.append(span5);
        a6.append(' (\u6D4B)\u8F7D\u5165\u7F13\u5B58FLV');
        li5.append(a6);
        ul1.append(li5);
        const li6 = document.createElement('li');
        li6.className = 'context-menu-function';

        li6.onclick = () => top.location.reload(true);

        const a7 = document.createElement('a');
        a7.className = 'context-menu-a';
        const span6 = document.createElement('span');
        span6.className = 'video-contextmenu-icon';
        a7.append(span6);
        a7.append(' (\u6D4B)\u5F3A\u5236\u5237\u65B0');
        li6.append(a7);
        ul1.append(li6);
        const li7 = document.createElement('li');
        li7.className = 'context-menu-function';

        li7.onclick = () => this.cidSessionDestroy() && this.cidSessionRender();

        const a8 = document.createElement('a');
        a8.className = 'context-menu-a';
        const span7 = document.createElement('span');
        span7.className = 'video-contextmenu-icon';
        a8.append(span7);
        a8.append(' (\u6D4B)\u91CD\u542F\u811A\u672C');
        li7.append(a8);
        ul1.append(li7);
        const li8 = document.createElement('li');
        li8.className = 'context-menu-function';

        li8.onclick = () => playerWin.player && playerWin.player.destroy();

        const a9 = document.createElement('a');
        a9.className = 'context-menu-a';
        const span8 = document.createElement('span');
        span8.className = 'video-contextmenu-icon';
        a9.append(span8);
        a9.append(' (\u6D4B)\u9500\u6BC1\u64AD\u653E\u5668');
        li8.append(a9);
        ul1.append(li8);
        li.append(ul1);

        return li;
    }

    buildPolyfillMenu({
        playerWin = this.twin.playerWin,
        BiliPolyfill = this.twin.BiliPolyfill,
        polyfill = this.twin.polyfill
    } = {}) {
        let oped = [];
        const refreshSession = new HookedFunction(() => oped = polyfill.userdata.oped[polyfill.getCollectionId()] || []); // as a convenient callback register
        const li = document.createElement('li');
        li.className = 'context-menu-menu bilitwin';

        li.onclick = () => playerWin.document.getElementById('bilibiliPlayer').click();

        const a1 = document.createElement('a');
        a1.className = 'context-menu-a';

        a1.onmouseover = () => refreshSession();

        a1.append('BiliPolyfill');
        a1.append(!polyfill.option.betabeta ? '(到设置开启)' : '');
        const span = document.createElement('span');
        span.className = 'bpui-icon bpui-icon-arrow-down';
        span.style = 'transform:rotate(-90deg);margin-top:3px;';
        a1.append(span);
        li.append(a1);
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        li1.className = 'context-menu-function';

        li1.onclick = () => top.window.open(polyfill.getCoverImage(), '_blank');

        const a2 = document.createElement('a');
        a2.className = 'context-menu-a';
        const span1 = document.createElement('span');
        span1.className = 'video-contextmenu-icon';
        a2.append(span1);
        a2.append(' \u83B7\u53D6\u5C01\u9762');
        li1.append(a2);
        ul1.append(li1);
        const li2 = document.createElement('li');
        li2.className = 'context-menu-menu';
        const a3 = document.createElement('a');
        a3.className = 'context-menu-a';
        const span2 = document.createElement('span');
        span2.className = 'video-contextmenu-icon';
        a3.append(span2);
        a3.append(' \u66F4\u591A\u64AD\u653E\u901F\u5EA6');
        const span3 = document.createElement('span');
        span3.className = 'bpui-icon bpui-icon-arrow-down';
        span3.style = 'transform:rotate(-90deg);margin-top:3px;';
        a3.append(span3);
        li2.append(a3);
        const ul2 = document.createElement('ul');
        const li3 = document.createElement('li');
        li3.className = 'context-menu-function';

        li3.onclick = () => {
            polyfill.setVideoSpeed(0.1);
        };

        const a4 = document.createElement('a');
        a4.className = 'context-menu-a';
        const span4 = document.createElement('span');
        span4.className = 'video-contextmenu-icon';
        a4.append(span4);
        a4.append(' 0.1');
        li3.append(a4);
        ul2.append(li3);
        const li4 = document.createElement('li');
        li4.className = 'context-menu-function';

        li4.onclick = () => {
            polyfill.setVideoSpeed(3);
        };

        const a5 = document.createElement('a');
        a5.className = 'context-menu-a';
        const span5 = document.createElement('span');
        span5.className = 'video-contextmenu-icon';
        a5.append(span5);
        a5.append(' 3');
        li4.append(a5);
        ul2.append(li4);
        const li5 = document.createElement('li');
        li5.className = 'context-menu-function';

        li5.onclick = e => polyfill.setVideoSpeed(e.children[0].children[1].value);

        const a6 = document.createElement('a');
        a6.className = 'context-menu-a';
        const span6 = document.createElement('span');
        span6.className = 'video-contextmenu-icon';
        a6.append(span6);
        a6.append(' \u70B9\u51FB\u786E\u8BA4');
        const input = document.createElement('input');
        input.type = 'text';
        input.style = 'width: 35px; height: 70%';

        input.onclick = e => e.stopPropagation();

        (e => refreshSession.addCallback(() => e.value = polyfill.video.playbackRate))(input);

        a6.append(input);
        li5.append(a6);
        ul2.append(li5);
        li2.append(ul2);
        ul1.append(li2);
        const li6 = document.createElement('li');
        li6.className = 'context-menu-menu';
        const a7 = document.createElement('a');
        a7.className = 'context-menu-a';
        const span7 = document.createElement('span');
        span7.className = 'video-contextmenu-icon';
        a7.append(span7);
        a7.append(' \u7247\u5934\u7247\u5C3E');
        const span8 = document.createElement('span');
        span8.className = 'bpui-icon bpui-icon-arrow-down';
        span8.style = 'transform:rotate(-90deg);margin-top:3px;';
        a7.append(span8);
        li6.append(a7);
        const ul3 = document.createElement('ul');
        const li7 = document.createElement('li');
        li7.className = 'context-menu-function';

        li7.onclick = () => polyfill.markOPEDPosition(0);

        const a8 = document.createElement('a');
        a8.className = 'context-menu-a';
        const span9 = document.createElement('span');
        span9.className = 'video-contextmenu-icon';
        a8.append(span9);
        a8.append(' \u7247\u5934\u5F00\u59CB:');
        const span10 = document.createElement('span');

        (e => refreshSession.addCallback(() => e.textContent = oped[0] ? BiliPolyfill.secondToReadable(oped[0]) : '无'))(span10);

        a8.append(span10);
        li7.append(a8);
        ul3.append(li7);
        const li8 = document.createElement('li');
        li8.className = 'context-menu-function';

        li8.onclick = () => polyfill.markOPEDPosition(1);

        const a9 = document.createElement('a');
        a9.className = 'context-menu-a';
        const span11 = document.createElement('span');
        span11.className = 'video-contextmenu-icon';
        a9.append(span11);
        a9.append(' \u7247\u5934\u7ED3\u675F:');
        const span12 = document.createElement('span');

        (e => refreshSession.addCallback(() => e.textContent = oped[1] ? BiliPolyfill.secondToReadable(oped[1]) : '无'))(span12);

        a9.append(span12);
        li8.append(a9);
        ul3.append(li8);
        const li9 = document.createElement('li');
        li9.className = 'context-menu-function';

        li9.onclick = () => polyfill.markOPEDPosition(2);

        const a10 = document.createElement('a');
        a10.className = 'context-menu-a';
        const span13 = document.createElement('span');
        span13.className = 'video-contextmenu-icon';
        a10.append(span13);
        a10.append(' \u7247\u5C3E\u5F00\u59CB:');
        const span14 = document.createElement('span');

        (e => refreshSession.addCallback(() => e.textContent = oped[2] ? BiliPolyfill.secondToReadable(oped[2]) : '无'))(span14);

        a10.append(span14);
        li9.append(a10);
        ul3.append(li9);
        const li10 = document.createElement('li');
        li10.className = 'context-menu-function';

        li10.onclick = () => polyfill.markOPEDPosition(3);

        const a11 = document.createElement('a');
        a11.className = 'context-menu-a';
        const span15 = document.createElement('span');
        span15.className = 'video-contextmenu-icon';
        a11.append(span15);
        a11.append(' \u7247\u5C3E\u7ED3\u675F:');
        const span16 = document.createElement('span');

        (e => refreshSession.addCallback(() => e.textContent = oped[3] ? BiliPolyfill.secondToReadable(oped[3]) : '无'))(span16);

        a11.append(span16);
        li10.append(a11);
        ul3.append(li10);
        const li11 = document.createElement('li');
        li11.className = 'context-menu-function';

        li11.onclick = () => polyfill.clearOPEDPosition();

        const a12 = document.createElement('a');
        a12.className = 'context-menu-a';
        const span17 = document.createElement('span');
        span17.className = 'video-contextmenu-icon';
        a12.append(span17);
        a12.append(' \u53D6\u6D88\u6807\u8BB0');
        li11.append(a12);
        ul3.append(li11);
        const li12 = document.createElement('li');
        li12.className = 'context-menu-function';

        li12.onclick = () => this.displayPolyfillDataDiv();

        const a13 = document.createElement('a');
        a13.className = 'context-menu-a';
        const span18 = document.createElement('span');
        span18.className = 'video-contextmenu-icon';
        a13.append(span18);
        a13.append(' \u68C0\u89C6\u6570\u636E/\u8BF4\u660E');
        li12.append(a13);
        ul3.append(li12);
        li6.append(ul3);
        ul1.append(li6);
        const li13 = document.createElement('li');
        li13.className = 'context-menu-menu';
        const a14 = document.createElement('a');
        a14.className = 'context-menu-a';
        const span19 = document.createElement('span');
        span19.className = 'video-contextmenu-icon';
        a14.append(span19);
        a14.append(' \u627E\u4E0A\u4E0B\u96C6');
        const span20 = document.createElement('span');
        span20.className = 'bpui-icon bpui-icon-arrow-down';
        span20.style = 'transform:rotate(-90deg);margin-top:3px;';
        a14.append(span20);
        li13.append(a14);
        const ul4 = document.createElement('ul');
        const li14 = document.createElement('li');
        li14.className = 'context-menu-function';

        li14.onclick = () => {
            if (polyfill.series[0]) {
                top.window.open(`https://www.bilibili.com/video/av${polyfill.series[0].aid}`, '_blank');
            }
        };

        const a15 = document.createElement('a');
        a15.className = 'context-menu-a';
        a15.style.width = 'initial';
        const span21 = document.createElement('span');
        span21.className = 'video-contextmenu-icon';
        a15.append(span21);
        const span22 = document.createElement('span');

        (e => refreshSession.addCallback(() => e.textContent = polyfill.series[0] ? polyfill.series[0].title : '找不到'))(span22);

        a15.append(span22);
        li14.append(a15);
        ul4.append(li14);
        const li15 = document.createElement('li');
        li15.className = 'context-menu-function';

        li15.onclick = () => {
            if (polyfill.series[1]) {
                top.window.open(`https://www.bilibili.com/video/av${polyfill.series[1].aid}`, '_blank');
            }
        };

        const a16 = document.createElement('a');
        a16.className = 'context-menu-a';
        a16.style.width = 'initial';
        const span23 = document.createElement('span');
        span23.className = 'video-contextmenu-icon';
        a16.append(span23);
        const span24 = document.createElement('span');

        (e => refreshSession.addCallback(() => e.textContent = polyfill.series[1] ? polyfill.series[1].title : '找不到'))(span24);

        a16.append(span24);
        li15.append(a16);
        ul4.append(li15);
        li13.append(ul4);
        ul1.append(li13);
        const li16 = document.createElement('li');
        li16.className = 'context-menu-function';

        li16.onclick = () => BiliPolyfill.openMinimizedPlayer();

        const a17 = document.createElement('a');
        a17.className = 'context-menu-a';
        const span25 = document.createElement('span');
        span25.className = 'video-contextmenu-icon';
        a17.append(span25);
        a17.append(' \u5C0F\u7A97\u64AD\u653E');
        li16.append(a17);
        ul1.append(li16);
        const li17 = document.createElement('li');
        li17.className = 'context-menu-function';

        li17.onclick = () => this.displayOptionDiv();

        const a18 = document.createElement('a');
        a18.className = 'context-menu-a';
        const span26 = document.createElement('span');
        span26.className = 'video-contextmenu-icon';
        a18.append(span26);
        a18.append(' \u8BBE\u7F6E/\u5E2E\u52A9/\u5173\u4E8E');
        li17.append(a18);
        ul1.append(li17);
        const li18 = document.createElement('li');
        li18.className = 'context-menu-function';

        li18.onclick = () => polyfill.saveUserdata();

        const a19 = document.createElement('a');
        a19.className = 'context-menu-a';
        const span27 = document.createElement('span');
        span27.className = 'video-contextmenu-icon';
        a19.append(span27);
        a19.append(' (\u6D4B)\u7ACB\u5373\u4FDD\u5B58\u6570\u636E');
        li18.append(a19);
        ul1.append(li18);
        const li19 = document.createElement('li');
        li19.className = 'context-menu-function';

        li19.onclick = () => {
            BiliPolyfill.clearAllUserdata(playerWin);
            polyfill.retrieveUserdata();
        };

        const a20 = document.createElement('a');
        a20.className = 'context-menu-a';
        const span28 = document.createElement('span');
        span28.className = 'video-contextmenu-icon';
        a20.append(span28);
        a20.append(' (\u6D4B)\u5F3A\u5236\u6E05\u7A7A\u6570\u636E');
        li19.append(a20);
        ul1.append(li19);
        li.append(ul1);
        return li;
    }

    buildOptionDiv(twin = this.twin) {
        const div = UI.genDiv();

        div.append(this.buildMonkeyOptionTable(), this.buildPolyfillOptionTable(), this.buildUIOptionTable(), (() => {
            const table1 = document.createElement('table');
            table1.style.width = '100%';
            table1.style.lineHeight = '2em';
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.textContent = '\u8BBE\u7F6E\u81EA\u52A8\u4FDD\u5B58\uFF0C\u5237\u65B0\u540E\u751F\u6548\u3002';
            tr1.append(td1);
            table1.append(tr1);
            const tr2 = document.createElement('tr');
            const td2 = document.createElement('td');
            td2.textContent = '\u89C6\u9891\u4E0B\u8F7D\u7EC4\u4EF6\u7684\u7F13\u5B58\u529F\u80FD\u53EA\u5728Windows+Chrome\u6D4B\u8BD5\u8FC7\uFF0C\u5982\u679C\u51FA\u73B0\u95EE\u9898\uFF0C\u8BF7\u5173\u95ED\u7F13\u5B58\u3002';
            tr2.append(td2);
            table1.append(tr2);
            const tr3 = document.createElement('tr');
            const td3 = document.createElement('td');
            td3.textContent = '\u529F\u80FD\u589E\u5F3A\u7EC4\u4EF6\u5C3D\u91CF\u4FDD\u8BC1\u4E86\u517C\u5BB9\u6027\u3002\u4F46\u5982\u679C\u6709\u540C\u529F\u80FD\u811A\u672C/\u63D2\u4EF6\uFF0C\u8BF7\u5173\u95ED\u672C\u63D2\u4EF6\u7684\u5BF9\u5E94\u529F\u80FD\u3002';
            tr3.append(td3);
            table1.append(tr3);
            const tr4 = document.createElement('tr');
            const td4 = document.createElement('td');
            td4.textContent = '\u8FD9\u4E2A\u811A\u672C\u4E43\u201C\u6309\u539F\u6837\u201D\u63D0\u4F9B\uFF0C\u4E0D\u9644\u5E26\u4EFB\u4F55\u660E\u793A\uFF0C\u6697\u793A\u6216\u6CD5\u5B9A\u7684\u4FDD\u8BC1\uFF0C\u5305\u62EC\u4F46\u4E0D\u9650\u4E8E\u5176\u6CA1\u6709\u7F3A\u9677\uFF0C\u9002\u5408\u7279\u5B9A\u76EE\u7684\u6216\u975E\u4FB5\u6743\u3002';
            tr4.append(td4);
            table1.append(tr4);
            const tr5 = document.createElement('tr');
            const td5 = document.createElement('td');
            const a1 = document.createElement('a');
            a1.href = 'https://greasyfork.org/zh-CN/scripts/27819';
            a1.target = '_blank';
            a1.textContent = '\u66F4\u65B0/\u8BA8\u8BBA';
            td5.append(a1);
            td5.append(' ');
            const a2 = document.createElement('a');
            a2.href = 'https://github.com/liqi0816/bilitwin/';
            a2.target = '_blank';
            a2.textContent = 'GitHub';
            td5.append(a2);
            td5.append(' ');
            td5.append('Author: qli5. Copyright: qli5, 2014+, \u7530\u751F, grepmusic, xmader');
            tr5.append(td5);
            table1.append(tr5);
            return table1;
        })(), (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = () => div.style.display = 'none';

            button.textContent = '\u5173\u95ED';
            return button;
        })(), (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = () => top.location.reload();

            button.textContent = '\u4FDD\u5B58\u5E76\u5237\u65B0';
            return button;
        })(), (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = () => twin.resetOption() && top.location.reload();

            button.textContent = '\u91CD\u7F6E\u5E76\u5237\u65B0';
            return button;
        })());

        return this.dom.optionDiv = div;
    }

    buildMonkeyOptionTable(twin = this.twin, BiliMonkey = this.twin.BiliMonkey) {
        const table = document.createElement('table');
        {
            table.style.width = '100%';
            table.style.lineHeight = '2em';
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.style = 'text-align:center';
            td1.textContent = 'BiliMonkey\uFF08\u89C6\u9891\u6293\u53D6\u7EC4\u4EF6\uFF09';
            tr1.append(td1);
            table.append(tr1);
        }

        table.append(...BiliMonkey.optionDescriptions.map(([name, description]) => {
            const tr1 = document.createElement('tr');
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = twin.option[name];

            input.onchange = e => {
                twin.option[name] = e.target.checked;
                twin.saveOption(twin.option);
            };

            label.append(input);
            label.append(description);
            tr1.append(label);
            return tr1;
        }));

        return table;
    }

    buildPolyfillOptionTable(twin = this.twin, BiliPolyfill = this.twin.BiliPolyfill) {
        const table = document.createElement('table');
        {
            table.style.width = '100%';
            table.style.lineHeight = '2em';
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.style = 'text-align:center';
            td1.textContent = 'BiliPolyfill\uFF08\u529F\u80FD\u589E\u5F3A\u7EC4\u4EF6\uFF09';
            tr1.append(td1);
            table.append(tr1);
            const tr2 = document.createElement('tr');
            const td2 = document.createElement('td');
            td2.style = 'text-align:center';
            td2.textContent = '\u61D2\u9B3C\u4F5C\u8005\u8FD8\u5728\u6D4B\u8BD5\u7684\u65F6\u5019\uFF0CB\u7AD9\u5DF2\u7ECF\u4E0A\u7EBF\u4E86\u539F\u751F\u7684\u7A0D\u540E\u518D\u770B(\u0E51\u2022\u0300\u3142\u2022\u0301)\u0648\u2727';
            tr2.append(td2);
            table.append(tr2);
        }

        table.append(...BiliPolyfill.optionDescriptions.map(([name, description, disabled]) => {
            const tr1 = document.createElement('tr');
            const label = document.createElement('label');
            label.style.textDecoration = disabled == 'disabled' ? 'line-through' : undefined;
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = twin.option[name];

            input.onchange = e => {
                twin.option[name] = e.target.checked;
                twin.saveOption(twin.option);
            };

            input.disabled = disabled == 'disabled';
            label.append(input);
            label.append(description);
            tr1.append(label);
            return tr1;
        }));

        return table;
    }

    buildUIOptionTable(twin = this.twin) {
        const table = document.createElement('table');
        {
            table.style.width = '100%';
            table.style.lineHeight = '2em';
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.style = 'text-align:center';
            td1.textContent = 'UI\uFF08\u7528\u6237\u754C\u9762\uFF09';
            tr1.append(td1);
            table.append(tr1);
        }

        table.append(...UI.optionDescriptions.map(([name, description]) => {
            const tr1 = document.createElement('tr');
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = twin.option[name];

            input.onchange = e => {
                twin.option[name] = e.target.checked;
                twin.saveOption(twin.option);
            };

            label.append(input);
            label.append(description);
            tr1.append(label);
            return tr1;
        }));

        return table;
    }

    displayOptionDiv(optionDiv = this.dom.optionDiv) {
        if (!optionDiv) {
            optionDiv = this.buildOptionDiv();
            document.body.append(optionDiv);
        }
        optionDiv.style.display = '';
        return optionDiv;
    }

    buildPolyfillDataDiv(polyfill = this.twin.polyfill) {
        const textarea = document.createElement('textarea');

        textarea.style.resize = 'vertical';
        textarea.style.width = '100%';
        textarea.style.height = '200px';
        textarea.textContent = `
            ${JSON.stringify(polyfill.userdata.oped).replace(/{/, '{\n').replace(/}/, '\n}').replace(/],/g, '],\n')}
        `;
        const div = UI.genDiv();

        div.append((() => {
            const p = document.createElement('p');
            p.style.margin = '0.3em';
            p.textContent = '\u8FD9\u91CC\u662F\u811A\u672C\u50A8\u5B58\u7684\u6570\u636E\u3002\u6240\u6709\u6570\u636E\u90FD\u53EA\u5B58\u5728\u6D4F\u89C8\u5668\u91CC\uFF0C\u522B\u4EBA\u4E0D\u77E5\u9053\uFF0CB\u7AD9\u4E5F\u4E0D\u77E5\u9053\uFF0C\u811A\u672C\u4F5C\u8005\u66F4\u4E0D\u77E5\u9053(\u8FD9\u4E2A\u5BB6\u4F19\u8FDE\u670D\u52A1\u5668\u90FD\u79DF\u4E0D\u8D77 \u6454';
            return p;
        })(), (() => {
            const p = document.createElement('p');
            p.style.margin = '0.3em';
            p.textContent = 'B\u7AD9\u5DF2\u4E0A\u7EBF\u539F\u751F\u7684\u7A0D\u540E\u89C2\u770B\u529F\u80FD\u3002';
            return p;
        })(), (() => {
            const p = document.createElement('p');
            p.style.margin = '0.3em';
            p.textContent = '\u8FD9\u91CC\u662F\u7247\u5934\u7247\u5C3E\u3002\u683C\u5F0F\u662F\uFF0Cav\u53F7\u6216\u756A\u5267\u53F7:[\u7247\u5934\u5F00\u59CB(\u9ED8\u8BA4=0),\u7247\u5934\u7ED3\u675F(\u9ED8\u8BA4=\u4E0D\u8DF3),\u7247\u5C3E\u5F00\u59CB(\u9ED8\u8BA4=\u4E0D\u8DF3),\u7247\u5C3E\u7ED3\u675F(\u9ED8\u8BA4=\u65E0\u7A77\u5927)]\u3002\u53EF\u4EE5\u4EFB\u610F\u586B\u5199null\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u91C7\u7528\u9ED8\u8BA4\u503C\u3002';
            return p;
        })(), textarea, (() => {
            const p = document.createElement('p');
            p.style.margin = '0.3em';
            p.textContent = '\u5F53\u7136\u53EF\u4EE5\u76F4\u63A5\u6E05\u7A7A\u5566\u3002\u53EA\u5220\u9664\u5176\u4E2D\u7684\u4E00\u4E9B\u884C\u7684\u8BDD\uFF0C\u4E00\u5B9A\u8981\u8BB0\u5F97\u5220\u6389\u591A\u4F59\u7684\u9017\u53F7\u3002';
            return p;
        })(), (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = () => div.remove();

            button.textContent = '\u5173\u95ED';
            return button;
        })(), (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = e => {
                if (!textarea.value) textarea.value = '{\n\n}';
                textarea.value = textarea.value.replace(/,(\s|\n)*}/, '\n}').replace(/,(\s|\n),/g, ',\n').replace(/,(\s|\n)*]/g, ']');
                const userdata = {};
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
        })(), (() => {
            const button = document.createElement('button');
            button.style.padding = '0.5em';
            button.style.margin = '0.2em';

            button.onclick = e => {
                polyfill.userdata = e.target.previousElementSibling.onclick({ target: e.target.previousElementSibling });
                polyfill.saveUserdata();
                e.target.textContent = '保存成功';
            };

            button.textContent = '\u5C1D\u8BD5\u4FDD\u5B58';
            return button;
        })());

        return div;
    }

    displayPolyfillDataDiv(polyfill) {
        const div = this.buildPolyfillDataDiv();
        document.body.append(div);
        div.style.display = 'block';

        return div;
    }

    // Common
    static buildDownloadAllPageDefaultFormatsBody(ret) {
        const table = document.createElement('table');

        table.onclick = e => e.stopPropagation();

        for (const i of ret) {
            table.append((() => {
                const tr1 = document.createElement('tr');
                const td1 = document.createElement('td');
                td1.textContent = `
                        ${i.name}
                    `;
                tr1.append(td1);
                const td2 = document.createElement('td');
                const a1 = document.createElement('a');
                a1.href = i.durl[0];
                a1.download = '';
                a1.setAttribute('referrerpolicy', 'origin');
                a1.textContent = i.durl[0].split("/").pop().split("?")[0];
                td2.append(a1);
                tr1.append(td2);
                const td3 = document.createElement('td');
                const a2 = document.createElement('a');
                a2.href = i.danmuku;
                a2.download = `${i.outputName}.ass`;
                a2.setAttribute('referrerpolicy', 'origin');
                a2.textContent = `${i.outputName}.ass`;
                td3.append(a2);
                tr1.append(td3);
                return tr1;
            })(), ...i.durl.slice(1).map(href => {
                const tr1 = document.createElement('tr');
                const td1 = document.createElement('td');
                td1.textContent = `
                    `;
                tr1.append(td1);
                const td2 = document.createElement('td');
                const a1 = document.createElement('a');
                a1.href = href;
                a1.download = '';
                a1.setAttribute('referrerpolicy', 'origin');
                a1.textContent = href;
                td2.append(a1);
                tr1.append(td2);
                const td3 = document.createElement('td');
                td3.textContent = `
                    `;
                tr1.append(td3);
                return tr1;
            }));
        }

        const fragment = document.createDocumentFragment();
        const style1 = document.createElement('style');
        style1.textContent = `
                table {
                    width: 100%;
                    table-layout: fixed;
                }
            
                td {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    text-align: center;
                }
            `;
        fragment.append(style1);
        const h1 = document.createElement('h1');
        h1.textContent = '(\u6D4B\u8BD5) \u6279\u91CF\u6293\u53D6';
        fragment.append(h1);
        const ul1 = document.createElement('ul');
        const li = document.createElement('li');
        const p = document.createElement('p');
        p.textContent = '\u53EA\u6293\u53D6\u9ED8\u8BA4\u6E05\u6670\u5EA6';
        li.append(p);
        ul1.append(li);
        const li1 = document.createElement('li');
        const p1 = document.createElement('p');
        p1.textContent = '\u590D\u5236\u94FE\u63A5\u5730\u5740\u65E0\u6548\uFF0C\u8BF7\u5DE6\u952E\u5355\u51FB/\u53F3\u952E\u53E6\u5B58\u4E3A/\u53F3\u952E\u8C03\u7528\u4E0B\u8F7D\u5DE5\u5177';
        li1.append(p1);
        const p2 = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = '\u5F00\u53D1\u8005\uFF1A\u9700\u8981\u6821\u9A8Creferrer\u548Cuser agent';
        p2.append(em);
        li1.append(p2);
        ul1.append(li1);
        const li2 = document.createElement('li');
        const p3 = document.createElement('p');
        p3.append('flv\u5408\u5E76');
        const a1 = document.createElement('a');
        a1.href = 'http://www.flvcd.com/teacher2.htm';
        a1.textContent = '\u7855\u9F20';
        p3.append(a1);
        li2.append(p3);
        const p4 = document.createElement('p');
        p4.textContent = '\u6279\u91CF\u5408\u5E76\u5BF9\u5355\u6807\u7B7E\u9875\u8D1F\u8377\u592A\u5927';
        li2.append(p4);
        const p5 = document.createElement('p');
        const em1 = document.createElement('em');
        em1.textContent = '\u5F00\u53D1\u8005\uFF1A\u53EF\u4EE5\u7528webworker\uFF0C\u4F46\u662F\u6211\u6CA1\u9700\u6C42\uFF0C\u53C8\u61D2';
        p5.append(em1);
        li2.append(p5);
        ul1.append(li2);
        fragment.append(ul1);
        fragment.append(table);
        return fragment;
    }

    static displayDownloadAllPageDefaultFormatsBody(ret) {
        top.document.open();
        top.document.close();

        top.document.body.append(UI.buildDownloadAllPageDefaultFormatsBody(ret));
        return ret;
    }

    static genDiv() {
        const div1 = document.createElement('div');
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
        div1.addEventListener('click', e => e.stopPropagation());
        div1.className = 'bilitwin';

        return div1;
    }

    static requestH5Player() {
        const h = document.querySelector('div.tminfo');
        h.prepend('[[脚本需要HTML5播放器(弹幕列表右上角三个点的按钮切换)]] ');
    }

    static allowDrag(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    static beforeUnloadHandler(e) {
        return e.returnValue = '脚本还没做完工作，真的要退出吗？';
    }

    static hintInfo(text, playerWin) {
        const div = document.createElement('div');
        {
            div.className = 'bilibili-player-video-toast-bottom';
            const div1 = document.createElement('div');
            div1.className = 'bilibili-player-video-toast-item';
            const div2 = document.createElement('div');
            div2.className = 'bilibili-player-video-toast-item-text';
            const span = document.createElement('span');
            span.textContent = text;
            div2.append(span);
            div1.append(div2);
            div.append(div1);
        }
        playerWin.document.getElementsByClassName('bilibili-player-video-toast-wrp')[0].append(div);
        setTimeout(() => div.remove(), 3000);
    }

    static get optionDescriptions() {
        return [
        // 1. automation
        ['autoDanmaku', '下载视频也触发下载弹幕'],

        // 2. user interface
        ['title', '在视频标题旁添加链接'], ['menu', '在视频菜单栏添加链接'],

        // 3. download
        ['aria2', '导出aria2'], ['aria2RPC', '发送到aria2 RPC'], ['m3u8', '(限VLC兼容播放器)导出m3u8'], ['clipboard', '(测)(请自行解决referrer)强制导出剪贴板']];
    }

    static get optionDefaults() {
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
}

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

let debugOption = { debug: 1 };

class BiliTwin extends BiliUserJS {
    static get debugOption() {
        return debugOption;
    }

    static set debugOption(option) {
        debugOption = option;
    }

    constructor(option = {}, ui) {
        super();
        this.BiliMonkey = BiliMonkey;
        this.BiliPolyfill = BiliPolyfill;
        this.playerWin = null;
        this.monkey = null;
        this.polifill = null;
        this.ui = ui || new UI(this);
        this.option = option;
    }

    async runCidSession() {
        // 1. playerWin and option
        try {
            // you know what? it is a race, data race for jq! try not to yield to others!
            this.playerWin = BiliUserJS.tryGetPlayerWinSync() || await BiliTwin.getPlayerWin();
        }
        catch (e) {
            if (e == 'Need H5 Player') UI.requestH5Player();
            throw e;
        }
        const href = location.href;
        this.option = this.getOption();
        if (this.option.debug) {
            if (top.console) top.console.clear();
        }

        // 2. monkey and polyfill
        this.monkey = new BiliMonkey(this.playerWin, this.option);
        this.polyfill = new BiliPolyfill(this.playerWin, this.option, t => UI.hintInfo(t, this.playerWin));
        await this.polyfill.setFunctions();

        // 3. async consistent => render UI
        const cidRefresh = BiliTwin.getCidRefreshPromise(this.playerWin);
        if (href == location.href) {
            this.ui.option = this.option;
            this.ui.cidSessionRender();
        }
        else {
            cidRefresh.resolve();
        }

        // 4. debug
        if (this.option.debug) {
            [(top.unsafeWindow || top).monkey, (top.unsafeWindow || top).polyfill] = [this.monkey, this.polyfill];
        }

        // 5. refresh => session expire
        await cidRefresh;
        this.monkey.destroy();
        this.polyfill.destroy();
        this.ui.cidSessionDestroy();
    }

    async mergeFLVFiles(files) {
        return URL.createObjectURL(await FLV.mergeBlobs(files));
    }

    async clearCacheDB(cache) {
        if (cache) return cache.deleteEntireDB();
    }

    resetOption(option = this.option) {
        option.setStorage('BiliTwin', JSON.stringify({}));
        return this.option = {};
    }

    getOption(playerWin = this.playerWin) {
        let rawOption = null;
        try {
            rawOption = JSON.parse(playerWin.localStorage.getItem('BiliTwin'));
        }
        catch (e) { }
        finally {
            if (!rawOption) rawOption = {};
            rawOption.setStorage = (n, i) => playerWin.localStorage.setItem(n, i);
            rawOption.getStorage = n => playerWin.localStorage.getItem(n);
            return Object.assign(
                {},
                BiliMonkey.optionDefaults,
                BiliPolyfill.optionDefaults,
                UI.optionDefaults,
                rawOption,
                BiliTwin.debugOption,
            );
        }
    }

    saveOption(option = this.option) {
        return option.setStorage('BiliTwin', JSON.stringify(option));
    }

    static async init() {
        if (!document.body) return;
        BiliTwin.outdatedEngineClearance();
        BiliTwin.firefoxClearance();

        const video = document.querySelector("video");
        video.addEventListener('play', () => {
            let event = new MouseEvent('contextmenu', {
                'bubbles': true
            });

            video.dispatchEvent(event);
            video.dispatchEvent(event);
        },{once:true});

        const twin = new BiliTwin();

        while (1) {
            await twin.runCidSession();
        }
    }

    static outdatedEngineClearance() {
        if (typeof Promise != 'function' || typeof MutationObserver != 'function') {
            alert('这个浏览器实在太老了，脚本决定罢工。');
            throw 'BiliTwin: browser outdated: Promise or MutationObserver unsupported';
        }
    }

    static firefoxClearance() {
        if (navigator.userAgent.includes('Firefox')) {
            BiliTwin.debugOption.proxy = false;
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
}

BiliTwin.domContentLoadedThen(BiliTwin.init);
