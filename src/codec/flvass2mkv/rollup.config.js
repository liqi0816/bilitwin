import resolve from 'rollup-plugin-node-resolve';
// import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'build/node.js',
    output: {
        file: 'index.js',
        format: 'cjs',
        sourcemap: true,
    },
    plugins: [/* typescript(), */ resolve()]
};
