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
 * Basically a Promise that exposes its resolve and reject callbacks
 */
class AsyncContainer {
    /***
     * The thing is, if we cannot cancel a promise, we should at least be able to 
     * explicitly mark a promise as garbage collectible.
     * 
     * Yes, this is something like cancelable Promise. But I insist they are different.
     */
    constructor(callback) {
        // 1. primary promise
        this.primaryPromise = new Promise((s, j) => {
            this.resolve = arg => { s(arg); return arg; }
            this.reject = arg => { j(arg); return arg; }
        });

        // 2. hang promise
        this.hangReturn = Symbol();
        this.hangPromise = new Promise(s => this.hang = () => s(this.hangReturn));
        this.destroiedThen = this.hangPromise.then.bind(this.hangPromise);

        // 3. states
        const state = 'pending';
        this.primaryPromise.then(() => this.state = 'fulfilled');
        this.primaryPromise.catch(() => this.state = 'rejected');
        this.hangPromise.then(() => this.state = 'hanged');

        // 4. race
        this.promise = Promise
            .race([this.primaryPromise, this.hangPromise])
            .then(s => s == this.hangReturn ? new Promise(() => { }) : s);

        // 5. inherit
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
        this.finally = this.promise.finally.bind(this.promise);

        // 6. optional callback
        if (typeof callback == 'function') callback(this.resolve, this.reject);
    }

    /***
     * Memory leak notice:
     * 
     * The V8 implementation of Promise requires
     * 1. the resolve handler of a Promise
     * 2. the reject handler of a Promise
     * 3. !! the Promise object itself !!
     * to be garbage collectible to correctly free Promise runtime contextes
     * 
     * This piece of code will work
     * void (async () => {
     *     const buf = new Uint8Array(1024 * 1024 * 1024);
     *     for (let i = 0; i < buf.length; i++) buf[i] = i;
     *     await new Promise(() => { });
     *     return buf;
     * })();
     * if (typeof gc == 'function') gc();
     * 
     * This piece of code will cause a Promise context mem leak
     * const deadPromise = new Promise(() => { });
     * void (async () => {
     *     const buf = new Uint8Array(1024 * 1024 * 1024);
     *     for (let i = 0; i < buf.length; i++) buf[i] = i;
     *     await deadPromise;
     *     return buf;
     * })();
     * if (typeof gc == 'function') gc();
     * 
     * In other words, do NOT directly inherit from promise. You will need to
     * dereference it on destroying.
     */
    destroy() {
        this.hang();
        this.resolve = () => { };
        this.reject = this.resolve;
        this.hang = this.resolve;
        this.primaryPromise = null;
        this.hangPromise = null;
        this.promise = null;
        this.then = this.resolve;
        this.catch = this.resolve;
        this.finally = this.resolve;
        this.destroiedThen = f => f();
        /***
         * For ease of debug, do not dereference hangReturn
         * 
         * If run from console, mysteriously this tiny symbol will help correct gc
         * before a console.clear
         */
        //this.hangReturn = null;
    }

    static _UNIT_TEST() {
        const containers = [];
        async function foo() {
            const buf = new Uint8Array(600 * 1024 * 1024);
            for (let i = 0; i < buf.length; i++) buf[i] = i;
            const ac = new AsyncContainer();
            ac.destroiedThen(() => console.log('asyncContainer destroied'))
            containers.push(ac);
            await ac;
            return buf;
        }
        const foos = [foo(), foo(), foo()];
        containers.forEach(e => e.destroy());
        console.warn('Check your RAM usage. I allocated 1.8GB in three dead-end promises.')
        return [foos, containers];
    }
}

export default AsyncContainer;
