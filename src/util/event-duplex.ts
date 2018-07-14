/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SimpleEventMap, CommonEventTargetInterface } from './simple-event-target.js';
import { mixinCommonEventTarget } from './simple-event-target.js';
import SimpleEventTarget from './simple-event-target.js';
import { OnSimpleEventMap, mixinOnEventTarget, OnEventTargetMixinConstructor, OnEventTargetConstructor, OnEventTargetInterface, OnEventTargetMixinInterface } from './on-event-target.js';
import OnEventTargetFactory from './on-event-target.js';
import EventSocket from './event-socket.js';
import { Constructor, PickStatic, Omit } from './common-types.js';

const inputSocketSymbol = Symbol('inputSocket');

interface EventDuplexInterface<InputEventMap extends SimpleEventMap = SimpleEventMap, OutputEventMap extends SimpleEventMap = SimpleEventMap> extends SimpleEventTarget<OutputEventMap> {
    [inputSocketSymbol]: EventSocket<InputEventMap>
    pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(this: CommonEventTargetInterface, downstream: T): T
}

type EventDuplexConstructor = typeof EventDuplex

interface EventDuplexMixinInterface<InputEventMap extends SimpleEventMap = SimpleEventMap, OutputEventMap extends SimpleEventMap = SimpleEventMap> extends CommonEventTargetInterface<OutputEventMap> {
    [inputSocketSymbol]: EventSocket<InputEventMap>
    pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(this: CommonEventTargetInterface, downstream: T): T
}

interface EventDuplexMixinConstructor<InputEventMap extends SimpleEventMap = SimpleEventMap, OutputEventMap extends SimpleEventMap = SimpleEventMap> extends Constructor<EventDuplexMixinInterface<InputEventMap, OutputEventMap>> {
    pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(upstream: CommonEventTargetInterface, downstream: T): T
}

interface mixinWithEventMap<InputEventMap extends SimpleEventMap = SimpleEventMap, OutputEventMap extends SimpleEventMap = SimpleEventMap> {
    <T extends Constructor>(target: T): EventDuplexMixinConstructor<InputEventMap, OutputEventMap> & T
}

type OnEventDuplexInterface<
    InputEventMap extends SimpleEventMap = SimpleEventMap,
    OutputEventMap extends SimpleEventMap = SimpleEventMap,
    OutOnEventMap extends OnSimpleEventMap = {}>
    = OnEventTargetInterface<OutputEventMap, OutOnEventMap> & {
        [inputSocketSymbol]: EventSocket<InputEventMap>
        pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(this: CommonEventTargetInterface, downstream: T): T
    }

interface OnEventDuplexConstructor<
    InputEventMap extends SimpleEventMap = SimpleEventMap,
    OutputEventMap extends SimpleEventMap = SimpleEventMap,
    OutOnEventMap extends OnSimpleEventMap = {}>
    extends Constructor<OnEventDuplexInterface<InputEventMap, OutputEventMap, OutOnEventMap>>,
    Omit<OnEventTargetConstructor<OutputEventMap, OutOnEventMap>, 'mixin' | 'prototype'> {
    pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(upstream: CommonEventTargetInterface, downstream: T): T
    mixin<T extends Constructor>(target: T): OnEventDuplexMixinConstructor<OutputEventMap, OutOnEventMap> & T
}

type OnEventDuplexMixinInterface<
    InputEventMap extends SimpleEventMap = SimpleEventMap,
    OutputEventMap extends SimpleEventMap = SimpleEventMap,
    OutOnEventMap extends OnSimpleEventMap = {}>
    = OnEventTargetMixinInterface<OutputEventMap, OutOnEventMap> & {
        [inputSocketSymbol]: EventSocket<InputEventMap>
        pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(this: CommonEventTargetInterface, downstream: T): T
    }

interface OnEventDuplexMixinConstructor<
    InputEventMap extends SimpleEventMap = SimpleEventMap,
    OutputEventMap extends SimpleEventMap = SimpleEventMap,
    OutOnEventMap extends OnSimpleEventMap = {}>
    extends Constructor<OnEventDuplexMixinInterface<InputEventMap, OutputEventMap, OutOnEventMap>>,
    PickStatic<OnEventTargetMixinConstructor<OutputEventMap, OutOnEventMap>> {
    pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(upstream: CommonEventTargetInterface, downstream: T): T
}

// typescript: #(duplicate method declaration) = 3
function pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(upstream: CommonEventTargetInterface, downstream: T) {
    downstream[inputSocketSymbol].connect(upstream);
    return downstream;
}

const mixinEventDuplex = function mixinEventDuplex<T extends Constructor>(target: T) {
    // 1. target does not implement CommonEventTargetInterface => mock interface
    if (!(target instanceof EventTarget)
        && (typeof (target.prototype as CommonEventTargetInterface).addEventListener !== 'function'
            || typeof (target.prototype as CommonEventTargetInterface).removeEventListener !== 'function'
            || typeof (target.prototype as CommonEventTargetInterface).dispatchEvent !== 'function')) {
        target = mixinCommonEventTarget(target);
    }

    // 2. extends target
    const prototype = EventDuplex.prototype;
    {
        class EventDuplex extends target {
            private [inputSocketSymbol] = new EventSocket()
            static pipeEventsThrough = pipeEventsThrough
        }
        (EventDuplex.prototype as any).pipeEventsThrough = prototype.pipeEventsThrough;

        return EventDuplex as Constructor<EventDuplexInterface> & T
    }
} as mixinWithEventMap;

class EventDuplex<
    InputEventMap extends SimpleEventMap = SimpleEventMap,
    OutputEventMap extends SimpleEventMap = SimpleEventMap
    > extends SimpleEventTarget<OutputEventMap> implements EventDuplexInterface<InputEventMap, OutputEventMap> {
    [inputSocketSymbol] = new EventSocket<InputEventMap>()

    // typescript: #(duplicate method declaration) = 4
    pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(this: CommonEventTargetInterface, downstream: T) {
        downstream[inputSocketSymbol].connect(this);
        return downstream;
    }

    static mixin = mixinEventDuplex
    static pipeEventsThrough = pipeEventsThrough
}

const mixinOnEventDuplex = function mixinOnEventDuplex<T extends Constructor>(this: OnEventTargetConstructor<any, any>, target: T) {
    return mixinEventDuplex(mixinOnEventTarget.call(Object.getPrototypeOf(this), target));
}

function OnEventDuplexFactory<
    InputEventMap extends SimpleEventMap = SimpleEventMap,
    OutputEventMap extends SimpleEventMap = SimpleEventMap,
    OutOnEventMap extends OnSimpleEventMap = {}
    >(init?: Iterable<keyof OutputEventMap>) {
    class OnEventDuplex extends OnEventTargetFactory(init) {
        [inputSocketSymbol] = new EventSocket<InputEventMap>()

        pipeEventsThrough<T extends { [inputSocketSymbol]: { connect(upstream: CommonEventTargetInterface): void } }>(this: CommonEventTargetInterface, downstream: T) {
            downstream[inputSocketSymbol].connect(this);
            return downstream;
        }

        static mixin = mixinOnEventDuplex

        static pipeEventsThrough = pipeEventsThrough
    }
    (OnEventDuplex.prototype as any).pipeEventsThrough = EventDuplex.prototype.pipeEventsThrough;
    return OnEventDuplex as any as OnEventDuplexConstructor<InputEventMap, OutputEventMap, OutOnEventMap>;
}

export {
    EventDuplexInterface, EventDuplexConstructor,
    EventDuplexMixinInterface, EventDuplexMixinConstructor, mixinWithEventMap,
    OnEventDuplexInterface, OnEventDuplexConstructor,
    OnEventDuplexMixinInterface, OnEventDuplexMixinConstructor
};
export { inputSocketSymbol, pipeEventsThrough, mixinEventDuplex, EventDuplex, OnEventDuplexFactory };
export default EventDuplex;
