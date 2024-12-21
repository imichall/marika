// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap'
        }
      ],
      script: [
        {
          src: '/autofill.js',
          defer: true
        }
      ],
      title: 'Název vašeho webu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Popis vašeho webu' }
      ],
    }
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2024-12-19',

  experimental: {
    payloadExtraction: false
  },

  nitro: {
    preset: 'netlify',
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  },

  ssr: false,

  typescript: {
    strict: true
  },

  routeRules: {
    '/': {
      ssr: true,
      prerender: true
    },
    '/**': {
      ssr: false
    }
  },

  generate: {
    dir: 'dist'
  }
})