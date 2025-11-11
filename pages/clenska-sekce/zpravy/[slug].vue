<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/clenska-sekce/zpravy"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Icon name="mdi:arrow-left" class="text-lg" />
        Zpět na všechny zprávy
      </NuxtLink>
    </div>

    <div v-if="topicLoading" class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
      <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">Načítám zprávu...</p>
    </div>

    <template v-else-if="topic">
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
        <header class="space-y-4 border-b border-slate-200 px-8 py-6 dark:border-slate-700">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3">
            <span
              v-if="topic.is_pinned"
              class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-300"
            >
              <Icon name="mdi:pin" class="text-sm" />
              Připnuto
            </span>
            <span
              v-if="topic.status === 'archived'"
              class="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              <Icon name="mdi:archive-outline" class="text-sm" />
              Archivováno
            </span>
            <span
              v-if="topic.is_locked"
              class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            >
              <Icon name="mdi:lock" class="text-sm" />
              Uzamčeno
            </span>
            </div>
            <div v-if="canManage" class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                @click="startEditTopic"
              >
                <Icon name="mdi:pencil" class="text-sm" />
                Upravit
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/20"
                @click="handleDeleteTopic"
              >
                <Icon name="mdi:trash-can-outline" class="text-sm" />
                Smazat
              </button>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            {{ topic.title }}
          </h1>
          <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span class="inline-flex items-center gap-2">
              <Icon name="mdi:account" class="text-base" />
              {{ topic.author_name }}
            </span>
            <span class="inline-flex items-center gap-2">
              <Icon name="mdi:calendar" class="text-base" />
              {{ formatDate(topic.created_at) }}
            </span>
            <span class="inline-flex items-center gap-2">
              <Icon name="mdi:eye-outline" class="text-base" />
              {{ topic.view_count }} zhlédnutí
            </span>
            <span class="inline-flex items-center gap-2">
              <Icon name="mdi:message-reply-text" class="text-base" />
              {{ topic.reply_count }} odpovědí
            </span>
          </div>
        </header>
        <div class="px-8 py-6 space-y-6">
          <Transition name="scale-fade">
            <form
              v-if="showEditTopicForm"
              class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-700 dark:bg-slate-800/60"
              @submit.prevent="handleUpdateTopic"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Upravit oznámení</h3>
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  @click="cancelEditTopic"
                >
                  Zavřít
                </button>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Nadpis
                </label>
                <input
                  v-model="topicEditForm.title"
                  type="text"
                  maxlength="200"
                  required
                  class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Text zprávy
                </label>
                <textarea
                  v-model="topicEditForm.content"
                  rows="6"
                  required
                  class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                ></textarea>
              </div>
              <div class="flex items-center justify-end gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  @click="cancelEditTopic"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="updatingTopic"
                >
                  <Icon name="mdi:content-save-outline" class="text-lg" />
                  {{ updatingTopic ? 'Ukládám…' : 'Uložit změny' }}
                </button>
              </div>
            </form>
          </Transition>

          <article class="whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-200">
            {{ topic.content }}
          </article>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Diskuze</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Poslední aktivita {{ formatRelative(topic.last_activity_at || topic.updated_at) }}.
            </p>
          </div>
          <button
            v-if="canReply"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-600 transition-all"
            @click="focusReplyComposer"
          >
            <Icon name="mdi:reply-outline" class="text-lg" />
            Přidat odpověď
          </button>
        </header>

        <div class="space-y-6 px-6 py-6">
          <form
            v-if="canReply"
            class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/60"
            @submit.prevent="handleSubmitReply"
          >
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Vaše odpověď
              </p>
              <span class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                Všichni členové uvidí vaše jméno a čas odeslání
              </span>
            </div>
            <div class="relative">
              <textarea
                ref="replyTextarea"
                v-model="replyForm.content"
                rows="5"
                required
                placeholder="Přidejte informace, potvrďte účast nebo doplňte detaily."
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              ></textarea>
              <div class="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  ref="replyEmojiButton"
                  type="button"
                  class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                  @click.stop="toggleReplyEmoji"
                >
                  <Icon name="mdi:emoticon-happy-outline" class="text-lg" />
                </button>
              </div>

              <Transition name="scale-fade">
                <div
                  v-if="showReplyEmoji"
                  ref="replyEmojiPicker"
                  class="absolute right-0 bottom-14 z-20"
                >
                  <emoji-picker class="light" @emoji-click="onReplyEmojiSelect"></emoji-picker>
                </div>
              </Transition>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                @click="clearReply"
              >
                Vymazat
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="submittingReply || !replyForm.content.trim()"
              >
                <Icon name="mdi:send" class="text-lg" />
                {{ submittingReply ? 'Odesílám…' : 'Odeslat odpověď' }}
              </button>
            </div>
          </form>

          <div v-if="replies.length" class="space-y-5">
            <div
              v-for="reply in replies"
              :key="reply.id"
              class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-red-200/80 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-red-500/30"
            >
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-sm font-semibold text-white dark:from-red-500/80 dark:to-red-400/80">
                    {{ reply.author_name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">
                      {{ reply.author_name }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      {{ formatDate(reply.created_at) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-xs text-slate-500 dark:text-slate-400">
                    {{ reply.like_count || 0 }} × <Icon name="mdi:thumb-up-outline" class="inline text-sm align-middle" />
                  </div>
                  <div v-if="canManage" class="flex items-center gap-2">
                    <button
                      type="button"
                      class="flex items-center gap-2 rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      @click="startEditReply(reply)"
                    >
                      <Icon name="mdi:pencil" class="text-sm" />
                      Upravit
                    </button>
                    <button
                      type="button"
                      class="flex items-center gap-2 rounded-lg border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/20"
                      @click="handleDeleteReply(reply)"
                    >
                      <Icon name="mdi:trash-can-outline" class="text-sm" />
                      Smazat
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="replyBeingEdited?.id === reply.id" class="mt-4 space-y-3">
                <textarea
                  v-model="replyEditContent"
                  rows="4"
                  class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                ></textarea>
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    @click="cancelEditReply"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    :disabled="updatingReply"
                    @click="saveReplyEdit"
                  >
                    <Icon name="mdi:content-save-outline" class="text-sm" />
                    {{ updatingReply ? 'Ukládám…' : 'Uložit' }}
                  </button>
                </div>
              </div>
              <p v-else class="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {{ reply.content }}
              </p>
            </div>
            <div id="reply-end-anchor"></div>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
            Buďte první, kdo odpoví na tuto zprávu.
          </div>
        </div>
      </section>
    </template>

    <div v-else class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <Icon name="mdi:forum-remove" class="mx-auto text-6xl text-slate-300 dark:text-slate-600" />
      <h2 class="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">Zpráva nebyla nalezena</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Je možné, že byla smazaná nebo nemáte oprávnění ji zobrazit.
      </p>
      <NuxtLink
        to="/clenska-sekce/zpravy"
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-600 transition-all"
      >
        <Icon name="mdi:arrow-left" class="text-lg" />
        Zpět na přehled
      </NuxtLink>
    </div>
  </div>

  <Modal v-model="showDeleteTopicModal" title="Smazat zprávu">
    <div class="space-y-4">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Opravdu chcete smazat tuto zprávu? Tato akce je nevratná a odstraní také všechny odpovědi.
      </p>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          @click="showDeleteTopicModal = false"
        >
          Zrušit
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-600 transition-all"
          @click="confirmDeleteTopic"
        >
          <Icon name="mdi:trash-can-outline" class="text-base" />
          Smazat
        </button>
      </div>
    </div>
  </Modal>

  <Modal v-model="showDeleteReplyModal" title="Smazat odpověď">
    <div class="space-y-4">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Opravdu chcete smazat tuto odpověď? Tato akce je nevratná.
      </p>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          @click="() => { showDeleteReplyModal = false; replyToDelete = null }"
        >
          Zrušit
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-600 transition-all"
          @click="confirmDeleteReply"
        >
          <Icon name="mdi:trash-can-outline" class="text-base" />
          Smazat
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'members'
})

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
// @ts-ignore Nuxt runtime import
import { useRoute, useRouter, useSupabaseClient, useState } from '#imports'
import { useForum } from '~/composables/useForum'
import type { ForumReply } from '~/composables/useForum'
import { useToast } from '~/composables/useToast'
import 'emoji-picker-element'
import Modal from '~/components/Modal.vue'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const toast = useToast()

const {
  topic,
  replies,
  topicLoading,
  fetchTopic,
  createReply,
  updateTopic,
  deleteTopic: removeTopic,
  updateReply,
  deleteReply: removeReply
} = useForum('members')

const sidebarUser = useState<{ email: string | null; role: string }>('current-user-role')
const topicNotFound = ref(false)
const submittingReply = ref(false)
const replyForm = ref({
  content: ''
})

const replyTextarea = ref<HTMLTextAreaElement | null>(null)
const replyEmojiPicker = ref<HTMLElement | null>(null)
const replyEmojiButton = ref<HTMLElement | null>(null)
const showReplyEmoji = ref(false)

const showEditTopicForm = ref(false)
const topicEditForm = ref({
  title: '',
  content: ''
})
const updatingTopic = ref(false)

const replyBeingEdited = ref<ForumReply | null>(null)
const replyEditContent = ref('')
const updatingReply = ref(false)
const showDeleteTopicModal = ref(false)
const showDeleteReplyModal = ref(false)
const replyToDelete = ref<ForumReply | null>(null)

const canReply = computed(() => {
  if (!topic.value) return false
  return !topic.value.is_locked && topic.value.status !== 'archived'
})

const userRole = computed(() => sidebarUser.value.role)
const canManage = computed(() => ['admin', 'editor'].includes(userRole.value))

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

const formatRelative = (value: string) => {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.round(diff / (1000 * 60))
  if (minutes < 1) return 'před chvílí'
  if (minutes < 60) return `před ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `před ${hours} h`
  const days = Math.round(hours / 24)
  if (days < 7) return `před ${days} d`
  return date.toLocaleDateString('cs-CZ')
}

const clearReply = () => {
  replyForm.value.content = ''
  showReplyEmoji.value = false
}

const focusReplyComposer = () => {
  nextTick(() => replyTextarea.value?.focus())
}

const onReplyEmojiSelect = (event: CustomEvent) => {
  const emoji = event.detail.unicode as string
  const textarea = replyTextarea.value
  if (!textarea) return
  const start = textarea.selectionStart ?? replyForm.value.content.length
  const end = textarea.selectionEnd ?? replyForm.value.content.length
  const current = replyForm.value.content
  replyForm.value.content = `${current.slice(0, start)}${emoji}${current.slice(end)}`

  nextTick(() => {
    const cursor = start + emoji.length
    textarea.selectionStart = cursor
    textarea.selectionEnd = cursor
    textarea.focus()
  })

  showReplyEmoji.value = false
}

const toggleReplyEmoji = () => {
  showReplyEmoji.value = !showReplyEmoji.value
}

const handleEmojiOutside = (event: MouseEvent) => {
  if (!showReplyEmoji.value) return
  const picker = replyEmojiPicker.value
  const button = replyEmojiButton.value
  const target = event.target as Node
  if (picker && button && !picker.contains(target) && !button.contains(target)) {
    showReplyEmoji.value = false
  }
}

const handleSubmitReply = async () => {
  if (submittingReply.value || !topic.value) return
  if (!replyForm.value.content.trim()) return

  submittingReply.value = true
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user?.email) {
      toast.error('Pro přidání odpovědi se musíte znovu přihlásit.')
      return router.push('/clenska-sekce/prihlaseni')
    }

    const authorName =
      userData.user.user_metadata?.full_name ||
      userData.user.user_metadata?.name ||
      userData.user.email.split('@')[0]

    await createReply(topic.value.id, {
      content: replyForm.value.content.trim(),
      author_email: userData.user.email,
      author_name: authorName
    })

    toast.success('Odpověď byla přidána.')
    clearReply()
    nextTick(() => {
      const container = document.querySelector('#reply-end-anchor')
      container?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  } catch (error) {
    console.error('Nepodařilo se odeslat odpověď:', error)
    toast.error('Odpověď se nepodařilo uložit.')
  } finally {
    submittingReply.value = false
  }
}

const startEditTopic = () => {
  if (!topic.value) return
  topicEditForm.value = {
    title: topic.value.title,
    content: topic.value.content
  }
  showEditTopicForm.value = true
}

const cancelEditTopic = () => {
  showEditTopicForm.value = false
}

const handleUpdateTopic = async () => {
  if (!topic.value) return
  if (!topicEditForm.value.title.trim() || !topicEditForm.value.content.trim()) {
    toast.error('Vyplňte název i text zprávy.')
    return
  }

  updatingTopic.value = true
  try {
    await updateTopic(topic.value.id, {
      title: topicEditForm.value.title.trim(),
      content: topicEditForm.value.content.trim()
    })
    toast.success('Zpráva byla upravena.')
    showEditTopicForm.value = false
    await fetchTopic(topic.value.id)
  } catch (error) {
    console.error('Nepodařilo se upravit zprávu:', error)
    toast.error('Zprávu se nepodařilo uložit.')
  } finally {
    updatingTopic.value = false
  }
}

const handleDeleteTopic = async () => {
  if (!topic.value) return
  showDeleteTopicModal.value = true
}

const confirmDeleteTopic = async () => {
  if (!topic.value) return
  try {
    await removeTopic(topic.value.id)
    toast.success('Zpráva byla smazána.')
    await router.push('/clenska-sekce/zpravy')
  } catch (error) {
    console.error('Nepodařilo se smazat zprávu:', error)
    toast.error('Zprávu se nepodařilo smazat.')
  } finally {
    showDeleteTopicModal.value = false
  }
}

const startEditReply = (reply: ForumReply) => {
  replyBeingEdited.value = reply
  replyEditContent.value = reply.content
}

const cancelEditReply = () => {
  replyBeingEdited.value = null
  replyEditContent.value = ''
}

const saveReplyEdit = async () => {
  if (!replyBeingEdited.value) return
  if (!replyEditContent.value.trim()) {
    toast.error('Text odpovědi nemůže být prázdný.')
    return
  }

  updatingReply.value = true
  try {
    await updateReply(replyBeingEdited.value.id, {
      content: replyEditContent.value.trim()
    })
    toast.success('Odpověď byla upravena.')
    cancelEditReply()
  } catch (error) {
    console.error('Nepodařilo se upravit odpověď:', error)
    toast.error('Odpověď se nepodařilo uložit.')
  } finally {
    updatingReply.value = false
  }
}

const handleDeleteReply = async (reply: ForumReply) => {
  replyToDelete.value = reply
  showDeleteReplyModal.value = true
}

const confirmDeleteReply = async () => {
  if (!replyToDelete.value) return
  try {
    await removeReply(replyToDelete.value.id)
    toast.success('Odpověď byla smazána.')
  } catch (error) {
    console.error('Nepodařilo se smazat odpověď:', error)
    toast.error('Odpověď se nepodařilo smazat.')
  } finally {
    showDeleteReplyModal.value = false
    replyToDelete.value = null
  }
}

const loadTopic = async (slugOrId: string) => {
  topicNotFound.value = false
  showEditTopicForm.value = false
  replyBeingEdited.value = null
  try {
    await fetchTopic(slugOrId)
  } catch (error) {
    console.error('Nepodařilo se načíst zprávu:', error)
    topicNotFound.value = true
  }
}

onMounted(async () => {
  const slug = route.params.slug as string
  if (slug) {
    await loadTopic(slug)
  }
  document.addEventListener('click', handleEmojiOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleEmojiOutside)
})

watch(
  () => route.params.slug,
  async newSlug => {
    if (typeof newSlug === 'string' && newSlug) {
      await loadTopic(newSlug)
    }
  }
)
</script>

<style scoped>
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

