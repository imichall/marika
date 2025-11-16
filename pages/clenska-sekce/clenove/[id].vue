<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <img
              v-if="member?.avatar_url"
              :src="member?.avatar_url"
              :alt="member?.full_name || 'Člen'"
              class="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-gray-800"
            />
            <div
              v-else
              class="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center ring-4 ring-white dark:ring-gray-800"
            >
              <Icon name="mdi:account" class="text-red-600 dark:text-red-400 text-3xl" />
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ member?.full_name || 'Neznámý člen' }}
            </h1>
            <p class="text-slate-600 dark:text-slate-300">
              {{ departmentName || '—' }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/clenska-sekce/clenove"
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <Icon name="mdi:arrow-left" />
          Zpět na seznam
        </NuxtLink>
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800">
          <h2 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Kontakty</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-slate-500">E‑mail</div>
              <div class="text-slate-900 dark:text-white">
                <a v-if="member?.email" :href="`mailto:${member.email}`" class="text-red-600 hover:underline dark:text-red-300">{{ member?.email }}</a>
                <span v-else>—</span>
              </div>
            </div>
            <div>
              <div class="text-slate-500">Telefon</div>
              <div class="text-slate-900 dark:text-white">
                <a v-if="member?.phone" :href="`tel:${member.phone}`" class="text-red-600 hover:underline dark:text-red-300">{{ member?.phone }}</a>
                <span v-else>—</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800">
          <h2 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Adresa</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-slate-500">Celá adresa</div>
              <div class="text-slate-900 dark:text-white">{{ member?.full_address || '—' }}</div>
            </div>
            <div>
              <div class="text-slate-500">Ulice</div>
              <div class="text-slate-900 dark:text-white">{{ member?.street || '—' }}</div>
            </div>
            <div>
              <div class="text-slate-500">Město</div>
              <div class="text-slate-900 dark:text-white">{{ member?.city || '—' }}</div>
            </div>
            <div>
              <div class="text-slate-500">PSČ</div>
              <div class="text-slate-900 dark:text-white">{{ member?.postal_code || '—' }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800">
          <h2 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Osobní údaje</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-slate-500">Datum narození</div>
              <div class="text-slate-900 dark:text-white">{{ member?.birth_date || '—' }}</div>
            </div>
            <div>
              <div class="text-slate-500">Místo narození</div>
              <div class="text-slate-900 dark:text-white">{{ member?.birth_place || '—' }}</div>
            </div>
            <div class="md:col-span-2">
              <div class="text-slate-500">Poznámka</div>
              <div class="text-slate-900 dark:text-white whitespace-pre-wrap">{{ member?.notes || '—' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800">
          <h2 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Status</h2>
          <div class="flex items-center gap-2">
            <span
              class="inline-flex h-2.5 w-2.5 rounded-full"
              :class="member?.is_active ? 'bg-emerald-500' : 'bg-slate-300'"
            />
            <span class="text-sm text-slate-700 dark:text-slate-300">
              {{ member?.is_active ? 'Aktivní člen' : 'Neaktivní' }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useToast } from '~/composables/useToast'
import { useMemberManagement, type MemberUser } from '~/composables/useMemberManagement'
import { useMemberDepartments } from '~/composables/useMemberDepartments'

definePageMeta({
  layout: 'members'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const memberId = computed(() => String(route.params.id))
const member = ref<MemberUser | null>(null)
const departmentName = ref<string>('')

const { members, fetchMembers } = useMemberManagement()
const { departments, fetchDepartments } = useMemberDepartments()

const loadData = async () => {
  try {
    if (!members.value.length) {
      await fetchMembers()
    }
    if (!departments.value.length) {
      await fetchDepartments()
    }
    const found = members.value.find(m => m.id === memberId.value) || null
    member.value = found
    if (found) {
      const dept = departments.value.find(d => d.id === found.department_id)
      departmentName.value = dept?.display_name || ''
    } else {
      toast.error('Člen nenalezen')
      router.replace('/clenska-sekce/clenove')
    }
  } catch (e:any) {
    console.error('Chyba při načítání detailu člena:', e)
    toast.error('Nepodařilo se načíst detail člena')
  }
}

onMounted(loadData)
watch(() => route.params.id, () => loadData())
</script>


