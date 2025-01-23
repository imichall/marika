<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs nad nadpisem -->
    <AdminBreadcrumbs />

    <!-- Header sekce -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Správa kontaktů</h1>
        <p class="text-gray-600 mt-2">
          Spravujte kontaktní údaje jednotlivých skupin
        </p>
      </div>
      <button
        @click="showAddModal = true"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
        :disabled="loading"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Přidat kontakt
      </button>
    </div>

    <!-- Loading a Error stavy -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 text-red-600 p-4 rounded-xl text-center"
    >
      <p>{{ error }}</p>
    </div>

    <!-- Seznam kontaktů -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="contact in contacts"
        :key="contact.id"
        class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
      >
        <div class="p-6">
          <!-- Header karty -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-xl text-gray-900">
                {{ contact.group_name }}
              </h3>
              <div
                class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-pink-100 text-pink-800':
                    contact.group_name === 'Marika Singers, z.s.',
                  'bg-purple-100 text-purple-800':
                    contact.group_name === 'VOICES',
                  'bg-blue-100 text-blue-800': contact.group_name === 'FIVE',
                }"
              >
                {{ contact.group_name }}
              </div>
            </div>

            <!-- Akční tlačítka -->
            <div class="flex space-x-2">
              <button
                @click="editContact(contact)"
                class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Upravit"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                @click="handleDelete(contact.id)"
                class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Smazat"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Obsah karty -->
          <div class="space-y-4">
            <div v-if="contact.address" class="flex items-start space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p class="text-gray-600 whitespace-pre-line">
                {{ contact.address }}
              </p>
            </div>

            <div
              v-if="contact.ico || contact.dic"
              class="flex items-center space-x-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div class="text-gray-600">
                <span v-if="contact.ico">IČO: {{ contact.ico }}</span>
                <span v-if="contact.ico && contact.dic"> / </span>
                <span v-if="contact.dic">DIČ: {{ contact.dic }}</span>
              </div>
            </div>

            <div v-if="contact.email" class="flex items-center space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                :href="`mailto:${contact.email}`"
                class="text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                {{ contact.email }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro přidání/úpravu kontaktu -->
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
              <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-md">
                <DialogTitle as="h2" class="text-xl font-bold mb-4">
                  {{ editingContact ? "Upravit" : "Přidat" }} kontakt
                </DialogTitle>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Název skupiny
                    </label>
                    <input
                      v-model="form.group_name"
                      type="text"
                      required
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Adresa
                    </label>
                    <textarea
                      v-model="form.address"
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      IČO
                    </label>
                    <input
                      v-model="form.ico"
                      type="text"
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      DIČ
                    </label>
                    <input
                      v-model="form.dic"
                      type="text"
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Email
                    </label>
                    <input
                      v-model="form.email"
                      type="email"
                      required
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div class="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      @click="closeModal"
                      class="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      :disabled="loading"
                    >
                      {{ editingContact ? "Uložit změny" : "Přidat kontakt" }}
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
                  Smazat kontakt
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tento kontakt?
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
import { ref, onMounted, reactive } from "vue";
import { useContacts } from "~/composables/useContacts";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const {
  contacts,
  loading,
  error,
  fetchContacts,
  updateContact,
  addContact,
  deleteContact,
} = useContacts();

const showAddModal = ref(false);
const showDeleteModal = ref(false);
const editingContact = ref(null);
const contactToDelete = ref(null);

const form = reactive({
  group_name: "",
  address: "",
  ico: "",
  dic: "",
  email: "",
});

onMounted(() => {
  fetchContacts();
});

const resetForm = () => {
  form.group_name = "";
  form.address = "";
  form.ico = "";
  form.dic = "";
  form.email = "";
  editingContact.value = null;
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const handleSubmit = async () => {
  try {
    // Připravíme data pro odeslání - prázdné řetězce převedeme na null
    const formData = {
      group_name: form.group_name.trim(),
      address: form.address.trim() || null,
      ico: form.ico.trim() || null,
      dic: form.dic.trim() || null,
      email: form.email.trim() || null,
    };

    // Validace emailu
    if (formData.email && !formData.email.includes("@")) {
      alert("Prosím zadejte platnou emailovou adresu");
      return;
    }

    if (editingContact.value) {
      // Při editaci posíláme jen změněná pole
      const changedFields = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== editingContact.value[key]) {
          changedFields[key] = formData[key];
        }
      });

      if (Object.keys(changedFields).length > 0) {
        await updateContact(editingContact.value.id, changedFields);
      }
    } else {
      await addContact(formData);
    }
    closeModal();
  } catch (err) {
    console.error("Error saving contact:", err);
    alert(`Chyba při ukládání: ${err.message}`);
  }
};

const editContact = (contact) => {
  editingContact.value = contact;
  form.group_name = contact.group_name;
  form.address = contact.address || "";
  form.ico = contact.ico || "";
  form.dic = contact.dic || "";
  form.email = contact.email || "";
  showAddModal.value = true;
};

const handleDelete = (id) => {
  contactToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (confirm("Opravdu chcete smazat tento kontakt?")) {
    try {
      await deleteContact(contactToDelete.value);
      showDeleteModal.value = false;
      contactToDelete.value = null;
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert(`Chyba při mazání: ${err.message}`);
    }
  }
};

definePageMeta({
  layout: "admin",
});
</script>