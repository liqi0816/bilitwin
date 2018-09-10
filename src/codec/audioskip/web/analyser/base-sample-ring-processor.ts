import { SharedRingBuffer, SharedRingBufferMetadata } from '../util/shared-ring-buffer';
import * as constants from '../constants';

export const enum SampleRingState {
    noMoreData,
    hasMoreData
}

abstract class SampleRingProcessor {
    sampleRing: SharedRingBuffer | null
    label: number
    closed: boolean

    constructor(port = self) {
        port.addEventListener('message', ({ data: { name, data } }) => {
            switch (name) {
                case 'init':
                    this.sampleRing = new SharedRingBuffer(data);
                    this.start();
                    break;
                case 'label':
                    this.label = this.label ^ 1;
                    break;
                case 'close':
                    this.closed = true;
                    break;
                default:
                    throw new RangeError(`message.name ${name} is unrecognizable`);

            }
        });
        this.sampleRing = null;
        this.label = 0;
        this.closed = false;
    }

    abstract process(sampleWindow: Float32Array): void

    start() {
        if (!this.sampleRing) throw new TypeError('SampleRingProcessor: not initialized');
        const ringByteLength = this.sampleRing[SharedRingBufferMetadata.ringByteLength];

        for (let mybyteOffset = this.sampleRing[SharedRingBufferMetadata.currentByteOffset]; ;) {
            // 1. closed => return
            if (this.closed) return;

            // 2. wait for more data
            while (this.sampleRing[SharedRingBufferMetadata.conditionVariable] === SampleRingState.noMoreData) {
                Atomics.wait(this.sampleRing, SharedRingBufferMetadata.conditionVariable, SampleRingState.noMoreData);
            }
            this.sampleRing[SharedRingBufferMetadata.conditionVariable] = SampleRingState.noMoreData;

            // 3. get producer offset
            const currentByteOffset = this.sampleRing[SharedRingBufferMetadata.currentByteOffset];

            // 4. run after producer
            for (; mybyteOffset !== currentByteOffset; mybyteOffset = (mybyteOffset + constants.AUDIO_WORKLET_INPUT_LENGTH) % ringByteLength) {
                // 4.1 take next window
                const sampleWindow = this.sampleRing.takeAt(mybyteOffset, Float32Array);

                // 4.2 silent window => drop
                silencedetect: {
                    for (const sample of sampleWindow) {
                        if (sample) break silencedetect;
                    }
                    continue; // to next sampleWindow
                }

                // 4.3 process new window
                this.process(sampleWindow);
            }
        }
    }

    static NO_MORE_DATA = SampleRingState.noMoreData
    static HAS_MORE_DATA = SampleRingState.hasMoreData
}

export { SampleRingProcessor };
export default SampleRingProcessor;
