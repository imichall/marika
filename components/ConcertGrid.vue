<template>
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-black uppercase"
          >Nadcházející koncerty</span
        >
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="concert in displayedConcerts"
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
                class="flex-1 bg-transparent text-black border border-black px-4 py-2 text-center hover:bg-black hover:text-white transition-colors duration-200"
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
      <div class="text-center mt-8">
        <NuxtLink
          to="/koncerty"
          class="inline-flex items-center gap-2 bg-transparent text-black underline underline-offset-8 px-8 py-3 group hover:text-red-800 transition-colors duration-200"
        >
          <span>Zobrazit všechny koncerty</span>
          <svg
            class="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useConcerts } from "~/composables/useConcerts";

const { concerts } = useConcerts();
const displayedConcerts = computed(() => concerts.value.slice(0, 3));
</script>
