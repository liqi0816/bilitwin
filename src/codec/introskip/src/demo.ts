import { FrameCollector } from './frame-collector.js';
import { FrameSearcher, FrameSearcherStatus } from './frame-searcher.js';
import * as constants from './constants.js';

const secToReadable = (sec: number) => `${(sec / 60) | 0}'${sec % 60}"`;

(async () => {
    // DOM bindings
    const video = document.getElementsByTagName('video')[0];
    const [collectButton, searchButton] = document.getElementsByTagName('button');
    const [collectCanvas, searchCanvas, diffCanvas] = document.getElementsByTagName('canvas');
    const stdout = document.getElementsByTagName('pre')[0];

    // canvas size reset
    collectCanvas.width = searchCanvas.width = constants.width;
    collectCanvas.height = searchCanvas.height = constants.height;

    // demo drag-drop video files
    document.body.addEventListener('dragover', e => e.preventDefault());
    document.body.addEventListener('drop', e => {
        e.preventDefault();
        URL.revokeObjectURL(video.src);
        video.src = URL.createObjectURL(e.dataTransfer!.files[0]);
    });

    // demo keypress shortcut
    document.body.addEventListener('keypress', ({ key }) => {
        if (key === ' ') {
            if (video.paused) video.play();
            else video.pause();
        }
    });

    // demo actions
    const collector = new FrameCollector(video);
    collectButton.addEventListener('click', () => {
        const frame = collector.capture();
        const imageData = new ImageData(collector.width, collector.height);
        for (let i = 0; i < frame.length; i++) {
            // i << 2 === i * 4
            imageData.data[(i << 2)] = frame[i];
            imageData.data[(i << 2) + 1] = frame[i];
            imageData.data[(i << 2) + 2] = frame[i];
            imageData.data[(i << 2) + 3] = 255;
        }
        const context = collectCanvas.getContext('2d')!;
        context.putImageData(imageData, 0, 0);
    });
    const searcher = new FrameSearcher(video, collector.result, { log: true });
    searchButton.addEventListener('click', () => {
        if (searcher.status === FrameSearcherStatus.stopped) {
            video.currentTime -= 5;
            searcher.start();
            searchButton.textContent += '停止';
        }
        else {
            video.pause();
            searcher.stop();
            searchButton.textContent = searchButton.textContent!.slice(0, -2);

            const getComputedStyle = window.getComputedStyle(diffCanvas);
            const width = diffCanvas.width = parseInt(getComputedStyle.width!);
            const height = diffCanvas.height = parseInt(getComputedStyle.height!);

            const log = searcher.diffLog!;
            const max = Math.max(...log);
            const context = diffCanvas.getContext('2d')!;
            context.beginPath();
            context.strokeStyle = 'blue';
            context.moveTo(0, 0);
            for (let i = 0; i < log.length; i++) {
                context.lineTo(i * width / log.length, height - log[i] * height / max);
            }
            context.stroke();
        }
    });
    searcher.addEventListener('load', ({ detail }: any) => {
        stdout.textContent += `发现片头 ${secToReadable(video.currentTime | 0)}\n`;
        const imageData = new ImageData(detail, collector.width, collector.height);
        const context = searchCanvas.getContext('2d')!;
        context.putImageData(imageData, 0, 0);
    })

    // develop cycle
    const develop = true;
    if (develop) {
        video.currentTime = 2 * 60 + 15;
        Object.assign(window, { collector, searcher });
    }
})();
