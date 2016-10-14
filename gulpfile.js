'use strict';

var gulp = require('gulp'),
  jade = require('jade'),
  modRewrite = require('connect-modrewrite'),
  webpack = require('webpack-stream'),
  NwBuilder = require('nw-builder'),
  merge = require('merge-stream');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'browser-sync']
});

// Constants
var BUILD_DIR = '.build/';
var TMP_DIR = '.tmp/';
var PACKAGES_DIR = 'packages/';

var meta = require('./package.json');

// Webpack
gulp.task('webpack:vendor', function() {
  return gulp.src('app/scripts/vendor.js')
    .pipe(webpack({
      output: {
        filename: 'vendor.js'
      },
      target: 'node-webkit'
    }))
    .pipe(gulp.dest(TMP_DIR + 'scripts/'))
});

gulp.task('webpack', function() {
  return gulp.src('app/scripts/entry.js')
    .pipe(webpack({
      module: {
        loaders: [
          { test: /\.json$/, loader: 'json-loader' }
        ]
      },
      output: {
        filename: 'app.js'
      },
      target: 'node-webkit'
    }))
    .pipe(gulp.dest(TMP_DIR + 'scripts/'))
    .pipe($.browserSync.reload({stream:true}));
});

// Views
gulp.task('jade:dev', function(){
  return gulp.src('app/views/**/*.jade')
    .pipe($.jade({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest(TMP_DIR + 'views'));
});

gulp.task('jade:dist', function(){
  return gulp.src('app/views/**/*.jade')
    .pipe($.jade({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest(BUILD_DIR + 'views'));
});

// Html
gulp.task('html:dev', ['jade:dev'], function() {
  return gulp.src(TMP_DIR + 'views/index.html')
    .pipe(gulp.dest(TMP_DIR))
    .pipe($.browserSync.reload({stream:true}));
});

gulp.task('html:dist', ['jade:dist'], function() {
  return gulp.src(BUILD_DIR + 'views/index.html')
    .pipe(gulp.dest(BUILD_DIR))
});

// Sass
gulp.task('sass', function () {
  return $.rubySass('app/styles/app.scss', { sourcemap: true })
    .on('error', function (err) {
      console.error('Error!', err.message);
    })
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(TMP_DIR + 'styles'))
    .pipe($.browserSync.reload({stream:true}));
});

// Images
gulp.task('images:dist', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(BUILD_DIR + 'images/'))
});

gulp.task('images:dev', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(TMP_DIR + 'images/'))
    .pipe($.browserSync.reload({stream:true}));
});

// package.json
gulp.task('packagejson', function () {
  return gulp.src('app/package.json')
    .pipe(gulp.dest(BUILD_DIR))
});

// .htaccess
gulp.task('htaccess', function () {
  return gulp.src('.htaccess')
    .pipe(gulp.dest(BUILD_DIR));
});

// Static server
gulp.task('serve:dev', ['dev'], function() {
  $.browserSync({
    open: false,
    server: {
      baseDir: [".",TMP_DIR,"app"],
      middleware: [
        modRewrite([
          '!\\.html|\\.js|\\.css|\\.png|\\.jpg|\\.gif|\\.svg|\\.txt$ /index.html [L]'
        ])
      ]
    }
  });
});

gulp.task('serve:dist', function() {
  $.browserSync({
    open: false,
    server: {
      baseDir: [BUILD_DIR],
      middleware: [
        modRewrite([
          '!\\.html|\\.js|\\.css|\\.png|\\.jpg|\\.gif|\\.svg|\\.txt$ /index.html [L]'
        ])
      ]
    }
  });
});

// e2e tests
gulp.task('webdriver-update', $.protractor.webdriver_update);
gulp.task('protractor', ['webdriver-update'], function () {
  gulp.src(['test/e2e/**/*.js'])
    .pipe($.protractor.protractor({
      configFile: "test/protractor.config.js",
      args: ['--baseUrl', 'http://localhost:3000']
    }))
    .on('error', function (e) {
      throw e
    });
});

// Clean
gulp.task('clean', function () {
  $.del.sync([
    TMP_DIR + 'scripts',
    TMP_DIR + 'views',
    TMP_DIR + 'styles',
    TMP_DIR + 'index.html',
    BUILD_DIR + '*'
  ]);
});

// Development
gulp.task('dev', ['clean', 'webpack', 'webpack:vendor', 'sass', 'html:dev', 'images:dev']);

// Default Task (Dev environment)
gulp.task('default', ['serve:dev'], function() {
  // Scripts
  gulp.watch(['config.json', 'app/scripts/**/*.js'], ['webpack']);

  // Views
  $.watch('app/views/**/*.jade')
    .pipe($.jadeFindAffected())
    .pipe($.jade({jade: jade, pretty: true}))
    .pipe(gulp.dest(TMP_DIR + 'views'));

  // Htmls
  gulp.watch(TMP_DIR + 'views/**/*.html', ['html:dev']);

  // Styles
  gulp.watch('app/styles/**/*.scss', ['sass']);
});

gulp.task('deps', ['html:dist'], function () {
  var assets = $.useref.assets();

  return gulp.src([BUILD_DIR + 'index.html'])
    // Concatenates asset files from the build blocks inside the HTML
    .pipe(assets)
    // Appends hash to extracted files app.css → app-098f6bcd.css
    .pipe($.rev())
    // Adds AngularJS dependency injection annotations
    .pipe($.if('*.js', $.ngAnnotate()))
    // Uglifies js files
    .pipe($.if('*.js', $.uglify()))
    // Minifies css files
    .pipe($.if('*.css', $.csso()))
    // Brings back the previously filtered HTML files
    .pipe(assets.restore())
    // Parses build blocks in html to replace references to non-optimized scripts or stylesheets
    .pipe($.useref())
    // Rewrites occurences of filenames which have been renamed by rev
    .pipe($.revReplace())
    // Minifies html
    .pipe($.if('*.html', $.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    })))
    // Creates the actual files
    .pipe(gulp.dest(BUILD_DIR))
    // Print the file sizes
    .pipe($.size({ title: BUILD_DIR, showFiles: true }));
});

// Distribution
gulp.task('prepare', ['dev', 'images:dist', 'htaccess', 'packagejson']);
gulp.task('dist', ['prepare', 'deps']);

// Build packages
gulp.task('build', ['dist'], function() {
  var nw = new NwBuilder({
    files: [BUILD_DIR + '**/**'], // use the glob format
    platforms: ['win', 'osx', 'linux'],
    // TODO: Use these instead of the nested app/package.json values
    //appName: meta.name,
    //appVersion: meta.version,
    buildDir: PACKAGES_DIR,
    macZip: true,
    cacheDir: TMP_DIR,
    version: '0.12.3'
    // TODO: timestamped versions
    // TODO: macIcns
    // TODO: winIco
  });

  return nw.build()
    .catch(function (error) {
      console.error(error);
    });
});

// Zip packages
gulp.task('zip', ['build'], function() {
  // Zip the packages
  var linux32 = gulp.src(PACKAGES_DIR + meta.name + '/linux32/**/*')
    .pipe($.zip('linux32.zip'))
    .pipe(gulp.dest(PACKAGES_DIR + meta.name));

  var linux64 = gulp.src(PACKAGES_DIR + meta.name + '/linux64/**/*')
    .pipe($.zip('linux64.zip'))
    .pipe(gulp.dest(PACKAGES_DIR + meta.name));

  var osx32 = gulp.src(PACKAGES_DIR + meta.name + '/osx32/**/*')
    .pipe($.zip('osx32.zip'))
    .pipe(gulp.dest(PACKAGES_DIR + meta.name));

  var osx64 = gulp.src(PACKAGES_DIR + meta.name + '/osx64/**/*')
    .pipe($.zip('osx64.zip'))
    .pipe(gulp.dest(PACKAGES_DIR + meta.name));

  var win32 = gulp.src(PACKAGES_DIR + meta.name + '/win32/**/*')
    .pipe($.zip('win32.zip'))
    .pipe(gulp.dest(PACKAGES_DIR + meta.name));

  var win64 = gulp.src(PACKAGES_DIR + meta.name + '/win64/**/*')
    .pipe($.zip('win64.zip'))
    .pipe(gulp.dest(PACKAGES_DIR + meta.name));

  return merge(linux32, linux64, osx32, osx64, win32, win64);
});

// Final product
gulp.task('packages', ['build', 'zip']);
