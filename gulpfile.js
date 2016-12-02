var gulp = require('gulp'),
    jade = require('gulp-jade'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    rename = require("gulp-rename"),
    browserSync = require('browser-sync');

var pathDev = 'Source/Development/',
       pathCom = 'Source/Completed/';


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JADE
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('jade',function() {
  return gulp.src(pathDev+'Jade/jade.jade')
  .pipe(plumber())
  .pipe(rename('index.jade'))
  .pipe(jade({pretty: true}))//pretty - древовидная структура
  .pipe(gulp.dest(pathCom))
});

gulp.task('jade:pages',function() {
  return gulp.src([
      pathDev+'Jade/*.jade',
      '!'+pathDev+'Jade/jade.jade'
  ])
  .pipe(plumber())
  .pipe(jade({pretty: true}))//pretty - древовидная структура
  .pipe(gulp.dest(pathCom))
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SASS
///////////////////////////////////////////////////////////////////////////////////////
//sass - задача для главного файла стилей
gulp.task('sass',function() {
  return gulp.src(pathDev+'Sass/sass.sass')
  .pipe(plumber())
  .pipe(rename('style.sass'))
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(pathCom+'Stylesheets/'))
});

//sass:libs - задача для всех файлов стилей внутри папки Sass кроме главного
gulp.task('sass:libs',function() {
  return gulp.src([
      pathDev+'Sass/*.{sass,scss}',
      '!'+pathDev+'Sass/sass.sass'
  ])
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(pathCom+'Stylesheets/'))
});

///////////////////////////////////////////////////////////////////////////////////////
//                                                              JAVASCRIPT
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('js', function() {
  return gulp.src(pathDev+'JavaScript/javascript.js')
  // .pipe(plumber())
  .pipe(concat('javascript.js'))
  .pipe(gulp.dest(pathCom+'JavaScript/'))
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              COPY
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('copy', function() {
  return gulp.src(pathDev+'{Images,Fonts}/**/*.*')
  .pipe(gulp.dest(pathCom))
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SERVER
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('server', function () {
  browserSync({
    port: 9000,
    server: {
      baseDir: pathCom
    }
  });
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              WATCHING
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('watching', function() {
    gulp.watch(pathCom+'**/*.{html,css,js}').on('change', browserSync.reload);
    gulp.watch(pathDev+'**/*.{sass,scss}', ['sass','sass:libs']);
    gulp.watch(pathDev+'**/*.jade', ['jade','jade:pages']);
    gulp.watch(pathDev+'**/*.js', ['js']);
});

// gulp.task('watching', function() {
//     gulp.watch(pathCom+'**/*.{html,css,js}').on('change', browserSync.reload);
//     gulp.watch(pathDev+'Sass/sass.sass', ['sass']);
//     gulp.watch([pathDev+'**/*.{sass,scss}', '!'+pathDev+'Sass/sass.sass'], ['sass:libs']);
//     gulp.watch(pathDev+'**/*.jade', ['jade']);
//     gulp.watch(pathDev+'**/*.js', ['js']);
// });


///////////////////////////////////////////////////////////////////////////////////////
//                                                              RUN
///////////////////////////////////////////////////////////////////////////////////////
// dev
gulp.task('dev',['sass','sass:libs','jade','jade:pages','js','copy']);

// def
gulp.task('def', ['dev','server','watching']);

// default
gulp.task('default', ['server','watching']);
