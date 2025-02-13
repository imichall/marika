<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa oprávnění</h1>
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

    <!-- Permissions matrix -->
    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden p-6">
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-2">Matice oprávnění</h2>
        <p class="text-gray-600">
          Zde můžete spravovat oprávnění pro jednotlivé role a sekce.
        </p>
      </div>

      <!-- Role tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="role in ['admin', 'editor', 'viewer']"
            :key="role"
            @click="selectedRole = role"
            class="py-2 px-1 border-b-2 font-medium text-sm"
            :class="[
              selectedRole === role
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            {{ getRoleName(role) }}
          </button>
        </nav>
      </div>

      <!-- Permissions grid -->
      <div class="grid gap-6">
        <div
          v-for="section in groupedPermissions"
          :key="section.name"
          class="bg-gray-50 rounded-lg p-4"
        >
          <h3 class="font-medium text-gray-900 mb-4">
            {{ getSectionName(section.name) }}
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="permission in section.permissions"
              :key="permission.id"
              class="flex items-center"
            >
              <label class="flex items-center space-x-3">
                <input
                  type="checkbox"
                  :checked="hasPermission(selectedRole, permission.id)"
                  @change="togglePermission(selectedRole, permission.id)"
                  :disabled="selectedRole === 'admin'"
                  class="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <span class="text-sm text-gray-700">{{
                  permission.description
                }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Save button -->
      <div class="mt-6 flex justify-end">
        <button
          @click="savePermissions"
          class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 disabled:opacity-50"
          :disabled="selectedRole === 'admin' || saving"
        >
          <span v-if="saving" class="inline-block animate-spin mr-2">⌛</span>
          Uložit změny
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

import { ref, onMounted, computed } from "vue";
import { useSupabaseClient } from "#imports";
import { useToast } from "~/composables/useToast";

const supabase = useSupabaseClient();
const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const selectedRole = ref("admin");

const permissions = ref([]);
const rolePermissions = ref({
  admin: [],
  editor: [],
  viewer: [],
});

// Načtení oprávnění
const fetchPermissions = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Načtení všech oprávnění
    const { data: perms, error: permsError } = await supabase
      .from("permissions")
      .select("*")
      .order("section", { ascending: true });

    if (permsError) throw permsError;
    permissions.value = perms;

    // Načtení oprávnění pro role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("id, role");

    if (rolesError) throw rolesError;

    // Pro každou roli načteme její oprávnění
    for (const role of roles) {
      const { data: rolePerms, error: rolePermsError } = await supabase
        .from("user_permissions")
        .select("permission_id")
        .eq("role_id", role.id);

      if (rolePermsError) throw rolePermsError;
      rolePermissions.value[role.role] = rolePerms.map((p) => p.permission_id);
    }
  } catch (err) {
    console.error("Error fetching permissions:", err);
    error.value = "Nepodařilo se načíst oprávnění";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Seskupení oprávnění podle sekcí
const groupedPermissions = computed(() => {
  const groups = {};
  permissions.value.forEach((perm) => {
    if (!groups[perm.section]) {
      groups[perm.section] = {
        name: perm.section,
        permissions: [],
      };
    }
    groups[perm.section].permissions.push(perm);
  });
  return Object.values(groups);
});

// Kontrola, zda role má dané oprávnění
const hasPermission = (role, permissionId) => {
  return rolePermissions.value[role]?.includes(permissionId);
};

// Přepnutí oprávnění
const togglePermission = (role, permissionId) => {
  if (role === "admin") return; // Admin má vždy všechna oprávnění

  const permissions = rolePermissions.value[role];
  const index = permissions.indexOf(permissionId);

  if (index === -1) {
    permissions.push(permissionId);
  } else {
    permissions.splice(index, 1);
  }
};

// Uložení změn
const savePermissions = async () => {
  if (selectedRole.value === "admin") return;

  try {
    saving.value = true;

    // Získáme ID role
    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", selectedRole.value)
      .single();

    if (roleError) throw roleError;

    // Smažeme existující oprávnění
    const { error: deleteError } = await supabase
      .from("user_permissions")
      .delete()
      .eq("role_id", role.id);

    if (deleteError) throw deleteError;

    // Vložíme nová oprávnění
    const newPermissions = rolePermissions.value[selectedRole.value].map(
      (permissionId) => ({
        role_id: role.id,
        permission_id: permissionId,
      })
    );

    if (newPermissions.length > 0) {
      const { error: insertError } = await supabase
        .from("user_permissions")
        .insert(newPermissions);

      if (insertError) throw insertError;
    }

    toast.success("Oprávnění byla úspěšně uložena");
  } catch (err) {
    console.error("Error saving permissions:", err);
    toast.error("Nepodařilo se uložit oprávnění");
  } finally {
    saving.value = false;
  }
};

// Překlad rolí do češtiny
const getRoleName = (role) => {
  const roles = {
    admin: "Administrátor",
    editor: "Editor",
    viewer: "Prohlížeč",
  };
  return roles[role] || role;
};

// Překlad sekcí do češtiny
const getSectionName = (section) => {
  const sections = {
    concerts: "Koncerty",
    gallery: "Galerie",
    testimonials: "Reference",
    orders: "Objednávky",
    social_media: "Sociální sítě",
    contacts: "Kontakty",
    choir_groups: "Skupiny",
    settings: "Nastavení",
    users: "Uživatelé",
  };
  return sections[section] || section;
};

onMounted(async () => {
  await fetchPermissions();
});
</script>