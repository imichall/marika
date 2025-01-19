<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa novinek</h1>
    </div>
  </div>
</template>

<script setup>
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";

definePageMeta({
  layout: "admin",
});
</script>