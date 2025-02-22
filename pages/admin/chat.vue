<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa chatu</h1>
    </div>

    <!-- Tabs -->
    <div class="mb-8">
      <nav class="flex space-x-4" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700',
            'px-3 py-2 font-medium text-sm rounded-md',
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Historie chatu -->
    <div v-if="activeTab === 'history'" class="space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Historie chatu</h2>
          <button
            @click="archiveCurrentChat"
            class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Archivovat aktuální chat
          </button>
        </div>

        <div v-if="loading" class="text-center py-4">
          <div
            class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto"
          ></div>
        </div>

        <div
          v-else-if="chatArchives.length === 0"
          class="text-gray-500 text-center py-4"
        >
          Žádné archivované chaty
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li v-for="archive in chatArchives" :key="archive.id" class="py-4">
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    Archiv z {{ formatDate(archive.created_at) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ archive.message_count }} zpráv
                  </p>
                </div>
                <div class="flex space-x-3">
                  <button
                    @click="viewArchive(archive)"
                    class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span class="material-icons-outlined text-[20px]"
                      >visibility</span
                    >
                    <span>Zobrazit</span>
                  </button>
                  <button
                    @click="downloadArchive(archive.id)"
                    class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span class="material-icons-outlined text-[20px]"
                      >download</span
                    >
                    <span>Stáhnout</span>
                  </button>
                  <button
                    @click="confirmDelete(archive)"
                    class="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <span class="material-icons-outlined text-[20px]"
                      >delete</span
                    >
                    <span>Smazat</span>
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal pro zobrazení archivu -->
    <TransitionRoot appear :show="!!selectedArchive" as="template">
      <Dialog as="div" @close="selectedArchive = null" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
              >
                <div class="absolute right-6 top-6">
                  <button
                    @click="selectedArchive = null"
                    class="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>

                <DialogTitle as="h3" class="text-xl font-semibold mb-4">
                  Archivovaný chat z
                  {{ formatDate(selectedArchive?.created_at) }}
                </DialogTitle>

                <div class="mt-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div class="space-y-4">
                    <template v-if="selectedArchive">
                      <div
                        v-for="message in selectedArchive.messages"
                        :key="message.id"
                        class="flex gap-3"
                        :class="{
                          'justify-end':
                            message.sender_email === currentUserEmail,
                        }"
                      >
                        <div
                          v-if="message.sender_email !== currentUserEmail"
                          class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-indigo-600">
                            {{ message.sender_name[0].toUpperCase() }}
                          </span>
                        </div>
                        <div
                          class="message-content max-w-[70%] rounded-2xl px-4 py-2 shadow-sm"
                          :class="{
                            'bg-gradient-to-br from-indigo-600 to-violet-600 text-white':
                              message.sender_email === currentUserEmail,
                            'bg-white border border-gray-100':
                              message.sender_email !== currentUserEmail,
                          }"
                        >
                          <div
                            v-if="message.sender_email !== currentUserEmail"
                            class="text-xs font-medium mb-1 text-gray-500"
                          >
                            {{ message.sender_name }}
                          </div>
                          <p class="text-sm">{{ message.message }}</p>
                          <div
                            class="text-[11px] mt-1 opacity-80"
                            :class="{
                              'text-white/70':
                                message.sender_email === currentUserEmail,
                              'text-gray-400':
                                message.sender_email !== currentUserEmail,
                            }"
                          >
                            {{ formatTime(message.created_at) }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro potvrzení smazání -->
    <TransitionRoot appear :show="!!archiveToDelete" as="template">
      <Dialog as="div" @close="archiveToDelete = null" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
              >
                <DialogTitle as="h3" class="text-lg font-medium text-gray-900">
                  Smazat archiv chatu
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Opravdu chcete smazat tento archiv chatu? Tato akce je
                    nevratná.
                  </p>
                </div>

                <div class="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    @click="archiveToDelete = null"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    @click="deleteArchiveConfirmed"
                  >
                    Smazat
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Správa uživatelů -->
    <div v-if="activeTab === 'users'" class="space-y-6">
      <ChatManagement :key="Date.now()" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

import { ref, onMounted, onUnmounted, watch } from "vue";
import { useSupabaseClient } from "#imports";
import { useToast } from "~/composables/useToast";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import ChatManagement from "~/components/ChatManagement.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

interface ChatMessage {
  id: string;
  sender_email: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface ChatArchive {
  id: string;
  created_at: string;
  messages: ChatMessage[];
  message_count: number;
}

const supabase = useSupabaseClient();
const toast = useToast();
const loading = ref(false);
const activeTab = ref("history");
const chatArchives = ref<ChatArchive[]>([]);
const currentUserEmail = ref<string | null>(null);
let subscription: any = null;

const tabs = [
  { id: "history", name: "Historie chatu" },
  { id: "users", name: "Správa uživatelů" },
];

const selectedArchive = ref<ChatArchive | null>(null);
const archiveToDelete = ref<ChatArchive | null>(null);

// Setup realtime subscriptions
const setupSubscriptions = () => {
  if (subscription) {
    subscription.unsubscribe();
  }

  subscription = supabase
    .channel("chat-admin")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_users",
      },
      async () => {
        // Při změně v chat_users tabulce znovu načteme data
        if (activeTab.value === "users") {
          await loadChatArchives();
        }
      }
    )
    .subscribe();
};

// Cleanup function
const cleanup = () => {
  if (subscription) {
    try {
      subscription.unsubscribe();
    } catch (err) {
      console.error("Error during subscription cleanup:", err);
    }
    subscription = null;
  }
};

// Načtení archivů chatu
const loadChatArchives = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from("chat_archives")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    chatArchives.value = data || [];
  } catch (err) {
    console.error("Error loading chat archives:", err);
    toast.error("Nepodařilo se načíst archivy chatu");
  } finally {
    loading.value = false;
  }
};

// Archivace aktuálního chatu
const archiveCurrentChat = async () => {
  try {
    loading.value = true;
    // Načteme všechny zprávy z admin chatu
    const { data: messages, error: messagesError } = await supabase
      .from("admin_chat_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    if (!messages || messages.length === 0) {
      toast.info("Žádné zprávy k archivaci");
      return;
    }

    // Vytvoření archivu
    const { error: archiveError } = await supabase
      .from("chat_archives")
      .insert({
        messages,
        message_count: messages.length,
      });

    if (archiveError) throw archiveError;

    // Smazání všech zpráv z hlavní tabulky
    const { error: deleteError } = await supabase.rpc(
      "delete_all_chat_messages"
    );

    if (deleteError) throw deleteError;

    // Smazání všech záznamů o posledním přečtení
    const { error: lastReadError } = await supabase.rpc(
      "delete_all_chat_last_read"
    );

    if (lastReadError) throw lastReadError;

    // Vyčistíme broadcast channel pro všechny klienty
    await supabase.channel("admin-chat").send({
      type: "broadcast",
      event: "chat_archived",
      payload: { archived_at: new Date().toISOString() },
    });

    toast.success("Chat byl úspěšně archivován");
    await loadChatArchives();
  } catch (err) {
    console.error("Error archiving chat:", err);
    toast.error("Nepodařilo se archivovat chat");
  } finally {
    loading.value = false;
  }
};

// Stažení archivu
const downloadArchive = async (archiveId: string) => {
  try {
    const { data, error } = await supabase
      .from("chat_archives")
      .select("messages")
      .eq("id", archiveId)
      .single();

    if (error) throw error;

    const blob = new Blob([JSON.stringify(data.messages, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-archive-${archiveId}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading archive:", err);
    toast.error("Nepodařilo se stáhnout archiv");
  }
};

// Zobrazení archivu
const viewArchive = (archive: ChatArchive) => {
  selectedArchive.value = archive;
};

// Potvrzení smazání
const confirmDelete = (archive: ChatArchive) => {
  archiveToDelete.value = archive;
};

// Smazání archivu po potvrzení
const deleteArchiveConfirmed = async () => {
  if (!archiveToDelete.value) return;

  try {
    const { error } = await supabase
      .from("chat_archives")
      .delete()
      .eq("id", archiveToDelete.value.id);

    if (error) throw error;

    toast.success("Archiv byl úspěšně smazán");
    await loadChatArchives();
  } catch (err) {
    console.error("Error deleting archive:", err);
    toast.error("Nepodařilo se smazat archiv");
  } finally {
    archiveToDelete.value = null;
  }
};

// Formátování data
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Formátování času
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return (
      "Včera " +
      date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
    );
  } else {
    return (
      date.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit" }) +
      " " +
      date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
    );
  }
};

onMounted(async () => {
  // Získáme aktuálního uživatele
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    currentUserEmail.value = user.email;
  }

  await loadChatArchives();
  setupSubscriptions();
});

onUnmounted(() => {
  cleanup();
});

// Watch for tab changes
watch(activeTab, async (newTab) => {
  if (newTab === "users") {
    await loadChatArchives();
  }
});
</script>