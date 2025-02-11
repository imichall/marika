<template>
  <section>
    <div class="container mx-auto px-4">
      <div class="relative flex py-10 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-2xl text-black uppercase"
          >Nadcházející koncerty</span
        >
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <article
          v-for="concert in displayedConcerts"
          :key="concert.id"
          class="concert-card flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
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
              <h2 class="font-bold text-2xl">
                {{ concert.title }}
              </h2>
            </header>

            <p class="text-gray-600 flex-grow">{{ concert.description }}</p>

            <footer class="flex gap-4 mt-auto pt-4">
              <NuxtLink
                :to="`/koncerty/${concert.id}-${slugify(concert.title)}`"
                class="flex-1 bg-transparent text-black border border-black px-4 py-2 text-center hover:bg-black hover:text-white transition-colors duration-200"
                :aria-label="'Více informací o koncertu ' + concert.title"
              >
                Informace
              </NuxtLink>
              <button
                v-if="concert.ticket_id"
                @click="openTicketInfoModal(concert)"
                class="flex-1 bg-red-800 hover:bg-red-900 border border-red-800 text-white px-4 py-2 transition-colors duration-200"
                :aria-label="'Koupit vstupenky na koncert ' + concert.title"
              >
                Vstupenky
              </button>
              <button
                v-else
                @click="openTicketModal(concert)"
                class="flex-1 bg-red-800 hover:bg-red-900 border border-red-800 text-white px-4 py-2 transition-colors duration-200"
                :aria-label="'Koupit vstupenky na koncert ' + concert.title"
              >
                Vstupenky
              </button>
            </footer>
          </div>
        </article>
      </div>
      <div class="text-center mt-8">
        <NuxtLink
          to="/koncerty"
          class="inline-flex items-center gap-2 bg-transparent text-black underline underline-offset-8 px-8 py-3 group hover:text-red-800 transition-colors duration-200"
        >
          <span>Zobrazit všechny koncerty</span>
          <svg
            class="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
  <TicketPurchaseModal
    v-if="!selectedConcert.ticket_id"
    :is-open="isTicketModalOpen"
    :concert="selectedConcert"
    @close="isTicketModalOpen = false"
    @purchase="handlePurchase"
  />

  <TransitionRoot appear :show="isTicketInfoModalOpen" as="template">
    <Dialog as="div" @close="closeTicketInfoModal" class="relative z-50">
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
              class="bg-white p-8 rounded-2xl w-full max-w-md relative overflow-hidden"
            >
              <div class="absolute inset-0 overflow-hidden opacity-5">
                <div class="animate-float-slow text-6xl absolute top-4 left-4">
                  ♪
                </div>
                <div
                  class="animate-float-slow text-6xl absolute top-1/4 right-8"
                  style="animation-delay: 0.5s"
                >
                  ♫
                </div>
                <div
                  class="animate-float-slow text-6xl absolute bottom-1/4 left-8"
                  style="animation-delay: 1s"
                >
                  ♪
                </div>
                <div
                  class="animate-float-slow text-6xl absolute bottom-4 right-4"
                  style="animation-delay: 1.5s"
                >
                  ♫
                </div>

                <div
                  class="absolute -right-8 -top-8 w-32 h-32 opacity-20 rotate-12 animate-float-ticket"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
              </div>

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
const { concerts, getConcert } = useConcerts();
const displayedConcerts = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return concerts.value
    .filter((concert) => {
      const concertDate = new Date(concert.date);
      concertDate.setHours(0, 0, 0, 0);
      return concertDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
});

const selectedConcert = ref({});
const isTicketModalOpen = ref(false);
const isTicketInfoModalOpen = ref(false);

const openTicketModal = async (concert) => {
  const freshConcertData = await getConcert(concert.id);
  if (freshConcertData) {
    selectedConcert.value = freshConcertData;
    isTicketModalOpen.value = true;
  }
};

const openTicketInfoModal = async (concert) => {
  try {
    const freshConcertData = await getConcert(concert.id);
    if (!freshConcertData) throw new Error("Concert not found");

    const { data: ticketData, error } = await supabase
      .from("concert_tickets")
      .select("*")
      .eq("id", concert.ticket_id)
      .single();

    if (error) throw error;

    if (ticketData) {
      selectedConcert.value = {
        ...freshConcertData,
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
.animate-float-slow {
  animation: float 3s ease-in-out infinite;
}

.animate-float-ticket {
  animation: floatTicket 4s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes floatTicket {
  0%,
  100% {
    transform: rotate(12deg) translateY(0);
  }
  50% {
    transform: rotate(8deg) translateY(-15px);
  }
}
</style>
