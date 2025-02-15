<template>
  <section id="testimonials" class="pb-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="relative flex py-10 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-2xl text-black uppercase"
          >Napsali o nás</span
        >
        <div class="flex-grow border-t border-gray-400"></div>
      </div>

      <!-- Debug info -->
      <div v-if="error" class="text-red-600 mb-4">
        Chyba při načítání: {{ error }}
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading" class="flex gap-8 overflow-hidden">
        <div
          v-for="n in 3"
          :key="n"
          class="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 text-center p-8"
        >
          <div class="space-y-4 bg-gray-50 p-8 rounded-2xl">
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded-full animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded-full animate-pulse"></div>
              <div
                class="h-4 w-2/3 mx-auto bg-gray-200 rounded-full animate-pulse"
              ></div>
            </div>
            <div
              class="h-5 w-32 mx-auto bg-gray-200 rounded-full animate-pulse"
            ></div>
            <div
              class="h-4 w-24 mx-auto bg-gray-200 rounded-full animate-pulse"
            ></div>
          </div>
        </div>
      </div>

      <!-- Actual content -->
      <div v-else-if="testimonials?.length" class="relative px-4 lg:px-12">
        <FadeUpOnScroll>
          <!-- Slider controls -->
          <button
            @click="previousSlide"
            class="absolute -left-5 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-10 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-400 group-hover:text-red-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div class="overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-out"
              :style="{
                transform: `translateX(-${
                  currentSlide * (100 / visibleSlides)
                }%)`,
              }"
            >
              <!-- Klonované poslední položky pro plynulý loop ze začátku na konec -->
              <div
                v-for="testimonial in lastClonedItems"
                :key="'last-' + testimonial.id"
                class="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 p-4"
              >
                <div
                  @mouseenter="handleMouseEnter"
                  @mouseleave="handleMouseLeave"
                  class="h-full bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div class="flex-grow">
                    <svg
                      class="w-8 h-8 text-red-300 mb-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
                      />
                    </svg>
                    <p class="italic text-gray-600 mb-6">
                      {{ testimonial.text }}
                    </p>
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">
                      {{ testimonial.author }}
                    </p>
                    <p
                      v-if="testimonial.source"
                      class="text-sm text-gray-500 mt-1"
                    >
                      {{ testimonial.source }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Hlavní položky -->
              <div
                v-for="testimonial in testimonials"
                :key="testimonial.id"
                class="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 p-4"
              >
                <div
                  @mouseenter="handleMouseEnter"
                  @mouseleave="handleMouseLeave"
                  class="h-full bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div class="flex-grow">
                    <svg
                      class="w-8 h-8 text-red-300 mb-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
                      />
                    </svg>
                    <p class="italic text-gray-600 mb-6">
                      {{ testimonial.text }}
                    </p>
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">
                      {{ testimonial.author }}
                    </p>
                    <p
                      v-if="testimonial.source"
                      class="text-sm text-gray-500 mt-1"
                    >
                      {{ testimonial.source }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Klonované první položky pro plynulý loop z konce na začátek -->
              <div
                v-for="testimonial in firstClonedItems"
                :key="'first-' + testimonial.id"
                class="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 p-4"
              >
                <div
                  @mouseenter="handleMouseEnter"
                  @mouseleave="handleMouseLeave"
                  class="h-full bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div class="flex-grow">
                    <svg
                      class="w-8 h-8 text-red-300 mb-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
                      />
                    </svg>
                    <p class="italic text-gray-600 mb-6">
                      {{ testimonial.text }}
                    </p>
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">
                      {{ testimonial.author }}
                    </p>
                    <p
                      v-if="testimonial.source"
                      class="text-sm text-gray-500 mt-1"
                    >
                      {{ testimonial.source }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="nextSlide"
            class="absolute -right-5 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-10 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-400 group-hover:text-red-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Dots navigation -->
          <div class="flex justify-center gap-3 mt-8">
            <button
              v-for="index in totalSlides"
              :key="index"
              @click="goToSlide(index - 1)"
              class="w-2.5 h-2.5 rounded-full transition-all duration-300 hover:scale-125"
              :class="
                currentSlide === index - 1
                  ? 'bg-red-500 scale-125'
                  : 'bg-gray-300'
              "
            ></button>
          </div>
        </FadeUpOnScroll>
      </div>

      <!-- No data message -->
      <div v-else class="text-center text-gray-500">
        Zatím zde nejsou žádné reference.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import FadeUpOnScroll from "~/components/FadeUpOnScroll.vue";

const { testimonials, loading, error } = useTestimonials();
const currentSlide = ref(0);
const visibleSlides = ref(3);
const isTransitioning = ref(false);
const autoplayInterval = ref(null);

// Počet klonovaných položek na každé straně pro plynulý loop
const CLONE_COUNT = 3;

// Computed properties pro klonované položky
const firstClonedItems = computed(() => {
  if (!testimonials.value) return [];
  return testimonials.value.slice(0, CLONE_COUNT);
});

const lastClonedItems = computed(() => {
  if (!testimonials.value) return [];
  return testimonials.value.slice(-CLONE_COUNT);
});

const totalSlides = computed(() => {
  if (!testimonials.value) return 0;
  return testimonials.value.length;
});

// Přepočítáme počet viditelných slidů podle šířky okna
const updateVisibleSlides = () => {
  if (window.innerWidth < 768) {
    visibleSlides.value = 1;
  } else if (window.innerWidth < 1024) {
    visibleSlides.value = 2;
  } else {
    visibleSlides.value = 3;
  }
};

const nextSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentSlide.value++;

  // Pokud jsme na konci, přeskočíme na začátek po dokončení animace
  if (currentSlide.value >= totalSlides.value) {
    setTimeout(() => {
      isTransitioning.value = false;
      currentSlide.value = 0;
    }, 500);
  } else {
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
  }
};

const previousSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentSlide.value--;

  // Pokud jsme na začátku, přeskočíme na konec po dokončení animace
  if (currentSlide.value < 0) {
    setTimeout(() => {
      isTransitioning.value = false;
      currentSlide.value = totalSlides.value - 1;
    }, 500);
  } else {
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
  }
};

const goToSlide = (index) => {
  if (isTransitioning.value) return;
  currentSlide.value = index;
};

const startAutoplay = () => {
  autoplayInterval.value = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
};

// Event listeners a lifecycle hooks
onMounted(() => {
  updateVisibleSlides();
  window.addEventListener("resize", updateVisibleSlides);
  startAutoplay();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateVisibleSlides);
  stopAutoplay();
});

// Zastavíme autoplay při hoveru nad sliderem
const handleMouseEnter = () => {
  stopAutoplay();
};

const handleMouseLeave = () => {
  startAutoplay();
};

// Sledujeme změny v testimonials a resetujeme slider
watch(testimonials, () => {
  currentSlide.value = 0;
});
</script>

<style scoped>
.testimonial-enter-active,
.testimonial-leave-active {
  transition: all 0.5s ease;
}

.testimonial-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.testimonial-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
