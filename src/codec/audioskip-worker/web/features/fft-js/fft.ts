import * as  complex from './complex.js';
import * as  fftUtil from './fftutil.js';
import * as  twiddle from './twiddle.js';

export function even(_: any, ix: number) {
    return ix % 2 == 0;
}

export function odd(_: any, ix: number) {
    return ix % 2 == 1;
}

export function fft(vector: Float32Array) {
    const N = vector.length;

    // Base case is X = x + 0i since our input is assumed to be real only.
    if (N == 1) {
        return [Float32Array.of(vector[0], 0)];
    }

    const X = new Array(vector.length / 2) as Float32Array[];

    // Recurse: all even samples
    const X_evens = fft(vector.filter(even));

    // Recurse: all odd samples
    const X_odds = fft(vector.filter(odd));

    // Now, perform N/2 operations!
    for (let k = 0; k < N / 2; k++) {
        // t is a complex number!
        let t = X_evens[k],
            e = complex.multiply(fftUtil.exponent(k, N), X_odds[k]);

        X[k] = complex.add(t, e);
        X[k + (N / 2)] = complex.subtract(t, e);
    }
    return X;
}

export default fft;
