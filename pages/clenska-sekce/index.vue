<template>
  <div class="space-y-8">
    <section
      class="rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg px-8 py-10"
    >
      <h2 class="text-3xl font-semibold mb-3">Vítejte v členské sekci</h2>
      <p class="text-red-50 max-w-3xl">
        Zde najdete kompletní repertoár včetně notových materiálů, archiv všech
        členů sboru a důležité dokumenty ke stažení. Veškerý obsah je dostupný
        pouze přihlášeným členům.
      </p>
    </section>

    <!-- Statistika -->
    <section
      v-if="!statsLoading"
      class="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800"
    >
      <h3 class="text-lg font-semibold text-slate-900 mb-4 dark:text-white">
        Přehled obsahu
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Icon name="mdi:music" class="text-3xl text-red-600 mb-2" />
          <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.totalSongs }}</div>
          <div class="text-xs text-slate-600 dark:text-slate-400 text-center mt-1">Skladeb</div>
        </div>
        <div class="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Icon name="mdi:file-pdf-box" class="text-3xl text-red-600 mb-2" />
          <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.totalPdf }}</div>
          <div class="text-xs text-slate-600 dark:text-slate-400 text-center mt-1">PDF souborů</div>
        </div>
        <div class="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Icon name="mdi:music-note" class="text-3xl text-emerald-600 mb-2" />
          <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.totalAudio }}</div>
          <div class="text-xs text-slate-600 dark:text-slate-400 text-center mt-1">Audio souborů</div>
        </div>
        <div class="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Icon name="mdi:youtube" class="text-3xl text-red-600 mb-2" />
          <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.totalYoutube }}</div>
          <div class="text-xs text-slate-600 dark:text-slate-400 text-center mt-1">YouTube videí</div>
        </div>
        <div class="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Icon name="mdi:account-group" class="text-3xl text-violet-600 mb-2" />
          <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.totalMembers }}</div>
          <div class="text-xs text-slate-600 dark:text-slate-400 text-center mt-1">Členů</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 md:grid-cols-2">
      <NuxtLink
        v-for="card in visibleCards"
        :key="card.href"
        :to="card.href"
        class="group rounded-2xl bg-white shadow hover:shadow-xl transition duration-200 border border-slate-100 p-6 flex flex-col gap-3 dark:bg-slate-900/80 dark:border-slate-800 dark:hover:bg-slate-800"
      >
        <div class="flex items-center gap-3">
          <div
            class="rounded-full bg-red-50 text-red-600 p-3 dark:bg-red-500/20 dark:text-red-200"
          >
            <Icon :name="card.icon" class="text-2xl" />
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ card.title }}
          </h3>
        </div>
        <p class="text-sm text-slate-600 flex-1 dark:text-slate-300">
          {{ card.description }}
        </p>
        <span
          class="inline-flex items-center gap-2 text-sm font-medium text-red-600 group-hover:gap-3 transition-all dark:text-red-300"
        >
          Přesunout se
          <Icon name="mdi:arrow-right" class="text-lg" />
        </span>
      </NuxtLink>
    </section>

    <section
      class="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800"
    >
      <h3 class="text-lg font-semibold text-slate-900 mb-2 dark:text-white">
        Tipy pro práci s repertoárem
      </h3>
      <ul
        class="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300"
      >
        <li>
          Vyberte více skladeb pomocí zaškrtávacích políček a exportujte je do
          Excelu pro hlášení na OSA.
        </li>
        <li>
          Každá skladba může mít více souborů podle hlasů – při nahrávání je
          možné je označit.
        </li>
        <li>
          Vyhledávání funguje podle názvu i autora, můžete také filtrovat
          abecedně podle počátečního písmene.
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRepertoire, type RepertoireFile } from "~/composables/useRepertoire";
import { useMemberManagement } from "~/composables/useMemberManagement";

definePageMeta({
  layout: "members",
});

const { checkPermission } = usePermissions();
const canManagePermissions = ref(false);

const { items, fetchItems } = useRepertoire();
const { members, fetchMembers } = useMemberManagement();

const statsLoading = ref(true);
const stats = ref({
  totalSongs: 0,
  totalPdf: 0,
  totalAudio: 0,
  totalYoutube: 0,
  totalMembers: 0,
});

const isPdf = (file: RepertoireFile) =>
  file.content_type?.includes('pdf') || file.file_name.toLowerCase().endsWith('.pdf');
const isAudio = (file: RepertoireFile) =>
  file.content_type?.includes('audio') || file.file_name.toLowerCase().endsWith('.mp3');

const calculateStats = () => {
  // Statistiky repertoáru
  stats.value.totalSongs = items.value.length;
  stats.value.totalPdf = items.value.reduce((count, item) => {
    return count + item.files.filter(isPdf).length;
  }, 0);
  stats.value.totalAudio = items.value.reduce((count, item) => {
    return count + item.files.filter(isAudio).length;
  }, 0);
  stats.value.totalYoutube = items.value.filter((item) => item.youtube_link).length;

  // Statistika členů
  stats.value.totalMembers = members.value.length;
};

const cards = [
  {
    title: "Repertoár",
    description:
      "Kompletní seznam skladeb včetně autorů a notových materiálů připravených ke stažení.",
    href: "/clenska-sekce/repertoar",
    icon: "mdi:music-note-plus",
  },
  {
    title: "Členové",
    description:
      "Evidujte všechny, kdo prošli sborem. Udržujte poznámky, hlasové obsazení a kontakty.",
    href: "/clenska-sekce/clenove",
    icon: "mdi:account-group",
  },
  {
    title: "Dokumenty ke stažení",
    description:
      "Logo, stanovy, kronika a další interní dokumenty na jednom místě.",
    href: "/clenska-sekce/ke-stazeni",
    icon: "mdi:folder-download",
  },
  {
    title: "Správa oprávnění",
    description:
      "Oprávnění a přístupy se nastavují v administraci v sekci Správa oprávnění a Uživatelé.",
    href: "/admin/opravneni",
    icon: "mdi:shield-key-outline",
    requiresPermission: true,
  },
];

// Filtrování karet na základě oprávnění
const visibleCards = computed(() => {
  return cards.filter((card) => {
    if (card.requiresPermission) {
      return canManagePermissions.value;
    }
    return true;
  });
});

// Načtení oprávnění a dat při inicializaci komponenty
onMounted(async () => {
  canManagePermissions.value = await checkPermission("users", "edit");

  try {
    statsLoading.value = true;
    await Promise.all([
      fetchItems(),
      fetchMembers()
    ]);
    calculateStats();
  } catch (error) {
    console.error('Chyba při načítání statistik:', error);
  } finally {
    statsLoading.value = false;
  }
});
</script>
