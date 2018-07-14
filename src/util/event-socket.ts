/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SimpleEventMap, CommonEventTargetInterface, SimpleEventListener, SimpleEventTargetListenersList } from './simple-event-target.js';
import { listenersDictSymbol } from './simple-event-target.js';
import SimpleEventTarget from './simple-event-target.js';

const remoteListenersMapSymbol = Symbol('remoteListenersMap');

class EventSocket<InputEventMap extends SimpleEventMap = SimpleEventMap> extends SimpleEventTarget<InputEventMap> {
    [remoteListenersMapSymbol] = new WeakMap<CommonEventTargetInterface, SimpleEventListener>()
    alive = true

    addEventType<Type extends string>(...types: Type[]) {
        for (const type of types) {
            if (!this[listenersDictSymbol][type]) {
                this[listenersDictSymbol][type] = new Set() as SimpleEventTargetListenersList;
                this[listenersDictSymbol][type].onceListeners = new Set();
            }
        }
    }

    connect(target: CommonEventTargetInterface) {
        let listener = this[remoteListenersMapSymbol].get(target);
        if (!listener) {
            listener = event => {
                if (this.alive) {
                    this.dispatchEvent(event);
                }
                else {
                    target.removeEventListener(event.type, listener!)
                }
            }
            this[remoteListenersMapSymbol].set(target, listener);
        }
        for (const type in this[listenersDictSymbol]) {
            target.addEventListener(type, listener);
        }
    }

    disconnect(target: CommonEventTargetInterface) {
        const listener = this[remoteListenersMapSymbol].get(target);
        if (!listener) return;
        this[remoteListenersMapSymbol].delete(target);
        for (const type in this[listenersDictSymbol]) {
            target.removeEventListener(type, listener);
        }
    }

    close() {
        for (const key of Object.getOwnPropertyNames(this)) {
            delete this[key as keyof this];
        }
        for (const key of Object.getOwnPropertySymbols(this)) {
            delete this[key as keyof this];
        }
    }
}

export { EventSocket, remoteListenersMapSymbol }
export default EventSocket
