var embeddedHTML = `<html>

<body>
    <p>
        加载文件…… loading files...
        <progress value="0" max="100" id="fileProgress"></progress>
    </p>
    <p>
        构建mkv…… building mkv...
        <progress value="0" max="100" id="mkvProgress"></progress>
    </p>
    <p>
        <a id="a" download="merged.mkv">merged.mkv</a>
    </p>
    <footer>
        author qli5 &lt;goodlq11[at](163|gmail).com&gt;
    </footer>
    <script>
var FLVASS2MKV = (function () {
'use strict';

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const _navigator = typeof navigator === 'object' && navigator || { userAgent: 'chrome' };

const _Blob = typeof Blob === 'function' && Blob || class {
    constructor(array) {
        return Buffer.concat(array.map(Buffer.from.bind(Buffer)));
    }
};

const _TextEncoder = typeof TextEncoder === 'function' && TextEncoder || class {
    /**
     * @param {string} chunk 
     * @returns {Uint8Array}
     */
    encode(chunk) {
        return Buffer.from(chunk, 'utf-8');
    }
};

const _TextDecoder = typeof TextDecoder === 'function' && TextDecoder || class extends require('string_decoder').StringDecoder {
    /**
     * @param {ArrayBuffer} chunk 
     * @returns {string}
     */
    decode(chunk) {
        return this.end(Buffer.from(chunk));
    }
};

/***
 * The FLV demuxer is from flv.js
 * 
 * Copyright (C) 2016 Bilibili. All Rights Reserved.
 *
 * @author zheng qian <xqq@xqq.im>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import FLVDemuxer from 'flv.js/src/demux/flv-demuxer';
// ..import Log from '../utils/logger.js';
const Log = {
    e: console.error.bind(console),
    w: console.warn.bind(console),
    i: console.log.bind(console),
    v: console.log.bind(console),
};

// ..import AMF from './amf-parser.js';
// ....import Log from '../utils/logger.js';
// ....import decodeUTF8 from '../utils/utf8-conv.js';
function checkContinuation(uint8array, start, checkLength) {
    let array = uint8array;
    if (start + checkLength < array.length) {
        while (checkLength--) {
            if ((array[++start] & 0xC0) !== 0x80)
                return false;
        }
        return true;
    } else {
        return false;
    }
}

function decodeUTF8(uint8array) {
    let out = [];
    let input = uint8array;
    let i = 0;
    let length = uint8array.length;

    while (i < length) {
        if (input[i] < 0x80) {
            out.push(String.fromCharCode(input[i]));
            ++i;
            continue;
        } else if (input[i] < 0xC0) {
            // fallthrough
        } else if (input[i] < 0xE0) {
            if (checkContinuation(input, i, 1)) {
                let ucs4 = (input[i] & 0x1F) << 6 | (input[i + 1] & 0x3F);
                if (ucs4 >= 0x80) {
                    out.push(String.fromCharCode(ucs4 & 0xFFFF));
                    i += 2;
                    continue;
                }
            }
        } else if (input[i] < 0xF0) {
            if (checkContinuation(input, i, 2)) {
                let ucs4 = (input[i] & 0xF) << 12 | (input[i + 1] & 0x3F) << 6 | input[i + 2] & 0x3F;
                if (ucs4 >= 0x800 && (ucs4 & 0xF800) !== 0xD800) {
                    out.push(String.fromCharCode(ucs4 & 0xFFFF));
                    i += 3;
                    continue;
                }
            }
        } else if (input[i] < 0xF8) {
            if (checkContinuation(input, i, 3)) {
                let ucs4 = (input[i] & 0x7) << 18 | (input[i + 1] & 0x3F) << 12
                    | (input[i + 2] & 0x3F) << 6 | (input[i + 3] & 0x3F);
                if (ucs4 > 0x10000 && ucs4 < 0x110000) {
                    ucs4 -= 0x10000;
                    out.push(String.fromCharCode((ucs4 >>> 10) | 0xD800));
                    out.push(String.fromCharCode((ucs4 & 0x3FF) | 0xDC00));
                    i += 4;
                    continue;
                }
            }
        }
        out.push(String.fromCharCode(0xFFFD));
        ++i;
    }

    return out.join('');
}

// ....import {IllegalStateException} from '../utils/exception.js';
class IllegalStateException extends Error { }

let le = (function () {
    let buf = new ArrayBuffer(2);
    (new DataView(buf)).setInt16(0, 256, true);  // little-endian write
    return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE
})();

class AMF {

    static parseScriptData(arrayBuffer, dataOffset, dataSize) {
        let data = {};

        try {
            let name = AMF.parseValue(arrayBuffer, dataOffset, dataSize);
            let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);

            data[name.data] = value.data;
        } catch (e) {
            Log.e('AMF', e.toString());
        }

        return data;
    }

    static parseObject(arrayBuffer, dataOffset, dataSize) {
        if (dataSize < 3) {
            throw new IllegalStateException('Data not enough when parse ScriptDataObject');
        }
        let name = AMF.parseString(arrayBuffer, dataOffset, dataSize);
        let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);
        let isObjectEnd = value.objectEnd;

        return {
            data: {
                name: name.data,
                value: value.data
            },
            size: name.size + value.size,
            objectEnd: isObjectEnd
        };
    }

    static parseVariable(arrayBuffer, dataOffset, dataSize) {
        return AMF.parseObject(arrayBuffer, dataOffset, dataSize);
    }

    static parseString(arrayBuffer, dataOffset, dataSize) {
        if (dataSize < 2) {
            throw new IllegalStateException('Data not enough when parse String');
        }
        let v = new DataView(arrayBuffer, dataOffset, dataSize);
        let length = v.getUint16(0, !le);

        let str;
        if (length > 0) {
            str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 2, length));
        } else {
            str = '';
        }

        return {
            data: str,
            size: 2 + length
        };
    }

    static parseLongString(arrayBuffer, dataOffset, dataSize) {
        if (dataSize < 4) {
            throw new IllegalStateException('Data not enough when parse LongString');
        }
        let v = new DataView(arrayBuffer, dataOffset, dataSize);
        let length = v.getUint32(0, !le);

        let str;
        if (length > 0) {
            str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 4, length));
        } else {
            str = '';
        }

        return {
            data: str,
            size: 4 + length
        };
    }

    static parseDate(arrayBuffer, dataOffset, dataSize) {
        if (dataSize < 10) {
            throw new IllegalStateException('Data size invalid when parse Date');
        }
        let v = new DataView(arrayBuffer, dataOffset, dataSize);
        let timestamp = v.getFloat64(0, !le);
        let localTimeOffset = v.getInt16(8, !le);
        timestamp += localTimeOffset * 60 * 1000;  // get UTC time

        return {
            data: new Date(timestamp),
            size: 8 + 2
        };
    }

    static parseValue(arrayBuffer, dataOffset, dataSize) {
        if (dataSize < 1) {
            throw new IllegalStateException('Data not enough when parse Value');
        }

        let v = new DataView(arrayBuffer, dataOffset, dataSize);

        let offset = 1;
        let type = v.getUint8(0);
        let value;
        let objectEnd = false;

        try {
            switch (type) {
                case 0:  // Number(Double) type
                    value = v.getFloat64(1, !le);
                    offset += 8;
                    break;
                case 1: {  // Boolean type
                    let b = v.getUint8(1);
                    value = b ? true : false;
                    offset += 1;
                    break;
                }
                case 2: {  // String type
                    let amfstr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);
                    value = amfstr.data;
                    offset += amfstr.size;
                    break;
                }
                case 3: { // Object(s) type
                    value = {};
                    let terminal = 0;  // workaround for malformed Objects which has missing ScriptDataObjectEnd
                    if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
                        terminal = 3;
                    }
                    while (offset < dataSize - 4) {  // 4 === type(UI8) + ScriptDataObjectEnd(UI24)
                        let amfobj = AMF.parseObject(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);
                        if (amfobj.objectEnd)
                            break;
                        value[amfobj.data.name] = amfobj.data.value;
                        offset += amfobj.size;
                    }
                    if (offset <= dataSize - 3) {
                        let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;
                        if (marker === 9) {
                            offset += 3;
                        }
                    }
                    break;
                }
                case 8: { // ECMA array type (Mixed array)
                    value = {};
                    offset += 4;  // ECMAArrayLength(UI32)
                    let terminal = 0;  // workaround for malformed MixedArrays which has missing ScriptDataObjectEnd
                    if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
                        terminal = 3;
                    }
                    while (offset < dataSize - 8) {  // 8 === type(UI8) + ECMAArrayLength(UI32) + ScriptDataVariableEnd(UI24)
                        let amfvar = AMF.parseVariable(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);
                        if (amfvar.objectEnd)
                            break;
                        value[amfvar.data.name] = amfvar.data.value;
                        offset += amfvar.size;
                    }
                    if (offset <= dataSize - 3) {
                        let marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;
                        if (marker === 9) {
                            offset += 3;
                        }
                    }
                    break;
                }
                case 9:  // ScriptDataObjectEnd
                    value = undefined;
                    offset = 1;
                    objectEnd = true;
                    break;
                case 10: {  // Strict array type
                    // ScriptDataValue[n]. NOTE: according to video_file_format_spec_v10_1.pdf
                    value = [];
                    let strictArrayLength = v.getUint32(1, !le);
                    offset += 4;
                    for (let i = 0; i < strictArrayLength; i++) {
                        let val = AMF.parseValue(arrayBuffer, dataOffset + offset, dataSize - offset);
                        value.push(val.data);
                        offset += val.size;
                    }
                    break;
                }
                case 11: {  // Date type
                    let date = AMF.parseDate(arrayBuffer, dataOffset + 1, dataSize - 1);
                    value = date.data;
                    offset += date.size;
                    break;
                }
                case 12: {  // Long string type
                    let amfLongStr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);
                    value = amfLongStr.data;
                    offset += amfLongStr.size;
                    break;
                }
                default:
                    // ignore and skip
                    offset = dataSize;
                    Log.w('AMF', 'Unsupported AMF value type ' + type);
            }
        } catch (e) {
            Log.e('AMF', e.toString());
        }

        return {
            data: value,
            size: offset,
            objectEnd: objectEnd
        };
    }

}

// ..import SPSParser from './sps-parser.js';
// ....import ExpGolomb from './exp-golomb.js';
// ......import {IllegalStateException, InvalidArgumentException} from '../utils/exception.js';
class InvalidArgumentException extends Error { }

class ExpGolomb {

    constructor(uint8array) {
        this.TAG = 'ExpGolomb';

        this._buffer = uint8array;
        this._buffer_index = 0;
        this._total_bytes = uint8array.byteLength;
        this._total_bits = uint8array.byteLength * 8;
        this._current_word = 0;
        this._current_word_bits_left = 0;
    }

    destroy() {
        this._buffer = null;
    }

    _fillCurrentWord() {
        let buffer_bytes_left = this._total_bytes - this._buffer_index;
        if (buffer_bytes_left <= 0)
            throw new IllegalStateException('ExpGolomb: _fillCurrentWord() but no bytes available');

        let bytes_read = Math.min(4, buffer_bytes_left);
        let word = new Uint8Array(4);
        word.set(this._buffer.subarray(this._buffer_index, this._buffer_index + bytes_read));
        this._current_word = new DataView(word.buffer).getUint32(0, false);

        this._buffer_index += bytes_read;
        this._current_word_bits_left = bytes_read * 8;
    }

    readBits(bits) {
        if (bits > 32)
            throw new InvalidArgumentException('ExpGolomb: readBits() bits exceeded max 32bits!');

        if (bits <= this._current_word_bits_left) {
            let result = this._current_word >>> (32 - bits);
            this._current_word <<= bits;
            this._current_word_bits_left -= bits;
            return result;
        }

        let result = this._current_word_bits_left ? this._current_word : 0;
        result = result >>> (32 - this._current_word_bits_left);
        let bits_need_left = bits - this._current_word_bits_left;

        this._fillCurrentWord();
        let bits_read_next = Math.min(bits_need_left, this._current_word_bits_left);

        let result2 = this._current_word >>> (32 - bits_read_next);
        this._current_word <<= bits_read_next;
        this._current_word_bits_left -= bits_read_next;

        result = (result << bits_read_next) | result2;
        return result;
    }

    readBool() {
        return this.readBits(1) === 1;
    }

    readByte() {
        return this.readBits(8);
    }

    _skipLeadingZero() {
        let zero_count;
        for (zero_count = 0; zero_count < this._current_word_bits_left; zero_count++) {
            if (0 !== (this._current_word & (0x80000000 >>> zero_count))) {
                this._current_word <<= zero_count;
                this._current_word_bits_left -= zero_count;
                return zero_count;
            }
        }
        this._fillCurrentWord();
        return zero_count + this._skipLeadingZero();
    }

    readUEG() {  // unsigned exponential golomb
        let leading_zeros = this._skipLeadingZero();
        return this.readBits(leading_zeros + 1) - 1;
    }

    readSEG() {  // signed exponential golomb
        let value = this.readUEG();
        if (value & 0x01) {
            return (value + 1) >>> 1;
        } else {
            return -1 * (value >>> 1);
        }
    }

}

class SPSParser {

    static _ebsp2rbsp(uint8array) {
        let src = uint8array;
        let src_length = src.byteLength;
        let dst = new Uint8Array(src_length);
        let dst_idx = 0;

        for (let i = 0; i < src_length; i++) {
            if (i >= 2) {
                // Unescape: Skip 0x03 after 00 00
                if (src[i] === 0x03 && src[i - 1] === 0x00 && src[i - 2] === 0x00) {
                    continue;
                }
            }
            dst[dst_idx] = src[i];
            dst_idx++;
        }

        return new Uint8Array(dst.buffer, 0, dst_idx);
    }

    static parseSPS(uint8array) {
        let rbsp = SPSParser._ebsp2rbsp(uint8array);
        let gb = new ExpGolomb(rbsp);

        gb.readByte();
        let profile_idc = gb.readByte();  // profile_idc
        gb.readByte();  // constraint_set_flags[5] + reserved_zero[3]
        let level_idc = gb.readByte();  // level_idc
        gb.readUEG();  // seq_parameter_set_id

        let profile_string = SPSParser.getProfileString(profile_idc);
        let level_string = SPSParser.getLevelString(level_idc);
        let chroma_format_idc = 1;
        let chroma_format = 420;
        let chroma_format_table = [0, 420, 422, 444];
        let bit_depth = 8;

        if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 ||
            profile_idc === 244 || profile_idc === 44 || profile_idc === 83 ||
            profile_idc === 86 || profile_idc === 118 || profile_idc === 128 ||
            profile_idc === 138 || profile_idc === 144) {

            chroma_format_idc = gb.readUEG();
            if (chroma_format_idc === 3) {
                gb.readBits(1);  // separate_colour_plane_flag
            }
            if (chroma_format_idc <= 3) {
                chroma_format = chroma_format_table[chroma_format_idc];
            }

            bit_depth = gb.readUEG() + 8;  // bit_depth_luma_minus8
            gb.readUEG();  // bit_depth_chroma_minus8
            gb.readBits(1);  // qpprime_y_zero_transform_bypass_flag
            if (gb.readBool()) {  // seq_scaling_matrix_present_flag
                let scaling_list_count = (chroma_format_idc !== 3) ? 8 : 12;
                for (let i = 0; i < scaling_list_count; i++) {
                    if (gb.readBool()) {  // seq_scaling_list_present_flag
                        if (i < 6) {
                            SPSParser._skipScalingList(gb, 16);
                        } else {
                            SPSParser._skipScalingList(gb, 64);
                        }
                    }
                }
            }
        }
        gb.readUEG();  // log2_max_frame_num_minus4
        let pic_order_cnt_type = gb.readUEG();
        if (pic_order_cnt_type === 0) {
            gb.readUEG();  // log2_max_pic_order_cnt_lsb_minus_4
        } else if (pic_order_cnt_type === 1) {
            gb.readBits(1);  // delta_pic_order_always_zero_flag
            gb.readSEG();  // offset_for_non_ref_pic
            gb.readSEG();  // offset_for_top_to_bottom_field
            let num_ref_frames_in_pic_order_cnt_cycle = gb.readUEG();
            for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i++) {
                gb.readSEG();  // offset_for_ref_frame
            }
        }
        gb.readUEG();  // max_num_ref_frames
        gb.readBits(1);  // gaps_in_frame_num_value_allowed_flag

        let pic_width_in_mbs_minus1 = gb.readUEG();
        let pic_height_in_map_units_minus1 = gb.readUEG();

        let frame_mbs_only_flag = gb.readBits(1);
        if (frame_mbs_only_flag === 0) {
            gb.readBits(1);  // mb_adaptive_frame_field_flag
        }
        gb.readBits(1);  // direct_8x8_inference_flag

        let frame_crop_left_offset = 0;
        let frame_crop_right_offset = 0;
        let frame_crop_top_offset = 0;
        let frame_crop_bottom_offset = 0;

        let frame_cropping_flag = gb.readBool();
        if (frame_cropping_flag) {
            frame_crop_left_offset = gb.readUEG();
            frame_crop_right_offset = gb.readUEG();
            frame_crop_top_offset = gb.readUEG();
            frame_crop_bottom_offset = gb.readUEG();
        }

        let sar_width = 1, sar_height = 1;
        let fps = 0, fps_fixed = true, fps_num = 0, fps_den = 0;

        let vui_parameters_present_flag = gb.readBool();
        if (vui_parameters_present_flag) {
            if (gb.readBool()) {  // aspect_ratio_info_present_flag
                let aspect_ratio_idc = gb.readByte();
                let sar_w_table = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2];
                let sar_h_table = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33, 99, 3, 2, 1];

                if (aspect_ratio_idc > 0 && aspect_ratio_idc < 16) {
                    sar_width = sar_w_table[aspect_ratio_idc - 1];
                    sar_height = sar_h_table[aspect_ratio_idc - 1];
                } else if (aspect_ratio_idc === 255) {
                    sar_width = gb.readByte() << 8 | gb.readByte();
                    sar_height = gb.readByte() << 8 | gb.readByte();
                }
            }

            if (gb.readBool()) {  // overscan_info_present_flag
                gb.readBool();  // overscan_appropriate_flag
            }
            if (gb.readBool()) {  // video_signal_type_present_flag
                gb.readBits(4);  // video_format & video_full_range_flag
                if (gb.readBool()) {  // colour_description_present_flag
                    gb.readBits(24);  // colour_primaries & transfer_characteristics & matrix_coefficients
                }
            }
            if (gb.readBool()) {  // chroma_loc_info_present_flag
                gb.readUEG();  // chroma_sample_loc_type_top_field
                gb.readUEG();  // chroma_sample_loc_type_bottom_field
            }
            if (gb.readBool()) {  // timing_info_present_flag
                let num_units_in_tick = gb.readBits(32);
                let time_scale = gb.readBits(32);
                fps_fixed = gb.readBool();  // fixed_frame_rate_flag

                fps_num = time_scale;
                fps_den = num_units_in_tick * 2;
                fps = fps_num / fps_den;
            }
        }

        let sarScale = 1;
        if (sar_width !== 1 || sar_height !== 1) {
            sarScale = sar_width / sar_height;
        }

        let crop_unit_x = 0, crop_unit_y = 0;
        if (chroma_format_idc === 0) {
            crop_unit_x = 1;
            crop_unit_y = 2 - frame_mbs_only_flag;
        } else {
            let sub_wc = (chroma_format_idc === 3) ? 1 : 2;
            let sub_hc = (chroma_format_idc === 1) ? 2 : 1;
            crop_unit_x = sub_wc;
            crop_unit_y = sub_hc * (2 - frame_mbs_only_flag);
        }

        let codec_width = (pic_width_in_mbs_minus1 + 1) * 16;
        let codec_height = (2 - frame_mbs_only_flag) * ((pic_height_in_map_units_minus1 + 1) * 16);

        codec_width -= (frame_crop_left_offset + frame_crop_right_offset) * crop_unit_x;
        codec_height -= (frame_crop_top_offset + frame_crop_bottom_offset) * crop_unit_y;

        let present_width = Math.ceil(codec_width * sarScale);

        gb.destroy();
        gb = null;

        return {
            profile_string: profile_string,  // baseline, high, high10, ...
            level_string: level_string,  // 3, 3.1, 4, 4.1, 5, 5.1, ...
            bit_depth: bit_depth,  // 8bit, 10bit, ...
            chroma_format: chroma_format,  // 4:2:0, 4:2:2, ...
            chroma_format_string: SPSParser.getChromaFormatString(chroma_format),

            frame_rate: {
                fixed: fps_fixed,
                fps: fps,
                fps_den: fps_den,
                fps_num: fps_num
            },

            sar_ratio: {
                width: sar_width,
                height: sar_height
            },

            codec_size: {
                width: codec_width,
                height: codec_height
            },

            present_size: {
                width: present_width,
                height: codec_height
            }
        };
    }

    static _skipScalingList(gb, count) {
        let last_scale = 8, next_scale = 8;
        let delta_scale = 0;
        for (let i = 0; i < count; i++) {
            if (next_scale !== 0) {
                delta_scale = gb.readSEG();
                next_scale = (last_scale + delta_scale + 256) % 256;
            }
            last_scale = (next_scale === 0) ? last_scale : next_scale;
        }
    }

    static getProfileString(profile_idc) {
        switch (profile_idc) {
            case 66:
                return 'Baseline';
            case 77:
                return 'Main';
            case 88:
                return 'Extended';
            case 100:
                return 'High';
            case 110:
                return 'High10';
            case 122:
                return 'High422';
            case 244:
                return 'High444';
            default:
                return 'Unknown';
        }
    }

    static getLevelString(level_idc) {
        return (level_idc / 10).toFixed(1);
    }

    static getChromaFormatString(chroma) {
        switch (chroma) {
            case 420:
                return '4:2:0';
            case 422:
                return '4:2:2';
            case 444:
                return '4:4:4';
            default:
                return 'Unknown';
        }
    }

}

// ..import DemuxErrors from './demux-errors.js';
const DemuxErrors = {
    OK: 'OK',
    FORMAT_ERROR: 'FormatError',
    FORMAT_UNSUPPORTED: 'FormatUnsupported',
    CODEC_UNSUPPORTED: 'CodecUnsupported'
};

// ..import MediaInfo from '../core/media-info.js';
class MediaInfo {

    constructor() {
        this.mimeType = null;
        this.duration = null;

        this.hasAudio = null;
        this.hasVideo = null;
        this.audioCodec = null;
        this.videoCodec = null;
        this.audioDataRate = null;
        this.videoDataRate = null;

        this.audioSampleRate = null;
        this.audioChannelCount = null;

        this.width = null;
        this.height = null;
        this.fps = null;
        this.profile = null;
        this.level = null;
        this.chromaFormat = null;
        this.sarNum = null;
        this.sarDen = null;

        this.metadata = null;
        this.segments = null;  // MediaInfo[]
        this.segmentCount = null;
        this.hasKeyframesIndex = null;
        this.keyframesIndex = null;
    }

    isComplete() {
        let audioInfoComplete = (this.hasAudio === false) ||
            (this.hasAudio === true &&
                this.audioCodec != null &&
                this.audioSampleRate != null &&
                this.audioChannelCount != null);

        let videoInfoComplete = (this.hasVideo === false) ||
            (this.hasVideo === true &&
                this.videoCodec != null &&
                this.width != null &&
                this.height != null &&
                this.fps != null &&
                this.profile != null &&
                this.level != null &&
                this.chromaFormat != null &&
                this.sarNum != null &&
                this.sarDen != null);

        // keyframesIndex may not be present
        return this.mimeType != null &&
            this.duration != null &&
            this.metadata != null &&
            this.hasKeyframesIndex != null &&
            audioInfoComplete &&
            videoInfoComplete;
    }

    isSeekable() {
        return this.hasKeyframesIndex === true;
    }

    getNearestKeyframe(milliseconds) {
        if (this.keyframesIndex == null) {
            return null;
        }

        let table = this.keyframesIndex;
        let keyframeIdx = this._search(table.times, milliseconds);

        return {
            index: keyframeIdx,
            milliseconds: table.times[keyframeIdx],
            fileposition: table.filepositions[keyframeIdx]
        };
    }

    _search(list, value) {
        let idx = 0;

        let last = list.length - 1;
        let mid = 0;
        let lbound = 0;
        let ubound = last;

        if (value < list[0]) {
            idx = 0;
            lbound = ubound + 1;  // skip search
        }

        while (lbound <= ubound) {
            mid = lbound + Math.floor((ubound - lbound) / 2);
            if (mid === last || (value >= list[mid] && value < list[mid + 1])) {
                idx = mid;
                break;
            } else if (list[mid] < value) {
                lbound = mid + 1;
            } else {
                ubound = mid - 1;
            }
        }

        return idx;
    }

}

function ReadBig32(array, index) {
    return ((array[index] << 24) |
        (array[index + 1] << 16) |
        (array[index + 2] << 8) |
        (array[index + 3]));
}

class FLVDemuxer {

    /**
     * Create a new FLV demuxer
     * @param {Object} probeData
     * @param {boolean} probeData.match
     * @param {number} probeData.consumed
     * @param {number} probeData.dataOffset
     * @param {booleam} probeData.hasAudioTrack
     * @param {boolean} probeData.hasVideoTrack
     * @param {*} config 
     */
    constructor(probeData, config) {
        this.TAG = 'FLVDemuxer';

        this._config = config;

        this._onError = null;
        this._onMediaInfo = null;
        this._onTrackMetadata = null;
        this._onDataAvailable = null;

        this._dataOffset = probeData.dataOffset;
        this._firstParse = true;
        this._dispatch = false;

        this._hasAudio = probeData.hasAudioTrack;
        this._hasVideo = probeData.hasVideoTrack;

        this._hasAudioFlagOverrided = false;
        this._hasVideoFlagOverrided = false;

        this._audioInitialMetadataDispatched = false;
        this._videoInitialMetadataDispatched = false;

        this._mediaInfo = new MediaInfo();
        this._mediaInfo.hasAudio = this._hasAudio;
        this._mediaInfo.hasVideo = this._hasVideo;
        this._metadata = null;
        this._audioMetadata = null;
        this._videoMetadata = null;

        this._naluLengthSize = 4;
        this._timestampBase = 0;  // int32, in milliseconds
        this._timescale = 1000;
        this._duration = 0;  // int32, in milliseconds
        this._durationOverrided = false;
        this._referenceFrameRate = {
            fixed: true,
            fps: 23.976,
            fps_num: 23976,
            fps_den: 1000
        };

        this._flvSoundRateTable = [5500, 11025, 22050, 44100, 48000];

        this._mpegSamplingRates = [
            96000, 88200, 64000, 48000, 44100, 32000,
            24000, 22050, 16000, 12000, 11025, 8000, 7350
        ];

        this._mpegAudioV10SampleRateTable = [44100, 48000, 32000, 0];
        this._mpegAudioV20SampleRateTable = [22050, 24000, 16000, 0];
        this._mpegAudioV25SampleRateTable = [11025, 12000, 8000, 0];

        this._mpegAudioL1BitRateTable = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1];
        this._mpegAudioL2BitRateTable = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1];
        this._mpegAudioL3BitRateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1];

        this._videoTrack = { type: 'video', id: 1, sequenceNumber: 0, samples: [], length: 0 };
        this._audioTrack = { type: 'audio', id: 2, sequenceNumber: 0, samples: [], length: 0 };

        this._littleEndian = (function () {
            let buf = new ArrayBuffer(2);
            (new DataView(buf)).setInt16(0, 256, true);  // little-endian write
            return (new Int16Array(buf))[0] === 256;  // platform-spec read, if equal then LE
        })();
    }

    destroy() {
        this._mediaInfo = null;
        this._metadata = null;
        this._audioMetadata = null;
        this._videoMetadata = null;
        this._videoTrack = null;
        this._audioTrack = null;

        this._onError = null;
        this._onMediaInfo = null;
        this._onTrackMetadata = null;
        this._onDataAvailable = null;
    }

    /**
     * Probe the flv data
     * @param {ArrayBuffer} buffer
     * @returns {Object} - probeData to be feed into constructor
     */
    static probe(buffer) {
        let data = new Uint8Array(buffer);
        let mismatch = { match: false };

        if (data[0] !== 0x46 || data[1] !== 0x4C || data[2] !== 0x56 || data[3] !== 0x01) {
            return mismatch;
        }

        let hasAudio = ((data[4] & 4) >>> 2) !== 0;
        let hasVideo = (data[4] & 1) !== 0;

        let offset = ReadBig32(data, 5);

        if (offset < 9) {
            return mismatch;
        }

        return {
            match: true,
            consumed: offset,
            dataOffset: offset,
            hasAudioTrack: hasAudio,
            hasVideoTrack: hasVideo
        };
    }

    bindDataSource(loader) {
        loader.onDataArrival = this.parseChunks.bind(this);
        return this;
    }

    // prototype: function(type: string, metadata: any): void
    get onTrackMetadata() {
        return this._onTrackMetadata;
    }

    set onTrackMetadata(callback) {
        this._onTrackMetadata = callback;
    }

    // prototype: function(mediaInfo: MediaInfo): void
    get onMediaInfo() {
        return this._onMediaInfo;
    }

    set onMediaInfo(callback) {
        this._onMediaInfo = callback;
    }

    // prototype: function(type: number, info: string): void
    get onError() {
        return this._onError;
    }

    set onError(callback) {
        this._onError = callback;
    }

    // prototype: function(videoTrack: any, audioTrack: any): void
    get onDataAvailable() {
        return this._onDataAvailable;
    }

    set onDataAvailable(callback) {
        this._onDataAvailable = callback;
    }

    // timestamp base for output samples, must be in milliseconds
    get timestampBase() {
        return this._timestampBase;
    }

    set timestampBase(base) {
        this._timestampBase = base;
    }

    get overridedDuration() {
        return this._duration;
    }

    // Force-override media duration. Must be in milliseconds, int32
    set overridedDuration(duration) {
        this._durationOverrided = true;
        this._duration = duration;
        this._mediaInfo.duration = duration;
    }

    // Force-override audio track present flag, boolean
    set overridedHasAudio(hasAudio) {
        this._hasAudioFlagOverrided = true;
        this._hasAudio = hasAudio;
        this._mediaInfo.hasAudio = hasAudio;
    }

    // Force-override video track present flag, boolean
    set overridedHasVideo(hasVideo) {
        this._hasVideoFlagOverrided = true;
        this._hasVideo = hasVideo;
        this._mediaInfo.hasVideo = hasVideo;
    }

    resetMediaInfo() {
        this._mediaInfo = new MediaInfo();
    }

    _isInitialMetadataDispatched() {
        if (this._hasAudio && this._hasVideo) {  // both audio & video
            return this._audioInitialMetadataDispatched && this._videoInitialMetadataDispatched;
        }
        if (this._hasAudio && !this._hasVideo) {  // audio only
            return this._audioInitialMetadataDispatched;
        }
        if (!this._hasAudio && this._hasVideo) {  // video only
            return this._videoInitialMetadataDispatched;
        }
        return false;
    }

    // function parseChunks(chunk: ArrayBuffer, byteStart: number): number;
    parseChunks(chunk, byteStart) {
        if (!this._onError || !this._onMediaInfo || !this._onTrackMetadata || !this._onDataAvailable) {
            throw new IllegalStateException('Flv: onError & onMediaInfo & onTrackMetadata & onDataAvailable callback must be specified');
        }

        // qli5: fix nonzero byteStart
        let offset = byteStart || 0;
        let le = this._littleEndian;

        if (byteStart === 0) {  // buffer with FLV header
            if (chunk.byteLength > 13) {
                let probeData = FLVDemuxer.probe(chunk);
                offset = probeData.dataOffset;
            } else {
                return 0;
            }
        }

        if (this._firstParse) {  // handle PreviousTagSize0 before Tag1
            this._firstParse = false;
            if (offset !== this._dataOffset) {
                Log.w(this.TAG, 'First time parsing but chunk byteStart invalid!');
            }

            let v = new DataView(chunk, offset);
            let prevTagSize0 = v.getUint32(0, !le);
            if (prevTagSize0 !== 0) {
                Log.w(this.TAG, 'PrevTagSize0 !== 0 !!!');
            }
            offset += 4;
        }

        while (offset < chunk.byteLength) {
            this._dispatch = true;

            let v = new DataView(chunk, offset);

            if (offset + 11 + 4 > chunk.byteLength) {
                // data not enough for parsing an flv tag
                break;
            }

            let tagType = v.getUint8(0);
            let dataSize = v.getUint32(0, !le) & 0x00FFFFFF;

            if (offset + 11 + dataSize + 4 > chunk.byteLength) {
                // data not enough for parsing actual data body
                break;
            }

            if (tagType !== 8 && tagType !== 9 && tagType !== 18) {
                Log.w(this.TAG, \`Unsupported tag type \${tagType}, skipped\`);
                // consume the whole tag (skip it)
                offset += 11 + dataSize + 4;
                continue;
            }

            let ts2 = v.getUint8(4);
            let ts1 = v.getUint8(5);
            let ts0 = v.getUint8(6);
            let ts3 = v.getUint8(7);

            let timestamp = ts0 | (ts1 << 8) | (ts2 << 16) | (ts3 << 24);

            let streamId = v.getUint32(7, !le) & 0x00FFFFFF;
            if (streamId !== 0) {
                Log.w(this.TAG, 'Meet tag which has StreamID != 0!');
            }

            let dataOffset = offset + 11;

            switch (tagType) {
                case 8:  // Audio
                    this._parseAudioData(chunk, dataOffset, dataSize, timestamp);
                    break;
                case 9:  // Video
                    this._parseVideoData(chunk, dataOffset, dataSize, timestamp, byteStart + offset);
                    break;
                case 18:  // ScriptDataObject
                    this._parseScriptData(chunk, dataOffset, dataSize);
                    break;
            }

            let prevTagSize = v.getUint32(11 + dataSize, !le);
            if (prevTagSize !== 11 + dataSize) {
                Log.w(this.TAG, \`Invalid PrevTagSize \${prevTagSize}\`);
            }

            offset += 11 + dataSize + 4;  // tagBody + dataSize + prevTagSize
        }

        // dispatch parsed frames to consumer (typically, the remuxer)
        if (this._isInitialMetadataDispatched()) {
            if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {
                this._onDataAvailable(this._audioTrack, this._videoTrack);
            }
        }

        return offset;  // consumed bytes, just equals latest offset index
    }

    _parseScriptData(arrayBuffer, dataOffset, dataSize) {
        let scriptData = AMF.parseScriptData(arrayBuffer, dataOffset, dataSize);

        if (scriptData.hasOwnProperty('onMetaData')) {
            if (scriptData.onMetaData == null || typeof scriptData.onMetaData !== 'object') {
                Log.w(this.TAG, 'Invalid onMetaData structure!');
                return;
            }
            if (this._metadata) {
                Log.w(this.TAG, 'Found another onMetaData tag!');
            }
            this._metadata = scriptData;
            let onMetaData = this._metadata.onMetaData;

            if (typeof onMetaData.hasAudio === 'boolean') {  // hasAudio
                if (this._hasAudioFlagOverrided === false) {
                    this._hasAudio = onMetaData.hasAudio;
                    this._mediaInfo.hasAudio = this._hasAudio;
                }
            }
            if (typeof onMetaData.hasVideo === 'boolean') {  // hasVideo
                if (this._hasVideoFlagOverrided === false) {
                    this._hasVideo = onMetaData.hasVideo;
                    this._mediaInfo.hasVideo = this._hasVideo;
                }
            }
            if (typeof onMetaData.audiodatarate === 'number') {  // audiodatarate
                this._mediaInfo.audioDataRate = onMetaData.audiodatarate;
            }
            if (typeof onMetaData.videodatarate === 'number') {  // videodatarate
                this._mediaInfo.videoDataRate = onMetaData.videodatarate;
            }
            if (typeof onMetaData.width === 'number') {  // width
                this._mediaInfo.width = onMetaData.width;
            }
            if (typeof onMetaData.height === 'number') {  // height
                this._mediaInfo.height = onMetaData.height;
            }
            if (typeof onMetaData.duration === 'number') {  // duration
                if (!this._durationOverrided) {
                    let duration = Math.floor(onMetaData.duration * this._timescale);
                    this._duration = duration;
                    this._mediaInfo.duration = duration;
                }
            } else {
                this._mediaInfo.duration = 0;
            }
            if (typeof onMetaData.framerate === 'number') {  // framerate
                let fps_num = Math.floor(onMetaData.framerate * 1000);
                if (fps_num > 0) {
                    let fps = fps_num / 1000;
                    this._referenceFrameRate.fixed = true;
                    this._referenceFrameRate.fps = fps;
                    this._referenceFrameRate.fps_num = fps_num;
                    this._referenceFrameRate.fps_den = 1000;
                    this._mediaInfo.fps = fps;
                }
            }
            if (typeof onMetaData.keyframes === 'object') {  // keyframes
                this._mediaInfo.hasKeyframesIndex = true;
                let keyframes = onMetaData.keyframes;
                this._mediaInfo.keyframesIndex = this._parseKeyframesIndex(keyframes);
                onMetaData.keyframes = null;  // keyframes has been extracted, remove it
            } else {
                this._mediaInfo.hasKeyframesIndex = false;
            }
            this._dispatch = false;
            this._mediaInfo.metadata = onMetaData;
            Log.v(this.TAG, 'Parsed onMetaData');
            if (this._mediaInfo.isComplete()) {
                this._onMediaInfo(this._mediaInfo);
            }
        }
    }

    _parseKeyframesIndex(keyframes) {
        let times = [];
        let filepositions = [];

        // ignore first keyframe which is actually AVC Sequence Header (AVCDecoderConfigurationRecord)
        for (let i = 1; i < keyframes.times.length; i++) {
            let time = this._timestampBase + Math.floor(keyframes.times[i] * 1000);
            times.push(time);
            filepositions.push(keyframes.filepositions[i]);
        }

        return {
            times: times,
            filepositions: filepositions
        };
    }

    _parseAudioData(arrayBuffer, dataOffset, dataSize, tagTimestamp) {
        if (dataSize <= 1) {
            Log.w(this.TAG, 'Flv: Invalid audio packet, missing SoundData payload!');
            return;
        }

        if (this._hasAudioFlagOverrided === true && this._hasAudio === false) {
            // If hasAudio: false indicated explicitly in MediaDataSource,
            // Ignore all the audio packets
            return;
        }

        let le = this._littleEndian;
        let v = new DataView(arrayBuffer, dataOffset, dataSize);

        let soundSpec = v.getUint8(0);

        let soundFormat = soundSpec >>> 4;
        if (soundFormat !== 2 && soundFormat !== 10) {  // MP3 or AAC
            this._onError(DemuxErrors.CODEC_UNSUPPORTED, 'Flv: Unsupported audio codec idx: ' + soundFormat);
            return;
        }

        let soundRate = 0;
        let soundRateIndex = (soundSpec & 12) >>> 2;
        if (soundRateIndex >= 0 && soundRateIndex <= 4) {
            soundRate = this._flvSoundRateTable[soundRateIndex];
        } else {
            this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid audio sample rate idx: ' + soundRateIndex);
            return;
        }
        let soundType = (soundSpec & 1);


        let meta = this._audioMetadata;
        let track = this._audioTrack;

        if (!meta) {
            if (this._hasAudio === false && this._hasAudioFlagOverrided === false) {
                this._hasAudio = true;
                this._mediaInfo.hasAudio = true;
            }

            // initial metadata
            meta = this._audioMetadata = {};
            meta.type = 'audio';
            meta.id = track.id;
            meta.timescale = this._timescale;
            meta.duration = this._duration;
            meta.audioSampleRate = soundRate;
            meta.channelCount = (soundType === 0 ? 1 : 2);
        }

        if (soundFormat === 10) {  // AAC
            let aacData = this._parseAACAudioData(arrayBuffer, dataOffset + 1, dataSize - 1);
            if (aacData == undefined) {
                return;
            }

            if (aacData.packetType === 0) {  // AAC sequence header (AudioSpecificConfig)
                if (meta.config) {
                    Log.w(this.TAG, 'Found another AudioSpecificConfig!');
                }
                let misc = aacData.data;
                meta.audioSampleRate = misc.samplingRate;
                meta.channelCount = misc.channelCount;
                meta.codec = misc.codec;
                meta.originalCodec = misc.originalCodec;
                meta.config = misc.config;
                // added by qli5
                meta.configRaw = misc.configRaw;
                // The decode result of an aac sample is 1024 PCM samples
                meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale;
                Log.v(this.TAG, 'Parsed AudioSpecificConfig');

                if (this._isInitialMetadataDispatched()) {
                    // Non-initial metadata, force dispatch (or flush) parsed frames to remuxer
                    if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {
                        this._onDataAvailable(this._audioTrack, this._videoTrack);
                    }
                } else {
                    this._audioInitialMetadataDispatched = true;
                }
                // then notify new metadata
                this._dispatch = false;
                this._onTrackMetadata('audio', meta);

                let mi = this._mediaInfo;
                mi.audioCodec = meta.originalCodec;
                mi.audioSampleRate = meta.audioSampleRate;
                mi.audioChannelCount = meta.channelCount;
                if (mi.hasVideo) {
                    if (mi.videoCodec != null) {
                        mi.mimeType = 'video/x-flv; codecs="' + mi.videoCodec + ',' + mi.audioCodec + '"';
                    }
                } else {
                    mi.mimeType = 'video/x-flv; codecs="' + mi.audioCodec + '"';
                }
                if (mi.isComplete()) {
                    this._onMediaInfo(mi);
                }
            } else if (aacData.packetType === 1) {  // AAC raw frame data
                let dts = this._timestampBase + tagTimestamp;
                let aacSample = { unit: aacData.data, length: aacData.data.byteLength, dts: dts, pts: dts };
                track.samples.push(aacSample);
                track.length += aacData.data.length;
            } else {
                Log.e(this.TAG, \`Flv: Unsupported AAC data type \${aacData.packetType}\`);
            }
        } else if (soundFormat === 2) {  // MP3
            if (!meta.codec) {
                // We need metadata for mp3 audio track, extract info from frame header
                let misc = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, true);
                if (misc == undefined) {
                    return;
                }
                meta.audioSampleRate = misc.samplingRate;
                meta.channelCount = misc.channelCount;
                meta.codec = misc.codec;
                meta.originalCodec = misc.originalCodec;
                // The decode result of an mp3 sample is 1152 PCM samples
                meta.refSampleDuration = 1152 / meta.audioSampleRate * meta.timescale;
                Log.v(this.TAG, 'Parsed MPEG Audio Frame Header');

                this._audioInitialMetadataDispatched = true;
                this._onTrackMetadata('audio', meta);

                let mi = this._mediaInfo;
                mi.audioCodec = meta.codec;
                mi.audioSampleRate = meta.audioSampleRate;
                mi.audioChannelCount = meta.channelCount;
                mi.audioDataRate = misc.bitRate;
                if (mi.hasVideo) {
                    if (mi.videoCodec != null) {
                        mi.mimeType = 'video/x-flv; codecs="' + mi.videoCodec + ',' + mi.audioCodec + '"';
                    }
                } else {
                    mi.mimeType = 'video/x-flv; codecs="' + mi.audioCodec + '"';
                }
                if (mi.isComplete()) {
                    this._onMediaInfo(mi);
                }
            }

            // This packet is always a valid audio packet, extract it
            let data = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, false);
            if (data == undefined) {
                return;
            }
            let dts = this._timestampBase + tagTimestamp;
            let mp3Sample = { unit: data, length: data.byteLength, dts: dts, pts: dts };
            track.samples.push(mp3Sample);
            track.length += data.length;
        }
    }

    _parseAACAudioData(arrayBuffer, dataOffset, dataSize) {
        if (dataSize <= 1) {
            Log.w(this.TAG, 'Flv: Invalid AAC packet, missing AACPacketType or/and Data!');
            return;
        }

        let result = {};
        let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);

        result.packetType = array[0];

        if (array[0] === 0) {
            result.data = this._parseAACAudioSpecificConfig(arrayBuffer, dataOffset + 1, dataSize - 1);
        } else {
            result.data = array.subarray(1);
        }

        return result;
    }

    _parseAACAudioSpecificConfig(arrayBuffer, dataOffset, dataSize) {
        let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
        let config = null;

        /* Audio Object Type:
           0: Null
           1: AAC Main
           2: AAC LC
           3: AAC SSR (Scalable Sample Rate)
           4: AAC LTP (Long Term Prediction)
           5: HE-AAC / SBR (Spectral Band Replication)
           6: AAC Scalable
        */

        let audioObjectType = 0;
        let originalAudioObjectType = 0;
        let samplingIndex = 0;
        let extensionSamplingIndex = null;

        // 5 bits
        audioObjectType = originalAudioObjectType = array[0] >>> 3;
        // 4 bits
        samplingIndex = ((array[0] & 0x07) << 1) | (array[1] >>> 7);
        if (samplingIndex < 0 || samplingIndex >= this._mpegSamplingRates.length) {
            this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: AAC invalid sampling frequency index!');
            return;
        }

        let samplingFrequence = this._mpegSamplingRates[samplingIndex];

        // 4 bits
        let channelConfig = (array[1] & 0x78) >>> 3;
        if (channelConfig < 0 || channelConfig >= 8) {
            this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: AAC invalid channel configuration');
            return;
        }

        if (audioObjectType === 5) {  // HE-AAC?
            // 4 bits
            extensionSamplingIndex = ((array[1] & 0x07) << 1) | (array[2] >>> 7);
        }

        // workarounds for various browsers
        let userAgent = _navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('firefox') !== -1) {
            // firefox: use SBR (HE-AAC) if freq less than 24kHz
            if (samplingIndex >= 6) {
                audioObjectType = 5;
                config = new Array(4);
                extensionSamplingIndex = samplingIndex - 3;
            } else {  // use LC-AAC
                audioObjectType = 2;
                config = new Array(2);
                extensionSamplingIndex = samplingIndex;
            }
        } else if (userAgent.indexOf('android') !== -1) {
            // android: always use LC-AAC
            audioObjectType = 2;
            config = new Array(2);
            extensionSamplingIndex = samplingIndex;
        } else {
            // for other browsers, e.g. chrome...
            // Always use HE-AAC to make it easier to switch aac codec profile
            audioObjectType = 5;
            extensionSamplingIndex = samplingIndex;
            config = new Array(4);

            if (samplingIndex >= 6) {
                extensionSamplingIndex = samplingIndex - 3;
            } else if (channelConfig === 1) {  // Mono channel
                audioObjectType = 2;
                config = new Array(2);
                extensionSamplingIndex = samplingIndex;
            }
        }

        config[0] = audioObjectType << 3;
        config[0] |= (samplingIndex & 0x0F) >>> 1;
        config[1] = (samplingIndex & 0x0F) << 7;
        config[1] |= (channelConfig & 0x0F) << 3;
        if (audioObjectType === 5) {
            config[1] |= ((extensionSamplingIndex & 0x0F) >>> 1);
            config[2] = (extensionSamplingIndex & 0x01) << 7;
            // extended audio object type: force to 2 (LC-AAC)
            config[2] |= (2 << 2);
            config[3] = 0;
        }

        return {
            // configRaw: added by qli5
            configRaw: array,
            config: config,
            samplingRate: samplingFrequence,
            channelCount: channelConfig,
            codec: 'mp4a.40.' + audioObjectType,
            originalCodec: 'mp4a.40.' + originalAudioObjectType
        };
    }

    _parseMP3AudioData(arrayBuffer, dataOffset, dataSize, requestHeader) {
        if (dataSize < 4) {
            Log.w(this.TAG, 'Flv: Invalid MP3 packet, header missing!');
            return;
        }

        let le = this._littleEndian;
        let array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
        let result = null;

        if (requestHeader) {
            if (array[0] !== 0xFF) {
                return;
            }
            let ver = (array[1] >>> 3) & 0x03;
            let layer = (array[1] & 0x06) >> 1;

            let bitrate_index = (array[2] & 0xF0) >>> 4;
            let sampling_freq_index = (array[2] & 0x0C) >>> 2;

            let channel_mode = (array[3] >>> 6) & 0x03;
            let channel_count = channel_mode !== 3 ? 2 : 1;

            let sample_rate = 0;
            let bit_rate = 0;

            let codec = 'mp3';

            switch (ver) {
                case 0:  // MPEG 2.5
                    sample_rate = this._mpegAudioV25SampleRateTable[sampling_freq_index];
                    break;
                case 2:  // MPEG 2
                    sample_rate = this._mpegAudioV20SampleRateTable[sampling_freq_index];
                    break;
                case 3:  // MPEG 1
                    sample_rate = this._mpegAudioV10SampleRateTable[sampling_freq_index];
                    break;
            }

            switch (layer) {
                case 1:  // Layer 3
                    if (bitrate_index < this._mpegAudioL3BitRateTable.length) {
                        bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];
                    }
                    break;
                case 2:  // Layer 2
                    if (bitrate_index < this._mpegAudioL2BitRateTable.length) {
                        bit_rate = this._mpegAudioL2BitRateTable[bitrate_index];
                    }
                    break;
                case 3:  // Layer 1
                    if (bitrate_index < this._mpegAudioL1BitRateTable.length) {
                        bit_rate = this._mpegAudioL1BitRateTable[bitrate_index];
                    }
                    break;
            }

            result = {
                bitRate: bit_rate,
                samplingRate: sample_rate,
                channelCount: channel_count,
                codec: codec,
                originalCodec: codec
            };
        } else {
            result = array;
        }

        return result;
    }

    _parseVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition) {
        if (dataSize <= 1) {
            Log.w(this.TAG, 'Flv: Invalid video packet, missing VideoData payload!');
            return;
        }

        if (this._hasVideoFlagOverrided === true && this._hasVideo === false) {
            // If hasVideo: false indicated explicitly in MediaDataSource,
            // Ignore all the video packets
            return;
        }

        let spec = (new Uint8Array(arrayBuffer, dataOffset, dataSize))[0];

        let frameType = (spec & 240) >>> 4;
        let codecId = spec & 15;

        if (codecId !== 7) {
            this._onError(DemuxErrors.CODEC_UNSUPPORTED, \`Flv: Unsupported codec in video frame: \${codecId}\`);
            return;
        }

        this._parseAVCVideoPacket(arrayBuffer, dataOffset + 1, dataSize - 1, tagTimestamp, tagPosition, frameType);
    }

    _parseAVCVideoPacket(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType) {
        if (dataSize < 4) {
            Log.w(this.TAG, 'Flv: Invalid AVC packet, missing AVCPacketType or/and CompositionTime');
            return;
        }

        let le = this._littleEndian;
        let v = new DataView(arrayBuffer, dataOffset, dataSize);

        let packetType = v.getUint8(0);
        let cts = v.getUint32(0, !le) & 0x00FFFFFF;

        if (packetType === 0) {  // AVCDecoderConfigurationRecord
            this._parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset + 4, dataSize - 4);
        } else if (packetType === 1) {  // One or more Nalus
            this._parseAVCVideoData(arrayBuffer, dataOffset + 4, dataSize - 4, tagTimestamp, tagPosition, frameType, cts);
        } else if (packetType === 2) {
            // empty, AVC end of sequence
        } else {
            this._onError(DemuxErrors.FORMAT_ERROR, \`Flv: Invalid video packet type \${packetType}\`);
            return;
        }
    }

    _parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset, dataSize) {
        if (dataSize < 7) {
            Log.w(this.TAG, 'Flv: Invalid AVCDecoderConfigurationRecord, lack of data!');
            return;
        }

        let meta = this._videoMetadata;
        let track = this._videoTrack;
        let le = this._littleEndian;
        let v = new DataView(arrayBuffer, dataOffset, dataSize);

        if (!meta) {
            if (this._hasVideo === false && this._hasVideoFlagOverrided === false) {
                this._hasVideo = true;
                this._mediaInfo.hasVideo = true;
            }

            meta = this._videoMetadata = {};
            meta.type = 'video';
            meta.id = track.id;
            meta.timescale = this._timescale;
            meta.duration = this._duration;
        } else {
            if (typeof meta.avcc !== 'undefined') {
                Log.w(this.TAG, 'Found another AVCDecoderConfigurationRecord!');
            }
        }

        let version = v.getUint8(0);  // configurationVersion
        let avcProfile = v.getUint8(1);  // avcProfileIndication
        let profileCompatibility = v.getUint8(2);  // profile_compatibility
        let avcLevel = v.getUint8(3);  // AVCLevelIndication

        if (version !== 1 || avcProfile === 0) {
            this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord');
            return;
        }

        this._naluLengthSize = (v.getUint8(4) & 3) + 1;  // lengthSizeMinusOne
        if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {  // holy shit!!!
            this._onError(DemuxErrors.FORMAT_ERROR, \`Flv: Strange NaluLengthSizeMinusOne: \${this._naluLengthSize - 1}\`);
            return;
        }

        let spsCount = v.getUint8(5) & 31;  // numOfSequenceParameterSets
        if (spsCount === 0) {
            this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord: No SPS');
            return;
        } else if (spsCount > 1) {
            Log.w(this.TAG, \`Flv: Strange AVCDecoderConfigurationRecord: SPS Count = \${spsCount}\`);
        }

        let offset = 6;

        for (let i = 0; i < spsCount; i++) {
            let len = v.getUint16(offset, !le);  // sequenceParameterSetLength
            offset += 2;

            if (len === 0) {
                continue;
            }

            // Notice: Nalu without startcode header (00 00 00 01)
            let sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);
            offset += len;

            let config = SPSParser.parseSPS(sps);
            if (i !== 0) {
                // ignore other sps's config
                continue;
            }

            meta.codecWidth = config.codec_size.width;
            meta.codecHeight = config.codec_size.height;
            meta.presentWidth = config.present_size.width;
            meta.presentHeight = config.present_size.height;

            meta.profile = config.profile_string;
            meta.level = config.level_string;
            meta.bitDepth = config.bit_depth;
            meta.chromaFormat = config.chroma_format;
            meta.sarRatio = config.sar_ratio;
            meta.frameRate = config.frame_rate;

            if (config.frame_rate.fixed === false ||
                config.frame_rate.fps_num === 0 ||
                config.frame_rate.fps_den === 0) {
                meta.frameRate = this._referenceFrameRate;
            }

            let fps_den = meta.frameRate.fps_den;
            let fps_num = meta.frameRate.fps_num;
            meta.refSampleDuration = meta.timescale * (fps_den / fps_num);

            let codecArray = sps.subarray(1, 4);
            let codecString = 'avc1.';
            for (let j = 0; j < 3; j++) {
                let h = codecArray[j].toString(16);
                if (h.length < 2) {
                    h = '0' + h;
                }
                codecString += h;
            }
            meta.codec = codecString;

            let mi = this._mediaInfo;
            mi.width = meta.codecWidth;
            mi.height = meta.codecHeight;
            mi.fps = meta.frameRate.fps;
            mi.profile = meta.profile;
            mi.level = meta.level;
            mi.chromaFormat = config.chroma_format_string;
            mi.sarNum = meta.sarRatio.width;
            mi.sarDen = meta.sarRatio.height;
            mi.videoCodec = codecString;

            if (mi.hasAudio) {
                if (mi.audioCodec != null) {
                    mi.mimeType = 'video/x-flv; codecs="' + mi.videoCodec + ',' + mi.audioCodec + '"';
                }
            } else {
                mi.mimeType = 'video/x-flv; codecs="' + mi.videoCodec + '"';
            }
            if (mi.isComplete()) {
                this._onMediaInfo(mi);
            }
        }

        let ppsCount = v.getUint8(offset);  // numOfPictureParameterSets
        if (ppsCount === 0) {
            this._onError(DemuxErrors.FORMAT_ERROR, 'Flv: Invalid AVCDecoderConfigurationRecord: No PPS');
            return;
        } else if (ppsCount > 1) {
            Log.w(this.TAG, \`Flv: Strange AVCDecoderConfigurationRecord: PPS Count = \${ppsCount}\`);
        }

        offset++;

        for (let i = 0; i < ppsCount; i++) {
            let len = v.getUint16(offset, !le);  // pictureParameterSetLength
            offset += 2;

            if (len === 0) {
                continue;
            }

            // pps is useless for extracting video information
            offset += len;
        }

        meta.avcc = new Uint8Array(dataSize);
        meta.avcc.set(new Uint8Array(arrayBuffer, dataOffset, dataSize), 0);
        Log.v(this.TAG, 'Parsed AVCDecoderConfigurationRecord');

        if (this._isInitialMetadataDispatched()) {
            // flush parsed frames
            if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {
                this._onDataAvailable(this._audioTrack, this._videoTrack);
            }
        } else {
            this._videoInitialMetadataDispatched = true;
        }
        // notify new metadata
        this._dispatch = false;
        this._onTrackMetadata('video', meta);
    }

    _parseAVCVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType, cts) {
        let le = this._littleEndian;
        let v = new DataView(arrayBuffer, dataOffset, dataSize);

        let units = [], length = 0;

        let offset = 0;
        const lengthSize = this._naluLengthSize;
        let dts = this._timestampBase + tagTimestamp;
        let keyframe = (frameType === 1);  // from FLV Frame Type constants
        let refIdc = 1; // added by qli5

        while (offset < dataSize) {
            if (offset + 4 >= dataSize) {
                Log.w(this.TAG, \`Malformed Nalu near timestamp \${dts}, offset = \${offset}, dataSize = \${dataSize}\`);
                break;  // data not enough for next Nalu
            }
            // Nalu with length-header (AVC1)
            let naluSize = v.getUint32(offset, !le);  // Big-Endian read
            if (lengthSize === 3) {
                naluSize >>>= 8;
            }
            if (naluSize > dataSize - lengthSize) {
                Log.w(this.TAG, \`Malformed Nalus near timestamp \${dts}, NaluSize > DataSize!\`);
                return;
            }

            let unitType = v.getUint8(offset + lengthSize) & 0x1F;
            // added by qli5
            refIdc = v.getUint8(offset + lengthSize) & 0x60;

            if (unitType === 5) {  // IDR
                keyframe = true;
            }

            let data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);
            let unit = { type: unitType, data: data };
            units.push(unit);
            length += data.byteLength;

            offset += lengthSize + naluSize;
        }

        if (units.length) {
            let track = this._videoTrack;
            let avcSample = {
                units: units,
                length: length,
                isKeyframe: keyframe,
                refIdc: refIdc,
                dts: dts,
                cts: cts,
                pts: (dts + cts)
            };
            if (keyframe) {
                avcSample.fileposition = tagPosition;
            }
            track.samples.push(avcSample);
            track.length += length;
        }
    }

}

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class ASS {
    /**
     * Extract sections from ass string
     * @param {string} str 
     * @returns {Object} - object from sections
     */
    static extractSections(str) {
        const regex = /^\\ufeff?\\[(.*)\\]\$/mg;
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
        const lines = str.split('\\n');
        if (lines[0] != '[Events]' && lines[0] != '[events]') throw new Error('ASSDemuxer: section is not [Events]');
        if (lines[1].indexOf('Format:') != 0 && lines[1].indexOf('format:') != 0) throw new Error('ASSDemuxer: cannot find Format definition in section [Events]');

        const format = lines[1].slice(lines[1].indexOf(':') + 1).split(',').map(e => e.trim());
        return lines.slice(2).map(e => {
            let j = {};
            e.replace(/[d|D]ialogue:\\s*/, '')
                .match(new RegExp(new Array(format.length - 1).fill('(.*?),').join('') + '(.*)'))
                .slice(1)
                .forEach((k, index) => j[format[index]] = k);
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
        const str = typeof chunk == 'string' ? chunk : new _TextDecoder('utf-8').decode(chunk);
        for (let [i, j] of Object.entries(ASS.extractSections(str))) {
            if (i.match(/Script Info(?:mation)?/i)) this.info = j;
            else if (i.match(/V4\\+? Styles?/i)) this.styles = j;
            else if (i.match(/Events?/i)) this.events = j;
            else if (i.match(/Pictures?/i)) this.pictures = j;
            else if (i.match(/Fonts?/i)) this.fonts = j;
        }
        this.eventsHeader = this.events.split('\\n', 2).join('\\n') + '\\n';
        this.lines = ASS.extractSubtitleLines(this.events);
        return this;
    }
}

/** Detect free variable \`global\` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable \`self\`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [\`toStringTag\`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of \`baseGetTag\` which ignores \`Symbol.toStringTag\` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw \`toStringTag\`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto\$1 = Object.prototype;

/**
 * Used to resolve the
 * [\`toStringTag\`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString\$1 = objectProto\$1.toString;

/**
 * Converts \`value\` to a string using \`Object.prototype.toString\`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString\$1.call(value);
}

/** \`Object#toString\` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag\$1 = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of \`getTag\` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the \`toStringTag\`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag\$1 && symToStringTag\$1 in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Checks if \`value\` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of \`Object\`. (e.g. arrays, functions, objects, regexes, \`new Number(0)\`, and \`new String('')\`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns \`true\` if \`value\` is an object, else \`false\`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** \`Object#toString\` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if \`value\` is classified as a \`Function\` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns \`true\` if \`value\` is a function, else \`false\`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of \`Object#toString\` avoids issues with the \`typeof\` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+\$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if \`func\` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns \`true\` if \`func\` is masked, else \`false\`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts \`func\` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Used to match \`RegExp\`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\\\^\$.*+?()[\\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\\[object .+?Constructor\\]\$/;

/** Used for built-in method references. */
var funcProto\$1 = Function.prototype,
    objectProto\$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString\$1 = funcProto\$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty\$1 = objectProto\$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString\$1.call(hasOwnProperty\$1).replace(reRegExpChar, '\\\\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, '\$1.*?') + '\$'
);

/**
 * The base implementation of \`_.isNative\` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns \`true\` if \`value\` is a native function,
 *  else \`false\`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Gets the value at \`key\` of \`object\`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Gets the native function at \`key\` of \`object\`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else \`undefined\`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes \`key\` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns \`true\` if the entry was removed, else \`false\`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/** Used to stand-in for \`undefined\` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto\$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty\$2 = objectProto\$3.hasOwnProperty;

/**
 * Gets the hash value for \`key\`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty\$2.call(data, key) ? data[key] : undefined;
}

/** Used for built-in method references. */
var objectProto\$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty\$3 = objectProto\$4.hasOwnProperty;

/**
 * Checks if a hash value for \`key\` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns \`true\` if an entry for \`key\` exists, else \`false\`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty\$3.call(data, key);
}

/** Used to stand-in for \`undefined\` hash values. */
var HASH_UNDEFINED\$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash \`key\` to \`value\`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED\$1 : value;
  return this;
}

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to \`Hash\`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Performs a
 * [\`SameValueZero\`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns \`true\` if the values are equivalent, else \`false\`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Gets the index at which the \`key\` is found in \`array\` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else \`-1\`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes \`key\` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns \`true\` if the entry was removed, else \`false\`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for \`key\`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for \`key\` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns \`true\` if an entry for \`key\` exists, else \`false\`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache \`key\` to \`value\`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to \`ListCache\`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Checks if \`value\` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns \`true\` if \`value\` is suitable, else \`false\`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Gets the data for \`map\`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Removes \`key\` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns \`true\` if the entry was removed, else \`false\`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for \`key\`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for \`key\` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns \`true\` if an entry for \`key\` exists, else \`false\`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map \`key\` to \`value\`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to \`MapCache\`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of \`func\`. If \`resolver\` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The \`func\`
 * is invoked with the \`this\` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the \`cache\` property on the memoized
 * function. Its creation may be customized by replacing the \`_.memoize.Cache\`
 * constructor with one whose instances implement the
 * [\`Map\`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of \`clear\`, \`delete\`, \`get\`, \`has\`, and \`set\`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace \`_.memoize.Cache\`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose \`MapCache\`.
memoize.Cache = MapCache;

const numberToByteArray = (num, byteLength = getNumberByteLength(num)) => {
    var byteArray;
    if (byteLength == 1) {
        byteArray = new DataView(new ArrayBuffer(1));
        byteArray.setUint8(0, num);
    }
    else if (byteLength == 2) {
        byteArray = new DataView(new ArrayBuffer(2));
        byteArray.setUint16(0, num);
    }
    else if (byteLength == 3) {
        byteArray = new DataView(new ArrayBuffer(3));
        byteArray.setUint8(0, num >> 16);
        byteArray.setUint16(1, num & 0xffff);
    }
    else if (byteLength == 4) {
        byteArray = new DataView(new ArrayBuffer(4));
        byteArray.setUint32(0, num);
    }
    else if (num < 0xffffffff) {
        byteArray = new DataView(new ArrayBuffer(5));
        byteArray.setUint32(1, num);
    }
    else if (byteLength == 5) {
        byteArray = new DataView(new ArrayBuffer(5));
        byteArray.setUint8(0, num / 0x100000000 | 0);
        byteArray.setUint32(1, num % 0x100000000);
    }
    else if (byteLength == 6) {
        byteArray = new DataView(new ArrayBuffer(6));
        byteArray.setUint16(0, num / 0x100000000 | 0);
        byteArray.setUint32(2, num % 0x100000000);
    }
    else if (byteLength == 7) {
        byteArray = new DataView(new ArrayBuffer(7));
        byteArray.setUint8(0, num / 0x1000000000000 | 0);
        byteArray.setUint16(1, num / 0x100000000 & 0xffff);
        byteArray.setUint32(3, num % 0x100000000);
    }
    else if (byteLength == 8) {
        byteArray = new DataView(new ArrayBuffer(8));
        byteArray.setUint32(0, num / 0x100000000 | 0);
        byteArray.setUint32(4, num % 0x100000000);
    }
    else {
        throw new Error("EBML.typedArrayUtils.numberToByteArray: byte length must be less than or equal to 8");
    }
    return new Uint8Array(byteArray.buffer);
};
const stringToByteArray = memoize((str) => {
    return Uint8Array.from(Array.from(str).map(_ => _.codePointAt(0)));
});
function getNumberByteLength(num) {
    if (num < 0) {
        throw new Error("EBML.typedArrayUtils.getNumberByteLength: negative number not implemented");
    }
    else if (num < 0x100) {
        return 1;
    }
    else if (num < 0x10000) {
        return 2;
    }
    else if (num < 0x1000000) {
        return 3;
    }
    else if (num < 0x100000000) {
        return 4;
    }
    else if (num < 0x10000000000) {
        return 5;
    }
    else if (num < 0x1000000000000) {
        return 6;
    }
    else if (num < 0x20000000000000) {
        return 7;
    }
    else {
        throw new Error("EBML.typedArrayUtils.getNumberByteLength: number exceeds Number.MAX_SAFE_INTEGER");
    }
}
const int16Bit = memoize((num) => {
    const ab = new ArrayBuffer(2);
    new DataView(ab).setInt16(0, num);
    return new Uint8Array(ab);
});
const float32bit = memoize((num) => {
    const ab = new ArrayBuffer(4);
    new DataView(ab).setFloat32(0, num);
    return new Uint8Array(ab);
});
const dumpBytes = (b) => {
    return Array.from(new Uint8Array(b)).map(_ => \`0x\${_.toString(16)}\`).join(", ");
};

class Value {
    constructor(bytes) {
        this.bytes = bytes;
    }
    write(buf, pos) {
        buf.set(this.bytes, pos);
        return pos + this.bytes.length;
    }
    countSize() {
        return this.bytes.length;
    }
}
class Element {
    constructor(id, children, isSizeUnknown) {
        this.id = id;
        this.children = children;
        const bodySize = this.children.reduce((p, c) => p + c.countSize(), 0);
        this.sizeMetaData = isSizeUnknown ?
            UNKNOWN_SIZE :
            vintEncode(numberToByteArray(bodySize, getEBMLByteLength(bodySize)));
        this.size = this.id.length + this.sizeMetaData.length + bodySize;
    }
    write(buf, pos) {
        buf.set(this.id, pos);
        buf.set(this.sizeMetaData, pos + this.id.length);
        return this.children.reduce((p, c) => c.write(buf, p), pos + this.id.length + this.sizeMetaData.length);
    }
    countSize() {
        return this.size;
    }
}
const bytes = memoize((data) => {
    return new Value(data);
});
const number = memoize((num) => {
    return bytes(numberToByteArray(num));
});
const vintEncodedNumber = memoize((num) => {
    return bytes(vintEncode(numberToByteArray(num, getEBMLByteLength(num))));
});
const int16 = memoize((num) => {
    return bytes(int16Bit(num));
});
const float = memoize((num) => {
    return bytes(float32bit(num));
});
const string = memoize((str) => {
    return bytes(stringToByteArray(str));
});
const element = (id, child) => {
    return new Element(id, Array.isArray(child) ? child : [child], false);
};
const unknownSizeElement = (id, child) => {
    return new Element(id, Array.isArray(child) ? child : [child], true);
};
const build = (v) => {
    const b = new Uint8Array(v.countSize());
    v.write(b, 0);
    return b;
};
const getEBMLByteLength = (num) => {
    if (num < 0x7f) {
        return 1;
    }
    else if (num < 0x3fff) {
        return 2;
    }
    else if (num < 0x1fffff) {
        return 3;
    }
    else if (num < 0xfffffff) {
        return 4;
    }
    else if (num < 0x7ffffffff) {
        return 5;
    }
    else if (num < 0x3ffffffffff) {
        return 6;
    }
    else if (num < 0x1ffffffffffff) {
        return 7;
    }
    else if (num < 0x20000000000000) {
        return 8;
    }
    else if (num < 0xffffffffffffff) {
        throw new Error("EBMLgetEBMLByteLength: number exceeds Number.MAX_SAFE_INTEGER");
    }
    else {
        throw new Error("EBMLgetEBMLByteLength: data size must be less than or equal to " + (Math.pow(2, 56) - 2));
    }
};
const UNKNOWN_SIZE = new Uint8Array([0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
const vintEncode = (byteArray) => {
    byteArray[0] = getSizeMask(byteArray.length) | byteArray[0];
    return byteArray;
};
const getSizeMask = (byteLength) => {
    return 0x80 >> (byteLength - 1);
};

/**
 * @see https://www.matroska.org/technical/specs/index.html
 */
const ID = {
    EBML: Uint8Array.of(0x1A, 0x45, 0xDF, 0xA3),
    EBMLVersion: Uint8Array.of(0x42, 0x86),
    EBMLReadVersion: Uint8Array.of(0x42, 0xF7),
    EBMLMaxIDLength: Uint8Array.of(0x42, 0xF2),
    EBMLMaxSizeLength: Uint8Array.of(0x42, 0xF3),
    DocType: Uint8Array.of(0x42, 0x82),
    DocTypeVersion: Uint8Array.of(0x42, 0x87),
    DocTypeReadVersion: Uint8Array.of(0x42, 0x85),
    Void: Uint8Array.of(0xEC),
    CRC32: Uint8Array.of(0xBF),
    Segment: Uint8Array.of(0x18, 0x53, 0x80, 0x67),
    SeekHead: Uint8Array.of(0x11, 0x4D, 0x9B, 0x74),
    Seek: Uint8Array.of(0x4D, 0xBB),
    SeekID: Uint8Array.of(0x53, 0xAB),
    SeekPosition: Uint8Array.of(0x53, 0xAC),
    Info: Uint8Array.of(0x15, 0x49, 0xA9, 0x66),
    SegmentUID: Uint8Array.of(0x73, 0xA4),
    SegmentFilename: Uint8Array.of(0x73, 0x84),
    PrevUID: Uint8Array.of(0x3C, 0xB9, 0x23),
    PrevFilename: Uint8Array.of(0x3C, 0x83, 0xAB),
    NextUID: Uint8Array.of(0x3E, 0xB9, 0x23),
    NextFilename: Uint8Array.of(0x3E, 0x83, 0xBB),
    SegmentFamily: Uint8Array.of(0x44, 0x44),
    ChapterTranslate: Uint8Array.of(0x69, 0x24),
    ChapterTranslateEditionUID: Uint8Array.of(0x69, 0xFC),
    ChapterTranslateCodec: Uint8Array.of(0x69, 0xBF),
    ChapterTranslateID: Uint8Array.of(0x69, 0xA5),
    TimecodeScale: Uint8Array.of(0x2A, 0xD7, 0xB1),
    Duration: Uint8Array.of(0x44, 0x89),
    DateUTC: Uint8Array.of(0x44, 0x61),
    Title: Uint8Array.of(0x7B, 0xA9),
    MuxingApp: Uint8Array.of(0x4D, 0x80),
    WritingApp: Uint8Array.of(0x57, 0x41),
    Cluster: Uint8Array.of(0x1F, 0x43, 0xB6, 0x75),
    Timecode: Uint8Array.of(0xE7),
    SilentTracks: Uint8Array.of(0x58, 0x54),
    SilentTrackNumber: Uint8Array.of(0x58, 0xD7),
    Position: Uint8Array.of(0xA7),
    PrevSize: Uint8Array.of(0xAB),
    SimpleBlock: Uint8Array.of(0xA3),
    BlockGroup: Uint8Array.of(0xA0),
    Block: Uint8Array.of(0xA1),
    BlockAdditions: Uint8Array.of(0x75, 0xA1),
    BlockMore: Uint8Array.of(0xA6),
    BlockAddID: Uint8Array.of(0xEE),
    BlockAdditional: Uint8Array.of(0xA5),
    BlockDuration: Uint8Array.of(0x9B),
    ReferencePriority: Uint8Array.of(0xFA),
    ReferenceBlock: Uint8Array.of(0xFB),
    CodecState: Uint8Array.of(0xA4),
    DiscardPadding: Uint8Array.of(0x75, 0xA2),
    Slices: Uint8Array.of(0x8E),
    TimeSlice: Uint8Array.of(0xE8),
    LaceNumber: Uint8Array.of(0xCC),
    Tracks: Uint8Array.of(0x16, 0x54, 0xAE, 0x6B),
    TrackEntry: Uint8Array.of(0xAE),
    TrackNumber: Uint8Array.of(0xD7),
    TrackUID: Uint8Array.of(0x73, 0xC5),
    TrackType: Uint8Array.of(0x83),
    FlagEnabled: Uint8Array.of(0xB9),
    FlagDefault: Uint8Array.of(0x88),
    FlagForced: Uint8Array.of(0x55, 0xAA),
    FlagLacing: Uint8Array.of(0x9C),
    MinCache: Uint8Array.of(0x6D, 0xE7),
    MaxCache: Uint8Array.of(0x6D, 0xF8),
    DefaultDuration: Uint8Array.of(0x23, 0xE3, 0x83),
    DefaultDecodedFieldDuration: Uint8Array.of(0x23, 0x4E, 0x7A),
    MaxBlockAdditionID: Uint8Array.of(0x55, 0xEE),
    Name: Uint8Array.of(0x53, 0x6E),
    Language: Uint8Array.of(0x22, 0xB5, 0x9C),
    CodecID: Uint8Array.of(0x86),
    CodecPrivate: Uint8Array.of(0x63, 0xA2),
    CodecName: Uint8Array.of(0x25, 0x86, 0x88),
    AttachmentLink: Uint8Array.of(0x74, 0x46),
    CodecDecodeAll: Uint8Array.of(0xAA),
    TrackOverlay: Uint8Array.of(0x6F, 0xAB),
    CodecDelay: Uint8Array.of(0x56, 0xAA),
    SeekPreRoll: Uint8Array.of(0x56, 0xBB),
    TrackTranslate: Uint8Array.of(0x66, 0x24),
    TrackTranslateEditionUID: Uint8Array.of(0x66, 0xFC),
    TrackTranslateCodec: Uint8Array.of(0x66, 0xBF),
    TrackTranslateTrackID: Uint8Array.of(0x66, 0xA5),
    Video: Uint8Array.of(0xE0),
    FlagInterlaced: Uint8Array.of(0x9A),
    FieldOrder: Uint8Array.of(0x9D),
    StereoMode: Uint8Array.of(0x53, 0xB8),
    AlphaMode: Uint8Array.of(0x53, 0xC0),
    PixelWidth: Uint8Array.of(0xB0),
    PixelHeight: Uint8Array.of(0xBA),
    PixelCropBottom: Uint8Array.of(0x54, 0xAA),
    PixelCropTop: Uint8Array.of(0x54, 0xBB),
    PixelCropLeft: Uint8Array.of(0x54, 0xCC),
    PixelCropRight: Uint8Array.of(0x54, 0xDD),
    DisplayWidth: Uint8Array.of(0x54, 0xB0),
    DisplayHeight: Uint8Array.of(0x54, 0xBA),
    DisplayUnit: Uint8Array.of(0x54, 0xB2),
    AspectRatioType: Uint8Array.of(0x54, 0xB3),
    ColourSpace: Uint8Array.of(0x2E, 0xB5, 0x24),
    Colour: Uint8Array.of(0x55, 0xB0),
    MatrixCoefficients: Uint8Array.of(0x55, 0xB1),
    BitsPerChannel: Uint8Array.of(0x55, 0xB2),
    ChromaSubsamplingHorz: Uint8Array.of(0x55, 0xB3),
    ChromaSubsamplingVert: Uint8Array.of(0x55, 0xB4),
    CbSubsamplingHorz: Uint8Array.of(0x55, 0xB5),
    CbSubsamplingVert: Uint8Array.of(0x55, 0xB6),
    ChromaSitingHorz: Uint8Array.of(0x55, 0xB7),
    ChromaSitingVert: Uint8Array.of(0x55, 0xB8),
    Range: Uint8Array.of(0x55, 0xB9),
    TransferCharacteristics: Uint8Array.of(0x55, 0xBA),
    Primaries: Uint8Array.of(0x55, 0xBB),
    MaxCLL: Uint8Array.of(0x55, 0xBC),
    MaxFALL: Uint8Array.of(0x55, 0xBD),
    MasteringMetadata: Uint8Array.of(0x55, 0xD0),
    PrimaryRChromaticityX: Uint8Array.of(0x55, 0xD1),
    PrimaryRChromaticityY: Uint8Array.of(0x55, 0xD2),
    PrimaryGChromaticityX: Uint8Array.of(0x55, 0xD3),
    PrimaryGChromaticityY: Uint8Array.of(0x55, 0xD4),
    PrimaryBChromaticityX: Uint8Array.of(0x55, 0xD5),
    PrimaryBChromaticityY: Uint8Array.of(0x55, 0xD6),
    WhitePointChromaticityX: Uint8Array.of(0x55, 0xD7),
    WhitePointChromaticityY: Uint8Array.of(0x55, 0xD8),
    LuminanceMax: Uint8Array.of(0x55, 0xD9),
    LuminanceMin: Uint8Array.of(0x55, 0xDA),
    Audio: Uint8Array.of(0xE1),
    SamplingFrequency: Uint8Array.of(0xB5),
    OutputSamplingFrequency: Uint8Array.of(0x78, 0xB5),
    Channels: Uint8Array.of(0x9F),
    BitDepth: Uint8Array.of(0x62, 0x64),
    TrackOperation: Uint8Array.of(0xE2),
    TrackCombinePlanes: Uint8Array.of(0xE3),
    TrackPlane: Uint8Array.of(0xE4),
    TrackPlaneUID: Uint8Array.of(0xE5),
    TrackPlaneType: Uint8Array.of(0xE6),
    TrackJoinBlocks: Uint8Array.of(0xE9),
    TrackJoinUID: Uint8Array.of(0xED),
    ContentEncodings: Uint8Array.of(0x6D, 0x80),
    ContentEncoding: Uint8Array.of(0x62, 0x40),
    ContentEncodingOrder: Uint8Array.of(0x50, 0x31),
    ContentEncodingScope: Uint8Array.of(0x50, 0x32),
    ContentEncodingType: Uint8Array.of(0x50, 0x33),
    ContentCompression: Uint8Array.of(0x50, 0x34),
    ContentCompAlgo: Uint8Array.of(0x42, 0x54),
    ContentCompSettings: Uint8Array.of(0x42, 0x55),
    ContentEncryption: Uint8Array.of(0x50, 0x35),
    ContentEncAlgo: Uint8Array.of(0x47, 0xE1),
    ContentEncKeyID: Uint8Array.of(0x47, 0xE2),
    ContentSignature: Uint8Array.of(0x47, 0xE3),
    ContentSigKeyID: Uint8Array.of(0x47, 0xE4),
    ContentSigAlgo: Uint8Array.of(0x47, 0xE5),
    ContentSigHashAlgo: Uint8Array.of(0x47, 0xE6),
    Cues: Uint8Array.of(0x1C, 0x53, 0xBB, 0x6B),
    CuePoint: Uint8Array.of(0xBB),
    CueTime: Uint8Array.of(0xB3),
    CueTrackPositions: Uint8Array.of(0xB7),
    CueTrack: Uint8Array.of(0xF7),
    CueClusterPosition: Uint8Array.of(0xF1),
    CueRelativePosition: Uint8Array.of(0xF0),
    CueDuration: Uint8Array.of(0xB2),
    CueBlockNumber: Uint8Array.of(0x53, 0x78),
    CueCodecState: Uint8Array.of(0xEA),
    CueReference: Uint8Array.of(0xDB),
    CueRefTime: Uint8Array.of(0x96),
    Attachments: Uint8Array.of(0x19, 0x41, 0xA4, 0x69),
    AttachedFile: Uint8Array.of(0x61, 0xA7),
    FileDescription: Uint8Array.of(0x46, 0x7E),
    FileName: Uint8Array.of(0x46, 0x6E),
    FileMimeType: Uint8Array.of(0x46, 0x60),
    FileData: Uint8Array.of(0x46, 0x5C),
    FileUID: Uint8Array.of(0x46, 0xAE),
    Chapters: Uint8Array.of(0x10, 0x43, 0xA7, 0x70),
    EditionEntry: Uint8Array.of(0x45, 0xB9),
    EditionUID: Uint8Array.of(0x45, 0xBC),
    EditionFlagHidden: Uint8Array.of(0x45, 0xBD),
    EditionFlagDefault: Uint8Array.of(0x45, 0xDB),
    EditionFlagOrdered: Uint8Array.of(0x45, 0xDD),
    ChapterAtom: Uint8Array.of(0xB6),
    ChapterUID: Uint8Array.of(0x73, 0xC4),
    ChapterStringUID: Uint8Array.of(0x56, 0x54),
    ChapterTimeStart: Uint8Array.of(0x91),
    ChapterTimeEnd: Uint8Array.of(0x92),
    ChapterFlagHidden: Uint8Array.of(0x98),
    ChapterFlagEnabled: Uint8Array.of(0x45, 0x98),
    ChapterSegmentUID: Uint8Array.of(0x6E, 0x67),
    ChapterSegmentEditionUID: Uint8Array.of(0x6E, 0xBC),
    ChapterPhysicalEquiv: Uint8Array.of(0x63, 0xC3),
    ChapterTrack: Uint8Array.of(0x8F),
    ChapterTrackNumber: Uint8Array.of(0x89),
    ChapterDisplay: Uint8Array.of(0x80),
    ChapString: Uint8Array.of(0x85),
    ChapLanguage: Uint8Array.of(0x43, 0x7C),
    ChapCountry: Uint8Array.of(0x43, 0x7E),
    ChapProcess: Uint8Array.of(0x69, 0x44),
    ChapProcessCodecID: Uint8Array.of(0x69, 0x55),
    ChapProcessPrivate: Uint8Array.of(0x45, 0x0D),
    ChapProcessCommand: Uint8Array.of(0x69, 0x11),
    ChapProcessTime: Uint8Array.of(0x69, 0x22),
    ChapProcessData: Uint8Array.of(0x69, 0x33),
    Tags: Uint8Array.of(0x12, 0x54, 0xC3, 0x67),
    Tag: Uint8Array.of(0x73, 0x73),
    Targets: Uint8Array.of(0x63, 0xC0),
    TargetTypeValue: Uint8Array.of(0x68, 0xCA),
    TargetType: Uint8Array.of(0x63, 0xCA),
    TagTrackUID: Uint8Array.of(0x63, 0xC5),
    TagEditionUID: Uint8Array.of(0x63, 0xC9),
    TagChapterUID: Uint8Array.of(0x63, 0xC4),
    TagAttachmentUID: Uint8Array.of(0x63, 0xC6),
    SimpleTag: Uint8Array.of(0x67, 0xC8),
    TagName: Uint8Array.of(0x45, 0xA3),
    TagLanguage: Uint8Array.of(0x44, 0x7A),
    TagDefault: Uint8Array.of(0x44, 0x84),
    TagString: Uint8Array.of(0x44, 0x87),
    TagBinary: Uint8Array.of(0x44, 0x85),
};



var EBML = Object.freeze({
	Value: Value,
	Element: Element,
	bytes: bytes,
	number: number,
	vintEncodedNumber: vintEncodedNumber,
	int16: int16,
	float: float,
	string: string,
	element: element,
	unknownSizeElement: unknownSizeElement,
	build: build,
	getEBMLByteLength: getEBMLByteLength,
	UNKNOWN_SIZE: UNKNOWN_SIZE,
	vintEncode: vintEncode,
	getSizeMask: getSizeMask,
	ID: ID,
	numberToByteArray: numberToByteArray,
	stringToByteArray: stringToByteArray,
	getNumberByteLength: getNumberByteLength,
	int16Bit: int16Bit,
	float32bit: float32bit,
	dumpBytes: dumpBytes
});

/***
 * The EMBL builder is from simple-ebml-builder
 * 
 * Copyright 2017 ryiwamoto
 * 
 * @author ryiwamoto, qli5
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including 
 * without limitation the rights to use, copy, modify, merge, publish, 
 * distribute, sublicense, and/or sell copies of the Software, and to 
 * permit persons to whom the Software is furnished to do so, subject 
 * to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be 
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR 
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class MKV {
    constructor(config) {
        this.min = true;
        this.onprogress = null;
        Object.assign(this, config);
        this.segmentUID = MKV.randomBytes(16);
        this.trackUIDBase = Math.trunc(Math.random() * 2 ** 16);
        this.trackMetadata = { h264: null, aac: null, ass: null };
        this.duration = 0;
        this.blocks = { h264: [], aac: [], ass: [] };
    }

    static randomBytes(num) {
        return Array.from(new Array(num), () => Math.trunc(Math.random() * 256));
    }

    static textToMS(str) {
        const [, h, mm, ss, ms10] = str.match(/(\\d+):(\\d+):(\\d+).(\\d+)/);
        return h * 3600000 + mm * 60000 + ss * 1000 + ms10 * 10;
    }

    static mimeToCodecID(str) {
        if (str.startsWith('avc1')) {
            return 'V_MPEG4/ISO/AVC';
        }
        else if (str.startsWith('mp4a')) {
            return 'A_AAC';
        }
        else {
            throw new Error(\`MKVRemuxer: unknown codec \${str}\`);
        }
    }

    static uint8ArrayConcat(...array) {
        // if (Array.isArray(array[0])) array = array[0];
        if (array.length == 1) return array[0];
        if (typeof Buffer != 'undefined') return Buffer.concat(array);
        const ret = new Uint8Array(array.reduce((i, j) => i + j.byteLength, 0));
        let length = 0;
        for (let e of array) {
            ret.set(e, length);
            length += e.byteLength;
        }
        return ret;
    }

    addH264Metadata(h264) {
        this.trackMetadata.h264 = {
            codecId: MKV.mimeToCodecID(h264.codec),
            codecPrivate: h264.avcc,
            defaultDuration: h264.refSampleDuration * 1000000,
            pixelWidth: h264.codecWidth,
            pixelHeight: h264.codecHeight,
            displayWidth: h264.presentWidth,
            displayHeight: h264.presentHeight
        };
        this.duration = Math.max(this.duration, h264.duration);
    }

    addAACMetadata(aac) {
        this.trackMetadata.aac = {
            codecId: MKV.mimeToCodecID(aac.originalCodec),
            codecPrivate: aac.configRaw,
            defaultDuration: aac.refSampleDuration * 1000000,
            samplingFrequence: aac.audioSampleRate,
            channels: aac.channelCount
        };
        this.duration = Math.max(this.duration, aac.duration);
    }

    addASSMetadata(ass) {
        this.trackMetadata.ass = {
            codecId: 'S_TEXT/ASS',
            codecPrivate: new _TextEncoder().encode(ass.header)
        };
    }

    addH264Stream(h264) {
        this.blocks.h264 = this.blocks.h264.concat(h264.samples.map(e => ({
            track: 1,
            frame: MKV.uint8ArrayConcat(...e.units.map(i => i.data)),
            isKeyframe: e.isKeyframe,
            discardable: Boolean(e.refIdc),
            timestamp: e.pts,
            simple: true,
        })));
    }

    addAACStream(aac) {
        this.blocks.aac = this.blocks.aac.concat(aac.samples.map(e => ({
            track: 2,
            frame: e.unit,
            timestamp: e.pts,
            simple: true,
        })));
    }

    addASSStream(ass) {
        this.blocks.ass = this.blocks.ass.concat(ass.lines.map((e, i) => ({
            track: 3,
            frame: new _TextEncoder().encode(\`\${i},\${e['Layer'] || ''},\${e['Style'] || ''},\${e['Name'] || ''},\${e['MarginL'] || ''},\${e['MarginR'] || ''},\${e['MarginV'] || ''},\${e['Effect'] || ''},\${e['Text'] || ''}\`),
            timestamp: MKV.textToMS(e['Start']),
            duration: MKV.textToMS(e['End']) - MKV.textToMS(e['Start']),
        })));
    }

    build() {
        return new _Blob([
            this.buildHeader(),
            this.buildBody()
        ]);
    }

    buildHeader() {
        return new _Blob([EBML.build(EBML.element(EBML.ID.EBML, [
            EBML.element(EBML.ID.EBMLVersion, EBML.number(1)),
            EBML.element(EBML.ID.EBMLReadVersion, EBML.number(1)),
            EBML.element(EBML.ID.EBMLMaxIDLength, EBML.number(4)),
            EBML.element(EBML.ID.EBMLMaxSizeLength, EBML.number(8)),
            EBML.element(EBML.ID.DocType, EBML.string('matroska')),
            EBML.element(EBML.ID.DocTypeVersion, EBML.number(4)),
            EBML.element(EBML.ID.DocTypeReadVersion, EBML.number(2)),
        ]))]);
    }

    buildBody() {
        if (this.min) {
            return new _Blob([EBML.build(EBML.element(EBML.ID.Segment, [
                this.getSegmentInfo(),
                this.getTracks(),
                ...this.getClusterArray()
            ]))]);
        }
        else {
            return new _Blob([EBML.build(EBML.element(EBML.ID.Segment, [
                this.getSeekHead(),
                this.getVoid(4100),
                this.getSegmentInfo(),
                this.getTracks(),
                this.getVoid(1100),
                ...this.getClusterArray()
            ]))]);
        }
    }

    getSeekHead() {
        return EBML.element(EBML.ID.SeekHead, [
            EBML.element(EBML.ID.Seek, [
                EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Info)),
                EBML.element(EBML.ID.SeekPosition, EBML.number(4050))
            ]),
            EBML.element(EBML.ID.Seek, [
                EBML.element(EBML.ID.SeekID, EBML.bytes(EBML.ID.Tracks)),
                EBML.element(EBML.ID.SeekPosition, EBML.number(4200))
            ]),
        ]);
    }

    getVoid(length = 2000) {
        return EBML.element(EBML.ID.Void, EBML.bytes(new Uint8Array(length)));
    }

    getSegmentInfo() {
        return EBML.element(EBML.ID.Info, [
            EBML.element(EBML.ID.TimecodeScale, EBML.number(1000000)),
            EBML.element(EBML.ID.MuxingApp, EBML.string('flv.js + assparser_qli5 -> simple-ebml-builder')),
            EBML.element(EBML.ID.WritingApp, EBML.string('flvass2mkv.js by qli5')),
            EBML.element(EBML.ID.Duration, EBML.float(this.duration)),
            EBML.element(EBML.ID.SegmentUID, EBML.bytes(this.segmentUID)),
        ]);
    }

    getTracks() {
        return EBML.element(EBML.ID.Tracks, [
            this.getVideoTrackEntry(),
            this.getAudioTrackEntry(),
            this.getSubtitleTrackEntry()
        ]);
    }

    getVideoTrackEntry() {
        return EBML.element(EBML.ID.TrackEntry, [
            EBML.element(EBML.ID.TrackNumber, EBML.number(1)),
            EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 1)),
            EBML.element(EBML.ID.TrackType, EBML.number(0x01)),
            EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
            EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.h264.codecId)),
            EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.h264.codecPrivate)),
            EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.h264.defaultDuration)),
            EBML.element(EBML.ID.Language, EBML.string('und')),
            EBML.element(EBML.ID.Video, [
                EBML.element(EBML.ID.PixelWidth, EBML.number(this.trackMetadata.h264.pixelWidth)),
                EBML.element(EBML.ID.PixelHeight, EBML.number(this.trackMetadata.h264.pixelHeight)),
                EBML.element(EBML.ID.DisplayWidth, EBML.number(this.trackMetadata.h264.displayWidth)),
                EBML.element(EBML.ID.DisplayHeight, EBML.number(this.trackMetadata.h264.displayHeight)),
            ]),
        ]);
    }

    getAudioTrackEntry() {
        return EBML.element(EBML.ID.TrackEntry, [
            EBML.element(EBML.ID.TrackNumber, EBML.number(2)),
            EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 2)),
            EBML.element(EBML.ID.TrackType, EBML.number(0x02)),
            EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
            EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.aac.codecId)),
            EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.aac.codecPrivate)),
            EBML.element(EBML.ID.DefaultDuration, EBML.number(this.trackMetadata.aac.defaultDuration)),
            EBML.element(EBML.ID.Language, EBML.string('und')),
            EBML.element(EBML.ID.Audio, [
                EBML.element(EBML.ID.SamplingFrequency, EBML.float(this.trackMetadata.aac.samplingFrequence)),
                EBML.element(EBML.ID.Channels, EBML.number(this.trackMetadata.aac.channels)),
            ]),
        ]);
    }

    getSubtitleTrackEntry() {
        return EBML.element(EBML.ID.TrackEntry, [
            EBML.element(EBML.ID.TrackNumber, EBML.number(3)),
            EBML.element(EBML.ID.TrackUID, EBML.number(this.trackUIDBase + 3)),
            EBML.element(EBML.ID.TrackType, EBML.number(0x11)),
            EBML.element(EBML.ID.FlagLacing, EBML.number(0x00)),
            EBML.element(EBML.ID.CodecID, EBML.string(this.trackMetadata.ass.codecId)),
            EBML.element(EBML.ID.CodecPrivate, EBML.bytes(this.trackMetadata.ass.codecPrivate)),
            EBML.element(EBML.ID.Language, EBML.string('und')),
        ]);
    }

    getClusterArray() {
        // H264 codecState
        this.blocks.h264[0].simple = false;
        this.blocks.h264[0].codecState = this.trackMetadata.h264.codecPrivate;

        let i = 0;
        let j = 0;
        let k = 0;
        let clusterTimeCode = 0;
        let clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];
        let ret = [clusterContent];
        const progressThrottler = Math.pow(2, Math.floor(Math.log(this.blocks.h264.length >> 7) / Math.log(2))) - 1;
        for (i = 0; i < this.blocks.h264.length; i++) {
            const e = this.blocks.h264[i];
            for (; j < this.blocks.aac.length; j++) {
                if (this.blocks.aac[j].timestamp < e.timestamp) {
                    clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));
                }
                else {
                    break;
                }
            }
            for (; k < this.blocks.ass.length; k++) {
                if (this.blocks.ass[k].timestamp < e.timestamp) {
                    clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));
                }
                else {
                    break;
                }
            }
            if (e.isKeyframe/*  || clusterContent.length > 72 */) {
                // start new cluster
                clusterTimeCode = e.timestamp;
                clusterContent = [EBML.element(EBML.ID.Timecode, EBML.number(clusterTimeCode))];
                ret.push(clusterContent);
            }
            clusterContent.push(this.getBlocks(e, clusterTimeCode));
            if (this.onprogress && !(i & progressThrottler)) this.onprogress({ loaded: i, total: this.blocks.h264.length });
        }
        for (; j < this.blocks.aac.length; j++) clusterContent.push(this.getBlocks(this.blocks.aac[j], clusterTimeCode));
        for (; k < this.blocks.ass.length; k++) clusterContent.push(this.getBlocks(this.blocks.ass[k], clusterTimeCode));
        if (this.onprogress) this.onprogress({ loaded: i, total: this.blocks.h264.length });
        if (ret[0].length == 1) ret.shift();
        ret = ret.map(clusterContent => EBML.element(EBML.ID.Cluster, clusterContent));

        return ret;
    }

    getBlocks(e, clusterTimeCode) {
        if (e.simple) {
            return EBML.element(EBML.ID.SimpleBlock, [
                EBML.vintEncodedNumber(e.track),
                EBML.int16(e.timestamp - clusterTimeCode),
                EBML.bytes(e.isKeyframe ? [128] : [0]),
                EBML.bytes(e.frame)
            ]);
        }
        else {
            let blockGroupContent = [EBML.element(EBML.ID.Block, [
                EBML.vintEncodedNumber(e.track),
                EBML.int16(e.timestamp - clusterTimeCode),
                EBML.bytes([0]),
                EBML.bytes(e.frame)
            ])];
            if (typeof e.duration != 'undefined') {
                blockGroupContent.push(EBML.element(EBML.ID.BlockDuration, EBML.number(e.duration)));
            }
            if (typeof e.codecState != 'undefined') {
                blockGroupContent.push(EBML.element(EBML.ID.CodecState, EBML.bytes(e.codecState)));
            }
            return EBML.element(EBML.ID.BlockGroup, blockGroupContent);
        }
    }
}

/***
 * FLV + ASS => MKV transmuxer
 * Demux FLV into H264 + AAC stream and ASS into line stream; then
 * remux them into a MKV file.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * The FLV demuxer is from flv.js <https://github.com/Bilibili/flv.js/>
 * by zheng qian <xqq@xqq.im>, licensed under Apache 2.0.
 * 
 * The EMBL builder is from simple-ebml-builder
 * <https://www.npmjs.com/package/simple-ebml-builder> by ryiwamoto, 
 * licensed under MIT.
 */

const FLVASS2MKV = class {
    constructor(config = {}) {
        this.onflvprogress = null;
        this.onassprogress = null;
        this.onurlrevokesafe = null;
        this.onfileload = null;
        this.onmkvprogress = null;
        this.onload = null;
        Object.assign(this, config);
        this.mkvConfig = { onprogress: this.onmkvprogress };
        Object.assign(this.mkvConfig, config.mkvConfig);
    }

    /**
     * Demux FLV into H264 + AAC stream and ASS into line stream; then
     * remux them into a MKV file.
     * @param {Blob|string|ArrayBuffer} flv 
     * @param {Blob|string|ArrayBuffer} ass 
     */
    async build(flv = './samples/gen_case.flv', ass = './samples/gen_case.ass') {
        // load flv and ass as arraybuffer
        await Promise.all([
            new Promise((r, j) => {
                if (flv instanceof _Blob) {
                    const e = new FileReader();
                    e.onprogress = this.onflvprogress;
                    e.onload = () => r(flv = e.result);
                    e.onerror = j;
                    e.readAsArrayBuffer(flv);
                }
                else if (typeof flv == 'string') {
                    const e = new XMLHttpRequest();
                    e.responseType = 'arraybuffer';
                    e.onprogress = this.onflvprogress;
                    e.onload = () => r(flv = e.response);
                    e.onerror = j;
                    e.open('get', flv);
                    e.send();
                    flv = 2; // onurlrevokesafe
                }
                else if (flv instanceof ArrayBuffer) {
                    r(flv);
                }
                else {
                    j(new TypeError('flvass2mkv: flv {Blob|string|ArrayBuffer}'));
                }
                if (typeof ass != 'string' && this.onurlrevokesafe) this.onurlrevokesafe();
            }),
            new Promise((r, j) => {
                if (ass instanceof _Blob) {
                    const e = new FileReader();
                    e.onprogress = this.onflvprogress;
                    e.onload = () => r(ass = e.result);
                    e.onerror = j;
                    e.readAsArrayBuffer(ass);
                }
                else if (typeof ass == 'string') {
                    const e = new XMLHttpRequest();
                    e.responseType = 'arraybuffer';
                    e.onprogress = this.onflvprogress;
                    e.onload = () => r(ass = e.response);
                    e.onerror = j;
                    e.open('get', ass);
                    e.send();
                    ass = 2; // onurlrevokesafe
                }
                else if (ass instanceof ArrayBuffer) {
                    r(ass);
                }
                else {
                    j(new TypeError('flvass2mkv: ass {Blob|string|ArrayBuffer}'));
                }
                if (typeof flv != 'string' && this.onurlrevokesafe) this.onurlrevokesafe();
            }),
        ]);
        if (this.onfileload) this.onfileload();

        const mkv = new MKV(this.mkvConfig);

        const assParser = new ASS();
        ass = assParser.parseFile(ass);
        mkv.addASSMetadata(ass);
        mkv.addASSStream(ass);

        const flvProbeData = FLVDemuxer.probe(flv);
        const flvDemuxer = new FLVDemuxer(flvProbeData);
        let mediaInfo = null;
        let h264 = null;
        let aac = null;
        flvDemuxer.onDataAvailable = (...array) => {
            array.forEach(e => {
                if (e.type == 'video') h264 = e;
                else if (e.type == 'audio') aac = e;
                else throw new Error(\`MKVRemuxer: unrecoginzed data type \${e.type}\`);
            });
        };
        flvDemuxer.onMediaInfo = i => mediaInfo = i;
        flvDemuxer.onTrackMetadata = (i, e) => {
            if (i == 'video') mkv.addH264Metadata(e);
            else if (i == 'audio') mkv.addAACMetadata(e);
            else throw new Error(\`MKVRemuxer: unrecoginzed metadata type \${i}\`);
        };
        flvDemuxer.onError = e => { throw new Error(e); };
        const finalOffset = flvDemuxer.parseChunks(flv, flvProbeData.dataOffset);
        if (finalOffset != flv.byteLength) throw new Error('FLVDemuxer: unexpected EOF');
        mkv.addH264Stream(h264);
        mkv.addAACStream(aac);

        const ret = mkv.build();
        if (this.onload) this.onload(ret);
        return ret;
    }
};

// if nodejs then test
if (typeof window == 'undefined') {
    if (require.main == module) {
        (async () => {
            const fs = require('fs');
            const assFileName = process.argv.slice(1).find(e => e.includes('.ass')) || './samples/gen_case.ass';
            const flvFileName = process.argv.slice(1).find(e => e.includes('.flv')) || './samples/gen_case.flv';
            const assFile = fs.readFileSync(assFileName).buffer;
            const flvFile = fs.readFileSync(flvFileName).buffer;
            fs.writeFileSync('out.mkv', await new FLVASS2MKV({ onmkvprogress: console.log.bind(console) }).build(flvFile, assFile));
        })();
    }
}

return FLVASS2MKV;

}());
//# sourceMappingURL=index.js.map

</script>
    <script>
        const fileProgress = document.getElementById('fileProgress');
        const mkvProgress = document.getElementById('mkvProgress');
        const a = document.getElementById('a');
        window.exec = async option => {
            const defaultOption = {
                onflvprogress: ({ loaded, total }) => {
                    fileProgress.value = loaded;
                    fileProgress.max = total;
                },
                onfileload: () => {
                    console.timeEnd('file');
                    console.time('flvass2mkv');
                },
                onmkvprogress: ({ loaded, total }) => {
                    mkvProgress.value = loaded;
                    mkvProgress.max = total;
                },
                name: 'merged.mkv',
            };
            option = Object.assign(defaultOption, option);
            a.download = a.textContent = option.name;
            console.time('file');
            const mkv = await new FLVASS2MKV(option).build(option.flv, option.ass);
            console.timeEnd('flvass2mkv');
            return a.href = URL.createObjectURL(mkv);
        };
        
    </script>
</body>

</html>
`;

/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

class MKVTransmuxer {
    constructor(option) {
        this.workerWin = null;
        this.option = option;
    }

    /**
     * FLV + ASS => MKV entry point
     * @param {Blob|string|ArrayBuffer} flv
     * @param {Blob|string|ArrayBuffer} ass 
     * @param {string=} name 
     */
    exec(flv, ass, name) {
        // 1. Allocate for a new window
        if (!this.workerWin) this.workerWin = top.open('', undefined, ' ');

        // 2. Inject scripts
        this.workerWin.document.write(embeddedHTML);
        this.workerWin.document.close();

        // 3. Invoke exec
        if (!(this.option instanceof Object)) this.option = null;
        this.workerWin.exec(Object.assign({}, this.option, { flv, ass, name }));
        URL.revokeObjectURL(flv);
        URL.revokeObjectURL(ass);

        // 4. Free parent window
        // if (top.confirm('MKV打包中……要关掉这个窗口，释放内存吗？')) 
        top.location = 'about:blank';
    }
}

export default MKVTransmuxer;
//# sourceMappingURL=interface.js.map
