declare global {
    interface HTMLMediaElement {
        captureStream(): MediaStream;
    }

    interface ImportMeta {
        url: string;
    }
}


export declare class AudioWorkletProcessor {
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: {}): boolean
    port: MessagePort
}

export declare function registerProcessor(name: string, processor: typeof AudioWorkletProcessor): void

export declare const Worker: { new(stringUrl: string, opt?: { type: string }): Worker; }

