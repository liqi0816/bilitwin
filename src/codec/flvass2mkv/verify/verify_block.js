const fs = require('fs');
const ebml = require('ebml');
const ebmlBlock = require('ebml-block');

const simplified = [];
const encoder = new ebml.Encoder();
const decoder = new ebml.Decoder();
const mkv = fs.readFileSync('../out.mkv');

decoder.write(mkv);
let start = false;
decoder.on('data', function (chunk) {
    // if (chunk[1].name == 'CodecPrivate') start = true;
    // if (start) {
    //     console.log(chunk);
    // }
    if (chunk[1].name === 'SimpleBlock' || chunk[1].name === 'Block') {
        const block = ebmlBlock(chunk[1].data);
        if (block.timecode == 550 && block.frames[0].length == 117) {
            console.log(block.frames[0]);
        }
    }
});
