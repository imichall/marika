<template>
  <div class="pb-16 mt-[100px]">
    <!-- Breadcrumbs in container -->
    <div class="container mx-auto px-4 mb-8">
      <Breadcrumbs>
        <BreadcrumbsItem>
          <NuxtLink
            to="/koncerty"
            class="ml-1 text-gray-700 hover:text-red-800 md:ml-2"
          >
            Koncerty
          </NuxtLink>
        </BreadcrumbsItem>
        <BreadcrumbsItem :isLast="true">
          <span class="ml-1 text-gray-500 md:ml-2">
            {{ concert?.title || "Detail koncertu" }}
          </span>
        </BreadcrumbsItem>
      </Breadcrumbs>
    </div>

    <!-- Full-width background section -->
    <div class="bg-pink-50 py-12">
      <div v-if="concert" class="container mx-auto px-4">
        <div class="mx-auto">
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
              {{ concert.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Other concerts section -->
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
const { concerts, getConcert } = useConcerts();
const concert = ref(null);
const loading = ref(true);

// Extract ID from the slug parameter (format: "id-title-slug")
const getId = (slug) => {
  const match = slug.match(/^(\d+)/);
  return match ? parseInt(match[1]) : null;
};

// Load concert data
onMounted(async () => {
  const id = getId(route.params.slug);
  if (id) {
    concert.value = await getConcert(id);
  }
  loading.value = false;
});

// Get other concerts excluding current one
const otherConcerts = computed(() => {
  const id = getId(route.params.slug);
  return concerts.value.filter((c) => c.id !== id);
});
</script>