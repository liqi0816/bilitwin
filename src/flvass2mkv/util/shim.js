/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const _navigator = typeof navigator === 'object' && navigator || { userAgent: 'chrome' };

const _Blob = typeof Blob === 'function' && Blob || class {
    constructor(array) {
        return Buffer.concat(array.map(Buffer.from.bind(Buffer)));
    }
};

const _TextEncoder = typeof TextEncoder === 'function' && TextEncoder || class {
    /**
     * @param {string} chunk 
     * @returns {Uint8Array}
     */
    encode(chunk) {
        return Buffer.from(chunk, 'utf-8');
    }
};

const _TextDecoder = typeof TextDecoder === 'function' && TextDecoder || class extends require('string_decoder').StringDecoder {
    /**
     * @param {ArrayBuffer} chunk 
     * @returns {string}
     */
    decode(chunk) {
        return this.end(Buffer.from(chunk));
    }
}

export { _navigator as navigator, _Blob as Blob, _TextEncoder as TextEncoder, _TextDecoder as TextDecoder };
export default { navigator: _navigator, Blob: _Blob, TextEncoder: _TextEncoder, TextDecoder: _TextDecoder };
