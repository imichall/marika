<template>
  <div>
    <Navigation />
    <div class="container mx-auto px-4 mt-[100px]">
      <!-- Breadcrumbs nad obsahem -->
      <AdminBreadcrumbs />

      <!-- Slot pro obsah podsekcí -->
      <slot />
    </div>
  </div>
</template>

<script setup>
import Navigation from "~/components/Navigation.vue";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
</script>