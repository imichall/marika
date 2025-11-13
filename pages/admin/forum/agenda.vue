<template>
  <div class="w-full px-4 py-8 pb-20 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Agenda fóra</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Správa kategorií a tagů pro fórum
          </p>
        </div>
      </div>
    </div>

    <!-- Loading stav -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Načítání...</p>
    </div>

    <!-- Error stav -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg mb-8 border border-red-100 dark:border-red-900">
      {{ error }}
    </div>

    <div v-else class="space-y-8">
      <!-- Kategorie -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <span class="material-icons-outlined text-indigo-600 dark:text-indigo-400">category</span>
                Kategorie
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Hlavní kategorie pro organizaci témat
              </p>
            </div>
            <button
              v-if="canManage"
              @click="openCategoryModal()"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <span class="material-icons-outlined text-[20px]">add</span>
              Přidat kategorii
            </button>
          </div>
        </div>

        <div class="p-6">
          <div v-if="categories.length > 0" class="space-y-4">
            <div
              v-for="category in categories"
              :key="category.id"
              class="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              :style="{ borderLeftWidth: '4px', borderLeftColor: category.color }"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <span
                      class="px-3 py-1 text-sm font-medium rounded-lg"
                      :style="{
                        backgroundColor: `${category.color}15`,
                        color: category.color,
                      }"
                    >
                      {{ category.name }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      slug: {{ category.slug }}
                    </span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300 mb-2">
                    <strong class="text-gray-900 dark:text-gray-100">Popis:</strong> {{ category.description }}
                  </p>
                  <p v-if="category.when_to_use" class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    <strong class="text-gray-800 dark:text-gray-200">Kdy použít:</strong> {{ category.when_to_use }}
                  </p>
                  <p v-if="category.example" class="text-gray-600 dark:text-gray-400 text-sm">
                    <strong class="text-gray-800 dark:text-gray-200">Příklad:</strong> {{ category.example }}
                  </p>
                </div>
                <div v-if="canManage" class="flex gap-2 ml-4">
                  <button
                    @click="openCategoryModal(category)"
                    class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Upravit"
                  >
                    <span class="material-icons-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    @click="deleteCategory(category)"
                    class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Smazat"
                  >
                    <span class="material-icons-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <span class="material-icons-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3 block">category</span>
            <p class="text-gray-500 dark:text-gray-400">Zatím nebyly vytvořeny žádné kategorie</p>
          </div>
        </div>
      </div>

      <!-- Tagy -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <span class="material-icons-outlined text-green-600 dark:text-green-400">local_offer</span>
                Tagy
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Štítky pro detailnější označení témat
              </p>
            </div>
            <button
              v-if="canManage"
              @click="openTagModal()"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-sm"
            >
              <span class="material-icons-outlined text-[20px]">add</span>
              Přidat tag
            </button>
          </div>
        </div>

        <div class="p-6">
          <div v-if="tags.length > 0" class="space-y-4">
            <div
              v-for="tag in tags"
              :key="tag.id"
              class="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              :style="{ borderLeftWidth: '4px', borderLeftColor: tag.color }"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <span
                      class="px-3 py-1 text-sm font-medium rounded-lg"
                      :style="{
                        backgroundColor: `${tag.color}15`,
                        color: tag.color,
                      }"
                    >
                      {{ tag.name }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      slug: {{ tag.slug }}
                    </span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300 mb-2">
                    <strong class="text-gray-900 dark:text-gray-100">Popis:</strong> {{ tag.description }}
                  </p>
                  <p v-if="tag.when_to_use" class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    <strong class="text-gray-800 dark:text-gray-200">Kdy použít:</strong> {{ tag.when_to_use }}
                  </p>
                  <p v-if="tag.example" class="text-gray-600 dark:text-gray-400 text-sm">
                    <strong class="text-gray-800 dark:text-gray-200">Příklad:</strong> {{ tag.example }}
                  </p>
                </div>
                <div v-if="canManage" class="flex gap-2 ml-4">
                  <button
                    @click="openTagModal(tag)"
                    class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Upravit"
                  >
                    <span class="material-icons-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    @click="deleteTag(tag)"
                    class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Smazat"
                  >
                    <span class="material-icons-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <span class="material-icons-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3 block">local_offer</span>
            <p class="text-gray-500 dark:text-gray-400">Zatím nebyly vytvořeny žádné tagy</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro kategorii -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCategoryModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click.self="closeCategoryModal"
        >
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center z-10">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ editingCategory ? 'Upravit kategorii' : 'Nová kategorie' }}
              </h2>
              <button
                @click="closeCategoryModal"
                class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <span class="material-icons-outlined text-[24px]">close</span>
              </button>
            </div>

            <form @submit.prevent="saveCategoryForm" class="p-6 space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Název kategorie *
                </label>
                <input
                  v-model="categoryForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Např. Obecné"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug (URL-friendly název)
                </label>
                <input
                  v-model="categoryForm.slug"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Automaticky se vygeneruje z názvu"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pokud nevyplníte, vygeneruje se automaticky z názvu
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barva
                </label>
                <div class="flex gap-3 items-center">
                  <input
                    v-model="categoryForm.color"
                    type="color"
                    class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    v-model="categoryForm.color"
                    type="text"
                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Popis *
                </label>
                <textarea
                  v-model="categoryForm.description"
                  required
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Stručný popis kategorie"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kdy použít
                </label>
                <textarea
                  v-model="categoryForm.when_to_use"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Případy použití této kategorie"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Příklad
                </label>
                <textarea
                  v-model="categoryForm.example"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Příklady témat v této kategorii"
                ></textarea>
              </div>

              <div class="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  @click="closeCategoryModal"
                  class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  {{ editingCategory ? 'Uložit změny' : 'Vytvořit kategorii' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal pro tag -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showTagModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click.self="closeTagModal"
        >
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center z-10">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ editingTag ? 'Upravit tag' : 'Nový tag' }}
              </h2>
              <button
                @click="closeTagModal"
                class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <span class="material-icons-outlined text-[24px]">close</span>
              </button>
            </div>

            <form @submit.prevent="saveTagForm" class="p-6 space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Název tagu *
                </label>
                <input
                  v-model="tagForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Např. Bug"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug (URL-friendly název)
                </label>
                <input
                  v-model="tagForm.slug"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Automaticky se vygeneruje z názvu"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pokud nevyplníte, vygeneruje se automaticky z názvu
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barva
                </label>
                <div class="flex gap-3 items-center">
                  <input
                    v-model="tagForm.color"
                    type="color"
                    class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    v-model="tagForm.color"
                    type="text"
                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                    placeholder="#10b981"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Popis *
                </label>
                <textarea
                  v-model="tagForm.description"
                  required
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Stručný popis tagu"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kdy použít
                </label>
                <textarea
                  v-model="tagForm.when_to_use"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Případy použití tohoto tagu"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Příklad
                </label>
                <textarea
                  v-model="tagForm.example"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-shadow"
                  placeholder="Příklady použití tohoto tagu"
                ></textarea>
              </div>

              <div class="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  @click="closeTagModal"
                  class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-sm"
                >
                  {{ editingTag ? 'Uložit změny' : 'Vytvořit tag' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { useToast } from "~/composables/useToast";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

const supabase = useSupabaseClient();
const toast = useToast();

const loading = ref(false);
const error = ref<string | null>(null);
const categories = ref<any[]>([]);
const tags = ref<any[]>([]);

const showCategoryModal = ref(false);
const showTagModal = ref(false);
const editingCategory = ref<any>(null);
const editingTag = ref<any>(null);

const canManage = ref(false);

const categoryForm = ref({
  name: "",
  slug: "",
  color: "#6366f1",
  description: "",
  when_to_use: "",
  example: "",
});

const tagForm = ref({
  name: "",
  slug: "",
  color: "#10b981",
  description: "",
  when_to_use: "",
  example: "",
});

// Funkce pro slugifikaci
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", user.data.user.email)
      .single();

    if (userRole?.role === "admin") {
      canManage.value = true;
      return;
    }

    const { data: hasManageCategories } = await supabase.rpc("check_permission", {
      p_email: user.data.user.email,
      p_section: "forum_categories",
      p_action: "manage",
    });

    const { data: hasManageTags } = await supabase.rpc("check_permission", {
      p_email: user.data.user.email,
      p_section: "forum_tags",
      p_action: "manage",
    });

    canManage.value = hasManageCategories || hasManageTags;
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

// Načtení kategorií
const fetchCategories = async () => {
  try {
    const { data, error: err } = await supabase
      .from("forum_categories")
      .select("*")
      .order("name", { ascending: true });

    if (err) throw err;
    categories.value = data || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    toast.error("Nepodařilo se načíst kategorie");
  }
};

// Načtení tagů
const fetchTags = async () => {
  try {
    const { data, error: err } = await supabase
      .from("forum_tags")
      .select("*")
      .order("name", { ascending: true });

    if (err) throw err;
    tags.value = data || [];
  } catch (err) {
    console.error("Error fetching tags:", err);
    toast.error("Nepodařilo se načíst tagy");
  }
};

// Modal pro kategorii
const openCategoryModal = (category: any = null) => {
  editingCategory.value = category;
  if (category) {
    categoryForm.value = {
      name: category.name,
      slug: category.slug,
      color: category.color,
      description: category.description || "",
      when_to_use: category.when_to_use || "",
      example: category.example || "",
    };
  } else {
    categoryForm.value = {
      name: "",
      slug: "",
      color: "#6366f1",
      description: "",
      when_to_use: "",
      example: "",
    };
  }
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  editingCategory.value = null;
};

const saveCategoryForm = async () => {
  try {
    const slug = categoryForm.value.slug || slugify(categoryForm.value.name);

    const categoryData = {
      name: categoryForm.value.name,
      slug,
      color: categoryForm.value.color,
      description: categoryForm.value.description,
      when_to_use: categoryForm.value.when_to_use || null,
      example: categoryForm.value.example || null,
    };

    if (editingCategory.value) {
      const { error: err } = await supabase
        .from("forum_categories")
        .update(categoryData)
        .eq("id", editingCategory.value.id);

      if (err) throw err;
      toast.success("Kategorie byla úspěšně upravena");
    } else {
      const { error: err } = await supabase
        .from("forum_categories")
        .insert([categoryData]);

      if (err) throw err;
      toast.success("Kategorie byla úspěšně vytvořena");
    }

    await fetchCategories();
    closeCategoryModal();
  } catch (err: any) {
    console.error("Error saving category:", err);
    toast.error(err.message || "Nepodařilo se uložit kategorii");
  }
};

const deleteCategory = async (category: any) => {
  if (!confirm(`Opravdu chcete smazat kategorii "${category.name}"?`)) return;

  try {
    const { error: err } = await supabase
      .from("forum_categories")
      .delete()
      .eq("id", category.id);

    if (err) throw err;
    toast.success("Kategorie byla smazána");
    await fetchCategories();
  } catch (err: any) {
    console.error("Error deleting category:", err);
    toast.error(err.message || "Nepodařilo se smazat kategorii");
  }
};

// Modal pro tag
const openTagModal = (tag: any = null) => {
  editingTag.value = tag;
  if (tag) {
    tagForm.value = {
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      description: tag.description || "",
      when_to_use: tag.when_to_use || "",
      example: tag.example || "",
    };
  } else {
    tagForm.value = {
      name: "",
      slug: "",
      color: "#10b981",
      description: "",
      when_to_use: "",
      example: "",
    };
  }
  showTagModal.value = true;
};

const closeTagModal = () => {
  showTagModal.value = false;
  editingTag.value = null;
};

const saveTagForm = async () => {
  try {
    const slug = tagForm.value.slug || slugify(tagForm.value.name);

    const tagData = {
      name: tagForm.value.name,
      slug,
      color: tagForm.value.color,
      description: tagForm.value.description,
      when_to_use: tagForm.value.when_to_use || null,
      example: tagForm.value.example || null,
    };

    if (editingTag.value) {
      const { error: err } = await supabase
        .from("forum_tags")
        .update(tagData)
        .eq("id", editingTag.value.id);

      if (err) throw err;
      toast.success("Tag byl úspěšně upraven");
    } else {
      const { error: err } = await supabase
        .from("forum_tags")
        .insert([tagData]);

      if (err) throw err;
      toast.success("Tag byl úspěšně vytvořen");
    }

    await fetchTags();
    closeTagModal();
  } catch (err: any) {
    console.error("Error saving tag:", err);
    toast.error(err.message || "Nepodařilo se uložit tag");
  }
};

const deleteTag = async (tag: any) => {
  if (!confirm(`Opravdu chcete smazat tag "${tag.name}"?`)) return;

  try {
    const { error: err } = await supabase
      .from("forum_tags")
      .delete()
      .eq("id", tag.id);

    if (err) throw err;
    toast.success("Tag byl smazán");
    await fetchTags();
  } catch (err: any) {
    console.error("Error deleting tag:", err);
    toast.error(err.message || "Nepodařilo se smazat tag");
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadPermissions();
    await Promise.all([fetchCategories(), fetchTags()]);
  } catch (err: any) {
    error.value = err.message || "Nepodařilo se načíst data";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Modal animace */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
