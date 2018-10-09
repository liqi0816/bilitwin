export const cosMap = [] as Float32Array[];

export function memoizeCosines(N: number) {
    cosMap[N] = new Float32Array(N * N);

    const PI_N = Math.PI / N;
    for (let k = 0; k < N; k++) {
        for (let n = 0; n < N; n++) {
            cosMap[N][n + (k * N)] = Math.cos(PI_N * (n + 0.5) * k);
        }
    }
    return cosMap[N];
}

export const scale = 2;

export function dct(signal: Float32Array, retBuffer = new Float32Array(signal.length)): Float32Array {
    const L = signal.length;
    const cosCache = cosMap[L] || memoizeCosines(L);

    for (let ix = 0; ix < retBuffer.length; ix++) {
        let prev = 0;
        for (let ix_ = 0; ix_ < L; ix_++) {
            prev += (signal[ix_] * cosCache[ix_ + (ix * L)]);
        }
        retBuffer[ix] = prev * scale;
    }
    return retBuffer;
}

export default dct;
