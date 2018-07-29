/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constructor, ForceShim } from '../common-types.js';
import { BaseDetailedFetchBlobInit } from './base-detailed-fetch-blob.js';
import BaseDetailedFetchBlob from './base-detailed-fetch-blob.js';

export type MozXMLHttpRequest = ForceShim<XMLHttpRequest,
    { onloadstart: ((this: XMLHttpRequest, ev: ProgressEvent) => void) },
    { responseType: 'moz-chunked-arraybuffer' }>

declare const window: Window & {
    XMLHttpRequest: Constructor<MozXMLHttpRequest> & typeof XMLHttpRequest
}
export { window }

/**
 *  It has been two years. Firefox still do not have streams :(
 */
class FirefoxDetailedFetchBlob extends BaseDetailedFetchBlob {
    xhr!: MozXMLHttpRequest
    promise: Promise<Blob>

    constructor(input: string, {
        onprogress = null,
        onabort = null,
        onerror = null,
        loaded = 0,
        total = Infinity,
        lengthComputable = false,
        XMLHttpRequest = window.XMLHttpRequest
    } = {} as BaseDetailedFetchBlobInit & { XMLHttpRequest: typeof window.XMLHttpRequest }) {
        super(input, { onprogress, onabort, onerror, loaded, total, lengthComputable });
        const initLoaded = loaded;

        this.promise = new Promise((resolve, reject) => {
            this.xhr = new XMLHttpRequest();
            this.xhr.responseType = 'moz-chunked-arraybuffer';
            this.xhr.onloadstart = ({ total, lengthComputable }) => {
                this.total += total;
                this.lengthComputable = lengthComputable;
            }
            let last = Date.now();
            this.xhr.onprogress = ({ loaded }) => {
                this.loaded = initLoaded + loaded;
                this.buffer!.push(new Blob([this.xhr.response]));
                if (Date.now() - last > 500) {
                    this.dispatchEvent(new ProgressEvent('progress', this));
                    last = Date.now();
                }
            };
            this.xhr.onload = () => {
                this.blob = new Blob(this.buffer!);
                this.buffer = null;
                resolve(this.blob);
            }
            this.xhr.onerror = () => {
                this.error = new DOMException('firefoxDetailedFetchBlob', 'NetworkError');
                this.dispatchEvent(new ErrorEvent('error', this));
                reject(this.error);
            }
            this.xhr.onabort = () => {
                this.error = new DOMException('DetailedFetchBlob was aborted', 'AbortError');
                this.dispatchEvent(new ProgressEvent('abort', this));
                this.dispatchEvent(new ErrorEvent('error', this));
                reject(this.error);
            }
            this.xhr.open('get', input);
            this.xhr.send();
        });
    }

    abort() {
        this.xhr.abort();
    }

    static get isSupported() {
        const xhr = new XMLHttpRequest() as MozXMLHttpRequest;
        xhr.responseType = 'moz-chunked-arraybuffer';
        return xhr.responseType === 'moz-chunked-arraybuffer';
    }
}

export default FirefoxDetailedFetchBlob;
