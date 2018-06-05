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

/**
 * A streamified flv parser
 * IN: whole flv file piped to writeableStream
 * Out: ...tag objects (script tag, audio tag and video tag) as readableStream
 */
class FLVStream extends TransformStream {
    constructor() {
        super({
            transform: (chunk, controller) => {
                if (chunk.length > this.
            }
        });

        this.buffer = new Uint8Array(9);
    }
}