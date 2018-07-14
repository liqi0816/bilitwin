/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SimpleEventTarget, mixinCommonEventTarget, } from './simple-event-target.js';
function asyncOnce(target, name, errorName = 'error', bind) {
    return new Promise((resolve, reject) => {
        const once = { once: true };
        const _resolve = (e) => {
            resolve(bind === undefined ? e : bind);
            if (errorName)
                target.removeEventListener(errorName, _reject);
        };
        const _reject = (e) => {
            reject(e);
            target.removeEventListener(name, _resolve);
        };
        target.addEventListener(name, resolve, once);
        if (errorName)
            target.addEventListener(errorName, reject, once);
    });
}
;
/**
 * mix OnEventTarget features into a target class
 * @param target the target class to mix
 * @returns the mixed class
 */
// typescript: #(duplicate method declaration) = 1 (renamed to `mixin`)
function mixinOnEventTarget(target) {
    // 1. target does not implement CommonEventTargetInterface => mock interface
    if (!(target instanceof EventTarget)
        && (typeof target.prototype.addEventListener !== 'function'
            || typeof target.prototype.removeEventListener !== 'function'
            || typeof target.prototype.dispatchEvent !== 'function')) {
        target = mixinCommonEventTarget(target);
    }
    // 2. extends target
    /**
     * A wrapper of the EventTarget interface in browsers.
     *
     * - create standalone EventTarget with `on[name]` handlers
     * - promisify one-time listeners with error propagation
     * - mix OnEventTarget functions into another object
     */
    class OnEventTarget extends target {
    }
    OnEventTarget.asyncOnce = asyncOnce;
    // 3. add `on[name]` handlers
    const prototype = Object.getOwnPropertyDescriptors(this.prototype);
    prototype.constructor = {};
    Object.defineProperties(OnEventTarget.prototype, prototype);
    return OnEventTarget;
}
/**
 * Create an OnEventTarget class with specific `on[name]` handlers
 *
 * @param init (default undefined) a list of names that
 * you want to have `on[name]` handlers, or a falsy value
 */
function OnEventTargetFactory(init) {
    // 1. extends EventTarget
    /**
     * A wrapper of the EventTarget interface in browsers.
     *
     * - create standalone EventTarget with `on[name]` handlers
     * - promisify one-time listeners with error propagation
     * - mix OnEventTarget functions into another object
     */
    class OnEventTarget extends SimpleEventTarget {
    }
    OnEventTarget.asyncOnce = asyncOnce;
    OnEventTarget.mixin = mixinOnEventTarget;
    // 2. add `on[name]` handlers
    if (!init) {
        Object.defineProperty(OnEventTarget, 'eventList', { value: Object.freeze([]) });
    }
    else if (init[Symbol.iterator]) {
        Object.defineProperty(OnEventTarget, 'eventList', { value: Object.freeze([...init]) });
        for (const name of init) {
            const i = Symbol(`on${name}`);
            OnEventTarget.prototype[i] = null;
            Object.defineProperty(OnEventTarget.prototype, `on${name}`, {
                get() {
                    return this[i];
                },
                set(e) {
                    if (typeof e !== 'function')
                        e = null;
                    this.removeEventListener(name, this[i]);
                    this.addEventListener(name, e);
                    this[i] = e;
                },
            });
        }
    }
    else {
        throw new TypeError(`OnEventTargetFactory: parameter 0 expect falsy value or Iterable<string> but get ${init}`);
    }
    // 3. return new class
    return OnEventTarget;
}
/**
 * A sample usage of OnEventTarget.mixin
 * Creates an array that fires 'push' event when push is called
 */
class PushEventArray extends OnEventTargetFactory(['push']).mixin(Array) {
    /**
     * will fire CustomEvent<typeof args> when called
     * @param args will be passed to super.push
     */
    push(...args) {
        this.dispatchEvent(new CustomEvent('push', { detail: args }));
        return super.push(...args);
    }
}
export { asyncOnce, mixinOnEventTarget, OnEventTargetFactory, PushEventArray };
export default OnEventTargetFactory;
//# sourceMappingURL=on-event-target.js.map