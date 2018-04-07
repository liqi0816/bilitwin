/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

// import OnEventTarget from './on-event-target.js';

class MonitorStream extends TransformStream {
    constructor({
        onprogress = null,
        onabort = null,
        throttle = 0,
        loaded = 0,
        total = 0,
        progressInterval = 1000,
    } = {}) {
        let controller = null;
        let progressLast = 0;
        let last = 0;
        super({
            start: e => controller = e,

            transform: throttle ?
                async (chunk, controller) => {
                    const now = Date.now();
                    if (now - progressLast > this.progressInterval) {
                        this.dispatchEvent(this.getProgressEvent('progress'));
                        progressLast = now;
                    }
                    // drift = (expected chunk duration) - (actual chunk duration)
                    const drift = (1000 * chunk.length / this.throttle) - (now - last);
                    last = now;
                    if (drift > 0) await new Promise(resolve => setTimeout(resolve, drift));
                    this.loaded += chunk.length;
                    controller.enqueue(chunk);
                } :
                (chunk, controller) => {
                    if (Date.now() - progressLast > this.progressInterval) {
                        this.dispatchEvent(this.getProgressEvent('progress'));
                        progressLast = Date.now();
                    }
                    this.loaded += chunk.length;
                    controller.enqueue(chunk);
                },
        });

        OnEventTarget.mixin(this, ['progress', 'abort']);
        this.controller = controller;

        this.onprogress = onprogress;
        this.onabort = onabort;
        this.throttle = throttle;
        this.loaded = loaded;
        this.total = total;
        this.progressInterval = progressInterval;

    }

    abort() {
        this.dispatchEvent(this.getProgressEvent('abort'));
        return this.controller.error('AbortError');
    }

    getProgressEvent(type) {
        const event = new ProgressEvent(type, { lengthComputable: this.total, loaded: this.loaded, total: this.total });
        Object.defineProperty(event, 'target', {
            configurable: true,
            enumerable: true,
            get: () => this,
        })
        return event;
    }
}

ms = new MonitorStream({ onprogress: console.log });
(await fetch('http://speedtest.ftp.otenet.gr/files/test100Mb.db')).body.pipeThrough(ms).pipeTo(new WritableStream());
// export default StreamMonitor;
