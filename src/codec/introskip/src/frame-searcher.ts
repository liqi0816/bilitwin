import * as constants from './constants.js';

declare var OffscreenCanvas: HTMLCanvasElement & { new(width: number, height: number): HTMLCanvasElement }
declare function requestIdleCallback(callback: () => void): number;

export interface FrameCollectorInit {
    width?: number
    height?: number
    sampleInterval?: number
    searchThreshold?: number
    log?: boolean
}

export const enum FrameSearcherStatus {
    stopped = 'stopped',
    paused = 'paused',
    running = 'running',
}

export const enum SampleMutexStatus {
    free,
    locked,
}

class FrameSearcher extends EventTarget {
    video: HTMLVideoElement
    search: Uint8Array
    width: number
    height: number
    sampleInterval: number
    searchThreshold: number
    sampleMutex: SampleMutexStatus
    sampleTimer: number
    context: CanvasRenderingContext2D
    status: FrameSearcherStatus
    diffLog?: number[]
    timeLog?: number[]

    constructor(video: HTMLVideoElement, search: Uint8Array, {
        width = constants.width,
        height = constants.height,
        sampleInterval = constants.sampleInterval,
        searchThreshold = constants.searchThreshold,
        log = constants.log
    } = {} as FrameCollectorInit) {
        super();
        this.video = video;
        this.search = search;
        this.width = width;
        this.height = height;
        this.sampleInterval = sampleInterval;
        this.searchThreshold = searchThreshold;
        this.sampleMutex = SampleMutexStatus.free;
        this.sampleTimer = -1;
        this.context = new OffscreenCanvas(this.width, this.height).getContext('2d')!;
        this.status = FrameSearcherStatus.stopped;

        if (log) {
            this.diffLog = [];
            this.timeLog = [];
        }
    }

    async start() {
        this.video.addEventListener('playing', this.resume);
        this.video.addEventListener('stalled', this.pause);
        this.video.addEventListener('pause', this.pause);
        await this.video.play();
        return this.status = FrameSearcherStatus.running;
    }

    stop() {
        this.video.removeEventListener('playing', this.resume);
        this.video.removeEventListener('stalled', this.pause);
        this.video.removeEventListener('pause', this.pause);
        this.pause();
        return this.status = FrameSearcherStatus.stopped;
    }

    resume = () => {
        this.status = FrameSearcherStatus.running;
        return this.sampleTimer = setInterval(() => {
            if (this.sampleMutex === SampleMutexStatus.free) {
                this.sampleMutex = SampleMutexStatus.locked;
                requestIdleCallback(() => {
                    const detail = this.pickSample();
                    if (detail) {
                        this.dispatchEvent(new CustomEvent('load', { detail }));
                    }
                    this.sampleMutex = SampleMutexStatus.free;
                });
            }
        }, this.sampleInterval) as any as number;
    }

    pause = () => {
        this.status = FrameSearcherStatus.paused;
        return clearInterval(this.sampleTimer);
    }

    pickSample() {
        const { context, width, height } = this;
        context.drawImage(this.video, 0, 0, width, height);
        const { data } = context.getImageData(0, 0, width, height);

        let difference = 0;
        for (let i = 0; i < this.search.length; i++) {
            const j = i << 2;
            const ij = this.search[i] - data[j];
            const mask = ij >> 31;
            const ijAbs = (ij + mask) ^ mask;
            difference += ijAbs;
        }
        if (this.diffLog) {
            this.diffLog.push(difference);
            this.timeLog!.push(this.video.currentTime);
        }

        if (difference < this.searchThreshold) {
            return data;
        }
        else {
            return null;
        }
    }
}

export default FrameSearcher;
export { FrameSearcher };
