/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface RawFunction<ArgType = any, RetType = any> {
    (...args: ArgType[]): RetType
}

export interface Context<ArgType = any, RetType = any> {
    args: ArgType[]
    raw: RawFunction<ArgType, RetType>
    ret?: RetType
    hookedFunction: HookedFunction
}

export interface Hook<ArgType = any, RetType = any> {
    (context: Context<ArgType, RetType>): void
}

export interface HookedFunctionInit<ArgType = any, RetType = any> {
    raw: RawFunction<ArgType, RetType>
    pre?: Hook<ArgType, RetType> | Iterable<Hook<ArgType, RetType>>
    post?: Hook<ArgType, RetType> | Iterable<Hook<ArgType, RetType>>
}

export interface HookedFunctionSpreadableInit<ArgType = any, RetType = any> {
    raw: RawFunction<ArgType, RetType> | HookedFunction<ArgType, RetType>
    pre?: Hook<ArgType, RetType> | Iterable<Hook<ArgType, RetType>>
    post?: Hook<ArgType, RetType> | Iterable<Hook<ArgType, RetType>>
}

const flagSymbol = Symbol('HookedFunctionFlag');

/**
 * A util to hook a function
 */
class HookedFunction<ArgType = any, RetType = any> extends Function {
    // @ts-ignore: constructor returns explictly
    raw: RawFunction<ArgType, RetType>
    // @ts-ignore: constructor returns explictly
    pre: Set<Hook<ArgType, RetType>>
    // @ts-ignore: constructor returns explictly
    post: Set<Hook<ArgType, RetType>>
    [flagSymbol]: true

    /**
     * Create a hooked function. 
     * 
     * @returns the wrapped function
     */
    constructor(raw: HookedFunctionInit<ArgType, RetType>['raw'], pre?: HookedFunctionInit<ArgType, RetType>['pre'], post?: HookedFunctionInit<ArgType, RetType>['post'])
    constructor({ raw, pre, post }: HookedFunctionInit<ArgType, RetType>)
    constructor(raw: HookedFunctionInit<ArgType, RetType> | HookedFunctionInit<ArgType, RetType>['raw'], pre?: HookedFunctionInit<ArgType, RetType>['pre'], post?: HookedFunctionInit<ArgType, RetType>['post']) {    // 1. init parameter
        // 1. parameters
        if (typeof raw === 'object') {
            pre = raw.pre;
            post = raw.post;
            raw = raw.raw;
        }
        if (typeof pre === 'function') pre = [pre];
        if (typeof post === 'function') post = [post];

        // 2. build bundle
        const self = function (this: any, ...args: ArgType[]) {
            const { raw, pre, post } = self;
            const context: Context<ArgType, RetType> = { args, raw, ret: undefined, hookedFunction: self };
            for (const hook of pre) {
                new Promise(() => hook.call(this, context));
            }
            if (context.raw) context.ret = context.raw.apply(this, context.args);
            for (const hook of post) {
                new Promise(() => hook.call(this, context));
            }
            return context.ret;
        } as any as HookedFunction<ArgType, RetType>;
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

    static [Symbol.hasInstance]({ [flagSymbol]: is }: any) {
        return is;
    }

    /**
     * Wrap a function if it has not been, or apply more hooks otherwise
     * 
     * @returns the wrapped function
     */
    static hook<ArgType = any, RetType = any>(raw: HookedFunctionSpreadableInit<ArgType, RetType>['raw'], pre?: HookedFunctionSpreadableInit<ArgType, RetType>['pre'], post?: HookedFunctionSpreadableInit<ArgType, RetType>['post']): HookedFunction<ArgType, RetType>
    static hook<ArgType = any, RetType = any>({ raw, pre, post }: HookedFunctionSpreadableInit<ArgType, RetType>): HookedFunction<ArgType, RetType>
    static hook<ArgType = any, RetType = any>(raw: HookedFunctionSpreadableInit<ArgType, RetType> | HookedFunctionSpreadableInit<ArgType, RetType>['raw'], pre?: HookedFunctionSpreadableInit<ArgType, RetType>['pre'], post?: HookedFunctionSpreadableInit<ArgType, RetType>['post']) {
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
                    (raw as HookedFunction).pre.add(callback);
                }
            }
            if (post) {
                for (const callback of post) {
                    (raw as HookedFunction).post.add(callback);
                }
            }
            return raw;
        }

        // 2.2 otherwise => new
        else {
            return new HookedFunction(raw as RawFunction, pre, post);
        }
    }

    static dehook<ArgType = any, RetType = any>(raw: HookedFunctionSpreadableInit<ArgType, RetType>['raw']) {
        if (raw instanceof HookedFunction) {
            return (raw as HookedFunction<ArgType, RetType>).raw
        }
        else {
            return raw as RawFunction<ArgType, RetType>;
        }
    }

    /**
     * Add debugger statement hook to a function
     * 
     * @param raw function to debug.
     * @param pre (default true) add pre-hook. default true
     * @param post (default false) add post-hook. default false
     */
    static hookDebugger(raw: HookedFunctionSpreadableInit['raw'], pre = true, post = false) {
        const { debuggerFunction } = HookedFunction;
        if (raw instanceof HookedFunction) {
            (raw as HookedFunction).pre.add(debuggerFunction);
            (raw as HookedFunction).post.add(debuggerFunction);
            return raw as HookedFunction;
        }
        else {
            return new HookedFunction(raw as RawFunction, pre ? debuggerFunction : undefined, post ? debuggerFunction : undefined, );
        }
    }

    static debuggerFunction(ctx: Context) {
        debugger;
    }

    static flagSymbol = flagSymbol
}

export default HookedFunction;
