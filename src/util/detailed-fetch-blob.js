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
        super(['progress', 'abort', 'error']);
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;

        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;

        // Firefox still do not have streams :(
        if (this.firefoxConstructor(input)) return;

        const controller = new AbortController();
        this.error = null;
        this.abort = () => {
            controller.abort();
            this.error = new DOMException('DetailedFetchBlob was aborted', 'AbortError');
            this.dispatchEvent(new ProgressEvent('abort', this));
        };

        this.buffer = [];
        this.blob = null;

        const promise = (async () => {
            try {
                let last = Date.now();
                const { body, ok, status, statusText, headers } = await fetch(input, { ...init, signal: controller.signal });
                if (!ok) throw new DOMException(`${status}: ${statusText}`, 'HTTPError');
                this.lengthComputable = headers.has('Content-Length');
                this.total += parseInt(headers.get('Content-Length')) || Infinity;
                for await (const chunk of this.streamifyAsyncIterator(body)) {
                    this.loaded += chunk.length;
                    this.buffer.push(new Blob([chunk]));
                    if (Date.now() - last > 500) {
                        this.dispatchEvent(new ProgressEvent('progress', this));
                        last = Date.now();
                    }
                };
                if (this.error) throw e;
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

    firefoxConstructor(input) {
        if (!top.navigator.userAgent.includes('Firefox')) return false;

        this.error = null;
        this.abort = null;

        this.buffer = [];
        this.blob = null;

        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            this.abort = () => {
                xhr.abort();
                this.error = new DOMException('DetailedFetchBlob was aborted', 'AbortError');
                this.dispatchEvent(new ProgressEvent('abort', this));
                this.dispatchEvent(new ProgressEvent('error', this));
                reject(this.error);
            };
            xhr.responseType = 'moz-chunked-arraybuffer';
            xhr.onloadstart = ({ total, lengthComputable }) => {
                this.total += total;
                this.lengthComputable = e.lengthComputable;
            }
            let last = Date.now();
            xhr.onprogress = ({ loaded }) => {
                this.loaded = loaded + xhr.onprogress.loaded;
                this.buffer.push(new Blob([xhr.response]));
                if (Date.now() - last > 500) {
                    this.dispatchEvent(new ProgressEvent('progress', this));
                    last = Date.now();
                }
            };
            xhr.onprogress.loaded = this.loaded;
            xhr.onload = () => {
                this.blob = new Blob(this.buffer);
                this.buffer = null;
                resolve(this.blob);
            }
            xhr.onerror = () => {
                this.error = new DOMException('firefoxDetailedFetchBlob', 'NetworkError');
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

    streamifyAsyncIterator(body) {
        const reader = body.getReader();
        this.addEventListener('abort', reader.cancel.bind(reader, 'AbortError'));
        return {
            next: reader.read.bind(reader),
            return: reader.cancel.bind(reader),
            [Symbol.asyncIterator]() { return this },
        };
    }
}

class BaseDetailedFetchBlob extends OnEventTarget {
    constructor({ }, {
        onprogress = null,
        onabort = null,
        onerror = null,
        loaded = 0,
        total = 0,
        lengthComputable = Boolean(total),
    } = {}) {
        super(['progress', 'abort', 'error']);
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;

        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;

        this.error = null;
        this.buffer = [];
        this.blob = null;
    }

    getPartialBlob() {
        return new Blob(this.buffer);
    }

    async getBlob() {
        return this;
    }

    abort() { }

    then() { }

    catch() { }

    finally() { }
}

class StreamDetailedFetchBlob extends BaseDetailedFetchBlob {
    constructor() {
        const controller = new AbortController();
        this.error = null;
        this.abort = () => {
            controller.abort();
            this.error = new DOMException('DetailedFetchBlob was aborted', 'AbortError');
            this.dispatchEvent(new ProgressEvent('abort', this));
        };

        this.buffer = [];
        this.blob = null;

        const promise = (async () => {
            try {
                let last = Date.now();
                const { body, ok, status, statusText, headers } = await fetch(input, { ...init, signal: controller.signal });
                if (!ok) throw new DOMException(`${status}: ${statusText}`, 'HTTPError');
                this.lengthComputable = headers.has('Content-Length');
                this.total += parseInt(headers.get('Content-Length')) || Infinity;
                for await (const chunk of this.streamifyAsyncIterator(body)) {
                    this.loaded += chunk.length;
                    this.buffer.push(new Blob([chunk]));
                    if (Date.now() - last > 500) {
                        this.dispatchEvent(new ProgressEvent('progress', this));
                        last = Date.now();
                    }
                };
                if (this.error) throw e;
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
}

class FirefoxDetailedFetchBlob extends BaseDetailedFetchBlob {
    constructor() {

    }
}

/**
 * A more powerful fetch with
 *   1. onprogress handler
 *   2. partial response getter
 */
class DetailedFetchBlob {

}

export default DetailedFetchBlob;
window.DetailedFetchBlob = DetailedFetchBlob;
