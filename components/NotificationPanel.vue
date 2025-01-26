<template>
  <div
    class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200"
    @click.stop
  >
    <div class="px-4 py-2 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">Nové objednávky</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="max-h-[400px] overflow-y-auto">
      <div
        v-if="orders.length === 0"
        class="px-4 py-6 text-center text-gray-500"
      >
        Žádné nové objednávky
      </div>
      <div v-else>
        <button
          v-for="order in orders"
          :key="order.id"
          @click="$emit('order-click', order.id)"
          class="w-full px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
        >
          <div class="flex justify-between items-start">
            <div class="text-left">
              <p class="font-medium text-gray-900">{{ order.customer_name }}</p>
              <p class="text-sm text-gray-600">{{ order.customer_email }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ order.ticket_count }} vstupenek za {{ order.total_price }} Kč
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">
                {{ formatDate(order.created_at) }}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <div
      v-if="orders.length > 0"
      class="px-4 py-2 border-t border-gray-200 bg-gray-50"
    >
      <button
        @click="$emit('order-click')"
        class="w-full text-center text-sm text-gray-600 hover:text-gray-900"
      >
        Zobrazit všechny objednávky
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  orders: {
    type: Array,
    required: true,
  },
});

defineEmits(["close", "order-click"]);

const formatDate = (date) => {
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
  width: 8px;
}

.max-h-[400px]::-webkit-scrollbar-track {
  background: #edf2f7;
}

.max-h-[400px]::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
  border: 2px solid #edf2f7;
}
</style>
