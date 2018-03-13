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
 * A more powerful fetch with
 *   1. onprogress handler
 *   2. partial response getter
 */
class DetailedFetchBlob {
    constructor(input, init = {}, onprogress = init.onprogress, onabort = init.onabort, onerror = init.onerror, fetch = init.fetch || top.fetch) {
        // Fire in the Fox fix
        if (this.firefoxConstructor(input, init, onprogress, onabort, onerror)) return;
        // Now I know why standardizing cancelable Promise is that difficult
        // PLEASE refactor me!
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;
        this.abort = null;
        this.loaded = init.cacheLoaded || 0;
        this.total = init.cacheLoaded || 0;
        this.lengthComputable = false;
        this.buffer = [];
        this.blob = null;
        this.reader = null;
        this.blobPromise = fetch(input, init).then(res => {
            if (this.reader == 'abort') return res.body.getReader().cancel().then(() => null);
            if (!res.ok) throw `HTTP Error ${res.status}: ${res.statusText}`;
            this.lengthComputable = res.headers.has('Content-Length');
            this.total += parseInt(res.headers.get('Content-Length')) || Infinity;
            if (this.lengthComputable) {
                this.reader = res.body.getReader();
                return this.blob = this.consume();
            }
            else {
                if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
                return this.blob = res.blob();
            }
        });
        this.blobPromise.then(() => this.abort = () => { });
        this.blobPromise.catch(e => this.onerror({ target: this, type: e }));
        this.promise = Promise.race([
            this.blobPromise,
            new Promise(resolve => this.abort = () => {
                this.onabort({ target: this, type: 'abort' });
                resolve('abort');
                this.buffer = [];
                this.blob = null;
                if (this.reader) this.reader.cancel();
                else this.reader = 'abort';
            })
        ]).then(s => s == 'abort' ? new Promise(() => { }) : s);
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
    }

    getPartialBlob() {
        return new Blob(this.buffer);
    }

    async getBlob() {
        return this.promise;
    }

    async pump() {
        while (true) {
            let { done, value } = await this.reader.read();
            if (done) return this.loaded;
            this.loaded += value.byteLength;
            this.buffer.push(new Blob([value]));
            if (this.onprogress) this.onprogress(this.loaded, this.total, this.lengthComputable);
        }
    }

    async consume() {
        await this.pump();
        this.blob = new Blob(this.buffer);
        this.buffer = null;
        return this.blob;
    }

    firefoxConstructor(input, init = {}, onprogress = init.onprogress, onabort = init.onabort, onerror = init.onerror) {
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
}

export default DetailedFetchBlob;
