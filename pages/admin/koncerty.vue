<template>
  <div class="container mx-auto px-4 mt-[100px] mb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <!-- Collapsible Add/Edit Concert Section -->
    <div
      v-if="permissions.create"
      class="mb-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <div
        class="p-4 bg-gradient-to-r from-rose-50 to-red-100 hover:from-rose-100 hover:to-red-200 cursor-pointer flex justify-between items-center group transition-all duration-300 border-b border-red-100"
        @click="isFormVisible ? resetForm() : (isFormVisible = true)"
      >
        <h2 class="text-xl font-bold text-red-800 flex items-center gap-3">
          <span class="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span
              class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"
            ></span>
          </span>
          {{ editingConcert ? "Upravit koncert" : "Přidat nový koncert" }}
        </h2>
        <div class="flex items-center gap-2">
          <span
            class="text-sm text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {{ isFormVisible ? "Zrušit" : "Otevřít" }}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-red-700 transform transition-transform duration-300"
            :class="{ 'rotate-180': isFormVisible }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <div v-show="isFormVisible" class="p-6 space-y-8">
        <form @submit.prevent="handleSubmit">
          <!-- Základní informace -->
          <div class="mb-8">
            <h3
              class="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Základní informace
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-gray-700 text-sm font-medium mb-2">
                  Název koncertu
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-shadow duration-200 shadow-sm hover:shadow-md"
                  placeholder="Zadejte název koncertu"
                />
              </div>

              <!-- Výběr tělesa - Radio buttons -->
              <div class="col-span-2">
                <label class="block text-gray-700 text-sm font-medium mb-4">
                  Těleso
                </label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label class="relative flex cursor-pointer">
                    <input
                      type="radio"
                      v-model="form.group_name"
                      value="Marika Singers"
                      class="peer sr-only"
                      required
                    />
                    <div
                      class="w-full p-4 bg-white border rounded-lg peer-checked:border-red-500 peer-checked:ring-2 peer-checked:ring-red-500 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h4 class="font-medium text-gray-800">
                            Marika Singers
                          </h4>
                          <p class="text-sm text-gray-500">Hlavní sbor</p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-6 w-6 text-red-500 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </label>

                  <label class="relative flex cursor-pointer">
                    <input
                      type="radio"
                      v-model="form.group_name"
                      value="Five"
                      class="peer sr-only"
                      required
                    />
                    <div
                      class="w-full p-4 bg-white border rounded-lg peer-checked:border-red-500 peer-checked:ring-2 peer-checked:ring-red-500 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h4 class="font-medium text-gray-800">Five</h4>
                          <p class="text-sm text-gray-500">Vokální skupina</p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-6 w-6 text-red-500 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </label>

                  <label class="relative flex cursor-pointer">
                    <input
                      type="radio"
                      v-model="form.group_name"
                      value="Voices"
                      class="peer sr-only"
                      required
                    />
                    <div
                      class="w-full p-4 bg-white border rounded-lg peer-checked:border-red-500 peer-checked:ring-2 peer-checked:ring-red-500 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h4 class="font-medium text-gray-800">Voices</h4>
                          <p class="text-sm text-gray-500">Komorní sbor</p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-6 w-6 text-red-500 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">
                  Datum
                </label>
                <input
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-shadow duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">
                  Čas
                </label>
                <input
                  v-model="form.time"
                  type="time"
                  required
                  class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-shadow duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">
                  Typ vstupného
                </label>
                <div class="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    v-model="form.is_voluntary"
                    class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span class="text-gray-700">Dobrovolné vstupné</span>
                </div>
                <div class="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    v-model="form.has_presale"
                    class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span class="text-gray-700">Předprodej</span>
                </div>
                <div v-if="form.has_presale" class="mt-2">
                  <input
                    v-model="form.presale_text"
                    type="text"
                    class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-shadow duration-200 shadow-sm hover:shadow-md"
                    placeholder="Předprodej bude zahájen..."
                  />
                </div>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">
                  Cena vstupného
                </label>
                <div
                  class="relative"
                  :class="{ 'opacity-50': form.is_voluntary }"
                >
                  <input
                    v-model="form.price"
                    type="number"
                    :required="!form.is_voluntary"
                    :disabled="form.is_voluntary"
                    class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-shadow duration-200 shadow-sm hover:shadow-md pl-10"
                    placeholder="0"
                  />
                  <span
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >Kč
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">
                  Přiřadit vstupenku
                </label>
                <div class="relative">
                  <select
                    v-model="form.ticket_id"
                    class="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-shadow duration-200 shadow-sm hover:shadow-md appearance-none"
                  >
                    <option :value="''">
                      Bez vstupenky (použít QR platbu)
                    </option>
                    <option
                      v-for="ticket in concertTickets"
                      :key="ticket.id"
                      :value="ticket.id.toString()"
                    >
                      {{ ticket.title }} ({{ ticket.provider }})
                    </option>
                  </select>
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                  </div>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="col-span-2">
                <label class="block text-gray-700 text-sm font-medium mb-2">
                  Anotace koncertu
                  <span class="text-gray-500 text-xs ml-1">
                    (Zbývá {{ 150 - (form.description?.length || 0) }} znaků)
                  </span>
                </label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  :maxlength="150"
                  class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-shadow duration-200 shadow-sm hover:shadow-md"
                  placeholder="Krátká anotace koncertu pro přehled..."
                  required
                ></textarea>
                <p
                  class="mt-1 text-sm"
                  :class="{
                    'text-gray-500':
                      (form.description?.length || 0) <= 150 * 0.8,
                    'text-orange-500':
                      (form.description?.length || 0) > 150 * 0.8 &&
                      (form.description?.length || 0) <= 150,
                    'text-red-500': (form.description?.length || 0) > 150,
                  }"
                >
                  {{ form.description?.length || 0 }}/150 znaků
                </p>
              </div>

              <div class="col-span-2">
                <label class="block text-gray-700 text-sm font-medium mb-2">
                  Detailní popis koncertu
                </label>
                <div class="mb-2 flex gap-2">
                  <button
                    type="button"
                    @click="insertLink"
                    class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1 transition-colors"
                  >
                    <span class="material-icons-outlined text-base">link</span>
                    Vložit odkaz
                  </button>
                </div>
                <textarea
                  ref="textareaRef"
                  v-model="form.detailed_description"
                  rows="6"
                  class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-shadow duration-200 shadow-sm hover:shadow-md"
                  placeholder="Podrobný popis koncertu..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- QR Platba -->
          <div
            v-if="showQRSection"
            class="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200"
          >
            <h3
              class="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              QR Platba
            </h3>
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <QRCodeGenerator
                :concert-title="form.title"
                v-model:price="form.price"
                :selected-group="form.group_name"
                v-model="form.variable_symbol"
                v-model:account-number="form.account_number"
                v-model:bank-code="form.bank_code"
              />
            </div>
          </div>

          <!-- Média -->
          <div class="mb-8">
            <h3
              class="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-red-600"
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
              Média
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Obrázek koncertu -->
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <label class="block text-gray-700 text-sm font-medium mb-4">
                  Obrázek koncertu
                </label>
                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors duration-200 bg-gray-50 group"
                  :class="{ 'border-red-500 bg-red-50': isDragging }"
                  @dragenter.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                >
                  <div
                    v-if="!form.image && !imagePreview && !isUploading"
                    class="py-8"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="mx-auto h-12 w-12 text-gray-400 group-hover:text-red-500 transition-colors duration-200"
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
                    <p class="mt-4 text-gray-500">
                      Přetáhněte sem obrázek nebo
                      <label
                        class="text-red-500 hover:text-red-600 cursor-pointer font-medium"
                      >
                        vyberte ze zařízení
                        <input
                          type="file"
                          class="hidden"
                          accept="image/*"
                          @change="handleFileSelect"
                        />
                      </label>
                    </p>
                    <p class="text-sm text-gray-400 mt-2">
                      Podporované formáty: JPG, PNG, WebP
                    </p>
                  </div>
                  <div
                    v-else-if="isUploading"
                    class="relative h-64 flex items-center justify-center bg-gray-50 rounded-lg"
                  >
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <div class="w-32 h-32">
                        <svg
                          class="animate-spin h-full w-full text-red-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div class="absolute inset-x-4 bottom-4 space-y-3">
                      <div
                        class="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden"
                      >
                        <div
                          class="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 relative"
                          :style="{ width: uploadProgress + '%' }"
                        >
                          <div
                            class="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"
                          ></div>
                        </div>
                      </div>
                      <div
                        class="flex justify-between text-sm font-medium text-gray-600"
                      >
                        <span>Nahrávání...</span>
                        <span>{{ uploadProgress }}%</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="relative">
                    <div class="mb-4">
                      <label
                        class="block text-gray-700 text-sm font-medium mb-2"
                      >
                        Náhled a pozice obrázku
                      </label>
                      <div
                        class="relative w-full aspect-[4/3] overflow-hidden rounded-lg border-2 border-gray-200"
                      >
                        <div
                          class="absolute inset-0 cursor-move"
                          @mousedown="startImageDrag"
                          @mousemove="handleImageDrag"
                          @mouseup="stopImageDrag"
                          @mouseleave="stopImageDrag"
                        >
                          <img
                            ref="previewImage"
                            :src="imagePreview"
                            alt="Náhled obrázku"
                            class="absolute w-[150%] max-w-none"
                            :style="{
                              top: `${imagePosition.y}%`,
                              left: `${imagePosition.x}%`,
                            }"
                          />
                        </div>
                      </div>
                      <p class="mt-2 text-sm text-gray-500">
                        Klikněte a táhněte pro nastavení pozice obrázku v
                        náhledu
                      </p>
                    </div>
                    <button
                      @click.prevent="removeImage"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg transform hover:scale-110"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Plakát koncertu -->
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <label class="block text-gray-700 text-sm font-medium mb-4">
                  Plakát koncertu
                </label>
                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors duration-200 bg-gray-50 group"
                  :class="{ 'border-red-500 bg-red-50': isPosterDragging }"
                  @dragenter.prevent="isPosterDragging = true"
                  @dragleave.prevent="isPosterDragging = false"
                  @dragover.prevent
                  @drop.prevent="handlePosterDrop"
                >
                  <div
                    v-if="!form.poster && !posterPreview && !isPosterUploading"
                    class="py-8"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="mx-auto h-12 w-12 text-gray-400 group-hover:text-red-500 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p class="mt-4 text-gray-500">
                      Přetáhněte sem plakát nebo
                      <label
                        class="text-red-500 hover:text-red-600 cursor-pointer font-medium"
                      >
                        vyberte ze zařízení
                        <input
                          type="file"
                          class="hidden"
                          accept="image/*,application/pdf"
                          @change="handlePosterSelect"
                        />
                      </label>
                    </p>
                    <p class="text-sm text-gray-400 mt-2">
                      Podporované formáty: JPG, PNG, WebP, PDF
                    </p>
                  </div>
                  <div
                    v-else-if="isPosterUploading"
                    class="relative h-64 flex items-center justify-center bg-gray-50 rounded-lg"
                  >
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <div class="w-32 h-32">
                        <svg
                          class="animate-spin h-full w-full text-red-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div class="absolute inset-x-4 bottom-4 space-y-3">
                      <div
                        class="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden"
                      >
                        <div
                          class="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 relative"
                          :style="{ width: posterUploadProgress + '%' }"
                        >
                          <div
                            class="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"
                          ></div>
                        </div>
                      </div>
                      <div
                        class="flex justify-between text-sm font-medium text-gray-600"
                      >
                        <span>Nahrávání plakátu...</span>
                        <span>{{ posterUploadProgress }}%</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="relative">
                    <img
                      v-if="posterPreview && !posterPreview.endsWith('.pdf')"
                      :src="posterPreview"
                      alt="Náhled plakátu"
                      class="max-h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <object
                      v-else-if="
                        posterPreview && posterPreview.endsWith('.pdf')
                      "
                      :data="posterPreview"
                      type="application/pdf"
                      class="max-h-48 mx-auto rounded-lg shadow-sm"
                    >
                      <img
                        src="/images/pdf-placeholder.svg"
                        alt="PDF plakát"
                        class="max-h-48 mx-auto rounded-lg shadow-sm"
                      />
                    </object>
                    <button
                      @click.prevent="removePoster"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg transform hover:scale-110"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Akce -->
          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <span class="flex items-center gap-2">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Zrušit
              </span>
            </button>
            <button
              type="submit"
              class="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span class="flex items-center gap-2">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {{ editingConcert ? "Uložit změny" : "Přidat koncert" }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="flex justify-between items-center mb-8">
      <h1
        class="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"
      >
        Správa koncertů
      </h1>
      <div class="flex gap-4">
        <button
          v-if="permissions.create"
          @click="isFormVisible ? resetForm() : (isFormVisible = true)"
          class="group relative px-6 py-3 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
          :disabled="loading"
        >
          <div
            class="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          ></div>
          <span class="relative flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200"
              :class="{ 'rotate-45': isFormVisible }"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            {{
              isFormVisible
                ? editingConcert
                  ? "Zrušit úpravy"
                  : "Zrušit přidání"
                : "Přidat koncert"
            }}
          </span>
        </button>
      </div>
    </div>

    <!-- Filtry a vyhledávání -->
    <div class="mb-8 space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Vyhledávání -->
        <div class="flex-1">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Vyhledat koncert..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
          />
        </div>

        <!-- Filtr podle tělesa -->
        <div class="md:w-48">
          <select
            v-model="selectedGroup"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
          >
            <option value="">Všechna tělesa</option>
            <option value="Marika Singers">Marika Singers</option>
            <option value="Five">Five</option>
            <option value="Voices">Voices</option>
          </select>
        </div>

        <!-- Filtr podle vstupenek -->
        <div class="md:w-48">
          <select
            v-model="ticketFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
          >
            <option value="">Všechny koncerty</option>
            <option value="withTickets">S online vstupenkami</option>
            <option value="withoutTickets">Bez online vstupenek</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm mb-6"
    >
      <p class="flex items-center gap-2">
        <span class="material-icons-outlined">error_outline</span>
        {{ error }}
      </p>
    </div>

    <!-- Tabulka koncertů -->
    <div
      v-else
      class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                @click="toggleSort('title')"
              >
                <div class="flex items-center gap-2">
                  Název
                  <span class="flex flex-col">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3 -mb-1"
                      :class="{
                        'text-red-600': sortBy === 'title' && !sortDesc,
                      }"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                @click="toggleSort('date')"
              >
                <div class="flex items-center gap-2">
                  Datum
                  <span class="flex flex-col">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3 -mb-1"
                      :class="{
                        'text-red-600': sortBy === 'date' && !sortDesc,
                      }"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                @click="toggleSort('time')"
              >
                <div class="flex items-center gap-2">
                  Čas
                  <span class="flex flex-col">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3 -mb-1"
                      :class="{
                        'text-red-600': sortBy === 'time' && !sortDesc,
                      }"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                @click="toggleSort('group_name')"
              >
                <div class="flex items-center gap-2">
                  Těleso
                  <span class="flex flex-col">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3 -mb-1"
                      :class="{
                        'text-red-600': sortBy === 'group_name' && !sortDesc,
                      }"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                @click="toggleSort('price')"
              >
                <div class="flex items-center gap-2">
                  Vstupné
                  <span class="flex flex-col">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3 -mb-1"
                      :class="{
                        'text-red-600': sortBy === 'price' && !sortDesc,
                      }"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Akce</div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="concert in activeFilteredConcerts"
              :key="concert.id"
              class="hover:bg-gray-50 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ concert.title }}
                      <span
                        v-if="concert.ticket_id"
                        class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-3 h-3 mr-1"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
                          />
                        </svg>
                        Vstupenky
                      </span>
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatDate(concert.date) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{
                    new Date(concert.date).toLocaleDateString("cs-CZ", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ concert.time }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-full"
                >
                  {{ concert.group_name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 text-sm font-medium bg-green-50 text-green-600 rounded-full"
                >
                  {{ concert.price }} Kč
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1"
              >
                <button
                  v-if="permissions.edit"
                  @click="editConcert(concert)"
                  class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Upravit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
                <button
                  v-if="permissions.edit"
                  @click="archiveConcert(concert)"
                  class="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                  title="Archivovat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                  </svg>
                </button>
                <button
                  v-if="permissions.delete"
                  @click="handleDelete(concert.id)"
                  class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Smazat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="concerts.length === 0">
              <td colspan="5" class="px-6 py-12 text-center">
                <div
                  class="flex flex-col items-center justify-center text-gray-500"
                >
                  <span class="material-icons-outlined text-4xl mb-2"
                    >event_busy</span
                  >
                  <p class="text-lg">Zatím nejsou přidány žádné koncerty</p>
                  <button
                    v-if="permissions.create"
                    @click="
                      isFormVisible ? resetForm() : (isFormVisible = true)
                    "
                    class="group relative mt-4 px-6 py-3 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                  >
                    <div
                      class="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    ></div>
                    <span class="relative flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200"
                        :class="{ 'rotate-45': isFormVisible }"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      {{ isFormVisible ? "Zrušit" : "Přidat první koncert" }}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Zobrazeno {{ paginationStart + 1 }} - {{ paginationEnd }} z
            {{ totalFilteredConcerts }} koncertů
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Předchozí
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-4 py-2 text-sm rounded-lg border transition-colors duration-200',
                  currentPage === page
                    ? 'bg-red-800 text-white border-red-800'
                    : 'border-gray-300 hover:bg-gray-50',
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Další
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Po existující tabulce koncertů přidáme tabulku vstupenek -->
    <div class="mt-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Odkazy na vstupenky</h2>
        <button
          v-if="permissions.create"
          @click="showTicketModal = true"
          class="group relative px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          ></div>
          <span class="relative flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Přidat odkaz na vstupenky
          </span>
        </button>
      </div>
      <div
        class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">
                    Název koncertu
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">Těleso</div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">
                    Poskytovatel
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">Odkaz</div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">
                    Přiřazené koncerty
                  </div>
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Akce
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="ticket in paginatedTickets"
                :key="ticket.id"
                class="hover:bg-gray-50 transition-colors duration-200"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ ticket.title }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-full"
                  >
                    {{ getGroupName(ticket.group_id) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full"
                  >
                    {{ ticket.provider }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <a
                    :href="ticket.ticket_url"
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Odkaz na vstupenky
                  </a>
                </td>
                <td class="px-6 py-4">
                  <div
                    v-if="
                      ticket.assigned_concerts &&
                      ticket.assigned_concerts.length > 0
                    "
                    class="space-y-1"
                  >
                    <div
                      v-for="concert in ticket.assigned_concerts"
                      :key="concert.id"
                      class="text-sm"
                    >
                      <span class="font-medium">{{ concert.title }}</span>
                      <span class="text-gray-500 ml-2"
                        >({{ formatDate(concert.date) }})</span
                      >
                    </div>
                  </div>
                  <span v-else class="text-gray-500 text-sm"
                    >Žádné přiřazené koncerty</span
                  >
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex justify-end gap-2">
                    <button
                      @click="editTicket(ticket)"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      v-if="permissions.delete"
                      @click="handleDeleteTicket(ticket)"
                      class="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="concertTickets.length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div
                    class="flex flex-col items-center justify-center text-gray-500"
                  >
                    <div class="relative w-24 h-24 mb-4">
                      <!-- Animované noty -->
                      <span
                        class="absolute animate-float-slow text-3xl"
                        style="left: 0; animation-delay: 0s"
                        >♪</span
                      >
                      <span
                        class="absolute animate-float-slow text-4xl"
                        style="left: 40%; top: 20%; animation-delay: 0.5s"
                        >♫</span
                      >
                      <span
                        class="absolute animate-float-slow text-3xl"
                        style="right: 0; top: 10%; animation-delay: 1s"
                        >♪</span
                      >
                      <span
                        class="absolute animate-float-slow text-4xl"
                        style="left: 20%; bottom: 0; animation-delay: 1.5s"
                        >♫</span
                      >
                    </div>
                    <p class="text-lg">
                      Zatím nejsou přidány žádné odkazy na vstupenky
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination pro vstupenky -->
        <div
          class="bg-gray-50 px-6 py-4 mt-4 rounded-lg border border-gray-200"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Zobrazeno {{ ticketPaginationStart + 1 }} -
              {{ ticketPaginationEnd }} z {{ concertTickets.length }} vstupenek
            </div>
            <div class="flex gap-2">
              <button
                @click="ticketCurrentPage--"
                :disabled="ticketCurrentPage === 1"
                class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Předchozí
              </button>
              <div class="flex items-center gap-1">
                <button
                  v-for="page in ticketTotalPages"
                  :key="page"
                  @click="ticketCurrentPage = page"
                  :class="[
                    'px-4 py-2 text-sm rounded-lg border transition-colors duration-200',
                    ticketCurrentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50',
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              <button
                @click="ticketCurrentPage++"
                :disabled="ticketCurrentPage === ticketTotalPages"
                class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Další
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro správu vstupenek -->
    <TransitionRoot appear :show="showTicketModal" as="template">
      <Dialog as="div" @close="closeTicketModal" class="relative z-50">
        <!-- Backdrop -->
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
            <DialogPanel
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle as="h2" class="text-xl font-bold mb-4">
                {{ editingTicket ? "Upravit" : "Přidat" }} odkaz na vstupenky
              </DialogTitle>

              <form @submit.prevent="handleTicketSubmit" class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Název koncertu
                  </label>
                  <input
                    v-model="ticketForm.title"
                    type="text"
                    required
                    placeholder="Např. Vánoční koncert 2024"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Těleso
                  </label>
                  <select
                    v-model="ticketForm.group_id"
                    required
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Vyberte těleso</option>
                    <option value="9001cdb8-80fd-4923-8aa9-8dedc9a30c77">
                      Marika Singers
                    </option>
                    <option value="af581892-2252-462f-88f2-e73218b4e785">
                      Five
                    </option>
                    <option value="ba4f5374-5d60-4354-a2ce-e83e130bba83">
                      Voices
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Poskytovatel vstupenek
                  </label>
                  <select
                    v-model="ticketForm.provider"
                    required
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Vyberte poskytovatele</option>
                    <option value="GoOut">GoOut</option>
                    <option value="Ticketmaster">Ticketmaster</option>
                    <option value="Ticketportal">Ticketportal</option>
                    <option value="Jiné">Jiné</option>
                  </select>
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Odkaz na vstupenky
                  </label>
                  <input
                    v-model="ticketForm.ticket_url"
                    type="url"
                    required
                    placeholder="https://"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div class="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    @click="closeTicketModal"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                  >
                    Uložit
                  </button>
                </div>
              </form>

              <!-- Seznam vstupenek -->
              <div class="mt-6">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Název koncertu
                          </div>
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Těleso
                          </div>
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Poskytovatel
                          </div>
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Odkaz
                          </div>
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Akce
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr
                        v-for="ticket in paginatedTickets"
                        :key="ticket.id"
                        class="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">
                            {{ ticket.title }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-full"
                          >
                            {{ getGroupName(ticket.group_id) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full"
                          >
                            {{ ticket.provider }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <a
                            :href="ticket.ticket_url"
                            target="_blank"
                            class="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Odkaz na vstupenky
                          </a>
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <div class="flex justify-end space-x-2">
                            <button
                              v-if="permissions.edit"
                              @click="editTicket(ticket)"
                              class="inline-flex items-center justify-center w-8 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-150"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-4 h-4"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
                            </button>
                            <button
                              v-if="
                                permissions.delete &&
                                (!ticket.assigned_concerts ||
                                  ticket.assigned_concerts.length === 0)
                              "
                              @click="handleDeleteTicket(ticket.id)"
                              class="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-150"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-4 h-4"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Pagination pro vstupenky -->
              <div
                class="bg-gray-50 px-6 py-4 mt-4 rounded-lg border border-gray-200"
              >
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    Zobrazeno {{ ticketPaginationStart + 1 }} -
                    {{ ticketPaginationEnd }} z
                    {{ concertTickets.length }} vstupenek
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="ticketCurrentPage--"
                      :disabled="ticketCurrentPage === 1"
                      class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Předchozí
                    </button>
                    <div class="flex items-center gap-1">
                      <button
                        v-for="page in ticketTotalPages"
                        :key="page"
                        @click="ticketCurrentPage = page"
                        :class="[
                          'px-4 py-2 text-sm rounded-lg border transition-colors duration-200',
                          ticketCurrentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50',
                        ]"
                      >
                        {{ page }}
                      </button>
                    </div>
                    <button
                      @click="ticketCurrentPage++"
                      :disabled="ticketCurrentPage === ticketTotalPages"
                      class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Další
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Potvrzovací dialog pro smazání vstupenky -->
    <TransitionRoot appear :show="showDeleteTicketModal" as="template">
      <Dialog
        as="div"
        @close="showDeleteTicketModal = false"
        class="relative z-50"
      >
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
                  Smazat odkaz na vstupenky
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tento odkaz na vstupenky? Tuto akci
                  nelze vrátit zpět.
                  <template
                    v-if="
                      ticketToDelete &&
                      ticketToDelete.assigned_concerts &&
                      ticketToDelete.assigned_concerts.length > 0
                    "
                  >
                    <br /><br />
                    <strong class="text-red-600">Upozornění:</strong> Tuto
                    vstupenku nelze smazat, protože je přiřazena ke koncertům.
                    Nejprve je potřeba odebrat vstupenku ze všech koncertů.
                    <br /><br />
                    <span class="text-sm">
                      <div class="mt-3 space-y-4">
                        <div class="text-gray-600 font-medium">
                          Přiřazené koncerty:
                        </div>
                        <div class="space-y-2">
                          <div
                            v-for="concert in ticketToDelete.assigned_concerts"
                            :key="concert.id"
                            class="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg"
                          >
                            <span
                              class="material-icons-outlined text-red-500 text-sm"
                              >event</span
                            >
                            <div>
                              <div class="font-medium text-red-700">
                                {{ concert.title }}
                              </div>
                              <div class="text-xs text-red-600">
                                {{ formatDate(concert.date) }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </span>
                  </template>
                </p>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="showDeleteTicketModal = false"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="confirmDeleteTicket"
                    :disabled="
                      ticketToDelete &&
                      ticketToDelete.assigned_concerts &&
                      ticketToDelete.assigned_concerts.length > 0
                    "
                    :class="[
                      'px-4 py-2 rounded transition-colors duration-200',
                      ticketToDelete &&
                      ticketToDelete.assigned_concerts &&
                      ticketToDelete.assigned_concerts.length > 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700',
                    ]"
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

    <!-- Potvrzovací dialog pro smazání koncertu -->
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
                  Smazat koncert
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tento koncert?
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

    <!-- Sekce archivovaných koncertů -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">
        Archivované koncerty
      </h2>
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Název
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Datum a čas
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Skupina
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cena
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Akce
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="concert in archivedConcerts"
                :key="concert.id"
                class="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                @click="showArchivePreview(concert)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ concert.title }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">
                    {{ formatDateWithTime(concert.date, concert.time) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">
                    {{ concert.group_name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">
                    {{ concert.price }} Kč
                  </div>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex justify-end space-x-2">
                    <button
                      v-if="permissions.edit"
                      @click.stop="restoreConcert(concert)"
                      class="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                      title="Obnovit"
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    <button
                      v-if="permissions.delete"
                      @click.stop="handleDelete(concert.id)"
                      class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Smazat"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Archive Preview Modal -->
    <TransitionRoot appear :show="showArchiveModal" as="template">
      <Dialog as="div" @close="showArchiveModal = false" class="relative z-50">
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
              <DialogPanel
                class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-2xl font-bold mb-4 text-gray-900"
                >
                  {{ selectedConcert?.title }}
                  <span class="text-sm font-normal text-gray-500 ml-2">
                    (Archivovaný koncert)
                  </span>
                </DialogTitle>

                <div class="space-y-6">
                  <!-- Základní informace -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <img
                        v-if="selectedConcert?.image"
                        :src="selectedConcert.image"
                        :alt="selectedConcert.title"
                        class="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div class="space-y-4">
                      <div>
                        <h4 class="text-sm font-medium text-gray-500">
                          Datum a čas
                        </h4>
                        <p class="text-lg">
                          {{
                            formatDateWithTime(
                              selectedConcert?.date,
                              selectedConcert?.time
                            )
                          }}
                        </p>
                      </div>
                      <div>
                        <h4 class="text-sm font-medium text-gray-500">
                          Skupina
                        </h4>
                        <p class="text-lg">{{ selectedConcert?.group_name }}</p>
                      </div>
                      <div v-if="selectedConcert?.price">
                        <h4 class="text-sm font-medium text-gray-500">
                          Vstupné
                        </h4>
                        <p class="text-lg">{{ selectedConcert?.price }} Kč</p>
                      </div>
                    </div>
                  </div>

                  <!-- Plakát koncertu -->
                  <div v-if="selectedConcert?.poster">
                    <h4 class="text-sm font-medium text-gray-500 mb-4">
                      Plakát koncertu
                    </h4>
                    <div class="flex justify-center">
                      <img
                        v-if="
                          selectedConcert.poster.image_url &&
                          !selectedConcert.poster.image_url.endsWith('.pdf')
                        "
                        :src="selectedConcert.poster.image_url"
                        :alt="'Plakát - ' + selectedConcert.title"
                        class="max-h-96 rounded-lg shadow-lg"
                      />
                      <object
                        v-else-if="
                          selectedConcert.poster.image_url &&
                          selectedConcert.poster.image_url.endsWith('.pdf')
                        "
                        :data="selectedConcert.poster.image_url"
                        type="application/pdf"
                        class="w-full h-96 rounded-lg shadow-lg"
                      >
                        <div class="text-center p-4 bg-gray-100 rounded-lg">
                          <p class="text-gray-600">
                            PDF plakát není možné zobrazit přímo.
                          </p>
                          <a
                            :href="selectedConcert.poster.image_url"
                            target="_blank"
                            class="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                          >
                            Otevřít PDF v novém okně
                          </a>
                        </div>
                      </object>
                    </div>
                  </div>

                  <!-- Popis -->
                  <div>
                    <h4 class="text-sm font-medium text-gray-500 mb-2">
                      Popis koncertu
                    </h4>
                    <p
                      class="text-gray-700 whitespace-pre-line"
                      v-html="
                        convertUrlsToLinks(
                          selectedConcert?.detailed_description
                        )
                      "
                    ></p>
                  </div>

                  <div class="flex justify-end mt-6">
                    <button
                      @click="showArchiveModal = false"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Zavřít
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro vložení odkazu -->
    <TransitionRoot appear :show="showLinkModal" as="template">
      <Dialog as="div" @close="closeLinkModal" class="relative z-50">
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
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Vložit odkaz
                </DialogTitle>

                <form @submit.prevent="handleLinkSubmit" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Text odkazu
                    </label>
                    <input
                      v-model="linkForm.text"
                      type="text"
                      class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Např.: Navštivte nás zde"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      URL adresa
                    </label>
                    <input
                      v-model="linkForm.url"
                      type="url"
                      class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div class="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      @click="closeLinkModal"
                      class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Vložit odkaz
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useConcerts } from "~/composables/useConcerts";
import { useCategories } from "~/composables/useCategories";
import { useToast } from "~/composables/useToast";
import { useSupabaseClient } from "#imports";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import ConcertQRCode from "~/components/ConcertQRCode.vue";
import { format, parse } from "date-fns";
import { cs } from "date-fns/locale";

const {
  concerts,
  loading,
  error,
  fetchConcerts,
  addConcert,
  updateConcert,
  deleteConcert,
  uploadPoster,
  deletePoster,
  posterUploadProgress,
  isPosterUploading,
} = useConcerts();

const toast = useToast();

const supabase = useSupabaseClient();
const permissions = ref({
  view: false,
  create: false,
  edit: false,
  delete: false,
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Kontrola oprávnění pro každou akci
    const actions = ["view", "create", "edit", "delete"];
    for (const action of actions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "concerts",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

onMounted(async () => {
  await Promise.all([loadPermissions(), fetchConcerts()]);
  checkAndArchiveOldConcerts();
  setInterval(checkAndArchiveOldConcerts, 3600000); // každou hodinu
});

const showAddModal = ref(false);
const editingConcert = ref(null);
const qrGenerator = ref(null);
const showDeleteModal = ref(false);
const concertToDelete = ref(null);

const isDragging = ref(false);
const isPosterDragging = ref(false);
const imagePreview = ref(null);
const posterPreview = ref(null);

const form = ref({
  title: "",
  date: "",
  time: "",
  description: "",
  detailed_description: "",
  group_name: "",
  price: 0,
  is_voluntary: false,
  has_presale: false,
  presale_text: "",
  image: "",
  image_position: "25% 25%", // Výchozí pozice
  variable_symbol: "",
  qr_session: "",
  account_number: "123456789",
  bank_code: "0100",
  ticket_id: null,
  poster: null,
  posterFile: null,
  is_archived: false,
});

const showTicketModal = ref(false);
const concertTickets = ref([]);
const ticketForm = ref({
  title: "",
  group_id: "",
  provider: "",
  ticket_url: "",
});

// Přidáme nové refs pro filtry
const searchQuery = ref("");
const selectedGroup = ref("");
const ticketFilter = ref("");

// Přidáme konstantu pro počet položek na stránku
const ITEMS_PER_PAGE = 10;

// Přidáme ref pro aktuální stránku
const currentPage = ref(1);

// Přidáme state pro řazení
const sortBy = ref("date"); // Výchozí řazení podle data
const sortDesc = ref(true); // Výchozí sestupné řazení

// Funkce pro změnu řazení
const toggleSort = (column) => {
  if (sortBy.value === column) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortBy.value = column;
    sortDesc.value = true;
  }
};

// Upravíme filteredConcerts aby používalo řazení
const filteredConcerts = computed(() => {
  if (!concerts.value) return [];

  let filtered = [...concerts.value];

  // Aplikujeme filtry
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (concert) =>
        concert.title.toLowerCase().includes(query) ||
        concert.group_name.toLowerCase().includes(query)
    );
  }

  if (selectedGroup.value) {
    filtered = filtered.filter(
      (concert) => concert.group_name === selectedGroup.value
    );
  }

  if (ticketFilter.value === "withTickets") {
    filtered = filtered.filter((concert) => concert.ticket_id);
  } else if (ticketFilter.value === "withoutTickets") {
    filtered = filtered.filter((concert) => !concert.ticket_id);
  }

  // Aplikujeme řazení
  filtered = filtered.sort((a, b) => {
    const modifier = sortDesc.value ? -1 : 1;
    if (sortBy.value === "date") {
      return (
        modifier *
        (new Date(a.date + " " + (a.time || "00:00")) -
          new Date(b.date + " " + (b.time || "00:00")))
      );
    }
    return modifier * a[sortBy.value].localeCompare(b[sortBy.value]);
  });

  return filtered;
});

// Přidáme computed property pro aktivní koncerty v hlavní tabulce
const activeFilteredConcerts = computed(() => {
  return filteredConcerts.value.filter((concert) => !concert.is_archived);
});

// Upravíme paginaci aby používala aktivní koncerty
const paginationStart = computed(
  () => (currentPage.value - 1) * ITEMS_PER_PAGE
);
const paginationEnd = computed(() => {
  const end = currentPage.value * ITEMS_PER_PAGE;
  return end > activeFilteredConcerts.value.length
    ? activeFilteredConcerts.value.length
    : end;
});

const paginatedConcerts = computed(() => {
  return activeFilteredConcerts.value.slice(
    paginationStart.value,
    paginationEnd.value
  );
});

// Počet stránek
const totalPages = computed(() =>
  Math.ceil(activeFilteredConcerts.value.length / ITEMS_PER_PAGE)
);

// Celkový počet filtrovaných koncertů
const totalFilteredConcerts = computed(
  () => activeFilteredConcerts.value.length
);

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getFullImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (process.client && path.startsWith("/")) {
    return window.location.origin + path;
  }
  return path;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    processFile(file);
  }
};

const processFile = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Obrázek je příliš velký. Maximální velikost je 5MB.");
    return;
  }

  if (!file.type.startsWith("image/")) {
    toast.error("Nepodporovaný formát souboru. Povoleny jsou pouze obrázky.");
    return;
  }

  try {
    isUploading.value = true;
    uploadProgress.value = 0;

    const formData = new FormData();
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")}`;
    formData.append("image", file, fileName);

    const xhr = new XMLHttpRequest();

    // Nastavíme progress handler
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        uploadProgress.value = Math.round((event.loaded / event.total) * 100);
      }
    };

    const response = await new Promise((resolve, reject) => {
      xhr.open("POST", "/api/upload");

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error(xhr.response || "Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(formData);
    });

    if (response.success) {
      form.value.image = response.path;
      imagePreview.value = getFullImageUrl(response.path);
      toast.success("Obrázek byl úspěšně nahrán");
    }
  } catch (err) {
    console.error("Error uploading image:", err);
    toast.error(
      "Chyba při nahrávání obrázku: " + (err.message || "Neznámá chyba")
    );
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

const removeImage = (e) => {
  e?.preventDefault();
  e?.stopPropagation();
  form.value.image = "";
  imagePreview.value = null;
};

const handlePosterSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    processPosterFile(file);
  }
};

const handlePosterDrop = (event) => {
  isPosterDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (
    file &&
    (file.type.startsWith("image/") || file.type === "application/pdf")
  ) {
    processPosterFile(file);
  }
};

const processPosterFile = async (file) => {
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Plakát je příliš velký. Maximální velikost je 10MB.");
    return;
  }

  try {
    if (editingConcert.value) {
      const result = await uploadPoster(editingConcert.value.id, file);
      if (result.success) {
        form.value.poster = result.poster;
        toast.success("Plakát byl úspěšně nahrán");
      } else {
        toast.error("Chyba při nahrávání plakátu: " + result.error);
      }
    } else {
      // Pro nový koncert pouze zobrazíme náhled
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          posterPreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // Pro PDF soubory zobrazíme placeholder
        posterPreview.value = "/images/pdf-placeholder.png";
      }
      form.value.posterFile = file;
    }
  } catch (err) {
    toast.error("Chyba při zpracování plakátu: " + err.message);
  }
};

const removePoster = async () => {
  if (editingConcert.value) {
    const result = await deletePoster(editingConcert.value.id);
    if (result.success) {
      form.value.poster = null;
      form.value.posterFile = null;
      posterPreview.value = null;
      editingConcert.value.poster = null;
      editingConcert.value.poster_id = null;
      toast.success("Plakát byl úspěšně odstraněn");
    } else {
      toast.error("Chyba při odstraňování plakátu: " + result.error);
    }
  } else {
    posterPreview.value = null;
    form.value.posterFile = null;
    form.value.poster = null;
  }
};

const resetForm = () => {
  form.value = {
    title: "",
    date: "",
    time: "",
    description: "",
    detailed_description: "",
    group_name: "",
    price: 0,
    is_voluntary: false,
    has_presale: false,
    presale_text: "",
    image: "",
    image_position: "25% 25%", // Výchozí pozice
    variable_symbol: "",
    qr_session: "",
    account_number: "123456789",
    bank_code: "0100",
    ticket_id: null,
    poster: null,
    posterFile: null,
    is_archived: false,
  };
  imagePreview.value = null;
  posterPreview.value = null;
  editingConcert.value = null;
  isFormVisible.value = false;
};

const closeModal = () => {
  showTicketModal.value = false;
  ticketForm.value = {
    title: "",
    group_id: "",
    provider: "",
    ticket_url: "",
  };
  ticketCurrentPage.value = 1;
  fetchConcertTickets();
};

// Helper funkce pro validaci variabilního symbolu
const validateVariableSymbol = (vs) => {
  // Odstraníme všechny nečíselné znaky
  return vs.replace(/\D/g, "");
};

const handleSubmit = async () => {
  try {
    // Očistíme variabilní symbol před uložením
    const cleanVS = validateVariableSymbol(form.value.variable_symbol);

    // Pokud není vybraná vstupenka, vygenerujeme QR session data
    let qrSessionData = "";
    if (!form.value.ticket_id) {
      qrSessionData = JSON.stringify({
        title: form.value.title,
        date: form.value.date,
        price: form.value.price,
        vs: cleanVS,
        account: form.value.account_number,
        bank_code: form.value.bank_code,
        timestamp: Date.now(),
      });
    }

    // Připravíme data koncertu
    const concertData = {
      ...form.value,
      variable_symbol: cleanVS,
      qr_session: qrSessionData,
      ticket_id: form.value.ticket_id || null,
    };

    // Odstraníme nepotřebné hodnoty
    delete concertData.poster;
    delete concertData.posterFile;

    // Odstraníme prázdné hodnoty, které by mohly způsobit problémy s UUID
    Object.keys(concertData).forEach((key) => {
      if (concertData[key] === "") {
        concertData[key] = null;
      }
    });

    let savedConcert;
    if (editingConcert.value) {
      savedConcert = await updateConcert(editingConcert.value.id, concertData);
    } else {
      savedConcert = await addConcert(concertData);
    }

    // Pokud máme nový plakát k nahrání
    if (form.value.posterFile && savedConcert) {
      await uploadPoster(savedConcert.id, form.value.posterFile);
    }

    resetForm();
    await Promise.all([fetchConcerts(), fetchConcertTickets()]); // Aktualizujeme oba seznamy
    toast.success(
      editingConcert.value ? "Koncert byl upraven" : "Koncert byl přidán"
    );
  } catch (err) {
    console.error("Error saving concert:", err);
    toast.error("Chyba při ukládání koncertu");
  }
};

const editConcert = (concert) => {
  editingConcert.value = concert;
  form.value = {
    title: concert.title,
    date: concert.date,
    time: concert.time || "",
    description: concert.description,
    detailed_description: concert.detailed_description || "",
    group_name: concert.group_name,
    price: concert.price,
    is_voluntary: concert.is_voluntary || false,
    has_presale: concert.has_presale || false,
    presale_text: concert.presale_text || "",
    image: concert.image,
    image_position: concert.image_position || "25% 25%", // Výchozí pozice
    ticket_id: concert.ticket_id?.toString() || "",
    variable_symbol: concert.variable_symbol || "",
    account_number: concert.account_number || "123456789",
    bank_code: concert.bank_code || "0100",
    qr_session: concert.qr_session || "",
    poster: concert.poster || null,
    posterFile: null,
    is_archived: concert.is_archived,
  };

  // Nastavení počáteční pozice náhledu
  if (concert.image_position) {
    const [x, y] = concert.image_position.split(" ").map((v) => -parseInt(v));
    imagePosition.value = { x, y };
  } else {
    imagePosition.value = { x: -25, y: -25 }; // Výchozí pozice
  }

  imagePreview.value = concert.image ? getFullImageUrl(concert.image) : null;
  posterPreview.value = concert.poster ? concert.poster.image_url : null;
  isFormVisible.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleDelete = (id) => {
  concertToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await deleteConcert(concertToDelete.value);
    await fetchConcerts();
    showDeleteModal.value = false;
    concertToDelete.value = null;
    toast.success("Koncert byl úspěšně smazán");
  } catch (err) {
    toast.error("Chyba při mazání koncertu: " + err.message);
  }
};

const fetchConcertTickets = async () => {
  try {
    const { data, error } = await supabase.from("concert_tickets").select(`
        *,
        assigned_concerts:concerts(
          id,
          title,
          date
        )
      `);

    if (error) throw error;
    concertTickets.value = data;
  } catch (err) {
    toast.error("Chyba při načítání vstupenek: " + err.message);
  }
};

const editingTicket = ref(null);

const editTicket = (ticket) => {
  editingTicket.value = ticket;
  ticketForm.value = {
    title: ticket.title,
    group_id: ticket.group_id,
    provider: ticket.provider,
    ticket_url: ticket.ticket_url,
  };
  showTicketModal.value = true;
};

// Upravíme handleTicketSubmit pro podporu editace
const handleTicketSubmit = async () => {
  try {
    if (editingTicket.value) {
      // Editace existující vstupenky
      const { error } = await supabase
        .from("concert_tickets")
        .update(ticketForm.value)
        .eq("id", editingTicket.value.id);

      if (error) throw error;
      toast.success("Odkaz na vstupenky byl úspěšně upraven");
    } else {
      // Vytvoření nové vstupenky
      const { error } = await supabase
        .from("concert_tickets")
        .insert([ticketForm.value]);

      if (error) throw error;
      toast.success("Odkaz na vstupenky byl úspěšně přidán");
    }

    closeTicketModal();
  } catch (err) {
    toast.error("Chyba při ukládání odkazu: " + err.message);
  }
};

const closeTicketModal = () => {
  showTicketModal.value = false;
  editingTicket.value = null;
  ticketForm.value = {
    title: "",
    group_id: "",
    provider: "",
    ticket_url: "",
  };
  ticketCurrentPage.value = 1;
  fetchConcertTickets();
};

// Znovu načteme data při mounted
onMounted(async () => {
  await Promise.all([fetchConcerts(), fetchConcertTickets()]);
});

// Sledujeme změny v datech
watch(concerts, (newConcerts) => {
  // console.log("Admin concerts updated:", newConcerts);
});

// Přidáme funkci pro získání názvu tělesa podle ID
const getGroupName = (groupId) => {
  const groups = {
    "9001cdb8-80fd-4923-8aa9-8dedc9a30c77": "Marika Singers",
    "af581892-2252-462f-88f2-e73218b4e785": "Five",
    "ba4f5374-5d60-4354-a2ce-e83e130bba83": "Voices",
  };
  return groups[groupId] || "Neznámé těleso";
};

// Přidáme nové refs pro mazací modal
const showDeleteTicketModal = ref(false);

// Přidáme computed property pro zobrazení/skrytí QR sekce
const showQRSection = computed(
  () => !form.value.ticket_id && !form.value.is_voluntary
);

// Přidáme watch pro debugování
watch(
  () => form.value.ticket_id,
  (newVal, oldVal) => {
    console.log("ticket_id changed from", oldVal, "to", newVal);
    console.log("current form state:", form.value);
  }
);

// Konstanty pro stránkování vstupenek
const TICKETS_PER_PAGE = 10;
const ticketCurrentPage = ref(1);

// Computed properties pro stránkování vstupenek
const ticketTotalPages = computed(() =>
  Math.ceil(concertTickets.value.length / TICKETS_PER_PAGE)
);

const ticketPaginationStart = computed(
  () => (ticketCurrentPage.value - 1) * TICKETS_PER_PAGE
);

const ticketPaginationEnd = computed(() =>
  Math.min(
    ticketPaginationStart.value + TICKETS_PER_PAGE,
    concertTickets.value.length
  )
);

const paginatedTickets = computed(() => {
  return concertTickets.value.slice(
    ticketPaginationStart.value,
    ticketPaginationEnd.value
  );
});

// Reset stránkování vstupenek při otevření modalu
watch(showTicketModal, (newValue) => {
  if (newValue) {
    ticketCurrentPage.value = 1;
  }
});

// Přidáme ref pro viditelnost formuláře
const isFormVisible = ref(false);

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

// Přidáme nový ref pro progress
const uploadProgress = ref(0);
const isUploading = ref(false);

const archivedConcerts = computed(() => {
  return concerts.value
    .filter((concert) => concert.is_archived)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

// Přidáme funkci pro archivaci koncertu
const archiveConcert = async (concert) => {
  try {
    await updateConcert(concert.id, { is_archived: true });
    await fetchConcerts();
    toast.success("Koncert byl úspěšně archivován");
  } catch (err) {
    toast.error("Chyba při archivaci koncertu: " + err.message);
  }
};

// Přidáme funkci pro obnovení koncertu z archivu
const restoreConcert = async (concert) => {
  try {
    loading.value = true;
    const { error } = await supabase
      .from("concerts")
      .update({ is_archived: false })
      .eq("id", concert.id);

    if (error) throw error;

    toast.success("Koncert byl úspěšně obnoven");
    await fetchConcerts();
  } catch (err) {
    console.error("Error restoring concert:", err);
    toast.error("Nepodařilo se obnovit koncert");
  } finally {
    loading.value = false;
  }
};

// Funkce pro kontrolu a archivaci starých koncertů
const checkAndArchiveOldConcerts = async () => {
  try {
    const { error } = await supabase.rpc("archive_old_concerts");
    if (error) throw error;
    await fetchConcerts();
  } catch (err) {
    console.error("Error checking old concerts:", err);
  }
};

// Spustíme kontrolu při načtení komponenty a pak každou hodinu
onMounted(() => {
  checkAndArchiveOldConcerts();
  setInterval(checkAndArchiveOldConcerts, 3600000); // každou hodinu
});

const formatDateWithTime = (date, time) => {
  return new Date(`${date} ${time}`).toLocaleString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const showArchiveModal = ref(false);
const selectedConcert = ref(null);

// Funkce pro konverzi URL na odkazy
const convertUrlsToLinks = (text) => {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const href = url.startsWith("www.") ? `https://${url}` : url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${url}</a>`;
  });
};

const showArchivePreview = (concert) => {
  selectedConcert.value = concert;
  showArchiveModal.value = true;
};

const startPosition = ref({ x: 0, y: 0 });
const imagePosition = ref({ x: -25, y: -25 }); // Výchozí pozice obrázku
const previewImage = ref(null);

const startDragging = (e) => {
  isDragging.value = true;
  startPosition.value = {
    x: e.clientX - imagePosition.value.x,
    y: e.clientY - imagePosition.value.y,
  };
};

const handleDrag = (e) => {
  if (!isDragging.value) return;

  let newX = e.clientX - startPosition.value.x;
  let newY = e.clientY - startPosition.value.y;

  // Omezení pohybu
  newX = Math.min(Math.max(newX, -50), 0);
  newY = Math.min(Math.max(newY, -50), 0);

  imagePosition.value = { x: newX, y: newY };
  form.value.image_position = `${-newX}% ${-newY}%`; // Uložíme pozici jako CSS hodnotu
};

const stopDragging = () => {
  isDragging.value = false;
};

// Přidáme hook pro resetování pozice obrázku při nahrání nového
watch(imagePreview, (newValue) => {
  if (newValue) {
    imagePosition.value = { x: -25, y: -25 }; // Reset na výchozí pozici
    form.value.image_position = "25% 25%";
  }
});

// Proměnné pro ovládání pozice obrázku
const isImageDragging = ref(false);

// Funkce pro ovládání pozice obrázku
const startImageDrag = (e) => {
  isImageDragging.value = true;
  startPosition.value = {
    x: e.clientX - imagePosition.value.x,
    y: e.clientY - imagePosition.value.y,
  };
};

const handleImageDrag = (e) => {
  if (!isImageDragging.value) return;

  let newX = e.clientX - startPosition.value.x;
  let newY = e.clientY - startPosition.value.y;

  // Omezení pohybu
  newX = Math.min(Math.max(newX, -50), 0);
  newY = Math.min(Math.max(newY, -50), 0);

  imagePosition.value = { x: newX, y: newY };
  form.value.image_position = `${-newX}% ${-newY}%`; // Uložíme pozici jako CSS hodnotu
};

const stopImageDrag = () => {
  isImageDragging.value = false;
};

// Resetování pozice obrázku při nahrání nového
watch(imagePreview, (newValue) => {
  if (newValue) {
    imagePosition.value = { x: -25, y: -25 }; // Reset na výchozí pozici
    form.value.image_position = "25% 25%";
  }
});

// Přidáme nové proměnné do setup
const isTicketAssigned = ref(false);
const ticketToDelete = ref(null);

// Upravíme funkci pro otevření delete modalu
const handleDeleteTicket = (ticket) => {
  ticketToDelete.value = ticket;
  showDeleteTicketModal.value = true;
};

// Upravíme funkci pro potvrzení smazání
const confirmDeleteTicket = async () => {
  if (
    !ticketToDelete.value ||
    (ticketToDelete.value.assigned_concerts &&
      ticketToDelete.value.assigned_concerts.length > 0)
  ) {
    return;
  }

  try {
    const { error } = await supabase
      .from("concert_tickets")
      .delete()
      .eq("id", ticketToDelete.value.id);

    if (error) throw error;

    await fetchConcertTickets();
    toast.success("Odkaz byl úspěšně smazán");
    showDeleteTicketModal.value = false;
    ticketToDelete.value = null;
  } catch (err) {
    toast.error("Chyba při mazání odkazu: " + err.message);
  }
};

const insertLink = () => {
  // Get the textarea element and check for selected text
  const textarea = textareaRef.value;
  if (textarea) {
    const selectedText = form.value.detailed_description.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    // If there is selected text, pre-fill the link form text
    if (selectedText) {
      linkForm.value.text = selectedText;
    }
  }
  showLinkModal.value = true;
};

const handleLinkSubmit = () => {
  if (!linkForm.value.text || !linkForm.value.url) return;

  const linkMarkdown = `[${linkForm.value.text}](${linkForm.value.url})`;

  // Get the textarea element
  const textarea = textareaRef.value;
  if (!textarea) return;

  // Get the current cursor position or selection
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // Insert the link at cursor position or replace selected text
  const text = form.value.detailed_description || "";
  form.value.detailed_description =
    text.substring(0, start) + linkMarkdown + text.substring(end);

  // Reset form and close modal
  linkForm.value = { text: "", url: "" };
  showLinkModal.value = false;

  // Focus back on textarea and place cursor after the inserted link
  textarea.focus();
  const newPosition = start + linkMarkdown.length;
  textarea.setSelectionRange(newPosition, newPosition);
};

// Přidáme potřebné refs
const showLinkModal = ref(false);
const linkForm = ref({
  text: "",
  url: "",
});
const savedCursorPosition = ref({
  start: 0,
  end: 0,
});

const closeLinkModal = () => {
  showLinkModal.value = false;
  linkForm.value = {
    text: "",
    url: "",
    cursorStart: 0,
    cursorEnd: 0,
  };
};

const confirmInsertLink = () => {
  if (!linkForm.value.text || !linkForm.value.url) return;

  const linkText = `[${linkForm.value.text}](${linkForm.value.url})`;
  const textarea = document.querySelector("textarea");

  // Získáme aktuální pozici kurzoru nebo označeného textu
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // Vložíme odkaz na místo kurzoru nebo nahradíme označený text
  form.value.detailed_description =
    form.value.detailed_description.substring(0, start) +
    linkText +
    form.value.detailed_description.substring(end);

  // Nastavíme kurzor za vložený odkaz
  setTimeout(() => {
    textarea.focus();
    const newPosition = start + linkText.length;
    textarea.setSelectionRange(newPosition, newPosition);
  }, 0);

  closeLinkModal();
};

const textareaRef = ref(null);
</script>

<style scoped>
.material-icons-outlined {
  font-size: 20px;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>