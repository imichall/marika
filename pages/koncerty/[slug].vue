<template>
  <div class="pb-16 mt-[100px]">
    <!-- Breadcrumbs in container -->
    <div class="container mx-auto px-4 mb-8">
      <Breadcrumbs>
        <BreadcrumbsItem>
          <NuxtLink
            to="/koncerty"
            class="ml-1 text-gray-700 hover:text-red-800 md:ml-2"
          >
            Koncerty
          </NuxtLink>
        </BreadcrumbsItem>
        <BreadcrumbsItem :isLast="true">
          <span class="ml-1 text-gray-500 md:ml-2">
            {{ concert?.title || "Detail koncertu" }}
          </span>
        </BreadcrumbsItem>
      </Breadcrumbs>
    </div>

    <!-- Full-width background section -->
    <div class="concert-detail-bg py-12">
      <!-- Skeleton loading -->
      <div v-if="loading" class="container mx-auto px-4">
        <div class="mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Image skeleton -->
            <div class="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div>

            <!-- Content skeleton -->
            <div class="flex flex-col justify-between space-y-6 bg-white p-10">
              <div class="space-y-6">
                <!-- Title skeleton -->
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>

                <!-- Date skeleton -->
                <div class="space-y-2">
                  <div class="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <!-- Price skeleton -->
                <div class="space-y-2">
                  <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              <!-- Buttons skeleton -->
              <div class="mt-auto flex flex-col gap-4">
                <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <!-- Description skeleton -->
          <div class="flex flex-col gap-4 mt-10">
            <div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actual content -->
      <div v-else-if="concert" class="container mx-auto px-4">
        <div class="mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Image Column -->
            <div class="flex items-start" ref="imageColumn">
              <div class="w-full bg-white p-4 rounded-lg shadow-lg">
                <div class="relative w-full">
                  <picture v-if="concert.image">
                    <source
                      :srcset="getWebPUrl(concert.image)"
                      type="image/webp"
                    />
                    <img
                      :src="concert.image"
                      :alt="concert.title"
                      class="w-full h-auto rounded-lg"
                      loading="lazy"
                    />
                  </picture>
                  <div
                    v-else
                    class="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center rounded-lg"
                  >
                    <span class="text-gray-400">Bez obrázku</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content Column -->
            <div class="relative">
              <div
                class="bg-white rounded-lg shadow-sm p-8"
                :class="{ 'md:sticky': true }"
                :style="stickyStyle"
                ref="contentBlock"
              >
                <div class="space-y-6">
                  <header>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="relative inline-flex items-center">
                        <svg
                          class="absolute -top-2 -right-2 w-4 h-4 text-red-800 opacity-50 animate-bounce"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                          />
                        </svg>
                        <span
                          class="text-sm font-medium px-3 py-0.5 rounded-full whitespace-nowrap transform transition-transform hover:scale-105 shadow-sm"
                          :class="{
                            'bg-gradient-to-r from-red-100 to-red-200 text-red-900 ring-1 ring-red-200':
                              concert.group_name === 'Marika Singers',
                            'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-900 ring-1 ring-rose-200':
                              concert.group_name === 'Voices',
                            'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-900 ring-1 ring-pink-200':
                              concert.group_name === 'Five',
                          }"
                        >
                          {{ concert.group_name }}
                        </span>
                      </div>
                    </div>
                    <h1 class="text-4xl font-bold text-custom-gray mb-4">
                      {{ concert.title }}
                    </h1>
                    <p class="text-gray-600 text-base mb-6 leading-relaxed">
                      {{ concert.description }}
                    </p>
                  </header>

                  <div class="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div class="flex items-center gap-2">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <span class="text-sm text-gray-500"
                          >Čas a datum vystoupení</span
                        >
                        <p class="text-lg font-semibold text-gray-900">
                          {{ formatDateWithTime(concert.date, concert.time) }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <span class="text-sm text-gray-500"
                          >Cena vstupenky</span
                        >
                        <p class="text-lg font-semibold text-gray-900">
                          {{
                            concert.is_voluntary
                              ? "Dobrovolné vstupné"
                              : `${concert.price},- Kč`
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Buttons container -->
                <div class="pt-6">
                  <div class="flex gap-4">
                    <button
                      v-if="concert.ticket_id"
                      @click="openTicketInfoModal(concert)"
                      class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border-2 border-red-800 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      Koupit vstupenky
                    </button>
                    <button
                      v-else
                      @click="openTicketModal(concert)"
                      class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border-2 border-red-800 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      Koupit vstupenky
                    </button>
                    <button
                      v-if="concert.poster"
                      @click="showPosterModal = true"
                      class="flex-1 bg-transparent text-black border-2 border-black/90 px-5 py-3 text-center hover:bg-black hover:text-white transition-all duration-300 rounded-xl font-medium shadow-sm hover:shadow-lg"
                    >
                      Stáhnout plakát akce
                    </button>
                    <button
                      v-else
                      class="flex-1 bg-transparent border border-gray-300 text-gray-400 px-4 py-3 cursor-not-allowed"
                      disabled
                    >
                      Plakát není k dispozici
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4 mt-10">
            <h4 class="text-2xl font-medium">Detailní popis koncertu</h4>
            <p
              class="text-gray-600 whitespace-pre-line"
              v-html="convertUrlsToLinks(concert.detailed_description)"
            ></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Other concerts section -->
    <div class="container mx-auto px-4">
      <div v-if="otherConcerts.length" class="mt-16">
        <div class="relative flex py-10 items-center">
          <div class="flex-grow border-t border-gray-400"></div>
          <span class="flex-shrink mx-4 text-2xl text-black uppercase"
            >Další koncerty</span
          >
          <div class="flex-grow border-t border-gray-400"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FadeUpOnScroll
            v-for="(otherConcert, index) in otherConcerts"
            :key="otherConcert.id"
          >
            <article
              class="concert-card group flex flex-col bg-white rounded-3xl shadow-md ring-1 ring-black/5 hover:ring-2 hover:ring-red-800/20 hover:shadow-xl hover:shadow-red-800/10 transition-all duration-500 h-full"
            >
              <div class="relative w-full h-[300px] flex-shrink-0">
                <picture v-if="otherConcert.image">
                  <source
                    :srcset="getWebPUrl(otherConcert.image)"
                    type="image/webp"
                  />
                  <img
                    :src="otherConcert.image"
                    :alt="otherConcert.title"
                    class="w-full h-full rounded-t-3xl object-contain transition-all duration-700 group-hover:brightness-105 group-hover:contrast-[1.02]"
                    loading="lazy"
                  />
                </picture>
                <div
                  v-else
                  class="w-full h-full rounded-t-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center"
                >
                  <svg
                    class="w-16 h-16 text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p class="text-gray-400 font-medium">
                    Obrázek není k dispozici
                  </p>
                </div>
                <div
                  class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
                >
                  <div class="absolute bottom-0 w-full p-6">
                    <time
                      :datetime="otherConcert.date"
                      class="text-white text-sm font-medium mb-2 block"
                    >
                      {{
                        formatDateWithTime(otherConcert.date, otherConcert.time)
                      }}
                    </time>
                    <h2
                      class="font-bold text-2xl text-white group-hover:text-red-50 transition-colors duration-300"
                    >
                      {{ otherConcert.title }}
                    </h2>
                  </div>
                </div>
              </div>

              <div class="flex flex-col flex-grow p-6">
                <div class="flex items-center gap-2 mb-4">
                  <div class="relative inline-flex items-center">
                    <div class="absolute -top-3 -right-3">
                      <svg
                        class="w-4.5 h-4.5 text-red-800/70 absolute -translate-y-1 animate-[noteFloat1_2s_ease-in-out_infinite]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                        />
                      </svg>
                      <svg
                        class="w-4 h-4 text-red-800/60 absolute translate-x-5 translate-y-1 animate-[noteFloat2_2.2s_ease-in-out_0.2s_infinite]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                        />
                      </svg>
                      <svg
                        class="w-3.5 h-3.5 text-red-800/50 absolute translate-x-10 animate-[noteFloat3_1.8s_ease-in-out_0.4s_infinite]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                        />
                      </svg>
                    </div>
                    <span
                      class="text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      :class="{
                        'bg-gradient-to-r from-red-50 to-red-100 text-red-800 ring-1 ring-red-200 shadow-sm shadow-red-800/5':
                          otherConcert.group_name === 'Marika Singers',
                        'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 ring-1 ring-rose-200 shadow-sm shadow-rose-800/5':
                          otherConcert.group_name === 'Voices',
                        'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 ring-1 ring-pink-200 shadow-sm shadow-pink-800/5':
                          otherConcert.group_name === 'Five',
                      }"
                    >
                      {{ otherConcert.group_name }}
                    </span>
                  </div>
                </div>

                <p class="text-gray-600 line-clamp-3 text-lg mb-6">
                  {{ otherConcert.description }}
                </p>

                <div class="mt-auto">
                  <div class="flex gap-4">
                    <NuxtLink
                      :to="`/koncerty/${otherConcert.id}-${slugify(
                        otherConcert.title
                      )}`"
                      class="flex-1 bg-transparent text-black border-2 border-black/90 px-5 py-3 text-center hover:bg-black hover:text-white transition-all duration-300 rounded-xl font-medium shadow-sm hover:shadow-lg"
                    >
                      Informace
                    </NuxtLink>
                    <button
                      v-if="otherConcert.ticket_id"
                      @click="openTicketInfoModal(otherConcert)"
                      class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border-2 border-red-800 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      Vstupenky
                    </button>
                    <button
                      v-else
                      @click="openTicketModal(otherConcert)"
                      class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border-2 border-red-800 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      Vstupenky
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </FadeUpOnScroll>
        </div>
      </div>
    </div>
  </div>

  <!-- Add modals -->
  <TicketPurchaseModal
    v-if="!selectedConcert.ticket_id"
    :is-open="isTicketModalOpen"
    :concert="selectedConcert"
    @close="isTicketModalOpen = false"
    @purchase="handlePurchase"
  />

  <!-- Ticket Info Modal -->
  <TransitionRoot appear :show="isTicketInfoModalOpen" as="template">
    <Dialog as="div" @close="closeTicketInfoModal" class="relative z-50">
      <TransitionChild
        as="div"
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
            as="div"
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
              <div class="relative">
                <DialogTitle
                  as="h3"
                  class="text-2xl font-bold mb-2 text-gray-900"
                >
                  Vstupenky na koncert {{ selectedConcert.title }}
                  <div class="text-base font-normal text-gray-600 mt-1">
                    Začátek v {{ selectedConcert.time || "19:00" }}
                  </div>
                </DialogTitle>

                <div class="space-y-6">
                  <div class="bg-blue-50 p-4 rounded-xl">
                    <p class="text-blue-800 font-medium mb-1">
                      Poskytovatel vstupenek
                    </p>
                    <p class="text-blue-600 text-lg">
                      {{ selectedConcert?.ticket?.provider }}
                    </p>
                  </div>

                  <div class="bg-gray-50 p-4 rounded-xl">
                    <p class="text-gray-600">
                      Tento koncert není v naší režii. Prosíme, obraťte se na
                      pořadatele koncertu
                      <strong>{{ selectedConcert?.ticket?.provider }}</strong
                      >.
                    </p>
                  </div>

                  <div class="flex justify-end space-x-4">
                    <button
                      @click="closeTicketInfoModal"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Zavřít
                    </button>
                    <a
                      :href="selectedConcert?.ticket?.ticket_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors duration-200 inline-flex items-center gap-2"
                    >
                      Přejít k nákupu
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Poster Modal -->
  <TransitionRoot appear :show="showPosterModal" as="template">
    <Dialog as="div" @close="showPosterModal = false" class="relative z-50">
      <TransitionChild
        as="div"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/80" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="div"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden"
            >
              <div class="flex flex-col max-h-[90vh]">
                <div class="p-6 border-b">
                  <DialogTitle
                    as="h3"
                    class="text-2xl font-bold text-gray-900 flex items-center justify-between"
                  >
                    <span>Plakát koncertu {{ concert.title }}</span>
                    <button
                      @click="showPosterModal = false"
                      class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </DialogTitle>
                </div>

                <div class="p-6 overflow-y-auto">
                  <div class="relative flex justify-center">
                    <!-- Obrázek (non-PDF) -->
                    <div
                      v-if="
                        concert.poster?.image_url &&
                        !isPDF(concert.poster.image_url)
                      "
                      class="relative"
                    >
                      <picture>
                        <source
                          :srcset="getWebPUrl(concert.poster.image_url)"
                          type="image/webp"
                        />
                        <img
                          :src="concert.poster.image_url"
                          :alt="concert.title"
                          class="max-w-full h-auto rounded-lg shadow-lg"
                          loading="lazy"
                        />
                      </picture>
                    </div>

                    <!-- PDF -->
                    <object
                      v-else-if="isPDF(concert.poster.image_url)"
                      :data="concert.poster.image_url"
                      type="application/pdf"
                      class="w-full h-[70vh] rounded-lg shadow-lg"
                    >
                      <div class="text-center p-4">
                        <p class="text-gray-600">
                          Pro zobrazení PDF plakátu klikněte na tlačítko
                          Stáhnout plakát
                        </p>
                      </div>
                    </object>
                  </div>
                </div>

                <div class="p-6 border-t bg-gray-50">
                  <div class="flex justify-end gap-4">
                    <a
                      v-if="concert.poster?.image_url"
                      :href="concert.poster.image_url"
                      download
                      class="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Stáhnout plakát
                    </a>
                    <button
                      @click="showPosterModal = false"
                      class="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                    >
                      Zavřít
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { slugify } from "~/utils/string";
import { useSupabaseClient } from "#imports";
import TicketPurchaseModal from "~/components/TicketPurchaseModal.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { formatDateWithTime } from "~/utils/date";
import { ref, computed, onMounted, onUnmounted } from "vue";
import FadeUpOnScroll from "~/components/FadeUpOnScroll.vue";

const route = useRoute();
const { concerts, getConcert } = useConcerts();
const concert = ref(null);
const loading = ref(true);
const supabase = useSupabaseClient();

const selectedConcert = ref({});
const isTicketModalOpen = ref(false);
const isTicketInfoModalOpen = ref(false);
const showPosterModal = ref(false);
const isAtBottom = ref(false);
const imageColumn = ref(null);
const contentBlock = ref(null);
const stickyStyle = ref({});

// Extract ID from the slug parameter (format: "id-title-slug")
const getId = (slug) => {
  const match = slug.match(/^(\d+)/);
  return match ? parseInt(match[1]) : null;
};

// Load concert data
onMounted(async () => {
  const id = getId(route.params.slug);
  if (id) {
    concert.value = await getConcert(id);
  }
  loading.value = false;
});

// Get other concerts excluding current one and archived ones
const otherConcerts = computed(() => {
  const id = getId(route.params.slug);
  const currentDate = new Date();
  return concerts.value
    .filter(
      (c) => c.id !== id && !c.is_archived && new Date(c.date) >= currentDate
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});

const openTicketModal = (concert) => {
  selectedConcert.value = concert;
  isTicketModalOpen.value = true;
};

const openTicketInfoModal = async (concert) => {
  try {
    const { data: ticketData, error } = await supabase
      .from("concert_tickets")
      .select("*")
      .eq("id", concert.ticket_id)
      .single();

    if (error) throw error;

    if (ticketData) {
      selectedConcert.value = {
        ...concert,
        ticket: ticketData,
      };
    }

    isTicketInfoModalOpen.value = true;
  } catch (err) {
    console.error("Error loading ticket:", err);
  }
};

const closeTicketInfoModal = () => {
  isTicketInfoModalOpen.value = false;
};

const handlePurchase = (purchaseDetails) => {
  isTicketModalOpen.value = false;
};

const downloadPoster = async () => {
  try {
    // Fetch the image
    const response = await fetch(concert.value.poster.image_url);
    const blob = await response.blob();

    // Create object URL
    const url = window.URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `plakat-${concert.value.title}.jpg`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Chyba při stahování plakátu:", error);
  }
};

// Přidáme funkci pro konverzi URL na odkazy
const convertUrlsToLinks = (text) => {
  if (!text) return "";

  // Zpracujeme markdown-style odkazy [text](url)
  const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const processedText = text.replace(markdownRegex, (_, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:text-red-800 underline">${text}</a>`;
  });

  return processedText;
};

// Přidáme watch efekt pro sledování scrollu
onMounted(() => {
  const checkScroll = () => {
    const container = document.querySelector(".concert-detail-bg");
    const buttonsContainer = document.querySelector(".sticky-buttons");
    if (!container || !buttonsContainer) return;

    const containerBottom = container.getBoundingClientRect().bottom;
    const buttonsHeight = buttonsContainer.offsetHeight;
    const windowHeight = window.innerHeight;

    // Když je spodek containeru blízko spodku viewportu, přepneme na statickou pozici
    isAtBottom.value = containerBottom - buttonsHeight <= windowHeight;
  };

  window.addEventListener("scroll", checkScroll);
  window.addEventListener("resize", checkScroll);

  // Initial check
  checkScroll();

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener("scroll", checkScroll);
    window.removeEventListener("resize", checkScroll);
  });
});

// Přidáme watch efekt pro sledování scrollu
onMounted(() => {
  const updateStickyPosition = () => {
    if (!imageColumn.value || !contentBlock.value) return;

    const imageRect = imageColumn.value.getBoundingClientRect();
    const contentRect = contentBlock.value.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Výška obrázku a obsahu
    const imageHeight = imageRect.height;
    const contentHeight = contentRect.height;

    // Pozice horní hrany obrázku od vrchu viewportu
    const imageTop = imageRect.top;

    // Maximální povolený posun (výška obrázku mínus výška obsahu)
    const maxOffset = imageHeight - contentHeight;

    if (imageHeight > contentHeight) {
      // Pokud je obrázek vyšší než obsah
      if (imageTop <= 100) {
        // Když je horní hrana obrázku pod navigací
        if (Math.abs(imageTop - 100) > maxOffset) {
          // Dosáhli jsme maximálního posunu
          stickyStyle.value = {
            position: "sticky",
            top: `${maxOffset + 100}px`,
          };
        } else {
          // Stále můžeme scrollovat
          stickyStyle.value = {
            position: "sticky",
            top: "100px",
          };
        }
      } else {
        // Obrázek je stále viditelný nad viewportem
        stickyStyle.value = {
          position: "sticky",
          top: "100px",
        };
      }
    } else {
      // Pokud je obsah vyšší než obrázek, necháme ho statický
      stickyStyle.value = {
        position: "static",
      };
    }
  };

  window.addEventListener("scroll", updateStickyPosition);
  window.addEventListener("resize", updateStickyPosition);

  // Initial check
  updateStickyPosition();

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener("scroll", updateStickyPosition);
    window.removeEventListener("resize", updateStickyPosition);
  });
});

// Přidáme helper funkci pro detekci PDF
const isPDF = (url) => {
  if (!url) return false;
  return url.toLowerCase().endsWith(".pdf");
};

// Vylepšíme funkci pro získání WebP URL
const getWebPUrl = (url) => {
  if (!url) return "";
  if (url.endsWith(".webp")) return url;
  return url.replace(/\.(jpe?g|png|gif)$/i, ".webp");
};
</script>

<style>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.concert-detail-bg {
  background: linear-gradient(-45deg, #fdf2f8, #fff1f2, #fee2e2, #fce7f3);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Přidáme styly pro sticky buttons */
.sticky-buttons {
  position: sticky;
  bottom: 0;
  background: linear-gradient(to top, white 80%, rgba(255, 255, 255, 0.9) 100%);
  padding-bottom: 1rem;
  margin: 0 -2rem -2rem -2rem;
  padding-left: 2rem;
  padding-right: 2rem;
  z-index: 10;
}

.sticky-buttons.md:static {
  position: static;
  background: transparent;
  margin: 0;
  padding-left: 0;
  padding-right: 0;
}

/* Styly pro sticky content */
@media (min-width: 768px) {
  .md\:sticky {
    position: sticky;
    transition: top 0.2s ease;
  }
}

@keyframes noteFloat1 {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  80% {
    opacity: 0;
  }
  100% {
    transform: translate(-10px, -20px) rotate(-10deg);
    opacity: 0;
  }
}

@keyframes noteFloat2 {
  0% {
    transform: translate(2px, 0) rotate(5deg);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  80% {
    opacity: 0;
  }
  100% {
    transform: translate(-5px, -25px) rotate(-5deg);
    opacity: 0;
  }
}

@keyframes noteFloat3 {
  0% {
    transform: translate(4px, 0) rotate(-5deg);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  80% {
    opacity: 0;
  }
  100% {
    transform: translate(0px, -22px) rotate(10deg);
    opacity: 0;
  }
}
</style>