/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import CommonCachedStorage from './common-cached-storage.js';
import { str } from '../type-conversion.macro.js';

class CachedDOMStorage implements CommonCachedStorage {
    storage: Storage
    cache: { [key: string]: string | null }

    constructor(storage = localStorage) {
        this.storage = storage;
        this.cache = {};
    }

    setItem(name: string, item: string) {
        const string = str(item);
        this.cache[name] = string;
        return this.storage.setItem(name, string);
    }

    setJSON(name: string, item: any) {
        const string = JSON.stringify(item);
        this.cache[name] = string;
        return this.storage.setItem(name, string);
    }

    getItem(name: string) {
        if (this.cache[name] === undefined) {
            return this.cache[name] = this.storage.getItem(name);
        }
        return this.cache[name];
    }

    getJSON(name: string) {
        if (this.cache[name] === undefined) {
            this.cache[name] = this.storage.getItem(name);
        }
        return this.cache[name] === null ? null : JSON.parse(this.cache[name]!);
    }

    removeItem(name: string) {
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

    * keys() {
        for (let i = 0; i < this.storage.length; i++) {
            yield this.storage.key(i) as string;
        }
    }

    values() {
        return Object.values(this.storage) as Iterable<string>;
    }

    entries() {
        this.cache = { ...this.storage } as any as this['cache'];
        return Object.entries(this.cache) as Iterable<[string, string]>;
    }

    [Symbol.iterator]() {
        return this.entries()[Symbol.iterator]();
    }
}

export default CachedDOMStorage;
