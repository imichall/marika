<template>
  <div class="container mx-auto px-4 py-8 pb-20">
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
                    :class="{
                      'bg-purple-100 text-purple-800': user.is_admin,
                      'bg-blue-100 text-blue-800': !user.is_admin,
                    }"
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
                  <div
                    v-if="permissions.edit"
                    class="flex items-center space-x-2"
                  >
                    <button
                      @click="editUser(user)"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <span
                        class="material-icons-outlined text-[20px] leading-none"
                        >edit</span
                      >
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
                  :class="{
                    'bg-green-100 text-green-800': user.confirmed_at,
                    'bg-yellow-100 text-yellow-800': !user.confirmed_at,
                  }"
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

    <!-- Modal pro úpravu uživatele -->
    <TransitionRoot appear :show="showEditModal" as="template">
      <Dialog as="div" @close="showEditModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all"
              >
                <div class="absolute right-6 top-6">
                  <button
                    @click="showEditModal = false"
                    class="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>

                <div class="mb-8">
                  <DialogTitle as="h3" class="text-2xl font-bold">
                    Upravit uživatele
                  </DialogTitle>
                  <p class="mt-2 text-gray-500">
                    Upravte roli existujícího uživatele
                  </p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-2 ml-1"
                    >
                      Email
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 group-hover:text-violet-500 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >mail</span
                          >
                        </span>
                      </div>
                      <input
                        v-if="editingUser"
                        v-model="editingUser.email"
                        type="email"
                        disabled
                        class="pl-10 block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-2 ml-1"
                    >
                      Role
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 group-hover:text-violet-500 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >badge</span
                          >
                        </span>
                      </div>
                      <select
                        v-if="editingUser"
                        v-model="editingUser.role"
                        required
                        class="pl-10 block w-full rounded-xl border-gray-200 bg-white shadow-sm focus:border-violet-500 focus:ring focus:ring-violet-200 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 appearance-none cursor-pointer"
                      >
                        <option value="admin" class="py-2">
                          Administrátor
                        </option>
                        <option value="editor" class="py-2">Editor</option>
                        <option value="viewer" class="py-2">Prohlížeč</option>
                      </select>
                      <div
                        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                      >
                        <span
                          class="text-gray-400 group-hover:text-violet-500 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >expand_more</span
                          >
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      @click="showEditModal = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-xl hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 min-w-[100px]"
                      :disabled="loading"
                    >
                      <span
                        v-if="loading"
                        class="inline-block animate-spin mr-2"
                      >
                        <span class="material-icons-outlined text-[20px]"
                          >refresh</span
                        >
                      </span>
                      Uložit
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { useToast } from "~/composables/useToast";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { useUsers } from "~/composables/useUsers";

const supabase = useSupabaseClient();
const toast = useToast();

const { users, loading, error, updateUser } = useUsers();

const showEditModal = ref(false);
const editingUser = ref<{ id: string; email: string; role: string } | null>(
  null
);

// Stav oprávnění
const permissions = ref({
  view: false,
  create: false,
  edit: false,
  delete: false,
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) {
      throw new Error("Uživatel není přihlášen");
    }

    // Kontrola oprávnění pro každou akci
    const actions = ["view", "create", "edit", "delete"];
    const permissionPromises = actions.map((action) =>
      supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "users",
        p_action: action,
      })
    );

    const results = await Promise.all(permissionPromises);

    actions.forEach((action, index) => {
      permissions.value[action] = results[index].data;
    });
  } catch (err) {
    console.error("Error loading permissions:", err);
    throw new Error("Nepodařilo se načíst oprávnění");
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
const formatDate = (date: string | null) => {
  if (!date) return "Nikdy";
  return new Date(date).toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Překlad rolí do češtiny
const getRoleName = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrátor";
    case "editor":
      return "Editor";
    case "viewer":
      return "Prohlížeč";
    default:
      return role;
  }
};

// Funkce pro editaci uživatele
const editUser = (user: { id: string; email: string; role: string }) => {
  editingUser.value = { ...user };
  showEditModal.value = true;
};

// Funkce pro uložení úprav uživatele
const handleSubmit = async () => {
  try {
    if (!editingUser.value) return;

    await updateUser(editingUser.value.id, {
      role: editingUser.value.role as "admin" | "editor" | "viewer",
    });

    // Aktualizujeme data v tabulce bez překreslení modalu
    const { data, error: fetchError } = await supabase.rpc("get_users");
    if (fetchError) throw fetchError;
    users.value = data;

    toast.success("Uživatel byl úspěšně upraven");
    editingUser.value = null; // Nejdřív vyčistíme data
    showEditModal.value = false; // Pak teprve zavřeme modal
  } catch (err) {
    console.error("Error updating user:", err);
    toast.error("Nepodařilo se upravit uživatele");
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    await loadPermissions();
    await fetchUsers();
  } catch (err) {
    console.error("Error initializing page:", err);
    error.value = "Nepodařilo se načíst data";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
});
</script>