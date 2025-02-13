<template>
  <div class="container mx-auto px-4 mt-[100px] mb-12">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Changelog</h1>
    </div>

    <div class="space-y-12">
      <!-- Main branch -->
      <div v-if="mainBranch" class="bg-white rounded-xl shadow-sm p-8">
        <div class="flex items-center gap-3 mb-6">
          <span
            class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
            >main</span
          >
          <h2 class="text-xl font-semibold">{{ mainBranch.version }}</h2>
          <a
            :href="mainBranch.url"
            target="_blank"
            class="text-blue-500 hover:text-blue-600"
          >
            <span class="material-icons-outlined">open_in_new</span>
          </a>
        </div>

        <div class="prose max-w-none">
          <div class="flex items-center gap-2 text-gray-600 mb-4">
            <span class="material-icons-outlined text-sm">person</span>
            <span>{{ mainBranch.author }}</span>
            <span class="mx-2">•</span>
            <span class="material-icons-outlined text-sm">schedule</span>
            <span>{{ mainBranch.date }}</span>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="font-medium text-gray-900">{{ mainBranch.lastCommit }}</p>
          </div>

          <!-- Historie změn pro main -->
          <div class="space-y-6">
            <div
              v-for="(change, index) in mainChangelog"
              :key="index"
              class="border-l-2 border-green-500 pl-4"
            >
              <h3 class="text-lg font-medium">{{ change.version }}</h3>
              <div class="text-sm text-gray-600 mb-2">
                {{ change.date }} • {{ change.author }}
              </div>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li v-for="(item, i) in change.changes" :key="i">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Dev branch -->
      <div v-if="devBranch" class="bg-white rounded-xl shadow-sm p-8">
        <div class="flex items-center gap-3 mb-6">
          <span
            class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
            >dev</span
          >
          <h2 class="text-xl font-semibold">{{ devBranch.version }}</h2>
          <a
            :href="devBranch.url"
            target="_blank"
            class="text-blue-500 hover:text-blue-600"
          >
            <span class="material-icons-outlined">open_in_new</span>
          </a>
        </div>

        <div class="prose max-w-none">
          <div class="flex items-center gap-2 text-gray-600 mb-4">
            <span class="material-icons-outlined text-sm">person</span>
            <span>{{ devBranch.author }}</span>
            <span class="mx-2">•</span>
            <span class="material-icons-outlined text-sm">schedule</span>
            <span>{{ devBranch.date }}</span>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="font-medium text-gray-900">{{ devBranch.lastCommit }}</p>
          </div>

          <!-- Historie změn pro dev -->
          <div class="space-y-6">
            <div
              v-for="(change, index) in devChangelog"
              :key="index"
              class="border-l-2 border-yellow-500 pl-4"
            >
              <h3 class="text-lg font-medium">{{ change.version }}</h3>
              <div class="text-sm text-gray-600 mb-2">
                {{ change.date }} • {{ change.author }}
              </div>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li v-for="(item, i) in change.changes" :key="i">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-gray-500 border-t-transparent"
        ></div>
      </div>

      <!-- Error state -->
      <div
        v-if="error"
        class="bg-red-50 text-red-600 p-4 rounded-lg text-center"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

import { ref, onMounted } from "vue";
import { useVersion } from "~/composables/useVersion";

const { mainBranch, devBranch, loading, error, fetchGitHubInfo } = useVersion();

// Příklad dat pro changelog
const mainChangelog = ref([
  {
    version: "v1.0.0",
    date: "2024-03-20",
    author: "Michal Linka",
    changes: [
      "Implementace správy koncertů",
      "Přidání systému pro objednávky vstupenek",
      "Vytvoření administračního rozhraní",
    ],
  },
  // Další záznamy...
]);

const devChangelog = ref([
  {
    version: "v1.1.0-dev",
    date: "2024-03-21",
    author: "Michal Linka",
    changes: [
      "Přidání verzování aplikace",
      "Implementace changelogu",
      "Vylepšení designu administrace",
    ],
  },
  // Další záznamy...
]);

onMounted(async () => {
  await fetchGitHubInfo();
});
</script>