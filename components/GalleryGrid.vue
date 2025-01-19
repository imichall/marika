<template>
  <section id="gallery" class="py-16 bg-gray-100 font-instrument">
    <div class="container mx-auto px-4">
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-black uppercase">Galerie</span>
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
    </div>
    <div class="mx-auto p-4">
      <div class="grid grid-cols-7 grid-rows-3 gap-2">
        <div class="col-span-2 row-span-2 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[9]}`"
            alt="Gallery image 10"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(9)"
          />
        </div>

        <div class="overflow-hidden col-span-2 rounded-xl row-span-1">
          <img
            :src="`/images/mansory/${galleryImages[5]}`"
            alt="Gallery image 6"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(5)"
          />
        </div>

        <div class="overflow-hidden rounded-xl col-span-2 row-span-2">
          <img
            :src="`/images/mansory/${galleryImages[3]}`"
            alt="Gallery image 4"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(3)"
          />
        </div>

        <div class="col-span-1 row-span-2 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[1]}`"
            alt="Gallery image 2"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(1)"
          />
        </div>

        <div class="overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[7]}`"
            alt="Gallery image 6"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(7)"
          />
        </div>
        <div class="overflow-hidden rounded-xl row-span-2">
          <img
            :src="`/images/mansory/${galleryImages[4]}`"
            alt="Gallery image 3"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(4)"
          />
        </div>

        <div class="col-span-3 row-span-1 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[6]}`"
            alt="Gallery image 5"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(6)"
          />
        </div>

        <div class="col-span-2 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[2]}`"
            alt="Gallery image 1"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(2)"
          />
        </div>
        <div class="col-span-1 overflow-hidden rounded-xl">
          <img
            :src="`/images/mansory/${galleryImages[0]}`"
            alt="Gallery image 1"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openLightbox(0)"
          />
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <TransitionRoot appear :show="showLightbox" as="template">
      <Dialog as="div" @close="closeLightbox" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/90" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="relative w-full max-w-7xl">
                <button
                  @click="closeLightbox"
                  class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10 p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <button
                  @click="previousImage"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200 z-10 p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-12 h-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                <button
                  @click="nextImage"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200 z-10 p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-12 h-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <img
                  :src="`/images/mansory/${galleryImages[currentImageIndex]}`"
                  :alt="`Gallery image ${currentImageIndex + 1}`"
                  class="w-full h-auto max-h-[85vh] object-contain mx-auto"
                />

                <div
                  class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm"
                >
                  {{ currentImageIndex + 1 }} / {{ galleryImages.length }}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </section>
</template>

<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
} from "@headlessui/vue";
import { ref } from "vue";

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

const showLightbox = ref(false);
const currentImageIndex = ref(0);

const openLightbox = (index) => {
  currentImageIndex.value = index;
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};

const previousImage = () => {
  currentImageIndex.value =
    (currentImageIndex.value - 1 + galleryImages.length) % galleryImages.length;
};

const nextImage = () => {
  currentImageIndex.value =
    (currentImageIndex.value + 1) % galleryImages.length;
};
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