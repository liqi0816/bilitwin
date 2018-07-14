/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { TextDecoder } from '../util/shim.js';

class ASS {
    /**
     * Extract sections from ass string
     * @param {string} str 
     * @returns {Object} - object from sections
     */
    static extractSections(str) {
        const regex = /^\ufeff?\[(.*)\]$/mg;
        let match;
        let matchArr = [];
        while ((match = regex.exec(str)) !== null) {
            matchArr.push({ name: match[1], index: match.index });
        }
        let ret = {};
        matchArr.forEach((match, i) => ret[match.name] = str.slice(match.index, matchArr[i + 1] && matchArr[i + 1].index));
        return ret;
    }

    /**
     * Extract subtitle lines from section Events
     * @param {string} str 
     * @returns {Array<Object>} - array of subtitle lines
     */
    static extractSubtitleLines(str) {
        const lines = str.split('\n');
        if (lines[0] != '[Events]' && lines[0] != '[events]') throw new Error('ASSDemuxer: section is not [Events]');
        if (lines[1].indexOf('Format:') != 0 && lines[1].indexOf('format:') != 0) throw new Error('ASSDemuxer: cannot find Format definition in section [Events]');

        const format = lines[1].slice(lines[1].indexOf(':') + 1).split(',').map(e => e.trim());
        return lines.slice(2).map(e => {
            let j = {};
            e.replace(/[d|D]ialogue:\s*/, '')
                .match(new RegExp(new Array(format.length - 1).fill('(.*?),').join('') + '(.*)'))
                .slice(1)
                .forEach((k, index) => j[format[index]] = k)
            return j;
        });
    }

    /**
     * Create a new ASS Demuxer
     */
    constructor() {
        this.info = '';
        this.styles = '';
        this.events = '';
        this.eventsHeader = '';
        this.pictures = '';
        this.fonts = '';
        this.lines = '';
    }

    get header() {
        // return this.info + this.styles + this.eventsHeader;
        return this.info + this.styles;
    }

    /**
     * Load a file from an arraybuffer of a string
     * @param {(ArrayBuffer|string)} chunk 
     */
    parseFile(chunk) {
        const str = typeof chunk == 'string' ? chunk : new TextDecoder('utf-8').decode(chunk);
        for (let [i, j] of Object.entries(ASS.extractSections(str))) {
            if (i.match(/Script Info(?:mation)?/i)) this.info = j;
            else if (i.match(/V4\+? Styles?/i)) this.styles = j;
            else if (i.match(/Events?/i)) this.events = j;
            else if (i.match(/Pictures?/i)) this.pictures = j;
            else if (i.match(/Fonts?/i)) this.fonts = j;
        }
        this.eventsHeader = this.events.split('\n', 2).join('\n') + '\n';
        this.lines = ASS.extractSubtitleLines(this.events);
        return this;
    }
}

export { ASS };
export default ASS;
