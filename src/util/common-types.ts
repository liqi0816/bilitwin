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
interface Constructor<T = object> {
    new(...args: any[]): T
    readonly prototype: T
}

/**
 * Override properties `Override` in `Original`
 * (example: { a: number } => { a: boolean })
 */
type ForceOverride<Original, Override = {}> =
    Pick<Original, Exclude<keyof Original, keyof Override>> & Override

/**
 * Extend properties `Override` in `Original`
 * (example: { a: number } => { a: number | boolean })
 */
type ForceExtend<Original, Extend = {}> =
    Pick<Original, Exclude<keyof Original, keyof Extend>>
    & Pick<Original | Extend, keyof Extend & keyof Original>

/**
 * Combination of `ForceOverride` and `ForceExtend`
 */
type ForceShim<Original, Override = {}, Extend = {}> =
    Pick<Original, Exclude<keyof Original, keyof Extend | keyof Override>>
    & Pick<Original | Extend, keyof Extend & keyof Original>
    & Override

/**
 * From T omit a set of properties K
 */
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * From a Constructor pick all static methods
 */
type PickStatic<T extends Constructor> = Pick<T, Exclude<keyof T, 'prototype'>>

export { Constructor, ForceOverride, ForceExtend, ForceShim, PickStatic, Omit };
