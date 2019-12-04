const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cssMin = require('gulp-css');

gulp.task('css', function () {
    gulp.src(['./src/css/*.css'])
        .pipe(concat('vdr.css'))
        .pipe(cssMin())
        .pipe(gulp.dest('./dist/VirtualDocumentRoomModules/Files/SiteAssets/css'))
});

gulp.task('scripts', function () {
    gulp.src(['./src/js/*.js'])
        .pipe(concat('vdr.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/VirtualDocumentRoomModules/Files/SiteAssets/js'))
});

gulp.task('default', gulp.parallel('css', 'scripts'));
