<template>
  <div
    ref="panelRef"
    class="absolute right-0 mt-2 w-[420px] bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 transform transition-all duration-200 ease-out"
    @click.stop
  >
    <!-- Hlavička -->
    <div class="px-4 py-3 border-b border-gray-100">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Nové objednávky</h3>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ orders.length }} čekajících na vyřízení
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <span class="sr-only">Zavřít</span>
          <svg
            class="h-5 w-5"
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
    </div>

    <!-- Seznam objednávek -->
    <div class="max-h-[400px] overflow-y-auto overflow-x-hidden">
      <div v-if="orders.length === 0" class="px-4 py-8 text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p class="mt-4 text-gray-500 text-sm">Žádné nové objednávky</p>
      </div>
      <div v-else class="divide-y divide-gray-100">
        <button
          v-for="order in orders"
          :key="order.id"
          @click="$emit('order-click', order.id)"
          class="w-full px-4 py-3 hover:bg-gray-50 transition-colors duration-200 group"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 truncate group-hover:text-red-600 transition-all duration-200 transform group-hover:translate-x-0.5 text-left"
              >
                {{ order.customer_name }}
              </p>
              <p
                class="text-sm text-gray-500 mt-0.5 truncate transform transition-all duration-200 group-hover:translate-x-0.5 text-left"
              >
                {{ order.customer_email }}
              </p>
              <p
                class="text-sm text-gray-600 mt-0.5 truncate transform transition-all duration-200 group-hover:translate-x-0.5 text-left"
              >
                {{ order.concert_name }}
              </p>
              <div class="flex items-center mt-2 space-x-4">
                <span
                  class="inline-flex items-center text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full transition-all duration-200 transform group-hover:scale-105"
                >
                  <svg
                    class="mr-1.5 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                  {{ order.ticket_count }} vstupenek
                </span>
                <span class="inline-flex items-center text-xs text-gray-500">
                  <svg
                    class="mr-1.5 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ order.total_price }} Kč
                </span>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 text-right">
              <p class="text-xs text-gray-500">
                {{ formatDate(order.created_at) }}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Patička -->
    <div
      v-if="orders.length > 0"
      class="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl"
    >
      <button
        @click="$emit('order-click')"
        class="w-full text-center text-sm text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
      >
        Zobrazit všechny objednávky
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  orders: {
    id: number;
    customer_name: string;
    customer_email: string;
    concert_name: string;
    ticket_count: number;
    total_price: number;
    created_at: string;
  }[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "order-click", id?: number): void;
}>();

const panelRef = ref<HTMLElement | null>(null);

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  // Ignore the first click that opened the panel
  if (event.target && (event.target as Element).closest(".notification-bell")) {
    return;
  }

  if (panelRef.value && !panelRef.value.contains(event.target as Node)) {
    emit("close");
  }
};

onMounted(() => {
  // Add the handler on the next tick to avoid catching the click that opened the panel
  setTimeout(() => {
    document.addEventListener("click", handleClickOutside);
  }, 0);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.max-h-[400px] {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #edf2f7;
}

.max-h-[400px]::-webkit-scrollbar {
  width: 6px;
}

.max-h-[400px]::-webkit-scrollbar-track {
  background: #edf2f7;
  border-radius: 3px;
}

.max-h-[400px]::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}
</style>
