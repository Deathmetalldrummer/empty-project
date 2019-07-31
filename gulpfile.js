const { series, parallel, task, src, dest, watch, gulp } = require('gulp');
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

const paths = {
	pug: {
		src: [devel + '**/*.{pug,jade}', '!**/_*/**', '!**/_*'],
		dest: build
	},
	sass: {
		src: [devel + '**/*.{sass,scss}', '!**/_*/**', '!**/_*'],
		dest: build,
		min: {
			src: [build + '**/*.css', '!' + build + '**/*.min.css'],
			dest: build
		},
	},
	js: {
		src: [devel + '**/*.js', '!**/_*/**', '!**/_*'],
		dest: build,
		min: {
			src: [build + '**/*.js', '!' + build + '**/*.min.js'],
			dest: build
		},
	},
	img: {
		src: devel + '**/_pictures/**/*.{png,jpg,svg}',
		dest: build
	},
	font: {
		src: devel + '**/*.{woff,woff2,ttf}',
		dest: build
	},
	other: {
		src: [devel + '**/*.{json}', '!**/_*/**', '!**/_*'],
		dest: build
	},
	watch: {
		pug: devel + '**/*.{pug,jade}',
		sass: devel + '**/*.{sass,scss}',
		js: devel + '**/*.js',
		font: devel + '**/*.{woff,woff2,ttf}',
		img: devel + '**/*.{png,jpg,svg}',
		other: devel + '**/*.{json}',
		build: build + '**/*.{html,css,js}'
	}

};

var prefix = {
	overrideBrowserslist: ['last 5 versions'],
	cascade: false
}


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
	return src(paths.pug.src)
		.pipe(plumber_())
		.pipe(pug_({pretty: true}))
		.pipe(dest(paths.pug.dest))
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              SASS
///////////////////////////////////////////////////////////////////////////////////////
//sass - задача для главного файла стилей
function sass() {
	return src(paths.sass.src)
		.pipe(plumber_())
		.pipe(sass_().on('error', sass_.logError))
		.pipe(autoprefixer_(prefix))
		.pipe(dest(paths.sass.dest))
}

function css_min() {
	return src(paths.sass.min.src)
		.pipe(mini_())
		.pipe(rename_({
			suffix: '.min'
		}))
		.pipe(dest(paths.sass.min.dest))
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              JAVASCRIPT
///////////////////////////////////////////////////////////////////////////////////////
function js() {
	return src(paths.js.src)
		.pipe(plumber_())
		.on('data',function(file){includeJS(file)})
		.pipe(dest(paths.js.dest))
}

function js_min() {
	return src(paths.js.min.src)
		.pipe(plumber_())
		.pipe(uglify_())
		.pipe(rename_({
			suffix: '.min'
		}))
		.pipe(dest(paths.js.min.dest))
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              COPY
///////////////////////////////////////////////////////////////////////////////////////
function copy_font() {
	return src(paths.font.src)
		.on('data',function(file){
			replacePath(file,'_fonts/','fonts/');
		})
		.pipe(dest(paths.font.dest))
}

function copy_img() {
	return src(paths.img.src)
		.on('data', function(file) {
			replacePath(file,'_pictures/','pictures/');
		})
		.pipe(dest(paths.img.dest))
}

function copy_other() {
	return src(paths.other.src)
		.pipe(dest(paths.other.dest))
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
function watching() {
	watch(paths.watch.pug, _pug);
	watch(paths.watch.sass, _sass);
	watch(paths.watch.js, _js);
	watch(paths.watch.font, copy_font);
	watch(paths.watch.img, copy_img);
	watch(paths.watch.other, copy_other);
	watch(paths.watch.build).on('change', browserSync_.reload);
}


///////////////////////////////////////////////////////////////////////////////////////
//                                                              RUN
///////////////////////////////////////////////////////////////////////////////////////

const _pug = exports.pug = pug;
const _sass = exports.sass = series(sass, css_min);
const _js = exports.js = series(js, js_min);
const _copy = exports.copy = parallel(copy_font, copy_img, copy_other);
const _clean = exports.clean = clean;

const dev = series(_pug, _sass, _js, _copy);

exports.default = series(dev, parallel(watching, server));
