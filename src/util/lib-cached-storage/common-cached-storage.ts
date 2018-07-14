/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

interface CommonCachedStorage {
    cache: { [key: string]: string | null }

    setItem(name: string, item: string): void | Promise<void>
    setJSON(name: string, item: any): void | Promise<void>
    getItem(name: string): string | null | Promise<string | null>
    getJSON(name: string): any | null | Promise<any | null>
    removeItem(name: string): void | Promise<void>
    clear(): void | Promise<void>
    clearCache(): void
    length: number | Promise<number>
    keys(): Iterable<string> | AsyncIterable<string>
    values(): Iterable<string> | AsyncIterable<string>
    entries(): Iterable<[string, string]> | AsyncIterable<[string, string]>
}

export default CommonCachedStorage;
