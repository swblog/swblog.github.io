const gulp = require('gulp');
const less = require('gulp-less');
const cssmin = require('gulp-minify-css');
const open = require('gulp-open');
const plumber = require('gulp-plumber');
const fs = require('fs');
const path = require('path');
const updateJSON = require('./server/update-index.js');
const os = require('os');
const webpack = require('webpack-stream');
const webpackConfig = require('./source/webpack.config.js');
const getServer = require('./server/app');
const browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? 'google chrome' : (
    os.platform() === 'win32' ? 'chrome' : 'firefox'));

const articleJson = './json/article.json';

//产生文章列表的接口文件
gulp.task('gen', function() {
  updateJSON();
});

//生成定制主题
gulp.task('less', function () {
  return gulp.src('./source/less/custom.bootstrap.less')
  .pipe(less({
    paths: [ path.join(__dirname, 'less', 'includes') ]
  })).pipe(cssmin())
  .pipe(gulp.dest('./source/lib/bootstrap-custom/css'));
});

//本地服务
gulp.task('server', function() {
  let port = 8083;
  getServer(port);
  let options = {
    uri: 'http://localhost:' + port,
    app: browser
  };
  gulp.src(__filename)
    .pipe(open(options));
});

//前端开发构建
gulp.task('dev', function() {
  return gulp.src(__filename)
    .pipe(plumber())
    .pipe(webpack(webpackConfig('dev')))
    .pipe(gulp.dest('source/dist/'));
});


gulp.task('watch', function() {
    gulp.run(['dev', 'server']);
    gulp.watch(['source/src/**/*.js', 'source/src/**/*.css'], ['dev']);
    gulp.watch(['blog/**/**.md'], ['gen']);
    gulp.watch(['source/less/**/**.less'], ['less']);
});
