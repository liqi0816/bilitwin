declare global {
    interface HTMLMediaElement {
        captureStream(): MediaStream;
    }

    interface ImportMeta {
        url: string;
    }
}

const Worker1 = Worker as typeof Worker & {
    new(stringUrl: string, opt?: { type: string }): Worker;
};
export { Worker1 as Worker }
