<template>
  <div class="container mx-auto px-4 my-[100px]">
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Historie emailů</h1>
      <button
        @click="navigateToPreview"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <span>Náhled emailu</span>
      </button>
    </div>

    <!-- Loading stav -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"
      ></div>
    </div>

    <!-- Error stav -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6"
    >
      {{ error }}
    </div>

    <!-- Tabulka s emaily -->
    <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Příjemce
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Předmět
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Stav
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vytvořeno
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Odesláno
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="openDetailModal(log)"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ log.recipient }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ log.subject }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': log.status === 'pending',
                    'bg-green-100 text-green-800': log.status === 'sent',
                    'bg-red-100 text-red-800': log.status === 'failed',
                  }"
                >
                  {{ getStatusText(log.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ log.sent_at ? formatDate(log.sent_at) : "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginace -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Zobrazuji {{ startIndex + 1 }} až
            {{ Math.min(endIndex, totalEmails) }} z {{ totalEmails }} emailů
          </div>
          <div class="flex space-x-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Předchozí
            </button>
            <div class="flex items-center space-x-1">
              <template v-for="page in displayedPages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-1 border rounded-md',
                    currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'hover:bg-gray-100',
                  ]"
                >
                  {{ page }}
                </button>
                <span v-else class="px-2">...</span>
              </template>
            </div>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Další
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <TransitionRoot appear :show="isDetailModalOpen" as="template">
      <Dialog as="div" @close="closeDetailModal" class="relative z-50">
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
                class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle as="h3" class="text-2xl font-bold mb-4">
                  Detail emailu
                </DialogTitle>

                <div v-if="selectedLog" class="space-y-4">
                  <div>
                    <h4 class="font-medium text-gray-700">Příjemce</h4>
                    <p>{{ selectedLog.recipient }}</p>
                  </div>

                  <div>
                    <h4 class="font-medium text-gray-700">Předmět</h4>
                    <p>{{ selectedLog.subject }}</p>
                  </div>

                  <div>
                    <h4 class="font-medium text-gray-700">Obsah</h4>
                    <div
                      class="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap"
                    >
                      {{ selectedLog.body }}
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h4 class="font-medium text-gray-700">Stav</h4>
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full mt-1"
                        :class="{
                          'bg-yellow-100 text-yellow-800':
                            selectedLog.status === 'pending',
                          'bg-green-100 text-green-800':
                            selectedLog.status === 'sent',
                          'bg-red-100 text-red-800':
                            selectedLog.status === 'failed',
                        }"
                      >
                        {{ getStatusText(selectedLog.status) }}
                      </span>
                    </div>

                    <div v-if="selectedLog.error_message">
                      <h4 class="font-medium text-gray-700">Chybová zpráva</h4>
                      <p class="text-red-600">
                        {{ selectedLog.error_message }}
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h4 class="font-medium text-gray-700">Vytvořeno</h4>
                      <p>{{ formatDate(selectedLog.created_at) }}</p>
                    </div>

                    <div v-if="selectedLog.sent_at">
                      <h4 class="font-medium text-gray-700">Odesláno</h4>
                      <p>{{ formatDate(selectedLog.sent_at) }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex justify-end">
                  <button
                    @click="closeDetailModal"
                    class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Zavřít
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Preview modal -->
    <TransitionRoot appear :show="isPreviewModalOpen" as="template">
      <Dialog as="div" @close="closePreviewModal" class="relative z-50">
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
                <DialogTitle as="h3" class="text-2xl font-bold mb-4">
                  Náhled emailu
                </DialogTitle>

                <!-- Testovací formulář -->
                <div
                  class="bg-white rounded-xl p-6 mb-8 border border-gray-200"
                >
                  <h2 class="text-xl font-bold mb-4">Testovací formulář</h2>
                  <form @submit.prevent="updatePreview" class="space-y-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Příjemce
                      </label>
                      <input
                        v-model="previewForm.to"
                        type="email"
                        required
                        class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Předmět
                      </label>
                      <input
                        v-model="previewForm.subject"
                        type="text"
                        required
                        class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Obsah
                      </label>
                      <textarea
                        v-model="previewForm.content"
                        rows="6"
                        required
                        class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      ></textarea>
                    </div>

                    <div class="flex justify-end">
                      <button
                        type="submit"
                        class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Aktualizovat náhled
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Email náhled -->
                <EmailPreview
                  :to="previewForm.to"
                  :subject="previewForm.subject"
                >
                  <div v-html="formattedContent"></div>
                </EmailPreview>

                <div class="mt-6 flex justify-end space-x-4">
                  <button
                    @click="closePreviewModal"
                    class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Zavřít
                  </button>
                  <button
                    @click="loadTestData"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Načíst testovací data
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
  permission: {
    section: "emails",
    action: "view",
  },
});

import { ref, onMounted, computed } from "vue";
import { useEmailLogs } from "~/composables/useEmailLogs";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { useRouter } from "#imports";
import EmailPreview from "~/components/EmailPreview.vue";

const router = useRouter();
const currentPage = ref(1);
const itemsPerPage = 10;
const totalEmails = ref(0);

// Načtení emailů s paginací
const { logs, loading, error, fetchEmailLogs } = useEmailLogs({
  page: currentPage,
  itemsPerPage,
  onTotalChange: (total) => {
    totalEmails.value = total;
  },
});

// Computed properties pro paginaci
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => startIndex.value + itemsPerPage);
const totalPages = computed(() => Math.ceil(totalEmails.value / itemsPerPage));

// Zobrazené stránky v paginaci
const displayedPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    // Pokud je méně stránek než maximum, zobrazíme všechny
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Vždy zobrazíme první stránku
    pages.push(1);

    // Určíme rozsah zobrazených stránek kolem aktuální stránky
    let start = Math.max(2, currentPage.value - 1);
    let end = Math.min(totalPages.value - 1, currentPage.value + 1);

    // Přidáme tři tečky po první stránce, pokud je potřeba
    if (start > 2) {
      pages.push("...");
    }

    // Přidáme stránky v rozsahu
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Přidáme tři tečky před poslední stránkou, pokud je potřeba
    if (end < totalPages.value - 1) {
      pages.push("...");
    }

    // Vždy zobrazíme poslední stránku
    pages.push(totalPages.value);
  }

  return pages;
});

// Funkce pro navigaci
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchEmailLogs();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchEmailLogs();
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchEmailLogs();
};

// Stav pro detail modal
const isDetailModalOpen = ref(false);
const selectedLog = ref(null);

// Stav pro preview modal
const isPreviewModalOpen = ref(false);
const previewForm = ref({
  to: "",
  subject: "",
  content: "",
});

// Testovací data
const testData = {
  to: "test@example.com",
  subject: "Potvrzení registrace na koncert",
  content: `Vážený zákazníku,

děkujeme za Vaši registraci na koncert Marika Singers.

Detaily objednávky:
- Název koncertu: Vánoční koncert 2024
- Datum: 24. 12. 2024
- Čas: 19:00
- Počet vstupenek: 2
- Celková cena: 500 Kč

Vstupenky si můžete vyzvednout na místě před začátkem koncertu.

V případě jakýchkoliv dotazů nás neváhejte kontaktovat.`,
};

// Formátování data
const formatDate = (date) => {
  return new Date(date).toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Překlad stavů
const getStatusText = (status) => {
  const statusMap = {
    pending: "Čeká na odeslání",
    sent: "Odesláno",
    failed: "Chyba",
  };
  return statusMap[status] || status;
};

// Otevření detailu
const openDetailModal = (log) => {
  selectedLog.value = log;
  isDetailModalOpen.value = true;
};

// Zavření detailu
const closeDetailModal = () => {
  selectedLog.value = null;
  isDetailModalOpen.value = false;
};

// Načtení testovacích dat
const loadTestData = () => {
  previewForm.value = { ...testData };
};

// Formátování obsahu - převod nových řádků na <br>
const formattedContent = computed(() => {
  return previewForm.value.content.replace(/\n/g, "<br>");
});

const navigateToPreview = () => {
  isPreviewModalOpen.value = true;
  if (!previewForm.value.to) {
    loadTestData();
  }
};

const closePreviewModal = () => {
  isPreviewModalOpen.value = false;
};

const updatePreview = () => {
  // Formulář se automaticky aktualizuje díky v-model
};

// Načtení dat při mounted
onMounted(() => {
  fetchEmailLogs();
});
</script>