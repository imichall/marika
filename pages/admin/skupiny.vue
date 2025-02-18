<template>
  <div class="min-h-screen bg-gray-50/50">
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumbs -->
      <AdminBreadcrumbs />

      <div class="flex justify-between items-center mb-8">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
        >
          Správa těles
        </h1>
        <button
          v-if="permissions.create"
          @click="showAddModal = true"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/30"
          :disabled="loading"
        >
          <span class="material-icons-outlined">add_circle</span>
          Přidat těleso
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"
        ></div>
      </div>

      <div
        v-else-if="error"
        class="flex items-center justify-center py-12 text-red-600"
      >
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined">error_outline</span>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- Seznam skupin -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-green-100 transform hover:-translate-y-1"
        >
          <div class="p-6 space-y-6">
            <div class="relative aspect-video overflow-hidden rounded-xl">
              <img
                v-if="group.image"
                :src="getFullImageUrl(group.image)"
                :alt="group.name"
                class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div
                v-else
                class="w-full h-full bg-gray-100 flex items-center justify-center"
              >
                <span class="material-icons-outlined text-5xl text-gray-300">
                  image
                </span>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-2xl font-bold text-gray-800">{{ group.name }}</h3>
              <p class="text-gray-600 line-clamp-3">{{ group.description }}</p>

              <!-- Tlačítko pro poslech -->
              <div v-if="group.button_link" class="pt-2">
                <a
                  :href="group.button_link"
                  target="_blank"
                  class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl hover:from-purple-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/30"
                >
                  <span class="material-icons-outlined mr-2">headphones</span>
                  Poslechnout
                </a>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button
                  v-if="permissions.edit"
                  @click="editGroup(group)"
                  class="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span class="material-icons-outlined mr-2">edit</span>
                  Upravit
                </button>
                <button
                  v-if="permissions.delete"
                  @click="handleDelete(group.id)"
                  class="inline-flex items-center px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span class="material-icons-outlined mr-2">delete</span>
                  Smazat
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Prázdný stav -->
        <div
          v-if="groups.length === 0"
          class="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300"
        >
          <span class="material-icons-outlined text-6xl text-gray-400 mb-4"
            >group_off</span
          >
          <h3 class="text-xl font-medium text-gray-900 mb-2">Žádná tělesa</h3>
          <p class="text-gray-500 text-center mb-6">
            Zatím nebyly přidány žádná tělesa. Začněte přidáním prvního tělesa.
          </p>
          <button
            v-if="permissions.create"
            @click="showAddModal = true"
            class="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span class="material-icons-outlined">add_circle</span>
            Přidat první těleso
          </button>
        </div>
      </div>
    </div>

    <!-- Modal pro přidání/úpravu skupiny -->
    <TransitionRoot appear :show="showAddModal" as="template">
      <Dialog as="div" @close="handleClose" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-2xl">
              <DialogTitle as="h2" class="text-xl font-bold mb-4">
                {{ editingGroup ? "Upravit" : "Přidat" }} těleso
              </DialogTitle>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Název tělesa
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Popis
                  </label>
                  <textarea
                    v-model="form.description"
                    required
                    rows="4"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  ></textarea>
                </div>

                <!-- Nahrávání obrázku -->
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Obrázek tělesa
                  </label>
                  <div
                    class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-500 transition-colors duration-200"
                    :class="{ 'border-red-500': isDragging }"
                    @dragenter.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @dragover.prevent
                    @drop.prevent="handleDrop"
                  >
                    <div v-if="!form.image && !imagePreview" class="py-4">
                      <span class="text-4xl text-gray-400 mb-2">
                        Nahrát obrázek
                      </span>
                      <p class="text-gray-500">
                        Přetáhněte sem obrázek nebo
                        <label
                          class="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          vyberte ze zařízení
                          <input
                            type="file"
                            class="hidden"
                            accept="image/*"
                            @change="handleFileSelect"
                          />
                        </label>
                      </p>
                      <p class="text-sm text-gray-400 mt-1">
                        Podporované formáty: JPG, PNG, WebP
                      </p>
                    </div>

                    <div v-else class="relative">
                      <img
                        :src="
                          imagePreview ||
                          (form.image ? getFullImageUrl(form.image) : '')
                        "
                        alt="Náhled obrázku"
                        class="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        @click.prevent="removeImage"
                        class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
                        title="Odstranit obrázek"
                      >
                        <span class="material-icons-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Přidáme sekci pro sociální sítě do formuláře -->
                <div class="mt-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Sociální sítě
                  </h3>

                  <!-- Select pro výběr sociální sítě -->
                  <div class="flex gap-3 mb-4">
                    <select
                      v-model="selectedSocialMediaId"
                      class="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Vyberte sociální síť</option>
                      <option
                        v-for="sm in availableSocialMediaOptions"
                        :key="sm.id"
                        :value="sm.id"
                      >
                        {{ sm.platform }} - {{ sm.url }}
                      </option>
                    </select>

                    <button
                      @click="addSelectedSocialMedia"
                      :disabled="!selectedSocialMediaId"
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Přidat
                    </button>
                  </div>

                  <!-- Seznam vybraných sociálních sítí -->
                  <div class="space-y-3">
                    <div
                      v-for="sm in selectedSocialMediaDetails"
                      :key="sm.id"
                      class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div class="flex items-center gap-3">
                        <div class="p-2 bg-white rounded-full shadow-sm">
                          <svg
                            class="w-5 h-5"
                            :class="getIconColor(sm.platform)"
                            viewBox="0 0 24 24"
                          >
                            <path
                              v-if="sm.platform === 'facebook'"
                              fill="currentColor"
                              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                            />
                            <path
                              v-else-if="sm.platform === 'instagram'"
                              fill="currentColor"
                              d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span class="font-medium">{{ sm.platform }}</span>
                          <span class="text-sm text-gray-500 block">{{
                            sm.url
                          }}</span>
                        </div>
                      </div>

                      <button
                        @click="removeSocialMedia(sm.id)"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Odstranit"
                      >
                        <span class="material-icons-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Přidáme pole pro button link -->
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Odkaz na poslech
                  </label>
                  <input
                    v-model="form.button_link"
                    type="url"
                    placeholder="https://spotify.com/..."
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p class="mt-1 text-sm text-gray-500">
                    Vložte odkaz na Spotify, YouTube nebo jiný hudební portál.
                    Tento odkaz se použije pro tlačítko "Poslechnout" na webu.
                  </p>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    @click="handleClose"
                    class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    {{ editingGroup ? "Upravit" : "Přidat" }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Potvrzovací dialog pro smazání -->
    <TransitionRoot appear :show="showDeleteModal" as="template">
      <Dialog as="div" @close="showDeleteModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
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
              <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-md">
                <DialogTitle as="h2" class="text-xl font-bold mb-4">
                  Smazat těleso
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat toto těleso?
                </p>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="showDeleteModal = false"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="confirmDelete"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useChoirGroups } from "~/composables/useChoirGroups";
import { useToast } from "~/composables/useToast";
import { useSupabaseClient } from "#imports";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { useSocialMedia } from "~/composables/useSocialMedia";

const {
  groups,
  loading,
  error,
  fetchGroups,
  updateGroup,
  addGroup,
  deleteGroup,
} = useChoirGroups();

const toast = useToast();

const {
  socialMedia,
  loading: socialMediaLoading,
  getGroupSocialMedia,
  getAvailableSocialMedia,
  updateGroupSocialMediaLinks,
} = useSocialMedia();

const selectedSocialMedia = ref([]);

const availableSocialMedia = ref([]);

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
    if (!user.data?.user?.email) return;

    // Kontrola oprávnění pro každou akci
    const actions = ["view", "create", "edit", "delete"];
    for (const action of actions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "choir_groups",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

onMounted(async () => {
  await Promise.all([loadPermissions(), fetchGroups()]);
  await loadAvailableSocialMedia();
});

const showAddModal = ref(false);
const showDeleteModal = ref(false);
const editingGroup = ref(null);
const groupToDelete = ref(null);
const isDragging = ref(false);
const imagePreview = ref(null);

const form = ref({
  name: "",
  description: "",
  image: "",
  button_link: "",
});

const supabase = useSupabaseClient();

const getFullImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (process.client && path.startsWith("/")) {
    return window.location.origin + path;
  }
  return path;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    processFile(file);
  }
};

const processFile = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    alert("Obrázek je příliš velký. Maximální velikost je 5MB.");
    return;
  }

  try {
    const formData = new FormData();
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")}`;
    formData.append("image", file, fileName);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Nahrávání selhalo");
    }

    const data = await response.json();
    if (data.success) {
      form.value.image = data.path;
      imagePreview.value = getFullImageUrl(data.path);
    }
  } catch (err) {
    console.error("Error uploading image:", err);
    alert("Chyba při nahrávání obrázku: " + err.message);
  }
};

const removeImage = () => {
  form.value.image = "";
  imagePreview.value = null;
};

const resetForm = () => {
  form.value = {
    name: "",
    description: "",
    image: "",
    button_link: "",
  };
  imagePreview.value = null;
  editingGroup.value = null;
  selectedSocialMedia.value = [];
  isDragging.value = false;
};

const handleClose = () => {
  resetForm();
  showAddModal.value = false;
};

const handleSubmit = async () => {
  try {
    const groupData = {
      name: form.value.name,
      description: form.value.description,
      image: form.value.image,
      button_link: form.value.button_link,
    };

    if (editingGroup.value?.id) {
      await updateGroup(editingGroup.value.id, groupData);
      await updateGroupSocialMediaLinks(
        editingGroup.value.id,
        selectedSocialMedia.value
      );
      toast.success("Těleso bylo úspěšně upraveno");
    } else {
      const newGroup = await addGroup(groupData);
      if (newGroup?.id && selectedSocialMedia.value.length > 0) {
        await updateGroupSocialMediaLinks(
          newGroup.id,
          selectedSocialMedia.value
        );
      }
      toast.success("Těleso bylo úspěšně přidáno");
    }

    handleClose();
  } catch (error) {
    console.error("Error saving group:", error);
    toast.error("Chyba při ukládání tělesa");
  }
};

const loadAvailableSocialMedia = async (groupId) => {
  try {
    availableSocialMedia.value = await getAvailableSocialMedia(groupId);
  } catch (error) {
    console.error("Error loading available social media:", error);
    toast.error("Chyba při načítání sociálních sítí");
  }
};

const editGroup = async (group) => {
  if (!group) return;

  try {
    editingGroup.value = { ...group };
    form.value = {
      name: group.name || "",
      description: group.description || "",
      image: group.image || "",
      button_link: group.button_link || "",
    };

    await loadAvailableSocialMedia(group.id);

    const groupSocialMedia = await getGroupSocialMedia(group.id);
    selectedSocialMedia.value = groupSocialMedia.map((sm) => sm.id);

    showAddModal.value = true;
  } catch (error) {
    console.error("Error loading group data:", error);
    toast.error("Chyba při načítání dat těles");
  }
};

const addNewGroup = async () => {
  editingGroup.value = null;
  form.value = {
    name: "",
    description: "",
    image: "",
    button_link: "",
  };
  selectedSocialMedia.value = [];

  await loadAvailableSocialMedia();

  showAddModal.value = true;
};

const handleDelete = (id) => {
  groupToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await deleteGroup(groupToDelete.value);
    showDeleteModal.value = false;
    groupToDelete.value = null;
    toast.success("Těleso bylo úspěšně smazáno");
  } catch (err) {
    toast.error("Chyba při mazání tělesa: " + err.message);
  }
};

const availablePlatforms = computed(() => {
  const platforms = new Set(
    availableSocialMedia.value.map((sm) => sm.platform)
  );
  return Array.from(platforms);
});

const getSocialMediaUrl = (platform) => {
  const socialMedia = availableSocialMedia.value.find(
    (sm) => sm.platform === platform && !sm.choir_group_id
  );
  return socialMedia?.url || "";
};

const getIconColor = (platform) => {
  const colors = {
    facebook: "text-blue-600",
    instagram: "text-pink-600",
    youtube: "text-red-600",
    twitter: "text-blue-400",
    linkedin: "text-blue-700",
    tiktok: "text-black",
    spotify: "text-green-600",
    default: "text-gray-600",
  };
  return colors[platform] || colors.default;
};

watch(showAddModal, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

// Přidáme ref pro vybranou sociální síť
const selectedSocialMediaId = ref("");

// Helper funkce pro přidání sociální sítě do výběru
const addSelectedSocialMedia = () => {
  if (
    selectedSocialMediaId.value &&
    !selectedSocialMedia.value.includes(selectedSocialMediaId.value)
  ) {
    selectedSocialMedia.value.push(selectedSocialMediaId.value);
    selectedSocialMediaId.value = ""; // Reset selectu
  }
};

// Helper funkce pro odstranění sociální sítě z výběru
const removeSocialMedia = (id) => {
  selectedSocialMedia.value = selectedSocialMedia.value.filter(
    (smId) => smId !== id
  );
};

// Computed pro dostupné sociální sítě (které ještě nejsou vybrané)
const availableSocialMediaOptions = computed(() => {
  return availableSocialMedia.value.filter(
    (sm) => !selectedSocialMedia.value.includes(sm.id)
  );
});

// Computed pro získání detailů vybraných sociálních sítí
const selectedSocialMediaDetails = computed(() => {
  return selectedSocialMedia.value
    .map((id) => availableSocialMedia.value.find((sm) => sm.id === id))
    .filter(Boolean);
});

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});
</script>
