<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1
        class="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"
      >
        Správa koncertů
      </h1>
      <button
        @click="showAddModal = true"
        class="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 inline-flex items-center gap-2"
        :disabled="loading"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Přidat koncert
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm mb-6"
    >
      <p class="flex items-center gap-2">
        <span class="material-icons-outlined">error_outline</span>
        {{ error }}
      </p>
    </div>

    <!-- Tabulka koncertů -->
    <div
      v-else
      class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Datum</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Název</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Těleso</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Vstupné</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Akce</div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr
              v-for="concert in concerts"
              :key="concert.id"
              class="hover:bg-gray-50/50 transition-colors duration-150"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{
                    new Date(concert.date).toLocaleDateString("cs-CZ", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ concert.title }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-full"
                >
                  {{ concert.group_name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 text-sm font-medium bg-green-50 text-green-600 rounded-full"
                >
                  {{ concert.price }} Kč
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1"
              >
                <button
                  @click="editConcert(concert)"
                  class="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
                <button
                  @click="handleDelete(concert.id)"
                  class="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="concerts.length === 0">
              <td colspan="5" class="px-6 py-12 text-center">
                <div
                  class="flex flex-col items-center justify-center text-gray-500"
                >
                  <span class="material-icons-outlined text-4xl mb-2"
                    >event_busy</span
                  >
                  <p class="text-lg">Zatím nejsou přidány žádné koncerty</p>
                  <button
                    @click="showAddModal = true"
                    class="mt-4 text-red-600 hover:text-red-700 font-medium transition-colors duration-150"
                  >
                    Přidat první koncert
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal pro přidání/editaci koncertu -->
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
                        Těleso
                      </label>
                      <select
                        v-model="form.group_name"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Vyberte těleso</option>
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
                      v-model="form.description"
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
                          @click.prevent.stop="removeImage"
                          type="button"
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
  group_name: "",
  date: "",
  description: "",
  price: 0,
  image: "",
  variable_symbol: "",
  account_number: "123456789",
  bank_code: "0100",
  qr_session: "",
});

const sortedConcerts = computed(() => {
  if (!concerts.value) return [];
  return [...concerts.value].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

const removeImage = (e) => {
  e?.preventDefault();
  e?.stopPropagation();
  form.value.image = "";
  imagePreview.value = null;
};

const resetForm = () => {
  form.value = {
    title: "",
    group_name: "",
    date: "",
    description: "",
    price: 0,
    image: "",
    variable_symbol: "",
    account_number: "123456789",
    bank_code: "0100",
    qr_session: "",
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
    group_name: concert.group_name || "",
    date: concert.date,
    description: concert.description,
    price: concert.price,
    image: concert.image,
    variable_symbol: concert.variable_symbol || "",
    account_number: concert.account_number || "123456789",
    bank_code: concert.bank_code || "0100",
    qr_session: concert.qr_session || "",
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
  middleware: ["auth"],
});
</script>

<style scoped>
.material-icons-outlined {
  font-size: 20px;
}
</style>