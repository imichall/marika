<template>
  <div class="min-h-screen">
    <Navigation />
    <AdminMenu v-if="isAuthenticated" />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";

const { isAuthenticated } = useAuth();
</script>
