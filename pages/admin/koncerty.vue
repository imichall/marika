<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa koncertů</h1>
      <button
        @click="showAddModal = true"
        class="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
        :disabled="loading"
      >
        Přidat koncert
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p>Načítání...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p>{{ error }}</p>
    </div>

    <!-- Seznam koncertů -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <div
        v-for="concert in concerts"
        :key="concert.id"
        class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
      >
        <div class="relative">
          <img
            v-if="concert.image"
            :src="getFullImageUrl(concert.image)"
            :alt="concert.title"
            class="w-full h-48 object-cover"
          />
          <div
            v-else
            class="w-full h-48 bg-gray-100 flex items-center justify-center"
          >
            <span class="material-icons-outlined text-4xl text-gray-300">
              image
            </span>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-center space-x-2 mb-4">
            <span
              class="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-full"
            >
              {{ concert.group }}
            </span>
            <span
              class="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full"
            >
              {{ concert.price }} Kč
            </span>
          </div>

          <h3 class="font-bold text-xl mb-2 text-gray-900">
            {{ concert.title }}
          </h3>
          <p class="text-gray-600 font-medium mb-3">
            {{
              new Date(concert.date).toLocaleDateString("cs-CZ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }}
          </p>
          <p class="text-gray-500 mb-6 line-clamp-3">{{ concert.desc }}</p>

          <div v-if="concert.qr_session" class="mb-6">
            <ConcertQRCode :qr-session="concert.qr_session" class="mx-auto" />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              @click="editConcert(concert)"
              class="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
            >
              Upravit
            </button>
            <button
              @click="handleDelete(concert.id)"
              class="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
            >
              Smazat
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro přidání/úpravu koncertu -->
    <TransitionRoot appear :show="showAddModal" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <!-- Backdrop -->
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
            <!-- Modal panel -->
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
                  {{ editingConcert ? "Upravit" : "Přidat" }} koncert
                </DialogTitle>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Název koncertu
                      </label>
                      <input
                        v-model="form.title"
                        type="text"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Sekce
                      </label>
                      <select
                        v-model="form.group"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Vyberte sekci</option>
                        <option value="Marika Singers">Marika Singers</option>
                        <option value="Voices">Voices</option>
                        <option value="Five">Five</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Datum
                      </label>
                      <input
                        v-model="form.date"
                        type="date"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Cena vstupného
                      </label>
                      <input
                        v-model="form.price"
                        type="number"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Informace o koncertu
                    </label>
                    <textarea
                      v-model="form.desc"
                      required
                      rows="4"
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    ></textarea>
                  </div>

                  <div>
                    <QRCodeGenerator
                      :concert-title="form.title"
                      :price="Number(form.price)"
                      v-model="form.variable_symbol"
                      v-model:account-number="form.account_number"
                      v-model:bank-code="form.bank_code"
                    />
                  </div>

                  <!-- Nahrávání obrázku -->
                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Obrázek koncertu
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
                      {{ editingConcert ? "Uložit" : "Přidat" }}
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
                  Smazat koncert
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tento koncert?
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
import { ref, onMounted, watch, computed } from "vue";
import { useConcerts } from "~/composables/useConcerts";
import { useCategories } from "~/composables/useCategories";
import { useToast } from "~/composables/useToast";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import ConcertQRCode from "~/components/ConcertQRCode.vue";

const {
  concerts,
  loading,
  error,
  fetchConcerts,
  addConcert,
  updateConcert,
  deleteConcert,
} = useConcerts();

const toast = useToast();

const showAddModal = ref(false);
const editingConcert = ref(null);
const qrGenerator = ref(null);
const showDeleteModal = ref(false);
const concertToDelete = ref(null);

const isDragging = ref(false);
const imagePreview = ref(null);

const form = ref({
  title: "",
  group: "",
  date: "",
  desc: "",
  price: 0,
  image: "",
  variable_symbol: "",
  account_number: "123456789",
  bank_code: "0100",
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
      console.log("Image uploaded successfully:", {
        relativePath: data.path,
        fullUrl: imagePreview.value,
      });
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
    title: "",
    group: "",
    date: "",
    desc: "",
    price: 0,
    image: "",
    variable_symbol: "",
    account_number: "123456789",
    bank_code: "0100",
  };
  imagePreview.value = null;
  editingConcert.value = null;
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const handleSubmit = async () => {
  try {
    const concertData = {
      ...form.value,
    };

    console.log("Submitting concert data:", concertData);

    if (editingConcert.value) {
      await updateConcert(editingConcert.value.id, concertData);
      toast.success("Koncert byl úspěšně upraven");
    } else {
      await addConcert(concertData);
      toast.success("Koncert byl úspěšně přidán");
    }

    closeModal();
  } catch (err) {
    toast.error("Chyba při ukládání koncertu: " + err.message);
  }
};

const editConcert = (concert) => {
  editingConcert.value = concert;
  form.value = {
    title: concert.title,
    group: concert.group,
    date: concert.date,
    desc: concert.desc,
    price: concert.price,
    image: concert.image,
    variable_symbol: concert.variable_symbol || "",
    account_number: concert.account_number || "123456789",
    bank_code: concert.bank_code || "0100",
  };
  showAddModal.value = true;
};

const handleDelete = (id) => {
  concertToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await deleteConcert(concertToDelete.value);
    await fetchConcerts();
    showDeleteModal.value = false;
    concertToDelete.value = null;
    toast.success("Koncert byl úspěšně smazán");
  } catch (err) {
    toast.error("Chyba při mazání koncertu: " + err.message);
  }
};

// Znovu načteme data při mounted
onMounted(() => {
  console.log("Admin koncerty page mounted");
  fetchConcerts();
});

// Sledujeme změny v datech
watch(concerts, (newConcerts) => {
  console.log("Admin concerts updated:", newConcerts);
});

definePageMeta({
  layout: "admin",
});
</script>