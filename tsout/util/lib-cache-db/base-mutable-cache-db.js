/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
class BaseMutableCacheDB {
    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
    }
    async createReadStream(name) {
        const data = await this.getData(name);
        if (!data)
            return null;
        return new Response(data).body;
    }
    async getObjectURL(name) {
        const data = await this.getData(name);
        if (!data)
            return null;
        return URL.createObjectURL(data);
    }
    async getText(name) {
        const data = await this.getData(name);
        if (!data)
            return null;
        return new Promise((resolve, reject) => {
            const e = new FileReader();
            e.onload = () => resolve(e.result);
            e.onerror = reject;
            e.readAsText(data);
        });
    }
    async getJSON(name) {
        const data = await this.getData(name);
        if (!data)
            return null;
        return new Promise((resolve, reject) => {
            const e = new FileReader();
            e.onload = () => resolve(JSON.parse(e.result));
            e.onerror = reject;
            e.readAsText(data);
        });
    }
    async getRespone(name) {
        const data = await this.getData(name);
        if (!data)
            return null;
        return new Response(data);
    }
    get getReadStream() {
        return this.createReadStream;
    }
    static get isSupported() { return false; }
    static async cloneBlob(file) {
        const ret = new Response(file).blob();
        if (file.name) {
            return new File([await ret], file.name, file);
        }
        return ret;
    }
    static async quota() { return { usage: -1, quota: -1 }; }
}
export { BaseMutableCacheDB };
export default BaseMutableCacheDB;
//# sourceMappingURL=base-mutable-cache-db.js.map