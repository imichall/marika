<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa galerie</h1>
      <div class="flex gap-4">
        <button
          @click="handleClearCache"
          class="inline-flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Obnovit
        </button>
        <button
          @click="zobrazitModalNahraniFotek = true"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
          :disabled="nacitani"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Nahrát fotografie
        </button>
      </div>
    </div>

    <div v-if="nacitani" class="text-center py-8">
      <p>Načítání...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p>{{ error }}</p>
    </div>

    <!-- Grid galerie -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-12"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="relative group aspect-square"
        draggable="true"
        @dragstart="onDragStart(index + 1, image.id, $event)"
      >
        <div class="relative overflow-hidden rounded-lg h-full cursor-move">
          <img
            :src="image.image_url"
            :alt="image.title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(index)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <div class="absolute top-2 right-2 flex gap-2">
              <button
                @click.stop="handleDelete(image)"
                class="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                title="Smazat fotografii"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stránkování -->
    <div v-if="totalPages > 1" class="flex justify-center mb-12 gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="handlePageChange(page)"
        class="px-4 py-2 rounded-lg transition-colors duration-200"
        :class="{
          'bg-red-500 text-white': currentPage === page,
          'bg-gray-200 hover:bg-gray-300': currentPage !== page,
        }"
      >
        {{ page }}
      </button>
    </div>

    <!-- Grid Layout Visualization -->
    <div class="container mx-auto px-4 mt-8 mb-12">
      <h2 class="text-xl font-semibold mb-4">Rozložení fotografií na webu</h2>
      <div
        class="grid grid-cols-7 grid-rows-3 gap-2 aspect-[7/3] bg-gray-50 p-4 rounded-xl"
      >
        <!-- Velký obrázek vlevo nahoře -->
        <div
          class="col-span-2 row-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(1, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >1</span
          >
          <div
            v-if="layoutImages[0]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(1, layoutImages[0].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[0].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 1"
            />
            <button
              @click="removeFromLayout(1)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">2×2</span>
        </div>

        <!-- Široký obrázek nahoře uprostřed -->
        <div
          class="col-span-2 row-span-1 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(2, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >2</span
          >
          <div
            v-if="layoutImages[1]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(2, layoutImages[1].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[1].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 2"
            />
            <button
              @click="removeFromLayout(2)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">2×1</span>
        </div>

        <!-- Velký obrázek vpravo nahoře -->
        <div
          class="col-span-2 row-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(3, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >3</span
          >
          <div
            v-if="layoutImages[2]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(3, layoutImages[2].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[2].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 3"
            />
            <button
              @click="removeFromLayout(3)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">2×2</span>
        </div>

        <!-- Úzký vysoký obrázek vpravo -->
        <div
          class="col-span-1 row-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(4, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >4</span
          >
          <div
            v-if="layoutImages[3]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(4, layoutImages[3].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[3].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 4"
            />
            <button
              @click="removeFromLayout(4)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">1×2</span>
        </div>

        <!-- Malý čtvercový obrázek -->
        <div
          class="border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(5, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >5</span
          >
          <div
            v-if="layoutImages[4]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(5, layoutImages[4].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[4].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 5"
            />
            <button
              @click="removeFromLayout(5)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">1×1</span>
        </div>

        <!-- Úzký vysoký obrázek -->
        <div
          class="row-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(6, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >6</span
          >
          <div
            v-if="layoutImages[5]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(6, layoutImages[5].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[5].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 6"
            />
            <button
              @click="removeFromLayout(6)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">1×2</span>
        </div>

        <!-- Široký obrázek dole -->
        <div
          class="col-span-3 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(7, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >7</span
          >
          <div
            v-if="layoutImages[6]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(7, layoutImages[6].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[6].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 7"
            />
            <button
              @click="removeFromLayout(7)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">3×1</span>
        </div>

        <!-- Široký obrázek dole -->
        <div
          class="col-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(8, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >8</span
          >
          <div
            v-if="layoutImages[7]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(8, layoutImages[7].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[7].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 8"
            />
            <button
              @click="removeFromLayout(8)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">2×1</span>
        </div>

        <!-- Malý čtvercový obrázek dole -->
        <div
          class="border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative group"
          @dragover.prevent
          @drop="onDrop(9, $event)"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >9</span
          >
          <div
            v-if="layoutImages[8]?.id"
            class="absolute inset-0 p-2"
            draggable="true"
            @dragstart="onDragStart(9, layoutImages[8].id, $event)"
          >
            <img
              :src="getImageById(layoutImages[8].id)?.image_url"
              class="w-full h-full object-cover rounded-lg"
              alt="Pozice 9"
            />
            <button
              @click="removeFromLayout(9)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Odebrat z náčrtu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <span v-else class="text-gray-500">1×1</span>
        </div>
      </div>
      <p class="text-sm text-gray-500 mt-2">
        Toto schéma zobrazuje rozložení fotografií na webu. Čísla představují
        poměr velikostí (šířka×výška).
      </p>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-8">
      <h2 class="text-2xl font-bold col-span-2">Náčrt rozložení</h2>
      <div class="flex justify-end">
        <button
          @click="saveLayout"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          :class="{ 'opacity-50 cursor-not-allowed': !hasUnsavedChanges }"
          :disabled="!hasUnsavedChanges"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-2v5.586l-1.293-1.293z"
            />
          </svg>
          Uložit rozložení
        </button>
      </div>
    </div>

    <!-- Modal pro nahrávání -->
    <TransitionRoot appear :show="zobrazitModalNahraniFotek" as="template">
      <Dialog as="div" @close="closeUploadModal" class="relative z-50">
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
              <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-2xl">
                <DialogTitle as="h2" class="text-xl font-bold mb-4">
                  Nahrát fotografie
                </DialogTitle>

                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-500 transition-colors duration-200"
                  :class="{ 'border-red-500': isDragging }"
                  @dragenter.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                >
                  <div v-if="!selectedFiles.length" class="py-8">
                    <span
                      class="material-icons-outlined text-4xl text-gray-400 mb-2"
                    >
                      Nahrát obrázek
                    </span>
                    <p class="text-gray-500">
                      Přetáhněte sem fotografie nebo
                      <label
                        class="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        vyberte ze zařízení
                        <input
                          type="file"
                          class="hidden"
                          accept="image/*"
                          multiple
                          @change="handleFileSelect"
                        />
                      </label>
                    </p>
                    <p class="text-sm text-gray-400 mt-1">
                      Podporované formáty: JPG, PNG, WebP
                    </p>
                  </div>

                  <div v-else class="grid grid-cols-3 gap-4 mt-4">
                    <div
                      v-for="(file, index) in selectedFiles"
                      :key="index"
                      class="relative"
                    >
                      <img
                        :src="previewUrls[index]"
                        :alt="file.name"
                        class="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        @click="removeFile(index)"
                        class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                        title="Odstranit"
                      >
                        <span class="material-icons-outlined text-sm"
                          >close</span
                        >
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    @click="closeUploadModal"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="uploadFiles"
                    :disabled="!selectedFiles.length || uploading"
                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="uploading">Nahrávání...</span>
                    <span v-else
                      >Nahrát {{ selectedFiles.length }} fotografií</span
                    >
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Potvrzovací dialog pro smazání -->
    <TransitionRoot appear :show="showDeleteModal" as="template">
      <Dialog as="div" @close="showDeleteModal = false" class="relative z-50">
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
              <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-md">
                <DialogTitle as="h2" class="text-xl font-bold mb-4">
                  Smazat fotografii
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tuto fotografii?
                </p>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="showDeleteModal = false"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="confirmDelete"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
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

    <!-- Lightbox -->
    <TransitionRoot appear :show="showLightbox" as="template">
      <Dialog as="div" @close="closeLightbox" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/90" aria-hidden="true" />
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
              <DialogPanel class="relative w-full max-w-5xl">
                <button
                  @click="closeLightbox"
                  class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <span class="material-icons-outlined text-3xl">close</span>
                </button>

                <button
                  @click="previousImage"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <span class="material-icons-outlined text-4xl"
                    >chevron_left</span
                  >
                </button>

                <button
                  @click="nextImage"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <span class="material-icons-outlined text-4xl"
                    >chevron_right</span
                  >
                </button>

                <img
                  :src="images[currentImageIndex]?.image_url"
                  :alt="`Gallery image ${currentImageIndex + 1}`"
                  class="w-full h-auto max-h-[80vh] object-contain mx-auto"
                />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "#imports";
import { useGallery } from "~/composables/useGallery";
import type { GalleryImage } from "~/composables/useGallery";
import { useToast } from "~/composables/useToast";
import draggable from "vuedraggable";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { useSupabaseClient } from "#imports";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

interface LayoutImage {
  id: number | null;
  position: number;
}

interface DragEndEvent {
  dataTransfer: DataTransfer;
  target: HTMLElement;
}

const {
  images,
  loading: nacitani,
  error,
  currentPage,
  totalPages,
  fetchImages,
  deleteImage,
  clearCache,
  changePage,
  fetchAllVisibleImages,
  allImages,
} = useGallery();
const { success, error: showError } = useToast();

const supabase = useSupabaseClient();

const zobrazitModalNahraniFotek = ref(false);
const showDeleteModal = ref(false);
const showLightbox = ref(false);
const isDragging = ref(false);
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const uploading = ref(false);
const imageToDelete = ref<string | null>(null);
const currentImageIndex = ref(0);
const selectedImageIndex = ref<number | null>(null);

const layoutImages = ref<LayoutImage[]>([
  { id: null, position: 1 },
  { id: null, position: 2 },
  { id: null, position: 3 },
  { id: null, position: 4 },
  { id: null, position: 5 },
  { id: null, position: 6 },
  { id: null, position: 7 },
  { id: null, position: 8 },
  { id: null, position: 9 },
]);

const hasUnsavedChanges = ref(false);

// Funkce pro získání obrázku podle ID
const getImageById = (id: number | null) => {
  if (!id) return null;
  return allImages.value.find((img) => img.id === id);
};

onMounted(async () => {
  // Načteme všechny obrázky do allImages
  const { data } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (data) {
    allImages.value = data;
  }

  // Načteme první stránku galerie
  await fetchImages();
  await loadLayout();
});

const handleDelete = async (image: any) => {
  if (!confirm("Opravdu chcete smazat tuto fotografii?")) return;

  const imageUrl = image.image_url;
  const filename = imageUrl.split("/").pop();

  const { success: deleteSuccess, error: deleteError } = await deleteImage(
    filename
  );

  if (deleteSuccess) {
    success("Fotografie byla úspěšně smazána");
  } else {
    showError(deleteError || "Nepodařilo se smazat fotografii");
  }
};

const openLightbox = (index: number) => {
  selectedImageIndex.value = index;
};

const closeLightbox = () => {
  selectedImageIndex.value = null;
};

const handleUploadSuccess = () => {
  zobrazitModalNahraniFotek.value = false;
  fetchImages();
  success("Fotografie byly úspěšně nahrány");
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    processFiles(Array.from(input.files));
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    processFiles(files);
  }
};

const processFiles = (files: File[]) => {
  selectedFiles.value = files;
  previewUrls.value = files.map((file) => URL.createObjectURL(file));
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  URL.revokeObjectURL(previewUrls.value[index]);
  previewUrls.value.splice(index, 1);
};

const uploadFiles = async () => {
  try {
    uploading.value = true;
    const formData = new FormData();

    selectedFiles.value.forEach((file: File, index: number) => {
      const timestamp = Date.now();
      const fileName = `mansory-${String(index + 1).padStart(
        5,
        "0"
      )}.${file.name.split(".").pop()}`;
      formData.append("images", file, fileName);
    });

    const response = await fetch("/api/gallery/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Nahrávání selhalo");

    await fetchImages();
    closeUploadModal();
    success("Fotografie byly úspěšně nahrány");
  } catch (error: unknown) {
    console.error("Error uploading files:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Neznámá chyba";
    showError("Chyba při nahrávání: " + errorMessage);
  } finally {
    uploading.value = false;
  }
};

const closeUploadModal = () => {
  zobrazitModalNahraniFotek.value = false;
  selectedFiles.value = [];
  previewUrls.value = [];
  isDragging.value = false;
};

const confirmDelete = async () => {
  try {
    const response = await fetch(`/api/gallery/${imageToDelete.value}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Mazání selhalo");

    await fetchImages();
    showDeleteModal.value = false;
    imageToDelete.value = null;
    success("Fotografie byla úspěšně smazána");
  } catch (error: unknown) {
    console.error("Error deleting image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Neznámá chyba";
    showError("Chyba při mazání: " + errorMessage);
  }
};

const previousImage = () => {
  currentImageIndex.value =
    (currentImageIndex.value - 1 + images.value.length) % images.value.length;
};

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length;
};

const handleClearCache = async () => {
  clearCache();
  await fetchImages();
  success("Cache byla vymazána");
};

const onDragStart = (position: number, id: number | null, event: DragEvent) => {
  if (!event.dataTransfer) return;

  if (id) {
    event.dataTransfer.setData("imageId", String(id));
    event.dataTransfer.setData("sourceType", "gallery");
  }
};

const onDrop = async (position: number, event: DragEvent) => {
  event.preventDefault();

  // Získáme data z přenosu
  const imageId = Number(event.dataTransfer?.getData("imageId"));
  const sourceType = event.dataTransfer?.getData("sourceType");
  const sourcePosition = event.dataTransfer?.getData("sourcePosition");

  if (!imageId) return;

  // Vytvoříme kopii layoutu
  const newLayout = [...layoutImages.value];

  if (sourceType === "layout" && sourcePosition) {
    // Přesouvání mezi pozicemi v layoutu
    const sourceIndex = parseInt(sourcePosition) - 1;
    const targetIndex = position - 1;

    // Prohodíme ID obrázků
    const tempId = newLayout[sourceIndex].id;
    newLayout[sourceIndex].id = newLayout[targetIndex].id;
    newLayout[targetIndex].id = tempId;
  } else {
    // Přetažení nového obrázku z galerie
    newLayout[position - 1].id = imageId;
  }

  layoutImages.value = newLayout;
  hasUnsavedChanges.value = true;
};

const removeFromLayout = async (position: number) => {
  const index = position - 1;
  if (index >= 0 && index < layoutImages.value.length) {
    // Nastavíme ID na null pro danou pozici
    layoutImages.value[index] = {
      ...layoutImages.value[index],
      id: null,
    };

    // Uložíme změny do databáze
    await saveLayout();
  }
};

const loadLayout = async () => {
  try {
    // Nejdřív načteme všechny obrázky
    const { data: layoutData, error: err } = await supabase
      .from("gallery_layout")
      .select("*")
      .order("position", { ascending: true });

    if (err) throw err;

    // Načteme všechny obrázky z galerie
    const { data: allImagesData, error: imagesErr } = await supabase
      .from("gallery")
      .select("*");

    if (imagesErr) throw imagesErr;

    // Uložíme všechny obrázky do ref
    allImages.value = allImagesData.map((item: any) => ({
      id: Number(item.id),
      image_url: String(item.image_url),
      title: String(item.title),
      is_visible: Boolean(item.is_visible),
      created_at: String(item.created_at),
      position: item.position ? Number(item.position) : null,
    }));

    if (layoutData) {
      // Aktualizujeme layout podle dat z databáze
      layoutData.forEach((item: any) => {
        const index = layoutImages.value.findIndex(
          (img) => img.position === item.position
        );
        if (index !== -1) {
          layoutImages.value[index].id = item.image_id;
        }
      });
    }
  } catch (err) {
    console.error("Error loading layout:", err);
    showError("Chyba při načítání rozložení");
  }
};

const saveLayout = async () => {
  try {
    // Nejdřív smažeme všechny existující záznamy
    const { error: deleteError } = await supabase
      .from("gallery_layout")
      .delete()
      .neq("position", 0); // Smažeme všechny pozice

    if (deleteError) throw deleteError;

    // Připravíme data pro uložení
    const layoutData = layoutImages.value
      .filter((img) => img.id !== null)
      .map((img) => ({
        image_id: img.id,
        position: img.position,
      }));

    // Uložíme nové rozložení
    const { error: insertError } = await supabase
      .from("gallery_layout")
      .insert(layoutData);

    if (insertError) throw insertError;

    hasUnsavedChanges.value = false;
    success("Rozložení bylo úspěšně uloženo");
  } catch (err) {
    console.error("Error saving layout:", err);
    showError("Chyba při ukládání rozložení");
  }
};

// Upravíme funkci changePage tak, aby neovlivňovala allImages
const handlePageChange = async (page: number) => {
  if (page === currentPage.value) return;
  currentPage.value = page;
  await fetchImages();
};
</script>

<style scoped>
.grid {
  @apply transition-all duration-300 ease-in-out;
}

.grid > div {
  @apply transition-transform duration-300 hover:z-10;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

[draggable="true"] {
  cursor: move;
}

.layout-spot {
  @apply transition-all duration-300;
}

.layout-spot.dragover {
  @apply border-red-500 bg-red-50;
}

/* Styly pro náčrt layoutu */
[class*="col-span-"],
[class*="row-span-"] {
  @apply relative;
}

[class*="col-span-"] button,
[class*="row-span-"] button {
  @apply opacity-100;
}

[class*="col-span-"]:hover,
[class*="row-span-"]:hover {
  @apply bg-gray-50;
}

/* Styly pro tlačítko odebrání */
[class*="col-span-"] button:hover,
[class*="row-span-"] button:hover {
  @apply bg-red-600;
}
</style>