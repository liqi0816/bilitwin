/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import CommonCacheDB, { navigator, FileLike } from './common-cache-db.js';
import { ForceOverride } from '../common-types.js';

export interface ItemChunk {
    name: string
    numChunks: number
    item: Blob
}

export type CacheDBItemIDBRequest<T = ItemChunk | undefined> = ForceOverride<IDBRequest, {
    onsuccess: ((this: CacheDBItemIDBRequest<T>, ev: Event & { target: typeof this }) => void) | null
    result: T
}>

/**
 * A promisified indexedDB with large file(>100MB) support
 */
class IDBCacheDB implements CommonCacheDB {
    dbName: string
    storeName: string
    maxItemSize: number
    db: Promise<IDBDatabase> | IDBDatabase | null

    constructor(dbName: string, storeName = 'flv', { maxItemSize = 100 * 1024 * 1024 } = {}) {
        // Neither Chrome or Firefox can handle item size > 100M
        this.dbName = dbName;
        this.storeName = storeName;
        this.maxItemSize = maxItemSize;
        this.db = null;
    }

    async getDB() {
        if (this.db) return this.db;
        this.db = new Promise((resolve, reject) => {
            const req = indexedDB.open(this.dbName);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'name' });
                }
            }
            req.onsuccess = () => {
                return resolve(this.db = req.result);
            }
            req.onerror = reject;
        });
        return this.db;
    }

    async createData(item: Blob, name: string): Promise<Event>
    async createData(item: FileLike, name = item.name) {
        const itemChunks = [] as ItemChunk[];
        const numChunks = Math.ceil(item.size / this.maxItemSize);
        for (let i = 0; i < numChunks; i++) {
            itemChunks.push({
                name: `${name}.part_${i}`,
                numChunks,
                item: item.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
            });
        }

        const db = await this.getDB();
        const reqCascade = new Promise<Event>((resolve, reject) => {
            const objectStore = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
            const onsuccess = (e: Event = new Event('zerowrite')) => {
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

    async setData(item: Blob, name: string): Promise<Event>
    async setData(item: FileLike, name = item.name) {
        const itemChunks = [] as ItemChunk[];
        const numChunks = Math.ceil(item.size / this.maxItemSize);
        for (let i = 0; i < numChunks; i++) {
            itemChunks.push({
                name: `${name}.part_${i}`,
                numChunks,
                item: item.slice(i * this.maxItemSize, (i + 1) * this.maxItemSize)
            });
        }

        const db = await this.getDB();
        const reqCascade = new Promise<Event>((resolve, reject) => {
            const objectStore = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
            const onsuccess = (e: Event = new Event('zerowrite')) => {
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

    async getData(name: string) {
        const db = await this.getDB();
        const reqCascade = new Promise<Blob[] | null>((resolve, reject) => {
            const dataChunks = [] as Blob[];
            const objectStore = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
            const probe = objectStore.get(`${name}.part_0`) as CacheDBItemIDBRequest;
            probe.onerror = reject;
            probe.onsuccess = e => {
                // 1. Probe fails => key does not exist
                if (!probe.result) return resolve(null);

                // 2. How many chunks to retrieve?
                const { numChunks } = probe.result;

                // 3. Cascade on the remaining chunks
                const onsuccess = ({ target: { result: { item } } }: { target: CacheDBItemIDBRequest<ItemChunk> }) => {
                    dataChunks.push(item);
                    if (dataChunks.length == numChunks) return resolve(dataChunks);
                    const req = objectStore.get(`${name}.part_${dataChunks.length}`) as CacheDBItemIDBRequest<ItemChunk>;
                    req.onerror = reject;
                    req.onsuccess = onsuccess;
                };
                onsuccess(e as { target: CacheDBItemIDBRequest<ItemChunk> });
            }
        });

        const dataChunks = await reqCascade;

        return dataChunks ? new File(dataChunks, name) : null;
    }

    async hasData(name: string) {
        const db = await this.getDB();
        return new Promise<boolean>((resolve, reject) => {
            const objectStore = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
            const probe = objectStore.count(`${name}.part_0`) as CacheDBItemIDBRequest<number>;
            probe.onerror = reject;
            probe.onsuccess = e => {
                resolve(Boolean(probe.result));
            }
        });
    }

    async deleteData(name: string) {
        const db = await this.getDB();
        const reqCascade = new Promise<Event | null>((resolve, reject) => {
            let currentChunkNum = 0;
            const objectStore = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
            const probe = objectStore.get(`${name}.part_0`) as CacheDBItemIDBRequest;
            probe.onerror = reject;
            probe.onsuccess = e => {
                // 1. Probe fails => key does not exist
                if (!probe.result) return resolve(null);

                // 2. How many chunks to delete?
                const { numChunks } = probe.result;

                // 3. Cascade on the remaining chunks
                const onsuccess = (e: Event = new Event('zerowrite')) => {
                    if (currentChunkNum === numChunks) return resolve(e);
                    const req = objectStore.delete(`${name}.part_${currentChunkNum}`);
                    req.onerror = reject;
                    req.onsuccess = onsuccess;
                    currentChunkNum++;
                };
                onsuccess();
            }
        });

        return reqCascade;
    }

    async deleteAllData() {
        const db = await this.getDB();
        const objectStore = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const req = objectStore.clear();
        return new Promise<Event>((resolve, reject) => {
            req.onsuccess = resolve;
            req.onerror = reject;
        });
    }

    async deleteEntireDB() {
        const req = indexedDB.deleteDatabase(this.dbName);
        return new Promise<null>((resolve, reject) => {
            req.onsuccess = () => resolve(this.db = null);
            req.onerror = reject;
        });
    }

    static get isSupported() {
        return typeof indexedDB == 'object';
    }

    static async quota() {
        if (navigator.storage) {
            return navigator.storage.estimate();
        }
        else if (navigator.webkitTemporaryStorage) {
            return new Promise<{ usage: number, quota: number }>(resolve => {
                navigator.webkitTemporaryStorage!.queryUsageAndQuota((usage: number, quota: number) => resolve({ usage, quota }));
            })
        }
        else {
            return { usage: -1, quota: -1 };
        }
    }
}

const _UNIT_TEST = async () => {
    let db = new IDBCacheDB('test');
    console.warn('Storing 201MB...');
    console.log(await db.setData(new Blob([new ArrayBuffer(201 * 1024 * 1024)]), 'test'));
    console.warn('Deleting 201MB...');
    console.log(await db.deleteData('test'));
}

export default IDBCacheDB;
