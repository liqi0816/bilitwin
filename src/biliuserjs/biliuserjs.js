/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import AsyncContainer from '../util/async-container.js';
import OnEventTargetFactory from '../util/on-event-target.js';

/**
 * Provides common util for all bilibili user scripts
 */
class BiliUserJS extends OnEventTargetFactory(['videoload', 'videounload', 'cidload', 'aidload', 'pageload', 'pageunload']) {
    constructor(playerWin = top) {
        super();
        this.playerWin = playerWin;
        this.preventUnloadCount = 0;
    }

    observe(playerWin) {
        if (playerWin) this.playerWin = playerWin;

        const once = { once: true };

        this.playerWin.document.addEventListener('DOMContentLoaded', this.dispatchEvent.bind(this, new CustomEvent('pageload')), once);

        this.playerWin.addEventListener('unload', this.dispatchEvent.bind(this, new CustomEvent('pageunload')), once);


    }

    async preventUnloadAwait(promise, onbeforeunload) {
        const listener = e => {
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

    static async getIframeWin() {
        if (document.querySelector('#bofqi > iframe').contentDocument.getElementById('bilibiliPlayer')) {
            return document.querySelector('#bofqi > iframe').contentWindow;
        }
        else {
            return new Promise(resolve => {
                document.querySelector('#bofqi > iframe').addEventListener('load', () => {
                    resolve(document.querySelector('#bofqi > iframe').contentWindow);
                }, { once: true });
            });
        }
    }

    static async getPlayerWin() {
        if (location.href.includes('/watchlater/#/list')) {
            await new Promise(resolve => {
                window.addEventListener('hashchange', () => resolve(location.href), { once: true });
            });
        }
        if (location.href.includes('/watchlater/#/')) {
            if (!document.getElementById('bofqi')) {
                await new Promise(resolve => {
                    const observer = new MutationObserver(() => {
                        if (document.getElementById('bofqi')) {
                            resolve(document.getElementById('bofqi'));
                            observer.disconnect();
                        }
                    });
                    observer.observe(document, { childList: true, subtree: true });
                });
            }
        }
        if (document.getElementById('bilibiliPlayer')) {
            return window;
        }
        else if (document.querySelector('#bofqi > iframe')) {
            return BiliUserJS.getIframeWin();
        }
        else if (document.querySelector('#bofqi > object')) {
            throw 'Need H5 Player';
        }
        else {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    if (document.getElementById('bilibiliPlayer')) {
                        observer.disconnect();
                        resolve(window);
                    }
                    else if (document.querySelector('#bofqi > iframe')) {
                        observer.disconnect();
                        resolve(BiliUserJS.getIframeWin());
                    }
                    else if (document.querySelector('#bofqi > object')) {
                        observer.disconnect();
                        throw 'Need H5 Player';
                    }
                });
                observer.observe(document.getElementById('bofqi'), { childList: true });
            });
        }
    }

    static tryGetPlayerWinSync() {
        if (document.getElementById('bilibiliPlayer')) {
            return window;
        }
        else if (document.querySelector('#bofqi > object')) {
            throw 'Need H5 Player';
        }
    }

    static getCidRefreshPromise(playerWin) {
        /***********
         * !!!Race condition!!!
         * We must finish everything within one microtask queue!
         *  
         * bilibili script:
         * videoElement.remove() -> setTimeout(0) -> [[microtask]] -> load playurl
         *       \- synchronous macrotask -/               ||           \-   synchronous
         *                                                 ||
         *                       the only position to inject monkey.sniffDefaultFormat
        */
        const cidRefresh = new AsyncContainer();

        // 1. no active video element in document => cid refresh
        const observer = new MutationObserver(() => {
            if (!playerWin.document.getElementsByTagName('video')[0]) {
                observer.disconnect();
                cidRefresh.resolve();
            }
        });
        observer.observe(playerWin.document.getElementsByClassName('bilibili-player-video')[0], { childList: true });

        // 2. playerWin unload => cid refresh
        playerWin.addEventListener('unload', () => Promise.resolve().then(() => cidRefresh.resolve()));

        return cidRefresh;
    }

    static async domContentLoadedThen(func) {
        if (document.readyState == 'loading') {
            return new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', () => resolve(func()), { once: true });
            })
        }
        else {
            return func();
        }
    }
}

export default BiliUserJS;
