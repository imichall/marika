<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Správa médií</h1>
      <p class="mt-1 text-sm text-gray-600">
        Zde můžete spravovat a optimalizovat obrázky na webu.
      </p>
    </div>

    <div class="grid gap-6">
      <!-- Image Optimizer -->
      <ImageOptimizer />

      <!-- Zde můžeme později přidat další komponenty pro správu médií -->
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

import { ref, onMounted } from "#imports";
import { useSupabaseClient } from "#imports";
import ImageOptimizer from "~/components/ImageOptimizer.vue";

const supabase = useSupabaseClient();

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
        p_section: "media",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

// Načteme oprávnění při mounted
onMounted(async () => {
  await loadPermissions();
});
</script>