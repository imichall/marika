<template>
  <div class="min-h-screen bg-white text-slate-900">
    <Head>
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
        rel="stylesheet"
      />
    </Head>
    <Navigation v-if="!isAdminRoute && !isConcertRoute && !isMembersRoute" />
    <NuxtLayout>
      <NuxtPage />
      <Footer v-if="!isAdminRoute && !isConcertRoute && !isMembersRoute" />
      <ConsentManager v-if="!isAdminRoute" />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";
import { useRoute } from "#imports";
import { computed } from "vue";
import Navigation from "~/components/Navigation.vue";
import Footer from "~/components/Footer.vue";
import ConsentManager from "~/components/ConsentManager.vue";

const { isAuthenticated } = useAuth();
const route = useRoute();

const isAdminRoute = computed(() => {
  return route.path.startsWith("/admin");
});

const isConcertRoute = computed(() => route.path.startsWith("/koncerty"));
const isMembersRoute = computed(() => route.path.startsWith("/clenska-sekce"));
</script>
