<template>
  <div class="w-full px-4 py-8 pb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">Agenda tagů fóra</h1>
      <p class="text-gray-600">
        Níže naleznete přehled všech dostupných tagů a jejich význam.
      </p>
    </div>

    <!-- Seznam tagů -->
    <div class="space-y-6">
      <!-- Obecné -->
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-400">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded">
            Obecné
          </span>
        </div>
        <div class="space-y-2">
          <p class="text-gray-700">
            <strong>Popis:</strong> Všeobecné téma, které nepatří do žádné konkrétní kategorie. Používá se pro obecné diskuse, dotazy nebo komentáře, které nejsou specifikované jako bug, issue nebo úprava.
          </p>
          <p class="text-gray-600 text-sm">
            <strong>Kdy použít:</strong> Obecné dotazy, diskuse, komentáře, nebo témata, která nespadají do jiných kategorií.
          </p>
        </div>
      </div>

      <!-- Bug -->
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded">
            Bug
          </span>
        </div>
        <div class="space-y-2">
          <p class="text-gray-700">
            <strong>Popis:</strong> Chyba v systému, která způsobuje nesprávné chování nebo neočekávané výsledky. Bug obvykle způsobuje, že něco nefunguje tak, jak má.
          </p>
          <p class="text-gray-600 text-sm">
            <strong>Kdy použít:</strong> Když objevíte chybu v aplikaci, která způsobuje nesprávné fungování, neočekávané chování, nebo když něco nefunguje vůbec.
          </p>
          <p class="text-gray-600 text-sm">
            <strong>Příklad:</strong> "Tlačítko odeslat formulář nefunguje", "Chyba při ukládání dat", "Zobrazuje se nesprávný obsah".
          </p>
        </div>
      </div>

      <!-- Issue -->
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded">
            Issue
          </span>
        </div>
        <div class="space-y-2">
          <p class="text-gray-700">
            <strong>Popis:</strong> Problém nebo záležitost, která vyžaduje řešení, ale není to přímo technická chyba. Může to být chybějící funkce, nesoulad v designu, nebo požadavek na zlepšení.
          </p>
          <p class="text-gray-600 text-sm">
            <strong>Kdy použít:</strong> Když chcete nahlásit problém, který není přímo bug, ale vyžaduje pozornost nebo řešení. Také pro požadavky na nové funkce nebo zlepšení.
          </p>
          <p class="text-gray-600 text-sm">
            <strong>Příklad:</strong> "Chybí možnost exportovat data", "Nedostatečná dokumentace", "Navrhované vylepšení rozhraní".
          </p>
        </div>
      </div>

      <!-- Úprava -->
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded">
            Úprava
          </span>
        </div>
        <div class="space-y-2">
          <p class="text-gray-700">
            <strong>Popis:</strong> Návrh na úpravu nebo změnu existující funkce, designu nebo chování systému. Úprava nemusí řešit chybu, ale navrhuje zlepšení stávajícího stavu.
          </p>
          <p class="text-gray-600 text-sm">
            <strong>Kdy použít:</strong> Když chcete navrhnout změnu existující funkce, designu, nebo chování aplikace. Je to žádost o úpravu, nikoliv opravu chyby.
          </p>
          <p class="text-gray-600 text-sm">
            <strong>Příklad:</strong> "Navrhuji změnit barvu tlačítka", "Upravit pořadí položek v menu", "Změnit způsob zobrazení dat".
          </p>
        </div>
      </div>
    </div>

    <!-- Přehled -->
    <div class="mt-8 bg-indigo-50 p-6 rounded-lg">
      <h2 class="text-xl font-bold mb-4">Rychlý přehled</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Obecné</h3>
          <p class="text-sm text-gray-600">
            Všeobecné téma nebo diskuse
          </p>
        </div>
        <div class="bg-white p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Bug</h3>
          <p class="text-sm text-gray-600">
            Technická chyba v systému
          </p>
        </div>
        <div class="bg-white p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Issue</h3>
          <p class="text-sm text-gray-600">
            Problém nebo požadavek na řešení
          </p>
        </div>
        <div class="bg-white p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Úprava</h3>
          <p class="text-sm text-gray-600">
            Návrh na změnu existující funkce
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});
</script>

