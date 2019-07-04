// @ts-check
/***
 * FLV + ASS => MKV transmuxer
 * Demux FLV into H264 + AAC stream and ASS into line stream; then
 * remux them into a MKV file.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * The FLV demuxer is from flv.js <https://github.com/Bilibili/flv.js/>
 * by zheng qian <xqq@xqq.im>, licensed under Apache 2.0.
 * 
 * The EMBL builder is from simple-ebml-builder
 * <https://www.npmjs.com/package/simple-ebml-builder> by ryiwamoto, 
 * licensed under MIT.
 */

import FLVDemuxer from './demuxer/flvdemuxer.js';
import ASS from './demuxer/ass.js';
import MKV from './remuxer/mkv.js';
import { Blob } from './util/shim.js';

/**
 * @param {Blob|string|ArrayBuffer} x 
 */
const getArrayBuffer = (x) => {
    return new Promise((resolve, reject) => {
        if (x instanceof Blob) {
            const e = new FileReader();
            e.onload = () => resolve(e.result);
            e.onerror = reject;
            e.readAsArrayBuffer(x);
        }
        else if (typeof x == 'string') {
            const e = new XMLHttpRequest();
            e.responseType = 'arraybuffer';
            e.onload = () => resolve(e.response);
            e.onerror = reject;
            e.open('get', x);
            e.send();
        }
        else if (x instanceof ArrayBuffer) {
            resolve(x);
        }
        else {
            reject(new TypeError('flvass2mkv: getArrayBuffer {Blob|string|ArrayBuffer}'));
        }
    })
}

const FLVASS2MKV = class {
    constructor(config = {}) {
        this.onflvprogress = null;
        this.onfileload = null;
        this.onmkvprogress = null;
        this.onload = null;
        Object.assign(this, config);
        this.mkvConfig = { onprogress: this.onmkvprogress };
        Object.assign(this.mkvConfig, config.mkvConfig);
    }

    /**
     * Demux FLV into H264 + AAC stream and ASS into line stream; then
     * remux them into a MKV file.
     * @param {Blob|string|ArrayBuffer} flv 
     * @param {Blob|string|ArrayBuffer} ass 
     * @param {...(Blob|string|ArrayBuffer)} subtitleAssList
     */
    async build(flv = './samples/gen_case.flv', ass = './samples/gen_case.ass', ...subtitleAssList) {
        // load flv and ass as arraybuffer
        await Promise.all([
            (async () => {
                flv = await getArrayBuffer(flv)
            })(),
            (async () => {
                ass = await getArrayBuffer(ass)
            })(),
            (async () => {
                subtitleAssList = await Promise.all(
                    subtitleAssList.map(getArrayBuffer)
                )
            })(),
        ]);

        if (this.onfileload) this.onfileload();

        const mkv = new MKV(this.mkvConfig);

        const assParser = new ASS();
        const assData = assParser.parseFile(ass);
        mkv.addASSMetadata(assData);
        mkv.addASSStream(assData);

        subtitleAssList.forEach((subtitleAss) => {
            const assData = assParser.parseFile(subtitleAss);
            mkv.addASSMetadata(assData);
            mkv.addASSStream(assData);
        })

        const flvProbeData = FLVDemuxer.probe(flv);
        const flvDemuxer = new FLVDemuxer(flvProbeData);
        let mediaInfo = null;
        let h264 = null;
        let aac = null;
        flvDemuxer.onDataAvailable = (...array) => {
            array.forEach(e => {
                if (e.type == 'video') h264 = e;
                else if (e.type == 'audio') aac = e;
                else throw new Error(`MKVRemuxer: unrecoginzed data type ${e.type}`);
            });
        };
        flvDemuxer.onMediaInfo = i => mediaInfo = i;
        flvDemuxer.onTrackMetadata = (i, e) => {
            if (i == 'video') mkv.addH264Metadata(e);
            else if (i == 'audio') mkv.addAACMetadata(e);
            else throw new Error(`MKVRemuxer: unrecoginzed metadata type ${i}`);
        };
        flvDemuxer.onError = e => { throw new Error(e); };
        const finalOffset = flvDemuxer.parseChunks(flv, flvProbeData.dataOffset);
        if (finalOffset != flv.byteLength) throw new Error('FLVDemuxer: unexpected EOF');
        mkv.addH264Stream(h264);
        mkv.addAACStream(aac);

        const ret = mkv.build();
        if (this.onload) this.onload(ret);
        return ret;
    }
};

// export { FLVASS2MKV };
export default FLVASS2MKV;

// if nodejs then test
if (typeof window == 'undefined') {
    if (require.main == module) {
        (async () => {
            const fs = require('fs');
            const assFileName = process.argv.slice(1).find(e => e.includes('.ass')) || './samples/gen_case.ass';
            const flvFileName = process.argv.slice(1).find(e => e.includes('.flv')) || './samples/gen_case.flv';
            const assFile = fs.readFileSync(assFileName).buffer;
            const flvFile = fs.readFileSync(flvFileName).buffer;
            fs.writeFileSync('out.mkv', await new FLVASS2MKV({ onmkvprogress: console.log.bind(console) }).build(flvFile, assFile));
        })();
    }
}
