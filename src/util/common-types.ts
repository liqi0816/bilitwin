/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Constructor type of T
 */
export interface Constructor<T = object> {
    new(...args: any[]): T
    readonly prototype: T
}

/**
 * Combined progress marking type of T
 * 
 * * null => uninitialized
 * * async pending => someone is working on it
 * * async resolve => someone just finished work
 * * sync value => someone already finished work
 */
export type AsyncOrSyncOrNull<T> = Promise<T> | T | null

/**
 * Override properties `Override` in `Original`
 * (example: { a: number } => { a: boolean })
 */
export type ForceOverride<Original, Override = {}> =
    Pick<Original, Exclude<keyof Original, keyof Override>> & Override

/**
 * Extend properties `Override` in `Original`
 * (example: { a: number } => { a: number | boolean })
 */
export type ForceExtend<Original, Extend = {}> =
    Pick<Original, Exclude<keyof Original, keyof Extend>>
    & Pick<Original | Extend, keyof Extend & keyof Original>

/**
 * Combination of `ForceOverride` and `ForceExtend`
 */
export type ForceShim<Original, Override = {}, Extend = {}> =
    Pick<Original, Exclude<keyof Original, keyof Extend | keyof Override>>
    & Pick<Original | Extend, keyof Extend & keyof Original>
    & Override

/**
 * From T omit a set of properties K
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * From a Constructor pick all static methods
 */
export type PickStatic<T extends Constructor> = Pick<T, Exclude<keyof T, 'prototype'>>

/**
 * Generate type EventMap source strings
 */
export const generateEventMapSourceString = (str: string) => {
    const events = str.split('\n').filter(e => e).map(e => {
        const trim = e.trim();
        const indexOf = trim.indexOf(':');
        return [trim.slice(0, indexOf).trim(), trim.slice(indexOf + 1).trim()];
    })
    return [
        events.map(([type, event]) => `on${type}: ${event}`).join('\n'),
        events.map(([type]) => `'${type}'`).join(', '),
        events.map(([type]) => `on${type}: CLASS_NAME["on${type}"]`).join('\n'),
        events.map(([type]) => `on${type} = null,`).join('\n'),
        events.map(([type]) => `this.on${type} = on${type};`).join('\n'),
    ].join('\n\n========\n\n');
}
