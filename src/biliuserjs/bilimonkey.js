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

import AsyncContainer from '../util/async-container';
import CacheDB from '../util/cache-db';
import DetailedFetchBlob from '../util/detailed-fetch-blob';
import Mutex from '../util/mutex';
import ASSConverter from '../assconverter/interface';
import Destroy from '../util/destroy';

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
        this.queryInfoMutex.lockAndAwait(() => this.getPlayerButtons());
        this.queryInfoMutex.lockAndAwait(() => this.getAvailableFormatName());

        this.destroy = new Destroy();
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
        let h = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
        if (h) h.style.visibility = 'hidden';
        switch (format) {
            // Single writer is not a must.
            // Plus, if one writer fail, others should be able to overwrite its garbage.
            case 'flv_p60':
            case 'flv720_p60':
            case 'hdflv2':
            case 'flv':
            case 'flv720':
            case 'flv480':
            case 'flv320':
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
        let h = this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-top')[0];
        if (h) {
            h.style.visibility = '';
            if (h.children.length) h.children[0].style.visibility = 'hidden';
            let i = e => {
                if (h.children.length) h.children[0].style.visibility = 'hidden';
                e.target.removeEventListener(e.type, i);
            };
            let j = this.playerWin.document.getElementsByTagName('video')[0];
            if (j) j.addEventListener('emptied', i);
        }
        switch (res.format) {
            case 'flv_p60':
            case 'flv720_p60':
            case 'hdflv2':
            case 'flv':
            case 'flv720':
            case 'flv480':
            case 'flv320':
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

    getAvailableFormatName(accept_quality) {
        if (!Array.isArray(accept_quality)) accept_quality = Array.from(this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul').getElementsByTagName('li')).map(e => e.getAttribute('data-value'));

        const accept_format = accept_quality.map(e => BiliMonkey.valueToFormat(e));

        const vipExclusiveFormatSet = new Set(['flv_p60', 'hdflv2', 'flv720_p60']);
        const candidateFormatSet = new Set(this.getVIPStatus() ? accept_format : accept_quality.filter(e => !vipExclusiveFormatSet.has(e)));

        this.flvFormatName = ['flv_p60', 'hdflv2', 'flv', 'flv720_p60', 'flv720', 'flv480', 'flv320']
            .find(e => candidateFormatSet.has(e))
            || 'does_not_exist';

        this.mp4FormatName = ['hdmp4', 'mp4']
            .find(e => candidateFormatSet.has(e))
            || 'does_not_exist';
    }

    async execOptions() {
        if (this.cache) await this.cache.getDB();
        if (this.option.autoDefault) await this.sniffDefaultFormat();
        if (this.option.autoFLV) this.queryInfo('flv');
        if (this.option.autoMP4) this.queryInfo('mp4');
    }

    async sniffDefaultFormat() {
        if (this.defaultFormatPromise) return this.defaultFormatPromise;
        if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) return this.defaultFormatPromise = Promise.resolve();

        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;

        this.defaultFormatPromise = new Promise(resolve => {
            let timeout = setTimeout(() => { jq.ajax = _ajax; resolve(); }, 5000);
            let self = this;
            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    clearTimeout(timeout);
                    self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                    let _success = a.success;
                    a.success = res => {
                        let format = res.format;
                        let accept_format = res.accept_format.split(',');
                        switch (format) {
                            case 'flv360':
                                if (accept_format.includes('flv480')) break;
                            case 'flv480':
                                if (accept_format.includes('flv720')) break;
                            case 'flv720':
                                if (accept_format.includes('flv')) break;
                            case 'flv720_p60':
                                if (accept_format.includes('flv_p60')) break;
                            case 'flv':
                            case 'hdflv2':
                            case 'flv_p60':
                                self.lockFormat(format);
                                self.resolveFormat(res, format);
                                break;

                            case 'mp4':
                                if (accept_format.includes('hdmp4')) break;
                            case 'hdmp4':
                                self.lockFormat(format);
                                self.resolveFormat(res, format);
                                break;
                        }
                        if (self.proxy && self.flvs) {
                            self.setupProxy(res, _success);
                        }
                        else {
                            _success(res);
                        }
                        resolve(res);
                    };
                    jq.ajax = _ajax;
                }
                return _ajax.call(jq, a, c);
            };
        });
        return this.defaultFormatPromise;
    }

    async getBackgroundFormat(format) {
        if (format == 'hdmp4' || format == 'mp4') {
            let src = this.playerWin.document.getElementsByTagName('video')[0].src;
            if ((src.includes('hd') || format == 'mp4') && src.includes('.mp4')) {
                let pendingFormat = this.lockFormat(format);
                this.resolveFormat({ durl: [{ url: src }] }, format);
                return pendingFormat;
            }
        }

        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;

        let pendingFormat = this.lockFormat(format);
        let self = this;
        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
            if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                let _success = a.success;
                a.success = res => {
                    if (format == 'hdmp4') res.durl = [res.durl[0].backup_url.find(e => e.includes('hd') && e.includes('.mp4'))];
                    if (format == 'mp4') res.durl = [res.durl[0].backup_url.find(e => !e.includes('hd') && e.includes('.mp4'))];
                    self.resolveFormat(res, format);
                };
                jq.ajax = _ajax;
            }
            return _ajax.call(jq, a, c);
        };
        this.playerWin.player.reloadAccess();

        return pendingFormat;
    }

    async getCurrentFormat(format) {
        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;
        const bilibili_player_settings = this.playerWin.localStorage.getItem('bilibili_player_settings');
        const siblingFormat = format == this.flvFormatName ? this.mp4FormatName : this.flvFormatName;
        const fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': 'https://static.hdslb.com/encoding.mp4', 'backup_url': ['https://static.hdslb.com/encoding.mp4'] }] };

        let pendingFormat = this.lockFormat(format);
        let self = this;
        let blockedRequest = await new Promise(resolve => {
            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    // Send back a fake response to enable the change-format button.
                    self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                    a.success(fakedRes);
                    self.playerWin.document.getElementsByTagName('video')[1].loop = true;
                    let h = e => { resolve([a, c]); e.target.removeEventListener(e.type, h); };
                    self.playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
                }
                else {
                    return _ajax.call(jq, a, c);
                }
            };
            this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(siblingFormat)}"]`).click();
            this.playerWin.localStorage.setItem('bilibili_player_settings', bilibili_player_settings);
        });

        let siblingOK = siblingFormat == this.flvFormatName ? this.flvs : this.mp4;
        if (!siblingOK) {
            this.lockFormat(siblingFormat);
            blockedRequest[0].success = res => this.resolveFormat(res, siblingFormat);
            _ajax.call(jq, ...blockedRequest);
        }

        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
            if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                let _success = a.success;
                a.success = res => {
                    if (self.proxy) {
                        self.resolveFormat(res, format);
                        if (self.flvs) self.setupProxy(res, _success);
                    }
                    else {
                        _success(res);
                        self.resolveFormat(res, format);
                    }
                };
                jq.ajax = _ajax;
            }
            return _ajax.call(jq, a, c);
        };
        this.playerWin.localStorage.setItem = () => this.playerWin.localStorage.setItem = _setItem;
        this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(format)}"]`).click();

        return pendingFormat;
    }

    async getNonCurrentFormat(format) {
        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;
        const bilibili_player_settings = this.playerWin.localStorage.getItem('bilibili_player_settings');

        let pendingFormat = this.lockFormat(format);
        let self = this;
        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
            if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                self.cidAsyncContainer.resolve(a.url.match(/cid=\d+/)[0].slice(4));
                let _success = a.success;
                _success({});
                a.success = res => self.resolveFormat(res, format);
                jq.ajax = _ajax;
            }
            return _ajax.call(jq, a, c);
        };
        this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(format)}"]`).click();
        this.playerWin.localStorage.setItem('bilibili_player_settings', bilibili_player_settings);
        return pendingFormat;
    }

    async getASS(clickableFormat) {
        if (this.ass) return this.ass;
        this.ass = new Promise(async resolve => {
            if (!this.cid) this.cid = await new Promise(resolve => {
                if (!clickableFormat) reject('get ASS Error: cid unavailable, nor clickable format given.');
                const jq = this.playerWin.jQuery;
                const _ajax = jq.ajax;
                const bilibili_player_settings = this.playerWin.localStorage.getItem('bilibili_player_settings');

                this.lockFormat(clickableFormat);
                let self = this;
                jq.ajax = function (a, c) {
                    if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                    if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                        resolve(self.cid = a.url.match(/cid=\d+/)[0].slice(4));
                        let _success = a.success;
                        _success({});
                        a.success = res => self.resolveFormat(res, clickableFormat);
                        jq.ajax = _ajax;
                    }
                    return _ajax.call(jq, a, c);
                };
                this.playerWin.document.querySelector(`div.bilibili-player-video-btn-quality > div ul li[data-value="${BiliMonkey.formatToValue(clickableFormat)}"]`).click();
                this.playerWin.localStorage.setItem('bilibili_player_settings', bilibili_player_settings);
            });
            let bilibili_player_settings = this.playerWin.localStorage.bilibili_player_settings && JSON.parse(this.playerWin.localStorage.bilibili_player_settings);
            let option = bilibili_player_settings && this.font && {
                'fontlist': bilibili_player_settings.setting_config['fontfamily'] != 'custom' ? bilibili_player_settings.setting_config['fontfamily'].split(/, ?/) : bilibili_player_settings.setting_config['fontfamilycustom'].split(/, ?/),
                'font_size': parseFloat(bilibili_player_settings.setting_config['fontsize']),
                'opacity': parseFloat(bilibili_player_settings.setting_config['opacity']),
                'bold': bilibili_player_settings.setting_config['bold'] ? 1 : 0,
            } || undefined;
            const { fetchDanmaku, generateASS, setPosition } = new ASSDownloader(option);

            fetchDanmaku(this.cid, danmaku => {
                if (bilibili_player_settings && this.blocker) {
                    let regexps = bilibili_player_settings.block.list.map(e => e.v).join('|');
                    if (regexps) {
                        regexps = new RegExp(regexps);
                        danmaku = danmaku.filter(d => !regexps.test(d.text));
                    }
                }
                let ass = generateASS(setPosition(danmaku), {
                    'title': top.document.title,
                    'ori': top.location.href,
                });
                // I would assume most users are using Windows
                let blob = new Blob(['\ufeff' + ass], { type: 'application/octet-stream' });
                resolve(this.ass = top.URL.createObjectURL(blob));
            });
        });
        return this.ass;
    }

    async queryInfo(format) {
        return this.queryInfoMutex.lockAndAwait(async () => {
            switch (format) {
                case 'flv':
                    if (this.flvs)
                        return this.flvs;
                    else if (this.flvFormatName == 'does_not_exist')
                        return this.flvFormatName;
                    else if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(this.flvFormatName))
                        return this.getCurrentFormat(this.flvFormatName);
                    else
                        return this.getNonCurrentFormat(this.flvFormatName);
                case 'mp4':
                    if (this.mp4)
                        return this.mp4;
                    else if (this.mp4FormatName == 'does_not_exist')
                        return this.mp4FormatName;
                    else if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(this.mp4FormatName))
                        return this.getCurrentFormat(this.mp4FormatName);
                    else
                        return this.getNonCurrentFormat(this.mp4FormatName);
                case 'ass':
                    if (this.ass)
                        return this.ass;
                    else if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-selected]').getAttribute('data-value') == BiliMonkey.formatToValue(this.flvFormatName))
                        return this.getASS(this.mp4FormatName);
                    else
                        return this.getASS(this.flvFormatName);
                default:
                    throw `Bilimonkey: What is format ${format}?`;
            }
        });
    }

    async getPlayerButtons() {
        if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
            return this.playerWin;
        }
        else {
            return new Promise(resolve => {
                let observer = new MutationObserver(() => {
                    if (this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li')) {
                        observer.disconnect();
                        resolve(this.playerWin);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    async hangPlayer() {
        const fakedRes = { 'from': 'local', 'result': 'suee', 'format': 'faked_mp4', 'timelength': 10, 'accept_format': 'hdflv2,flv,hdmp4,faked_mp4,mp4', 'accept_quality': [112, 80, 64, 32, 16], 'seek_param': 'start', 'seek_type': 'second', 'durl': [{ 'order': 1, 'length': 1000, 'size': 30000, 'url': '' }] };
        const jq = this.playerWin.jQuery;
        const _ajax = jq.ajax;
        const bilibili_player_settings = this.playerWin.localStorage.getItem('bilibili_player_settings');

        return this.queryInfoMutex.lockAndAwait(() => new Promise(async resolve => {
            let blockerTimeout;
            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    clearTimeout(blockerTimeout);
                    a.success(fakedRes);
                    blockerTimeout = setTimeout(() => {
                        jq.ajax = _ajax;
                        resolve();
                    }, 2500);
                }
                else {
                    return _ajax.call(jq, a, c);
                }
            };
            let button = Array.from(this.playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul').getElementsByTagName('li'))
                .find(e => !e.getAttribute('data-selected') && e.children.length == 2);
            this.playerWin.localStorage.setItem('bilibili_player_settings', bilibili_player_settings);
            button.click();
        }));
    }

    async loadFLVFromCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.flv/)[0];
        let item = await this.cache.getData(name);
        if (!item) return;
        return this.flvsBlob[index] = item.data;
    }

    async loadPartialFLVFromCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.flv/)[0];
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
        let name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.flv/)[0];
        return this.cache.addData({ name, data: blob });
    }

    async savePartialFLVToCache(index, blob) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.flv/)[0];
        name = 'PC_' + name;
        return this.cache.putData({ name, data: blob });
    }

    async cleanPartialFLVInCache(index) {
        if (!this.cache) return;
        if (!this.flvs) throw 'BiliMonkey: info uninitialized';
        let name = this.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.flv/)[0];
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
            let name = flv.match(/\d+-\d+(?:\d|-|hd)*\.flv/)[0];
            ret.push(await this.cache.deleteData(name));
            ret.push(await this.cache.deleteData('PC_' + name));
        }

        return ret;
    }

    async setupProxy(res, onsuccess) {
        const _fetch = this.playerWin.fetch;
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

        await this.loadAllFLVFromCache();
        let resProxy = Object.assign({}, res);
        for (let i = 0; i < this.flvsBlob.length; i++) {
            if (this.flvsBlob[i]) resProxy.durl[i].url = this.playerWin.URL.createObjectURL(this.flvsBlob[i]);
        }
        return onsuccess(resProxy);
    }

    static async fetchDanmaku(cid) {
        return ASSConverter.parseXML(
            await (await fetch(`https://comment.bilibili.com/${cid}.xml`)).text()
        );
    }

    static async getAllPageDefaultFormats(playerWin = top) {
        const jq = playerWin.jQuery;
        const _ajax = jq.ajax;

        const queryInfoMutex = new Mutex();
        const { fetchDanmaku, generateASS, setPosition } = new ASSDownloader();
        const list = await new Promise(resolve => {
            const i = setInterval(() => {
                const ret = playerWin.player.getPlaylist();
                if (ret) {
                    clearInterval(i);
                    resolve(ret);
                }
            }, 500);
        });
        const index = list.reduce((acc, cur) => { acc[cur.cid] = cur; return acc }, {});
        const end = list[list.length - 1].cid.toString();
        const ret = [];
        jq.ajax = function (a, c) {
            if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
            if (a.url.includes('comment.bilibili.com') || a.url.includes('interface.bilibili.com/player?') || a.url.includes('api.bilibili.com/x/player/playurl/token')) return _ajax.call(jq, a, c);
            if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                (async () => {
                    a.success = undefined;
                    let cid = a.url.match(/cid=\d+/)[0].slice(4);
                    const [danmuku, res] = await Promise.all([
                        new Promise(resolve => {
                            fetchDanmaku(cid, danmaku => {
                                let ass = generateASS(setPosition(danmaku), {
                                    'title': document.title,
                                    'ori': location.href,
                                });
                                // I would assume most users are using Windows
                                let blob = new Blob(['\ufeff' + ass], { type: 'application/octet-stream' });
                                resolve(playerWin.URL.createObjectURL(blob));
                            });
                        }),
                        _ajax.call(jq, a, c)
                    ]);
                    ret.push({
                        durl: res.durl.map(({ url }) => url.replace('http:', playerWin.location.protocol)),
                        danmuku,
                        name: index[cid].part || index[cid].index,
                        outputName: res.durl[0].url.match(/\d+-\d+(?:\d|-|hd)*(?=\.flv)/) ?
                            res.durl[0].url.match(/\d+-\d+(?:\d|-|hd)*(?=\.flv)/)[0].replace(/(?<=\d+)-\d+(?=(?:\d|-|hd)*\.flv)/, '')
                            : res.durl[0].url.match(/\d(?:\d|-|hd)*(?=\.mp4)/) ?
                                res.durl[0].url.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0]
                                : cid,
                        cid,
                        res,
                    });
                    queryInfoMutex.unlock();
                })();
            }
            return _ajax.call(jq, { url: '//0.0.0.0' });
        };

        await queryInfoMutex.lock();
        playerWin.player.next(1);
        while (1) {
            await queryInfoMutex.lock();
            if (ret[ret.length - 1].cid == end) break;
            playerWin.player.next();
        }

        return
    }

    static formatToValue(format) {
        if (format == 'does_not_exist') throw `formatToValue: cannot lookup does_not_exist`;
        if (typeof BiliMonkey.formatToValue.dict == 'undefined') BiliMonkey.formatToValue.dict = {
            'flv_p60': '116',
            'flv720_p60': '74',
            'flv': '80',
            'flv720': '64',
            'flv480': '32',
            'flv320': '15',

            // legacy - late 2017
            'hdflv2': '112',
            'hdmp4': '64', // data-value is still '64' instead of '48'.  '48',
            'mp4': '16',
        }
        return BiliMonkey.valueToFormat.dict[value] || null;
    }

    static valueToFormat(value) {
        if (typeof BiliMonkey.valueToFormat.dict == 'undefined') BiliMonkey.valueToFormat.dict = {
            '116': 'flv_p60',
            '74': 'flv720_p60',
            '80': 'flv',
            '64': 'flv720',
            '32': 'flv480',
            '15': 'flv320',

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
            // 1. automation
            ['autoDefault', '尝试自动抓取：不会拖慢页面，抓取默认清晰度，但可能抓不到。'],
            ['autoFLV', '强制自动抓取FLV：会拖慢页面，如果默认清晰度也是超清会更慢，但保证抓到。'],
            ['autoMP4', '强制自动抓取MP4：会拖慢页面，如果默认清晰度也是高清会更慢，但保证抓到。'],

            // 2. cache
            ['cache', '关标签页不清缓存：保留完全下载好的分段到缓存，忘记另存为也没关系。'],
            ['partial', '断点续传：点击“取消”保留部分下载的分段到缓存，忘记点击会弹窗确认。'],
            ['proxy', '用缓存加速播放器：如果缓存里有完全下载好的分段，直接喂给网页播放器，不重新访问网络。小水管利器，播放只需500k流量。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。'],

            // 3. customizing
            ['blocker', '弹幕过滤：在网页播放器里设置的屏蔽词也对下载的弹幕生效。'],
            ['font', '自定义字体：在网页播放器里设置的字体、大小、加粗、透明度也对下载的弹幕生效。']
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
        }
    }

    static _UNIT_TEST() {
        return (async () => {
            let playerWin = await BiliUserJS.getPlayerWin();
            window.m = new BiliMonkey(playerWin);

            console.warn('sniffDefaultFormat test');
            await m.sniffDefaultFormat();
            console.log(m);

            console.warn('data race test');
            m.queryInfo('mp4');
            console.log(m.queryInfo('mp4'));

            console.warn('getNonCurrentFormat test');
            console.log(await m.queryInfo('mp4'));

            console.warn('getCurrentFormat test');
            console.log(await m.queryInfo('flv'));

            //location.reload();
        })();
    }
}

export default BiliMonkey;
