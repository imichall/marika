<template>
  <nav class="fixed top-0 w-full bg-white z-50 shadow-lg border-b">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo a název -->
        <div class="flex items-center space-x-4">
          <NuxtLink to="/admin" class="flex items-center space-x-3">
            <img
              src="/images/svg/marika-singers-logo.svg"
              alt="Logo"
              class="h-8"
            />
            <span class="text-xl font-semibold text-gray-900"
              >Administrace</span
            >
          </NuxtLink>
        </div>

        <!-- Pravá část menu -->
        <div class="flex items-center space-x-6">
          <!-- Odkaz na frontend -->
          <NuxtLink
            to="/"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Zpět na web</span>
          </NuxtLink>

          <!-- Nastavení -->
          <NuxtLink
            to="/admin/system"
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

          <!-- Oddělovač -->
          <div class="h-6 w-px bg-gray-200"></div>

          <!-- Logout tlačítko -->
          <button
            @click="handleLogout"
            class="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
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

const { logout } = useAuth();
const router = useRouter();
const { orders, getAllOrders, startAutoRefresh } = useTicketOrders();
const showNotifications = ref(false);
const currentUserRole = ref("viewer");

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
});
</script>

<style scoped>
.router-link-active {
  color: #ef4444; /* text-red-500 */
}
</style>