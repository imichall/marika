<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa uživatelů</h1>
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

    <!-- Users table -->
    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Poslední přihlášení
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vytvořeno
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-3"
                  >
                    {{ user.email.charAt(0).toUpperCase() }}
                  </div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.email }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="[
                      user.is_admin
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800',
                    ]"
                  >
                    {{ user.is_admin ? "Admin" : "Uživatel" }}
                  </span>
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-red-100 text-red-800': user.role === 'admin',
                      'bg-blue-100 text-blue-800': user.role === 'editor',
                      'bg-gray-100 text-gray-800': user.role === 'viewer',
                    }"
                  >
                    {{ getRoleName(user.role) }}
                  </span>
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="permissions.edit"
                      @click="editUser(user)"
                      class="p-1 text-blue-500 hover:text-blue-600"
                    >
                      <span class="material-icons-outlined">edit</span>
                    </button>
                    <button
                      v-if="permissions.edit"
                      @click="deleteUser(user)"
                      class="p-1 text-red-500 hover:text-red-600"
                    >
                      <span class="material-icons-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.last_sign_in_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="[
                    user.confirmed_at
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800',
                  ]"
                >
                  {{ user.confirmed_at ? "Aktivní" : "Nepotvrzený" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div
        v-if="users.length === 0"
        class="text-center py-12 px-4 bg-white rounded-lg"
      >
        <span class="material-icons-outlined text-4xl text-gray-400 mb-3"
          >person_off</span
        >
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Žádní registrovaní uživatelé
        </h3>
        <p class="text-gray-500">
          V systému zatím nejsou žádní registrovaní uživatelé.
        </p>
      </div>
    </div>

    <!-- Modal pro editaci uživatele -->
    <Modal
      v-model="showEditModal"
      :title="'Upravit uživatele ' + (editingUser?.email || '')"
    >
      <form @submit.prevent="saveUser" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Role</label
          >
          <select
            v-model="editForm.role"
            class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="admin">Administrátor</option>
            <option value="editor">Editor</option>
            <option value="viewer">Prohlížeč</option>
          </select>
          <p class="mt-1 text-sm text-gray-500">
            Administrátor má plný přístup, Editor může upravovat obsah,
            Prohlížeč může pouze číst
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="showEditModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Zrušit
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            :disabled="loading"
          >
            <span v-if="loading" class="inline-block animate-spin mr-2"
              >⌛</span
            >
            Uložit změny
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal pro přidání uživatele -->
    <Modal v-model="showAddModal" title="Přidat nového uživatele">
      <form @submit.prevent="createUser" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Email</label
          >
          <input
            v-model="addForm.email"
            type="email"
            required
            class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Heslo</label
          >
          <input
            v-model="addForm.password"
            type="password"
            required
            class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="********"
          />
          <p class="mt-1 text-sm text-gray-500">
            Heslo musí mít alespoň 8 znaků
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Role</label
          >
          <select
            v-model="addForm.role"
            class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="admin">Administrátor</option>
            <option value="editor">Editor</option>
            <option value="viewer">Prohlížeč</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="showAddModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Zrušit
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            :disabled="loading"
          >
            <span v-if="loading" class="inline-block animate-spin mr-2"
              >⌛</span
            >
            Vytvořit uživatele
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal pro správu rolí -->
    <Modal v-model="showRolesModal" title="Správa rolí">
      <div class="space-y-6">
        <div
          v-for="role in ['admin', 'editor', 'viewer']"
          :key="role"
          class="p-4 bg-gray-50 rounded-lg"
        >
          <h3 class="text-lg font-medium mb-2">{{ getRoleName(role) }}</h3>
          <div class="space-y-2">
            <div
              v-for="section in sections"
              :key="section"
              class="flex items-center gap-2"
            >
              <span class="text-sm text-gray-600 w-32">{{
                getSectionName(section)
              }}</span>
              <div class="flex gap-2">
                <label
                  v-for="action in getAvailableActions(section)"
                  :key="action"
                  class="flex items-center gap-1"
                >
                  <input
                    type="checkbox"
                    :checked="hasPermission(role, section, action)"
                    @change="togglePermission(role, section, action)"
                    :disabled="role === 'admin'"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm">{{ getActionName(action) }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="showRolesModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Zrušit
          </button>
          <button
            @click="saveRolePermissions"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            :disabled="loading"
          >
            <span v-if="loading" class="inline-block animate-spin mr-2"
              >⌛</span
            >
            Uložit oprávnění
          </button>
        </div>
      </div>
    </Modal>

    <!-- Tlačítka pro správu -->
    <div class="mt-8 flex gap-4">
      <button
        v-if="permissions.edit"
        @click="showAddModal = true"
        class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200"
      >
        <span class="material-icons-outlined mr-2">add</span>
        Přidat uživatele
      </button>
      <button
        v-if="permissions.edit"
        @click="openRolesModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        <span class="material-icons-outlined mr-2">admin_panel_settings</span>
        Správa rolí
      </button>
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
import Modal from "~/components/Modal.vue";

const supabase = useSupabaseClient();
const toast = useToast();

const users = ref([]);
const loading = ref(true);
const error = ref(null);

const showEditModal = ref(false);
const editingUser = ref(null);
const editForm = ref({
  role: "viewer",
});

// Stav oprávnění
const permissions = ref({
  view: false,
  edit: false,
});

// Stav oprávnění rolí
const rolePermissions = ref({
  admin: [],
  editor: [],
  viewer: [],
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Kontrola oprávnění pro každou akci
    const actions = ["view", "edit"];
    for (const action of actions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "users",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

// Načtení oprávnění pro role
const loadRolePermissions = async () => {
  try {
    for (const role of ["admin", "editor", "viewer"]) {
      const { data, error } = await supabase.rpc("get_role_permissions", {
        p_role: role,
      });

      if (error) throw error;
      rolePermissions.value[role] = data;
    }
  } catch (err) {
    console.error("Error loading role permissions:", err);
    toast.error("Nepodařilo se načíst oprávnění rolí");
  }
};

// Načtení uživatelů
const fetchUsers = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase.rpc("get_users");

    if (fetchError) throw fetchError;

    users.value = data;
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = "Nepodařilo se načíst seznam uživatelů";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Formátování data
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("cs-CZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

// Editace uživatele
const editUser = (user) => {
  editingUser.value = user;
  editForm.value.role = user.role;
  showEditModal.value = true;
};

// Uložení změn uživatele
const saveUser = async () => {
  try {
    loading.value = true;
    const { error: updateError } = await supabase.rpc("update_user_role", {
      p_email: editingUser.value.email,
      p_role: editForm.value.role,
    });

    if (updateError) throw updateError;

    toast.success("Uživatel byl úspěšně upraven");
    showEditModal.value = false;
    await fetchUsers();
  } catch (err) {
    console.error("Error updating user:", err);
    toast.error("Nepodařilo se upravit uživatele");
  } finally {
    loading.value = false;
  }
};

// Přidání nových refs a funkcí do script setup
const showAddModal = ref(false);
const showRolesModal = ref(false);
const addForm = ref({
  email: "",
  password: "",
  role: "viewer",
});

// Sekce a akce pro oprávnění
const sections = [
  "concerts",
  "gallery",
  "testimonials",
  "orders",
  "social_media",
  "contacts",
  "choir_groups",
  "settings",
  "users",
];

// Vytvoření nového uživatele
const createUser = async () => {
  try {
    loading.value = true;

    // Vytvoření uživatele v Auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: addForm.value.email,
        password: addForm.value.password,
        email_confirm: true,
      });

    if (authError) throw authError;

    // Nastavení role
    const { error: roleError } = await supabase.rpc("update_user_role", {
      p_email: addForm.value.email,
      p_role: addForm.value.role,
    });

    if (roleError) throw roleError;

    toast.success("Uživatel byl úspěšně vytvořen");
    showAddModal.value = false;
    await fetchUsers();

    // Reset formuláře
    addForm.value = {
      email: "",
      password: "",
      role: "viewer",
    };
  } catch (err) {
    console.error("Error creating user:", err);
    toast.error("Nepodařilo se vytvořit uživatele");
  } finally {
    loading.value = false;
  }
};

// Otevření modalu pro správu rolí
const openRolesModal = async () => {
  await loadRolePermissions();
  showRolesModal.value = true;
};

// Kontrola oprávnění pro roli
const hasPermission = (role, section, action) => {
  if (role === "admin") return true;
  return rolePermissions.value[role]?.some(
    (p) => p.section === section && p.action === action
  );
};

// Přepnutí oprávnění
const togglePermission = (role, section, action) => {
  if (role === "admin") return;

  const permissions = rolePermissions.value[role];
  const index = permissions.findIndex(
    (p) => p.section === section && p.action === action
  );

  if (index === -1) {
    permissions.push({ section, action });
  } else {
    permissions.splice(index, 1);
  }
};

// Uložení oprávnění rolí
const saveRolePermissions = async () => {
  try {
    loading.value = true;

    for (const role of ["editor", "viewer"]) {
      const { error } = await supabase.rpc("set_role_permissions", {
        p_role: role,
        p_permissions: rolePermissions.value[role],
      });

      if (error) throw error;
    }

    toast.success("Oprávnění byla úspěšně uložena");
    showRolesModal.value = false;
  } catch (err) {
    console.error("Error saving role permissions:", err);
    toast.error("Nepodařilo se uložit oprávnění");
  } finally {
    loading.value = false;
  }
};

// Pomocné funkce pro překlady
const getActionName = (action) => {
  const actions = {
    view: "Zobrazit",
    create: "Vytvářet",
    edit: "Upravovat",
    delete: "Mazat",
    manage: "Spravovat",
  };
  return actions[action] || action;
};

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

const getAvailableActions = (section) => {
  const defaultActions = ["view", "create", "edit", "delete"];
  const specialActions = {
    settings: ["view", "edit", "manage"],
    orders: ["view", "edit"],
    social_media: ["view", "edit"],
    users: ["view", "edit"],
  };
  return specialActions[section] || defaultActions;
};

onMounted(async () => {
  await Promise.all([loadPermissions(), fetchUsers()]);
});
</script>