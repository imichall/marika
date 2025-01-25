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

      <!-- Sociální sítě -->
      <NuxtLink
        to="/admin/socialni-site"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Sociální sítě</h2>
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
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa sociálních sítí</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
          >
            {{ socialMedia?.length || 0 }} odkazů
          </span>
        </div>
      </NuxtLink>

      <!-- Objednávky vstupenek -->
      <NuxtLink
        to="/admin/objednavky"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Objednávky</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-teal-600"
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
        </div>
        <p class="text-gray-600">Správa objednávek vstupenek</p>
        <div class="mt-4 flex items-center gap-1.5">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ pendingOrders }} čeká
          </span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ completedOrders }} zaplaceno
          </span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ cancelledOrders }} zrušeno
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

      <!-- Nastavení -->
      <NuxtLink
        to="/admin/system"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Nastavení</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa systémových nastavení</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
          >
            Bankovní účty
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
const { concerts } = useConcerts();
const testimonials = useTestimonials()?.testimonials || [];
const galleryImages = useGallery()?.galleryImages || [];
const { socialMedia } = useSocialMedia();
const { orders, getAllOrders } = useTicketOrders();

// Načtení dat při mounted
onMounted(async () => {
  await getAllOrders();
});

// Přidám computed properties pro počty objednávek
const pendingOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "pending")
      .length || 0
);

const completedOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "completed")
      .length || 0
);

const cancelledOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "cancelled")
      .length || 0
);
</script>
