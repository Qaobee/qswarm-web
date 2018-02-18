/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are splitted in several files in the gulp directory
 *  because putting all here was really too long
 */

'use strict';

var gulp = require('gulp');
var wrench = require('wrench');
var conf = require('./gulp/conf');
var gulpNgConfig = require('gulp-ng-config');
var jsdoc = require("gulp-jsdoc");
var util = require("gulp-util");

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function (file) {
    return (/\.(js|coffee)$/i).test(file);
}).map(function (file) {
    require('./gulp/' + file);
});

gulp.task('conf-dev', function () {
    gulp.src('conf/config.json')
        .pipe(gulpNgConfig('qaobee.config', {
            environment: 'local',
            wrap: true
        }))
        .pipe(gulp.dest('./src/app'))
});

gulp.task('conf-docker', function () {
    gulp.src('conf/config.json')
        .pipe(gulpNgConfig('qaobee.config', {
            environment: 'docker',
            wrap: true
        }))
        .pipe(gulp.dest('./src/app'))
});
/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', ['clean', 'conf-dev'], function () {
    gulp.start('build');
});

gulp.task('docker', ['clean', 'conf-docker'], function () {
    gulp.start('build');
});

gulp.task('jsdoc', [], function () {
    return gulp.src(conf.paths.src + '/**/*.js')
        .pipe(jsdoc('./build/docs/jsdoc'))
});

gulp.task('translate', function () {
    return gulp.src(conf.paths.src + '/**/*.js')
        .pipe(angularTranslate({
            lang: ['fr'], nullEmpty: true, safeMode: true
        }));
        //.. 
});