<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-red-50 text-red-600 p-3">
                <Icon name="mdi:music-note-plus" class="text-2xl" />
              </div>
              <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Repertoár (notový archiv)</h2>
            </div>
            <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
              Kompletní seznam skladeb seřazený abecedně. Vyhledávejte dle názvu nebo autora, spravujte notové materiály
              a vytvářejte exporty pro hlášení OSA.
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-start gap-3 md:justify-end">
            <button
              v-if="permissions.create"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow"
              @click="openCreateModal"
            >
              <Icon name="mdi:plus-circle" class="text-lg" />
              Přidat skladbu
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!selectedItems.length"
              @click="exportSelected"
            >
              <Icon name="mdi:file-excel" class="text-lg text-emerald-600" />
              Export do Excelu
            </button>
            <label class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer select-none">
              <input
                id="selectAll"
                type="checkbox"
                class="rounded border-slate-300 text-red-600 focus:ring-red-500"
                :checked="allResponsiveSelected"
                @change="toggleSelectAll"
              />
              Vybrat vše (na stránce)
            </label>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner flex flex-col gap-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="letter in alphabet"
              :key="letter"
              class="px-3 py-1.5 rounded-md text-sm font-semibold transition"
              :class="selectedLetter === letter ? 'bg-red-600 text-white shadow-sm dark:bg-red-500' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
              @click="selectedLetter = letter"
            >
              {{ letter }}
            </button>
          </div>

          <div class="flex flex-col gap-3">
            <!-- Row 1: centered search -->
            <div class="w-full flex justify-center">
              <div class="relative w-full max-w-xl">
                <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  v-model="searchQuery"
                  type="search"
                  class="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  placeholder="Hledat dle názvu, autora, charakteru nebo popisu..."
                />
              </div>
            </div>

            <!-- Row 2: controls (sorting, character, page-size) -->
            <div class="flex flex-wrap items-center justify-center gap-3 md:justify-between">
              <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 dark:bg-slate-900 dark:border-slate-700">
                <span class="text-xs font-medium text-slate-500">Řazení</span>
                <select
                  v-model="sortKey"
                  class="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="title">Abecedně (název)</option>
                  <option value="created_at">Datum vytvoření</option>
                  <option value="updated_at">Poslední úprava</option>
                </select>
                <select
                  v-model="sortDir"
                  class="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="asc">Vzestupně</option>
                  <option value="desc">Sestupně</option>
                </select>
              </div>

              <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 dark:bg-slate-900 dark:border-slate-700">
                <span class="text-xs font-medium text-slate-500">Charakter</span>
                <select
                  v-model="selectedCharacter"
                  class="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="vse">Vše</option>
                  <option v-for="c in characters" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>

              <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 dark:bg-slate-900 dark:border-slate-700">
                <span class="text-xs font-medium text-slate-500">Na stránce</span>
                <select
                  v-model.number="pageSize"
                  class="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
      <div class="overflow-hidden rounded-2xl">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12"></th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Název skladby</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Autor / Autoři</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Noty</th>
                <th v-if="permissions.edit || permissions.delete" class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Akce</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              <tr v-if="loading">
                <td :colspan="permissions.edit || permissions.delete ? 5 : 4" class="px-4 py-10 text-center text-slate-500">
                  <Icon name="mdi:loading" class="animate-spin text-2xl inline-block mr-2" />
                  Načítám repertoár...
                </td>
              </tr>
              <tr v-else-if="!filteredItems.length">
                <td :colspan="permissions.edit || permissions.delete ? 5 : 4" class="px-4 py-10 text-center text-slate-500">
                  Žádné skladby odpovídající vyhledávání.
                </td>
              </tr>
              <template v-for="item in pagedItems" :key="item.id">
                <tr
                  :class="selectedIds.has(item.id) ? 'bg-red-50/50' : ''"
                >
                  <td class="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      class="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      :checked="selectedIds.has(item.id)"
                      @change.stop="toggleSelection(item.id)"
                      @click.stop
                    />
                  </td>
                  <td class="px-4 py-3 align-top">
                    <NuxtLink
                      :to="`/clenska-sekce/repertoar/${item.slug || item.id}`"
                      class="hover:underline block"
                      @click.stop
                    >
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
                    </NuxtLink>
                    <p v-if="item.description" class="text-xs text-slate-500 mt-1 dark:text-slate-300/80">{{ item.description }}</p>
                    <p v-if="item.character" class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      <span class="font-medium">Charakter:</span> {{ item.character }}
                    </p>
                  </td>
                  <td class="px-4 py-3 align-top text-sm text-slate-700 dark:text-slate-200">
                    <p class="text-sm text-slate-700 dark:text-slate-200">{{ item.authors || '—' }}</p>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <div class="grid grid-cols-3 gap-3">
                      <button
                        v-for="(file, idx) in item.files"
                        :key="file.id"
                        type="button"
                        class="group relative flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm hover:shadow-md transition transform hover:scale-105 hover:ring-2 hover:ring-violet-300 dark:hover:ring-violet-600 z-0 hover:z-10"
                        @click="handleFileClick(file, item)"
                      >
                        <Icon
                          :name="isPdf(file) ? 'mdi:file-pdf-box' : (isAudio(file) ? 'mdi:music-note' : 'mdi:file')"
                          class="text-xl"
                          :class="isPdf(file) ? 'text-red-600' : (isAudio(file) ? 'text-emerald-600' : 'text-slate-500')"
                        />
                        <span class="pointer-events-none absolute -top-2 translate-y-[-100%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          {{ file.file_name }}
                        </span>
                      </button>
                      <button
                        v-if="item.youtube_link"
                        type="button"
                        class="group relative flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm hover:shadow-md transition transform hover:scale-105 hover:ring-2 hover:ring-violet-300 dark:hover:ring-violet-600 z-0 hover:z-10"
                        @click="openYoutube(item.youtube_link)"
                        title="Ukázka z YouTube"
                      >
                        <Icon name="mdi:youtube" class="text-xl text-red-600" />
                        <span class="pointer-events-none absolute -top-2 translate-y-[-100%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          YouTube
                        </span>
                      </button>
                    </div>
                  </td>
                  <td v-if="permissions.edit || permissions.delete" class="px-4 py-3 align-top text-right">
                    <div class="inline-flex items-center gap-2">
                      <button
                        v-if="permissions.edit"
                        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        @click="openEditModal(item)"
                      >
                        <Icon name="mdi:pencil" class="text-sm" />
                        Upravit
                      </button>
                      <button
                        v-if="permissions.delete"
                        class="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/20"
                        @click="openDeleteModal(item)"
                      >
                        <Icon name="mdi:trash-can" class="text-sm" />
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="expandedRow[item.id]">
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2" colspan="2">
                    <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 flex items-center gap-3">
                      <audio :src="rowAudioUrl[item.id]" controls class="flex-1" />
                      <button
                        class="inline-flex items-center justify-center px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        @click="expandedRow[item.id] = false"
                        title="Zavřít přehrávač"
                      >
                        <Icon name="mdi:close" class="text-base" />
                      </button>
                    </div>
                  </td>
                  <td class="px-4 py-2"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-600 dark:text-slate-300">
            Zobrazuji
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ Math.min((page - 1) * pageSize + 1, filteredItems.length) }}</span>
            –
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ Math.min(page * pageSize, filteredItems.length) }}</span>
            z
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ filteredItems.length }}</span>
            položek
          </div>
          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              :disabled="page === 1"
              @click="page = 1"
              title="První stránka"
            >
              <Icon name="mdi:page-first" class="text-base" />
            </button>
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              :disabled="page === 1"
              @click="page = Math.max(1, page - 1)"
              title="Předchozí"
            >
              <Icon name="mdi:chevron-left" class="text-base" />
            </button>
            <div class="px-2 text-sm font-medium text-slate-700 dark:text-slate-200">{{ page }} / {{ totalPages }}</div>
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              :disabled="page >= totalPages"
              @click="page = Math.min(totalPages, page + 1)"
              title="Další"
            >
              <Icon name="mdi:chevron-right" class="text-base" />
            </button>
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              :disabled="page >= totalPages"
              @click="page = totalPages"
              title="Poslední stránka"
            >
              <Icon name="mdi:page-last" class="text-base" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal: vytvoření skladby -->
    <Modal v-model="showCreateModal" title="Přidat skladbu do repertoáru">
      <form class="space-y-4" @submit.prevent="submitCreate">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Název skladby *</label>
          <input
            v-model="form.title"
            required
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Autor / autoři</label>
          <input
            v-model="form.authors"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="např. Freddie Mercury, Queen"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Poznámka</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>
        <div class="space-y-2" v-if="permissions.edit">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Charakter</label>
          <input
            v-model="form.character"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="např. Soprán, Alt, Tenor, Bas"
          />
        </div>
        <div class="space-y-2" v-if="permissions.edit">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Ukázka (YouTube link)</label>
          <input
            v-model="form.youtube_link"
            type="url"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div class="space-y-3">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Notové materiály</label>
          <input
            key="create-upload"
            type="file"
            multiple
            accept=".pdf,.jpg,.png,.heic,.tiff,.jpeg"
            @change="handleFileInput($event, 'create')"
            class="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-red-600 hover:file:bg-red-100"
          />
          <p class="text-xs text-slate-500 dark:text-slate-300">
            Maximálně 100 MB na soubor. Přidejte poznámku k hlasu nebo nástroji pro každý soubor zvlášť.
          </p>
          <div
            v-if="pendingUploads.length"
            class="grid gap-2"
          >
            <div
              v-for="(upload, index) in pendingUploads"
              :key="upload.file.name + index"
              class="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium text-slate-700 truncate">{{ upload.file.name }}</p>
                <button
                  class="text-slate-400 hover:text-red-600"
                  type="button"
                  @click="removePendingFile(index)"
                >
                  <Icon name="mdi:close" />
                </button>
              </div>
              <input
                v-model="upload.voicePart"
                class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                placeholder="Poznámka k hlasu (např. Soprán, Alt, Tenor...)"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            @click="showCreateModal = false"
          >
            Zrušit
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            :disabled="loading"
          >
            <Icon name="mdi:content-save" class="text-lg" />
            Uložit skladbu
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal: úprava skladby -->
    <Modal v-model="showEditModal" title="Upravit skladbu">
      <form v-if="editingItem" class="space-y-4" @submit.prevent="submitEdit">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Název skladby *</label>
          <input
            v-model="form.title"
            required
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Autor / autoři</label>
          <input
            v-model="form.authors"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Poznámka</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>
        <div class="space-y-2" v-if="permissions.edit">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Charakter</label>
          <input
            v-model="form.character"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="např. Soprán, Alt, Tenor, Bas"
          />
        </div>
        <div class="space-y-2" v-if="permissions.edit">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Ukázka (YouTube link)</label>
          <input
            v-model="form.youtube_link"
            type="url"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div v-if="permissions.view && editingItem?.files?.length" class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Přiložené soubory</label>
          <div class="grid gap-2">
            <div
              v-for="file in editingItem.files"
              :key="file.id"
              class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div class="flex items-center gap-2 min-w-0">
                <Icon :name="isPdf(file) ? 'mdi:file-pdf-box' : (isAudio(file) ? 'mdi:music-note' : 'mdi:file')" :class="isPdf(file) ? 'text-red-600' : (isAudio(file) ? 'text-emerald-600' : 'text-slate-500')" class="text-base flex-shrink-0" />
                <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ file.file_name }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  @click="downloadFile(file)"
                  title="Stáhnout"
                >
                  <Icon name="mdi:download" class="text-lg" />
                </button>
                <button
                  v-if="permissions.edit || permissions.delete"
                  type="button"
                  class="inline-flex items-center justify-center p-2 text-slate-500 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                  @click="confirmRemoveFile(file)"
                  title="Smazat"
                >
                  <Icon name="mdi:delete" class="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Přidat nové soubory</label>
          <input
            key="edit-upload"
            type="file"
            multiple
            accept=".pdf,.jpg,.png,.heic,.tiff,.jpeg"
            @change="handleFileInput($event, 'edit')"
            class="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-red-600 hover:file:bg-red-100"
          />
          <div
            v-if="pendingUploads.length"
            class="grid gap-2"
          >
            <div
              v-for="(upload, index) in pendingUploads"
              :key="upload.file.name + index"
              class="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium text-slate-700 truncate">{{ upload.file.name }}</p>
                <button
                  class="text-slate-400 hover:text-red-600"
                  type="button"
                  @click="removePendingFile(index)"
                >
                  <Icon name="mdi:close" />
                </button>
              </div>
              <input
                v-model="upload.voicePart"
                class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                placeholder="Poznámka k hlasu"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            @click="showEditModal = false"
          >
            Zavřít
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            :disabled="loading"
          >
            <Icon name="mdi:content-save-edit" class="text-lg" />
            Uložit změny
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal: nahrávání souborů mimo úpravu -->
    <Modal v-model="showUploadModal" title="Přidat soubory k&nbsp;vybrané skladbě">
      <div v-if="uploadTarget" class="space-y-4">
        <p class="text-sm text-slate-600">
          Přidáváte materiály ke skladbě <strong>{{ uploadTarget.title }}</strong>.
        </p>
        <input
          key="inline-upload"
          type="file"
          multiple
          accept=".pdf,.jpg,.png,.heic,.tiff,.jpeg"
          @change="handleFileInput($event, 'upload')"
          class="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-red-600 hover:file:bg-red-100"
        />
        <div
          v-if="pendingUploads.length"
          class="grid gap-2"
        >
          <div
            v-for="(upload, index) in pendingUploads"
            :key="upload.file.name + index"
            class="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium text-slate-700 truncate">{{ upload.file.name }}</p>
              <button
                class="text-slate-400 hover:text-red-600"
                type="button"
                @click="removePendingFile(index)"
              >
                <Icon name="mdi:close" />
              </button>
            </div>
            <input
              v-model="upload.voicePart"
              class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
              placeholder="Poznámka k hlasu"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            @click="closeUploadModal"
          >
            Zrušit
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            :disabled="!pendingUploads.length || uploading"
            @click="submitUpload"
          >
            <Icon name="mdi:upload" class="text-lg" />
            Nahrát soubory
          </button>
        </div>
      </div>
    </Modal>

    <!-- Dialog: potvrzení smazání repertoáru -->
    <TransitionRoot v-if="showDeleteModal" as="template" :show="showDeleteModal">
      <Dialog as="div" class="relative z-50" @close="showDeleteModal = false">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Icon name="mdi:alert" class="text-red-600 dark:text-red-400 text-2xl" />
                </div>

                <DialogTitle class="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  Smazat skladbu?
                </DialogTitle>

                <p class="text-gray-600 dark:text-gray-400 text-center mb-6">
                  Opravdu chcete smazat skladbu <strong class="text-gray-900 dark:text-white">{{ itemToDelete?.title }}</strong> včetně všech notových materiálů?
                  <br />
                  Tuto akci nelze vrátit zpět.
                </p>

                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="showDeleteModal = false"
                    class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete"
                    class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    :disabled="loading"
                  >
                    {{ loading ? 'Mazání...' : 'Smazat' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- PDF viewer dialog -->
    <TransitionRoot v-if="pdfDialog.open" as="template" :show="pdfDialog.open">
      <Dialog as="div" class="relative z-50" @close="pdfDialog.open = false">
        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
              <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <DialogTitle class="text-base font-semibold text-slate-900 dark:text-white truncate">{{ pdfDialog.name }}</DialogTitle>
                  <button class="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" @click="pdfDialog.open = false">
                    <Icon name="mdi:close" />
                  </button>
                </div>
                <div class="aspect-[3/2] bg-slate-50 dark:bg-slate-800">
                  <iframe :src="pdfDialog.url" class="w-full h-full" />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- YouTube viewer dialog -->
    <TransitionRoot v-if="youtubeDialog.open" as="template" :show="youtubeDialog.open">
      <Dialog as="div" class="relative z-50" @close="youtubeDialog.open = false">
        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
              <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-black shadow-xl transition-all">
                <div class="aspect-video">
                  <iframe
                    :src="youtubeDialog.url"
                    class="w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import Modal from '~/components/Modal.vue'
import { useToast } from '~/composables/useToast'
import { useRepertoire, type RepertoireFile, type RepertoireItem } from '~/composables/useRepertoire'
import { useSupabaseClient } from '#imports'

definePageMeta({
  layout: 'members'
})

const alphabet = ['Vše', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#']

const {
  items,
  loading,
  uploading,
  permissions,
  fetchPermissions,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  uploadFiles,
  removeFile,
  downloadFile,
  exportSelectionToExcel
} = useRepertoire()

const toast = useToast()
const router = useRouter()

const analyzeSearch = ref('')
const searchQuery = ref('')
const selectedLetter = ref('Vše')
const selectedIds = ref<Set<string>>(new Set())
const sortKey = ref<'d' | 'title' | 'created_at' | 'updated_at'>('title')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)
const pageSize = ref<number>(20)

const characters = computed(() => {
  const set = new Set<string>()
  items.value.forEach((i) => {
    if (i.character && String(i.character).trim().length) set.add(String(i.character))
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'cs'))
})

const selectedCharacter = ref<'vse' | string>('vse')

watch(analyzeSearch, (v) => {
  searchQuery.value = v
  page.value = 1
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showUploadModal = ref(false)
const showDeleteModal = ref(false)

const editingItem = ref<RepertoireItem | null>(null)
const uploadTarget = ref<RepertoireItem | null>(null)
const itemToDelete = ref<RepertoireItem | null>(null)

const pendingUploads = ref<Array<{ file: File; voicePart: string }>>([])

const form = reactive({
  title: '',
  authors: '',
  description: '',
  character: '',
  youtube_link: ''
})

const normalize = (value: string) =>
  value
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    : ''

const _filtered = computed(() => {
  const query = normalize(searchQuery.value)
  const letter = selectedLetter.value
  const char = selectedCharacter.value

  const arr = items.value.filter((item) => {
    // fulltext: zahrň i character
    const haystack = `${item.title ?? ''} ${item.authors ?? ''} ${item.character ?? ''}`
    const matchesQuery = query ? normalize(haystack).includes(query) : true
    if (!matchesQuery) return false

    // character filter
    if (char !== 'vse') {
      const ic = normalize(item.character ?? '')
      if (ic !== normalize(char)) return false
    }

    if (letter === 'Vše') return true
    const firstChar = normalize(item.title ?? '').charAt(0)
    if (!firstChar) return letter === '#'
    if (letter === '#') return !/[a-z]/i.test(firstChar)
    return firstChar === letter.toLowerCase()
  })

  const dir = sortDir.value === 'asc' ? 1 : -1
  const key = sortKey.value === 'd' ? 'title' : sortKey.value

  const sorted = [...arr].sort((a, b) => {
    if (key === 'title') {
      const at = (a.title || '').toLowerCase()
      const bt = (b.title || '').toLowerCase()
      if (at < bt) return -1 * dir
      if (at > bt) return 1 * dir
      return 0
    }
    if (key === 'created_at') {
      const av = a.created_at ? Date.parse(a.created_at) : 0
      const bv = b.created_at ? Date.parse(b.created_at) : 0
      return (av - bv) * dir
    }
    const au = a.updated_at ? Date.parse(a.updated_at) : 0
    const bu = b.updated_at ? Date.parse(b.updated_at) : 0
    return (au - bu) * dir
  })

  return sorted
})

const filteredItems = _filtered

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => {
  const total = filteredItems.value.length
  const size = Math.max(1, pageSize.value || 1)
  return Math.max(1, Math.ceil(total / size))
})

watch([searchQuery, selectedLetter, sortKey, sortDir, pageSize, selectedCharacter], () => {
  page.value = 1
})

const allResponsiveSelected = computed(() =>
  pagedItems.value.length > 0 && pagedItems.value.every((it) => selectedIds.value.has(it.id))
)

const selectedItems = computed(() => items.value.filter((item) => selectedIds.value.has(item.id)))

const resetForm = () => {
  form.title = ''
  form.authors = ''
  form.description = ''
  form.character = ''
  form.youtube_link = ''
  pendingUploads.value = []
}

const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

const openEditModal = (item: RepertoireItem) => {
  if (!permissions.value.edit) {
    toast.error('Nemáte oprávnění upravovat repertoár')
    return
  }
  editingItem.value = item
  form.title = item.title
  form.authors = item.authors ?? ''
  form.description = item.description ?? ''
  form.character = item.character ?? ''
  form.youtube_link = item.youtube_link ?? ''
  pendingUploads.value = []
  showEditModal.value = true
}

const handleFileInput = (event: Event, context: 'create' | 'edit' | 'upload') => {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  const files = Array.from(input.files)
  files.forEach((file) => {
    pendingUploads.value.push({ file, voicePart: '' })
  })

  // Reset input so same file can be selected again if needed
  input.value = ''

  if (context === 'create') {
    showCreateModal.value = true
  } else if (context === 'edit') {
    showEditModal.value = true
  } else {
    showUploadModal.value = true
  }
}

const removePendingFile = (index: number) => {
  pendingUploads.value.splice(index, 1)
}

const submitCreate = async () => {
  try {
    await createItem(
      {
        title: form.title,
        authors: form.authors,
        description: form.description,
        character: form.character || undefined,
        youtube_link: form.youtube_link || undefined
      },
      pendingUploads.value
    )
    toast.success('Skladba byla přidána')
    showCreateModal.value = false
    resetForm()
    selectedLetter.value = 'Vše'
  } catch (err: any) {
    toast.error(err.message ?? 'Nepodařilo se uložit skladbu')
  }
}

const submitEdit = async () => {
  if (!editingItem.value) return
  try {
    await updateItem(editingItem.value.id, {
      title: form.title,
      authors: form.authors,
      description: form.description,
      character: form.character || undefined,
      youtube_link: form.youtube_link || undefined
    })

    if (pendingUploads.value.length) {
      await uploadFiles(editingItem.value.id, pendingUploads.value)
    }

    toast.success('Skladba byla upravena')
    showEditModal.value = false
    editingItem.value = null
    resetForm()
  } catch (err: any) {
    toast.error(err.message ?? 'Nepodařilo se upravit skladbu')
  }
}

const openDeleteModal = (item: RepertoireItem) => {
  if (!permissions.value.delete) {
    toast.error('Nemáte oprávnění mazat skladby')
    return
  }
  itemToDelete.value = item
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return
  try {
    await deleteItem(itemToDelete.value.id)
    selectedIds.value.delete(itemToDelete.value.id)
    toast.success('Skladba byla odstraněna')
    showDeleteModal.value = false
    itemToDelete.value = null
  } catch (err: any) {
    toast.error(err.message ?? 'Smazání se nezdařilo')
  }
}

const confirmRemoveFile = async (file: RepertoireFile) => {
  if (!permissions.value.edit && !permissions.value.delete) {
    toast.error('Nemáte oprávnění mazat soubory')
    return
  }
  if (!confirm(`Opravdu chcete odstranit soubor ${file.file_name}?`)) return

  try {
    await removeFile(file)
    toast.success('Soubor byl odstraněn')
  } catch (err: any) {
    toast.error(err.message ?? 'Nepodařilo se odstranit soubor')
  }
}

const startUploadFor = (item: RepertoireItem) => {
  uploadTarget.value = item
  pendingUploads.value = []
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadTarget.value = null
  pendingUploads.value = []
}

const submitUpload = async () => {
  if (!uploadTarget.value || !pendingUploads.value.length) return
  try {
    await uploadFiles(uploadTarget.value.id, pendingUploads.value)
    toast.success('Soubory byly nahrány')
    closeUploadModal()
  } catch (err: any) {
    toast.error(err.message ?? 'Nahrání souborů se nezdařilo')
  }
}

const toggleSelection = (id: string) => {
  const selections = new Set(selectedIds.value)
  if (selections.has(id)) {
    selections.delete(id)
  } else {
    selections.add(id)
  }
  selectedIds.value = selections
}

const toggleSelectAll = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.checked) {
    const selections = new Set(selectedIds.value)
    pagedItems.value.forEach((item) => selections.add(item.id))
    selectedIds.value = selections
  } else {
    const selections = new Set(selectedIds.value)
    pagedItems.value.forEach((item) => selections.delete(item.id))
    selectedIds.value = selections
  }
}

const prevPage = () => {
  if (page.value > 1) page.value -= 1
}
const nextPage = () => {
  if (page.value < totalPages.value) page.value = totalPages.value
}

const exportSelected = async () => {
  if (!selectedItems.value.length) {
    toast.info('Vyberte alespoň jednu skladbu pro export')
    return
  }
  try {
    await exportSelectionToExcel(selectedItems.value)
    toast.success('Export byl dokončen')
  } catch (err: any) {
    toast.error(err.message ?? 'Export se nepodařil')
  }
}

const supabase = useSupabaseClient()
const expandedAudio = ref<Record<string, boolean>>({})
const expandedRow = ref<Record<string, boolean>>({})
const fileUrlCache = ref<Record<string, string>>({})
const rowAudioUrl = ref<Record<string, string>>({})
const pdfDialog = reactive({ open: false, url: '', name: '' })
const youtubeDialog = reactive({ open: false, url: '' })

const isPdf = (file: RepertoireFile) => (file.content_type?.includes('pdf') || file.file_name.toLowerCase().endsWith('.pdf'))
const isAudio = (file: RepertoireFile) => (file.content_type?.includes('audio') || file.file_name.toLowerCase().endsWith('.mp3'))

const BUCKET_ID = 'repertoire'

const getFileUrl = async (file: RepertoireFile): Promise<string> => {
  if (fileUrlCache.value[file.id]) return fileUrlCache.value[file.id]
  try {
    const { data } = await supabase.storage.from(BUCKET_ID).createSignedUrl(file.storage_path, 3600)
    if (data?.signedUrl) {
      fileUrlCache.value[file.id] = data.signedUrl
      return data.signedUrl
    }
  } catch (e) {
    // ignore and try public url fallback
  }
  const { data: pub } = supabase.storage.from(BUCKET_ID).getPublicUrl(file.storage_path)
  const publicUrl = pub.publicUrl
  fileUrlCache.value[file.id] = publicUrl
  return publicUrl
}

const getOverlapClass = (files: RepertoireFile[], idx: number) => {
  const cur = files[idx]
  const prev = files[idx - 1]
  if (!cur || !prev) return ''
  return isPdf(cur) && isPdf(prev) ? '-ml-2' : ''
}

const handleFileClick = async (file: RepertoireFile, parent: RepertoireItem) => {
  if (isAudio(file)) {
    const url = await getFileUrl(file)
    if (expandedRow.value[parent.id] && rowAudioUrl.value[parent.id] === url) {
      expandedRow.value[parent.id] = false
      return
    }
    expandedRow.value[parent.id] = true
    rowAudioUrl.value[parent.id] = url
    return
  }
  if (isPdf(file)) {
    const url = await getFileUrl(file)
    pdfDialog.name = file.file_name
    pdfDialog.url = url
    pdfDialog.open = true
    return
  }
}

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const u = new URL(url)
    let id = ''
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1)
    if (u.searchParams.get('v')) id = u.searchParams.get('v') as string
    return `https://www.youtube.com/embed/${id}`
  } catch {
    return url
  }
}

const openYoutube = (link: string) => {
  youtubeDialog.url = getYouTubeEmbedUrl(link)
  youtubeDialog.open = true
}

onMounted(async () => {
  const perms = await fetchPermissions()
  if (!perms.view) {
    toast.error('Nemáte oprávnění prohlížet repertoár')
    router.push('/clenska-sekce/neni-opravneni')
    return
  }
  await fetchItems()
})
</script>

