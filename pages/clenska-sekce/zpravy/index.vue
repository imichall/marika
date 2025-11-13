<template>
  <div class="space-y-10">
    <section class="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 dark:bg-slate-900/80 dark:border-slate-700">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-wide text-red-500 font-semibold">Členská sekce</p>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mt-1">Zprávy pro členy</h1>
          <p class="text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
            Sdílejte důležité informace o zkouškách, výjezdech a koncertech. Všechny konverzace zůstávají jen mezi členy.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:from-red-700 hover:to-red-600 transition-all"
          @click="toggleComposer"
        >
          <Icon :name="showComposer ? 'mdi:close' : 'mdi:plus-circle'" class="text-lg" />
          {{ showComposer ? 'Zrušit' : 'Nové oznámení' }}
        </button>
      </div>

      <Transition name="fade">
        <form
          v-if="showComposer"
          class="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-700 dark:bg-slate-800/60"
          @submit.prevent="handleCreateTopic"
        >
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nadpis
            </label>
            <input
              v-model="composerForm.title"
              type="text"
              maxlength="200"
              required
              placeholder="Například: Harmonogram zkoušek na srpen"
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Text zprávy
            </label>
            <div class="relative">
              <textarea
                ref="composerTextarea"
                v-model="composerForm.content"
                rows="6"
                required
                placeholder="Napište všechny detaily, termíny a odkazy. Můžete přidat emoji pro rychlejší orientaci 🙂"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              ></textarea>

              <div class="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  ref="emojiButtonEl"
                  type="button"
                  class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                  @click.stop="toggleEmojiPicker"
                >
                  <Icon name="mdi:emoticon-happy-outline" class="text-xl" />
                </button>
              </div>

              <Transition name="scale-fade">
                <div
                  v-if="showEmojiPicker"
                  ref="emojiPickerEl"
                  class="absolute right-0 bottom-14 z-20"
                >
                  <emoji-picker class="light" @emoji-click="onEmojiSelect"></emoji-picker>
                </div>
              </Transition>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Zpráva bude okamžitě dostupná všem přihlášeným členům.
            </p>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                @click="cancelComposer"
              >
                Zrušit
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="submitting || !composerForm.title.trim() || !composerForm.content.trim()"
              >
                <Icon name="mdi:send" class="text-lg" />
                {{ submitting ? 'Odesílám...' : 'Publikovat' }}
              </button>
            </div>
          </div>
        </form>
      </Transition>
    </section>

    <section class="rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-700">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Poslední zprávy</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Připnuté zprávy se zobrazují nahoře, nejnovější aktivita je vždy první.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
          @click="refreshTopics"
        >
          <Icon name="mdi:refresh" class="text-lg" :class="{ 'animate-spin': loading }" />
          Obnovit
        </button>
      </header>

      <div v-if="loading" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
        <p class="mt-4 text-sm">Načítám konverzace...</p>
      </div>

      <div v-else>
        <ul v-if="visibleTopics.length" class="divide-y divide-slate-200 dark:divide-slate-800">
          <li
            v-for="entry in visibleTopics"
            :key="entry.id"
            class="group px-6 py-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            <NuxtLink
              :to="`/clenska-sekce/zpravy/${entry.slug || entry.id}`"
              class="block space-y-2"
            >
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-900 group-hover:text-red-600 transition-colors dark:text-white dark:group-hover:text-red-300">
                  {{ entry.title }}
                </h3>
                <span
                  v-if="entry.is_pinned"
                  class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-300"
                >
                  <Icon name="mdi:pin" class="text-sm" />
                  Připnuto
                </span>
                <span
                  v-if="entry.status === 'archived'"
                  class="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                >
                  <Icon name="mdi:archive" class="text-sm" />
                  Archiv
                </span>
              </div>

              <p class="text-sm text-slate-600 line-clamp-2 dark:text-slate-300">
                {{ entry.content }}
              </p>

              <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span class="inline-flex items-center gap-1">
                  <Icon name="mdi:account" class="text-sm" />
                  {{ entry.author_name }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <Icon name="mdi:clock-outline" class="text-sm" />
                  {{ formatDate(entry.last_activity_at || entry.created_at) }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <Icon name="mdi:message-reply-text" class="text-sm" />
                  {{ entry.reply_count }} odpovědí
                </span>
              </div>
            </NuxtLink>
          </li>
        </ul>

        <div v-else class="px-6 py-16 text-center">
          <Icon name="mdi:forum-outline" class="mx-auto text-5xl text-slate-300 dark:text-slate-700" />
          <h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Zatím žádné zprávy</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Jakmile někdo vytvoří první oznámení, zobrazí se tady.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'members'
})

import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, useSupabaseClient } from '#imports'
import { useForum } from '~/composables/useForum'
import { useToast } from '~/composables/useToast'
import 'emoji-picker-element'

const router = useRouter()
const supabase = useSupabaseClient()
const toast = useToast()

const {
  topics,
  loading,
  fetchTopics,
  createTopic
} = useForum('members')

const showComposer = ref(false)
const submitting = ref(false)
const composerForm = ref({
  title: '',
  content: ''
})

const showEmojiPicker = ref(false)
const composerTextarea = ref<HTMLTextAreaElement | null>(null)
const emojiPickerEl = ref<HTMLElement | null>(null)
const emojiButtonEl = ref<HTMLElement | null>(null)

const visibleTopics = computed(() =>
  topics.value
    .filter(topic => topic.status !== 'archived')
    .concat(topics.value.filter(topic => topic.status === 'archived'))
)

const formatDate = (value: string) => {
  const date = new Date(value)
  return date.toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshTopics = async () => {
  await fetchTopics({
    status: '!archived'
  })
}

const resetComposer = () => {
  composerForm.value = { title: '', content: '' }
  showEmojiPicker.value = false
}

const toggleComposer = () => {
  showComposer.value = !showComposer.value
  if (!showComposer.value) {
    resetComposer()
  } else {
    nextTick(() => {
      composerTextarea.value?.focus()
    })
  }
}

const cancelComposer = () => {
  showComposer.value = false
  resetComposer()
}

const onEmojiSelect = (event: CustomEvent) => {
  const emoji = event.detail.unicode as string
  const textarea = composerTextarea.value
  if (!textarea) {
    return
  }
  const start = textarea.selectionStart ?? composerForm.value.content.length
  const end = textarea.selectionEnd ?? composerForm.value.content.length
  const current = composerForm.value.content
  composerForm.value.content = `${current.slice(0, start)}${emoji}${current.slice(end)}`

  nextTick(() => {
    const cursor = start + emoji.length
    textarea.selectionStart = cursor
    textarea.selectionEnd = cursor
    textarea.focus()
  })

  showEmojiPicker.value = false
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (!showEmojiPicker.value) return
  const picker = emojiPickerEl.value
  const button = emojiButtonEl.value
  const target = event.target as Node
  if (picker && button && !picker.contains(target) && !button.contains(target)) {
    showEmojiPicker.value = false
  }
}

const handleCreateTopic = async () => {
  if (submitting.value) return
  if (!composerForm.value.title.trim() || !composerForm.value.content.trim()) return

  submitting.value = true
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user?.email) {
      toast.error('Pro vytvoření zprávy se musíte znovu přihlásit.')
      return router.push('/clenska-sekce/prihlaseni')
    }

    const authorName =
      userData.user.user_metadata?.full_name ||
      userData.user.user_metadata?.name ||
      userData.user.email.split('@')[0]

    const newTopic = await createTopic({
      title: composerForm.value.title.trim(),
      content: composerForm.value.content.trim(),
      category: 'general',
      author_email: userData.user.email,
      author_name: authorName
    })

    toast.success('Zpráva byla úspěšně zveřejněna.')
    resetComposer()
    showComposer.value = false
    await refreshTopics()

    if (newTopic?.slug || newTopic?.id) {
      await router.push(`/clenska-sekce/zpravy/${newTopic.slug || newTopic.id}`)
    }
  } catch (error) {
    console.error('Nepodařilo se vytvořit zprávu:', error)
    toast.error('Omlouváme se, zprávu se nepodařilo uložit.')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await refreshTopics()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.2s ease;
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

emoji-picker {
  --num-columns: 7;
  width: 320px;
  max-width: 80vw;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(30, 41, 59, 0.35);
}
</style>

