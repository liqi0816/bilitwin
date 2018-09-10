import * as complex from './complex.js';

/**
 * By Eulers Formula:
 *
 * e^(i*x) = cos(x) + i*sin(x)
 *
 * and in DFT:
 *
 * x = -2*PI*(k/N)
*/
const mapExponent = [] as Float32Array[][];
export function exponent(k: number, N: number) {
    const x = -2 * Math.PI * (k / N);

    mapExponent[N] = mapExponent[N] || [];
    mapExponent[N][k] = mapExponent[N][k] || Float32Array.of(Math.cos(x), Math.sin(x));

    return mapExponent[N][k];
};

/**
 * Calculate FFT Magnitude for complex numbers.
*/
export function fftMag(fftBins: Float32Array[], retBuffer = new Float32Array(fftBins.length / 2)) {
    for (let i = 0; i < retBuffer.length; i++) {
        retBuffer[i] = complex.magnitude(fftBins[i]);
    }
    return retBuffer;
};

/**
 * Calculate Frequency Bins
 * 
 * Returns an array of the frequencies (in hertz) of
 * each FFT bin provided, assuming the sampleRate is
 * samples taken per second.
*/
export function fftFreq(fftBins: Float32Array[], sampleRate: number, retBuffer = new Uint32Array(fftBins.length / 2)) {
    const stepFreq = sampleRate / fftBins.length;
    for (let i = 0; i < retBuffer.length; i++) {
        retBuffer[i] = i * stepFreq;
    }
    return retBuffer;
};
