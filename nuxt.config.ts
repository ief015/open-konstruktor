import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-vitest', '@vueuse/nuxt'],
  alias: {
    '@/*': './*',
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      dev: process.env.NODE_ENV === 'development',
    },
  },
  ssr: false,
  vite: {
    plugins: [
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
    ],
  },
});
