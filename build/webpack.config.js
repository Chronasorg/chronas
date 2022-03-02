const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const project = require('../project.config')
const inProject = path.resolve.bind(path, project.basePath)
const inProjectSrc = (file) => inProject(project.srcDir, file)

const __DEV__ = project.env === 'development'
const __TEST__ = project.env === 'test'
const __PROD__ = project.env === 'production'

const config = {
  optimization: {},
  mode: project.env,
  entry: {
    normalize: [
      inProjectSrc('normalize'),
    ],
    main: [
      inProjectSrc(project.main),
    ],
  },
  devtool: project.sourcemaps ? 'source-map' : false,
  output: {
    path: inProject(project.outDir),
    filename: __DEV__ ? '[name].js' : '[name].[chunkhash].js',
    publicPath: project.publicPath,
  },
  resolve: {
    modules: [
      inProject(project.srcDir),
      'node_modules',
    ],
    alias: {
      react: path.resolve('./node_modules/react'),
    },
    extensions: ['*', '.js', '.jsx', '.json'],
  },
  externals: project.externals,
  module: {
    rules: [],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),

    new webpack.ProvidePlugin({
      'window.Quill': 'quill/dist/quill.js',
      'Quill': 'quill/dist/quill.js',
    }),
    new webpack.DefinePlugin(Object.assign({
     'process.env': { NODE_ENV: JSON.stringify(project.env) },
     __DEV__,
     __TEST__,
     __PROD__,
    }, project.globals))
  ],
}

// JavaScript
// ------------------------------------
config.module.rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: [{
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      plugins: [
        'babel-plugin-transform-class-properties',
        'babel-plugin-syntax-dynamic-import',
        [
          'babel-plugin-transform-runtime',
          {
            helpers: true,
            polyfill: false, // we polyfill needed features in src/normalize.js
            regenerator: true,
          },
        ],
        [
          'babel-plugin-transform-object-rest-spread',
          {
            useBuiltIns: true // we polyfill Object.assign in src/normalize.js
          },
        ],
        'lodash'
      ],
      presets: [
        'react',
        'babel-preset-react',
        ['babel-preset-env', {
          modules: false,
          targets: {
            ie9: true,
          },
          uglify: true,
        }],
        ['env', { modules: false, targets: { node: 4 } }],
      ]
    },
  }],
})

// Styles
// ------------------------------------
//const extractStyles = new ExtractTextPlugin({
//  filename: 'styles/[name].[contenthash].css',
//  allChunks: true,
//  disable: __DEV__,
//})

config.module.rules.push({
  test: /\.(sass|scss|css)$/,
   use: [
            !__PROD__ ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader",
          ]
})
//config.plugins.push(extractStyles)

// Images
// ------------------------------------
config.module.rules.push({
  test    : /\.(png|jpg|gif)$/,
  loader  : 'url-loader',
  options : {
    limit : 8192,
  },
})

// Fonts
// ------------------------------------
;[
  ['woff', 'application/font-woff'],
  ['woff2', 'application/font-woff2'],
  ['otf', 'font/opentype'],
  ['ttf', 'application/octet-stream'],
  ['eot', 'application/vnd.ms-fontobject'],
  ['svg', 'image/svg+xml'],
].forEach((font) => {
  const extension = font[0]
  const mimetype = font[1]

  config.module.rules.push({
    test    : new RegExp(`\\.${extension}$`),
    loader  : 'url-loader',
    options : {
      name  : 'fonts/[name].[ext]',
      limit : 10000,
      mimetype,
    },
  })
})

// HTML Template
// ------------------------------------
config.plugins.push(new HtmlWebpackPlugin({
  template: inProjectSrc('index.html'),
  inject: true,
  minify: {
    collapseWhitespace: true,
  },
}))

// Development Tools
// ------------------------------------
if (__DEV__) {
  config.entry.main.push(
    `webpack-hot-middleware/client.js?path=${config.output.publicPath}__webpack_hmr`
  )
  config.optimization.moduleIds = 'named';
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
  )
}

// Bundle Splitting
// ------------------------------------
if (!__TEST__) {
  const bundles = ['normalize', 'manifest']

  if (project.vendors && project.vendors.length) {
    bundles.unshift('vendor')
    config.entry.vendor = project.vendors
  }
//  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({ names: bundles }))
}

// Production Optimizations
// ------------------------------------
if (__PROD__) {
  config.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new LodashModuleReplacementPlugin({
      'collections': true,
      'shorthands': true
    }),
    new MiniCssExtractPlugin()
  )
}

module.exports = config
