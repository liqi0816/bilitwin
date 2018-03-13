/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/**
 * A simple emulation of pthread_mutex
 */
class Mutex {
    constructor() {
        this.queueTail = Promise.resolve();
        this.resolveHead = null;
    }

    /** 
     * await mutex.lock = pthread_mutex_lock
     * @returns a promise to be resolved when the mutex is available
    */
    async lock() {
        let myResolve;
        let _queueTail = this.queueTail;
        this.queueTail = new Promise(resolve => myResolve = resolve);
        await _queueTail;
        this.resolveHead = myResolve;
        return;
    }

    /**
     * mutex.unlock = pthread_mutex_unlock
     */
    unlock() {
        this.resolveHead();
        return;
    }

    /**
     * lock, ret = await async, unlock, return ret
     * @param {(Function|Promise)} promise async thing to wait for
     */
    async lockAndAwait(promise) {
        await this.lock();
        let ret;
        try {
            if (typeof promise == 'function') promise = promise();
            ret = await promise;
        }
        finally {
            this.unlock();
        }
        return ret;
    }

    static _UNIT_TEST() {
        let m = new Mutex();
        function sleep(time) {
            return new Promise(r => setTimeout(r, time));
        }
        m.lockAndAwait(() => {
            console.warn('Check message timestamps.');
            console.warn('Bad:');
            console.warn('1 1 1 1 1:5s');
            console.warn(' 1 1 1 1 1:10s');
            console.warn('Good:');
            console.warn('1 1 1 1 1:5s');
            console.warn('         1 1 1 1 1:10s');
        });
        m.lockAndAwait(async () => {
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
        });
        m.lockAndAwait(async () => console.log('5s!'));
        m.lockAndAwait(async () => {
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
            await sleep(1000);
        });
        m.lockAndAwait(async () => console.log('10s!'));
    }
}

export default Mutex;
