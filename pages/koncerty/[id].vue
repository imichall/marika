<template>
  <div class="pb-16 mt-[100px]">
    <!-- Breadcrumbs in container -->
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
              <NuxtLink
                to="/koncerty"
                class="ml-1 text-gray-700 hover:text-red-800 md:ml-2"
              >
                Koncerty
              </NuxtLink>
            </div>
          </li>
          <li aria-current="page">
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
                {{ concert?.title || "Detail koncertu" }}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>

    <!-- Full-width background section -->
    <div class="bg-pink-50 py-12">
      <div v-if="concert" class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Image Column -->
            <div class="h-full">
              <img
                :src="concert.image"
                :alt="concert.title"
                class="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>

            <!-- Content Column -->
            <div class="flex flex-col justify-between space-y-6 bg-white p-10">
              <div class="space-y-6">
                <h1 class="text-4xl font-bold text-custom-gray">
                  {{ concert.title }}
                </h1>
                <p class="text-sm">
                  Čas a datum vystoupení<br />
                  <span class="text-2xl font-bold text-custom-gray">{{
                    concert.date
                  }}</span>
                </p>
                <p class="text-sm">
                  Cena vstupenky<br />
                  <span class="text-2xl font-bold text-custom-gray"
                    >{{ concert.price }},- Kč</span
                  >
                </p>
              </div>

              <div class="mt-auto flex flex-col gap-4">
                <button
                  class="w-full bg-red-800 border border-red-800 text-white px-4 py-3 hover:bg-red-900 transition-colors duration-200"
                >
                  Koupit vstupenky
                </button>
                <button
                  class="w-full bg-transparent border border-black text-black px-4 py-3 hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Stáhnout plakát akce
                </button>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4 mt-10">
            <h4 class="text-2xl font-medium">Informace o koncertu</h4>
            <p class="text-gray-600">
              {{ concert.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Other concerts section in container -->
    <div class="container mx-auto px-4">
      <div v-if="otherConcerts.length" class="mt-16">
        <div class="relative flex py-5 items-center">
          <div class="flex-grow border-t border-gray-400"></div>
          <span class="flex-shrink mx-4 text-black uppercase"
            >Další koncerty</span
          >
          <div class="flex-grow border-t border-gray-400"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="otherConcert in otherConcerts"
            :key="otherConcert.id"
            class="bg-white shadow-lg"
          >
            <NuxtLink
              :to="`/koncerty/${otherConcert.id}-${slugify(
                otherConcert.title
              )}`"
            >
              <img
                :src="otherConcert.image"
                :alt="otherConcert.title"
                class="w-full h-48 object-cover"
              />
              <div class="p-4">
                <h3 class="text-xl font-semibold mb-2">
                  {{ otherConcert.title }}
                  <span
                    v-if="otherConcert.group"
                    class="text-gray-600 text-sm block mt-1"
                  >
                    ({{ otherConcert.group }})
                  </span>
                </h3>
                <p class="text-gray-600">{{ otherConcert.date }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { slugify } from "~/utils/string";

const route = useRoute();
const { concerts } = useConcerts();

const concert = computed(() =>
  concerts.value.find((c) => c.id === parseInt(route.params.id))
);

const otherConcerts = computed(() =>
  concerts.value.filter((c) => c.id !== parseInt(route.params.id))
);
</script>