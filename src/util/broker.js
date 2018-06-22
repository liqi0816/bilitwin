/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class Broker extends EventTarget {
    constructor() {
        super();
        this.routes = {};
    }

    register(name, interface, unregisterEvent = 'destroy') {
        if (!this.routes[name]) this.routes[name] = [];
        this.routes[name].push(interface);
        const unregister = this.unregister.bind(this, interface);
        if (unregisterEvent) {
            if (typeof interface.addEventListener !== 'function') {
                throw new TypeError(`Broker.prototype.register: we have a truthy unregisterEvent, so interface instanceof EventTarget is expected. However interface.addEventListener is ${interface.addEventListener}.`);
            }
            interface.addEventListener(unregisterEvent, unregister, { once: true });
        }
        this.dispatchEvent(new CustomEvent(`register:${name}`, { detail: interface }));
        return unregister;
    }

    unregister(interface) {
        this.dispatchEvent(new CustomEvent(`unregister:${name}`, { detail: interface }));
        return this.routes[name] = this.routes[name].filter(e => e != interface);
    }

    async require(name) {
        if (this.routes[name] && this.routes[name].length) {
            return this.routes[name][Math.floor(Math.random() * this.routes[name].length)];
        }
        else {
            return new Promise(callback => this.addEventListener(`register:${name}`, ({ detail }) => callback(detail), { once: true }));
        }
    }

    requireAll(name) {
        return this.routes[name] || [];
    }

    watch(name, callback) {
        if (this.routes[name] && this.routes[name].length) {
            for (const e of this.routes[name]) {
                callback(e);
            }
        }
        const e = ({ detail }) => callback(detail);
        this.addEventListener(`register:${name}`, e);
        return this.removeEventListener.bind(this, `register:${name}`, e);
    }
}
