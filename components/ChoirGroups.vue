<template>
  <section id="about" class="pb-16 bg-white font-instrument">
    <div class="container mx-auto px-4">
      <div class="relative flex py-10 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-2xl text-black uppercase"
          >O nás</span
        >
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"
        ></div>
      </div>
      <div v-else-if="error" class="text-center text-red-600 py-8">
        {{ error }}
      </div>
      <div v-else class="grid grid-cols-1 gap-12">
        <div
          v-for="group in groups"
          :key="group.id"
          class="text-center grid grid-cols-1 md:grid-cols-2 gap-14"
        >
          <div>
            <img
              :src="group.image"
              :alt="group.name"
              class="w-full h-full object-cover mb-4 border border-gray-200 p-2"
            />
          </div>
          <div class="grid grid-rows-[100px_auto_auto] justify-items-start">
            <h3 class="text-[36px] font-regular mb-2">{{ group.name }}</h3>
            <p class="text-gray-600 mb-4 text-left">{{ group.description }}</p>
            <a
              v-if="
                group.button_link &&
                group.button_link !== 'null' &&
                group.button_link !== null
              "
              :href="group.button_link"
              target="_blank"
              class="border border-black px-6 py-2 self-end uppercase inline-flex items-center gap-2 group hover:bg-black hover:text-white transition-all duration-300"
            >
              Poslechnout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="transform transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useChoirGroups } from "~/composables/useChoirGroups";

const { groups, loading, error, fetchGroups } = useChoirGroups();

onMounted(async () => {
  await fetchGroups();
});
</script>
