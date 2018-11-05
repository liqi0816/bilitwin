import FLVASS2MKV from './flvass2mkv.js';

// DOM bindings
const [fileProgress, mkvProgress] = document.getElementsByTagName('progress');
const a = document.getElementsByTagName('a')[0];

// drag-drop video files
document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', async e => {
    e.preventDefault();
    const files = [...e.dataTransfer!.files];

    const flvSource = files.find(({ name }) => name.endsWith('.flv'));
    const assSource = files.find(({ name }) => name.endsWith('.ass'));

    if (!flvSource) throw alert('没有发现以".flv"结尾的文件');
    if (!assSource) throw alert('没有发现以".ass"结尾的文件');

    console.time('file');
    const mkv = await new FLVASS2MKV({
        onflvprogress: ({ loaded, total }) => {
            fileProgress.value = loaded;
            fileProgress.max = total;
        },
        onfileload: () => {
            console.timeEnd('file');
            console.time('flvass2mkv');
        },
        onmkvprogress: ({ loaded, total }) => {
            mkvProgress.value = loaded;
            mkvProgress.max = total;
        },
    }).build(flvSource, assSource);
    console.timeEnd('flvass2mkv');
    URL.revokeObjectURL(a.href);
    return a.href = URL.createObjectURL(mkv);
});
