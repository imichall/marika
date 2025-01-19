<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation -->
    <nav class="bg-white shadow-sm fixed w-full top-0 z-40">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/admin" class="font-bold text-xl">Admin Panel</NuxtLink>
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">
              Zpět na web
            </NuxtLink>
            <button
              @click="handleLogout"
              class="text-gray-600 hover:text-gray-900"
            >
              Odhlásit
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Side Navigation -->
    <aside class="fixed left-0 top-16 h-full w-64 bg-white shadow-sm">
      <nav class="p-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/admin"
              class="block px-4 py-2 rounded-md hover:bg-gray-100"
              :class="{ 'bg-gray-100': route.path === '/admin' }"
            >
              Dashboard
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/admin/koncerty"
              class="block px-4 py-2 rounded-md hover:bg-gray-100"
              :class="{ 'bg-gray-100': route.path.includes('/admin/koncerty') }"
            >
              Koncerty
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/admin/skupiny"
              class="block px-4 py-2 rounded-md hover:bg-gray-100"
              :class="{ 'bg-gray-100': route.path.includes('/admin/skupiny') }"
            >
              Skupiny
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/admin/galerie"
              class="block px-4 py-2 rounded-md hover:bg-gray-100"
              :class="{ 'bg-gray-100': route.path.includes('/admin/galerie') }"
            >
              Galerie
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/admin/reference"
              class="block px-4 py-2 rounded-md hover:bg-gray-100"
              :class="{
                'bg-gray-100': route.path.includes('/admin/reference'),
              }"
            >
              Reference
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 pt-16">
      <slot />
    </main>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  router.push("/admin/login");
};
</script>