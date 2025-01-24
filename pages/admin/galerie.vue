<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa galerie</h1>
      <div class="flex gap-4">
        <button
          @click="handleClearCache"
          class="inline-flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Obnovit
        </button>
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
    </div>

    <div v-if="nacitani" class="text-center py-8">
      <p>Načítání...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p>{{ error }}</p>
    </div>

    <!-- Grid galerie -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="relative group aspect-square"
      >
        <div class="relative overflow-hidden rounded-xl h-full">
          <img
            :src="image.image_url"
            :alt="image.title"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            @click="openLightbox(index)"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
          >
            <div class="absolute top-2 right-2 flex gap-2">
              <button
                @click.stop="handleDelete(image)"
                class="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                title="Smazat fotografii"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2 flex items-center gap-2">
            <label
              class="inline-flex items-center cursor-pointer bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-full shadow-lg"
              title="Zobrazit/skrýt fotografii"
            >
              <input
                type="checkbox"
                :checked="image.is_visible"
                @change="handleVisibilityToggle(image)"
                class="sr-only peer"
              />
              <div
                class="relative w-8 h-4 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"
              ></div>
            </label>
            <div
              class="flex-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-2 py-1.5 flex items-center gap-2"
            >
              <input
                type="number"
                min="1"
                max="9"
                :value="image.position"
                @input="handlePositionChange($event, image)"
                @blur="handlePositionChange($event, image)"
                class="w-full bg-transparent text-center"
                placeholder="Pozice (1-9)"
              />
              <button
                v-if="image.position"
                @click="handlePositionChange({ target: { value: '' } }, image)"
                class="text-gray-500 hover:text-red-500 transition-colors duration-200"
                title="Odstranit pozici"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stránkování -->
    <div v-if="totalPages > 1" class="flex justify-center mb-12 gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="changePage(page)"
        class="px-4 py-2 rounded-lg transition-colors duration-200"
        :class="{
          'bg-red-500 text-white': currentPage === page,
          'bg-gray-200 hover:bg-gray-300': currentPage !== page,
        }"
      >
        {{ page }}
      </button>
    </div>

    <!-- Grid Layout Visualization -->
    <div class="container mx-auto px-4 mt-8 mb-12">
      <h2 class="text-xl font-semibold mb-4">Rozložení fotografií na webu</h2>
      <div
        class="grid grid-cols-7 grid-rows-3 gap-2 aspect-[7/3] bg-gray-50 p-4 rounded-xl"
      >
        <!-- Velký obrázek vlevo nahoře -->
        <div
          class="col-span-2 row-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >1</span
          >
          <span class="text-gray-500">2×2</span>
        </div>

        <!-- Široký obrázek nahoře uprostřed -->
        <div
          class="col-span-2 row-span-1 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >2</span
          >
          <span class="text-gray-500">2×1</span>
        </div>

        <!-- Velký obrázek vpravo nahoře -->
        <div
          class="col-span-2 row-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >3</span
          >
          <span class="text-gray-500">2×2</span>
        </div>

        <!-- Úzký vysoký obrázek vpravo -->
        <div
          class="col-span-1 row-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >4</span
          >
          <span class="text-gray-500">1×2</span>
        </div>

        <!-- Malý čtvercový obrázek -->
        <div
          class="border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >5</span
          >
          <span class="text-gray-500">1×1</span>
        </div>

        <!-- Úzký vysoký obrázek -->
        <div
          class="row-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >6</span
          >
          <span class="text-gray-500">1×2</span>
        </div>

        <!-- Široký obrázek dole -->
        <div
          class="col-span-3 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >7</span
          >
          <span class="text-gray-500">3×1</span>
        </div>

        <!-- Široký obrázek dole -->
        <div
          class="col-span-2 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >8</span
          >
          <span class="text-gray-500">2×1</span>
        </div>

        <!-- Malý čtvercový obrázek dole -->
        <div
          class="border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center relative"
        >
          <span
            class="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >9</span
          >
          <span class="text-gray-500">1×1</span>
        </div>
      </div>
      <p class="text-sm text-gray-500 mt-2">
        Toto schéma zobrazuje rozložení fotografií na webu. Čísla představují
        poměr velikostí (šířka×výška).
      </p>
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
                  :src="images[currentImageIndex]?.image_url"
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

<script setup lang="ts">
import { ref, onMounted } from "#imports";
import { useGallery } from "~/composables/useGallery";
import { useToast } from "~/composables/useToast";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const {
  images,
  loading: nacitani,
  error,
  currentPage,
  totalPages,
  fetchImages,
  deleteImage,
  clearCache,
  toggleVisibility,
  changePage,
  updatePosition,
} = useGallery();
const { showToast } = useToast();

const zobrazitModalNahraniFotek = ref(false);
const showDeleteModal = ref(false);
const showLightbox = ref(false);
const isDragging = ref(false);
const selectedFiles = ref([]);
const previewUrls = ref([]);
const uploading = ref(false);
const imageToDelete = ref(null);
const currentImageIndex = ref(0);
const selectedImageIndex = ref<number | null>(null);
const usedPositions = ref(new Set());

onMounted(() => {
  fetchImages();
  updateUsedPositions();
});

const handleDelete = async (image: any) => {
  if (!confirm("Opravdu chcete smazat tuto fotografii?")) return;

  const imageUrl = image.image_url;
  const filename = imageUrl.split("/").pop();

  const { success, error } = await deleteImage(filename);

  if (success) {
    showToast.success("Fotografie byla úspěšně smazána");
  } else {
    showToast.error(error || "Nepodařilo se smazat fotografii");
  }
};

const openLightbox = (index: number) => {
  selectedImageIndex.value = index;
};

const closeLightbox = () => {
  selectedImageIndex.value = null;
};

const handleUploadSuccess = () => {
  zobrazitModalNahraniFotek.value = false;
  fetchImages();
  showToast.success("Fotografie byly úspěšně nahrány");
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
      showToast.error(
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
    showToast.success("Fotografie byly úspěšně nahrány");
  } catch (err) {
    console.error("Error uploading files:", err);
    showToast.error("Chyba při nahrávání: " + err.message);
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

const confirmDelete = async () => {
  try {
    const response = await fetch(`/api/gallery/${imageToDelete.value}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Mazání selhalo");

    await fetchImages();
    showDeleteModal.value = false;
    imageToDelete.value = null;
    showToast.success("Fotografie byla úspěšně smazána");
  } catch (err) {
    console.error("Error deleting image:", err);
    showToast.error("Chyba při mazání: " + err.message);
  }
};

const previousImage = () => {
  currentImageIndex.value =
    (currentImageIndex.value - 1 + images.value.length) % images.value.length;
};

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length;
};

const handleClearCache = async () => {
  clearCache();
  await fetchImages();
  showToast.success("Cache byla vymazána");
};

const handleVisibilityToggle = async (image: any) => {
  try {
    const newVisibility = !image.is_visible;
    const result = await toggleVisibility(image.id, newVisibility);

    if (result?.success) {
      image.is_visible = newVisibility;
      showToast.success(
        `Fotografie byla ${newVisibility ? "zviditelněna" : "skryta"}`
      );
    } else {
      showToast.error(
        result?.error || "Nepodařilo se změnit viditelnost fotografie"
      );
    }
  } catch (err) {
    console.error("Error toggling visibility:", err);
    showToast.error("Nepodařilo se změnit viditelnost fotografie");
  }
};

const handlePositionChange = async (event: Event, image: any) => {
  const input = event.target as HTMLInputElement;
  const newPosition = input.value ? parseInt(input.value) : null;
  const toast = useToast();

  // Pokud je hodnota prázdná, odstraníme pozici
  if (newPosition === null) {
    const result = await updatePosition(image.id, null);
    if (result.success) {
      image.position = null;
      updateUsedPositions();
      toast.success("Pozice byla úspěšně odstraněna");
      await fetchImages();
      return;
    } else {
      input.value = image.position?.toString() || "";
      toast.error(result.error || "Nepodařilo se odstranit pozici");
      return;
    }
  }

  // Validace hodnoty
  if (isNaN(newPosition) || newPosition < 1 || newPosition > 9) {
    input.value = image.position?.toString() || "";
    toast.error("Zadejte číslo od 1 do 9");
    return;
  }

  // Kontrola duplicity
  if (
    images.value.some(
      (img) => img.id !== image.id && img.position === newPosition
    )
  ) {
    toast.error("Tato pozice je již obsazena jiným obrázkem");
    input.value = image.position?.toString() || "";
    return;
  }

  // Aktualizace pozice pomocí composable
  const result = await updatePosition(image.id, newPosition);
  if (result.success) {
    // Aktualizace lokálního stavu
    image.position = newPosition;
    updateUsedPositions();
    toast.success("Pozice byla úspěšně uložena");

    // Obnovíme data ze serveru pro jistotu
    await fetchImages();
  } else {
    input.value = image.position?.toString() || "";
    toast.error(result.error || "Nepodařilo se uložit pozici");
  }
};

const updateUsedPositions = () => {
  usedPositions.value = new Set(
    images.value
      .map((img) => img.position)
      .filter((pos) => pos !== null && pos !== undefined)
  );
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