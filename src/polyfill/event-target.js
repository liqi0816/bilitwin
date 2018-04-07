/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

let _EventTarget = EventTarget;
try {
    new EventTarget();
} catch (e) {
    _EventTarget = class {
        constructor() {
            const e = document.createDocumentFragment();
            for (const name of Object.keys(EventTarget.prototype)) {
                this[name] = e[name].bind(e);
            }
        }
    }
}

export default _EventTarget;