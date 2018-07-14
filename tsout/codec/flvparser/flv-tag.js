/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import TwentyFourDataView from '../../util/twenty-four-dataview.js';
class FLVTag {
    constructor(dataView, currentOffset = 0) {
        this.tagHeader = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset, 11);
        this.tagData = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset + 11, this.dataSize);
        this.previousSize = new TwentyFourDataView(dataView.buffer, dataView.byteOffset + currentOffset + 11 + this.dataSize, 4);
    }
    get tagType() {
        return this.tagHeader.getUint8(0);
    }
    get dataSize() {
        return this.tagHeader.getUint24(1);
    }
    get timestamp() {
        return this.tagHeader.getUint24(4);
    }
    get timestampExtension() {
        return this.tagHeader.getUint8(7);
    }
    get streamID() {
        return this.tagHeader.getUint24(8);
    }
    stripKeyframesScriptData() {
        if (this.tagType !== 0x12)
            throw new TypeError(`getDurationAndView: this.tagType should be 0x12 (ScriptData type) but get ${this.tagType}`);
        const anchorIndex = this.tagData.indexOfSubArray('hasKeyframes\x01');
        if (anchorIndex === -1)
            return;
        //0x0101 => 0x0100
        const index = anchorIndex + 13;
        this.tagData.setUint8(index, 0x00);
    }
    getDuration() {
        if (this.tagType !== 0x12)
            throw new TypeError(`getDurationAndView: this.tagType should be 0x12 (ScriptData type) but get ${this.tagType}`);
        const anchorIndex = this.tagData.indexOfSubArray('duration\x00');
        if (anchorIndex === -1)
            throw new Error('getDurationAndView: cannot find duration metainfo section');
        const index = anchorIndex + 9;
        return this.tagData.getFloat64(index);
    }
    getDurationAndView() {
        if (this.tagType !== 0x12)
            throw new TypeError(`getDurationAndView: this.tagType should be 0x12 (ScriptData type) but get ${this.tagType}`);
        const anchorIndex = this.tagData.indexOfSubArray('duration\x00');
        if (anchorIndex === -1)
            throw new Error('getDurationAndView: cannot find duration metainfo section');
        const index = anchorIndex + 9;
        return {
            duration: this.tagData.getFloat64(index),
            durationDataView: new TwentyFourDataView(this.tagData.buffer, this.tagData.byteOffset + index, 8)
        };
    }
    getCombinedTimestamp() {
        return (this.timestampExtension << 24 | this.timestamp);
    }
    setCombinedTimestamp(timestamp) {
        if (timestamp < 0)
            throw new RangeError(`setCombinedTimestamp: parameter timestamp should be non-negative but get ${timestamp}`);
        this.tagHeader.setUint8(7, timestamp >> 24);
        this.tagHeader.setUint24(4, timestamp & 0x00FFFFFF);
    }
}
export default FLVTag;
//# sourceMappingURL=flv-tag.js.map