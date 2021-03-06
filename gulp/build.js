'use strict';
var git = require('git-rev-sync');
var path = require('path');
var swPrecache = require('sw-precache');
var gulp = require('gulp');
var conf = require('./conf');
var replace = require('gulp-replace');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var deleteEmpty = require('delete-empty');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function () {
    return gulp.src([
        path.join(conf.paths.src, '/app/**/*.html'),
        path.join(conf.paths.tmp, '/serve/app/**/*.html')
    ])
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache('templateCacheHtml.js', {
            module: 'qswarmWeb',
            root: 'app'
        }))
        .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
    var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), {read: false});
    var partialsInjectOptions = {
        starttag: '<!-- inject:partials -->',
        ignorePath: path.join(conf.paths.tmp, '/partials'),
        addRootSlash: false
    };

    var htmlFilter = $.filter('*.html', {restore: true});
    var jsFilter = $.filter('**/*.js', {restore: true});
    var cssFilter = $.filter('**/*.css', {restore: true});
    var assets;

    return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
        .pipe($.inject(partialsInjectFile, partialsInjectOptions))
        .pipe(assets = $.useref.assets())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.sourcemaps.init())
        .pipe($.ngAnnotate({single_quotes: true}))
        .pipe($.uglify({mangle: {toplevel: true, preserveComments: false, except: ['user', 'meta']}}))
        .pipe($.sourcemaps.write('maps'))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(replace(/font\/[^\/]+\/([^\/]+)/g, 'fonts/$1'))
        .pipe(replace(/fonts\/[^\/]+\/([^\/]+)/g, 'fonts/$1'))
        .pipe(replace(/fonts\/fonts\//g, 'fonts/'))
       // .pipe($.sourcemaps.init())
        .pipe($.minifyCss({processImport: false}))
     //   .pipe($.sourcemaps.write('maps'))
        .pipe(cssFilter.restore)
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true,
            conditionals: true
        }))
        .pipe(htmlFilter.restore)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
        .pipe($.size({title: path.join(conf.paths.dist, '/'), showFiles: true}));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function () {
    return gulp.src([path.join('bower_components', '/**/*')])
        .pipe($.filter('**/*.{eot,svg,ttf,otf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
});

gulp.task('other', function () {
    var fileFilter = $.filter(function (file) {
        return file.stat.isFile();
    });

    return gulp.src([
        path.join(conf.paths.src, '/**/*'),
        path.join('!' + conf.paths.src, '/**/*.{html,css,js}')
    ])
        .pipe(fileFilter)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});
gulp.task('delete-empty-directories', function () {
    deleteEmpty.sync(path.join(conf.paths.dist, '/'));
});
gulp.task('i18n', function () {
    return gulp.src([
        'bower_components/angular-i18n/fr*',
        'bower_components/angular-i18n/en*',
        'bower_components/angular-i18n/angular-locale_fr*',
        'bower_components/angular-i18n/angular-locale_en*'
    ])
    .pipe(gulp.dest(conf.paths.dist + '/bower_components/angular-i18n/'));
});
gulp.task('momentjs', function () {
    return gulp.src([
        'bower_components/momentjs/locale/fr*',
        'bower_components/momentjs/locale/en*'
    ])
        .pipe(gulp.dest(conf.paths.dist + '/bower_components/momentjs/locale/'));
});
gulp.task('clean', function () {
    return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});
gulp.task('images', function () {
    return gulp.src('src/assets/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/images'))
});

gulp.task('generate-service-worker', function (callback) {
    swPrecache.write(path.join(conf.paths.dist, 'service-worker.js'), {
        staticFileGlobs: [conf.paths.dist + '/**/*.{json,js,html,css,png,jpg,gif,svg,eot,ttf,woff,woff2}'],
        stripPrefix: conf.paths.dist + '/',
        verbose: true,
        cacheId: 'qaobee_' + getTag()
    }, callback);
});

gulp.task('build', ['html', 'fonts', 'other', 'i18n', 'momentjs', 'images', 'delete-empty-directories', 'generate-service-worker']);


function getTag() {
    var revs = git.tag(false).replace('v', '').split('.');
    return revs[0] + '.' + revs[1] + '.' + (1 + parseInt(revs[2]));
}