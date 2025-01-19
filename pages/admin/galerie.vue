<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa galerie</h1>
      <button
        @click="showUploadModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Přidat fotografie
      </button>
    </div>

    <!-- Grid fotografií -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="(image, index) in galleryImages"
        :key="index"
        class="relative group"
      >
        <img
          :src="`/images/mansory/${image}`"
          :alt="`Gallery image ${index + 1}`"
          class="w-full h-48 object-cover rounded-lg"
        />

        <!-- Overlay s akcemi -->
        <div
          class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-4"
        >
          <button
            @click="deleteImage(index)"
            class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Smazat
          </button>
          <button
            @click="editImage(index)"
            class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Upravit
          </button>
        </div>
      </div>
    </div>

    <!-- Modal pro nahrání nových fotografií -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Nahrát nové fotografie</h2>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Vyberte fotografie
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            class="w-full p-2 border rounded"
            @change="handleFileUpload"
          />
        </div>

        <div class="flex justify-end space-x-4">
          <button
            @click="showUploadModal = false"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Zrušit
          </button>
          <button
            @click="uploadImages"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Nahrát
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { galleryImages } = useGallery();
const showUploadModal = ref(false);
const selectedFiles = ref([]);

const handleFileUpload = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

const uploadImages = () => {
  // Zde implementujeme logiku pro nahrání fotografií
  console.log("Nahrávání fotografií:", selectedFiles.value);
  showUploadModal.value = false;
  selectedFiles.value = [];
};

const deleteImage = (index) => {
  // Zde implementujeme logiku pro smazání fotografie
  if (confirm("Opravdu chcete smazat tuto fotografii?")) {
    console.log("Mazání fotografie:", index);
  }
};

const editImage = (index) => {
  // Zde implementujeme logiku pro úpravu fotografie
  console.log("Úprava fotografie:", index);
};
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>