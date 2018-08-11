/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseDetailedFetchBlobInit } from './base-detailed-fetch-blob.js';
import BaseDetailedFetchBlob from './base-detailed-fetch-blob.js';

class StreamDetailedFetchBlob extends BaseDetailedFetchBlob {
    controller = new AbortController()
    promise: Promise<Blob>

    constructor(input: string | Request, {
        onprogress = null,
        onabort = null,
        onerror = null,
        loaded = 0,
        total = Infinity,
        lengthComputable = false,
        fetch = top.fetch,
        ...init
    } = {} as BaseDetailedFetchBlobInit & RequestInit) {
        super(input, { onprogress, onabort, onerror, loaded, total, lengthComputable });

        this.promise = (async () => {
            try {
                const { body, ok, status, statusText, headers } = await fetch(input, { ...init, signal: this.controller.signal } as RequestInit);
                if (!ok) throw new DOMException(`${status}: ${statusText}`, 'HTTPError');
                if (!body) throw new DOMException('DetailedFetchBlob encountered a network error', 'NetworkError');
                this.lengthComputable = headers.has('Content-Length');
                this.total += this.lengthComputable && parseInt(headers.get('Content-Length')!) || Infinity;
                let last = Date.now();
                for await (const chunk of this.iteratorify(body)) {
                    this.loaded += chunk.length;
                    this.buffer!.push(new Blob([chunk]));
                    if (Date.now() - last > 500) {
                        this.dispatchEvent(new ProgressEvent('progress', this));
                        last = Date.now();
                    }
                };
                if (this.error) throw this.error;
                return this.blob = new Blob(this.buffer!);
            }
            catch (e) {
                if (!this.error) this.error = e;
                this.dispatchEvent(new ErrorEvent('error', this));
                throw this.error;
            }
            finally {
                this.buffer = null;
            }
        })();
    }

    iteratorify(body: ReadableStream) {
        const reader = body.getReader();
        this.addEventListener('abort', reader.cancel.bind(reader, 'AbortError'));
        return {
            next: reader.read.bind(reader),
            return: reader.cancel.bind(reader),
            throw: reader.cancel.bind(reader),
            [Symbol.asyncIterator]() { return this },
        };
    }

    abort() {
        this.controller.abort();
        this.error = new DOMException('DetailedFetchBlob was aborted', 'AbortError');
        this.dispatchEvent(new ProgressEvent('abort', this));
    }

    static get isSupported() {
        return typeof fetch === 'function' && typeof ReadableStream === 'function';
    }
}

export default StreamDetailedFetchBlob;
