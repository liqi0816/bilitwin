/**
 * Copyright (C) 2018 Xmader.
 * @author Xmader
 */

import FLVDemuxer from "../flvass2mkv/demuxer/flvdemuxer.js"
import { getAdtsHeaders } from "./adts-headers.js"

/**
 * Demux FLV into H264 + AAC stream into line stream then
 * remux it into a AAC file.
 * @param {Blob|Buffer|ArrayBuffer|string} flv 
 */
const FLV2AAC = async (flv) => {

    // load flv as arraybuffer
    /** @type {ArrayBuffer} */
    const flvArrayBuffer = await new Promise((r, j) => {
        if ((typeof Blob != "undefined") && (flv instanceof Blob)) {
            const reader = new FileReader()
            reader.onload = () => {
                /** @type {ArrayBuffer} */
                // @ts-ignore
                const result = reader.result
                r(result)
            }
            reader.onerror = j
            reader.readAsArrayBuffer(flv)
        } else if ((typeof Buffer != "undefined") && (flv instanceof Buffer)) {
            r(new Uint8Array(flv).buffer)
        } else if (flv instanceof ArrayBuffer) {
            r(flv)
        } else if (typeof flv == 'string') {
            const req = new XMLHttpRequest();
            req.responseType = "arraybuffer";
            req.onload = () => r(req.response);
            req.onerror = j;
            req.open('get', flv);
            req.send();
        } else {
            j(new TypeError("@type {Blob|Buffer|ArrayBuffer} flv"))
        }
    })

    const flvProbeData = FLVDemuxer.probe(flvArrayBuffer)
    const flvDemuxer = new FLVDemuxer(flvProbeData)

    // 只解析音频
    flvDemuxer.overridedHasVideo = false

    /**
     * @typedef {Object} Sample
     * @property {Uint8Array} unit
     * @property {number} length
     * @property {number} dts
     * @property {number} pts
     */

    /** @type {{ type: "audio"; id: number; sequenceNumber: number; length: number; samples: Sample[]; }} */
    let aac = null
    let metadata = null

    flvDemuxer.onTrackMetadata = (type, _metaData) => {
        if (type == "audio") {
            metadata = _metaData
        }
    }

    flvDemuxer.onMediaInfo = () => { }

    flvDemuxer.onError = (e) => {
        throw new Error(e)
    }

    flvDemuxer.onDataAvailable = (...args) => {
        args.forEach(data => {
            if (data.type == "audio") {
                aac = data
            }
        })
    }

    const finalOffset = flvDemuxer.parseChunks(flvArrayBuffer, flvProbeData.dataOffset)
    if (finalOffset != flvArrayBuffer.byteLength) {
        throw new Error("FLVDemuxer: unexpected EOF")
    }

    const {
        audioObjectType,
        samplingFrequencyIndex,
        channelCount: channelConfig
    } = metadata

    /** @type {number[]} */
    let output = []

    aac.samples.forEach((sample) => {
        const headers = getAdtsHeaders({
            audioObjectType,
            samplingFrequencyIndex,
            channelConfig,
            adtsLen: sample.length + 7
        })
        output.push(...headers, ...sample.unit)
    })

    return new Uint8Array(output)
}

export { FLV2AAC }
export default FLV2AAC
