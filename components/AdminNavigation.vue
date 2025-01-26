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

          <!-- Notifikace -->
          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 relative"
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
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
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";
import { useTicketOrders } from "~/composables/useTicketOrders";
import { ref, onMounted, computed } from "vue";

const { logout } = useAuth();
const router = useRouter();
const { orders, getAllOrders } = useTicketOrders();
const showNotifications = ref(false);

// Načtení objednávek při mounted
onMounted(async () => {
  await getAllOrders();
});

// Počet čekajících objednávek
const pendingOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "pending")
      .length || 0
);

// Seznam čekajících objednávek
const pendingOrdersList = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "pending") || []
);

const handleLogout = async () => {
  try {
    await logout();
    await router.push("/");
  } catch (error) {
    console.error("Chyba při odhlášení:", error);
  }
};

const handleOrderClick = (orderId) => {
  router.push("/admin/objednavky");
  showNotifications.value = false;
};
</script>

<style scoped>
.router-link-active {
  color: #ef4444; /* text-red-500 */
}
</style>