<template>
  <div class="flex bg-gray-50 min-h-screen">
    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-2 left-1/2 -translate-x-1/2 z-50">
      <button
        @click="isSidebarOpen = !isSidebarOpen"
        class="flex items-center justify-center p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <span class="material-icons-outlined">{{
          isSidebarOpen ? "close" : "menu"
        }}</span>
      </button>
    </div>

    <!-- Backdrop for mobile sidebar -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white border-r border-gray-200 transition-all duration-300 z-40',
        'lg:relative lg:w-64 lg:translate-x-0',
        isSidebarOpen
          ? 'fixed inset-y-0 left-0 w-64 translate-x-0'
          : 'fixed inset-y-0 left-0 w-64 -translate-x-full',
      ]"
    >
      <div class="p-6">
        <h2
          class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Marika Admin
        </h2>
      </div>

      <nav class="mt-2 px-4">
        <div
          v-for="(section, index) in sidebarSections"
          :key="index"
          class="mb-4"
        >
          <div
            class="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
          >
            {{ section.title }}
          </div>

          <div class="space-y-1">
            <NuxtLink
              v-for="item in section.items"
              :key="item.name"
              :to="item.to"
              :class="[
                route.path === item.to
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50',
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              ]"
              @click="isSidebarOpen = false"
            >
              <span
                class="material-icons-outlined mr-3 text-xl"
                :class="{ 'text-indigo-600': route.path === item.to }"
              >
                {{ item.icon }}
              </span>
              {{ item.name }}
              <span
                v-if="item.badge"
                :class="[
                  item.badgeColor || 'bg-indigo-100 text-indigo-600',
                  'ml-auto px-2 py-0.5 text-xs rounded-full',
                ]"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main content -->
    <main :class="['flex-1', 'lg:ml-0', isSidebarOpen ? 'ml-64' : 'ml-0']">
      <!-- Top bar -->
      <div
        class="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30"
      >
        <div class="flex items-center space-x-4">
          <h1 class="text-xl lg:text-2xl font-semibold text-gray-800">
            Dashboard
          </h1>
          <span
            class="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full hidden sm:inline-block"
          >
            Live
          </span>
        </div>
      </div>

      <div class="p-4 lg:p-8">
        <!-- Stats overview -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
        >
          <div
            v-for="stat in stats"
            :key="stat.name"
            class="bg-white rounded-xl p-4 lg:p-6 border border-gray-100 hover:border-indigo-200 transition-all duration-300"
          >
            <div class="flex items-center justify-between">
              <span :class="[stat.iconBg, 'p-2 lg:p-3 rounded-lg']">
                <span class="material-icons-outlined" :class="stat.iconColor">{{
                  stat.icon
                }}</span>
              </span>
              <span :class="[stat.trendColor, 'text-sm font-medium']">{{
                stat.trend
              }}</span>
            </div>
            <h3 class="text-xl lg:text-2xl font-bold mt-4">{{ stat.value }}</h3>
            <p class="text-gray-500 text-sm mt-1">{{ stat.name }}</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-8">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-icons-outlined text-gray-400">bolt</span>
            <h2 class="text-lg font-semibold">Rychlé akce</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.name"
              :to="action.to"
              class="flex items-center p-4 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200"
            >
              <span
                :class="[
                  action.iconBg,
                  action.iconColor,
                  'p-2 rounded-lg mr-3',
                ]"
              >
                <span class="material-icons-outlined">{{ action.icon }}</span>
              </span>
              <div class="text-left">
                <h3 class="font-medium text-gray-900">{{ action.name }}</h3>
                <p class="text-sm text-gray-500">{{ action.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Main content grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <!-- Recent Activity -->
          <div
            class="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4 lg:p-6"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-gray-400"
                  >history</span
                >
                <h2 class="text-lg font-semibold">Nedávná aktivita</h2>
              </div>
              <button
                @click="openAllActivities"
                class="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Zobrazit vše
              </button>
            </div>
            <div class="space-y-4">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                @click="openActivityDetail(activity)"
                class="flex items-start p-3 lg:p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                <span :class="[activity.iconBg, 'p-2 rounded-lg mr-3 lg:mr-4']">
                  <span
                    class="material-icons-outlined"
                    :class="activity.iconColor"
                  >
                    {{ activity.icon }}
                  </span>
                </span>
                <div>
                  <p class="font-medium text-gray-900">{{ activity.title }}</p>
                  <p class="text-sm text-gray-500">
                    {{ activity.description }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
              </div>
              <div
                v-if="recentActivity.length === 0"
                class="text-center text-gray-500 py-8"
              >
                Žádná nedávná aktivita
              </div>
            </div>

            <!-- Previous Versions -->
            <div class="mt-6 border-t border-gray-100 pt-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="material-icons-outlined text-gray-400"
                    >new_releases</span
                  >
                  <h2 class="text-lg font-semibold">Verze aplikace Marika</h2>
                </div>
                <NuxtLink
                  to="/admin/changelog"
                  class="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Zobrazit changelog
                </NuxtLink>
              </div>

              <div class="space-y-4">
                <!-- Main branch -->
                <div
                  v-if="mainBranch"
                  class="flex flex-col p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                      >
                        stable
                      </span>
                      <NuxtLink
                        :to="`/admin/changelog#${
                          mainBranch.tag || mainBranch.version
                        }`"
                        class="text-sm text-blue-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        {{ mainBranch.version }}
                        <span v-if="mainBranch.tag" class="text-gray-500 ml-1">
                          ({{ mainBranch.tag }})
                        </span>
                      </NuxtLink>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span class="flex items-center gap-1">
                        <span class="material-icons-outlined text-sm"
                          >person</span
                        >
                        {{ mainBranch.author }}
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="material-icons-outlined text-sm"
                          >schedule</span
                        >
                        {{ mainBranch.date }}
                      </span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ mainBranch.lastCommit?.substring(0, 100)
                    }}{{ mainBranch.lastCommit?.length > 100 ? "..." : "" }}
                  </p>
                </div>

                <!-- Dev branch -->
                <div
                  v-if="devBranch"
                  class="flex flex-col p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                      >
                        dev
                      </span>
                      <NuxtLink
                        :to="`/admin/changelog#${
                          devBranch.tag || devBranch.version
                        }`"
                        class="text-sm text-blue-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        {{ devBranch.version }}
                        <span v-if="devBranch.tag" class="text-gray-500 ml-1">
                          ({{ devBranch.tag }})
                        </span>
                      </NuxtLink>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span class="flex items-center gap-1">
                        <span class="material-icons-outlined text-sm"
                          >person</span
                        >
                        {{ devBranch.author }}
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="material-icons-outlined text-sm"
                          >schedule</span
                        >
                        {{ devBranch.date }}
                      </span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ devBranch.lastCommit?.substring(0, 100)
                    }}{{ devBranch.lastCommit?.length > 100 ? "..." : "" }}
                  </p>
                </div>

                <!-- Loading state -->
                <div v-if="versionLoading" class="flex justify-center py-4">
                  <div
                    class="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"
                  ></div>
                </div>

                <!-- Error state -->
                <div v-if="error" class="text-sm text-red-500 p-4">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- Nadcházející události -->
          <div
            class="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 flex flex-col h-full"
          >
            <div class="flex items-center gap-2 mb-6">
              <span class="material-icons-outlined text-gray-400"
                >event_upcoming</span
              >
              <h2 class="text-lg font-semibold">Nadcházející události</h2>
            </div>
            <div class="space-y-4 overflow-y-auto flex-1 pr-2">
              <div
                v-for="concert in upcomingConcerts"
                :key="concert.id"
                class="flex items-start p-3 lg:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                @click="openConcertDetail(concert)"
              >
                <div
                  class="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 rounded-lg flex items-center justify-center mr-3 lg:mr-4"
                >
                  <span class="text-base lg:text-lg font-bold text-indigo-600">
                    {{ new Date(concert.date).getDate() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-900 truncate">
                    {{ concert.title }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{
                      new Date(concert.date).toLocaleDateString("cs-CZ", {
                        month: "long",
                        year: "numeric",
                      })
                    }}
                  </p>
                  <div class="flex items-center mt-1">
                    <span
                      class="material-icons-outlined text-sm text-gray-400 mr-1"
                      >location_on</span
                    >
                    <p class="text-xs text-gray-500 truncate">
                      {{ concert.location }}
                    </p>
                  </div>
                </div>
                <div class="ml-2 lg:ml-4 flex-shrink-0">
                  <span
                    :class="[
                      concert.is_sold_out
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800',
                      'px-2 py-1 text-xs font-medium rounded-full',
                    ]"
                  >
                    {{ concert.is_sold_out ? "Vyprodáno" : "Volné vstupenky" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal pro všechny aktivity -->
  <div
    v-if="showAllActivities"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
    >
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Všechny aktivity</h2>
          <button
            @click="closeAllActivities"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        <div class="space-y-4">
          <div
            v-for="activity in allActivities"
            :key="activity.id"
            @click="openActivityDetail(activity)"
            class="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            <span :class="[activity.iconBg, 'p-2 rounded-lg mr-4']">
              <span class="material-icons-outlined" :class="activity.iconColor">
                {{ activity.icon }}
              </span>
            </span>
            <div>
              <p class="font-medium text-gray-900">{{ activity.title }}</p>
              <p class="text-sm text-gray-500">{{ activity.description }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
            </div>
          </div>
          <div
            v-if="allActivities.length === 0"
            class="text-center text-gray-500 py-8"
          >
            Žádné aktivity k zobrazení
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal pro detail koncertu -->
  <div
    v-if="selectedConcert"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeConcertDetail"
  >
    <div
      class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <div class="relative">
        <!-- Poster/obrázek koncertu jako header -->
        <div class="relative h-64 bg-gray-200">
          <img
            v-if="selectedConcert.image"
            :src="selectedConcert.image"
            :alt="selectedConcert.title"
            class="w-full h-full object-contain"
          />
          <img
            v-else-if="selectedConcert.poster?.image_url"
            :src="selectedConcert.poster.image_url"
            :alt="selectedConcert.title"
            class="w-full h-full object-contain"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-indigo-50"
          >
            <span class="material-icons-outlined text-6xl text-indigo-200"
              >music_note</span
            >
          </div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          ></div>
          <button
            @click="closeConcertDetail"
            class="absolute top-4 right-4 bg-black/40 hover:bg-black/60 w-10 h-10 rounded-full text-white hover:text-white transition-all duration-200 backdrop-blur-sm flex items-center justify-center group"
          >
            <span
              class="material-icons-outlined text-2xl transform group-hover:scale-110 transition-transform duration-200"
              >close</span
            >
          </button>
        </div>

        <!-- Obsah modalu -->
        <div class="p-8 -mt-8 relative">
          <div class="bg-white rounded-t-xl shadow-lg p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ selectedConcert.title }}
                </h2>
                <p class="text-gray-500 mt-1">{{ selectedConcert.subtitle }}</p>
              </div>
              <div class="flex-shrink-0 ml-6">
                <div class="text-center">
                  <div class="text-3xl font-bold text-indigo-600">
                    {{ new Date(selectedConcert.date).getDate() }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{
                      new Date(selectedConcert.date).toLocaleDateString(
                        "cs-CZ",
                        { month: "long" }
                      )
                    }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ new Date(selectedConcert.date).getFullYear() }}
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 space-y-4">
              <!-- Čas a místo -->
              <div class="flex items-center text-gray-600">
                <span class="material-icons-outlined mr-2">schedule</span>
                <span>{{ selectedConcert.time }}</span>
                <span class="mx-3">•</span>
                <span class="material-icons-outlined mr-2">location_on</span>
                <span>{{ selectedConcert.description }}</span>
              </div>

              <!-- Skupina -->
              <div class="flex items-center text-gray-600">
                <span class="material-icons-outlined mr-2">group</span>
                <span>{{ selectedConcert.group_name }}</span>
              </div>

              <!-- Detailní popis -->
              <div
                class="text-gray-600 mt-4 prose prose-sm max-w-none"
                v-html="
                  formatDetailedDescription(
                    selectedConcert.detailed_description
                  )
                "
              ></div>

              <!-- Vstupné -->
              <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Vstupné</h3>
                <div
                  v-if="selectedConcert.price > 0"
                  class="flex items-baseline"
                >
                  <span class="text-2xl font-bold text-indigo-600"
                    >{{ selectedConcert.price }} Kč</span
                  >
                  <span class="text-gray-500 ml-2">/ osoba</span>
                </div>
                <div
                  v-else-if="selectedConcert.is_voluntary"
                  class="text-gray-600"
                >
                  Dobrovolné vstupné
                </div>
                <div
                  v-else-if="selectedConcert.has_presale"
                  class="text-gray-600"
                >
                  Předprodej vstupenek
                  <p v-if="selectedConcert.presale_text" class="mt-2 text-sm">
                    {{ selectedConcert.presale_text }}
                  </p>
                </div>
              </div>

              <!-- Status vstupenek -->
              <div class="mt-6 flex items-center justify-between">
                <div class="flex items-center">
                  <span
                    :class="[
                      selectedConcert.is_sold_out
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800',
                      'px-3 py-1 rounded-full text-sm font-medium',
                    ]"
                  >
                    {{
                      selectedConcert.is_sold_out
                        ? "Vyprodáno"
                        : "Volné vstupenky"
                    }}
                  </span>
                  <span
                    v-if="selectedConcert.remaining_tickets"
                    class="ml-2 text-sm text-gray-500"
                  >
                    (Zbývá {{ selectedConcert.remaining_tickets }} vstupenek)
                  </span>
                </div>

                <button
                  @click="editConcert(selectedConcert)"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upravit koncert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useSupabaseClient } from "#imports";
import { useFormMessages } from "~/composables/useFormMessages";

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

const { concerts } = useConcerts();
const { testimonials } = useTestimonials();
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

// Přidám ref pro zprávy
const { messages, fetchAllMessages } = useFormMessages();

// Stav oprávnění
const permissions = ref({
  concerts: {
    view: false,
    edit: false,
  },
  choir_groups: {
    view: false,
    edit: false,
  },
  gallery: {
    view: false,
    edit: false,
  },
  testimonials: {
    view: false,
    edit: false,
  },
  orders: {
    view: false,
    edit: false,
  },
  social_media: {
    view: false,
    edit: false,
  },
  contacts: {
    view: false,
    edit: false,
  },
  settings: {
    view: false,
    edit: false,
    manage: false,
  },
  users: {
    view: false,
    edit: false,
  },
  form_messages: {
    view: false,
  },
  audit: {
    view: false,
    manage: false,
  },
  chat: {
    view: false,
    manage: false,
  },
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Získání role uživatele
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("id, role")
      .eq("email", user.data.user.email)
      .single();

    // Pro adminy nastavíme všechna oprávnění na true
    if (userRole.role === "admin") {
      Object.keys(permissions.value).forEach((section) => {
        Object.keys(permissions.value[section]).forEach((action) => {
          permissions.value[section][action] = true;
        });
      });
      return;
    }

    // Pro ostatní role načteme oprávnění z databáze
    const { data: userPermissions } = await supabase
      .from("user_permissions")
      .select(
        `
        permission_id,
        permissions:permission_id (
          section,
          action
        )
      `
      )
      .eq("role_id", userRole.id);

    // Resetujeme všechna oprávnění na false
    Object.keys(permissions.value).forEach((section) => {
      Object.keys(permissions.value[section]).forEach((action) => {
        permissions.value[section][action] = false;
      });
    });

    // Nastavíme oprávnění podle dat z databáze
    userPermissions?.forEach((permission) => {
      const section = permission.permissions.section;
      const action = permission.permissions.action;
      if (permissions.value[section]) {
        permissions.value[section][action] = true;
      }
    });
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

// Načtení dat při mounted
onMounted(async () => {
  await Promise.all([
    getAllOrders(),
    fetchGitHubInfo(),
    loadPermissions(),
    fetchAllMessages(),
  ]);
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

// Přidám computed properties pro počty zpráv
const pendingMessages = computed(
  () =>
    messages.value?.filter((message) => message.status === "pending").length ||
    0
);

const approvedMessages = computed(
  () =>
    messages.value?.filter((message) => message.status === "approved").length ||
    0
);

// Funkce pro vyčištění chybové hlášky
const clearError = () => {
  router.replace({ query: {} });
};

// V script části přidáme:
const archivedChats = ref(0);
const chatUsers = ref(0);

// Sidebar sections with permissions check
const sidebarSections = computed(() =>
  [
    {
      title: "Hlavní",
      items: [
        { name: "Dashboard", to: "/admin", icon: "dashboard" },
        permissions.value.concerts.view && {
          name: "Koncerty",
          to: "/admin/koncerty",
          icon: "music_note",
          badge:
            concerts.value?.filter((concert) => !concert.is_archived)?.length ||
            "0",
        },
        permissions.value.choir_groups.view && {
          name: "Tělesa",
          to: "/admin/skupiny",
          icon: "groups",
          badge: "3",
        },
        permissions.value.gallery.view && {
          name: "Galerie",
          to: "/admin/galerie",
          icon: "photo_library",
        },
      ].filter(Boolean),
    },
    {
      title: "Správa",
      items: [
        permissions.value.orders.view && {
          name: "Objednávky",
          to: "/admin/objednavky",
          icon: "receipt_long",
          badge: pendingOrders,
          badgeColor: "bg-yellow-100 text-yellow-700",
        },
        permissions.value.testimonials.view && {
          name: "Reference",
          to: "/admin/reference",
          icon: "rate_review",
          badge:
            testimonials.value?.filter(
              (testimonial) => !testimonial.is_archived
            )?.length || "0",
        },
        permissions.value.form_messages.view && {
          name: "Zprávy",
          to: "/admin/zpravy",
          icon: "mail",
          badge: pendingMessages,
          badgeColor: "bg-red-100 text-red-700",
        },
        permissions.value.contacts.view && {
          name: "Kontakty",
          to: "/admin/kontakty",
          icon: "contacts",
        },
        {
          name: "Média",
          to: "/admin/media",
          icon: "perm_media",
        },
        {
          name: "Oprávnění",
          to: "/admin/opravneni",
          icon: "admin_panel_settings",
          adminOnly: true,
        },
      ].filter(Boolean),
    },
    {
      title: "Systém",
      items: [
        permissions.value.users.view && {
          name: "Uživatelé",
          to: "/admin/uzivatele",
          icon: "manage_accounts",
        },
        permissions.value.audit.view && {
          name: "Audit",
          to: "/admin/audit",
          icon: "fact_check",
        },
        permissions.value.settings.view && {
          name: "Nastavení",
          to: "/admin/system",
          icon: "settings",
        },
        permissions.value.chat.manage && {
          name: "Chat",
          to: "/admin/chat",
          icon: "chat",
        },
      ].filter(Boolean),
    },
  ].filter((section) => section.items.length > 0)
);

// Stats data with real data
const stats = computed(() => [
  {
    name: "Aktivní koncerty",
    value:
      concerts.value?.filter((concert) => !concert.is_archived)?.length || "0",
    icon: "music_note",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    name: "Čekající objednávky",
    value: pendingOrders.value || "0",
    icon: "pending_actions",
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    name: "Nové zprávy",
    value: pendingMessages.value || "0",
    icon: "mail",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    name: "Aktivní reference",
    value:
      testimonials.value?.filter((testimonial) => !testimonial.is_archived)
        ?.length || "0",
    icon: "star",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
]);

// Quick actions with permissions check
const quickActions = computed(() =>
  [
    permissions.value.concerts.edit && {
      name: "Přidat koncert",
      description: "Vytvořit novou událost",
      icon: "add_circle",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      to: "/admin/koncerty?action=add",
    },
    permissions.value.gallery.edit && {
      name: "Nahrát fotky",
      description: "Přidat do galerie",
      icon: "upload",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      to: "/admin/galerie?action=upload",
    },
    permissions.value.orders.view && {
      name: "Správa objednávek",
      description: "Zkontrolovat platby",
      icon: "receipt",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      to: "/admin/objednavky",
    },
    permissions.value.form_messages.view && {
      name: "Zprávy",
      description: "Odpovědět na dotazy",
      icon: "chat",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      to: "/admin/zpravy",
    },
  ].filter(Boolean)
);

// Recent activity computed property
const recentActivity = computed(() => {
  const activities = [];

  // Přidáme poslední objednávku
  const lastOrder = orders.value?.[0];
  if (lastOrder) {
    activities.push({
      id: `order-${lastOrder.id}`,
      title: "Nová objednávka vstupenek",
      description: `${lastOrder.concert?.title || "Koncert"} - ${
        lastOrder.ticket_count
      } ${lastOrder.ticket_count === 1 ? "vstupenka" : "vstupenky"}`,
      time: new Date(lastOrder.created_at).toLocaleString("cs-CZ"),
      icon: "receipt",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      link: `/admin/objednavky/${lastOrder.id}`,
      type: "order",
      data: lastOrder,
    });
  }

  // Přidáme poslední zprávu
  const lastMessage = messages.value?.[0];
  if (lastMessage) {
    activities.push({
      id: `message-${lastMessage.id}`,
      title: "Nová zpráva",
      description:
        lastMessage.message.substring(0, 100) +
        (lastMessage.message.length > 100 ? "..." : ""),
      time: new Date(lastMessage.created_at).toLocaleString("cs-CZ"),
      icon: "mail",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      link: `/admin/zpravy/${lastMessage.id}`,
      type: "message",
      data: lastMessage,
    });
  }

  return activities;
});

// Přidáme ref pro zobrazení modalu s kompletní aktivitou
const showAllActivities = ref(false);

// Funkce pro otevření modalu s kompletní aktivitou
const openAllActivities = () => {
  showAllActivities.value = true;
};

// Funkce pro zavření modalu
const closeAllActivities = () => {
  showAllActivities.value = false;
};

// Computed property pro všechny aktivity
const allActivities = computed(() => {
  const activities = [];

  // Přidáme všechny objednávky
  orders.value?.forEach((order) => {
    activities.push({
      id: `order-${order.id}`,
      title: "Objednávka vstupenek",
      description: `${order.concert?.title || "Koncert"} - ${
        order.ticket_count
      } ${order.ticket_count === 1 ? "vstupenka" : "vstupenky"}`,
      time: new Date(order.created_at).toLocaleString("cs-CZ"),
      icon: "receipt",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      link: `/admin/objednavky/${order.id}`,
      type: "order",
      date: new Date(order.created_at),
      data: order,
    });
  });

  // Přidáme všechny zprávy
  messages.value?.forEach((message) => {
    activities.push({
      id: `message-${message.id}`,
      title: "Zpráva",
      description:
        message.message.substring(0, 100) +
        (message.message.length > 100 ? "..." : ""),
      time: new Date(message.created_at).toLocaleString("cs-CZ"),
      icon: "mail",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      link: `/admin/zpravy/${message.id}`,
      type: "message",
      date: new Date(message.created_at),
      data: message,
    });
  });

  // Seřadíme podle data sestupně (nejnovější první)
  return activities.sort((a, b) => b.date - a.date);
});

const emit = defineEmits(["order-click"]);

// Přidáme funkci pro otevření detailu
const openActivityDetail = (activity) => {
  if (activity.type === "order") {
    router.push(`/admin/objednavky?tab=list&order=${activity.data.id}`);
  } else if (activity.type === "message") {
    router.push(`/admin/zpravy?detail=${activity.data.id}`);
  }
};

// V script části přidáme computed property pro nadcházející koncerty
const upcomingConcerts = computed(() => {
  const now = new Date();
  return (concerts.value || [])
    .filter((concert) => {
      const concertDate = new Date(concert.date);
      return concertDate >= now && !concert.is_archived;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4); // Zobrazíme maximálně 4 nejbližší koncerty
});

// V script části přidáme:
const selectedConcert = ref(null);

const openConcertDetail = (concert) => {
  console.log("Concert data:", {
    id: concert.id,
    title: concert.title,
    image: concert.image,
    poster: concert.poster,
    date: concert.date,
    description: concert.description,
    detailed_description: concert.detailed_description,
    // Add all other fields to see complete structure
    ...concert,
  });
  selectedConcert.value = concert;
};

const closeConcertDetail = () => {
  selectedConcert.value = null;
};

// V script části přidáme:
const supabaseUrl = "https://xsxqmjhzgzquvmqptxrw.supabase.co";

// V script části přidáme:
const formatDetailedDescription = (text) => {
  if (!text) return "";
  // Nahradíme markdown odkazy HTML odkazy
  return (
    text
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800">$1</a>'
      )
      // Nahradíme nové řádky HTML značkami
      .replace(/\n/g, "<br>")
  );
};

// V script části přidáme:
const editConcert = (concert) => {
  closeConcertDetail(); // Zavřeme modal
  router.push({
    path: "/admin/koncerty",
    query: {
      action: "edit",
      concert: concert.id,
    },
  });
};

// V script části přidáme:
const isSidebarOpen = ref(false);
</script>

<style>
/* Add any custom styles here */
</style>
