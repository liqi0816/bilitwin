/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import StreamDetailedFetchBlob from './lib-detailed-fetch-blob/stream-detailed-fetch-blob.js';
import FirefoxDetailedFetchBlob from './lib-detailed-fetch-blob/firefox-detailed-fetch-blob.js';
/**
 * A more powerful fetch with
 *   1. onprogress handler
 *   2. partial response getter
 */
const DetailedFetchBlob = StreamDetailedFetchBlob.isSupported ? StreamDetailedFetchBlob : FirefoxDetailedFetchBlob.isSupported ? FirefoxDetailedFetchBlob : StreamDetailedFetchBlob;
export default DetailedFetchBlob;
//# sourceMappingURL=detailed-fetch-blob.js.map