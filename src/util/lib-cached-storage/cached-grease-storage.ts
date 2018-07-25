/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import CommonCachedStorage from './common-cached-storage.js';

export interface GreaseStorage {
    setValue(name: string, item: string | number | boolean): Promise<void>
    getValue(name: string): Promise<string | number | boolean | undefined>
    getValue<T>(name: string, def: T): Promise<string | number | boolean | T>
    listValues(): Promise<string[]>
    deleteValue(name: string): Promise<void>
}
declare const GM: GreaseStorage

class CachedGreaseStorage implements CommonCachedStorage {
    storage: GreaseStorage
    cache: { [key: string]: string | null }

    constructor(storage = GM) {
        this.storage = storage;
        this.cache = {};
    }

    async setItem(name: string, item: string) {
        const string = '' + item;
        this.cache[name] = string;
        return await this.storage.setValue(name, string);
    }

    async setJSON(name: string, item: any) {
        const string = JSON.stringify(item);
        this.cache[name] = string;
        return await this.storage.setValue(name, string);
    }

    async getItem(name: string) {
        if (this.cache[name] === undefined) {
            return this.cache[name] = await this.storage.getValue(name, null) as string | null;
        }
        return this.cache[name];
    }

    async getJSON(name: string) {
        if (this.cache[name] === undefined) {
            this.cache[name] = await this.storage.getValue(name, null) as string | null;
        }
        return this.cache[name] === null ? null : JSON.parse(this.cache[name]!);
    }

    async removeItem(name: string) {
        this.cache[name] = null;
        return await this.storage.deleteValue(name);
    }

    async clear() {
        this.cache = {};
        await Promise.all((await this.storage.listValues()).map(name => this.storage.deleteValue(name)));
    }

    clearCache() {
        this.cache = {};
    }

    get length() {
        return this.storage.listValues().then(({ length }) => length);
    }

    async * keys() {
        yield* await this.storage.listValues()
    }

    async * values() {
        for (const name of await this.storage.listValues()) {
            yield this.getItem(name) as Promise<string>;
        }
    }

    async * entries() {
        for (const name of await this.storage.listValues()) {
            yield [name, await this.getItem(name) as string] as [string, string];
        }
    }

    [Symbol.asyncIterator]() {
        return this.entries()[Symbol.asyncIterator];
    }
}

export default CachedGreaseStorage;
