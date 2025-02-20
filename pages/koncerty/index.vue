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

      <!-- Mobilní filtr (zobrazí se pouze na mobilech) -->
      <div class="md:hidden mb-12">
        <nav class="flex flex-col gap-2">
          <button
            @click="selectedGroup = ''"
            :class="[
              'w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left',
              selectedGroup === ''
                ? 'bg-red-50 text-red-800 font-semibold'
                : 'bg-white text-gray-500 hover:text-gray-900',
            ]"
          >
            Všechna tělesa
          </button>
          <button
            @click="selectedGroup = 'Marika Singers'"
            :class="[
              'w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left',
              selectedGroup === 'Marika Singers'
                ? 'bg-red-50 text-red-800 font-semibold'
                : 'bg-white text-gray-500 hover:text-gray-900',
            ]"
          >
            Marika Singers
          </button>
          <button
            @click="selectedGroup = 'Voices'"
            :class="[
              'w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left',
              selectedGroup === 'Voices'
                ? 'bg-red-50 text-red-800 font-semibold'
                : 'bg-white text-gray-500 hover:text-gray-900',
            ]"
          >
            Voices
          </button>
          <button
            @click="selectedGroup = 'Five'"
            :class="[
              'w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left',
              selectedGroup === 'Five'
                ? 'bg-red-50 text-red-800 font-semibold'
                : 'bg-white text-gray-500 hover:text-gray-900',
            ]"
          >
            Five
          </button>
        </nav>
      </div>

      <!-- Desktop filtr (zobrazí se pouze na desktopu) -->
      <div class="hidden md:block mb-12">
        <nav
          class="flex justify-center gap-1 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 mx-auto max-w-fit"
        >
          <button
            @click="selectedGroup = ''"
            :class="[
              'relative whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
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
              'relative whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
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
              'relative whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
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
              'relative whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
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
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <FadeUpOnScroll
          v-for="(concert, index) in filteredConcerts"
          :key="concert.id"
        >
          <div
            class="concert-card group flex flex-col bg-white rounded-3xl shadow-md ring-1 ring-black/5 hover:ring-2 hover:ring-red-800/20 hover:shadow-xl hover:shadow-red-800/10 transition-all duration-500"
            :class="{
              'md:col-span-2': index % 5 === 0,
              'lg:row-span-2': index % 7 === 3,
            }"
          >
            <div
              class="relative w-full"
              :class="{
                'aspect-[16/9]': index % 5 === 0,
                'aspect-[4/3]': !(index % 5 === 0),
              }"
            >
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
                <p class="text-gray-400 font-medium">
                  Obrázek není k dispozici
                </p>
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
                  <h3
                    class="font-bold text-2xl text-white group-hover:text-red-50 transition-colors duration-300"
                  >
                    {{ concert.title }}
                  </h3>
                </div>
              </div>
            </div>

            <div class="flex flex-col flex-grow p-6 space-y-4">
              <div class="flex items-center gap-2">
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

              <p class="text-gray-600 flex-grow line-clamp-3 text-lg">
                {{ concert.description }}
              </p>

              <footer class="flex gap-4 mt-6">
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

<style>
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
