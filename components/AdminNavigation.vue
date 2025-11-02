<template>
  <nav class="fixed top-0 w-full bg-white dark:bg-gray-900 z-50 shadow-lg border-b dark:border-gray-800">
    <div class="w-full px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo a název -->
        <div class="flex items-center space-x-4">
          <NuxtLink to="/admin" class="flex items-center space-x-3">
            <div class="h-8 px-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center transition-colors duration-200">
              <img
                src="/images/svg/marika-singers-logo.svg"
                alt="Logo"
                class="h-6 dark:opacity-90 dark:brightness-150"
              />
            </div>
            <span class="text-xl font-semibold text-gray-900 dark:text-gray-100 hidden sm:inline"
              >Administrace</span
            >
          </NuxtLink>
        </div>

        <!-- Mobilní menu tlačítko -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span class="sr-only">Otevřít menu</span>
          <svg
            class="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              v-if="!isMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Desktop menu -->
        <div class="hidden lg:flex items-center space-x-6">
          <!-- Původní položky menu pro desktop -->
          <NuxtLink
            to="/"
            class="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Zpět na web</span>
          </NuxtLink>

          <!-- Historie emailů -->
          <NuxtLink
            v-if="permissions.emails?.view"
            to="/admin/emaily"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>Historie emailů</span>
          </NuxtLink>

          <!-- Oprávnění - pouze pro adminy -->
          <NuxtLink
            v-if="currentUserRole === 'admin'"
            to="/admin/opravneni"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <span>Oprávnění</span>
          </NuxtLink>

          <!-- Notifikace -->
          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="notification-bell relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <span class="sr-only">Zobrazit notifikace</span>
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
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              <span
                v-if="pendingOrders > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
              >
                {{ pendingOrders }}
              </span>
            </button>

            <!-- Notifikační panel -->
            <NotificationPanel
              v-if="showNotifications"
              :orders="pendingOrdersList"
              @close="showNotifications = false"
              @order-click="handleOrderClick"
            />
          </div>

          <!-- Dark mode přepínač -->
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            :aria-label="isDark ? 'Zapnout světlý režim' : 'Zapnout tmavý režim'"
          >
            <span v-if="isDark" class="material-icons-outlined">light_mode</span>
            <span v-else class="material-icons-outlined">dark_mode</span>
          </button>

          <!-- Oddělovač -->
          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

          <!-- Informace o uživateli -->
          <div class="flex items-center space-x-2">
            <span class="material-icons-outlined text-gray-400"
              >account_circle</span
            >
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                user?.email
              }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{
                getRoleName(currentUserRole)
              }}</span>
            </div>
          </div>

          <!-- Oddělovač -->
          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

          <!-- Logout tlačítko -->
          <button
            @click="handleLogout"
            class="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Odhlásit se</span>
          </button>
        </div>
      </div>

      <!-- Mobilní menu -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isMenuOpen"
          class="lg:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg py-2"
        >
          <div class="px-4 py-2 space-y-1">
            <!-- Mobilní položky menu -->
            <NuxtLink
              to="/"
              class="flex items-center space-x-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              @click="isMenuOpen = false"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Zpět na web</span>
            </NuxtLink>

            <NuxtLink
              to="/admin/system"
              class="flex items-center space-x-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              @click="isMenuOpen = false"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Nastavení</span>
            </NuxtLink>

            <NuxtLink
              v-if="permissions.emails?.view"
              to="/admin/emaily"
              class="flex items-center space-x-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              @click="isMenuOpen = false"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Historie emailů</span>
            </NuxtLink>

            <NuxtLink
              v-if="currentUserRole === 'admin'"
              to="/admin/opravneni"
              class="flex items-center space-x-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              @click="isMenuOpen = false"
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <span>Oprávnění</span>
            </NuxtLink>

            <!-- Notifikace pro mobil -->
            <button
              @click="showNotifications = !showNotifications"
              class="w-full flex items-center space-x-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div class="relative">
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
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                <span
                  v-if="pendingOrders > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                >
                  {{ pendingOrders }}
                </span>
              </div>
              <span>Notifikace</span>
            </button>

            <!-- Informace o uživateli pro mobil -->
            <div class="flex items-center space-x-2 p-3 text-gray-600 dark:text-gray-300">
              <span class="material-icons-outlined">account_circle</span>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  user?.email
                }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{
                  getRoleName(currentUserRole)
                }}</span>
              </div>
            </div>

            <!-- Dark mode přepínač pro mobil -->
            <button
              @click="toggleDarkMode"
              class="w-full flex items-center space-x-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <span v-if="isDark" class="material-icons-outlined">light_mode</span>
              <span v-else class="material-icons-outlined">dark_mode</span>
              <span>{{ isDark ? 'Světlý režim' : 'Tmavý režim' }}</span>
            </button>

            <!-- Odhlášení pro mobil -->
            <button
              @click="handleLogout"
              class="w-full flex items-center space-x-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Odhlásit se</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";
import { useTicketOrders } from "~/composables/useTicketOrders";
import NotificationPanel from "~/components/NotificationPanel.vue";
import { useSupabaseClient } from "#imports";
import { useColorMode } from "#imports";

const { logout, user } = useAuth();
const router = useRouter();
const { orders, getAllOrders, startAutoRefresh } = useTicketOrders();
const showNotifications = ref(false);
const currentUserRole = ref("viewer");
const permissions = ref({
  emails: {
    view: false,
    manage: false,
  },
});
const isMenuOpen = ref(false);

// Dark mode
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');

const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

// Překlad rolí do češtiny
const getRoleName = (role) => {
  const roles = {
    admin: "Administrátor",
    editor: "Editor",
    viewer: "Prohlížeč",
  };
  return roles[role] || role;
};

// Načtení role uživatele
const fetchUserRole = async () => {
  try {
    const supabase = useSupabaseClient();
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", user.data.user.email)
      .single();

    if (error) throw error;
    currentUserRole.value = data.role;
  } catch (err) {
    console.error("Error fetching user role:", err);
  }
};

// Načtení oprávnění
const fetchPermissions = async () => {
  try {
    const supabase = useSupabaseClient();
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    const { data: userPermissions, error } = await supabase.rpc(
      "get_user_permissions",
      {
        p_email: user.data.user.email,
      }
    );

    if (error) throw error;

    // Aktualizace oprávnění
    permissions.value = userPermissions.reduce((acc, perm) => {
      if (!acc[perm.section]) {
        acc[perm.section] = {};
      }
      acc[perm.section][perm.action] = true;
      return acc;
    }, {});
  } catch (err) {
    console.error("Error fetching permissions:", err);
  }
};

// Počet čekajících objednávek
const pendingOrders = computed(() => {
  return (
    orders.value?.filter((order) => order.payment_status === "pending")
      .length || 0
  );
});

// Seznam čekajících objednávek pro panel
const pendingOrdersList = computed(() => {
  if (!orders.value) return [];
  return orders.value
    .filter((order) => order.payment_status === "pending")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
});

const handleLogout = async () => {
  try {
    await logout();
    await router.push("/");
  } catch (error) {
    console.error("Chyba při odhlášení:", error);
  }
};

const handleOrderClick = (orderId) => {
  showNotifications.value = false;
  router.push(
    `/admin/objednavky?tab=list${orderId ? `&order=${orderId}` : ""}`
  );
};

onMounted(() => {
  getAllOrders();
  startAutoRefresh(30000);
  fetchUserRole();
  fetchPermissions();
});
</script>

<style scoped>
.router-link-active {
  @apply text-red-500;
}

/* Přidáme styl pro aktivní položku v mobilním menu */
@media (max-width: 1024px) {
  .router-link-active {
    @apply bg-red-50 dark:bg-gray-900/20 text-red-500 dark:text-red-400;
  }
}
</style>