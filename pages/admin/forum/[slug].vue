<template>
  <div class="min-h-screen bg-gray-50/50">
    <div class="container mx-auto px-4 py-8 pb-20 max-w-5xl">
      <!-- Breadcrumbs -->
      <AdminBreadcrumbs />

      <!-- Loading -->
      <div v-if="topicLoading" class="flex items-center justify-center py-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"
        ></div>
      </div>

      <!-- Téma -->
      <div v-else-if="topic" class="space-y-6">
        <!-- Hlavička tématu -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div class="p-6 lg:p-8">
            <!-- Status badges -->
            <div class="flex flex-wrap items-center gap-2 mb-4">
              <span
                v-if="topic.is_pinned"
                class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 rounded-full border border-indigo-200"
              >
                <span class="material-icons-outlined text-[16px]">push_pin</span>
                Připnuto
              </span>
              <span
                v-if="topic.is_locked"
                class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-red-100 to-red-50 text-red-700 rounded-full border border-red-200"
              >
                <span class="material-icons-outlined text-[16px]">lock</span>
                Zamčeno
              </span>
              <span
                v-if="topic.status === 'archived'"
                class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-full border border-gray-200"
              >
                <span class="material-icons-outlined text-[16px]">archive</span>
                Archivováno
              </span>
            </div>

            <!-- Název tématu -->
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {{ topic.title }}
            </h1>

            <!-- Metadata -->
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-[18px] text-gray-400">person</span>
                <span class="font-medium text-gray-700">{{ topic.author_name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-[18px] text-gray-400">schedule</span>
                <span>{{ formatDate(topic.created_at) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-[18px] text-gray-400">visibility</span>
                <span>{{ topic.view_count }} zhlédnutí</span>
              </div>
              <button
                v-if="editHistory.length > 0"
                @click="showHistorySidebar = true"
                class="ml-auto flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                title="Historie úprav"
              >
                <span class="material-icons-outlined text-[18px]">history</span>
                <span class="font-medium">Historie</span>
              </button>
            </div>

            <!-- Kategorie a tagy -->
            <div class="flex flex-wrap items-center gap-2 mb-6">
              <span
                class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full"
                :class="{
                  'bg-blue-100 text-blue-700 border border-blue-200': topic.category === 'general',
                  'bg-yellow-100 text-yellow-700 border border-yellow-200': topic.category === 'announcement',
                  'bg-green-100 text-green-700 border border-green-200': topic.category === 'help',
                }"
              >
                {{ getCategoryName(topic.category) }}
              </span>
              <span
                class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full"
                :class="{
                  'bg-gray-100 text-gray-700 border border-gray-200': topic.tag === 'general',
                  'bg-red-100 text-red-700 border border-red-200': topic.tag === 'bug',
                  'bg-orange-100 text-orange-700 border border-orange-200': topic.tag === 'issue',
                  'bg-indigo-100 text-indigo-700 border border-indigo-200': topic.tag === 'uprava',
                }"
              >
                {{ getTagName(topic.tag || 'general') }}
              </span>
            </div>

            <!-- Obsah -->
            <div class="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              {{ topic.content }}
            </div>

            <!-- Hodnocení -->
            <div class="flex items-center gap-4 py-4 border-t border-gray-100 mb-4 justify-end">
              <button
                @click="toggleLikeTopic"
                :disabled="loading"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
                :class="topicUserLikes.includes(topic.id)
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                <span class="material-icons-outlined text-[20px]">thumb_up</span>
                <span class="font-semibold">{{ topicLikeCount }}</span>
              </button>
              <button
                @click="toggleDislikeTopic"
                :disabled="loading"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
                :class="topicUserDislikes.includes(topic.id)
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                <span class="material-icons-outlined text-[20px]">thumb_down</span>
                <span class="font-semibold">{{ topicDislikeCount }}</span>
              </button>
            </div>

            <!-- Akční tlačítka -->
            <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
              <button
                v-if="permissions.edit"
                @click="editTopic"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <span class="material-icons-outlined text-[20px]">edit</span>
                Upravit
              </button>
              <button
                v-if="permissions.edit"
                @click="togglePinTopic"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <span class="material-icons-outlined text-[20px]">push_pin</span>
                {{ topic.is_pinned ? "Odepnout" : "Připnout" }}
              </button>
              <button
                v-if="isAdmin"
                @click="toggleLockTopic"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <span class="material-icons-outlined text-[20px]">
                  {{ topic.is_locked ? "lock_open" : "lock" }}
                </span>
                {{ topic.is_locked ? "Odemknout" : "Zamknout" }}
              </button>
              <button
                v-if="isAdmin"
                @click="deleteTopic"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <span class="material-icons-outlined text-[20px]">delete</span>
                Smazat
              </button>
            </div>
          </div>
        </div>

        <!-- Odpovědi -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div class="p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">
                Odpovědi
                <span class="text-lg font-normal text-gray-500">({{ replies.length }})</span>
              </h2>
              <button
                v-if="!topic.is_locked && topic.status !== 'archived' && permissions.create"
                @click="showReplyForm = !showReplyForm"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <span class="material-icons-outlined text-[20px]">reply</span>
                {{ showReplyForm ? "Zrušit" : "Přidat odpověď" }}
              </button>
            </div>

            <!-- Formulář pro top-level odpověď -->
            <Transition name="fade">
              <div v-if="showReplyForm && !replyingToReply && !topic.is_locked && topic.status !== 'archived'" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <textarea
                  v-model="replyForm.content"
                  rows="5"
                  class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                  placeholder="Napište odpověď..."
                ></textarea>
                <div class="flex justify-end gap-3 mt-3">
                  <button
                    @click="showReplyForm = false; replyingToReply = null"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="submitReply"
                    :disabled="!replyForm.content.trim()"
                    class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    Odeslat
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Seznam odpovědí -->
            <div v-if="flattenedReplies.length > 0" class="space-y-4">
              <div
                v-for="reply in flattenedReplies"
                :key="reply.id"
                class="rounded-lg p-5 transition-all duration-200"
                :class="{
                  'bg-gradient-to-br from-green-50 to-green-50/50 border-2 border-green-200 shadow-sm': reply.is_best_answer,
                  'bg-gray-50 border border-gray-200 hover:border-gray-300': !reply.is_best_answer,
                }"
                :style="getReplyDepth(reply, replies) > 0 ? { marginLeft: `${getReplyDepth(reply, replies) * 2}rem`, borderLeft: '4px solid rgb(96, 165, 250)' } : {}"
              >
                <!-- Indikace, že jde o odpověď na odpověď -->
                <div v-if="getReplyDepth(reply, replies) > 0" class="flex items-center gap-2 mb-3 text-xs text-blue-600">
                  <span class="material-icons-outlined text-sm">subdirectory_arrow_right</span>
                  <span class="font-medium">Odpověď na odpověď (úroveň {{ getReplyDepth(reply, replies) }})</span>
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                  <div class="flex items-center gap-3 flex-wrap">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                        {{ reply.author_name.charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-semibold text-gray-900">
                        {{ reply.author_name }}
                      </span>
                    </div>
                    <span
                      v-if="reply.is_best_answer"
                      class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-200"
                    >
                      <span class="material-icons-outlined text-[14px]">star</span>
                      Nejlepší odpověď
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500">
                      {{ formatDate(reply.created_at) }}
                    </span>
                    <div class="flex gap-1">
                      <button
                        v-if="permissions.edit"
                        @click="editReply(reply)"
                        class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Upravit"
                      >
                        <span class="material-icons-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        v-if="permissions.edit && !reply.is_best_answer"
                        @click="setBestAnswer(reply.id)"
                        class="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Označit jako nejlepší odpověď"
                      >
                        <span class="material-icons-outlined text-[18px]">star</span>
                      </button>
                      <button
                        v-if="isAdmin"
                        @click="deleteReply(reply)"
                        class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Smazat"
                      >
                        <span class="material-icons-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                <template v-if="editingReply?.id === reply.id">
                  <div class="mt-4">
                    <textarea
                      v-model="editingReply.content"
                      rows="5"
                      class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                    ></textarea>
                    <div class="flex justify-end gap-3 mt-3">
                      <button
                        @click="cancelEditReply"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                      >
                        Zrušit
                      </button>
                      <button
                        @click="saveEditReply"
                        class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                      >
                        Uložit
                      </button>
                    </div>
                  </div>
                </template>
                <div v-else class="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {{ reply.content }}
                </div>
                <div class="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 justify-between">
                  <button
                    v-if="!topic.is_locked && topic.status !== 'archived' && permissions.create"
                    @click="replyToReply(reply)"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <span class="material-icons-outlined text-[16px]">reply</span>
                    <span class="font-medium">Odpovědět</span>
                  </button>
                  <button
                    @click="toggleLikeReply(reply.id)"
                    :disabled="loading"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 text-sm font-medium"
                    :class="replyUserLikes.includes(reply.id)
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    <span class="material-icons-outlined text-[16px]">thumb_up</span>
                    <span class="font-semibold">{{ reply.like_count || 0 }}</span>
                  </button>
                </div>

                <!-- Formulář pro odpověď na tuto reply -->
                <Transition name="fade">
                  <div v-if="replyingToReply?.id === reply.id && !topic.is_locked && topic.status !== 'archived'" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div v-if="replyingToReply" class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="material-icons-outlined text-blue-600 text-sm">subdirectory_arrow_right</span>
                          <span class="text-sm font-medium text-blue-700">Odpověď na: {{ replyingToReply.author_name }}</span>
                        </div>
                        <button
                          @click="replyingToReply = null; showReplyForm = false"
                          class="text-blue-600 hover:text-blue-800"
                        >
                          <span class="material-icons-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      v-model="replyForm.content"
                      rows="5"
                      class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                      placeholder="Napište odpověď..."
                    ></textarea>
                    <div class="flex justify-end gap-3 mt-3">
                      <button
                        @click="showReplyForm = false; replyingToReply = null"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                      >
                        Zrušit
                      </button>
                      <button
                        @click="submitReply"
                        :disabled="!replyForm.content.trim()"
                        class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                      >
                        Odeslat
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <span class="material-icons-outlined text-5xl text-gray-300 mb-3 block">forum</span>
              <p class="text-gray-500 text-lg">Zatím nejsou žádné odpovědi</p>
            </div>
          </div>
        </div>

        <!-- Historie zhlédnutí -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div class="p-6 lg:p-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Historie zhlédnutí
            </h2>

            <div v-if="views.length > 0" class="space-y-3">
              <div
                v-for="view in views"
                :key="view.id"
                class="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                    <span class="material-icons-outlined text-white text-[16px]">visibility</span>
                  </div>
                  <span class="font-medium text-gray-900">{{ view.viewed_by_name }}</span>
                </div>
                <span class="text-sm text-gray-600 font-medium">
                  {{ formatDate(view.viewed_at) }}
                </span>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <span class="material-icons-outlined text-5xl text-gray-300 mb-3 block">visibility_off</span>
              <p class="text-gray-500 text-lg">Zatím žádné zhlédnutí</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else class="text-center py-16">
        <div class="bg-white rounded-xl border border-red-200 p-8 max-w-md mx-auto">
          <span class="material-icons-outlined text-6xl text-red-500 mb-4 block">error_outline</span>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Téma nebylo nalezeno</h2>
          <p class="text-gray-500">Požadované téma neexistuje nebo bylo smazáno.</p>
        </div>
      </div>

    <!-- Sidebar pro historii úprav -->
    <Teleport to="body">
      <Transition name="sidebar-overlay">
        <div
          v-if="showHistorySidebar"
          class="fixed inset-0 z-50 overflow-hidden"
          @click.self="showHistorySidebar = false"
        >
          <!-- Overlay -->
          <div class="fixed inset-0 bg-black bg-opacity-50"></div>

          <!-- Sidebar -->
          <Transition name="sidebar">
            <div
              v-if="showHistorySidebar"
              class="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto z-50"
            >
              <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 class="text-2xl font-bold text-gray-900">Historie úprav</h2>
                <button
                  @click="showHistorySidebar = false"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span class="material-icons-outlined text-[24px]">close</span>
                </button>
              </div>

              <div class="p-6 lg:p-8">
                <div v-if="editHistory.length > 0" class="space-y-4">
                  <div
                    v-for="history in editHistory"
                    :key="history.id"
                    class="border-l-4 border-indigo-500 pl-5 py-4 bg-gradient-to-r from-indigo-50/50 to-gray-50 rounded-r-lg shadow-sm"
                  >
                    <div class="flex justify-between items-start mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                          <span class="material-icons-outlined text-white text-[16px]">edit</span>
                        </div>
                        <div>
                          <span class="font-semibold text-gray-900 block">
                            {{ history.edited_by_name }}
                          </span>
                          <span class="text-sm text-gray-500">
                            {{ formatDate(history.created_at) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-3 text-sm">
                      <div v-if="history.old_title && history.new_title" class="flex flex-wrap items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <span class="font-semibold text-gray-700">Název:</span>
                        <span class="px-2 py-1 bg-red-50 text-red-700 rounded line-through text-xs font-medium">{{ history.old_title }}</span>
                        <span class="text-gray-400">→</span>
                        <span class="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">{{ history.new_title }}</span>
                      </div>

                      <div v-if="history.old_category && history.new_category" class="flex flex-wrap items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <span class="font-semibold text-gray-700">Kategorie:</span>
                        <span class="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">{{ getCategoryName(history.old_category) }}</span>
                        <span class="text-gray-400">→</span>
                        <span class="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">{{ getCategoryName(history.new_category) }}</span>
                      </div>

                      <div v-if="history.old_tag && history.new_tag" class="flex flex-wrap items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <span class="font-semibold text-gray-700">Tag:</span>
                        <span class="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">{{ getTagName(history.old_tag) }}</span>
                        <span class="text-gray-400">→</span>
                        <span class="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">{{ getTagName(history.new_tag) }}</span>
                      </div>

                      <div v-if="history.old_content && history.new_content" class="mt-3">
                        <span class="font-semibold text-gray-700 block mb-2">Obsah:</span>
                        <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                          <div>
                            <span class="text-xs text-red-700 font-semibold mb-2 block">Původní:</span>
                            <p class="text-gray-700 text-sm mt-2 whitespace-pre-wrap break-words p-3 bg-red-50/50 rounded border border-red-100">
                              {{ history.old_content }}
                            </p>
                          </div>
                          <div>
                            <span class="text-xs text-green-700 font-semibold mb-2 block">Nový:</span>
                            <p class="text-gray-700 text-sm mt-2 whitespace-pre-wrap break-words p-3 bg-green-50/50 rounded border border-green-100">
                              {{ history.new_content }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-12">
                  <span class="material-icons-outlined text-5xl text-gray-300 mb-3 block">history</span>
                  <p class="text-gray-500 text-lg">Žádná historie úprav</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal pro úpravu tématu -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showEditModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click.self="closeEditModal"
        >
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 class="text-2xl font-bold text-gray-900">Upravit téma</h2>
              <button
                @click="closeEditModal"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span class="material-icons-outlined text-[24px]">close</span>
              </button>
            </div>

            <form @submit.prevent="saveEditTopic" class="p-6 space-y-5">
              <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">
                  Název tématu
                </label>
                <input
                  v-model="editForm.title"
                  type="text"
                  required
                  maxlength="500"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-700 text-sm font-semibold mb-2">
                    Kategorie
                  </label>
                  <select
                    v-model="editForm.category"
                    required
                    class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                  >
                    <option value="general">Obecné</option>
                    <option value="announcement">Oznámení</option>
                    <option value="help">Pomoc</option>
                  </select>
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-semibold mb-2">
                    Tag
                  </label>
                  <select
                    v-model="editForm.tag"
                    required
                    class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                  >
                    <option value="general">Obecné</option>
                    <option value="bug">Bug</option>
                    <option value="issue">Issue</option>
                    <option value="uprava">Úprava</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">
                  Obsah
                </label>
                <textarea
                  v-model="editForm.content"
                  required
                  rows="10"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                ></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="closeEditModal"
                  class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                >
                  Uložit
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Topic Modal -->
    <TransitionRoot appear :show="showDeleteTopicModal" as="template">
      <Dialog as="div" @close="showDeleteTopicModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="bg-white p-6 rounded-xl w-full max-w-md shadow-xl border border-gray-200">
                <DialogTitle as="h2" class="text-2xl font-bold mb-4 text-gray-900">
                  Smazat téma
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat toto téma? Tato akce je nevratná a smaže také všechny odpovědi k tomuto tématu.
                </p>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="showDeleteTopicModal = false"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="confirmDeleteTopic"
                    class="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    Smazat
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete Reply Modal -->
    <TransitionRoot appear :show="showDeleteReplyModal" as="template">
      <Dialog as="div" @close="showDeleteReplyModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="bg-white p-6 rounded-xl w-full max-w-md shadow-xl border border-gray-200">
                <DialogTitle as="h2" class="text-2xl font-bold mb-4 text-gray-900">
                  Smazat odpověď
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tuto odpověď? Tato akce je nevratná a smaže také všechny odpovědi k této odpovědi.
                </p>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="showDeleteReplyModal = false; replyToDelete = null"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="confirmDeleteReply"
                    class="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    Smazat
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, Teleport, Transition } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "~/composables/useToast";
import { useForum } from "~/composables/useForum";
import { useSupabaseClient } from "#imports";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const supabase = useSupabaseClient();
const {
  topic,
  replies,
  editHistory,
  views,
  topicUserLikes,
  topicUserDislikes,
  replyUserLikes,
  replyUserDislikes,
  loading,
  topicLoading,
  fetchTopic,
  updateTopic,
  deleteTopic: removeTopic,
  toggleLockTopic: toggleLockTopicFn,
  togglePinTopic: togglePinTopicFn,
  createReply,
  updateReply,
  deleteReply: removeReply,
  setBestAnswer: setBestAnswerFromComposable,
  likeTopic,
  unlikeTopic,
  dislikeTopic,
  undislikeTopic,
  likeReply,
  unlikeReply,
  dislikeReply,
  undislikeReply,
  incrementViewCount,
  fetchEditHistory,
  fetchViews,
} = useForum();

const showReplyForm = ref(false);
const replyingToReply = ref<any>(null);
const replyForm = ref({
  content: "",
});
const editingReply = ref<any>(null);
const showEditModal = ref(false);
const showHistorySidebar = ref(false);
const editForm = ref({
  title: "",
  content: "",
  category: "general" as "general" | "announcement" | "help",
  tag: "general" as "general" | "bug" | "issue" | "uprava",
});
const showDeleteTopicModal = ref(false);
const showDeleteReplyModal = ref(false);
const replyToDelete = ref<any>(null);

// Oprávnění
const permissions = ref({
  view: false,
  create: false,
  edit: false,
  delete: false,
});

// Admin status
const isAdmin = ref(false);

// Computed properties pro počty liků a disliků
const topicLikeCount = ref(0);
const topicDislikeCount = ref(0);

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    general: "Obecné",
    announcement: "Oznámení",
    help: "Pomoc",
  };
  return names[category] || category;
};

const getTagName = (tag: string) => {
  const names: Record<string, string> = {
    general: "Obecné",
    bug: "Bug",
    issue: "Issue",
    uprava: "Úprava",
  };
  return names[tag] || tag;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Function to calculate reply depth recursively
const getReplyDepth = (reply: any, allReplies: any[]): number => {
  if (!reply.parent_reply_id) return 0;
  const parent = allReplies.find((r) => r.id === reply.parent_reply_id);
  if (!parent) return 0;
  return 1 + getReplyDepth(parent, allReplies);
};

// Function to get child replies recursively (sorted by created_at)
const getChildReplies = (replyId: string, allReplies: any[]): any[] => {
  const children = allReplies
    .filter((r) => r.parent_reply_id === replyId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return children.map((child) => ({
    ...child,
    children: getChildReplies(child.id, allReplies),
  }));
};

// Computed: build hierarchical reply tree
const hierarchicalReplies = computed(() => {
  const rootReplies = replies.value
    .filter((r) => !r.parent_reply_id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return rootReplies.map((root) => ({
    ...root,
    children: getChildReplies(root.id, replies.value),
  }));
});

// Flatten hierarchical replies for display
const flattenedReplies = computed(() => {
  const flatten = (items: any[]): any[] => {
    const result: any[] = [];
    items.forEach((item) => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        result.push(...flatten(item.children));
      }
    });
    return result;
  };
  return flatten(hierarchicalReplies.value);
});

const submitReply = async () => {
  if (!replyForm.value.content.trim() || !topic.value) return;

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.email) {
      toast.error("Nejste přihlášeni");
      return;
    }

    await createReply(topic.value.id, {
      content: replyForm.value.content,
      author_name: user.user.email.split("@")[0], // Fallback
      author_email: user.user.email,
      parent_reply_id: replyingToReply.value?.id || null,
    });

    toast.success("Odpověď byla úspěšně přidána");
    replyForm.value.content = "";
    showReplyForm.value = false;
    replyingToReply.value = null;
  } catch (err) {
    console.error("Error submitting reply:", err);
    toast.error("Nepodařilo se přidat odpověď");
  }
};

const replyToReply = (reply: any) => {
  replyingToReply.value = reply;
  showReplyForm.value = true;
};

const editReply = (reply: any) => {
  editingReply.value = { ...reply };
};

const cancelEditReply = () => {
  editingReply.value = null;
};

const saveEditReply = async () => {
  if (!editingReply.value) return;

  try {
    await updateReply(editingReply.value.id, {
      content: editingReply.value.content,
    });
    toast.success("Odpověď byla úspěšně upravena");
    editingReply.value = null;
  } catch (err) {
    console.error("Error updating reply:", err);
    toast.error("Nepodařilo se upravit odpověď");
  }
};

const deleteReply = (reply: any) => {
  replyToDelete.value = reply;
  showDeleteReplyModal.value = true;
};

const confirmDeleteReply = async () => {
  if (!replyToDelete.value) return;

  try {
    await removeReply(replyToDelete.value.id);
    toast.success("Odpověď byla úspěšně smazána");
  } catch (err) {
    console.error("Error deleting reply:", err);
    toast.error("Nepodařilo se smazat odpověď");
  } finally {
    showDeleteReplyModal.value = false;
    replyToDelete.value = null;
  }
};

const setBestAnswer = async (replyId: string) => {
  if (!topic.value) return;

  try {
    await setBestAnswerFromComposable(replyId, topic.value.id);
    toast.success("Odpověď byla označena jako nejlepší");
  } catch (err) {
    console.error("Error setting best answer:", err);
    toast.error("Nepodařilo se označit odpověď");
  }
};

const editTopic = () => {
  if (!topic.value) return;
  editForm.value = {
    title: topic.value.title,
    content: topic.value.content,
    category: topic.value.category,
    tag: topic.value.tag || 'general',
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {
    title: "",
    content: "",
    category: "general",
    tag: "general",
  };
};

const saveEditTopic = async () => {
  if (!topic.value) return;

  try {
    await updateTopic(topic.value.id, {
      title: editForm.value.title,
      content: editForm.value.content,
      category: editForm.value.category,
      tag: editForm.value.tag,
    });
    toast.success("Téma bylo úspěšně upraveno");
    closeEditModal();
    const updatedTopic = await fetchTopic(topic.value.id);
    // Pokud se změnil slug, přesměrujeme na nový URL
    if (updatedTopic && updatedTopic.slug && route.params.slug !== updatedTopic.slug) {
      router.replace(`/admin/forum/${updatedTopic.slug}`);
    }
  } catch (err) {
    console.error("Error updating topic:", err);
    toast.error("Nepodařilo se upravit téma");
  }
};

const toggleLockTopic = async () => {
  if (!topic.value) return;

  try {
    await toggleLockTopicFn(topic.value.id, !topic.value.is_locked);
    toast.success(
      topic.value.is_locked ? "Téma bylo odemčeno" : "Téma bylo zamčeno"
    );
    await fetchTopic(topic.value.id);
  } catch (err) {
    console.error("Error toggling lock:", err);
    toast.error("Nepodařilo se změnit stav zamčení");
  }
};

const togglePinTopic = async () => {
  if (!topic.value) return;

  try {
    await togglePinTopicFn(topic.value.id, !topic.value.is_pinned);
    toast.success(
      topic.value.is_pinned ? "Téma bylo odepnuto" : "Téma bylo připnuto"
    );
    await fetchTopic(topic.value.id);
  } catch (err) {
    console.error("Error toggling pin:", err);
    toast.error("Nepodařilo se změnit stav připnutí");
  }
};

const deleteTopic = () => {
  showDeleteTopicModal.value = true;
};

const confirmDeleteTopic = async () => {
  if (!topic.value) return;

  try {
    await removeTopic(topic.value.id);
    toast.success("Téma bylo úspěšně smazáno");
    router.push("/admin/forum");
  } catch (err) {
    console.error("Error deleting topic:", err);
    toast.error("Nepodařilo se smazat téma");
  } finally {
    showDeleteTopicModal.value = false;
  }
};

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Kontrola role uživatele
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", user.data.user.email)
      .single();

    isAdmin.value = userRole?.role === "admin";

    const actions: Array<"view" | "create" | "edit" | "delete"> = ["view", "create", "edit", "delete"];
    for (const action of actions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "forum",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

const loadTopicData = async (slugOrId: string) => {
  if (slugOrId) {
    const topicData = await fetchTopic(slugOrId);
    if (topicData) {
      await incrementViewCount(topicData.id);
      await fetchEditHistory(topicData.id);
      await fetchViews(topicData.id);
      await loadVoteCounts(topicData.id);
    }
  }
};

// Načtení počtů liků a disliků
const loadVoteCounts = async (topicId: string) => {
  try {
    const { count: likeCount } = await supabase
      .from("forum_topic_likes")
      .select("*", { count: "exact", head: true })
      .eq("topic_id", topicId);

    const { count: dislikeCount } = await supabase
      .from("forum_topic_dislikes")
      .select("*", { count: "exact", head: true })
      .eq("topic_id", topicId);

    topicLikeCount.value = likeCount || 0;
    topicDislikeCount.value = dislikeCount || 0;
  } catch (err) {
    console.error("Error loading vote counts:", err);
  }
};

// Toggle funkce pro like/dislike
const toggleLikeTopic = async () => {
  if (!topic.value) return;

  try {
    if (topicUserLikes.value.includes(topic.value.id)) {
      await unlikeTopic(topic.value.id);
    } else {
      await likeTopic(topic.value.id);
    }
    // Znovu načteme počty
    await loadVoteCounts(topic.value.id);
  } catch (err) {
    console.error("Error toggling like:", err);
    toast.error("Nepodařilo se hodnocení změnit");
  }
};

const toggleDislikeTopic = async () => {
  if (!topic.value) return;

  try {
    if (topicUserDislikes.value.includes(topic.value.id)) {
      await undislikeTopic(topic.value.id);
    } else {
      await dislikeTopic(topic.value.id);
    }
    // Znovu načteme počty
    await loadVoteCounts(topic.value.id);
  } catch (err) {
    console.error("Error toggling dislike:", err);
    toast.error("Nepodařilo se hodnocení změnit");
  }
};

const toggleLikeReply = async (replyId: string) => {
  try {
    if (replyUserLikes.value.includes(replyId)) {
      await unlikeReply(replyId);
    } else {
      await likeReply(replyId);
    }
  } catch (err) {
    console.error("Error toggling reply like:", err);
    toast.error("Nepodařilo se hodnocení změnit");
  }
};

onMounted(async () => {
  const slug = route.params.slug as string;
  await loadTopicData(slug);
  await loadPermissions();
});

// Sledování změny parametru slug v route
watch(() => route.params.slug, async (newSlug) => {
  if (newSlug) {
    await loadTopicData(newSlug as string);
  }
});
</script>

<style scoped>
/* Sidebar overlay animace */
.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}

/* Sidebar slide animace */
.sidebar-enter-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-enter-from {
  transform: translateX(100%);
}

.sidebar-enter-to {
  transform: translateX(0);
}

.sidebar-leave-from {
  transform: translateX(0);
}

.sidebar-leave-to {
  transform: translateX(100%);
}

/* Modal animace */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.modal-enter-from > div {
  transform: scale(0.95);
  opacity: 0;
}

.modal-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}

/* Fade animace */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

