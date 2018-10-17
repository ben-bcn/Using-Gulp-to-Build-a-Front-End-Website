"use strict";

var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
     del = require('del'),
  useref = require('gulp-useref'),
     iff = require('gulp-if'),
 concat  = require('gulp-concat'),
    csso = require('gulp-csso'),
 resizer = require('gulp-images-resizer'),
runSequence = require('run-sequence'),
     rep = require('gulp-replace-image-src'),
 browserSync = require('browser-sync').create();

var options = {
  src: 'src',
  dist: 'dist'
};

gulp.task("concatScripts", function() {
  return gulp.src([
    options.src + '/js/jquery.js',
    options.src + '/js/global.js',
    options.src + '/js/circle/autogrow.js',
    options.src + '/js/circle/circle.js'])
  .pipe(maps.init())
  .pipe(concat("all.js"))
  .pipe(maps.write('./'))
  .pipe(gulp.dest(options.dist + "/scripts"));
});

gulp.task("scripts", ["concatScripts"], function() {
  return gulp.src(options.dist + "/scripts/all.js")
    .pipe(uglify())
    .pipe(rename('all.min.js'))
    .pipe(gulp.dest(options.dist + '/scripts'));
});

gulp.task('styles', function() {
  return gulp.src(options.src + "/sass/global.scss")
      .pipe(maps.init())
      .pipe(sass())
      .pipe(csso())
      .pipe(rename('all.min.css'))
      .pipe(maps.write('./'))
      .pipe(gulp.dest(options.dist + '/styles'));
});

gulp.task('stylesSrc', function() {
  return gulp.src(options.src + "/sass/global.scss")
      .pipe(maps.init())
      .pipe(sass())
      .pipe(csso())
      .pipe(rename('global.css'))
      .pipe(maps.write('./'))
      .pipe(gulp.dest(options.src + '/css'));
});

gulp.task('images', function() {
    return gulp.src(options.src + '/images/*')
        .pipe(resizer({
            format: "*",
            width: "50%",
            quality: 75
        }))
    .pipe(gulp.dest(options.dist + '/content'));
});

gulp.task('clean', function() {
  return del(options.dist,options.src + '/css/**');
});

gulp.task('html', ['stylesSrc'], function() {
  var assets = useref.assets();
  gulp.src(options.src + '/index.html')
    .pipe(assets)
    .pipe(iff('*.js',uglify()))
    .pipe(iff('*.css',csso()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(rep({
      prependSrc : 'content/',
      keepOrigin : false
    }))
    .pipe(gulp.dest(options.dist))
    .pipe(browserSync.stream());
});

gulp.task("generateAssets", ['scripts','styles','images'], function() {
  return gulp.src([options.src + "*.html", options.src + "/icons/**"], { base: options.src})
            .pipe(gulp.dest(options.dist));
});

gulp.task('serve', function() {
  // Static server
  browserSync.init({
        // to dev folder
        server: "./src"
    });

  gulp.watch([options.src + '/sass/**/*.scss',options.src + '/sass/**/*.sass'], ['styles','stylesSrc']).on('change', browserSync.reload);
  gulp.watch(options.src + '/*.html').on('change', browserSync.reload);
});

gulp.task("build", function() {
  runSequence('clean','scripts', 'styles','images','html','serve', function() {
  return gulp.src([options.src + "/icons/**"], { base: options.src})
              .pipe(gulp.dest(options.dist));
    done();
  });
})

gulp.task("default", function() {
  gulp.start('build');
});
