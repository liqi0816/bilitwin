/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import OnEventTargetFactory from '../on-event-target.js';

class BaseDetailedFetchBlob extends OnEventTargetFactory(['progress', 'abort', 'error']) {
    constructor({ }, {
        onprogress = null,
        onabort = null,
        onerror = null,
        loaded = 0,
        total = 0,
        lengthComputable = Boolean(total),
    } = {}) {
        super();
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;

        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;

        this.error = null;
        this.buffer = [];
        this.blob = null;
    }

    getPartialBlob() {
        return this.blob || new Blob(this.buffer);
    }

    async getBlob() {
        return this;
    }

    abort() { }
    then() { }
    catch() { }
    finally() { }
    static get isSupported() { }
}

export default BaseDetailedFetchBlob;
