<template>
  <div
    ref="fadeElement"
    :class="[
      'transition-all duration-1000 ease-out',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
    ]"
  >
    <slot />
  </div>
</template>

  <script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const fadeElement = ref(null);
const isVisible = ref(false);
let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = entry.isIntersecting;
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: "50px",
    }
  );

  if (fadeElement.value) {
    observer.observe(fadeElement.value);
  }
});

onBeforeUnmount(() => {
  if (observer && fadeElement.value) {
    observer.unobserve(fadeElement.value);
  }
});
</script>