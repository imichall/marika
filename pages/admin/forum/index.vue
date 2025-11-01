<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Breadcrumbs -->
      <AdminBreadcrumbs />

      <!-- Header s gradientem -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Správa fóra
            </h1>
            <p class="text-gray-600 text-sm">Spravujte diskuse, témata a odpovědi</p>
          </div>
          <button
            v-if="permissions.create"
            @click="showAddModal = true"
            class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 transform hover:scale-105"
          >
            <span class="material-icons-outlined text-[20px]">add</span>
            Nové téma
          </button>
        </div>

        <!-- Filtry - elegantnější design -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div class="flex gap-4 items-center flex-wrap">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Kategorie</label>
              <select
                v-model="selectedCategory"
                @change="applyFilters"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <option value="">Všechny kategorie</option>
                <option value="general">Obecné</option>
                <option value="announcement">Oznámení</option>
                <option value="help">Pomoc</option>
              </select>
            </div>

            <div class="flex-1 min-w-[200px]">
              <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Tag</label>
              <select
                v-model="selectedTag"
                @change="applyFilters"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <option value="">Všechny tagy</option>
                <option value="general">Obecné</option>
                <option value="bug">Bug</option>
                <option value="issue">Issue</option>
                <option value="uprava">Úprava</option>
              </select>
            </div>

            <div class="flex-1 min-w-[200px]">
              <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Stav</label>
              <select
                v-model="selectedStatus"
                @change="applyFilters"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <option value="">Všechny stavy</option>
                <option value="active">Aktivní</option>
                <option value="locked">Zamčené</option>
                <option value="archived">Archivované</option>
              </select>
            </div>

            <div class="flex items-center mt-6">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative">
                  <input
                    v-model="showPinnedOnly"
                    type="checkbox"
                    @change="applyFilters"
                    class="sr-only"
                  />
                  <div
                    class="w-12 h-6 rounded-full transition-colors duration-200"
                    :class="showPinnedOnly ? 'bg-indigo-600' : 'bg-gray-300'"
                  >
                    <div
                      class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200"
                      :class="showPinnedOnly ? 'translate-x-6' : 'translate-x-0'"
                    ></div>
                  </div>
                </div>
                <span class="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Pouze připnutá</span>
              </label>
            </div>
          </div>
        </div>
      </div>
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
        v-for="(topic, index) in filteredTopics"
        :key="topic.id"
        class="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
        :class="{
          'ring-2 ring-indigo-300 ring-offset-2': topic.is_pinned,
          'opacity-75': topic.status === 'archived',
        }"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <div class="p-6">
          <div class="flex justify-between items-start gap-6">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <NuxtLink
                :to="`/admin/forum/${topic.slug || topic.id}`"
                class="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors duration-200 group-hover:text-indigo-600"
              >
                {{ topic.title }}
              </NuxtLink>
              <span
                v-if="topic.is_pinned"
                class="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center gap-1 shadow-sm"
              >
                <span class="material-icons-outlined text-sm">push_pin</span>
                Připnuto
              </span>
              <span
                v-if="topic.is_locked"
                class="px-3 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-full flex items-center gap-1 shadow-sm"
              >
                <span class="material-icons-outlined text-sm">lock</span>
                Zamčeno
              </span>
              <span
                v-if="topic.status === 'archived'"
                class="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full shadow-sm"
              >
                Archivováno
              </span>
            </div>

            <p class="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {{ topic.content }}
            </p>

            <div class="flex items-center gap-6 flex-wrap">
              <div class="flex items-center gap-4 text-sm">
                <span class="flex items-center gap-2 text-gray-600 group-hover:text-indigo-600 transition-colors">
                  <span class="material-icons-outlined text-lg text-gray-400">person_outline</span>
                  <span class="font-medium">{{ topic.author_name }}</span>
                </span>
                <span class="flex items-center gap-2 text-gray-600">
                  <span class="material-icons-outlined text-lg text-gray-400">comment</span>
                  <span class="font-medium">{{ topic.reply_count }}</span>
                  <span class="text-gray-500 text-xs">odpovědí</span>
                </span>
                <span class="flex items-center gap-2 text-gray-600">
                  <span class="material-icons-outlined text-lg text-gray-400">visibility</span>
                  <span class="font-medium">{{ topic.view_count }}</span>
                </span>
                <span class="flex items-center gap-2 text-gray-600">
                  <span class="material-icons-outlined text-lg text-gray-400">schedule</span>
                  <span class="text-xs">{{ formatDate(topic.last_activity_at) }}</span>
                </span>
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm"
                  :class="{
                    'bg-blue-50 text-blue-700 border border-blue-200': topic.category === 'general',
                    'bg-yellow-50 text-yellow-700 border border-yellow-200': topic.category === 'announcement',
                    'bg-green-50 text-green-700 border border-green-200': topic.category === 'help',
                  }"
                >
                  {{ getCategoryName(topic.category) }}
                </span>
                <span
                  class="px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm"
                  :class="{
                    'bg-gray-50 text-gray-700 border border-gray-200': topic.tag === 'general',
                    'bg-red-50 text-red-700 border border-red-200': topic.tag === 'bug',
                    'bg-orange-50 text-orange-700 border border-orange-200': topic.tag === 'issue',
                    'bg-indigo-50 text-indigo-700 border border-indigo-200': topic.tag === 'uprava',
                  }"
                >
                  {{ getTagName(topic.tag || 'general') }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-2 flex-shrink-0">
            <button
              v-if="permissions.edit"
              @click="editTopic(topic)"
              class="p-2.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md"
              title="Upravit"
            >
              <span class="material-icons-outlined text-[20px]">edit</span>
            </button>
            <button
              v-if="permissions.edit"
              @click="togglePinTopic(topic)"
              class="p-2.5 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md"
              :class="{ 'bg-yellow-50 text-yellow-600': topic.is_pinned }"
              :title="topic.is_pinned ? 'Odepnout' : 'Připnout'"
            >
              <span class="material-icons-outlined text-[20px]">push_pin</span>
            </button>
            <button
              v-if="isAdmin"
              @click="toggleLockTopic(topic)"
              class="p-2.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md"
              :class="{ 'bg-orange-50 text-orange-600': topic.is_locked }"
              :title="topic.is_locked ? 'Odemknout' : 'Zamknout'"
            >
              <span class="material-icons-outlined text-[20px]">
                {{ topic.is_locked ? 'lock' : 'lock_open' }}
              </span>
            </button>
            <button
              v-if="permissions.edit"
              @click="archiveTopic(topic)"
              class="p-2.5 text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md"
              title="Archivovat"
            >
              <span class="material-icons-outlined text-[20px]">archive</span>
            </button>
            <button
              v-if="isAdmin"
              @click="deleteTopic(topic)"
              class="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md"
              title="Smazat"
            >
              <span class="material-icons-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="filteredTopics.length === 0"
        class="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200"
      >
        <span class="material-icons-outlined text-6xl text-gray-300 mb-4 block">forum</span>
        <p class="text-gray-500 text-lg font-medium">Žádná témata k zobrazení</p>
        <p class="text-gray-400 text-sm mt-2">Zkuste upravit filtry nebo vytvořit nové téma</p>
      </div>
    </div>
    </div>

    <!-- Modal pro přidání/úpravu tématu -->
    <Teleport to="body">
      <Transition name="modal-overlay">
        <div
          v-if="showAddModal"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          @click.self="closeModal"
        >
          <Transition name="modal">
            <div
              v-if="showAddModal"
              class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform"
            >
              <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <h2 class="text-2xl font-bold text-white">
                  {{ editingTopic ? "Upravit" : "Nové" }} téma
                </h2>
              </div>

              <div class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div>
                    <label class="block text-gray-700 text-sm font-semibold mb-2">
                      Název tématu
                    </label>
                    <input
                      v-model="form.title"
                      type="text"
                      required
                      maxlength="500"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                      placeholder="Zadejte název tématu"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-semibold mb-2">
                        Kategorie
                      </label>
                      <select
                        v-model="form.category"
                        required
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                      >
                        <option value="general">Obecné</option>
                        <option value="announcement">Oznámení</option>
                        <option value="help">Pomoc</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-semibold mb-2">
                        Tag
                      </label>
                      <select
                        v-model="form.tag"
                        required
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                      >
                        <option value="general">Obecné</option>
                        <option value="bug">Bug</option>
                        <option value="issue">Issue</option>
                        <option value="uprava">Úprava</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-semibold mb-2">
                      Obsah
                    </label>
                    <textarea
                      v-model="form.content"
                      required
                      rows="8"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 resize-none"
                      placeholder="Zadejte obsah tématu"
                    ></textarea>
                  </div>

                  <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      @click="closeModal"
                      class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200 hover:scale-105"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
                    >
                      {{ editingTopic ? "Uložit" : "Vytvořit" }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, Teleport, Transition } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "~/composables/useToast";
import { useForum } from "~/composables/useForum";
import { useSupabaseClient } from "#imports";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

const toast = useToast();
const router = useRouter();
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
  } else {
    // Pokud není vybrán žádný status, zobrazíme aktivní a zamčené (ne archivované)
    result = result.filter((t) => t.status !== 'archived');
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
      const newTopic = await createTopic({
        title: form.value.title,
        content: form.value.content,
        category: form.value.category,
        tag: form.value.tag,
        author_name: user.user.email.split("@")[0], // Fallback
        author_email: user.user.email,
      });
      toast.success("Téma bylo úspěšně vytvořeno");

      closeModal();
      await fetchTopics();

      // Přesměrujeme na nové téma pomocí slug
      if (newTopic && newTopic.slug) {
        await router.push(`/admin/forum/${newTopic.slug}`);
      } else if (newTopic) {
        await router.push(`/admin/forum/${newTopic.id}`);
      }
      return;
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

<style scoped>
/* Modal animations */
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.modal-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.modal-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Topic card animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group {
  animation: fadeInUp 0.4s ease-out both;
}
</style>

