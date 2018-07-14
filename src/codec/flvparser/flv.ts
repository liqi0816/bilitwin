/* 
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
 * by grepmusic */

import TwentyFourDataView from '../../util/twenty-four-dataview.js';
import FLVTag from './flv-tag.js';

/** 
 * A simple flv parser
 */
class FLV {
    header: TwentyFourDataView
    firstPreviousTagSize: TwentyFourDataView
    tags: FLVTag[]

    constructor(dataView: DataView) {
        if (dataView.getUint32(0) >> 8 !== 0x464C56) {
            throw new TypeError(`FLV construtor: FLV header signature should be 'FLV' but get ${dataView.getUint8(0)},${dataView.getUint8(1)},${dataView.getUint8(2)}`);
        }
        this.header = new TwentyFourDataView(dataView.buffer, dataView.byteOffset, 9);
        this.firstPreviousTagSize = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + 9, 4);

        this.tags = [];
        let offset = this.headerLength + 4;
        while (offset < dataView.byteLength) {
            const tag = new FLVTag(dataView, offset);
            // debug anchor for inspecting scrpit data tag
            // if (tag.tagType !== 0x08 && tag.tagType !== 0x09) { debugger }
            offset += 11 + tag.dataSize + 4;
            this.tags.push(tag);
        }

        if (offset !== dataView.byteLength) throw new Error(`FLV construtor: final offset should equal dataView.byteLength but get offset ${offset} !== byteLength ${dataView.byteLength}`);
    }

    get type() {
        return 'FLV';
    }

    get version() {
        return this.header.getUint8(3);
    }

    get typeFlag() {
        return this.header.getUint8(4);
    }

    get headerLength() {
        return this.header.getUint32(5);
    }

    static merge(flvs: Iterable<FLV>) {
        if (!flvs[Symbol.iterator]) throw new TypeError(`FLV.merge: parameter flvs expect Iterable<FLV> but get ${flvs}`);
        let blobParts = [];
        let basetimestamp = [0, 0];
        let lasttimestamp = [0, 0];
        let duration = 0.0;
        let durationDataView: TwentyFourDataView;


        for (let flv of flvs) {
            let bts = duration * 1000;
            basetimestamp[0] = lasttimestamp[0];
            basetimestamp[1] = lasttimestamp[1];
            bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
            let foundDuration = 0;
            for (let tag of flv.tags) {
                if (tag.tagType === 0x12 && !foundDuration) {
                    duration += tag.getDuration();
                    foundDuration = 1;
                    if (blobParts.length === 0) {
                        blobParts.push(flv.header, flv.firstPreviousTagSize);
                        ({ duration, durationDataView } = tag.getDurationAndView());
                        tag.stripKeyframesScriptData();
                        blobParts.push(tag.tagHeader);
                        blobParts.push(tag.tagData);
                        blobParts.push(tag.previousSize);
                    }
                }
                else if (tag.tagType === 0x08 || tag.tagType === 0x09) {
                    lasttimestamp[tag.tagType - 0x08] = bts + tag.getCombinedTimestamp();
                    tag.setCombinedTimestamp(lasttimestamp[tag.tagType - 0x08]);
                    blobParts.push(tag.tagHeader);
                    blobParts.push(tag.tagData);
                    blobParts.push(tag.previousSize);
                }
            }
        }
        durationDataView!.setFloat64(0, duration);

        return new Blob(blobParts);
    }

    static async mergeBlobs(blobs: Iterable<Blob>) {
        // Blobs can be swapped to disk, while Arraybuffers can not.
        // This is a RAM saving workaround. Somewhat.
        if (!blobs[Symbol.iterator]) throw new TypeError(`FLV.mergeBlobs: parameter blobs expect Iterable<Blob> but get ${blobs}`);
        let ret = [];
        let basetimestamp = [0, 0];
        let lasttimestamp = [0, 0];
        let duration = 0.0;
        let durationDataView: TwentyFourDataView;

        for (let blob of blobs) {
            let bts = duration * 1000;
            basetimestamp[0] = lasttimestamp[0];
            basetimestamp[1] = lasttimestamp[1];
            bts = Math.max(bts, basetimestamp[0], basetimestamp[1]);
            let foundDuration = 0;

            let flv = await new Promise<FLV>((resolve, reject) => {
                let fr = new FileReader();
                fr.onload = () => resolve(new FLV(new TwentyFourDataView(fr.result)));
                fr.readAsArrayBuffer(blob);
                fr.onerror = reject;
            });

            let modifiedMediaTags = [];
            for (let tag of flv.tags) {
                if (tag.tagType === 0x12 && !foundDuration) {
                    duration += tag.getDuration();
                    foundDuration = 1;
                    if (ret.length === 0) {
                        ret.push(flv.header, flv.firstPreviousTagSize);
                        ({ duration, durationDataView } = tag.getDurationAndView());
                        tag.stripKeyframesScriptData();
                        ret.push(tag.tagHeader);
                        ret.push(tag.tagData);
                        ret.push(tag.previousSize);
                    }
                }
                else if (tag.tagType === 0x08 || tag.tagType === 0x09) {
                    lasttimestamp[tag.tagType - 0x08] = bts + tag.getCombinedTimestamp();
                    tag.setCombinedTimestamp(lasttimestamp[tag.tagType - 0x08]);
                    modifiedMediaTags.push(tag.tagHeader, tag.tagData, tag.previousSize);
                }
            }
            ret.push(new Blob(modifiedMediaTags));
        }
        durationDataView!.setFloat64(0, duration);

        return new Blob(ret);
    }
}

export default FLV;
