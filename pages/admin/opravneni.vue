<template>
  <div class="w-full px-4 py-8 pb-20 text-slate-900 dark:text-slate-100">
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
      class="bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-200 border border-red-200/70 dark:border-red-800/50 p-4 rounded-lg text-center"
    >
      {{ error }}
    </div>

    <!-- Permissions matrix -->
    <div
      v-else
      class="bg-white dark:bg-slate-900/70 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
    >
      <div class="p-6 lg:p-8">
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-2">Matice oprávnění</h2>
          <p class="text-sm text-slate-500 dark:text-slate-300">
            Zde můžete spravovat oprávnění pro jednotlivé role a sekce.
          </p>
        </div>

        <!-- Role tabs -->
        <div class="border-b border-slate-200 dark:border-slate-700 mb-6">
          <nav class="-mb-px flex flex-wrap gap-4">
            <button
              v-for="role in ['admin', 'editor', 'viewer']"
              :key="role"
              @click="selectedRole = role"
              class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
              :class="[
                selectedRole === role
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500',
              ]"
            >
              {{ getRoleName(role) }}
            </button>
          </nav>
        </div>

        <div
          v-if="selectedRole === 'admin'"
          class="mb-6 rounded-xl border border-violet-200/70 dark:border-violet-500/40 bg-violet-50/80 dark:bg-violet-500/10 px-4 py-3 text-sm text-violet-800 dark:text-violet-200"
        >
          Administrátor má vždy všechna oprávnění a není možné je upravit.
        </div>

        <!-- Permissions grid -->
        <div class="space-y-6">
          <section
            v-for="section in groupedPermissions"
            :key="section.name"
            class="rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40"
          >
            <header class="px-4 py-3 border-b border-slate-200/70 dark:border-slate-700">
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    {{ getSectionName(section.name) }}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-300">
                    {{ formatPermissionCount(section.permissions.length) }}
                  </p>
                </div>
              </div>
            </header>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead class="bg-slate-100/80 dark:bg-slate-800/60">
                  <tr>
                    <th
                      scope="col"
                      class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                    >
                      Oprávnění
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                    >
                      Popis
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 text-right"
                    >
                      Stav
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr
                    v-for="permission in section.permissions"
                    :key="permission.id"
                    class="bg-white odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900/60 dark:even:bg-slate-900/30"
                  >
                    <td class="px-4 py-3 align-top">
                      <div class="flex flex-col gap-1">
                        <span class="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {{ getPermissionLabel(permission) }}
                        </span>
                        <span
                          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                        >
                          {{ permission.action }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 align-top">
                      <p class="text-sm text-slate-600 dark:text-slate-200">
                        {{ permission.description || 'Popis není k dispozici' }}
                      </p>
                    </td>
                    <td class="px-4 py-3 align-top">
                      <label
                        class="flex items-center justify-end gap-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        <span class="hidden sm:inline" :class="{ 'text-green-500': hasPermission(selectedRole, permission.id), 'text-red-500': !hasPermission(selectedRole, permission.id) }">
                          {{ hasPermission(selectedRole, permission.id) ? 'Povoleno' : 'Zakázáno' }}
                        </span>
                        <input
                          type="checkbox"
                          :checked="hasPermission(selectedRole, permission.id)"
                          @change="togglePermission(selectedRole, permission.id)"
                          :disabled="selectedRole === 'admin'"
                          class="h-5 w-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-violet-600 focus:ring-violet-500 dark:focus:ring-violet-400 disabled:opacity-60"
                        />
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Save button -->
        <div class="mt-8 flex justify-end">
          <button
            @click="savePermissions"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="selectedRole === 'admin' || saving"
          >
            <span v-if="saving" class="inline-block animate-spin">⌛</span>
            <span>{{ saving ? 'Ukládám změny…' : 'Uložit změny' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
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

const forumPermissionMeta = {
  forum_view: { group: 'forum', label: 'Zobrazení fóra' },
  forum_create: { group: 'forum', label: 'Přidávání příspěvků' },
  forum_delete: { group: 'forum', label: 'Mazání příspěvků' },
  forum_categories: { group: 'forum', label: 'Správa kategorií' },
  forum_tags: { group: 'forum', label: 'Správa tagů' },
};

const normalizeSection = (section) => {
  if (!section) return 'ostatni';
  return forumPermissionMeta[section]?.group || section;
};

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

const actionLabels = {
  view: "Zobrazení",
  create: "Vytváření",
  edit: "Úprava",
  delete: "Mazání",
  manage: "Správa",
  complete: "Dokončení",
  cancel: "Zrušení",
};

const getPermissionLabel = (permission) => {
  if (forumPermissionMeta[permission.section]) {
    return forumPermissionMeta[permission.section].label;
  }
  const sectionLabel = (getSectionName(permission.section) || "").toLowerCase();
  const actionLabel = actionLabels[permission.action] || permission.action;

  if (!sectionLabel) {
    return actionLabel;
  }

  return `${actionLabel} ${sectionLabel}`;
};

const groupedPermissions = computed(() => {
  const groups = new Map();

  permissions.value.forEach((perm) => {
    const sectionKey = normalizeSection(perm.section);
    if (!groups.has(sectionKey)) {
      groups.set(sectionKey, {
        name: sectionKey,
        permissions: [],
      });
    }
    groups.get(sectionKey)?.permissions.push(perm);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      permissions: [...group.permissions].sort((a, b) =>
        getPermissionLabel(a).localeCompare(getPermissionLabel(b), "cs", {
          sensitivity: "base",
        })
      ),
    }))
    .sort((a, b) =>
      getSectionName(a.name).localeCompare(
        getSectionName(b.name),
        "cs",
        { sensitivity: "base" }
      )
    );
});

// Kontrola, zda role má dané oprávnění
const hasPermission = (role, permissionId) => {
  if (role === 'admin') return true; // Admin má vždy všechna oprávnění
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

    // Nejprve zkontrolujeme/vytvoříme výchozí roli
    const { data: defaultRole, error: insertError } = await supabase
      .from("user_roles")
      .insert([
        {
          email: `default.${selectedRole.value}@system.local`,
          role: selectedRole.value,
        },
      ])
      .select("id")
      .single();

    if (insertError && insertError.code !== "23505") {
      // Ignorujeme chybu duplicitního záznamu
      throw insertError;
    }

    // Získáme ID role (včetně právě vytvořené)
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", selectedRole.value);

    if (roleError) throw roleError;
    if (!roles || roles.length === 0) {
      throw new Error(
        `Nepodařilo se najít nebo vytvořit roli ${selectedRole.value}`
      );
    }

    // Pro každou roli daného typu
    for (const role of roles) {
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
        const { error: insertPermError } = await supabase
          .from("user_permissions")
          .insert(newPermissions);

        if (insertPermError) throw insertPermError;
      }
    }

    toast.success("Oprávnění byla úspěšně uložena");
  } catch (err) {
    console.error("Error saving permissions:", err);
    toast.error("Nepodařilo se uložit oprávnění");
  } finally {
    saving.value = false;
  }
};

const formatPermissionCount = (count) => {
  if (count === 1) {
    return "1 oprávnění";
  }
  if (count >= 2 && count <= 4) {
    return `${count} oprávnění`;
  }
  return `${count} oprávnění`;
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
  const normalized = normalizeSection(section);
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
    form_messages: "Zprávy z formuláře",
    emails: "Emaily",
    gallery_layout: "Rozložení galerie",
    forum: "Fórum",
    repertoire: "Repertoár",
    member_directory: "Členský seznam",
    member_resources: "Dokumenty ke stažení",
    members_area: "Členská sekce",
    ostatni: "Ostatní",
  };
  return sections[normalized] || sections[section] || section;
};

// Helper to get a label for a section name
const getSectionLabel = (sectionName) => {
  const normalized = normalizeSection(sectionName);
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
    form_messages: "Zprávy z formuláře",
    emails: "Emaily",
    gallery_layout: "Rozložení galerie",
    forum: "Fórum",
    repertoire: "Repertoár",
    member_directory: "Členský seznam",
    member_resources: "Dokumenty ke stažení",
    members_area: "Členská sekce",
    ostatni: "Ostatní",
  };
  return sections[normalized] || sections[sectionName] || sectionName;
};

onMounted(async () => {
  await fetchPermissions();
});
</script>