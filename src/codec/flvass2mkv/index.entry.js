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

const FLVASS2MKV = class {
    constructor(config = {}) {
        this.onflvprogress = null;
        this.onassprogress = null;
        this.onurlrevokesafe = null;
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
     */
    async build(flv = './samples/gen_case.flv', ass = './samples/gen_case.ass') {
        // load flv and ass as arraybuffer
        await Promise.all([
            new Promise((r, j) => {
                if (flv instanceof Blob) {
                    const e = new FileReader();
                    e.onprogress = this.onflvprogress;
                    e.onload = () => r(flv = e.result);
                    e.onerror = j;
                    e.readAsArrayBuffer(flv);
                }
                else if (typeof flv == 'string') {
                    const e = new XMLHttpRequest();
                    e.responseType = 'arraybuffer';
                    e.onprogress = this.onflvprogress;
                    e.onload = () => r(flv = e.response);
                    e.onerror = j;
                    e.open('get', flv);
                    e.send();
                    flv = 2; // onurlrevokesafe
                }
                else if (flv instanceof ArrayBuffer) {
                    r(flv);
                }
                else {
                    j(new TypeError('flvass2mkv: flv {Blob|string|ArrayBuffer}'));
                }
                if (typeof ass != 'string' && this.onurlrevokesafe) this.onurlrevokesafe();
            }),
            new Promise((r, j) => {
                if (ass instanceof Blob) {
                    const e = new FileReader();
                    e.onprogress = this.onflvprogress;
                    e.onload = () => r(ass = e.result);
                    e.onerror = j;
                    e.readAsArrayBuffer(ass);
                }
                else if (typeof ass == 'string') {
                    const e = new XMLHttpRequest();
                    e.responseType = 'arraybuffer';
                    e.onprogress = this.onflvprogress;
                    e.onload = () => r(ass = e.response);
                    e.onerror = j;
                    e.open('get', ass);
                    e.send();
                    ass = 2; // onurlrevokesafe
                }
                else if (ass instanceof ArrayBuffer) {
                    r(ass);
                }
                else {
                    j(new TypeError('flvass2mkv: ass {Blob|string|ArrayBuffer}'));
                }
                if (typeof flv != 'string' && this.onurlrevokesafe) this.onurlrevokesafe();
            }),
        ]);
        if (this.onfileload) this.onfileload();

        const mkv = new MKV(this.mkvConfig);

        const assParser = new ASS();
        ass = assParser.parseFile(ass);
        mkv.addASSMetadata(ass);
        mkv.addASSStream(ass);

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
