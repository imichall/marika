<template>
  <nav class="space-y-2">
    <NuxtLink
      to="/admin"
      class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
      :class="{ 'bg-gray-100': $route.path === '/admin' }"
    >
      <Icon name="mdi:view-dashboard" class="w-5 h-5 mr-3" />
      Dashboard
    </NuxtLink>
    <NuxtLink
      to="/admin/koncerty"
      class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
      :class="{ 'bg-gray-100': $route.path.includes('/admin/koncerty') }"
    >
      <Icon name="mdi:calendar" class="w-5 h-5 mr-3" />
      Koncerty
    </NuxtLink>
    <NuxtLink
      to="/admin/objednavky"
      class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
      :class="{ 'bg-gray-100': $route.path === '/admin/objednavky' }"
    >
      <Icon name="mdi:ticket" class="w-5 h-5 mr-3" />
      Objednávky vstupenek
    </NuxtLink>
    <NuxtLink
      to="/admin/socialni-site"
      class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
      :class="{ 'bg-gray-100': $route.path === '/admin/socialni-site' }"
    >
      <Icon name="mdi:share-variant" class="w-5 h-5 mr-3" />
      Sociální sítě
    </NuxtLink>
  </nav>
</template>