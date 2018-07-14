/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import OnEventTargetFactory from '../on-event-target.js';
import { SimpleEventListener } from '../simple-event-target.js';

interface BaseDetailedFetchBlobInit {
    onprogress?: BaseDetailedFetchBlob['onprogress']
    onabort?: BaseDetailedFetchBlob['onabort']
    onerror?: BaseDetailedFetchBlob['onerror']
    loaded?: BaseDetailedFetchBlob['loaded']
    total?: BaseDetailedFetchBlob['total']
    lengthComputable?: BaseDetailedFetchBlob['lengthComputable']
    fetch?: typeof fetch
    XMLHttpRequest?: typeof XMLHttpRequest
}

abstract class BaseDetailedFetchBlob extends OnEventTargetFactory<
    { progress: ProgressEvent, abort: ProgressEvent, error: ProgressEvent },
    { onprogress: ProgressEvent, onabort: ProgressEvent, onerror: ProgressEvent }
    >(['progress', 'abort', 'error']) implements PromiseLike<Blob> {
    loaded: number
    total: number
    lengthComputable: boolean
    error: DOMException | null = null
    blob: Blob | null = null
    buffer: (Blob | ArrayBuffer)[] | null = []
    abstract promise: Promise<Blob>

    constructor(input: string | Request, {
        onprogress = null,
        onabort = null,
        onerror = null,
        loaded = 0,
        total = Infinity,
        lengthComputable = false,
    } = {} as BaseDetailedFetchBlobInit) {
        super();
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;
        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;
    }

    getPartialBlob() {
        return this.blob || new Blob(this.buffer || []);
    }

    async getBlob() {
        return this;
    }

    abstract abort(): void

    then<TResult1 = Blob, TResult2 = never>(onfulfilled?: ((value: Blob) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null) {
        return this.promise.then(onfulfilled, onrejected);
    }

    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null) {
        return this.promise.catch(onrejected)
    }

    finally(onfinally?: (() => void) | undefined | null) {
        return this.promise.finally(onfinally);
    }

    static get isSupported() { return false }
}

export { BaseDetailedFetchBlobInit, BaseDetailedFetchBlob };
export default BaseDetailedFetchBlob;
