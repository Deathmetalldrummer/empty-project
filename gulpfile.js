// Blacklist    https://github.com/gulpjs/plugins/blob/master/src/blackList.json
var gulp = require('gulp'),
    jade = require('gulp-jade'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    rename = require("gulp-rename"),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    mini = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    runSequence = require('run-sequence');

var pathDev = 'Source/Development/',
       pathCom = 'Source/Completed/';

var prefix = {
          browsers: ['last 5 versions'],
          cascade: false
      }


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JADE
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('jade',function() {
  return gulp.src(pathDev+'Jade/jade.jade')
  .pipe(plumber())
  .pipe(jade({pretty: true}))//pretty - древовидная структура
  .pipe(rename({basename: 'index'}))
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

gulp.task('Jade', function(){
    runSequence('jade','jade:pages');
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SASS
///////////////////////////////////////////////////////////////////////////////////////
//sass - задача для главного файла стилей
gulp.task('sass',function() {
  return gulp.src(pathDev+'Sass/sass.sass')
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer(prefix))
  .pipe(rename({basename: 'style'}))
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
  .pipe(autoprefixer(prefix))
  .pipe(gulp.dest(pathCom+'Stylesheets/'))
});

gulp.task('css:min',function() {
    return gulp.src([pathCom+'Stylesheets/*.css', '!'+pathCom+'Stylesheets/*.min.css'])
    .pipe(mini())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(pathCom+'Stylesheets/'))
});

gulp.task('Sass', function(){
    runSequence('sass','sass:libs','css:min');
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JAVASCRIPT
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('js', function() {
  return gulp.src(pathDev+'JavaScript/javascript.js')
  .pipe(gulp.dest(pathCom+'JavaScript/'))
});

gulp.task('js:min',function() {
  return gulp.src([pathCom+'JavaScript/*.js', '!'+pathCom+'JavaScript/*.min.js'])
  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest(pathCom+'JavaScript/'))
});

gulp.task('JavaScript', function(){
    runSequence('js','js:min');
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              IMAGE MIN
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('imgMin', function() {
  return gulp.src([pathDev+'Images/**/*.{png,jpg}', '!'+pathDev+'Images/sprite/**/*.*'])
  .pipe(imagemin())
  .pipe(gulp.dest(pathCom+'Images/'))
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              COPY
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('copy', function() {
  return gulp.src([pathDev+'{Images,Fonts}/**/*.*', '!'+pathDev+'Images/sprite/**/*.*'])
  .pipe(gulp.dest(pathCom))
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              CLEAN
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('clean', function() {
    del(pathCom);
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
    gulp.watch(pathDev+'**/*.{sass,scss}', ['Sass']);
    gulp.watch(pathDev+'**/*.jade', ['Jade']);
    gulp.watch(pathDev+'**/*.js', ['JavaScript']);
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
gulp.task('dev',['Jade','Sass','JavaScript','copy']);

// default
gulp.task('default', ['dev','server','watching']);
