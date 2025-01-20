<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs nad nadpisem -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Administrace</h1>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
    >
      <!-- Koncerty -->
      <NuxtLink
        to="/admin/koncerty"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Koncerty</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa koncertů a vystoupení</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
          >
            {{ concerts.length }} koncertů
          </span>
        </div>
      </NuxtLink>

      <!-- Skupiny -->
      <NuxtLink
        to="/admin/skupiny"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Skupiny</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa pěveckých skupin</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            3 skupiny
          </span>
        </div>
      </NuxtLink>

      <!-- Galerie -->
      <NuxtLink
        to="/admin/galerie"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Galerie</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa fotografií</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
          >
            {{ galleryImages.length }} fotografií
          </span>
        </div>
      </NuxtLink>

      <!-- Reference -->
      <NuxtLink
        to="/admin/reference"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Reference</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa referencí a recenzí</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
          >
            {{ testimonials.length }} referencí
          </span>
        </div>
      </NuxtLink>

      <!-- Novinky -->
      <NuxtLink
        to="/admin/novinky"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Novinky</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa novinek a aktualit</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
          >
            Spravovat
          </span>
        </div>
      </NuxtLink>

      <!-- Kontakty -->
      <NuxtLink
        to="/admin/kontakty"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Kontakty</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-rose-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa kontaktních údajů</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm"
          >
            Upravit
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
const { concerts } = useConcerts();
const testimonials = useTestimonials()?.testimonials || [];
const galleryImages = useGallery()?.galleryImages || [];
</script>
