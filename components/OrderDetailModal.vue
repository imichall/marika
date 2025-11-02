<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <!-- Pozadí -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Modal panel -->
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
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl transition-all border border-gray-200 dark:border-gray-800"
            >
              <div class="flex justify-between items-start mb-4">
                <DialogTitle
                  as="h3"
                  class="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Detail objednávky #{{ order.id }}
                </DialogTitle>
                <button
                  @click="$emit('close')"
                  class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                >
                  <span class="sr-only">Zavřít</span>
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Stav objednávky -->
              <div v-if="canEdit" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 class="font-medium mb-2 text-gray-900 dark:text-white">Stav objednávky</h4>
                <div class="flex gap-2">
                  <button
                    v-if="
                      permissions.complete && order.payment_status === 'pending'
                    "
                    @click="$emit('update-status', order.id, 'completed')"
                    class="px-3 py-1 rounded-full text-sm font-medium transition-colors"
                    :class="getStatusButtonClass('completed')"
                  >
                    {{ getStatusLabel("completed") }}
                  </button>
                  <button
                    v-if="
                      permissions.cancel && order.payment_status === 'pending'
                    "
                    @click="$emit('update-status', order.id, 'cancelled')"
                    class="px-3 py-1 rounded-full text-sm font-medium transition-colors"
                    :class="getStatusButtonClass('cancelled')"
                  >
                    {{ getStatusLabel("cancelled") }}
                  </button>
                </div>
              </div>

              <!-- Základní informace -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Stav platby</p>
                    <div class="mt-1 flex items-center">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700':
                            order.payment_status === 'pending',
                          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700':
                            order.payment_status === 'completed',
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700':
                            order.payment_status === 'cancelled',
                        }"
                      >
                        {{ paymentStatusText }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Datum vytvoření</p>
                    <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatDate(order.created_at) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Informace o zákazníkovi -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Informace o zákazníkovi
                </h4>
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Jméno</p>
                      <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {{ order.customer_name }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {{ order.customer_email }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detail objednávky -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Detail objednávky
                </h4>
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="space-y-4">
                    <div class="flex justify-between">
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Koncert</p>
                        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {{ getConcertTitle(order.concert_id) }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm text-gray-500 dark:text-gray-400">Počet vstupenek</p>
                        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {{ order.ticket_count }} ks
                        </p>
                      </div>
                    </div>
                    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div class="flex justify-between">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">
                          Celková cena
                        </p>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ order.total_price }} Kč
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Platební údaje -->
              <!-- <div v-if="order.payment_status === 'pending'" class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-2">
                  Platební údaje
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-500">Variabilní symbol</p>
                      <p class="mt-1 text-sm font-medium text-gray-900">
                        {{ order.variable_symbol }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Bankovní účet</p>
                      <p class="mt-1 text-sm font-medium text-gray-900">
                        {{ bankAccount }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
 -->
              <!-- Akce -->
              <div class="flex justify-end gap-3">
                <button
                  v-if="
                    permissions.complete && order.payment_status === 'pending'
                  "
                  @click="$emit('update-status', order.id, 'completed')"
                  class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  Označit jako zaplacené
                </button>
                <button
                  v-if="
                    permissions.cancel && order.payment_status === 'pending'
                  "
                  @click="$emit('update-status', order.id, 'cancelled')"
                  class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  Zrušit objednávku
                </button>
                <button
                  @click="$emit('close')"
                  class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors"
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

const props = defineProps<{
  isOpen: boolean;
  order: {
    id: number;
    concert_id: number;
    customer_name: string;
    customer_email: string;
    ticket_count: number;
    total_price: number;
    payment_status: "pending" | "completed" | "cancelled";
    variable_symbol?: string;
    created_at: string;
    updated_at: string;
  };
  bankAccount: string;
  getConcertTitle: (id: number) => string;
  canEdit: boolean;
  permissions: {
    complete: boolean;
    cancel: boolean;
  };
}>();

defineEmits<{
  (e: "close"): void;
  (
    e: "update-status",
    id: number,
    status: "pending" | "completed" | "cancelled"
  ): void;
}>();

const paymentStatusText = computed(() => {
  switch (props.order.payment_status) {
    case "pending":
      return "Čeká na platbu";
    case "completed":
      return "Zaplaceno";
    case "cancelled":
      return "Zrušeno";
    default:
      return "";
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Čeká na platbu";
    case "completed":
      return "Zaplaceno";
    case "cancelled":
      return "Zrušeno";
    default:
      return "";
  }
};

const getStatusButtonClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/50";
    case "completed":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50";
    case "cancelled":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50";
    default:
      return "";
  }
};
</script>