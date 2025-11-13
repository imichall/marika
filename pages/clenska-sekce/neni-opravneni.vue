<template>
  <div class="max-w-xl mx-auto mt-16 text-center space-y-4">
    <Icon name="mdi:lock-alert" class="text-6xl text-red-600 mx-auto" />
    <h1 class="text-2xl font-semibold text-slate-900">Do této části nemáte přístup</h1>
    <p class="text-slate-600">
      Pro přístup ke zvolené části členské sekce je zapotřebí oprávnění. Pokud si myslíte, že jde o chybu,
      kontaktujte administrátora webu nebo vedení sboru.
    </p>
    <NuxtLink
      to="/clenska-sekce"
      class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition-colors"
    >
      <Icon name="mdi:arrow-left" class="text-lg" />
      Zpět na přehled
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'members'
})
</script>

