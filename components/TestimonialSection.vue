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

          <!-- Add testimonial button -->
          <div class="text-center mt-12">
            <button
              @click="showAddModal = true"
              class="inline-flex items-center gap-2 bg-transparent text-black border-2 border-black px-6 py-3 rounded-xl hover:bg-black hover:text-white transition-all duration-300 group"
            >
              <span>Napište nám</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 transform transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </FadeUpOnScroll>
      </div>

      <!-- No data message -->
      <div v-else class="text-center text-gray-500">
        Zatím zde nejsou žádné reference.
      </div>
    </div>

    <!-- Add Testimonial Modal -->
    <TransitionRoot appear :show="showAddModal" as="template">
      <Dialog as="div" @close="showAddModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle as="h3" class="text-2xl font-bold mb-4">
                  Napište nám reference
                </DialogTitle>

                <form
                  v-if="!testimonialForm.submitted"
                  @submit.prevent="handleSubmitTestimonial"
                  class="space-y-4"
                >
                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Vaše jméno
                    </label>
                    <input
                      v-model="testimonialForm.name"
                      type="text"
                      required
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      :class="{ 'border-red-500': testimonialErrors.name }"
                    />
                    <p
                      v-if="testimonialErrors.name"
                      class="text-red-500 text-sm mt-1"
                    >
                      {{ testimonialErrors.name }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Váš email
                    </label>
                    <input
                      v-model="testimonialForm.email"
                      type="email"
                      required
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      :class="{ 'border-red-500': testimonialErrors.email }"
                    />
                    <p
                      v-if="testimonialErrors.email"
                      class="text-red-500 text-sm mt-1"
                    >
                      {{ testimonialErrors.email }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Vaše reference
                    </label>
                    <textarea
                      v-model="testimonialForm.text"
                      required
                      rows="4"
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      :class="{ 'border-red-500': testimonialErrors.text }"
                      placeholder="Napište nám, jak jste byli spokojeni..."
                    ></textarea>
                    <p
                      v-if="testimonialErrors.text"
                      class="text-red-500 text-sm mt-1"
                    >
                      {{ testimonialErrors.text }}
                    </p>
                  </div>

                  <div class="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      @click="showAddModal = false"
                      class="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                      :disabled="isSubmitting"
                    >
                      {{ isSubmitting ? "Odesílám..." : "Odeslat" }}
                    </button>
                  </div>
                </form>

                <!-- Potvrzující zpráva -->
                <div v-else class="text-center py-8 space-y-4">
                  <svg
                    class="w-16 h-16 text-green-500 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <h3 class="text-xl font-medium text-gray-900">
                    Vaše zpráva byla úspěšně odeslána.
                  </h3>
                  <p class="text-gray-600">
                    Děkujeme
                  </p>
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { useSupabaseClient } from "#imports";
import { useTestimonials } from "~/composables/useTestimonials";
import FadeUpOnScroll from "~/components/FadeUpOnScroll.vue";
import { useToast } from "~/composables/useToast";

const supabase = useSupabaseClient();
const {
  testimonials: testimonialsFromHook,
  loading: loadingTestimonials,
  error: errorTestimonials,
  fetchTestimonials,
} = useTestimonials();
const testimonials = ref([]);
const currentSlide = ref(0);
const visibleSlides = ref(3);
const isTransitioning = ref(false);
const loading = ref(true);
const error = ref(null);

// Načtení testimonials a schválených zpráv z formuláře
const fetchAllTestimonials = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Načteme testimonials pomocí composable
    await fetchTestimonials();

    // Načteme schválené zprávy z formuláře pomocí anonymního klienta
    const { data: formMessages, error: formError } = await supabase
      .from("form_messages")
      .select("*")
      .eq("status", "approved")
      .eq("is_testimonial", true)
      .order("created_at", { ascending: false });

    if (formError) throw formError;

    // Spojíme data dohromady
    testimonials.value = [
      ...testimonialsFromHook.value,
      ...(formMessages || []).map((msg) => ({
        id: `form_${msg.id}`,
        text: msg.message,
        author: msg.name || msg.email,
        source: "",
        created_at: msg.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

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

// Event listeners a lifecycle hooks
onMounted(() => {
  updateVisibleSlides();
  window.addEventListener("resize", updateVisibleSlides);
  fetchAllTestimonials();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateVisibleSlides);
});

// Zastavíme autoplay při hoveru nad sliderem
const handleMouseEnter = () => {
  // Autoplay is disabled in the new version
};

const handleMouseLeave = () => {
  // Autoplay is disabled in the new version
};

// Sledujeme změny v testimonials a resetujeme slider
watch(testimonials, () => {
  currentSlide.value = 0;
});

const showAddModal = ref(false);
const isSubmitting = ref(false);
const toast = useToast();

const testimonialForm = ref({
  email: "",
  name: "",
  text: "",
  submitted: false,
});

const testimonialErrors = ref({
  email: "",
  name: "",
  text: "",
});

const validateForm = () => {
  testimonialErrors.value = {};
  let isValid = true;

  if (!testimonialForm.value.name) {
    testimonialErrors.value.name = "Jméno je povinné";
    isValid = false;
  }

  if (!testimonialForm.value.email) {
    testimonialErrors.value.email = "Email je povinný";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testimonialForm.value.email)) {
    testimonialErrors.value.email = "Zadejte platný email";
    isValid = false;
  }

  if (!testimonialForm.value.text) {
    testimonialErrors.value.text = "Text reference je povinný";
    isValid = false;
  } else if (testimonialForm.value.text.length < 10) {
    testimonialErrors.value.text = "Text musí mít alespoň 10 znaků";
    isValid = false;
  }

  return isValid;
};

const handleSubmitTestimonial = async () => {
  if (!validateForm()) return;

  try {
    isSubmitting.value = true;
    const { error } = await supabase.from("form_messages").insert([
      {
        email: testimonialForm.value.email,
        name: testimonialForm.value.name,
        message: testimonialForm.value.text,
        is_testimonial: true,
        status: "pending",
      },
    ]);

    if (error) throw error;

    toast.success("Děkujeme za vaši referenci. Po schválení bude zveřejněna.");

    // Resetujeme formulář
    resetForm();

    // Zobrazíme potvrzující zprávu v modálu
    testimonialForm.value.submitted = true;

    // Zavřeme modál po 3 sekundách
    setTimeout(() => {
      showAddModal.value = false;
      testimonialForm.value.submitted = false;
    }, 3000);
  } catch (err) {
    console.error("Error submitting testimonial:", err);
    toast.error("Nepodařilo se odeslat referenci. Zkuste to prosím později.");
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  testimonialForm.value = {
    email: "",
    name: "",
    text: "",
    submitted: false,
  };
  testimonialErrors.value = { email: "", name: "", text: "" };
};
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
