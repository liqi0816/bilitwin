/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class StreamMonitor extends EventTarget {
    constructor({
        onend = null,
        oninputerror = null,
        onoutputerror = null,
        onerror = null,
        onprogress = null,
        onabort = null,
        throttle = 0,
        delay = 0,
        loaded = 0,
        total = 0,
        preventClose = false,
        preventAbort = false,
        preventCancel = false,
    } = {}) {
        // 1. super
        super();

        // 2. persist this reference
        const monitor = this;

        // 3. states
        monitor.intendedAbort = false;

        // 4. defint input writable stream
        monitor.writable = new WritableStream({
            start(inputController) {
                monitor.inputController = inputController;
            },

            async write(chunk, inputController) {
                return monitor.buffer.push(chunk);
            },

            async close(inputController) {
                monitor.dispatchEvent(new Event('end'));
                if (typeof monitor.onend === 'function') monitor.onend();
            },

            async abort(reason) {
                if (monitor.intendedAbort) return;
                monitor.dispatchEvent(new Event('inputerror'));
                if (typeofmonitor.oninputerror === 'function') monitor.oninputerror();
                monitor.dispatchEvent(new Event('error'));
                if (typeofmonitor.onerror === 'function') monitor.onerror();
                monitor.readable.cancel();
            }
        });

        // 5. defint output readable stream
        monitor.readable = new ReadableStream({
            start(outputController) {
                monitor.outputController = outputController;
            },

            async pull(outputController) {
                return monitor.buffer.shift();
            },

            async cancel(e) {

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

    on(...args) {
        this.addEventListener(...args);
        return this;
    }
}

export default StreamMonitor;
