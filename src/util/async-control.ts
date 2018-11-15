/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A promisified settimeout
 * 
 * @param (default 0) time to sleep in ms
 */
const sleep = (ms = 0) => {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a Promise that resolves when the current macrotask queue has been
 * emptied
 */
const yieldThread = () => new Promise<void>(setTimeout as any);

/**
 * Creates a function that invokes `originalFunction`, with the `this` binding
 * and `arguments` of the created function, while there is no other pending 
 * excutions of `originalFunction`. Simultaneous calls to the created function
 * return the result of the first pending `originalFunction` invocation.
 * 
 * @param originalFunction async function to wrap
 */
const debounceAsync = <T extends (...args: any[]) => Promise<any>>(originalFunction: T) => {
    let currentExcution: ReturnType<T> | null;
    const wrappedFunction = async function (this: any) {
        // 1. locked => return lock
        if (currentExcution) return currentExcution;

        // 2. released => apply
        currentExcution = originalFunction.apply(this, arguments);
        try {
            return await currentExcution;
        }
        finally {
            currentExcution = null;
        }
    };
    return wrappedFunction as T;
}

const debounceAsync_UNIT_TEST = async () => {
    const goodnight = debounceAsync(sleep);
    for (let i = 0; i < 8; i++) {
        goodnight(5000).then(() => console.log(Date()));
        await sleep(500);
    }
    console.warn('Expected output: 8 identical datetime');
};

const endOfQueue = Promise.resolve();
const overrideResult = async (lastExcution: Promise<void>) => {
    try {
        await lastExcution;
    }
    finally {
        return endOfQueue;
    }
}

/**
 * Creates a function that invokes `originalFunction`, with the `this` binding
 * and `arguments` of the created function, while there is no other pending 
 * excutions of `originalFunction`. Simultaneous calls to the created function
 * will be queued up.
 * 
 * @param {function} originalFunction async function to wrap
 */
const queueAsync = <T extends (...args: any[]) => Promise<any>>(originalFunction: T) => {
    let lastExcution = endOfQueue;
    const wrappedFunction = async function (this: any) {
        // 1. queue up
        const myExcution = lastExcution.then(() => originalFunction.apply(this, arguments));

        // 2. update queue tail + swipe excution result from queue
        lastExcution = overrideResult(myExcution);

        // 3. return excution result
        return myExcution;
    };
    return wrappedFunction as T;
}

const queueAsync_UNIT_TEST = () => {
    const badnight = queueAsync(i => sleep(i).then(() => { if (Math.random() > 0.5) throw new Error('uncaught error test: you should expect a console error message.') }));
    badnight(1000);
    badnight(1000);
    badnight(1000);
    badnight(1000);
    badnight(1000).finally(() => console.log('5s!'));
    badnight(1000);
    badnight(1000);
    badnight(1000);
    badnight(1000);
    badnight(1000).finally(() => console.log('10s!'));
    console.warn('Check message timestamps.');
    console.warn('Bad:');
    console.warn('1 1 1 1 1:5s');
    console.warn(' 1 1 1 1 1:10s');
    console.warn('Good:');
    console.warn('1 1 1 1 1:5s');
    console.warn('         1 1 1 1 1:10s');
}

export { sleep, yieldThread, debounceAsync, queueAsync };
export default { sleep, yieldThread, debounceAsync, queueAsync };
