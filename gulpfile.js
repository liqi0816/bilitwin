/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*************************************************/
/***************   Build Configs   ***************/
const gitPath = 'git';
const npmPath = 'npm';
const includeSourcemap = false;
/*************************************************/

const fs = require('fs');
const spawn = require('child_process').spawn;
const rollup = require('rollup');
const gulp = require('gulp');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const babelCore = require("babel-core");
const jsxac = require('jsx-append-child');

gulp.task('./src/ui/ui.js', () => {
    return gulp.src('./src/ui/ui.entry.js')
        .pipe(babel({
            plugins: [jsxac],
            sourceMaps: 'inline'
        }))
        .pipe(rename('ui.js'))
        .pipe(gulp.dest('./src/ui/'));
});

gulp.task('./src/flvass2mkv/interface.js', async () => new Promise((resolve, reject) => {
    fs.access('./src/flvass2mkv/interface.js', fs.constants.R_OK, err => {
        if (err) {
            spawn(npmPath, ['install'], { cwd: 'src/flvass2mkv', shell: true }).once('close', err => {
                if (err) return reject(err);
                resolve();
            });
        }
        else {
            resolve();
        }
    })
}));

gulp.task('./src/bilitwin.js', gulp.series(gulp.parallel('./src/ui/ui.js', './src/flvass2mkv/interface.js'), async () => {
    const bundle = await rollup.rollup({
        input: './src/bilitwin.entry.js'
    });
    return bundle.write({
        file: './src/bilitwin.js',
        format: 'es',
        sourcemap: includeSourcemap,
    })
}));

gulp.task('biliTwin.user.js', gulp.series('./src/bilitwin.js', () => {
    if (!includeSourcemap) {
        return gulp.src(['./src/bilitwin.meta.js', './src/bilitwin.js'])
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(concat('biliTwin.user.js'))
            .pipe(gulp.dest('.'));
    }
    else {
        return gulp.src(['./src/bilitwin.meta.js', './src/bilitwin.js'])
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(concat('biliTwin.user.js'))
            .pipe(sourcemaps.write('.', {
                sourceMappingURLPrefix: 'https://raw.githubusercontent.com/liqi0816/bilitwin/develop'
            }))
            .pipe(gulp.dest('.'));
    }
}));

gulp.task('biliTwinBabelCompiled.user.js', gulp.series('biliTwin.user.js', async () => new Promise((resolve, reject) => {
    babelCore.transformFile('biliTwin.user.js', {
        presets: ['env'],
        plugins: [["babel-plugin-transform-builtin-extend", { globals: ["DataView"] }]]
    }, (err, { code }) => {
        if (err) return reject(err);
        fs.readFile('./src/bilitwin.meta.js', (err, file) => {
            if (err) return reject(err);
            meta = file.toString();
            gulp.src(['./src/bilitwin-babel.entry.js'])
                .pipe(replace('"${metadata}"', meta))
                .pipe(replace(/(\/\/[ ]?@name\s+)(?=\w)/, '$1(Babel)'))
                .pipe(replace(/(\/\/[ ]?@description\s+)(?=\w)/, '$1(国产浏览器和Edge浏览器专用)'))
                .pipe(replace('"${transpiledCode}"', code))
                .pipe(rename('biliTwinBabelCompiled.user.js'))
                .pipe(gulp.dest('.'))
                .on('end', resolve)
                .on('error', reject);
        })
    });
})));

gulp.task('bump-minor-version', async () => {
    await new Promise((resolve, reject) => {
        gulp.src('./src/bilitwin.meta.js')
            .pipe(replace(/(\/\/[ ]?@version\s+)([\d\.]+)/, ({ }, $1, version) => {
                const arr = version.split('.', 3);
                arr[1] = (parseInt(arr[1]) + 1).toString();
                if (arr[2]) arr[2] = '0'
                return `${$1}${arr.join('.')}`;
            }))
            .pipe(gulp.dest('./src/'))
            .on('end', resolve)
            .on('error', reject);
    });
    await new Promise((resolve, reject) => {
        spawn(npmPath, ['--no-git-tag-version', 'version', 'minor'], { shell: true }).once('close', err => {
            if (err) return reject(err);
            resolve();
        });
    });
});

gulp.task('bump-patch-version', async () => {
    await new Promise((resolve, reject) => {
        gulp.src('./src/bilitwin.meta.js')
            .pipe(replace(/(\/\/[ ]?@version\s+)([\d\.]+)/, ({ }, $1, version) => {
                const arr = version.split('.', 3);
                arr[2] ? arr[2] = (parseInt(arr[2]) + 1).toString() : arr.push("1")
                return `${$1}${arr.join('.')}`;
            }))
            .pipe(gulp.dest('./src/'))
            .on('end', resolve)
            .on('error', reject);
    });
    await new Promise((resolve, reject) => {
        spawn(npmPath, ['--no-git-tag-version', 'version', 'patch'], { shell: true }).once('close', err => {
            if (err) return reject(err);
            resolve();
        });
    });
});

gulp.task('build', gulp.series('biliTwinBabelCompiled.user.js'));
gulp.task('default', gulp.series('build'));

gulp.task('release-minor', gulp.series('bump-minor-version', 'build'))

gulp.task('release-patch', gulp.series('bump-patch-version', 'build'))

gulp.task('watch', () => {
    return gulp.watch(['./src/ui/ui.entry.js'], { delay: 5000 }, gulp.series('./src/ui/ui.js'));
});
