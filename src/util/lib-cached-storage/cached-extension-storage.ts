/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import CommonCachedStorage from './common-cached-storage.js';

interface StorageArea {
    get(name?: string | string[] | { [name: string]: any }): Promise<{ [name: string]: any }>
    set(name: { [name: string]: any }): Promise<void>
    remove(name: string | string[] | { [name: string]: any }): Promise<void>
    clear(): Promise<void>
}

class CachedExtensionStorage implements CommonCachedStorage {
    storage: StorageArea
    cache: { [key: string]: string | null }

    constructor(storage: StorageArea) {
        this.storage = storage;
        this.cache = {};
    }

    async setItem(name: string, item: string) {
        const string = '' + item;
        this.cache[name] = string;
        return await this.storage.set({ [name]: string });
    }

    async setJSON(name: string, item: any) {
        const string = JSON.stringify(item);
        this.cache[name] = string;
        return await this.storage.set({ [name]: string });
    }

    async getItem(name: string) {
        if (this.cache[name] === undefined) {
            return this.cache[name] = (await this.storage.get(name))[name] || null as string | null;
        }
        return this.cache[name];
    }

    async getJSON(name: string) {
        if (this.cache[name] === undefined) {
            this.cache[name] = (await this.storage.get(name))[name] || null as string | null;
        }
        return this.cache[name] === null ? null : JSON.parse(this.cache[name]!);
    }

    async removeItem(name: string) {
        this.cache[name] = null;
        return await this.storage.remove(name);
    }

    async clear() {
        this.cache = {};
        await this.storage.clear();
    }

    clearCache() {
        this.cache = {};
    }

    get length() {
        return this.storage.get().then(cache => {
            this.cache = cache;
            return Object.keys(cache).length;
        });
    }

    async * keys() {
        this.cache = await this.storage.get();
        yield* Object.keys(this.cache);
    }

    async * values() {
        this.cache = await this.storage.get();
        yield* Object.values(this.cache) as string[];
    }

    async * entries() {
        this.cache = await this.storage.get();
        yield* Object.entries(this.cache) as [string, string][];
    }

    [Symbol.asyncIterator]() {
        return this.entries()[Symbol.asyncIterator];
    }
}

export default CachedExtensionStorage;
