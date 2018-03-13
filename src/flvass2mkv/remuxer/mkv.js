/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { TextEncoder, Blob } from '../util/shim.js';
import EBML from '../util/ebml.js';

class MKV {
    constructor(config) {
        this.min = true;
        this.onprogress = null;
        Object.assign(this, config);
        this.segmentUID = MKV.randomBytes(16);
        this.trackUIDBase = Math.trunc(Math.random() * 2 ** 16);
        this.trackMetadata = { h264: null, aac: null, ass: null };
        this.duration = 0;
        this.blocks = { h264: [], aac: [], ass: [] };
    }

    static randomBytes(num) {
        return Array.from(new Array(num), () => Math.trunc(Math.random() * 256));
    }

    static textToMS(str) {
        const [, h, mm, ss, ms10] = str.match(/(\d+):(\d+):(\d+).(\d+)/);
        return h * 3600000 + mm * 60000 + ss * 1000 + ms10 * 10;
    }

    static mimeToCodecID(str) {
        if (str.startsWith('avc1')) {
            return 'V_MPEG4/ISO/AVC';
        }
        else if (str.startsWith('mp4a')) {
            return 'A_AAC';
        }
        else {
            throw new Error(`MKVRemuxer: unknown codec ${str}`);
        }
    }

    static uint8ArrayConcat(...array) {
        // if (Array.isArray(array[0])) array = array[0];
        if (array.length == 1) return array[0];
        if (typeof Buffer != 'undefined') return Buffer.concat(array);
        const ret = new Uint8Array(array.reduce((i, j) => i + j.byteLength, 0));
        let length = 0;
        for (let e of array) {
            ret.set(e, length);
            length += e.byteLength;
        }
        return ret;
    }

    addH264Metadata(h264) {
        this.trackMetadata.h264 = {
            codecId: MKV.mimeToCodecID(h264.codec),
            codecPrivate: h264.avcc,
            defaultDuration: h264.refSampleDuration * 1000000,
            pixelWidth: h264.codecWidth,
            pixelHeight: h264.codecHeight,
            displayWidth: h264.presentWidth,
            displayHeight: h264.presentHeight
        };
        this.duration = Math.max(this.duration, h264.duration);
    }

    addAACMetadata(aac) {
        this.trackMetadata.aac = {
            codecId: MKV.mimeToCodecID(aac.originalCodec),
            codecPrivate: aac.configRaw,
            defaultDuration: aac.refSampleDuration * 1000000,
            samplingFrequence: aac.audioSampleRate,
            channels: aac.channelCount
        };
        this.duration = Math.max(this.duration, aac.duration);
    }

    addASSMetadata(ass) {
        this.trackMetadata.ass = {
            codecId: 'S_TEXT/ASS',
            codecPrivate: new TextEncoder().encode(ass.header)
        };
    }

    addH264Stream(h264) {
        this.blocks.h264 = this.blocks.h264.concat(h264.samples.map(e => ({
            track: 1,
            frame: MKV.uint8ArrayConcat(...e.units.map(i => i.data)),
            isKeyframe: e.isKeyframe,
            discardable: Boolean(e.refIdc),
            timestamp: e.pts,
            simple: true,
        })));
    }

    addAACStream(aac) {
        this.blocks.aac = this.blocks.aac.concat(aac.samples.map(e => ({
            track: 2,
            frame: e.unit,
            timestamp: e.pts,
            simple: true,
        })));
    }

    addASSStream(ass) {
        this.blocks.ass = this.blocks.ass.concat(ass.lines.map((e, i) => ({
            track: 3,
            frame: new TextEncoder().encode(`${i},${e['Layer'] || ''},${e['Style'] || ''},${e['Name'] || ''},${e['MarginL'] || ''},${e['MarginR'] || ''},${e['MarginV'] || ''},${e['Effect'] || ''},${e['Text'] || ''}`),
            timestamp: MKV.textToMS(e['Start']),
            duration: MKV.textToMS(e['End']) - MKV.textToMS(e['Start']),
        })));
    }

    build() {
        return new Blob([
            this.buildHeader(),
            this.buildBody()
        ]);
    }

    buildHeader() {
        return new Blob([EBML.build(EBML.element(EBML.ID.EBML, [
            EBML.element(EBML.ID.EBMLVersion, EBML.number(1)),
            EBML.element(EBML.ID.EBMLReadVersion, EBML.number(1)),
            EBML.element(EBML.ID.EBMLMaxIDLength, EBML.number(4)),
            EBML.element(EBML.ID.EBMLMaxSizeLength, EBML.number(8)),
            EBML.element(EBML.ID.DocType, EBML.string('matroska')),
            EBML.element(EBML.ID.DocTypeVersion, EBML.number(4)),
            EBML.element(EBML.ID.DocTypeReadVersion, EBML.number(2)),
        ]))]);
    }

    buildBody() {
        if (this.min) {
            return new Blob([EBML.build(EBML.element(EBML.ID.Segment, [
                this.getSegmentInfo(),
                this.getTracks(),
                ...this.getClusterArray()
            ]))]);
        }
        else {
            return new Blob([EBML.build(EBML.element(EBML.ID.Segment, [
                this.getSeekHead(),
                this.getVoid(4100),
                this.getSegmentInfo(),
                this.getTracks(),
                this.getVoid(1100),
                ...this.getClusterArray()
            ]))]);
        }
    }

    getSeekHead() {
        return EBML.element(EBML.ID.SeekHead, [
            EBML.element(EBML.ID.Seek, [
                EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Info)),
                EBML.element(EBML.ID.SeekPosition, EBML.number(4050))
            ]),
            EBML.element(EBML.ID.Seek, [
                EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Tracks)),
                EBML.element(EBML.ID.SeekPosition, EBML.number(4200))
            ]),
        ]);
    }

    getVoid(length = 2000) {
        return EBML.element(EBML.ID.Void, EBML.bytes(new Uint8Array(length)));
    }

    getSegmentInfo() {
        return EBML.element(EBML.ID.Info, [
            EBML.element(EBML.ID.TimecodeScale, EBML.number(1000000)),
            EBML.element(EBML.ID.MuxingApp, EBML.string('flv.js + assparser_qli5 -> simple-ebml-builder')),
            EBML.element(EBML.ID.WritingApp, EBML.string('flvass2mkv.js by qli5')),
            EBML.element(EBML.ID.Duration, EBML.float(this.duration)),
            EBML.element(EBML.ID.SegmentUID, EBML.bytes(this.segmentUID)),
        ]);
    }

    getTracks() {
        return EBML.element(EBML.ID.Tracks, [
            this.getVideoTrackEntry(),
            this.getAudioTrackEntry(),
            this.getSubtitleTrackEntry()
        ]);
    }

    getVideoTrackEntry() {
        return EBML.element(EBML.ID.TrackEntry, [
            EBML.element(EBML.ID.TrackNumber, EBML.number(1)),
            EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 1)),
            EBML.element(EBML.ID.TrackType, EBML.number(0x01)),
            EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
            EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.h264.codecId)),
            EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.h264.codecPrivate)),
            EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.h264.defaultDuration)),
            EBML.element(EBML.ID.Language, EBML.string('und')),
            EBML.element(EBML.ID.Video, [
                EBML.element(EBML.ID.PixelWidth, EBML.number(this.trackMetadata.h264.pixelWidth)),
                EBML.element(EBML.ID.PixelHeight, EBML.number(this.trackMetadata.h264.pixelHeight)),
                EBML.element(EBML.ID.DisplayWidth, EBML.number(this.trackMetadata.h264.displayWidth)),
                EBML.element(EBML.ID.DisplayHeight, EBML.number(this.trackMetadata.h264.displayHeight)),
            ]),
        ]);
    }

    getAudioTrackEntry() {
        return EBML.element(EBML.ID.TrackEntry, [
            EBML.element(EBML.ID.TrackNumber, EBML.number(2)),
            EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 2)),
            EBML.element(EBML.ID.TrackType, EBML.number(0x02)),
            EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
            EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.aac.codecId)),
            EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.aac.codecPrivate)),
            EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.aac.defaultDuration)),
            EBML.element(EBML.ID.Language, EBML.string('und')),
            EBML.element(EBML.ID.Audio, [
                EBML.element(EBML.ID.SamplingFrequency, EBML.float(this.trackMetadata.aac.samplingFrequence)),
                EBML.element(EBML.ID.Channels, EBML.number(this.trackMetadata.aac.channels)),
            ]),
        ]);
    }

    getSubtitleTrackEntry() {
        return EBML.element(EBML.ID.TrackEntry, [
            EBML.element(EBML.ID.TrackNumber, EBML.number(3)),
            EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 3)),
            EBML.element(EBML.ID.TrackType, EBML.number(0x11)),
            EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
            EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.ass.codecId)),
            EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.ass.codecPrivate)),
            EBML.element(EBML.ID.Language, EBML.string('und')),
        ]);
    }

    getClusterArray() {
        // H264 codecState
        this.blocks.h264[0].simple = false;
        this.blocks.h264[0].codecState = this.trackMetadata.h264.codecPrivate;

        let i = 0;
        let j = 0;
        let k = 0;
        let clusterTimeCode = 0;
        let clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];
        let ret = [clusterContent];
        const progressThrottler = Math.pow(2, Math.floor(Math.log(this.blocks.h264.length >> 7) / Math.log(2))) - 1;
        for (i = 0; i < this.blocks.h264.length; i++) {
            const e = this.blocks.h264[i];
            for (; j < this.blocks.aac.length; j++) {
                if (this.blocks.aac[j].timestamp < e.timestamp) {
                    clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));
                }
                else {
                    break;
                }
            }
            for (; k < this.blocks.ass.length; k++) {
                if (this.blocks.ass[k].timestamp < e.timestamp) {
                    clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));
                }
                else {
                    break;
                }
            }
            if (e.isKeyframe/*  || clusterContent.length > 72 */) {
                // start new cluster
                clusterTimeCode = e.timestamp;
                clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];
                ret.push(clusterContent);
            }
            clusterContent.push(this.getBlocks(e, clusterTimeCode));
            if (this.onprogress && !(i & progressThrottler)) this.onprogress({ loaded: i, total: this.blocks.h264.length });
        }
        for (; j < this.blocks.aac.length; j++) clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));
        for (; k < this.blocks.ass.length; k++) clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));
        if (this.onprogress) this.onprogress({ loaded: i, total: this.blocks.h264.length });
        if (ret[0].length == 1) ret.shift();
        ret = ret.map(clusterContent => EBML.element(EBML.ID.Cluster, clusterContent));

        return ret;
    }

    getBlocks(e, clusterTimeCode) {
        if (e.simple) {
            return EBML.element(EBML.ID.SimpleBlock, [
                EBML.vintEncodedNumber(e.track),
                EBML.int16(e.timestamp - clusterTimeCode),
                EBML.bytes(e.isKeyframe ? [128] : [0]),
                EBML.bytes(e.frame)
            ]);
        }
        else {
            let blockGroupContent = [EBML.element(EBML.ID.Block, [
                EBML.vintEncodedNumber(e.track),
                EBML.int16(e.timestamp - clusterTimeCode),
                EBML.bytes([0]),
                EBML.bytes(e.frame)
            ])];
            if (typeof e.duration != 'undefined') {
                blockGroupContent.push(EBML.element(EBML.ID.BlockDuration, EBML.number(e.duration)));
            }
            if (typeof e.codecState != 'undefined') {
                blockGroupContent.push(EBML.element(EBML.ID.CodecState, EBML.bytes(e.codecState)));
            }
            return EBML.element(EBML.ID.BlockGroup, blockGroupContent);
        }
    }
}

export { MKV };
export default MKV;
