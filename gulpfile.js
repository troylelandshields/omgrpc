var

// Dependencies
gulp = require('gulp'),
p = require('./package.json'),

// File Paths
base = '/',
build = 'build/',
css = 'app/styles/',
js = 'app/scripts/',
views = 'app/views/',
nodeDeps = 'node_modules/',

path = {
  output: {
    nodeDeps: build + nodeDeps
  }
};

// Tasks:

// Node dependencies modules copy task
// ignores developer dependencies
gulp.task('nodeDeps', function() {
  var res = [];
  for(var i in p.dependencies) {
    res.push(nodeDeps+i+'/**/*.*');
  }

  return gulp.src(res, { base: nodeDeps })
    .pipe(gulp.dest(path.output.nodeDeps));
});

// copy package.json to dist
gulp.task('packageFile', function() {
  return gulp.src('package.json')
    .pipe(gulp.dest(build));
});

gulp.task('configFile', function() {
  return gulp.src('app/config.json')
    .pipe(gulp.dest(build+"app/"));
});

gulp.task('views', function() {
  return gulp.src(views+"/**")
    .pipe(gulp.dest(build+views));
});

gulp.task('css', function() {
  return gulp.src(css+"/**")
    .pipe(gulp.dest(build+css));
});

gulp.task('js', function() {
  return gulp.src(js+"/**")
    .pipe(gulp.dest(build+js));
});

gulp.task('indexHtml', function() {
  return gulp.src('app/index.html')
    .pipe(gulp.dest(build+"app/"));
});
// Default task
gulp.task('default', [
  'css',
  'js',
  'indexHtml',
  'views',
  'nodeDeps',
  'packageFile',
  'configFile'
]);