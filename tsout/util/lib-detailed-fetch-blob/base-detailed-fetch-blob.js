/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import OnEventTargetFactory from '../on-event-target.js';
class BaseDetailedFetchBlob extends OnEventTargetFactory(['progress', 'abort', 'error']) {
    constructor(input, { onprogress = null, onabort = null, onerror = null, loaded = 0, total = Infinity, lengthComputable = false, } = {}) {
        super();
        this.error = null;
        this.blob = null;
        this.buffer = [];
        this.onprogress = onprogress;
        this.onabort = onabort;
        this.onerror = onerror;
        this.loaded = loaded;
        this.total = total;
        this.lengthComputable = lengthComputable;
    }
    getPartialBlob() {
        return this.blob || new Blob(this.buffer || []);
    }
    async getBlob() {
        return this;
    }
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.promise.catch(onrejected);
    }
    finally(onfinally) {
        return this.promise.finally(onfinally);
    }
    static get isSupported() { return false; }
}
export { BaseDetailedFetchBlob };
export default BaseDetailedFetchBlob;
//# sourceMappingURL=base-detailed-fetch-blob.js.map