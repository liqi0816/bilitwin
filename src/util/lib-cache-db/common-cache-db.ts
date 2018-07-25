/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface StorageNavigator extends Navigator {
    storage?: { estimate(): Promise<{ usage: number, quota: number }> }
    webkitTemporaryStorage?: { queryUsageAndQuota(succb?: (usage: number, quota: number) => void, errcb?: (err: DOMException) => void): void }
}

export interface FileLike extends Blob {
    name: string
}

abstract class CommonCacheDB {
    constructor(public dbName: string, public storeName: string) { }

    abstract async createData(item: Blob, name: string): Promise<any>
    abstract async createData(item: FileLike, name?: string): Promise<any>

    abstract async setData(item: Blob, name: string): Promise<any>
    abstract async setData(item: FileLike, name?: string): Promise<any>

    abstract async getData(name: string): Promise<File | null>

    abstract async hasData(name: string): Promise<boolean>

    abstract async deleteData(name: string): Promise<any>

    abstract async deleteAllData(): Promise<any>

    abstract async deleteEntireDB(): Promise<any>

    static get isSupported() { return false }

    static async quota() { return { usage: -1, quota: -1 } }
}

export default CommonCacheDB;
