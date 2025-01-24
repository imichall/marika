<template>
  <div>
    <Navigation />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";
import { useRoute } from "#imports";
import { computed } from "vue";
import Navigation from "~/components/Navigation.vue";

const { isAuthenticated } = useAuth();
const route = useRoute();

const isAdminRoute = computed(() => {
  return route.path.startsWith("/admin");
});
</script>
