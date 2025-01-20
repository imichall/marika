<template>
  <section class="pb-16 mt-[100px]">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8 text-center">Všechny koncerty</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="concert in concerts"
          :key="concert.id"
          class="concert-card grid gap-4"
        >
          <img
            :src="concert.image"
            :alt="concert.title"
            class="w-full h-48 object-cover"
          />
          <div class="flex flex-col gap-4">
            <div class="flex gap-4">
              <NuxtLink
                :to="`/koncerty/${concert.id}-${slugify(concert.title)}`"
                class="flex-1 bg-transparent text-black border border-black hover:bg-black hover:text-white px-4 py-2 text-center transition-colors duration-200"
              >
                Informace
              </NuxtLink>
              <button
                class="flex-1 bg-red-800 hover:bg-white hover:text-red-800 border border-red-800 text-white px-4 py-2 transition-colors duration-200"
              >
                Vstupenky
              </button>
            </div>
            <p class="text-gray-600">{{ concert.date }}</p>
            <h3 class="font-bold text-2xl">
              {{ concert.title }}<br />
              <span v-if="concert.group" class="text-gray-600 text-sm">
                ({{ concert.group }})
              </span>
            </h3>
            <p class="text-gray-600 font-thin">{{ concert.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useConcerts } from "~/composables/useConcerts";
import { slugify } from "~/utils/string";

const { concerts } = useConcerts();
</script>
No newline at end of file
