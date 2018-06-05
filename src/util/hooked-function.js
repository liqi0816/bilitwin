/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

let flagSymbol, prototypeDescriptors, prototypeKeys, debuggerFunction;

/**
 * A util to hook a function
 */
class HookedFunction extends Function {
    /**
     * Create a hooked function. Parameter patterns:
     * 
     * `(raw?, ...others)`
     * 
     * where `others` can be
     * 
     * `[...pre-hooks], [...post-hooks]`
     * 
     * `[...post-hooks]`
     * 
     * `...post-hooks`
     * 
     * `{raw?:{function}, pre?:{(function|function[])}, post?:{(function|function[])}}`
     * 
     * @param {...(function|function[]|InitDict)} init
     * @returns {function} the wrapped function
     */
    constructor(...init) {
        // 1. init parameter
        const { raw, pre, post } = HookedFunction.parseParameter(...init);

        // 2. build bundle
        const self = function (...args) {
            const { raw, pre, post } = self;
            /**
             * @type {Context}
             */
            const context = { args, target: raw, ret: undefined, hook: self };
            pre.forEach(e => e.call(this, context));
            if (context.target) context.ret = context.target.apply(this, context.args);
            post.forEach(e => e.call(this, context));
            return context.ret;
        };
        Object.defineProperties(self, prototypeDescriptors);
        /**
         * @type {function} the raw function
         */
        self.raw = raw;
        /**
         * @type {function[]} the pre-hook list
         */
        self.pre = pre;
        /**
         * @type {function[]} the post-hook list
         */
        self.post = post;

        // 3. cheat babel - it complains about missing super(), even if it is actually valid 
        try {
            return self;
        } catch (e) {
            super();
            return self;
        }
    }

    /**
     * Add functions to pre-hook list
     * @param {...Hook} func functions to add
     */
    addPre(...func) {
        this.pre.push(...func);
    }

    /**
     * Add functions to post-hook list
     * @param {...Hook} func functions to add
     */
    addPost(...func) {
        this.post.push(...func);
    }

    /**
     * alias of addPre
     */
    get addCallback() {
        return this.addPost;
    }

    /**
     * Remove a function from pre-hook list
     * @param {Hook} func function to remove
     */
    removePre(func) {
        this.pre = this.pre.filter(e => e != func);
    }

    /**
     * Remove a function from post-hook list
     * @param {Hook} func function to remove
     */
    removePost(func) {
        this.post = this.post.filter(e => e != func);
    }

    /**
     * alias of removePost
     */
    get removeCallback() {
        return this.removePost;
    }

    /**
     * @private
     */
    static parseParameter(...init) {
        // 1. clone init
        init = init.slice();

        // 2. default
        let raw = null;
        let pre = [];
        let post = [];

        // 3. (raw, ...others)
        if (typeof init[0] === 'function') raw = init.shift();

        // 4. iterate through parameters
        for (const e of init) {
            if (!e) {
                continue;
            }
            else if (Array.isArray(e)) {
                pre = post;
                post = e;
            }
            else if (typeof e == 'object') {
                if (typeof e.raw == 'function') raw = e.raw;
                if (typeof e.pre == 'function') pre.push(e.pre);
                if (typeof e.post == 'function') post.push(e.post);
                if (Array.isArray(e.pre)) pre = e.pre;
                if (Array.isArray(e.post)) post = e.post;
            }
            else if (typeof e == 'function') {
                post.push(e);
            }
            else {
                throw new TypeError(`HookedFunction: cannot recognize paramter ${e} of class ${e}`);
            }
        };

        return { raw, pre, post };
    }

    static isHooked(raw) {
        return raw[flagSymbol] || prototypeKeys.every(e => raw[e]);
    }

    /**
     * Wrap a function if it has not been, or apply more hooks otherwise
     * 
     * @param {...(function|function[]|InitDict)} init 
     * @returns {function} the wrapped function
     */
    static hook(...init) {
        // 1. init parameter
        const { raw, pre, post } = HookedFunction.parseParameter(...init);

        // 2 wrap
        // 2.1 already wrapped => concat
        if (HookedFunction.isHooked(raw)) {
            raw.pre.push(...pre);
            raw.post.push(...post);
            return raw;
        }

        // 2.2 otherwise => new
        else {
            return new HookedFunction({ raw, pre, post });
        }
    }

    /**
     * Add debugger statement hook to a function
     * 
     * @param {function} raw function to debug.
     * @param {boolean} [pre=true] add pre-hook. default true
     * @param {boolean} [post=false] add post-hook. default false
     */
    static hookDebugger(raw, pre = true, post = false) {
        // 2 wrap
        // 2.1 already wrapped => concat
        if (HookedFunction.isHooked(raw)) {
            if (pre && !raw.pre.includes(HookedFunction.hookDebugger.hook)) {
                raw.pre.push(HookedFunction.hookDebugger.hook);
            }
            if (post && !raw.post.includes(HookedFunction.hookDebugger.hook)) {
                raw.post.push(HookedFunction.hookDebugger.hook);
            }
            return raw;
        }

        // 2.2 otherwise => new
        else {
            return new HookedFunction({
                raw,
                pre: pre && HookedFunction.hookDebugger.hook || undefined,
                post: post && HookedFunction.hookDebugger.hook || undefined,
            });
        }
    }
}

HookedFunction.flagSymbol = flagSymbol = Symbol('HookedFunctionFlag');
HookedFunction.prototypeDescriptors = prototypeDescriptors = Object.getOwnPropertyDescriptors(HookedFunction.prototype);
HookedFunction.prototypeKeys = prototypeKeys = Object.keys(prototypeDescriptors);
HookedFunction.debuggerFunction = debuggerFunction = function (ctx) { debugger };

export default HookedFunction;

/**
 * @typedef {Object} InitDict
 * @property {function} InitDict.raw
 * @property {(Hook|Hook[])} InitDict.pre
 * @property {(Hook|Hook[])} InitDict.post
 */

/**
 * @typedef {Object} Context
 * @property {...*} InitDict.args
 * @property {function} InitDict.target
 * @property {*} InitDict.ret  
 * @property {HookedFunction} InitDict.hook
 */

/**
 * @typedef {function} Hook
 * @param {Context} ctx context
 */
