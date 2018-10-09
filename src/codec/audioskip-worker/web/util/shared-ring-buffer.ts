export interface DataViewLike {
    buffer: ArrayBufferLike
    byteOffset: number
    byteLength: number
}

export interface DataViewConstructorLike<T> {
    new(buffer: ArrayBufferLike, byteOffset: number, length: number): T
    readonly prototype: T
    readonly BYTES_PER_ELEMENT?: number
}

export const enum SharedRingBufferMetadata {
    conditionVariable,
    currentByteOffset,
    takeByteLength,
    ringByteLength,
}

const isDataViewLike = (data: any): data is DataViewLike => data.buffer;

const METADATA_LENGTH = 4;

// WARNING: must be a multiple of 8 to align with Float64/BigInt64 memory pages
const METADATA_BYTE_LENGTH = Int32Array.BYTES_PER_ELEMENT * METADATA_LENGTH;

/**
 * a ring buffer for binary data
 */
class SharedRingBuffer extends Int32Array {
    readonly ring: Uint8Array

    constructor(buffer: ArrayBufferLike)
    constructor(takeByteLength: number, ringByteLength?: number)
    constructor(takeByteLength: number | ArrayBufferLike, ringByteLength = takeByteLength as number) {
        if (typeof takeByteLength === 'number') {
            const takeRemainderByteLength = takeByteLength - 1;
            super(new SharedArrayBuffer(METADATA_BYTE_LENGTH + ringByteLength + takeRemainderByteLength), 0, METADATA_LENGTH);

            this[SharedRingBufferMetadata.takeByteLength] = takeByteLength;
            this[SharedRingBufferMetadata.ringByteLength] = ringByteLength;
        }
        else {
            super(takeByteLength, 0, METADATA_LENGTH);
        }
        this.ring = new Uint8Array(this.buffer, METADATA_BYTE_LENGTH);
    }

    /**
     * push a new chunk of data to the buffer
     * 
     * @param data data to push
     */
    push(data: DataViewLike | ArrayBufferLike) {
        const chunkByteLength = data.byteLength;
        const currentByteOffset = this[SharedRingBufferMetadata.currentByteOffset];
        const ringByteLength = this[SharedRingBufferMetadata.ringByteLength];
        if (isDataViewLike(data)) {
            this.ring.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength), currentByteOffset);
        }
        else {
            this.ring.set(new Uint8Array(data), currentByteOffset);
        }
        const nextByteOffset = (currentByteOffset + chunkByteLength) % ringByteLength;
        this.ring.copyWithin(currentByteOffset + ringByteLength, currentByteOffset, nextByteOffset);
        return this[SharedRingBufferMetadata.currentByteOffset] = nextByteOffset;
    }

    /**
     * push a dummy chunk to the buffer, allowing later writes
     * 
     * Example usage: `new DataView(rb.buffer, rb.ring.byteOffset + pushDefered)`
     * 
     * **call `pushFlushDefered` to close this chunk**
     * 
     * @param chunkByteLength chunkByteLength length of the dummy chunk
     * @returns a writable byte offset on `this.ring`
     */
    pushDefered(chunkByteLength: number) {
        const currentByteOffset = this[SharedRingBufferMetadata.currentByteOffset];
        const ringByteLength = this[SharedRingBufferMetadata.ringByteLength];
        const nextByteOffset = (currentByteOffset + chunkByteLength) % ringByteLength;
        this[SharedRingBufferMetadata.currentByteOffset] = nextByteOffset;
        return currentByteOffset;
    }

    /**
     * flush a dummy chunk to buffer
     * 
     * @param currentByteOffset the offset of the dummy chunk
     * @param chunkByteLength the length of the dummy chunk
     */
    pushFlushDefered(currentByteOffset: number, chunkByteLength: number) {
        const ringByteLength = this[SharedRingBufferMetadata.ringByteLength];
        const nextByteOffset = (currentByteOffset + chunkByteLength) % ringByteLength;
        this.ring.copyWithin(currentByteOffset + ringByteLength, currentByteOffset, nextByteOffset);
    }

    /**
     * take the last `this.takeByteLength` bytes from the buffer
     * 
     * @param ctor an optional typedarray/dataview constructor
     */
    take(): Uint8Array
    take<T extends object>(ctor: DataViewConstructorLike<T>): T
    take<T extends object>(ctor: DataViewConstructorLike<T> = Uint8Array as any) {
        const currentByteOffset = this[SharedRingBufferMetadata.currentByteOffset];
        const takeByteLength = this[SharedRingBufferMetadata.takeByteLength];
        const byteOffset = currentByteOffset - takeByteLength;
        const length = ctor.BYTES_PER_ELEMENT ? takeByteLength / ctor.BYTES_PER_ELEMENT : takeByteLength;
        if (byteOffset < 0) {
            const ringByteLength = this[SharedRingBufferMetadata.ringByteLength];
            return new ctor(this.buffer, METADATA_BYTE_LENGTH + ringByteLength + byteOffset, length);
        }
        return new ctor(this.buffer, METADATA_BYTE_LENGTH + byteOffset, length);
    }

    /**
     * take `this.takeByteLength` bytes at offset `byteOffset` from the buffer
     * 
     * @param byteOffset byte offset of the retrieval
     * @param ctor an optional typedarray/dataview constructor
     */
    takeAt(byteOffset: number): Uint8Array
    takeAt<T extends object>(byteOffset: number, ctor: DataViewConstructorLike<T>): T
    takeAt<T extends object>(byteOffset: number, ctor: DataViewConstructorLike<T> = Uint8Array as any) {
        const takeByteLength = this[SharedRingBufferMetadata.takeByteLength];
        const length = ctor.BYTES_PER_ELEMENT ? takeByteLength / ctor.BYTES_PER_ELEMENT : takeByteLength;
        if (byteOffset < 0) {
            const ringByteLength = this[SharedRingBufferMetadata.ringByteLength];
            return new ctor(this.buffer, METADATA_BYTE_LENGTH + ringByteLength + byteOffset, length);
        }
        return new ctor(this.buffer, METADATA_BYTE_LENGTH + byteOffset, length);
    }

    get conditionVariable() {
        return this[SharedRingBufferMetadata.conditionVariable];
    }

    get currentByteOffset() {
        return this[SharedRingBufferMetadata.currentByteOffset];
    }

    get takeByteLength() {
        return this[SharedRingBufferMetadata.takeByteLength];
    }

    get ringByteLength() {
        return this[SharedRingBufferMetadata.ringByteLength];
    }

    get chunkByteLengthLimit() {
        return this[SharedRingBufferMetadata.ringByteLength] - this[SharedRingBufferMetadata.takeByteLength] + 1;
    }

    static readonly METADATA_LENGTH = METADATA_LENGTH
    static readonly METADATA_BYTE_LENGTH = METADATA_BYTE_LENGTH
}

const __UNIT_TEST = () => {
    const ctor = Float32Array;
    const a = new SharedRingBuffer(ctor.BYTES_PER_ELEMENT * 2);
    for (let i = 0; i < 32; i++) {
        a.push(Float32Array.of(i + 0.1));
        console.log(a.take(ctor));
    }
}

export { SharedRingBuffer };
export default SharedRingBuffer;
