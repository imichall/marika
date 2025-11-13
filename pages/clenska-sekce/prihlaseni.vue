<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6">
      <div class="text-center space-y-2">
        <Icon name="mdi:account-music" class="text-5xl text-red-600 mx-auto" />
        <h1 class="text-3xl font-semibold text-slate-900">Členská sekce</h1>
        <p class="text-slate-600 text-sm">
          Přihlaste se prosím pomocí údajů, které jste obdrželi. Účet je společný pro administraci i členskou sekci.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-slate-700">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="např. jana.novakova@example.com"
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-slate-700">Heslo</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="Zadejte heslo"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
          :disabled="loading"
        >
          <Icon name="mdi:login" class="text-lg" />
          {{ loading ? 'Přihlašuji...' : 'Přihlásit se' }}
        </button>
      </form>

      <div class="text-center text-sm text-slate-500">
        Potřebujete pomoc? Napište na
        <a href="mailto:info@marikasingers.cz" class="font-medium text-red-600 hover:underline">info@marikasingers.cz</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { login, user, checkUser } = useAuth()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const redirectTo = (path?: string | null) => {
  const target = typeof path === 'string' && path.startsWith('/clenska-sekce') ? path : '/clenska-sekce'
  router.push(target)
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const success = await login(email.value, password.value)
    if (success) {
      toast.success('Přihlášení proběhlo úspěšně')
      redirectTo(route.query.redirect as string | undefined)
    } else {
      error.value = 'Neplatné přihlašovací údaje'
    }
  } catch (err: any) {
    console.error('Chyba při přihlášení do členské sekce:', err)
    error.value = err.message ?? 'Přihlášení se nezdařilo'
  } finally {
    loading.value = false
  }
}

if (process.client) {
  watchEffect(async () => {
    await checkUser()
    if (user.value) {
      redirectTo(route.query.redirect as string | undefined)
    }
  })
}
</script>

