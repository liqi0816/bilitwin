/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var _a;
import { mixinCommonEventTarget } from './simple-event-target.js';
import SimpleEventTarget from './simple-event-target.js';
import { mixinOnEventTarget } from './on-event-target.js';
import OnEventTargetFactory from './on-event-target.js';
import EventSocket from './event-socket.js';
const inputSocketSymbol = Symbol('inputSocket');
// typescript: #(duplicate method declaration) = 3
function pipeEventsThrough(upstream, downstream) {
    downstream[inputSocketSymbol].connect(upstream);
    return downstream;
}
const mixinEventDuplex = function mixinEventDuplex(target) {
    var _a;
    // 1. target does not implement CommonEventTargetInterface => mock interface
    if (!(target instanceof EventTarget)
        && (typeof target.prototype.addEventListener !== 'function'
            || typeof target.prototype.removeEventListener !== 'function'
            || typeof target.prototype.dispatchEvent !== 'function')) {
        target = mixinCommonEventTarget(target);
    }
    // 2. extends target
    const prototype = EventDuplex.prototype;
    {
        class EventDuplex extends target {
            constructor() {
                super(...arguments);
                this[_a] = new EventSocket();
            }
        }
        _a = inputSocketSymbol;
        EventDuplex.pipeEventsThrough = pipeEventsThrough;
        EventTarget.prototype.pipeEventsThrough = prototype.pipeEventsThrough;
        return EventDuplex;
    }
};
class EventDuplex extends SimpleEventTarget {
    constructor() {
        super(...arguments);
        this[_a] = new EventSocket();
    }
    // typescript: #(duplicate method declaration) = 4
    pipeEventsThrough(downstream) {
        downstream[inputSocketSymbol].connect(this);
        return downstream;
    }
}
_a = inputSocketSymbol;
EventDuplex.mixin = mixinEventDuplex;
EventDuplex.pipeEventsThrough = pipeEventsThrough;
const mixinOnEventDuplex = function mixinOnEventDuplex(target) {
    return mixinEventDuplex(mixinOnEventTarget.call(Object.getPrototypeOf(this), target));
};
function OnEventDuplexFactory(init) {
    var _a;
    class OnEventDuplex extends OnEventTargetFactory(init) {
        constructor() {
            super(...arguments);
            this[_a] = new EventSocket();
        }
        pipeEventsThrough(downstream) {
            downstream[inputSocketSymbol].connect(this);
            return downstream;
        }
    }
    _a = inputSocketSymbol;
    OnEventDuplex.mixin = mixinOnEventDuplex;
    OnEventDuplex.pipeEventsThrough = pipeEventsThrough;
    OnEventDuplex.prototype.pipeEventsThrough = EventDuplex.prototype.pipeEventsThrough;
    return OnEventDuplex;
}
export { inputSocketSymbol, pipeEventsThrough, mixinEventDuplex, EventDuplex, OnEventDuplexFactory };
export default EventDuplex;
Object.assign(window, { inputSocketSymbol, pipeEventsThrough, mixinEventDuplex, EventDuplex, OnEventDuplexFactory });
//# sourceMappingURL=event-duplex.js.map