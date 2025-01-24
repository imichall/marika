<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center px-4">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p class="text-xl text-gray-600 mb-8">Stránka nebyla nalezena</p>
      <NuxtLink
        to="/"
        class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Zpět na hlavní stránku
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
});
</script>