/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SimpleEvent, SimpleCustomEvent } from '../util/simple-event-target.js';
import { OnEventDuplexFactory } from '../util/event-duplex.js';
import { int } from '../util/type-conversion.macro.js';

declare const HTMLVideoElement: {
    HAVE_NOTHING: 0
    HAVE_METADATA: 1
    HAVE_CURRENT_DATA: 2
    HAVE_FUTURE_DATA: 3
    HAVE_ENOUGH_DATA: 4

    NETWORK_EMPTY: 0
    NETWORK_IDLE: 1
    NETWORK_LOADING: 2
    NETWORK_NO_SOURCE: 3
}
export { HTMLVideoElement }

export type PlayerWindow = Window & {
    aid: string
    cid: string
    pageno: number
    jQuery: typeof jQuery,
    player: {
        reloadAccess(): void
        next(pageno: number): void
    }
}

export type EventMap = {
    connect: SimpleCustomEvent<PlayerWindow>
    disconnect: SimpleCustomEvent<BiliUserJS>
    domcontentload: SimpleCustomEvent<Document>
    bofqiload: SimpleCustomEvent<HTMLDivElement>
    playerchange: SimpleCustomEvent<HTMLDivElement>
    playertemplateload: SimpleCustomEvent<HTMLDivElement>
    controlload: SimpleCustomEvent<HTMLDivElement>
    menucontainerload: SimpleCustomEvent<HTMLDivElement>
    menudisplay: SimpleCustomEvent<HTMLUListElement>
    menuclose: SimpleCustomEvent<HTMLUListElement>
    videochange: SimpleCustomEvent<HTMLVideoElement>
    videocanplay: SimpleCustomEvent<HTMLVideoElement>
    videoemptied: SimpleCustomEvent<HTMLVideoElement>
    aidchange: SimpleCustomEvent<string>
    cidchange: SimpleCustomEvent<string>
    pagenochange: SimpleCustomEvent<number>
}

export type OnEventMap = {
    onconnect: SimpleCustomEvent<PlayerWindow>
    ondisconnect: SimpleCustomEvent<BiliUserJS>
    ondomcontentload: SimpleCustomEvent<Document>
    onbofqiload: SimpleCustomEvent<HTMLDivElement>
    onplayerchange: SimpleCustomEvent<HTMLDivElement>
    onplayertemplateload: SimpleCustomEvent<HTMLDivElement>
    oncontrolload: SimpleCustomEvent<HTMLDivElement>
    onmenucontainerload: SimpleCustomEvent<HTMLDivElement>
    onmenudisplay: SimpleCustomEvent<HTMLUListElement>
    onmenuclose: SimpleCustomEvent<HTMLUListElement>
    onvideochange: SimpleCustomEvent<HTMLVideoElement>
    onvideocanplay: SimpleCustomEvent<HTMLVideoElement>
    onvideoemptied: SimpleCustomEvent<HTMLVideoElement>
    onaidchange: SimpleCustomEvent<string>
    oncidchange: SimpleCustomEvent<string>
    onpagenochange: SimpleCustomEvent<number>
}

export const enum BiliUserJSReadyState {
    disconnected,
    domcontentloading,
    domcontentloaded,
    bofqiloaded,
    playertemplateloaded,
    controlloaded,
    videocanplay,
}

export type ObserversDict = { [Event in keyof EventMap]: MutationObserver };

class BiliUserJS extends OnEventDuplexFactory<{}, EventMap, OnEventMap>(['connect', 'disconnect', 'domcontentload',
    'bofqiload', 'playerchange', 'playertemplateload', 'controlload', 'menucontainerload', 'menudisplay', 'menuclose',
    'videochange', 'videocanplay', 'videoemptied', 'aidchange', 'cidchange', 'pagenochange']) {
    readyState: BiliUserJSReadyState
    playerWin: PlayerWindow
    observers: ObserversDict

    bofqi: HTMLDivElement | null
    player: HTMLDivElement | null
    control: HTMLDivElement | null
    menu: HTMLUListElement | null
    video: HTMLVideoElement | null
    aid: string
    cid: string
    pageno: number
    subdomain: 'www' | 'bangumi'

    constructor(playerWin = top as PlayerWindow) {
        super();
        this.readyState = BiliUserJSReadyState.disconnected;
        this.playerWin = playerWin;
        this.observers = {} as ObserversDict;

        this.bofqi = null;
        this.player = null;
        this.control = null;
        this.menu = null;
        this.video = null;
        this.aid = '';
        this.cid = '';
        this.pageno = 0;
        this.subdomain = playerWin.location.href.includes('bangumi') ? 'bangumi' : 'www';

        this.addEventListener('disconnect', () => this.readyState = BiliUserJSReadyState.disconnected, { once: true });
        this.addEventListener('connect', () => this.readyState = BiliUserJSReadyState.domcontentloading, { once: true });
        this.addEventListener('domcontentload', () => this.readyState = BiliUserJSReadyState.domcontentloaded, { once: true });
        this.addEventListener('bofqiload', () => this.readyState = BiliUserJSReadyState.bofqiloaded, { once: true });
        this.addEventListener('playertemplateload', () => this.readyState = BiliUserJSReadyState.playertemplateloaded, { once: true });
        this.addEventListener('controlload', () => this.readyState = BiliUserJSReadyState.controlloaded, { once: true });
        this.addEventListener('videocanplay', () => this.readyState = BiliUserJSReadyState.videocanplay, { once: true });

        this.addEventListener('disconnect', () => {
            for (const e of Object.values(this.observers)) {
                e.disconnect();
            }
        });

        // domcontentload
        const domObserver = () => {
            if (this.playerWin.document.readyState != 'loading') {
                this.dispatchEvent({ type: 'domcontentload', detail: this.playerWin.document });
            }
        };
        this.addEventListener('connect', ({ detail: { document } }) => {
            if (this.playerWin.document.readyState != 'loading') {
                this.dispatchEvent({ type: 'domcontentload', detail: this.playerWin.document });
            }
            else {
                document.addEventListener('DOMContentLoaded', domObserver, { once: true });
            }
        });
        this.addEventListener('disconnect', () => this.playerWin.document.removeEventListener('DOMContentLoaded', domObserver));

        // bofqiload
        this.observers.bofqiload = new MutationObserver(() => {
            this.bofqi = this.playerWin.document.getElementById('bofqi') as HTMLDivElement;
            if (this.bofqi) {
                this.dispatchEvent({ type: 'bofqiload', detail: this.bofqi });
                this.observers.bofqiload.disconnect();
            }
        });
        this.addEventListener('domcontentload', ({ detail: { body } }) => {
            this.bofqi = this.playerWin.document.getElementById('bofqi') as HTMLDivElement;
            if (this.bofqi) {
                this.dispatchEvent({ type: 'bofqiload', detail: this.bofqi });
                this.observers.bofqiload.disconnect();
            }
            else {
                this.observers.bofqiload.observe(body, { childList: true, subtree: true });
            }
        });

        // playerchange
        this.observers.playerchange = new MutationObserver(() => {
            const player = this.playerWin.document.getElementById('bilibiliPlayer') as HTMLDivElement;
            if (this.player !== player) {
                this.player = player;
                this.dispatchEvent({ type: 'playerchange', detail: this.player });
            }
        });
        this.addEventListener('bofqiload', ({ detail: bofqi }) => {
            const player = this.playerWin.document.getElementById('bilibiliPlayer') as HTMLDivElement;
            if (this.player !== player) {
                this.player = player;
                this.dispatchEvent({ type: 'playerchange', detail: this.player });
            }
            this.observers.playerchange.observe(bofqi, { childList: true });
        });

        // playertemplateload
        this.observers.playertemplateload = new MutationObserver(() => {
            const container = this.player!.getElementsByClassName('bilibili-player-video')[0];
            if (container) {
                this.dispatchEvent({ type: 'playertemplateload', detail: this.player! });
                this.observers.playertemplateload.disconnect();
            }
        })
        this.addEventListener('playerchange', ({ detail: player }) => {
            const container = this.player!.getElementsByClassName('bilibili-player-video')[0];
            if (container) {
                this.dispatchEvent({ type: 'playertemplateload', detail: this.player! });
                this.observers.playertemplateload.disconnect();
            }
            else {
                this.observers.playertemplateload.observe(player, { childList: true });
            }
        });

        // menucontainerload
        this.observers.menucontainerload = new MutationObserver(() => {
            const container = this.player!.getElementsByClassName('bilibili-player-context-menu-container')[0];
            const menu = container && container.lastElementChild as HTMLUListElement;
            if (menu) {
                this.menu = menu;
                this.dispatchEvent({ type: 'menucontainerload', detail: this.menu });
                this.observers.menucontainerload.disconnect();
            }
        });
        this.addEventListener('playerchange', ({ detail: player }) => {
            const container = this.player!.getElementsByClassName('bilibili-player-context-menu-container')[0];
            const menu = container && container.lastElementChild as HTMLUListElement;
            if (menu) {
                this.menu = menu;
                this.dispatchEvent({ type: 'menucontainerload', detail: this.menu });
                this.observers.menucontainerload.disconnect();
            }
            else {
                this.observers.menucontainerload.observe(player, { childList: true });
            }
        });

        // menudisplay
        this.observers.menudisplay = new MutationObserver(() => {
            if (this.menu!.children.length) {
                this.dispatchEvent({ type: 'menudisplay', detail: this.menu });
            }
        });
        this.addEventListener('menucontainerload', ({ detail: menu }) => {
            if (this.menu!.children.length) {
                this.dispatchEvent({ type: 'menudisplay', detail: this.menu });
            }
            this.observers.menudisplay.observe(menu, { childList: true });
        });

        // menuclose
        this.observers.menuclose = new MutationObserver(() => {
            if (!this.menu!.children.length) {
                this.dispatchEvent({ type: 'menuclose', detail: this.menu });
                this.observers.menuclose.disconnect();
            }
        })
        this.addEventListener('menudisplay', ({ detail: menu }) => {
            if (!this.menu!.children.length) {
                this.dispatchEvent({ type: 'menuclose', detail: this.menu });
                this.observers.menuclose.disconnect();
            }
            else {
                this.observers.menuclose.observe(menu, { childList: true });
            }
        })

        // controlload
        this.observers.controlload = new MutationObserver(() => {
            this.control = this.player!.getElementsByClassName('bilibili-player-video-btn-start')[0] as HTMLDivElement;
            if (this.control) {
                this.dispatchEvent({ type: 'controlload', detail: this.control });
                this.observers.controlload.disconnect();
            }
        });
        this.addEventListener('playertemplateload', ({ detail: player }) => {
            this.control = this.player!.getElementsByClassName('bilibili-player-video-btn-start')[0] as HTMLDivElement;
            if (this.control) {
                this.dispatchEvent({ type: 'controlload', detail: this.control });
                this.observers.controlload.disconnect();
            }
            else {
                const container = this.player!.getElementsByClassName('bilibili-player-video-control')[0];
                this.observers.controlload.observe(container, { childList: true });
            }
        });

        // videochange
        this.observers.videochange = new MutationObserver(() => {
            const video = this.player!.getElementsByTagName('video')[0];
            if (video && this.video !== video) {
                this.video = video;
                this.dispatchEvent({ type: 'videochange', detail: this.video });
            }
        });
        this.addEventListener('playertemplateload', ({ detail: player }) => {
            const video = this.player!.getElementsByTagName('video')[0];
            if (video && this.video !== video) {
                this.video = video;
                this.dispatchEvent({ type: 'videochange', detail: this.video });
            }
            const container = player.getElementsByClassName('bilibili-player-video')[0];
            this.observers.videochange.observe(container, { childList: true });
        });

        // videocanplay
        const canplayObserver = () => {
            if (this.video!.readyState >= HTMLVideoElement.HAVE_FUTURE_DATA) {
                this.dispatchEvent({ type: 'videocanplay', detail: this.video });
            }
        };
        this.addEventListener('videochange', ({ detail: video }) => {
            if (this.video!.readyState >= HTMLVideoElement.HAVE_FUTURE_DATA) {
                this.dispatchEvent({ type: 'videocanplay', detail: this.video });
            }
            else {
                video.addEventListener('canplay', canplayObserver, { once: true });
            }
        });
        this.addEventListener('disconnect', () => this.video && this.video.removeEventListener('canplay', canplayObserver));

        // videoended
        const endedObserver = () => {
            if (this.video!.ended) {
                this.dispatchEvent({ type: 'videoended', detail: this.video });
            }
        };
        this.addEventListener('videochange', ({ detail: video }) => {
            if (this.video!.ended) {
                this.dispatchEvent({ type: 'videoended', detail: this.video });
            }
            else {
                video.addEventListener('ended', endedObserver, { once: true });
            }
        });
        this.addEventListener('disconnect', () => this.video && this.video.removeEventListener('ended', endedObserver));

        // videoemptied
        const emptiedObserver = () => {
            if (this.video!.networkState === HTMLVideoElement.NETWORK_EMPTY) {
                this.dispatchEvent({ type: 'videoemptied', detail: this.video });
            }
        };
        this.addEventListener('videochange', ({ detail: video }) => {
            if (this.video!.networkState === HTMLVideoElement.NETWORK_EMPTY) {
                this.dispatchEvent({ type: 'videoemptied', detail: this.video });
            }
            else {
                video.addEventListener('emptied', emptiedObserver, { once: true });
            }
        });
        this.addEventListener('disconnect', () => this.video && this.video.removeEventListener('emptied', emptiedObserver));

        // aidchange
        const aidObserver = () => {
            const match = this.playerWin.location.href.match(/(?<=av)\d+/);
            const aid = match ? match[0] : this.playerWin.aid;
            if (aid && this.aid !== aid) {
                this.aid = aid;
                this.dispatchEvent({ type: 'aidchange', detail: aid });
            }
        };
        this.addEventListener('connect', ({ detail: playerWin }) => {
            const match = this.playerWin.location.href.match(/(?<=av)\d+/);
            const aid = match ? match[0] : this.playerWin.aid;
            if (aid && this.aid !== aid) {
                this.aid = aid;
                this.dispatchEvent({ type: 'aidchange', detail: aid });
            }
            else {
                this.addEventListener('domcontentload', aidObserver, { once: true });
            }
            playerWin.addEventListener('hashchange', aidObserver);
        });
        this.addEventListener('disconnect', () => this.playerWin.removeEventListener('hashchange', aidObserver));

        // cidchange
        this.addEventListener('playerchange', () => {
            const cid = this.playerWin.cid;
            if (this.cid !== cid) {
                this.cid = cid;
                this.dispatchEvent({ type: 'cidchange', detail: this.cid });
            }
        });

        // pagenochange
        this.addEventListener('cidchange', () => {
            this.pageno = int(this.playerWin.pageno);
            this.dispatchEvent({ type: 'pagenochange', detail: this.pageno });
        });

        // subdomain
        this.addEventListener('connect', ({ detail: playerWin }) => {
            this.subdomain = playerWin.location.href.includes('bangumi') ? 'bangumi' : 'www';
        })
    }

    /**
     * Connect observers to `playerWin`
     * @param playerWin (default this.playerWin)
     */
    connect(playerWin?: PlayerWindow) {
        if (playerWin) this.playerWin = playerWin;
        this.dispatchEvent({ type: 'connect', detail: this.playerWin });
    }

    disconnect() {
        this.dispatchEvent({ type: 'disconnect', detail: this });
        this.bofqi = null;
        this.player = null;
        this.control = null;
        this.menu = null;
        this.video = null;
        this.aid = '';
        this.cid = '';
        this.pageno = 0;
    }

    async preventUnloadAwait<T>(promise: Promise<T>, onbeforeunload?: Function) {
        const listener = (e: BeforeUnloadEvent) => {
            if (onbeforeunload) onbeforeunload();
            return e.returnValue = true;
        }
        try {
            this.playerWin.addEventListener('beforeunload', listener);
            return await promise;
        }
        finally {
            this.playerWin.removeEventListener('beforeunload', listener);
        }
    }

    get controlloadPromise() {
        if (this.control) {
            return Promise.resolve({ type: 'consorlload', detail: this.control });
        }
        else {
            return BiliUserJS.asyncOnce(this, 'consorlload');
        }
    }

    get videochangePromise() {
        return BiliUserJS.asyncOnce(this, 'videochange');
    }

    get videocanplayPromise() {
        if (this.video!.readyState >= HTMLVideoElement.HAVE_FUTURE_DATA) {
            return Promise.resolve({ type: 'videoemptied', detail: this.video });
        }
        else {
            return BiliUserJS.asyncOnce(this, 'videocanplay');
        }
    }

    get videoemptiedPromise() {
        if (this.video!.networkState === HTMLVideoElement.NETWORK_EMPTY) {
            return Promise.resolve({ type: 'videoemptied', detail: this.video });
        }
        else {
            return BiliUserJS.asyncOnce(this, 'videoemptied');
        }
    }

    get cidchangePromise() {
        return BiliUserJS.asyncOnce(this, 'cidchange');
    }

    get aidchangePromise() {
        return BiliUserJS.asyncOnce(this, 'aidchange');
    }

    get domcontentloadPromise() {
        if (this.playerWin.document.readyState != 'loading') {
            return Promise.resolve({ type: 'videoemptied', detail: this.playerWin.document });
        }
        else {
            return BiliUserJS.asyncOnce(this, 'domcontentload');
        }
    }

    static readonly DISCONNECTED = BiliUserJSReadyState.disconnected
    static readonly DOM_CONTENT_LOADING = BiliUserJSReadyState.domcontentloading
    static readonly DOM_CONTENT_LOADED = BiliUserJSReadyState.domcontentloaded
    static readonly BOFQI_LOADED = BiliUserJSReadyState.bofqiloaded
    static readonly PLAYER_TEMPLATE_LOADED = BiliUserJSReadyState.playertemplateloaded
    static readonly CONTROL_LOADED = BiliUserJSReadyState.controlloaded
    static readonly VIDEO_CAN_PLAY = BiliUserJSReadyState.videocanplay
}

export { BiliUserJS };
export default BiliUserJS;
