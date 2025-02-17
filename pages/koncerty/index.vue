<template>
  <section class="pb-16 mt-[100px]">
    <div class="container mx-auto px-4 mb-8">
      <Breadcrumbs>
        <BreadcrumbsItem :isLast="true">
          <span class="ml-1 text-gray-500 md:ml-2"> Koncerty </span>
        </BreadcrumbsItem>
      </Breadcrumbs>
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

      <!-- Seznam koncertů -->
      <div
        v-if="filteredConcerts.length"
        class="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <FadeUpOnScroll v-for="concert in filteredConcerts" :key="concert.id">
          <div
            class="concert-card flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div class="relative aspect-[4/3] overflow-hidden">
              <img
                v-if="concert.image"
                :src="concert.image"
                :alt="concert.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                v-else
                class="w-full h-full bg-gray-100 flex items-center justify-center"
              >
                <span class="text-gray-400">Bez obrázku</span>
              </div>
            </div>

            <div class="flex flex-col flex-grow p-4 space-y-4">
              <header>
                <div class="flex items-center gap-2 mb-2">
                  <time :datetime="concert.date" class="text-gray-600 text-sm">
                    {{ formatDateWithTime(concert.date, concert.time) }}
                  </time>
                  <span class="text-gray-400">•</span>
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
                <h3 class="font-bold text-2xl">
                  {{ concert.title }}
                </h3>
              </header>

              <p class="text-gray-600 flex-grow">{{ concert.description }}</p>

              <footer class="flex gap-4 mt-auto pt-4">
                <NuxtLink
                  :to="`/koncerty/${concert.id}-${slugify(concert.title)}`"
                  class="flex-1 bg-transparent text-black border border-black px-4 py-2 text-center hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Informace
                </NuxtLink>
                <button
                  v-if="concert.ticket_id"
                  @click="openTicketInfoModal(concert)"
                  class="flex-1 bg-red-800 hover:bg-red-900 border border-red-800 text-white px-4 py-2 transition-colors duration-200"
                >
                  Vstupenky
                </button>
                <button
                  v-else
                  @click="openTicketModal(concert)"
                  class="flex-1 bg-red-800 hover:bg-red-900 border border-red-800 text-white px-4 py-2 transition-colors duration-200"
                >
                  Vstupenky
                </button>
              </footer>
            </div>
          </div>
        </FadeUpOnScroll>
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
                      Tento koncert není v naší režii. Prosíme obraťte se na
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
import FadeUpOnScroll from "~/components/FadeUpOnScroll.vue";

const supabase = useSupabaseClient();
const { concerts } = useConcerts();

const selectedConcert = ref({});
const isTicketModalOpen = ref(false);
const isTicketInfoModalOpen = ref(false);

// Moderní filtr pro tělesa
const selectedGroup = ref("");

// Upravená computed property pro filtrované koncerty - pouze podle tělesa
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

<style scoped>
/* Přidáme animaci pro přechody při filtrování */
.grid {
  transition: all 0.3s ease-in-out;
}

.concert-card {
  transition: all 0.3s ease-in-out;
}
</style>
