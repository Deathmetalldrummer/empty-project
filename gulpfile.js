// Blacklist    https://github.com/gulpjs/plugins/blob/master/src/blackList.json
var gulp = require('gulp'),
	jade = require('gulp-jade'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	rename = require("gulp-rename"),
	browserSync = require('browser-sync'),
	autoprefixer = require('gulp-autoprefixer'),
	mini = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	runSequence = require('run-sequence'),
	fs = require("fs");

var devel = 'source/devel/',
	build = 'source/build/';

var prefix = {
	browsers: ['last 5 versions'],
	cascade: false
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JADE
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('Pug', function() {
	return gulp.src(devel + '*.{pug,jade}')
		.pipe(plumber())
		.pipe(pug(
			{pretty: true}
		)) //pretty - древовидная структура
		.pipe(gulp.dest(build))
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SASS
///////////////////////////////////////////////////////////////////////////////////////
//sass - задача для главного файла стилей
gulp.task('sass', function() {
	return gulp.src(devel + 'bem/*.{sass,scss}')
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer(prefix))
		.pipe(gulp.dest(build + 'css/'))
});

gulp.task('css:min', function() {
	return gulp.src([build + 'css/*.css', '!' + build + 'css/*.min.css'])
		.pipe(mini())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(build + 'css/'))
});

gulp.task('Sass', function() {
	runSequence('sass', 'css:min');
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JAVASCRIPT
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('js', function() {
	var includeJSON = JSON.parse(fs.readFileSync(devel + 'include.json','utf8'));
	return gulp.src(includeJSON)
		.pipe(plumber())
		.pipe(concat('index.js'))
		.pipe(gulp.dest(build + 'js/'))
});

gulp.task('js:min', function() {
	return gulp.src([build + 'js/*.js', '!' + build + 'js/*.min.js'])
		.pipe(plumber())
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(build + 'js/'))
});

gulp.task('JavaScript', function() {
	runSequence('js', 'js:min');
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              IMAGE MIN
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('img:min', function() {
	return gulp.src([build + 'image/**/*.{png,jpg}', '!' + build + 'image/min/**/*.*'])
		.pipe(imagemin())
		.pipe(gulp.dest(build + 'image/min/'))
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              COPY
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('copy:font', function() {
	return gulp.src(devel + '**/*.{woff,woff2,ttf}')
	.on('data',function(file){
		if (~file.path.indexOf('font')) {
			var end = file.path.substring(file.path.indexOf('font'));
			var start = file.base;
			file.path = start+end;
		}
	})
	.pipe(gulp.dest(build))
});

gulp.task('copy:img', function() {
	return gulp.src(devel + '**/*.{png,jpg}')
	.on('data',function(file){
		if (~file.path.indexOf('image')) {
			var end = file.path.substring(file.path.indexOf('image'));
			var start = file.base;
			file.path = start+end;
		}
	})
	.pipe(gulp.dest(build))
});

gulp.task('copy', function() {
	runSequence('copy:font', 'copy:img');
});




///////////////////////////////////////////////////////////////////////////////////////
//                                                              CLEAN
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('clean', function() {
	del(build);
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SERVER
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('server', function() {
	browserSync({
		port: 9000,
		server: {
			baseDir: './'
		}
	});
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              WATCHING
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('watching', function() {
	gulp.watch(build + '**/*.{html,css,js}').on('change', browserSync.reload);
	gulp.watch(devel + '**/*.{sass,scss}', ['Sass']);
	gulp.watch(devel + '**/*.{pug,jade}', ['Pug']);
	gulp.watch(devel + '**/*.js', ['JavaScript']);
});


///////////////////////////////////////////////////////////////////////////////////////
//                                                              RUN
///////////////////////////////////////////////////////////////////////////////////////
// dev
gulp.task('dev', ['Pug', 'Sass', 'JavaScript', 'copy']);

// default
gulp.task('default', ['dev', 'server', 'watching']);
