<template>
  <div class="container mx-auto px-4 py-8 pb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Správa uživatelů</h1>
      <button
        v-if="permissions.create"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
      >
        <span class="material-icons-outlined text-[18px] mr-2">person_add</span>
        Přidat uživatele
      </button>
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
      class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center border border-red-200 dark:border-red-800"
    >
      {{ error }}
    </div>

    <!-- Users table -->
    <div v-else class="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Jméno
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Poslední přihlášení
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Vytvořeno
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mr-3"
                  >
                    {{
                      user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()
                    }}
                  </div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ user.name || "—" }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300': user.is_admin,
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': !user.is_admin,
                    }"
                  >
                    {{ user.is_admin ? "Admin" : "Uživatel" }}
                  </span>
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': user.role === 'admin',
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': user.role === 'editor',
                      'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300': user.role === 'viewer',
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
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      title="Upravit"
                    >
                      <span
                        class="material-icons-outlined text-[20px] leading-none"
                        >edit</span
                      >
                    </button>
                    <button
                      @click="resetPassword(user)"
                      class="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                      title="Resetovat heslo"
                    >
                      <span
                        class="material-icons-outlined text-[20px] leading-none"
                        >lock_reset</span
                      >
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.last_sign_in_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': user.confirmed_at,
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300': !user.confirmed_at,
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
        class="text-center py-12 px-4 bg-white dark:bg-gray-900 rounded-lg"
      >
        <span class="material-icons-outlined text-4xl text-gray-400 dark:text-gray-600 mb-3"
          >person_off</span
        >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Žádní registrovaní uživatelé
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          V systému zatím nejsou žádní registrovaní uživatelé.
        </p>
      </div>
    </div>

    <!-- Modal pro vytvoření nového uživatele -->
    <TransitionRoot appear :show="showCreateModal" as="template">
      <Dialog as="div" @close="showCreateModal = false" class="relative z-50">
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div class="absolute right-6 top-6">
                  <button
                    @click="showCreateModal = false"
                    class="rounded-full p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>

                <div class="mb-8">
                  <DialogTitle as="h3" class="text-2xl font-bold text-gray-900 dark:text-white">
                    Vytvořit nového uživatele
                  </DialogTitle>
                  <p class="mt-2 text-gray-500 dark:text-gray-400">
                    Vytvořte nový účet a pošlete uživateli potvrzovací e-mail
                  </p>
                </div>

                <form @submit.prevent="handleCreateUser" class="space-y-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1"
                    >
                      Jméno (volitelné)
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >person</span
                          >
                        </span>
                      </div>
                      <input
                        v-model="newUser.name"
                        type="text"
                        class="pl-10 block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Zadejte jméno uživatele"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1"
                    >
                      Email <span class="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >mail</span
                          >
                        </span>
                      </div>
                      <input
                        v-model="newUser.email"
                        type="email"
                        required
                        class="pl-10 block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="email@priklad.cz"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1"
                    >
                      Heslo <span class="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >lock</span
                          >
                        </span>
                      </div>
                      <input
                        v-model="newUser.password"
                        type="password"
                        required
                        minlength="6"
                        class="pl-10 block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Minimálně 6 znaků"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1"
                    >
                      Role <span class="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >badge</span
                          >
                        </span>
                      </div>
                      <select
                        v-model="newUser.role"
                        required
                        class="pl-10 block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-500 appearance-none cursor-pointer text-gray-900 dark:text-white"
                      >
                        <option value="viewer" class="py-2">Prohlížeč</option>
                        <option value="editor" class="py-2">Editor</option>
                        <option value="admin" class="py-2">Administrátor</option>
                      </select>
                      <div
                        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >expand_more</span
                          >
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="createError" class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">
                    {{ createError }}
                  </div>

                  <div class="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      @click="closeCreateModal"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 dark:focus:ring-violet-400 transition-all duration-200"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-xl hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 min-w-[100px]"
                      :disabled="creatingUser"
                    >
                      <span
                        v-if="creatingUser"
                        class="inline-block animate-spin mr-2"
                      >
                        <span class="material-icons-outlined text-[20px]"
                          >refresh</span
                        >
                      </span>
                      <span v-else>Vytvořit</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div class="absolute right-6 top-6">
                  <button
                    @click="showEditModal = false"
                    class="rounded-full p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>

                <div class="mb-8">
                  <DialogTitle as="h3" class="text-2xl font-bold text-gray-900 dark:text-white">
                    Upravit uživatele
                  </DialogTitle>
                  <p class="mt-2 text-gray-500 dark:text-gray-400">
                    Upravte roli existujícího uživatele
                  </p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-2 ml-1"
                    >
                      Jméno
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 group-hover:text-violet-500 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >person</span
                          >
                        </span>
                      </div>
                      <input
                        v-if="editingUser"
                        v-model="editingUser.name"
                        type="text"
                        class="pl-10 block w-full rounded-xl border-gray-200 bg-white shadow-sm focus:border-violet-500 focus:ring focus:ring-violet-200 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300"
                        placeholder="Zadejte jméno uživatele"
                      />
                    </div>
                  </div>

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
const showCreateModal = ref(false);
const creatingUser = ref(false);
const createError = ref<string | null>(null);
const editingUser = ref<{
  id: string;
  email: string;
  role: string;
  name?: string;
} | null>(null);
const newUser = ref({
  email: '',
  password: '',
  role: 'viewer' as 'admin' | 'editor' | 'viewer',
  name: ''
});

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
      (permissions.value as any)[action] = results[index].data;
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
      name: editingUser.value.name,
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

// Funkce pro otevření modalu pro vytvoření uživatele
const openCreateModal = () => {
  newUser.value = {
    email: '',
    password: '',
    role: 'viewer',
    name: ''
  };
  createError.value = null;
  showCreateModal.value = true;
};

// Funkce pro zavření modalu pro vytvoření uživatele
const closeCreateModal = () => {
  showCreateModal.value = false;
  newUser.value = {
    email: '',
    password: '',
    role: 'viewer',
    name: ''
  };
  createError.value = null;
};

// Funkce pro vytvoření nového uživatele
const handleCreateUser = async () => {
  if (!newUser.value.email || !newUser.value.password) {
    createError.value = 'Email a heslo jsou povinné';
    return;
  }

  if (newUser.value.password.length < 6) {
    createError.value = 'Heslo musí mít alespoň 6 znaků';
    return;
  }

  creatingUser.value = true;
  createError.value = null;

  try {
    const response = await $fetch('/api/users/create', {
      method: 'POST',
      body: {
        email: newUser.value.email,
        password: newUser.value.password,
        role: newUser.value.role,
        name: newUser.value.name || undefined
      }
    });

    toast.success(response.message || 'Uživatel byl úspěšně vytvořen a potvrzovací e-mail byl odeslán');

    // Načteme aktualizovaný seznam uživatelů
    await fetchUsers();

    // Zavřeme modal
    closeCreateModal();
  } catch (err: any) {
    console.error('Error creating user:', err);
    const errorMessage = err.data?.message || 'Nepodařilo se vytvořit uživatele';
    createError.value = errorMessage;
    toast.error(errorMessage);
  } finally {
    creatingUser.value = false;
  }
};

// Funkce pro reset hesla
const resetPassword = async (user: { email: string }) => {
  try {
    await $fetch('/api/users/reset-password', {
      method: 'POST',
      body: { userEmail: user.email }
    });

    toast.success(`Email pro reset hesla byl odeslán na ${user.email}`);
  } catch (err: any) {
    console.error("Error resetting password:", err);
    toast.error(err.data?.message || "Nepodařilo se odeslat email pro reset hesla");
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