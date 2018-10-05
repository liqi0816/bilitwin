/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class Exporter {
    static exportIDM(urls, referrer = top.location.origin) {
        return urls.map(url => `<\r\n${url}\r\nreferer: ${referrer}\r\n>\r\n`).join('');
    }

    static exportM3U8(urls, referrer = top.location.origin, userAgent = top.navigator.userAgent) {
        return '#EXTM3U\n' + urls.map(url => `#EXTVLCOPT:http-referrer=${referrer}\n#EXTVLCOPT:http-user-agent=${userAgent}\n#EXTINF:-1\n${url}\n`).join('');
    }

    static exportAria2(urls, referrer = top.location.origin) {
        return urls.map(url => `${url}\r\n  referer=${referrer}\r\n`).join('');
    }

    static async sendToAria2RPC(urls, referrer = top.location.origin, target = 'http://127.0.0.1:6800/jsonrpc') {
        const h = 'referer';
        const method = 'POST';

        while (1) {
            const token_array = target.match(/\/\/((.+)@)/)
            const body = JSON.stringify(urls.map((url, id) => {
                const params = [
                    [url],
                    { [h]: referrer }
                ]

                if (token_array) {
                    params.unshift(token_array[2])
                    target = target.replace(token_array[1], "")
                }

                return ({
                    id,
                    jsonrpc: 2,
                    method: "aria2.addUri",
                    params
                })
            }));

            try {
                const res = await (await fetch(target, { method, body })).json();
                if (res.error || res[0].error) {
                    throw new Error((res.error || res[0].error).message)
                }
                else {
                    return res;
                }
            }
            catch (e) {
                target = top.prompt(`Aria2 connection failed${!e.message.includes("fetch") ? `: ${e.message}.\n` : ". "}Please provide a valid server address:`, target);
                if (!target) return null;
            }
        }
    }

    static copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.value = text;
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

export default Exporter;
