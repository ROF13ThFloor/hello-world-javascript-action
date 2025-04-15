const path = require('path');

module.exports = {
  entry: './index.js', // Entry point of your application
  output: {
    filename: 'bundle.js', // Output bundled file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Look for .js files
        include: /node_modules/, // include node_modules folder
        use: {
          loader: 'babel-loader', // Use Babel loader
          options: {
            presets: ['@babel/preset-env'], // Use preset-env for ES6+ to ES5 compilation
          },
        },
      },
    ],
  },
  mode: 'production', // Set mode to 'production' or 'development'
};
