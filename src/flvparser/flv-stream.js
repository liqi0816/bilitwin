/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * The FLV merge utility is a Javascript translation of 
 * https://github.com/grepmusic/flvmerge
 * by grepmusic
*/

import TwentyFourDataView from '../util/twenty-four-dataview.js';
import FLVTag from './flv-tag.js';

/**
 * A streamified flv parser
 * IN: whole flv file piped to writeableStream
 * Out: ...tag objects (script tag, audio tag and video tag) as readableStream
 */
class FLVStream extends TransformStream {
    constructor({ headerByteLength = 9 } = {}) {
        super({
            transform: (chunk, controller) => {
                let next = chunk;
                while (true) {
                    const byteLength = this.bufferByteLength + next.byteLength;
                    if (this.targetByteLength < 0) {
                        this.buffer.push(next);
                        this.bufferByteLength = byteLength;
                        this.targetByteLength = this.probe();
                        if (this.targetByteLength < 0) break;
                    }
                    if (byteLength < this.targetByteLength) {
                        this.buffer.push(next);
                        this.bufferByteLength = byteLength;
                        break;
                    }
                    else if (byteLength === this.targetByteLength) {
                        this.buffer.push(next);
                        this.bufferByteLength = byteLength;
                        if (this.header) {
                            controller.enqueue(this.wrapTag(this.concatBuffer()));
                        }
                        else {
                            this.header = this.concatBuffer();
                        }
                        this.buffer = [];
                        this.bufferByteLength = 0;
                        this.targetByteLength = -1;
                        break;
                    }
                    else {
                        this.buffer.push(next.slice(0, this.targetByteLength - this.bufferByteLength));
                        this.bufferByteLength = this.targetByteLength;
                        if (this.header) {
                            controller.enqueue(this.wrapTag(this.concatBuffer()));
                        }
                        else {
                            this.header = this.concatBuffer();
                        }
                        this.buffer = [];
                        this.bufferByteLength = 0;
                        this.targetByteLength = -1;
                        next = next.slice(this.targetByteLength - this.bufferByteLength);
                    }
                }
            }
        });
        this.buffer = [];
        this.bufferByteLength = 0;
        this.targetByteLength = headerByteLength;
        this.header = null;
    }

    probe() {
        let probeBuffer = new Uint8Array(4);
        let probeBufferByteLength = 0;
        for (const chunk of this.buffer) {
            probeBuffer.set(chunk, probeBufferByteLength);
            probeBufferByteLength += chunk.byteLength;
            if (probeBufferByteLength >= 4) break;
        }
        if (probeBufferByteLength >= 4) {
            return new Uint32Array(probeBuffer)[0] & 0x00FFFFFF;
        }
        else {
            return -1;
        }
    }

    concatBuffer() {
        if (this.buffer.length === 1) return this.buffer[0];
        if (typeof Buffer !== 'undefined') return Buffer.concat(this.buffer);
        const ret = new Uint8Array(this.bufferByteLength);
        let byteLength = 0;
        for (const chunk of this.buffer) {
            ret.set(chunk, byteLength);
            byteLength += chunk.byteLength;
        }
        return ret;
    }

    wrapTag(buffer) {
        return new FLVTag(new TwentyFourDataView(buffer));
    }
}
