const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

gulp.task('build-script', function () {
    const src = [
        './src/script/*.js',
        './src/components/*.js'
    ];

    return gulp.src(src)
        //.pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env', '@babel/preset-react']
        }))
        .pipe(concat('vdr.js'))
        .pipe(gulp.dest('./dist/js'))
});

gulp.task('build-css', function () {
    const src = [
        './src/css/*.css'
    ];

    return gulp.src(src)
        .pipe(concat('vdr.css'))
        .pipe(gulp.dest('./dist/css'))
});

gulp.task('default', gulp.parallel(['build-script', 'build-css']))