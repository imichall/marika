# Vytvořím novou stránku pro správu zpráv z formuláře
<template>
  <div class="container mx-auto px-4 py-8 pb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <!-- Header sekce -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Zprávy z formuláře</h1>
        <p class="text-gray-600 mt-2">
          Spravujte zprávy od návštěvníků a schvalujte reference
        </p>
      </div>
    </div>

    <!-- Loading stav -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
      ></div>
      <p class="mt-2 text-gray-600">Načítání zpráv...</p>
    </div>

    <!-- Error stav -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
      {{ error }}
    </div>

    <!-- Tabulka zpráv -->
    <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Jméno
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Zpráva
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Stav
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Reference
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vytvořeno
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Akce
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="message in messages"
              :key="message.id"
              class="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              @click="openDetailModal(message)"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ message.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ message.name }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="max-w-xs overflow-hidden text-ellipsis">
                  {{ message.message }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800':
                      message.status === 'pending',
                    'bg-green-100 text-green-800':
                      message.status === 'approved',
                    'bg-red-100 text-red-800': message.status === 'rejected',
                  }"
                >
                  {{ getStatusText(message.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-blue-100 text-blue-800': message.is_testimonial,
                    'bg-gray-100 text-gray-800': !message.is_testimonial,
                  }"
                >
                  {{ message.is_testimonial ? "Ano" : "Ne" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(message.created_at) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"
                @click.stop
              >
                <button
                  v-if="message.status === 'pending' && permissions.approve"
                  @click="handleApprove(message)"
                  class="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                  title="Schválit"
                >
                  <span class="material-icons-outlined text-base"
                    >check_circle</span
                  >
                  <span>Schválit</span>
                </button>
                <button
                  v-if="message.status === 'pending' && permissions.approve"
                  @click="handleReject(message)"
                  class="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                  title="Zamítnout"
                >
                  <span class="material-icons-outlined text-base">cancel</span>
                  <span>Zamítnout</span>
                </button>
                <button
                  v-if="
                    message.status === 'approved' &&
                    !message.is_testimonial &&
                    permissions.approve
                  "
                  @click="handleApproveAsTestimonial(message)"
                  class="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                  title="Schválit jako referenci"
                >
                  <span class="material-icons-outlined text-base">star</span>
                  <span>Jako reference</span>
                </button>
                <button
                  v-if="message.status !== 'pending' && permissions.approve"
                  @click="handleReset(message)"
                  class="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                  title="Vrátit"
                >
                  <span class="material-icons-outlined text-base">restore</span>
                  <span>Vrátit</span>
                </button>
                <button
                  v-if="permissions.edit"
                  @click="openEditModal(message)"
                  class="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                  title="Upravit"
                >
                  <span class="material-icons-outlined text-base">edit</span>
                  <span>Upravit</span>
                </button>
                <button
                  v-if="permissions.delete"
                  @click="handleDelete(message)"
                  class="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                  title="Smazat"
                >
                  <span class="material-icons-outlined text-base">delete</span>
                  <span>Smazat</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginace -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-700">
              Zobrazuji {{ startIndex + 1 }} až
              {{ Math.min(endIndex, totalMessages) }} z
              {{ totalMessages }} zpráv
            </div>
            <div class="flex items-center gap-2">
              <label for="itemsPerPage" class="text-sm text-gray-600"
                >Počet na stránku:</label
              >
              <select
                id="itemsPerPage"
                v-model="itemsPerPage"
                @change="changeItemsPerPage($event.target.value)"
                class="text-sm border-gray-300 rounded-md focus:border-red-500 focus:ring-red-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Předchozí
            </button>
            <div class="flex items-center space-x-1">
              <template v-for="page in displayedPages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-1 border rounded-md',
                    currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'hover:bg-gray-100',
                  ]"
                >
                  {{ page }}
                </button>
                <span v-else class="px-2">...</span>
              </template>
            </div>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Další
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro detail zprávy -->
    <TransitionRoot appear :show="isDetailModalOpen" as="template">
      <Dialog as="div" @close="closeDetailModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
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
                class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all"
              >
                <div class="relative">
                  <DialogTitle as="h3" class="text-2xl font-bold mb-6 pr-8">
                    Detail zprávy
                  </DialogTitle>
                  <button
                    @click="closeDetailModal"
                    class="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>

                  <div class="space-y-6">
                    <div class="flex gap-8">
                      <div class="flex-1">
                        <div class="text-sm text-gray-500 mb-1">Odesílatel</div>
                        <div class="font-medium">
                          {{ selectedMessage?.name }}
                        </div>
                        <div class="text-sm text-gray-600">
                          {{ selectedMessage?.email }}
                        </div>
                      </div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-500 mb-1">
                          Datum odeslání
                        </div>
                        <div class="font-medium">
                          {{ formatDate(selectedMessage?.created_at) }}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div class="text-sm text-gray-500 mb-2">Stav</div>
                      <span
                        class="px-3 py-1 text-sm font-medium rounded-full"
                        :class="{
                          'bg-yellow-100 text-yellow-800':
                            selectedMessage?.status === 'pending',
                          'bg-green-100 text-green-800':
                            selectedMessage?.status === 'approved',
                          'bg-red-100 text-red-800':
                            selectedMessage?.status === 'rejected',
                        }"
                      >
                        {{ getStatusText(selectedMessage?.status) }}
                      </span>
                    </div>

                    <div>
                      <div class="text-sm text-gray-500 mb-2">Zpráva</div>
                      <div
                        class="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap"
                      >
                        {{ selectedMessage?.message }}
                      </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-8">
                      <button
                        v-if="permissions.edit"
                        @click="openEditModal(selectedMessage)"
                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span class="material-icons-outlined text-base"
                          >edit</span
                        >
                        Upravit
                      </button>
                      <button
                        v-if="
                          selectedMessage?.status === 'pending' &&
                          permissions.approve
                        "
                        @click="handleApprove(selectedMessage)"
                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                      >
                        <span class="material-icons-outlined text-base"
                          >check_circle</span
                        >
                        Schválit
                      </button>
                      <button
                        v-if="
                          selectedMessage?.status === 'approved' &&
                          !selectedMessage?.is_testimonial &&
                          permissions.approve
                        "
                        @click="handleApproveAsTestimonial(selectedMessage)"
                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span class="material-icons-outlined text-base"
                          >star</span
                        >
                        Jako reference
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro úpravu zprávy -->
    <TransitionRoot appear :show="isEditModalOpen" as="template">
      <Dialog as="div" @close="closeEditModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all"
              >
                <div class="relative">
                  <DialogTitle as="h3" class="text-2xl font-bold mb-6 pr-8">
                    Upravit zprávu
                  </DialogTitle>
                  <button
                    @click="closeEditModal"
                    class="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>

                  <form @submit.prevent="handleEditSubmit" class="space-y-6">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email
                      </label>
                      <input
                        v-model="editForm.email"
                        type="email"
                        required
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Jméno
                      </label>
                      <input
                        v-model="editForm.name"
                        type="text"
                        required
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Zpráva
                      </label>
                      <textarea
                        v-model="editForm.message"
                        required
                        rows="4"
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                      ></textarea>
                    </div>

                    <div class="flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        @click="closeEditModal"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-colors"
                      >
                        Zrušit
                      </button>
                      <button
                        type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
                      >
                        Uložit změny
                      </button>
                    </div>
                  </form>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro potvrzení smazání -->
    <TransitionRoot appear :show="isDeleteModalOpen" as="template">
      <Dialog as="div" @close="closeDeleteModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-xl font-bold text-gray-900 mb-4"
                >
                  Smazat zprávu?
                </DialogTitle>

                <div class="mt-2">
                  <p class="text-gray-600">
                    Opravdu chcete smazat tuto zprávu? Tuto akci nelze vrátit
                    zpět.
                  </p>

                  <div class="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm">
                      <div class="font-medium text-gray-700">Od:</div>
                      <div class="text-gray-600">
                        {{ messageToDelete?.email }}
                      </div>
                    </div>
                    <div class="text-sm mt-2">
                      <div class="font-medium text-gray-700">Zpráva:</div>
                      <div class="text-gray-600">
                        {{ messageToDelete?.message }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-colors"
                    @click="closeDeleteModal"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
                    @click="confirmDelete"
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
import { ref, onMounted, computed } from "vue";
import { useFormMessages } from "~/composables/useFormMessages";
import { useToast } from "~/composables/useToast";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { useSupabaseClient } from "#imports";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"],
});

const supabase = useSupabaseClient();

// Stav pro paginaci
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalMessages = ref(0);

// Computed properties pro paginaci
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const totalPages = computed(() =>
  Math.ceil(totalMessages.value / itemsPerPage.value)
);

// Zobrazené stránky v paginaci
const displayedPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    let start = Math.max(2, currentPage.value - 1);
    let end = Math.min(totalPages.value - 1, currentPage.value + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages.value - 1) {
      pages.push("...");
    }

    pages.push(totalPages.value);
  }

  return pages;
});

// Funkce pro navigaci
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchAllMessages();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchAllMessages();
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchAllMessages();
};

const changeItemsPerPage = (newValue) => {
  itemsPerPage.value = Number(newValue);
  currentPage.value = 1; // Reset na první stránku
  fetchAllMessages();
};

const {
  messages,
  loading,
  error,
  fetchAllMessages,
  updateMessage,
  updateMessageStatus,
  deleteMessage,
  approveAsTestimonial,
} = useFormMessages({
  page: currentPage,
  itemsPerPage: itemsPerPage.value,
  onTotalChange: (total) => {
    totalMessages.value = total;
  },
});

const toast = useToast();

const permissions = ref({
  view: false,
  approve: false,
  edit: false,
  delete: false,
  manage: false,
});

const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) {
      throw new Error("Uživatel není přihlášen");
    }

    // Kontrola oprávnění pro každou akci
    const actions = ["view", "approve", "edit", "delete", "manage"];
    const permissionPromises = actions.map((action) =>
      supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "form_messages",
        p_action: action,
      })
    );

    const results = await Promise.all(permissionPromises);
    actions.forEach((action, index) => {
      permissions.value[action] = results[index].data;
    });
  } catch (err) {
    console.error("Error loading permissions:", err);
    throw new Error("Nepodařilo se načíst oprávnění");
  }
};

onMounted(async () => {
  await loadPermissions();
  // Nejdřív načteme oprávnění, pak data
  if (permissions.value.view) {
    await fetchAllMessages();
  }
});

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "Čeká na schválení";
    case "approved":
      return "Schváleno";
    case "rejected":
      return "Zamítnuto";
    default:
      return status;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("cs-CZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleApprove = async (message) => {
  try {
    await updateMessageStatus(message.id, "approved");
    await fetchAllMessages();
    toast.success("Zpráva byla schválena");
    closeDetailModal();
  } catch (error) {
    toast.error("Nepodařilo se schválit zprávu");
  }
};

const handleReject = async (message) => {
  try {
    await updateMessageStatus(message.id, "rejected");
    await fetchAllMessages();
    toast.success("Zpráva byla zamítnuta");
    closeDetailModal();
  } catch (error) {
    toast.error("Nepodařilo se zamítnout zprávu");
  }
};

const handleReset = async (message) => {
  try {
    await updateMessageStatus(message.id, "pending");
    await fetchAllMessages();
    toast.success("Zpráva byla vrácena do čekajícího stavu");
    closeDetailModal();
  } catch (error) {
    toast.error("Nepodařilo se vrátit zprávu");
  }
};

const handleApproveAsTestimonial = async (message) => {
  try {
    await approveAsTestimonial(message.id);
    await fetchAllMessages();
    toast.success("Zpráva byla schválena jako reference");
    closeDetailModal();
  } catch (error) {
    toast.error("Nepodařilo se schválit zprávu jako referenci");
  }
};

// Stav pro delete modal
const isDeleteModalOpen = ref(false);
const messageToDelete = ref(null);

const openDeleteModal = (message) => {
  messageToDelete.value = message;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  messageToDelete.value = null;
  isDeleteModalOpen.value = false;
};

const handleDelete = async (message) => {
  openDeleteModal(message);
};

const confirmDelete = async () => {
  try {
    if (!messageToDelete.value) return;

    await deleteMessage(messageToDelete.value.id);
    await fetchAllMessages();
    toast.success("Zpráva byla smazána");
    closeDeleteModal();
    closeDetailModal();
  } catch (error) {
    toast.error("Nepodařilo se smazat zprávu");
  }
};

// Stav pro editační modal
const isEditModalOpen = ref(false);
const editForm = ref({
  id: null,
  email: "",
  name: "",
  message: "",
});

const openEditModal = (message) => {
  editForm.value = {
    id: message.id,
    email: message.email,
    name: message.name,
    message: message.message,
  };
  isEditModalOpen.value = true;
  isDetailModalOpen.value = false;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editForm.value = {
    id: null,
    email: "",
    name: "",
    message: "",
  };
};

const handleEditSubmit = async () => {
  try {
    await updateMessage(editForm.value.id, {
      email: editForm.value.email,
      name: editForm.value.name,
      message: editForm.value.message,
    });
    await fetchAllMessages();
    toast.success("Zpráva byla úspěšně upravena");
    closeEditModal();
  } catch (error) {
    toast.error("Nepodařilo se upravit zprávu");
  }
};

// Přidáme nový stav pro detail modal
const isDetailModalOpen = ref(false);
const selectedMessage = ref(null);

const openDetailModal = (message) => {
  if (isEditModalOpen.value) return;
  selectedMessage.value = message;
  isDetailModalOpen.value = true;
};

const closeDetailModal = () => {
  isDetailModalOpen.value = false;
  selectedMessage.value = null;
};
</script>