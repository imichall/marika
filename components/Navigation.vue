<template>
  <!-- Frontend Navigation -->
  <nav
    v-if="!isAdminRoute"
    class="fixed top-0 w-full bg-white z-50 shadow-sm border-b border-red-800"
  >
    <div class="bg-black">
      <div
        class="container mx-auto px-4 py-2 flex justify-between items-center"
      >
        <!-- Social Icons -->
        <div class="flex items-center space-x-4">
          <a
            href="https://www.facebook.com/marikasingers/?locale=cs_CZ"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white hover:text-gray-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"
              />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/user/MarikaSingers"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white hover:text-gray-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M23.498,6.186a3.016,3.016,0,0,0-2.122-2.136C19.505,3.545,12,3.545,12,3.545s-7.505,0-9.377.505A3.017,3.017,0,0,0,.5,6.186C0,8.07,0,12,0,12s0,3.93.5,5.814a3.016,3.016,0,0,0,2.122,2.136c1.871.505,9.376.505,9.376.505s7.505,0,9.377-.505a3.015,3.015,0,0,0,2.122-2.136C24,15.93,24,12,24,12S24,8.07,23.498,6.186ZM9.545,15.568V8.432L15.818,12Z"
              />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/marika_singers/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white hover:text-gray-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12,2.982c2.937,0,3.285.011,4.445.064a6.087,6.087,0,0,1,2.042.379,3.408,3.408,0,0,1,1.265.823,3.408,3.408,0,0,1,.823,1.265,6.087,6.087,0,0,1,.379,2.042c.053,1.16.064,1.508.064,4.445s-.011,3.285-.064,4.445a6.087,6.087,0,0,1-.379,2.042,3.643,3.643,0,0,1-2.088,2.088,6.087,6.087,0,0,1-2.042.379c-1.16.053-1.508.064-4.445.064s-3.285-.011-4.445-.064a6.087,6.087,0,0,1-2.043-.379,3.408,3.408,0,0,1-1.265-.823,3.408,3.408,0,0,1-.823-1.265,6.087,6.087,0,0,1-.379-2.042c-.053-1.16-.064-1.508-.064-4.445s.011-3.285.064-4.445a6.087,6.087,0,0,1,.379-2.042,3.408,3.408,0,0,1,.823-1.265,3.408,3.408,0,0,1,1.265-.823,6.087,6.087,0,0,1,2.043-.379c1.16-.053,1.508-.064,4.445-.064M12,1c-2.987,0-3.362.013-4.535.066a8.074,8.074,0,0,0-2.67.511,5.392,5.392,0,0,0-1.949,1.27,5.392,5.392,0,0,0-1.27,1.949,8.074,8.074,0,0,0-.511,2.67C1.013,8.638,1,9.013,1,12s.013,3.362.066,4.535a8.074,8.074,0,0,0,.511,2.67,5.392,5.392,0,0,0,1.27,1.949,5.392,5.392,0,0,0,1.949,1.27,8.074,8.074,0,0,0,2.67.511C8.638,22.987,9.013,23,12,23s3.362-.013,4.535-.066a8.074,8.074,0,0,0,2.67-.511,5.625,5.625,0,0,0,3.219-3.219,8.074,8.074,0,0,0,.511-2.67C22.987,15.362,23,14.987,23,12s-.013-3.362-.066-4.535a8.074,8.074,0,0,0-.511-2.67,5.392,5.392,0,0,0-1.27-1.949,5.392,5.392,0,0,0-1.949-1.27,8.074,8.074,0,0,0-2.67-.511C15.362,1.013,14.987,1,12,1Zm0,5.351A5.649,5.649,0,1,0,17.649,12,5.649,5.649,0,0,0,12,6.351Zm0,9.316A3.667,3.667,0,1,1,15.667,12,3.667,3.667,0,0,1,12,15.667Zm5.872-10.859a1.32,1.32,0,1,0,1.32,1.32A1.32,1.32,0,0,0,17.872,4.808Z"
              />
            </svg>
          </a>
        </div>

        <!-- Login Button -->
        <button
          @click="showLoginModal = true"
          class="inline-flex items-center gap-2 bg-transparent text-white group transition-colors duration-200"
        >
          Členská sekce
          <svg
            class="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobilní menu trigger -->
    <button
      @click="toggleMenu"
      class="md:hidden fixed top-10 right-4 z-50 flex flex-col gap-3 p-2"
      :class="{ hidden: isMenuOpen }"
    >
      <span
        class="w-16 h-1.5 bg-black transition-all duration-300 rounded-sm"
      ></span>
      <span
        class="w-8 h-1.5 self-end bg-black transition-all duration-300 rounded-sm"
      ></span>
    </button>

    <!-- Desktop menu -->
    <div class="hidden md:block container mx-auto px-4 py-2">
      <div class="flex justify-between items-center">
        <div class="logo">
          <NuxtLink to="/">
            <img
              src="/images/svg/marika-singers-logo.svg"
              alt="Logo"
              class="w-[68px]"
            />
          </NuxtLink>
        </div>
        <div class="flex space-x-6">
          <button
            v-for="item in visibleMenuItems"
            :key="item.id"
            @click="handleDesktopClick(item.id)"
            class="text-gray-700 hover:text-gray-900 transition-colors"
          >
            {{ item.text }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobilní menu -->
    <Transition name="slide">
      <div v-if="isMenuOpen" class="fixed inset-0 bg-black/90 z-40 md:hidden">
        <!-- Zavírací tlačítko -->
        <button
          @click="toggleMenu"
          class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center"
        >
          <span class="absolute w-16 h-1.5 bg-white transform rotate-45"></span>
          <span
            class="absolute w-16 h-1.5 bg-white transform -rotate-45"
          ></span>
        </button>

        <!-- Mobilní menu obsah -->
        <div class="flex flex-col h-full pt-20 px-6">
          <div class="text-[40px] text-white space-y-6">
            <button
              v-for="item in visibleMenuItems"
              :key="item.id"
              @click="handleMobileClick(item.id)"
              class="block w-full text-left font-bold"
            >
              {{ item.text }}
            </button>
          </div>

          <!-- Logo v mobilním menu -->
          <div class="mt-auto mb-8">
            <NuxtLink to="/" @click="isMenuOpen = false">
              <img
                src="/images/svg/logo-marikasingers.svg"
                alt="Logo"
                class="w-10"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </nav>

  <!-- Admin Navigation -->
  <nav v-else class="fixed top-0 w-full bg-white z-50 shadow-lg border-b">
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

  <!-- Login Modal -->
  <Teleport to="body">
    <div
      v-if="showLoginModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 class="text-xl font-bold mb-4">Přihlášení do privátní sekce</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Uživatelské jméno:</label>
            <input
              v-model="loginForm.username"
              type="text"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Heslo:</label>
            <input
              v-model="loginForm.password"
              type="password"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="flex justify-between">
            <button
              type="submit"
              class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Přihlásit
            </button>
            <button
              @click="showLoginModal = false"
              class="text-gray-600 hover:text-gray-800"
            >
              Zavřít
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "~/composables/useAuth";

const router = useRouter();
const route = useRoute();
const isMenuOpen = ref(false);
const showLoginModal = ref(false);
const { scrollToSection } = useScroll();
const { isAuthenticated, logout } = useAuth();

const isAdminRoute = computed(() => {
  return route.path.startsWith("/admin");
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  console.log("Menu state:", isMenuOpen.value);
};

const menuItems = [
  { id: "about", text: "O NÁS", requiresAuth: false },
  { id: "gallery", text: "GALERIE", requiresAuth: false },
  { id: "testimonials", text: "NAPSALI O NÁS", requiresAuth: false },
  { id: "contact", text: "KONTAKT", requiresAuth: false },
  { id: "admin", text: "ADMINISTRACE", requiresAuth: true },
];

const visibleMenuItems = computed(() => {
  return menuItems.filter((item) => {
    if (item.requiresAuth) {
      return isAuthenticated.value;
    }
    return true;
  });
});

const handleDesktopClick = async (id) => {
  if (route.path !== "/") {
    await router.push("/");
    setTimeout(() => {
      scrollToSection(id);
    }, 100);
  } else {
    scrollToSection(id);
  }
};

const handleMobileClick = async (id) => {
  isMenuOpen.value = false;

  if (route.path !== "/") {
    await router.push("/");
    setTimeout(() => {
      scrollToSection(id);
    }, 100);
  } else {
    scrollToSection(id);
  }
};

watch(isMenuOpen, (newValue) => {
  if (process.client) {
    document.body.style.overflow = newValue ? "hidden" : "";
  }
});

const loginForm = reactive({
  username: "",
  password: "",
});

const handleLogin = () => {
  localStorage.setItem("ms_username", loginForm.username);
  localStorage.setItem("ms_password", loginForm.password);
  window.location.href = "https://www.marikasingers.cz/prihlaseni.aspx";
};

const handleLogout = async () => {
  try {
    await logout();
    router.push("/");
  } catch (error) {
    console.error("Chyba při odhlášení:", error);
  }
};

// Breadcrumbs logika
const breadcrumbs = computed(() => {
  const path = route.path;
  const parts = path.split("/").filter((part) => part);
  const crumbs = [];
  let currentPath = "";

  parts.forEach((part, index) => {
    currentPath += `/${part}`;

    // Přeskočit 'admin' v breadcrumbs, protože máme ikonu domečku
    if (part === "admin") return;

    let name = part.charAt(0).toUpperCase() + part.slice(1);

    // Mapování názvů sekcí
    const nameMap = {
      koncerty: "Koncerty",
      skupiny: "Skupiny",
      galerie: "Galerie",
      reference: "Reference",
      novinky: "Novinky",
      kontakty: "Kontakty",
      new: "Nový záznam",
      edit: "Upravit",
    };

    if (nameMap[part]) {
      name = nameMap[part];
    }

    crumbs.push({
      name,
      path: currentPath,
    });
  });

  return crumbs;
});
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

button {
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.md\:hidden {
  z-index: 60;
}

.router-link-active {
  color: #ef4444; /* text-red-500 */
}
</style>