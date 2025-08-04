import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { createVitestTestConfig } from './src/config/create-vitest-test-config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: {
    alias: {
      find: '@',
      replacement: path.resolve(__dirname, '../..'),
      '/@shared/': path.resolve(__dirname, '../../src/shared'),
    },
  },
  test: createVitestTestConfig('(unit|e2e|integration)'),
  plugins: [swc.vite(), tsconfigPaths()],
});
