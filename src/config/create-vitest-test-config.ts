import { loadEnv } from 'vite';
import { InlineConfig } from 'vitest';

//TODO: change inline config
export const createVitestTestConfig = (testingType: string): InlineConfig => {
  return {
    root: './',
    globals: true,
    isolate: false,
    passWithNoTests: true,
    include: [`test/${testingType}/**/*.test.ts`],
    sequence: {
      concurrent: false,
      shuffle: false,
    },
    setupFiles: './test/utils/setup-file.util.ts',
    env: loadEnv('test', process.cwd(), ''),
    reporters: ['verbose', 'html'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: `coverage/${testingType}`,
      include: ['src/**/*.ts'],
    },
  };
};
