<template>
  <div class="space-y-8">
    <!-- Header -->
    <section
      class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <NuxtLink
            to="/clenska-sekce/repertoar"
            class="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
          >
            <Icon name="mdi:arrow-left" class="text-lg" />
            Zpět na seznam repertoáru
          </NuxtLink>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {{ item?.title || "Načítám..." }}
          </h1>
          <p
            v-if="item?.authors"
            class="text-lg text-slate-600 dark:text-slate-300 mb-4"
          >
            {{ item.authors }}
          </p>
        </div>
        <div v-if="item && permissions.edit" class="flex gap-2">
          <button
            @click="openEditModal"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Icon name="mdi:pencil" class="text-lg" />
            Upravit
          </button>
        </div>
      </div>
    </section>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-12">
      <Icon name="mdi:loading" class="animate-spin text-3xl text-slate-400" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="rounded-2xl bg-red-50 border border-red-200 p-6 dark:bg-red-900/20 dark:border-red-900/30"
    >
      <p class="text-red-800 dark:text-red-300">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="item" class="space-y-6">
      <!-- Základní informace -->
      <section
        class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800"
      >
        <h2
          class="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"
        >
          <Icon name="mdi:information" class="text-red-600" />
          Základní informace
        </h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="item.description">
            <dt
              class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1"
            >
              Popis
            </dt>
            <dd
              class="text-sm text-slate-900 dark:text-white whitespace-pre-wrap"
            >
              {{ item.description }}
            </dd>
          </div>
          <div v-if="item.character">
            <dt
              class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1"
            >
              Charakter
            </dt>
            <dd class="text-sm text-slate-900 dark:text-white">
              {{ item.character }}
            </dd>
          </div>
          <div v-if="item.youtube_link">
            <dt
              class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1"
            >
              Ukázka
            </dt>
            <dd>
              <a
                :href="item.youtube_link"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                <Icon name="mdi:youtube" class="text-lg" />
                Zobrazit na YouTube
              </a>
            </dd>
          </div>
          <div v-if="item.created_at">
            <dt
              class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1"
            >
              Přidáno
            </dt>
            <dd class="text-sm text-slate-900 dark:text-white">
              {{ new Date(item.created_at).toLocaleDateString("cs-CZ") }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Notové materiály -->
      <section
        class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800"
      >
        <div class="flex items-center justify-between mb-4">
          <h2
            class="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Icon name="mdi:file-music" class="text-red-600" />
            Notové materiály
            <span
              v-if="item.files?.length"
              class="text-sm font-normal text-slate-500 dark:text-slate-400"
            >
              ({{ item.files.length }})
            </span>
          </h2>
          <button
            v-if="permissions.edit"
            @click="showUploadModal = true"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Icon name="mdi:plus" class="text-lg" />
            Přidat soubory
          </button>
        </div>

        <div
          v-if="!item.files || item.files.length === 0"
          class="text-center py-12 text-slate-500 dark:text-slate-400"
        >
          <Icon
            name="mdi:file-music-outline"
            class="text-4xl mb-2 opacity-50"
          />
          <p>Zatím nejsou k dispozici žádné notové materiály.</p>
        </div>

        <div v-else class="grid grid-cols-3 gap-3">
          <button
            v-for="(file, idx) in item.files"
            :key="file.id"
            type="button"
            class="group relative flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm hover:shadow-md transition transform hover:scale-105 hover:ring-2 hover:ring-violet-300 dark:hover:ring-violet-600 z-0 hover:z-10"
            @click="handleFileClick(file)"
          >
            <Icon
              :name="
                isPdf(file)
                  ? 'mdi:file-pdf-box'
                  : isAudio(file)
                  ? 'mdi:music-note'
                  : 'mdi:file'
              "
              class="text-xl"
              :class="
                isPdf(file)
                  ? 'text-red-600'
                  : isAudio(file)
                  ? 'text-emerald-600'
                  : 'text-slate-500'
              "
            />
            <span
              class="pointer-events-none absolute -top-2 translate-y-[-100%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              {{ file.file_name }}
            </span>
          </button>
          <button
            v-if="item.youtube_link"
            type="button"
            class="group relative flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm hover:shadow-md transition transform hover:scale-105 hover:ring-2 hover:ring-violet-300 dark:hover:ring-violet-600 z-0 hover:z-10"
            @click="openYoutube(item.youtube_link)"
            title="Ukázka z YouTube"
          >
            <Icon name="mdi:youtube" class="text-xl text-red-600" />
            <span
              class="pointer-events-none absolute -top-2 translate-y-[-100%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              YouTube
            </span>
          </button>
          <Transition name="fade">
            <div v-if="activeInlineAudio" class="col-span-full">
              <div
                class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 flex items-center gap-3"
              >
                <audio :src="activeInlineAudio" controls class="flex-1" />
                <button
                  class="inline-flex items-center justify-center px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  @click="activeInlineAudio = null"
                  title="Zavřít přehrávač"
                >
                  <Icon name="mdi:close" class="text-base" />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </section>

      <!-- YouTube ukázka embed (nahrazeno dialogem) -->
      <section
        v-if="item.youtube_link"
        class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 dark:bg-slate-900/80 dark:border-slate-800"
      >
        <div class="flex items-center justify-between">
          <h2
            class="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Icon name="mdi:youtube" class="text-red-600" />
            Ukázka
          </h2>
          <button
            class="inline-flex items-center justify-center px-3 py-2 rounded-md border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-300 dark:border-slate-700 dark:text-slate-300 dark:hover:text-red-300"
            @click="openYoutube(item.youtube_link)"
            title="Přehrát ukázku"
          >
            <Icon name="mdi:play" class="text-base" />
          </button>
        </div>
      </section>
    </div>

    <!-- Modal: úprava skladby -->
    <Modal v-model="showEditModal" title="Upravit skladbu">
      <form v-if="item" class="space-y-4" @submit.prevent="submitEdit">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Název skladby *</label
          >
          <input
            v-model="form.title"
            required
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Autor / autoři</label
          >
          <input
            v-model="form.authors"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Poznámka</label
          >
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </div>
        <div class="space-y-2" v-if="permissions.edit">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Charakter</label
          >
          <input
            v-model="form.character"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="např. Soprán, Alt, Tenor, Bas"
          />
        </div>
        <div class="space-y-2" v-if="permissions.edit">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Ukázka (YouTube link)</label
          >
          <input
            v-model="form.youtube_link"
            type="url"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div class="space-y-2" v-if="item?.files && item.files.length">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200"
            >Přiložené soubory</label
          >
          <div class="grid gap-2">
            <div
              v-for="file in item.files"
              :key="file.id"
              class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div class="flex items-center gap-2 min-w-0">
                <Icon
                  :name="
                    isPdf(file)
                      ? 'mdi:file-pdf-box'
                      : isAudio(file)
                      ? 'mdi:music-note'
                      : 'mdi:file'
                  "
                  :class="
                    isPdf(file)
                      ? 'text-red-600'
                      : isAudio(file)
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  "
                  class="text-base flex-shrink-0"
                />
                <p
                  class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate"
                >
                  {{ file.file_name }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  @click="downloadFile(file)"
                  title="Stáhnout"
                >
                  <Icon name="mdi:download" class="text-lg" />
                </button>
                <button
                  v-if="permissions.edit || permissions.delete"
                  type="button"
                  class="inline-flex items-center justify-center p-2 text-slate-500 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                  @click="confirmRemoveFile(file)"
                  title="Smazat"
                >
                  <Icon name="mdi:delete" class="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            @click="showEditModal = false"
          >
            Zavřít
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            :disabled="loading"
          >
            <Icon name="mdi:content-save-edit" class="text-lg" />
            Uložit změny
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal: nahrávání souborů -->
    <Modal v-model="showUploadModal" title="Přidat soubory">
      <div v-if="item" class="space-y-4">
        <p class="text-sm text-slate-600 dark:text-slate-300">
          Přidáváte materiály ke skladbě <strong>{{ item.title }}</strong
          >.
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.png,.heic,.tiff,.jpeg"
          @change="handleFileInput"
          class="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-red-600 hover:file:bg-red-100"
        />
        <div v-if="pendingUploads.length" class="grid gap-2">
          <div
            v-for="(upload, index) in pendingUploads"
            :key="upload.file.name + index"
            class="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium text-slate-700 truncate">
                {{ upload.file.name }}
              </p>
              <button
                class="text-slate-400 hover:text-red-600"
                type="button"
                @click="removePendingFile(index)"
              >
                <Icon name="mdi:close" />
              </button>
            </div>
            <input
              v-model="upload.voicePart"
              class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
              placeholder="Poznámka k hlasu"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            @click="closeUploadModal"
          >
            Zrušit
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            :disabled="!pendingUploads.length || uploading"
            @click="submitUpload"
          >
            <Icon name="mdi:upload" class="text-lg" />
            Nahrát soubory
          </button>
        </div>
      </div>
    </Modal>

    <!-- PDF viewer dialog -->
    <TransitionRoot v-if="pdfDialog.open" as="template" :show="pdfDialog.open">
      <Dialog as="div" class="relative z-50" @close="pdfDialog.open = false">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/40" />
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
              <DialogPanel
                class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div
                  class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700"
                >
                  <DialogTitle
                    class="text-base font-semibold text-slate-900 dark:text-white truncate"
                    >{{ pdfDialog.name }}</DialogTitle
                  >
                  <button
                    class="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    @click="pdfDialog.open = false"
                  >
                    <Icon name="mdi:close" />
                  </button>
                </div>
                <div class="aspect-[3/2] bg-slate-50 dark:bg-slate-800">
                  <iframe :src="pdfDialog.url" class="w-full h-full" />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- YouTube viewer dialog -->
    <TransitionRoot
      v-if="youtubeDialog.open"
      as="template"
      :show="youtubeDialog.open"
    >
      <Dialog
        as="div"
        class="relative z-50"
        @close="youtubeDialog.open = false"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/40" />
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
              <DialogPanel
                class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-black shadow-xl transition-all"
              >
                <div class="aspect-video">
                  <iframe
                    :src="youtubeDialog.url"
                    class="w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Confirm Delete File Dialog -->
    <ConfirmDialog
      v-model="showDeleteFileDialog"
      title="Odstranit soubor"
      :message="`Opravdu chcete odstranit soubor '${fileToDelete?.file_name}'? Tato akce je nevratná.`"
      confirm-text="Ano, odstranit"
      cancel-text="Zrušit"
      confirm-icon="mdi:trash-can"
      type="danger"
      @confirm="handleDeleteFileConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
// @ts-ignore Nuxt auto-imports
import { useSupabaseClient } from "#imports";
import Modal from "~/components/Modal.vue";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import { useToast } from "~/composables/useToast";
import {
  useRepertoire,
  type RepertoireFile,
  type RepertoireItem,
} from "~/composables/useRepertoire";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

definePageMeta({
  layout: "members",
});

const route = useRoute();
const router = useRouter();
const {
  items,
  loading,
  uploading,
  permissions,
  fetchPermissions,
  fetchItems,
  updateItem,
  uploadFiles,
  removeFile,
  downloadFile,
} = useRepertoire();

const toast = useToast();

const item = ref<RepertoireItem | null>(null);
const error = ref<string | null>(null);
const showEditModal = ref(false);
const showUploadModal = ref(false);
const showDeleteFileDialog = ref(false);
const pendingUploads = ref<Array<{ file: File; voicePart: string }>>([]);
const fileToDelete = ref<RepertoireFile | null>(null);
const form = reactive({
  title: "",
  authors: "",
  description: "",
  character: "",
  youtube_link: "",
});

const supabase = useSupabaseClient();
const expandedAudio = ref<Record<string, boolean>>({});
const fileUrlCache = ref<Record<string, string>>({});
const pdfDialog = reactive({ open: false, url: "", name: "" });
const youtubeDialog = reactive({ open: false, url: "" });
const activeInlineAudio = ref<string | null>(null);

const isPdf = (file: any) =>
  file.content_type?.includes("pdf") ||
  String(file.file_name).toLowerCase().endsWith(".pdf");
const isAudio = (file: any) =>
  file.content_type?.includes("audio") ||
  String(file.file_name).toLowerCase().endsWith(".mp3");

const BUCKET_ID = "repertoire";
const getFileUrl = async (file: any): Promise<string> => {
  if (fileUrlCache.value[file.id]) return fileUrlCache.value[file.id];

  let signedUrl: string | null = null;

  try {
    const { data } = await supabase.storage
      .from(BUCKET_ID)
      .createSignedUrl(file.storage_path, 3600);
    if (data?.signedUrl) {
      signedUrl = data.signedUrl;
    }
  } catch (e) {}

  if (!signedUrl) {
    const { data: pub } = supabase.storage
      .from(BUCKET_ID)
      .getPublicUrl(file.storage_path);
    signedUrl = pub.publicUrl;
  }

  // Cache souboru pomocí Cache API (pro obrázky a PDF)
  const isImageFile = file.content_type?.startsWith('image/');
  const isPdfFile = isPdf(file);

  if (signedUrl && (isImageFile || isPdfFile)) {
    try {
      const { getCachedFileUrl } = await import('~/utils/cache');
      const cachedUrl = await getCachedFileUrl(signedUrl);
      if (cachedUrl) {
        fileUrlCache.value[file.id] = cachedUrl;
        return cachedUrl;
      }
    } catch (err) {
      console.error('Error caching file:', err);
      // Fallback na původní URL
    }
  }

  if (!signedUrl) {
    throw new Error('Failed to get file URL');
  }

  fileUrlCache.value[file.id] = signedUrl;
  return signedUrl;
};

const getOverlapClass = (files: any[], idx: number) => {
  const cur = files[idx];
  const prev = files[idx - 1];
  if (!cur || !prev) return "";
  return isPdf(cur) && isPdf(prev) ? "-ml-2" : "";
};

const handleFileClick = async (file: any) => {
  if (isAudio(file)) {
    const url = await getFileUrl(file);
    activeInlineAudio.value = activeInlineAudio.value === url ? null : url;
  } else if (isPdf(file)) {
    const url = await getFileUrl(file);
    pdfDialog.name = file.file_name;
    pdfDialog.url = url;
    pdfDialog.open = true;
  } else {
    activeInlineAudio.value = null;
  }
};

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    if (u.searchParams.get("v")) id = u.searchParams.get("v") as string;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return url;
  }
};

const openYoutube = (link: string) => {
  youtubeDialog.url = getYouTubeEmbedUrl(link);
  youtubeDialog.open = true;
};

const loadItem = async () => {
  const slugOrId = route.params.id as string;
  if (!slugOrId) {
    error.value = "Identifikátor skladby není zadán";
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    await fetchItems();

    // Nejprve zkusíme najít podle slug, pak podle ID
    let found =
      items.value.find((i) => i.slug === slugOrId) ||
      items.value.find((i) => i.id === slugOrId);

    // Pokud jsme nenašli podle slug ani podle ID, možná je to UUID formát a zkusíme najít podle ID
    if (
      !found &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slugOrId
      )
    ) {
      found = items.value.find((i) => i.id === slugOrId);
    }

    if (!found) {
      error.value = "Skladba nebyla nalezena";
      return;
    }

    item.value = found;
    form.title = found.title;
    form.authors = found.authors ?? "";
    form.description = found.description ?? "";
    form.character = found.character ?? "";
    form.youtube_link = found.youtube_link ?? "";

    // Pokud URL obsahuje ID místo slug a item má slug, přesměrujeme na slug
    // Ale jen pokud slug není prázdný
    if (
      (slugOrId === found.id || slugOrId === found.id.toLowerCase()) &&
      found.slug
    ) {
      await router.replace(`/clenska-sekce/repertoar/${found.slug}`);
    }
    // Pokud item nemá slug, ale máme ID v URL, generujeme slug a aktualizujeme
    else if (!found.slug && found.id) {
      // Slug se vygeneruje při příští editaci, ale můžeme to udělat hned
      const { slugify } = await import("~/utils/string");
      let newSlug = slugify(found.title);

      // Zkontrolujeme, zda slug už neexistuje
      const existingWithSlug = items.value.find(
        (i) => i.slug === newSlug && i.id !== found.id
      );
      if (existingWithSlug) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-8)}`;
      }

      // Aktualizujeme slug v databázi
      try {
        const supabase = useSupabaseClient();
        const { error: updateError } = await supabase
          .from("repertoire_items")
          .update({ slug: newSlug } as any)
          .eq("id", found.id);

        if (!updateError) {
          found.slug = newSlug;
          item.value = found;
          // Přesměrujeme na nový slug
          await router.replace(`/clenska-sekce/repertoar/${newSlug}`);
        }
      } catch (err) {
        console.error("Chyba při generování slug:", err);
        // Pokračujeme bez přesměrování
      }
    }
  } catch (err: any) {
    console.error("Chyba při načítání skladby:", err);
    error.value = err.message ?? "Nepodařilo se načíst skladbu";
  } finally {
    loading.value = false;
  }
};

const openEditModal = () => {
  if (!item.value) return;
  if (!permissions.value.edit) {
    toast.error("Nemáte oprávnění upravovat repertoár");
    return;
  }
  showEditModal.value = true;
};

const submitEdit = async () => {
  if (!item.value) return;
  try {
    await updateItem(item.value.id, {
      title: form.title,
      authors: form.authors,
      description: form.description,
      character: form.character || undefined,
      youtube_link: form.youtube_link || undefined,
    });

    toast.success("Skladba byla upravena");
    showEditModal.value = false;
    await loadItem(); // Reload item - slug se může změnit

    // Pokud se změnil slug, aktualizujeme URL
    if (item.value?.slug) {
      const currentSlug = route.params.id as string;
      if (currentSlug !== item.value.slug) {
        await router.replace(`/clenska-sekce/repertoar/${item.value.slug}`);
      }
    }
  } catch (err: any) {
    toast.error(err.message ?? "Nepodařilo se upravit skladbu");
  }
};

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const files = Array.from(input.files);
  files.forEach((file) => {
    pendingUploads.value.push({ file, voicePart: "" });
  });

  input.value = "";
};

const removePendingFile = (index: number) => {
  pendingUploads.value.splice(index, 1);
};

const closeUploadModal = () => {
  showUploadModal.value = false;
  pendingUploads.value = [];
};

const submitUpload = async () => {
  if (!item.value || !pendingUploads.value.length) return;
  try {
    await uploadFiles(item.value.id, pendingUploads.value);
    toast.success("Soubory byly nahrány");
    closeUploadModal();
    await loadItem(); // Reload item
  } catch (err: any) {
    toast.error(err.message ?? "Nahrání souborů se nezdařilo");
  }
};

const confirmRemoveFile = (file: RepertoireFile) => {
  if (!permissions.value.edit && !permissions.value.delete) {
    toast.error("Nemáte oprávnění mazat soubory");
    return;
  }
  fileToDelete.value = file;
  showDeleteFileDialog.value = true;
};

const handleDeleteFileConfirm = async () => {
  if (!fileToDelete.value) return;

  try {
    await removeFile(fileToDelete.value);
    toast.success("Soubor byl odstraněn");
    await loadItem(); // Reload item
  } catch (err: any) {
    toast.error(err.message ?? "Nepodařilo se odstranit soubor");
  } finally {
    fileToDelete.value = null;
  }
};

onMounted(async () => {
  try {
    const perms = await fetchPermissions();
    if (!perms.view) {
      toast.error("Nemáte oprávnění prohlížet repertoár");
      router.push("/clenska-sekce/repertoar");
      return;
    }
    await loadItem();
  } catch (err: any) {
    console.error("Chyba při načítání stránky:", err);
    error.value = err.message ?? "Nepodařilo se načíst stránku";
  }
});

// Sledování změn route parametrů
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && typeof newId === "string") {
      await loadItem();
    }
  }
);
</script>
