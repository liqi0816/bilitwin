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
 * A streamified + promisified cache database backed by webkit filesystem
 */
class ChromeCacheDB {
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
     * @param {boolean} [option.mutableBlob=false] allow mutable Blob
     */
    constructor(dbName, storeName, { mutableBlob = false } = {}) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.mutableBlob = mutableBlob;
        this.db = null;
        this.store = null;
    }

    async getDB() {
        if (this.db) return this.db;
        else return this.db = (async () => {
            const { root } = await new Promise((window.webkitRequestFileSystem || window.webkitRequestFileSystem).bind(window, 0, 0));
            return this.db = await new Promise(root.getDirectory.bind(root, this.dbName, { create: true }));
        })();
    }

    async getStore() {
        if (this.store) return this.store;
        else return this.store = (async () => {
            const db = await this.getDB();
            return this.store = await new Promise(db.getDirectory.bind(db, this.storeName, { create: true }));
        })();
    }

    async createData(...args) {
        const { name, data } = ChromeCacheDB.parseParameter(...args);
        const store = await this.getStore();
        const file = await new Promise(store.getFile.bind(store, name, { create: true, exclusive: true }));
        const writer = await new Promise(file.createWriter.bind(file));
        return new Promise((resolve, reject) => {
            writer.onwriteend = resolve;
            writer.onerror = reject;
            writer.write(data);
        });
    }

    async setData(...args) {
        const { name, data, offset, append, truncate } = ChromeCacheDB.parseParameter(...args);
        const writer = await this.createWriter({ name, offset, append });
        return new Promise((resolve, reject) => {
            writer.onwriteend = truncate ? () => {
                writer.truncate(writer.position);
                writer.onwriteend = resolve;
            } : resolve;
            writer.onerror = reject;
            writer.write(data);
        });
    }

    async appendData(...args) {
        return this.setData(...args, { append: true });
    }

    async getData(name) {
        const store = await this.getStore();
        const file = await new Promise(store.getFile.bind(store, name, { create: false }))
            .catch(e => { if (e.name != 'NotFoundError') throw e; return null; });
        if (!file) return null;
        const data = await new Promise(file.file.bind(file));
        if (this.mutableBlob) return data;
        return ChromeCacheDB.cloneBlob(data);
    }

    async deleteData(name) {
        const store = await this.getStore();
        const file = await new Promise(store.getFile.bind(store, name, { create: false }))
            .catch(e => { if (e.name != 'NotFoundError') throw e; return null; });
        if (!file) return null;
        return new Promise(file.remove.bind(file));
    }

    async deleteAllData() {
        const store = await this.getStore();
        return new Promise(store.removeRecursively.bind(store));
    }

    async deleteEntireDB() {
        const db = await this.getStore();
        return new Promise(db.removeRecursively.bind(db));
    }

    async createWriter(...args) {
        const { name, offset, append } = ChromeCacheDB.parseParameter(...args);
        const store = await this.getStore();
        const file = await new Promise(store.getFile.bind(store, name, { create: true, exclusive: false }));
        const writer = await new Promise(file.createWriter.bind(file));
        if (offset) writer.seek(offset);
        if (append) writer.seek(writer.length);
        return writer;
    }

    async createWriteSink(...args) {
        const { name, offset, append, truncate } = ChromeCacheDB.parseParameter(...args);
        const writer = await this.createWriter({ name, offset, append });
        return {
            write(data) {
                return new Promise((resolve, reject) => {
                    writer.onwriteend = resolve;
                    writer.onerror = reject;
                    writer.write(new Blob([data]));
                });
            },
            close() {
                if (truncate) {
                    return new Promise((resolve, reject) => {
                        writer.onwriteend = resolve;
                        writer.onerror = reject;
                        writer.truncate(writer.position);
                    });
                }
            }
        };
    }

    async createWriteStream(...args) {
        return new WritableStream(await this.createWriteSink(...args));
    }

    async getFileURL(name) {
        const store = await this.getStore();
        const file = await new Promise(store.getFile.bind(store, name, { create: false }))
            .catch(e => { if (e.name != 'NotFoundError') throw e; return null; });
        if (!file) return null;
        return file.toURL();
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

    get createReadStream() {
        return this.getReadStream;
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
            throw new TypeError(`ChromeCacheDB: parameter name expect string but get ${name}`);
        }
        return { name, data, offset, append, truncate };
    }

    static isSupported() {
        return Boolean(window.webkitRequestFileSystem);
    }

    static async cloneBlob(file) {
        if (!(file instanceof Blob)) throw new TypeError(`cloneBlob: parameter file expect Blob but get ${file}`);
        return new Response(file).blob();
    }

    static async quota() {
        if (navigator.storage) {
            return navigator.storage.estimate();
        }
        else if (navigator.webkitTemporaryStorage) {
            return new Promise(resolve => {
                navigator.webkitTemporaryStorage.queryUsageAndQuota(([usage, quota]) => resolve({ usage, quota }));
            })
        }
        else {
            return { usage: -1, quota: -1 };
        }
    }
}

export default ChromeCacheDB;
