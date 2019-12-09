const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

gulp.task('build-script', function () {
    return gulp.src('./build/static/js/*.js')
        //.pipe(sourcemaps.init())
        //.pipe(babel({
        //    presets: ['@babel/preset-env', '@babel/preset-react']
        //}))
        .pipe(concat('vdr.js'))
        .pipe(gulp.dest('./dist/VirtualDocumentRoomModules/Files/SiteAssets/js'))
        .pipe(gulp.dest('v:/SiteAssets/js'))
});

gulp.task('build-css', function () {
    return gulp.src('./build/static/css/*.css')
        .pipe(concat('vdr.css'))
        .pipe(gulp.dest('./dist/VirtualDocumentRoomModules/Files/SiteAssets/css'))
        .pipe(gulp.dest('v:/SiteAssets/css'))
});

gulp.task('default', gulp.parallel(['build-script', 'build-css']))