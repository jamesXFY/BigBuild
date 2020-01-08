const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  devtool: '#eval-source-map',
  entry: [
    'babel-polyfill',
    './src/js/main.js',
  ],
  externals: {
    'google.maps': 'google.maps'
  },
  output: {
    filename: 'disruptions.min.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"dev"'
      }
    }),
    new CopyWebpackPlugin([
      { from: 'src/styles', to: 'styles' }
    ]),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      publicPath: 'src'
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        sourceMap: true
      }
    })
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    },
    extensions: ['.js', '.vue', '.json']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
};
