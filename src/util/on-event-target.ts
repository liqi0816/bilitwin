/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SimpleEvent, SimpleEventListener, SimpleEventMap, CommonEventTargetInterface } from './simple-event-target.js';
import { SimpleEventTarget, mixinCommonEventTarget, } from './simple-event-target.js';
import { Constructor } from './common-types.js';

export interface OnSimpleEventMap {
    [onevent: string]: SimpleEvent
}

export type OnSimpleEventListenerMap<OnEventMap = {}> = {
    [onevent in keyof OnEventMap]: SimpleEventListener<OnEventMap[onevent]> | null
}

export type OnEventTargetInterface<EventMap extends SimpleEventMap = SimpleEventMap, OnEventMap extends OnSimpleEventMap = {}>
    = SimpleEventTarget<EventMap> & OnSimpleEventListenerMap<OnEventMap>

export interface OnEventTargetConstructor<EventMap extends SimpleEventMap = SimpleEventMap, OnEventMap extends OnSimpleEventMap = {}> extends Constructor<OnEventTargetInterface<EventMap, OnEventMap>> {
    readonly eventList: ReadonlyArray<string>
    asyncOnce(target: CommonEventTargetInterface, name: string, errorName?: string): Promise<SimpleEvent>
    asyncOnce<T>(target: CommonEventTargetInterface, name: string, errorName: string, bind: T): Promise<T>
    mixin<EventMap extends SimpleEventMap, OnEventMap extends OnSimpleEventMap, T extends Constructor>(this: OnEventTargetConstructor<EventMap, OnEventMap>, target: T): OnEventTargetMixinConstructor<EventMap, OnEventMap> & T
}

export type OnEventTargetMixinInterface<EventMap extends SimpleEventMap = SimpleEventMap, OnEventMap extends OnSimpleEventMap = {}>
    = CommonEventTargetInterface<EventMap> & OnSimpleEventListenerMap<OnEventMap>

export interface OnEventTargetMixinConstructor<EventMap extends SimpleEventMap = SimpleEventMap, OnEventMap extends OnSimpleEventMap = {}> extends Constructor<OnEventTargetMixinInterface<EventMap, OnEventMap>> {
    asyncOnce(target: CommonEventTargetInterface, name: string, errorName?: string): Promise<SimpleEvent>
    asyncOnce<T>(target: CommonEventTargetInterface, name: string, errorName: string, bind: T): Promise<T>
}

/**
 * Promisify a one-time event listener
 * 
 * @param target event target
 * @param name name of event
 * @param errorName (default 'error') name of error event
 * @param bind (default Event) customized resolve value of Promise
 * @returns a Promise that resolves when the specific event fires
 */
// typescript: #(duplicate method declaration) = 2 * 2
function asyncOnce(target: CommonEventTargetInterface, name: string, errorName?: string): Promise<SimpleEvent>
function asyncOnce<T>(target: CommonEventTargetInterface, name: string, errorName: string, bind: T): Promise<T>
function asyncOnce<T>(target: CommonEventTargetInterface, name: string, errorName: string = 'error', bind?: T) {
    return new Promise((resolve, reject) => {
        const once = { once: true };
        const _resolve = (e: SimpleEvent) => {
            resolve(bind === undefined ? e : bind);
            if (errorName) target.removeEventListener(errorName, _reject);
        };
        const _reject = (e: SimpleEvent) => {
            reject(e);
            target.removeEventListener(name, _resolve);
        };
        target.addEventListener(name, resolve, once);
        if (errorName) target.addEventListener(errorName, reject, once);
    });
};

/**
 * mix OnEventTarget features into a target class
 * @param target the target class to mix
 * @returns the mixed class
 */
// typescript: #(duplicate method declaration) = 1 (renamed to `mixin`)
function mixinOnEventTarget<EventMap extends SimpleEventMap, OnEventMap extends OnSimpleEventMap, T extends Constructor>(this: OnEventTargetConstructor<EventMap, OnEventMap>, target: T) {
    // 1. target does not implement CommonEventTargetInterface => mock interface
    if (!(target instanceof EventTarget)
        && (typeof (target.prototype as CommonEventTargetInterface).addEventListener !== 'function'
            || typeof (target.prototype as CommonEventTargetInterface).removeEventListener !== 'function'
            || typeof (target.prototype as CommonEventTargetInterface).dispatchEvent !== 'function')) {
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
        static asyncOnce = asyncOnce
    }

    // 3. add `on[name]` handlers
    const prototype = Object.getOwnPropertyDescriptors(this.prototype);
    (prototype.constructor as any) = {};
    Object.defineProperties(OnEventTarget.prototype, prototype);

    return OnEventTarget as any as OnEventTargetMixinConstructor<EventMap, OnEventMap> & T;
}

/**
 * Create an OnEventTarget class with specific `on[name]` handlers
 * 
 * @param init (default undefined) a list of names that
 * you want to have `on[name]` handlers, or a falsy value
 */
function OnEventTargetFactory<EventMap extends SimpleEventMap = SimpleEventMap, OnEventMap extends OnSimpleEventMap = {}>(init?: Iterable<keyof EventMap>) {
    // 1. extends EventTarget
    /**
     * A wrapper of the EventTarget interface in browsers.
     * 
     * - create standalone EventTarget with `on[name]` handlers
     * - promisify one-time listeners with error propagation
     * - mix OnEventTarget functions into another object
     */
    class OnEventTarget extends SimpleEventTarget {
        static readonly eventList: ReadonlyArray<string>
        static asyncOnce = asyncOnce
        static mixin = mixinOnEventTarget
    }

    // 2. add `on[name]` handlers
    if (!init) {
        Object.defineProperty(OnEventTarget, 'eventList', { value: Object.freeze([]) });
    }
    else if (init[Symbol.iterator]) {
        Object.defineProperty(OnEventTarget, 'eventList', { value: Object.freeze([...init]) });
        for (const name of init) {
            const i = Symbol(`on${name}`);
            (OnEventTarget.prototype as any)[i] = null;
            Object.defineProperty(OnEventTarget.prototype, `on${name}`, {
                get() {
                    return (this as any)[i];
                },
                set(e) {
                    if (typeof e !== 'function') e = null;
                    this.removeEventListener(name, (this as any)[i]);
                    this.addEventListener(name, e);
                    (this as any)[i] = e;
                },
            });
        }
    }
    else {
        throw new TypeError(`OnEventTargetFactory: parameter 0 expect falsy value or Iterable<string> but get ${init}`);
    }

    // 3. return new class
    return OnEventTarget as any as OnEventTargetConstructor<EventMap, OnEventMap>;
}

/**
 * A sample usage of OnEventTarget.mixin
 * Creates an array that fires 'push' event when push is called
 */
class PushEventArray<T> extends OnEventTargetFactory<{ push: SimpleEvent }, { onpush: SimpleEvent }>(['push']).mixin(Array) {
    /**
     * will fire CustomEvent<typeof args> when called
     * @param args will be passed to super.push
     */
    push(...args: T[]) {
        this.dispatchEvent(new CustomEvent('push', { detail: args }));
        return super.push(...args);
    }
}

export { asyncOnce, mixinOnEventTarget, OnEventTargetFactory, PushEventArray };
export default OnEventTargetFactory;
