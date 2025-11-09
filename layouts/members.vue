<template>
  <div :class="wrapperClasses">
    <div class="hidden lg:block sticky top-0 h-screen flex-shrink-0">
      <MemberSidebar
        :links="navigationLinks"
        v-model:collapsed="sidebarCollapsed"
        :is-dark="isMembersDark"
        :on-toggle-theme="toggleMembersTheme"
        :user-role="sidebarUser.role"
      />
    </div>

    <div class="flex-1 flex flex-col min-h-screen bg-white/60 dark:bg-slate-900/40">
      <MemberHeader
        :user-email="sidebarUser.email ?? ''"
        :on-logout="handleLogout"
        :section-title="currentTitle"
        :links="navigationLinks"
        :is-dark="isMembersDark"
        :on-toggle-theme="toggleMembersTheme"
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

import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
// @ts-ignore Nuxt runtime import
import { useRouter, useRoute, useColorMode, useState, useSupabaseClient } from '#imports'
import { useAuth } from '~/composables/useAuth'

const { user, logout, checkUser } = useAuth()
const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

const sidebarUser = useState<{ email: string | null; role: string }>('current-user-role', () => ({ email: null, role: 'viewer' }))

const colorMode = useColorMode()
const previousTheme = ref(colorMode.preference || 'light')
const membersTheme = useState<'light' | 'dark'>('members-theme', () => 'light')
const storageKey = computed(() => `members-theme-${sidebarUser.value.email ?? 'guest'}`)

const applyTheme = (theme: 'light' | 'dark') => {
  if (membersTheme.value !== theme) {
    membersTheme.value = theme
  }
  if (colorMode.preference !== theme) {
    colorMode.preference = theme
  }
  if (process.client) {
    localStorage.setItem(storageKey.value, theme)
  }
}

const syncThemeWithStorage = () => {
  if (!process.client) return
  const stored = localStorage.getItem(storageKey.value)
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored)
  } else {
    applyTheme(membersTheme.value)
  }
}

const toggleMembersTheme = () => {
  const next = membersTheme.value === 'dark' ? 'light' : 'dark'
  applyTheme(next)
}

const isMembersDark = computed(() => membersTheme.value === 'dark')

const wrapperClasses = computed(() => [
  'min-h-screen flex',
  isMembersDark.value ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
])

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
  if (!user.value?.email) {
    sidebarUser.value = { email: null, role: 'viewer' }
    router.push(`/clenska-sekce/prihlaseni?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  let role = 'viewer'
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('email', user.value.email)
      .single()

    if (!error && data?.role) {
      role = data.role
    }
  } catch (err) {
    console.error('Nepodařilo se načíst roli uživatele:', err)
  }

  sidebarUser.value = {
    email: user.value.email,
    role
  }
}

const handleLogout = async () => {
  await logout()
  sidebarUser.value = { email: null, role: 'viewer' }
  router.push('/clenska-sekce/prihlaseni')
}

if (process.client) {
  onMounted(async () => {
    previousTheme.value = colorMode.preference || 'light'
    syncThemeWithStorage()
    await ensureAuthenticated()
  })

  onBeforeUnmount(() => {
    colorMode.preference = previousTheme.value || 'light'
  })

  watch(
    () => route.fullPath,
    async () => {
      await ensureAuthenticated()
    }
  )

  watch(
    () => sidebarUser.value.email,
    () => {
      syncThemeWithStorage()
    }
  )
}
</script>

