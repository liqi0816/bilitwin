/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var _a;
import { listenersDictSymbol } from './simple-event-target.js';
import SimpleEventTarget from './simple-event-target.js';
const remoteListenersMapSymbol = Symbol('remoteListenersMap');
class EventSocket extends SimpleEventTarget {
    constructor() {
        super(...arguments);
        this[_a] = new WeakMap();
        this.alive = true;
    }
    connect(target) {
        let listener = this[remoteListenersMapSymbol].get(target);
        if (!listener) {
            listener = event => {
                if (this.alive) {
                    this.dispatchEvent(event);
                }
                else {
                    target.removeEventListener(event.type, listener);
                }
            };
            this[remoteListenersMapSymbol].set(target, listener);
        }
        for (const type in this[listenersDictSymbol]) {
            target.addEventListener(type, listener);
        }
    }
    disconnect(target) {
        const listener = this[remoteListenersMapSymbol].get(target);
        if (!listener)
            return;
        this[remoteListenersMapSymbol].delete(target);
        for (const type in this[listenersDictSymbol]) {
            target.removeEventListener(type, listener);
        }
    }
    close() {
        for (const key of Object.getOwnPropertyNames(this)) {
            delete this[key];
        }
        for (const key of Object.getOwnPropertySymbols(this)) {
            delete this[key];
        }
    }
}
_a = remoteListenersMapSymbol;
export { EventSocket, remoteListenersMapSymbol };
export default EventSocket;
//# sourceMappingURL=event-socket.js.map