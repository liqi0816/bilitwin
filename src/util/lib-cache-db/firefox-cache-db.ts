/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MutationInit, NamedMutationInit, NamedArrayBuffer } from './base-mutable-cache-db.js';
import { CommonEventTargetInterface } from '../simple-event-target.js';
import BaseMutableCacheDB from './base-mutable-cache-db.js';
import { Constructor } from '../common-types.js';
import WritableStreamConstructor from '../lib-util-streams/writablestream-types.js';
import { StorageNavigator, FileLike } from './common-cache-db.js';

declare const navigator: StorageNavigator
declare const WritableStream: WritableStreamConstructor

export interface LockedFile {
    write(data: ArrayBuffer): IDBRequest
    append(data: ArrayBuffer): IDBRequest
    truncate(location?: number): IDBRequest
    location: number
    readonly active: boolean
}

export interface IDBMutableFile extends CommonEventTargetInterface<{ abort: ProgressEvent, error: ProgressEvent }> {
    readonly name: string
    readonly type: string
    onabort: (this: IDBMutableFile, event: ProgressEvent) => void
    onerror: (this: IDBMutableFile, event: ProgressEvent) => void
    open(mode: 'readonly' | 'readwrite'): LockedFile
    getFile(): IDBRequest
}
declare const IDBMutableFile: Constructor<IDBMutableFile>

export interface MozIDBDatabase extends IDBDatabase {
    createMutableFile(name: string): IDBRequest
}

/**
 * A promisified cache database backed by firefox idbMutableFile
 * 
 * Firefox still do not have stream support by default. :(
 */
class FirefoxCacheDB extends BaseMutableCacheDB {
    mutableBlob: boolean
    db: Promise<MozIDBDatabase> | MozIDBDatabase | null

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
    constructor(dbName: string, storeName: string, { mutableBlob = false } = {}) {
        super(dbName, storeName);
        this.mutableBlob = mutableBlob;
        this.db = null;
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
            return this.db = await FirefoxCacheDB.promisifyRequest(req) as MozIDBDatabase;
        })();
    }

    async createData(item: FileLike | NamedArrayBuffer): Promise<void>
    async createData(item: Blob | ArrayBuffer, name: string): Promise<void>
    async createData(item: Blob | ArrayBuffer, options: NamedMutationInit): Promise<void>
    async createData(item: (Blob | ArrayBuffer) & { name?: string }, name: string | NamedMutationInit | undefined = item.name) {
        name = typeof name === 'object' ? name.name : name;
        if (!name) throw new TypeError(`CommonCacheDB.prototype.createData: cannot find name in parameters`);
        if (!(item instanceof ArrayBuffer)) item = await FirefoxCacheDB.blobToArrayBuffer(item);
        const db = await this.getDB();
        const file = await FirefoxCacheDB.promisifyRequest(db.createMutableFile(name)) as IDBMutableFile;
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        await FirefoxCacheDB.promisifyRequest(store.add(file));
        const lockedFile = file.open('readwrite');
        return await FirefoxCacheDB.promisifyRequest(lockedFile.write(item));
    }

    async setData(item: FileLike | NamedArrayBuffer, options?: MutationInit): Promise<void>
    async setData(item: Blob | ArrayBuffer, name: string, options?: MutationInit): Promise<void>
    async setData(item: Blob | ArrayBuffer, options: NamedMutationInit): Promise<void>
    async setData(item: (Blob | ArrayBuffer) & { name?: string }, name: string | MutationInit | undefined = item.name, options: MutationInit = typeof name == 'object' ? name : {}) {
        name = typeof name === 'object' ? name.name : name;
        if (!name) throw new TypeError(`CommonCacheDB.prototype.setData: cannot find name in parameters`);
        if (!(item instanceof ArrayBuffer)) item = await FirefoxCacheDB.blobToArrayBuffer(item);
        const { offset, append, truncate } = options;
        const file = await this.createFileHandle(name);
        const lockedFile = file.open('readwrite');
        if (append) {
            return await FirefoxCacheDB.promisifyRequest(lockedFile.append(item));
        }
        else {
            if (offset) lockedFile.location = offset;
            const req = lockedFile.write(item);
            if (truncate) {
                req.onsuccess = async () => {
                    return await FirefoxCacheDB.promisifyRequest(lockedFile.truncate(lockedFile.location));
                }
            }
            return FirefoxCacheDB.promisifyRequest(req);
        }
    }

    async appendData(item: FileLike | NamedArrayBuffer, options?: MutationInit): Promise<void>
    async appendData(item: Blob | ArrayBuffer, name: string, options?: MutationInit): Promise<void>
    async appendData(item: Blob | ArrayBuffer, options: NamedMutationInit): Promise<void>
    async appendData(item: (Blob | ArrayBuffer) & { name?: string }, name: string | MutationInit | undefined = item.name, options: MutationInit = typeof name == 'object' ? name : {}) {
        name = typeof name === 'object' ? name.name : name;
        if (!name) throw new TypeError(`CommonCacheDB.prototype.appendData: cannot find name in parameters`);
        return this.setData(item, name, { ...options, append: true });
    }

    async getData(name: string) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
        const file = await FirefoxCacheDB.promisifyRequest(store.get(name)) as IDBMutableFile;
        if (!file) return null;
        const item = await FirefoxCacheDB.promisifyRequest(file.getFile()) as File;
        if (this.mutableBlob) return item;
        return FirefoxCacheDB.cloneBlob(item);
    }

    async hasData(name: string) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
        return Boolean(await FirefoxCacheDB.promisifyRequest(store.count(name)));
    }

    async deleteData(name: string) {
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

    async renameData(name: string, newName: string) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const req = store.get(name);
        req.onsuccess = async () => {
            const file = req.result;
            if (!file) throw new DOMException('NotFoundError', 'NotFoundError');
            await FirefoxCacheDB.promisifyRequest(store.delete(name));
            return file;
        }
        const file = await FirefoxCacheDB.promisifyRequest(req) as IDBMutableFile;
        const item = await FirefoxCacheDB.promisifyRequest(file.getFile()) as File;
        return await this.createData(item, newName);
    }

    async createFileHandle(name: string) {
        const db = await this.getDB();
        const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const old = await FirefoxCacheDB.promisifyRequest(store.get(name));
        const file = old instanceof IDBMutableFile ? old : await FirefoxCacheDB.promisifyRequest(db.createMutableFile(name)) as IDBMutableFile;
        if (!old) {
            const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
            await FirefoxCacheDB.promisifyRequest(store.add(file));
        }
        return file;
    }

    async createWriteSink({ name, offset = 0, append = false, truncate = false }: NamedMutationInit) {
        const file = await this.createFileHandle(name);
        let lockedFile = file.open('readwrite');
        let lastOffset = 0;
        if (offset) lastOffset = offset;
        return ({
            async write(data: Blob | ArrayBuffer) {
                if (!(data instanceof ArrayBuffer)) data = await FirefoxCacheDB.blobToArrayBuffer(data);
                if (!lockedFile.active) lockedFile = file.open('readwrite');
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
                    if (!lockedFile.active) lockedFile = file.open('readwrite');
                    return await FirefoxCacheDB.promisifyRequest(lockedFile.truncate(lastOffset));
                }
            }
        });
    }

    async createWriteStream(options: NamedMutationInit): Promise<WritableStream>
    async createWriteStream(name: string, options?: MutationInit): Promise<WritableStream>
    async createWriteStream(name: string | NamedMutationInit, options: MutationInit = typeof name == 'object' ? name : {}) {
        name = typeof name === 'object' ? name.name : name;
        return new WritableStream(await this.createWriteSink({ ...options, name }));
    }

    static get isSupported() {
        return typeof IDBMutableFile == 'function';
    }

    static async promisifyRequest<T extends IDBRequest>(req: T) {
        return new Promise<T['onsuccess'] extends (...args: any[]) => infer U ? U : T['result']>((resolve, reject) => {
            const onsuccess = req.onsuccess;
            req.onsuccess = onsuccess ? (e => resolve(onsuccess.call(req, e))) : (() => resolve(req.result));
            req.onerror = () => reject(req.error);
        });
    }

    static async blobToArrayBuffer(item: Blob) {
        return new Promise<ArrayBuffer>((resolve, reject) => {
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
