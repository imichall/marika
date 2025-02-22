<template>
  <section class="pb-16 mt-[100px]">
    <div class="container mx-auto px-4 mb-8">
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="items-center">
            <NuxtLink
              to="/"
              class="text-gray-700 hover:text-red-800 flex items-center"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                />
              </svg>
              Domů
            </NuxtLink>
          </li>
          <li>
            <div class="flex items-center">
              <svg
                class="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="ml-1 text-gray-500 md:ml-2">
                {{ concert?.title || "Všechny koncerty" }}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8 text-center">Všechny koncerty</h1>

      <!-- Moderní filtr pro tělesa -->
      <div class="flex justify-center mb-12">
        <nav
          class="flex gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <button
            @click="selectedGroup = ''"
            :class="[
              'relative px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300',
              selectedGroup === ''
                ? 'text-red-800 bg-red-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            <span class="relative z-10">Všechna tělesa</span>
          </button>
          <button
            @click="selectedGroup = 'Marika Singers'"
            :class="[
              'relative px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300',
              selectedGroup === 'Marika Singers'
                ? 'text-red-800 bg-red-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            <span class="relative z-10">Marika Singers</span>
          </button>
          <button
            @click="selectedGroup = 'Voices'"
            :class="[
              'relative px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300',
              selectedGroup === 'Voices'
                ? 'text-red-800 bg-red-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            <span class="relative z-10">Voices</span>
          </button>
          <button
            @click="selectedGroup = 'Five'"
            :class="[
              'relative px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300',
              selectedGroup === 'Five'
                ? 'text-red-800 bg-red-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            <span class="relative z-10">Five</span>
          </button>
        </nav>
      </div>

      <!-- Zobrazení počtu nalezených koncertů -->
      <div
        v-if="filteredConcerts.length === 0"
        class="text-center text-gray-500 mb-8"
      >
        Nenalezeny žádné koncerty pro vybrané těleso
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="concert in filteredConcerts"
          :key="concert.id"
          class="concert-card group flex flex-col bg-white rounded-3xl shadow-md ring-1 ring-black/5 hover:ring-2 hover:ring-red-800/20 hover:shadow-xl hover:shadow-red-800/10 transition-all duration-500 h-full"
        >
          <div class="relative w-full h-[300px] flex-shrink-0">
            <img
              v-if="concert.image"
              :src="concert.image"
              :alt="concert.title"
              class="w-full h-full rounded-t-3xl object-cover transition-all duration-700 group-hover:brightness-105 group-hover:contrast-[1.02]"
              loading="lazy"
            />
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
              <p class="text-gray-400 font-medium">Obrázek není k dispozici</p>
            </div>
            <div
              class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
            >
              <div class="absolute bottom-0 w-full p-6">
                <time
                  :datetime="concert.date"
                  class="text-white text-sm font-medium mb-2 block"
                >
                  {{ formatDateWithTime(concert.date, concert.time) }}
                </time>
                <h2
                  class="font-bold text-2xl text-white group-hover:text-red-50 transition-colors duration-300"
                >
                  {{ concert.title }}
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
                      concert.group_name === 'Marika Singers',
                    'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 ring-1 ring-rose-200 shadow-sm shadow-rose-800/5':
                      concert.group_name === 'Voices',
                    'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 ring-1 ring-pink-200 shadow-sm shadow-pink-800/5':
                      concert.group_name === 'Five',
                  }"
                >
                  {{ concert.group_name }}
                </span>
              </div>
            </div>

            <p class="text-gray-600 line-clamp-3 text-lg mb-6">
              {{ concert.description }}
            </p>

            <div class="mt-auto">
              <div class="flex gap-4">
                <NuxtLink
                  :to="`/koncerty/${concert.id}-${slugify(concert.title)}`"
                  class="flex-1 bg-transparent text-black border-2 border-black/90 px-5 py-3 text-center hover:bg-black hover:text-white transition-all duration-300 rounded-xl font-medium shadow-sm hover:shadow-lg"
                >
                  Informace
                </NuxtLink>
                <button
                  v-if="concert.ticket_id"
                  @click="openTicketInfoModal(concert)"
                  class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border-2 border-red-800 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  Vstupenky
                </button>
                <button
                  v-else
                  @click="openTicketModal(concert)"
                  class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border-2 border-red-800 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  Vstupenky
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Add modals -->
  <TicketPurchaseModal
    v-if="!selectedConcert.ticket_id"
    :is-open="isTicketModalOpen"
    :concert="selectedConcert"
    @close="isTicketModalOpen = false"
    @purchase="handlePurchase"
  >
    <DialogTitle as="h3" class="text-2xl font-bold mb-2 text-gray-900">
      Vstupenky na koncert {{ selectedConcert.title }}
      <div class="text-base font-normal text-gray-600 mt-1">
        Začátek v {{ selectedConcert.time || "19:00" }}
      </div>
    </DialogTitle>
  </TicketPurchaseModal>

  <TransitionRoot appear :show="isTicketInfoModalOpen" as="template">
    <!-- ... copy the entire modal from ConcertGrid.vue ... -->
  </TransitionRoot>
</template>

<script setup>
import { ref, computed } from "vue";
import { useConcerts } from "~/composables/useConcerts";
import { useSupabaseClient } from "#imports";
import { slugify } from "~/utils/string";
import TicketPurchaseModal from "~/components/TicketPurchaseModal.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { formatDateWithTime } from "~/utils/date";

const supabase = useSupabaseClient();
const { concerts } = useConcerts();

const selectedConcert = ref({});
const isTicketModalOpen = ref(false);
const isTicketInfoModalOpen = ref(false);
const selectedGroup = ref("");

// Přidáme computed property pro filtrované koncerty
const filteredConcerts = computed(() => {
  if (!concerts.value) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return concerts.value
    .filter((concert) => {
      const concertDate = new Date(concert.date);
      concertDate.setHours(0, 0, 0, 0);

      // Filtrujeme podle vybraného tělesa, pokud je nastaveno
      if (selectedGroup.value && concert.group_name !== selectedGroup.value) {
        return false;
      }

      // Zobrazujeme pouze nadcházející a nearchivované koncerty
      return concertDate >= today && !concert.is_archived;
    })
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
</script>