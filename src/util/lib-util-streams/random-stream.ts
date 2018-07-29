/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ReadableStream, { ReadableStreamDefaultController, UnderlyingSource } from './readablestream-types.js'

export interface RandomStreamInit extends UnderlyingSource {
    chunkCount?: number
    chunkLength?: number
}

class RandomStream extends ReadableStream {
    chunkCount: number
    chunkLength: number
    controller: ReadableStreamDefaultController

    constructor({ start, pull, cancel, chunkCount = 20, chunkLength = 4 } = {} as RandomStreamInit, strategy?: QueuingStrategy) {
        let _controller = null as ReadableStreamDefaultController | null;
        super({
            cancel,
            start: start ?
                controller => {
                    _controller = controller;
                    return start(controller);
                } :
                controller => _controller = controller,
            pull: pull ?
                controller => {
                    const chunk = new Uint8Array(this.chunkLength);
                    for (let i = 0; i < this.chunkLength; i++) {
                        chunk[i] = Math.trunc(Math.random() * 256);
                    }
                    controller.enqueue(chunk);
                    this.chunkCount--;
                    if (!this.chunkCount) controller.close();
                    return pull(controller);
                } :
                controller => {
                    const chunk = new Uint8Array(this.chunkLength);
                    for (let i = 0; i < this.chunkLength; i++) {
                        chunk[i] = Math.trunc(Math.random() * 256);
                    }
                    controller.enqueue(chunk);
                    this.chunkCount--;
                    if (!this.chunkCount) controller.close();
                },
        }, strategy);

        this.chunkCount = chunkCount;
        this.chunkLength = chunkLength;
        this.controller = _controller!;
    }

    close() {
        this.controller.close();
    }
}

export default RandomStream;
