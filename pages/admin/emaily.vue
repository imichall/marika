<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Historie emailů</h1>
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

import { ref, onMounted } from "vue";
import { useEmailLogs } from "~/composables/useEmailLogs";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const { logs, loading, error, fetchEmailLogs } = useEmailLogs();

// Stav pro detail modal
const isDetailModalOpen = ref(false);
const selectedLog = ref(null);

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

// Načtení dat při mounted
onMounted(() => {
  fetchEmailLogs();
});
</script>