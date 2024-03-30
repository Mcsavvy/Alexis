'use strict';

const path = require('path');

const PATHS = {
  src: path.resolve(__dirname, '../src'),
  build: path.resolve(__dirname, '../build'),
  root: path.resolve(__dirname, '..'),
  manifest: path.resolve(__dirname, '../public/manifest.json'),
};

module.exports = PATHS;
