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
    <div class="bg-pink-50 py-12">
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
            <div class="h-full">
              <img
                :src="concert.image"
                :alt="concert.title"
                class="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>

            <!-- Content Column -->
            <div class="flex flex-col justify-between space-y-6 bg-white p-10">
              <div class="space-y-6">
                <h1 class="text-4xl font-bold text-custom-gray">
                  {{ concert.title }}
                </h1>
                <p class="text-sm">
                  Čas a datum vystoupení<br />
                  <span class="text-2xl font-bold text-custom-gray">{{
                    concert.date
                  }}</span>
                </p>
                <p class="text-sm">
                  Cena vstupenky<br />
                  <span class="text-2xl font-bold text-custom-gray"
                    >{{ concert.price }},- Kč</span
                  >
                </p>
              </div>

              <div class="mt-auto flex flex-col gap-4">
                <button
                  v-if="concert.ticket_id"
                  @click="openTicketInfoModal(concert)"
                  class="w-full bg-red-800 border border-red-800 text-white px-4 py-3 hover:bg-red-900 transition-colors duration-200"
                >
                  Koupit vstupenky
                </button>
                <button
                  v-else
                  @click="openTicketModal(concert)"
                  class="w-full bg-red-800 border border-red-800 text-white px-4 py-3 hover:bg-red-900 transition-colors duration-200"
                >
                  Koupit vstupenky
                </button>
                <button
                  class="w-full bg-transparent border border-black text-black px-4 py-3 hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Stáhnout plakát akce
                </button>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4 mt-10">
            <h4 class="text-2xl font-medium">Informace o koncertu</h4>
            <p class="text-gray-600">
              {{ concert.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Other concerts section -->
    <div class="container mx-auto px-4">
      <div v-if="otherConcerts.length" class="mt-16">
        <div class="relative flex py-5 items-center">
          <div class="flex-grow border-t border-gray-400"></div>
          <span class="flex-shrink mx-4 text-black uppercase"
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
                <p class="text-gray-600">{{ otherConcert.date }}</p>
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

const route = useRoute();
const { concerts, getConcert } = useConcerts();
const concert = ref(null);
const loading = ref(true);
const supabase = useSupabaseClient();

const selectedConcert = ref({});
const isTicketModalOpen = ref(false);
const isTicketInfoModalOpen = ref(false);

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

// Get other concerts excluding current one
const otherConcerts = computed(() => {
  const id = getId(route.params.slug);
  return concerts.value.filter((c) => c.id !== id);
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
</style>