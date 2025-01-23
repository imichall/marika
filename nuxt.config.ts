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
      title: 'Marika Singers',
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
    },
    routeRules: {
      '/**': { cors: true }
    }
  },

  routeRules: {
    '/': {
      ssr: true,
      prerender: true
    },
    '/admin/**': {
      ssr: false,
      experimentalNoScripts: false
    },
    '/**': {
      ssr: true
    }
  },

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseKey: ''
    }
  },

  appConfig: {
    supabase: {
      url: process.env.NUXT_PUBLIC_SUPABASE_URL,
      key: process.env.NUXT_PUBLIC_SUPABASE_KEY
    }
  },

  typescript: {
    strict: true
  },

  modules: [
    'nuxt-icon',
    '@nuxtjs/color-mode'
  ],

  components: {
    dirs: ['~/components']
  },

  imports: {
    dirs: ['composables']
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classPrefix: '',
    classSuffix: '',
  }
})