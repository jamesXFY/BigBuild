const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
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
        NODE_ENV: '"production"'
      }
    }),
    // new UglifyJsPlugin({
    //   uglifyOptions: {
    //     sourceMap: false
    //   }
    // })
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.min'
    },
    extensions: ['.js', '.vue', '.json']
  },
  externals: {
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    jquery: 'jQuery',
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
