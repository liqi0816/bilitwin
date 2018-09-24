/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import BiliUserJS from './biliuserjs/biliuserjs.js';
import BiliMonkey from './biliuserjs/bilimonkey.js';
import BiliPolyfill from './biliuserjs/bilipolyfill.js';
import UI from './ui/ui.js';
import FLV from './flvparser/flv.js';

let debugOption = { debug: 1 };

class BiliTwin extends BiliUserJS {
    static get debugOption() {
        return debugOption;
    }

    static set debugOption(option) {
        debugOption = option;
    }

    constructor(option = {}, ui) {
        super();
        this.BiliMonkey = BiliMonkey;
        this.BiliPolyfill = BiliPolyfill;
        this.playerWin = null;
        this.monkey = null;
        this.polifill = null;
        this.ui = ui || new UI(this);
        this.option = option;
    }

    async runCidSession() {
        // 1. playerWin and option
        try {
            // you know what? it is a race, data race for jq! try not to yield to others!
            this.playerWin = BiliUserJS.tryGetPlayerWinSync() || await BiliTwin.getPlayerWin();
        }
        catch (e) {
            if (e == 'Need H5 Player') UI.requestH5Player();
            throw e;
        }
        const href = location.href;
        this.option = this.getOption();
        if (this.option.debug) {
            if (top.console) top.console.clear();
        }

        // 2. monkey and polyfill
        this.monkey = new BiliMonkey(this.playerWin, this.option);
        this.polyfill = new BiliPolyfill(this.playerWin, this.option, t => UI.hintInfo(t, this.playerWin));
        await Promise.all([this.monkey.execOptions(), this.polyfill.setFunctions()]);

        // 3. async consistent => render UI
        const cidRefresh = BiliTwin.getCidRefreshPromise(this.playerWin);
        if (href == location.href) {
            this.ui.option = this.option;
            this.ui.cidSessionRender();
        }
        else {
            cidRefresh.resolve();
        }

        // 4. debug
        if (this.option.debug) {
            [(top.unsafeWindow || top).monkey, (top.unsafeWindow || top).polyfill] = [this.monkey, this.polyfill];
        }

        // 5. refresh => session expire
        await cidRefresh;
        this.monkey.destroy();
        this.polyfill.destroy();
        this.ui.cidSessionDestroy();
    }

    async mergeFLVFiles(files) {
        return URL.createObjectURL(await FLV.mergeBlobs(files));
    }

    async clearCacheDB(cache) {
        if (cache) return cache.deleteEntireDB();
    }

    resetOption(option = this.option) {
        option.setStorage('BiliTwin', JSON.stringify({}));
        return this.option = {};
    }

    getOption(playerWin = this.playerWin) {
        let rawOption = null;
        try {
            rawOption = JSON.parse(playerWin.localStorage.getItem('BiliTwin'));
        }
        catch (e) { }
        finally {
            if (!rawOption) rawOption = {};
            rawOption.setStorage = (n, i) => playerWin.localStorage.setItem(n, i);
            rawOption.getStorage = n => playerWin.localStorage.getItem(n);
            return Object.assign(
                {},
                BiliMonkey.optionDefaults,
                BiliPolyfill.optionDefaults,
                UI.optionDefaults,
                rawOption,
                BiliTwin.debugOption,
            );
        }
    }

    saveOption(option = this.option) {
        return option.setStorage('BiliTwin', JSON.stringify(option));
    }

    static async init() {
        if (!document.body) return;
        BiliTwin.outdatedEngineClearance();
        BiliTwin.firefoxClearance();

        const twin = new BiliTwin();

        while (1) {
            await twin.runCidSession();
        }
    }

    static outdatedEngineClearance() {
        if (typeof Promise != 'function' || typeof MutationObserver != 'function') {
            alert('这个浏览器实在太老了，脚本决定罢工。');
            throw 'BiliTwin: browser outdated: Promise or MutationObserver unsupported';
        }
    }

    static firefoxClearance() {
        if (navigator.userAgent.includes('Firefox')) {
            BiliTwin.debugOption.proxy = false;
            if (!window.navigator.temporaryStorage && !window.navigator.mozTemporaryStorage) window.navigator.temporaryStorage = { queryUsageAndQuota: func => func(-1048576, 10484711424) };
        }
    }

    static xpcWrapperClearance() {
        if (top.unsafeWindow) {
            Object.defineProperty(window, 'cid', {
                configurable: true,
                get: () => String(unsafeWindow.cid)
            });
            Object.defineProperty(window, 'player', {
                configurable: true,
                get: () => ({ destroy: unsafeWindow.player.destroy, reloadAccess: unsafeWindow.player.reloadAccess })
            });
            Object.defineProperty(window, 'jQuery', {
                configurable: true,
                get: () => unsafeWindow.jQuery,
            });
            Object.defineProperty(window, 'fetch', {
                configurable: true,
                get: () => unsafeWindow.fetch.bind(unsafeWindow),
                set: _fetch => unsafeWindow.fetch = _fetch.bind(unsafeWindow)
            });
        }
    }
}

BiliTwin.domContentLoadedThen(BiliTwin.init);
