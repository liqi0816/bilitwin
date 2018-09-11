import SharedRingBuffer, { SharedRingBufferMetadata } from '../util/shared-ring-buffer.js';
import * as constants from '../constants.js';

export const enum SampleRingState {
    noMoreData,
    hasMoreData
}

const w = [] as number[]

abstract class SampleRingProcessor {
    sampleRing = null as SharedRingBuffer | null
    label = 0
    closed = false

    listen(port = self) {
        port.addEventListener('message', ({ data: { name, data } }) => {
            switch (name) {
                case 'init':
                    this.sampleRing = new SharedRingBuffer(data);
                    this.start();
                    return;
                case 'label':
                    this.label = this.label ^ 1;
                    return;
                case 'close':
                    this.closed = true;
                    return;
                default:
                    throw new RangeError(`message.name ${name} is unrecognizable`);
            }
        });
    }

    abstract process(sampleWindow: Float32Array): void

    start() {
        if (!this.sampleRing) throw new TypeError('SampleRingProcessor: not initialized');
        const ringByteLength = this.sampleRing[SharedRingBufferMetadata.ringByteLength];
        const takeByteLength = this.sampleRing[SharedRingBufferMetadata.takeByteLength];

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
            const currentByteOffsetAligned = currentByteOffset - currentByteOffset % takeByteLength;

            // 4. run after producer
            for (; mybyteOffset !== currentByteOffsetAligned; mybyteOffset = (mybyteOffset + takeByteLength) % ringByteLength) {
                // 4.1 take next window
                const sampleWindow = this.sampleRing.takeAt(mybyteOffset, Float32Array);

                // 4.2 filter out silent window
                for (const sample of sampleWindow) {
                    // 4.2.1 not silent => process
                    if (sample) {
                        this.process(sampleWindow);
                        break;
                    }
                }
                // 4.2.2 silent => ignore
            }
        }
    }

    static NO_MORE_DATA = SampleRingState.noMoreData
    static HAS_MORE_DATA = SampleRingState.hasMoreData
}

export { SampleRingProcessor };
export default SampleRingProcessor;
