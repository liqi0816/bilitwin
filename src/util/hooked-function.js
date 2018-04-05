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
 * A util to hook a function
 */
class HookedFunction extends Function {
    constructor(...init) {
        // 1. init parameter
        const { raw, pre, post } = HookedFunction.parseParameter(...init);

        // 2. build bundle
        const self = function (...args) {
            const { raw, pre, post } = self;
            const context = { args, target: raw, ret: undefined, hook: self };
            pre.forEach(e => e.call(this, context));
            if (context.target) context.ret = context.target.apply(this, context.args);
            post.forEach(e => e.call(this, context));
            return context.ret;
        };
        Object.setPrototypeOf(self, HookedFunction.prototype);
        self.raw = raw;
        self.pre = pre;
        self.post = post;

        // 3. cheat babel - it complains about missing super(), even if it is actual valid 
        try {
            return self;
        } catch (e) {
            super();
            return self;
        }
    }

    addPre(...func) {
        this.pre.push(...func);
    }

    addPost(...func) {
        this.post.push(...func);
    }

    addCallback(...func) {
        this.addPost(...func);
    }

    removePre(func) {
        this.pre = this.pre.filter(e => e != func);
    }

    removePost(func) {
        this.post = this.post.filter(e => e != func);
    }

    removeCallback(func) {
        this.removePost(func);
    }

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
                throw new TypeError(`HookedFunction: cannot recognize paramter ${e} of class ${e.constructor.name}`);
            }
        };

        return { raw, pre, post };
    }

    static hook(...init) {
        // 1. init parameter
        const { raw, pre, post } = HookedFunction.parseParameter(...init);

        // 2 wrap
        // 2.1 already wrapped => concat
        if (raw instanceof HookedFunction) {
            raw.pre.push(...pre);
            raw.post.push(...post);
            return raw;
        }

        // 2.2 otherwise => new
        else {
            return new HookedFunction({ raw, pre, post });
        }
    }

    static hookDebugger(raw, pre = true, post = false) {
        // 1. init hook
        if (!HookedFunction.hookDebugger.hook) HookedFunction.hookDebugger.hook = function (ctx) { debugger };

        // 2 wrap
        // 2.1 already wrapped => concat
        if (raw instanceof HookedFunction) {
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

export default HookedFunction;
