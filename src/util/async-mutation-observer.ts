/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface MutationGeneratorInit {
    freeEntry?: boolean
    autoClose?: boolean
}

class MutationGenerator extends MutationObserver implements AsyncIterable<MutationRecord[]>{
    promise: Promise<MutationRecord[]>
    resolve!: (mutations: MutationRecord[]) => void
    freeEntry: boolean
    autoClose: boolean

    constructor({ freeEntry = false, autoClose = true } = {} as MutationGeneratorInit) {
        super(mutations => {
            this.resolve(mutations);
            this.promise = new Promise(resolve => this.resolve = resolve);
        });
        this.promise = new Promise(resolve => this.resolve = resolve);
        this.freeEntry = freeEntry;
        this.autoClose = autoClose;
    }

    next() {
        return this.promise;
    }

    return() {
        this.disconnect();
        return Promise.resolve({ value: undefined as unknown as MutationRecord[], done: true });
    }

    get throw() {
        return this.return;
    }

    async *[Symbol.asyncIterator]() {
        if (this.freeEntry) yield [];
        try {
            while (true) {
                yield this.promise;
            }
        }
        finally {
            if (this.autoClose) {
                this.disconnect();
            }
        }
    }
}

const __UNIT_TEST = async () => {
    const observer = new MutationGenerator();
    observer.observe(document.body, { childList: true, subtree: true });
    let count = 0;
    for await (const mutations of observer) {
        console.log(mutations);
        count++;
        if (count === 3) break;
    }
    console.warn('=====end-of-unit-test====');
}

export { MutationGenerator }
export default MutationGenerator;
