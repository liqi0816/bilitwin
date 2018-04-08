/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import BaseDetailedFetchBlob from './base-detailed-fetch-blob.js';

/**
 *  It has been two years. Firefox still do not have streams :(
 */
class FirefoxDetailedFetchBlob extends BaseDetailedFetchBlob {
    constructor(input, {
        onprogress,
        onabort,
        onerror,
        loaded,
        total,
        lengthComputable,
    } = {}) {
        super(input, { onprogress, onabort, onerror, loaded, total, lengthComputable });

        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            this.abort = this.abort.bind(this, xhr);
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
                this.dispatchEvent(new ErrorEvent('error', this));
                reject(this.error);
            }
            xhr.open('get', input);
            xhr.send();
        });
        this.then = promise.then.bind(promise);
        this.catch = promise.catch.bind(promise);
        this.finally = promise.finally.bind(promise);
    }

    abort(xhr) {
        xhr.abort();
        this.error = new DOMException('DetailedFetchBlob was aborted', 'AbortError');
        this.dispatchEvent(new ProgressEvent('abort', this));
        this.dispatchEvent(new ErrorEvent('error', this));
        reject(this.error);
    };

    static get isSupported() {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'moz-chunked-arraybuffer';
        return xhr.responseType === 'moz-chunked-arraybuffer';
    }
}

export default FirefoxDetailedFetchBlob;
