<template>
  <div class="min-h-screen flex bg-slate-50 text-slate-900">
    <div class="hidden lg:block sticky top-0 h-screen">
      <MemberSidebar
        :links="navigationLinks"
        v-model:collapsed="sidebarCollapsed"
      />
    </div>

    <div class="flex-1 flex flex-col min-h-screen">
      <MemberHeader
        :user-email="user?.email ?? ''"
        :on-logout="handleLogout"
        :section-title="currentTitle"
        :links="navigationLinks"
      />

      <main class="flex-1 overflow-y-auto px-6 py-8">
        <div class="mx-auto max-w-6xl">
          <slot />
        </div>
      </main>
    </div>

    <ToastNotifications />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'members']
})

import { computed, onMounted, ref, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { user, logout, checkUser } = useAuth()
const router = useRouter()
const route = useRoute()

const sidebarCollapsed = ref(false)

const navigationLinks = computed(() => [
  { label: 'Přehled', icon: 'mdi:view-dashboard', to: '/clenska-sekce' },
  { label: 'Repertoár', icon: 'mdi:music-note-plus', to: '/clenska-sekce/repertoar' },
  { label: 'Členové', icon: 'mdi:account-group', to: '/clenska-sekce/clenove' },
  { label: 'Ke stažení', icon: 'mdi:folder-download', to: '/clenska-sekce/ke-stazeni' }
])

const currentTitle = computed(() => {
  if (route.path.includes('/repertoar')) return 'Repertoár'
  if (route.path.includes('/clenove')) return 'Seznam členů'
  if (route.path.includes('/ke-stazeni')) return 'Dokumenty ke stažení'
  return 'Členská sekce'
})

const ensureAuthenticated = async () => {
  await checkUser()
  if (!user.value) {
    router.push(`/clenska-sekce/prihlaseni?redirect=${encodeURIComponent(route.fullPath)}`)
  }
}

const handleLogout = async () => {
  await logout()
  router.push('/clenska-sekce/prihlaseni')
}

if (process.client) {
  onMounted(async () => {
    await ensureAuthenticated()
  })

  watch(
    () => route.fullPath,
    async () => {
      await ensureAuthenticated()
    }
  )
}
</script>

