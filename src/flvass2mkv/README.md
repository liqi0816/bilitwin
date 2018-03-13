# FLV + ASS => MKV transmuxer

Demux FLV into H264 + AAC stream and ASS into line stream; then remux them into a MKV file.

## Quick Start

samples/gen_case.ass  
samples/gen_case.flv

node index.js

=>out.mkv

## API

@param {Blob|string|ArrayBuffer} flv  
@param {Blob|string|ArrayBuffer} ass  
FLVASS2MKV.prototype.build

## How to dev:

* node ^8.9.4
* npm ^5.6.0
```bash
npm install
npx gulp
```