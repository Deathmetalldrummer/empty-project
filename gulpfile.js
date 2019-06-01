// Blacklist    https://github.com/gulpjs/plugins/blob/master/src/blackList.json
var gulp = require('gulp'),
	jade = require('gulp-jade'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	rename = require("gulp-rename"),
	browserSync = require('browser-sync').create(),
	autoprefixer = require('gulp-autoprefixer'),
	mini = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	del = require('del'),
	runSequence = require('run-sequence'),
	fs = require("fs"),
	path = require("path");

var devel = 'source/devel/',
	build = 'source/build/';

var prefix = {
	browsers: ['last 5 versions'],
	cascade: false
}

var other_files_copy = 'json';

function includeJS(file) {
	var slash_path = file.path.replace(/\\/g, '/');
	var file_path = slash_path.slice(slash_path.indexOf(devel), slash_path.length);

	var str_from = '//#include("';
	var str_to = '");';

	file.contents = Buffer.from(result_string(absolute_file(file_path)));
}

function result_string(string) {
	var str_from = '//#include("';
	var str_to = '");';
	var arr = find_path(string);
	for (var i = 0; i < arr.length; i++) {
		string = string.replace(str_from + arr[i] + str_to, absolute_file(arr[i]));
	}

	if (string.indexOf(str_from) > -1) string = result_string(string);

	return string
}

function find_path(string) {
	var str_from = '//#include("';
	var str_to = '");';
	var arr = [];

	if (string.indexOf(str_from) !== -1) getPath(str_from, str_to, 0);

	function getPath(from, to, search) {
		var substr_from = string.indexOf(from, search) + from.length;
		var substr_to = string.indexOf(to, substr_from);
		var res = string.slice(substr_from, substr_to);
		arr.push(res);
		if (string.indexOf(from, substr_to) !== -1) {
			getPath(from, to, substr_to);
		}
	}
	return arr;
}

function absolute_file(some_path) {
	var str_from = '//#include("';
	var parent_folder = some_path.replace(some_path.slice(some_path.lastIndexOf('/') + 1, some_path.length), '').replace(devel, '');
	var file_content = fs.readFileSync(some_path, 'utf8');
	file_content = file_content.replace(/\/\/#include\("/g, str_from + devel + parent_folder);
	return file_content;
}




///////////////////////////////////////////////////////////////////////////////////////
//                                                              JADE
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('Pug', function() {
	return gulp.src(['!**/_*/**','!**/_*',devel + '**/*.{pug,jade}'])
		.pipe(plumber())
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest(build))
});



///////////////////////////////////////////////////////////////////////////////////////
//                                                              SASS
///////////////////////////////////////////////////////////////////////////////////////
//sass - задача для главного файла стилей
gulp.task('sass', function() {
	return gulp.src(['!**/_*/**','!**/_*',devel + '**/*.{sass,scss}'])
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer(prefix))
		.pipe(gulp.dest(build))
});

gulp.task('css:min', function() {
	return gulp.src(['!' + build + '**/*.min.css', build + '**/*.css'])
		.pipe(mini())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(build))
});

gulp.task('Sass', function() {
	runSequence('sass', 'css:min');
});



///////////////////////////////////////////////////////////////////////////////////////
//                                                              JAVASCRIPT
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('js', function() {
	return gulp.src(['!**/_*/**','!**/_*',devel + '**/*.js'])
		.pipe(plumber())
		.on('data',function(file){includeJS(file)})
		.pipe(gulp.dest(build))
});

gulp.task('js:min', function() {
	return gulp.src(['!' + build + '**/*.min.js', build + '**/*.js'])
		.pipe(plumber())
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(build))
});

gulp.task('JavaScript', function() {
	runSequence('js', 'js:min');
});



///////////////////////////////////////////////////////////////////////////////////////
//                                                              COPY
///////////////////////////////////////////////////////////////////////////////////////
gulp.task('copy:font', function() {
	return gulp.src(devel + '**/*.{woff,woff2,ttf}')
	.on('data',function(file){
		replacePath(file,'_fonts/','font/');
	})
	.pipe(gulp.dest(build))
});

gulp.task('copy:img', function() {
	return gulp.src([devel + '**/_pictures/**/*.{png,jpg,svg}'])
	.on('data', function(file) {
		replacePath(file,'_pictures/','pictures/');
	})
	.pipe(gulp.dest(build))
});

gulp.task('copy:other', function() {
	return gulp.src(['!**/_*/**','!**/_*',devel + '**/*.' + other_files_copy])
	.pipe(gulp.dest(build))
});

gulp.task('copy', function() {
	runSequence('copy:font', 'copy:img', 'copy:other');
});

function replacePath(file,str,strTo) {
	var filePath = file.path.replace(/\\/g,'/');
	var picIndex = filePath.indexOf(str);
	var develIndex = filePath.indexOf(devel);
	var fromTo = filePath.slice(develIndex+devel.length,picIndex+str.length);
	file.path = filePath.replace(fromTo,strTo);
}



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
	browserSync.init({
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
	gulp.watch(devel + '**/*.{sass,scss}', ['Sass']).on('change', browserSync.reload);
	gulp.watch(devel + '**/*.{pug,jade}', ['Pug']).on('change', browserSync.reload);
	gulp.watch(devel + '**/*.js', ['JavaScript']).on('change', browserSync.reload);
	// gulp.watch(build + '**/*.{html,css,js}').on('change', browserSync.reload);
});



///////////////////////////////////////////////////////////////////////////////////////
//                                                              RUN
///////////////////////////////////////////////////////////////////////////////////////
// dev
gulp.task('dev', ['Pug', 'Sass', 'JavaScript', 'copy']);

// default
gulp.task('default', ['dev', 'server', 'watching']);
