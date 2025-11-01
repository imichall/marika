<template>
  <div class="container mx-auto px-4 py-8 pb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa fóra</h1>
      <button
        v-if="permissions.create"
        @click="showAddModal = true"
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
      >
        <span class="material-icons-outlined text-[20px]">add</span>
        Nové téma
      </button>
    </div>

    <!-- Filtry -->
    <div class="mb-6 flex gap-4 items-center flex-wrap">
      <select
        v-model="selectedCategory"
        @change="applyFilters"
        class="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Všechny kategorie</option>
        <option value="general">Obecné</option>
        <option value="announcement">Oznámení</option>
        <option value="help">Pomoc</option>
      </select>

      <select
        v-model="selectedTag"
        @change="applyFilters"
        class="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Všechny tagy</option>
        <option value="general">Obecné</option>
        <option value="bug">Bug</option>
        <option value="issue">Issue</option>
        <option value="uprava">Úprava</option>
      </select>

      <select
        v-model="selectedStatus"
        @change="applyFilters"
        class="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Všechny stavy</option>
        <option value="active">Aktivní</option>
        <option value="locked">Zamčené</option>
        <option value="archived">Archivované</option>
      </select>

      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="showPinnedOnly"
          type="checkbox"
          @change="applyFilters"
          class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span class="text-sm text-gray-700">Pouze připnutá</span>
      </label>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"
      ></div>
    </div>

    <!-- Seznam témat -->
    <div v-else class="space-y-4">
      <div
        v-for="topic in filteredTopics"
        :key="topic.id"
        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        :class="{
          'border-l-4 border-indigo-500': topic.is_pinned,
          'opacity-75': topic.status === 'archived',
        }"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <NuxtLink
                :to="`/admin/forum/${topic.id}`"
                class="text-lg font-bold text-gray-900 hover:text-indigo-600"
              >
                {{ topic.title }}
              </NuxtLink>
              <span
                v-if="topic.is_pinned"
                class="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
              >
                Připnuto
              </span>
              <span
                v-if="topic.is_locked"
                class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
              >
                Zamčeno
              </span>
              <span
                v-if="topic.status === 'archived'"
                class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                Archivováno
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-2 line-clamp-2">
              {{ topic.content }}
            </p>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <span class="material-icons-outlined text-[16px]">person</span>
                {{ topic.author_name }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-icons-outlined text-[16px]">forum</span>
                {{ topic.reply_count }} odpovědí
              </span>
              <span class="flex items-center gap-1">
                <span class="material-icons-outlined text-[16px]">visibility</span>
                {{ topic.view_count }} zhlédnutí
              </span>
              <span class="flex items-center gap-1">
                <span class="material-icons-outlined text-[16px]">schedule</span>
                {{ formatDate(topic.last_activity_at) }}
              </span>
              <span
                class="px-2 py-1 text-xs rounded"
                :class="{
                  'bg-blue-100 text-blue-700': topic.category === 'general',
                  'bg-yellow-100 text-yellow-700': topic.category === 'announcement',
                  'bg-green-100 text-green-700': topic.category === 'help',
                }"
              >
                {{ getCategoryName(topic.category) }}
              </span>
              <span
                class="px-2 py-1 text-xs rounded font-medium"
                :class="{
                  'bg-gray-100 text-gray-700': topic.tag === 'general',
                  'bg-red-100 text-red-700': topic.tag === 'bug',
                  'bg-orange-100 text-orange-700': topic.tag === 'issue',
                  'bg-blue-100 text-blue-700': topic.tag === 'uprava',
                }"
              >
                {{ getTagName(topic.tag || 'general') }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button
              v-if="permissions.edit"
              @click="editTopic(topic)"
              class="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Upravit"
            >
              <span class="material-icons-outlined text-[20px]">edit</span>
            </button>
            <button
              v-if="permissions.edit"
              @click="togglePinTopic(topic)"
              class="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded"
              :title="topic.is_pinned ? 'Odepnout' : 'Připnout'"
            >
              <span
                class="material-icons-outlined text-[20px]"
                :class="{ 'text-yellow-600': topic.is_pinned }"
              >
                push_pin
              </span>
            </button>
            <button
              v-if="isAdmin"
              @click="toggleLockTopic(topic)"
              class="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded"
              :title="topic.is_locked ? 'Odemknout' : 'Zamknout'"
            >
              <span
                class="material-icons-outlined text-[20px]"
                :class="{ 'text-orange-600': topic.is_locked }"
              >
                {{ topic.is_locked ? 'lock' : 'lock_open' }}
              </span>
            </button>
            <button
              v-if="permissions.edit"
              @click="archiveTopic(topic)"
              class="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded"
              title="Archivovat"
            >
              <span class="material-icons-outlined text-[20px]">archive</span>
            </button>
            <button
              v-if="isAdmin"
              @click="deleteTopic(topic)"
              class="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
              title="Smazat"
            >
              <span class="material-icons-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredTopics.length === 0" class="text-center py-8 text-gray-500">
        Žádná témata
      </div>
    </div>

    <!-- Modal pro přidání/úpravu tématu -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingTopic ? "Upravit" : "Nové" }} téma
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Název tématu
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              maxlength="500"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Zadejte název tématu"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Kategorie
              </label>
              <select
                v-model="form.category"
                required
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">Obecné</option>
                <option value="announcement">Oznámení</option>
                <option value="help">Pomoc</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Tag
              </label>
              <select
                v-model="form.tag"
                required
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">Obecné</option>
                <option value="bug">Bug</option>
                <option value="issue">Issue</option>
                <option value="uprava">Úprava</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Obsah
            </label>
            <textarea
              v-model="form.content"
              required
              rows="8"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Zadejte obsah tématu"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Zrušit
            </button>
            <button
              type="submit"
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {{ editingTopic ? "Uložit" : "Vytvořit" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToast } from "~/composables/useToast";
import { useForum } from "~/composables/useForum";
import { useSupabaseClient } from "#imports";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

const toast = useToast();
const supabase = useSupabaseClient();
const {
  topics,
  loading,
  fetchTopics,
  createTopic,
  updateTopic,
  deleteTopic: removeTopic,
  archiveTopic: archiveTopicFn,
  toggleLockTopic: toggleLockTopicFn,
  togglePinTopic: togglePinTopicFn,
} = useForum();

const showAddModal = ref(false);
const editingTopic = ref<any>(null);
const selectedCategory = ref("");
const selectedTag = ref("");
const selectedStatus = ref("");
const showPinnedOnly = ref(false);

const form = ref({
  title: "",
  content: "",
  category: "general" as "general" | "announcement" | "help",
  tag: "general" as "general" | "bug" | "issue" | "uprava",
});

// Oprávnění
const permissions = ref({
  view: false,
  create: false,
  edit: false,
  delete: false,
});

// Admin status
const isAdmin = ref(false);

const filteredTopics = computed(() => {
  let result = [...topics.value];

  if (selectedCategory.value) {
    result = result.filter((t) => t.category === selectedCategory.value);
  }

  if (selectedTag.value) {
    result = result.filter((t) => (t.tag || 'general') === selectedTag.value);
  }

  if (selectedStatus.value) {
    result = result.filter((t) => t.status === selectedStatus.value);
  }

  if (showPinnedOnly.value) {
    result = result.filter((t) => t.is_pinned);
  }

  return result;
});

const applyFilters = () => {
  // Filters are applied via computed property
};

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    general: "Obecné",
    announcement: "Oznámení",
    help: "Pomoc",
  };
  return names[category] || category;
};

const getTagName = (tag: string) => {
  const names: Record<string, string> = {
    general: "Obecné",
    bug: "Bug",
    issue: "Issue",
    uprava: "Úprava",
  };
  return names[tag] || tag;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const editTopic = (topic: any) => {
  editingTopic.value = topic;
  form.value = {
    title: topic.title,
    content: topic.content,
    category: topic.category,
    tag: topic.tag || 'general',
  };
  showAddModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
  editingTopic.value = null;
  form.value = {
    title: "",
    content: "",
    category: "general",
    tag: "general",
  };
};

const handleSubmit = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.email) {
      toast.error("Nejste přihlášeni");
      return;
    }

    // Získání jména uživatele
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("email")
      .eq("email", user.user.email)
      .single();

    if (editingTopic.value) {
      await updateTopic(editingTopic.value.id, {
        title: form.value.title,
        content: form.value.content,
        category: form.value.category,
        tag: form.value.tag,
      });
      toast.success("Téma bylo úspěšně upraveno");
    } else {
      await createTopic({
        title: form.value.title,
        content: form.value.content,
        category: form.value.category,
        tag: form.value.tag,
        author_name: user.user.email.split("@")[0], // Fallback
        author_email: user.user.email,
      });
      toast.success("Téma bylo úspěšně vytvořeno");
    }

    closeModal();
    await fetchTopics();
  } catch (err) {
    console.error("Error saving topic:", err);
    toast.error("Nepodařilo se uložit téma");
  }
};

const deleteTopic = async (topic: any) => {
  if (!confirm("Opravdu chcete smazat toto téma? Tato akce je nevratná.")) {
    return;
  }

  try {
    await removeTopic(topic.id);
    toast.success("Téma bylo úspěšně smazáno");
    await fetchTopics();
  } catch (err) {
    console.error("Error deleting topic:", err);
    toast.error("Nepodařilo se smazat téma");
  }
};

const archiveTopic = async (topic: any) => {
  try {
    await archiveTopicFn(topic.id);
    toast.success("Téma bylo úspěšně archivováno");
    await fetchTopics();
  } catch (err) {
    console.error("Error archiving topic:", err);
    toast.error("Nepodařilo se archivovat téma");
  }
};

const toggleLockTopic = async (topic: any) => {
  try {
    await toggleLockTopicFn(topic.id, !topic.is_locked);
    toast.success(
      topic.is_locked ? "Téma bylo odemčeno" : "Téma bylo zamčeno"
    );
    await fetchTopics();
  } catch (err) {
    console.error("Error toggling lock:", err);
    toast.error("Nepodařilo se změnit stav zamčení");
  }
};

const togglePinTopic = async (topic: any) => {
  try {
    await togglePinTopicFn(topic.id, !topic.is_pinned);
    toast.success(
      topic.is_pinned ? "Téma bylo odepnuto" : "Téma bylo připnuto"
    );
    await fetchTopics();
  } catch (err) {
    console.error("Error toggling pin:", err);
    toast.error("Nepodařilo se změnit stav připnutí");
  }
};

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Kontrola role uživatele
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", user.data.user.email)
      .single();

    isAdmin.value = userRole?.role === "admin";

    const actions: Array<"view" | "create" | "edit" | "delete"> = ["view", "create", "edit", "delete"];
    for (const action of actions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "forum",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

onMounted(async () => {
  await loadPermissions();
  await fetchTopics();
});
</script>

