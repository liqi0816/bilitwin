/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import TransformStreamConstructor from '../../util/lib-util-streams/transformstream-types.js';
declare const TransformStream: TransformStreamConstructor

/**
 * A TransformStream to offset flv timestamps
 * IN: ...tag objects (script tag, audio tag and video tag) piped to writeableStream
 * OUT: ...tag objects (script tag, audio tag and video tag) as readableStream
 * OUT2: ...tag DataView as readableStream
 */
class FLVOffsetStream extends TransformStream {
    timestampMax: number
    duration: number
    scriptData: Uint8Array | null

    constructor({ timestampOffset = 0, mediaTagsOnly = true, outputBinary = false } = {}, writableStrategy?: QueuingStrategy, readableStrategy?: QueuingStrategy) {
        super({
            transform: outputBinary ?
                (tag, controller) => {
                    if (tag.tagType === 0x08 || tag.tagType === 0x09) {
                        this.timestampMax = tag.getCombinedTimestamp();
                        tag.setCombinedTimestamp(this.timestampMax + timestampOffset);
                        controller.enqueue(tag.tagHeader);
                        controller.enqueue(tag.tagData);
                        controller.enqueue(tag.previousSize);
                    }
                    else {
                        if (tag.tagType === 0x12) {
                            this.duration = tag.getDuration();
                            this.scriptData = tag;
                        }
                        if (!mediaTagsOnly) {
                            controller.enqueue(tag.tagHeader);
                            controller.enqueue(tag.tagData);
                            controller.enqueue(tag.previousSize);
                        }
                    }
                } :
                (tag, controller) => {
                    if (tag.tagType === 0x08 || tag.tagType === 0x09) {
                        this.timestampMax = tag.getCombinedTimestamp();
                        tag.setCombinedTimestamp(this.timestampMax + timestampOffset);
                        controller.enqueue(tag);
                    }
                    else {
                        if (tag.tagType === 0x12) {
                            this.duration = tag.getDuration();
                            this.scriptData = tag;
                        }
                        if (!mediaTagsOnly) {
                            controller.enqueue(tag);
                        }
                    }
                }
        }, writableStrategy, readableStrategy);

        this.timestampMax = 0;
        this.duration = 0;
        this.scriptData = null;
    }


    /**
     * 
     * @param flvStreams flv tag ReadableStreams
     * @param strategies writableStrategy = {}, readableStrategy = {}
     */
    static mergeStream(flvStreams: ReadableStream[], writableStrategy?: QueuingStrategy, readableStrategy?: QueuingStrategy) {
        const { readable, writable } = new TransformStream({
            start: async controller => {
                let duration = 0;
                let scriptData = null;
                const flvOffsetStreams = [];

                // 1. extract correct settings from scriptdata tag for each stream
                for (const flvStream of flvStreams) {
                    // 1.1 read the first tag from stream (expected to be script tag)
                    const reader = flvStream.getReader();
                    const { value } = await reader.read();
                    reader.releaseLock();

                    // 1.2 find a scriptdata tag template
                    if (!scriptData) scriptData = value;

                    // 1.3 accumlate duration and compute offset
                    const timestampOffset = duration * 1000;
                    duration += value.getDuration();

                    // 1.4 create offset stream pipe
                    const flvOffsetStream = new FLVOffsetStream({ timestampOffset, outputBinary: true });
                    flvOffsetStreams.push(flvOffsetStream);
                    (flvStream as any).pipeTo(flvOffsetStream.writable);
                }

                // 2. output flv.header + flv.firstPreviousTagSize
                controller.enqueue(new Uint8Array([70, 76, 86, 1, 5, 0, 0, 0, 9, 0, 0, 0, 0]));

                // 3. output scriptData
                // 3.1 set correct duration
                scriptData.getDurationAndView().durationDataView.setFloat64(0, duration);

                // 3.2 remove keyframe section
                scriptData.stripKeyframesScriptData();

                // 3.3 output everything
                controller.enqueue(scriptData.tagHeader);
                controller.enqueue(scriptData.tagData);
                controller.enqueue(scriptData.previousSize);

                // 4. create continious pipeline
                // BAD Programming. Error not propagated.
                (async () => {
                    for (const flvOffsetStream of flvOffsetStreams) {
                        await (flvOffsetStream.readable as any).pipeTo(writable, { preventClose: true });
                    }
                    writable.getWriter().close();
                })().catch(controller.error.bind(controller));
            }
        }, writableStrategy, readableStrategy);

        return readable;
    }
}

export default FLVOffsetStream;
