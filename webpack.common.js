/* eslint-disable */
const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const firebaseConfigPath = fs.existsSync(path.join(__dirname, 'config.js'))
  ? path.join(__dirname, 'config.js')
  : path.join(__dirname, 'config.example.js');

module.exports = {
  entry: './src/index.js',

  resolve: {
    alias: {
      '@app/firebase-config': firebaseConfigPath,
    },
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|webp|ico|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      favicon: './resources/logosmall.ico',
    }),
  ],
};
