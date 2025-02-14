<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Nastavení</h1>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 text-red-600 p-4 rounded-lg text-center"
    >
      {{ error }}
    </div>

    <!-- Settings content -->
    <div v-else class="grid gap-6">
      <!-- Basic settings -->
      <div
        v-if="permissions.edit"
        class="bg-white rounded-xl shadow-sm overflow-hidden p-6"
      >
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-2">Základní nastavení</h2>
          <p class="text-gray-600">
            Zde můžete upravit základní nastavení webu.
          </p>
        </div>

        <div class="grid gap-6">
          <!-- Website title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Název webu
            </label>
            <input
              v-model="settings.title"
              type="text"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <!-- Contact email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kontaktní email
            </label>
            <input
              v-model="settings.contact_email"
              type="email"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <!-- Social media links -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Facebook
            </label>
            <input
              v-model="settings.facebook_url"
              type="url"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Instagram
            </label>
            <input
              v-model="settings.instagram_url"
              type="url"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      <!-- Advanced settings -->
      <div
        v-if="permissions.manage"
        class="bg-white rounded-xl shadow-sm overflow-hidden p-6"
      >
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-2">Pokročilá nastavení</h2>
          <p class="text-gray-600">
            Zde můžete upravit pokročilá nastavení webu.
          </p>
        </div>

        <div class="grid gap-6">
          <!-- Analytics -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Google Analytics ID
            </label>
            <input
              v-model="settings.analytics_id"
              type="text"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <!-- API Keys -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mailchimp API Key
            </label>
            <input
              v-model="settings.mailchimp_api_key"
              type="password"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <!-- Cache settings -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Cache doba platnosti (minuty)
            </label>
            <input
              v-model="settings.cache_ttl"
              type="number"
              min="0"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      <!-- Save button -->
      <div
        v-if="permissions.edit || permissions.manage"
        class="flex justify-end"
      >
        <button
          @click="saveSettings"
          class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 disabled:opacity-50"
          :disabled="saving"
        >
          <span v-if="saving" class="inline-block animate-spin mr-2">⌛</span>
          Uložit změny
        </button>
      </div>

      <!-- Tlačítko pro úpravu -->
      <button
        v-if="permissions.edit"
        @click="editSettings"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        <span class="material-icons-outlined mr-2">edit</span>
        Upravit nastavení
      </button>

      <!-- Tlačítko pro správu -->
      <button
        v-if="permissions.manage"
        @click="manageSettings"
        class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200"
      >
        <span class="material-icons-outlined mr-2">settings</span>
        Spravovat systém
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { useToast } from "~/composables/useToast";

const supabase = useSupabaseClient();
const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const settings = ref({
  title: "",
  contact_email: "",
  facebook_url: "",
  instagram_url: "",
  analytics_id: "",
  mailchimp_api_key: "",
  cache_ttl: 60,
});

// Stav oprávnění
const permissions = ref({
  view: false,
  edit: false,
  manage: false,
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Kontrola oprávnění pro každou akci
    const actions = ["view", "edit", "manage"];
    for (const action of actions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "settings",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

// Načtení nastavení
const loadSettings = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Načtení nastavení
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (settingsError && settingsError.code !== "PGRST116") throw settingsError;
    if (settingsData) {
      settings.value = { ...settings.value, ...settingsData };
    }
  } catch (err) {
    console.error("Error fetching settings:", err);
    error.value = "Nepodařilo se načíst nastavení";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Uložení nastavení
const saveSettings = async () => {
  try {
    saving.value = true;

    const { error: saveError } = await supabase
      .from("settings")
      .upsert(settings.value);

    if (saveError) throw saveError;

    toast.success("Nastavení bylo úspěšně uloženo");
  } catch (err) {
    console.error("Error saving settings:", err);
    toast.error("Nepodařilo se uložit nastavení");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadPermissions(), loadSettings()]);
});
</script>