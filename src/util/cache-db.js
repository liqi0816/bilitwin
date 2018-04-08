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

class CacheDB extends IDBCacheDB {
    get addData() {
        console.warn('CacheDB.prototype.addData is deprecated. Use .createData instead.')
        return this.createData;
    }

    get putData() {
        console.warn('CacheDB.prototype.putData is deprecated. Use .setData instead.')
        return this.setData;
    }
}
CacheDB.ChromeCacheDB = ChromeCacheDB.isSupported && ChromeCacheDB;
CacheDB.FirefoxCacheDB = FirefoxCacheDB.isSupported && FirefoxCacheDB;

export default CacheDB;
