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
    info = '';
    styles = '';
    events = '';
    eventsHeader = '';
    pictures = '';
    fonts = '';
    lines = [] as { [attribute: string]: string }[];

    get header() {
        return this.info + this.styles;
    }

    /**
     * Load a file from arraybuffer or string
     */
    parseFile(chunk: ArrayBuffer | string) {
        const str = typeof chunk == 'string' ? chunk : new TextDecoder('utf-8').decode(chunk);
        for (let [name, content] of Object.entries(ASS.extractSections(str))) {
            if (name.match(/Script Info(?:mation)?/i)) this.info = content;
            else if (name.match(/V4\+? Styles?/i)) this.styles = content;
            else if (name.match(/Events?/i)) this.events = content;
            else if (name.match(/Pictures?/i)) this.pictures = content;
            else if (name.match(/Fonts?/i)) this.fonts = content;
        }
        this.eventsHeader = this.events.split('\n', 2).join('\n') + '\n';
        this.lines = ASS.extractSubtitleLines(this.events);
        return this;
    }

    /**
     * Extract sections from ass string
     */
    static extractSections(str: string) {
        const regexp = /^\ufeff?\[(.*)\]$/mg;
        const ret = {} as { [section: string]: string };
        let lastName: string;
        let lastIndex: number;

        const match = regexp.exec(str);
        if (match) {
            lastName = match[1];
            lastIndex = match.index;

            for (let match = regexp.exec(str); match !== null; match = regexp.exec(str)) {
                ret[lastName] = str.slice(lastIndex, match.index);

                lastName = match[1];
                lastIndex = match.index;
            }

            ret[lastName] = str.slice(lastIndex);
        }
        return ret;
    }

    /**
     * Extract subtitle lines from section Events
     */
    static extractSubtitleLines(str: string) {
        const lines = str.split('\n');
        if (lines[0] != '[Events]' && lines[0] != '[events]') throw new Error('ASSDemuxer: section is not [Events]');

        if (lines[1].indexOf('Format:') != 0 && lines[1].indexOf('format:') != 0) throw new Error('ASSDemuxer: cannot find Format definition in section [Events]');
        const format = lines[1].slice(lines[1].indexOf(':') + 1).split(',').map(e => e.trim());

        return lines.slice(2).map(line => {
            const trim = line.replace(/[d|D]ialogue:\s*/, '');
            const ret = {} as { [attribute: string]: string };

            let lastIndex = 0;
            for (let i = 0; i < format.length - 1; i++) {
                const index = trim.indexOf(',', lastIndex);
                ret[format[i]] = trim.slice(lastIndex, index);
                lastIndex = index + 1;
            }

            ret[format[format.length - 1]] = trim.slice(lastIndex);

            return ret;
        });
    }
}

export { ASS };
export default ASS;
