/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface UnderlyingSink {
    start?: WritableStreamDefaultControllerCallback
    write?: WritableStreamChunkCallback
    close?: WritableStreamDefaultControllerCallback
    abort?: WritableStreamErrorCallback
}

const WritableStream1 = WritableStream as typeof WritableStream & {
    new(underlyingSink?: UnderlyingSink, strategy?: QueuingStrategy): WritableStream;
}
export { WritableStream1 as WritableStream }

export default WritableStream1;
