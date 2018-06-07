/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * The FLV merge utility is a Javascript translation of 
 * https://github.com/grepmusic/flvmerge
 * by grepmusic
*/

import FLVStream from './flv-stream.js';

class FLVOffsetStream extends TransformStream {
    constructor({ timestampOffset = 0, payloadTagsOnly = true, transformScriptData = null } = {}) {
        super({
            transform: (chunk, controller) => {
                if (chunk.tagType === 0x08 || chunk.tagType === 0x09) {
                    this.timestampMax = timestampOffset + chunk.getCombinedTimestamp();
                    chunk.setCombinedTimestamp(this.timestampMax);
                    controller.enqueue(chunk);
                }
                else {
                    if (chunk.tagType === 0x12) {
                        const { duration, durationDataView } = chunk.getDurationAndView();
                        this.duration = duration;
                        this.durationDataView = durationDataView;
                        this.scriptData = chunk;
                        if (transformScriptData) {
                            const transform = transformScriptData.call(this, chunk, controller, this);
                            if (typeof transform === 'object') {
                                if (typeof transform.timestampOffset === 'number') {
                                    timestampOffset = transform.timestampOffset;
                                }
                            }
                        }
                    }
                    if (!payloadTagsOnly) {
                        controller.enqueue(chunk);
                    }
                }
            }
        }, undefined, new CountQueuingStrategy({ highWaterMark: 1 }));

        this.timestampMax = 0;
        this.duration = 0;
        this.durationDataView = null;
        this.scriptData = null;
    }

    /**
     * 
     * @param {ReadableStream[]} streams flv tag ReadableStreams
     */
    static mergeStream(flvStreams) {
        const { readable, writable } = new TransformStream({
            start: async controller => {
                const flvOffsetStreams = [];
                let duration = 0;

                for (const flvStream of flvStreams) {
                    await new Promise(resolve => {
                        const flvOffsetStream = new FLVOffsetStream({
                            transformScriptData: chunk => {
                                const timestampOffset = duration;
                                duration += chunk.getDuration();
                                resolve();
                                return { timestampOffset };
                            }
                        })
                        flvOffsetStreams.push(flvOffsetStream);
                        flvStream.pipeThrough(flvOffsetStream);
                    })
                }

                flvOffsetStreams[0].durationDataView.setFloat64(0, duration);

                controller.enqueue(flvStreams[0].header);
                controller.enqueue(flvOffsetStreams[0].scriptData);

                (async () => {
                    for (const flvOffsetStream of flvOffsetStreams) {
                        await flvOffsetStream.readable.pipeTo(writable, { preventClose: true });
                    }
                })();
            }
        });

        return readable;
    }
}

export default FLVOffsetStream;
