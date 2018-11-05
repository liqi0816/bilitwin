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
import MKV, { MKVInit } from './remuxer/mkv.js';
import { Blob } from './util/shim.js';
import { SimpleProgressEvent } from './util/common-types.js';

export interface FLVASS2MKVInit {
    onflvprogress?: (event: ProgressEvent) => void
    onassprogress?: (event: ProgressEvent) => void
    onurlrevokesafe?: () => void
    onfileload?: () => void
    onmkvprogress?: (event: SimpleProgressEvent) => void
    onload?: (mkv: Blob) => void
    mkvConfig?: MKVInit
}

class FLVASS2MKV {
    onflvprogress: ((event: ProgressEvent) => void) | null
    onassprogress: ((event: ProgressEvent) => void) | null
    onurlrevokesafe: (() => void) | null
    onfileload: (() => void) | null
    onmkvprogress: ((event: SimpleProgressEvent) => void) | null
    onload: ((mkv: Blob) => void) | null
    mkvConfig: MKVInit

    constructor({
        onflvprogress = null,
        onassprogress = null,
        onurlrevokesafe = null,
        onfileload = null,
        onmkvprogress = null,
        onload = null,
        mkvConfig = { onprogress: onmkvprogress || undefined }
    } = {} as FLVASS2MKVInit) {
        this.onflvprogress = onflvprogress;
        this.onassprogress = onassprogress;
        this.onurlrevokesafe = onurlrevokesafe;
        this.onfileload = onfileload;
        this.onmkvprogress = onmkvprogress;
        this.onload = onload;
        this.mkvConfig = mkvConfig;
    }

    /**
     * Demux FLV into H264 + AAC stream and ASS into line stream; then
     * remux them into a MKV file.
     */
    async build(flvSource: Blob | string | ArrayBuffer = 'static/samples/gen_case.flv', assSource: Blob | string | ArrayBuffer = 'static/samples/gen_case.ass') {
        // load flv and ass as arraybuffer
        const [flvBuffer, assBuffer] = await Promise.all([
            new Promise<ArrayBuffer>((resolve, reject) => {
                if (flvSource instanceof Blob) {
                    const e = new FileReader();
                    e.onprogress = this.onflvprogress;
                    e.onload = () => resolve(e.result as ArrayBuffer);
                    e.onerror = reject;
                    e.readAsArrayBuffer(flvSource);
                }
                else if (typeof flvSource == 'string') {
                    const e = new XMLHttpRequest();
                    e.responseType = 'arraybuffer';
                    e.onprogress = this.onflvprogress;
                    e.onload = () => resolve(e.response);
                    e.onerror = reject;
                    e.open('get', flvSource);
                    e.send();
                }
                else if (flvSource instanceof ArrayBuffer) {
                    resolve(flvSource);
                }
                else {
                    reject(new TypeError('flvass2mkv: flvSource {Blob|string|ArrayBuffer}'));
                }
                if (typeof assSource !== 'string' && this.onurlrevokesafe) this.onurlrevokesafe();
            }),
            new Promise<ArrayBuffer>((resolve, reject) => {
                if (assSource instanceof Blob) {
                    const e = new FileReader();
                    e.onprogress = this.onassprogress;
                    e.onload = () => resolve(e.result as ArrayBuffer);
                    e.onerror = reject;
                    e.readAsArrayBuffer(assSource);
                }
                else if (typeof assSource == 'string') {
                    const e = new XMLHttpRequest();
                    e.responseType = 'arraybuffer';
                    e.onprogress = this.onassprogress;
                    e.onload = () => resolve(e.response);
                    e.onerror = reject;
                    e.open('get', assSource);
                    e.send();
                }
                else if (assSource instanceof ArrayBuffer) {
                    resolve(assSource);
                }
                else {
                    reject(new TypeError('flvass2mkv: assSource {Blob|string|ArrayBuffer}'));
                }
                if (this.onurlrevokesafe) this.onurlrevokesafe();
            }),
        ]);
        if (this.onfileload) this.onfileload();

        const mkv = new MKV(this.mkvConfig);

        const assParser = new ASS();
        const ass = assParser.parseFile(assBuffer);
        mkv.addASSMetadata(ass);
        mkv.addASSStream(ass);

        const flvProbeData = FLVDemuxer.probe(flvBuffer);
        const flvDemuxer = new FLVDemuxer(flvProbeData, null);
        let mediaInfo = null;
        let h264 = null;
        let aac = null;
        flvDemuxer.onDataAvailable = (...array: any[]) => {
            array.forEach(e => {
                if (e.type == 'video') h264 = e;
                else if (e.type == 'audio') aac = e;
                else throw new Error(`MKVRemuxer: unrecoginzed data type ${e.type}`);
            });
        };
        flvDemuxer.onMediaInfo = (i: any) => mediaInfo = i;
        flvDemuxer.onTrackMetadata = (i: string, e: any) => {
            if (i == 'video') mkv.addH264Metadata(e);
            else if (i == 'audio') mkv.addAACMetadata(e);
            else throw new Error(`MKVRemuxer: unrecoginzed metadata type ${i}`);
        };
        flvDemuxer.onError = (e: any) => { throw new Error(e); };
        const finalOffset = flvDemuxer.parseChunks(flvBuffer, flvProbeData.dataOffset);
        if (finalOffset != flvBuffer.byteLength) throw new Error('FLVDemuxer: unexpected EOF');
        mkv.addH264Stream(h264);
        mkv.addAACStream(aac);

        const ret = mkv.build();
        if (this.onload) this.onload(ret);
        return ret;
    }
};

export { FLVASS2MKV };
export default FLVASS2MKV;
