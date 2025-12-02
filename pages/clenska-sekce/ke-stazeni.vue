<template>
  <div class="space-y-8">
    <section
      class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-6 dark:bg-slate-900/80 dark:border-slate-800"
    >
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="rounded-full bg-red-50 text-red-600 p-3">
              <Icon name="mdi:folder-download" class="text-2xl" />
            </div>
            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
              Dokumenty ke stažení
            </h2>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Interní materiály pro členy sboru – loga, stanovy, kronika a další
            soubory. Dokumenty jsou dostupné pouze po přihlášení.
          </p>
        </div>
        <button
          v-if="permissions.create"
          class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          @click="openCreateModal"
        >
          <Icon name="mdi:upload" class="text-lg" />
          Nahrát dokument
        </button>
      </div>

      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div class="relative flex-1 max-w-md">
          <Icon
            name="mdi:magnify"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
          />
          <input
            v-model="searchQuery"
            type="search"
            class="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="Hledat podle názvu nebo popisu..."
          />
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <label class="text-sm text-slate-600 dark:text-slate-300">Kategorie</label>
            <select
              v-model="categoryFilter"
              class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            >
              <option value="vse">Vše</option>
              <option
                v-for="category in categoryOptions"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          <!-- Přepínač zobrazení (pouze desktop) -->
          <div class="hidden md:flex items-center gap-1 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 p-1">
            <button
              type="button"
              class="p-2 rounded-md transition-colors"
              :class="viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'"
              @click="viewMode = 'grid'"
              title="Zobrazení karet"
            >
              <Icon name="mdi:view-grid" class="text-lg" />
            </button>
            <button
              type="button"
              class="p-2 rounded-md transition-colors"
              :class="viewMode === 'list' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'"
              @click="viewMode = 'list'"
              title="Zobrazení seznamu"
            >
              <Icon name="mdi:view-list" class="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section
      class="rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/80 dark:border-slate-800"
    >
      <!-- Desktop: Grid layout -->
      <div v-if="viewMode === 'grid'" class="hidden md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
        <div
          v-if="loading"
          class="col-span-full py-10 text-center text-slate-500 dark:text-slate-300"
        >
          <Icon
            name="mdi:loading"
            class="animate-spin text-2xl inline-block mr-2"
          />
          Načítám dokumenty...
        </div>
        <div
          v-else-if="!filteredResources.length"
          class="col-span-full py-10 text-center text-slate-500 dark:text-slate-300"
        >
          Žádné dokumenty neodpovídají filtru.
        </div>
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-red-300 dark:hover:border-red-700"
        >
          <!-- Náhled -->
          <button
            v-if="hasPreview(resource)"
            class="relative block w-full h-48 bg-slate-50 dark:bg-slate-800 overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800"
            type="button"
            @click="openPreview(resource)"
          >
            <!-- Obrázek -->
            <img
              v-if="isImageResource(resource) && previewUrls[resource.id]"
              :src="previewUrls[resource.id]"
              alt=""
              class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <!-- PDF náhled -->
            <div
              v-else-if="isPdfResource(resource) && previewUrls[resource.id]"
              class="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <iframe
                :src="previewUrls[resource.id] + '#toolbar=0&navpanes=0&scrollbar=0'"
                class="absolute inset-0 w-full h-full"
                frameborder="0"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <Icon
                name="mdi:file-pdf-box"
                class="text-4xl text-red-600 relative z-10 pointer-events-none"
              />
            </div>
            <!-- DOCX/DOC náhled -->
            <div
              v-else-if="isWordResource(resource) && previewUrls[resource.id]"
              class="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <iframe
                :src="getDocxViewerUrl(previewUrls[resource.id])"
                class="absolute inset-0 w-full h-full"
                frameborder="0"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <Icon
                name="mdi:file-word-box"
                class="text-4xl text-blue-600 relative z-10 pointer-events-none"
              />
            </div>
            <!-- Loading placeholder -->
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
            >
              <Icon
                :name="isPdfResource(resource) ? 'mdi:file-pdf-box' : isWordResource(resource) ? 'mdi:file-word-box' : 'mdi:image'"
                class="text-4xl"
              />
            </div>
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Icon
                name="mdi:magnify-plus-outline"
                class="text-3xl text-white"
              />
            </div>
          </button>
          <!-- Ikona pro soubory bez náhledu -->
          <div
            v-else
            class="w-full h-48 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20"
          >
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-lg">
                <Icon
                  :name="resolveIcon(resource.content_type)"
                  class="text-4xl text-red-600 dark:text-red-400"
                />
              </div>
            </div>
          </div>

          <!-- Obsah karty -->
          <div class="p-5 space-y-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                {{ resource.title }}
              </h3>
              <p
                v-if="resource.description"
                class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2"
              >
                {{ resource.description }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="resource.category"
                class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/20 dark:text-red-200"
              >
                <Icon name="mdi:tag" class="text-xs" />
                {{ resource.category }}
              </span>
            </div>

            <div class="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span class="inline-flex items-center gap-1.5">
                <Icon name="mdi:calendar" class="text-xs" />
                {{ formatDate(resource.created_at) }}
              </span>
              <span class="inline-flex items-center gap-1.5 truncate">
                <Icon name="mdi:file" class="text-xs flex-shrink-0" />
                <span class="truncate">{{ resource.file_name }}</span>
              </span>
            </div>

            <!-- Akce -->
            <div class="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                @click="downloadResource(resource)"
              >
                <Icon name="mdi:download" class="text-sm" />
                Stáhnout
              </button>
              <button
                v-if="permissions.edit"
                class="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                @click="openEditModal(resource)"
                title="Upravit"
              >
                <Icon name="mdi:pencil" class="text-sm" />
              </button>
              <button
                v-if="permissions.delete"
                class="inline-flex items-center justify-center p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/20 transition-colors"
                @click="confirmDelete(resource)"
                title="Smazat"
              >
                <Icon name="mdi:trash-can" class="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Seznam zobrazení -->
      <ul v-if="viewMode === 'list'" class="hidden md:block divide-y divide-slate-200 dark:divide-slate-800">
        <li
          v-if="loading"
          class="px-6 py-10 text-center text-slate-500 dark:text-slate-300"
        >
          <Icon
            name="mdi:loading"
            class="animate-spin text-2xl inline-block mr-2"
          />
          Načítám dokumenty...
        </li>
        <li
          v-else-if="!filteredResources.length"
          class="px-6 py-10 text-center text-slate-500 dark:text-slate-300"
        >
          Žádné dokumenty neodpovídají filtru.
        </li>
        <li
          v-for="resource in filteredResources"
          :key="resource.id"
          class="px-6 py-5 flex items-start gap-4 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/60"
        >
          <button
            v-if="hasPreview(resource)"
            class="group relative block w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-slate-700 dark:bg-slate-900"
            type="button"
            @click="openPreview(resource)"
          >
            <!-- Obrázek -->
            <img
              v-if="isImageResource(resource) && previewUrls[resource.id]"
              :src="previewUrls[resource.id]"
              alt=""
              class="h-full w-full object-cover"
            />
            <!-- PDF náhled -->
            <div
              v-else-if="isPdfResource(resource) && previewUrls[resource.id]"
              class="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <iframe
                :src="previewUrls[resource.id] + '#toolbar=0&navpanes=0&scrollbar=0'"
                class="absolute inset-0 w-full h-full"
                frameborder="0"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <Icon
                name="mdi:file-pdf-box"
                class="text-3xl text-red-600 relative z-10 pointer-events-none"
              />
            </div>
            <!-- DOCX/DOC náhled -->
            <div
              v-else-if="isWordResource(resource) && previewUrls[resource.id]"
              class="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <iframe
                :src="getDocxViewerUrl(previewUrls[resource.id])"
                class="absolute inset-0 w-full h-full"
                frameborder="0"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <Icon
                name="mdi:file-word-box"
                class="text-3xl text-blue-600 relative z-10 pointer-events-none"
              />
            </div>
            <!-- Loading placeholder -->
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
            >
              <Icon
                :name="isPdfResource(resource) ? 'mdi:file-pdf-box' : isWordResource(resource) ? 'mdi:file-word-box' : 'mdi:image'"
                class="text-3xl"
              />
            </div>
            <div
              class="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center"
            >
              <Icon
                name="mdi:magnify-plus-outline"
                class="text-2xl text-white"
              />
            </div>
          </button>
          <div
            v-else
            class="flex w-20 h-20 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 shadow-sm dark:bg-red-500/20 dark:text-red-200"
          >
            <Icon
              :name="resolveIcon(resource.content_type)"
              class="text-2xl"
            />
          </div>

          <div class="flex-1 min-w-0 space-y-2">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ resource.title }}
              </h3>
              <p
                v-if="resource.description"
                class="text-sm text-slate-600 dark:text-slate-300 mt-1"
              >
                {{ resource.description }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span
                v-if="resource.category"
                class="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-red-600 font-medium dark:bg-red-500/20 dark:text-red-200"
              >
                <Icon name="mdi:tag" class="text-sm" />
                {{ resource.category }}
              </span>
              <span class="inline-flex items-center gap-1">
                <Icon name="mdi:calendar" class="text-sm" />
                {{ formatDate(resource.created_at) }}
              </span>
              <span class="inline-flex items-center gap-1">
                <Icon name="mdi:file" class="text-sm" />
                {{ resource.file_name }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              @click="downloadResource(resource)"
            >
              <Icon name="mdi:download" class="text-sm" />
              Stáhnout
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              v-if="permissions.edit"
              @click="openEditModal(resource)"
            >
              <Icon name="mdi:pencil" class="text-sm" />
              Upravit
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/20"
              v-if="permissions.delete"
              @click="confirmDelete(resource)"
            >
              <Icon name="mdi:trash-can" class="text-sm" />
              Smazat
            </button>
          </div>
        </li>
      </ul>

      <!-- Mobilní: Seznam -->
      <ul class="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
        <li
          v-if="loading"
          class="px-6 py-10 text-center text-slate-500 dark:text-slate-300"
        >
          <Icon
            name="mdi:loading"
            class="animate-spin text-2xl inline-block mr-2"
          />
          Načítám dokumenty...
        </li>
        <li
          v-else-if="!filteredResources.length"
          class="px-6 py-10 text-center text-slate-500 dark:text-slate-300"
        >
          Žádné dokumenty neodpovídají filtru.
        </li>
        <li
          v-for="resource in filteredResources"
          :key="resource.id"
          class="px-4 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/60"
        >
            <button
            v-if="hasPreview(resource)"
            class="group relative block w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-slate-700 dark:bg-slate-900"
              type="button"
              @click="openPreview(resource)"
            >
            <!-- Obrázek -->
              <img
              v-if="isImageResource(resource) && previewUrls[resource.id]"
                :src="previewUrls[resource.id]"
                alt=""
                class="h-full w-full object-cover"
              />
            <!-- PDF náhled -->
            <div
              v-else-if="isPdfResource(resource) && previewUrls[resource.id]"
              class="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <iframe
                :src="previewUrls[resource.id] + '#toolbar=0&navpanes=0&scrollbar=0'"
                class="absolute inset-0 w-full h-full"
                frameborder="0"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <Icon
                name="mdi:file-pdf-box"
                class="text-2xl text-red-600 relative z-10 pointer-events-none"
              />
            </div>
            <!-- DOCX/DOC náhled -->
            <div
              v-else-if="isWordResource(resource) && previewUrls[resource.id]"
              class="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <iframe
                :src="getDocxViewerUrl(previewUrls[resource.id])"
                class="absolute inset-0 w-full h-full"
                frameborder="0"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <Icon
                name="mdi:file-word-box"
                class="text-2xl text-blue-600 relative z-10 pointer-events-none"
              />
            </div>
            <!-- Loading placeholder -->
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              >
              <Icon
                :name="isPdfResource(resource) ? 'mdi:file-pdf-box' : isWordResource(resource) ? 'mdi:file-word-box' : 'mdi:image'"
                class="text-2xl"
              />
              </div>
              <div
                class="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center"
              >
                <Icon
                  name="mdi:magnify-plus-outline"
                class="text-xl text-white"
                />
              </div>
            </button>
            <div
              v-else
            class="flex w-16 h-16 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 shadow-sm dark:bg-red-500/20 dark:text-red-200"
            >
              <Icon
                :name="resolveIcon(resource.content_type)"
                class="text-2xl"
              />
            </div>

          <div class="flex-1 min-w-0 space-y-2">
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">
                {{ resource.title }}
              </h3>
              <p
                v-if="resource.description"
                class="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mt-1"
              >
                {{ resource.description }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span
                  v-if="resource.category"
                class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-red-600 font-medium dark:bg-red-500/20 dark:text-red-200"
                >
                <Icon name="mdi:tag" class="text-xs" />
                  {{ resource.category }}
                </span>
                <span class="inline-flex items-center gap-1">
                <Icon name="mdi:calendar" class="text-xs" />
                  {{ formatDate(resource.created_at) }}
                </span>
          </div>

            <div class="flex items-center gap-2">
            <button
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              @click="downloadResource(resource)"
            >
              <Icon name="mdi:download" class="text-sm" />
              Stáhnout
            </button>
            <button
                class="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              :disabled="!permissions.edit"
              @click="openEditModal(resource)"
                title="Upravit"
            >
                <Icon name="mdi:pencil" class="text-base" />
            </button>
            <button
                class="inline-flex items-center justify-center p-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/20"
              :disabled="!permissions.delete"
              @click="confirmDelete(resource)"
                title="Smazat"
            >
                <Icon name="mdi:trash-can" class="text-base" />
            </button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <Modal
      v-model="showPreviewModal"
      :title="previewResource?.title ?? 'Náhled dokumentu'"
    >
      <div class="space-y-4">
        <div
          class="relative rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-center dark:border-slate-700 dark:bg-slate-900/60"
        >
          <!-- Obrázek -->
          <img
            v-if="previewResource && isImageResource(previewResource) && activePreviewUrl"
            :src="activePreviewUrl"
            :alt="previewResource?.title ?? ''"
            class="max-h-[70vh] w-full object-contain rounded-md"
          />
          <!-- PDF náhled -->
          <iframe
            v-else-if="previewResource && isPdfResource(previewResource) && activePreviewUrl"
            :src="activePreviewUrl + '#toolbar=1&navpanes=1&scrollbar=1'"
            class="w-full h-[70vh] rounded-md border-0"
            frameborder="0"
          />
          <!-- DOCX/DOC náhled -->
          <iframe
            v-else-if="previewResource && isWordResource(previewResource) && activePreviewUrl"
            :src="getDocxViewerUrl(activePreviewUrl)"
            class="w-full h-[70vh] rounded-md border-0"
            frameborder="0"
          />
          <!-- Loading -->
          <div
            v-else
            class="flex items-center justify-center gap-2 py-16 text-slate-500 dark:text-slate-300"
          >
            <Icon name="mdi:loading" class="animate-spin text-2xl" />
            Generuji náhled...
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="downloadPreview"
          >
            <Icon name="mdi:download" class="text-lg" />
            Stáhnout
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            @click="closePreview"
          >
            Zavřít
          </button>
        </div>
      </div>
    </Modal>

    <Modal v-model="showModal" :title="modalTitle">
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Název *</label
          >
          <input
            v-model="form.title"
            required
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Popis</label
          >
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Kategorie</label
          >
          <input
            v-model="form.category"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="např. Stanovy, Logo, Materiály, Kronika..."
          />
        </div>

        <div v-if="!editingResource" class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Soubor *</label
          >
          <input
            ref="fileInput"
            type="file"
            required
            @change="handleFileChange"
            class="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-red-600 hover:file:bg-red-100"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4">
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
            :disabled="
              loading || uploading || (!editingResource && !selectedFile)
            "
          >
            <Icon
              :name="editingResource ? 'mdi:content-save-edit' : 'mdi:upload'"
              class="text-lg"
            />
            {{ editingResource ? "Uložit změny" : "Nahrát dokument" }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Odstranit dokument"
      :message="`Opravdu chcete odstranit dokument '${resourceToDelete?.title}'? Tato akce je nevratná.`"
      confirm-text="Ano, odstranit"
      cancel-text="Zrušit"
      confirm-icon="mdi:trash-can"
      type="danger"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
// @ts-ignore Nuxt auto-imports
import { useRouter } from "#imports";
import Modal from "~/components/Modal.vue";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import { useToast } from "~/composables/useToast";
import {
  useMemberResources,
  type MemberResource,
} from "~/composables/useMemberResources";

definePageMeta({
  layout: "members",
});

const toast = useToast();
const router = useRouter();

const {
  resources,
  permissions,
  loading,
  uploading,
  fetchPermissions,
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  downloadResource,
  getPreviewUrl,
} = useMemberResources();

const searchQuery = ref("");
const categoryFilter = ref<"vse" | string>("vse");

// View mode: grid nebo list
const getSavedViewMode = (): "grid" | "list" => {
  if (typeof window === "undefined") return "grid";
  const saved = localStorage.getItem("member-resources-view-mode");
  return saved === "list" || saved === "grid" ? saved : "grid";
};

const viewMode = ref<"grid" | "list">(getSavedViewMode());

// Ukládání view mode do localStorage
watch(viewMode, (newValue) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("member-resources-view-mode", newValue);
  }
});

const showModal = ref(false);
const editingResource = ref<MemberResource | null>(null);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const showPreviewModal = ref(false);
const previewResource = ref<MemberResource | null>(null);
const previewUrls = ref<Record<string, string>>({});

const showDeleteDialog = ref(false);
const resourceToDelete = ref<MemberResource | null>(null);

const form = reactive({
  title: "",
  description: "",
  category: "",
});

const normalize = (value: string) =>
  value
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    : "";

const filteredResources = computed(() => {
  const query = normalize(searchQuery.value);

  return resources.value.filter((resource) => {
    if (categoryFilter.value !== "vse") {
      if (!resource.category) return false;
      if (
        resource.category.toLowerCase() !== categoryFilter.value.toLowerCase()
      )
        return false;
    }

    if (!query) return true;
    const haystack = `${resource.title} ${resource.description ?? ""} ${
      resource.file_name
    }`;
    return normalize(haystack).includes(query);
  });
});

const categoryOptions = computed(() => {
  const categories = new Set<string>();
  resources.value.forEach((resource) => {
    if (resource.category) categories.add(resource.category);
  });
  return Array.from(categories).sort((a, b) => a.localeCompare(b, "cs"));
});

const formatDate = (value: string) => new Date(value).toLocaleString("cs-CZ");

const resolveIcon = (contentType: string | null) => {
  if (!contentType) return "mdi:file";
  if (contentType.includes("pdf")) return "mdi:file-pdf-box";
  if (contentType.includes("image")) return "mdi:file-image";
  if (contentType.includes("wordprocessingml") || contentType.includes("application/msword") || contentType.includes("application/vnd.ms-word")) return "mdi:file-word-box";
  if (contentType.includes("zip")) return "mdi:folder-zip";
  return "mdi:file";
};

const isImageResource = (resource: MemberResource) =>
  resource.content_type?.startsWith("image/");

const isPdfResource = (resource: MemberResource) =>
  resource.content_type?.includes("pdf") ||
  resource.file_name.toLowerCase().endsWith(".pdf");

const isDocxResource = (resource: MemberResource) =>
  resource.content_type?.includes("wordprocessingml") ||
  resource.content_type?.includes("application/vnd.openxmlformats-officedocument.wordprocessingml") ||
  resource.file_name.toLowerCase().endsWith(".docx");

const isDocResource = (resource: MemberResource) =>
  resource.content_type?.includes("application/msword") ||
  resource.content_type?.includes("application/vnd.ms-word") ||
  resource.file_name.toLowerCase().endsWith(".doc");

const isWordResource = (resource: MemberResource) =>
  isDocxResource(resource) || isDocResource(resource);

const hasPreview = (resource: MemberResource) =>
  isImageResource(resource) || isPdfResource(resource) || isWordResource(resource);

const ensurePreview = async (resource: MemberResource) => {
  if (!hasPreview(resource) || previewUrls.value[resource.id]) return;
  try {
    const url = await getPreviewUrl(resource);
    if (url) {
      previewUrls.value = { ...previewUrls.value, [resource.id]: url };
    }
  } catch (err) {
    console.error("Nepodařilo se načíst náhled dokumentu:", err);
  }
};

const getDocxViewerUrl = (url: string) => {
  // Google Docs Viewer pro DOCX a DOC soubory
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
};

const openPreview = async (resource: MemberResource) => {
  await ensurePreview(resource);
  previewResource.value = resource;
  showPreviewModal.value = true;
};

const closePreview = () => {
  showPreviewModal.value = false;
};

const downloadPreview = async () => {
  if (previewResource.value) {
    await downloadResource(previewResource.value);
  }
};

const activePreviewUrl = computed(() =>
  previewResource.value
    ? previewUrls.value[previewResource.value.id] ?? null
    : null
);

const resetForm = () => {
  form.title = "";
  form.description = "";
  form.category = "";
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const openCreateModal = () => {
  if (!permissions.value.create) {
    toast.error("Nemáte oprávnění nahrávat dokumenty");
    return;
  }
  resetForm();
  editingResource.value = null;
  showModal.value = true;
};

const openEditModal = (resource: MemberResource) => {
  if (!permissions.value.edit) {
    toast.error("Nemáte oprávnění upravovat dokumenty");
    return;
  }
  editingResource.value = resource;
  form.title = resource.title;
  form.description = resource.description ?? "";
  form.category = resource.category ?? "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingResource.value = null;
  resetForm();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  } else {
    selectedFile.value = null;
  }
};

const submitForm = async () => {
  try {
    if (editingResource.value) {
      await updateResource(editingResource.value.id, {
        title: form.title,
        description: form.description || null,
        category: form.category || null,
      });
      toast.success("Metadata dokumentu byla upravena");
    } else {
      if (!selectedFile.value) {
        toast.error("Vyberte prosím soubor");
        return;
      }
      await createResource(
        {
          title: form.title,
          description: form.description || null,
          category: form.category || null,
        },
        selectedFile.value
      );
      toast.success("Dokument byl nahrán");
    }
    closeModal();
  } catch (err: any) {
    toast.error(err.message ?? "Uložení se nezdařilo");
  }
};

const confirmDelete = (resource: MemberResource) => {
  if (!permissions.value.delete) {
    toast.error("Nemáte oprávnění mazat dokumenty");
    return;
  }
  resourceToDelete.value = resource;
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  if (!resourceToDelete.value) return;

  try {
    const resourceId = resourceToDelete.value.id;
    await deleteResource(resourceId);
    if (previewUrls.value[resourceId]) {
      const { [resourceId]: _, ...rest } = previewUrls.value;
      previewUrls.value = rest;
    }
    toast.success("Dokument byl odstraněn");
  } catch (err: any) {
    toast.error(err.message ?? "Mazání se nezdařilo");
  } finally {
    resourceToDelete.value = null;
  }
};

const modalTitle = computed(() =>
  editingResource.value ? "Upravit dokument" : "Nahrát nový dokument"
);

onMounted(async () => {
  const perms = await fetchPermissions();
  if (!perms.view) {
    toast.error("Nemáte oprávnění k dokumentům");
    router.push("/clenska-sekce/neni-opravneni");
    return;
  }
  await fetchResources();
});

watch(
  resources,
  (items) => {
    items.forEach((resource) => {
      if (hasPreview(resource)) {
      ensurePreview(resource);
      }
    });
  },
  { immediate: true }
);
</script>
