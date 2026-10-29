import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['backend/test/**/*.test.ts'],
    setupFiles: ['backend/test/setup.ts'],
    hookTimeout: 60_000,
    testTimeout: 15_000,
    fileParallelism: false,
  },
});