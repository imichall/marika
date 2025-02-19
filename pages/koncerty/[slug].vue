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
            <div class="relative aspect-[4/3] overflow-hidden">
              <img
                v-if="concert.image"
                :src="concert.image"
                :alt="concert.title"
                class="w-full h-full object-cover rounded-lg shadow-lg"
                :style="{
                  objectPosition: concert.image_position || 'center center',
                }"
                loading="lazy"
              />
              <div
                v-else
                class="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg"
              >
                <span class="text-gray-400">Bez obrázku</span>
              </div>
            </div>

            <!-- Content Column -->
            <div class="flex flex-col bg-white rounded-lg shadow-sm p-8 h-full">
              <div class="flex-grow space-y-6">
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
                      <span class="text-sm text-gray-500">Cena vstupenky</span>
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

              <div class="flex gap-4 mt-6">
                <button
                  v-if="concert.ticket_id"
                  @click="openTicketInfoModal(concert)"
                  class="flex-1 bg-red-800 hover:bg-red-900 border border-red-800 text-white px-4 py-3 transition-colors duration-200"
                >
                  Koupit vstupenky
                </button>
                <button
                  v-else
                  @click="openTicketModal(concert)"
                  class="flex-1 bg-red-800 hover:bg-red-900 border border-red-800 text-white px-4 py-3 transition-colors duration-200"
                >
                  Koupit vstupenky
                </button>
                <button
                  v-if="concert.poster"
                  @click="showPosterModal = true"
                  class="flex-1 bg-transparent border border-black text-black px-4 py-3 hover:bg-black hover:text-white transition-colors duration-200"
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
          <div
            v-for="otherConcert in otherConcerts"
            :key="otherConcert.id"
            class="bg-white shadow-lg"
          >
            <NuxtLink
              :to="`/koncerty/${otherConcert.id}-${slugify(
                otherConcert.title
              )}`"
            >
              <img
                :src="otherConcert.image"
                :alt="otherConcert.title"
                class="w-full h-48 object-cover"
              />
              <div class="p-4">
                <h3 class="text-xl font-semibold mb-2">
                  {{ otherConcert.title }}
                  <span
                    v-if="otherConcert.group"
                    class="text-gray-600 text-sm block mt-1"
                  >
                    ({{ otherConcert.group }})
                  </span>
                </h3>
                <p class="text-gray-600">
                  {{ formatDateWithTime(otherConcert.date, otherConcert.time) }}
                </p>
              </div>
            </NuxtLink>
          </div>
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
                    <img
                      v-if="
                        concert.poster?.image_url &&
                        !concert.poster.image_url.endsWith('.pdf')
                      "
                      :src="concert.poster.image_url"
                      :alt="concert.title"
                      class="max-w-full h-auto rounded-lg shadow-lg"
                    />
                    <object
                      v-else-if="
                        concert.poster?.image_url &&
                        concert.poster.image_url.endsWith('.pdf')
                      "
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
import { ref, computed } from "vue";

const route = useRoute();
const { concerts, getConcert } = useConcerts();
const concert = ref(null);
const loading = ref(true);
const supabase = useSupabaseClient();

const selectedConcert = ref({});
const isTicketModalOpen = ref(false);
const isTicketInfoModalOpen = ref(false);
const showPosterModal = ref(false);

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
</style>