/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constructor } from './common-types.js';

const listenersDictSymbol = Symbol('listenersDict');

export interface SimpleBareEvent {
    type: string
}

export interface SimpleEvent extends SimpleBareEvent {
    [payload: string]: any
}

export interface SimpleCustomEvent<T> extends SimpleEvent {
    type: string
    detail: T
}

export interface SimpleEventListener<EventType = SimpleEvent> {
    (event: EventType): void
}

export interface SimpleEventTargetListenersList<EventType = SimpleEvent> extends Set<SimpleEventListener<EventType>> {
    onceListeners: Set<SimpleEventListener<EventType>>
}

export interface SimpleEventMap {
    [type: string]: SimpleEvent
}

export interface CommonEventTargetInterface<EventMap extends SimpleEventMap = SimpleEventMap> {
    addEventListener<Type extends string>(type: Type, listener: SimpleEventListener<EventMap[Type]> | null, options?: { once?: boolean }): void
    removeEventListener<Type extends string>(type: Type, listener: SimpleEventListener<EventMap[Type]> | null): void
    dispatchEvent(event: SimpleEvent): boolean
}

export interface IndexedEventTargetInterface {
    [listenersDictSymbol]: {
        [type: string]: SimpleEventTargetListenersList
    }
}

export interface mixinWithEventMap<EventMap extends SimpleEventMap = SimpleEventMap> {
    <T extends Constructor>(target: T): Constructor<CommonEventTargetInterface<EventMap>> & T
}

export type SimpleEventTargetConstructor = typeof SimpleEventTarget

const mixinCommonEventTarget = function mixinCommonEventTarget<T extends Constructor>(target: T) {
    const prototype = SimpleEventTarget.prototype;
    {
        class SimpleEventTarget extends target {
            private [listenersDictSymbol]: {
                [type: string]: SimpleEventTargetListenersList
            } = {}
        }
        (SimpleEventTarget.prototype as CommonEventTargetInterface).addEventListener = prototype.addEventListener;
        (SimpleEventTarget.prototype as CommonEventTargetInterface).removeEventListener = prototype.removeEventListener;
        (SimpleEventTarget.prototype as CommonEventTargetInterface).dispatchEvent = prototype.dispatchEvent;

        return SimpleEventTarget as Constructor<CommonEventTargetInterface> & T;
    }
} as mixinWithEventMap;

class SimpleEventTarget<EventMap extends SimpleEventMap = SimpleEventMap> implements IndexedEventTargetInterface, CommonEventTargetInterface {
    [listenersDictSymbol]: { [type: string]: SimpleEventTargetListenersList } = {}

    addEventListener<Type extends string>(type: Type, listener: SimpleEventListener<EventMap[Type]> | null, options?: { once?: boolean }) {
        if (!listener) return;

        // 1. new type of event => create new listeners list
        if (!this[listenersDictSymbol][type]) {
            this[listenersDictSymbol][type] = new Set() as SimpleEventTargetListenersList;
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

    removeEventListener<Type extends string>(type: Type, listener: SimpleEventListener<EventMap[Type]> | null) {
        if (!listener) return;

        const listenersList = this[listenersDictSymbol][type];

        if (listenersList) {
            listenersList.delete(listener);
            listenersList.onceListeners.delete(listener);
        }
    }

    dispatchEvent(event: SimpleEvent) {
        // 1. retreive listeners set of that type 
        const { type } = event;

        // 2. retreive listeners list of that type
        const listenersList = this[listenersDictSymbol][type];

        // 3. listeners exist => trigger all listeners
        if (listenersList) {
            // 3.1 iter through all listeners
            for (const listener of listenersList) {
                // create a separate error stack
                // use Promise instead of try-catch to preserve pause on exception functionality
                new Promise(() => listener.call(this, event));
            }

            // 3.2 once listeners exist => remove once listeners
            if (listenersList.onceListeners.size) {
                // 3.2.1 remove once listeners
                for (const listener of listenersList.onceListeners) {
                    listenersList.delete(listener);
                }

                // 3.2.2 empty once listener list
                listenersList.onceListeners = new Set();
            }
        }

        return true;
    }

    getEventListeners(type: string) {
        return this[listenersDictSymbol][type];
    }

    copyEventListenersFrom(target: IndexedEventTargetInterface) {
        if (typeof target[listenersDictSymbol] !== 'object') {
            throw new TypeError('copyEventListenersFrom: target is not compatible');
        }

        for (const type in target[listenersDictSymbol]) {
            // 1. new type of event => create new listeners list
            if (!this[listenersDictSymbol][type]) {
                this[listenersDictSymbol][type] = new Set() as SimpleEventTargetListenersList;
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

    pasteEventListenersTo(target: { addEventListener: CommonEventTargetInterface['addEventListener'] }) {
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

    removeDuplicatteEventListenersFrom(target: { removeEventListener: CommonEventTargetInterface['removeEventListener'] }) {
        for (const type in this[listenersDictSymbol]) {
            // 1. retreive listeners list of that type
            const listenersList = this[listenersDictSymbol][type];

            // 2. remove
            for (const listener of listenersList) {
                target.removeEventListener(type, listener);
            }
        }
    }

    static mixin = mixinCommonEventTarget;
}

export { SimpleEventTarget, mixinCommonEventTarget, listenersDictSymbol };
export default SimpleEventTarget;
