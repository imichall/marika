<template>
  <header class="bg-white border-b border-slate-200">
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
          <p class="text-xs uppercase tracking-wide text-slate-500">Aktuální sekce</p>
          <h1 class="text-xl font-semibold text-slate-900">{{ sectionTitle }}</h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden sm:flex flex-col text-right">
          <span class="text-xs text-slate-500">Přihlášený uživatel</span>
          <span class="text-sm font-medium text-slate-900 truncate max-w-[180px]">{{ userEmail }}</span>
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
          <div class="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div class="flex items-center justify-between px-4 py-4 border-b border-slate-200">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500">Členská sekce</p>
                <p class="text-sm font-medium text-slate-900">Marika Singers</p>
              </div>
              <button
                class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
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
                :class="route.path === link.to ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                @click="mobileMenuOpen = false"
              >
                <Icon :name="link.icon" class="text-lg" />
                {{ link.label }}
              </NuxtLink>
            </nav>

            <div class="px-4 py-3 border-t border-slate-200">
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

