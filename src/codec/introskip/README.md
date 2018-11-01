# INTROSKIP

Take down the first frame of intro; then scan for recurrence in future plays.

## Quick Start

```
samples/sample-bangumi.mp4

npx tsc
npx http-server -a 127.0.0.1 -p 8080 -t -1
(or npm start)

=>http://127.0.0.1:8080/demo/demo.html
```

## API

```typescript
var video: HTMLVideoElement;

const collector = new FrameCollector(video);
const frame = collector.capture();

const searcher = new FrameSearcher(video, frame);
searcher.start();
searcher.addEventListener('load', () => console.log('FOUND'));
```

## How to dev:

* node ^8.9.4
* npm ^5.6.0
```bash
npm install
```
