'use strict'

const gulp = require('gulp')
const env = require('gulp-env')
const mocha = require('gulp-mocha')
const jshint = require('gulp-jshint')
const plumber = require('gulp-plumber')
const nodemon = require('gulp-nodemon')
const standard = require('gulp-standard')
const jsonlint = require('gulp-json-lint')

let paths = {
  js: ['*.js', '*/*.js', '*/**/*.js', '!node_modules/**', '!gulpfile.js'],
  json: ['*.json', '*/*.json', '*/**/*.json', '!node_modules/**'],
  tests: ['./tests/builder/*.js', './tests/halter/*.js']
}

gulp.task('js-lint', function () {
  return gulp.src(paths.js)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
})

gulp.task('json-lint', function () {
  return gulp.src(paths.json)
    .pipe(plumber())
    .pipe(jsonlint({comments: true}))
    .pipe(jsonlint.report())
})

gulp.task('standard', function () {
  return gulp.src(paths.js)
    .pipe(standard())
    .pipe(standard.reporter('default', {
      showRuleNames: true,
      showFilePath: true,
      breakOnError: true,
      quiet: true
    }))
})

gulp.task('run-tests', function () {
  return gulp
    .src(paths.tests, {
      read: false
    })
    .pipe(mocha({
      reporter: 'list'
    }))
    .once('error', function (error) {
      console.error(error)
      process.exit(1)
    })
    .once('end', function () {
      process.exit()
    })
})

let runApp = function (nodeEnv = 'development') {
  env({
    vars: {
      NODE_ENV: nodeEnv
    }
  })

  nodemon({
    ext: 'js',
    watch: paths.js,
    restartable: 'rs',
    script: 'index.js',
    ignore: ['node_modules', '.idea', '.git', '.gitignore', '.gitlab-ci.yml', 'app.yml', 'Dockerfile', '.dockerignore', '.jshintrc']
  })
}

gulp.task('lint', ['js-lint', 'json-lint', 'standard'])
gulp.task('test', ['lint', 'run-tests'])
gulp.task('run', () => runApp())
