/*===========================================================================*\
 * Discrete Cosine Transform
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Mel-scale and its related coefficients used in
 * human speech analysis.
\*===========================================================================*/

import { cosMap } from './cos-map-256.js';

export const N = 256;

export const scale = 2;

export function dct(signal: f32[]): f32[] {
    const L = signal.length;
    if (L !== N) throw new RangeError();

    const ret: f32[] = [];
    for (let ix = 0; ix < N; ix++) {
        let prev = 0;
        for (let ix_ = 0; ix_ < N; ix_++) {
            prev += (signal[ix_] * cosMap[ix_ + (ix * N)]);
        }
        ret[ix] = scale * prev;
    }
    return ret;
};

export default dct;
