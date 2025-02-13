<template>
  <div class="container mx-auto px-4 mt-[100px] mb-12">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Changelog</h1>
      <button
        v-if="canEdit"
        @click="showAddModal = true"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
      >
        <span class="material-icons-outlined">add</span>
        Přidat záznam
      </button>
    </div>

    <div class="space-y-12">
      <!-- Main branch -->
      <div v-if="mainBranch" class="bg-white rounded-xl shadow-sm p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <span
              class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >main</span
            >
            <h2 class="text-xl font-semibold">{{ mainBranch.version }}</h2>
            <span
              v-if="mainBranch.tag"
              class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
            >
              {{ mainBranch.tag }}
            </span>
            <a
              :href="`#${mainBranch.tag || mainBranch.version}`"
              class="text-blue-500 hover:text-blue-600"
            >
              <span class="material-icons-outlined">link</span>
            </a>
          </div>
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
              v-for="entry in mainEntries"
              :key="entry.id"
              class="border-l-2 border-green-500 pl-4 relative group"
              :id="entry.version"
            >
              <div
                v-if="canEdit"
                class="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2"
              >
                <button
                  @click="editEntry(entry)"
                  class="p-1 text-blue-500 hover:text-blue-600"
                >
                  <span class="material-icons-outlined">edit</span>
                </button>
                <button
                  @click="deleteEntry(entry.id)"
                  class="p-1 text-red-500 hover:text-red-600"
                >
                  <span class="material-icons-outlined">delete</span>
                </button>
              </div>
              <h3 class="text-lg font-medium">{{ entry.version }}</h3>
              <div class="text-sm text-gray-600 mb-2">
                {{ formatDate(entry.date) }} • {{ entry.author }}
              </div>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li v-for="(change, i) in entry.changes" :key="i">
                  {{ change }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Dev branch -->
      <div v-if="devBranch" class="bg-white rounded-xl shadow-sm p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <span
              class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
              >dev</span
            >
            <h2 class="text-xl font-semibold">{{ devBranch.version }}</h2>
            <span
              v-if="devBranch.tag"
              class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
            >
              {{ devBranch.tag }}
            </span>
            <a
              :href="`#${devBranch.tag || devBranch.version}`"
              class="text-blue-500 hover:text-blue-600"
            >
              <span class="material-icons-outlined">link</span>
            </a>
          </div>
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
              v-for="entry in devEntries"
              :key="entry.id"
              class="border-l-2 border-yellow-500 pl-4 relative group"
              :id="entry.version"
            >
              <div
                v-if="canEdit"
                class="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2"
              >
                <button
                  @click="editEntry(entry)"
                  class="p-1 text-blue-500 hover:text-blue-600"
                >
                  <span class="material-icons-outlined">edit</span>
                </button>
                <button
                  @click="deleteEntry(entry.id)"
                  class="p-1 text-red-500 hover:text-red-600"
                >
                  <span class="material-icons-outlined">delete</span>
                </button>
              </div>
              <h3 class="text-lg font-medium">{{ entry.version }}</h3>
              <div class="text-sm text-gray-600 mb-2">
                {{ formatDate(entry.date) }} • {{ entry.author }}
              </div>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li v-for="(change, i) in entry.changes" :key="i">
                  {{ change }}
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

    <!-- Modal pro přidání/editaci záznamu -->
    <Modal
      v-model="showAddModal"
      :title="editingEntry ? 'Upravit záznam' : 'Přidat záznam'"
    >
      <form @submit.prevent="saveEntry" class="space-y-6">
        <!-- Větev a verze v jednom řádku -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Větev</label
            >
            <div class="relative">
              <select
                v-model="form.branch"
                class="w-full rounded-lg border-gray-300 pl-10 py-2.5"
              >
                <option value="main">main</option>
                <option value="dev">dev</option>
              </select>
              <span
                class="material-icons-outlined absolute left-3 top-2.5 text-gray-400"
              >
                {{ form.branch === "main" ? "verified" : "code_branches" }}
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Verze</label
            >
            <div class="relative">
              <input
                v-model="form.version"
                type="text"
                placeholder="např. v1.0.0"
                class="w-full rounded-lg border-gray-300 pl-10 py-2.5"
                required
              />
              <span
                class="material-icons-outlined absolute left-3 top-2.5 text-gray-400"
              >
                tag
              </span>
            </div>
          </div>
        </div>

        <!-- Autor a datum v jednom řádku -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Autor</label
            >
            <div class="relative">
              <input
                v-model="form.author"
                type="text"
                placeholder="Jméno autora"
                class="w-full rounded-lg border-gray-300 pl-10 py-2.5"
                required
              />
              <span
                class="material-icons-outlined absolute left-3 top-2.5 text-gray-400"
              >
                person
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Datum</label
            >
            <div class="relative">
              <input
                v-model="form.date"
                type="datetime-local"
                class="w-full rounded-lg border-gray-300 pl-10 py-2.5"
                required
              />
              <span
                class="material-icons-outlined absolute left-3 top-2.5 text-gray-400"
              >
                calendar_today
              </span>
            </div>
          </div>
        </div>

        <!-- Seznam změn -->
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="block text-sm font-medium text-gray-700"
              >Seznam změn</label
            >
            <button
              @click="addChange"
              type="button"
              class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span class="material-icons-outlined text-base">add_circle</span>
              Přidat změnu
            </button>
          </div>
          <div class="space-y-3 bg-gray-50 rounded-lg p-4">
            <div
              v-for="(change, index) in form.changes"
              :key="index"
              class="flex gap-2 items-start group"
            >
              <div class="relative flex-grow">
                <input
                  v-model="form.changes[index]"
                  type="text"
                  :placeholder="'Změna #' + (index + 1)"
                  class="w-full rounded-lg border-gray-300 pl-10 pr-10 py-2.5 bg-white"
                />
                <span
                  class="material-icons-outlined absolute left-3 top-2.5 text-gray-400"
                >
                  edit_note
                </span>
              </div>
              <button
                @click="removeChange(index)"
                type="button"
                class="p-2.5 text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              >
                <span class="material-icons-outlined">delete</span>
              </button>
            </div>

            <!-- Prázdný stav -->
            <div
              v-if="form.changes.length === 0"
              class="text-center py-4 text-gray-500"
            >
              <span class="material-icons-outlined text-3xl mb-2"
                >playlist_add</span
              >
              <p>Zatím žádné změny. Začněte přidáním první změny.</p>
            </div>
          </div>
        </div>

        <!-- Tlačítka -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="showAddModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
          >
            <span class="material-icons-outlined">close</span>
            Zrušit
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="
              loading || form.changes.every((change) => !change.trim())
            "
          >
            <span v-if="loading">
              <div
                class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
              ></div>
            </span>
            <span v-else class="material-icons-outlined">
              {{ editingEntry ? "save" : "add_circle" }}
            </span>
            {{ editingEntry ? "Uložit změny" : "Přidat záznam" }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal pro potvrzení smazání -->
    <Modal v-model="showDeleteModal" title="Smazat záznam">
      <div class="space-y-4">
        <p class="text-gray-600">
          Opravdu chcete smazat tento záznam? Tato akce je nevratná.
        </p>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
          >
            <span class="material-icons-outlined">close</span>
            Zrušit
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
            :disabled="loading"
          >
            <span v-if="loading">
              <div
                class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
              ></div>
            </span>
            <span v-else class="material-icons-outlined">delete</span>
            Smazat
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

import { ref, onMounted, watch } from "vue";
import { useVersion } from "~/composables/useVersion";
import { useChangelog } from "~/composables/useChangelog";
import type { ChangelogEntry } from "~/composables/useChangelog";
import Modal from "~/components/Modal.vue";
import { useToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";
import { computed } from "vue";

const toast = useToast();
const {
  mainBranch,
  devBranch,
  loading: versionLoading,
  error: versionError,
  fetchGitHubInfo,
} = useVersion();
const {
  getChangelog,
  addChangelogEntry,
  updateChangelogEntry,
  deleteChangelogEntry,
  loading,
  error,
} = useChangelog();

const { user } = useAuth();

const showAddModal = ref(false);
const editingEntry = ref<ChangelogEntry | null>(null);
const mainEntries = ref<ChangelogEntry[]>([]);
const devEntries = ref<ChangelogEntry[]>([]);

const form = ref({
  branch: "main" as const,
  version: "",
  author: "",
  date: "",
  changes: [""] as string[],
});

const canEdit = computed(() => {
  return user.value?.email === "iimichal.svoboda@gmail.com";
});

const showDeleteModal = ref(false);
const entryToDelete = ref<number | null>(null);

// Načtení dat
const loadData = async () => {
  try {
    await fetchGitHubInfo();
    const [mainData, devData] = await Promise.all([
      getChangelog("main"),
      getChangelog("dev"),
    ]);
    mainEntries.value = mainData;
    devEntries.value = devData;
  } catch (err) {
    toast.error("Nepodařilo se načíst data");
    console.error("Error loading data:", err);
  }
};

// Přidání nové změny do formuláře
const addChange = () => {
  form.value.changes.push("");
};

// Odebrání změny z formuláře
const removeChange = (index: number) => {
  form.value.changes = form.value.changes.filter((_, i) => i !== index);
};

// Editace záznamu
const editEntry = (entry: ChangelogEntry) => {
  editingEntry.value = entry;
  form.value = {
    branch: entry.branch,
    version: entry.version,
    author: entry.author,
    date: new Date(entry.date).toISOString().slice(0, 16),
    changes: [...entry.changes],
  };
  showAddModal.value = true;
};

// Upravená funkce pro smazání záznamu
const deleteEntry = (id: number) => {
  entryToDelete.value = id;
  showDeleteModal.value = true;
};

// Nová funkce pro potvrzení smazání
const confirmDelete = async () => {
  if (!entryToDelete.value) return;

  const success = await deleteChangelogEntry(entryToDelete.value);
  if (success) {
    toast.success("Záznam byl úspěšně smazán");
    showDeleteModal.value = false;
    entryToDelete.value = null;
    await loadData();
  } else {
    toast.error("Nepodařilo se smazat záznam");
  }
};

// Uložení záznamu
const saveEntry = async () => {
  try {
    const entry: ChangelogEntry = {
      version: form.value.version,
      branch: form.value.branch,
      author: form.value.author,
      date: new Date(form.value.date),
      changes: form.value.changes.filter((change) => change.trim() !== ""),
    };

    if (editingEntry.value?.id) {
      const updated = await updateChangelogEntry(editingEntry.value.id, entry);
      if (updated) {
        toast.success("Záznam byl úspěšně upraven");
        showAddModal.value = false;
        await loadData();
      }
    } else {
      const added = await addChangelogEntry(entry);
      if (added) {
        toast.success("Záznam byl úspěšně přidán");
        showAddModal.value = false;
        await loadData();
      }
    }
  } catch (err) {
    toast.error("Nepodařilo se uložit záznam");
    console.error("Error saving entry:", err);
  }
};

// Formátování data
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("cs-CZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Reset formuláře při zavření modalu
watch(showAddModal, (newValue) => {
  if (!newValue) {
    editingEntry.value = null;
    form.value = {
      branch: "main",
      version: "",
      author: "",
      date: "",
      changes: [""],
    };
  }
});

// Reset při zavření modalu
watch(showDeleteModal, (newValue) => {
  if (!newValue) {
    entryToDelete.value = null;
  }
});

onMounted(async () => {
  await loadData();
});
</script>