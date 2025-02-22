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
          <li
            v-for="archive in chatArchives"
            :key="archive.id"
            class="py-4 flex justify-between items-center"
          >
            <div>
              <p class="text-sm font-medium">
                Archiv z {{ formatDate(archive.created_at) }}
              </p>
              <p class="text-sm text-gray-500">
                {{ archive.message_count }} zpráv
              </p>
            </div>
            <div class="flex space-x-3">
              <button
                @click="downloadArchive(archive.id)"
                class="text-indigo-600 hover:text-indigo-800"
              >
                Stáhnout
              </button>
              <button
                @click="deleteArchive(archive.id)"
                class="text-red-600 hover:text-red-800"
              >
                Smazat
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

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

interface ChatArchive {
  id: string;
  created_at: string;
  messages: any[];
  message_count: number;
}

const supabase = useSupabaseClient();
const toast = useToast();
const loading = ref(false);
const activeTab = ref("history");
const chatArchives = ref<ChatArchive[]>([]);
let subscription: any = null;

const tabs = [
  { id: "history", name: "Historie chatu" },
  { id: "users", name: "Správa uživatelů" },
];

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

// Smazání archivu
const deleteArchive = async (archiveId: string) => {
  if (!confirm("Opravdu chcete smazat tento archiv?")) return;

  try {
    const { error } = await supabase
      .from("chat_archives")
      .delete()
      .eq("id", archiveId);

    if (error) throw error;

    toast.success("Archiv byl úspěšně smazán");
    await loadChatArchives();
  } catch (err) {
    console.error("Error deleting archive:", err);
    toast.error("Nepodařilo se smazat archiv");
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

onMounted(async () => {
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