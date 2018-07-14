/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import OnEventTargetFactory from './on-event-target.js';

interface TransformStream {
    readable: ReadableStream
    writeable: WritableStream
}

interface TransformStreamDefaultController {
    desiredSize: number
    enqueue(chunk: any): void
    error(reason: any): void
    terminate(): void
}

declare const TransformStream: {
    prototype: TransformStream
    new(transformer?: {
        start?(controller: TransformStreamDefaultController): any
        transform?(chunk: any, controller: TransformStreamDefaultController): any
        flush?(controller: TransformStreamDefaultController): any
    }, writableStrategy?: QueuingStrategy, readableStrategy?: QueuingStrategy): TransformStream
}

interface MonitorStreamInit {
    onprogress?: MonitorStream['onprogress']
    onabort?: MonitorStream['onabort']
    throttle?: MonitorStream['throttle']
    loaded?: MonitorStream['loaded']
    total?: MonitorStream['total']
    lengthComputable?: MonitorStream['lengthComputable']
    progressInterval?: MonitorStream['progressInterval']
}

class MonitorStream extends OnEventTargetFactory<{ progress: ProgressEvent, abort: ProgressEvent }, { onprogress: ProgressEvent, onabort: ProgressEvent }>(['progress', 'abort']).mixin(TransformStream) {
    throttle: number
    loaded: number
    total: number
    lengthComputable: boolean
    progressInterval: number
    controller: TransformStreamDefaultController

    constructor({
        onprogress = null,
        onabort = null,
        throttle = 0,
        loaded = 0,
        total = Infinity,
        lengthComputable = false,
        progressInterval = 1000,
    } = {} as MonitorStreamInit, ...strategies: QueuingStrategy[]) {
        let controller = null as TransformStreamDefaultController | null;
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
                    if (drift > 0) await new Promise(resolve => setTimeout(resolve, 2 * drift));
                    this.loaded += chunk.length;
                    controller.enqueue(chunk);
                } :
                (chunk, controller) => {
                    const now = Date.now();
                    if (now - progressLast > this.progressInterval) {
                        this.dispatchEvent(this.getProgressEvent('progress'));
                        progressLast = now;
                    }
                    this.loaded += chunk.length;
                    controller.enqueue(chunk);
                },
        }, ...strategies);
        this.controller = controller!;

        this.onprogress = onprogress;
        this.onabort = onabort;
        this.throttle = throttle;
        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;
        this.progressInterval = progressInterval;
    }

    abort() {
        this.dispatchEvent(this.getProgressEvent('abort'));
        return this.controller.error(new DOMException('This pipeline is aborted by a MonitorStream', 'AbortError'));
    }

    getProgressEvent(type: string) {
        const event = new ProgressEvent(type, this);
        Object.defineProperty(event, 'target', {
            configurable: true,
            enumerable: true,
            get: () => this,
        })
        return event;
    }

    static get isSupported() {
        return typeof TransformStream === 'function';
    }
}

function _UNIT_TEST(location = window.location) {
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
    fetch(location as any as string).then(({ body }) => (body as any).pipeThrough(ms).pipeTo(new WritableStream()));
}

export default MonitorStream;
