/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import TwentyFourDataView from '../../util/twenty-four-dataview.js';
import FLVTag from './flv-tag.js';
/**
 * A streamified flv parser
 * IN: whole flv file piped to writeableStream
 * OUT: ...tag objects (script tag, audio tag and video tag) as readableStream
 */
class FLVStream extends TransformStream {
    constructor({ headerByteLength = 9 + 4 } = {}, ...strategies) {
        super({
            transform: (chunk, controller) => {
                // 1. scan through chunk for tags
                let next = chunk;
                while (true) {
                    // 2. find the size of all buffered data
                    const byteLength = this.bufferByteLength + next.byteLength;
                    // 2. size of next tag unknown => try to find it
                    if (this.targetByteLength < 0) {
                        // 2.1 probe the incoming chunk for tag size
                        this.targetByteLength = this.probe(next);
                        // 2.2 still unknown => tag header incomplete => buffer it and break
                        if (this.targetByteLength < 0) {
                            this.buffer.push(next);
                            this.bufferByteLength = byteLength;
                            break;
                        }
                    }
                    // 3. buffered data < next tag => buffer it and break
                    if (byteLength < this.targetByteLength) {
                        this.buffer.push(next);
                        this.bufferByteLength = byteLength;
                        break;
                    }
                    // 4. buffered data === next tag => output it and break
                    else if (byteLength === this.targetByteLength) {
                        this.buffer.push(next);
                        this.bufferByteLength = byteLength;
                        if (this.header) {
                            controller.enqueue(this.wrapTag(this.concatBuffer().buffer));
                        }
                        else {
                            this.header = this.concatBuffer();
                            this.readable.header = this.header;
                        }
                        this.buffer = [];
                        this.bufferByteLength = 0;
                        this.targetByteLength = -1;
                        break;
                    }
                    // 5. buffered data > next tag => output next tag, continue on the rest of chunk
                    else {
                        const remainderByteLength = this.targetByteLength - this.bufferByteLength;
                        this.buffer.push(new Uint8Array(next.buffer, next.byteOffset, remainderByteLength));
                        this.bufferByteLength = this.targetByteLength;
                        if (this.header) {
                            controller.enqueue(this.wrapTag(this.concatBuffer().buffer));
                        }
                        else {
                            this.header = this.concatBuffer();
                            this.readable.header = this.header;
                        }
                        this.buffer = [];
                        this.bufferByteLength = 0;
                        this.targetByteLength = -1;
                        next = new Uint8Array(next.buffer, next.byteOffset + remainderByteLength);
                    }
                }
            }
        }, ...strategies);
        this.buffer = [];
        this.bufferByteLength = 0;
        this.targetByteLength = headerByteLength;
        this.header = null;
        this.readable.header = null;
    }
    probe(next) {
        // 1. flv tag header: 
        //        0       |      1 2 3
        // tagType(uint8) | dataSize(uint24)
        // => we need a 4-byte buffer
        let probeBuffer = new Uint8Array(4);
        let probeBufferByteLength = 0;
        // 2. collect the first 4 bytes from buffer
        for (const chunk of this.buffer) {
            probeBuffer.set(chunk, probeBufferByteLength);
            probeBufferByteLength += chunk.byteLength;
        }
        // 3. collect the rest bytes from next chunk
        probeBuffer.set(next.slice(0, 4 - probeBufferByteLength), probeBufferByteLength);
        probeBufferByteLength += next.byteLength;
        // 4. dataSize received => compute tagSize
        if (probeBufferByteLength >= 4) {
            // tag = tagHeader(11) + tagData(tagHeader.getUint24(1), see comment 1) + previousSize(4)
            return 11 + (new DataView(probeBuffer.buffer).getUint32(0) & 0x00FFFFFF) + 4;
        }
        // 5. otherwise => still unknow
        else {
            return -1;
        }
    }
    concatBuffer() {
        // NOTE: please return a deep-clone for convience of garbage collection
        // ArrayBuffer         ----+++++--- NOT collectable
        // DataView/TypedArray     +++++    you cannot perform partial free
        if (this.buffer.length === 1)
            return this.buffer[0].slice();
        if (typeof Buffer !== 'undefined')
            return Buffer.concat(this.buffer);
        const ret = new Uint8Array(this.bufferByteLength);
        let byteLength = 0;
        for (const chunk of this.buffer) {
            ret.set(chunk, byteLength);
            byteLength += chunk.byteLength;
        }
        return ret;
    }
    wrapTag(buffer) {
        // if (ArrayBuffer.isView(buffer)) buffer = buffer.buffer;
        return new FLVTag(new TwentyFourDataView(buffer));
    }
}
export default FLVStream;
//# sourceMappingURL=flv-stream.js.map