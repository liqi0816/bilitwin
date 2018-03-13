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
    // Yes, this is something like cancelable Promise. But I insist they are different.
    constructor(callback) {
        //this.state = 0; 
        this.hangReturn = Symbol();
        this.primaryPromise = new Promise((s, j) => {
            this.resolve = arg => { s(arg); return arg; }
            this.reject = arg => { j(arg); return arg; }
        });
        //this.primaryPromise.then(() => this.state = 1);
        //this.primaryPromise.catch(() => this.state = 2);
        this.hangPromise = new Promise(s => this.hang = () => s(this.hangReturn));
        //this.hangPromise.then(() => this.state = 3);
        this.promise = Promise
            .race([this.primaryPromise, this.hangPromise])
            .then(s => s == this.hangReturn ? new Promise(() => { }) : s);
        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
        this.finally = this.promise.finally.bind(this.promise);
        this.destroiedThen = this.hangPromise.then.bind(this.hangPromise);

        if (typeof callback == 'function') callback(this.resolve, this.reject);
    }

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
        this.destroiedThen = f => f();
        // Do NEVER NEVER NEVER dereference hangReturn.
        // Mysteriously this tiny symbol will keep you from Memory LEAK.
        //this.hangReturn = null;
    }

    static _UNIT_TEST() {
        let containers = [];
        async function foo() {
            let buf = new ArrayBuffer(600000000);
            let ac = new AsyncContainer();
            ac.destroiedThen(() => console.log('asyncContainer destroied'))
            containers.push(ac);
            await ac;
            return buf;
        }
        let foos = [foo(), foo(), foo()];
        containers.forEach(e => e.destroy());
        console.warn('Check your RAM usage. I allocated 1.8GB in three dead-end promises.')
        return [foos, containers];
    }
}

export default AsyncContainer;
