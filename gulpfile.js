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
var plato = require('gulp-plato');
var jsdoc = require("gulp-jsdoc");
var sonar = require("gulp-sonar");
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

gulp.task('conf-rec', function () {
    gulp.src('conf/config.json')
        .pipe(gulpNgConfig('qaobee.config', {
            environment: 'recette',
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
gulp.task('default', ['clean', 'conf-rec'], function () {
    gulp.start('build');
});

gulp.task('docker', ['clean', 'conf-docker'], function () {
    gulp.start('build');
});

gulp.task('jsdoc', [], function () {
    return gulp.src(conf.paths.src + '/**/*.js')
        .pipe(jsdoc('./docs/jsdoc'))
});
gulp.task('plato', [], function () {
    return gulp.src(conf.paths.src + '/**/*.js')
        .pipe(plato('docs/plato', {
            jshint: {
                options: {
                    strict: true
                }
            },
            complexity: {
                trycatch: true
            }
        }));
});
gulp.task('sonar', function () {
    var options = {
        sonar: {
            host: {
                url: 'http://flufy.hd.free.fr/sonarqube'
            },
            jdbc: {
                url: 'jdbc:mysql://localhost:3306/sonar?useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true&useConfigs=maxPerformance',
                username: 'sonar',
                password: 'sonar'
            },
            projectKey: 'com.qaobee:qswarm-web:1.0.0',
            projectName: 'QSwarmWeb',
            projectVersion: '1.0.0',
            // comma-delimited string of source directories
            sources: 'src/app',
            language: 'js',
            sourceEncoding: 'UTF-8',
            javascript: {
                lcov: {
                    reportPath: 'test/sonar_report/lcov.info'
                }
            },
            exec: {
                // All these properties will be send to the child_process.exec method (see: https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback )
                // Increase the amount of data allowed on stdout or stderr (if this value is exceeded then the child process is killed, and the gulp-sonar will fail).
                maxBuffer: 1024 * 1024
            }
        }
    };

    // gulp source doesn't matter, all files are referenced in options object above
    return gulp.src('thisFileDoesNotExist.js', {read: false})
        .pipe(sonar(options))
        .on('error', util.log);
});