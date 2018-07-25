/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReadableStreamDefaultController, ReadableStreamConstructor } from './readablestream-types.js'

declare var ReadableStream: ReadableStreamConstructor

class InputStream extends ReadableStream {
    controller: ReadableStreamDefaultController

    constructor(strategy?: QueuingStrategy) {
        let _controller = null as ReadableStreamDefaultController | null;
        super({ start: controller => _controller = controller }, strategy);

        this.controller = _controller!;
    }

    close() {
        this.controller.close();
    }

    write(chunk: any) {
        this.controller.enqueue(chunk);
    }

    error(error: any) {
        this.controller.error(error);
    }
}

class BackpressureFrame {
    resolvePull?: () => void
    resolveWrite?: () => void
    next: BackpressureFrame | null
    done: Promise<[void, void]>

    constructor() {
        this.done = Promise.all([
            new Promise<void>(resolve => this.resolvePull = resolve),
            new Promise<void>(resolve => this.resolveWrite = resolve),
        ]);
        this.next = null;
    }
}

class BackpressureInputStream extends ReadableStream {
    controller: ReadableStreamDefaultController
    pullFrame: BackpressureFrame
    writeFrame: BackpressureFrame

    constructor(strategy?: QueuingStrategy) {
        let _controller = null as ReadableStreamDefaultController | null;
        super({
            start: controller => _controller = controller,
            pull: () => {
                const pullFrame = this.pullFrame;
                if (!pullFrame.next) {
                    pullFrame.next = new BackpressureFrame();
                }
                this.pullFrame = pullFrame.next;
                pullFrame.resolvePull!();
                if (pullFrame.resolveWrite) return pullFrame.done;
                return /* void */;
            }
        }, strategy);

        this.controller = _controller!;
        this.pullFrame = this.writeFrame = new BackpressureFrame();
    }

    close() {
        this.controller.close();
    }

    async write(chunk: any) {
        const writeFrame = this.writeFrame;
        if (!writeFrame.next) {
            writeFrame.next = new BackpressureFrame();
        }
        this.writeFrame = writeFrame.next;
        writeFrame.resolveWrite!();
        if (writeFrame.resolvePull) await writeFrame.done;
        this.controller.enqueue(chunk);
    }

    error(error: any) {
        this.controller.error(error);
    }
}

const __UNIT_TEST = () => {
    class ConsoleStream extends WritableStream {
        constructor() {
            super({
                write: (chunk: any) => new Promise<void>(resolve => setTimeout(resolve, 1000)).then(() => console.log(chunk)),
            } as any);
        }
    }
    const streams = {
        get stdout() { return new ConsoleStream() },
    }

    var is = new BackpressureInputStream();
    is.pipeTo(streams.stdout);

    void (async () => {
        for (let i = 0; i < 5; i++) {
            is.write(i); console.warn(`${i} written`);
        }
    })();
}

export { InputStream, BackpressureInputStream }
export default InputStream
