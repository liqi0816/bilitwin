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

/**
 * Provides common util for all bilibili user scripts
 */
class BiliUserJS {
    static async getPlayerWin() {
        if (location.href.includes('/watchlater/#/list')) {
            await new Promise(resolve => {
                window.addEventListener('hashchange', () => resolve(location.href), { once: true });
            });
        }
        if (!document.getElementById('bilibili-player')) {
            if (document.querySelector("video")) {
                top.location.reload() // 刷新
            } else {
                await new Promise(resolve => {
                    const observer = new MutationObserver(() => {
                        if (document.getElementById('bilibili-player')) {
                            resolve(document.getElementById('bilibili-player'));
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
        else {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    if (document.getElementById('bilibiliPlayer')) {
                        observer.disconnect();
                        resolve(window);
                    }
                });
                observer.observe(document.getElementById('bilibili-player'), { childList: true });
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
        observer.observe(playerWin.document.getElementById('bilibiliPlayer'), { childList: true });

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
