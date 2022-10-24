const {resolve} = require('path')

/** @type {import('webpack').Configuration} */
module.exports = {
  output: {
    clean: true,
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    path: resolve('dist/webpack/'),
    publicPath: 'auto',
  },
  devtool: 'source-map',
  mode: 'production',
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        /**
         * Transform ts and tsx files
         * with swc-loader, using the config
         * defined in `.swcrc`
         */
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'swc-loader'
      }
    ]
  },
  optimization: {
    minimize: true
  },

  plugins: [],

}

