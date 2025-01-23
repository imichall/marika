<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa galerie</h1>
      <button
        @click="zobrazitModalNahraniFotek = true"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
        :disabled="nacitani"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Nahrát fotografie
      </button>
    </div>

    <div v-if="nacitani" class="text-center py-8">
      <p>Načítání...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p>{{ error }}</p>
    </div>

    <!-- Grid galerie -->
    <div v-else class="grid grid-cols-7 grid-rows-3 gap-2">
      <!-- Pozice 1: 2x2 -->
      <div class="col-span-2 row-span-2 relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[9])"
            alt="Gallery image 10"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(9)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[9])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pozice 2: 2x1 -->
      <div class="col-span-2 relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[5])"
            alt="Gallery image 6"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(5)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[5])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pozice 3: 2x2 -->
      <div class="col-span-2 row-span-2 relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[3])"
            alt="Gallery image 4"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(3)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[3])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pozice 4: 1x2 -->
      <div class="col-span-1 row-span-2 relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[1])"
            alt="Gallery image 2"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(1)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[1])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pozice 5: 1x1 -->
      <div class="relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[7])"
            alt="Gallery image 8"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(7)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[7])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pozice 6: 1x2 -->
      <div class="row-span-2 relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[4])"
            alt="Gallery image 5"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(4)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[4])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pozice 7: 3x1 -->
      <div class="col-span-3 relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[6])"
            alt="Gallery image 7"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(6)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[6])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pozice 8: 2x1 -->
      <div class="col-span-2 relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[2])"
            alt="Gallery image 3"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(2)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[2])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pozice 9: 1x1 -->
      <div class="relative group">
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="getImageUrl(images[0])"
            alt="Gallery image 1"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(0)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <button
              @click.stop="handleDelete(images[0])"
              class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro nahrávání -->
    <TransitionRoot appear :show="zobrazitModalNahraniFotek" as="template">
      <Dialog as="div" @close="closeUploadModal" class="relative z-50">
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
                  Nahrát fotografie
                </DialogTitle>

                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-500 transition-colors duration-200"
                  :class="{ 'border-red-500': isDragging }"
                  @dragenter.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                >
                  <div v-if="!selectedFiles.length" class="py-8">
                    <span
                      class="material-icons-outlined text-4xl text-gray-400 mb-2"
                    >
                      Nahrát obrázek
                    </span>
                    <p class="text-gray-500">
                      Přetáhněte sem fotografie nebo
                      <label
                        class="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        vyberte ze zařízení
                        <input
                          type="file"
                          class="hidden"
                          accept="image/*"
                          multiple
                          @change="handleFileSelect"
                        />
                      </label>
                    </p>
                    <p class="text-sm text-gray-400 mt-1">
                      Podporované formáty: JPG, PNG, WebP
                    </p>
                  </div>

                  <div v-else class="grid grid-cols-3 gap-4 mt-4">
                    <div
                      v-for="(file, index) in selectedFiles"
                      :key="index"
                      class="relative"
                    >
                      <img
                        :src="previewUrls[index]"
                        :alt="file.name"
                        class="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        @click="removeFile(index)"
                        class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                        title="Odstranit"
                      >
                        <span class="material-icons-outlined text-sm"
                          >close</span
                        >
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    @click="closeUploadModal"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="uploadFiles"
                    :disabled="!selectedFiles.length || uploading"
                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="uploading">Nahrávání...</span>
                    <span v-else
                      >Nahrát {{ selectedFiles.length }} fotografií</span
                    >
                  </button>
                </div>
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
                  Smazat fotografii
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tuto fotografii?
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

    <!-- Lightbox -->
    <TransitionRoot appear :show="showLightbox" as="template">
      <Dialog as="div" @close="closeLightbox" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/90" aria-hidden="true" />
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
              <DialogPanel class="relative w-full max-w-5xl">
                <button
                  @click="closeLightbox"
                  class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <span class="material-icons-outlined text-3xl">close</span>
                </button>

                <button
                  @click="previousImage"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <span class="material-icons-outlined text-4xl"
                    >chevron_left</span
                  >
                </button>

                <button
                  @click="nextImage"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <span class="material-icons-outlined text-4xl"
                    >chevron_right</span
                  >
                </button>

                <img
                  :src="getImageUrl(images[currentImageIndex])"
                  :alt="`Gallery image ${currentImageIndex + 1}`"
                  class="w-full h-auto max-h-[80vh] object-contain mx-auto"
                />
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
import { useToast } from "~/composables/useToast";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const images = ref([]);
const nacitani = ref(false);
const error = ref(null);

const zobrazitModalNahraniFotek = ref(false);
const showDeleteModal = ref(false);
const showLightbox = ref(false);
const isDragging = ref(false);
const selectedFiles = ref([]);
const previewUrls = ref([]);
const uploading = ref(false);
const imageToDelete = ref(null);
const currentImageIndex = ref(0);

const toast = useToast();

definePageMeta({
  layout: "admin",
});

onMounted(async () => {
  await fetchImages();
});

const fetchImages = async () => {
  try {
    nacitani.value = true;
    error.value = null;

    const response = await fetch("/api/gallery");
    if (!response.ok) throw new Error("Načítání fotografií selhalo");

    const data = await response.json();
    images.value = data.images;
  } catch (err) {
    console.error("Error fetching images:", err);
    error.value = err.message;
  } finally {
    nacitani.value = false;
  }
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `/images/mansory/${path}`;
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  processFiles(files);
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files).filter((file) =>
    file.type.startsWith("image/")
  );
  processFiles(files);
};

const processFiles = (files) => {
  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        `Soubor ${file.name} je příliš velký. Maximální velikost je 5MB.`
      );
      return;
    }

    selectedFiles.value.push(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrls.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};

const uploadFiles = async () => {
  try {
    uploading.value = true;
    const formData = new FormData();

    selectedFiles.value.forEach((file, index) => {
      const timestamp = Date.now();
      const fileName = `mansory-${String(index + 1).padStart(
        5,
        "0"
      )}.${file.name.split(".").pop()}`;
      formData.append("images", file, fileName);
    });

    const response = await fetch("/api/gallery/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Nahrávání selhalo");

    await fetchImages();
    closeUploadModal();
    toast.success("Fotografie byly úspěšně nahrány");
  } catch (err) {
    console.error("Error uploading files:", err);
    toast.error("Chyba při nahrávání: " + err.message);
  } finally {
    uploading.value = false;
  }
};

const closeUploadModal = () => {
  zobrazitModalNahraniFotek.value = false;
  selectedFiles.value = [];
  previewUrls.value = [];
  isDragging.value = false;
};

const handleDelete = (image) => {
  imageToDelete.value = image;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    const response = await fetch(`/api/gallery/${imageToDelete.value}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Mazání selhalo");

    await fetchImages();
    showDeleteModal.value = false;
    imageToDelete.value = null;
    toast.success("Fotografie byla úspěšně smazána");
  } catch (err) {
    console.error("Error deleting image:", err);
    toast.error("Chyba při mazání: " + err.message);
  }
};

const openLightbox = (index) => {
  currentImageIndex.value = index;
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};

const previousImage = () => {
  currentImageIndex.value =
    (currentImageIndex.value - 1 + images.value.length) % images.value.length;
};

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length;
};
</script>

<style scoped>
.grid {
  @apply transition-all duration-300 ease-in-out;
}

.grid > div {
  @apply transition-transform duration-300 hover:z-10;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
</style>