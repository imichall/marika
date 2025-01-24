<template>
  <div class="mb-6 flex items-center space-x-2 text-sm">
    <NuxtLink
      to="/admin"
      class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    </NuxtLink>

    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <span class="text-gray-400">/</span>
      <NuxtLink
        :to="crumb.path"
        class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
        :class="{ 'text-red-600': index === breadcrumbs.length - 1 }"
      >
        {{ crumb.name }}
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

interface Breadcrumb {
  name: string;
  path: string;
}

const route = useRoute();

const breadcrumbs = computed<Breadcrumb[]>(() => {
  const path = route.path;
  const parts = path.split("/").filter((part) => part);
  const crumbs: Breadcrumb[] = [];
  let currentPath = "";

  parts.forEach((part) => {
    currentPath += `/${part}`;

    if (part === "admin") return;

    let name = part.charAt(0).toUpperCase() + part.slice(1);

    const nameMap: Record<string, string> = {
      koncerty: "Koncerty",
      skupiny: "Skupiny",
      galerie: "Galerie",
      reference: "Reference",
      novinky: "Novinky",
      kontakty: "Kontakty",
      objednavky: "Objednávky",
      new: "Nový záznam",
      edit: "Upravit",
    };

    if (nameMap[part]) {
      name = nameMap[part];
    }

    crumbs.push({
      name,
      path: currentPath,
    });
  });

  return crumbs;
});
</script>