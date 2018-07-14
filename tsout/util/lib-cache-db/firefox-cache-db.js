/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import BaseMutableCacheDB from './base-mutable-cache-db.js';
/**
 * A promisified cache database backed by firefox idbMutableFile
 *
 * Firefox still do not have stream support by default. :(
 */
class FirefoxCacheDB extends BaseMutableCacheDB {
    /**
     * === NOTICE: Blobs may mutate! ===
     *
     * In both Chrome and Firefox, instances of File are actually real-time
     * references to the hard disk. The problem is that File extends Blob -
     * which means they by spec should not mutate. While in most cases the user
     * will not edit the file s/he is going to upload, there still exist some
     * edge cases. Unfortunately, this library is very likely to trigger one.
     *
     * To fix this "mutable Blob" problem, by default all get-* functions will
     * return a snapshot instead of the real-time references. This may leads to
     * more RAM consumption and/or more delay. If you are aware of this problem
     * and decide to handle it yourself, please set mutableBlob to true.
     *
     * @param dbName database name
     * @param storeName store name
     * @param mutableBlob allow mutable Blob
     */
    constructor(dbName, storeName, { mutableBlob = false } = {}) {
        super(dbName, storeName);
        this.mutableBlob = mutableBlob;
        this.db = null;
    }
    async getDB() {
        if (this.db)
            return this.db;
        else
            return this.db = (async () => {
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
    async createData(item, name = item.name) {
        name = typeof name === 'object' ? name.name : name;
        if (!name)
            throw new TypeError(`CommonCacheDB.prototype.createData: cannot find name in parameters`);
        if (!(item instanceof ArrayBuffer))
            item = await FirefoxCacheDB.blobToArrayBuffer(item);
        const db = await this.getDB();
        const file = await FirefoxCacheDB.promisifyRequest(db.createMutableFile(name));
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        await FirefoxCacheDB.promisifyRequest(store.add(file));
        const lockedFile = file.open('readwrite');
        return await FirefoxCacheDB.promisifyRequest(lockedFile.write(item));
    }
    async setData(item, name = item.name, options = typeof name == 'object' ? name : {}) {
        name = typeof name === 'object' ? name.name : name;
        if (!name)
            throw new TypeError(`CommonCacheDB.prototype.setData: cannot find name in parameters`);
        if (!(item instanceof ArrayBuffer))
            item = await FirefoxCacheDB.blobToArrayBuffer(item);
        const { offset, append, truncate } = options;
        const file = await this.createFileHandle(name);
        const lockedFile = file.open('readwrite');
        if (append) {
            return await FirefoxCacheDB.promisifyRequest(lockedFile.append(item));
        }
        else {
            if (offset)
                lockedFile.location = offset;
            const req = lockedFile.write(item);
            if (truncate) {
                req.onsuccess = async () => {
                    return await FirefoxCacheDB.promisifyRequest(lockedFile.truncate(lockedFile.location));
                };
            }
            return FirefoxCacheDB.promisifyRequest(req);
        }
    }
    async appendData(item, name = item.name, options = typeof name == 'object' ? name : {}) {
        name = typeof name === 'object' ? name.name : name;
        if (!name)
            throw new TypeError(`CommonCacheDB.prototype.appendData: cannot find name in parameters`);
        return this.setData(item, name, { ...options, append: true });
    }
    async getData(name) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
        const file = await FirefoxCacheDB.promisifyRequest(store.get(name));
        if (!file)
            return null;
        const item = await FirefoxCacheDB.promisifyRequest(file.getFile());
        if (this.mutableBlob)
            return item;
        return FirefoxCacheDB.cloneBlob(item);
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
    async renameData(name, newName) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const req = store.get(name);
        req.onsuccess = async () => {
            const file = req.result;
            if (!file)
                throw new DOMException('NotFoundError', 'NotFoundError');
            await FirefoxCacheDB.promisifyRequest(store.delete(name));
            return file;
        };
        const file = await FirefoxCacheDB.promisifyRequest(req);
        const item = await FirefoxCacheDB.promisifyRequest(file.getFile());
        return await this.createData(item, newName);
    }
    async createFileHandle(name) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const old = await FirefoxCacheDB.promisifyRequest(store.get(name));
        const file = old instanceof IDBMutableFile ? old : await FirefoxCacheDB.promisifyRequest(db.createMutableFile(name));
        if (!old) {
            const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
            await FirefoxCacheDB.promisifyRequest(store.add(file));
        }
        return file;
    }
    async createWriteSink({ name, offset = 0, append = false, truncate = false }) {
        const file = await this.createFileHandle(name);
        let lockedFile = file.open('readwrite');
        let lastOffset = 0;
        if (offset)
            lastOffset = offset;
        return ({
            async write(data) {
                if (!(data instanceof ArrayBuffer))
                    data = await FirefoxCacheDB.blobToArrayBuffer(data);
                if (!lockedFile.active)
                    lockedFile = file.open('readwrite');
                if (append) {
                    return await FirefoxCacheDB.promisifyRequest(lockedFile.append(data));
                }
                else {
                    lockedFile.location = lastOffset;
                    const result = await FirefoxCacheDB.promisifyRequest(lockedFile.write(data));
                    lastOffset = lockedFile.location;
                    return result;
                }
            },
            async close() {
                if (truncate) {
                    if (!lockedFile.active)
                        lockedFile = file.open('readwrite');
                    return await FirefoxCacheDB.promisifyRequest(lockedFile.truncate(lastOffset));
                }
            }
        });
    }
    async createWriteStream(name, options = typeof name == 'object' ? name : {}) {
        name = typeof name === 'object' ? name.name : name;
        return new WritableStream(await this.createWriteSink({ ...options, name }));
    }
    static get isSupported() {
        return typeof IDBMutableFile == 'function';
    }
    static async promisifyRequest(req) {
        return new Promise((resolve, reject) => {
            const onsuccess = req.onsuccess;
            req.onsuccess = onsuccess ? (e => resolve(onsuccess.call(req, e))) : (() => resolve(req.result));
            req.onerror = () => reject(req.error);
        });
    }
    static async blobToArrayBuffer(item) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
        });
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
export default FirefoxCacheDB;
//# sourceMappingURL=firefox-cache-db.js.map