var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');

var DEST = './';

gulp.task('default', function () {
  return gulp.src('src/poisson-process.js')
    .pipe(gulp.dest(DEST))
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DEST));
});

gulp.task('test', function () {
  return gulp.src('test/poisson-process.test.js', { read: false })
    .pipe(mocha({
      reporter: 'spec',
      timeout: 60000 // stochastic tests require long timeout
    }));
});
