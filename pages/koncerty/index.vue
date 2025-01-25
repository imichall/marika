<template>
  <section class="pb-16 mt-[100px]">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8 text-center">Všechny koncerty</h1>

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

      <!-- Seznam koncertů -->
      <div
        v-if="filteredConcerts.length"
        class="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
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
                class="flex-1 bg-transparent text-black border border-black hover:bg-black hover:text-white px-4 py-2 text-center transition-colors duration-200"
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
            <p class="text-gray-600">{{ concert.date }}</p>
            <h3 class="font-bold text-2xl">
              {{ concert.title }}<br />
              <span v-if="concert.group" class="text-gray-600 text-sm">
                ({{ concert.group }})
              </span>
            </h3>
            <p class="text-gray-600 font-thin">{{ concert.description }}</p>
          </div>
        </div>
      </div>

      <!-- Žádné výsledky -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500 text-lg">
          Nebyly nalezeny žádné koncerty odpovídající zadaným kritériím.
        </p>
      </div>
    </div>
  </section>

  <!-- Ticket Purchase Modal -->
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
                  Vstupenky na koncert
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
                      Pro nákup vstupenek budete přesměrováni na stránky
                      poskytovatele {{ selectedConcert?.ticket?.provider }}, kde
                      můžete vstupenky bezpečně zakoupit.
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

const supabase = useSupabaseClient();
const { concerts } = useConcerts();

const selectedConcert = ref({});
const isTicketModalOpen = ref(false);
const isTicketInfoModalOpen = ref(false);

// Filtry a vyhledávání
const searchQuery = ref("");
const selectedGroup = ref("");
const ticketFilter = ref("");

// Filtrované koncerty
const filteredConcerts = computed(() => {
  return concerts.value.filter((concert) => {
    // Filtr podle vyhledávání
    const searchMatch = searchQuery.value
      ? concert.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        concert.description
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      : true;

    // Filtr podle tělesa
    const groupMatch = selectedGroup.value
      ? concert.group === selectedGroup.value
      : true;

    // Filtr podle vstupenek
    const ticketMatch = ticketFilter.value
      ? ticketFilter.value === "withTickets"
        ? concert.ticket_id
        : !concert.ticket_id
      : true;

    return searchMatch && groupMatch && ticketMatch;
  });
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

<style scoped>
/* Přidáme animaci pro přechody při filtrování */
.grid {
  transition: all 0.3s ease-in-out;
}

.concert-card {
  transition: all 0.3s ease-in-out;
}
</style>
