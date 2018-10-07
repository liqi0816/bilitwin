/***
 * BiliMonkey
 * A bilibili user script
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * The FLV merge utility is a Javascript translation of 
 * https://github.com/grepmusic/flvmerge
 * by grepmusic
 * 
 * The ASS convert utility is a fork of
 * https://github.com/tiansh/ass-danmaku
 * by tiansh
 * 
 * The FLV demuxer is from
 * https://github.com/Bilibili/flv.js/
 * by zheng qian
 * 
 * The EMBL builder is from
 * <https://www.npmjs.com/package/simple-ebml-builder>
 * by ryiwamoto
*/

import AsyncContainer from '../util/async-container.js';
import CacheDB from '../util/cache-db.js';
import DetailedFetchBlob from '../util/detailed-fetch-blob.js';
import Mutex from '../util/mutex.js';
import ASSConverter from '../assconverter/interface.js';
import HookedFunction from '../util/hooked-function.js';
import BiliUserJS from './biliuserjs.js';

class BiliMonkey {
    constructor(playerWin, option = BiliMonkey.optionDefaults) {
        this.playerWin = playerWin;
        this.protocol = playerWin.location.protocol;
        this.cid = null;
        this.flvs = null;
        this.mp4 = null;
        this.ass = null;
        this.flvFormatName = null;
        this.mp4FormatName = null;
        this.fallbackFormatName = null;
        this.cidAsyncContainer = new AsyncContainer();
        this.cidAsyncContainer.then(cid => { this.cid = cid; this.ass = this.getASS(); });
        if (typeof top.cid === 'string') this.cidAsyncContainer.resolve(top.cid);

        /***
         * cache + proxy = Service Worker
         * Hope bilibili will have a SW as soon as possible.
         * partial = Stream
         * Hope the fetch API will be stabilized as soon as possible.
         * If you are using your grandpa's browser, do not enable these functions.
         */
        this.cache = option.cache;
        this.partial = option.partial;
        this.proxy = option.proxy;
        this.blocker = option.blocker;
        this.font = option.font;
        this.option = option;
        if (this.cache && (!(this.cache instanceof CacheDB))) this.cache = new CacheDB('biliMonkey', 'flv', 'name');

        this.flvsDetailedFetch = [];
        this.flvsBlob = [];

        this.defaultFormatPromise = null;
        this.queryInfoMutex = new Mutex();

        this.destroy = new HookedFunction();
    }

    /***
     * Guide: for ease of debug, please use format name(flv720) instead of format value(64) unless necessary
     * Guide: for ease of html concat, please use string format value('64') instead of number(parseInt('64'))
     */
    lockFormat(format) {
        // null => uninitialized
        // async pending => another one is working on it
        // async resolve => that guy just finished work
        // sync value => someone already finished work
        const toast = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
        if (toast) toast.style.visibility = 'hidden';
        if (format == this.fallbackFormatName) return null;
        switch (format) {
            // Single writer is not a must.
            // Plus, if one writer fail, others should be able to overwrite its garbage.
            case 'flv_p60':
            case 'flv720_p60':
            case 'hdflv2':
            case 'flv':
            case 'flv720':
            case 'flv480':
            case 'flv360':
                //if (this.flvs) return this.flvs; 
                return this.flvs = new AsyncContainer();
            case 'hdmp4':
            case 'mp4':
                //if (this.mp4) return this.mp4;
                return this.mp4 = new AsyncContainer();
            default:
                throw `lockFormat error: ${format} is a unrecognizable format`;
        }
    }

    resolveFormat(res, shouldBe) {
        const toast = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
        if (toast) {
            toast.style.visibility = '';
            if (toast.children.length) toast.children[0].style.visibility = 'hidden';
            const video = this.playerWin.document.getElementsByTagName('video')[0];
            if (video) {
                const h = () => {
                    if (toast.children.length) toast.children[0].style.visibility = 'hidden'
                };
                video.addEventListener('emptied', h, { once: true });
                setTimeout(() => video.removeEventListener('emptied', h), 500);
            }

        }
        if (res.format == this.fallbackFormatName) return null;
        switch (res.format) {
            case 'flv_p60':
            case 'flv720_p60':
            case 'hdflv2':
            case 'flv':
            case 'flv720':
            case 'flv480':
            case 'flv360':
                if (shouldBe && shouldBe != res.format) {
                    this.flvs = null;
                    throw `URL interface error: response is not ${shouldBe}`;
                }
                return this.flvs = this.flvs.resolve(res.durl.map(e => e.url.replace('http:', this.protocol)));
            case 'hdmp4':
            case 'mp4':
                if (shouldBe && shouldBe != res.format) {
                    this.mp4 = null;
                    throw `URL interface error: response is not ${shouldBe}`;
                }
                return this.mp4 = this.mp4.resolve(res.durl[0].url.replace('http:', this.protocol));
            default:
                throw `resolveFormat error: ${res.format} is a unrecognizable format`;
        }
    }

    getVIPStatus() {
        const data = this.playerWin.sessionStorage.getItem('bili_login_status');
        try {
            return JSON.parse(data).some(e => e instanceof Object && e.vipStatus);
        }
        catch (e) {
            return false;
        }
    }

    async getASS(clickableFormat) {
        if (this.ass) return this.ass;
        this.ass = new Promise(async resolve => {
            // 1. cid
            if (!this.cid) this.cid = this.playerWin.cid

            // 2. options
            const bilibili_player_settings = this.playerWin.localStorage.bilibili_player_settings && JSON.parse(this.playerWin.localStorage.bilibili_player_settings);

            // 2.1 blocker
            let danmaku = await BiliMonkey.fetchDanmaku(this.cid);
            if (bilibili_player_settings && this.blocker) {
                const i = bilibili_player_settings.block.list.map(e => e.v).join('|');
                if (i) {
                    const regexp = new RegExp(i);
                    danmaku = danmaku.filter(e => !regexp.test(e.text));
                }
            }

            // 2.2 font
            const option = bilibili_player_settings && this.font && {
                'fontFamily': bilibili_player_settings.setting_config['fontfamily'] != 'custom' ? bilibili_player_settings.setting_config['fontfamily'].split(/, ?/) : bilibili_player_settings.setting_config['fontfamilycustom'].split(/, ?/),
                'fontSize': parseFloat(bilibili_player_settings.setting_config['fontsize']),
                'textOpacity': parseFloat(bilibili_player_settings.setting_config['opacity']),
                'bold': bilibili_player_settings.setting_config['bold'] ? 1 : 0,
            } || undefined;

            // 2.3 resolution
            if (this.option.resolution) {
                Object.assign(option, {
                    'resolutionX': +this.option.resolutionX || 560,
                    'resolutionY': +this.option.resolutionY || 420
                })
            }

            // 3. generate
            resolve(this.ass = top.URL.createObjectURL(await new ASSConverter(option).genASSBlob(
                danmaku, top.document.title, top.location.href
            )));
        });
        return this.ass;
    }

    async queryInfo(format) {
        return this.queryInfoMutex.lockAndAwait(async () => {
            switch (format) {
                case 'video':
                    if (this.flvs)
                        return this.video_format;

                    const api_url = `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&otype=json&qn=116`

                    let re = await fetch(api_url, { credentials: 'include' })

                    let data = (await re.json()).data
                    // console.log(data)
                    let durls = data.durl

                    if (!durls) {
                        data = JSON.parse(
                            window.Gc.split("\n").filter(
                                x => x.startsWith("{")
                            )[0]
                        )

                        durls = data.Y.segments
                    }

                    // console.log(data)

                    let flvs = durls.map(url_obj => url_obj.url.replace("http://", "https://"))

                    this.flvs = flvs

                    let video_format = data.format && data.format.slice(0, 3)

                    this.video_format = video_format

                    return video_format
                case 'ass':
                    if (this.ass)
                        return this.ass;
                    else
                        return this.getASS(this.flvFormatName);
                default:
                    throw `Bilimonkey: What is format ${format}?`;
            }
        });
    }

    hangPlayer() {
        this.playerWin.document.getElementsByTagName('video')[0].src = "https://www.xmader.com/bilitwin/src/black.mp4"
    }

    async loadFLVFromCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0]
        let item = await this.cache.getData(name);
        if (!item) return;
        return this.flvsBlob[index] = item.data;
    }

    async loadPartialFLVFromCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0]
        name = 'PC_' + name;
        let item = await this.cache.getData(name);
        if (!item) return;
        return item.data;
    }

    async loadAllFLVFromCache() {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';

        let promises = [];
        for (let i = 0; i < this.flvs.length; i++) promises.push(this.loadFLVFromCache(i));

        return Promise.all(promises);
    }

    async saveFLVToCache(index, blob) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0]
        return this.cache.addData({ name, data: blob });
    }

    async savePartialFLVToCache(index, blob) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0]
        name = 'PC_' + name;
        return this.cache.putData({ name, data: blob });
    }

    async cleanPartialFLVInCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].split("/").pop().split("?")[0]
        name = 'PC_' + name;
        return this.cache.deleteData(name);
    }

    async getFLV(index, progressHandler) {
        if (this.flvsBlob[index]) return this.flvsBlob[index];

        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        this.flvsBlob[index] = (async () => {
            let cache = await this.loadFLVFromCache(index);
            if (cache) return this.flvsBlob[index] = cache;
            let partialFLVFromCache = await this.loadPartialFLVFromCache(index);

            let burl = this.flvs[index];
            if (partialFLVFromCache) burl += `&bstart=${partialFLVFromCache.size}`;
            let opt = {
                fetch: this.playerWin.fetch,
                method: 'GET',
                mode: 'cors',
                cache: 'default',
                referrerPolicy: 'no-referrer-when-downgrade',
                cacheLoaded: partialFLVFromCache ? partialFLVFromCache.size : 0,
                headers: partialFLVFromCache && (!burl.includes('wsTime')) ? { Range: `bytes=${partialFLVFromCache.size}-` } : undefined
            };
            opt.onprogress = progressHandler;
            opt.onerror = opt.onabort = ({ target, type }) => {
                let partialFLV = target.getPartialBlob();
                if (partialFLVFromCache) partialFLV = new Blob([partialFLVFromCache, partialFLV]);
                this.savePartialFLVToCache(index, partialFLV);
            }

            let fch = new DetailedFetchBlob(burl, opt);
            this.flvsDetailedFetch[index] = fch;
            let fullFLV = await fch.getBlob();
            this.flvsDetailedFetch[index] = undefined;
            if (partialFLVFromCache) {
                fullFLV = new Blob([partialFLVFromCache, fullFLV]);
                this.cleanPartialFLVInCache(index);
            }
            this.saveFLVToCache(index, fullFLV);
            return (this.flvsBlob[index] = fullFLV);
        })();
        return this.flvsBlob[index];
    }

    async abortFLV(index) {
        if (this.flvsDetailedFetch[index]) return this.flvsDetailedFetch[index].abort();
    }

    async getAllFLVs(progressHandler) {
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let promises = [];
        for (let i = 0; i < this.flvs.length; i++) promises.push(this.getFLV(i, progressHandler));
        return Promise.all(promises);
    }

    async cleanAllFLVsInCache() {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';

        let ret = [];
        for (let flv of this.flvs) {
            let name = flv.split("/").pop().split("?")[0]
            ret.push(await this.cache.deleteData(name));
            ret.push(await this.cache.deleteData('PC_' + name));
        }

        return ret;
    }

    async setupProxy(res, onsuccess) {
        if (!this.setupProxy._fetch) {
            const _fetch = this.setupProxy._fetch = this.playerWin.fetch;
            this.playerWin.fetch = function (input, init) {
                if (!input.slice || input.slice(0, 5) != 'blob:') {
                    return _fetch(input, init);
                }
                let bstart = input.indexOf('?bstart=');
                if (bstart < 0) {
                    return _fetch(input, init);
                }
                if (!init.headers instanceof Headers) init.headers = new Headers(init.headers || {});
                init.headers.set('Range', `bytes=${input.slice(bstart + 8)}-`);
                return _fetch(input.slice(0, bstart), init)
            }
            this.destroy.addCallback(() => this.playerWin.fetch = _fetch);
        }

        await this.loadAllFLVFromCache();
        let resProxy = Object.assign({}, res);
        for (let i = 0; i < this.flvsBlob.length; i++) {
            if (this.flvsBlob[i]) resProxy.durl[i].url = this.playerWin.URL.createObjectURL(this.flvsBlob[i]);
        }
        return onsuccess(resProxy);
    }

    static async fetchDanmaku(cid) {
        return ASSConverter.parseXML(
            await new Promise((resolve, reject) => {
                const e = new XMLHttpRequest();
                e.onload = () => resolve(e.responseText);
                e.onerror = reject;
                e.open('get', `https://comment.bilibili.com/${cid}.xml`);
                e.send();
            })
        );
    }

    static async getAllPageDefaultFormats(playerWin = top) {
        const jq = playerWin.jQuery;
        const _ajax = jq.ajax;

        // 1. mutex => you must send requests one by one
        const queryInfoMutex = new Mutex();

        // 2. bilibili has a misconfigured lazy loading => keep trying
        const list = await new Promise(resolve => {
            const i = setInterval(() => {
                const ret = playerWin.player.getPlaylist();
                if (ret) {
                    clearInterval(i);
                    resolve(ret);
                }
            }, 500);
        });

        // 3. build {cid: information} dict
        const index = list.reduce((acc, cur) => { acc[cur.cid] = cur; return acc }, {});

        // 4. find where to stop
        const end = list[list.length - 1].cid.toString();

        // 5. collect information
        const ret = [];
        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
            if (a.url.includes('comment.bilibili.com') || a.url.includes('interface.bilibili.com/player?') || a.url.includes('api.bilibili.com/x/player/playurl/token')) return _ajax.call(jq, a, c);
            if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                (async () => {
                    // 5.1 suppress success handler
                    a.success = undefined;

                    // 5.2 find cid
                    const cid = a.url.match(/cid=\d+/)[0].slice(4);

                    // 5.3 grab information
                    const [danmuku, res] = await Promise.all([
                        // 5.3.1 grab danmuku
                        (async () => top.URL.createObjectURL(await new ASSConverter().genASSBlob(
                            await BiliMonkey.fetchDanmaku(cid), top.document.title, top.location.href
                        )))(),

                        // 5.3.2 grab download res
                        _ajax.call(jq, a, c)
                    ]);

                    // 5.4 save information
                    ret.push({
                        durl: res.durl.map(({ url }) => url.replace('http:', playerWin.location.protocol)),
                        danmuku,
                        name: index[cid].part || index[cid].index,
                        outputName: res.durl[0].url.match(/\d+-\d+(?:\d|-|hd)*(?=\.flv)/) ?
                            /***
                             * see #28
                             * Firefox lookbehind assertion not implemented https://bugzilla.mozilla.org/show_bug.cgi?id=1225665
                             * try replace /-\d+(?=(?:\d|-|hd)*\.flv)/ => /(?<=\d+)-\d+(?=(?:\d|-|hd)*\.flv)/ in the future
                             */
                            res.durl[0].url.match(/\d+-\d+(?:\d|-|hd)*(?=\.flv)/)[0].replace(/-\d+(?=(?:\d|-|hd)*\.flv)/, '')
                            : res.durl[0].url.match(/\d(?:\d|-|hd)*(?=\.mp4)/) ?
                                res.durl[0].url.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0]
                                : cid,
                        cid,
                        res,
                    });

                    // 5.5 finish job
                    queryInfoMutex.unlock();
                })();
            }
            return _ajax.call(jq, { url: '//0.0.0.0' });
        };

        // 6.1 from the first page
        await queryInfoMutex.lock();
        playerWin.player.next(1);
        while (1) {
            // 6.2 to the last page
            await queryInfoMutex.lock();
            if (ret[ret.length - 1].cid == end) break;
            playerWin.player.next();
        }

        return ret;
    }

    static formatToValue(format) {
        if (format == 'does_not_exist') throw `formatToValue: cannot lookup does_not_exist`;
        if (typeof BiliMonkey.formatToValue.dict == 'undefined') BiliMonkey.formatToValue.dict = {
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
        }
        return BiliMonkey.formatToValue.dict[format] || null;
    }

    static valueToFormat(value) {
        if (typeof BiliMonkey.valueToFormat.dict == 'undefined') BiliMonkey.valueToFormat.dict = {
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
        };
        return BiliMonkey.valueToFormat.dict[value] || null;
    }

    static get optionDescriptions() {
        return [
            // 1. cache
            ['cache', '关标签页不清缓存：保留完全下载好的分段到缓存，忘记另存为也没关系。'],
            ['partial', '断点续传：点击“取消”保留部分下载的分段到缓存，忘记点击会弹窗确认。'],
            ['proxy', '用缓存加速播放器：如果缓存里有完全下载好的分段，直接喂给网页播放器，不重新访问网络。小水管利器，播放只需500k流量。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。'],

            // 2. customizing
            ['blocker', '弹幕过滤：在网页播放器里设置的屏蔽词也对下载的弹幕生效。'],
            ['font', '自定义字体：在网页播放器里设置的字体、大小、加粗、透明度也对下载的弹幕生效。'],
            ['resolution', '(测)自定义弹幕画布分辨率：仅对下载的弹幕生效。(默认值: 560 x 420)'],
        ];
    }

    static get optionDefaults() {
        return {
            // 1. automation
            autoDefault: true,
            autoFLV: false,
            autoMP4: false,

            // 2. cache
            cache: true,
            partial: true,
            proxy: true,

            // 3. customizing
            blocker: true,
            font: true,
            resolution: false,
            resolutionX: 560,
            resolutionY: 420,
        }
    }

    static _UNIT_TEST() {
        return (async () => {
            let playerWin = await BiliUserJS.getPlayerWin();
            window.m = new BiliMonkey(playerWin);

            console.warn('data race test');
            m.queryInfo('video');
            console.log(m.queryInfo('video'));

            //location.reload();
        })();
    }
}

export default BiliMonkey;
