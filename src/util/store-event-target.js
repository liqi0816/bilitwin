/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { EventTarget } from '../polyfill/polyfill.js';

function bindReactive(key, prop = 'textContent') {
    if (typeof key === 'object') {
    }
    else if (typeof key === 'string') {
        return node => {
            node[prop] = this[key];
            this.addEventListener(key, ({ detail }) => node[prop] = detail);
        }
    }
    else {
        throw new TypeError(`StoreEventTarget.prototype.bindReactive: parameter 0 expect string or object but get ${init}`)
    }
}

function dispatchAll() {
    for (const key of this.constructor.eventList) {
        this.dispatchEvent(new CustomEvent(key, { detail: this[key] }));
    }
}

/**
 * Create an StoreEventTarget class with specific reactive properties
 * 
 * @param {string[]|object} [init=] (default undefined) a list of names that
 * you want to have `on[name]` handlers, or a falsy value
 */
const StoreEventTargetFactory = init => {
    class StoreEventTarget extends EventTarget { };

    StoreEventTarget.prototype.bindReactive = bindReactive;
    StoreEventTarget.prototype.dispatchAll = dispatchAll;

    if (!init) {
        Object.defineProperty(StoreEventTarget, 'eventList', { value: [] });
    }
    else if (init[Symbol.iterator]) {
        Object.defineProperty(StoreEventTarget, 'eventList', { value: [...init] });
        for (const key of init) {
            const i = Symbol(key);
            StoreEventTarget.prototype[i] = undefined;
            Object.defineProperty(StoreEventTarget.prototype, key, {
                get() {
                    return this[i];
                },
                set(detail) {
                    this[i] = detail;
                    this.dispatchEvent(new CustomEvent(key, { detail }));
                },
            });
        }
    }
    else if (typeof init === 'object') {
        Object.defineProperty(StoreEventTarget, 'eventList', { value: Object.keys(init) });
        for (const [key, value] of Object.entries(init)) {
            const i = Symbol(key);
            StoreEventTarget.prototype[i] = value;
            Object.defineProperty(StoreEventTarget.prototype, key, {
                get() {
                    return this[i];
                },
                set(detail) {
                    this[i] = detail;
                    this.dispatchEvent(new CustomEvent(key, { detail }));
                },
            });
        }
    }
    else {
        throw new TypeError(`StoreEventTargetFactory: parameter 0 expect falsy value or string[] or object but get ${init}`);
    }

    return StoreEventTarget;
}

export default StoreEventTargetFactory;
