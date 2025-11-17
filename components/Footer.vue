<template>
  <footer
    id="contact"
    class="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden"
  >
    <!-- Decorative elements -->
    <div
      class="absolute inset-0 opacity-[0.03]"
      style="
        background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
      "
    ></div>

    <div class="container mx-auto px-4 relative">
      <div class="text-center py-16">
        <div class="relative flex items-center">
          <div class="flex-grow border-t border-gray-400"></div>
          <span class="flex-shrink mx-4 text-2xl text-black uppercase"
            >Kontakt</span
          >
          <div class="flex-grow border-t border-gray-400"></div>
        </div>
      </div>

      <div v-if="loading || settingsLoading" class="text-center py-16">
        <div
          class="animate-spin rounded-full h-16 w-16 border-4 border-red-800 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Načítání kontaktů...</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <div
          class="bg-red-50 p-6 rounded-xl max-w-lg mx-auto border border-red-200"
        >
          <svg
            class="w-12 h-12 text-red-800 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p class="text-red-800 font-medium">{{ error }}</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16">
        <FadeUpOnScroll v-for="contact in contacts" :key="contact.id">
          <div
            :class="{
              'bg-gradient-to-br from-white to-red-50 border-red-200 hover:border-red-300':
                contact.group_name === 'Marika Singers, z.s.',
              'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300':
                contact.group_name === 'VOICES',
              'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300':
                contact.group_name === 'FIVE',
            }"
            class="group p-8 h-full flex flex-col rounded-2xl shadow-sm transition-all duration-500 hover:shadow-lg border backdrop-blur-sm relative overflow-hidden"
          >
            <!-- Decorative corner -->
            <div
              class="absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8"
            >
              <div
                :class="{
                  'bg-red-100': contact.group_name === 'Marika Singers, z.s.',
                  'bg-gray-100': contact.group_name !== 'Marika Singers, z.s.',
                }"
                class="w-full h-full rotate-45 transform origin-bottom-left"
              ></div>
            </div>

            <h3 class="text-2xl font-bold mb-6 text-gray-900 relative">
              {{ contact.group_name }}
              <div
                class="h-1 w-12 bg-red-800 rounded-full mt-3 transition-all duration-300 group-hover:w-24"
              ></div>
            </h3>

            <div
              v-if="contact.address"
              class="whitespace-pre-line flex-grow text-gray-600 mb-6 group-hover:text-gray-900 transition-colors duration-300"
            >
              <div class="flex items-start">
                <svg
                  class="w-5 h-5 text-red-800 mr-3 mt-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{{ contact.address }}</span>
              </div>
            </div>

            <div class="mt-auto space-y-5">
              <div v-if="contact.ico || contact.dic" class="text-gray-600">
                <div
                  class="flex items-center group-hover:text-gray-900 transition-colors duration-300"
                >
                  <svg
                    class="w-5 h-5 text-red-800 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>
                    <template v-if="contact.ico && contact.dic">
                      IČO: {{ contact.ico }} / DIČ: {{ contact.dic }}
                    </template>
                    <template v-else-if="contact.ico">
                      IČO: {{ contact.ico }}
                    </template>
                  </span>
                </div>
              </div>

              <div v-if="contact.email">
                <a
                  :href="`mailto:${contact.email}`"
                  class="flex items-center text-gray-600 hover:text-red-800 transition-colors duration-300 group"
                >
                  <svg
                    class="w-5 h-5 text-red-800 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {{ contact.email }}
                </a>
              </div>

              <div
                v-if="getBankAccount(contact.group_name)"
                class="text-gray-600 group-hover:text-gray-900 transition-colors duration-300"
              >
                <div class="flex items-center">
                  <svg
                    class="w-5 h-5 text-red-800 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>
                    Bankovní účet:
                    {{ formatBankAccount(getBankAccount(contact.group_name)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FadeUpOnScroll>
      </div>
    </div>

    <div class="relative">
      <div class="absolute inset-0 bg-black"></div>
      <div class="container mx-auto px-4 py-8 relative">
        <div class="flex flex-col items-center justify-center gap-2 text-center text-gray-300 text-sm md:flex-row md:gap-3">
          <p>
            © {{ new Date().getFullYear() }} Marika Singers, z.s. | Všechna práva vyhrazena
          </p>
          <NuxtLink
            to="/zasady-ochrany-soukromi"
            class="text-rose-200 underline decoration-rose-400/40 transition hover:decoration-rose-200 hover:text-white"
          >
            Zásady ochrany soukromí
          </NuxtLink>
        </div>
        <div class="flex items-center justify-center gap-2 text-center text-gray-300 text-xs mt-2">
          Verze aplikace Marikasingers
          <NuxtLink
            to="/changelog"
            class="text-rose-200 underline decoration-rose-400/40 transition hover:decoration-rose-200 hover:text-white"
          >
            <span v-if="currentVersion" class="ml-1 font-medium">{{ currentVersion }}</span>
          </NuxtLink>
        </div>
        <div class="flex items-center justify-center gap-2 text-gray-400 text-xs my-5">
          <span>Made by</span>
          <a
            href="https://mikecode.cz/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-rose-200 hover:text-white transition-colors duration-200 group"
          >
            <img
              src="/mikecode/icon-ios.svg"
              alt="MikeCode"
              class="h-8 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-200"
              loading="lazy"
              onerror="this.style.display='none'"
            />
            <span class="font-medium">MikeCode</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from "#imports";
import { useContacts } from "~/composables/useContacts";
import { useSettings } from "~/composables/useSettings";
import { useChangelog } from "~/composables/useChangelog";
import FadeUpOnScroll from "~/components/FadeUpOnScroll.vue";

const { contacts, loading, error, fetchContacts } = useContacts();
const { settings, loading: settingsLoading, fetchSettings } = useSettings();
const { getChangelog } = useChangelog();
const currentVersion = ref(null);

const getBankAccount = (groupName) => {
  const normalizedName = groupName.replace(", z.s.", "").toLowerCase();
  if (normalizedName === "marika singers") {
    return settings.value.marikaSingers;
  } else if (normalizedName === "five") {
    return settings.value.five;
  } else if (normalizedName === "voices") {
    return settings.value.voices;
  }
  return null;
};

const formatBankAccount = (account) => {
  if (!account || !account.accountNumber) return "Není nastaveno";
  const prefix = account.accountPrefix ? `${account.accountPrefix}-` : "";
  return `${prefix}${account.accountNumber}/${account.bankCode}`;
};

onMounted(async () => {
  await Promise.all([fetchContacts(), fetchSettings()]);

  // Načtení aktuální verze z main branchu
  try {
    const mainEntries = await getChangelog('main');
    if (mainEntries && mainEntries.length > 0) {
      // Najdeme nejnovější verzi z main branchu
      const latest = mainEntries[0];
      currentVersion.value = latest.version || null;
    }
  } catch (err) {
    console.error('Error fetching current version:', err);
  }
});
</script>