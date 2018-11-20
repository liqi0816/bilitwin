
/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OnEventDuplexFactory, inputSocketSymbol } from "../util/event-duplex.js";
import { SimpleCustomEvent } from '../util/simple-event-target.js';
import BiliUserJS, { HTMLVideoElementEnum } from './biliuserjs.js';
import CommonCachedStorage from '../util/lib-cached-storage/common-cached-storage.js';
import CachedDOMStorage from '../util/lib-cached-storage/cached-dom-storage.js';
import { yieldThread, sleep } from '../util/async-control.js';
import { asyncOnce } from '../util/on-event-target.js';
import { int, str } from '../util/type-conversion.macro.js';
import { FrameSearcher } from '../codec/introskip/interface.js';

export type BiliPolyfillInit = Partial<typeof BiliPolyfill.OPTIONS_DEFAULT>

export type InEventMap = {
    cidchange: SimpleCustomEvent<string>
    aidchange: SimpleCustomEvent<string>
    videochange: SimpleCustomEvent<HTMLVideoElement>
    menuclose: SimpleCustomEvent<HTMLUListElement>
}

export interface SubDomainSpecificSettings<T> {
    www?: T
    bangumi?: T
}

export interface VideoSkipSettings {
    anchor: Uint8Array
    duration: number
}

export interface OPEDData {
    op?: VideoSkipSettings
    ed?: VideoSkipSettings
}

export interface UserData {
    restore: {
        preventShade: SubDomainSpecificSettings<boolean>
        danmukuSwitch: SubDomainSpecificSettings<boolean>
        danmukuTopSwitch: SubDomainSpecificSettings<boolean>
        danmukuBottomSwitch: SubDomainSpecificSettings<boolean>
        danmukuScrollSwitch: SubDomainSpecificSettings<boolean>
        speed: SubDomainSpecificSettings<number>
        wideScreen: SubDomainSpecificSettings<boolean>
    }
    oped: {
        [collectionId: string]: OPEDData | undefined
    }
}

class BiliPolyFillException extends Error { }
BiliPolyFillException.prototype.name = 'BiliPolyfillException';

class BiliPolyfill extends OnEventDuplexFactory<InEventMap>() {
    userjs: BiliUserJS

    options: typeof BiliPolyfill.OPTIONS_DEFAULT
    storage: CommonCachedStorage | null
    userdata: UserData | null

    static readonly OPTIONS_DEFAULT = {
        // 1. user interface
        badgeWatchLater: true,
        squashElectric: true,
        skipElectric: false,

        // 2. automation
        storage: true as boolean | CommonCachedStorage,
        scroll: true,
        focus: true,
        menuFocus: true,
        restorePrevent: true,
        restoreDanmuku: true,
        restoreSpeed: true,
        restoreWide: true,
        autoResume: true,
        autoPlay: false,
        autoFullScreen: false,
        oped: true,
        series: true,

        // 3. key binding
        keydownPlayFull: true,
        dblclickFull: true,

        // 4. easter eggs
        speech: false,
    }
    static readonly STORAGE_NAME_DEFAULT = 'bilipolyfill'
    constructor(userjs: BiliUserJS, options = BiliPolyfill.OPTIONS_DEFAULT as BiliPolyfillInit) {
        super();
        this.userjs = userjs;

        this.options = {} as typeof BiliPolyfill.OPTIONS_DEFAULT;
        type OPTIONS_KEY = keyof typeof BiliPolyfill.OPTIONS_DEFAULT;
        for (const e in BiliPolyfill.OPTIONS_DEFAULT) {
            if (typeof options[e as OPTIONS_KEY] === 'undefined') {
                this.options[e as OPTIONS_KEY] = BiliPolyfill.OPTIONS_DEFAULT[e as OPTIONS_KEY];
            }
            else {
                this.options[e as OPTIONS_KEY] = Boolean(options[e as OPTIONS_KEY]);
            }
        }
        if (typeof options.storage === 'object') {
            this.storage = options.storage;
        }
        else if (options.storage) {
            this.storage = new CachedDOMStorage();
        }
        else {
            this.storage = null;
        }
        this.userdata = null;
    }

    static readonly USERDATA_SIZE_LIMIT = 1048576
    saveUserdata() {
        if (!this.storage) throw new BiliPolyFillException(`BiliPolyfill.saveUserdata: storage ${this.storage} is falsy`);
        const string = JSON.stringify(this.userdata);
        if (string.length > BiliPolyfill.USERDATA_SIZE_LIMIT) throw new RangeError('BiliPolyfill.saveUserdata: userdata size exceed limit');
        return this.storage.setItem(BiliPolyfill.STORAGE_NAME_DEFAULT, string);
    }

    async retrieveUserdata() {
        try {
            if (this.storage) {
                const getItem = await this.storage.getItem('biliPolyfill');
                if (getItem) this.userdata = JSON.parse(getItem);
            }
        }
        catch { }

        if (!this.userdata) this.userdata = {} as UserData;
        if (typeof this.userdata.restore !== 'object') this.userdata.restore = {
            preventShade: {},
            danmukuSwitch: {},
            danmukuTopSwitch: {},
            danmukuBottomSwitch: {},
            danmukuScrollSwitch: {},
            speed: {},
            wideScreen: {},
        };
        if (typeof this.userdata.oped !== 'object') this.userdata.oped = {};
        return this.userdata;
    }

    async activate(userjs?: BiliUserJS) {
        if (userjs) this.userjs = userjs;
        await this.retrieveUserdata();

        return this;
    }

    close() {

    }

    // once
    async badgeWatchLater() {
        // 1. find watchlater button
        const li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');
        if (!li) throw new BiliPolyFillException(`BiliPolyfill.badgeWatchLater: i_menu_watchLater_btn not found`);;

        // 2. initialize watchlater panel
        const hook = new Promise(resolve => new MutationObserver((mutations, observer) => {
            resolve(mutations);
            observer.disconnect();
        }).observe(li, { childList: true }));
        li.dispatchEvent(new Event('mouseenter'));
        await hook;

        // 3. exceptional watchlater panel structure => throw
        if (li.children[1].children[0].children[0].className !== 'm-w-loading' as string) {
            throw new BiliPolyFillException('BiliPolyfill.badgeWatchLater: cannot find m-w-loading panel');
        }

        // 4. hide watchlater panel
        (li.children[1] as HTMLElement).style.visibility = 'hidden';

        // 5. wait for watchlater panel to load
        await new Promise(resolve => new MutationObserver((mutations, observer) => {
            resolve(mutations);
            observer.disconnect();
        }).observe(li.children[1].children[0], { childList: true }));

        try {
            // 6. no data => exit
            if (li.children[1].children[0].children[0].className == 'no-data') return;

            // 7. otherwise => append div
            const div = top.document.createElement('div');
            div.className = 'num';
            if (li.children[1].children[0].children[0].children.length > 5) {
                div.textContent = '5+';
            }
            else {
                div.textContent = str(li.children[1].children[0].children[0].children.length);
            }
            li.children[0].appendChild(div);
            this.addEventListener('close', () => div.remove());
        }
        finally {
            // 8. clean up watchlater panel
            li.dispatchEvent(new Event('mouseleave'));
            (li.children[1] as HTMLElement).style.visibility = '';
        }
    }

    // multiple-times
    squashElectric() {
        // 1. autopart !== 5 + 5 => exit
        const bilibili_player_settings = this.userjs.playerWin.localStorage.getItem('bilibili_player_settings');
        if (!(bilibili_player_settings && bilibili_player_settings.includes('"autopart":1') || this.options.skipElectric)) {
            return;
        }

        this[inputSocketSymbol].addEventListener('videoended', async () => {
            // 2. wait for electric panel
            await yieldThread();
            const player = this.userjs.player!;

            // 3. click skip
            const electricPanel = player.getElementsByClassName('bilibili-player-electric-panel')[0] as HTMLElement;
            if (!electricPanel) return;
            (electricPanel.children[2] as HTMLElement).click();

            // 4. but display a fake electric panel
            electricPanel.style.display = 'block';
            electricPanel.style.zIndex = '233';

            // 5. and perform a fake countdown
            for (let i = 5; i >= 0; i--) {
                // 5.1 yield to next part hint
                if (player.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) electricPanel.style.zIndex = '';

                // 5.2 countdown > 0 => update countdown textContent
                electricPanel.children[2].children[0].textContent = `0${i}`;

                // 5.3 sleep
                await sleep(1000);
            }
            // 5.4 countdown === 0 => clean up
            electricPanel.remove();
        });
    }

    // once
    async scroll() {
        const bofqi = this.userjs.bofqi || (await asyncOnce<SimpleCustomEvent<HTMLDivElement>>(this[inputSocketSymbol], 'bofqiload')).detail;
        if (top.scrollY < 200) bofqi.scrollIntoView();
    }

    // once
    async focus() {
        const player = this.userjs.player || (await asyncOnce<SimpleCustomEvent<HTMLDivElement>>(this[inputSocketSymbol], 'playerchange')).detail;
        (player.getElementsByClassName('bilibili-player-video-progress')[0] as HTMLElement).click();
    }

    // multiple-times
    focusMenu() {
        this[inputSocketSymbol].addEventListener('menuclose', () => this.focus());
    }

    // once
    restorePrevent() {
        if (!this.userdata) throw new BiliPolyFillException('BiliPolyFill: userdata not initialized');

        // 1. restore option
        const preventShade = this.userdata.restore.preventShade[this.userjs.subdomain];

        // 2. MUST initialize setting panel before click
        this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseover'));

        // 3. restore if true
        const input = this.userjs.playerWin.document.getElementsByName('ctlbar_danmuku_prevent')[0];
        if (preventShade && !input.nextElementSibling!.classList.contains('bpui-state-active')) {
            input.click();
        }

        // 4. clean up setting panel
        this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseout'));

        // 5. memorize option
        this.addEventListener('close', () => {
            if (!this.userdata) throw new BiliPolyFillException('BiliPolyFill: userdata not initialized');

            this.userdata.restore.preventShade[this.userjs.subdomain] = !input.nextElementSibling!.classList.contains('bpui-state-active');
        });
    }

    // once
    restoreDanmuku() {
        if (!this.userdata) throw new BiliPolyFillException('BiliPolyFill: userdata not initialized');

        // 1. restore option
        const danmukuSwitch = this.userdata.restore.danmukuSwitch[this.userjs.subdomain];
        const danmukuTopSwitch = this.userdata.restore.danmukuTopSwitch[this.userjs.subdomain];
        const danmukuBottomSwitch = this.userdata.restore.danmukuBottomSwitch[this.userjs.subdomain];
        const danmukuScrollSwitch = this.userdata.restore.danmukuScrollSwitch[this.userjs.subdomain];

        // 2. MUST initialize setting panel before click
        this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseover'));

        // 3. restore if true
        // 3.1 danmukuSwitch
        const danmukuSwitchDiv = this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0] as HTMLElement;
        if (danmukuSwitch && !danmukuSwitchDiv.classList.contains('video-state-danmaku-off')) {
            danmukuSwitchDiv.click();
        }

        // 3.2 danmukuTopSwitch danmukuBottomSwitch danmukuScrollSwitch
        const [danmukuTopSwitchDiv, danmukuBottomSwitchDiv, danmukuScrollSwitchDiv] = this.userjs.playerWin.document.getElementsByClassName('bilibili-player-danmaku-setting-lite-type-list')[0].children as unknown as Iterable<HTMLElement>;
        if (danmukuTopSwitch && !danmukuTopSwitchDiv.classList.contains('disabled')) {
            danmukuTopSwitchDiv.click();
        }
        if (danmukuBottomSwitch && !danmukuBottomSwitchDiv.classList.contains('disabled')) {
            danmukuBottomSwitchDiv.click();
        }
        if (danmukuScrollSwitch && !danmukuScrollSwitchDiv.classList.contains('disabled')) {
            danmukuScrollSwitchDiv.click();
        }

        // 4. clean up setting panel
        this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseout'));

        // 5. memorize option
        this.addEventListener('close', () => {
            this.userdata!.restore.danmukuSwitch[this.userjs.subdomain] = danmukuSwitchDiv.classList.contains('video-state-danmaku-off');
            this.userdata!.restore.danmukuTopSwitch[this.userjs.subdomain] = danmukuTopSwitchDiv.classList.contains('disabled');
            this.userdata!.restore.danmukuBottomSwitch[this.userjs.subdomain] = danmukuBottomSwitchDiv.classList.contains('disabled');
            this.userdata!.restore.danmukuScrollSwitch[this.userjs.subdomain] = danmukuScrollSwitchDiv.classList.contains('disabled');
        });
    }

    // once
    async restoreSpeed() {
        if (!this.userdata) throw new BiliPolyFillException('BiliPolyFill: userdata not initialized');

        // 1. get video
        const video = this.userjs.video || (await asyncOnce<SimpleCustomEvent<HTMLVideoElement>>(this[inputSocketSymbol], 'videochange')).detail;

        // 1. restore option
        const speed = this.userdata.restore.speed[this.userjs.subdomain];

        // 2. restore if different
        if (speed && speed != video.playbackRate) {
            video.playbackRate = speed;
        }

        // 3. memorize option
        this.addEventListener('close', () => {
            this.userdata!.restore.speed[this.userjs.subdomain] = this.userjs.video!.playbackRate;
        });
    }

    // once
    restoreWide() {
        if (!this.userdata) throw new BiliPolyFillException('BiliPolyFill: userdata not initialized');

        // 1. restore option
        const wideScreen = this.userdata.restore.wideScreen[this.userjs.subdomain];

        // 2. restore if different
        const i = this.userjs.playerWin.document.getElementsByClassName('bilibili-player-iconfont-widescreen')[0] as HTMLElement;
        if (wideScreen && !i.classList.contains('icon-24wideon')) {
            i.click();
        }

        // 3. memorize option
        this.addEventListener('close', () => {
            this.userdata!.restore.wideScreen[this.userjs.subdomain] = i.classList.contains('icon-24wideon');
        });
    }

    static AUTO_RESUME_TIMEOUT = 3000
    // once
    async autoResume() {
        // 1. get resume popup
        if (!this.userjs.video || this.userjs.video.readyState < (HTMLVideoElement as unknown as typeof HTMLVideoElementEnum).HAVE_FUTURE_DATA) {
            await asyncOnce<SimpleCustomEvent<HTMLVideoElement>>(this[inputSocketSymbol], 'videocanplay');
        }
        const span = this.userjs.player!.querySelector('div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
        if (!span) return;

        // 2. parse resume popup
        const [min, sec] = span.textContent!.split(':');
        if (!min || !sec) throw new BiliPolyFillException(`BiliPolyfill.autoResume: cannot parse resume popup remaining time`);

        // 3. parse last playback progress
        const time = int(min) * 60 + int(sec);

        // 3.1 still far from end => reasonable to resume => click
        const video = this.userjs.video!;
        if (time < video.duration - 10) {
            // 3.1.1 paused and not autoplay => should remain paused after jump => hook video.play
            if (video.paused && !video.autoplay) {
                video.play = async () => {
                    await yieldThread();
                    (this.userjs.player!.getElementsByClassName('bilibili-player-video-btn-start')[0] as HTMLElement).click();
                    video.play = HTMLVideoElement.prototype.play;
                }
            }

            // 3.1.2 simple jump
            (this.userjs.player!.getElementsByClassName('bilibili-player-video-toast-item-jump')[0] as HTMLElement).click();
        }

        // 3.2 near end => silent popup
        else {
            (this.userjs.player!.getElementsByClassName('bilibili-player-video-toast-item-close')[0] as HTMLElement).click();
            (this.userjs.player!.getElementsByClassName('bilibili-player-video-toast-bottom')[0].children[0] as HTMLElement).style.visibility = 'hidden';
        }
    }

    // once
    async autoPlay() {
        // 1. get video
        const video = this.userjs.video || (await asyncOnce<SimpleCustomEvent<HTMLVideoElement>>(this[inputSocketSymbol], 'videochange')).detail;

        // 2. set autoplay
        video.autoplay = true;

        // 3. mysteriously still paused => force play
        await yieldThread();
        if (video.paused) (this.userjs.player!.getElementsByClassName('bilibili-player-video-btn-start')[0] as HTMLElement).click();
    }

    // once
    async autoFullScreen() {
        // 1. get player
        const player = this.userjs.player || (await asyncOnce<SimpleCustomEvent<HTMLDivElement>>(this[inputSocketSymbol], 'playerchange')).detail;

        // 2. set fullscreen
        if (player.getElementsByClassName('div.video-state-fullscreen-off')[0]) {
            (player.getElementsByClassName('bilibili-player-video-btn-fullscreen')[0] as HTMLElement).click();
        }
    }

    getCollectionId() {
        {
            const match = top.location.pathname.match(/av\d+/);
            if (match) return match[0];
        }
        {
            const match = top.location.hash.match(/av\d+/);
            if (match) return match[0];
        }
        {
            const match = top.document.querySelector('div.bangumi-info a') as HTMLAnchorElement;
            if (match) return match.href;
        }
        return null;
    }

    // triggered
    setOPED(oped: keyof OPEDData, { anchor, duration }: VideoSkipSettings) {
        if (!this.userdata) throw new BiliPolyFillException('BiliPolyFill: userdata not initialized');

        const id = this.getCollectionId();
        if (!id) throw new BiliPolyFillException('BiliPolyFill: cannot find collection id');

        if (!this.userdata.oped[id]) this.userdata.oped[id] = {};
        this.userdata.oped[id]![oped] = { anchor, duration };
    }

    clearOPED() {
        if (!this.userdata) throw new BiliPolyFillException('BiliPolyFill: userdata not initialized');

        const id = this.getCollectionId();
        if (!id) throw new BiliPolyFillException('BiliPolyFill: cannot find collection id');
        this.userdata.oped[id] = undefined;
    }

    // multiple-times
    async skipOPED() {
        if (!this.userdata) throw new BiliPolyFillException('BiliPolyFill: userdata not initialized');

        const id = this.getCollectionId();
        if (!id) throw new BiliPolyFillException('BiliPolyFill: cannot find collection id');

        const video = this.userjs.video || (await asyncOnce<SimpleCustomEvent<HTMLVideoElement>>(this[inputSocketSymbol], 'videochange')).detail;
        const oped = this.userdata.oped[id]
        if (oped) {
            const { op, ed } = oped;
            if (op) {
                const { anchor, duration } = op;
                const searcher = new FrameSearcher(video, Uint8Array.from(anchor));
                searcher.addEventListener('load', () => video.currentTime += duration);
                searcher.start();
                this.addEventListener('close', () => searcher.stop());
            }
            if (ed) {
                const { anchor, duration } = ed;
                const searcher = new FrameSearcher(video, Uint8Array.from(anchor));
                searcher.addEventListener('load', () => video.currentTime += duration);
                searcher.start();
                this.addEventListener('close', () => searcher.stop());
            }
        }
    }

    // multiple-times
    series() {
        this[inputSocketSymbol].addEventListener('aidchange', ({ detail: aid }) => {
            // 1. find current title
            const title = top.document.getElementsByTagName('h1')[0].textContent!.replace(/\(\d+\)$/, '').trim();

            // 2. find current ep number
            const ep = title.match(/\d+(?=[^\d]*$)/);
            if (!ep) return;

            // 3. current title - current ep number => series common title
            const seriesTitle = title.slice(0, title.lastIndexOf(ep[0])).trim();

        });
    }

    // once
    keydownPlayFull() {

    }

    // multiple-times
    dblclickFull() {

    }
}
