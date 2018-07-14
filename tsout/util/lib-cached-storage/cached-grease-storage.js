/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
class CachedGreaseStorage {
    constructor(storage = GM) {
        this.storage = storage;
        this.cache = {};
    }
    async setItem(name, item) {
        const string = '' + item;
        this.cache[name] = string;
        return await this.storage.setValue(name, string);
    }
    async setJSON(name, item) {
        const string = JSON.stringify(item);
        this.cache[name] = string;
        return await this.storage.setValue(name, string);
    }
    async getItem(name) {
        if (this.cache[name] === undefined) {
            return this.cache[name] = await this.storage.getValue(name, null);
        }
        return this.cache[name];
    }
    async getJSON(name) {
        if (this.cache[name] === undefined) {
            this.cache[name] = await this.storage.getValue(name, null);
        }
        return this.cache[name] === null ? null : JSON.parse(this.cache[name]);
    }
    async removeItem(name) {
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
    async *keys() {
        yield* await this.storage.listValues();
    }
    async *values() {
        for (const name of await this.storage.listValues()) {
            yield this.getItem(name);
        }
    }
    async *entries() {
        for (const name of await this.storage.listValues()) {
            yield [name, await this.getItem(name)];
        }
    }
    [Symbol.asyncIterator]() {
        return this.entries()[Symbol.asyncIterator];
    }
}
export default CachedGreaseStorage;
//# sourceMappingURL=cached-grease-storage.js.map