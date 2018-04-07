/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import OnEventTarget from './on-event-target.js';
import { AbortController } from '../polyfill/polyfill.js';

/**
 * A more powerful fetch with
 *   1. onprogress handler
 *   2. partial response getter
 */
class DetailedFetchBlob extends OnEventTarget {
    constructor(input, {
        onprogress = null,
        onabort = null,
        onerror = null,
        loaded = 0,
        total = 0,
        lengthComputable = Boolean(total),
        fetch = top.fetch,
        ...init
    } = {}) {
        // Firefox still do not have streams :(
        if (this.firefoxConstructor(input, { onprogress, onabort, onerror, loaded, total, lengthComputable, fetch, init })) return;
        super(['progress', 'abort', 'error']);
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;

        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;

        const controller = new AbortController();
        this.error = null;
        this.abort = () => {
            controller.abort();
            this.error = new DOMError('AbortError');
            this.dispatchEvent(new ProgressEvent('abort', this));
        };

        this.buffer = [];
        this.blob = null;

        const promise = (async () => {
            try {
                const { body, ok, status, statusText, headers } = fetch(input, { ...init, signal: controller.signal });
                if (!ok) throw new DOMError(`HTTP Error ${status}: ${statusText}`);
                this.lengthComputable = res.headers.has('Content-Length');
                this.total += parseInt(res.headers.get('Content-Length')) || Infinity;
                for await (const chunk of this.streamAsyncIterator(body)) {
                    this.loaded += chunk.length;
                    this.buffer.push(new Blob([chunk]));
                    if (Date.now() % 500 == 0) this.dispatchEvent(new ProgressEvent('progress', this));
                };
                this.blob = new Blob(this.buffer);
                return this.blob;
            }
            catch (e) {
                if (!this.error) this.error = e;
                this.dispatchEvent(new ProgressEvent('error', this));
                throw this.error;
            }
            finally {
                this.buffer = null;
            }
        })();
        this.then = promise.then.bind(promise);
        this.catch = promise.catch.bind(promise);
        this.finally = promise.finally.bind(promise);
    }

    getPartialBlob() {
        return new Blob(this.buffer);
    }

    async getBlob() {
        return this;
    }

    firefoxConstructor(input, { onprogress, onabort, onerror, loaded, total, lengthComputable, fetch, init }) {
        if (!top.navigator.userAgent.includes('Firefox')) return false;
        super(['progress', 'abort', 'error']);
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;

        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;

        this.error = null;
        this.abort = null;

        this.buffer = [];
        this.blob = null;

        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            this.abort = () => {
                xhr.abort();
                this.error = new DOMError('AbortError');
                this.dispatchEvent(new ProgressEvent('abort', this));
                this.dispatchEvent(new ProgressEvent('error', this));
                reject(this.error);
            };
            xhr.responseType = 'moz-chunked-arraybuffer';
            xhr.onloadstart = ({ total, lengthComputable }) => {
                this.total += total;
                this.lengthComputable = e.lengthComputable;
            }
            xhr.onprogress = ({ loaded }) => {
                this.loaded = loaded + xhr.onprogress.loaded;
                this.buffer.push(new Blob([xhr.response]));
                if (Date.now() % 500 == 0) this.dispatchEvent(new ProgressEvent('progress', this));
            };
            xhr.onprogress.loaded = this.loaded;
            xhr.onload = () => {
                this.blob = new Blob(this.buffer);
                this.buffer = null;
                resolve(this.blob);
            }
            xhr.onerror = () => {
                this.error = new DOMError('NetworkError');
                this.dispatchEvent(new ProgressEvent('error', this));
                reject(this.error);
            }
            xhr.open('get', input);
            xhr.send();
        });
        this.then = promise.then.bind(promise);
        this.catch = promise.catch.bind(promise);
        this.finally = promise.finally.bind(promise);
        return true;
    }

    streamAsyncIterator(body) {
        const reader = stream.getReader();
        this.addEventListener('abort', reader.cancel.bind(reader, 'AbortError'));
        return {
            next: reader.read.bind(reader),
            return: reader.cancel.bind(reader),
            [Symbol.asyncIterator]() { return this },
        };
    }
}

export default DetailedFetchBlob;
