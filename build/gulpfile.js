var gulp = require('gulp');
var react = require('gulp-react');
var uglify = require('gulp-uglify');

gulp.task('react',[],function(){
    return gulp.src(['../src/**/*.jsx','!../src/vendor/**'])
    .pipe(react())
    .pipe(gulp.dest('../built'));
});

gulp.task('vendor-js',[],function(){
    return gulp.src('../src/vendor/**')
    .pipe(react())
    .pipe(gulp.dest('../built/vendor'));
});

gulp.task('embed',[],function(){
return gulp.src('../src/embed-code.html')
    .pipe(gulp.dest('../built'));
})

gulp.task('default',['react', 'vendor-js', 'embed']);