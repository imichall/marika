<template>
  <section id="gallery" class="pb-16 bg-gray-100">
    <div class="container mx-auto px-4">
      <div class="relative flex py-10 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-2xl text-black uppercase"
          >Galerie</span
        >
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
    </div>
    <div class="mx-auto px-4">
      <!-- Grid galerie -->
      <div
        v-if="images.length > 0"
        class="grid grid-cols-7 grid-rows-3 gap-2 aspect-[7/3]"
      >
        <!-- Velký obrázek vlevo nahoře (2x2) -->
        <div
          v-if="getImageByPosition(1)"
          class="col-span-2 row-span-2 relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(1))"
        >
          <img
            :src="getImageByPosition(1).image_url"
            :alt="getImageByPosition(1).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Široký obrázek nahoře uprostřed (2x1) -->
        <div
          v-if="getImageByPosition(2)"
          class="col-span-2 relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(2))"
        >
          <img
            :src="getImageByPosition(2).image_url"
            :alt="getImageByPosition(2).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Velký obrázek vpravo nahoře (2x2) -->
        <div
          v-if="getImageByPosition(3)"
          class="col-span-2 row-span-2 relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(3))"
        >
          <img
            :src="getImageByPosition(3).image_url"
            :alt="getImageByPosition(3).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Úzký vysoký obrázek vpravo (1x2) -->
        <div
          v-if="getImageByPosition(4)"
          class="row-span-2 relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(4))"
        >
          <img
            :src="getImageByPosition(4).image_url"
            :alt="getImageByPosition(4).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Malý čtvercový obrázek (1x1) -->
        <div
          v-if="getImageByPosition(5)"
          class="relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(5))"
        >
          <img
            :src="getImageByPosition(5).image_url"
            :alt="getImageByPosition(5).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Úzký vysoký obrázek (1x2) -->
        <div
          v-if="getImageByPosition(6)"
          class="row-span-2 relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(6))"
        >
          <img
            :src="getImageByPosition(6).image_url"
            :alt="getImageByPosition(6).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Široký obrázek dole (3x1) -->
        <div
          v-if="getImageByPosition(7)"
          class="col-span-3 relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(7))"
        >
          <img
            :src="getImageByPosition(7).image_url"
            :alt="getImageByPosition(7).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Široký obrázek dole (2x1) -->
        <div
          v-if="getImageByPosition(8)"
          class="col-span-2 relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(8))"
        >
          <img
            :src="getImageByPosition(8).image_url"
            :alt="getImageByPosition(8).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Malý čtvercový obrázek dole (1x1) -->
        <div
          v-if="getImageByPosition(9)"
          class="relative overflow-hidden rounded-xl cursor-pointer"
          @click="openLightbox(getImageByPosition(9))"
        >
          <img
            :src="getImageByPosition(9).image_url"
            :alt="getImageByPosition(9).title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        Načítání galerie...
      </div>
    </div>

    <!-- Lightbox -->
    <TransitionRoot appear :show="isLightboxOpen" as="template">
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
          <div class="fixed inset-0 bg-black bg-opacity-90" />
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
              <DialogPanel
                class="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-transparent p-6 text-left align-middle shadow-xl transition-all"
              >
                <button
                  @click="previousImage"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-8 h-8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>

                <button
                  @click="nextImage"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-8 h-8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>

                <img
                  :src="currentImage?.image_url"
                  :alt="currentImage?.title"
                  class="w-full h-auto max-h-[80vh] object-contain mx-auto"
                />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </section>
</template>

<script setup>
import { useGallery } from "~/composables/useGallery";
import { computed, onMounted, ref, onUnmounted } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
} from "@headlessui/vue";

const { images, fetchAllVisibleImages } = useGallery();
const isLightboxOpen = ref(false);
const currentImageIndex = ref(0);

// Načtení obrázků při vytvoření komponenty
onMounted(async () => {
  await fetchAllVisibleImages();
  // Přidání event listeneru pro klávesové šipky
  window.addEventListener("keydown", handleKeyDown);
});

// Funkce pro získání obrázku podle pozice
const getImageByPosition = (position) => {
  return images.value.find((img) => img.position === position);
};

// Lightbox funkce
const currentImage = computed(() => {
  const visibleImages = images.value.filter((img) => img.position !== null);
  return visibleImages[currentImageIndex.value];
});

const openLightbox = (image) => {
  const visibleImages = images.value.filter((img) => img.position !== null);
  currentImageIndex.value = visibleImages.findIndex(
    (img) => img.id === image.id
  );
  isLightboxOpen.value = true;
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
};

const previousImage = () => {
  const visibleImages = images.value.filter((img) => img.position !== null);
  currentImageIndex.value =
    (currentImageIndex.value - 1 + visibleImages.length) % visibleImages.length;
};

const nextImage = () => {
  const visibleImages = images.value.filter((img) => img.position !== null);
  currentImageIndex.value =
    (currentImageIndex.value + 1) % visibleImages.length;
};

// Přidání ovládání pomocí klávesových šipek
const handleKeyDown = (event) => {
  if (!isLightboxOpen.value) return;

  switch (event.key) {
    case "ArrowLeft":
      previousImage();
      break;
    case "ArrowRight":
      nextImage();
      break;
    case "Escape":
      closeLightbox();
      break;
  }
};

// Cleanup event listener při zničení komponenty
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.grid > div {
  @apply transition-transform duration-300;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.grid > div img {
  @apply w-full h-full object-cover;
  filter: grayscale(100%);
  transition: filter 0.3s ease-in-out, transform 0.3s;
}

.grid > div:hover img {
  filter: grayscale(0%);
}

.dialog-panel img {
  filter: grayscale(100%);
  transition: filter 0.3s ease-in-out;
}

.dialog-panel img:hover {
  filter: grayscale(0%);
}
</style>