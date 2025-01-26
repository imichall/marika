<template>
  <footer id="contact" class="bg-gray-100">
    <div class="container mx-auto px-4">
      <div class="relative flex py-10 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-2xl text-black uppercase"
          >Kontakt</span
        >
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
      <div v-if="loading" class="text-center py-8">
        <p>Načítání...</p>
      </div>
      <div v-else-if="error" class="text-center py-8 text-red-600">
        <p>{{ error }}</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          :class="{
            'bg-pink-50': contact.group_name === 'Marika Singers, z.s.',
            'bg-white': contact.group_name === 'VOICES',
            'bg-gray-50': contact.group_name === 'FIVE',
          }"
          class="p-6"
        >
          <h3 class="font-bold mb-2">{{ contact.group_name }}</h3>
          <div v-if="contact.address" class="whitespace-pre-line">
            {{ contact.address }}
          </div>
          <div v-if="contact.ico || contact.dic" class="mt-4">
            <template v-if="contact.ico && contact.dic">
              IČO: {{ contact.ico }} / DIČ: {{ contact.dic }}
            </template>
            <template v-else-if="contact.ico">
              IČO: {{ contact.ico }}
            </template>
          </div>
          <div v-if="contact.email" class="mt-4">
            <a
              :href="`mailto:${contact.email}`"
              class="text-gray-600 hover:text-gray-900"
            >
              {{ contact.email }}
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center mt-8 py-4 text-sm bg-black text-white">
      © {{ new Date().getFullYear() }} Marika Singers, z.s.
    </div>
  </footer>
</template>

<script setup>
import { onMounted } from "#imports";
import { useContacts } from "~/composables/useContacts";

const { contacts, loading, error, fetchContacts } = useContacts();

onMounted(() => {
  fetchContacts();
});
</script>