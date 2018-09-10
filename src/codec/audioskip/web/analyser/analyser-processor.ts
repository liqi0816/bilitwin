import { SampleRingProcessor } from './base-sample-ring-processor.js';
import * as constants from '../constants.js';

class AnalyserProcessor extends SampleRingProcessor {
    constructor(port = self) {
        super(port);
    }

    process(sampleWindow: Float32Array) {

    }
}

export { AnalyserProcessor };
export default AnalyserProcessor;
