/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
class CachedDOMStorage {
    constructor(storage = localStorage) {
        this.storage = storage;
        this.cache = {};
    }
    setItem(name, item) {
        const string = '' + item;
        this.cache[name] = string;
        return this.storage.setItem(name, string);
    }
    setJSON(name, item) {
        const string = JSON.stringify(item);
        this.cache[name] = string;
        return this.storage.setItem(name, string);
    }
    getItem(name) {
        if (this.cache[name] === undefined) {
            return this.cache[name] = this.storage.getItem(name);
        }
        return this.cache[name];
    }
    getJSON(name) {
        if (this.cache[name] === undefined) {
            this.cache[name] = this.storage.getItem(name);
        }
        return this.cache[name] === null ? null : JSON.parse(this.cache[name]);
    }
    removeItem(name) {
        this.cache[name] = null;
        return this.storage.removeItem(name);
    }
    clear() {
        this.cache = {};
        return this.storage.clear();
    }
    clearCache() {
        this.cache = {};
    }
    get length() {
        return this.storage.length;
    }
    *keys() {
        for (let i = 0; i < this.storage.length; i++) {
            yield this.storage.key(i);
        }
    }
    values() {
        return Object.values(this.storage);
    }
    entries() {
        this.cache = { ...this.storage };
        return Object.entries(this.cache);
    }
    [Symbol.iterator]() {
        return this.entries()[Symbol.iterator];
    }
}
export default CachedDOMStorage;
//# sourceMappingURL=cached-dom-storage.js.map