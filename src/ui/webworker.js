/***
 * Copyright (C) 2018 Xmader. All Rights Reserved.
 * 
 * @author Xmader
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import TwentyFourDataView from '../util/twenty-four-dataview.js';
import FLVTag from '../flvparser/flv-tag.js';
import FLV from '../flvparser/flv.js';

export class WebWorker extends Worker {
    constructor(stringUrl) {
        super(stringUrl)

        this.importFnAsAScript(TwentyFourDataView)
        this.importFnAsAScript(FLVTag)
        this.importFnAsAScript(FLV)
    }

    /**
     * @param {string} method 
     * @param {*} data 
     */
    async getReturnValue(method, data) {
        const callbackNum = window.crypto.getRandomValues(new Uint32Array(1))[0]

        this.postMessage([
            method,
            data,
            callbackNum
        ])

        return await new Promise((resolve, reject) => {
            this.addEventListener("message", (e) => {
                const [_method, incomingData, _callbackNum] = e.data
                if (_callbackNum == callbackNum) {
                    if (_method == method) {
                        resolve(incomingData)
                    } else if (_method == "error") {
                        console.error(incomingData)
                        reject(new Error("Web Worker 内部错误"))
                    }
                }
            })
        })
    }

    async registerAllMethods() {
        const methods = await this.getReturnValue("getAllMethods")

        methods.forEach(method => {
            Object.defineProperty(this, method, {
                value: (arg) => this.getReturnValue(method, arg)
            })
        })
    }

    /**
     * @param {Function | ClassDecorator} c 
     */
    importFnAsAScript(c) {
        const blob = new Blob([c.toString()], { type: 'application/javascript' })
        return this.getReturnValue("importScripts", URL.createObjectURL(blob))
    }

    /**
     * @param {() => void} fn 
     */
    static fromAFunction(fn) {
        const blob = new Blob(['(' + fn.toString() + ')()'], { type: 'application/javascript' })
        return new WebWorker(URL.createObjectURL(blob))
    }
}

// 用于批量下载的 Web Worker , 请将函数中的内容想象成一个独立的js文件
export const BatchDownloadWorkerFn = () => {

    class BatchDownloadWorker {
        async mergeFLVFiles(files) {
            return await FLV.mergeBlobs(files);
        }

        /**
         * 引入脚本与库
         * @param  {string[]} scripts 
         */
        importScripts(...scripts) {
            importScripts(...scripts)
        }

        getAllMethods() {
            return Object.getOwnPropertyNames(BatchDownloadWorker.prototype).slice(1, -1)
        }
    }

    const worker = new BatchDownloadWorker()

    onmessage = async (e) => {
        const [method, incomingData, callbackNum] = e.data

        try {
            const returnValue = await worker[method](incomingData)
            if (returnValue) {
                postMessage([
                    method,
                    returnValue,
                    callbackNum
                ])
            }
        } catch (e) {
            postMessage([
                "error",
                e.message,
                callbackNum
            ])
            throw e
        }
    }
}


