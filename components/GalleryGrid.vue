<template>
  <section class="py-16 bg-gray-100 font-instrument">
    <div class="container mx-auto px-4">
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-black uppercase">Galerie</span>
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
    </div>
    <div class="mx-auto p-4">
      <div class="grid grid-cols-7 grid-rows-3 gap-2">
        <!-- Velký čtverec vlevo nahoře -->
        <div class="col-span-2 row-span-2 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[9]}`"
            alt="Gallery image 10"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Menší čtverce vpravo nahoře -->
        <div class="overflow-hidden col-span-2 rounded-xl row-span-1">
          <img
            :src="`/images/mansory/${galleryImages[5]}`"
            alt="Gallery image 6"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div class="overflow-hidden rounded-xl col-span-2 row-span-2">
          <img
            :src="`/images/mansory/${galleryImages[3]}`"
            alt="Gallery image 4"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Široký obdélník vpravo -->
        <div class="col-span-1 row-span-2 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[1]}`"
            alt="Gallery image 2"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div class="overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[7]}`"
            alt="Gallery image 6"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div class="overflow-hidden rounded-xl row-span-2">
          <img
            :src="`/images/mansory/${galleryImages[4]}`"
            alt="Gallery image 3"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div class="col-span-3 row-span-1 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[6]}`"
            alt="Gallery image 5"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div class="col-span-2 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[2]}`"
            alt="Gallery image 1"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div class="col-span-1 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[0]}`"
            alt="Gallery image 1"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const galleryImages = [
  "mansory-00001.png",
  "mansory-00002.png",
  "mansory-00003.png",
  "mansory-00004.png",
  "mansory-00005.png",
  "mansory-00006.png",
  "mansory-00007.png",
  "mansory-00008.png",
  "mansory-00009.png",
  "mansory-00010.png",
];
</script>

<style scoped>
.grid {
  /* Přidáme smooth transition pro hover efekty */
  @apply transition-all duration-300 ease-in-out;
}

/* Přidáme hover efekt pro každý obrázek */
.grid > div {
  @apply transition-transform duration-300 hover:z-10;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* .grid > div:hover {
  transform: scale(1.01);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
} */
</style>