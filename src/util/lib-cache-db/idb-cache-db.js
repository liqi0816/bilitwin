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
class IDBCacheDB {
    constructor(dbName, storeName = 'flv', { maxItemSize = 100 * 1024 * 1024 } = {}) {
        // Neither Chrome or Firefox can handle item size > 100M
        this.dbName = dbName;
        this.storeName = storeName;
        this.maxItemSize = maxItemSize;
        this.db = null;
    }

    async getDB() {
        if (this.db) return this.db;
        this.db = new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(this.dbName);
            openRequest.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'name' });
                }
            }
            openRequest.onsuccess = e => {
                return resolve(this.db = e.target.result);
            }
            openRequest.onerror = reject;
        });
        return this.db;
    }

    async createData(item, name = item.name) {
        if (!item instanceof File) throw 'CacheDB: item must be a File';
        const itemChunks = [];
        const numChunks = Math.ceil(item.size / this.maxItemSize);
        for (let i = 0; i < numChunks; i++) {
            itemChunks.push({
                name: `${name}/part_${i}`,
                numChunks,
                item: item.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
            });
        }

        const db = await this.getDB();
        const reqCascade = new Promise((resolve, reject) => {
            const objectStore = db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
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

    async setData(item, name = item.name) {
        if (!item instanceof File) throw 'CacheDB: item must be a File';
        const itemChunks = [];
        const numChunks = Math.ceil(item.size / this.maxItemSize);
        for (let i = 0; i < numChunks; i++) {
            itemChunks.push({
                name: `${name}/part_${i}`,
                numChunks,
                item: item.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
            });
        }

        const db = await this.getDB();
        const reqCascade = new Promise((resolve, reject) => {
            const objectStore = db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
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
        const db = await this.getDB();
        const reqCascade = new Promise((resolve, reject) => {
            const dataChunks = [];
            const objectStore = db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
            const probe = objectStore.get(`${name}/part_0`);
            probe.onerror = reject;
            probe.onsuccess = e => {
                // 1. Probe fails => key does not exist
                if (!probe.result) return resolve(null);

                // 2. How many chunks to retrieve?
                const { numChunks } = probe.result;

                // 3. Cascade on the remaining chunks
                const onsuccess = e => {
                    dataChunks.push(e.target.result.item);
                    if (dataChunks.length == numChunks) return resolve(dataChunks);
                    const req = objectStore.get(`${name}/part_${dataChunks.length}`);
                    req.onerror = reject;
                    req.onsuccess = onsuccess;
                };
                onsuccess(e);
            }
        });

        const dataChunks = await reqCascade;

        return dataChunks ? new File(dataChunks, name) : null;
    }

    async deleteData(name) {
        const reqCascade = new Promise(async (resolve, reject) => {
            let currentChunkNum = 0;
            const db = await this.getDB();
            const objectStore = db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
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
            }
        });

        return reqCascade;
    }

    async deleteAllData() {
        const db = await this.getDB();
        const objectStore = db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
        const req = objectStore.clear();
        return new Promise((resolve, reject) => {
            req.onsuccess = resolve;
            req.onerror = reject;
        });
    }

    async deleteEntireDB() {
        const req = indexedDB.deleteDatabase(this.dbName);
        return new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(this.db = null);
            req.onerror = reject;
        });
    }

    static get isSupported() {
        return typeof indexedDB == 'object';
    }

    static async _UNIT_TEST() {
        let db = new CacheDB();
        console.warn('Storing 201MB...');
        console.log(await db.putData(new Blob([new ArrayBuffer(201 * 1024 * 1024)]), 'test'));
        console.warn('Deleting 201MB...');
        console.log(await db.deleteData('test'));
    }
}

export default IDBCacheDB;
