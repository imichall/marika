<template>
  <div class="container mx-auto px-4 py-8 pb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Správa referencí</h1>
      <button
        v-if="permissions.create"
        @click="showAddModal = true"
        class="bg-violet-600 dark:bg-violet-700 text-white px-4 py-2 rounded-md hover:bg-violet-700 dark:hover:bg-violet-800"
      >
        <span class="material-icons-outlined mr-2">add</span>
        Přidat referenci
      </button>
    </div>

    <!-- Seznam referencí -->
    <div class="grid gap-6">
      <div
        v-for="testimonial in sortedTestimonials"
        :key="testimonial.id"
        class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ testimonial.author }}</h3>
            <p v-if="testimonial.source" class="text-sm text-gray-600 dark:text-gray-400">
              {{ testimonial.source }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              v-if="permissions.edit"
              @click="editTestimonial(testimonial)"
              class="p-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              <span class="material-icons-outlined">edit</span>
            </button>
            <button
              v-if="permissions.delete"
              @click="deleteTestimonial(testimonial.id)"
              class="p-1 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
        <p class="text-gray-700 dark:text-gray-300">{{ testimonial.text }}</p>
      </div>
    </div>

    <!-- Modal pro přidání/úpravu reference -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ editingTestimonial ? "Upravit" : "Přidat" }} referenci
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Autor
            </label>
            <input
              v-model="form.author"
              type="text"
              required
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Zdroj (volitelné)
            </label>
            <input
              v-model="form.source"
              type="text"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Text reference
            </label>
            <textarea
              v-model="form.text"
              required
              rows="4"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              class="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
            >
              {{ editingTestimonial ? "Uložit" : "Přidat" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "~/composables/useToast";
import { useTestimonials } from "~/composables/useTestimonials";
import { useSupabaseClient } from "#imports";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const toast = useToast();
const supabase = useSupabaseClient();
const {
  testimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial: removeTestimonial,
  fetchTestimonials,
} = useTestimonials();

const sortedTestimonials = computed(() =>
  [...testimonials.value].sort((a, b) => b.id - a.id)
);

const showAddModal = ref(false);
const editingTestimonial = ref(null);

const form = ref({
  author: "",
  source: "",
  text: "",
});

const resetForm = () => {
  form.value = {
    author: "",
    source: "",
    text: "",
  };
  editingTestimonial.value = null;
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const handleSubmit = async () => {
  try {
    if (editingTestimonial.value) {
      // Aktualizace existující reference
      const result = await updateTestimonial(
        editingTestimonial.value.id,
        form.value
      );
      if (result.success) {
        toast.success("Reference byla úspěšně upravena");
        closeModal();
      } else {
        toast.error("Chyba při úpravě reference: " + result.error);
      }
    } else {
      // Přidání nové reference
      const result = await addTestimonial(form.value);
      if (result.success) {
        toast.success("Reference byla úspěšně přidána");
        closeModal();
      } else {
        toast.error("Chyba při přidání reference: " + result.error);
      }
    }
  } catch (err) {
    toast.error("Chyba při ukládání reference: " + err.message);
  }
};

const editTestimonial = (testimonial) => {
  editingTestimonial.value = testimonial;
  form.value = {
    author: testimonial.author,
    source: testimonial.source || "",
    text: testimonial.text,
  };
  showAddModal.value = true;
};

const deleteTestimonial = async (id) => {
  try {
    if (confirm("Opravdu chcete smazat tuto referenci?")) {
      const result = await removeTestimonial(id);
      if (result.success) {
        toast.success("Reference byla úspěšně smazána");
      } else {
        toast.error("Chyba při mazání reference: " + result.error);
      }
    }
  } catch (err) {
    toast.error("Chyba při mazání reference: " + err.message);
  }
};

// Stav oprávnění
const permissions = ref({
  view: false,
  create: false,
  edit: false,
  delete: false,
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Kontrola oprávnění pro každou akci
    const actions = ["view", "create", "edit", "delete"];
    for (const action of actions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "testimonials",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

onMounted(async () => {
  await Promise.all([loadPermissions(), fetchTestimonials()]);
});
</script>