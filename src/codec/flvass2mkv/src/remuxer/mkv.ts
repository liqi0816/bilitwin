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
import { SimpleProgressEvent } from '../util/common-types.js';
import EBML from '../util/ebml.js';
import ASS from '../demuxer/ass.js';

export interface MKVMetadata {
    codecId: string
    codecPrivate?: Uint8Array
    defaultDuration?: number
    pixelWidth?: number
    pixelHeight?: number
    displayWidth?: number
    displayHeight?: number
    samplingFrequence?: number
    channels?: number
}

export interface MKVClusterBlock {
    track: number
    frame: Uint8Array
    timestamp: number
    simple?: boolean
    isKeyframe?: boolean
    discardable?: boolean
    duration?: number
    codecState?: Uint8Array
}

export interface MKVInit {
    mininal?: boolean
    onprogress?: (event: SimpleProgressEvent) => void
    segmentUID?: Uint8Array
    trackUIDBase?: number
}

class MKV {
    mininal: boolean
    onprogress: ((event: SimpleProgressEvent) => void) | null
    segmentUID: Uint8Array
    trackUIDBase: number
    trackMetadata: {
        h264: MKVMetadata | null,
        aac: MKVMetadata | null,
        ass: MKVMetadata | null,
    }
    duration: number
    blocks: {
        h264: MKVClusterBlock[],
        aac: MKVClusterBlock[],
        ass: MKVClusterBlock[],
    }

    constructor({
        mininal = true,
        onprogress = null,
        segmentUID = MKV.randomBytes(16),
        trackUIDBase = Math.trunc(Math.random() * 2 ** 16),
    } = {} as MKVInit) {
        this.mininal = mininal;
        this.onprogress = onprogress;
        this.segmentUID = segmentUID;
        this.trackUIDBase = trackUIDBase;
        this.trackMetadata = { h264: null, aac: null, ass: null };
        this.duration = 0;
        this.blocks = { h264: [], aac: [], ass: [] };
    }

    static randomBytes(length: number) {
        const ret = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            ret[i] = Math.trunc(Math.random() * 256);
        }
        return ret;
    }

    static textToMS(str: string) {
        const [, h, mm, ss, ms10] = str.match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/)!;
        return (h as unknown as number) * 3600000 + (mm as unknown as number) * 60000 + (ss as unknown as number) * 1000 + (ms10 as unknown as number) * 10;
    }

    static mimeToCodecID(str: string) {
        if (str.startsWith('avc1')) {
            return 'V_MPEG4/ISO/AVC';
        }
        else if (str.startsWith('mp4a')) {
            return 'A_AAC';
        }
        else {
            throw new TypeError(`MKVRemuxer: unknown codec ${str}`);
        }
    }

    static uint8ArrayConcat(...array: Uint8Array[]) {
        // if (Array.isArray(array[0])) array = array[0];
        if (array.length === 1) return array[0];
        if (typeof Buffer !== 'undefined') return Buffer.concat(array);
        const ret = new Uint8Array(array.reduce((i, { byteLength }) => i + byteLength, 0));
        let byteLength = 0;
        for (const e of array) {
            ret.set(e, byteLength);
            byteLength += e.byteLength;
        }
        return ret;
    }

    addH264Metadata(h264: any) {
        this.duration = Math.max(this.duration, h264.duration);
        return this.trackMetadata.h264 = {
            codecId: MKV.mimeToCodecID(h264.codec),
            codecPrivate: h264.avcc,
            defaultDuration: h264.refSampleDuration * 1000000,
            pixelWidth: h264.codecWidth,
            pixelHeight: h264.codecHeight,
            displayWidth: h264.presentWidth,
            displayHeight: h264.presentHeight
        };
    }

    addAACMetadata(aac: any) {
        this.duration = Math.max(this.duration, aac.duration);
        return this.trackMetadata.aac = {
            codecId: MKV.mimeToCodecID(aac.originalCodec),
            codecPrivate: aac.configRaw,
            defaultDuration: aac.refSampleDuration * 1000000,
            samplingFrequence: aac.audioSampleRate,
            channels: aac.channelCount
        };
    }

    addASSMetadata(ass: ASS) {
        return this.trackMetadata.ass = {
            codecId: 'S_TEXT/ASS',
            codecPrivate: new TextEncoder().encode(ass.header)
        };
    }

    addH264Stream(h264: any) {
        return this.blocks.h264 = this.blocks.h264.concat(h264.samples.map((e: any) => ({
            track: 1,
            frame: MKV.uint8ArrayConcat(...e.units.map(({ data }: { data: Uint8Array }) => data)),
            isKeyframe: e.isKeyframe,
            discardable: Boolean(e.refIdc),
            timestamp: e.pts,
            simple: true,
        })));
    }

    addAACStream(aac: any) {
        return this.blocks.aac = this.blocks.aac.concat(aac.samples.map((e: any) => ({
            track: 2,
            frame: e.unit,
            timestamp: e.pts,
            simple: true,
        })));
    }

    addASSStream(ass: ASS) {
        return this.blocks.ass = this.blocks.ass.concat(ass.lines.map((e, i) => ({
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
        if (this.mininal) {
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
        if (!this.trackMetadata.h264) throw new TypeError(`this.trackMetadata.h264 is empty`);
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
        if (!this.trackMetadata.aac) throw new TypeError(`this.trackMetadata.aac is empty`);
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
        if (!this.trackMetadata.ass) throw new TypeError(`this.trackMetadata.aac is empty`);
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
        if (!this.trackMetadata.h264) throw new TypeError(`this.trackMetadata.h264 is empty`);
        this.blocks.h264[0].simple = false;
        this.blocks.h264[0].codecState = this.trackMetadata.h264.codecPrivate;

        let i = 0;
        let j = 0;
        let k = 0;
        let clusterTimeCode = 0;
        let clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];
        let clusterContentArr = [clusterContent];
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
                clusterContentArr.push(clusterContent);
            }
            clusterContent.push(this.getBlocks(e, clusterTimeCode));
            if (this.onprogress && !(i & progressThrottler)) this.onprogress({ loaded: i, total: this.blocks.h264.length });
        }
        for (; j < this.blocks.aac.length; j++) clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));
        for (; k < this.blocks.ass.length; k++) clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));
        if (this.onprogress) this.onprogress({ loaded: i, total: this.blocks.h264.length });
        if (clusterContentArr[0].length == 1) clusterContentArr.shift();
        const ret = clusterContentArr.map(clusterContent => EBML.element(EBML.ID.Cluster, clusterContent));

        return ret;
    }

    getBlocks({ track, frame, timestamp, simple, isKeyframe, duration, codecState }: MKVClusterBlock, clusterTimeCode: number) {
        if (simple) {
            return EBML.element(EBML.ID.SimpleBlock, [
                EBML.vintEncodedNumber(track),
                EBML.int16(timestamp - clusterTimeCode),
                EBML.bytes(isKeyframe ? [128] : [0]),
                EBML.bytes(frame)
            ]);
        }
        else {
            let blockGroupContent = [EBML.element(EBML.ID.Block, [
                EBML.vintEncodedNumber(track),
                EBML.int16(timestamp - clusterTimeCode),
                EBML.bytes([0]),
                EBML.bytes(frame)
            ])];
            if (typeof duration != 'undefined') {
                blockGroupContent.push(EBML.element(EBML.ID.BlockDuration, EBML.number(duration)));
            }
            if (typeof codecState != 'undefined') {
                blockGroupContent.push(EBML.element(EBML.ID.CodecState, EBML.bytes(codecState)));
            }
            return EBML.element(EBML.ID.BlockGroup, blockGroupContent);
        }
    }
}

export { MKV };
export default MKV;
