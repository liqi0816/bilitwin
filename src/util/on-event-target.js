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
 * A wrapper of EventTarget interface in browsers.
 * 
 * - create standalone EventTarget with `on[name]` handlers
 * - promisify one-time listeners with error propagation
 * - mix OnEventTarget features into another object
 */
class OnEventTarget extends EventTarget {
    /**
     * Initialize an OnEventTarget object
     * 
     * @param {string[]} [init=] (default undefined) a list of names that
     * you want to have `on[name]` handlers, or a falsy value
     */
    constructor(init) {
        super();
        if (!init) return;
        else if (Array.isArray(init)) {
            const dict = new Map(init.map(name => [name, null]));
            for (const name of init) {
                Object.defineProperty(this, `on${name}`, {
                    configurable: true,
                    enumerable: true,
                    get: dict.get.bind(dict, name),
                    set: OnEventTarget.onDictSetter.bind(this, name, dict),
                });
            }
        }
        else {
            throw new TypeError(`OnEventTarget: constructor parameter expect falsy value or string[] but get ${init}`)
        }
    }

    /**
     * Promisify a one-time event listener
     * 
     * @param {EventTarget} target event target
     * @param {string} name name of event
     * @param {string} [errorName='error'] (default 'error') name of error event
     * @param {*} [bind=] (default Event) customized resolve value of Promise
     * @returns {Promise<Event>} A Promise
     */
    static asyncOnce(target, name, errorName = 'error', bind) {
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
    }

    /**
     * @private
     */
    static simpleGetter(name) {
        return this[name];
    }

    /**
     * @private
     */
    static simpleSetter(name, e) {
        this[name] = e;
    }

    /**
     * @private
     */
    static onDictSetter(name, dict, e) {
        if (typeof e !== 'function') e = null;
        this.removeEventListener(name, dict.get(name));
        this.addEventListener(name, e);
        dict.set(name, e);
    }

    /**
     * mix OnEventTarget features into target
     * 
     * @param {Object} target mixin target
     * @param {string[]} [init=] a list of names that you want to have
     * on[name] handlers, or a falsy value to disable on[name] handlers.
     */
    static mixin(target, init) {
        // 1. init
        if (!init) {
            init = target;
            target = this;
        }
        if (!target || target === OnEventTarget) {
            throw new TypeError(`OnEventTarget.mixin: Invalid mixin target. Usage: .mixin.call(target, init) or .mixin(target, init)`);
        }

        // 2. mixin EventTarget
        if (!(target instanceof EventTarget)) {
            const e = new EventTarget();
            for (const name of Object.keys(EventTarget.prototype)) {
                target[name] = e[name].bind(e);
            }
        }

        // 3. mixin OnEventTarget constructor
        if (!init) {
        }
        else if (Array.isArray(init)) {
            const dict = new Map(init.map(name => [name, null]));
            for (const name of init) {
                Object.defineProperty(target, `on${name}`, {
                    configurable: true,
                    enumerable: true,
                    get: dict.get.bind(dict, name),
                    set: OnEventTarget.onDictSetter.bind(target, name, dict),
                });
            }
        }
        else {
            throw new TypeError(`OnEventTarget.mixin: constructor parameter expect falsy value or string[] but get ${init}`)
        }
    }
}

export default OnEventTarget;
