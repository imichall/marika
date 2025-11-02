<template>
  <div class="flex bg-gray-50 dark:bg-gray-950 min-h-screen">
    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-20 left-4 z-50">
      <button
        @click="isSidebarOpen = !isSidebarOpen"
        class="flex items-center justify-center p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none border border-gray-200 dark:border-gray-800"
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
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 fixed lg:fixed left-0 flex flex-col',
        'lg:translate-x-0',
        isCollapsed ? 'lg:w-20' : 'lg:w-64',
        isSidebarOpen
          ? 'w-64 translate-x-0'
          : 'w-64 -translate-x-full',
        'top-16 bottom-0'
      ]"
    >
      <!-- Sidebar header with toggle button -->
      <div :class="[
        'border-b border-gray-200 dark:border-gray-800 flex-shrink-0',
        isCollapsed && !isSidebarOpen ? 'p-4' : 'p-4 lg:p-6'
      ]">
        <div class="flex items-center" :class="isCollapsed && !isSidebarOpen ? 'justify-center' : 'justify-between'">
          <h2
            v-if="!isCollapsed || isSidebarOpen"
            class="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Marika Admin
          </h2>
          <button
            @click="toggle"
            class="hidden lg:flex items-center justify-center p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :title="isCollapsed ? 'Rozbalit sidebar' : 'Sbalit sidebar'"
          >
            <span class="material-icons-outlined text-xl">
              {{ isCollapsed ? 'chevron_right' : 'chevron_left' }}
            </span>
          </button>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto mt-2 px-2 lg:px-4">
        <div
          v-for="(section, index) in sidebarSections"
          :key="index"
          class="mb-4"
        >
          <div
            v-if="!isCollapsed || isSidebarOpen"
            class="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
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
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                'group flex items-center rounded-lg transition-all duration-200 relative',
                isCollapsed && !isSidebarOpen ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
              ]"
              @click="isSidebarOpen = false"
              :title="(isCollapsed && !isSidebarOpen) ? item.name : ''"
            >
              <span
                class="material-icons-outlined text-xl flex-shrink-0"
                :class="[
                  { 'text-indigo-600 dark:text-indigo-400': route.path === item.to },
                  (isCollapsed && !isSidebarOpen) ? '' : 'mr-3'
                ]"
              >
                {{ item.icon }}
              </span>
              <span v-if="!isCollapsed || isSidebarOpen" class="text-sm font-medium flex-1">
                {{ item.name }}
              </span>
              <span
                v-if="(item.badge && (!isCollapsed || isSidebarOpen))"
                :class="[
                  item.badgeColor || 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
                  'px-2 py-0.5 text-xs rounded-full ml-auto',
                ]"
              >
                {{ item.badge }}
              </span>
              <!-- Badge for collapsed state -->
              <span
                v-if="item.badge && isCollapsed && !isSidebarOpen"
                :class="[
                  item.badgeColor || 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
                  'absolute -top-1 -right-1 text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-medium'
                ]"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main content area -->
    <main :class="[
      'flex-1 transition-all duration-300 w-full',
      isCollapsed ? 'lg:ml-20' : 'lg:ml-64',
      isSidebarOpen ? 'ml-64' : 'ml-0',
      'pt-16'
    ]">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSidebar } from '~/composables/useSidebar';
import { useSupabaseClient } from '#imports';
import { useConcerts } from '~/composables/useConcerts';
import { useTestimonials } from '~/composables/useTestimonials';
import { useTicketOrders } from '~/composables/useTicketOrders';
import { useFormMessages } from '~/composables/useFormMessages';

const route = useRoute();
const { isCollapsed, toggle } = useSidebar();
const isSidebarOpen = ref(false);
const supabase = useSupabaseClient();

// Data for sidebar
const { concerts } = useConcerts();
const { testimonials } = useTestimonials();
const { orders } = useTicketOrders();
const { messages } = useFormMessages();

// Permissions
const permissions = ref({
  concerts: { view: false },
  choir_groups: { view: false },
  gallery: { view: false },
  testimonials: { view: false },
  orders: { view: false },
  form_messages: { view: false },
  contacts: { view: false },
  media: { view: false },
  users: { view: false },
  audit: { view: false },
  settings: { view: false },
  forum: { view: false },
});

// Load permissions
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("id, role")
      .eq("email", user.data.user.email)
      .single();

    if (userRole.role === "admin") {
      Object.keys(permissions.value).forEach((section) => {
        Object.keys(permissions.value[section]).forEach((action) => {
          permissions.value[section][action] = true;
        });
      });
      return;
    }

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

    Object.keys(permissions.value).forEach((section) => {
      Object.keys(permissions.value[section]).forEach((action) => {
        permissions.value[section][action] = false;
      });
    });

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

// Computed properties
const pendingOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "pending")
      .length || 0
);

const pendingMessages = computed(
  () =>
    messages.value?.filter((message) => message.status === "pending").length ||
    0
);

// Sidebar sections
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
          badge: pendingOrders.value || 0,
          badgeColor: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
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
          badge: pendingMessages.value || 0,
          badgeColor: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
        },
        permissions.value.contacts.view && {
          name: "Kontakty",
          to: "/admin/kontakty",
          icon: "contacts",
        },
        permissions.value.media?.view && {
          name: "Média",
          to: "/admin/media",
          icon: "perm_media",
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
        permissions.value.forum?.view && {
          name: "Fórum",
          to: "/admin/forum",
          icon: "forum",
        },
        permissions.value.forum?.view && {
          name: "Agenda tagů",
          to: "/admin/forum/agenda",
          icon: "info",
        },
      ].filter(Boolean),
    },
  ].filter((section) => section.items.length > 0)
);

onMounted(async () => {
  await loadPermissions();
});
</script>

<style scoped>
/* Custom scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.dark nav::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark nav::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>

