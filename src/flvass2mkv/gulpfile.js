/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const multilineString = require('./util/rollup-plugin-multiline-string');

const replace = require('gulp-replace');
const inline = require('gulp-inline');
const rename = require('gulp-rename');

gulp.task('default', ['build']);
gulp.task('build', ['index.js', 'embedded.html', 'interface.js']);

gulp.task('index.js', async () => {
    const bundle = await rollup.rollup({
        input: './index.entry.js',
        plugins: [
            nodeResolve()
        ]
    });
    return bundle.write({
        file: './index.js',
        format: 'iife',
        name: 'FLVASS2MKV',
        sourcemap: true,
    })
});

gulp.task('embedded.html', ['index.js'], () => {
    return gulp.src('./demo.html')
        .pipe(replace(/(?:window\.)?exec\(\);?/, ''))
        .pipe(inline())
        .pipe(rename('embedded.html'))
        .pipe(gulp.dest('./'));
});

gulp.task('interface.js', ['embedded.html'], async () => {
    const bundle = await rollup.rollup({
        input: './interface.entry.js',
        plugins: [
            multilineString({ include: './embedded.html' })
        ]
    });
    return bundle.write({
        file: './interface.js',
        format: 'es',
        sourcemap: true,
    })
});

gulp.task('clean', () => {
    const fs = require('fs');
    const cb = () => { };
    fs.unlink('index.js', cb);
    fs.unlink('index.js.map', cb);
    fs.unlink('interface.js', cb);
    fs.unlink('interface.js.map', cb);
    fs.unlink('embedded.html', cb);
});

// const browserify = require('browserify');
// const sourcemaps = require("gulp-sourcemaps");

gulp.task('browserify-index.bundle.js', () => {
    const b = browserify({
        entries: './index.js',
        standalone: 'FLVASS2MKV',
        debug: true,
        bare: true,
    });
    return b.bundle()
        .on('error', console.error.bind(console))
        .pipe(source('index.bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./'));
});
