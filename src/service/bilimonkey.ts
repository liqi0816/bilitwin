/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SimpleEvent } from '../util/simple-event-target.js';
import { SimpleCustomEvent, BiliUserJS, BiliUserJSReadyState } from './biliuserjs.js';
import { OnEventDuplexFactory, inputSocketSymbol } from '../util/event-duplex.js';
import { AsyncOrSyncOrNull } from '../util/common-types.js';
import { sleep } from '../util/async-control.js';
import BiliMonkeyFLVHandlerArray, { BiliMonkeyFLVHandler } from './bilimonkey-flv-handler.js';
import { CommonCacheDB, ChromeCacheDB, IDBCacheDB } from '../util/cache-db.js';

export type BiliMonkeyInit = Partial<typeof BiliMonkey.OPTIONS_DEFAULT>

export interface BiliMonkeyPlayURLResponse {
    accept_quality: number[]
    durl: {
        backup_url?: string[]
        length: number
        url: string
    }[]
    format: string
    bp?: boolean
}

export const enum BiliMonkeyReadyState {
    inactive,
    defaultformatloaded,
    availableformatloaded,
    closed,
}

class BiliMonkey extends OnEventDuplexFactory<{ cidchange: SimpleCustomEvent<string> }, { close: SimpleEvent }, { onclose: SimpleEvent }>(['close']) {
    userjs: BiliUserJS

    flvs: AsyncOrSyncOrNull<BiliMonkeyFLVHandlerArray>
    mp4: AsyncOrSyncOrNull<string>
    ass: AsyncOrSyncOrNull<File>

    flvFormatName: string | null
    mp4FormatName: string | null
    fallbackFormatName: string | null

    defaultFormatPromise: Promise<this | void> | null
    readyState: BiliMonkeyReadyState

    options: typeof BiliMonkey.OPTIONS_DEFAULT
    cacheDB: CommonCacheDB | null

    static readonly OPTIONS_DEFAULT = {
        // 1. automation
        autoDefault: true,
        autoFLV: false,
        autoMP4: false,

        // 2. cache
        cache: true as boolean | CommonCacheDB,
        partial: true,
        proxy: true,

        // 3. customizing
        blocker: true,
        font: true,
        vip: false,

        // 4. bleeding-edge
        streams: true,
        chromeDB: true,
        firefoxDB: false,
    }
    static readonly CACHEDB_DB_NAME_DEFAULT = 'bilimonkey'
    static readonly CACHEDB_STORE_NAME_DEFAULT = 'flvcache'
    constructor(userjs: BiliUserJS, options = BiliMonkey.OPTIONS_DEFAULT as BiliMonkeyInit) {
        super();
        this.userjs = userjs;

        this.flvs = null;
        this.mp4 = null;
        this.ass = null;

        this.flvFormatName = null;
        this.mp4FormatName = null;
        this.fallbackFormatName = null;

        this.defaultFormatPromise = null;
        this.readyState = BiliMonkeyReadyState.inactive;

        this.options = {} as typeof BiliMonkey.OPTIONS_DEFAULT
        for (const e in BiliMonkey.OPTIONS_DEFAULT) {
            type typeofe = keyof typeof BiliMonkey.OPTIONS_DEFAULT;
            if (typeof options[e as typeofe] === 'undefined') {
                this.options[e as typeofe] = BiliMonkey.OPTIONS_DEFAULT[e as typeofe];
            }
            else {
                this.options[e as typeofe] = Boolean(options[e as typeofe]);
            }
        }
        if (options.cache) {
            if (typeof options.cache === 'object') {
                this.cacheDB = options.cache;
            }
            else if (options.chromeDB) {
                this.cacheDB = new ChromeCacheDB(BiliMonkey.CACHEDB_DB_NAME_DEFAULT, BiliMonkey.CACHEDB_STORE_NAME_DEFAULT, { mutableBlob: true });
            }
            else if (options.firefoxDB) {
                throw new Error('BiliMonkey + firefoxDB is not yet implemented. See github/liqi0816/bilitwin for latest progress');
            }
            else {
                this.cacheDB = new IDBCacheDB(BiliMonkey.CACHEDB_DB_NAME_DEFAULT, BiliMonkey.CACHEDB_STORE_NAME_DEFAULT);
            }
        }
        else {
            this.cacheDB = null;
        }
    }

    async activate(userjs?: BiliUserJS) {
        if (userjs) this.userjs = userjs;

        this[inputSocketSymbol].addEventListener('cidchange', () => this.close());
        if (this.options.autoDefault) await this.sniffDefaultFormat();
        switch (this.userjs.readystate) {
            case BiliUserJSReadyState.domcontentloading:
        }
        return this;
    }

    close() {
        this.dispatchEvent({ type: 'close' });
        this[inputSocketSymbol].close();
        if (Array.isArray(this.flvs)) {
            this.flvs.destroyAll();
        }
    }

    getAvailableFormatName(response?: BiliMonkeyPlayURLResponse) {
        // 1. already got => exit
        if (this.fallbackFormatName) return;

        // 2. find all possible formats
        let accept_quality: (keyof typeof BiliMonkey.VALUE_TO_FORMAT)[];
        get_accept_quality: {
            // 2.1 response available => extract from response
            if (response) {
                accept_quality = response.accept_quality as any as typeof accept_quality;
                break get_accept_quality;
            }

            // 2.2 extract from quality menu
            extractMenu: {
                const menu = this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-quality-menu')[0];
                const getElementsByTagName = menu.getElementsByTagName('li');

                // 2.2.1 menu not initialized => trigger initialization
                if (!getElementsByTagName.length) {
                    menu.dispatchEvent(new Event('mouseover'));
                    menu.dispatchEvent(new Event('mouseout'));

                    // 2.2.3 still bad => exit
                    if (!getElementsByTagName.length) break extractMenu;
                }

                // 2.2.2 extract from initialized menu
                accept_quality = [...getElementsByTagName].map(e => e.getAttribute('data-value')!) as typeof accept_quality;
                break get_accept_quality;
            }

            // 2.E all method fail => throw Error
            throw new TypeError('BiliMonkey.getAvailableFormatName: all method to extract accept_quality failed');
        }
        const accept_format = accept_quality.map(e => BiliMonkey.VALUE_TO_FORMAT[e]);

        // 3. filter out vip formats if necessary
        const vip = this.options.vip || response && response.bp;
        const candidateFormatSet = new Set(vip ? accept_format : accept_format.filter(e => !BiliMonkey.VIP_FORMAT_SET.has(e)));

        // 4. get available flv format name
        this.flvFormatName = BiliMonkey.DOES_NOT_EXIST_FORMAT;
        for (const format of BiliMonkey.FLV_FORMAT_SET) {
            if (candidateFormatSet.has(format)) {
                this.flvFormatName = format;
                break;
            }
        }

        // 5. get available mp4 format name
        this.mp4FormatName = BiliMonkey.DOES_NOT_EXIST_FORMAT;
        for (const format of BiliMonkey.MP4_FORMAT_SET) {
            if (candidateFormatSet.has(format)) {
                this.mp4FormatName = format;
                break;
            }
        }

        // 6. get an extra format name (to be used by getCurrentFormat)
        if (this.flvFormatName == BiliMonkey.DOES_NOT_EXIST_FORMAT || this.mp4FormatName == BiliMonkey.DOES_NOT_EXIST_FORMAT) {
            for (const format of BiliMonkey.FALLBACK_FORMAT_SET) {
                if (candidateFormatSet.has(format)) {
                    this.fallbackFormatName = format;
                    break;
                }
            }
            if (!this.fallbackFormatName) throw new TypeError('BiliMonkey: cannot get available format names (this video has only one available quality?)');
        }

        // 7. trigger listeners
        this.dispatchEvent({ type: 'availableformatload', detail: this });
    }

    async resolveFormat(response: BiliMonkeyPlayURLResponse | Promise<BiliMonkeyPlayURLResponse>, expectFormat?: string) {
        const ret = (async () => {
            // >>> await => yield to step 1 
            // 2. wait for response
            const { format, durl } = await response;

            // 3. inconsistency with pre-allocated slot => throw error, clean slot
            if (expectFormat && expectFormat !== format) {
                const error = new TypeError(`BiliMonkey: expecting ${expectFormat} from interface, but get ${format}`);
                if (BiliMonkey.MP4_FORMAT_SET.has(expectFormat)) {
                    this.dispatchEvent({ type: 'mp4error', detail: error });
                    this.mp4 = null;
                }
                if (BiliMonkey.FLV_FORMAT_SET.has(expectFormat)) {
                    this.dispatchEvent({ type: 'flvserror', detail: error });
                    this.flvs = null;
                }
                throw error;
            }

            // 4. parse response and store result
            if (BiliMonkey.MP4_FORMAT_SET.has(format)) {
                const mp4 = durl[0].url;
                this.dispatchEvent({ type: 'mp4load', detail: mp4 });
                return this.mp4 = mp4;
            }
            if (BiliMonkey.FLV_FORMAT_SET.has(format)) {
                const flvs = new BiliMonkeyFLVHandlerArray(durl.length);
                for (let i = 0; i < durl.length; i++) {
                    flvs[i] = new BiliMonkeyFLVHandler(durl[i].url, { cacheDB: this.cacheDB, partial: this.options.partial });
                }
                this.dispatchEvent({ type: 'flvsload', detail: flvs });
                return this.flvs = flvs;
            }
            throw new TypeError(`BiliMonkey: ${format} is unrecognizable`);
        })();

        // 1. expecting a specific format => pre-allocate slot
        if (expectFormat) {
            if (BiliMonkey.MP4_FORMAT_SET.has(expectFormat)) {
                this.dispatchEvent({ type: 'mp4loadstart', detail: ret });
                return this.mp4 = ret as Promise<string>;
            }
            if (BiliMonkey.FLV_FORMAT_SET.has(expectFormat)) {
                this.dispatchEvent({ type: 'flvsloadstart', detail: ret });
                return this.flvs = ret as Promise<BiliMonkeyFLVHandlerArray>;
            }
        }
        return ret;
    }

    static executeAjaxSuccess(success: JQuery.AjaxSettings['success'], response: any) {
        // 1. single function => execute
        if (typeof success === 'function') {
            success(response, undefined as any, undefined as any);
        }

        // 2. function[] => iterate and execute
        else if (typeof success === 'object') {
            for (const e of success) {
                e(response, undefined as any, undefined as any);
            }
        }
    }

    static readonly HOOK_AJAX_TIMEOUT_DEFAULT = 5000
    static readonly MAIN_SITE_PLAYURL_API_SIGNATURE = 'interface.bilibili.com/v2/playurl?'
    static readonly BANGUMI_PLAYURL_API_SIGNATURE = 'bangumi.bilibili.com/player/web_api/v2/playurl?'
    async hookAjaxPlayURLResponse(timeout = BiliMonkey.HOOK_AJAX_TIMEOUT_DEFAULT) {
        const jQuery = this.userjs.playerWin.jQuery;
        const { ajax } = jQuery;
        try {
            // 1. hook jQuery.ajax
            const hook = new Promise<{ success: JQuery.AjaxSettings['success'], response: Promise<BiliMonkeyPlayURLResponse> }>(resolve => {
                jQuery.ajax = function (settings?: string | JQuery.AjaxSettings, settings2?: JQuery.AjaxSettings) {
                    // 1.1 normalize parameters
                    if (typeof settings !== 'object') {
                        if (typeof settings2 !== 'object') settings2 = {};
                        settings2.url = settings;
                        settings = settings2;
                    }

                    // 1.2 api signature match => resolve response, remove hook
                    const { url } = settings;
                    if (url && (url.includes(BiliMonkey.MAIN_SITE_PLAYURL_API_SIGNATURE) || url.includes(BiliMonkey.BANGUMI_PLAYURL_API_SIGNATURE))) {
                        const { success } = settings;
                        resolve({ success, response: new Promise<BiliMonkeyPlayURLResponse>(resolve => (settings as JQuery.AjaxSettings).success = resolve) });
                        jQuery.ajax = ajax;
                    }

                    // 1.3 send ajax request
                    return ajax(settings);
                }
            })

            // 2.1 timeout used => race
            if (timeout) {
                return await Promise.race([sleep(timeout), hook]);
            }

            // 2.2 no timeout => simply return
            else {
                return await hook;
            }
        }
        finally {
            jQuery.ajax = ajax;
        }
    }

    static readonly SNIFF_DEFAULT_FORMAT_TIMEOUT_DEFAULT = 5000
    async sniffDefaultFormat() {
        if (this.defaultFormatPromise) return this.defaultFormatPromise;
        return this.defaultFormatPromise = (async () => {
            let success: JQuery.AjaxSettings['success'] | undefined;
            let response: BiliMonkeyPlayURLResponse;

            try {
                // 1. get playurl response
                getResponse: {
                    // 1.1 search for window.__playinfo__
                    const anchor = 'window.__playinfo__=';
                    for (const script of this.userjs.playerWin.document.head.getElementsByTagName('script')) {
                        const nodeValue = script.childNodes[0] && script.childNodes[0].nodeValue;
                        if (nodeValue && nodeValue.startsWith(anchor)) {
                            response = JSON.parse(nodeValue.slice(anchor.length));
                            break getResponse;
                        }
                    }

                    // 1.2 try to hook jQuery.ajax
                    if (this.userjs.readystate <= BiliUserJSReadyState.domcontentloading) {
                        const ret = await this.hookAjaxPlayURLResponse(BiliMonkey.SNIFF_DEFAULT_FORMAT_TIMEOUT_DEFAULT);
                        if (ret) {
                            success = ret.success;
                            response = await ret.response;
                            break getResponse;
                        }
                    }

                    // 1.E all method fail => return
                    return;
                }

                // 2. response => init format names
                this.getAvailableFormatName(response);

                // 3. response => format is desired => save
                if (response.format === this.flvFormatName || response.format === this.mp4FormatName) {
                    await this.resolveFormat(response);
                }

                // 4. response => cached response
                if (this.options.proxy) {
                    response = await this.useCache(response);
                }
            }
            // 5. resume ajax control flow
            finally {
                BiliMonkey.executeAjaxSuccess(success, response!);
            }
        })();
    }

    async useCache(response: BiliMonkeyPlayURLResponse) {
        if (response.format === this.flvFormatName && Array.isArray(this.flvs) && this.cacheDB) {
            const cachedResponse = JSON.parse(JSON.stringify(response)) as BiliMonkeyPlayURLResponse;
            const cacheURLs = await this.flvs.getAllCacheURL();
            for (let i = 0; i < cacheURLs.length; i++) {
                const url = cacheURLs[i];
                if (url) cachedResponse.durl[i].url = url;
            }
            return cachedResponse;
        }
        return response;
    }

    static readonly VIP_FORMAT_SET = new Set(['flv_p60', 'hdflv2', 'flv720_p60'])
    static readonly FLV_FORMAT_SET = new Set(['flv_p60', 'hdflv2', 'flv', 'flv720_p60', 'flv720', 'flv480', 'flv360'])
    static readonly MP4_FORMAT_SET = new Set(['hdmp4', 'mp4'])
    static readonly FALLBACK_FORMAT_SET = new Set(['mp4', 'flv360'])

    static readonly DOES_NOT_EXIST_FORMAT = 'BiliMonkey.DOES_NOT_EXIST_FORMAT'
    static readonly VALUE_TO_FORMAT = {
        '116': 'flv_p60',
        '74': 'flv720_p60',
        '80': 'flv',
        '64': 'flv720',
        '32': 'flv480',
        '15': 'flv360',

        // legacy - late 2017
        '112': 'hdflv2',
        '48': 'hdmp4',
        '16': 'mp4',

        // legacy - early 2017
        '3': 'flv',
        '2': 'hdmp4',
        '1': 'mp4',

        [BiliMonkey.DOES_NOT_EXIST_FORMAT]: BiliMonkey.DOES_NOT_EXIST_FORMAT
    }
    static readonly FORMAT_TO_VALUE = {
        'flv_p60': '116',
        'flv720_p60': '74',
        'flv': '80',
        'flv720': '64',
        'flv480': '32',
        'flv360': '15',

        // legacy - late 2017
        'hdflv2': '112',
        'hdmp4': '64', // data-value is still '64' instead of '48'.  '48',
        'mp4': '16',

        [BiliMonkey.DOES_NOT_EXIST_FORMAT]: BiliMonkey.DOES_NOT_EXIST_FORMAT
    }
}

export { BiliMonkey }
export default BiliMonkey;
