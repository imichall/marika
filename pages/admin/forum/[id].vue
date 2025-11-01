<template>
  <div class="container mx-auto px-4 py-8 pb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"
      ></div>
    </div>

    <!-- Téma -->
    <div v-else-if="topic" class="space-y-6">
      <!-- Hlavička tématu -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-4">
              <h1 class="text-3xl font-bold text-gray-900">{{ topic.title }}</h1>
              <span
                v-if="topic.is_pinned"
                class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded"
              >
                Připnuto
              </span>
              <span
                v-if="topic.is_locked"
                class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded"
              >
                Zamčeno
              </span>
              <span
                v-if="topic.status === 'archived'"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded"
              >
                Archivováno
              </span>
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span class="flex items-center gap-1">
                <span class="material-icons-outlined text-[16px]">person</span>
                {{ topic.author_name }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-icons-outlined text-[16px]">schedule</span>
                {{ formatDate(topic.created_at) }}
              </span>
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-1">
                  <span class="material-icons-outlined text-[16px]">visibility</span>
                  {{ topic.view_count }} zhlédnutí
                </span>
                <button
                  v-if="editHistory.length > 0"
                  @click="showHistorySidebar = true"
                  class="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                  title="Historie úprav"
                >
                  <span class="material-icons-outlined text-[18px]">history</span>
                </button>
              </div>
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

            <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {{ topic.content }}
            </div>

            <div class="mt-6 flex gap-2">
              <button
                v-if="permissions.edit"
                @click="editTopic"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <span class="material-icons-outlined text-[20px]">edit</span>
                Upravit
              </button>
              <button
                v-if="permissions.edit"
                @click="togglePinTopic"
                class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-2"
              >
                <span class="material-icons-outlined text-[20px]">push_pin</span>
                {{ topic.is_pinned ? "Odepnout" : "Připnout" }}
              </button>
              <button
                v-if="isAdmin"
                @click="toggleLockTopic"
                class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
              >
                <span class="material-icons-outlined text-[20px]">
                  {{ topic.is_locked ? "lock_open" : "lock" }}
                </span>
                {{ topic.is_locked ? "Odemknout" : "Zamknout" }}
              </button>
              <button
                v-if="isAdmin"
                @click="deleteTopic"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              >
                <span class="material-icons-outlined text-[20px]">delete</span>
                Smazat
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Odpovědi -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            Odpovědi ({{ replies.length }})
          </h2>
          <button
            v-if="!topic.is_locked && permissions.create"
            @click="showReplyForm = !showReplyForm"
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
          >
            <span class="material-icons-outlined text-[20px]">reply</span>
            {{ showReplyForm ? "Zrušit" : "Přidat odpověď" }}
          </button>
        </div>

        <!-- Formulář pro odpověď -->
        <div v-if="showReplyForm && !topic.is_locked" class="mb-6">
          <textarea
            v-model="replyForm.content"
            rows="4"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            placeholder="Napište odpověď..."
          ></textarea>
          <div class="flex justify-end gap-2">
            <button
              @click="showReplyForm = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Zrušit
            </button>
            <button
              @click="submitReply"
              :disabled="!replyForm.content.trim()"
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Odeslat
            </button>
          </div>
        </div>

        <!-- Seznam odpovědí -->
        <div v-if="replies.length > 0" class="space-y-4">
          <div
            v-for="reply in replies"
            :key="reply.id"
            class="border-l-4 pl-4 py-4"
            :class="{
              'border-green-500 bg-green-50': reply.is_best_answer,
              'border-gray-300': !reply.is_best_answer,
            }"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-900">
                  {{ reply.author_name }}
                </span>
                <span
                  v-if="reply.is_best_answer"
                  class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                >
                  Nejlepší odpověď
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">
                  {{ formatDate(reply.created_at) }}
                </span>
                <div class="flex gap-1">
                  <button
                    v-if="permissions.edit"
                    @click="editReply(reply)"
                    class="p-1 text-blue-500 hover:text-blue-600 rounded"
                    title="Upravit"
                  >
                    <span class="material-icons-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    v-if="permissions.edit && !reply.is_best_answer"
                    @click="setBestAnswer(reply.id)"
                    class="p-1 text-green-500 hover:text-green-600 rounded"
                    title="Označit jako nejlepší odpověď"
                  >
                    <span class="material-icons-outlined text-[18px]">star</span>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="deleteReply(reply)"
                    class="p-1 text-red-500 hover:text-red-600 rounded"
                    title="Smazat"
                  >
                    <span class="material-icons-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="editingReply?.id === reply.id"
              class="mt-4"
            >
              <textarea
                v-model="editingReply.content"
                rows="4"
                class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              ></textarea>
              <div class="flex justify-end gap-2">
                <button
                  @click="cancelEditReply"
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Zrušit
                </button>
                <button
                  @click="saveEditReply"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Uložit
                </button>
              </div>
            </div>
            <div v-else class="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {{ reply.content }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          Zatím nejsou žádné odpovědi
        </div>
      </div>

      <!-- Historie zhlédnutí -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Historie zhlédnutí</h2>

        <div v-if="views.length > 0" class="space-y-2">
          <div
            v-for="view in views"
            :key="view.id"
            class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons-outlined text-[18px] text-gray-400">visibility</span>
              <span class="font-medium text-gray-900">{{ view.viewed_by_name }}</span>
            </div>
            <span class="text-sm text-gray-500">
              {{ formatDate(view.viewed_at) }}
            </span>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          Zatím žádné zhlédnutí
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else class="text-center py-8 text-red-600">
      Téma nebylo nalezeno
    </div>

    <!-- Sidebar pro historii úprav -->
    <Teleport to="body">
      <Transition name="sidebar-overlay">
        <div
          v-if="showHistorySidebar"
          class="fixed inset-0 z-50 overflow-hidden"
          @click.self="showHistorySidebar = false"
        >
          <!-- Overlay -->
          <div class="fixed inset-0 bg-black bg-opacity-50"></div>

          <!-- Sidebar -->
          <Transition name="sidebar">
            <div
              v-if="showHistorySidebar"
              class="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto z-50"
            >
              <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 class="text-2xl font-bold text-gray-900">Historie úprav</h2>
                <button
                  @click="showHistorySidebar = false"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span class="material-icons-outlined text-[24px]">close</span>
                </button>
              </div>

              <div class="p-6">
                <div v-if="editHistory.length > 0" class="space-y-4">
                  <div
                    v-for="history in editHistory"
                    :key="history.id"
                    class="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-gray-900">
                          {{ history.edited_by_name }}
                        </span>
                        <span class="text-sm text-gray-500">
                          {{ formatDate(history.created_at) }}
                        </span>
                      </div>
                    </div>

                    <div class="space-y-2 text-sm">
                      <div v-if="history.old_title && history.new_title" class="flex gap-2 flex-wrap">
                        <span class="font-medium text-gray-600">Název:</span>
                        <span class="text-red-600 line-through">{{ history.old_title }}</span>
                        <span class="text-gray-500">→</span>
                        <span class="text-green-600">{{ history.new_title }}</span>
                      </div>

                      <div v-if="history.old_category && history.new_category" class="flex gap-2 flex-wrap">
                        <span class="font-medium text-gray-600">Kategorie:</span>
                        <span class="text-red-600">{{ getCategoryName(history.old_category) }}</span>
                        <span class="text-gray-500">→</span>
                        <span class="text-green-600">{{ getCategoryName(history.new_category) }}</span>
                      </div>

                      <div v-if="history.old_tag && history.new_tag" class="flex gap-2 flex-wrap">
                        <span class="font-medium text-gray-600">Tag:</span>
                        <span class="text-red-600">{{ getTagName(history.old_tag) }}</span>
                        <span class="text-gray-500">→</span>
                        <span class="text-green-600">{{ getTagName(history.new_tag) }}</span>
                      </div>

                      <div v-if="history.old_content && history.new_content" class="mt-2">
                        <span class="font-medium text-gray-600 block mb-1">Obsah:</span>
                        <div class="bg-white p-3 rounded border border-gray-200">
                          <div class="mb-2">
                            <span class="text-xs text-red-600 font-medium">Původní:</span>
                            <p class="text-gray-700 text-xs mt-1 whitespace-pre-wrap break-words">
                              {{ history.old_content }}
                            </p>
                          </div>
                          <div>
                            <span class="text-xs text-green-600 font-medium">Nový:</span>
                            <p class="text-gray-700 text-xs mt-1 whitespace-pre-wrap break-words">
                              {{ history.new_content }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-gray-500">
                  Žádná historie úprav
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal pro úpravu tématu -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditModal"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Upravit téma</h2>

        <form @submit.prevent="saveEditTopic" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Název tématu
            </label>
            <input
              v-model="editForm.title"
              type="text"
              required
              maxlength="500"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Kategorie
              </label>
              <select
                v-model="editForm.category"
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
                v-model="editForm.tag"
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
              v-model="editForm.content"
              required
              rows="8"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeEditModal"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Zrušit
            </button>
            <button
              type="submit"
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Uložit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Teleport, Transition } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "~/composables/useToast";
import { useForum } from "~/composables/useForum";
import { useSupabaseClient } from "#imports";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const supabase = useSupabaseClient();
const {
  topic,
  replies,
  editHistory,
  views,
  loading,
  fetchTopic,
  updateTopic,
  deleteTopic: removeTopic,
  toggleLockTopic: toggleLockTopicFn,
  togglePinTopic: togglePinTopicFn,
  createReply,
  updateReply,
  deleteReply: removeReply,
  setBestAnswer: setBestAnswerFromComposable,
  incrementViewCount,
  fetchEditHistory,
  fetchViews,
} = useForum();

const showReplyForm = ref(false);
const replyForm = ref({
  content: "",
});
const editingReply = ref<any>(null);
const showEditModal = ref(false);
const showHistorySidebar = ref(false);
const editForm = ref({
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

const submitReply = async () => {
  if (!replyForm.value.content.trim() || !topic.value) return;

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.email) {
      toast.error("Nejste přihlášeni");
      return;
    }

    await createReply(topic.value.id, {
      content: replyForm.value.content,
      author_name: user.user.email.split("@")[0], // Fallback
      author_email: user.user.email,
    });

    toast.success("Odpověď byla úspěšně přidána");
    replyForm.value.content = "";
    showReplyForm.value = false;
  } catch (err) {
    console.error("Error submitting reply:", err);
    toast.error("Nepodařilo se přidat odpověď");
  }
};

const editReply = (reply: any) => {
  editingReply.value = { ...reply };
};

const cancelEditReply = () => {
  editingReply.value = null;
};

const saveEditReply = async () => {
  if (!editingReply.value) return;

  try {
    await updateReply(editingReply.value.id, {
      content: editingReply.value.content,
    });
    toast.success("Odpověď byla úspěšně upravena");
    editingReply.value = null;
  } catch (err) {
    console.error("Error updating reply:", err);
    toast.error("Nepodařilo se upravit odpověď");
  }
};

const deleteReply = async (reply: any) => {
  if (!confirm("Opravdu chcete smazat tuto odpověď? Tato akce je nevratná.")) {
    return;
  }

  try {
    await removeReply(reply.id);
    toast.success("Odpověď byla úspěšně smazána");
  } catch (err) {
    console.error("Error deleting reply:", err);
    toast.error("Nepodařilo se smazat odpověď");
  }
};

const setBestAnswer = async (replyId: string) => {
  if (!topic.value) return;

  try {
    await setBestAnswerFromComposable(replyId, topic.value.id);
    toast.success("Odpověď byla označena jako nejlepší");
  } catch (err) {
    console.error("Error setting best answer:", err);
    toast.error("Nepodařilo se označit odpověď");
  }
};

const editTopic = () => {
  if (!topic.value) return;
  editForm.value = {
    title: topic.value.title,
    content: topic.value.content,
    category: topic.value.category,
    tag: topic.value.tag || 'general',
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {
    title: "",
    content: "",
    category: "general",
    tag: "general",
  };
};

const saveEditTopic = async () => {
  if (!topic.value) return;

  try {
    await updateTopic(topic.value.id, {
      title: editForm.value.title,
      content: editForm.value.content,
      category: editForm.value.category,
      tag: editForm.value.tag,
    });
    toast.success("Téma bylo úspěšně upraveno");
    closeEditModal();
    await fetchTopic(topic.value.id);
  } catch (err) {
    console.error("Error updating topic:", err);
    toast.error("Nepodařilo se upravit téma");
  }
};

const toggleLockTopic = async () => {
  if (!topic.value) return;

  try {
    await toggleLockTopicFn(topic.value.id, !topic.value.is_locked);
    toast.success(
      topic.value.is_locked ? "Téma bylo odemčeno" : "Téma bylo zamčeno"
    );
    await fetchTopic(topic.value.id);
  } catch (err) {
    console.error("Error toggling lock:", err);
    toast.error("Nepodařilo se změnit stav zamčení");
  }
};

const togglePinTopic = async () => {
  if (!topic.value) return;

  try {
    await togglePinTopicFn(topic.value.id, !topic.value.is_pinned);
    toast.success(
      topic.value.is_pinned ? "Téma bylo odepnuto" : "Téma bylo připnuto"
    );
    await fetchTopic(topic.value.id);
  } catch (err) {
    console.error("Error toggling pin:", err);
    toast.error("Nepodařilo se změnit stav připnutí");
  }
};

const deleteTopic = async () => {
  if (!topic.value) return;

  if (!confirm("Opravdu chcete smazat toto téma? Tato akce je nevratná.")) {
    return;
  }

  try {
    await removeTopic(topic.value.id);
    toast.success("Téma bylo úspěšně smazáno");
    router.push("/admin/forum");
  } catch (err) {
    console.error("Error deleting topic:", err);
    toast.error("Nepodařilo se smazat téma");
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
  const topicId = route.params.id as string;
  if (topicId) {
    await fetchTopic(topicId);
    await incrementViewCount(topicId);
    await fetchEditHistory(topicId);
    await fetchViews(topicId);
  }
});
</script>

<style scoped>
/* Sidebar overlay animace */
.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}

/* Sidebar slide animace */
.sidebar-enter-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-enter-from {
  transform: translateX(100%);
}

.sidebar-enter-to {
  transform: translateX(0);
}

.sidebar-leave-from {
  transform: translateX(0);
}

.sidebar-leave-to {
  transform: translateX(100%);
}
</style>

