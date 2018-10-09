import SampleRingProcessor from './base-sample-ring-processor.js';
import * as constants from '../constants.js';
import MFCC from '../features/mfcc/mfcc.js';
import fft from '../features/fft-js/fft.js';
import { fftMag } from '../features/fft-js/fftutil.js';

declare var self: Window & { result: Float32Array[] }
self.result = [];

class AnalyserProcessor extends SampleRingProcessor {
    // I hate naming things
    featureStrideBuffer = new Float32Array(constants.AUDIO_ANALYSOR_WINDOW_STRIDE * constants.FEATURE_COUNT)
    featureStrideBufferOffset = 0
    featureWindowBuffer = new Float32Array(constants.AUDIO_ANALYSOR_STRIDE_IN_WINDOW_COUNT * constants.FEATURE_COUNT)
    featureWindowBufferOffset = 0
    mfcc = new MFCC({
        fftSize: constants.FEATURE_FFT_COUNT,
        bankCount: constants.FEATURE_MFCC_COUNT,
        lowFrequency: constants.FEATURE_MFCC_LOW_FREQUENCY,
        highFrequency: constants.FEATURE_MFCC_HIGH_FREQUENCY,
        sampleRate: constants.AUDIO_WORKLET_SAMPLE_FREQUENCY,
    })
    result = self.result

    process(sampleWindow: Float32Array) {
        const mags = fftMag(fft(sampleWindow), new Float32Array(this.featureStrideBuffer.buffer, this.featureStrideBufferOffset, constants.FEATURE_FFT_COUNT));
        this.featureStrideBufferOffset += Float32Array.BYTES_PER_ELEMENT * constants.FEATURE_FFT_COUNT;
        const coef = this.mfcc.compute(mags, new Float32Array(this.featureStrideBuffer.buffer, this.featureStrideBufferOffset, constants.FEATURE_MFCC_COUNT));
        this.featureStrideBufferOffset += Float32Array.BYTES_PER_ELEMENT * constants.FEATURE_MFCC_COUNT;

        if (this.featureStrideBufferOffset === this.featureStrideBuffer.byteLength) {
            this.featureWindowBuffer.fill(0, this.featureWindowBufferOffset, this.featureWindowBufferOffset + constants.FEATURE_COUNT);
            for (let i = 0; i < constants.AUDIO_ANALYSOR_WINDOW_STRIDE; i++) {
                for (let j = 0; j < constants.FEATURE_COUNT; j++) {
                    this.featureWindowBuffer[this.featureWindowBufferOffset + j] += this.featureStrideBuffer[i * constants.FEATURE_COUNT + j];
                }
            }
            this.featureStrideBufferOffset = 0;
            this.featureWindowBufferOffset = (this.featureWindowBufferOffset + constants.FEATURE_COUNT) % this.featureWindowBuffer.byteLength;

            const buffer = new Float32Array(constants.FEATURE_COUNT + 1).fill(0);
            for (let i = 0; i < constants.AUDIO_ANALYSOR_STRIDE_IN_WINDOW_COUNT; i++) {
                for (let j = 0; j < constants.FEATURE_COUNT; j++) {
                    buffer[j] += this.featureWindowBuffer[i * constants.FEATURE_COUNT + j];
                }
            }
            buffer[buffer.length - 1] = this.label;
            this.result.push(buffer);
        }
    }
}

export { AnalyserProcessor };
export default AnalyserProcessor;
