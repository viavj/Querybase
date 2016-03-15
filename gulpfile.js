/// <reference path="./typings/gulp/gulp.d.ts" />

'use strict';

const gulp = require('gulp');
const del = require('del');
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');
const istanbul = require('gulp-istanbul');
const tsBuild = require('./build/tsBuild');
const connect = require('gulp-connect');
const open = require('gulp-open');
const firebaseTestServer = require('./tests/firebaseServer');
const Server = require('karma').Server;

const exit = () => process.exit(0);

gulp.task('clean', () => del(['examples/*.js', 'examples/*.js.map', '!examples/index.js', 'dist']));

gulp.task('typescript', () => {
	return tsBuild({ declaration: true })
		.pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./examples'))
});

gulp.task('pre-test', function () {
  return gulp
    .src(['./dist/querybase.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

// Use for build process, continues stream
gulp.task('test', ['firebaseServer', 'typings', 'pre-test'], () => {
  return gulp
   .src('./tests/unit/**.spec.js', { read: false })
	 .pipe(mocha({ reporter: 'spec' }))
   .pipe(istanbul.writeReports());
});

gulp.task('firebaseServer', () => {
  firebaseTestServer();
});

gulp.task('coverageServer', () => {
  connect.server({
    root: 'coverage',
    port: 8001,
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./coverage/*.html')
    .pipe(connect.reload());
});
 
gulp.task('watch', function () {
  gulp.watch(['./coverage/*.html'], ['html']);
});


gulp.task('coverage', ['watch', 'coverageServer']);

gulp.task('typings', () => {
  return gulp
    .src('./tests/**/*.d.ts')
    .pipe(gulp.dest('./typings'));
});

gulp.task('karma', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('default', ['typescript', 'test'], exit);