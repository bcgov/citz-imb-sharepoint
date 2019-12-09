const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('build-script', function () {
    return gulp.src('./build/static/js/*.js')
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