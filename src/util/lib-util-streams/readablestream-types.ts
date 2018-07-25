/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TransformStream } from './transformstream-types.js';
import { WritableStream } from './writablestream-types.js';
import { BuiltinReadableStream } from './builtin-namespace-wrapper.js';

export interface PipeOptions {
    preventClose?: boolean
    preventAbort?: boolean
    preventCancel?: boolean
}

export interface ReadableStream extends BuiltinReadableStream {
    pipeThrough(transformStream: TransformStream, options?: PipeOptions): ReadableStream
    pipeTo(destination: WritableStream, options?: PipeOptions): Promise<void>
    tee(): [ReadableStream, ReadableStream]
}

export interface ReadableStreamDefaultController {
    desiredSize: number
    enqueue(chunk: any): void
    error(reason: any): void
    close(): void
}

export interface UnderlyingSource {
    start?(controler: ReadableStreamDefaultController): void
    pull?(controller: ReadableStreamDefaultController): void
    cancel?(reason: any): void
}

export interface ReadableStreamConstructor {
    prototype: ReadableStream;
    new(source?: UnderlyingSource, strategy?: QueuingStrategy): ReadableStream;
}

export default ReadableStreamConstructor
