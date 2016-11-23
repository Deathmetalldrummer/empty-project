var gulp = require('gulp'),
    jade = require('gulp-jade'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    rename = require("gulp-rename"),
    browserSync = require('browser-sync');

//jade
gulp.task('jade',function() {
  return gulp.src('Source/Development/Jade/jade.jade')
  .pipe(plumber())
  .pipe(rename('index.jade'))
  .pipe(jade({pretty: true}))//pretty - древовидная структура
  .pipe(gulp.dest('Source/Completed/'))
});

//sass
gulp.task('sass',function() {
  return gulp.src('Source/Development/Sass/sass.sass')
  .pipe(plumber())
  .pipe(rename('style.sass'))
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('Source/Completed/Stylesheets/'))
});

//js
gulp.task('js', function() {
  return gulp.src('Source/Development/JavaScript/javascript.js')
  // .pipe(plumber())
  .pipe(concat('javascript.js'))
  .pipe(gulp.dest('Source/Completed/JavaScript/'))
});

//server
gulp.task('server', function () {
  browserSync({
    port: 9000,
    server: {
      baseDir: 'Source/Completed/'
    }
  });
});

// copy
gulp.task('copy', function() {
  return gulp.src('Source/Development/{Images,Fonts}/**/*.*')
  .pipe(gulp.dest('Source/Completed/'))
});

//watch
// gulp.task('watch', function () {
//   gulp.watch([
//     'Source/Completed/**/*.html',
//     'Source/Completed/**/*.css',
//     'Source/Completed/**/*.js'
//   ]).on('change', browserSync.reload);
// });

//watching
gulp.task('watching', function() {
    gulp.watch(['Source/Completed/**/*.{html,css,js}']).on('change', browserSync.reload);
    gulp.watch('Source/Development/**/*.sass', ['sass']);
    gulp.watch('Source/Development/**/*.jade', ['jade']);
    gulp.watch('Source/Development/**/*.js', ['js']);
});

// dev
gulp.task('dev',['sass','jade','js','copy']);

// default
gulp.task('default', ['server','watching']);
