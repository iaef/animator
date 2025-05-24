const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development', // 'production' or 'development'
  // Entry point for the React application will now be the ui-editor's index.tsx
  entry: './packages/ui-editor/src/index.tsx', 
  target: 'electron-renderer', // Important for Electron renderer process
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: { // Path aliases for monorepo-like structure
      'haiku-core-logic': path.resolve(__dirname, 'packages/core-logic/src'),
      'haiku-rendering-engine-canvas': path.resolve(__dirname, 'packages/rendering-engine-canvas/src'),
      'haiku-lottie-exporter': path.resolve(__dirname, 'packages/lottie-exporter/src'),
      'haiku-project-io': path.resolve(__dirname, 'packages/project-io/src'),
      // No alias for ui-editor itself as it's the entry point / local src for the bundle
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Use root index.html as a template
      filename: 'index.html',   // Output filename
    }),
  ],
};
