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

class MonitorStream extends TransformStream {
    constructor({
        onend = null,
        oninputerror = null,
        onoutputerror = null,
        onerror = null,
        onprogress = null,
        onabort = null,
        throttle = 0,
        debounce = 0,
        loaded = 0,
        total = 0,
        preventClose = false,
    } = {}) {
        // 1. super
        super();
        OnEventTarget.call(this);

        // 2. save param
        this.onend = onend;
        this.oninputerror = oninputerror;
        this.onoutputerror = onoutputerror;
        this.onerror = onerror;
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.throttle = throttle;
        this.debounce = debounce;
        this.loaded = loaded;
        this.total = total;
        this.preventClose = preventClose;

        // 3. intendedAbort
        this.intendedAbort = false;

        // 4. replace writable
        const self = this;
        const writer = this.writable.getWriter();
        this.writable = new WritableStream({
            async write(chunk) {
                try {
                    self.loaded += chunk.size;
                    let event = new ProgressEvent('progress', { lengthComputable: self.total, loaded: self.loaded, total: self.total });
                    self.dispatchEvent(event);
                    if (typeof self.onprogress === 'function') self.onprogress(event);
                    return await writer.write(chunk);
                }
                catch (e) {
                    let event = null;
                    event = new ProgressEvent('outputerror', { lengthComputable: self.total, loaded: self.loaded, total: self.total });
                    self.dispatchEvent(event);
                    if (typeof self.onoutputerror === 'function') self.onoutputerror(event);
                    event = new ProgressEvent('error', { lengthComputable: self.total, loaded: self.loaded, total: self.total });
                    self.dispatchEvent(event);
                    if (typeof self.onerror === 'function') self.onerror(event);
                    throw e;
                }
            },

            async close() {
                if (!self.preventClose) writer.close();
                self.dispatchEvent(new Event('end'));
                if (typeof self.onend === 'function') self.onend();
            },

            async abort(reason) {
                writer.abort();
                if (self.intendedAbort) return;
                self.dispatchEvent(new ProgressEvent('inputerror'));
                if (typeof self.oninputerror === 'function') self.oninputerror();
                self.dispatchEvent(new ProgressEvent('error'));
                if (typeof self.onerror === 'function') self.onerror();
            }
        });
    }

    get input() {
        return this.writable;
    }

    get output() {
        return this.readable;
    }

    async abort(reason) {
        this.dispatchEvent(new Event('abort', { reason }));
        if (typeof monitor.onabort === 'function') monitor.onabort();
        this.intendedAbort = true;
        this.writable.abort();
        this.readable.cancel();
    }

    get cancel() {
        return this.abort;
    }
}

export default StreamMonitor;
