<template v-if="">
  <div class="container mx-auto px-4 py-8 pb-20">
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">{{ pageTitle }}</h1>
    </div>

    <!-- Obsah sekce -->
    // ... section content ...
  </div>
</template>

<script setup>
import { useToast } from "~/composables/useToast";
import { computed } from "vue";
import { useRoute } from "vue-router";

const toast = useToast();
const route = useRoute();

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pageTitle = computed(() => {
  switch (route.params.section) {
    case "galerie":
      return "Správa galerie";
    case "koncerty":
      return "Správa koncertů";
    case "kontakty":
      return "Správa kontaktů";
    case "socialni-site":
      return "Správa sociálních sítí";
    case "reference":
      return "Správa referencí";
    case "skupiny":
      return "Správa těles";
    default:
      return "Admin";
  }
});
</script>
