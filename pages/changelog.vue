<template>
  <div class="bg-white text-gray-800 mt-20 min-h-screen">
    <section class="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-white py-20">
      <div class="absolute inset-0 opacity-50">
        <div
          class="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.08),_transparent_55%)]"
        ></div>
      </div>

      <div class="relative mx-auto max-w-5xl px-6">
        <nav class="mb-8 flex items-center gap-2 text-sm text-rose-600">
          <NuxtLink to="/" class="hover:underline">Domů</NuxtLink>
          <span aria-hidden="true">/</span>
          <span class="font-medium text-rose-700">Changelog</span>
        </nav>

        <div class="rounded-3xl border border-rose-100 bg-white/80 p-10 shadow-xl backdrop-blur">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-icons-outlined text-4xl text-rose-600">history</span>
            <h1 class="text-3xl font-bold text-gray-900 md:text-4xl">
              Historie verzí aplikace
            </h1>
          </div>
          <p class="text-lg leading-relaxed text-gray-600 md:text-xl">
            Přehled všech verzí aplikace Marika a jejich změn. Verze jsou seřazeny od nejnovější po nejstarší.
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-5xl space-y-6 px-6 pb-24 pt-12">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-200">
        <p class="font-medium">{{ error }}</p>
      </div>

      <!-- Changelog entries -->
      <div v-else class="space-y-6">
        <!-- Only main branch versions -->
        <article
          v-for="entry in groupedEntries"
          :key="`${entry.version}-${entry.branch}`"
          class="rounded-3xl border border-gray-100 bg-white p-8 md:p-10 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <h2 class="text-2xl font-bold text-gray-900">{{ entry.version }}</h2>
                <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  {{ entry.branch }}
                </span>
              </div>
              <div class="text-sm text-gray-600 mb-6 flex items-center gap-2">
                <span class="material-icons-outlined text-base">schedule</span>
                <span>{{ formatDate(entry.date) }}</span>
                <span class="mx-2">•</span>
                <span class="material-icons-outlined text-base">person</span>
                <span>{{ entry.author }}</span>
              </div>
              <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span class="material-icons-outlined text-base">new_releases</span>
                  Co je nového
                </h3>
                <ul class="space-y-2">
                  <li v-for="(change, index) in entry.changes" :key="index" class="flex items-start gap-3 text-gray-700">
                    <span class="material-icons-outlined text-rose-600 text-sm mt-0.5">check_circle</span>
                    <span>{{ change }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>

        <div v-if="groupedEntries.length === 0" class="text-center py-12 text-gray-500">
          <span class="material-icons-outlined text-6xl mb-4 opacity-50">history</span>
          <p class="text-lg">Zatím nejsou k dispozici žádné verze</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChangelog } from '~/composables/useChangelog'

definePageMeta({
  layout: 'default'
})

const { loading, error, getChangelog } = useChangelog()
const mainEntries = ref<any[]>([])

interface GroupedEntry {
  version: string
  branch: string
  date: string
  author: string
  changes: string[]
}

const groupedEntries = computed<GroupedEntry[]>(() => {
  // Only show main branch entries
  const allEntries = [...mainEntries.value]

  // Parse and group entries
  const parsedEntries: GroupedEntry[] = allEntries.map(entry => {
    // Parse changes from JSON string if needed
    let changes: string[] = []
    if (typeof entry.changes === 'string') {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(entry.changes)
        changes = Array.isArray(parsed) ? parsed : [parsed]
      } catch (e) {
        // If not JSON, treat as single string
        changes = [entry.changes]
      }
    } else if (Array.isArray(entry.changes)) {
      changes = entry.changes
    }

    return {
      version: entry.version,
      branch: entry.branch,
      date: entry.date,
      author: entry.author,
      changes: changes
    }
  })

  // Sort by date descending
  return parsedEntries.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  // Only load main branch
  const mainData = await getChangelog('main')
  mainEntries.value = mainData || []
})
</script>
