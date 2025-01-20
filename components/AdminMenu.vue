<template>
  <div class="fixed top-0 right-0 p-4 z-50 admin-menu">
    <div class="relative">
      <!-- Admin menu dropdown -->
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5"
      >
        <NuxtLink
          to="/admin/koncerty"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa koncertů
        </NuxtLink>
        <NuxtLink
          to="/admin/skupiny"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa skupin
        </NuxtLink>
        <NuxtLink
          to="/admin/galerie"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa galerie
        </NuxtLink>
        <NuxtLink
          to="/admin/reference"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa referencí
        </NuxtLink>
        <NuxtLink
          to="/admin/kontakty"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa kontaktů
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const isOpen = ref(false);

// Zavřít menu při kliknutí mimo
onMounted(() => {
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.closest(".admin-menu")) {
      isOpen.value = false;
    }
  });
});
</script>