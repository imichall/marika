<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white overflow-hidden relative px-4 sm:px-6 py-12">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden hidden sm:block">
      <div
        v-for="n in 20"
        :key="n"
        class="absolute animate-float"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }"
      >
        🔒
      </div>
    </div>

    <div
      class="w-full max-w-md mx-auto space-y-8 relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl"
    >
      <div class="text-center relative">
        <!-- Lock icon -->
        <div class="mb-6 sm:mb-8 relative mx-auto w-24 sm:w-32 h-24 sm:h-32">
          <svg
            class="w-full h-full animate-bounce-slow"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              class="animate-pulse"
              d="M12 15a2 2 0 100-4 2 2 0 000 4z"
              fill="#991b1b"
            />
            <path
              d="M19 10h-1V7a6 6 0 10-12 0v3H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2zM8 7a4 4 0 118 0v3H8V7zm11 13H5v-8h14v8z"
              stroke="#991b1b"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h2
          class="text-2xl sm:text-4xl font-extrabold text-red-800 mb-2 sm:mb-4"
        >
          Reset hesla
        </h2>
        <p class="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Zadejte nové heslo pro váš účet
        </p>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        Heslo bylo úspěšně změněno! Budete přesměrováni na přihlašovací stránku...
      </div>

      <form
        v-if="!success"
        class="mt-6 sm:mt-8 space-y-4 sm:space-y-6 relative"
        @submit.prevent="handleResetPassword"
      >
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">Nové heslo</label>
            <input
              id="password"
              v-model="password"
              type="password"
              name="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-t-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-base sm:text-sm"
              placeholder="Nové heslo"
              :disabled="loading"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">Potvrzení hesla</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              name="confirm-password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-b-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-base sm:text-sm"
              placeholder="Potvrďte nové heslo"
              :disabled="loading"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !password || !confirmPassword || password !== confirmPassword"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <span v-if="loading" class="mr-2">
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            <span v-else>🔐</span>
            <span class="ml-2">{{
              loading ? "Měním heslo..." : "Změnit heslo"
            }}</span>
          </button>
        </div>

        <div class="text-center">
          <NuxtLink
            to="/admin/login"
            class="text-sm text-red-600 hover:text-red-500 font-medium"
          >
            Zpět na přihlášení
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { useRouter, useRoute } from "vue-router";

const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const handleResetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "Hesla se neshodují";
    return;
  }

  if (password.value.length < 6) {
    error.value = "Heslo musí mít alespoň 6 znaků";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Získáme hash z URL s recovery tokenem
    const hash = window.location.hash;

    if (!hash) {
      error.value = "Neplatný odkaz pro reset hesla";
      return;
    }

    // Zkusíme verifikovat token z URL
    const urlParams = new URLSearchParams(hash.substring(1));
    const accessToken = urlParams.get('access_token');
    const type = urlParams.get('type');
    const refreshToken = urlParams.get('refresh_token');

    if (!accessToken || !refreshToken || type !== 'recovery') {
      error.value = "Neplatný nebo neúplný odkaz pro reset hesla";
      return;
    }

    // Nastavíme session pomocí tokenů z URL
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (sessionError) {
      throw sessionError;
    }

    // Nyní můžeme změnit heslo
    const { error: resetError } = await supabase.auth.updateUser({
      password: password.value,
    });

    if (resetError) {
      throw resetError;
    }

    success.value = true;

    // Po 2 sekundách přesměrujeme na přihlášení
    setTimeout(() => {
      router.push("/admin/login");
    }, 2000);
  } catch (err: any) {
    console.error("Error resetting password:", err);
    error.value = err.message || "Nepodařilo se změnit heslo";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // Zkontrolujeme, zda je uživatel přihlášen nebo zda má validní reset token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Zkusíme získat session z hash v URL
    const hash = route.hash.replace('#', '');
    if (hash) {
      const { error: recoverError } = await supabase.auth.recoverSession(hash);
      if (recoverError) {
        error.value = "Neplatný nebo vypršelý odkaz pro reset hesla";
      }
    } else {
      error.value = "Neplatný odkaz pro reset hesla";
    }
  }
});
</script>

<style scoped>
.animate-float {
  animation: float 20s infinite;
}

.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>

