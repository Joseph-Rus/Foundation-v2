import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import path from 'path';

export const rendererConfig: Configuration = {
  module: {
    rules: [
      ...rules,
      // Include any renderer-specific rules here
    ],
  },
  plugins: [
    ...plugins,
    // Include any renderer-specific plugins here
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
};