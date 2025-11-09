<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="rounded-full bg-red-50 text-red-600 p-3">
              <Icon name="mdi:account-group" class="text-2xl" />
            </div>
            <h2 class="text-2xl font-semibold text-slate-900">Seznam členů</h2>
          </div>
          <p class="text-sm text-slate-600">
            Archiv všech, kteří kdy prošli sborem. Evidujte hlasové obsazení, kontakty i poznámky.
          </p>
        </div>
        <button
          v-if="permissions.create"
          class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          @click="openCreateModal"
        >
          <Icon name="mdi:account-plus" class="text-lg" />
          Přidat člena
        </button>
      </div>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            v-model="searchQuery"
            type="search"
            class="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="Hledat podle jména, kontaktu nebo poznámky..."
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-slate-600">Hlas</label>
          <select
            v-model="voiceFilter"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="vse">Vše</option>
            <option
              v-for="voice in voiceOptions"
              :key="voice"
              :value="voice"
            >
              {{ voice }}
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
          <label for="active-only">Pouze aktuální členové</label>
        </div>
      </div>
    </section>

    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Jméno</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Hlas</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Kontakty</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Období</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Poznámka</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Akce</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading">
              <td colspan="6" class="px-4 py-10 text-center text-slate-500">
                <Icon name="mdi:loading" class="animate-spin text-2xl inline-block mr-2" />
                Načítám členy...
              </td>
            </tr>
            <tr v-else-if="!filteredMembers.length">
              <td colspan="6" class="px-4 py-10 text-center text-slate-500">
                Žádné záznamy neodpovídají filtru.
              </td>
            </tr>
            <tr
              v-for="member in filteredMembers"
              :key="member.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex h-2 w-2 rounded-full"
                    :class="member.is_active ? 'bg-emerald-500' : 'bg-slate-300'"
                  />
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ member.full_name }}</p>
                    <p class="text-xs text-slate-500">
                      {{ member.is_active ? 'Aktivní člen' : 'Bývalý člen' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-700">
                {{ member.voice_part || '—' }}
              </td>
              <td class="px-4 py-3 text-sm text-slate-700">
                <div class="space-y-1">
                  <p v-if="member.email">
                    <Icon name="mdi:email-outline" class="inline mr-1 text-red-500" />
                    <a :href="`mailto:${member.email}`" class="hover:underline">{{ member.email }}</a>
                  </p>
                  <p v-if="member.phone">
                    <Icon name="mdi:phone" class="inline mr-1 text-red-500" />
                    <a :href="`tel:${member.phone}`" class="hover:underline">{{ member.phone }}</a>
                  </p>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-700">
                <p>
                  {{ member.joined_at ? formatDate(member.joined_at) : '—' }}
                  –
                  {{ member.left_at ? formatDate(member.left_at) : (member.is_active ? 'dosud' : '—') }}
                </p>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 max-w-xs">
                <p class="line-clamp-3">{{ member.notes || '—' }}</p>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex items-center gap-2">
                  <button
                    class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    @click="openEditModal(member)"
                    :disabled="!permissions.edit"
                  >
                    <Icon name="mdi:pencil" class="text-sm" />
                    Upravit
                  </button>
                  <button
                    class="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    @click="confirmDelete(member)"
                    :disabled="!permissions.delete"
                  >
                    <Icon name="mdi:trash-can" class="text-sm" />
                    Smazat
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Modal v-model="showModal" :title="modalTitle">
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Celé jméno *</label>
            <input
              v-model="form.full_name"
              required
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Hlas / nástroj</label>
            <input
              v-model="form.voice_part"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="např. Soprán, Alt, Tenor, Bicí..."
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Telefon</label>
            <input
              v-model="form.phone"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="+420 123 456 789"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Datum nástupu</label>
            <input
              v-model="form.joined_at"
              type="date"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Datum odchodu</label>
            <input
              v-model="form.left_at"
              type="date"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700">Poznámka</label>
          <textarea
            v-model="form.notes"
            rows="4"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </div>

        <div class="flex items-center justify-between pt-2">
          <label class="flex items-center gap-2 text-sm text-slate-600">
            <input
              v-model="form.is_active"
              type="checkbox"
              class="rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            Aktivní člen
          </label>

          <div class="flex gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              @click="closeModal"
            >
              Zrušit
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              :disabled="loading"
            >
              <Icon :name="editingMember ? 'mdi:content-save-edit' : 'mdi:content-save'" class="text-lg" />
              {{ editingMember ? 'Uložit změny' : 'Přidat člena' }}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
// @ts-ignore Nuxt runtime import
import { useRouter } from '#imports'
import Modal from '~/components/Modal.vue'
import { useToast } from '~/composables/useToast'
import { useMemberDirectory, type MemberDirectoryEntry } from '~/composables/useMemberDirectory'

definePageMeta({
  layout: 'members'
})

const toast = useToast()
const router = useRouter()

const {
  members,
  sortedMembers,
  permissions,
  loading,
  fetchPermissions,
  fetchMembers,
  createMember,
  updateMember,
  deleteMember
} = useMemberDirectory()

const searchQuery = ref('')
const voiceFilter = ref<'vse' | string>('vse')
const activeOnly = ref(false)

const showModal = ref(false)
const editingMember = ref<MemberDirectoryEntry | null>(null)

const form = reactive({
  full_name: '',
  voice_part: '',
  email: '',
  phone: '',
  joined_at: '',
  left_at: '',
  notes: '',
  is_active: true
})

const voiceOptions = computed(() => {
  const voices = new Set<string>()
  members.value.forEach((member) => {
    if (member.voice_part) voices.add(member.voice_part)
  })
  return Array.from(voices).sort((a, b) => a.localeCompare(b, 'cs'))
})

const normalize = (value: string) =>
  value
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    : ''

const filteredMembers = computed(() => {
  const query = normalize(searchQuery.value)

  return sortedMembers.value.filter((member) => {
    if (activeOnly.value && !member.is_active) return false

    if (voiceFilter.value !== 'vse') {
      if (!member.voice_part) return false
      if (member.voice_part.toLowerCase() !== voiceFilter.value.toLowerCase()) return false
    }

    if (!query) return true

    const haystack = `${member.full_name} ${member.email ?? ''} ${member.phone ?? ''} ${member.voice_part ?? ''} ${member.notes ?? ''}`
    return normalize(haystack).includes(query)
  })
})

const formatDate = (value: string | null) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('cs-CZ')
}

const resetForm = () => {
  form.full_name = ''
  form.voice_part = ''
  form.email = ''
  form.phone = ''
  form.joined_at = ''
  form.left_at = ''
  form.notes = ''
  form.is_active = true
}

const openCreateModal = () => {
  if (!permissions.value.create) {
    toast.error('Nemáte oprávnění přidávat členy')
    return
  }
  resetForm()
  editingMember.value = null
  showModal.value = true
}

const openEditModal = (member: MemberDirectoryEntry) => {
  if (!permissions.value.edit) {
    toast.error('Nemáte oprávnění upravovat členy')
    return
  }
  editingMember.value = member
  form.full_name = member.full_name
  form.voice_part = member.voice_part ?? ''
  form.email = member.email ?? ''
  form.phone = member.phone ?? ''
  form.joined_at = member.joined_at ?? ''
  form.left_at = member.left_at ?? ''
  form.notes = member.notes ?? ''
  form.is_active = member.is_active
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingMember.value = null
  resetForm()
}

const submitForm = async () => {
  try {
    if (editingMember.value) {
      await updateMember(editingMember.value.id, {
        full_name: form.full_name,
        voice_part: form.voice_part || null,
        email: form.email || null,
        phone: form.phone || null,
        notes: form.notes || null,
        is_active: form.is_active,
        joined_at: form.joined_at || null,
        left_at: form.left_at || null
      })
      toast.success('Záznam člena byl upraven')
    } else {
      await createMember({
        full_name: form.full_name,
        voice_part: form.voice_part || null,
        email: form.email || null,
        phone: form.phone || null,
        notes: form.notes || null,
        is_active: form.is_active,
        joined_at: form.joined_at || null,
        left_at: form.left_at || null
      })
      toast.success('Člen byl přidán')
    }
    closeModal()
  } catch (err: any) {
    toast.error(err.message ?? 'Uložení se nezdařilo')
  }
}

const confirmDelete = async (member: MemberDirectoryEntry) => {
  if (!permissions.value.delete) {
    toast.error('Nemáte oprávnění mazat členy')
    return
  }
  if (!confirm(`Opravdu chcete odstranit záznam člena „${member.full_name}“? Tato akce je nevratná.`)) return
  try {
    await deleteMember(member.id)
    toast.success('Člen byl odstraněn')
  } catch (err: any) {
    toast.error(err.message ?? 'Mazání se nezdařilo')
  }
}

const modalTitle = computed(() => (editingMember.value ? 'Upravit údaje člena' : 'Přidat nového člena'))

onMounted(async () => {
  const perms = await fetchPermissions()
  if (!perms.view) {
    toast.error('Nemáte oprávnění zobrazit seznam členů')
    router.push('/clenska-sekce/neni-opravneni')
    return
  }
  await fetchMembers()
})
</script>

