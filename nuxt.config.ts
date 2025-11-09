// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap'
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' }
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

  modules: [
    'nuxt-icon',
    '@nuxtjs/color-mode',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin/login',
      exclude: ['/', '/koncerty/*', '/clenove']
    }
  },

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
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      privacyPolicyUrl: process.env.NUXT_PUBLIC_PRIVACY_POLICY_URL || "/zasady-ochrany-soukromi"
    },
    // Server-only environment variables
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL
  },

  nitro: {
    preset: 'netlify',
    experimental: {
      wasm: true
    }
  },

  routeRules: {
    '/': { ssr: false },
    '/admin/**': { ssr: false },
    '/**': { ssr: false }
  },

  build: {
    transpile: ['vue-toastification', 'vue-chartjs', 'chart.js']
  },

  ssr: false,
  compatibilityDate: '2025-01-24'
})