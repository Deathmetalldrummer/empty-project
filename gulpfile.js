// Blacklist    https://github.com/gulpjs/plugins/blob/master/src/blackList.json
var gulp = require('gulp'),
      jade = require('gulp-jade'),
      pug = require('gulp-pug'),
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


var path = 'devel/';
var pathOut = '../'
var prefix = {
      browsers: ['last 5 versions'],
      cascade: false
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JADE
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('jade', function() {
      return gulp.src(path + 'jade_pug/*.jade')
            .pipe(plumber())
            .pipe(jade({
                  pretty: true
            })) //pretty - древовидная структура
            .pipe(gulp.dest(pathOut))
});

gulp.task('pug', function buildHTML() {
      return gulp.src(path + 'jade_pug/*.pug')
            .pipe(plumber())
            .pipe(pug({
                  pretty: true
            }))
            .pipe(gulp.dest(pathOut))
});

gulp.task('Jade', function() {
      runSequence('jade', 'pug');
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SASS
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('sass', function() {
      return gulp.src(path + 'sass/*.sass')
            .pipe(plumber())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer(prefix))
            .pipe(gulp.dest(pathOut + 'css/'))
});

gulp.task('css:min', function() {
      return gulp.src([path + 'css/*.css', '!' + path + 'css/*.min.css'])
            .pipe(mini())
            .pipe(rename({
                  suffix: '.min'
            }))
            .pipe(gulp.dest(pathOut + 'css/'))
});

gulp.task('Sass', function() {
      runSequence('sass', 'css:min');
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JAVASCRIPT
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('js:min', function() {
      return gulp.src([path + 'js/*.js', '!' + path + 'js/*.min.js'])
            .pipe(uglify())
            .pipe(rename({
                  suffix: '.min'
            }))
            .pipe(gulp.dest(pathOut + 'js/'))
});

gulp.task('JavaScript', function() {
      runSequence('js:min');
});



///////////////////////////////////////////////////////////////////////////////////////
//                                                              IMAGE MIN
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('imgMin', function() {
      return gulp.src(path + 'images/**/*.{png,jpg}')
            .pipe(imagemin())
            .pipe(gulp.dest(pathOut + 'images/'))
});



///////////////////////////////////////////////////////////////////////////////////////
//                                                              COPY
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('copy', function() {
  return gulp.src(path+'{images,fonts}/**/*.*')
  .pipe(gulp.dest(pathOut))
});



///////////////////////////////////////////////////////////////////////////////////////
//                                                              CLEAN
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('clean', function() {
    del([pathOut+'.','!'+pathOut+'source/.'],{force: true});
});



///////////////////////////////////////////////////////////////////////////////////////
//                                                              SERVER
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('server', function() {
      browserSync({
            port: 9000,
            server: {
                  baseDir: pathOut
            }
      });
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              WATCHING
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('watching', function() {
      gulp.watch(pathOut+'{.,css,js}/*.{html,css,js}').on('change', browserSync.reload);
      gulp.watch(path + '**/*.{sass,scss}', ['Sass']);
      gulp.watch(path + '**/*.{jade,pug}', ['Jade']);
      gulp.watch(path + '**/*.js', ['JavaScript']);
});

///////////////////////////////////////////////////////////////////////////////////////
//                                                              RUN
///////////////////////////////////////////////////////////////////////////////////////
// dev
gulp.task('dev', ['Jade', 'Sass', 'JavaScript', 'copy']);

// serv
gulp.task('serv', ['server', 'watching']);

// default
gulp.task('default', ['dev', 'server', 'watching']);
