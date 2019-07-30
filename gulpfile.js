const { series, parallel, task, src, dest, watch } = require('gulp');
const jade_ = require('gulp-jade'),
			pug_ = require('gulp-pug'),
			sass_ = require('gulp-sass'),
			concat_ = require('gulp-concat'),
			plumber_ = require('gulp-plumber'),
			rename_ = require("gulp-rename"),
			browserSync_ = require('browser-sync').create(),
			autoprefixer_ = require('gulp-autoprefixer'),
			mini_ = require('gulp-clean-css'),
			uglify_ = require('gulp-uglify'),
			del_ = require('del'),
			fs_ = require("fs"),
			path_ = require("path");

var devel = 'source/devel/',
		build = 'source/build/';

var prefix = {
	browsers: ['last 5 versions'],
	cascade: false
}

var other_files_copy = '{json,jpeg,jpg,png,svg}';

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
	var file_content = fs_.readFileSync(some_path, 'utf8');
	file_content = file_content.replace(/\/\/#include\("/g, str_from + devel + parent_folder);
	return file_content;
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JADE
///////////////////////////////////////////////////////////////////////////////////////
function pug() {
	return src([devel + '**/*.{pug,jade}', '!**/_*/**', '!**/_*'])
		.pipe(plumber_())
		.pipe(pug_({pretty: true}))
		.pipe(dest(build))
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SASS
///////////////////////////////////////////////////////////////////////////////////////
//sass - задача для главного файла стилей
function sass() {
	return src([devel + '**/*.{sass,scss}', '!**/_*/**', '!**/_*'])
		.pipe(plumber_())
		.pipe(sass_().on('error', sass_.logError))
		// .pipe(autoprefixer_(prefix))
		.pipe(dest(build))
}

function css_min() {
	return src([build + '**/*.css', '!' + build + '**/*.min.css'])
		.pipe(mini_())
		.pipe(rename_({
			suffix: '.min'
		}))
		.pipe(dest(build))
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JAVASCRIPT
///////////////////////////////////////////////////////////////////////////////////////
function js() {
	return src([devel + '**/*.js', '!**/_*/**', '!**/_*'])
		.pipe(plumber_())
		.on('data',function(file){includeJS(file)})
		.pipe(dest(build))
}

function js_min() {
	return src(['!' + build + '**/*.min.js', build + '**/*.js'])
		.pipe(plumber_())
		.pipe(uglify_())
		.pipe(rename_({
			suffix: '.min'
		}))
		.pipe(dest(build))
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              COPY
///////////////////////////////////////////////////////////////////////////////////////
function copy_font() {
	return src(devel + '**/*.{woff,woff2,ttf}')
		.on('data',function(file){
			replacePath(file,'_fonts/','fonts/');
		})
		.pipe(dest(build))
}

function copy_img() {
	return src(devel + '**/_pictures/**/*.{png,jpg,svg}')
		.on('data', function(file) {
			replacePath(file,'_pictures/','pictures/');
		})
		.pipe(dest(build))
}

function copy_other() {
	return src([devel + '**/*.' + other_files_copy, '!**/_*/**', '!**/_*'])
		.pipe(dest(build))
}

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
async function clean() {
	del_(build);
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SERVER
///////////////////////////////////////////////////////////////////////////////////////
function server() {
	browserSync_.init({
		port: 9000,
		server: {
			baseDir: './'
		}
	});
}



///////////////////////////////////////////////////////////////////////////////////////
//                                                              WATCHING
///////////////////////////////////////////////////////////////////////////////////////
async function watching() {
	watch(devel + '**/*.{pug,jade}', _pug).on('change', browserSync_.reload);
	watch(devel + '**/*.{sass,scss}', _sass).on('change', browserSync_.reload);
	watch(devel + '**/*.js', _js).on('change', browserSync_.reload);
	watch(devel + '**/*.{woff,woff2,ttf}', copy_font).on('change', browserSync_.reload);
	watch(devel + '**/*.{png,jpg,svg}', copy_img).on('change', browserSync_.reload);
	watch(devel + '**/*.' + other_files_copy, copy_other).on('change', browserSync_.reload);
	// watch(build + '**/*.{html,css,js}').on('change', browserSync.reload);
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              RUN
///////////////////////////////////////////////////////////////////////////////////////

const _pug = exports.Pug = pug;
const _sass = exports.Sass = series(sass, css_min);
const _js = exports.JavaScript = series(js, js_min);
const _copy = exports.Copy = parallel(copy_font, copy_img, copy_other);
const _clean = exports.clean = clean;

const dev = series(_pug, _sass, _js, _copy);

exports.default = series(dev, server, watching);
