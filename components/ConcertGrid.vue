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
              <button
                class="flex-1 bg-transparent text-black border border-black px-4 py-2"
              >
                Informace
              </button>
              <button
                class="flex-1 bg-red-800 border border-red-800 text-white px-4 py-2"
              >
                Vstupenky
              </button>
            </div>
            <h3 class="font-bold">{{ concert.title }}</h3>
            <p class="text-gray-600">{{ concert.location }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const concerts = [
  {
    id: 1,
    title: "PRAHA",
    location: "MKD, Mělník, Praha",
    image: "/images/article-image.png",
  },
  {
    id: 2,
    title: "PRAHA",
    location: "MKD, Mělník, Praha",
    image: "/images/article-image-2.png",
  },
  {
    id: 3,
    title: "PRAHA",
    location: "MKD, Mělník, Praha",
    image: "/images/article-image-3.png",
  },
  // ... další koncerty
];
</script>
