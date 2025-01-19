<template>
  <footer id="contact" class="bg-gray-100 pt-12">
    <div class="container mx-auto px-4">
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-black uppercase">Kontakt</span>
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Marika Singers -->
        <div class="bg-pink-50 p-6">
          <h3 class="font-bold mb-2">Marika Singers, z.s.</h3>
          <p>Pod Labuťkou 967</p>
          <p>180 00 Praha 8</p>
          <p class="mt-4">IČO: 27069699</p>
        </div>

        <!-- VOICES -->
        <div class="bg-white p-6">
          <h3 class="font-bold mb-2">VOICES</h3>
          <p>Institut F1, Praha 8</p>
          <p>IČO: 27069699 / DIČ: 27069699</p>
          <p class="mt-4">
            <a
              href="mailto:info@voices.cz"
              class="text-gray-600 hover:text-gray-900"
            >
              info@voices.cz
            </a>
          </p>
        </div>

        <!-- FIVE -->
        <div class="bg-gray-50 p-6">
          <h3 class="font-bold mb-2">FIVE</h3>
          <p>Institut F1, Praha 8</p>
          <p>IČO: 27069699 / DIČ: 27069699</p>
        </div>
      </div>
    </div>
    <div class="text-center mt-8 py-4 text-sm bg-black text-white">
      © {{ currentYear }} Marika Singers, z.s.
    </div>
  </footer>
</template>

<script setup>
import { computed } from "vue";

const currentYear = computed(() => new Date().getFullYear());
</script>