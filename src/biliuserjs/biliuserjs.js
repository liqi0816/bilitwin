/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * Provides common util for all bilibili user scripts
 */
class BiliUserJS {
    static async getIframeWin() {
        if (document.querySelector('#bofqi > iframe').contentDocument.getElementById('bilibiliPlayer')) {
            return document.querySelector('#bofqi > iframe').contentWindow;
        }
        else {
            return new Promise(resolve => {
                document.querySelector('#bofqi > iframe').addEventListener('load', () => {
                    resolve(document.querySelector('#bofqi > iframe').contentWindow);
                });
            });
        }
    }

    static async getPlayerWin() {
        if (location.href.includes('/watchlater/#/list')) {
            await new Promise(resolve => {
                let h = () => {
                    resolve(location.href);
                    window.removeEventListener('hashchange', h);
                };
                window.addEventListener('hashchange', h)
            });
        }
        if (location.href.includes('/watchlater/#/')) {
            if (!document.getElementById('bofqi')) {
                await new Promise(resolve => {
                    let observer = new MutationObserver(() => {
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
                let observer = new MutationObserver(() => {
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
            })
        }
    }
}

export default BiliUserJS;
