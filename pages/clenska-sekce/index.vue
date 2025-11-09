<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg px-8 py-10">
      <h2 class="text-3xl font-semibold mb-3">Vítejte v členské sekci</h2>
      <p class="text-red-50 max-w-3xl">
        Zde najdete kompletní repertoár včetně notových materiálů, archiv všech členů sboru a důležité dokumenty ke stažení.
        Veškerý obsah je dostupný pouze přihlášeným členům.
      </p>
    </section>

    <section class="grid gap-6 md:grid-cols-2">
      <NuxtLink
        v-for="card in cards"
        :key="card.href"
        :to="card.href"
        class="group rounded-2xl bg-white shadow-sm hover:shadow-xl transition shadow duration-200 border border-slate-100 p-6 flex flex-col gap-3"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-red-50 text-red-600 p-3">
            <Icon :name="card.icon" class="text-2xl" />
          </div>
          <h3 class="text-lg font-semibold text-slate-900">{{ card.title }}</h3>
        </div>
        <p class="text-sm text-slate-600 flex-1">
          {{ card.description }}
        </p>
        <span class="inline-flex items-center gap-2 text-sm font-medium text-red-600 group-hover:gap-3 transition-all">
          Přesunout se
          <Icon name="mdi:arrow-right" class="text-lg" />
        </span>
      </NuxtLink>
    </section>

    <section class="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
      <h3 class="text-lg font-semibold text-slate-900 mb-2">Tipy pro práci s repertoárem</h3>
      <ul class="list-disc list-inside space-y-2 text-sm text-slate-600">
        <li>Vyberte více skladeb pomocí zaškrtávacích políček a exportujte je do Excelu pro hlášení na OSA.</li>
        <li>Každá skladba může mít více souborů podle hlasů – při nahrávání je možné je označit.</li>
        <li>Vyhledávání funguje podle názvu i autora, můžete také filtrovat abecedně podle počátečního písmene.</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'members'
})

const cards = [
  {
    title: 'Repertoár',
    description: 'Kompletní seznam skladeb včetně autorů a notových materiálů připravených ke stažení.',
    href: '/clenska-sekce/repertoar',
    icon: 'mdi:music-note-plus'
  },
  {
    title: 'Členové',
    description: 'Evidujte všechny, kdo prošli sborem. Udržujte poznámky, hlasové obsazení a kontakty.',
    href: '/clenska-sekce/clenove',
    icon: 'mdi:account-group'
  },
  {
    title: 'Dokumenty ke stažení',
    description: 'Logo, stanovy, kronika a další interní dokumenty na jednom místě.',
    href: '/clenska-sekce/ke-stazeni',
    icon: 'mdi:folder-download'
  },
  {
    title: 'Správa oprávnění',
    description: 'Oprávnění a přístupy se nastavují v administraci v sekci Správa oprávnění a Uživatelé.',
    href: '/admin/opravneni',
    icon: 'mdi:shield-key-outline'
  }
]
</script>

