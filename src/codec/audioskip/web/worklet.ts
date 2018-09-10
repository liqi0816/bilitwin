import { SharedRingBuffer, SharedRingBufferMetadata } from './util/shared-ring-buffer.js';
import { SampleRingState } from './analyser/base-sample-ring-processor.js';
import { AudioWorkletProcessor, registerProcessor } from './util/dom-fix.js';

class WaveForwardProcessor extends AudioWorkletProcessor {
    sampleRing: SharedRingBuffer | null

    constructor() {
        super();
        this.port.onmessage = ({ data }: { data: SharedArrayBuffer }) => {
            this.sampleRing = new SharedRingBuffer(data);
            this.port.onmessage = () => this.sampleRing = null;
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
