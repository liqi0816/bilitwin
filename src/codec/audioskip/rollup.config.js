import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './wrapper/index.js',
    output: {
        file: './web/wrapper.js',
        format: 'esm'
    },
    plugins: [
        resolve(),
        commonjs()
    ]
};