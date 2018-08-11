
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
import BiliUserJS from './biliuserjs.js';
import CommonCachedStorage from '../util/lib-cached-storage/common-cached-storage.js';
import CachedDOMStorage from '../util/lib-cached-storage/cached-dom-storage.js';
import { yieldThread, sleep } from '../util/async-control.js';
import { asyncOnce } from '../util/on-event-target.js';

export type BiliPolyfillInit = Partial<typeof BiliPolyfill.OPTIONS_DEFAULT>

export type InEventMap = {
    cidchange: SimpleCustomEvent<string>
    aidchange: SimpleCustomEvent<string>
    videochange: SimpleCustomEvent<HTMLVideoElement>
    menuclose: SimpleCustomEvent<HTMLUListElement>
}

export interface OPEDData {
    opstart?: number
    opend?: number
    opduration?: number
    edstart?: number
    edend?: number
    edduration?: number
}

export interface SubDomainSpecificSettings<T> {
    www?: T
    bangumi?: T
}

export interface UserData {
    oped: {
        [aid: string]: OPEDData
    }
    restore: {
        preventShade: SubDomainSpecificSettings<boolean>
        danmukuSwitch: SubDomainSpecificSettings<boolean>
        danmukuTopSwitch: SubDomainSpecificSettings<boolean>
        danmukuBottomSwitch: SubDomainSpecificSettings<boolean>
        danmukuScrollSwitch: SubDomainSpecificSettings<boolean>
        speed: SubDomainSpecificSettings<number>
        wideScreen: SubDomainSpecificSettings<boolean>
    }
}

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
        for (const e in BiliPolyfill.OPTIONS_DEFAULT) {
            if (typeof options[e as keyof typeof BiliPolyfill.OPTIONS_DEFAULT] === 'undefined') {
                this.options[e as keyof typeof BiliPolyfill.OPTIONS_DEFAULT] = BiliPolyfill.OPTIONS_DEFAULT[e as keyof typeof BiliPolyfill.OPTIONS_DEFAULT];
            }
            else {
                this.options[e as keyof typeof BiliPolyfill.OPTIONS_DEFAULT] = Boolean(options[e as keyof typeof BiliPolyfill.OPTIONS_DEFAULT]);
            }
        }
        if (options.storage) {
            if (typeof options.storage === 'object') {
                this.storage = options.storage;
            }
            else {
                this.storage = new CachedDOMStorage();
            }
            this.userdata = this.storage.getJSON(BiliPolyfill.STORAGE_NAME_DEFAULT);
        }
        else {
            this.storage = null;
            this.userdata = null;
        }
    }

    static readonly USERDATA_SIZE_LIMIT = 1048576
    saveUserdata() {
        const string = JSON.stringify(this.userdata);
        if (string.length > BiliPolyfill.USERDATA_SIZE_LIMIT) throw new RangeError('BiliPolyfill.saveUserdata: userdata size exceed limit');
        return this.storage!.setItem(BiliPolyfill.STORAGE_NAME_DEFAULT, string);
    }

    async retrieveUserdata() {
        try {
            const string = await this.storage!.getItem('biliPolyfill');
            if (string) this.userdata = JSON.parse(string);
        }
        catch (e) { }

        if (!this.userdata) this.userdata = {} as UserData;
        if (typeof this.userdata.oped !== 'object') this.userdata.oped = {};
        if (typeof this.userdata.restore !== 'object') this.userdata.restore = {
            preventShade: {},
            danmukuSwitch: {},
            danmukuTopSwitch: {},
            danmukuBottomSwitch: {},
            danmukuScrollSwitch: {},
            speed: {},
            wideScreen: {},
        };
        return this.userdata;
    }

    async activate(userjs?: BiliUserJS) {
        if (userjs) this.userjs = userjs;

        return this;
    }

    close() {

    }

    // once
    async badgeWatchLater() {
        // 1. find watchlater button
        const li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');
        if (!li) return;

        // 2. initialize watchlater panel
        const hook = new Promise(resolve => new MutationObserver((mutations, observer) => {
            resolve(mutations);
            observer.disconnect();
        }).observe(li, { childList: true }));
        li.dispatchEvent(new Event('mouseenter'));
        await hook;

        // 3. exceptional watchlater panel structure => throw
        if (li.children[1].children[0].children[0].className !== 'm-w-loading') {
            throw new Error('BiliPolyfill.badgeWatchLater: cannot find m-w-loading panel');
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
                div.textContent = String(li.children[1].children[0].children[0].children.length);
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

            // 3. click skip
            const electricPanel = this.userjs.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0] as HTMLElement;
            if (!electricPanel) return;
            (electricPanel.children[2] as HTMLElement).click();

            // 4. but display a fake electric panel
            electricPanel.style.display = 'block';
            electricPanel.style.zIndex = '233';

            // 5. and perform a fake countdown
            for (let i = 5; i >= 0; i--) {
                // 5.1 yield to next part hint
                if (this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) electricPanel.style.zIndex = '';

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
    focus() {
        (this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-progress')[0] as HTMLElement).click();
    }

    // multiple-times
    menuFocus() {
        this[inputSocketSymbol].addEventListener('menuclose', () => this.focus());
    }

    // once
    restorePrevent() {
        // 1. restore option
        const preventShade = this.userdata!.restore.preventShade[this.userjs.subdomain];

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
            this.userdata!.restore.preventShade[this.userjs.subdomain] = !input.nextElementSibling!.classList.contains('bpui-state-active');
        });
    }

    // once
    restoreDanmuku() {
        // 1. restore option
        const danmukuSwitch = this.userdata!.restore.danmukuSwitch[this.userjs.subdomain];
        const danmukuTopSwitch = this.userdata!.restore.danmukuTopSwitch[this.userjs.subdomain];
        const danmukuBottomSwitch = this.userdata!.restore.danmukuBottomSwitch[this.userjs.subdomain];
        const danmukuScrollSwitch = this.userdata!.restore.danmukuScrollSwitch[this.userjs.subdomain];

        // 2. MUST initialize setting panel before click
        this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0].dispatchEvent(new Event('mouseover'));

        // 3. restore if true
        // 3.1 danmukuSwitch
        const danmukuSwitchDiv = this.userjs.playerWin.document.getElementsByClassName('bilibili-player-video-btn-danmaku')[0] as HTMLElement;
        if (danmukuSwitch && !danmukuSwitchDiv.classList.contains('video-state-danmaku-off')) {
            danmukuSwitchDiv.click();
        }

        // 3.2 danmukuTopSwitch danmukuBottomSwitch danmukuScrollSwitch
        const [danmukuTopSwitchDiv, danmukuBottomSwitchDiv, danmukuScrollSwitchDiv] = this.userjs.playerWin.document.getElementsByClassName('bilibili-player-danmaku-setting-lite-type-list')[0].children as any as Iterable<HTMLElement>;
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
    restoreSpeed() {
        // 1. restore option
        const speed = this.userdata!.restore.speed[this.userjs.subdomain];

        // 2. restore if different
        if (speed && speed != this.userjs.video!.playbackRate) {
            this.userjs.video!.playbackRate = speed;
        }

        // 3. memorize option
        this.addEventListener('close', () => {
            this.userdata!.restore.speed[this.userjs.subdomain] = this.userjs.video!.playbackRate;
        });
    }

    // once
    restoreWide() {
        // 1. restore option
        const wideScreen = this.userdata!.restore.wideScreen[this.userjs.subdomain];

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

    // once
    async autoResume() {
        const video = this.userjs.video || (await asyncOnce<SimpleCustomEvent<HTMLVideoElement>>(this.userjs, 'videochange')).detail;
        if (video.readyState < (HTMLVideoElement as any).HAVE_FUTURE_DATA) {
            const h = () => {
                // 2. parse resume popup
                const span = this.userjs.player!.querySelector('div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
                if (!span) return;
                const [min, sec] = span.textContent!.split(':');
                if (!min || !sec) return;

                // 3. parse last playback progress
                const time = +min * 60 + +sec;

                // 3.1 still far from end => reasonable to resume => click
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
        }
    }

    // once
    autoPlay() {

    }

    // once
    autoFullScreen() {

    }

    // multiple-times
    oped() {

    }

    // multiple-times
    series() {

    }

    // once
    keydownPlayFull() {

    }

    // multiple-times
    dblclickFull() {

    }

    // multiple-times
    speech() {

    }
}
