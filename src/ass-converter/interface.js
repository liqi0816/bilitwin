/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import parser from './extension/danmaku/parser.js';
import genLayout from './extension/danmaku/layout.js';
import assembleASS from './extension/danmaku/ass.js';
import { normalize } from './extension/options/ext_options.js';
import { convertToBlob } from './extension/download/download.js';

const parseXML = (xml) => parser.bilibili(xml).danmaku;

const genASS = async (danmaku, option = {}) => {
    option = normalize(option);
    const layout = await genLayout(danmaku, option);
    const ass = assembleASS({
        content: danmaku,
        layout,
        meta: {
            name: option && option.title || 'danmaku',
            url: option && option.originalURL || 'anonymous xml',
        }
    }, option);
    return ass;
}

const genASSBlob = async (danmaku, option = {}) => convertToBlob(await genASS(danmaku, option));

export { parseXML, genASS, genASSBlob };
export default { parseXML, genASS, genASSBlob };
