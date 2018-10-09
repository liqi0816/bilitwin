import SharedRingBuffer, { SharedRingBufferMetadata } from './util/shared-ring-buffer.js';
import { SampleRingState } from './analyser/base-sample-ring-processor.js';

declare class AudioWorkletProcessor {
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: {}): boolean
    port: MessagePort
}
declare function registerProcessor(name: string, processor: typeof AudioWorkletProcessor): void
declare var currentTime: number
declare var currentFrame: number

class WaveForwardProcessor extends AudioWorkletProcessor {
    sampleRing: SharedRingBuffer | null

    constructor() {
        super();
        this.port.onmessage = ({ data: { name, data } }: { data: { name: string, data: SharedArrayBuffer } }) => {
            switch (name) {
                case 'init':
                    this.sampleRing = new SharedRingBuffer(data);
                    return;
                case 'close':
                    this.sampleRing = null;
                    return;
            }
        };
        this.sampleRing = null;
    }

    process(inputs: Float32Array[][]) {
        if (this.sampleRing) {
            this.sampleRing.push(inputs[0][0]);
            this.sampleRing[SharedRingBufferMetadata.conditionVariable] = SampleRingState.hasMoreData;
            Atomics.wake(this.sampleRing, SharedRingBufferMetadata.conditionVariable, SampleRingState.hasMoreData);
        }
        return true;
    }
}

registerProcessor('byte-forward-processor', WaveForwardProcessor);
