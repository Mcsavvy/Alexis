'use strict';
const { config: dotenvConfig } = require('dotenv');
const { DefinePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExtReloader = require('webpack-ext-reloader');
const PATHS = require('./paths');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
const { EnvValidatePlugin } = require('./plugins');

const enableSentry = process.env.SENTRY_ENABLED === 'true';
const version = require('../package.json').version;
const nodeEnv = process.env.NODE_ENV;

/**
 * Transform the manifest.json file
 * @param {string} mode
 * @param {Buffer} content
 * @returns
 */
function transformManifest(mode, content) {
  const manifest = JSON.parse(content.toString());
  manifest.version = version;
  if (nodeEnv === 'development') {
    // Development mode
    if (mode === 'development') {
      // watch mode
      manifest.name += '(dev)';
    } else {
      // build mode
      manifest.name += ' Insiders';
    }
  } else {
    // Production mode
    if (mode.includes('development')) {
      // watch mode
      manifest.name += '(staging)';
    } else {
      // build mode
      manifest.name += '';
    }
  }
  return JSON.stringify(manifest, null, 2);
}

// used in the module rules and in the stats exlude list
const IMAGE_TYPES = /\.(png|jpe?g|gif|svg)$/i;

const common = (env, argv) => ({
  output: {
    // the build folder to output bundles and assets in.
    path: PATHS.build,
    // the filename template for entry chunks
    filename: '[name].js',
  },
  stats: {
    all: false,
    errors: true,
    builtAt: true,
    assets: true,
    excludeAssets: [IMAGE_TYPES],
  },
  module: {
    rules: [
      // Help webpack in understanding CSS files imported in .js files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      // Help webpack in understanding typescript files
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Help webpack in understanding jsx files
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      // Check for images imported in .js files and
      {
        test: IMAGE_TYPES,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    // Validate the environment variables
    new EnvValidatePlugin(),
    // Reload the extension on file changes
    new ExtReloader({
      manifest: PATHS.manifest,
      entries: {
        contentScript: 'contentScript',
        background: 'background',
        sidePanel: 'app',
      },
    }),
    // Copy static assets from `public` folder to `build` folder
    // and transform the manifest.json file
    new CopyWebpackPlugin({
      patterns: [
        { from: '**/*', context: 'public' },
        {
          from: PATHS.manifest,
          to: PATHS.build + '/manifest.json',
          transform: transformManifest.bind(null, [env]),
        },
      ],
    }),
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    // .env variables
    new DefinePlugin({ 'process.env': JSON.stringify(dotenvConfig().parsed) }),
    sentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'futurdevs',
      project: 'alexis-ui',
      telemetry: false,
      disable: argv.mode === 'development' || !enableSentry,
      release: {
        name:
          nodeEnv === 'development'
            ? `alexis-ui@${version}-dev`
            : `alexis-ui@${version}`,
      },
    }),
  ],
});

module.exports = common;
