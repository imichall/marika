<template>
  <header class="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          class="lg:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          @click="mobileMenuOpen = true"
          aria-label="Otevřít navigaci"
        >
          <Icon name="mdi:menu" class="text-2xl" />
        </button>
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Aktuální sekce</p>
          <h1 class="text-xl font-semibold text-slate-900 dark:text-white">{{ sectionTitle }}</h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden sm:flex flex-col text-right">
          <span class="text-xs text-slate-500 dark:text-slate-400">Přihlášený uživatel</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[180px]">{{ userEmail }}</span>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          @click="onLogout"
        >
          <Icon name="mdi:logout" class="text-lg" />
          <span class="hidden sm:inline">Odhlásit</span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-40 bg-black/40"
          @click.self="mobileMenuOpen = false"
        >
          <div class="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col dark:bg-slate-900">
            <div class="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Členská sekce</p>
                <p class="text-sm font-medium text-slate-900 dark:text-white">Marika Singers</p>
              </div>
              <button
                class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                @click="mobileMenuOpen = false"
              >
                <Icon name="mdi:close" class="text-xl" />
              </button>
            </div>

            <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <NuxtLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                :class="route.path === link.to ? 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'"
                @click="mobileMenuOpen = false"
              >
                <Icon :name="link.icon" class="text-lg" />
                {{ link.label }}
              </NuxtLink>
            </nav>

            <div class="px-4 py-3 border-t border-slate-200 flex flex-col gap-2 dark:border-slate-700">
              <NuxtLink
                v-if="canAccessAdmin"
                to="/admin"
                class="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                @click="mobileMenuOpen = false"
              >
                <Icon name="mdi:shield-crown" class="text-lg" />
                Zpět do administrace
              </NuxtLink>
              <NuxtLink
                to="/"
                class="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                @click="mobileMenuOpen = false"
              >
                <Icon name="mdi:open-in-new" class="text-lg" />
                Zpět na web
              </NuxtLink>
              <button
                class="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                @click="() => { onToggleTheme(); mobileMenuOpen = false; }"
              >
                <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" class="text-lg" />
                {{ isDark ? 'Světlý režim' : 'Tmavý režim' }}
              </button>
              <button
                class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                @click="() => { mobileMenuOpen = false; onLogout(); }"
              >
                <Icon name="mdi:logout" class="text-lg" />
                Odhlásit
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// @ts-ignore Nuxt runtime import
import { useRoute } from '#imports'

interface MemberLink {
  label: string
  icon: string
  to: string
}

defineProps<{
  sectionTitle: string
  userEmail: string
  links: MemberLink[]
  onLogout: () => void
  isDark: boolean
  onToggleTheme: () => void
  canAccessAdmin?: boolean
}>()

const mobileMenuOpen = ref(false)
const route = useRoute()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

