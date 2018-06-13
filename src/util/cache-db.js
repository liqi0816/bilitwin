/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import IDBCacheDB from './lib-cache-db/idb-cache-db.js';
import ChromeCacheDB from './lib-cache-db/chrome-cache-db.js';
import FirefoxCacheDB from './lib-cache-db/firefox-cache-db.js';

export default {
    IDBCacheDB: IDBCacheDB.isSupported() && IDBCacheDB,
    ChromeCacheDB: ChromeCacheDB.isSupported() && ChromeCacheDB,
    FirefoxCacheDB: FirefoxCacheDB.isSupported() && FirefoxCacheDB,
};
