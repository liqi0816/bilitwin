/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import BiliUserJS from './biliuserjs/biliuserjs';
import BiliMonkey from './biliuserjs/bilimonkey';
import BiliPolyfill from './biliuserjs/bilipolyfill';

class BiliTwin extends BiliUserJS {
    static async sendToAria2RPC(urls, referrer, target = 'http://127.0.0.1:6800/jsonrpc') {
        // 1. prepare body
        const h = 'referer';
        const body = JSON.stringify(urls.map((url, id) => ({
            id,
            jsonrpc: 2,
            method: "aria2.addUri",
            params: [
                [url],
                { [h]: referrer }
            ]
        })));

        // 2. send to jsonrpc target
        const method = 'POST';
        while (1) {
            try {
                return fetch(target, { method, body }).then(e => e.json());
            }
            catch (e) {
                target = top.prompt('Aria2 connection failed. Please provide a valid server address:', target);
                if (!target) return null;
            }
        }
    }

    static exportAria2(urls, referrer) {
        return urls.map(e => `${e}\r\n  referer=${referrer}\r\n`).join('');
    }
}
