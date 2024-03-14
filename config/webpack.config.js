'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common(env, argv), {
    devtool: 'source-map',
    entry: {
      app: PATHS.src + '/App.tsx',
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
    },
  });

module.exports = config;
