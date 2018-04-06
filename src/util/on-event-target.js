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
 * A wrapper of EventTarget interface in browsers
 * - wrap existing EventTarget (dom elements, ws, etc)
 * - on[name] handlers
 * - chainable `on` and `once` registration
 * - promisify one-time listeners
 */
class OnEventTarget extends EventTarget {
    /**
     * Initialize an OnEventTarget object
     * 
     * @param {(EventTarget|string[])} [init=] an existing `EventTarget` to
     * wrap, or a list of names that you want to have on[name] handlers, or a
     * falsy value to disable on[name] handlers.
     * @param {boolean} option.deep go through the prototype chain of init.
     * default `false`. 
     */
    constructor(init, { deep = false } = {}) {
        super();
        if (!init) {
        }
        else if (init instanceof EventTarget) {
            if (!deep) {
                for (const name of Object.getOwnPropertyNames(EventTarget.prototype)) {
                    this[name] = init[name].bind(init);
                }
                for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(init))) {
                    if (name.startsWith('on')) {
                        Object.defineProperty(this, name, {
                            configurable: true,
                            enumerable: true,
                            get: this.simpleGetter.bind(init, name),
                            set: this.simpleSetter.bind(init, name),
                        });
                    }
                }
            }
            else {
                for (const name in EventTarget.prototype) {
                    this[name] = init[name].bind(init);
                }
                for (const name in init) {
                    if (name.startsWith('on')) {
                        Object.defineProperty(this, name, {
                            configurable: true,
                            enumerable: true,
                            get: this.simpleGetter.bind(init, name),
                            set: this.simpleSetter.bind(init, name),
                        });
                    }
                }
            }
        }
        else if (Array.isArray(init)) {
            const dict = new Map(init.map(name => [name, null]));
            for (const name of init) {
                Object.defineProperty(this, `on${name}`, {
                    configurable: true,
                    enumerable: true,
                    get: dict.get.bind(dict, name),
                    set: this.onDictSetter.bind(this, name, dict),
                });
            }
        }
        else {
            throw new TypeError(`OnEventTarget: constructor parameter expect falsy value or EventTarget or string[] but get ${init}`)
        }
    }

    simpleGetter(name) {
        return this[name];
    }

    simpleSetter(name, e) {
        this[name] = e;
    }

    onDictSetter(name, dict, e) {
        if (typeof e !== 'function') e = null;
        this.removeEventListener(name, dict.get(name));
        this.addEventListener(name, e);
        dict.set(name, e);
    }

    /**
     * WARNING different from Node: duplicate registrations are ignored
     * 
     * Adds a listener function to the end of the listeners array. No checks
     * are made to see if the listener has already been added. If multiple
     * identical listeners are registered on the same `EventTarget` with the
     * same parameters, the duplicate instances are discarded. They do not
     * cause the EventListener to be called twice, and they do not need to
     * be removed manually with the `removeEventListener` method.
     * 
     * @param {(string|function|object)} args same args as addEventListener
     * @returns {this} this, chainable
     */
    on(...args) {
        this.addEventListener(...args);
        return this;
    }

    /**
     * Adds a one-time listener function. The next time the event is triggered, 
     * this listener is removed and then invoked. Returns a reference to the
     * EventTarget, so that calls can be chained.
     * 
     * @param {(string|function|object)} args same args as addEventListener
     * @returns {this} this, chainable
     */
    once(...args) {
        if (typeof args[2] === 'boolean') args[2] = { capture: args[2] };
        if (!args[2] || typeof args[2] !== 'object') args[2] = {};
        args[2].once = true;
        this.addEventListener(...args);
        return this;
    }

    /**
     * Promisify a one-time event listener function.
     * @param {string} name The name of the event
     * @returns {Promise<undefined>}
     */
    async asyncOnce(name) {
        return new Promise(resolve => this.addEventListener(name, resolve, { once: true }));
    }
}

export default OnEventTarget;
