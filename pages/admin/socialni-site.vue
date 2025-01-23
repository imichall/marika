<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Správa sociálních sítí</h1>
        <p class="text-gray-600 mt-2">Spravujte odkazy na sociální sítě</p>
      </div>
      <button
        @click="resetForm"
        class="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Přidat sociální síť
      </button>
    </div>

    <!-- Seznam sociálních sítí -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      <div
        v-for="item in socialMedia || []"
        :key="item.id"
        class="bg-white rounded-lg p-6 shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 relative group"
      >
        <div
          class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2"
        >
          <button
            @click="editItem(item)"
            class="p-2 text-gray-600 hover:text-primary bg-white rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
            title="Upravit"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
              />
            </svg>
          </button>
          <button
            @click="deleteItem(item)"
            class="p-2 text-gray-600 hover:text-red-600 bg-white rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
            title="Smazat"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-white rounded-full shadow-md">
            <svg
              class="w-6 h-6"
              :class="getIconColor(item.platform)"
              viewBox="0 0 24 24"
            >
              <path
                v-if="item.platform === 'facebook'"
                fill="currentColor"
                d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
              />
              <path
                v-else-if="item.platform === 'instagram'"
                fill="currentColor"
                d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
              />
              <path
                v-else-if="item.platform === 'youtube'"
                fill="currentColor"
                d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9c.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83c-.25.9-.83 1.48-1.73 1.73c-.47.13-1.33.22-2.65.28c-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44c-.9-.25-1.48-.83-1.73-1.73c-.13-.47-.22-1.1-.28-1.9c-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83c.25-.9.83-1.48 1.73-1.73c.47-.13 1.33-.22 2.65-.28c1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44c.9.25 1.48.83 1.73 1.73Z"
              />
              <path
                v-else-if="item.platform === 'spotify'"
                fill="currentColor"
                d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6c-.15-.5.15-1 .6-1.15c3.55-1.05 9.4-.85 13.1 1.35c.45.25.6.85.35 1.3c-.25.35-.85.5-1.3.25m-.1 2.8c-.25.35-.7.5-1.05.25c-2.7-1.65-6.8-2.15-9.95-1.15c-.4.1-.85-.1-.95-.5c-.1-.4.1-.85.5-.95c3.65-1.1 8.15-.55 11.25 1.35c.35.15.4.55.25.85M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"
              />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-lg text-gray-900">
                {{ item.platform }}
              </h3>
              <span
                v-if="item.choir_group_id"
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="getBadgeColor(item.choir_group_id)"
              >
                {{
                  groups?.find((g) => g.id === item.choir_group_id)?.name || ""
                }}
              </span>
              <span
                v-else
                class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
              >
                Globální
              </span>
            </div>
            <a
              :href="item.url"
              target="_blank"
              class="text-sm text-primary hover:text-primary-dark transition-colors duration-200 hover:underline font-medium"
            >
              {{ item.url }}
            </a>
          </div>
        </div>
      </div>

      <!-- Prázdný stav -->
      <div
        v-if="!socialMedia?.length"
        class="col-span-full bg-white rounded-lg p-8 text-center shadow-md border border-gray-100"
      >
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Žádné sociální sítě
        </h3>
        <p class="text-gray-500">
          Zatím nejsou přidány žádné sociální sítě. Začněte kliknutím na
          tlačítko "Přidat sociální síť".
        </p>
      </div>
    </div>

    <!-- Formulář -->
    <div
      v-if="editingId || isAdding"
      class="bg-white rounded-lg shadow-lg p-6 border border-gray-100"
    >
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <h3 class="text-xl font-bold mb-4">
              {{
                editingId ? "Upravit sociální síť" : "Přidat novou sociální síť"
              }}
            </h3>

            <!-- Platform -->
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Platforma
              </label>
              <div class="relative">
                <select
                  v-model="form.platform"
                  class="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block appearance-none"
                  required
                >
                  <option value="" disabled>Vyberte platformu</option>
                  <option
                    v-for="platform in platforms"
                    :key="platform.value"
                    :value="platform.value"
                  >
                    {{ platform.label }}
                  </option>
                </select>
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <svg
                    v-if="form.platform"
                    class="w-6 h-6"
                    :class="getIconColor(form.platform)"
                    viewBox="0 0 24 24"
                  >
                    <path
                      v-if="form.platform === 'facebook'"
                      fill="currentColor"
                      d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
                    />
                    <path
                      v-else-if="form.platform === 'instagram'"
                      fill="currentColor"
                      d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
                    />
                    <path
                      v-else-if="form.platform === 'youtube'"
                      fill="currentColor"
                      d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9c.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83c-.25.9-.83 1.48-1.73 1.73c-.47.13-1.33.22-2.65.28c-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44c-.9-.25-1.48-.83-1.73-1.73c-.13-.47-.22-1.1-.28-1.9c-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83c.25-.9.83-1.48 1.73-1.73c.47-.13 1.33-.22 2.65-.28c1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44c.9.25 1.48.83 1.73 1.73Z"
                    />
                    <path
                      v-else-if="form.platform === 'spotify'"
                      fill="currentColor"
                      d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6c-.15-.5.15-1 .6-1.15c3.55-1.05 9.4-.85 13.1 1.35c.45.25.6.85.35 1.3c-.25.35-.85.5-1.3.25m-.1 2.8c-.25.35-.7.5-1.05.25c-2.7-1.65-6.8-2.15-9.95-1.15c-.4.1-.85-.1-.95-.5c-.1-.4.1-.85.5-.95c3.65-1.1 8.15-.55 11.25 1.35c.35.15.4.55.25.85M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"
                    />
                  </svg>
                </div>
                <div
                  class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
                >
                  <svg
                    class="w-4 h-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- URL -->
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                v-model="form.url"
                type="url"
                class="w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block"
                placeholder="https://..."
                required
              />
            </div>
          </div>

          <!-- Výběr tělesa -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-700 mb-4">
              Přiřadit k tělesu
            </h4>
            <div
              v-if="!groups?.length"
              class="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg"
            >
              Načítání těles...
            </div>
            <div v-else class="space-y-2">
              <!-- Globální možnost -->
              <label
                class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <input
                  type="radio"
                  v-model="form.choir_group_id"
                  value="global"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900"
                    >Globální</span
                  >
                  <p class="text-xs text-gray-500">
                    Sociální síť bude viditelná ve všech sekcích
                  </p>
                </div>
              </label>

              <!-- Jednotlivá tělesa -->
              <label
                v-for="group in groups"
                :key="group.id"
                class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <input
                  type="radio"
                  v-model="form.choir_group_id"
                  :value="group.id"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">{{
                    group.name
                  }}</span>
                  <p class="text-xs text-gray-500">
                    Sociální síť bude viditelná pouze v sekci {{ group.name }}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Tlačítka -->
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="cancelEdit"
            class="px-6 py-2.5 text-sm font-medium text-red-700 bg-white border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Zrušit
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 text-sm font-medium text-white border-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            :class="
              editingId
                ? 'bg-blue-600 hover:bg-blue-700 border-blue-600'
                : 'bg-green-600 hover:bg-green-700 border-green-600'
            "
            :disabled="loading"
          >
            {{ editingId ? "Upravit" : "Přidat" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Delete Modal -->
    <TransitionRoot appear :show="showDeleteModal" as="template">
      <Dialog as="div" @close="cancelDelete" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
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
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-3"
                >
                  <div class="p-2 bg-gray-50 rounded-full">
                    <svg
                      v-if="itemToDelete"
                      class="w-6 h-6"
                      :class="getIconColor(itemToDelete?.platform || '')"
                      viewBox="0 0 24 24"
                    >
                      <path
                        v-if="itemToDelete?.platform === 'facebook'"
                        fill="currentColor"
                        d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
                      />
                      <path
                        v-else-if="itemToDelete?.platform === 'instagram'"
                        fill="currentColor"
                        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
                      />
                      <path
                        v-else-if="itemToDelete?.platform === 'youtube'"
                        fill="currentColor"
                        d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9c.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83c-.25.9-.83 1.48-1.73 1.73c-.47.13-1.33.22-2.65.28c-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44c-.9-.25-1.48-.83-1.73-1.73c-.13-.47-.22-1.1-.28-1.9c-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83c.25-.9.83-1.48 1.73-1.73c.47-.13 1.33-.22 2.65-.28c1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44c.9.25 1.48.83 1.73 1.73Z"
                      />
                      <path
                        v-else-if="itemToDelete?.platform === 'spotify'"
                        fill="currentColor"
                        d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6c-.15-.5.15-1 .6-1.15c3.55-1.05 9.4-.85 13.1 1.35c.45.25.6.85.35 1.3c-.25.35-.85.5-1.3.25m-.1 2.8c-.25.35-.7.5-1.05.25c-2.7-1.65-6.8-2.15-9.95-1.15c-.4.1-.85-.1-.95-.5c-.1-.4.1-.85.5-.95c3.65-1.1 8.15-.55 11.25 1.35c.35.15.4.55.25.85M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"
                      />
                    </svg>
                  </div>
                  Potvrzení smazání
                </DialogTitle>

                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Opravdu chcete smazat tuto sociální síť?
                    <span
                      v-if="itemToDelete"
                      class="block mt-2 font-medium text-gray-700"
                    >
                      {{ itemToDelete.platform }} - {{ itemToDelete.url }}
                    </span>
                  </p>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    @click="cancelDelete"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    @click="confirmDelete"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "#imports";
import { useSocialMedia } from "~/composables/useSocialMedia";
import { useToast } from "~/composables/useToast";
import { useChoirGroups } from "~/composables/useChoirGroups";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  icon: string;
  choir_group_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ChoirGroup {
  id: string;
  name: string;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
}

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const {
  socialMedia,
  loading,
  fetchSocialMedia,
  addSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
} = useSocialMedia();

const toast = useToast();
const { groups, fetchGroups } = useChoirGroups();

const platforms = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
];

const form = ref({
  platform: "",
  url: "",
  choir_group_id: "global",
});

const editingId = ref<string | null>(null);
const isAdding = ref(false);

const showDeleteModal = ref(false);
const itemToDelete = ref<SocialMedia | null>(null);

const getIconColor = (platform: string) => {
  const colors: Record<string, string> = {
    facebook: "text-[#1877F2]",
    instagram: "text-[#E4405F]",
    youtube: "text-[#FF0000]",
    spotify: "text-[#1DB954]",
  };
  return colors[platform.toLowerCase()] || "";
};

const getBadgeColor = (groupId: string) => {
  if (!groups.value) return "bg-gray-100 text-gray-800";

  const colorMap = new Map<string, string>([
    [groups.value[0]?.id, "bg-blue-100 text-blue-800"], // Marika Singers
    [groups.value[1]?.id, "bg-pink-100 text-pink-800"], // Five
    [groups.value[2]?.id, "bg-purple-100 text-purple-800"], // Voices
  ]);

  return colorMap.get(groupId) || "bg-gray-100 text-gray-800";
};

const resetForm = () => {
  form.value = {
    platform: "",
    url: "",
    choir_group_id: "global",
  };
  editingId.value = null;
  isAdding.value = true;
};

const cancelEdit = () => {
  form.value = {
    platform: "",
    url: "",
    choir_group_id: "global",
  };
  editingId.value = null;
  isAdding.value = false;
};

const handleSubmit = async () => {
  try {
    const dataToSave = {
      platform: form.value.platform,
      url: form.value.url,
      icon: form.value.platform,
      choir_group_id:
        form.value.choir_group_id === "global"
          ? null
          : form.value.choir_group_id,
    };

    if (editingId.value) {
      await updateSocialMedia(editingId.value, dataToSave);
      toast.success("Sociální síť byla úspěšně upravena");
    } else {
      await addSocialMedia(dataToSave);
      toast.success("Sociální síť byla úspěšně přidána");
    }
    cancelEdit();
  } catch (error: any) {
    toast.error(`Chyba při ukládání: ${error?.message || "Neznámá chyba"}`);
  }
};

const editItem = (item: any) => {
  form.value = {
    platform: item.platform,
    url: item.url,
    choir_group_id: item.choir_group_id || "global",
  };
  editingId.value = item.id;
  isAdding.value = false;
};

const deleteItem = (item: any) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;

  try {
    await deleteSocialMedia(itemToDelete.value.id);
    toast.success("Sociální síť byla úspěšně smazána");
    showDeleteModal.value = false;
    itemToDelete.value = null;
  } catch (error: any) {
    toast.error(`Chyba při mazání: ${error?.message || "Neznámá chyba"}`);
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

// Načteme data při mounted
onMounted(async () => {
  await Promise.all([fetchSocialMedia(), fetchGroups()]);
});
</script>