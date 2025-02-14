<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs nad nadpisem -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Administrace</h1>
    </div>

    <!-- Error message -->
    <div
      v-if="route.query.error"
      class="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ route.query.error }}</span>
      <span
        class="absolute top-0 bottom-0 right-0 px-4 py-3"
        @click="clearError"
      >
        <svg
          class="fill-current h-6 w-6 text-red-500"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Zavřít</title>
          <path
            d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
          />
        </svg>
      </span>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
    >
      <!-- Koncerty -->
      <NuxtLink
        v-if="permissions.concerts"
        to="/admin/koncerty"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Koncerty</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa koncertů a vystoupení</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
          >
            {{ concerts.length }} koncertů
          </span>
        </div>
      </NuxtLink>

      <!-- Skupiny -->
      <NuxtLink
        v-if="permissions.choir_groups"
        to="/admin/skupiny"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Skupiny</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa pěveckých skupin</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            3 skupiny
          </span>
        </div>
      </NuxtLink>

      <!-- Galerie -->
      <NuxtLink
        v-if="permissions.gallery"
        to="/admin/galerie"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Galerie</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-emerald-600"
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
        </div>
        <p class="text-gray-600">Správa fotografií</p>
      </NuxtLink>

      <!-- Reference -->
      <NuxtLink
        v-if="permissions.testimonials"
        to="/admin/reference"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Reference</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa referencí a recenzí</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
          >
            {{ testimonials.length }} referencí
          </span>
        </div>
      </NuxtLink>

      <!-- Sociální sítě -->
      <NuxtLink
        v-if="permissions.social_media"
        to="/admin/socialni-site"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Sociální sítě</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa sociálních sítí</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
          >
            {{ socialMedia?.length || 0 }} odkazů
          </span>
        </div>
      </NuxtLink>

      <!-- Objednávky vstupenek -->
      <NuxtLink
        v-if="permissions.orders"
        to="/admin/objednavky"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Objednávky</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa objednávek vstupenek</p>
        <div class="mt-4 flex items-center gap-1.5">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ pendingOrders }} čeká
          </span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ completedOrders }} zaplaceno
          </span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ cancelledOrders }} zrušeno
          </span>
        </div>
      </NuxtLink>

      <!-- Kontakty -->
      <NuxtLink
        v-if="permissions.contacts"
        to="/admin/kontakty"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Kontakty</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-rose-600"
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
        </div>
        <p class="text-gray-600">Správa kontaktních údajů</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm"
          >
            Upravit
          </span>
        </div>
      </NuxtLink>

      <!-- Uživatelé -->
      <NuxtLink
        v-if="permissions.users"
        to="/admin/uzivatele"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Uživatelé</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-violet-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa registrovaných uživatelů</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm"
          >
            Zobrazit
          </span>
        </div>
      </NuxtLink>

      <!-- Nastavení -->
      <NuxtLink
        v-if="permissions.settings"
        to="/admin/system"
        class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Nastavení</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p class="text-gray-600">Správa systémových nastavení</p>
        <div class="mt-4 flex items-center">
          <span
            class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
          >
            Bankovní účty
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Verze aplikace -->
    <div class="mt-12 mb-12 text-center">
      <div class="inline-flex items-center justify-center gap-2 mb-6">
        <span class="material-icons-outlined text-2xl text-gray-400"
          >deployed_code</span
        >
        <h2
          class="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
        >
          Verze aplikace
        </h2>
        <NuxtLink
          to="/admin/changelog"
          class="ml-2 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors duration-200"
        >
          Changelog
        </NuxtLink>
      </div>
      <div class="space-y-4 text-sm text-gray-500">
        <!-- Main branch -->
        <div
          v-if="mainBranch"
          class="flex items-center justify-center gap-2 flex-wrap"
        >
          <span
            class="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium"
            >main</span
          >
          <span class="text-gray-500">
            {{ mainBranch.version }}
            <span v-if="mainBranch.tag" class="text-gray-500 ml-1">
              ({{ mainBranch.tag }})
            </span>
          </span>
          <span class="mx-2">•</span>
          <span class="flex items-center gap-1">
            <span class="material-icons-outlined text-gray-400 text-sm"
              >person</span
            >
            {{ mainBranch.author }}
          </span>
          <span class="mx-2">•</span>
          <span class="flex items-center gap-1">
            <span class="material-icons-outlined text-gray-400 text-sm"
              >schedule</span
            >
            {{ mainBranch.date }}
          </span>
          <span class="mx-2">•</span>
          <span class="italic">{{ mainBranch.lastCommit }}</span>
        </div>

        <!-- Dev branch -->
        <div
          v-if="devBranch"
          class="flex items-center justify-center gap-2 flex-wrap"
        >
          <span
            class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
            >dev</span
          >
          <NuxtLink
            :to="`/admin/changelog#${devBranch.tag || devBranch.version}`"
            class="text-blue-500 hover:text-blue-600 transition-colors duration-200"
          >
            {{ devBranch.version }}
            <span v-if="devBranch.tag" class="text-gray-500 ml-1">
              ({{ devBranch.tag }})
            </span>
          </NuxtLink>
          <span class="mx-2">•</span>
          <span class="flex items-center gap-1">
            <span class="material-icons-outlined text-gray-400 text-sm"
              >person</span
            >
            {{ devBranch.author }}
          </span>
          <span class="mx-2">•</span>
          <span class="flex items-center gap-1">
            <span class="material-icons-outlined text-gray-400 text-sm"
              >schedule</span
            >
            {{ devBranch.date }}
          </span>
          <span class="mx-2">•</span>
          <span class="italic">{{ devBranch.lastCommit }}</span>
        </div>

        <!-- Loading state -->
        <div v-if="versionLoading" class="flex justify-center">
          <div
            class="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"
          ></div>
        </div>

        <!-- Error state -->
        <div v-if="error" class="text-red-500">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

const { concerts } = useConcerts();
const testimonials = useTestimonials()?.testimonials || [];
const galleryImages = useGallery()?.galleryImages || [];
const { socialMedia } = useSocialMedia();
const { orders, getAllOrders } = useTicketOrders();
const {
  version,
  lastCommit,
  loading: versionLoading,
  fetchGitHubInfo,
  commitUrl,
  author,
  date,
  mainBranch,
  devBranch,
  error,
} = useVersion();

// Stav oprávnění
const permissions = ref({
  concerts: false,
  choir_groups: false,
  gallery: false,
  testimonials: false,
  orders: false,
  social_media: false,
  contacts: false,
  settings: false,
  users: false,
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Výpis informací o uživateli
    console.log("Přihlášený uživatel:", user.data.user);

    // Získání role uživatele
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", user.data.user.email)
      .single();

    console.log("Role uživatele:", userRole);

    // Získání všech oprávnění uživatele
    const { data: userPermissions } = await supabase
      .from("user_permissions")
      .select(
        `
        permission_id,
        permissions:permission_id (
          section,
          action,
          description
        )
      `
      )
      .eq(
        "role_id",
        (
          await supabase
            .from("user_roles")
            .select("id")
            .eq("email", user.data.user.email)
            .single()
        ).data.id
      );

    console.log("Oprávnění uživatele:", userPermissions);

    // Kontrola oprávnění pro každou sekci
    const sections = [
      "concerts",
      "choir_groups",
      "gallery",
      "testimonials",
      "orders",
      "social_media",
      "contacts",
      "settings",
      "users",
    ];

    for (const section of sections) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: section,
        p_action: "view",
      });
      permissions.value[section] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

// Načtení dat při mounted
onMounted(async () => {
  await Promise.all([getAllOrders(), fetchGitHubInfo(), loadPermissions()]);
});

// Přidám computed properties pro počty objednávek
const pendingOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "pending")
      .length || 0
);

const completedOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "completed")
      .length || 0
);

const cancelledOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "cancelled")
      .length || 0
);

// Funkce pro vyčištění chybové hlášky
const clearError = () => {
  router.replace({ query: {} });
};
</script>
