<template>
  <div class="min-h-screen">
    <Navigation />
    <AdminMenu />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup>
// Kontrola, zda je uživatel admin (toto je jen příklad, implementujte vlastní logiku)
const isAdmin = ref(true); // V produkci by mělo být defaultně false
</script>
