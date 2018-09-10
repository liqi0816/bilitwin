import { dct } from './dct.js';

export interface MFCCInit {
    fftSize?: number
    bankCount?: number
    lowFrequency?: number
    highFrequency?: number
    sampleRate?: number
}

export class MFCC {
    fftSize: number
    bankCount: number
    lowFrequency: number
    highFrequency: number
    sampleRate: number
    filterBank: MelFilterBank
    constructor({
        fftSize = 32,
        bankCount = 40,
        lowFrequency = 300,
        highFrequency = 3500,
        sampleRate = 22050,
    } = {} as MFCCInit) {
        this.fftSize = fftSize;
        this.bankCount = bankCount;
        this.lowFrequency = lowFrequency;
        this.highFrequency = highFrequency;
        this.sampleRate = sampleRate;
        this.filterBank = new MelFilterBank(fftSize, bankCount, lowFrequency, highFrequency, sampleRate);
    }

    compute(fft: Float32Array, retBuffer = new Float32Array(this.bankCount)) {
        if (fft.length !== this.fftSize) {
            throw new RangeError(`Passed in FFT bins were incorrect size. Expecting ${this.fftSize} but got ${fft.length}.`);
        }

        const melSpec = this.filterBank.filter(fft, retBuffer);
        const melSpecLog = specToSpecLog(melSpec, retBuffer);
        const melCoef = dct(melSpecLog, retBuffer);

        return melCoef;
    }
}

export class MelFilterBank {
    fftSize: number
    nFilters: number
    lowF: number
    highF: number
    sampleRate: number
    filters: Float32Array[]
    constructor(fftSize: number, nFilters: number, lowF: number, highF: number, sampleRate: number) {
        this.fftSize = fftSize;
        this.nFilters = nFilters;
        this.lowF = lowF;
        this.highF = highF;
        this.sampleRate = sampleRate;
        this.filters = new Array(nFilters);

        const bins = new Uint32Array(nFilters);
        const fq = new Float32Array(nFilters);
        const buffer = new ArrayBuffer(nFilters * fftSize * Float32Array.BYTES_PER_ELEMENT);

        const lowM = hzToMels(lowF);
        const highM = hzToMels(highF);
        const deltaM = (highM - lowM) / (nFilters + 1);

        // Construct equidistant Mel values between lowM and highM.
        for (let i = 0; i < nFilters; i++) {
            // Get the Mel value and convert back to frequency.
            // e.g. 200 hz <=> 401.25 Mel
            fq[i] = melsToHz(lowM + (i * deltaM));

            // Round the frequency we derived from the Mel-scale to the nearest actual FFT bin that we have.
            // For example, in a 64 sample FFT for 8khz audio we have 32 bins from 0-8khz evenly spaced.
            bins[i] = Math.floor((fftSize + 1) * fq[i] / (sampleRate / 2));

            this.filters[i] = new Float32Array(buffer, i * fftSize * Float32Array.BYTES_PER_ELEMENT, fftSize);
        }

        // Construct one cone filter per bin.
        // Filters end up looking similar to [... 0, 0, 0.33, 0.66, 1.0, 0.66, 0.33, 0, 0...]
        for (let i = 0; i < bins.length; i++) {
            const filterRange = (i != bins.length - 1) ? bins[i + 1] - bins[i] : bins[i] - bins[i - 1];
            // this.filters[i].filterRange = filterRange;
            for (let f = 0; f < fftSize; f++) {
                // Right, outside of cone
                if (f > bins[i] + filterRange) this.filters[i][f] = 0.0;
                // Right edge of cone
                else if (f > bins[i]) this.filters[i][f] = 1.0 - ((f - bins[i]) / filterRange);
                // Peak of cone
                else if (f == bins[i]) this.filters[i][f] = 1.0;
                // Left edge of cone
                else if (f >= bins[i] - filterRange) this.filters[i][f] = 1.0 - (bins[i] - f) / filterRange;
                // Left, outside of cone
                else this.filters[i][f] = 0.0;
            }
        }
    }

    filter(freqPowers: Float32Array, retBuffer = new Float32Array(this.nFilters)) {
        for (let fIx = 0; fIx < retBuffer.length; fIx++) {
            let tot = 0;
            for (let pIx = 0; pIx < freqPowers.length; pIx++) {
                tot += freqPowers[pIx] * this.filters[fIx][pIx];
            }
            retBuffer[fIx] = tot;
        }
        return retBuffer;
    }
}

export function melsToHz(mels: number) {
    return 700 * (Math.exp(mels / 1127) - 1);
}

export function hzToMels(hertz: number) {
    return 1127 * Math.log(1 + hertz / 700);
}

export function specToSpecLog(spectrum: Float32Array, retBuffer = new Float32Array(spectrum.length)) {
    for (let i = 0; i < retBuffer.length; i++) {
        retBuffer[i] = Math.log(1 + spectrum[i]);
    }
    return retBuffer;
}

/**
 * Estimate the power spectrum density from FFT amplitudes.
 */
export function powerSpectrum(amplitudes: Float32Array, retBuffer = new Float32Array(amplitudes.length)) {
    for (let i = 0; i < retBuffer.length; i++) {
        retBuffer[i] = (amplitudes[i] * amplitudes[i]) / amplitudes.length;
    }
    return retBuffer;
}

export default MFCC;
