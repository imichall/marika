<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-6 dark:bg-slate-900/80 dark:border-slate-800">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="rounded-full bg-red-50 text-red-600 p-3">
              <Icon name="mdi:account-group" class="text-2xl" />
            </div>
            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Seznam členů</h2>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Seznam všech členů sboru rozdělených do oddílů.
          </p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            v-model="searchQuery"
            type="search"
            class="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="Hledat podle jména, e-mailu nebo telefonu..."
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-slate-600">Oddíl</label>
          <select
            v-model="departmentFilter"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="vse">Všechny oddíly</option>
            <option
              v-for="dept in departments"
              :key="dept.id"
              :value="dept.id"
            >
              {{ dept.display_name }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <input
            id="active-only"
            v-model="activeOnly"
            type="checkbox"
            class="rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <label for="active-only">Pouze aktivní členové</label>
        </div>
      </div>
    </section>

    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
      <div class="overflow-hidden rounded-2xl">

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Člen</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Oddíl</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Kontakty</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Poznámka</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
            <tr v-if="loading">
              <td colspan="4" class="px-4 py-10 text-center text-slate-500">
                <Icon name="mdi:loading" class="animate-spin text-2xl inline-block mr-2" />
                Načítám členy...
              </td>
            </tr>
            <tr v-else-if="!filteredMembers.length">
              <td colspan="4" class="px-4 py-10 text-center text-slate-500">
                Žádní členové neodpovídají filtru.
              </td>
            </tr>
            <tr
              v-for="member in filteredMembers"
              :key="member.id"
              class="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/60"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="member.avatar_url"
                    :src="member.avatar_url"
                    :alt="member.full_name"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
                  >
                    <Icon name="mdi:account" class="text-red-600 dark:text-red-400 text-xl" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ member.full_name }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      <span
                        class="inline-flex h-1.5 w-1.5 rounded-full mr-1"
                        :class="member.is_active ? 'bg-emerald-500' : 'bg-slate-300'"
                      />
                      {{ member.is_active ? 'Aktivní' : 'Neaktivní' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300">
                  {{ getDepartmentName(member.department_id) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                <div class="space-y-1">
                  <p v-if="member.email">
                    <Icon name="mdi:email-outline" class="inline mr-1 text-red-500" />
                    <a :href="`mailto:${member.email}`" class="hover:underline text-red-600 dark:text-red-300">{{ member.email }}</a>
                  </p>
                  <p v-if="member.phone">
                    <Icon name="mdi:phone" class="inline mr-1 text-red-500" />
                    <a :href="`tel:${member.phone}`" class="hover:underline text-red-600 dark:text-red-300">{{ member.phone }}</a>
                  </p>
                  <p v-if="!member.email && !member.phone" class="text-slate-400">—</p>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 max-w-xs">
                <p class="line-clamp-2 text-slate-600 dark:text-slate-300">{{ member.notes || '—' }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
// @ts-ignore Nuxt runtime import
import { useRouter } from '#imports'
import { useToast } from '~/composables/useToast'
import { useMemberManagement } from '~/composables/useMemberManagement'
import { useMemberDepartments } from '~/composables/useMemberDepartments'

definePageMeta({
  layout: 'members'
})

const toast = useToast()
const router = useRouter()

const {
  members,
  loading,
  fetchMembers
} = useMemberManagement()

const {
  departments,
  fetchDepartments
} = useMemberDepartments()

const searchQuery = ref('')
const departmentFilter = ref<'vse' | string>('vse')
const activeOnly = ref(false)

const normalize = (value: string) =>
  value
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    : ''

const filteredMembers = computed(() => {
  const query = normalize(searchQuery.value)

  return members.value.filter((member) => {
    if (activeOnly.value && !member.is_active) return false

    if (departmentFilter.value !== 'vse') {
      if (member.department_id !== departmentFilter.value) return false
    }

    if (!query) return true

    const haystack = `${member.full_name} ${member.email ?? ''} ${member.phone ?? ''} ${member.notes ?? ''}`
    return normalize(haystack).includes(query)
  })
})

const getDepartmentName = (departmentId: string) => {
  const dept = departments.value.find(d => d.id === departmentId)
  return dept?.display_name || '—'
}

onMounted(async () => {
  try {
    await Promise.all([
      fetchDepartments(),
      fetchMembers()
    ])
  } catch (err: any) {
    console.error('Chyba při načítání dat:', err)
    toast.error('Nepodařilo se načíst data členské sekce')
  }
})
</script>

