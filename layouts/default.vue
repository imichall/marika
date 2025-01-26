<template>
  <div class="min-h-screen">
    <Navigation />
    <main>
      <slot />
    </main>
    <!-- <Footer /> -->
  </div>
</template>

<script setup lang="ts">
defineComponent({
  name: "DefaultLayout",
});

import Navigation from "~/components/Navigation.vue";
import Footer from "~/components/Footer.vue";
</script>