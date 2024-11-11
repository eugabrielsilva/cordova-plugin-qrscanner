'use strict';

const gulp = require('gulp');
const insert = require('gulp-insert');
const fs = require('fs');
const { series, parallel } = require('gulp');

const remap = fs.readFileSync('src/common/src/cordova-remap.js', 'utf-8');

function webpack(config, callback) {
  const exec = require('child_process').exec;
  exec(__dirname + '/node_modules/.bin/webpack --config ' + config, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(error);
  });
}

function prepack(cb) {
  webpack('webpack.prepack.config.js', cb);
}

function webpackCordova(cb) {
  webpack('webpack.cordova.config.js', cb);
}

function dist(cb) {
  webpack('webpack.library.config.js', cb);
}

function remapTask() {
  return gulp.src(['dist/plugin.min.js', 'dist/www.min.js'])
    .pipe(insert.prepend(remap))
    .pipe(gulp.dest('dist'));
}

function plugin() {
  return gulp.src(['dist/plugin.min.js'])
    .pipe(gulp.dest('src/browser'));
}

function www() {
  return gulp.src(['dist/www.min.js'])
    .pipe(gulp.dest('www'));
}

// Define task series
const webpackCordovaSeries = series(prepack, webpackCordova);
const distSeries = series(prepack, dist);
const remapSeries = series(webpackCordovaSeries, remapTask);
const pluginSeries = series(remapSeries, plugin);
const wwwSeries = series(remapSeries, www);

// Export tasks
exports.prepack = prepack;
exports.webpackCordova = webpackCordovaSeries;
exports.dist = distSeries;
exports.remap = remapSeries;
exports.plugin = pluginSeries;
exports.www = wwwSeries;

// Default task
exports.default = series(distSeries, pluginSeries, wwwSeries);