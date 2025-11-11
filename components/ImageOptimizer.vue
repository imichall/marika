<template>
  <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Optimalizace obrázků</h2>
      <div class="flex items-center gap-3">
        <span v-if="processing" class="text-sm text-gray-600 dark:text-gray-400">
          Zpracováno: {{ processedCount }}/{{ totalImages }}
        </span>
        <button
          @click="startOptimization"
          :disabled="processing"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white rounded-lg transition-colors duration-200"
        >
          <span class="material-icons-outlined text-xl" v-if="processing"
            >sync</span
          >
          <span class="material-icons-outlined text-xl" v-else>image</span>
          {{ processing ? "Probíhá optimalizace..." : "Optimalizovat obrázky" }}
        </button>
      </div>
    </div>

    <!-- Progress -->
    <div v-if="processing" class="space-y-4">
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(processedCount / totalImages) * 100}%` }"
        ></div>
      </div>
      <div v-if="currentFile" class="text-sm text-gray-600 dark:text-gray-400">
        Zpracovávám: {{ currentBucket }}/{{ currentFile }}
      </div>
    </div>

    <!-- Results -->
    <div v-if="results.length > 0" class="mt-4">
      <h3 class="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
        Výsledky optimalizace:
      </h3>
      <div class="space-y-2">
        <div
          v-for="(result, index) in results"
          :key="index"
          class="text-sm transition-colors duration-200"
          :class="{
            'text-green-600 dark:text-green-400': result.success,
            'text-red-600 dark:text-red-400': !result.success,
          }"
        >
          {{ result.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "#imports";
import { useSupabaseClient } from "#imports";
import imageCompression from "browser-image-compression";

interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

const supabase = useSupabaseClient();
const processing = ref(false);
const processedCount = ref(0);
const totalImages = ref(0);
const currentFile = ref("");
const currentBucket = ref("");
const results = ref<Array<{ success: boolean; message: string }>>([]);

const buckets = ["gallery", "concerts", "posters"];

const startOptimization = async () => {
  processing.value = true;
  processedCount.value = 0;
  results.value = [];
  totalImages.value = 0;

  try {
    // Projdeme všechny buckety
    for (const bucket of buckets) {
      currentBucket.value = bucket;

      // Načteme seznam všech obrázků z bucketu
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list("", { sortBy: { column: "name", order: "asc" } });

      if (error) throw error;
      if (!files) continue;

      // Filtrujeme pouze obrázky a vyloučíme již existující .webp soubory
      const imageFiles = files.filter(
        (file: FileObject) =>
          /\.(jpg|jpeg|png|gif)$/i.test(file.name) &&
          !file.name.endsWith(".webp")
      );

      totalImages.value += imageFiles.length;

      for (const file of imageFiles) {
        currentFile.value = file.name;
        try {
          // Stáhneme originální soubor
          const { data: fileData, error: downloadError } =
            await supabase.storage.from(bucket).download(file.name);

          if (downloadError) throw downloadError;
          if (!fileData) throw new Error("No file data received");

          // Komprimujeme obrázek
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp",
          };

          const compressedFile = await imageCompression(fileData, options);

          // Vytvoříme nový název souboru pro WebP verzi
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

          // Nahrajeme optimalizovaný WebP soubor vedle originálu
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(newFileName, compressedFile, {
              contentType: "image/webp",
              upsert: true,
            });

          if (uploadError) throw uploadError;

          const originalSize = Math.round(fileData.size / 1024);
          const newSize = Math.round(compressedFile.size / 1024);
          const savings = Math.round(
            ((originalSize - newSize) / originalSize) * 100
          );

          results.value.push({
            success: true,
            message: `✓ ${bucket}/${file.name} + ${newFileName} (Úspora: ${savings}%, ${originalSize}KB → ${newSize}KB)`,
          });
        } catch (err) {
          results.value.push({
            success: false,
            message: `✕ ${bucket}/${file.name}: ${
              err instanceof Error ? err.message : "Neznámá chyba"
            }`,
          });
        }

        processedCount.value++;
      }
    }
  } catch (err) {
    console.error("Error during optimization:", err);
    results.value.push({
      success: false,
      message: `Chyba při optimalizaci: ${
        err instanceof Error ? err.message : "Neznámá chyba"
      }`,
    });
  } finally {
    processing.value = false;
    currentFile.value = "";
    currentBucket.value = "";
  }
};
</script>

<script lang="ts">
export default {
  name: "ImageOptimizer",
};
</script>