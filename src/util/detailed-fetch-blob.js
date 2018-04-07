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
        // Fire in the Fox fix
        if (this.firefoxConstructor(input, init, onprogress, onabort, onerror)) return;
        // Now I know why standardizing cancelable Promise is that difficult
        // PLEASE refactor me!
        super(['progress', 'abort', 'error']);
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;
        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;

        const controller = new AbortController();
        const { signal } = controller;
        this.abort = controller.abort.bind(controller);
        signal.addEventListener('abort', () => this.dispatchEvent(new ProgressEvent('abort', this)));

        this.buffer = [];
        this.promise = (async () => {
            try {
                const { body, ok, status, statusText, headers } = fetch(input, { ...init, signal });
                if (!ok) throw new DOMError(`HTTP Error ${status}: ${statusText}`);
                this.lengthComputable = res.headers.has('Content-Length');
                this.total += parseInt(res.headers.get('Content-Length')) || Infinity;
                for await (const chunk of this.streamAsyncIterator(body)) {
                    this.loaded += chunk.length;
                    this.buffer.push(new Blob([chunk]));
                    this.dispatchEvent(new ProgressEvent('progress', this))
                };
                this.blob = new Blob(this.buffer);
                this.buffer = null;
                return this.blob;
            }
            catch (e) {
                this.dispatchEvent(new ProgressEvent('error', this));
                throw e;
            }
        })();
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
    }

    getPartialBlob() {
        return new Blob(this.buffer);
    }

    async getBlob() {
        return this.promise;
    }

    firefoxConstructor(input, init = {}, onprogress = init.onprogress, onabort = init.onabort, onerror = init.onerror) {
        super(['progress', 'abort', 'error']);
        if (!top.navigator.userAgent.includes('Firefox')) return false;
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;
        this.abort = null;
        this.loaded = init.cacheLoaded || 0;
        this.total = init.cacheLoaded || 0;
        this.lengthComputable = false;
        this.buffer = [];
        this.blob = null;
        this.reader = undefined;
        this.blobPromise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'moz-chunked-arraybuffer';
            xhr.onload = () => { resolve(this.blob = new Blob(this.buffer)); this.buffer = null; }
            let cacheLoaded = this.loaded;
            xhr.onprogress = e => {
                this.loaded = e.loaded + cacheLoaded;
                this.total = e.total + cacheLoaded;
                this.lengthComputable = e.lengthComputable;
                this.buffer.push(new Blob([xhr.response]));
                if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
            };
            xhr.onabort = e => this.onabort({ target: this, type: 'abort' });
            xhr.onerror = e => { this.onerror({ target: this, type: e.type }); reject(e); };
            this.abort = xhr.abort.bind(xhr);
            xhr.open('get', input);
            xhr.send();
        });
        this.promise = this.blobPromise;
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
        return true;
    }

    streamAsyncIterator(body) {
        const reader = stream.getReader();
        this.addEventListener('abort', reader.cancel.bind(reader));
        return {
            next: reader.read.bind(reader),
            return: reader.cancel.bind(reader),
            [Symbol.asyncIterator]() { return this },
        };
    }
}

export default DetailedFetchBlob;
