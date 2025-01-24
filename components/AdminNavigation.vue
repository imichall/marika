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

const { logout } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  try {
    await logout();
    await router.push("/");
  } catch (error) {
    console.error("Chyba při odhlášení:", error);
  }
};
</script>