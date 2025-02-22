# Vytvořím novou komponentu pro správu uživatelů chatu
<template>
  <div class="space-y-6">
    <!-- Správa uživatelů -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium">Uživatelé s přístupem do chatu</h2>
        <button
          @click="showAddUserModal = true"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Přidat uživatele
        </button>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto"
        ></div>
      </div>

      <div
        v-else-if="chatUsers.length === 0"
        class="text-gray-500 text-center py-4"
      >
        Žádní uživatelé s přístupem
      </div>

      <ul v-else class="divide-y divide-gray-200">
        <li v-for="user in chatUsers" :key="user.email" class="py-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">{{ user.name }}</p>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
            <button
              @click="removeUserAccess(user.email)"
              class="text-red-600 hover:text-red-800"
            >
              Odebrat přístup
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal pro přidání uživatele -->
    <TransitionRoot appear :show="showAddUserModal" as="template">
      <Dialog as="div" @close="showAddUserModal = false" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Přidat uživatele do chatu
                </DialogTitle>

                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Vyberte uživatele
                  </label>
                  <select
                    v-model="selectedUser"
                    class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Vyberte uživatele...</option>
                    <option
                      v-for="user in availableUsers"
                      :key="user.email"
                      :value="user"
                    >
                      {{ user.name }} ({{ user.email }})
                    </option>
                  </select>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    @click="showAddUserModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="addUserAccess"
                    :disabled="!selectedUser"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Přidat
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { useToast } from "~/composables/useToast";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

interface User {
  email: string;
  name: string;
  role: string;
}

interface ChatUser {
  email: string;
  name: string;
  created_at: string;
}

const supabase = useSupabaseClient();
const toast = useToast();

const loading = ref(false);
const chatUsers = ref<ChatUser[]>([]);
const showAddUserModal = ref(false);
const selectedUser = ref<User | null>(null);
const allUsers = ref<User[]>([]);

// Computed pro dostupné uživatele (ti, kteří ještě nemají přístup do chatu)
const availableUsers = computed(() => {
  const chatUserEmails = new Set(chatUsers.value.map((u) => u.email));
  return allUsers.value.filter((user) => !chatUserEmails.has(user.email));
});

// Načtení všech uživatelů
const fetchAllUsers = async () => {
  try {
    const { data, error } = await supabase.rpc("get_users");
    if (error) throw error;
    allUsers.value = data || [];
  } catch (err) {
    console.error("Error fetching users:", err);
    toast.error("Nepodařilo se načíst seznam uživatelů");
  }
};

// Načtení uživatelů chatu
const fetchChatUsers = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from("chat_users")
      .select("*")
      .order("name");

    if (error) throw error;
    chatUsers.value = data || [];
  } catch (err) {
    console.error("Error fetching chat users:", err);
    toast.error("Nepodařilo se načíst uživatele chatu");
  } finally {
    loading.value = false;
  }
};

// Přidání uživatele do chatu
const addUserAccess = async () => {
  if (!selectedUser.value) return;

  try {
    const { error } = await supabase.from("chat_users").insert({
      email: selectedUser.value.email,
      name: selectedUser.value.name,
    });

    if (error) throw error;
    toast.success("Uživatel byl přidán do chatu");
    showAddUserModal.value = false;
    selectedUser.value = null;
    await fetchChatUsers();
  } catch (err) {
    console.error("Error adding chat user:", err);
    toast.error("Nepodařilo se přidat uživatele");
  }
};

// Odebrání uživatele z chatu
const removeUserAccess = async (email: string) => {
  try {
    const { error } = await supabase
      .from("chat_users")
      .delete()
      .eq("email", email);

    if (error) throw error;
    toast.success("Uživatel byl odebrán z chatu");
    await fetchChatUsers();
  } catch (err) {
    console.error("Error removing chat user:", err);
    toast.error("Nepodařilo se odebrat uživatele");
  }
};

// Inicializace
onMounted(async () => {
  await Promise.all([fetchChatUsers(), fetchAllUsers()]);
});
</script>