<template>
  <div>
    <Head>
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
        rel="stylesheet"
      />
    </Head>
    <Navigation />
    <NuxtLayout>
      <NuxtPage />
      <Footer v-if="!isAdminRoute && !isConcertRoute" />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";
import { useRoute } from "#imports";
import { computed } from "vue";
import Navigation from "~/components/Navigation.vue";
import Footer from "~/components/Footer.vue";

const { isAuthenticated } = useAuth();
const route = useRoute();

const isAdminRoute = computed(() => {
  return route.path.startsWith("/admin");
});

const isConcertRoute = computed(() => {
  return route.path.startsWith("/koncerty");
});
</script>
