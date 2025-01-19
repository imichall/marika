<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <p>Načítání koncertů...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p>{{ error }}</p>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="concert in concerts"
        :key="concert.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <img
          v-if="concert.image"
          :src="concert.image"
          :alt="concert.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h3 class="text-xl font-bold">{{ concert.title }}</h3>
          <p class="text-gray-600">{{ formatDate(concert.date) }}</p>
          <p class="text-sm text-gray-500">{{ concert.group }}</p>
          <p class="mt-2">{{ concert.desc }}</p>
          <p class="mt-2 font-bold">{{ concert.price }} Kč</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useConcerts } from "~/composables/useConcerts";

const { concerts, loading, error, fetchConcerts } = useConcerts();

// Znovu načteme data při mounted
onMounted(() => {
  console.log("Koncerty page mounted");
  fetchConcerts();
});

// Sledujeme změny v datech
watch(concerts, (newConcerts) => {
  console.log("Concerts updated:", newConcerts);
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>