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
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="n in 3"
          :key="n"
          class="text-center p-6 border border-gray-200"
        >
          <div class="space-y-4">
            <!-- Text skeleton -->
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div
                class="h-4 w-2/3 mx-auto bg-gray-200 rounded animate-pulse"
              ></div>
            </div>
            <!-- Author skeleton -->
            <div
              class="h-5 w-32 mx-auto bg-gray-200 rounded animate-pulse"
            ></div>
            <!-- Source skeleton -->
            <div
              class="h-4 w-24 mx-auto bg-gray-200 rounded animate-pulse"
            ></div>
          </div>
        </div>
      </div>

      <!-- Actual content -->
      <div
        v-else-if="testimonials?.length"
        class="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.id"
          class="text-center p-6 border border-gray-200"
        >
          <p class="italic mb-4">{{ testimonial.text }}</p>
          <p class="font-bold">{{ testimonial.author }}</p>
          <p v-if="testimonial.source" class="text-sm text-gray-600">
            {{ testimonial.source }}
          </p>
        </div>
      </div>

      <!-- No data message -->
      <div v-else class="text-center text-gray-500">
        Zatím zde nejsou žádné reference.
      </div>
    </div>
  </section>
</template>

<script setup>
const { testimonials, loading, error } = useTestimonials();
</script>

<style>
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
