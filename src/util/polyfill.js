/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

const _AbortController = typeof AbortController === 'function' && AbortController || class {
    constructor() {
        this.signal = new _EventTarget();
        this.signal.aborted = false;

        let onabort = null;
        Object.defineProperty(this.signal, 'onabort', {
            configurable: true,
            enumerable: true,
            get: () => onabort,
            set: e => {
                if (typeof e !== 'function') e = null;
                this.removeEventListener('abort', onabort);
                this.addEventListener('abort', e);
                onabort = e;
            },
        });
    }

    abort() {
        this.signal.dispatchEvent(new Event('abort'));
        this.signal.aborted = true;
    }
};

export { _EventTarget as EventTarget, _AbortController as AbortController };
export default { EventTarget: _EventTarget, AbortController: _AbortController };
