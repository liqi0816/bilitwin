/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import embeddedHTML from './embedded.html';

class MKVTransmuxer {
    constructor(option) {
        this.workerWin = null;
        this.option = option;
    }

    /**
     * FLV + ASS => MKV entry point
     * @param {Blob|string|ArrayBuffer} flv
     * @param {Blob|string|ArrayBuffer} ass 
     * @param {string=} name 
     */
    exec(flv, ass, name) {
        // 1. Allocate for a new window
        if (!this.workerWin) this.workerWin = top.open('', undefined, ' ');

        // 2. Inject scripts
        this.workerWin.document.write(embeddedHTML);
        this.workerWin.document.close();

        // 3. Invoke exec
        if (!(this.option instanceof Object)) this.option = null;
        this.workerWin.exec(Object.assign({}, this.option, { flv, ass, name }));
        URL.revokeObjectURL(flv);
        URL.revokeObjectURL(ass);

        // 4. Free parent window
        // if (top.confirm('MKV打包中……要关掉这个窗口，释放内存吗？')) 
        top.location = 'about:blank';
    }
}

export default MKVTransmuxer;
