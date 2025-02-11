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

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="concert in filteredConcerts"
          :key="concert.id"
          class="concert-card grid gap-4"
        >
          <img
            :src="concert.image"
            :alt="concert.title"
            class="w-full h-48 object-cover"
          />
          <div class="flex flex-col gap-4">
            <div class="flex gap-4">
              <NuxtLink
                :to="`/koncerty/${concert.id}-${slugify(concert.title)}`"
                class="flex-1 bg-transparent text-black border border-black px-4 py-2 text-center hover:bg-black hover:text-white transition-colors duration-200"
              >
                Informace
              </NuxtLink>
              <button
                v-if="concert.ticket_id"
                @click="openTicketInfoModal(concert)"
                class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border border-red-800 text-white px-4 py-2 transition-colors duration-200"
              >
                Vstupenky
              </button>
              <button
                v-else
                @click="openTicketModal(concert)"
                class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border border-red-800 text-white px-4 py-2 transition-colors duration-200"
              >
                Vstupenky
              </button>
            </div>
            <p class="text-gray-600">
              {{ formatDateWithTime(concert.date, concert.time) }}
            </p>
            <h3 class="font-bold text-2xl">
              {{ concert.title }}<br />
              <span v-if="concert.group" class="text-gray-600 text-sm">
                ({{ concert.group }})
              </span>
            </h3>
            <p class="text-gray-600 font-thin">{{ concert.desc }}</p>
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

      // Zobrazujeme pouze nadcházející koncerty
      return concertDate >= today;
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