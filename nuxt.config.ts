import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@/*': './*',
  },
  devtools: { enabled: false },
  experimental: {
    viteEnvironmentApi: true,
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/test-utils/module', '@vueuse/nuxt'],
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
  testUtils: {},
  vite: {
    plugins: [
      nodePolyfills({
        globals: { Buffer: true },
      }),
    ],
  },
});
