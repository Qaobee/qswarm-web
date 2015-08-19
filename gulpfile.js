'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var wrench = require('wrench');
var gulpNgConfig = require('gulp-ng-config');
var plato = require('gulp-plato');
var jsdoc = require("gulp-jsdoc");

var options = {
    src: 'src',
    dist: 'dist',
    tmp: '.tmp',
    e2e: 'e2e',
    errorHandler: function (title) {
        return function (err) {
            gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
            this.emit('end');
        };
    },
    wiredep: {
        directory: 'bower_components'
    }
};

wrench.readdirSyncRecursive('./gulp').filter(function (file) {
    return (/\.(js|coffee)$/i).test(file);
}).map(function (file) {
    require('./gulp/' + file)(options);
});

gulp.task('conf-dev', function () {
    gulp.src('conf/config.json')
        .pipe(gulpNgConfig('qaobee.config', {
            environment: 'local',
            wrap: true
        }))
        .pipe(gulp.dest('./src/app'))
});

gulp.task('conf-prod', function () {
    gulp.src('conf/config.json')
        .pipe(gulpNgConfig('qaobee.config', {
            environment: 'production',
            wrap: true
        }))
        .pipe(gulp.dest('./src/app'))
});

gulp.task('default', ['clean', 'conf-prod'], function () {
    gulp.start('build');
});

gulp.task('jsdoc', [], function () {
    return gulp.src(options.src + '/**/*.js')
        .pipe(jsdoc('./docs/jsdoc'))
});
gulp.task('plato', [], function () {
    return gulp.src(options.src + '/**/*.js')
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