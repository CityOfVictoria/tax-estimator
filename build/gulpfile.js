var gulp = require('gulp');
var react = require('gulp-react');
var uglify = require('gulp-uglify');
var order = require('gulp-order');
var concat = require('gulp-concat');
var del = require('del');


gulp.task('clean:tmp', function (cb) {
  del([
    'tmp/**'
  ], {force:true}, cb);
});

gulp.task('clean:built', function (cb) {
  del([
    '../built/**'
  ], {force:true}, cb);
});

var reactFiles = ['../src/**/*.jsx','!../src/vendor/**'];
gulp.task('react',['clean:tmp'],function(){
    return gulp.src(reactFiles)
    .pipe(react())
    .pipe(gulp.dest('./tmp'));
});
gulp.task('react-prod',['clean:tmp'],function(){
    return gulp.src(reactFiles)
    .pipe(react())
    .pipe(uglify())
    .pipe(gulp.dest('./tmp'));
});

var vendorFiles = ['../src/vendor/**']
gulp.task('vendor',['clean:tmp'],function(){
    return gulp.src(vendorFiles)
    //.pipe(react())
    .pipe(gulp.dest('./tmp/vendor'));
});

gulp.task('embed',['clean:built'],function(){
    return gulp.src('../src/*.html')
    .pipe(gulp.dest('../built'));
});

gulp.task('rates',['clean:built'], function(){
    return gulp.src('../src/rates.js')
    .pipe(gulp.dest('../built'));
});

gulp.task('css',['clean:built'], function(){
    return gulp.src('../src/tax-estimator.css')
    .pipe(gulp.dest('../built'));
});

gulp.task('concat-js',['react-prod','vendor','clean:built'],function(){
    return gulp.src('./tmp/**/*.js')
    .pipe(order([
        'vendor/*.js',
        '**/*.js'
    ]))
    .pipe(concat('tax-estimator.js'))
    .pipe(gulp.dest('../built'));
});

gulp.task('default',['embed','concat-js','rates', 'css']);