/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseMutableCacheDB, CommonCacheDB } from '../util/cache-db.js';
import { OnEventTargetFactory, asyncOnce } from '../util/on-event-target.js';
import MonitorStream from '../util/monitor-stream.js';
import { MemoryBlobStream } from '../util/lib-util-streams/memory-stream.js';
import { ReadableStream } from '../util/lib-util-streams/readablestream-types.js';
import { SimpleBareEvent } from '../util/simple-event-target.js';
import { int } from '../util/type-conversion.macro.js';

export type FetchFunctionType = typeof fetch

export const enum BiliMonkeyFLVHandlerReadyState {
    initialized,
    partialloaded,
    downloadinited,
    downloadstarted,
    loaded,
}

export interface BiliMonkeyFLVHandlerInit {
    cacheDB?: CommonCacheDB | null
    partial?: boolean
    protocol?: 'http:' | 'https:' | ''
    fetch?: FetchFunctionType
}

export type EventMap = {
    load: SimpleBareEvent
    partialload: SimpleBareEvent
    save: SimpleBareEvent
    partialsave: SimpleBareEvent
    delete: SimpleBareEvent
    partialdelete: SimpleBareEvent
    downloadinit: SimpleBareEvent
    downloadstart: SimpleBareEvent
    partialupdate: SimpleBareEvent
}

export type OnEventMap = {
    onload: SimpleBareEvent
    onpartialload: SimpleBareEvent
    onsave: SimpleBareEvent
    onpartialsave: SimpleBareEvent
    ondelete: SimpleBareEvent
    onpartialdelete: SimpleBareEvent
    ondownloadinit: SimpleBareEvent
    ondownloadstart: SimpleBareEvent
    onpartialupdate: SimpleBareEvent
}

const CACHE_URL_SYMBOL = Symbol('blobURL');
class BiliMonkeyFLVHandler extends OnEventTargetFactory<EventMap, OnEventMap>(['load', 'partialload', 'save', 'partialsave', 'delete', 'partialdelete', 'downloadinit', 'downloadstart', 'partialupdate']) {
    readonly url: string
    readonly filename: string
    readonly partialFileName: string | null

    cache: File | null
    partial: File | null
    cacheDB: CommonCacheDB | null
    [CACHE_URL_SYMBOL]: string | null

    downloader: MonitorStream | null
    currentDownload: Promise<File> | null
    fetch: FetchFunctionType
    readyState: BiliMonkeyFLVHandlerReadyState

    static readonly PARTIAL_CACHE_EXTENSION = '.incomplete'
    constructor(url: string, { cacheDB = null, partial = true, protocol = '', fetch = top.fetch } = {} as BiliMonkeyFLVHandlerInit) {
        super();

        const indexOf = url.indexOf(':') + 1;
        this.url = indexOf ? `${protocol}${url.slice(indexOf)}` : url;

        const match = url.match(/[^\/]+\.flv/);
        if (!match) throw new TypeError(`BiliMonkeyFLVDetail: the provided url "${url}" does not contain a valid flv file name.`);
        this.filename = match[0];
        this.partialFileName = partial ? `${this.filename}${BiliMonkeyFLVHandler.PARTIAL_CACHE_EXTENSION}` : null;

        this.cache = null;
        this.partial = null;
        this.cacheDB = cacheDB;
        this[CACHE_URL_SYMBOL] = null;

        this.downloader = null;
        this.currentDownload = null;
        this.fetch = fetch;
        this.readyState = BiliMonkeyFLVHandlerReadyState.initialized;
        this.addEventListener('partialload', () => this.readyState = BiliMonkeyFLVHandlerReadyState.partialloaded);
        this.addEventListener('downloadinit', () => this.readyState = BiliMonkeyFLVHandlerReadyState.downloadinited);
        this.addEventListener('downloadstart', () => this.readyState = BiliMonkeyFLVHandlerReadyState.downloadstarted);
        this.addEventListener('load', () => this.readyState = BiliMonkeyFLVHandlerReadyState.loaded);
    }

    async getCache() {
        if (this.cache) return this.cache;
        else return this.loadCache();
    }

    async loadCache() {
        if (!this.cacheDB) return null;
        this.cache = await this.cacheDB.getData(this.filename);
        this.dispatchEvent({ type: 'load' });
        return this.cache;
    }

    async loadPartialCache() {
        if (!this.cacheDB || !this.partialFileName) return null;
        this.partial = await this.cacheDB.getData(this.partialFileName);
        this.dispatchEvent({ type: 'partialload' });
        return this.partial;
    }

    async saveCache() {
        if (!this.cacheDB || !this.cache) return null;
        await this.cacheDB.setData(this.cache);
        this.dispatchEvent({ type: 'save' });
        await this.deletePartialCache();
        return this.cache;
    }

    async savePartialCache() {
        if (!this.cacheDB || !this.partial) return null;
        await this.cacheDB.setData(this.partial);
        this.dispatchEvent({ type: 'partialsave' });
        return this.partial;
    }

    async deleteCache() {
        this.cache = null;
        if (!this.cacheDB) return null;
        await Promise.all([this.cacheDB.deleteData(this.filename), this.deletePartialCache()]);
        this.dispatchEvent({ type: 'delete' });
        return null;
    }

    async deletePartialCache() {
        this.partial = null;
        if (!this.cacheDB || !this.partialFileName) return null;
        await this.cacheDB.deleteData(this.partialFileName);
        this.dispatchEvent({ type: 'partialdelete' });
        return null;
    }

    async createDownloadStream(downloader: MonitorStream) {
        this.dispatchEvent({ type: 'downloadinit' });

        const { fetch } = this;
        const { body, headers } = await fetch(this.url, {
            method: 'GET',
            mode: 'cors',
            cache: 'default',
            referrerPolicy: 'no-referrer-when-downgrade',
            headers: downloader.loaded ? { Range: `bytes=${downloader.loaded}-` } : undefined,
        });

        const total = headers.get('Content-Length');
        if (total) {
            downloader.lengthComputable = true;
            downloader.total = downloader.loaded + int(total);
        }

        this.dispatchEvent({ type: 'downloadstart' });
        return (body as ReadableStream).pipeThrough(downloader);
    }

    async getDownload() {
        if (this.currentDownload) {
            return this.currentDownload;
        }
        else {
            return this.download();
        }
    }

    async download() {
        return this.currentDownload = (async () => {
            this.downloader = new MonitorStream();
            try {
                if (this.cacheDB instanceof BaseMutableCacheDB && this.partialFileName) {
                    const destination = await this.cacheDB.createWriteStream(this.partialFileName, { append: true });
                    const partial = await this.loadPartialCache();
                    if (partial) this.downloader.loaded = partial.size;

                    try {
                        await (await this.createDownloadStream(this.downloader)).pipeTo(destination);
                        await this.cacheDB.renameData(this.partialFileName, this.filename);
                        await this.loadCache();
                    }
                    finally {
                        if (!this.cache) this.dispatchEvent({ type: 'partialupdate' });
                    }
                }
                else {
                    const destination = new MemoryBlobStream();
                    const partial = await this.loadPartialCache();
                    if (partial) {
                        this.downloader.loaded = partial.size;
                        destination.buffer.push(partial);
                    }

                    try {
                        await (await this.createDownloadStream(this.downloader)).pipeTo(destination);
                        this.cache = new File(destination.buffer, this.filename);
                        this.dispatchEvent({ type: 'load' });
                        await this.saveCache();
                    }
                    finally {
                        if (!this.cache) {
                            this.partial = new File(destination.buffer, this.filename);
                            this.dispatchEvent({ type: 'partialupdate' });
                            await this.savePartialCache();
                        }
                    }
                }
            }
            finally {
                this.currentDownload = null;
            }
            return this.cache!;
        })();
    }

    get cacheURL() {
        if (!this.cache) return null;
        return this[CACHE_URL_SYMBOL] || (this[CACHE_URL_SYMBOL] = URL.createObjectURL(this.cache));
    }

    destroy() {
        if (this[CACHE_URL_SYMBOL]) {
            URL.revokeObjectURL(this[CACHE_URL_SYMBOL]!);
            this[CACHE_URL_SYMBOL] = null;
        }
        if (this.downloader) {
            this.downloader.abort();
            this.downloader = null;
        }
    }

    toString() {
        return this.url;
    }

    static readonly CACHE_URL_SYMBOL = CACHE_URL_SYMBOL
}

class BiliMonkeyFLVHandlerArray extends Array<BiliMonkeyFLVHandler> {
    constructor(length: number)
    constructor(flvs: ArrayLike<string>, init?: BiliMonkeyFLVHandlerInit)
    constructor(flvs: ArrayLike<string> | number, init?: BiliMonkeyFLVHandlerInit) {
        if (typeof flvs === 'number') {
            super(flvs);
        }
        else {
            super(flvs.length);
            for (let i = 0; i < flvs.length; i++) {
                this[i] = new BiliMonkeyFLVHandler(flvs[i], init);
            }
        }
    }

    async getAllCache() {
        return Promise.all(this.map(e => e.getCache()));
    }

    async getAllCacheURL() {
        return Promise.all(this.map(async e => {
            await e.getCache();
            return e.cacheURL;
        }));
    }

    async deleteAllCache() {
        return Promise.all(this.map(e => e.deleteCache()));
    }

    async downloadAll() {
        return Promise.all(this.map(e => e.download()));
    }

    destroyAll() {
        return this.map(e => e.destroy);
    }
}

export { BiliMonkeyFLVHandler, BiliMonkeyFLVHandlerArray }
export default BiliMonkeyFLVHandlerArray
