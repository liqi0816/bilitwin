/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var _a;
const listenersDictSymbol = Symbol('listenersDict');
const mixinCommonEventTarget = function mixinCommonEventTarget(target) {
    var _a;
    const prototype = SimpleEventTarget.prototype;
    {
        class SimpleEventTarget extends target {
            constructor() {
                super(...arguments);
                this[_a] = {};
            }
        }
        _a = listenersDictSymbol;
        SimpleEventTarget.prototype.addEventListener = prototype.addEventListener;
        SimpleEventTarget.prototype.removeEventListener = prototype.removeEventListener;
        SimpleEventTarget.prototype.dispatchEvent = prototype.dispatchEvent;
        return SimpleEventTarget;
    }
};
class SimpleEventTarget {
    constructor() {
        this[_a] = {};
    }
    addEventListener(type, listener, options) {
        if (!listener)
            return;
        // 1. new type of event => create new listeners list
        if (!this[listenersDictSymbol][type]) {
            this[listenersDictSymbol][type] = new Set();
            this[listenersDictSymbol][type].onceListeners = new Set();
        }
        // 2. retreive listeners list of that type
        const listenersList = this[listenersDictSymbol][type];
        // 3. add to store
        listenersList.add(listener);
        // 4. once => add to once list store
        if (typeof options === 'object' && options.once) {
            listenersList.onceListeners.add(listener);
        }
    }
    removeEventListener(type, listener) {
        if (!listener)
            return;
        const listenersList = this[listenersDictSymbol][type];
        if (listenersList) {
            listenersList.delete(listener);
            listenersList.onceListeners.delete(listener);
        }
    }
    dispatchEvent(event) {
        // 1. retreive listeners set of that type 
        const { type } = event;
        // 2. retreive listeners list of that type
        const listenersList = this[listenersDictSymbol][type];
        // 3. iter through all listeners
        if (listenersList) {
            for (const listener of listenersList) {
                // 3.1 create a separate error stack
                // use Promise instead of try-catch to preserve pause on exception functionality
                // use void to explictly free memory
                void new Promise(() => listener.call(this, event));
            }
            for (const listener of listenersList.onceListeners) {
                // 3.2 remove once listeners
                listenersList.delete(listener);
            }
            // 3.3 empty once listener list
            listenersList.onceListeners = new Set();
        }
        return true;
    }
    getEventListeners(type) {
        return this[listenersDictSymbol][type];
    }
    copyEventListenersFrom(target) {
        if (typeof target[listenersDictSymbol] !== 'object') {
            throw new TypeError('copyEventListenersFrom: target is not compatible');
        }
        for (const type in target[listenersDictSymbol]) {
            // 1. new type of event => create new listeners list
            if (!this[listenersDictSymbol][type]) {
                this[listenersDictSymbol][type] = new Set();
                this[listenersDictSymbol][type].onceListeners = new Set();
            }
            // 2. retreive listeners list of that type
            const targetListenerList = target[listenersDictSymbol][type];
            const listenersList = this[listenersDictSymbol][type];
            // 3. add to store
            for (const listener of targetListenerList) {
                listenersList.add(listener);
            }
            // 4. once => add to once list store
            for (const listener of targetListenerList.onceListeners) {
                listenersList.onceListeners.add(listener);
            }
        }
    }
    pasteEventListenersTo(target) {
        for (const type in this[listenersDictSymbol]) {
            // 1. retreive listeners list of that type
            const listenersList = this[listenersDictSymbol][type];
            // 2. once => add once listener
            for (const listener of listenersList.onceListeners) {
                target.addEventListener(type, listener, { once: true });
            }
            // 3. otherwise => add listener
            for (const listener of listenersList) {
                if (!listenersList.onceListeners.has(listener)) {
                    target.addEventListener(type, listener);
                }
            }
        }
    }
    removeDuplicatteEventListenersFrom(target) {
        for (const type in this[listenersDictSymbol]) {
            // 1. retreive listeners list of that type
            const listenersList = this[listenersDictSymbol][type];
            // 2. remove
            for (const listener of listenersList) {
                target.removeEventListener(type, listener);
            }
        }
    }
}
_a = listenersDictSymbol;
SimpleEventTarget.mixin = mixinCommonEventTarget;
export { SimpleEventTarget, mixinCommonEventTarget, listenersDictSymbol };
export default SimpleEventTarget;
//# sourceMappingURL=simple-event-target.js.map