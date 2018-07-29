/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OnEventTargetFactory } from '../util/on-event-target.js';
import { parseXML, genASSBlob } from '../codec/assconverter/interface.js';
import { SimpleBareEvent } from '../util/simple-event-target.js';

export type FetchFunctionType = typeof fetch

export const enum BiliMonkeyASSHandlerReadyState {
    initialized,
    downloadinited,
    downloadstarted,
    loaded,
}

export interface BiliMonkeyASSHandlerInit {
    blocker?: RegExp,
    style?: {
        fontFamily?: string
        fontSize?: number
        textOpacity?: number
        bold?: boolean
    }
    protocol?: 'http:' | 'https:' | ''
    fetch?: FetchFunctionType
}

export type EventMap = {
    load: SimpleBareEvent
    downloadinit: SimpleBareEvent
    downloadstart: SimpleBareEvent
}

export type OnEventMap = {
    onload: SimpleBareEvent
    ondownloadinit: SimpleBareEvent
    ondownloadstart: SimpleBareEvent
}

const CACHE_URL_SYMBOL = Symbol('blobURL');
class BiliMonkeyASSHandler extends OnEventTargetFactory<EventMap, OnEventMap>() {
    readonly originalURL: string

    cache: Blob | null
    blocker: RegExp | null
    style: {
        fontFamily?: string
        fontSize?: number
        textOpacity?: number
        bold?: boolean
    }
    [CACHE_URL_SYMBOL]: string | null

    fetch: FetchFunctionType
    currentDownload: Promise<Blob> | null
    readyState: BiliMonkeyASSHandlerReadyState

    constructor(originalURL: string, { blocker = null, style: { fontFamily = undefined, fontSize = undefined, textOpacity = undefined, bold = undefined } = {}, protocol = '', fetch = top.fetch } = {} as BiliMonkeyASSHandlerInit) {
        super();

        const indexOf = originalURL.indexOf(':') + 1;
        this.originalURL = indexOf ? `${protocol}${originalURL.slice(indexOf)}` : originalURL;

        this.cache = null;
        this.blocker = blocker;
        this.style = { fontFamily, fontSize, textOpacity, bold };
        this[CACHE_URL_SYMBOL] = null;

        this.fetch = fetch;
        this.readyState = BiliMonkeyASSHandlerReadyState.initialized;
        this.currentDownload = null;
        this.addEventListener('downloadinit', () => this.readyState = BiliMonkeyASSHandlerReadyState.downloadinited);
        this.addEventListener('downloadstart', () => this.readyState = BiliMonkeyASSHandlerReadyState.downloadstarted);
        this.addEventListener('loaded', () => this.readyState = BiliMonkeyASSHandlerReadyState.loaded);
    }

    async getDownload() {
        if (this.cache) return this.cache;
        else return this.download();
    }

    async getDownloadURL() {
        if (!this.cache) await this.download();
        return this.cacheURL!;
    }

    async download() {
        return this.currentDownload = (async () => {
            const fetch = this.fetch;
            this.dispatchEvent({ type: 'downloadinit' });
            const response = await fetch(this.originalURL);
            this.dispatchEvent({ type: 'downloadstart' });

            let danmaku = parseXML(await response.text());

            if (this.blocker) {
                danmaku = danmaku.filter(e => !this.blocker!.test(e.text));
            }

            this.cache = await genASSBlob(danmaku, this.style);
            this.dispatchEvent({ type: 'load' });
            return this.cache;
        })();
    }

    get cacheURL() {
        if (!this.cache) return null;
        return this[CACHE_URL_SYMBOL] || (this[CACHE_URL_SYMBOL] = URL.createObjectURL(this.cache));
    }

    toString() {
        return this.cacheURL || '';
    }

    destroy() {
        if (this[CACHE_URL_SYMBOL]) {
            URL.revokeObjectURL(this[CACHE_URL_SYMBOL]!);
            this[CACHE_URL_SYMBOL] = null;
        }
    }
}

export { BiliMonkeyASSHandler };
export default BiliMonkeyASSHandler;
