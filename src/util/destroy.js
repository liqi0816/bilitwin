/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * A destroy hook register
 */
class Destroy extends Function {
    constructor(...func) {
        const ret = () => ret.callbacks.map(e => e());
        Object.setPrototypeOf(ret, Destroy.prototype);
        ret.callbacks = func;
        return ret;
    }

    addCallback(...func) {
        this.callbacks.push(...func);
    }

    removeCallback(func) {
        this.callbacks = this.callbacks.filter(e => e !== func);
    }

    removeAllCallback() {
        this.callbacks = [];
    }
}

export default Destroy;
