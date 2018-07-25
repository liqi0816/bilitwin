/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { WritableStreamConstructor, UnderlyingSink } from './writablestream-types';
declare const WritableStream: WritableStreamConstructor

class MemoryStream extends WritableStream {
    buffer: any[];

    constructor({ start, write, close, abort } = {} as UnderlyingSink, strategy?: QueuingStrategy) {
        super({
            start, close, abort,
            write: write ?
                (chunk, controler) => {
                    this.buffer.push(chunk);
                    return write(chunk, controler);
                } :
                chunk => this.buffer.push(chunk),
        }, strategy);
        this.buffer = [];
    }
}

class MemoryBlobStream extends WritableStream {
    buffer: any[];

    constructor({ start, write, close, abort } = {} as UnderlyingSink, strategy?: QueuingStrategy) {
        super({
            start, close, abort,
            write: write ?
                (chunk, controler) => {
                    this.buffer.push(new Blob([chunk]));
                    return write(chunk, controler);
                } :
                chunk => this.buffer.push(new Blob([chunk])),
        }, strategy);
        this.buffer = [];
    }
}

export { MemoryStream, MemoryBlobStream }
export default MemoryStream;
