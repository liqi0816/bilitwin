import { SharedRingBuffer, SharedRingBufferMetadata } from './util/shared-ring-buffer.js';
import fft from './audio-features/fft-js/fft.js';
import MFCC from './audio-features/mfcc/mfcc.js';
import { fftMag } from './audio-features/fft-js/fftutil.js';
import * as constants from './constants.js';

const featureRing = [] as Float32Array[];
const feature = new Float32Array(constants.FEATURE_COUNT);
const mfcc = new MFCC({
    fftSize: constants.FEATURE_FFT_COUNT,
    bankCount: constants.FEATURE_MFCC_COUNT,
    lowFrequency: constants.FEATURE_MFCC_LOW_FREQUENCY,
    highFrequency: constants.FEATURE_MFCC_HIGH_FREQUENCY,
    sampleRate: constants.AUDIO_WORKLET_SAMPLE_FREQUENCY,
});

Object.assign(self, { feature, featureRing });

const handleSampleWindow = (sample: Float32Array) => {
    const buffer = new Float32Array(constants.FEATURE_COUNT);
    const mags = fftMag(fft(sample), new Float32Array(buffer.buffer, 0, constants.FEATURE_FFT_COUNT));
    const coef = mfcc.compute(mags, new Float32Array(buffer.buffer, constants.FEATURE_FFT_COUNT * Float32Array.BYTES_PER_ELEMENT, constants.FEATURE_MFCC_COUNT));

    if (featureRing.length > 1722) {
        const buffer = featureRing.shift()!;
        for (let i = 0; i < feature.length; i++) {
            feature[i] -= buffer[i];
        }
    }
    for (let i = 0; i < feature.length; i++) {
        feature[i] += buffer[i];
    }

    const c = new Float32Array(constants.FEATURE_COUNT);
    c.set(feature);
    featureRing.push(c);
}
