<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa skupin</h1>
      <button
        @click="showAddModal = true"
        class="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
        :disabled="loading"
      >
        Přidat skupinu
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p>Načítání...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p>{{ error }}</p>
    </div>

    <!-- Seznam skupin -->
    <div v-else class="grid grid-cols-1 gap-8">
      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div class="relative">
            <img
              v-if="group.image"
              :src="getFullImageUrl(group.image)"
              :alt="group.name"
              class="w-full h-64 object-cover rounded-lg"
            />
            <div
              v-else
              class="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg"
            >
              <span class="material-icons-outlined text-4xl text-gray-300">
                image
              </span>
            </div>
          </div>

          <div class="flex flex-col">
            <h3 class="text-2xl font-bold mb-4">{{ group.name }}</h3>
            <p class="text-gray-600 mb-6">{{ group.description }}</p>

            <div class="mt-auto flex justify-end gap-3">
              <button
                @click="editGroup(group)"
                class="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
              >
                Upravit
              </button>
              <button
                @click="handleDelete(group.id)"
                class="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro přidání/úpravu skupiny -->
    <TransitionRoot appear :show="showAddModal" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
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
              <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-2xl">
                <DialogTitle as="h2" class="text-xl font-bold mb-4">
                  {{ editingGroup ? "Upravit" : "Přidat" }} skupinu
                </DialogTitle>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Název skupiny
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
                      Obrázek skupiny
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
                        <span
                          class="material-icons-outlined text-4xl text-gray-400 mb-2"
                        >
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

                  <div class="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      @click="closeModal"
                      class="inline-flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-200"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                    >
                      {{ editingGroup ? "Uložit" : "Přidat" }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
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
                  Smazat skupinu
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tuto skupinu?
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
import { ref, onMounted } from "vue";
import { useChoirGroups } from "~/composables/useChoirGroups";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const {
  groups,
  loading,
  error,
  fetchGroups,
  updateGroup,
  addGroup,
  deleteGroup,
} = useChoirGroups();

onMounted(() => {
  fetchGroups();
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
});

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
  };
  imagePreview.value = null;
  editingGroup.value = null;
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const handleSubmit = async () => {
  try {
    if (editingGroup.value) {
      await updateGroup(editingGroup.value.id, form.value);
    } else {
      await addGroup(form.value);
    }
    closeModal();
  } catch (err) {
    console.error("Error submitting group:", err);
    alert(`Chyba při ukládání: ${err.message}`);
  }
};

const editGroup = (group) => {
  editingGroup.value = group;
  form.value = {
    name: group.name,
    description: group.description,
    image: group.image,
  };
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
  } catch (err) {
    console.error("Error deleting group:", err);
    alert(`Chyba při mazání: ${err.message}`);
  }
};

definePageMeta({
  layout: "admin",
});
</script>