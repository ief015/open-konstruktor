import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    include: ['**/tests/**/*.ts'],
    exclude: ['**/tests/**/*.bench.ts'],
  },
});
