/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class BoundedBuffer extends EventTarget {
    constructor(size) {
        this.buffer = new Array(size);
        this.size = size;
        this.produceCount = 0;
        this.consumeCount = 0;
    }

    async push(chunk) {
        if (this.produceCount - this.consumeCount === this.size) {
            await new Promise(this.addEventListener)
        }
    }

    async unshift(chunk) {

    }

    async shift(chunk) {

    }

    async pop() {

    }
}

await(this.queryInfoMutex = this.queryInfoMutex.then(() => {
    return fetch(location);
}))