<template>
  <aside
    class="hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out h-full dark:bg-slate-900 dark:border-slate-700"
    :class="[collapsed ? 'w-20' : 'w-64']"
  >
    <div class="flex items-center px-4 py-4 gap-3 text-slate-900 font-semibold dark:text-white">
      <Icon name="mdi:music-clef-treble" class="text-3xl text-red-600" />
      <span v-if="!collapsed" class="text-lg leading-tight text-left">
        Členská sekce
      </span>
    </div>

    <nav class="flex-1 px-2 py-4 space-y-1">
      <NuxtLink
        v-for="link in filteredLinks"
        :key="link.to"
        :to="link.to"
        class="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        :class="[
          route.path === link.to
            ? 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        ]"
      >
        <Icon :name="link.icon" class="text-lg shrink-0" />
        <span v-if="!collapsed">{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div class="px-4 py-4 border-t border-slate-200 space-y-2 dark:border-slate-700">
      <NuxtLink
        v-if="canAccessAdmin"
        to="/admin"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
      >
        <Icon name="mdi:shield-crown" class="text-lg" />
        <span v-if="!collapsed">Zpět do administrace</span>
      </NuxtLink>
      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
      >
        <Icon name="mdi:open-in-new" class="text-lg" />
        <span v-if="!collapsed">Zpět na web</span>
      </NuxtLink>
      <button
        type="button"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
        @click="toggleTheme"
      >
        <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" class="text-lg" />
        <span v-if="!collapsed">{{ isDark ? 'Světlý režim' : 'Tmavý režim' }}</span>
      </button>
      <button
        type="button"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
        @click="toggleCollapse"
      >
        <Icon :name="collapsed ? 'mdi:chevron-double-right' : 'mdi:chevron-double-left'" class="text-lg" />
        <span v-if="!collapsed">Skrýt postranní panel</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore Nuxt provides #imports at runtime
import { useRoute } from '#imports'
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()

interface MemberLink {
  label: string
  icon: string
  to: string
  permission?: string
}

const props = defineProps<{
  links: MemberLink[]
  isDark: boolean
  onToggleTheme: () => void
  userRole: string
}>()

const collapsed = defineModel<boolean>('collapsed', { default: false })
const route = useRoute()

const filteredLinks = computed(() =>
  props.links.filter((link) => (link.permission ? link.permission === props.userRole : true))
)

const canAccessAdmin = computed(() => props.userRole === 'admin')

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const toggleTheme = () => {
  props.onToggleTheme()
}

const isDark = computed(() => props.isDark)
</script>

