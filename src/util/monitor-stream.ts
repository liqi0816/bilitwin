/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import OnEventTargetFactory from './on-event-target.js';
import TransformStream, { TransformStreamDefaultController } from './lib-util-streams/transformstream-types.js';

export interface SimpleProgressEvent {
    type: string
    target: MonitorStream
    loaded: number
    total: number
    lengthComputable: boolean
}

export type EventMap = {
    loadstart: SimpleProgressEvent
    progress: SimpleProgressEvent
    // error: SimpleProgressEvent
    abort: SimpleProgressEvent
    load: SimpleProgressEvent
}

export type OnEventMap = {
    onloadstart: SimpleProgressEvent
    onprogress: SimpleProgressEvent
    // onerror: SimpleProgressEvent
    onabort: SimpleProgressEvent
    onload: SimpleProgressEvent
}

export interface MonitorStreamInit {
    onloadstart?: MonitorStream["onloadstart"]
    onprogress?: MonitorStream["onprogress"]
    onabort?: MonitorStream["onabort"]
    onload?: MonitorStream["onload"]
    throttle?: MonitorStream['throttle']
    loaded?: MonitorStream['loaded']
    total?: MonitorStream['total']
    lengthComputable?: MonitorStream['lengthComputable']
    progressInterval?: MonitorStream['progressInterval']
}

class MonitorStream extends OnEventTargetFactory<EventMap, OnEventMap>(['loadstart', 'progress', /* 'error', */ 'abort', 'load']).mixin(TransformStream) {
    throttle: number
    loaded: number
    total: number
    lengthComputable: boolean
    progressInterval: number
    controller: TransformStreamDefaultController

    constructor({
        onloadstart = null,
        onprogress = null,
        onabort = null,
        onload = null,
        throttle = 0,
        loaded = 0,
        total = Infinity,
        lengthComputable = false,
        progressInterval = 1000,
    } = {} as MonitorStreamInit, writableStrategy?: QueuingStrategy, readableStrategy?: QueuingStrategy) {
        let _controller = null as TransformStreamDefaultController | null;
        let progressLast = 0;
        let last = 0;
        super({
            start: controller => {
                _controller = controller;
            },

            transform: throttle ?
                async (chunk, controller) => {
                    const now = Date.now();
                    if (now - progressLast > this.progressInterval) {
                        this.dispatchEvent({ type: 'progress', target: this, loaded: this.loaded, total: this.total, lengthComputable: this.lengthComputable });
                        progressLast = now;
                    }
                    // drift = (expected chunk duration) - (actual chunk duration)
                    const drift = (1000 * chunk.length / this.throttle) - (now - last);
                    last = now;
                    if (drift > 0) await new Promise(resolve => setTimeout(resolve, 2 * drift));
                    this.loaded += chunk.length;
                    controller.enqueue(chunk);
                } :
                (chunk, controller) => {
                    const now = Date.now();
                    if (now - progressLast > this.progressInterval) {
                        this.dispatchEvent({ type: 'progress', target: this, loaded: this.loaded, total: this.total, lengthComputable: this.lengthComputable });
                        progressLast = now;
                    }
                    this.loaded += chunk.length;
                    controller.enqueue(chunk);
                },

            flush: () => {
                this.dispatchEvent({ type: 'load', target: this, loaded: this.loaded, total: this.total, lengthComputable: this.lengthComputable });
            },
        }, writableStrategy, readableStrategy);
        this.addEventListener('progress', () => this.dispatchEvent({ type: 'loadstart', target: this, loaded: this.loaded, total: this.total, lengthComputable: this.lengthComputable }), { once: true });

        this.onloadstart = onloadstart;
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onload = onload;

        this.throttle = throttle;
        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;
        this.progressInterval = progressInterval;
        this.controller = _controller!;

        // const pipeTo = this.readable.pipeTo.bind(this.readable);
        // this.readable.pipeTo = (...args: any[]) => {
        //     const ret = pipeTo(...args) as Promise<void>;
        //     ret.catch(error => this.dispatchEvent({ type: 'error', target: this, loaded: this.loaded, total: this.total, lengthComputable: this.lengthComputable, error }));
        //     return ret;
        // }
    }

    abort() {
        this.dispatchEvent({ type: 'abort', target: this, loaded: this.loaded, total: this.total, lengthComputable: this.lengthComputable });
        return this.controller.error(new DOMException('This pipeline is aborted by a MonitorStream', 'AbortError'));
    }

    getProgressEvent(type: string) {
        return {
            type,
            target: this,
            loaded: this.loaded,
            total: this.total,
            lengthComputable: this.lengthComputable,
        }
    }

    static get isSupported() {
        return typeof TransformStream === 'function';
    }
}

const _UNIT_TEST = (location = window.location) => {
    let reportLast = Date.now();
    let loadedLast = 0;

    let ms = new MonitorStream({
        throttle: 200 * 1024,
        onprogress: ({ loaded }) => {
            const now = Date.now();
            if (now - reportLast > 1000) {
                console.log(`speed: ${((loaded - loadedLast) * 1.024 / (now - reportLast)).toPrecision(2)}KB/s`);
                loadedLast = loaded;
                reportLast = now;
            }
        },
    });
    fetch(location.href).then(({ body }) => (body as any).pipeThrough(ms).pipeTo(new WritableStream()));
}

export { MonitorStream }
export default MonitorStream;
