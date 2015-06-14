'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var wrench = require('wrench');
var gulpNgConfig = require('gulp-ng-config');

var options = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e',
  errorHandler: function(title) {
    return function(err) {
      gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
      this.emit('end');
    };
  },
  wiredep: {
    directory: 'bower_components'
  }
};

wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file)(options);
});

gulp.task('conf-dev', function () {
  gulp.src('conf/config.json')
      .pipe(gulpNgConfig('qaobee.config', {
          environment: 'local'
      }))
      .pipe(gulp.dest('./src/app'))
});

gulp.task('default', ['clean', 'conf-dev'], function () {
    gulp.start('build');
});
