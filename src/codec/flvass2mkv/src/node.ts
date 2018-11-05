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

import FLVASS2MKV from './flvass2mkv.js';

// if nodejs then test
if (typeof require == 'function' && require.main == module) {
    (async () => {
        const fs = require('fs');
        const flvFileName = process.argv.slice(2).find(e => e.includes('.flv')) || '../static/samples/gen_case.flv';
        const assFileName = process.argv.slice(2).find(e => e.includes('.ass')) || '../static/samples/gen_case.ass';
        const flvFile = fs.readFileSync(flvFileName).buffer;
        const assFile = fs.readFileSync(assFileName).buffer;
        fs.writeFileSync('out.mkv', await new FLVASS2MKV({ onmkvprogress: console.log.bind(console) }).build(flvFile, assFile));
    })();
}
