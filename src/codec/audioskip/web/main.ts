import SharedRingBuffer from './util/shared-ring-buffer.js';
import { Worker } from './util/dom-fix.js';
import * as constants from './constants.js';

(async () => {
    // DOM bindings
    const video = document.getElementsByTagName('video')[0];
    const code = document.getElementsByTagName('code')[0];

    // demo drag-drop video files
    document.body.ondragover = e => e.preventDefault();
    document.body.ondrop = e => {
        e.preventDefault();
        URL.revokeObjectURL(video.src);
        video.src = URL.createObjectURL(e.dataTransfer.files[0]);
        video.play();
    };

    // Start AudioWorklet
    const context = new AudioContext();
    await context.audioWorklet.addModule(new URL('./worklet.js', import.meta.url).href);
    const source = context.createMediaElementSource(video);
    source.connect(context.destination);
    const forward = new AudioWorkletNode(context, 'byte-forward-processor', { numberOfOutputs: 0 });
    source.connect(forward);

    // Start WebWorker
    const worker = new Worker(new URL('./worker.js', import.meta.url).href, { type: 'module' });

    // Start sharing buffer
    const sampleRing = new SharedRingBuffer(constants.AUDIO_ANALYSOR_FRAME_BYTE_LENGTH, constants.AUDIO_ANALYSOR_RING_BUFFER_BYTE_LENGTH);
    const message = { name: 'init', data: sampleRing.buffer };
    forward.port.postMessage(message);
    worker.postMessage(message);
})();
