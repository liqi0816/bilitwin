/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReadableStream } from './readablestream-types.js';
import { WritableStream } from './writablestream-types.js';

export interface TransformStream {
    readable: ReadableStream
    writable: WritableStream
}

export interface TransformStreamDefaultController {
    desiredSize: number
    enqueue(chunk: any): void
    error(reason: any): void
    terminate(): void
}

export interface Transformer {
    start?(controller: TransformStreamDefaultController): void
    transform?(chunk: any, controller: TransformStreamDefaultController): void
    flush?(controller: TransformStreamDefaultController): void
}

export interface TransformStreamConstructor {
    prototype: TransformStream
    new(transformer?: Transformer, writableStrategy?: QueuingStrategy, readableStrategy?: QueuingStrategy): TransformStream
}

export default TransformStreamConstructor
