<template>
  <section class="pb-16 mt-[100px]">
    <div class="container mx-auto px-4 mb-8">
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="items-center">
            <NuxtLink
              to="/"
              class="text-gray-700 hover:text-red-800 flex items-center"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                />
              </svg>
              Domů
            </NuxtLink>
          </li>
          <li>
            <div class="flex items-center">
              <svg
                class="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="ml-1 text-gray-500 md:ml-2">
                {{ concert?.title || "Všechny koncerty" }}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>
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
                class="flex-1 bg-transparent text-black border border-black px-4 py-2 text-center"
              >
                Informace
              </NuxtLink>
              <button
                class="flex-1 bg-red-800 border border-red-800 text-white px-4 py-2"
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