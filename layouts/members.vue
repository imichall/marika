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
const themeStorageKey = 'clenska-sekce-theme'
const sidebarStorageKey = 'clenska-sekce-sidebar-collapsed'

const applyTheme = (theme: 'light' | 'dark') => {
  if (membersTheme.value !== theme) {
    membersTheme.value = theme
  }
  if (colorMode.preference !== theme) {
    colorMode.preference = theme
  }
  if (process.client) {
    localStorage.setItem(themeStorageKey, theme)
  }
}

const syncThemeWithStorage = () => {
  if (!process.client) return
  const stored = localStorage.getItem(themeStorageKey)
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

const syncSidebarWithStorage = () => {
  if (!process.client) return
  const stored = localStorage.getItem(sidebarStorageKey)
  if (stored === 'true' || stored === 'false') {
    sidebarCollapsed.value = stored === 'true'
  }
}

const saveSidebarState = (collapsed: boolean) => {
  if (process.client) {
    localStorage.setItem(sidebarStorageKey, String(collapsed))
  }
}

// Watch sidebar state and save to localStorage
watch(sidebarCollapsed, (newValue) => {
  saveSidebarState(newValue)
})

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
  // Kontrola přihlášení přes oddíl
  if (process.client) {
    const memberDepartment = localStorage.getItem('memberDepartment')
    const memberUser = localStorage.getItem('memberUser')

    if (memberDepartment && memberUser) {
      try {
        const dept = JSON.parse(memberDepartment)
        const member = JSON.parse(memberUser)
        sidebarUser.value = {
          email: `${member.full_name} (${dept.display_name})`,
          role: 'member'
        }
        return
      } catch (err) {
        console.error('Chyba při parsování localStorage:', err)
        // Pokud se nepodaří parsovat, smaž a přesměruj
        localStorage.removeItem('memberDepartment')
        localStorage.removeItem('memberUser')
      }
    }
  }

  // Kontrola běžného email přihlášení
  await checkUser()
  if (!user.value?.email) {
    sidebarUser.value = { email: null, role: 'viewer' }
    // Přesměruj na přihlášení pouze pokud nejsme už na přihlašovací stránce
    if (route.path !== '/clenska-sekce/prihlaseni') {
      router.push(`/clenska-sekce/prihlaseni?redirect=${encodeURIComponent(route.fullPath)}`)
    }
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
  // Smaž i department přihlášení a info o členovi
  if (process.client) {
    localStorage.removeItem('memberDepartment')
    localStorage.removeItem('memberUser')
  }
  sidebarUser.value = { email: null, role: 'viewer' }
  router.push('/clenska-sekce/prihlaseni')
}

if (process.client) {
  onMounted(async () => {
    previousTheme.value = colorMode.preference || 'light'
    syncThemeWithStorage()
    syncSidebarWithStorage()
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

