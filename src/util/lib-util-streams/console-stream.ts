/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import WritableStream, { UnderlyingSink } from './writablestream-types.js';

class ConsoleStream extends WritableStream {
    constructor({ start, write, close, abort } = {} as UnderlyingSink, strategy?: QueuingStrategy) {
        super({
            start, close, abort,
            write: write ?
                (chunk, controler) => {
                    console.log(chunk);
                    return write(chunk, controler);
                } :
                chunk => console.log(chunk),
        }, strategy);
    }
}

class ConsoleWarnStream extends WritableStream {
    constructor({ start, write, close, abort } = {} as UnderlyingSink, strategy?: QueuingStrategy) {
        super({
            start, close, abort,
            write: write ?
                (chunk, controler) => {
                    console.warn(chunk);
                    return write(chunk, controler);
                } :
                chunk => console.warn(chunk),
        }, strategy);
    }
}

class ConsoleErrorStream extends WritableStream {
    constructor({ start, write, close, abort } = {} as UnderlyingSink, strategy?: QueuingStrategy) {
        super({
            start, close, abort,
            write: write ?
                (chunk, controler) => {
                    console.error(chunk);
                    return write(chunk, controler);
                } :
                chunk => console.error(chunk),
        }, strategy);
    }
}

class ConsoleDirStream extends WritableStream {
    constructor({ start, write, close, abort } = {} as UnderlyingSink, strategy?: QueuingStrategy) {
        super({
            start, close, abort,
            write: write ?
                (chunk, controler) => {
                    console.dir(chunk);
                    return write(chunk, controler);
                } :
                chunk => console.dir(chunk),
        }, strategy);
    }
}

const streams = {
    get stdout() { return new ConsoleStream() },
    get stdwarn() { return new ConsoleWarnStream() },
    get stderr() { return new ConsoleErrorStream() },
    get stddir() { return new ConsoleDirStream() },
}

export { ConsoleStream, ConsoleWarnStream, ConsoleErrorStream, ConsoleDirStream, streams }
export default ConsoleStream;
