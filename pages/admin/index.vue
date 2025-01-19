<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <h1 class="text-3xl font-bold mb-8">Administrace</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Koncerty -->
      <NuxtLink
        to="/admin/koncerty"
        class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Koncerty</h2>
          <span class="text-2xl text-gray-600">🎵</span>
        </div>
        <p class="text-gray-600">Správa koncertů a vystoupení</p>
        <p class="mt-2 text-sm text-gray-500">{{ concerts.length }} koncertů</p>
      </NuxtLink>

      <!-- Skupiny -->
      <NuxtLink
        to="/admin/skupiny"
        class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Skupiny</h2>
          <span class="text-2xl text-gray-600">👥</span>
        </div>
        <p class="text-gray-600">Správa pěveckých skupin</p>
        <p class="mt-2 text-sm text-gray-500">3 skupiny</p>
      </NuxtLink>

      <!-- Galerie -->
      <NuxtLink
        to="/admin/galerie"
        class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Galerie</h2>
          <span class="text-2xl text-gray-600">🖼️</span>
        </div>
        <p class="text-gray-600">Správa fotografií</p>
        <p class="mt-2 text-sm text-gray-500">
          {{ galleryImages.length }} fotografií
        </p>
      </NuxtLink>

      <!-- Reference -->
      <NuxtLink
        to="/admin/reference"
        class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Reference</h2>
          <span class="text-2xl text-gray-600">💬</span>
        </div>
        <p class="text-gray-600">Správa referencí a recenzí</p>
        <p class="mt-2 text-sm text-gray-500">
          {{ testimonials.length }} referencí
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { concerts } = useConcerts();
const testimonials = useTestimonials()?.testimonials || [];
const galleryImages = useGallery()?.galleryImages || [];
</script>
