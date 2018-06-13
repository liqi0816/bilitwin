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

/**
 * Promisify a one-time event listener
 * 
 * @param {EventTarget} target event target
 * @param {string} name name of event
 * @param {string} [errorName='error'] (default 'error') name of error event
 * @param {*} [bind=] (default Event) customized resolve value of Promise
 * @returns {Promise<Event>} a Promise that resolves when the specific event fires
 */
function asyncOnce(target, name, errorName = 'error', bind) {
    return new Promise((resolve, reject) => {
        const once = { once: true };
        const _resolve = e => {
            resolve(bind || e);
            if (errorName) target.removeEventListener(errorName, _reject);
        };
        const _reject = e => {
            reject(e);
            target.removeEventListener(name, _resolve);
        };
        target.addEventListener(name, resolve, once);
        if (errorName) target.addEventListener(errorName, reject, once);
    });
};

/**
 * mix OnEventTarget features into a target class
 * @param {Function} target the target class to mix
 * @returns {Function} the mixed class
 */
function mixin(target) {
    // 1. extends EventTarget
    /**
     * A wrapper of the EventTarget interface in browsers.
     * 
     * - create standalone EventTarget with `on[name]` handlers
     * - promisify one-time listeners with error propagation
     * - mix OnEventTarget functions into another object
     */
    const OnEventTarget = target.prototype instanceof EventTarget || Object.keys(EventTarget.prototype).every(i => target.prototype[i]) ?
        // 1.1 target implements EventTarget => reuse interface
        class OnEventTarget extends target {
        } :
        // 1.2 target does not implement EventTarget => mock interface
        class OnEventTarget extends target {
            constructor(...args) {
                super(...args);
                const e = new EventTarget();
                for (const name of Object.keys(EventTarget.prototype)) {
                    this[name] = e[name].bind(e);
                }
            }
        };

    // 2. add util functions
    OnEventTarget.asyncOnce = asyncOnce;
    OnEventTarget.mixin = mixin;
    Object.defineProperty(OnEventTarget, 'eventList', { value: this['eventList'] });

    // 3. add `on[name]` handlers
    const prototype = Object.getOwnPropertyDescriptors(this.prototype);
    prototype.constructor = {};
    Object.defineProperties(OnEventTarget.prototype, prototype);

    return OnEventTarget;
}

/**
 * Create an OnEventTarget class with specific `on[name]` handlers
 * 
 * @param {string[]} [init=] (default undefined) a list of names that
 * you want to have `on[name]` handlers, or a falsy value
 */
const OnEventTargetFactory = init => {
    // 1. extends EventTarget
    /**
     * A wrapper of the EventTarget interface in browsers.
     * 
     * - create standalone EventTarget with `on[name]` handlers
     * - promisify one-time listeners with error propagation
     * - mix OnEventTarget functions into another object
     */
    class OnEventTarget extends EventTarget { };

    // 2. add util functions
    OnEventTarget.asyncOnce = asyncOnce;
    OnEventTarget.mixin = mixin;
    Object.defineProperty(OnEventTarget, 'eventList', { value: init });

    // 3. add `on[name]` handlers
    if (!init) {
    }
    else if (Array.isArray(init)) {
        for (const name of init) {
            const i = Symbol(`on${name}`);
            OnEventTarget.prototype[i] = null;
            Object.defineProperty(OnEventTarget.prototype, `on${name}`, {
                get() {
                    return this[i];
                },
                set(e) {
                    if (typeof e !== 'function') e = null;
                    this.removeEventListener(name, this[i]);
                    this.addEventListener(name, e);
                    this[i] = e;
                },
            });
        }
    }
    else {
        throw new TypeError(`OnEventTargetFactory: parameter 0 expect falsy value or string[] but get ${init}`);
    }

    // 4. return new class
    return OnEventTarget;
};

/**
 * A sample usage of OnEventTarget.mixin
 * Creates an array that fires 'push' event when push is called
 */
const PushEventArray = class PushEventArray extends OnEventTargetFactory(['push']).mixin(Array) {
    push(...args) {
        this.dispatchEvent(new CustomEvent('push', { detail: args }));
        return super.push(...args);
    }
}

export { asyncOnce, mixin, OnEventTargetFactory, PushEventArray };
export default OnEventTargetFactory;
