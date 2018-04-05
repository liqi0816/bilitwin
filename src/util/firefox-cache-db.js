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
 * A promisified cache database backed by firefox idbMutableFile
 * 
 * Firefox still do not have stream support by default. :(
 */
class FirefoxCacheDB {
    /**
     * === NOTICE: Blobs may mutate! ===
     * 
     * In both Chrome and Firefox, instances of File are actually real-time
     * references for better performance. The problem is that File extends Blob.
     * While in most cases the user will not edit the file s/he is going to
     * upload, there still exist some edge cases. Unfortunately, this library is
     * very likely to be one.
     * 
     * To fix this "mutable Blob" problem, by default all get-* functions will
     * return a snapshot instead of the real-time references. This may leads to
     * more RAM consumption and/or more delay. If you are aware of this problem
     * and decide to handle it yourself, please set mutableBlob to true.
     * 
     * @param {string} dbName database name
     * @param {string} storeName store name
     * @param {boolean} [mutableBlob=false] allow mutable Blob
     */
    constructor(dbName, storeName, mutableBlob = false) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.mutableBlob = mutableBlob;
        this.db = null;
        this.store = null;
    }

    async getDB() {
        if (this.db) return this.db;
        else return this.db = (async () => {
            const req = indexedDB.open(this.dbName);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'name' });
                }
            };
            return this.db = await FirefoxCacheDB.promisifyRequest(req);
        })();
    }

    async createData(...args) {
        const { name, data } = FirefoxCacheDB.parseParameter(...args);
        const db = await this.getDB();
        const file = await FirefoxCacheDB.promisifyRequest(db.createMutableFile(name));
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        await FirefoxCacheDB.promisifyRequest(store.add(file));
        const lockedFile = file.open('readwrite');
        return await FirefoxCacheDB.promisifyRequest(lockedFile.write(data) || {});
    }

    async setData(...args) {
        const { name, data, offset, append, truncate } = FirefoxCacheDB.parseParameter(...args);
        const file = await this.createFileHandle(name);
        const lockedFile = file.open('readwrite');
        if (append) {
            return await FirefoxCacheDB.promisifyRequest(lockedFile.append(data) || {});
        }
        else {
            if (offset) lockedFile.location = offset;
            const req = lockedFile.write(data) || {};
            req.onsuccess = async () => {
                if (truncate) return await FirefoxCacheDB.promisifyRequest(lockedFile.truncate(lockedFile.location));
            }
            return FirefoxCacheDB.promisifyRequest(req);
        }
    }

    async appendData(...args) {
        return this.setData(...args, { append: true });
    }

    async getData(name) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
        const file = await FirefoxCacheDB.promisifyRequest(store.get(name));
        if (!file) return null;
        const data = await FirefoxCacheDB.promisifyRequest(file.getFile());
        if (this.mutableBlob) return data;
        return FirefoxCacheDB.cloneBlob(data);
    }

    async deleteData(name) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        return await FirefoxCacheDB.promisifyRequest(store.delete(name));
    }

    async deleteAllData() {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        return await FirefoxCacheDB.promisifyRequest(store.clear());
    }

    async deleteEntireDB() {
        return await FirefoxCacheDB.promisifyRequest(indexedDB.deleteDatabase(this.dbName));
    }

    async createFileHandle(name) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const old = await FirefoxCacheDB.promisifyRequest(store.get(name));
        const file = old || await FirefoxCacheDB.promisifyRequest(db.createMutableFile(name));
        if (!old) {
            const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
            await FirefoxCacheDB.promisifyRequest(store.add(file));
        }
        return file;
    }

    async createWriteSink(...args) {
        const { name, data, offset, append, truncate } = FirefoxCacheDB.parseParameter(...args);
        const file = await this.createFileHandle(name);
        let lockedFile = file.open('readwrite');
        let lastOffset = 0;
        if (offset) lastOffset = offset;
        return ({
            async write(data) {
                if (!lockedFile.active) lockedFile = file.open('readwrite');
                if (append) {
                    return await FirefoxCacheDB.promisifyRequest(lockedFile.append(data) || {});
                }
                else {
                    lockedFile.location = lastOffset;
                    const result = await FirefoxCacheDB.promisifyRequest(lockedFile.write(data) || {});
                    lastOffset = lockedFile.location;
                    return result;
                }
            },
            async close() {
                if (truncate) {
                    if (!lockedFile.active) lockedFile = file.open('readwrite');
                    return await FirefoxCacheDB.promisifyRequest(lockedFile.truncate(lastOffset));
                }
            }
        });
    }

    async createWriteStream(...args) {
        return new WritableStream(await this.createWriteSink(...args));
    }

    async getObjectURL(name) {
        const data = await this.getData(name)
        if (!data) return null;
        return URL.createObjectURL(data);
    }

    async getText(name) {
        const data = await this.getData(name);
        if (!data) return null;
        return new Promise((resolve, reject) => {
            const e = new FileReader();
            e.onload = () => resolve(e.result);
            e.onerror = reject;
            e.readAsText(data);
        });
    }

    async getJSON(name) {
        const data = await this.getData(name);
        if (!data) return null;
        return new Promise((resolve, reject) => {
            const e = new FileReader();
            e.onload = () => resolve(JSON.parse(e.result));
            e.onerror = reject;
            e.readAsText(data);
        });
    }

    async getRespone(name) {
        const data = await this.getData(name)
        if (!data) return null;
        return new Response(data);
    }

    async getReadStream(name) {
        const data = await this.getData(name)
        if (!data) return null;
        return new Response(data).body;
    }

    async createReadStream(name) {
        return this.getReadStream(name);
    }

    static parseParameter(...args) {
        // 1. default
        let name = null;
        let data = null;
        let offset = 0;
        let append = false;
        let truncate = false;

        // 2. iterate through parameters
        for (const e of args) {
            if (!e) {
                continue;
            }
            else if (typeof e == 'string') {
                name = e;
            }
            else if (typeof e == 'object') {
                if (typeof e.name == 'string') name = e.name;
                if (typeof e.data != 'undefined') data = e.data instanceof Blob ? e.data : new Blob([e.data]);
                if (typeof e.offset != 'undefined') offset = e.offset;
                if (typeof e.append != 'undefined') append = e.append;
                if (typeof e.truncate != 'undefined') truncate = e.truncate;
                if (e instanceof Blob) data = e;
            }
        }

        if (name && typeof name != 'string') {
            throw new TypeError(`ChromeCacheDB: parameter name expect string but get ${name.constructor.name}`);
        }
        return { name, data, offset, append, truncate };
    }

    static isSupported() {
        return Boolean(window.IDBMutableFile);
    }

    static async promisifyRequest(req) {
        return new Promise((resolve, reject) => {
            const onsuccess = req.onsuccess;
            req.onsuccess = onsuccess ? (() => resolve(onsuccess.call(req, req.result))) : (() => resolve(req.result));
            req.onerror = () => reject(req.error);
        });
    }

    static async cloneBlob(file) {
        if (!(file instanceof Blob)) throw new TypeError(`cloneBlob: parameter file expect Blob but get ${file.constructor.name}`);
        return new Response(file).blob();
    }

    static async quota() {
        if (navigator.storage) {
            return navigator.storage.estimate();
        }
        else {
            return { usage: -1, quota: -1 };
        }
    }
}
