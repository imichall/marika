<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white overflow-hidden relative"
  >
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="n in 20"
        :key="n"
        class="key absolute animate-float"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }"
      >
        🔑
      </div>
    </div>

    <div class="max-w-md w-full space-y-8 relative">
      <div class="text-center relative">
        <!-- Animated lock icon -->
        <div class="mb-8 relative mx-auto w-32 h-32">
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

        <div
          class="transform hover:scale-105 transition-transform duration-300"
        >
          <h2 class="text-4xl font-extrabold text-red-800 mb-4 animate-pulse">
            Přihlášení do administrace
          </h2>
          <p class="text-gray-600 mb-8">Vstupte do světa administrátora! 🎵</p>
        </div>
      </div>

      <form class="mt-8 space-y-6 relative" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transform hover:scale-101 transition-transform duration-200"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Heslo</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transform hover:scale-101 transition-transform duration-200"
              placeholder="Heslo"
            />
          </div>
        </div>

        <div
          v-if="error"
          class="text-red-500 text-sm text-center animate-bounce"
        >
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-800 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105 transition-all duration-300"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-red-500 group-hover:text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ loading ? "Přihlašování..." : "Přihlásit se" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";

const toast = useToast();
const { login } = useAuth();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  error.value = "";
  try {
    loading.value = true;
    const success = await login(email.value, password.value);
    if (success) {
      toast.success("Přihlášení proběhlo úspěšně");
      router.push("/admin");
    } else {
      error.value = "Nesprávné přihlašovací údaje";
    }
  } catch (err) {
    toast.error("Chyba při přihlášení: " + err.message);
    error.value = "Došlo k chybě při přihlašování";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.key {
  font-size: 1.5rem;
  opacity: 0.2;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>