/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface RawFunction<TArgs extends Array<any>, TRet> {
    (...args: TArgs): TRet
}

export interface Context<TArgs extends Array<any>, TRet> {
    args: TArgs
    raw: RawFunction<TArgs, TRet>
    ret?: TRet
    hookedFunction: HookedFunction<TArgs, TRet>
}

export interface Hook<TArgs extends Array<any>, TRet> {
    (context: Context<TArgs, TRet>): void
}

export interface HookedFunctionInit<TArgs extends Array<any>, TRet> {
    raw: RawFunction<TArgs, TRet>
    pre?: Hook<TArgs, TRet> | Iterable<Hook<TArgs, TRet>>
    post?: Hook<TArgs, TRet> | Iterable<Hook<TArgs, TRet>>
}

export interface HookedFunctionSpreadableInit<TArgs extends Array<any>, TRet> {
    raw: RawFunction<TArgs, TRet> | HookedFunction<TArgs, TRet>
    pre?: Hook<TArgs, TRet> | Iterable<Hook<TArgs, TRet>>
    post?: Hook<TArgs, TRet> | Iterable<Hook<TArgs, TRet>>
}

const flagSymbol = Symbol('HookedFunctionFlag');

/**
 * A util to hook a function
 */
class HookedFunction<TArgs extends Array<any>, TRet> extends Function {
    raw!: RawFunction<TArgs, TRet>
    pre!: Set<Hook<TArgs, TRet>>
    post!: Set<Hook<TArgs, TRet>>
    [flagSymbol]!: true

    /**
     * Create a hooked function. 
     * 
     * @returns the wrapped function
     */
    constructor(raw: HookedFunctionInit<TArgs, TRet>['raw'], pre?: HookedFunctionInit<TArgs, TRet>['pre'], post?: HookedFunctionInit<TArgs, TRet>['post'])
    constructor({ raw, pre, post }: HookedFunctionInit<TArgs, TRet>)
    constructor(raw: HookedFunctionInit<TArgs, TRet> | HookedFunctionInit<TArgs, TRet>['raw'], pre?: HookedFunctionInit<TArgs, TRet>['pre'], post?: HookedFunctionInit<TArgs, TRet>['post']) {    // 1. init parameter
        // 1. parameters
        if (typeof raw === 'object') {
            pre = raw.pre;
            post = raw.post;
            raw = raw.raw;
        }
        if (typeof pre === 'function') pre = [pre];
        if (typeof post === 'function') post = [post];

        // 2. build hooked function
        const self = function (this: any, ...args: TArgs) {
            const { raw, pre, post } = self;
            const context: Context<TArgs, TRet> = { args, raw, ret: undefined, hookedFunction: self };
            for (const hook of pre) {
                new Promise(() => hook.call(this, context));
            }
            if (context.raw) context.ret = context.raw.apply(this, context.args);
            for (const hook of post) {
                new Promise(() => hook.call(this, context));
            }
            return context.ret as TRet;
        } as unknown as HookedFunction<TArgs, TRet>;
        self.raw = raw;
        self.pre = new Set(pre!);
        self.post = new Set(post!);
        self[flagSymbol] = true;
        self.constructor = HookedFunction;

        try {
            return self;
        }
        catch {
            super();
            return self;
        }
    }

    static [Symbol.hasInstance](x: any): x is HookedFunction<any, any> {
        return x[flagSymbol];
    }

    /**
     * Wrap a function if it has not been, or apply more hooks otherwise
     * 
     * @returns the wrapped function
     */
    static hook<TArgs extends Array<any>, TRet>(raw: HookedFunctionSpreadableInit<TArgs, TRet>['raw'], pre?: HookedFunctionSpreadableInit<TArgs, TRet>['pre'], post?: HookedFunctionSpreadableInit<TArgs, TRet>['post']): HookedFunction<TArgs, TRet>
    static hook<TArgs extends Array<any>, TRet>({ raw, pre, post }: HookedFunctionSpreadableInit<TArgs, TRet>): HookedFunction<TArgs, TRet>
    static hook<TArgs extends Array<any>, TRet>(raw: HookedFunctionSpreadableInit<TArgs, TRet> | HookedFunctionSpreadableInit<TArgs, TRet>['raw'], pre?: HookedFunctionSpreadableInit<TArgs, TRet>['pre'], post?: HookedFunctionSpreadableInit<TArgs, TRet>['post']) {
        // 1. parameters
        if (typeof raw === 'object') {
            pre = raw.pre;
            post = raw.post;
            raw = raw.raw;
        }
        if (typeof pre === 'function') pre = [pre];
        if (typeof post === 'function') post = [post];

        // 2 wrap
        // 2.1 already wrapped => concat
        if (raw instanceof HookedFunction) {
            if (pre) {
                for (const callback of pre) {
                    raw.pre.add(callback);
                }
            }
            if (post) {
                for (const callback of post) {
                    raw.post.add(callback);
                }
            }
            return raw;
        }

        // 2.2 otherwise => new
        else {
            return new HookedFunction<TArgs, TRet>(raw as RawFunction<TArgs, TRet>, pre, post);
        }
    }

    static dehook<TArgs extends Array<any>, TRet>(raw: HookedFunctionSpreadableInit<TArgs, TRet>['raw']) {
        if (raw instanceof HookedFunction) {
            return raw.raw;
        }
        else {
            return raw;
        }
    }

    /**
     * Add debugger statement hook to a function
     * 
     * @param raw function to debug.
     * @param pre (default true) add pre-hook. default true
     * @param post (default false) add post-hook. default false
     */
    static hookDebugger<TArgs extends Array<any>, TRet>(raw: HookedFunctionSpreadableInit<TArgs, TRet>['raw'], pre = true, post = false) {
        const { debuggerFunction } = HookedFunction;
        if (raw instanceof HookedFunction) {
            if (pre) {
                raw.pre.add(debuggerFunction);
            }
            if (post) {
                raw.post.add(debuggerFunction);
            }
            return raw;
        }
        else {
            return new HookedFunction<TArgs, TRet>(raw, pre ? debuggerFunction : undefined, post ? debuggerFunction : undefined);
        }
    }

    static debuggerFunction<TArgs extends Array<any>, TRet>(ctx: Context<TArgs, TRet>) {
        debugger;
    }

    static flagSymbol = flagSymbol
}

export default HookedFunction;
