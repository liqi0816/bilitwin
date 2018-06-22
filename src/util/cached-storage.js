/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class CachedStorage {
    constructor(storage = localStorage) {
        this.storage = storage;
        this.cache = {};
    }

    setItem(name, item) {
        this.cache[name] = '' + item;
        return this.storage.setItem(name, item);
    }

    getItem(name) {
        if (this.cache[name] !== undefined) return this.cache[name];
        const item = this.storage.getItem(name);
        if (item.then) {
            item.then(item => this.cache[name] = item);
        }
        else {
            this.cache[name] = item;
        }
        return item;
    }

    removeItem(name) {
        this.cache[name] = null;
        return this.storage.removeItem(name);
    }

    key(key) {
        return this.storage.key(key);
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

}

export default CachedStorage;
