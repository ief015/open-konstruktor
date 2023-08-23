import { defineVitestConfig  } from 'nuxt-vitest/config'

export default defineVitestConfig ({
  test: {
    include: ['**/tests/*.ts'],
  },
});
