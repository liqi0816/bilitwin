/**
 * Copyright (C) 2018 Xmader.
 * @author Xmader
 */

/**
 * @template T
 * @param {Promise<T>} promise 
 * @param {number} ms 
 * @returns {Promise< T | null >}
 */
const setTimeoutDo = (promise, ms) => {
    /** @type {Promise<null>} */
    const t = new Promise((resolve) => {
        setTimeout(() => resolve(null), ms)
    })
    return Promise.race([promise, t])
}

export { setTimeoutDo }
