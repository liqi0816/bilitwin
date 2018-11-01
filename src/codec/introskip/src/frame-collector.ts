import * as constants from './constants.js';

declare var OffscreenCanvas: HTMLCanvasElement & { new(width: number, height: number): HTMLCanvasElement }

interface FrameCollectorInit {
    width?: number
    height?: number
}

class FrameCollector extends EventTarget {
    video: HTMLVideoElement
    width: number
    height: number
    result: Uint8Array

    constructor(video: HTMLVideoElement, { width = constants.width, height = constants.height } = {} as FrameCollectorInit) {
        super();
        this.video = video;
        this.width = width;
        this.height = height;
        this.result = new Uint8Array(width * height);
    }

    capture() {
        const { width, height } = this;
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d')!;
        context.drawImage(this.video, 0, 0, width, height);
        const { data } = context.getImageData(0, 0, width, height);
        for (let i = 0; i < this.result.length; i++) {
            // i << 2 === i * 4
            this.result[i] = data[i << 2];
        }
        return this.result;
    }
}

export default FrameCollector;
export { FrameCollector };
